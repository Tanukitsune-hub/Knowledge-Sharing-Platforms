# Work 0010 — Final DEV live qualification and defect remediation

WORK_ID: `0010`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Codex implementation / executable qualification`, with ChatGPT retaining end-to-end ownership of scope, decisions, GitHub review, and completion.

Recommended Codex model: `Luna Max` — product scope and architecture are feature-frozen; the residual work is full-checkout validation, authenticated Apps Script / Google Workspace / Gemini execution, bounded defect repair, and evidence capture. Escalate to `Sol High` only if an observed cross-cutting runtime failure requires material architecture or root-cause reasoning beyond bounded execution/debugging.

Starting ref: `67ece97c1d5e0af946ed9308592f7926fd222bc0`

Target branch: `agent/0010-dev-live-qualification`

Before starting work:

1. Read every applicable `AGENTS.md` / `AGENTS.override.md` file.
2. Identify and follow the repository-specific subagent-use policy.
3. Use subagents actively and proportionately. Subagent use is mandatory, not optional. At minimum use independent perspectives for full-repository validation, Apps Script/Workspace runtime checks, Gemini/File Search contract checks, and security/audit evidence. Avoid overlapping write ownership and synthesize all findings before completion.
4. Do not place credentials, API keys, private source material, account identifiers, organization-specific resource IDs, or private URLs in GitHub, logs, reports, PR text, or chat.

## Outcome

Prove the feature-frozen initial product end to end in a DEV-only Google environment using synthetic or anonymized data, repair only defects actually observed during qualification, and produce a decision-useful readiness report.

The qualified workflow is:

```text
Apps Script setup
  -> Meeting / Pitchbook capture
  -> past-record maintenance / Master management
  -> separate restricted Audit Spreadsheet
  -> six-format AI synchronization
  -> five-mode Knowledge Search
  -> authoritative citations / Drive links
