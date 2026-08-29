# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-08 — READY

- mode: `INVESTIGATION / BUILD / QUALIFICATION`;
- route: `C`;
- purpose: remove the remaining self-imposed `getRequest()` production gate, issue one real Gemini File Search finalize with an Apps Script Blob, then finish Meeting + Pitchbook qualification if Gate A passes;
- active hypothesis: after `Content-Length` removal, CODEX-06/07 still stopped on local inspection/candidate gates; the corrected direct `UrlFetchApp.fetch()` has not yet produced a provider response. A direct Blob send without hard preflight will either index the Meeting or finally expose a genuine provider/local transport failure;
- recommended model: `Sol High`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-instruction.md`;
- exact execution ref: use the final branch head supplied in the ChatGPT dispatch prompt;
- OpenAI: deliberately deferred, disabled, and not to be live-called;
- FULL_OUTPUT: accepted PASS from CODEX-03; do not rerun absent contradiction;
- no new Store, second Web App deployment, Library mutation, or broad sync;
- attempt boundary: one corrected source delivery and exactly one live Meeting final-upload attempt before any query;
- Files API/importFile is not an escape route in this dispatch because Gemini Files API upload itself uses the same resumable `upload, finalize` transport.

## Returned dispatch

### 0020-CODEX-07 — RETURNED / ACCEPTED EXCEPT BLOCKER

Accepted evidence:

- Gemini transport `17/17 PASS`;
- focused AI/provider `41/41 PASS`;
- repository `282/282 PASS`;
- temporal/public-surface/diff checks PASS, public facade `30`;
- exact `78`-file source sync/readback PASS;
- immutable Apps Script version `47`, same private Web App update PASS;
- Backend remains five sheets/schema `6`, batch size restored to `10`, `AI_SYNC_ENABLED=false`, `OPENAI_ENABLED=false`;
- no query, Pitchbook qualification, OpenAI call, FULL_OUTPUT rerun, new Store/deployment/Library mutation.

Blocker:

- one authorized provider-neutral sync did not produce an active Gemini Meeting Document or Backend `Indexed` state;
- safe diagnostic remained `AI_UPLOAD_FINALIZE_REQUEST_INVALID / UPLOAD_FINALIZE_CLIENT`;
- provider HTTP status/body and document identity absent;
- production `getRequest()`/candidate compatibility logic still prevented acceptance of a real finalize path.

Report:
`docs/handoffs/0020-CODEX-07-runtime-request-shape-selection-and-gemini-completion-report.md`

### 0020-CODEX-06 — RETURNED / ACCEPTED EXCEPT BLOCKER

- manual final-upload `Content-Length` removed;
- transport `12/12`, AI-focused `78/78`, repository `277/277` PASS;
- exact source readback, version `46`, same Web App update;
- Gate A stopped locally at `AI_UPLOAD_FINALIZE_REQUEST_INVALID / UPLOAD_FINALIZE_CLIENT` before provider response.

### 0020-CODEX-05 — RETURNED / ACCEPTED EXCEPT BLOCKER

- transport/provider `68/68`, repository `274/274` PASS;
- safe stage/error preservation and bounded transient retry hardening;
- exact source readback, version `45`, same Web App update.

### 0020-CODEX-04 — RETURNED / ACCEPTED EXCEPT GEMINI RUNTIME

- focused `17/17`, repository `265/265` PASS;
- one isolated Gemini Store;
- future zero-code OpenAI activation implemented/deterministically validated;
- OpenAI disabled and uncalled.

### 0020-CODEX-03 — ACCEPTED / COMPLETE

Closed absent material contradiction:

- focused `52/52`, repository `256/256` PASS;
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical package parity PASS;
- disabled-provider safe errors/no-failover PASS;
- final integrity PASS;
- Apps Script version `42`, triggers `0`, same private Web App.

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
DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `READY`
