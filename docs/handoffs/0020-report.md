# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
DISPATCH_STATUS: `ACTION_REQUIRED`
WORK_READY: `NO`
BLOCKER: `YES`

## Current authoritative classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_PROVIDER_RESOURCES: PASS — create/upload/attributes/index/filter/cleanup
OPENAI_GROUNDED_SYNTHETIC_ANSWER: PASS
OPENAI_SYNTHETIC_SELF_TEST: PASS deterministic / NOT RUN native Web App
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS deterministic / NOT RUN native Web App
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS direct synthetic + deterministic / NOT RUN native Web App
OPENAI_METADATA_FILTER: PASS deterministic/direct synthetic / NOT RUN native Web App
OPENAI_LIFECYCLE: PASS deterministic / NOT RUN native Web App
OPENAI_RUNTIME: PARTIAL — authorized private-admin native qualification pending
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
SCHEMA_ALIGNMENT: PASS
SOURCE_READBACK: PASS — 78/78 deployable files
WEB_APP_DELIVERY: PASS — version 55, existing deployment updated in place
FINAL_INTEGRITY: NOT RUN native Web App
READY: NO
BLOCKER: ACTION_REQUIRED
GITHUB_CI_ACTUALLY_RAN: NO
```

## CODEX-18 result

CODEX-18 reproduced the OpenAI no-annotation gap and repaired the normalizer. The implementation now preserves explicit `INLINE_CITATION` evidence and also supports exact fail-closed `RETRIEVED_SOURCE` normalization using provider file identity plus `source_type`, `source_id`, and `content_hash`. Filename-only or ambiguous/stale identity is rejected and provider resource IDs remain server-side.

The direct synthetic OpenAI qualification passed with one temporary Vector Store and one synthetic TXT. Exact filtering, grounded answer, authoritative normalized source and cleanup all passed. Repository validation passed (`315/315`; focused `48/48`; UI `10/10` plus temporal/public/diff checks).

The repaired source was delivered to the existing Apps Script project, read back `78/78`, and the existing private Web App was updated in place to version `55`.

No local API key was copied to Script Properties. Therefore the remaining checks are deliberately native/private-admin only.

## Remaining authorized-user sequence

```text
1. open the existing private Web App version 55 as an authorized administrator;
2. enter the OpenAI API key only in the private admin field;
3. run APIキーを保存して接続確認;
4. require isolated synthetic self-test PASS and READY_FOR_SYNC;
5. confirm that this step did not sync/read Meeting or Pitchbook source bodies;
6. run 資料を同期して利用開始;
7. observe bounded native Meeting and Pitchbook indexing/query/source evidence;
8. complete native metadata filter, update/reindex, Inactive, Reactivate, delete/rebuild and disable/re-enable checks;
9. complete final five-sheet/schema/provider/Audit/settings/trigger/deployment integrity.
```

Do not create a new Codex dispatch merely for these authorized UI actions. Keep `0020-CODEX-18` while the user action is pending. If native qualification passes, ChatGPT should close/integrate Work 0020. If it exposes a real implementation defect, create the next dispatch only for that defect.

## Problem classification

### BLOCKER

1. Native private-admin OpenAI self-test has not yet been observed.
2. Native bounded Meeting/Pitchbook application evidence has not yet been observed.
3. Native lifecycle/final-integrity qualification is not yet complete.
4. PR #26 cannot merge until the native provider route is qualified and the branch is reconciled with current main.

### FIX SOON / FOLLOW-UP

- GitHub-hosted CI is still absent; local/repository tests are not CI evidence.
- PR #26 is currently non-mergeable relative to main and must be reconciled only after provider qualification closes.
- Gemini provider recovery is a later provider-specific Work.
- Work 0025 will add administrator-controlled model/thinking selection after Work 0020 closes.

Report:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md`

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
DISPATCH_STATUS: `ACTION_REQUIRED`
WORK_READY: `NO`
BLOCKER: `YES`
