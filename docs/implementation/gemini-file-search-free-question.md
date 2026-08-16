# Gemini File Search sync and free question

Work ID: `0008`

## Scope

Work 0008 adds the first AI retrieval path without making a live Gemini request.

Implemented source paths:

- Meeting: authoritative Google Doc text is uploaded as derived UTF-8 text.
- Pitchbook: Active `.txt` files are uploaded as derived UTF-8 text.
- Other accepted Pitchbook formats remain authoritative records but are marked `NotIndexed` with a permanent Work-0009 deferral reason until their extraction paths are implemented.

Shared Drive and Google Docs remain authoritative. File Search documents may be deleted and rebuilt.

## Server entry points

```text
runAiSyncWorker()
getKnowledgeSearchBootstrapData()
askKnowledgeQuestion(input)
```

`setupKnowledgePlatform()` temporarily marks `runAiSyncWorker` as an available trigger handler while executing the existing idempotent setup engine. Therefore a configuration with `aiSyncEnabled: true` can create or reuse the accepted 15-minute trigger without weakening the Work 0004 trigger-deduplication contract.

## Configuration

Backend `Settings` values:

```text
GEMINI_FILE_SEARCH_STORE_NAME
AI_DEFAULT_MODEL
AI_SYNC_ENABLED
AI_SYNC_INTERVAL_MINUTES
AI_SYNC_BATCH_SIZE
AI_MAX_RETRY_ATTEMPTS
AI_RETRY_BASE_MINUTES
AI_RETRY_MAX_MINUTES
AI_EMBEDDING_MODEL
```

The concrete Flash model ID is intentionally not hardcoded. It is supplied through `AI_DEFAULT_MODEL` during final DEV qualification.

The reference Apps Script credential provider reads Script Property:

```text
KSP_GEMINI_API_KEY
```

This is a server-side DEV/reference adapter only. Production credential storage must use the organization-approved provider selected during final qualification. Credentials are never returned to the browser or written to Sheets, source files, Audit rows, reports, fixtures, or GitHub.

## REST boundary

The live adapter isolates the external contract for:

- File Search Store create/get;
- direct resumable `uploadToFileSearchStore`;
- upload-operation polling;
- File Search Document list/delete;
- Gemini Interactions File Search query.

All business logic depends on normalized internal models. The adapter accepts documented REST snake_case and SDK-style camelCase response fields where relevant.

## Metadata

Derived AI Documents include:

```text
source_type
source_id
date_key
gp_id
gp_name
asset_class_id
asset_class_name
capital_type_id
capital_type_name
drive_url
saved_filename
content_hash
```

Blank optional metadata is omitted. Exact retrieval filters use stable IDs, not mutable display names.

## Synchronization

The worker:

1. seeds missing non-secret AI settings;
2. exits without mutation when sync is disabled;
3. creates/reuses one configured Store;
4. selects a bounded batch of Inactive cleanup, Pending, and eligible Failed work;
5. claims each source briefly through Script Properties;
6. reconciles existing File Search documents by `source_id` and `content_hash`;
7. deletes stale/duplicate derived documents;
8. uploads the current source revision when needed;
9. writes `Indexed / Failed / NotIndexed` AI fields only;
10. releases the claim.

Retryable failures use bounded exponential backoff. Permanent/deferred formats are not retried indefinitely. AI failure never rolls back authoritative registration or maintenance changes.

## Knowledge Search

The `自由質問` page is served from the same Apps Script Web App with `?page=knowledge`.

Filters:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Source Type

Blank values produce no metadata-filter clause. The query uses one configured Store and one configured Flash model.

Citation annotations are resolved by stable `source_id` against the backend Index. The external annotation URL is not used as the user-facing link. Only the authoritative HTTPS Drive URL stored in the backend is returned.

## Audit

Knowledge Search Audit rows include question, filters, configured model, result, short error, and cited source IDs.

They do not include:

- generated answer text;
- retrieved chunk text;
- embeddings;
- Meeting body text;
- Pitchbook contents or base64 payloads.

Actor and Audit-write failures remain non-blocking.

## Local validation

```bash
node --test tests/ai-contracts.test.cjs tests/ai-sync.test.cjs tests/ai-query-ui.test.cjs
```

The suite uses inline service fakes plus JSON fixtures under `tests/fixtures/file-search/`. It performs no network, Google Workspace, or Gemini call.

## Deferred live qualification

Work 0010 will provide real:

- approved credentials;
- Store/model configuration;
- Apps Script `UrlFetchApp` behavior;
- resumable upload and operation polling;
- Document list/delete behavior;
- 15-minute trigger execution;
- Interactions query and citation response;
- browser rendering and authoritative Drive-link verification.
