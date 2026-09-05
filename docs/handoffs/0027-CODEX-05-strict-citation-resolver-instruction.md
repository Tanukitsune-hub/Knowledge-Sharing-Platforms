# Work 0027 — CODEX-05 strict Gemini citation resolver

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-05
BALL: CODEX
STATUS: READY
MODE: BUILD

## Work contract and strategy reset

Primary outcome: repair the now-observed Gemini citation identity contract in the shared product path, then qualify one personal-DEV 3.7 File Search answer against an independently read-back current synthetic document. Preserve authoritative source binding; do not merely relax the old equality until a test passes.

CODEX-04 completed INVESTIGATION. This dispatch returns to BUILD because the response representation is now known. Do not repeat evidence recovery or open a model/transport investigation.

Route C. Recommended model: Sol High, for the shared qualification/normal-search citation trust boundary. ChatGPT owns acceptance and merge.

Fastest safe decisive action: reproduce the old source-as-Document-ID failure with the recovered sanitized fixture, implement the one shared strict resolver, run focused and canonical checks, then perform one authorized guarded runtime confirmation.

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0027-gemini-file-search-resilience`
PR: `#37`, Draft/Open/unmerged
Reviewed CODEX-04 final: `18226013d6f98a5cb2bffdf72ced52e766a8b698`
Main at review: `8c9be2392a1247ff81efc6a153fc0be449b1318b`

Start from the PR head containing this instruction. Verify the execution ref supplied by ChatGPT and preserve newer work; do not reset or force-push.

Read applicable AGENTS files, `docs/operations/apps-script-web-app-deployment.md`, current dispatch ledger/Work report/runtime locator, and the exact CODEX-04 report and fixture:

- `docs/handoffs/0027-CODEX-04-evidence-recovery-and-quota-preflight-report.md`
- `docs/handoffs/0027-CODEX-04-sanitized-citation-shape.json`

## Closed evidence and its limits

- CODEX-02: 3.7 File Search HTTP 200, expected token, one normalized citation; exact identity check failed. Three equivalent raw annotations were later recovered. Version 72 shell and 82/82 source readback were reported PASS.
- CODEX-04: `source` is content text, `document_uri` is the requested Store, and `custom_metadata` is an object containing source_type/source_id/content_hash. Comparing that content-valued source with Document.name is invalid for this observed shape.
- The old upload/readback Document name remains UNAVAILABLE. Do not reconstruct it or retroactively mark CODEX-02 qualified.
- A hash relationship after removing one trailing newline was a diagnostic observation about the small old fixture, not a production identity rule. Retrieved chunks need not equal the entire source file.
- CODEX-04 quota at 2026-09-05 11:05 JST showed Free tier, last-hour RPM 3/5, TPM 394/250000, RPD 3/20. This is historical headroom, not a reservation or proof of the earlier 429's cause/reset.
- The ordinary guarded administrator Web App route was available, not invoked. CODEX-03's temporary invocation interception was noncompliant and must not be repeated.
- Work 0026 and accepted OpenAI/FULL_OUTPUT, source capture, model policy, structured search and installer boundaries remain closed.

## Decided repair contract

### Citation representation

For the observed Interactions file_citation shape:

1. Preserve document_uri separately from source. Require a genuine file_citation annotation; do not turn arbitrary text/unknown annotation types into file citations.
2. Treat source as excerpt/content, never as a Document ID, URL to fetch, canonical full document, or authorization signal. Keep any necessary content transient; never export it in diagnostics, Audit, public state or reports.
3. Normalize custom_metadata in the observed object form and existing supported array form. For the identity keys, reject missing, invalid or conflicting values rather than silently overwriting or filling them from the request.
4. Keep exact source_type, source_id and content_hash. Do not use filename, token, selected filter, title or the fact that a Store has one document as identity evidence.

### Shared strict resolution

Use the same Gemini resolver in qualification and normal Knowledge Search result processing, including immediate and polled completion. Do not fix only the qualification predicate.

The resolver must establish all of:

- document_uri denotes exactly the trusted Store from server-side request/configuration; a returned Store alone is not document identity;
- source_type + source_id select one Active authoritative source in the authorized source context;
- the returned metadata hash equals the current expected Gemini content hash for that source, never an OpenAI hash or a hash guessed from the returned excerpt;
- an independently obtained current provider-document readback/verified lookup in that Store identifies exactly one Active document for the source and matching hash;
- any authoritative stored Gemini document reference, when present, agrees with that resolved document;
- output title/link/source identity come from the authoritative source context, not the model's text or file_name.

