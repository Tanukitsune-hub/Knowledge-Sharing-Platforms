# Work 0020 — CODEX-18 OpenAI citation normalization and primary qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `CODEX`
STATUS: `READY`
MODE: `REPAIR -> BUILD / QUALIFICATION`

## Objective

Close the narrow OpenAI blocker proven by CODEX-17: OpenAI Responses API + Vector Store + exact attribute filter + File Search + grounded synthetic answer completed successfully, but the qualification stopped because the response did not expose a `file_citation` shape that the current Knowledge Share citation normalizer accepted.

Do not treat this as an OpenAI File Search provider failure unless the provider evidence itself proves that retrieval/source identity cannot be established safely.

## Accepted CODEX-17 evidence

Preserve as closed evidence:

- direct OpenAI base-model control: PASS;
- temporary Vector Store creation: PASS;
- tiny synthetic TXT upload: PASS;
- exact safe attributes: PASS;
- indexing/readback: PASS;
- exact `source_id` filter: PASS;
- File Search request completed and produced the expected synthetic grounded answer;
- cleanup: PASS, no temporary provider resources left;
- no Web App/source/deployment mutation occurred;
- failure classification: `OPENAI_CITATION_NORMALIZATION_FAILURE` only.

CODEX-17 local report was returned after direct-provider qualification. GitHub source remains unchanged from the pre-CODEX-17 branch state unless this dispatch proves and implements a repair.

## Official response contract to support

Responses API may expose source evidence in two distinct places:

1. output-text annotations with `type: file_citation`, `file_id`, `filename`, etc.;
2. a `file_search_call` output item whose `results` can be requested with `include: ["file_search_call.results"]`; each result may expose `file_id`, `filename`, `score`, `text`, and Vector Store file attributes.

Knowledge Share must distinguish:

- `INLINE_CITATION`: provider emitted a `file_citation` annotation tied to generated text;
- `RETRIEVED_SOURCE`: File Search result identifies a source retrieved for the answer, with exact provider-file identity and exact Knowledge Share source metadata.

For the existing user-facing source list, either form may normalize to a Knowledge Share source reference only when source identity is authoritative and unambiguous. Do not falsely describe a search result as a character-level inline citation if no annotation exists.

## Active hypothesis

CODEX-17 retrieval succeeded, but the qualification/parser only accepted one citation representation. Requesting and normalizing `file_search_call.results` should allow authoritative source normalization without weakening fail-closed behavior.

## Required sequence

### Gate A — deterministic reproduction before production edit

1. Read the CODEX-17 local report/evidence if still available. Do not copy secrets or raw source content into GitHub.
2. Add/extend deterministic fixtures covering:
   - output-text `file_citation` annotation;
   - `file_search_call.results` with exact `file_id` + exact attributes;
   - both forms present;
   - no annotation but exactly one authoritative retrieved source;
   - zero retrieved sources;
   - multiple/ambiguous source identities;
   - retrieved result whose attributes disagree with requested source/filter;
   - duplicate results for the same provider file/source.
3. Demonstrate the pre-fix normalization failure for the no-annotation/authoritative-result fixture.

Do not edit production source unless the baseline regression reproduces.

### Gate B — minimal normalizer/request repair

If Gate A reproduces:

1. ensure the Responses request explicitly includes:
   `include: ["file_search_call.results"]`;
2. preserve annotation-first handling when valid `file_citation` annotations exist;
3. add a fallback normalizer for `file_search_call.results` that:
   - accepts only completed File Search output;
   - resolves provider `file_id` to exactly one derived/provider document;
   - requires authoritative source attributes needed by Knowledge Share (`source_type`, `source_id`, `content_hash` as applicable to the current contract);
   - deduplicates repeated chunks/results from the same provider file/source;
   - returns a source reference classification distinct from inline-annotation provenance;
   - fails closed on missing, conflicting, ambiguous, or stale identity;
   - never uses filename alone as identity;
   - never exposes provider Store/File IDs to the browser or Audit;
   - preserves existing Drive/source-link reconstruction and redaction rules.
