# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-09`
BALL: `CODEX`
STATUS: `READY`

## Current classification

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: BLOCKED — no live-qualified Meeting index yet
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence
FINAL_INTEGRITY: PENDING after Gemini runtime completion
READY: NO
BLOCKER: YES
```

## Accepted evidence

- CODEX-03: focused `52/52`, repository `256/256`, schema 6/five sheets, FULL_OUTPUT/canonical output parity, disabled-provider/no-failover, final integrity PASS; version 42.
- CODEX-04: one isolated Gemini Store; future zero-code OpenAI activation deterministic PASS; OpenAI disabled/uncalled.
- CODEX-05: transport/provider `68/68`, repository `274/274`, safe transport-stage diagnostics and bounded transient retry; version 45.
- CODEX-06: caller `Content-Length` removed; transport `12/12`, AI-focused `78/78`, repository `277/277`; version 46.
- CODEX-07: transport `17/17`, focused AI/provider `41/41`, repository `282/282`, temporal/public/diff PASS, exact source readback, version 47, same private Web App.
- CODEX-08: direct Blob implementation deterministic PASS, focused `39/39`, repository `280/280`, temporal/public/diff PASS; no source delivery/deployment/Gemini call after Gate 0 stop.

## CODEX-08 authoritative result

The current provider-neutral selector combines eligible Meeting and Pitchbook items. It preserves lifecycle priority, then sorts by oldest `Updated_At/Created_At`, then stable source key, and only then applies `syncBatchSize`.

CODEX-08 confirmed:
- two eligible Pending synthetic Meetings existed;
- older eligible Pending/retryable Pitchbooks also existed;
- with batch size `1`, the real selector selected one Pitchbook and zero Meetings;
- batch size was restored to `10`;
- no Gemini call, Apps Script source sync/version/deployment, query, lifecycle, OpenAI call, or FULL_OUTPUT rerun occurred.

This is expected queue behavior, not a selector defect. Production ordering must not be changed to Meeting-first merely for qualification.

## Strategy Reset for CODEX-09

Fastest safe decisive action:

Extend the existing sync contract with an optional validated source-type constraint while preserving blank/default behavior exactly:

```text
sourceType blank      -> current combined Meeting+Pitchbook queue
sourceType Meeting    -> eligible Meetings only -> existing sort -> batch slice
sourceType Pitchbook  -> eligible Pitchbooks only -> existing sort -> batch slice
```

Apply the filter before sorting/slicing.

Reuse the existing administrator `SYNC` operation and existing `kspRunProviderNeutralAiSync_(environment, options)` function. Do not add a public/debug wrapper. Existing server-side administrator authorization and safe sync summary remain authoritative.

Why this is durable rather than test-only:
- administrators can bound a manual repair/sync by source class without disturbing unrelated backlog;
- normal 「今すぐ同期」 with no sourceType is unchanged;
- no stable source ID needs to be exposed to the browser;
- lifecycle ordering remains consistent inside the selected source class.

## Active evidence order

```text
CODEX-09 deterministic sourceType contract
-> admin SYNC sourceType=Meeting / selected Meeting=1
-> one real Blob finalize invoked
-> ACTIVE Meeting Document + Backend Indexed
-> one grounded Meeting query
-> admin SYNC sourceType=Pitchbook / selected Pitchbook=1
-> one small TXT Pitchbook index + grounded query
-> exact metadata filter
-> update / Inactive / Reactivate / delete-rebuild
-> final integrity
```

Active instruction:
`docs/handoffs/0020-CODEX-09-source-type-bounded-sync-and-gemini-final-qualification-instruction.md`

## Stop rules

- one corrected source delivery/deployment maximum;
- no unrestricted broad sync for qualification;
- no Meeting-first production priority change;
- no mutating Pitchbooks into fake failure state to reach a Meeting;
- stop on first new Meeting indexing local/provider/operation/document-readback failure;
- OpenAI remains disabled and uncalled;
- FULL_OUTPUT remains accepted and is not rerun absent contradiction.

## Target final matrix

```text
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```