```

The primary DEV model for this Work is `gemini-3.6-flash`. The File Search Store embedding model remains `models/gemini-embedding-2`. These are current official production-ready / supported choices as of 2026-08-16. Do not add a user model selector or model router.

## Why Codex is needed

This Work requires capabilities that GitHub-only work cannot safely complete:

- a normal full repository checkout;
- executable full-suite validation;
- authenticated Google Apps Script and Google Workspace access;
- Apps Script project synchronization/deployment;
- live Drive / Sheets / Docs / trigger behavior;
- live Gemini File Search Store, upload, operations, Documents, Interactions, metadata filters, and citations;
- runtime debugging and bounded repairs based on observed evidence.

## ChatGPT-completed work

- Works 0004–0009 are merged to `main`.
- Feature-freeze merge commit: `67ece97c1d5e0af946ed9308592f7926fd222bc0`.
- Work 0009 reports 51/51 isolated AI-layer tests PASS with no live calls.
- PR #7 had no review comments or unresolved review threads and was merged.
- Current official Gemini documentation was rechecked before this handoff:
  - `gemini-3.6-flash` is GA and supports File Search;
  - `models/gemini-embedding-2` is the current multimodal embedding choice shown for File Search Stores;
  - the current REST path remains `/v1beta/interactions` with a `file_search` tool;
  - direct resumable Store upload remains supported.
- A connected Drive search found no existing Knowledge Sharing Platforms DEV resources, so do not assume a prior DEV installation exists.

## Execution environment

Use a user-owned DEV Google account/resource set and synthetic data only. Do not touch company production data.

Preferred qualification order:

1. Use a DEV Shared Drive if the authenticated account already has an appropriate disposable Shared Drive location.
2. If no DEV Shared Drive is available, complete the functional matrix in clearly named DEV-only My Drive folders and explicitly record Shared Drive-specific permissions/behavior as unobserved. Do not block all functional qualification solely because a disposable Shared Drive is unavailable.
3. Company-account deployment and company-approved credential replacement remain separate operational approval boundaries; do not claim them completed without direct evidence.

DEV Script Property use of `KSP_GEMINI_API_KEY` is permitted only as a temporary local qualification adapter. It is not the final production credential architecture. Never print or commit its value.

## Required scope

### 1. Full repository validation

- Obtain a normal checkout at the exact starting ref.
- Verify applicable `AGENTS.md` files and repository state.
- Run the canonical command:

```bash
npm run check
```

- Record the exact aggregate test count and observed result.
- Resolve implementation-caused failures before live deployment.
- Treat GitHub Actions quota/unavailability as non-blocking when local evidence is available.

### 2. Current API contract preflight

Compare the implemented REST contracts against current official Google documentation before sending confidential or material data.

Confirm at minimum:

- File Search Store create/get/list/delete paths;
- `models/gemini-embedding-2` Store configuration;
- resumable direct upload start/finalize headers and exact byte length;
- operation polling and Document extraction;
- File Search Document list/get/delete paths;
- `/v1beta/interactions` request shape;
- `file_search_store_names`, `metadata_filter`, and file-citation annotations;
- `gemini-3.6-flash` File Search support.

Make only the smallest compatibility changes required by current official contracts. Add regression tests for every change.

### 3. DEV Apps Script installation

Create or use a standalone DEV Apps Script project tied to a standard Google Cloud project. Use `clasp` when helpful, but runtime must remain Apps Script V8 plain JavaScript without a production dependency on Node, TypeScript, a bundler, or an external server.

Enable the Advanced Drive Service and underlying Drive API. Configure two distinct DEV parent folders:

- knowledge parent;
- restricted control parent.

Set `BOOTSTRAP_CONFIG_JSON` with DEV-only IDs and `aiSyncEnabled: false`, then run:

```text
setupKnowledgePlatform()
validateInstallation()
getInstallationStatus()
```

Rerun setup and prove idempotency: no duplicate folders, Spreadsheets, sheets, seeds, or triggers; counters and configuration are preserved.

Confirm:

- Backend and Audit are separate Spreadsheets;
- backend has exactly the accepted five baseline sheets;
- Audit access is restricted as far as the DEV environment permits;
- no source or secret is written into GitHub or logs.

### 4. Phase 1 live matrix

Use synthetic data to verify:

- minimal Meeting registration;
- full-field Meeting registration;
- authoritative Google Doc body and deterministic filename;
- modeled retry path and Version conflict;
- one-file Pitchbook registration;
- mixed multi-file success/failure;
- same-ID / same-sequence failed-file retry;
- past Meeting/Pitchbook search and detail;
- Meeting and Pitchbook update;
- Inactive / Reactivate;
- GP quick-add;
- GP and Option Master add/rename/reorder/inactivate/reactivate;
- best-effort Actor behavior;
- Audit metadata, before/after fields, and content redaction.

Test practical upload sizes incrementally. Do not begin at 25MB. Establish the highest reliably observed bound. If 25MB is impractical, lower the product limit to a simple safe value and update client/server constants, documentation, and tests. Do not introduce chunking, Cloud transport, or new architecture in this Work.

### 5. Gemini configuration

For DEV only:

- configure the temporary server-side credential adapter without exposing the credential;
- set `AI_DEFAULT_MODEL = gemini-3.6-flash`;
- use `AI_EMBEDDING_MODEL = models/gemini-embedding-2`;
- create or reuse one File Search Store;
- persist `GEMINI_FILE_SEARCH_STORE_NAME` through the existing settings path;
- run `getFeatureFreezeDiagnostics()`;
- enable AI sync and rerun setup to create/reuse the 15-minute trigger.

### 6. Six-format indexing matrix

Use small synthetic samples first:

- Meeting Google Doc text;
- PDF;
- PPTX;
- XLSX;
- DOCX;
- TXT;
- EML plain body;
- EML HTML fallback;
- EML with attachment exclusion;
- malformed or attachment-only EML.

For every supported path, verify as applicable:

- authoritative source remains intact;
- source reaches `Indexed`;
- custom metadata contains the stable source identity and filters;
- citation maps to the correct backend source and authoritative Drive URL;
- update replaces the current derived revision without duplicate active Documents;
- Inactive removes retrieval availability;
- Reactivate restores current content;
- malformed EML fails without indexing attachment/script/style noise;
- AI failure never rolls back or corrupts authoritative source capture.

### 7. Five-mode query matrix

Run all five modes through the same Store and filters:

- `自由質問`;
- `要約`;
- `時系列`;
- `比較`;
- `面談準備` with required GP.

Verify:

- mode-specific input validation;
- grounded output and insufficient-evidence behavior;
- mode-specific structure;
- correct citations and Drive links;
- common retrieval/citation path;
- actual mode, filters, model, result, and cited source IDs in Audit;
- no answer, retrieved chunk, normalized EML body, embedding, or source body in Audit.

### 8. Trigger, retry, and outage isolation

- observe at least one actual scheduled 15-minute worker execution, unless the environment cannot safely remain available long enough; if skipped, record the reason and directly execute the same handler after validating trigger creation;
- simulate a retryable Gemini failure without exposing credentials;
- verify bounded retry/backoff state;
- verify source claims avoid duplicate derived Documents;
- verify disabled sync is a no-op;
- verify AI outage cannot corrupt authoritative records;
- configure or document the separate Audit-retention trigger path.

### 9. Defect remediation and freeze discipline

- Fix only defects observed in the full local or live matrix.
- Add focused regression tests for each repair.
- Rerun affected cases plus one representative regression.
- Rerun the full matrix only if a common foundation changes materially.
- Do not add new product features, parallel systems, per-user ACLs, `.msg`, automatic EML attachment indexing, custom Vector DB, model selection UI, or new upload architecture.

## Acceptance criteria

- A normal full checkout passes `npm run check` with exact observed counts recorded.
- Setup runs live and is idempotent.
- Primary Meeting, Pitchbook, maintenance, and Master workflows operate end to end in DEV.
- Backend and Audit are separate; Audit is restricted to the extent supported by the selected DEV environment.
- A practical Pitchbook upload limit is observed and documented.
- All six accepted source formats have live indexing evidence, or a concrete format-specific BLOCKER is proven and isolated without damaging other workflows.
- All five modes execute through one shared retrieval path.
- Citations open the correct authoritative Drive sources.
- AI query Audit is metadata-only and content-redacted.
- AI failure cannot corrupt authoritative records.
- No secret or real confidential source is committed or logged.
- `docs/handoffs/0010-report.md` distinguishes PASS, FAIL, SKIPPED, BLOCKER, and environment-specific limitations.
- No unresolved implementation BLOCKER remains for the qualified DEV scope.

## Git / PR requirements

- Work only on `agent/0010-dev-live-qualification`.
- Keep commits scoped and intentional.
- Commit and push all defect repairs, tests, qualification documentation, and the final report.
- Write `docs/handoffs/0010-report.md` under applicable `AGENTS.md` rules.
- Open a Draft PR against `main`.
- Link both `docs/handoffs/0010-instruction.md` and `docs/handoffs/0010-report.md` in the PR.
- Do not merge until ChatGPT reviews the final diff, report, local results, and live evidence.
- Do not commit `.clasp.json` when it contains organization/project-specific identifiers unless an explicitly sanitized template is used.

## Stop / escalation conditions

Stop and report `BLOCKER` only when safe continuation is impossible, including:

- no authenticated Google account is available for DEV Apps Script execution;
- no Gemini API credential or billing-enabled DEV project is available;
- OAuth/organization policy prevents every viable DEV execution path;
- a current official API contract materially invalidates the frozen architecture;
- live behavior reveals a data-integrity or security defect that cannot be repaired within the accepted scope;
- continuing would require confidential production data, destructive production action, secret disclosure, or a new architecture.

Do not stop merely because:

- persistent end-user identity is unavailable;
- a DEV Shared Drive is unavailable but My Drive synthetic qualification can continue;
- 25MB must be reduced;
- hosted CI is unavailable;
- an optional UI refinement remains;
- company production approval has not yet been granted.

When blocked, finish all safely completable local and non-secret work, preserve evidence, classify the exact impact, and state the safest executable next action.

## Completion response

Return only:

- Work ID;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES/NO`;
- one-line blocker summary when applicable.
