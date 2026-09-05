# Work 0027 — CODEX-03 citation identity repair

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-03
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary outcome

Finish the personal-DEV Gemini 3.7 File Search baseline by resolving returned citations to the correct Active authoritative source and current Gemini document/content identity. Preserve the CODEX-01/02 transport, retry, upload, cleanup and model-policy work. This is not another model-selection campaign.

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0027-gemini-file-search-resilience`
PR: `#37`, Draft/Open/unmerged
Reviewed implementation: `acd3aa08a3ecc01a7b0852afef8f58202934af82`
Reviewed CODEX-02 final ref: `0032a9cdb69cc1431566dee82f7e2c2196ddee50`
Main at review: `8c9be2392a1247ff81efc6a153fc0be449b1318b`

Verify current GitHub state and nearest AGENTS.md/AGENTS.override.md before editing. Do not discard newer work. This instruction supersedes the expired CODEX-02 model progression and mutation budgets; CODEX-02 remains RETURNED and must not be reused.

Route C. Recommended model: Sol High, because the actual citation shape must be reconciled with the shared source-authority contract before a narrow runtime repair. Do not use a fixed number of subagents; use independent review only when useful under applicable repository rules.

## Closed evidence and current blocker

The committed CODEX-02 report records:

- version 72; source readback 82/82; Root/Knowledge Search shell PASS;
- logic 440/440; bundle gates 27/27;
- 3.7 short Interactions HTTP 200, 1,470ms;
- 3.7 File Search HTTP 200, expected token present, one file_citation;
- query attempts 2, retries 1, cumulative sleep 501ms, total latency 34,992ms;
- strict identity/metadata check FAIL; 3.6 correctly NOT_RUN;
- temporary resources deleted and deletion confirmed;
- Gemini disabled/hidden, existing sources unchanged, OpenAI/FULL_OUTPUT live calls zero.

Preserve those observations. They are not a stability guarantee, company qualification, or proof that 3.8 is inherently broken. Current blocker remains `GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH` until the required evidence closes it.

## Review finding and active hypothesis

At the reviewed ref:

- `src/165_AiProviderAdmin.gs::kspGeminiQualificationCitationMatches_` requires `citation.source === documentValue.name` AND matching source_type/source_id/content_hash.
- `src/132_AiKnowledgeContracts.gs::kspNormalizeCitationAnnotation_` preserves source/file_name/custom_metadata but drops document_uri.
- `src/131_AiFileSearchContracts.gs::kspMetadataArrayToMap_` supports arrays and plain objects; whether the live form passes intact is not recorded.
- `src/150_KnowledgeSearchModels.gs::kspMapKnowledgeCitations_` has a strict OpenAI branch but a different, looser legacy path for Gemini. Fixing only the qualification predicate is not sufficient.
- Existing synthetic tests construct source equal to document.name. The report does not identify which individual equality failed.

Google's Interactions FileCitation schema has separate source, document_uri, file_name and custom_metadata fields. It does not specify that source is always the File Search Document resource name. File Search guide examples show metadata entries using key/string_value; the API reference also describes custom_metadata as an object. Documentation is not proof of the actual returned shape.

Active hypothesis: the returned 3.7 citation has usable identity evidence, but the application loses or misinterprets that evidence before applying an overly representation-specific equality check.

Confirm by identifying the failing field(s) and replaying an honestly sanitized, shape-faithful runtime fixture through the pre-fix code. If identity evidence is absent, contradictory, or genuinely names another source, do not assume this hypothesis is true and do not weaken acceptance.

Official references, recheck before implementation:
- https://ai.google.dev/api/interactions-api-v1
- https://ai.google.dev/gemini-api/docs/file-search

## Fastest safe decisive action: establish the actual shape first

1. Reuse already available sanitized CODEX-02 structural evidence when sufficient. Do not invent a fixture and call it observed evidence.
2. If insufficient, one diagnostic 3.7 File Search request is authorized in the existing personal-DEV Apps Script, using one tiny synthetic document and a new temporary Store. Use the unchanged production transport/upload/parser functions. Do not rerun Models or short-generation checks.
3. Compare raw annotation fields with the verified document and expected synthetic metadata within trusted runtime memory. Emit only an allowlisted structural summary: explicit annotation type; source/document_uri presence and kind; equality booleans; metadata representation; presence/type/equality of source_type/source_id/content_hash; candidate match count; raw-to-normalized field preservation; stage/HTTP/retry/elapsed evidence. Values, content and provider IDs must not leave that boundary.
4. Preserve an isomorphic fixture with invented non-sensitive IDs/values, preserving all missing fields, types, equality/inequality relationships and array/object structure. Keep it clearly labeled as sanitized runtime-shape evidence, not the original payload.
5. Cleanup the diagnostic Store in finally and confirm deletion before another Store is created. A diagnostic fixture capture is not successful qualification.

