import React from 'react';
import type { ResultPhase } from '../result-state';
import type { Tone } from '../operation-model';

export function ResultCard({ kind, title, subject, summary, tone = 'neutral', synthetic = false, children }: {
  kind: string; title: string; subject?: string; summary?: string; tone?: Tone; synthetic?: boolean; children?: React.ReactNode;
}) {
  return <section className="result-card" aria-label={kind}>
    <div className="result-context"><strong>n8n-mcp</strong><span>{kind}</span></div>
    <div className="result-body">
      {synthetic && <p className="result-note" role="note">Synthetic UI test · No live n8n operation</p>}
      <div className={`result-status tone-${tone}`} role="status">{title}</div>
      {subject && <h1>{subject}</h1>}
      {summary && <p className="result-summary">{summary}</p>}
      {children}
    </div>
  </section>;
}

export function ResultContext({ id, receivedAt, scope, profile, toolName, executionId }: {
  id?: string; receivedAt?: string | null; scope?: string; profile?: string; toolName?: string | null; executionId?: string;
}) {
  return <details className="result-details"><summary>Result context</summary><dl className="result-facts">
    {scope && <><dt>Scope</dt><dd>{scope}</dd></>}
    {profile && <><dt>Profile</dt><dd>{profile}</dd></>}
    {id && <><dt>Workflow ID</dt><dd><code>{id}</code></dd></>}
    {executionId && <><dt>Execution ID</dt><dd><code>{executionId}</code></dd></>}
    {toolName && <><dt>Tool</dt><dd><code>{toolName}</code></dd></>}
    {receivedAt && <><dt>Received</dt><dd><time dateTime={receivedAt}>{new Date(receivedAt).toLocaleString()}</time></dd></>}
  </dl><p className="result-note">Snapshot of this tool call.</p></details>;
}

export function ResultBoundary({ kind, state, children }: {
  kind: string;
  state: { phase: ResultPhase; error: string | null; hostWarning?: string | null; toolName?: string | null; receivedAt?: string | null; isConnected: boolean; standalone: boolean; data?: Record<string, unknown> | null };
  children: React.ReactNode;
}) {
  if (state.standalone) return <ResultCard kind={kind} title="Open in an MCP Apps host" summary="This view receives results from the agent’s tool calls. For local testing, start the UI lab with npm run ui:dev." />;
  if (state.phase === 'ready') return <>{children}</>;
  if (state.phase === 'cancelled') return <ResultCard kind={kind} title="Tool call cancelled" summary={state.error ?? 'No outcome was confirmed for this call.'} />;
  if (state.error) return <ResultCard kind={kind} title="Result unavailable" summary={state.error} tone="error">
    {(state.toolName || state.receivedAt) && <ResultContext toolName={state.toolName} receivedAt={state.receivedAt} />}
  </ResultCard>;
  if (!state.isConnected) return <ResultCard kind={kind} title="Connecting to host" summary="Establishing the result view." />;
  return <ResultCard kind={kind} title={state.phase === 'pending' ? 'Tool call in progress' : 'Waiting for a tool result'} summary="No outcome has been returned yet.">
    {state.hostWarning && <p className="result-note" role="status">A host communication problem occurred. Still waiting for the tool result.</p>}
  </ResultCard>;
}