Reuse the existing bounded read-only adapter and per-request context. Do not introduce a new database, full-store reindex, general cache service or speculative URI conversion. Never send credentials to a URI supplied by an annotation. If a lookup is capped/incomplete, do not call it unique. Ambiguous or conflicting current documents fail closed.

Preserve differing annotations until identity validation: the existing source_id-only early deduplication must not hide a conflicting Store/hash/source identity. Equivalent valid repeats may be deduplicated after resolution; the observed three equivalent annotations should yield one source citation. A conflicting annotation must not be accepted just because another annotation matches.

The stricter Gemini branch must not fall through to the legacy metadata-only/source-text lookup. Preserve OpenAI citation behavior and existing source-scope/comparison guards. Do not add automatic model/provider fallback.

### Scope

Likely focused files/functions:

- `src/132_AiKnowledgeContracts.gs`: citation normalization and Interactions parsing/deduplication;
- `src/150_KnowledgeSearchModels.gs`: authoritative mapping and the shared Gemini resolver;
- `src/164_AiProviderCore.gs`: supply trusted Gemini context to normal result finalization;
- `src/165_AiProviderAdmin.gs`: replace the source-equals-Document predicate, use the shared resolver, retain safe per-field evidence and the fixed one-query qualification path;
- `src/131_AiFileSearchContracts.gs` and existing read-only adapters in `160_AiEnvironment.gs` / `161_GeminiRestClient.gs` only if needed for metadata conflict handling or complete bounded document readback;
- directly related tests and reproducibly generated dist artifacts.

No administrator-latch changes, installer interception, new unguarded facade, retry-framework redesign or unrelated refactor. Do not modify the recovered CODEX-04 report/fixture; add explicitly fictitious unit-test companion document/source context rather than inventing the old missing Document identity.

## Required validation

First reproduce the pre-fix failure with the recovered shape and an explicitly synthetic independently modeled document readback. Then prove:

- observed Store URI + content-valued source + object metadata resolves correctly;
- equivalent supported array metadata resolves without losing conflicts;
- Meeting and Pitchbook use the same pure identity contract;
- wrong Store, missing identity key, wrong source/type/hash, stale/inactive source, missing/ambiguous document and conflicting annotation reject;
- equal filenames or an answer token cannot rescue missing identity;
- OpenAI-only hash/state cannot qualify a Gemini citation;
- equivalent repeated annotations deduplicate only after validation;
- qualification and normal immediate/POLL finalization agree;
- no excerpt, private resource value or credential is included in safe diagnostics/public response/Audit;
- Gemini remains disabled/hidden; normal model/provider fallback stays absent.

Run focused checks, `npm run check`, `npm run check:bundle`, agent foundation, existing temporal/public-surface/security checks, bundle reproducibility and `git diff --check`. Counts must reflect actual execution, not inherited 440/440. Do not run tests against a business implementation invented inside a loader.

## Runtime identity, authorization and quota preflight

Follow `docs/operations/apps-script-web-app-deployment.md` before Apps Script mutation. Prove privately: exact Git source -> existing personal-DEV Script project -> remote source -> current immutable version 72 -> same deployment -> WEB_APP /exec -> USER_DEPLOYING / MYSELF -> intended signed-in administrator -> observed guarded page. If identities differ or cannot be established, freeze remote changes and return the precise prerequisite. Never print private IDs/URLs.

Use only the existing AI provider settings administrator action, through `mutateAiProviderSettings` -> `kspMutateAiProviderSettings_` -> the existing administrator guard -> private qualification helper. No temporary handler substitution, editor-picker workaround or guard bypass. A needed native sign-in is BALL USER / ACTION_REQUIRED within CODEX-05.

Before the live confirmation, inspect the same project's quota once, with at most one refresh. No Models/short-generation/API probe. Do not use the old headroom as current evidence; do not change billing/key/project. Avoid other same-project test runs during confirmation. If quota is exhausted or cannot be checked, retain the tested code and report confirmation pending; do not consume a probe to discover that.

## One final delivery and one qualification

After deterministic PASS and a viable guarded runtime path:

