# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-08 — READY

- mode: `INVESTIGATION / BUILD / QUALIFICATION`;
- route: `C`;
- purpose: prove one genuinely selected eligible Meeting reaches a real Blob finalize, then finish bounded Gemini Meeting + Pitchbook qualification if Gate A passes;
- active hypothesis: prior CODEX-07 evidence may be stale because the previously inspected Meeting is now `Failed/permanent` and normal eligibility excludes it. After explicitly selecting one Pending/NotIndexed synthetic Meeting and removing `getRequest()` from the live prerequisite path, direct Blob finalize will either index it or expose the first genuine local/provider transport result;
- recommended model: `Sol High`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-instruction.md`;
- exact execution ref: use the final branch head supplied in the ChatGPT dispatch prompt;
- OpenAI: deliberately deferred, disabled, and not to be live-called;
- FULL_OUTPUT: accepted PASS from CODEX-03; do not rerun absent contradiction;
- Gate 0 is mandatory: prove exactly one currently eligible Pending/NotIndexed synthetic Meeting is selected before any live call; stale permanent-failure state is not Gate-A evidence;
- if no eligible source exists, reset only Gemini-derived AI state for one synthetic Meeting to `NotIndexed` through the existing provider-state contract and prove eligibility; do not alter authoritative Meeting data;
- Gate A: one real Blob finalize `fetch()` maximum before any query;
- no new Store, second Web App deployment, Library mutation, broad sync, Byte[] live fallback, or Files API/importFile fallback.

## Returned dispatches / accepted evidence

### 0020-CODEX-07 — RETURNED / ACCEPTED EXCEPT BLOCKER
- transport `17/17`, focused AI/provider `41/41`, repository `282/282` PASS;
- temporal/public-surface/diff checks PASS; exact source readback; version `47`; same private Web App update;
- no accepted Gemini Meeting Document/Indexed state; safe diagnostic remained `AI_UPLOAD_FINALIZE_REQUEST_INVALID / UPLOAD_FINALIZE_CLIENT`; provider HTTP absent;
- authoritative post-return readback now shows the previously inspected Meeting is permanent-failed and therefore ineligible under normal selection; old diagnostic cannot prove CODEX-07 ran a new finalize.

### 0020-CODEX-06 — RETURNED / ACCEPTED EXCEPT BLOCKER
- caller final-upload `Content-Length` removed;
- transport `12/12`, AI-focused `78/78`, repository `277/277` PASS;
- version `46`, same Web App update; Gate A stopped locally before provider response.

### 0020-CODEX-05 — RETURNED / ACCEPTED EXCEPT BLOCKER
- transport/provider `68/68`, repository `274/274` PASS;
- safe stage/error preservation and bounded transient retry hardening; version `45`.

### 0020-CODEX-04 — RETURNED / ACCEPTED EXCEPT GEMINI RUNTIME
- focused `17/17`, repository `265/265` PASS;
- one isolated Gemini Store;
- future zero-code OpenAI activation implemented/deterministically validated; OpenAI disabled/uncalled.

### 0020-CODEX-03 — ACCEPTED / COMPLETE
- focused `52/52`, repository `256/256` PASS;
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical package parity PASS;
- disabled-provider safe errors/no-failover and final integrity PASS;
- Apps Script version `42`, triggers `0`, same private Web App.

Earlier: CODEX-02 implementation accepted; CODEX-01 superseded before qualification.

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
