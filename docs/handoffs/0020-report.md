# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `NONE`
BALL: `CHATGPT`
DISPATCH_STATUS: `RETURNED`
WORK_READY: `YES`
BLOCKER: `NONE`

## Executive conclusion

Work 0020 is complete on the OpenAI provider path. CODEX-19 repaired the broad-sync/partial-failure orchestration defect without reopening accepted CODEX-17/18 provider and citation evidence. The exact small synthetic Pitchbook and Meeting paths now pass native grounded query/citation, metadata, lifecycle and final-integrity gates.

The existing standalone private Web App was updated in place once to version 57. No new runtime or Vector Store was created. PR #26 remains Draft/Open/unmerged.

## Accepted evidence

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_VECTOR_STORE/UPLOAD/ATTRIBUTES/INDEX/FILTER/CLEANUP: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_NATIVE_CONNECTION_SELF_TEST: PASS
OPENAI_EXACT_SOURCE_SYNC: PASS
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS — DOC-000017
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS — MTG-000005
OPENAI_METADATA_FILTER: PASS
OPENAI_LIFECYCLE: PASS
LOGIC_VALIDATION: PASS — focused 47/47; canonical 325/325
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun in CODEX-19
SOURCE_READBACK: PASS
WEB_APP_DELIVERY: PASS — existing standalone deployment version 57
FINAL_INTEGRITY: PASS
GITHUB_CI_ACTUALLY_RAN: NO — no check rollup was returned for the pushed CODEX-19 head
READY: YES
BLOCKER: NONE
```

## CODEX-19 repair

The root cause was a sourceType-only, oldest-first Pitchbook batch that mixed the intended small synthetic source with unrelated old 5–25 MiB fixtures. Their item-level `OPENAI_INDEX_TIMEOUT` results were collapsed into generic `OPENAI_SYNC_FAILED`, which disabled a valid provider and hid safe diagnostics.

CODEX-19 added exact private-admin source selection, fail-closed authoritative/provider reconciliation, provider-current eligibility, partial item-failure semantics, last-known-good source preservation and safe UI counts/error codes. Broad and scheduled sync behavior remains unchanged when `sourceId` is absent.

## Target-runtime qualification

- `DOC-000017` exact reconciliation first reused one current source without upload.
- A unique metadata scope was applied and validated through date/GP/asset/capital/source-type filters.
- Inactive exact sync removed one source; Reactivate exact sync rebuilt one source; final exact sync reused one unchanged source without duplicate.
- One native Pitchbook query produced the expected grounded synthetic answer and one authoritative normalized `DOC-000017` source.
- One native Meeting query produced the expected grounded synthetic answer and one authoritative normalized `MTG-000005` source.
- Disable/re-enable through the existing synthetic connection test succeeded with the stored key, followed by exact no-duplicate activation.

## Side effects and residuals

No Gemini call, provider fallback, confidential data, FULL_OUTPUT rerun, broad Pitchbook retry, new Web App/Library/public endpoint/Vector Store, or old large-fixture mutation occurred.

One adjacent synthetic row, `DOC-000018`, was briefly edited because the edit panel had not finished switching. It was detected before provider sync and restored completely. Final authoritative readback confirms its original Active metadata and sequence-02 filename; no OpenAI operation targeted it. The Audit correctly may retain the synthetic edit/restore trail.

The old 5–25 MiB `OPENAI_INDEX_TIMEOUT` fixtures remain a separate follow-up. Gemini recovery and administrator-governed model/thinking selection remain later work.

Detailed report:
`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-report.md`

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `NONE`
BALL: `CHATGPT`
DISPATCH_STATUS: `RETURNED`
WORK_READY: `YES`
BLOCKER: `NONE`
