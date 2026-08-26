# Security and Information Handling Baseline

Current as of: 2026-08-26

Status: Active

This document defines the security and information-handling boundary for authoritative Google Workspace storage, the Apps Script Web App, Knowledge Export, and Gemini File Search.

Delivery policy: `docs/decisions/target-runtime-first-development.md`

Runtime policy: `docs/operations/runtime-policy.md`

## 1. Baseline requirements

1. Do not commit real Meeting content, Pitchbooks, non-public investment information, personal information, credentials, private URLs, organization-specific runtime IDs, or local mappings to GitHub.
2. Authoritative production data remains in organization-controlled Google Workspace / Shared Drive.
3. Do not create a durable dependency on personal Drive, personal API keys, or personally owned credentials.
4. Gemini File Search is derived/rebuildable and never replaces the Shared Drive source of truth.
5. Real confidential data may be sent to Gemini/File Search only through a company-approved Google Cloud/Gemini environment and an explicitly authorized Work.
6. Credentials are server-side only and never returned to browser code, stored in source files, user-facing Sheets, generated artifacts, or Audit.
7. Inactive sources are excluded from normal retrieval.
8. AI/Export output preserves traceability to authoritative Drive sources.
9. AI output is not automatically promoted to an official record or investment decision without source review.
10. AI failure never rolls back or corrupts authoritative registration/maintenance.
11. Runtime evidence uses isolated synthetic/anonymized data and segregated resources until production-data use is separately authorized.
12. Consequential effects remain disabled or guarded until their own authorization and evidence exist.

## 2. Target runtime is not production exposure

The actual Apps Script / Workspace / Web App runtime should be exercised early, but this does not authorize:

- production/confidential data;
- real users or broad Web App exposure;
- billing-enabled Gemini/File Search operation;
- installable triggers;
- external recipients;
- physical delete, bulk mutation, retention purge, or migration;
- irreversible permission changes.

Use synthetic/anonymized records and clearly segregated test folders, Spreadsheets, Docs, files, IDs, accounts, or namespaces. Read back exact target/resource identity before mutation.

A separate DEV/Staging runtime is not a security requirement by default. Use one only when isolation/guards in the target runtime cannot adequately address material legal, regulatory, tenant, segregation, blast-radius, rollback, concurrency, scale, cost, or platform risk.

## 3. Common access boundary

Initial Web App access is intentionally simple:

- only authorized organization users may access the Web App;
- authorized users share the accepted common access boundary across Active Meeting/Pitchbook sources;
- no per-user/per-GP/per-file retrieval ACL initially;
- internet-public access is not assumed;
- differentiated source permissions require a new explicit security/architecture decision.

The deployment target, executing identity, access setting, and version are read back before release or permission-changing operations.

## 4. Apps Script server-function boundary

In Apps Script HTML Service, an unprotected top-level function can be callable through `google.script.run`; naming with a `ksp` prefix or hiding a UI control is not an authorization boundary.

Only the canonical normal-user facade is browser-callable. Setup, validation, installation status, retention, manual sync, diagnostics, trigger handlers, raw Drive/Docs/Sheets adapters, credential helpers, and destructive operations remain private/editor-only.

Current normal-user facade:

```text
doGet
getMeetingBootstrapData / registerMeeting
getPitchbookBootstrapData / preparePitchbookBatch / uploadPitchbookFile
getPhase1MaintenanceBootstrapData
searchMeetingRecords / getMeetingMaintenanceRecord / updateMeetingMaintenance / changeMeetingStatus
searchPitchbookRecords / getPitchbookMaintenanceRecord / updatePitchbookMaintenance / changePitchbookStatus
mutateMaster / quickAddGp
getKnowledgeSearchBootstrapData / searchKnowledge
previewKnowledgeExport / createKnowledgeExport / getKnowledgeExportPrompt / recordKnowledgeExportPromptCopy
```

`scripts/validate-public-surface.cjs` runs through `npm run check` and must fail when an internal/destructive helper becomes public.

Public responses must not expose backend/Audit/folder/store IDs, credential state, private URLs, raw provider payloads, stack traces, source bodies beyond the authorized result, or administrator-only diagnostics. Use a fixed safe error catalog and non-sensitive error codes.

## 5. Project/resource identity and remote writes

Source parity alone does not prove the identity of the remote Apps Script project or Workspace resources.

Before synchronization, deployment, setup, migration, cleanup, or permission changes:

- read back the exact Script project/deployment/resource IDs;
- verify expected parentage, type, ownership/access, and bounded record/file counts where material;
- fail on ambiguous name-only candidates;
- use stored IDs first;
- do not silently fall back from required Shared Drive behavior to My Drive;
- do not store the verified identifiers in GitHub.

Production business helpers must exist in production source. A test loader or harness must not inject missing production-named behavior and then be treated as a security or readiness pass.

## 6. Web App execution and Actor attribution

Initial preference is execution as an organization-controlled deployer so backend permissions are centralized.

Actor resolution:

1. safe user email if available;
2. `TEMP_USER:<temporary active user key>` if available;
3. `UNIDENTIFIED`.

Rules:

- missing email/persistent identity must not block normal operations;
- a temporary key is neither a permanent identity nor authentication factor;
- Actor supports operational trace, not strict non-repudiation;
- the access boundary remains Google/Workspace permissions and Web App configuration.

Detailed decision: `docs/decisions/audit-access-and-user-attribution.md`.

## 7. Credentials and billing

Credentials must use:

- organization-approved ownership/provider;
- server-side-only storage;
- no hard-coded secret in repository;
- no browser return or user-facing Sheet exposure;
- a rotation/revocation route;
- least privilege appropriate to the approved architecture.

