# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-18 — READY

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
BALL: `CODEX`
STATUS: `READY`
