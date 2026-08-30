# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `CHATGPT`
DISPATCH_STATUS: `RETURNED`
WORK_READY: `NO`
BLOCKER: `YES`

## CODEX-18 execution result

The current OpenAI no-annotation normalization gap was reproduced deterministically and repaired with an explicit file_search_call.results request, annotation-preserving INLINE_CITATION, and exact fail-closed RETRIEVED_SOURCE normalization. Retrieved-source identity requires provider file identity plus source_type, source_id, and content_hash; filename-only identity is not accepted, repeated results are deduplicated, and provider Store/File IDs remain server-side.

The direct synthetic OpenAI qualification passed with one temporary Vector Store, one tiny synthetic TXT, exact metadata, one exact-filter File Search query, one authoritative normalized source, grounded output, and verified cleanup. Focused tests, npm run check, temporal validation, public-surface validation, and git diff --check passed.

The repaired source was read back with 78/78 deployable files matching and updated in place on the existing Work 0020 Web App deployment at version 56. The user completed the private-admin connection flow and the existing Web App displayed active status; one synthetic Meeting and one synthetic Pitchbook were registered. Explicit administrator sync is OpenAI-only. The explicit Meeting sync returned to an interactive state, but the explicit OpenAI-only Pitchbook sync ended in the generic UI state `エラー` after a bounded wait. Per the CODEX-18 stop rule, native queries, lifecycle, and final runtime integrity were not run. The local OPENAI_API_KEY was intentionally not copied to Script Properties. See docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md.

Latest classification:

~~~
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS — accepted CODEX-17 evidence
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_RUNTIME: BLOCKED — native OpenAI-only Pitchbook sync failed
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
FINAL_INTEGRITY: NOT RUN native Web App
READY: NO
BLOCKER: OPENAI_SYNC_FAILED — native OpenAI-only Pitchbook sync ended in the generic UI error state; no retry was performed
GITHUB_CI_ACTUALLY_RAN: NO — no GitHub Actions run was returned for the pushed head
~~~

## Current authoritative classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_PROVIDER_RESOURCES: PASS — create/upload/attributes/index/filter/cleanup
OPENAI_GROUNDED_SYNTHETIC_ANSWER: PASS
OPENAI_SYNTHETIC_SELF_TEST: PASS — connection active and synthetic Pitchbook registered; source-sync gate failed
OPENAI_MEETING_INDEX_QUERY_CITATION: NOT RUN native Web App — stopped after Pitchbook sync failure
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: BLOCKED — OpenAI-only native sync ended in generic ERROR; query not run
OPENAI_METADATA_FILTER: PASS deterministic/direct synthetic; native qualification pending
OPENAI_LIFECYCLE: PASS deterministic; native qualification pending
OPENAI_RUNTIME: BLOCKED — native OpenAI-only Pitchbook sync failed
GEMINI_RUNTIME: BLOCKED / PROVIDER RECOVERY DEFERRED
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
SCHEMA_ALIGNMENT: PASS
SOURCE_READBACK: PASS — 78/78 deployable files
WEB_APP_DELIVERY: PASS — version 56, existing deployment updated in place
FINAL_INTEGRITY: NOT RUN native Web App
READY: NO
BLOCKER: OPENAI_SYNC_FAILED — native OpenAI-only Pitchbook sync ended in the generic UI error state; CODEX-18 stop rule applied
GITHUB_CI_ACTUALLY_RAN: NO
```

## CODEX-18 result

CODEX-18 reproduced the OpenAI no-annotation gap and repaired the normalizer. The implementation now preserves explicit `INLINE_CITATION` evidence and also supports exact fail-closed `RETRIEVED_SOURCE` normalization using provider file identity plus `source_type`, `source_id`, and `content_hash`. Filename-only or ambiguous/stale identity is rejected and provider resource IDs remain server-side.

The direct synthetic OpenAI qualification passed with one temporary Vector Store and one synthetic TXT. Exact filtering, grounded answer, authoritative normalized source and cleanup all passed. Repository validation passed (`316/316`; focused provider/admin/core tests passed, including the OpenAI-only sync scope regression; UI `10/10` plus temporal/public/diff checks).

The repaired source was delivered to the existing Apps Script project, read back `78/78`, and the existing private Web App was updated in place to version `56`. The explicit administrator sync now passes `providers: [OPENAI]` and therefore does not invoke Gemini during this dispatch.

No local API key was copied to Script Properties. Therefore the remaining checks are deliberately native/private-admin only.

## Remaining authorized-user sequence

```text
1. STOP after the native OpenAI-only Pitchbook sync failure; do not retry during this dispatch.
2. Preserve the observed connection and synthetic registration evidence; native query, lifecycle, and final-integrity gates remain not run.
```

Do not create another dispatch merely to retry this runtime failure. Keep `0020-CODEX-18` returned with the safe `OPENAI_SYNC_FAILED` blocker. A later dispatch requires a separately scoped diagnosis or repair decision.

## Problem classification

### BLOCKER

1. Native OpenAI-only Pitchbook source sync ended in a generic error state; the underlying error was not safely exposed.
2. OpenAI Meeting/Pitchbook application queries and lifecycle/final-integrity gates remain incomplete because the stop rule was applied.
3. PR #26 cannot merge while the user-ready provider route is unqualified.

### FIX SOON / FOLLOW-UP

- GitHub-hosted CI is still absent; local/repository tests are not CI evidence.
- PR #26 is currently non-mergeable relative to main and must be reconciled only after provider qualification closes.
- Gemini provider recovery is a later provider-specific Work.
- Work 0025 will add administrator-controlled model/thinking selection after Work 0020 closes.

Report:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md`

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `CHATGPT`
DISPATCH_STATUS: `RETURNED`
WORK_READY: `NO`
BLOCKER: `YES`
