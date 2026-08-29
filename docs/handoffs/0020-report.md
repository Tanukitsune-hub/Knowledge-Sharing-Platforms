# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-07`
BALL: `CODEX`
STATUS: `READY`

## Current classification

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: BLOCKED — corrected direct finalize fetch not yet observed
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence
FINAL_INTEGRITY: PARTIAL after CODEX-06 bounded stop
READY: NO
BLOCKER: YES
```

## Accepted evidence

CODEX-03 remains accepted:
- focused `52/52 PASS`, repository `256/256 PASS`;
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT Preview/Copy/Docs/PDF contract and canonical package parity PASS;
- disabled-provider safe errors/no-failover PASS;
- final integrity PASS;
- Apps Script version `42`, triggers `0`, same private Web App.

CODEX-04 remains accepted:
- focused `17/17 PASS`, repository `265/265 PASS`;
- public facade `30`;
- one isolated Gemini Store;
- future zero-code OpenAI administrator activation implemented/deterministically validated;
- OpenAI disabled and uncalled.

CODEX-05 remains accepted except for its live blocker:
- focused `68/68 PASS`, repository `274/274 PASS`;
- exact source readback, version `45`, same Web App update;
- safe transport-stage errors and bounded retry hardening.

CODEX-06 remains accepted except for its live blocker:
- manual final-upload `Content-Length` removed;
- exact MIME type/bytes/offset/finalize command preserved;
- focused transport `12/12 PASS`, AI-focused `78/78 PASS`, repository `277/277 PASS`;
- temporal/public-surface/diff checks PASS;
- exact `78`-file source sync/readback, version `46`, same Web App update;
- Backend stayed five sheets/schema 6, Meeting/Pitchbook counts 4/16, Audit 71, batch size restored to 10, `AI_SYNC_ENABLED=false`, `OPENAI_ENABLED=false`;
- no query, Pitchbook qualification, OpenAI call, FULL_OUTPUT rerun, new Store/deployment, or Library mutation.

Detailed reports:
- `docs/handoffs/0020-CODEX-03-schema6-alignment-and-runtime-qualification-report.md`
- `docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-report.md`
- `docs/handoffs/0020-CODEX-05-gemini-indexing-transport-repair-and-final-qualification-report.md`
- `docs/handoffs/0020-CODEX-06-apps-script-content-length-finalize-repair-and-completion-report.md`

## CODEX-06 authoritative return

Gate A ended before a provider response:

```text
Meeting state: Failed
safe code: AI_UPLOAD_FINALIZE_REQUEST_INVALID
classification: UPLOAD_FINALIZE_CLIENT
provider HTTP status/body: absent
provider document identity: absent
indexed timestamp/content hash: absent
```

The final request no longer manually supplies `Content-Length`, but production code invokes `UrlFetchApp.getRequest()` and requires the projected payload to be byte-for-byte equivalent to the original Byte[]. The target runtime stopped on that local preflight before `UrlFetchApp.fetch()` was executed.

The deterministic test harness returns `options.payload` unchanged from its fake `getRequest()`, so the test does not establish target-runtime projection parity.

## Strategy Reset — CODEX-07

Closed conclusions:

- Apps Script `fetch()` officially accepts byte-array and Blob payloads;
- `getRequest()` is an inspection tool and does not promise identical JavaScript payload representation;
- Gemini's direct `uploadToFileSearchStore` remains an official supported path;
- the post-Content-Length direct finalize fetch has not yet been exercised;
- architecture fallback is premature.

Active hypothesis:

> The CODEX-06 hard preflight is a false negative. Evaluate Byte[] and Blob request candidates locally, select one based on structural request compatibility rather than projected payload representation, then issue exactly one real finalize request.

Required evidence order:

```text
local candidate selection
-> one Meeting index
-> one Meeting grounded query
-> one small TXT Pitchbook index/query
-> exact metadata filter
-> update / Inactive / Reactivate / delete-rebuild
-> final integrity
```

Active instruction:
`docs/handoffs/0020-CODEX-07-runtime-request-shape-selection-and-gemini-completion-instruction.md`

The officially supported Files-API-then-importFile route is reserved as a later Strategy Reset only if CODEX-07 proves direct upload cannot be constructed/executed from Apps Script.

## Expected final matrix

```text
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```
