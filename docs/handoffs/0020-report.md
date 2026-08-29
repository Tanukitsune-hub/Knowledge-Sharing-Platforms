# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`

## Current classification

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: BLOCKED — CODEX-08 Gate 0 selected Pitchbook, not Meeting
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence
FINAL_INTEGRITY: NOT RUN after CODEX-08 mandatory Gate 0 stop
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

## CODEX-08 bounded result

CODEX-08 deterministic source repair passed (`39/39` focused, `280/280` repository, temporal/public-surface/diff checks). The current redacted provider-state snapshot contained two eligible Pending synthetic Meetings, but also older eligible Active Pending/retryable Pitchbooks. With guarded batch size `1`, the real provider-neutral selector returned `selectedCount=1` with source type `Pitchbook` and zero selected Meetings. The mandatory Gate 0 condition was therefore not met.

The temporary batch size was restored from `1` to its original value `10` and read back. No source sync, version, Web App update, Gemini call, query, or dependent qualification was performed. The direct Blob repair is logic-validated but not target-runtime-qualified.

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
Gate 0: eligible Meeting selected=1 — BLOCKED; current selector selected Pitchbook
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
GEMINI_RUNTIME: BLOCKED — Gate 0 did not select a Meeting
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: NOT RUN after mandatory Gate 0 stop
READY: NO
BLOCKER: YES
```
