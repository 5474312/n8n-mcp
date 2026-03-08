window.BENCHMARK_DATA = {
  "lastUpdate": 1772930980398,
  "repoUrl": "https://github.com/5474312/n8n-mcp",
  "entries": {
    "n8n-mcp Benchmarks": [
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c8c76e435d80953cdbde3fc8b86675285c555b30",
          "message": "fix: critical memory leak from per-session database connections (#554)\n\n* fix: critical memory leak from per-session database connections (#542)\n\nEach MCP session was creating its own database connection (~900MB),\ncausing OOM kills every ~20 minutes with 3-4 concurrent sessions.\n\nChanges:\n- Add SharedDatabase singleton pattern - all sessions share ONE connection\n- Reduce session timeout from 30 min to 5 min (configurable)\n- Add eager cleanup for reconnecting instances\n- Fix telemetry event listener leak\n\nMemory impact: ~900MB/session → ~68MB shared + ~5MB/session overhead\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>\nConceived by Romuald Czlonkowski - https://www.aiadvisors.pl/en\n\n* fix: resolve test failures from shared database race conditions\n\n- Fix `shutdown()` to respect shared database pattern (was directly closing)\n- Add `await this.initialized` in both `close()` and `shutdown()` to prevent\n  race condition where cleanup runs while initialization is in progress\n- Add double-shutdown protection with `isShutdown` flag\n- Export `SharedDatabaseState` type for proper typing\n- Include error details in debug logs\n- Add MCP server close to `shutdown()` for consistency with `close()`\n- Null out `earlyLogger` in `shutdown()` for consistency\n\nThe CI test failure \"The database connection is not open\" was caused by:\n1. `shutdown()` directly calling `this.db.close()` which closed the SHARED\n   database connection, breaking subsequent tests\n2. Race condition where `shutdown()` ran before initialization completed\n\nConceived by Romuald Członkowski - www.aiadvisors.pl/en\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>\n\n* test: add unit tests for shared-database module\n\nAdd comprehensive unit tests covering:\n- getSharedDatabase: initialization, reuse, different path error, concurrent requests\n- releaseSharedDatabase: refCount decrement, double-release guard\n- closeSharedDatabase: state clearing, error handling, re-initialization\n- Helper functions: isSharedDatabaseInitialized, getSharedDatabaseRefCount\n\n21 tests covering the singleton database connection pattern used to prevent\n~900MB memory leaks per session.\n\nConceived by Romuald Członkowski - www.aiadvisors.pl/en\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.5 <noreply@anthropic.com>",
          "timestamp": "2026-01-23T19:51:22+01:00",
          "tree_id": "3a906ff4048963c970a61034513573e40decb4d9",
          "url": "https://github.com/5474312/n8n-mcp/commit/c8c76e435d80953cdbde3fc8b86675285c555b30"
        },
        "date": 1769496471107,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "68148804105efa21b592242a9e5f61f52c55c778",
          "message": "chore: update n8n to 2.6.3 and bump version to 2.33.6 (#571)",
          "timestamp": "2026-02-06T09:09:37+01:00",
          "tree_id": "7cc6335dd85928c7b9ef7c72680ceec376426d28",
          "url": "https://github.com/5474312/n8n-mcp/commit/68148804105efa21b592242a9e5f61f52c55c778"
        },
        "date": 1770382088315,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1b328d8168608905ae0f4efd654d79c22d718507",
          "message": "fix: include UI apps build in CI release pipeline (#575)\n\nThe release workflow only ran `npm run build` (TypeScript), skipping the\nUI apps build. This meant ui-apps/dist/ was missing from npm packages.\n\n- Change `npm run build` to `npm run build:all` in build-and-verify and\n  publish-npm jobs\n- Copy ui-apps/dist into the npm publish directory\n- Add ui-apps/dist/**/* to the published package files list\n- Bump version to 2.34.2\n\nConceived by Romuald Czlonkowski - https://www.aiadvisors.pl/en\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-07T05:40:21+01:00",
          "tree_id": "21fc795a449cd4d5009f754d13215147c5067c6b",
          "url": "https://github.com/5474312/n8n-mcp/commit/1b328d8168608905ae0f4efd654d79c22d718507"
        },
        "date": 1770446866345,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a57b400bd044f92fae20fd35e8b774efcbdac816",
          "message": "fix: use official ext-apps useApp hook to fix blank MCP App rendering (#578)\n\nThe custom useToolData hook had lifecycle issues that prevented the UI\nfrom rendering in Claude Desktop/web: no appInfo in App constructor,\nunhandled connect() Promise, app.close() on unmount conflicting with\nReact Strict Mode. Switched to the official useApp hook from\n@modelcontextprotocol/ext-apps/react which handles initialization\nhandshake, handler registration, and cleanup correctly.\n\nConceived by Romuald Członkowski - https://www.aiadvisors.pl/en\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-07T16:25:27+01:00",
          "tree_id": "056266d95005da1b26044426a3f33387b9906206",
          "url": "https://github.com/5474312/n8n-mcp/commit/a57b400bd044f92fae20fd35e8b774efcbdac816"
        },
        "date": 1770490077271,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c6015817146aa62981e129227bf9e72e40e27b1a",
          "message": "Fix/mcp app blank UI (#580)\n\n* fix: use official ext-apps useApp hook to fix blank MCP App rendering\n\nThe custom useToolData hook had lifecycle issues that prevented the UI\nfrom rendering in Claude Desktop/web: no appInfo in App constructor,\nunhandled connect() Promise, app.close() on unmount conflicting with\nReact Strict Mode. Switched to the official useApp hook from\n@modelcontextprotocol/ext-apps/react which handles initialization\nhandshake, handler registration, and cleanup correctly.\n\nConceived by Romuald Członkowski - https://www.aiadvisors.pl/en\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>\n\n* fix: align MCP App UI types with actual server response format\n\n- useToolData hook now uses official useApp from ext-apps/react\n- OperationResultData uses success:boolean + data.id/name (matching\n  McpToolResponse from handlers-n8n-manager.ts)\n- ValidationSummaryData handles both direct results (validate_node,\n  validate_workflow) and wrapped results (n8n_validate_workflow)\n- Added visible error/connection states for debugging\n\nConceived by Romuald Członkowski - https://www.aiadvisors.pl/en\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>\n\n* chore: bump version to 2.34.5 for npm publish\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-08T03:23:16+01:00",
          "tree_id": "950b563396eb2b1935e379dbd5b19b234d73f76a",
          "url": "https://github.com/5474312/n8n-mcp/commit/c6015817146aa62981e129227bf9e72e40e27b1a"
        },
        "date": 1770519008980,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "89146186d8c5d480e284eefbade2c564e80374db",
          "message": "feat: UI/UX redesign for MCP Apps - 3 new apps + enhanced existing (#583)\n\nAdd workflow-list, execution-history, and health-dashboard apps.\nRedesign operation-result with operation-aware headers, detail panels,\nand copy-to-clipboard. Fix React hooks violations in validation-summary\nand execution-history (useMemo after early returns). Add local preview\nharness for development. Update tests for 5-app config.\n\nConceived by Romuald Członkowski - www.aiadvisors.pl/en\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-09T03:36:27+01:00",
          "tree_id": "0f7ed6841ebdb0b393b21bec41ab30973d65406a",
          "url": "https://github.com/5474312/n8n-mcp/commit/89146186d8c5d480e284eefbade2c564e80374db"
        },
        "date": 1770606967757,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "34159f4ece6f345ead8f2c551fa391f621073f99",
          "message": "fix: add legacy flat _meta key for MCP App rendering in Claude (#585)\n\nClaude.ai reads the flat `_meta[\"ui/resourceUri\"]` key to discover UI apps,\nnot the nested `_meta.ui.resourceUri`. Without the flat key, tools like\nn8n_health_check and n8n_list_workflows showed as collapsed accordions\ninstead of rendering rich UI. Now sets both keys, matching the behavior\nof the official registerAppTool helper from @modelcontextprotocol/ext-apps.\n\nConceived by Romuald Członkowski - www.aiadvisors.pl/en\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-09T06:40:52+01:00",
          "tree_id": "5239293aeb3293cd3619ee62a2c6cae42facd4d2",
          "url": "https://github.com/5474312/n8n-mcp/commit/34159f4ece6f345ead8f2c551fa391f621073f99"
        },
        "date": 1770624714814,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6f695be48205831f4dcccf73c3d60cced196b77c",
          "message": "fix: disable MCP Apps that don't render in Claude.ai (#586)\n\nDisable 3 MCP Apps (workflow-list, execution-history, health-dashboard)\nthat show as collapsed accordions and remove n8n_deploy_template tool\nmapping that renders blank content. The server sets _meta correctly on\nthe wire but the Claude.ai host ignores it for these tools. Keep the 2\nworking apps (operation-result, validation-summary) active.\n\nConceived by Romuald Czlonkowski - https://www.aiadvisors.pl/en\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-10T02:26:40+01:00",
          "tree_id": "e0e55dded1fe24727a3288b6d22bbe9f66c21a20",
          "url": "https://github.com/5474312/n8n-mcp/commit/6f695be48205831f4dcccf73c3d60cced196b77c"
        },
        "date": 1770687506905,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "77048347b3a82421ffa0b8b6bd44f8f50dd8cf52",
          "message": "chore: update n8n to 2.8.3 (#603)\n\n* chore: update n8n to 2.8.3 and bump version to 2.35.3\n\n- Updated n8n from 2.6.3 to 2.8.3\n- Updated n8n-core from 2.6.1 to 2.8.1\n- Updated n8n-workflow from 2.6.0 to 2.8.0\n- Updated @n8n/n8n-nodes-langchain from 2.6.2 to 2.8.1\n- Fixed node loader to bypass restricted package.json exports in\n  @n8n/n8n-nodes-langchain >=2.9.0 (resolves via absolute paths)\n- Fixed community doc generator for cloud LLMs: added API key env var\n  support, switched to max_completion_tokens, auto-omit temperature\n- Rebuilt node database with 1,236 nodes (673 n8n-nodes-base,\n  133 @n8n/n8n-nodes-langchain, 430 community)\n- Refreshed community nodes (361 verified + 69 npm) with 424 AI summaries\n- Updated README badge with new n8n version and node counts\n- Updated CHANGELOG with dependency changes\n\nConceived by Romuald Członkowski - https://www.aiadvisors.pl/en\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>\n\n* fix: update documentation-generator tests for max_completion_tokens\n\n- Updated test assertions from max_tokens to max_completion_tokens\n- Updated testConnection token limit expectation from 10 to 200\n- Added temperature to test config to match new configurable behavior\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-20T02:15:15+01:00",
          "tree_id": "3fd6bf33adf702cee779dffe9196bb2155947f22",
          "url": "https://github.com/5474312/n8n-mcp/commit/77048347b3a82421ffa0b8b6bd44f8f50dd8cf52"
        },
        "date": 1771570140371,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4bad880f44fc26176083b1417681e45411cdeade",
          "message": "fix: defensive JSON.parse for stringified object/array params (#605) (#606)\n\n* chore: update n8n to 2.8.3 and bump version to 2.35.3\n\n- Updated n8n from 2.6.3 to 2.8.3\n- Updated n8n-core from 2.6.1 to 2.8.1\n- Updated n8n-workflow from 2.6.0 to 2.8.0\n- Updated @n8n/n8n-nodes-langchain from 2.6.2 to 2.8.1\n- Fixed node loader to bypass restricted package.json exports in\n  @n8n/n8n-nodes-langchain >=2.9.0 (resolves via absolute paths)\n- Fixed community doc generator for cloud LLMs: added API key env var\n  support, switched to max_completion_tokens, auto-omit temperature\n- Rebuilt node database with 1,236 nodes (673 n8n-nodes-base,\n  133 @n8n/n8n-nodes-langchain, 430 community)\n- Refreshed community nodes (361 verified + 69 npm) with 424 AI summaries\n- Updated README badge with new n8n version and node counts\n- Updated CHANGELOG with dependency changes\n\nConceived by Romuald Członkowski - https://www.aiadvisors.pl/en\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>\n\n* fix: update documentation-generator tests for max_completion_tokens\n\n- Updated test assertions from max_tokens to max_completion_tokens\n- Updated testConnection token limit expectation from 10 to 200\n- Added temperature to test config to match new configurable behavior\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>\n\n* fix: defensive JSON.parse for stringified object/array params (#605)\n\nClaude Desktop 1.1.3189 serializes object/array MCP parameters as JSON\nstrings, causing ZodError failures for ~60% of tools. Add schema-driven\ncoercion in the central CallToolRequestSchema handler to detect and parse\nthem back automatically.\n\nConceived by Romuald Czlonkowski - https://www.aiadvisors.pl/en\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-20T16:56:25+01:00",
          "tree_id": "b382766ebaefb6c237f0966b5581ee6016e49f57",
          "url": "https://github.com/5474312/n8n-mcp/commit/4bad880f44fc26176083b1417681e45411cdeade"
        },
        "date": 1771613324767,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "87f26eef1847852b0f8907b11014001ef4074fd9",
          "message": "fix: comprehensive param type coercion for Claude Desktop/Claude.ai (#605) (#609)\n\nExpand coerceStringifiedJsonParams() to handle ALL type mismatches,\nnot just stringified objects/arrays. Testing showed 6/9 tools still\nfailing in Claude Desktop after v2.35.4.\n\n- Coerce string→number, string→boolean, number→string, boolean→string\n- Add safeguard for entire args object arriving as JSON string\n- Add [Diagnostic] section to error responses with received arg types\n- Bump to v2.35.5\n- 24 unit tests (9 new)\n\nConceived by Romuald Czlonkowski - https://www.aiadvisors.pl/en\n\nCo-authored-by: Claude Opus 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-02-22T07:07:30+01:00",
          "tree_id": "a2b3f1b9d290f4a5565bc9bc3b5dfaace4551cfd",
          "url": "https://github.com/5474312/n8n-mcp/commit/87f26eef1847852b0f8907b11014001ef4074fd9"
        },
        "date": 1771742932805,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0998e5486e47cc5a804e0c3e56a974248ffa426b",
          "message": "chore: update n8n to 2.10.3 (#618)\n\n* chore: update n8n to 2.10.3 and bump version to 2.35.6\n\n- Updated n8n from 2.8.3 to 2.10.3\n- Updated n8n-core from 2.8.1 to 2.10.1\n- Updated n8n-workflow from 2.8.0 to 2.10.1\n- Updated @n8n/n8n-nodes-langchain from 2.8.1 to 2.10.1\n- Rebuilt node database with 806 core nodes (community nodes preserved from previous build)\n- Updated README badge with new n8n version\n- Updated CHANGELOG with dependency changes\n\nConceived by Romuald Członkowski - https://www.aiadvisors.pl/en\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n\n* fix: override isolated-vm with empty stub to fix CI build\n\nisolated-vm 6.0.2 (transitive dep from n8n-nodes-base) fails to compile\nnatively on CI (Node 20 + Linux) due to V8 API changes. This package is\nnot used at runtime by n8n-mcp - we only read node metadata, not execute\nnodes. Override with empty-npm-package to avoid the native compilation.\n\nConceived by Romuald Członkowski - https://www.aiadvisors.pl/en\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n\n* fix: skip native compilation in fresh install CI check\n\nThe fresh install test simulates `npm install n8n-mcp` from scratch,\nso package.json overrides don't apply. Use --ignore-scripts to skip\nisolated-vm native compilation since n8n-mcp only reads node metadata\nand doesn't execute n8n nodes at runtime.\n\nConceived by Romuald Członkowski - https://www.aiadvisors.pl/en\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-03-04T15:47:10+01:00",
          "tree_id": "52ea4be51ce2309c852291f51c4dec9f4f6b2c9f",
          "url": "https://github.com/5474312/n8n-mcp/commit/0998e5486e47cc5a804e0c3e56a974248ffa426b"
        },
        "date": 1772650162084,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "56956555+czlonkowski@users.noreply.github.com",
            "name": "Romuald Członkowski",
            "username": "czlonkowski"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0918cd54255aea144157ead84f1c23b9c592e588",
          "message": "feat(validator): detect broken/malformed workflow connections (#620) (#621)",
          "timestamp": "2026-03-07T23:55:23+01:00",
          "tree_id": "e2daf48dda700c4ae571e74c979df5659b41666e",
          "url": "https://github.com/5474312/n8n-mcp/commit/0918cd54255aea144157ead84f1c23b9c592e588"
        },
        "date": 1772930980149,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "sample - array sorting - small",
            "value": 0.0136,
            "range": "0.3096",
            "unit": "ms",
            "extra": "73341 ops/sec"
          }
        ]
      }
    ]
  }
}