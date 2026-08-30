# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
DISPATCH_STATUS: `ACTION_REQUIRED`
WORK_READY: `NO`
BLOCKER: `YES`

## CODEX-18 execution result

The current OpenAI no-annotation normalization gap was reproduced deterministically and repaired with an explicit file_search_call.results request, annotation-preserving INLINE_CITATION, and exact fail-closed RETRIEVED_SOURCE normalization. Retrieved-source identity requires provider file identity plus source_type, source_id, and content_hash; filename-only identity is not accepted, repeated results are deduplicated, and provider Store/File IDs remain server-side.

The direct synthetic OpenAI qualification passed with one temporary Vector Store, one tiny synthetic TXT, exact metadata, one exact-filter File Search query, one authoritative normalized source, grounded output, and verified cleanup. Focused tests, npm run check, temporal validation, public-surface validation, and git diff --check passed.

The repaired source was read back with 78/78 deployable files matching and updated in place on the existing Work 0020 Web App deployment at version 56. The user completed the private-admin connection flow and the existing Web App displayed active status; one synthetic Meeting was registered. Explicit administrator sync is now OpenAI-only. Native bounded Meeting/Pitchbook sync, lifecycle, and final runtime integrity remain pending; Pitchbook upload is currently blocked by the connected Chrome extension file-access setting. The local OPENAI_API_KEY was intentionally not copied to Script Properties. See docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md.

Latest classification:

~~~
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS — accepted CODEX-17 evidence
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_RUNTIME: PARTIAL — connection active; synthetic source sync/query pending
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
FINAL_INTEGRITY: NOT RUN native Web App
READY: NO
BLOCKER: ACTION_REQUIRED — enable Chrome extension file access for synthetic Pitchbook upload and resume bounded runtime qualification
GITHUB_CI_ACTUALLY_RAN: NO — no GitHub Actions run was returned for the pushed head
~~~

## Current classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_PROVIDER_RESOURCES: PASS — create/upload/attributes/index/filter/cleanup
OPENAI_GROUNDED_SYNTHETIC_ANSWER: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_SYNTHETIC_SELF_TEST: CONNECTION ACTIVE IN EXISTING WEB APP; SOURCE QUALIFICATION PENDING
OPENAI_MEETING_INDEX_QUERY: NOT RUN
OPENAI_PITCHBOOK_INDEX_QUERY: NOT RUN
OPENAI_METADATA_FILTER: DIRECT EXACT source_id FILTER PASS; app qualification pending
OPENAI_LIFECYCLE: NOT RUN
OPENAI_RUNTIME: PARTIAL — connection active; source sync/query pending
GEMINI_RUNTIME: BLOCKED / PROVIDER RECOVERY DEFERRED
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
SCHEMA_ALIGNMENT: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES — CHROME_FILE_UPLOAD_PERMISSION_REQUIRED
```

## CODEX-17 result

The user returned the CODEX-17 direct-provider result. CODEX-17 did not modify or deploy application source and did not push a new application commit.

Direct OpenAI evidence:

```text
Control: PASS
Vector Store create: PASS
synthetic TXT upload: PASS
safe attributes: PASS
index completion: PASS
exact source_id filter: PASS
File Search request: completed
synthetic grounded answer: completed
required Knowledge Share citation normalization: FAIL
classification: OPENAI_CITATION_NORMALIZATION_FAILURE
cleanup: PASS — no residual temporary provider resources
```

This is materially different from the Gemini blocker. OpenAI retrieval/provider execution reached a grounded answer. The remaining direct blocker is how provider source evidence is mapped into the Knowledge Share source/citation contract.

The CODEX-17 returned report is local evidence supplied by the user; because CODEX-17 did not push a report/commit, GitHub does not independently contain that returned report. Preserve that distinction.

## Official OpenAI evidence shapes relevant to CODEX-18

Responses output may expose:

1. output-text annotations containing `type: file_citation`, `file_id`, `filename`, etc.;
2. a `file_search_call` output item whose `results` are available when requested with `include: ["file_search_call.results"]`, including provider file identity, score/text and attributes.

The application must not equate these two provenance types silently.

Accepted Knowledge Share classifications:

```text
INLINE_CITATION
= provider emitted a file_citation annotation tied to model output

RETRIEVED_SOURCE
= File Search retrieved the source and exact provider/source metadata maps it uniquely back to Knowledge Share
```

A retrieved source may support the user-facing source list, but must not be represented as an inline citation when no annotation exists.

## Active CODEX-18

Instruction:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-instruction.md`

Fastest safe sequence:

```text
deterministic reproduction of current normalization gap
-> explicit file_search_call.results include
-> annotation-first + exact retrieved-source fallback normalizer
-> canonical tests
-> exactly one temporary synthetic direct-provider control
-> cleanup
-> only if PASS, application integration
-> private-admin isolated synthetic self-test
-> explicit bounded source activation
-> synthetic/non-confidential Meeting + Pitchbook index/query/source proof
-> metadata/lifecycle gates
-> final integrity
```

No Web App mutation is authorized before the direct synthetic control passes.

## Current source warning

The current pushed Gemini source from CODEX-15 still contains an unqualified diagnostic Generate Content default. PR #26 remains Draft / Open / unmerged. CODEX-18 must ensure the final user-ready provider selection does not treat that failed Gemini diagnostic path as qualified.

## Preserved accepted evidence

- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT PASS;
- provider-neutral no-auto-failover architecture;
- Gemini document reconciliation PASS;
- one earlier grounded Gemini Meeting query with three citations;
- CODEX-14 request/lifecycle/dedupe/reload UX evidence;
- CODEX-15 Gemini provider-path failure evidence;
- CODEX-17 OpenAI provider reachability/index/filter/grounded-answer evidence;
- GitHub-hosted CI remains absent; local/repository tests are not CI evidence.

## Problem classification

### BLOCKER

1. Chrome extension file access is required before the synthetic Pitchbook can be uploaded through the existing Web App.
2. OpenAI Meeting/Pitchbook application queries and lifecycle/final-integrity gates remain incomplete.
3. PR #26 cannot merge while the user-ready provider route is unqualified.

### FOLLOW_UP

- Gemini provider recovery after Work 0020 completes on OpenAI, if OpenAI qualifies.
- user-selectable reasoning level and representative latency benchmark in later Works.
- current-main integration after provider blocker closes and before final merge.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
DISPATCH_STATUS: `ACTION_REQUIRED`
WORK_READY: `NO`
BLOCKER: `YES`
