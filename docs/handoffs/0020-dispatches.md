# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-07`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-07 — READY

- mode: `INVESTIGATION / BUILD / QUALIFICATION`;
- route: `C`;
- purpose: remove the false-negative Apps Script `getRequest()` payload projection gate, select a compatible Byte[] or Blob request shape locally, and finish bounded Gemini Meeting + Pitchbook qualification;
- active hypothesis: CODEX-06 stopped on an over-strict preflight assumption that `getRequest().payload` preserves the original Byte[] representation; the corrected direct `fetch()` has still never reached Gemini after removing manual `Content-Length`;
- fastest decisive action: evaluate Byte[] and Blob candidates locally/non-mutating, select one, then issue exactly one live Meeting finalize request;
- recommended model: `Sol High`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-07-runtime-request-shape-selection-and-gemini-completion-instruction.md`;
- exact execution ref: use the final branch head supplied in the ChatGPT dispatch prompt;
- OpenAI: deliberately deferred, disabled, and not to be live-called;
- FULL_OUTPUT: accepted PASS from CODEX-03; do not rerun absent contradiction;
- no Files API/import fallback in this dispatch;
- one corrected source deployment and one live Meeting finalize request maximum.

## Returned dispatch

### 0020-CODEX-06 — RETURNED / ACCEPTED EXCEPT BLOCKER

Accepted evidence:

- manual final-upload `Content-Length` removed;
- exact MIME type/bytes/offset/finalize command preserved;
- focused Gemini transport `12/12 PASS`, AI-focused `78/78 PASS`, repository `277/277 PASS`;
- temporal/public-surface/diff checks PASS; public facade `30`;
- exact `78`-file source sync/readback PASS;
- immutable Apps Script version `46`, same private Web App updated in place;
- one bounded Meeting sync selected; batch size restored to `10`;
- Backend remained five sheets/schema 6, Meeting/Pitchbook counts 4/16, Audit 71, `AI_SYNC_ENABLED=false`, `OPENAI_ENABLED=false`;
- no query, Pitchbook qualification, OpenAI call, FULL_OUTPUT rerun, second Store, new deployment, or Library mutation.

Blocker evidence:

- Gate A stopped at `AI_UPLOAD_FINALIZE_REQUEST_INVALID / UPLOAD_FINALIZE_CLIENT` before a provider HTTP response;
- no provider Document identity or Indexed state was produced;
- production code made `UrlFetchApp.getRequest()` a hard byte-for-byte payload projection gate;
- deterministic tests mocked `getRequest()` by returning `options.payload` unchanged, which does not prove target-runtime representation parity.

CODEX-06 report:
`docs/handoffs/0020-CODEX-06-apps-script-content-length-finalize-repair-and-completion-report.md`

### 0020-CODEX-05 — RETURNED / ACCEPTED EXCEPT BLOCKER

- focused `68/68 PASS`, repository `274/274 PASS`;
- safe stage/error preservation and bounded retry hardening;
- exact source readback, version `45`, same Web App update;
- one Meeting upload reached finalization and returned `AI_UPLOAD_FINALIZE_FAILED` before CODEX-06 isolated the client-side gate.

### 0020-CODEX-04 — RETURNED / ACCEPTED EXCEPT GEMINI RUNTIME

- focused `17/17 PASS`, repository `265/265 PASS`;
- one isolated Gemini Store;
- future zero-code OpenAI administrator activation implemented and deterministically validated;
- OpenAI remained disabled and uncalled.

### 0020-CODEX-03 — ACCEPTED / COMPLETE

Closed absent material contradiction:

- focused `52/52 PASS`, repository `256/256 PASS`;
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime and canonical package parity PASS;
- disabled-provider safe errors/no-failover PASS;
- final integrity PASS;
- Apps Script version `42`, triggers `0`, same private Web App, no Library/permission mutation.

## Earlier dispatches

- `0020-CODEX-02`: implementation accepted; runtime stopped before schema alignment.
- `0020-CODEX-01`: superseded before qualification because Pitchbook body extraction was removed from FULL_OUTPUT.

## Closed source scopes

```text
Gemini File Search -> Meeting + Pitchbook/source materials
ChatGPT/OpenAI -> visible but deliberately disabled in personal DEV
全文出力 -> Meeting Google Docs full text + optional Pitchbook references/links
```

Only one active Codex dispatch may exist.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-07`
BALL: `CODEX`
STATUS: `READY`
