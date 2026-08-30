# Work 0020 — CODEX-18 OpenAI citation normalization and primary qualification report

WORK_ID: 0020  
DISPATCH_ID: 0020-CODEX-18  
EXECUTION_REF: 8a65694dce137edf1991e14cafea739d6dded038  
BRANCH: agent/0020-ai-provider-core  
PR: #26 — Draft / Open / unmerged

## Outcome

The current no-annotation normalization failure was reproduced deterministically. The OpenAI normalizer now supports both valid output-text file_citation annotations and an exact fail-closed file_search_call.results retrieved-source path. Provider Store/File IDs remain server-side and are never used as UI or Audit source identities.

The direct synthetic OpenAI qualification passed. The repaired source was pushed to the existing Work 0020 Web App deployment and read back byte-for-byte after normalizing the Apps Script .gs/.js filename convention. Native private-admin onboarding and the subsequent native Meeting/Pitchbook lifecycle gates were not run because they require an authorized user to enter the key through the existing private Web App. No local key was copied to Script Properties.

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
focused provider/admin/contract tests: 48/48
focused query UI tests: 10/10
canonical repository tests: 315/315
temporal validation: PASS
public-surface validation: PASS
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
- the existing Work 0020 deployment was updated in place to version 55;
- no new Web App, Library, public debug endpoint, or deployment was created.

NOT RUN:

- native private-admin key entry and synthetic self-test;
- native bounded Meeting/Pitchbook sync and query citation evidence;
- native provider metadata/lifecycle sequence;
- final native integrity.

These checks require a user-authorized private Web App session. The Codex process local OPENAI_API_KEY was used only for direct OpenAI qualification and was never displayed, logged, committed, or copied to Script Properties.

## Required result fields

~~~
OPENAI_DIRECT_BASE_MODEL: PASS — accepted CODEX-17 evidence; not rerun
OPENAI_DIRECT_FILE_SEARCH: PASS — accepted CODEX-17 evidence plus CODEX-18 direct synthetic control
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_SYNTHETIC_SELF_TEST: PASS deterministic path; NOT RUN native Web App
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS deterministic path; NOT RUN native Web App
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS deterministic/direct synthetic path; NOT RUN native Web App
OPENAI_METADATA_FILTER: PASS deterministic/direct synthetic path; NOT RUN native Web App
OPENAI_LIFECYCLE: PASS deterministic path; NOT RUN native Web App
LOGIC_VALIDATION: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
FINAL_INTEGRITY: NOT RUN native Web App; repository/source-readback integrity PASS
READY: NO
BLOCKER: ACTION_REQUIRED — native private-admin qualification and bounded runtime lifecycle remain unobserved
FINAL_COMMIT: recorded in the final dispatch response
GITHUB_CI_ACTUALLY_RAN: to be recorded after push observation
~~~

## Scope controls

No Gemini live call, provider fallback, confidential data, FULL_OUTPUT rerun, current-main merge, filename-only normalization, weakened metadata check, or public endpoint was used. PR #26 remains Draft / Open / unmerged.

