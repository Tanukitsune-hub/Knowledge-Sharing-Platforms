# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Active dispatch

### 0020-CODEX-18 — RETURNED / NATIVE OPENAI SYNC BLOCKER

Accepted CODEX-18 evidence:

- deterministic no-annotation failure reproduced;
- OpenAI INLINE_CITATION and exact fail-closed RETRIEVED_SOURCE normalization PASS;
- direct synthetic File Search/filter/source normalization PASS;
- focused provider/admin/core tests PASS, UI tests `10/10`, canonical `316/316` PASS;
- temporal/public-surface/diff checks PASS;
- source readback `78/78` PASS;
- existing private Web App updated in place to version `56`;
- one synthetic Meeting and one synthetic Pitchbook registered in the existing private Web App;
- explicit Meeting sync returned to an interactive state;
- explicit OpenAI-only Pitchbook sync ended in generic UI `エラー` after a bounded wait;
- CODEX-18 stop rule applied: no native query, lifecycle, retry, or additional deployment after the sync failure;
- no Gemini live call, fallback, confidential DEV data, FULL_OUTPUT rerun, or new deployment;
- GitHub Actions/status checks remain absent.

No further action is authorized in this dispatch after the native sync failure. Preserve the observed evidence and do not retry:

```text
APIキーを保存して接続確認 -> synthetic registrations -> OpenAI-only Pitchbook sync ERROR -> STOP
```

Keep Dispatch ID `0020-CODEX-18` returned with this runtime blocker. Do not create another dispatch merely to retry; a later dispatch requires a separately scoped diagnosis or repair decision.

## Returned history

### 0020-CODEX-17 — RETURNED / NARROW BLOCKER

- direct OpenAI provider path was exercised outside Apps Script;
- Control, Vector Store creation, synthetic TXT upload, attributes, indexing and exact filter all passed;
- File Search and synthetic grounded answer completed;
- required current Knowledge Share citation normalization failed with `OPENAI_CITATION_NORMALIZATION_FAILURE`;
- cleanup passed with no residual provider resources;
- Web App/source/deployment mutation was not performed;
- preserve this provider-viability evidence; do not repeat the entire provider investigation.

### 0020-CODEX-18 — RETURNED / DIRECT PASS, NATIVE OPENAI SYNC BLOCKER

- deterministic pre-fix no-annotation normalization failure reproduced;
- exact fail-closed OpenAI RETRIEVED_SOURCE normalization integrated while preserving INLINE_CITATION;
- direct synthetic OpenAI control passed with exact metadata, one normalized authoritative source, grounded answer, and verified cleanup;
- focused and canonical repository validation passed;
- existing Work 0020 Web App source was read back successfully and updated in place to version 56;
- the user completed private-admin connection in the existing Web App, which displayed active status, and one synthetic Meeting plus one synthetic Pitchbook were registered;
- explicit Meeting sync returned to an interactive state, while explicit OpenAI-only Pitchbook sync ended in generic UI `エラー` after a bounded wait;
- native Meeting/Pitchbook query citation, lifecycle, and final runtime integrity remain not run under the CODEX-18 stop rule;
- administrator source sync is explicitly scoped to OpenAI so this dispatch does not call Gemini;
- local OPENAI_API_KEY was not copied to Script Properties; no Gemini live call or provider fallback was used;
- report: docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md;
- PR #26 remains Draft / Open / unmerged.

~~~
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_SYNTHETIC_SELF_TEST: PASS native connection and synthetic registration / source-sync gate failed
OPENAI_MEETING_INDEX_QUERY_CITATION: NOT RUN native — stopped after Pitchbook sync failure
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: BLOCKED — native OpenAI-only sync ended in generic ERROR
OPENAI_METADATA_FILTER: PASS deterministic / NOT RUN native
OPENAI_LIFECYCLE: PASS deterministic / NOT RUN native
READY: NO
BLOCKER: OPENAI_SYNC_FAILED — native OpenAI-only Pitchbook sync ended in generic UI ERROR; stop rule applied
GITHUB_CI_ACTUALLY_RAN: NO — no GitHub Actions run was returned for the pushed head
~~~

## Superseded dispatch

### 0020-CODEX-16 — SUPERSEDED / NOT EXECUTED

Prepared for additional Gemini diagnosis, then superseded when OpenAI became the active completion provider.

## Accepted Gemini evidence retained

Gemini implementation/reconciliation evidence remains preserved, but provider recovery is deferred and is not required for Work 0020 if OpenAI passes native qualification. No automatic failover is permitted.

## Current classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_NATIVE_RUNTIME: BLOCKED — OPENAI_SYNC_FAILED
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: NOT RUN native Web App
READY: NO
BLOCKER: OPENAI_SYNC_FAILED
```

Only one active dispatch may exist.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
