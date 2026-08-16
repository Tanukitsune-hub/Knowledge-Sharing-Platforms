# Work 0010 DEV live qualification draft

Status: Draft prepared at Work 0009 feature freeze

## Goal

Prove the feature-frozen application end to end in a DEV-only Google Workspace and approved Gemini environment, fix observed defects, and determine production readiness.

Use synthetic or anonymized DEV data only.

## Required administrator inputs

- DEV standalone Apps Script project
- linked standard Google Cloud project
- Advanced Drive Service / Drive API enabled
- DEV Shared Drive knowledge parent folder
- restricted DEV control folder
- approved Gemini API environment
- approved server-side credential configuration
- selected Gemini Flash model ID

Do not commit credentials, resource IDs, private source material, or organization-specific URLs.

## Qualification order

### 1. Installation

- configure `BOOTSTRAP_CONFIG_JSON` with DEV resource IDs and `aiSyncEnabled: false`;
- run `setupKnowledgePlatform()`;
- run `validateInstallation()` and `getInstallationStatus()`;
- rerun setup and prove no duplicate folders, Spreadsheets, sheets, seeds, or triggers;
- confirm Backend and Audit are separate files;
- confirm Audit file is restricted to administrators.

### 2. Phase 1 workflows

- Meeting minimal registration and full-field registration;
- authoritative Google Doc text and deterministic filename;
- Meeting retry and Version conflict;
- Pitchbook one-file and mixed multi-file registration;
- practical file-size test, starting below the accepted 25MB ceiling;
- failed-file retry with stable IDs and sequence;
- past search, update, Inactive, Reactivate;
- GP quick-add and GP/Option Master mutations;
- best-effort Actor observation;
- Audit metadata and redaction inspection.

If 25MB is impractical, lower the product limit to the highest reliably observed value. Do not add a new upload runtime unless a separate approved Work authorizes it.

### 3. Gemini configuration

- configure approved credential provider;
- set `AI_DEFAULT_MODEL` to the approved Flash model ID;
- create or configure one File Search Store;
- set `GEMINI_FILE_SEARCH_STORE_NAME`;
- run feature-freeze diagnostics;
- enable AI sync and rerun setup to create/reuse the 15-minute trigger.

### 4. Six-format indexing matrix

For each format, use a small synthetic sample first:

- Meeting Doc text
- PDF
- PPTX
- XLSX
- DOCX
- TXT
- EML plain body
- EML HTML fallback
- EML with attachment exclusion

Verify:

- exact source reaches Indexed;
- citation maps to the correct authoritative Drive source;
- update replaces current derived revision without duplicate active Document;
- Inactive removes retrieval availability;
- Reactivate restores current source;
- malformed EML fails without indexing attachment/body noise;
- AI failure never changes authoritative registration or source file.

### 5. Five-mode query matrix

Run all modes through the same filters and Store:

- 自由質問
- 要約
- 時系列
- 比較
- 面談準備 with required GP

Check grounded output, insufficient-evidence behavior, citation accuracy, authoritative Drive links, mode-specific format, and Audit fields. Confirm no answer/chunk/source body is copied to Audit.

### 6. Trigger and recovery

- observe one real 15-minute worker execution;
- simulate retryable failure and confirm bounded retry state;
- confirm source claim behavior does not duplicate derived Documents;
- confirm disabled sync is a no-op;
- confirm Audit retention trigger/operation can be configured separately.

## Validation strategy

Use targeted reruns while fixing defects. Rerun the full matrix only when a shared foundation changes materially.

GitHub Actions unavailability alone is not a blocker. Record every live check actually run and every skipped check.

## Completion conditions

- setup is idempotent live;
- primary Meeting, Pitchbook, maintenance, Master, sync, and search workflows work end to end;
- six formats and five modes have observed evidence;
- citations open the correct authoritative sources;
- Audit remains restricted and content-redacted;
- AI outage cannot corrupt authoritative records;
- practical upload limit is documented;
- no BLOCKER remains for approved production deployment.
