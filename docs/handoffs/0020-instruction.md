# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION / BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-instruction.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini is the personal-DEV live provider. OpenAI is deliberately deferred/disabled. File Search scope is Meeting + Pitchbook/source; FULL_EXPORT body is Meeting Google Docs full text with optional Pitchbook references only.

## Accepted evidence

Closed absent material contradiction:
- CODEX-03: schema 6 / five Backend sheets / FULL_OUTPUT runtime and canonical output parity / disabled-provider no-failover / final integrity PASS;
- CODEX-04: one isolated Gemini Store, future zero-code OpenAI activation deterministic PASS, OpenAI uncalled;
- CODEX-05: transport-stage diagnostics + bounded retry, `274/274` PASS, version 45;
- CODEX-06: caller `Content-Length` removed, `277/277` PASS, version 46;
- CODEX-07: candidate-selection deterministic PASS (`17/17`, `41/41`, `282/282`), version 47, same private Web App.

Do not rerun FULL_OUTPUT or live-call OpenAI.

## Strategy Reset after CODEX-07

Post-return Backend readback materially changes the remaining diagnosis:

- the previously inspected synthetic Meeting is Gemini `Failed` with `retryable:false` / `permanent:true`;
- another failed Meeting is also permanent-failed;
- other synthetic Meetings remain Pending/eligible;
- the real provider work-selection contract excludes permanent-failed entries.

Therefore a completed provider-neutral sync plus an unchanged old safe error does not prove a new finalize attempt occurred. CODEX-08 must first prove exactly one eligible Pending/NotIndexed Meeting is selected.

If no eligible source exists, only Gemini-derived provider state for one synthetic Meeting may be reset to `NotIndexed` via the existing provider-state contract; authoritative Meeting content/metadata must remain untouched.

Other closed conclusions:
- Apps Script `fetch()` supports Blob/byte-array payloads;
- `getRequest()` is optional inspection, not a live prerequisite;
- Gemini Files API + `importFile` does not bypass this transport because its upload also uses resumable finalization;
- production preflight/candidate refinement is no longer a target.

Active hypothesis:

> One currently eligible synthetic Meeting, one exact Blob, and no hard `getRequest()` gate will finally produce either an ACTIVE Gemini document or a genuine local/provider transport result.

## CODEX-08 completion boundary

1. Gate 0: read provider states and prove exactly one eligible Pending/NotIndexed synthetic Meeting is selected; do not use stale permanent-failed state as runtime evidence.
2. Remove `getRequest()` from live indexing prerequisites.
3. Validate canonical bytes/MIME directly and build one exact Blob.
4. Preserve offset `0`, `upload, finalize`, no caller `Content-Length`, opaque upload URL (`escaping:false` if required).
5. Run deterministic validation.
6. Deliver exact tested source once and update the same private Web App once.
7. Gate A: issue exactly one real Meeting finalize attempt and prove it was invoked in this dispatch.
8. If Gate A PASS: one Meeting grounded query.
9. One small TXT Pitchbook index/query.
10. Exact metadata filter + update/Inactive/Reactivate/delete-rebuild lifecycle.
11. Restore `AI_SYNC_ENABLED=false`, batch setting, keep OpenAI disabled/uncalled, triggers 0, final integrity PASS.

If Blob `fetch()` throws locally before provider response, stop for architectural Strategy Reset. If a real provider HTTP/operation error appears, stop with that exact safe evidence. No Byte[] live fallback or Files API/importFile fallback in this dispatch.

## Closed contracts

- exactly five Backend sheets/schema `6`;
- independent OpenAI/Gemini derived state;
- stable-ID citation resolution to authoritative Backend/Drive;
- no automatic provider failover;
- Pitchbook body is File Search input but not FULL_EXPORT body;
- no recurring trigger, confidential production data, new Store, second Web App, or Library mutation.

## Target final classification

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```

Completion Latch applies only after ChatGPT final review and merge.
