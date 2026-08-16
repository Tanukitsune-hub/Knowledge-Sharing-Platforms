# Work 0008 — Gemini File Search client, sync engine, and free question

WORK_ID: `0008`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: ChatGPT-owned implementation with local/mock executable verification for residual implementation work.

Recommended Codex model: `Luna Max` — the product architecture, source contracts, AI lifecycle, access model, and validation policy are settled; the residual task is bounded Apps Script implementation and fixture-based verification.

Starting ref: `a4515172d91dbdaeb7689311b5faaa657f31cd2d`

Target branch: `agent/0008-gemini-file-search-free-question`

Before starting, read every applicable `AGENTS.md`, identify the repository-specific subagent-use policy, and follow it. Use subagents actively and proportionately for independent API-contract review, sync/idempotency review, citation/audit review, UI review, and test review; subagent use is required, not optional.

## Outcome

Add the first code-complete AI retrieval path without making a live Gemini request. The application must contain a mockable Gemini File Search REST client boundary, a 15-minute synchronization engine for Meeting text and small TXT Pitchbook sources, deterministic metadata filters, idempotent AI document lifecycle handling, and a user-facing `自由質問` Knowledge Search page with citation-to-Drive mapping and metadata-only audit logging.

The implementation must be locally and contract-tested against fixtures. Apps Script deployment, credentials, File Search Store creation, live indexing, and live query qualification remain deferred to the final live-qualification Work.

## Already-Decided Design Choices

- Shared Drive and Google Docs remain authoritative; File Search is derived and rebuildable.
- Use one File Search Store initially.
- Use the Gemini File Search REST API through a thin Apps Script `UrlFetchApp` adapter.
- Use the Gemini Interactions REST endpoint for the current File Search query contract.
- The concrete Flash model ID remains configured through `AI_DEFAULT_MODEL`; no model selector is exposed.
- The credential provider is server-side only. The code may include a Script Properties reference adapter for DEV, but production credential storage remains subject to organization approval.
- Work 0008 indexes Meeting derived text and small `.txt` source files. The remaining source-format extraction paths are Work 0009.
- Custom metadata uses stable IDs for filters and includes source traceability fields.
- Only Active authoritative records are retrievable.
- AI lifecycle states remain `NotIndexed / Pending / Indexed / Failed`.
- Registration and maintenance success never depends on AI indexing success.
- Updates replace/supersede the current AI document without leaving multiple modeled active documents for the same source.
- Inactivation removes the derived AI document; reactivation returns the source to `Pending` for re-indexing.
- A 15-minute worker processes bounded Pending and retryable Failed work.
- `自由質問` is required text with optional Date From/To, GP, Asset Class, Equity/Debt, and Source Type filters.
- Responses contain grounded answer text plus citations mapped to authoritative source IDs and Drive links.
- AI query audit stores mode, question, filters, model, result, and cited source IDs, but not generated answer text, retrieved chunks, embeddings, or source contents.
- Live Gemini, Apps Script, Shared Drive, OAuth, and browser qualification remain deferred.

## Official External Contract

Use current primary Google documentation as the API contract, while keeping parsing tolerant of documented snake_case REST fields and SDK-style camelCase fixtures:

- Gemini File Search guide: `https://ai.google.dev/gemini-api/docs/file-search`
- File Search Stores REST reference: `https://ai.google.dev/api/file-search/file-search-stores`
- File Search Documents REST reference: `https://ai.google.dev/api/file-search/documents`
- Gemini Interactions API reference: `https://ai.google.dev/api/interactions-api`

At implementation time the official guide documents:

- `POST /v1beta/fileSearchStores` for Store creation;
- resumable `uploadToFileSearchStore` with `displayName`, `customMetadata`, `chunkingConfig`, and `mimeType`;
- File Search Document list/get/delete endpoints;
- `POST /v1beta/interactions` with a `file_search` tool, Store names, and optional metadata filter;
- citations in `model_output` text-block annotations of type `file_citation`, including file name/source and optionally custom metadata/page number.

Do not bind business logic directly to one transient response spelling; normalize external responses at the adapter boundary.

## Source of Truth

- `AGENTS.md`
- `src/AGENTS.md`
- `tests/AGENTS.md`
- `docs/ai/gemini-file-search.md`
- `docs/architecture/target-architecture.md`
- `docs/planning/apps-script-implementation-plan.md`
- `docs/operations/runtime-policy.md`
- `docs/governance/security.md`
- Work 0004–0007 implementation and completion reports

## Required Scope

1. Add AI configuration/constants and conservative default worker controls that remain overrideable through Settings.
2. Add a credential-provider boundary and Gemini REST client interface covering:
   - Store create/get;
   - direct resumable upload contract;
   - operation polling contract;
   - document list/delete;
   - Interactions File Search query.
3. Add pure request/response mapping for:
   - File Search Store creation;
   - upload metadata/custom metadata;
   - Interactions request;
   - operation/document normalization;
   - citation annotation normalization.
4. Add source adapters/models for:
   - Meeting authoritative Doc text;
   - Active `.txt` Pitchbook source bytes/text;
   - unsupported Work 0008 formats remaining `NotIndexed` or explicit non-retryable failure without affecting the source.
