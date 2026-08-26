# Runtime Policy

Current as of: 2026-08-26

Status: Active

Authoritative delivery boundary: `docs/decisions/target-runtime-first-development.md`

Security boundary: `docs/governance/security.md`

Architecture boundary: `docs/architecture/target-architecture.md`

## 1. Operating principle

Knowledge Sharing Platforms runs as an organization-controlled Google Apps Script HTML Service Web App backed by Google Workspace resources and, when authorized, Gemini File Search.

The application should fail explicitly and safely rather than silently guessing resource identity, weakening integrity, or presenting partial failure as success.

Development and qualification use the actual target runtime and production source paths with isolated synthetic/anonymized data and guarded side effects. A separate DEV/Staging runtime is not the default and requires the material justification defined in `docs/decisions/target-runtime-first-development.md`.

Target runtime is not production data or rollout. Confidential data, real users, billing, triggers, broad exposure, destructive writes, migration, and permission changes remain separately controlled.

## 2. Runtime and resource identity

Target runtime includes:

- organization-controlled Apps Script V8 project
- final Web App execution/deployment shape
- Google Drive / Shared Drive / Sheets / Docs semantics
- supported browser behavior
- approved Gemini / File Search environment when that capability is in scope

Resource rules:

- stored exact resource ID first;
- exact-name lookup only when no stored ID exists;
- ambiguous candidates fail rather than guess;
- target IDs, parentage, count, and relevant status are read back before mutation;
- real IDs, private URLs, credentials, and organization-specific paths are never committed to GitHub;
- no silent fallback from required Shared Drive production behavior to My Drive.

## 3. Data and side-effect boundary

### Isolated test data/resources

- synthetic or appropriately anonymized data only;
- clearly identifiable test folder, Spreadsheet, Doc, file, record, stable ID, metadata, account, or namespace;
- no test rows/files mixed into authoritative production records;
- cleanup is bounded by exact IDs/parent/count and does not use broad name-only deletion;
- source/resource configuration changes require readback before execution.

### Consequential effects

The following are disabled, guarded, test-only, or explicitly enabled per Work:

- installable triggers;
- billing-enabled Gemini / File Search operations;
- confidential source indexing;
- real external recipients;
- broad Web App/user access or public exposure;
- physical delete / bulk update / retention purge;
- production data migration;
- irreversible permission changes.

Use dry-run, exact-ID allowlist, bounded count, inactive deployment, test recipient, idempotent setup, retry identity, and rollback routes where practical.

## 4. Web App execution and access

- Initial preference: Web App executes as the organization-controlled deploying account so backend access is centralized.
- Access is restricted to authorized organization users; internet-public access is not assumed.
- The exact normal-user browser-callable facade is allowlisted.
- Setup, status, validation, retention, manual sync, diagnostics, trigger handlers, raw adapters, and destructive helpers remain private or editor-only.
- `setupKnowledgePlatform_()` is never exposed through `google.script.run`.
- Deployment version/security changes require explicit Work authorization and exact target/deployment readback.

## 5. Setup and migration

Editor-only/private entry points:

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Setup behavior:

- create / reuse / forward-migrate / repair;
- idempotent by stable IDs and `SCHEMA_VERSION`;
- preserve user-mutated Masters, counters, records, files, and accepted configuration;
- append schema columns rather than reorder/delete durable data;
- seed by stable ID only when missing;
- trigger deduplication by handler + event type;
- no generic production reset or destructive teardown;
- trigger creation occurs only when the side-effect boundary authorizes it.

## 6. Actor and user identification

Actor resolution priority:

1. safe user email if available;
2. temporary active user key, stored as `TEMP_USER:<key>`;
3. `UNIDENTIFIED`.

Rules:

- missing email or persistent identity must not fail normal operations;
- a temporary key may rotate;
- Actor is operational trace, not strict non-repudiation;
- Audit may not store credentials, source bodies, prompts/answers, chunks, embeddings, or uploaded bytes.

## 7. Locking and concurrency

Use `LockService` only for short consistency-critical sections:

- ID counter increment;
- Pitchbook sequence reservation;
- Master mutation;
- one-time setup/migration state transition;
- trigger registry mutation;
- retention cleanup batch acquisition.

Do not hold locks during:

- file upload;
- Google Docs body generation;
- Gemini calls;
- long Drive operations;
- browser waiting;
- broad batch processing.

Meeting edits use optimistic locking through Version / Updated At. Return a clear conflict instead of silently overwriting.

## 8. Pitchbook retry and partial success

Each file has stable:

- Batch ID;
- Document ID;
- reserved sequence;
- retry identity.

Rules:

- successful files remain successful when another file fails;
- failed-file retry reuses identity and does not create duplicate Drive file or Index row;
- context move preserves Document ID and Drive File ID;
- physical cleanup occurs only when the target artifact is exact and bounded;
- no batch-level rollback that deletes successful authoritative records.

## 9. Audit

Audit is stored in a separate Restricted Spreadsheet under the configured control folder.

Minimum metadata:

- timestamp;
- Actor;
- operation;
- target stable ID;
- result;
- changed field names or bounded metadata;
- error category / safe message where applicable.

Retention:

- five years;
- periodic bounded cleanup;
- no normal-user direct access;
- initial Web App Audit Viewer is not required.

## 10. AI sync and provider behavior

AI indexing is asynchronous and never part of the authoritative source transaction.

States:

```text
NotIndexed / Pending / Indexed / Failed
```

Rules:

- authoritative Meeting/Pitchbook save succeeds independently of AI;
- worker processes bounded batches;
- retry uses exponential backoff / bounded attempts;
- permanent errors stop retrying;
- content hash prevents unnecessary duplicate indexing;
- Inactive removes retrieval availability;
- Reactivate re-indexes current source;
- answer path uses configured Flash model only and returns citations/Drive links;
- provider/client errors are normalized into safe application errors;
- billing-enabled target-runtime qualification requires explicit authorization.

## 11. UI and error handling

Normal UI receives concise actionable errors such as:

- required-field validation;
- duplicate Master;
- optimistic-lock conflict;
- upload size/count limit;
- inaccessible source;
- partial Pitchbook failure;
- AI temporarily unavailable;
- stale preview;
- permission/authorization required.

The UI does not receive secrets, raw Script Properties, internal stack traces, confidential source content beyond authorized output, or admin-only resource details.

## 12. Validation and readiness

Report separately:

```text
LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
READY: YES | NO
```

Logic validation covers algorithms, schemas, contracts, redaction, IDs, retries, and invariants.

Target-runtime qualification covers actual Apps Script / Workspace / browser / Gemini behavior that local harnesses cannot prove, using exact tested source and isolated data/resources.

A helper, function, API, permission, data shape, or service available only in a mock/test loader is not target capability. CI/mock/simulator/alternate-runtime PASS alone does not establish runtime readiness.

Run the smallest native create/persist/reopen/search/readback path early, fix incompatibilities, then expand the feature surface.

## 13. Production rollout

Production rollout is a separate authorized outcome and may require:

- approved target project / deployment / executing account;
- Shared Drive/control-folder permissions;
- production data/access boundary;
- approved credentials and billing route;
- trigger enablement;
- rollback and cleanup route;
- final security/permission/native evidence;
- user communication and operator documentation.

A feature Work may be complete while production data, users, billing, or triggers remain disabled when rollout is not its primary outcome.

## 14. Active and historical Work

- Active Work follows its committed handoff, dispatch register, and PR body.
- Work 0014 finishes or safely stops under PR #17's existing evidence boundary.
- New Work after Work 0014 applies target-runtime-first prospectively.
- Historical DEV/synthetic evidence remains valid only for the behavior actually observed; it does not prove unobserved Shared Drive, permission, billing, trigger, or production-data behavior.

## 15. Final operational principle

Prefer a narrow, explicit, inspectable production code path with early target-runtime readback over a parallel test environment that can drift from the actual Apps Script / Workspace system.

Preserve data, stable IDs, source traceability, restricted Audit access, safe errors, and explicit side-effect authorization before convenience or artificial test completion.
