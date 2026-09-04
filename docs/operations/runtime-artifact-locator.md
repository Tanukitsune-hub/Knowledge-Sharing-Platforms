# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-04 JST
LAST_VERIFIED_BY: ChatGPT after Work 0026 final review and PR merge
STATUS: ACTIVE / Web App version 70 shell qualified; Gemini disabled on accepted external limitation

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- WORK_0021_MERGE_COMMIT: `533c849bd1229827ec77cd5ad6506312ea286940`
- WORK_0023_MERGE_COMMIT: `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`
- WORK_0026_MERGE_COMMIT: `40bb7d40506c0839c35742ee0000d89650ff7ad6`
- CURRENT_WORK_STATE: `0026 ACCEPTED`
- CURRENT_DISPATCH: `N/A`
- PR_36: `MERGED`

Do not record local workspace paths, private editor URLs, deployment URLs, Script IDs, deployment IDs, Google Drive/Spreadsheet IDs, provider Store/document resource names, credentials or signed URLs in this file.

## Current application runtime

```text
TARGET_RUNTIME_TYPE: Google Apps Script V8 / private Web App
ENVIRONMENT: personal DEV / qualification
DEPLOYMENT_VERSION: 70
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
KNOWLEDGE_PAGE_RENDER_AND_BOOTSTRAP: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
VERSION_67: unused / never deploy
VERSION_68: superseded / modular shell failed
VERSION_69: superseded / shell repaired
VERSION_70: current / shell PASS
VERSION_71_OR_HIGHER: not created during Work 0026
```

## Accepted provider baseline

### OpenAI / FULL_OUTPUT

```text
WORK_0020: ACCEPTED
OPENAI: production-capable reference path
FULL_OUTPUT: API-independent production-capable path
OPENAI_ACCEPTED_PATH_PRESERVED_IN_WORK_0026: PASS
OPENAI_API_CALLED_IN_FINAL_GEMINI_CAMPAIGN: NO
FULL_OUTPUT_RUNTIME_CALLED_IN_FINAL_GEMINI_CAMPAIGN: NO
```

### Gemini

```text
PRIMARY_CANDIDATE: gemini-3.8-flash / explicit low / max output 2048
TRANSPORT: Interactions + File Search
REQUEST_PROFILE: current server-resolved model/thinking/output/store policy
DOC-000017_CURRENT_DOCUMENTS: 1
MTG-000005_CURRENT_DOCUMENTS: 1
DOCUMENT_DUPLICATES: 0
FAILURE_CLASSIFICATION_REPAIR: PASS
UNKNOWN_FAILURE_RELABELLED_EXTERNAL: NO
FINAL_GEMINI_QUERY_CALLS: 1
PRIMARY_3_8_INTERACTIONS_CLASS: HTTP_OR_CREDENTIAL_FAILURE
SECOND_CONTROL: NOT_USED
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
```

This is an accepted fail-closed state and not a claim that Gemini File Search is operational.

## Work 0023 bundle/installer baseline

```text
DETERMINISTIC_SINGLE_FILE_BUNDLE: PASS
SOURCE_AND_BUNDLE_PARITY: PASS
INSTALLER_OWNER_LATCH: PASS
CROSS_USER_PARTIAL_TAKEOVER_REJECTION: PASS
DEPLOYMENT_SECURITY_ATTESTATION: PASS
WEB_APP_URL_ONLY_READY_REJECTION: PASS
MUTABLE_GLOBAL_COLLISION_GATE: PASS
PERSONAL_DEV_INSTALL_UPGRADE: PASS
IDEMPOTENT_RERUN_DUPLICATES: 0
```

Work 0026 preserved the bundle architecture while restoring `createTemplateFromFile(...)` specifically for modular Apps Script mode.

## Follow-up routing

- Separate future Work: representative large-file indexing qualification.
- Planned: historical-material migration.
- Planned: final company Shared Drive/domain-user/provider credential qualification and rollout.
- Future Gemini requalification requires materially new provider/account/API evidence and should not reopen Work 0026 by default.

## Update rule

Update this file whenever a material runtime version, accepted merge, provider qualification state or installation artifact changes.
Never store credentials, confidential source contents, private URLs/IDs or provider-private resource identifiers here.
