# MCP UI verification — 2026-09-12

Scope: compact operation and validation cards, shared result lifecycle, local SDK host, production-resource smoke, UI dependencies and CI checks. Base commit: `7b9b1c76`; implementation branch: `codex/mcp-ui-agent-supervision`.

The agent remains responsible for building and fixing workflows. Cards expose outcomes and optional inspection details without asking the user to copy repair requests. Public tool response schemas are unchanged. The initial phase preserved dormant registrations; the extension below restores them on the feature branch.

## Results

| Gate | Result |
|---|---|
| Root TypeScript and server build | Passed |
| UI TypeScript and all five production builds | Passed |
| UI component and contract tests | 37 passed |
| Critical result adapters and reducer coverage | 100% lines, statements and functions; 93.85% branches |
| Chromium browser journeys | 4 passed, no retries |
| Accessibility and layout | Automated WCAG A/AA checks, keyboard disclosure, 320px embeds, light/dark host changes passed |
| Real stdio MCP | Tool metadata, both enabled built resources and offline validation passed |
| Production bundles in local SDK host | Both rendered and asserted in Chromium; operation payload explicitly synthetic |
| Repository unit suite | 6,475 passed, 35 skipped; 84.98% lines/statements, 86.60% branches, 85.14% functions |
| Offline integration suite | 501 passed, 16 skipped |
| UI dependency audit | Zero reported vulnerabilities after scoped dependency updates |
| Changed-file secretlint and whitespace checks | Passed |
| Independent review | Four findings fixed; focused follow-up found no remaining consequential issues |

The implementation review used two Terra workers for operation contracts and the local host/testing path, and one Sol worker for correctness/security review and a focused follow-up. The parent integrated changes and ran verification. Fable informed the earlier design consultation; the subsequent agent-led supervision correction came from the user.

## Failures and limits retained

- The initial combined offline coverage run reported 7,036 passing tests, 51 skipped and two failures in the unchanged database performance suite: bulk-insert ratio 26.877 versus a limit of 20, and average query time 62.26ms versus 50ms. Those failures were not hidden with retries or changed thresholds. The repository's intended unit-coverage and single-threaded integration configurations were then run separately; both passed, including the performance tests without coverage instrumentation.
- Early attempts exposed a native SQLite ABI mismatch and sandbox restrictions on local test sockets. Successful repository checks used the installation-compatible Node 22 runtime and permitted local sockets, with live n8n settings empty.
- Live n8n and AI-validation integration directories, Docker suites, and `command-injection-prevention.test.ts` were excluded from the offline integration run. The latter can update the external documentation checkout. No live n8n instance was used.
- `npm run test:e2e` could not run: this checkout contains no tests in its configured `tests/e2e` directory. The new UI browser suite ran separately and passed.
- Real Claude.ai/Desktop and the native ChatGPT desktop application remain unverified. ChatGPT web validation-card results are recorded below. Extended registration and its host acceptance are covered below.
- 200% browser zoom remains a manual acceptance item; the in-app browser did not expose an observable zoom change through the attempted keyboard shortcut. Narrow-layout and keyboard checks passed separately.
- CI steps were added and their commands exercised locally; no remote CI run, push, release or deployment was performed.

Tests changed the bundled database during initialization. Its original tracked contents were restored after the suites completed; no generated database or UI bundle is included in the patch.

## Try it locally

See [the development guide](mcp-ui-development.md) for reproducible commands and the manual acceptance sequence. Start with `npm run ui:dev`, then open `http://127.0.0.1:5173/lab.html`. The lab requires no credentials. Use **Replay agent sequence**, **Load protocol snapshot**, and **Load operation bundle** to inspect the respective paths.

## ChatGPT web host check — 2026-09-13

The local build was connected through an official OpenAI Secure MCP Tunnel and a development plugin. The isolated server exposed seven offline documentation/validation tools with no live n8n configuration. Tunnel liveness and readiness both returned HTTP 200, and ChatGPT discovered the tools and validation template.

- A synthetic workflow containing only a Manual Trigger produced a rendered validation card with one error and zero warnings. Validation details, suggestions, and result context expanded successfully; keyboard activation was also checked.
- The agent then added a connected No Operation node to the in-memory definition and validated it. The next card showed no validation errors and explicitly stated that execution had not been verified. The prior error card retained its original result.
- No workflow was saved, deployed, or executed. This verifies the validation card in ChatGPT web through the built-in browser, not the native desktop application or live operation-result cards.
- ChatGPT displayed its development-mode `CSP off` badge. Widget CSP and a unique widget domain remain submission-readiness work; this test does not establish production submission readiness.
- The minor `1 errors` copy issue was corrected in the extension below. Browser automation encountered fractional iframe coordinate errors; semantic keyboard interaction succeeded, so these were not treated as application failures.


## Restored views — 2026-09-13

Restored workflow lists, execution list/get/delete results, status/diagnostic connection results, and template-deployment receipts on the feature branch. The views use the shared lifecycle boundary, visible snapshot times, bounded initial rows with optional expansion, truthful page scope and strict response adapters. Template receipts distinguish persistence from credential setup, failed autofix and execution. Connection evidence does not infer connectivity from a generic success envelope or expose raw diagnostic environment data.

Verification completed for this extension:

- Root and UI TypeScript, server build and all five UI builds passed. Each built HTML resource is approximately 547–550 kB, below the 750 kB smoke budget.
- 61 UI tests passed; adapter/reducer coverage is 100% lines, statements and functions, 96.43% branches. Tests include mismatched execution action/payload pairs, diagnostic/status mismatches, unknown statuses, invalid dates, endpoint sanitization and post-save template setup failures.
- 54 registry/configuration tests passed. Before PR publication, the complete unit coverage suite was rerun on the final code: 6,475 passed, 35 skipped across 193 files; 84.99% lines/statements, 86.60% branches and 85.14% functions. Real offline stdio smoke returned all five exact built resources and validated a synthetic workflow.
- A separate fixture MCP server passed 15 scenarios across four synthetic tools, exact resource comparisons and mismatched-argument rejection. It performs no live n8n operations.
- Six Chromium journeys passed, including all restored views at 320px, both host themes, accessibility, keyboard expansion and pagination scope. The first attempt at the two new journeys failed because the test selected the implicit label instead of the combobox accessible name; correcting the selector resolved the failures. No retries or relaxed timeouts were added.
- Two Terra reading workers reviewed contracts and legacy UX; one also reviewed the implementation. Follow-up findings led to an in-card synthetic notice and an explicit build-before-fixture command. Fable was consulted once successfully and supported the controlled branch/test approach with visible snapshot context and action-specific rendering; those recommendations were applied.

Pending: extended fixture rendering in ChatGPT after the test MCP connection is restarted and refreshed. Native ChatGPT desktop and Claude rendering remain unverified. The historical Claude collapse cause has not been established; synthetic ChatGPT success must not be described as a Claude fix. No release or live workflow deployment was performed.


## Screenshots

These screenshots show built resources rendered in the local SDK lab with synthetic data. They are UI references, not evidence of native desktop-host compatibility.

| Validation error | Validation passed |
|---|---|
| ![Validation errors](images/mcp-ui/invalid.png) | ![Validation passed](images/mcp-ui/valid.png) |

| Workflow page | Template setup |
|---|---|
| ![Workflow list](images/mcp-ui/workflow-page.png) | ![Template setup receipt](images/mcp-ui/template-setup.png) |

| Execution detail | Connection diagnostic |
|---|---|
| ![Execution failure](images/mcp-ui/execution-detail.png) | ![Unconfigured connection](images/mcp-ui/health-unconfigured.png) |