1. Deliver the exact repaired modular source once and read back all expected deployable files. Do not hand-edit the bundle or stage temporary diagnostic code.
2. Create at most one immutable version, expected 73, then update the same verified private Web App once from 72 to 73. Version 67 is prohibited; version 74+ and additional deployments are not authorized.
3. Verify root and Knowledge Search bootstrap, include expansion and absence of blocking console errors. If shell/readback fails, stop before provider mutation.
4. Through the guarded administrator action, create one temporary Store and one tiny non-confidential TXT. Generate its source identity/hash before the query; upload/index and independently read back its current Document name, metadata and Active state in memory.
5. Run exactly one logical File Search query with `gemini-3.7-flash / explicit low / 2048 / Interactions`. Do not repeat Models visibility or short generation; mark those stages NOT_RUN with references to accepted CODEX-02 evidence, not fresh PASS.
6. Require expected answer token plus a real file_citation resolved through the shared strict resolver. Exercise normal mapping on that same real response and independently constructed synthetic source context; no second model call or monkey-patched production helper. This proves synthetic normal-mapper parity, not a company deployment or real Drive-link permission test.
7. Preserve safe per-field results before cleanup: returned source category, Store equality, each metadata-key presence/equality, current Document readback/uniqueness/hash/Active match, raw and resolved citation counts, and qualification/normal-mapping parity. Do not retain original content/IDs; use a sanitized relationship-preserving fixture only if the shape differs.
8. In finally, delete the exact new temporary resources and confirm their absence, on success or failure. Do not assign the temporary Store as the app's configured Store or claim an existing Store qualified by the temporary test.

Only the exact passing 3.7 tuple may be recorded as QUALIFIED_DISABLED. GEMINI_ENABLED and normal-user visibility remain false pending ChatGPT review. Preserve store-specific activation gates and do not qualify 3.6/3.8 by association.

## Bounds and safe stops

- One coherent resolver repair; focused deterministic iteration is allowed, not a new live hypothesis campaign.
- New diagnostic queries: 0. Short generation/Models/3.6/3.8/GenerateContent/OpenAI/FULL_OUTPUT live: 0.
- Temporary Stores: <=1; TXT documents: <=1; no existing provider Store or business-source mutation.
- File Search generation: <=1 logical query, <=2 HTTP attempts total under existing replay safeguards. No ambiguous mutating replay. A 429 is not permission for a rapid extra campaign; honor valid Retry-After and stop if it cannot fit the existing wait budget. Do not alter global retry behavior merely for this run.
- Existing bounded GET/poll/delete retries apply. Cumulative retry sleep remains bounded; no new substantive provider call after 240 seconds of campaign time, reserving cleanup time. An in-flight GAS fetch is not claimed cancellable. Never intentionally run into the Apps Script execution ceiling.
- Source delivery/readback <=1; immutable version <=1 (73); same private Web App update <=1. No temporary source staging.
- Stop after the first failed final campaign, complete cleanup and retain implemented/tested work. A provider quota/transient failure must not be relabeled as proof that the resolver remains wrong or that runtime qualification passed.
- Unexpected citation shape contradicting CODEX-04, failed security/source-integrity check, uncertain runtime identity or cleanup failure requires a precise safe stop. Do not remove validation to close the Work.

## Completion and report

Acceptance evidence, strongest first: repaired personal-DEV live answer/citation with independent current document binding and shared normal-mapping parity; cleanup confirmation; exact source/version/shell evidence; recovered-shape and negative deterministic tests; canonical/bundle/security gates.

Only a fully evidenced QUALIFIED_DISABLED satisfies Work acceptance. A tested repair blocked from final confirmation is useful delivered work but not Work completion. Distinguish IMPLEMENTATION, LOGIC_VALIDATION, TARGET_RUNTIME_QUALIFICATION, CLEANUP, SIDE_EFFECT_STATE, READY and BLOCKER. Company credentials/permissions, large files, broad migration, cost optimization and further models are follow-ups, not this dispatch.

Update the CODEX-05 report, dispatch ledger, Work instruction/report, planning/registry, runtime locator and PR body. Preserve previous reports and missing-evidence labels. Record exact implementation/final commits, changed files, actually run tests, safe HTTP/retry/latency evidence and remaining blocker. Keep PR #37 Draft/Open/unmerged; Codex must not merge. Once acceptance is reached, perform one final consistency check and stop.

Reference schemas checked by ChatGPT on 2026-09-05:
- https://ai.google.dev/api/interactions-api-v1 (FileCitation fields are distinct; does not equate source with Document.name)
- https://ai.google.dev/gemini-api/docs/file-search (custom metadata and document read/list)
- https://ai.google.dev/gemini-api/docs/rate-limits (project-scoped limits; actual capacity not guaranteed)

Start and end the final return with WORK_ID 0027, DISPATCH_ID 0027-CODEX-05, BALL CHATGPT, STATUS RETURNED. After return a new execution requires CODEX-06.

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-05
BALL: CODEX
STATUS: READY
