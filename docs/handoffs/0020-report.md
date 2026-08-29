# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `READY`

## Current classification

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: BLOCKED — no qualified indexed Meeting yet
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence
FINAL_INTEGRITY: PARTIAL after CODEX-07 bounded stop
READY: NO
BLOCKER: YES
```

## Accepted evidence

- CODEX-03: focused `52/52`, repository `256/256`, schema 6/five sheets, FULL_OUTPUT/canonical output parity, disabled-provider/no-failover, final integrity PASS; version 42.
- CODEX-04: focused `17/17`, repository `265/265`, one isolated Gemini Store, future zero-code OpenAI activation deterministic PASS; OpenAI disabled/uncalled.
- CODEX-05: transport/provider `68/68`, repository `274/274`, safe transport-stage diagnostics and bounded transient retry, version 45.
- CODEX-06: caller `Content-Length` removed; transport `12/12`, AI-focused `78/78`, repository `277/277`, version 46; provider response not reached.
- CODEX-07: transport `17/17`, focused AI/provider `41/41`, repository `282/282`, temporal/public-surface/diff PASS, exact source readback, version 47, same private Web App; no accepted Meeting Document/Indexed state and provider HTTP absent.

Detailed reports through CODEX-07 remain authoritative under `docs/handoffs/`.

## New authoritative readback after CODEX-07

Backend provider-state readback shows:

- the synthetic Meeting previously used to inspect `AI_UPLOAD_FINALIZE_REQUEST_INVALID` is now Gemini `Failed`, attempt 3, `retryable:false`, `permanent:true`;
- another prior failed Meeting is also permanent-failed;
- other existing synthetic Meetings remain Pending/eligible;
- provider-neutral selection logic intentionally excludes permanent failed provider entries.

This means CODEX-07's unchanged old safe diagnostic is not proof that a new finalize request executed. A sync can complete without selecting the old permanent-failed source.

Therefore the prior phrase “one authorized sync action did not produce Indexed” remains true, but its transport implication is weakened: Gate A did not establish that one eligible Meeting actually entered the upload/finalize path.

## Strategy Reset for CODEX-08

Closed conclusions:

1. Gate 0 must prove the candidate source is currently eligible and actually selected before any runtime conclusion.
2. Prefer one existing Pending/NotIndexed synthetic Meeting. Do not reuse a permanent-failed row by accident.
3. If no eligible source exists, reset only Gemini-derived provider state for one synthetic Meeting to `NotIndexed` using the existing provider-state contract; authoritative Meeting data remains unchanged.
4. Apps Script `fetch()` supports Blob/byte-array payloads; `getRequest()` is optional inspection and must not gate live execution.
5. Gemini Files API + `importFile` is not a transport workaround because the initial Files upload also requires resumable `upload, finalize`.
6. The next decisive evidence is one run-local real Blob finalize tied to the Gate-0-selected source.

Active hypothesis:

> After proving one eligible Meeting is selected, removing the production `getRequest()` gate and issuing one exact Blob finalize will produce either an ACTIVE Gemini document or the first genuine local/provider transport failure for that run.

Evidence order:

```text
Gate 0: eligible Meeting selected=1
-> one real Blob finalize invoked=1
-> ACTIVE Meeting Document + Backend Indexed
-> Meeting grounded query
-> one small TXT Pitchbook index/query
-> exact metadata filter
-> update / Inactive / Reactivate / delete-rebuild
-> final integrity
```

Active instruction:
`docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-instruction.md`

Attempt boundary:
- one corrected source delivery maximum;
- exactly one live Meeting final-upload attempt before query;
- no stale-error inference;
- no Byte[] live fallback or Files API/importFile fallback in this dispatch;
- stop on local Blob fetch exception or genuine provider HTTP/operation error.

## Target final matrix

```text
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```
