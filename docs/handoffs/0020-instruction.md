# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `CODEX`
STATUS: `READY`

## CODEX-18 returned boundary

The deterministic no-annotation failure was reproduced and the OpenAI normalizer was repaired. Direct synthetic OpenAI qualification passed, including exact retrieved-source metadata agreement and cleanup. The implementation was integrated and delivered to the existing Work 0020 Web App deployment in place.

The remaining qualification is target-runtime-only: a private administrator must use the existing Web App to complete APIキーを保存して接続確認, observe the synthetic self-test and READY_FOR_SYNC, then explicitly run 資料を同期して利用開始 before Meeting/Pitchbook and lifecycle evidence can be accepted. The Codex local key was not copied to Script Properties. Until those user-authorized checks are observed, READY: NO and BLOCKER: ACTION_REQUIRED.

Full details: docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md.
MODE: `REPAIR -> BUILD / QUALIFICATION`

Active instruction:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-instruction.md`

Active decision:
`docs/decisions/openai-zero-friction-onboarding-and-project-switch.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

For Work 0020 completion, OpenAI is the active provider path. Gemini remains implemented but disabled/not user-ready until a later provider-recovery Work requalifies it. There is no automatic cross-provider failover.

## Current decisive evidence

CODEX-17 direct OpenAI qualification materially advanced the Work:

```text
base Responses API control: PASS
Vector Store create: PASS
synthetic TXT upload: PASS
attributes/indexing/readback: PASS
exact source_id filter: PASS
File Search execution: PASS
grounded synthetic answer: PASS
cleanup/no residual provider resources: PASS
citation normalization: BLOCKED
```

The remaining immediate blocker is not provider reachability. The direct query completed, but the qualification did not obtain a citation representation accepted by the current Knowledge Share normalizer.

OpenAI Responses can expose source evidence through output-text `file_citation` annotations and/or explicitly included `file_search_call.results`. CODEX-18 must support the official shapes without weakening provenance or ambiguity checks.

## Active CODEX-18 outcome

Before Web App changes:

1. reproduce the narrow citation-normalization gap deterministically;
2. explicitly include `file_search_call.results` in the Responses request;
3. preserve valid `file_citation` annotation handling;
4. normalize authoritative retrieved-source evidence to Knowledge Share source identity only when exact and unambiguous;
5. never use filename alone;
6. run the canonical tests;
7. run exactly one temporary synthetic direct-provider control and verify cleanup;
8. only after PASS, integrate the existing private-admin synthetic self-test/activation flow and complete Meeting/Pitchbook + lifecycle qualification.

## Citation/source provenance contract

Knowledge Share distinguishes:

```text
INLINE_CITATION
= provider output-text annotation explicitly cites the file

RETRIEVED_SOURCE
= File Search result identifies a file retrieved for the answer and maps exactly to one Knowledge Share source
```

Both may support the user-facing source list when authoritative and unambiguous, but a retrieved source must not be falsely described as a character-level inline citation.

Provider file/store IDs remain server-side only. Source identity must be recovered through exact provider-document/source metadata and the existing Drive/source-link contract.

## Credential/onboarding contract

Normal private-admin flow remains:

```text
APIキーを保存して接続確認
-> administrator authorization
-> key stored only in Script Properties
-> isolated synthetic self-test
-> no Meeting/Pitchbook source body read
-> READY_FOR_SYNC

資料を同期して利用開始
-> explicit bounded OpenAI sync
-> ACTIVE only after safe source indexing
```

A stored key alone must not enable OpenAI or trigger source synchronization.

The key must never be returned, displayed after save, logged, audited, stored in Sheets, exported, or committed.

## Completion gates

OpenAI path must prove:

```text
DIRECT_BASE_MODEL: PASS
DIRECT_FILE_SEARCH: PASS
CITATION_OR_RETRIEVED_SOURCE_NORMALIZATION: PASS
SYNTHETIC_SELF_TEST: PASS
MEETING_INDEX_QUERY_CITATION: PASS
PITCHBOOK_INDEX_QUERY_CITATION: PASS
METADATA_FILTER: PASS
UPDATE_REINDEX_NO_DUPLICATE: PASS
INACTIVE_EXCLUSION: PASS
REACTIVATE_RESTORE: PASS
DELETE_REBUILD: PASS
DISABLE_REENABLE: PASS
NO_PROVIDER_FAILOVER: PASS
FINAL_INTEGRITY: PASS
```

FULL_OUTPUT remains accepted and must not be rerun.

## Current Work classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: BLOCKED — narrow normalization contract
OPENAI_RUNTIME: PARTIAL / PROVIDER PATH VIABLE
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS
SCHEMA_ALIGNMENT: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

## Boundaries

- no automatic OpenAI/Gemini failover;
- no confidential data in DEV qualification;
- no Gemini live calls in CODEX-18;
- no FULL_OUTPUT rerun;
- no second Web App/Library/public debug endpoint;
- no filename-only source normalization;
- no weakening exact metadata/filter gates;
- no current-main integration until provider qualification closes;
- keep PR #26 Draft/Open/unmerged until final review.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `CODEX`
STATUS: `READY`
