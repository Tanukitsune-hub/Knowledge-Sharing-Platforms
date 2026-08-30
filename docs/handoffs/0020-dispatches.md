# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Active dispatch

### 0020-CODEX-18 — ACTION_REQUIRED

- mode: `REPAIR -> BUILD / QUALIFICATION`;
- purpose: close the narrow OpenAI citation/source-normalization blocker proven by CODEX-17, then finish the existing OpenAI primary qualification path;
- accepted CODEX-17 direct evidence: base model PASS, Vector Store PASS, synthetic upload/attributes/indexing PASS, exact `source_id` filter PASS, File Search execution PASS, grounded synthetic answer PASS, cleanup PASS;
- CODEX-17 blocker: the direct response did not expose a citation representation accepted by the current Knowledge Share normalizer;
- active hypothesis: retrieval succeeded but the qualification/parser accepted only one citation representation;
- CODEX-18 must explicitly request `include: ["file_search_call.results"]`, preserve valid `file_citation` annotations, and normalize exact/unambiguous retrieved-source evidence without overstating provenance;
- `INLINE_CITATION` and `RETRIEVED_SOURCE` provenance must remain distinguishable;
- filename-only identity is forbidden;
- provider Store/File IDs remain server-side only;
- direct synthetic provider control must PASS before any Web App/source delivery;
- after direct PASS, complete the accepted private-admin synthetic self-test, bounded OpenAI activation, Meeting/Pitchbook citation/source qualification, metadata filters, lifecycle, disable/re-enable, and final integrity;
- instruction: `docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-instruction.md`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- no Gemini live calls, provider failover, confidential DEV data, FULL_OUTPUT rerun, new Web App/Library/public debug endpoint, or current-main integration in this dispatch.

## Returned dispatch

### 0020-CODEX-17 — RETURNED / NARROW BLOCKER

- direct OpenAI provider path was exercised outside Apps Script;
- Control, Vector Store creation, synthetic TXT upload, attributes, indexing and exact filter all passed;
- File Search and synthetic grounded answer completed;
- required current Knowledge Share citation normalization failed with `OPENAI_CITATION_NORMALIZATION_FAILURE`;
- cleanup passed with no residual provider resources;
- Web App/source/deployment mutation was not performed;
- preserve this provider-viability evidence; do not repeat the entire provider investigation.

### 0020-CODEX-18 — RETURNED / DIRECT PASS, NATIVE QUALIFICATION ACTION_REQUIRED

- deterministic pre-fix no-annotation normalization failure reproduced;
- exact fail-closed OpenAI RETRIEVED_SOURCE normalization integrated while preserving INLINE_CITATION;
- direct synthetic OpenAI control passed with exact metadata, one normalized authoritative source, grounded answer, and verified cleanup;
- focused and canonical repository validation passed;
- existing Work 0020 Web App source was read back successfully and updated in place to version 56;
- the user completed private-admin connection in the existing Web App, which displayed active status, and one synthetic Meeting was registered;
- bounded Meeting/Pitchbook runtime qualification, lifecycle, and final runtime integrity remain pending; synthetic Pitchbook upload is blocked by the connected Chrome extension file-access setting;
- administrator source sync is explicitly scoped to OpenAI so this dispatch does not call Gemini;
- local OPENAI_API_KEY was not copied to Script Properties; no Gemini live call or provider fallback was used;
- report: docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md;
- PR #26 remains Draft / Open / unmerged.

~~~
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_SYNTHETIC_SELF_TEST: PASS deterministic / NOT RUN native
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS deterministic / NOT RUN native
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS direct synthetic and deterministic / NOT RUN native
OPENAI_METADATA_FILTER: PASS deterministic / NOT RUN native
OPENAI_LIFECYCLE: PASS deterministic / NOT RUN native
READY: NO
BLOCKER: ACTION_REQUIRED — CHROME_FILE_UPLOAD_PERMISSION_REQUIRED
GITHUB_CI_ACTUALLY_RAN: NO — no GitHub Actions run was returned for the pushed head
~~~

## Superseded dispatch

### 0020-CODEX-16 — SUPERSEDED / NOT EXECUTED

- CODEX-16 was prepared for direct Gemini same-project controls;
- before execution, the user chose OpenAI API as the active completion strategy because Google AI Studio itself was also repeatedly erroring;
- preserve the CODEX-16 handoff for history only.

## Accepted Gemini evidence retained

- CODEX-14 application request/lifecycle/UX work PASS; one Interactions + File Search job stayed pending for at least `600000ms`;
- CODEX-15 Generate Content + File Search returned a safe failure after `83364ms` with zero citations;
- Gemini document reconciliation and one earlier grounded Meeting query remain accepted evidence;
- Gemini recovery is deferred and is not a prerequisite for Work 0020 if OpenAI fully qualifies.

## Current Work classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: BLOCKED — narrow parser/provenance contract
OPENAI_RUNTIME: PARTIAL / PROVIDER PATH VIABLE
GEMINI_RUNTIME: BLOCKED / PROVIDER PATH DEFERRED
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

Only one active Codex dispatch may exist.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