4. do not introduce automatic Gemini/OpenAI fallback.

### Gate C — deterministic validation

Run focused tests plus the canonical repository checks required by the nearest AGENTS.md, including at minimum:

- citation normalization fixtures;
- exact-filter fixture;
- provider-neutral/public-surface validation;
- temporal validation;
- `npm run check`;
- `git diff --check`.

If deterministic validation fails, STOP. Do not make a live OpenAI call.

### Gate D — one direct synthetic OpenAI control

Only after Gate C PASS:

1. use local `OPENAI_API_KEY`; confirm presence only and never expose it;
2. create one temporary Vector Store;
3. upload one tiny synthetic TXT;
4. attach exact safe attributes including synthetic `source_type`, `source_id`, `content_hash`;
5. wait for indexing complete;
6. run exactly one Responses File Search query with exact `source_id` filter and `include: ["file_search_call.results"]`;
7. require:
   - expected grounded synthetic answer;
   - exactly one authoritative normalized Knowledge Share source after dedupe;
   - source identity agrees with the exact requested/filter metadata;
   - provider evidence classification recorded as annotation and/or retrieved-source, without overstating provenance;
8. clean up all temporary OpenAI resources and verify cleanup.

If Gate D fails, STOP and report the exact safe classification. Do not deploy the Web App.

### Gate E — application integration and final OpenAI qualification

Only if Gate D PASS:

1. integrate the repaired OpenAI citation normalization into the existing provider-neutral application path;
2. preserve the accepted zero-friction onboarding decision:
   - `APIキーを保存して接続確認` -> isolated synthetic self-test -> `READY_FOR_SYNC`;
   - no Meeting/Pitchbook source body read during the connection test;
   - `資料を同期して利用開始` -> explicit bounded real-source sync;
3. ensure failed/unqualified Gemini diagnostic transport is not the user-ready default;
4. deliver/read back exact tested Apps Script source once;
5. create at most one immutable Apps Script version and update the same private Web App in place once;
6. use only synthetic/non-confidential qualification sources;
7. qualify both Meeting and Pitchbook:
   - index/readback;
   - grounded answer;
   - at least one authoritative normalized source each;
   - exact metadata filters;
8. finish lifecycle gates:
   - update/reindex without duplicate;
   - Inactive exclusion;
   - Reactivate restore;
   - exact delete/rebuild;
   - disable/re-enable;
9. complete final five-sheet/schema/provider/Audit/settings/trigger/deployment integrity.

FULL_OUTPUT remains accepted and must not be rerun.

## Safety boundaries

- no confidential data in DEV qualification;
- no Gemini live calls;
- no automatic provider fallback;
- no second Web App/Library/public debug endpoint;
- no provider-resource leaks;
- no raw API keys or provider IDs in UI/Audit/reports;
- no filename-only citation/source normalization;
- no weakening of exact metadata/filter checks merely to pass qualification;
- no current-main integration during this bounded dispatch; leave PR #26 Draft/Open/unmerged for ChatGPT review.

## Required report

Create:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md`

Update:

- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR #26.

Commit and push all scoped changes.

Report at minimum:

```text
OPENAI_DIRECT_BASE_MODEL
OPENAI_DIRECT_FILE_SEARCH
OPENAI_CITATION_NORMALIZATION
OPENAI_RETRIEVED_SOURCE_NORMALIZATION
OPENAI_SYNTHETIC_SELF_TEST
OPENAI_MEETING_INDEX_QUERY_CITATION
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION
OPENAI_METADATA_FILTER
OPENAI_LIFECYCLE
LOGIC_VALIDATION
FULL_OUTPUT_RUNTIME
FINAL_INTEGRITY
READY
BLOCKER
FINAL_COMMIT
GITHUB_CI_ACTUALLY_RAN
```

The final chat response MUST begin before any other text and end with exactly the same identity block:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-18
BALL: CHATGPT
STATUS: RETURNED
```

If a genuine native user action is required, use `BALL: USER` and `STATUS: ACTION_REQUIRED` instead.

Missing either identity block is a reporting-contract failure.
