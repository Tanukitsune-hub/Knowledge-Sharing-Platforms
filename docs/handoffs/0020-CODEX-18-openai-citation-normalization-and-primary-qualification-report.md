# Work 0020 — CODEX-18 OpenAI citation normalization and primary qualification report

WORK_ID: 0020  
DISPATCH_ID: 0020-CODEX-18  
EXECUTION_REF: 8a65694dce137edf1991e14cafea739d6dded038  
BRANCH: agent/0020-ai-provider-core  
PR: #26 — Draft / Open / unmerged

## Outcome

The current no-annotation normalization failure was reproduced deterministically. The OpenAI normalizer now supports both valid output-text file_citation annotations and an exact fail-closed file_search_call.results retrieved-source path. Provider Store/File IDs remain server-side and are never used as UI or Audit source identities.

The direct synthetic OpenAI qualification passed. The repaired source was pushed to the existing Work 0020 Web App deployment and read back byte-for-byte after normalizing the Apps Script .gs/.js filename convention. The private-admin connection flow was subsequently completed by the user in the existing Web App; the UI displayed API key configured, Vector Store ready, and status active. One synthetic Meeting and one synthetic Pitchbook were registered. The explicit Meeting sync returned to an interactive state, but the explicit OpenAI-only Pitchbook sync ended with the safe UI state `エラー` after a bounded wait. Because the native synthetic source-sync gate failed, CODEX-18 stopped before application queries, lifecycle, or final native integrity. The explicit administrator sync path remains OpenAI-only, and no local key was copied to Script Properties.

## Gate evidence

### Gate A — deterministic reproduction

PASS:

~~~
PRE_FIX_REPRODUCED=true
answer_present=true
citation_count=0
~~~

This reproduces the prior blocker without changing the Web App or calling Gemini.

### Gate B — normalization repair

PASS:

- the live OpenAI File Search request explicitly includes file_search_call.results;
- valid output-text annotations are classified as INLINE_CITATION;
- result-only evidence is classified as RETRIEVED_SOURCE;
- identity requires provider file identity plus exact source_type, source_id, and content_hash;
- missing, conflicting, ambiguous, stale, or filename-only identity fails closed;
- repeated chunks/results for one source are deduplicated;
- normalized UI/Audit objects omit provider Store/File IDs.

### Gate C — deterministic repository qualification

PASS:

~~~
focused provider/admin/contract tests: PASS, including explicit OpenAI-only sync scope regression
focused query UI tests: 10/10
canonical repository tests: 316/316
temporal validation: PASS
public-surface validation: PASS — 30 public, 603 private top-level
git diff --check: PASS
npm run check: PASS
~~~

### Gate D — direct synthetic OpenAI qualification

PASS. One temporary Vector Store and one tiny synthetic TXT were used. Safe metadata was attached, indexing completed, exactly one File Search query used the exact source_id filter and the explicit results include, the grounded answer matched the expected synthetic fact, exactly one authoritative normalized source was recovered, and all metadata agreed. Temporary provider resources were deleted and cleanup was verified.

No second direct File Search query was issued after this PASS.

## Integrated application behavior

The source implementation preserves the onboarding sequence:

~~~
APIキーを保存して接続確認
-> synthetic self-test
-> READY_FOR_SYNC
-> 資料を同期して利用開始
~~~

The default application route is OpenAI, without automatic Gemini fallback. Explicit bounded sync is required before source activation. The deterministic test environment covers Meeting and Pitchbook source creation, exact metadata filtering, grounded citation mapping, update/reindex without duplicate sources, Inactive exclusion, Reactivate restore, delete/rebuild, and disable/re-enable.

## Target runtime delivery boundary

PASS:

- source push to the existing project completed;
- isolated source readback matched 78/78 deployable files;
- repository-only src/AGENTS.md was excluded from deployable parity;
- the existing Work 0020 deployment was updated in place to version 56;
- no new Web App, Library, public debug endpoint, or deployment was created.

OBSERVED:

- private-admin connection flow completed in the existing Web App; status displayed active;
- one non-confidential synthetic Meeting was registered in the existing Web App;
- one non-confidential synthetic Pitchbook was registered in the existing Web App;
- the explicit OpenAI-only Meeting sync was invoked once and returned to an interactive state;
- the explicit OpenAI-only Pitchbook sync was invoked once and ended in the safe UI state `エラー` after a bounded wait.

NOT RUN:

- native bounded Meeting/Pitchbook query citation evidence;
- native provider metadata/lifecycle sequence;
- final native integrity.

BLOCKED:

- `OPENAI_SYNC_FAILED` — native OpenAI-only Pitchbook sync ended in the generic UI error state after a bounded wait. The underlying provider/application error was not exposed safely, so no retry or deeper runtime action was taken.

These checks require a user-authorized private Web App session. The Codex process local OPENAI_API_KEY was used only for direct OpenAI qualification and was never displayed, logged, committed, or copied to Script Properties.

## Required result fields

~~~
OPENAI_DIRECT_BASE_MODEL: PASS — accepted CODEX-17 evidence; not rerun
OPENAI_DIRECT_FILE_SEARCH: PASS — accepted CODEX-17 evidence plus CODEX-18 direct synthetic control
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_SYNTHETIC_SELF_TEST: PASS — native connection flow reached active status and one synthetic Pitchbook was registered; native source-sync gate failed afterward
OPENAI_MEETING_INDEX_QUERY_CITATION: NOT RUN native Web App — stopped after native Pitchbook sync failure
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: BLOCKED — native OpenAI-only Pitchbook sync ended in generic ERROR; query not run
OPENAI_METADATA_FILTER: PASS deterministic/direct synthetic path; NOT RUN native Web App
OPENAI_LIFECYCLE: PASS deterministic path; NOT RUN native Web App
LOGIC_VALIDATION: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
FINAL_INTEGRITY: NOT RUN native Web App; repository/source-readback integrity PASS
READY: NO
BLOCKER: OPENAI_SYNC_FAILED — native OpenAI-only Pitchbook sync ended in the generic UI error state; CODEX-18 stop rule applied
FINAL_COMMIT: cd202d9 — scoped runtime-failure report and handoff update
GITHUB_CI_ACTUALLY_RAN: NO — no GitHub Actions run was returned for the pushed head
~~~

## Scope controls

No Gemini live call, provider fallback, confidential data, FULL_OUTPUT rerun, current-main merge, filename-only normalization, weakened metadata check, or public endpoint was used. After the native OpenAI-only Pitchbook sync failure, no query, lifecycle action, retry, or additional deployment was performed. PR #26 remains Draft / Open / unmerged.
