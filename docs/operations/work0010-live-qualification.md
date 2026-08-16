# Work 0010 DEV live qualification

Status: Accepted execution plan

Date: 2026-08-16

Starting ref: `67ece97c1d5e0af946ed9308592f7926fd222bc0`

Detailed execution contract: `docs/handoffs/0010-instruction.md`

## Goal

Prove the feature-frozen application end to end in a DEV-only Google environment, fix only observed defects, and determine readiness of the qualified DEV scope.

Use synthetic or anonymized data only. Do not use company production data or commit credentials, resource IDs, private source material, or organization-specific URLs.

## Current model choices

- Gemini answer model: `gemini-3.6-flash`
- File Search Store embedding model: `models/gemini-embedding-2`
- One shared File Search Store
- One shared retrieval / metadata-filter / citation path for all five modes
- No model selector or model router

`gemini-3.6-flash` is the Work 0010 DEV default because it is the current GA Flash model supported by File Search as of 2026-08-16. A different production model may be used only when company approval or current official support requires it, with the reason and evidence recorded.

## Environment boundary

Preferred environment order:

1. Disposable DEV Shared Drive and separate restricted control folder.
2. If no DEV Shared Drive is available, a clearly named user-owned My Drive DEV resource set may be used for synthetic functional qualification. Shared Drive-specific permission behavior must then be recorded as unobserved rather than inferred.

Company-account production approval, company Shared Drive confirmation, and final production credential architecture are separate operational boundaries. Do not claim them complete without observed evidence.

A temporary Script Property `KSP_GEMINI_API_KEY` may be used only for DEV qualification. It is not the approved production credential architecture and its value must never be printed, committed, or copied into reports.

## Qualification order

### 1. Full repository preflight

- obtain a normal checkout at the exact starting ref;
- read applicable `AGENTS.md` files;
- run `npm run check`;
- record the exact aggregate test count and result;
- compare implemented Gemini/File Search contracts with current official documentation;
- make only necessary compatibility fixes and add regression tests.

### 2. Installation

Create or use a standalone DEV Apps Script project tied to a standard Google Cloud project. Enable Advanced Drive Service and the underlying Drive API.

Configure `BOOTSTRAP_CONFIG_JSON` with DEV-only parent folder IDs and `aiSyncEnabled: false`, then run:

```text
setupKnowledgePlatform()
validateInstallation()
getInstallationStatus()
```

Rerun setup and prove no duplicate folders, Spreadsheets, sheets, seeds, or triggers. Confirm counters and future configuration are preserved.

Confirm Backend and Audit are separate files and that Audit access is restricted as far as the selected DEV environment supports.

### 3. Phase 1 workflows

Validate with synthetic data:

- minimal and full-field Meeting registration;
- authoritative Google Doc text and deterministic filename;
- retry and Version conflict;
- one-file and mixed multi-file Pitchbook registration;
- failed-file retry with stable Batch ID / Document ID / sequence;
- past search, update, Inactive, Reactivate;
- GP quick-add and GP/Option Master mutations;
- best-effort Actor observation;
- Audit metadata and content redaction.

Test upload sizes incrementally. If 25MB is not reliable, lower the product limit to the highest simple safe value and update client/server constants, tests, and documentation. Do not add chunking or another upload runtime in this Work.

### 4. Gemini configuration

- configure the temporary DEV credential adapter without exposing its value;
- set `AI_DEFAULT_MODEL = gemini-3.6-flash`;
- set `AI_EMBEDDING_MODEL = models/gemini-embedding-2`;
- create or reuse one File Search Store;
- persist `GEMINI_FILE_SEARCH_STORE_NAME` through the existing Settings path;
- run `getFeatureFreezeDiagnostics()`;
- enable AI sync and rerun setup to create/reuse the 15-minute trigger.

### 5. Six-format indexing matrix

Use small synthetic samples first:

- Meeting Doc text;
- PDF;
- PPTX;
- XLSX;
- DOCX;
- TXT;
- EML plain body;
- EML HTML fallback;
- EML with attachment exclusion;
- malformed or attachment-only EML.

Verify:

- authoritative source remains intact;
- supported source reaches `Indexed`;
- citation maps to the correct backend source and Drive URL;
- update replaces the current derived revision without duplicate active Documents;
- Inactive removes retrieval availability;
- Reactivate restores current content;
- malformed EML does not index attachment/script/style noise;
- AI failure never changes authoritative registration or source files.

### 6. Five-mode query matrix

Run all modes through the same Store and filters:

- 自由質問;
- 要約;
- 時系列;
- 比較;
- 面談準備 with required GP.

Check grounded output, insufficient-evidence behavior, citation accuracy, authoritative Drive links, mode-specific structure, and Audit fields. Confirm no answer, retrieved chunk, normalized EML body, embedding, or source body is copied to Audit.

### 7. Trigger and recovery

- observe one real 15-minute worker execution when practical;
- otherwise verify trigger creation and directly execute the same handler, recording the scheduled-run limitation;
- simulate a retryable failure;
- confirm bounded retry/backoff state;
- confirm source claims do not create duplicate derived Documents;
- confirm disabled sync is a no-op;
- confirm or document the separate Audit-retention trigger path.

## Validation discipline

Use targeted reruns while fixing defects. Rerun affected cases plus one representative regression. Repeat the full matrix only when a shared foundation changes materially.

GitHub Actions unavailability alone is not a blocker. Record every check actually run and every skipped check.

Do not expand the feature-frozen scope during qualification.

## Completion conditions

- normal full checkout passes `npm run check` with exact observed counts;
- setup is live and idempotent;
- primary Meeting, Pitchbook, maintenance, Master, sync, and search workflows work end to end in DEV;
- practical upload limit is observed and documented;
- six accepted formats have live evidence or a concrete isolated format-specific blocker;
- five modes use one retrieval path;
- citations open correct authoritative sources;
- Audit remains restricted to the extent supported by the selected DEV environment and content-redacted;
- AI failure cannot corrupt authoritative records;
- no secret or real confidential source is exposed;
- `docs/handoffs/0010-report.md` clearly distinguishes PASS, FAIL, SKIPPED, BLOCKER, and environment-specific limitations;
- no implementation blocker remains for the qualified DEV scope.