Diagnostic execution may use a private editor-only helper through the existing authorized execution path. Never add an unguarded browser-callable wrapper, monkey-patch production behavior, or expose raw traffic. At most one temporary diagnostic source staging is authorized; it creates no immutable version and does not update the Web App. Remove scratch helpers before final delivery.

## Minimal repair contract

Keep `gemini-3.7-flash / explicit low / 2048 / Interactions + File Search` fixed. No 3.6, 3.8, GenerateContent or cross-provider call is authorized.

Repair only the observed normalization/resolution gap, with one shared resolver used by qualification and the Gemini normal-result mapping path. Preserve the OpenAI strict mapping unchanged.

Required invariants:

- A real provider file_citation is required. Expected-answer token, filename, source order, one-document Store, or request filter alone is never identity evidence.
- Preserve source and document_uri as distinct fields; do not overwrite one with the other or claim their formats are equivalent without evidence.
- Normalize only documented/observed metadata shapes; preserve exact case-sensitive identity values. Do not stringify nested unknown objects into IDs or silently accept conflicting duplicate keys.
- Resolve to exactly one Active authoritative source with the current GEMINI-specific content hash and a uniquely bound provider document in the configured Store. Do not use another provider's hash as a substitute.
- A complete, exact source_type/source_id/content_hash metadata tuple may be used when it uniquely binds to a verified current Gemini document. A descriptive/opaque source field need not equal a resource name. An explicit contradictory canonical locator still rejects the citation.
- If metadata is absent but an observed, documented canonical provider locator unambiguously identifies a document in the configured Store, retrieve/verify that document server-side and use its metadata. Do not fetch arbitrary citation URLs, guess suffix/filename mappings, or fill in expected identity from the user's request.
- Missing evidence is not the same as contradictory evidence. Missing optional fields may be resolved only through a trusted exact binding; any conflicting supplied ID/type/hash, stale document, wrong Store, ambiguity or inactive source fails closed.
- Resolve and check conflicts before deduplication. A source_id-only dedup must not hide an inconsistent citation.
- Authoritative display links come from Index/source maps, never from untrusted model-provided URLs.

Use only the evidence path actually needed. Do not implement speculative universal citation adapters. If the raw citation contains no trustworthy resolvable identity, return a precise blocker with structural evidence rather than manufacture an association.

Likely source scope:
- `src/131_AiFileSearchContracts.gs`
- `src/132_AiKnowledgeContracts.gs`
- `src/150_KnowledgeSearchModels.gs`
- `src/165_AiProviderAdmin.gs`
- narrowly necessary plumbing in `src/160_AiEnvironment.gs`, `src/161_GeminiRestClient.gs`, or `src/164_AiProviderCore.gs` only if the verified resolution needs it;
- focused citation/qualification tests, sanitized fixture, generated dist artifacts and current Work tracking.

No unrelated retry/upload redesign, frontend redesign, embedding/chunk changes, migrations, credential rotation, billing/network changes, existing Store reindex, or company deployment.

## Required tests

First demonstrate the observed shape fails the old resolver. After the repair verify:

1. the shape-faithful fixture resolves to the intended source with exact current hash;
2. the same normalized citation passes both qualification and normal Gemini source mapping;
3. two different sources with the same display name cannot be confused;
4. wrong/missing-unresolvable/conflicting IDs, wrong type/hash/Store, stale state, inactive source and ambiguous bindings reject;
5. a correct token with wrong citation still fails;
6. metadata representation normalization and URI/source preservation match the observed shape;
7. conflicting annotations are not discarded before validation;
8. provider IDs, content, URLs and raw messages are absent from public results and durable evidence;
9. OpenAI citations, no fallback, source capture, FULL_OUTPUT and bundle/source contracts remain unchanged.

Run focused tests, `npm run check`, `npm run check:bundle`, agent foundation, secret scan and `git diff --check`. Regenerate dist reproducibly; never hand-edit the bundle. Do not claim these tests were run by ChatGPT.

## Final target-runtime confirmation and budgets

