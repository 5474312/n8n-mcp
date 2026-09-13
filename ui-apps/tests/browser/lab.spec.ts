import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const result = (page: import('@playwright/test').Page) => page.frameLocator('iframe[title="MCP result card"]');
test('a recoverable SDK diagnostic does not hide the subsequent tool result', async ({ page }) => {
  await page.goto('/lab.html');
  await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption('recoverable-host-error');
  await expect(result(page).getByText('A host communication problem occurred. Still waiting for the tool result.')).toBeVisible();
  await expect(result(page).getByRole('status').first()).toHaveText('Workflow created');
  await expect(result(page).getByText(/host communication problem/)).toHaveCount(0);
});
test('response identity works without optional host toolInfo across operation shapes', async ({ page }) => {
  await page.goto('/lab.html');
  for (const [scenario, title] of [
    ['created', 'Workflow created'], ['full-update', 'Workflow updated'],
    ['updated', 'Workflow updated'], ['deleted', 'Workflow deleted'],
    ['preview', '2 fixes proposed'], ['triggered', 'Workflow triggered'],
    ['template-setup', 'Template saved · setup needs review'],
  ]) {
    await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption(`${scenario}-no-tool-info`);
    await expect(result(page).getByRole('status')).toHaveText(title);
  }
  await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption('invalid-no-tool-info');
  await expect(result(page).getByRole('status')).toHaveText('3 validation errors found');
  await result(page).getByText('Result context', { exact: true }).click();
  await expect(result(page).getByText('Saved workflow', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption('protocol-error-no-tool-info');
  await expect(result(page).getByRole('status')).toHaveText('Result unavailable');
  await result(page).getByText('Result context', { exact: true }).click();
  await expect(result(page).getByText('validate_workflow', { exact: true })).toBeVisible();
});
test('agent loop advances without a human repair handoff', async ({ page }) => {
  await page.goto('/lab.html');
  await expect(result(page).getByRole('status')).toHaveText('3 validation errors found');
  await page.getByRole('button', { name: 'Replay agent sequence' }).click();
  await expect(result(page).getByRole('status')).toHaveText('Workflow created');
  await expect(result(page).getByRole('status')).toHaveText('2 fixes proposed', { timeout: 10000 });
  await expect(result(page).getByRole('status')).toHaveText('Execution succeeded', { timeout: 18000 });
  await expect(result(page).getByRole('button', { name: /copy request|repair request/i })).toHaveCount(0);
});
test('real bridge handles cancellation, failure and malformed results', async ({ page }) => {
  await page.goto('/lab.html');
  for (const [scenario, title] of [['late', 'Tool call cancelled'], ['protocol-error', 'Result unavailable'], ['malformed', 'Result unavailable'], ['api-error', 'Validation unavailable']]) {
    await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption(scenario);
    await expect(result(page).getByRole('status')).toHaveText(title);
  }
});
test('readable narrow cards, keyboard disclosure, host theme and accessibility', async ({ page }) => {
  await page.goto('/lab.html');
  await page.getByLabel('Embed width').selectOption('320');
  await expect(result(page).getByRole('status')).toHaveText('3 validation errors found');
  await result(page).getByText('Validation details', { exact: false }).focus();
  await page.keyboard.press('Enter');
  await expect(result(page).getByRole('button', { name: 'Warnings · 2' })).toBeVisible();
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    const root = result(page).locator('html');
    await expect(root).toHaveCSS('color-scheme', colorScheme);
    const sizes = await result(page).locator('body').evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations).toEqual([]);
  }
});
test('loads the resource and validation result from the actual local MCP server', async ({ page }) => {
  await page.goto('/lab.html');
  await page.getByRole('button', { name: 'Load protocol snapshot' }).click();
  await expect(page.getByRole('status').first()).toContainText('Built HTML read from local MCP');
  await expect(result(page).getByRole('heading', { level: 1 })).toHaveText('Offline protocol smoke');
  await expect(result(page).getByRole('status')).toHaveText(/validation errors?|Validation did not pass/);
  await page.getByRole('button', { name: 'Load operation bundle' }).click();
  await expect(page.getByRole('status').first()).toContainText('synthetic result');
  await expect(result(page).getByRole('heading', { level: 1 })).toHaveText('Synthetic saved workflow');
  await expect(result(page).getByRole('status')).toHaveText('Workflow created');
});

test('restored views preserve action semantics in narrow light and dark cards', async ({ page }) => {
  await page.goto('/lab.html');
  await page.getByLabel('Embed width').selectOption('320');
  for (const [scenario, title] of [
    ['workflow-empty','No matching workflows'], ['workflow-error','Request could not complete'],
    ['workflow-page','6 workflows returned'], ['execution-page','6 executions returned'],
    ['execution-detail','Failed'], ['execution-deleted','Execution deleted'],
    ['health-unconfigured','n8n API not configured'], ['health-connected','Connection verified'],
    ['template-setup','Template saved · setup needs review'],
  ]) {
    await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption(scenario);
    await expect(result(page).getByRole('status').first()).toHaveText(title);
    for (const colorScheme of ['light','dark'] as const) {
      await page.emulateMedia({colorScheme});
      await expect(result(page).locator('html')).toHaveCSS('color-scheme',colorScheme);
      const sizes=await result(page).locator('body').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
      expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
      const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(audit.violations).toEqual([]);
    }
  }
});
test('extra returned rows and connection evidence are inspectable without fetching new data',async ({page})=>{
  await page.goto('/lab.html');
  await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption('workflow-page');
  await expect(result(page).getByRole('status')).toHaveText('6 workflows returned');
  await result(page).getByText('Show 1 more in this page').focus(); await page.keyboard.press('Enter');
  await expect(result(page).getByRole('heading',{name:/A very long workflow name/})).toBeVisible();
  await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption('health-connected');
  await result(page).getByText('Connection details',{exact:true}).click();
  await expect(result(page).getByText('80.00%',{exact:true})).toBeVisible();
  await expect(result(page).getByText(/Not live/)).toBeVisible();
});