Billing-enabled Gemini/File Search target-runtime checks require explicit authorization, a synthetic/non-confidential source unless real-data use is separately approved, bounded call volume, and cost/rate-limit guardrails.

## 8. Master and record permissions

Accepted authorized-user operations:

- GP/Option Master add, rename, reorder, deactivate, reactivate;
- Meeting/Pitchbook create, search, update, deactivate, reactivate.

Controls:

- no normal-user physical deletion;
- rename/deactivate confirmation;
- stable IDs rather than row/order identity;
- optimistic locking for same-Meeting edits;
- short LockService critical sections;
- file-granular Pitchbook retry with duplicate prevention;
- bounded Audit event for material mutation.

Destructive cleanup, bulk changes, migrations, and retention purges require exact-ID/count boundaries, separate authorization, and rollback/safe-stop planning.

## 9. Audit policy

### Purpose

Audit supports operational trace, change history, AI-use trace, and failure investigation. It is not a strict non-repudiation system.

### Storage and access

- separate Spreadsheet under a Restricted admin-only control folder;
- no direct normal-user access;
- no initial Web App Audit Viewer;
- Google Drive permissions, not a custom password, form the access boundary;
- five-year retention with bounded authorized cleanup.

### Minimum events

- Meeting register/update/deactivate/reactivate;
- Pitchbook register/retry/update/deactivate/reactivate/failure;
- Master add/rename/reorder/deactivate/reactivate;
- AI index/re-index/remove/retry/failure;
- all Knowledge Search modes;
- Knowledge Export create/prompt-copy metadata;
- setup/migration/permission/trigger events when material.

### Data minimization

Allowed bounded metadata includes timestamp, Actor, operation, target stable ID/type, result, changed field names, safe before/after metadata where justified, Batch ID, filter/mode metadata, configured model ID, cited source IDs, and a safe error code/message.

Do not store:

- credentials or credential state;
- private runtime IDs/URLs not needed for bounded administration;
- source bodies or uploaded bytes;
- prompts/questions/additional instructions unless a separate approved requirement exists;
- generated answers;
- retrieved chunks;
- embeddings;
- raw provider payloads;
- stack traces containing sensitive state.

## 10. Knowledge Export derived-copy risk

Knowledge Export creates derived Google Docs/PDF artifacts that may include Meeting text and Pitchbook metadata/authoritative links.

Before production rollout, use isolated resources in the actual target runtime to establish:

- the exact destination folder and parentage;
- permission equivalence or a narrower access boundary than the source;
- link correctness and source-ID binding;
- retention/deletion/cleanup ownership;
- no unintended public/shared-link exposure;
- bounded count/character guards before expensive reads.

Automatic expiry, a new export database, and an export-management UI remain out of scope. Until an approved lifecycle exists, indefinite accumulation is an explicit operational risk.

## 11. Gemini File Search data handling

- Shared Drive is authoritative;
- File Search Store is derived/rebuildable;
- use Google-managed chunks/embeddings rather than duplicating confidential data into a custom vector system initially;
- Custom Metadata contains only stable identifiers/classifications/links needed for retrieval and citation;
- UI-only states such as `未選択` are not persisted;
- deleting a File Search Document must not delete the Shared Drive source;
- Inactive removes normal retrieval availability;
- Reactivate re-indexes the current authoritative source;
- sync/query failures are isolated from authoritative source operations.

## 12. Initial AI baseline

- one approved/configured Gemini Flash model;
- no user model selector or Deep mode;
- initial formats: `.pdf / .pptx / .xlsx / .docx / .txt / .eml`;
- original EML remains in Drive and normalized Subject/From/To/Cc/Date/Body is indexed;
- EML attachments are not automatically indexed;
- `.msg` is initially out of scope;
- 100MB/file support is not required;
- retry is bounded and idempotent;
- no duplicate active AI Document for the same current source revision.

## 13. Release blockers

Do not release AI search or production-data indexing unless the applicable items are established:

- company-approved Google Cloud/Gemini environment;
- safe server-side credential ownership/storage/rotation;
- approved common source-access boundary for intended users;
- retention/deletion handling for derived File Search data;
- citations/Drive links return to the correct authoritative source;
- Inactive sources are excluded;
- Audit Spreadsheet is inaccessible to ordinary users;
- AI failure cannot corrupt authoritative records;
- exact target/deployment/resource identity is verified;
- real data/users/billing/triggers/permissions are explicitly authorized;
- rollback/safe-stop route exists for the rollout.

User email availability itself is not a release blocker.

## 14. Validation and readiness

Report separately:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

Security logic validation includes public-surface enforcement, safe-error mapping, redaction, schema/ID invariants, authorization guards, bounded mutations, retry/idempotency, and Audit minimization.

Target-runtime security qualification includes actual deployment/access settings, project/resource identity, Shared Drive parentage/permissions, Web App/browser behavior, Audit restriction, generated-artifact permissions, Gemini credential/billing path, citation links, and authorized trigger behavior.

CI/mock/simulator/test-loader success is not proof of a target permission, identity, function, object shape, deployment, billing path, or access boundary it did not exercise.

## 15. GitHub data policy

Only production source, design/governance, and synthetic/anonymized test fixtures belong in GitHub. A fixture may use realistic labels only when it contains no confidential Meeting content, personal information, credential, private URL, organization-specific ID, or non-public deal information.

## References

- `docs/architecture/target-architecture.md`
- `docs/planning/apps-script-implementation-plan.md`
- `docs/operations/runtime-policy.md`
- `docs/decisions/target-runtime-first-development.md`
- `docs/decisions/audit-access-and-user-attribution.md`
- `docs/ai/gemini-file-search.md`