After the observed gap is repaired and deterministic checks pass:

- deliver the final exact production source once and read it back;
- create at most one immutable version, expected 73, and update the same private Web App once from 72 to 73;
- version 67 remains forbidden; version 74+ is forbidden;
- validate Root and Knowledge Search shell before the final provider test;
- run one new 3.7 File Search confirmation with one temporary Store and one tiny synthetic TXT;
- require HTTP success/completed answer, expected token, real citation and exact authoritative source binding through the same resolver used in normal Knowledge Search;
- verify source-link mapping using isolated synthetic source-map rows, not existing business records. Test doubles may supply isolated data, not missing/replacement business logic;
- delete the temporary Store/document in finally and confirm deletion.

Limits for the whole dispatch:

```text
CITATION_DIAGNOSTIC_LOGICAL_QUERY: <=1, only if retained evidence is insufficient
POST_FIX_CONFIRMATION_LOGICAL_QUERY: <=1
TOTAL_GENERATION_HTTP_ATTEMPTS: <=4, subject to existing narrower retry eligibility
MODELS_LIST: 0
SHORT_INTERACTIONS: 0
OTHER_MODELS_OR_TRANSPORTS: 0
TEMP_STORE_CREATIONS: <=2 sequential; max 1 active at a time
TEMP_DOCUMENT_UPLOADS: <=2 total; one per Store
DIAGNOSTIC_SOURCE_STAGING: <=1, private editor-only, no deployment
FINAL_SOURCE_DELIVERY: <=1 plus exact readback
NEW_IMMUTABLE_VERSION: <=1, expected 73
SAME_PRIVATE_WEB_APP_UPDATE: <=1
EXISTING_STORE_OR_SOURCE_MUTATION: 0
OPENAI_API: 0
FULL_OUTPUT_LIVE: 0
```

A successful diagnostic capture must be reused offline, not repeated. Preserve CODEX-01/02 safe retry rules; their maximums are ceilings, not promises of retry safety. Keep each runtime stage below a 240-second local scheduling budget, then begin cleanup with time reserved. Do not claim to cancel an already in-flight UrlFetch call at a precise wall-clock limit. Stop initiating work when the budget is exhausted; retain a private cleanup locator only in approved local/server-side state if a platform hard stop prevents finally. Cleanup uncertainty blocks completion and all new mutations.

If source/runtime identity has advanced, do not overwrite it or silently adopt another version budget. Return for a strategy reset.

## Acceptance, safe stops, and completion latch

Only this result satisfies Work acceptance:

```text
TERMINAL_OUTCOME: QUALIFIED_DISABLED
QUALIFIED_MODEL_ID: gemini-3.7-flash
RUNTIME_CITATION_SHAPE_EXPLAINED: YES
EXPECTED_TOKEN: PASS
AUTHORITATIVE_SOURCE_AND_GEMINI_HASH_MATCH: PASS
QUALIFICATION_NORMAL_PATH_PARITY: PASS
TEMP_RESOURCE_CLEANUP: PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
```

Persist only the exact qualified candidate with its evidence scope. Do not bind the deleted temporary Store as the application's configured Store. Personal-DEV synthetic PASS does not authorize company/confidential indexing or enable normal users.

Any unresolved citation ambiguity, absent trustworthy identity, application defect, provider failure or cleanup failure is a safe stop, not ACCEPTED. Preserve the precise stage and classification; do not rename this citation blocker into a provider limitation to close the Work. A new transient failure may be recorded as such but does not erase the unresolved citation evidence.

One evidence-led repair, one post-fix live confirmation. If the hypothesis is disproved, the same mismatch persists, or the budget is exhausted, preserve evidence and return for controller review. Do not branch into model sweeps or additional deployments. After success run one final consistency check and stop.

## Delivery

Keep PR #37 Draft/Open/unmerged; Codex must not merge. Commit/push scoped code/tests/fixture/dist and update this dispatch's report, current Work report, dispatch ledger, Work plan/registry, runtime locator and PR body consistently.

Report exact source/commit/deployment identity, per-field mismatch diagnosis without values, failing-before/passing-after evidence, actual tests, actual API attempts/latencies, mapping parity, cleanup confirmation, credential scan and remaining blocker. Retain historic reports unchanged.

Final response and report must begin and end:

```text
WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
```

For required user-native actions use BALL: USER / STATUS: ACTION_REQUIRED and keep this same Dispatch ID until that run returns.
