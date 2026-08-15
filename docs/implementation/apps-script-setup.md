# Apps Script scaffold and setup

Work ID: `0004`

## Runtime files

Apps Script source lives under `src/`.

- `00_Core.gs`: stable constants, pure utilities, schemas, seeds, Settings, trigger and bootstrap contracts
- `10_Setup.gs`: idempotent create/reuse/migration orchestration, validation and status contracts
- `20_LiveEnvironment.gs`: thin Apps Script adapters for Drive, Sheets, Properties, Lock and Triggers
- `99_EntryPoints.gs`: administrator-facing functions
- `appsscript.json`: V8 manifest and Advanced Drive Service declaration

## Administrator entry points

```text
setupKnowledgePlatform()
validateInstallation()
getInstallationStatus()
getBootstrapConfigTemplate()
```

The first setup reads Script Property `BOOTSTRAP_CONFIG_JSON`.

Example:

```json
{
  "environment": "DEV",
  "knowledgeParentFolderId": "REPLACE_WITH_SHARED_DRIVE_PARENT_FOLDER_ID",
  "controlFolderId": "REPLACE_WITH_RESTRICTED_CONTROL_FOLDER_ID",
  "adminEmails": ["admin@example.com"],
  "timezone": "Asia/Tokyo",
  "aiSyncEnabled": false
}
```

Do not place API keys or other credentials in this JSON.

After a successful setup, non-secret configuration and resource IDs are persisted in the backend Settings sheet and Script Property `KSP_INSTALLATION_STATE_JSON`; the bootstrap property is removed. Re-running setup uses the stored IDs and acts as the repair/migration path.

## Local validation

Local tooling is for developers/Codex only and is not a production prerequisite.

```bash
npm run check
```

The command parses every `.gs` file, validates `appsscript.json`, and runs Node standard-library tests with fake Google service adapters. It does not contact Google Workspace or Gemini.

## Deferred qualification

This Work does not create live folders, Spreadsheets, triggers, OAuth grants, deployments, or Gemini resources. Live qualification is intentionally deferred to the final qualification Work unless a platform-contract ambiguity blocks implementation.