5. Add deterministic custom metadata including at least:
   - `source_type`, `source_id`, `date_key`, `gp_id`, `gp_name`, `asset_class_id`, `asset_class_name`, `capital_type_id`, `capital_type_name`, `drive_url`, `saved_filename`, and `content_hash`.
6. Add deterministic metadata-filter construction for Date From/To, GP, Asset Class, Equity/Debt, and Source Type. Omitted/`未選択` values must create no filter clause.
7. Add sync lifecycle logic covering:
   - bounded batch selection;
   - Pending and retryable Failed eligibility;
   - unchanged-content skip;
   - old-document deletion before replacement;
   - orphan/retry reconciliation by stable source metadata;
   - success → `Indexed` with document name/hash/timestamp;
   - retryable failure → structured `Failed` metadata with backoff;
   - permanent unsupported failure without infinite retry;
   - Inactive cleanup → derived document removed and status `NotIndexed`.
8. Implement `runAiSyncWorker()` and make the setup trigger registry recognize the handler as available.
9. Add Knowledge Search bootstrap and `自由質問` server service.
10. Add a Knowledge Search Web App page with free question, shared filters, loading/error/empty-evidence states, answer display, and source links.
11. Map citations through authoritative backend records. Prefer stable `source_id`; never trust an arbitrary external URL over the backend Drive URL.
12. Add AI query audit with best-effort Actor and non-blocking Audit failure.
13. Add fixture-based local tests for REST contracts, filters, citation mapping, sync state transitions/idempotency, retry/backoff, Inactive cleanup, audit redaction, and UI/static contracts.
14. Add concise implementation documentation and `docs/handoffs/0008-report.md`.

## Non-Goals

- Live Gemini API calls, credential issuance, or Store creation.
- Production credential-storage approval.
- `.pdf / .pptx / .xlsx / .docx / .eml` extraction/indexing implementation; Work 0009 owns these paths.
- EML parsing or attachment handling.
- `要約 / 時系列 / 比較 / 面談準備`; Work 0009 owns these presets.
- Custom Vector DB, embedding pipeline, Knowledge Graph, Agent framework, model router, or public-web grounding.
- Per-user/per-file retrieval ACLs.
- Physical source deletion or destructive Store reset.
- Full live 15-minute trigger observation.
- Reconsideration of accepted source, access, audit, or five-mode architecture.

## Acceptance Criteria

- External Gemini request/response logic is isolated behind a mockable boundary.
- Store/upload/operation/document/query fixtures map deterministically.
- Metadata filters are stable, escaped, and omit blank conditions.
- Meeting and small TXT source models produce traceable metadata and content hashes without changing authoritative records.
- Repeated sync for the same current revision produces one modeled active AI document.
- Update/re-index removes or supersedes the prior document and records only the current document reference.
- Inactive cleanup removes modeled retrieval availability.
- AI failure changes only AI status/error fields and never rolls back source records.
- Permanent unsupported paths are not retried forever.
- `自由質問` validates required question text and produces an Interactions request using the configured Store/model/filter.
- Response annotations map to unique citations and authoritative Drive links.
- Missing citations or insufficient evidence are surfaced without invented source links.
- Audit contains question/filter/model/result/cited source IDs but not answer or chunk text.
- Existing registration/maintenance surfaces remain present and syntactically compatible.
- All Work 0008 local fixture/static tests pass with no live Google/Gemini calls and no secrets committed.

## Required Validation Evidence

- Exact local commands executed.
- Apps Script/HTML/static parsing result.
- Test counts and observed results.
- Fixture evidence for Store/upload/Interactions/citation mapping.
- Sync evidence for first index, unchanged replay, replacement, retryable failure, permanent failure, and Inactive cleanup.
- Audit-redaction evidence.
- Diff review confirming no API key, answer text, retrieved chunks, source contents, or organization-specific IDs are committed.
- Confirmation that no live Google Workspace or Gemini request was made.

## Write Boundaries

Expected writes:

- `src/` AI client, sync, query, audit, entry-point, and client UI files.
- `tests/` fixtures and contract/service tests.
- minimal setup/Settings/trigger updates directly required by Work 0008.
- concise implementation documentation.
- `docs/handoffs/0008-report.md`.

Do not alter accepted product behavior outside Work 0008.

## Delivery

- Work only on `agent/0008-gemini-file-search-free-question`.
- Keep commits scoped and intentional.
- Open a Draft PR against `main`.
- Commit/push `docs/handoffs/0008-report.md` with the implementation.
- Link instruction and report in the PR description.
- Do not merge or deploy during this Work.

## Escalation Conditions

Escalate only if:

- current persistent contracts materially prevent safe idempotent AI synchronization;
- authoritative Google documentation contradicts the accepted File Search architecture;
- safe citation mapping requires trusting non-authoritative URLs;
- implementation would require credentials, live confidential data, destructive operations, or Work 0009+ scope;
- the accepted schema cannot represent retry state without material redesign.

Do not escalate because live Gemini qualification is deferred, a concrete Flash model ID is not yet chosen, Actor identity is incomplete, hosted CI is unavailable, or optional UX polish remains.

## Completion Report

Report:

- completed outcome;
- material files/components changed;
- exact validation executed and observed;
- branch, implementation commit, report commit, and Draft PR;
- blockers and non-blocking residual issues;
- limitations caused by deferred live qualification.
