import { afterEach, describe, expect, it, vi } from 'vitest';
import { N8NDocumentationMCPServer } from '../../../../src/mcp/server';
import { UIAppRegistry } from '../../../../src/mcp/ui/registry';
import { UI_APP_CONFIGS } from '../../../../src/mcp/ui/app-configs';

vi.mock('../../../../src/database/database-adapter');
vi.mock('../../../../src/database/node-repository');
vi.mock('../../../../src/templates/template-service');
vi.mock('../../../../src/utils/logger');

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe('UI result identity on the MCP response', () => {
  it.each(UI_APP_CONFIGS.flatMap(config => config.toolPatterns.map(name => ({ config, name }))))('identifies $name without modifying the public payload', async ({ config, name }) => {
    vi.stubEnv('NODE_DB_PATH', ':memory:');
    const server = new N8NDocumentationMCPServer();
    const raw = { success: true, data: { id: 'synthetic' } };
    vi.spyOn(server as any, 'executeTool').mockResolvedValue(raw);
    vi.spyOn(UIAppRegistry, 'getAppForTool').mockReturnValue({ config, html: '<html></html>' });
    const handler = (server as any).server._requestHandlers.get('tools/call');
    const response = await handler({ method: 'tools/call', params: { name, arguments: {} } }, {});
    expect(response.isError).not.toBe(true);
    expect(response._meta).toEqual({ 'n8n-mcp/toolName': name });
    expect(response.content[0].text).not.toContain('n8n-mcp/toolName');
    expect(response.structuredContent ?? {}).not.toHaveProperty('n8n-mcp/toolName');
  });

  it('leaves responses alone when no built UI is registered', async () => {
    vi.stubEnv('NODE_DB_PATH', ':memory:');
    const server = new N8NDocumentationMCPServer();
    vi.spyOn(server as any, 'executeTool').mockResolvedValue({ nodes: [] });
    vi.spyOn(UIAppRegistry, 'getAppForTool').mockReturnValue(null);
    const handler = (server as any).server._requestHandlers.get('tools/call');
    const response = await handler({ method: 'tools/call', params: { name: 'search_nodes', arguments: {} } }, {});
    expect(response._meta).toBeUndefined();
  });
});
