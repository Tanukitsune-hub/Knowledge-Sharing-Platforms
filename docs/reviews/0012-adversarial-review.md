# Work 0012 — Adversarial review

WORK_ID: `0012`

Review date: `2026-08-17`

Reviewed ref: `223ada09d1013ed16a6880b4b5c83de62a572e9b`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Status: `IMPLEMENTATION BLOCKER FOUND`

## Review objective

Adversarially review the current integrated product across product requirements, Apps Script security boundaries, data integrity, failure recovery, performance, audit behavior, tests, release evidence, and documentation consistency.

The review used GitHub `main` as the source of truth. It inspected the merged Work 0010 and Work 0011 changes, current source, tests, handoffs, planning documents, and PR/CI state. No claim is made that a fresh local test run was executed by ChatGPT; the current recorded deterministic suite is `147/147 PASS`, with no hosted CI evidence.

## Executive conclusion

The functional architecture is coherent and the Work 0011 feature matches the accepted product intent. However, the current Apps Script server-function exposure model contains a production-blocking security defect.

The repository assumes that a `ksp` prefix makes a function internal. That is incorrect for Apps Script HTML Service. A top-level server function remains callable through `google.script.run` unless its name ends in `_` or it is not declared at top level.

The current source therefore exposes internal functions and privileged administrator operations to any user who can load the Web App. At least two exposed helpers can directly overwrite or trash Google Drive content while the Web App executes with deployer privileges.

Do not approve a multi-user or production deployment until the public server surface is explicitly allowlisted and all other top-level functions are made private or non-top-level.

## Findings

### BLOCKER-01 — Internal Apps Script functions are callable from the browser

Severity: Critical

Evidence:

- `src/AGENTS.md` states that internal functions use the `ksp` prefix.
- Apps Script HTML Service treats top-level functions as client-callable unless the function name ends in `_` or the function is not top-level.
- The repository contains many top-level `ksp...` functions without a trailing underscore.
- `src/157_KnowledgeExportLiveEnvironment.gs` exposes `kspWriteKnowledgeExportDocument(documentId, model)`, which opens a Google Doc, clears its body, and writes caller-supplied content.
- The same file exposes `kspTrashKnowledgeExportFile(fileId)`, which moves the supplied Drive file to Trash.
- normal search responses expose the authoritative Meeting/Pitchbook file IDs needed to target those helpers.

Impact:

An authorized Web App user can bypass the intended UI and business-service boundary from browser developer tools. When the Web App runs as the deployer, the call executes with centralized owner permissions. This can overwrite authoritative Meeting Docs, trash source or export files, probe internal resources, bypass validation/audit, and invoke other unintended implementation helpers.

Required correction:

1. Define the exact allowlist of browser-callable facade functions.
2. Rename every other top-level function with a trailing `_`, or move it into a non-top-level namespace/closure.
3. Add a repository validator that parses all Apps Script function declarations and fails when a non-allowlisted top-level public function is present.
4. Add regression tests proving the destructive helpers and internal adapters are not client-callable.
5. Treat this as a production release blocker.

Reference:

- https://developers.google.com/apps-script/guides/html/communication#private_functions

### BLOCKER-02 — Privileged setup, retention, sync, and diagnostic operations have no browser authorization boundary

Severity: High

Evidence:

- `src/99_EntryPoints.gs` exposes `setupKnowledgePlatform`, `validateInstallation`, and `getInstallationStatus`.
- `src/90_WebApp.gs` exposes `runAuditRetentionCleanup` and `getPhase1Diagnostics`.
- `src/170_AiEntryPoints.gs` exposes `runAiSyncWorker` and `getFeatureFreezeDiagnostics`.
- `getInstallationStatus` returns stored resource IDs.
- `ADMIN_EMAILS` is stored as an administrative contact list and is explicitly described as not being an authentication mechanism.

Impact:

Any Web App user can rerun setup/migration, invoke retention deletion, manually trigger potentially billable AI synchronization, or retrieve infrastructure metadata. These operations are outside the normal-user UI contract.

Required correction:

- Make editor/trigger-only functions private to `google.script.run`.
- Keep normal-user facade functions public only when the UI needs them.
- Do not return backend, audit, folder, store, or credential-related identifiers through normal-user responses.
- Update trigger handler names and migration logic safely if private handler names change.
- Confirm in a deployed DEV Web App that privileged names are absent from the browser-callable surface while installable triggers still execute.

### FIX-SOON-01 — Knowledge Export preview performs unbounded Doc reads before applying count limits

Severity: High reliability / quota risk

Evidence:

- `kspRunKnowledgeExportPreview` resolves all matching rows and calls `kspMaterializeKnowledgeExportSources`.
- every matching Meeting Doc is read before `kspBuildKnowledgeExportLimitState` checks the 50-Meeting hard stop.

Impact:

A broad or filter-free request can read hundreds or thousands of Docs, exceed Apps Script runtime/service quotas, and fail before returning the intended hard-stop message. The UI limit is therefore not an effective server resource guard.

Required correction:

- Count matching Meeting and Pitchbook rows before reading Meeting Docs.
- If Meeting count exceeds 50 or Pitchbook count exceeds 200, return a hard stop without materializing all Docs.
- For requests within count limits, read at most the accepted Meeting maximum and compute the exact character count.
- Add a deterministic large-index test proving zero Doc reads after a count-based hard stop.
- Add a server-side execution/deadline guard for expensive preview/export work.

### FIX-SOON-02 — Public endpoints lack server-side throttling and idempotency protection

Severity: Medium-to-high operational risk

Evidence:

- client-side duplicate-request prevention exists, but direct calls can bypass it.
- preview repeatedly reads authoritative Docs and writes Audit rows.
- export can create repeated derived files.
- Knowledge Search can issue billable Gemini calls once enabled.

Impact:

An authorized user or malfunctioning client can consume Apps Script quotas, grow Audit rapidly, create duplicate exports, or generate avoidable Gemini cost.

Required correction:

- add bounded per-actor or per-temporary-key throttling for expensive public operations;
- add short-lived idempotency keys for export creation;
- retain the accepted best-effort Actor model and use `UNIDENTIFIED` as one shared throttle bucket when necessary;
- return safe retry-after responses without exposing internal state.

### FIX-SOON-03 — Export source links are origin-checked but not bound to authoritative file IDs

Severity: Medium data-integrity risk

Evidence:

- Meeting text is read from `Doc_File_ID`, while the displayed link comes separately from `Doc_URL`.
- Pitchbook output uses `File_URL` but does not prove that it identifies `File_ID`.
- URL validation only checks the `drive.google.com` / `docs.google.com` origin.

Impact:

A corrupted or inconsistent Index can export correct text with a wrong link, or list a Pitchbook link that does not match its stable File ID.

Required correction:

- derive canonical Drive/Docs links from the stable file ID or validate ID/URL agreement;
- verify accessibility and expected file type before artifact creation;
- reject the entire export on mismatch instead of silently emitting an inconsistent package;
- cover corruption cases in tests.

### FIX-SOON-04 — Generated Drive URLs are written as plain text rather than explicit hyperlinks

Severity: Medium usability / acceptance risk

Evidence:

- `kspWriteKnowledgeExportDocument` appends metadata and Pitchbook link lines as plain paragraphs.
- no explicit `Text.setLinkUrl` or equivalent link construction is used.

Impact:

Google Docs may auto-link URLs, but the implementation does not guarantee clickable links or bind link text to the intended target. The accepted UX requires authoritative Drive links.

Required correction:

- create explicit hyperlinks for Meeting and Pitchbook source links;
- add adapter tests for link ranges/targets;
- confirm in targeted DEV Docs and PDF output.

### FIX-SOON-05 — External-AI prompt exposes internal IDs instead of user-facing names

Severity: Medium usability

Evidence:

- `kspBuildKnowledgeExportPrompt` prints `gpId`, `assetClassId`, and `capitalTypeId` directly.

Impact:

A copied prompt can contain values such as `GP-000019` and `OPT-AC-003`, which are meaningful to the application but not to an external AI or human recipient.

Required correction:

- use current Master display names and optionally include the stable ID in parentheses;
- preserve stale/inactive names from the current source/index contract where necessary;
- add tests for readable prompts.

### FIX-SOON-06 — Raw implementation errors can be returned to normal users or written to Audit

Severity: Medium information-disclosure / operability risk

Evidence:

- `kspMaintenanceFailure`, Meeting/Pitchbook service failures, and some warning paths return or store raw `error.message` values.
- setup failure reports can include stack text and resource metadata.

Impact:

Drive/API errors may reveal internal identifiers, implementation details, or sensitive operational context. Error wording is also inconsistent across modules.

Required correction:

- map public errors to a fixed safe error catalog;
- keep detailed diagnostics only in restricted server logs where appropriate;
- redact resource IDs, URLs, source text, request bodies, credentials, and API payloads;
- add adversarial tests using synthetic secret markers.

### FIX-SOON-07 — Knowledge Exports retention and permission equivalence are not yet qualified

Severity: Medium information-governance risk

Evidence:

- exports contain duplicated full Meeting text;
- `Knowledge Exports` has no automatic deletion schedule or management UI by accepted design;
- setup validates only the parent folder, not permission equivalence with the authoritative source boundary;
- live Workspace validation was deferred in Work 0011.

Impact:

Derived copies can accumulate indefinitely or become more broadly visible after permission drift.

Required correction before production:

- confirm the export folder is no broader than the intended Web App/source access boundary;
- define a retention/deletion operating policy;
- record the derived-copy risk in the security and runtime documents;
- consider later automatic expiry or an export-management/delete flow as a separate backlog item.

### FIX-SOON-08 — Release-critical live matrices remain deferred

Severity: Production-readiness limitation

Still unobserved:

- browser-native Pitchbook upload/update/status flows and practical upload limit;
- real Knowledge Export Docs/PDF creation, folder placement, hyperlink behavior, Audit writes, and non-indexing;
- browser clipboard behavior;
- Gemini credential, File Search Store, six-format indexing, five-mode citations, trigger/retry/outage isolation;
- Shared Drive-specific behavior.

These do not invalidate the merged implementation, but they remain release blockers for the affected production functions.

### FIX-SOON-09 — Product and operating documents are materially out of date

Severity: Medium governance / execution risk

Examples:

- `README.md` and `docs/product/vision.md` still describe an implementation-ready planning phase.
- `docs/planning/mvp-and-roadmap.md` says Phase 1 and Phase 2 implementation have not started.
- `docs/architecture/target-architecture.md` ends at an obsolete Work 0010 sequence and omits Knowledge Export.
- root and source `AGENTS.md` refer to completed Work 0011 as active.
- `src/AGENTS.md` incorrectly equates the `ksp` prefix with privacy.

Impact:

Future agents can reopen settled design, miss merged behavior, or reproduce the public-function security defect.

Required correction:

Reconcile README, docs index, product vision, architecture, roadmap, runtime, security, decision log, and AGENTS files after the hardening implementation lands.

### FIX-SOON-10 — Application/version diagnostics are not release-coherent

Severity: Low-to-medium operability

Evidence:

- root `KSP_WORK_ID` remains `0004` and `KSP_APP_VERSION` remains `0.1.0` while schema and features have advanced through Work 0011.
- setup/status reports can therefore imply an obsolete application version.

Required correction:

Define a single release/application version policy distinct from component Work IDs, update setup/status diagnostics, and test migrations without resetting counters or user settings.

### BACKLOG-01 — Hosted final-only CI is absent

The repository has deterministic local tests but no `.github/workflows` and no hosted status checks. This is not a current implementation blocker under repository policy, but a minimal final-only `npm run check` workflow would improve independent evidence before production releases while preserving the low-usage CI policy.

### BACKLOG-02 — Derived export lifecycle management

Accepted initial non-goals remain sensible, but future value exists in:

- export history;
- manual delete/cleanup;
- optional retention expiry;
- scheduled exports;
- item-by-item source selection;
- ZIP packaging.

Do not add them to Work 0012 unless required to close a security or data-integrity defect.

## What appears sound

The following core decisions remain coherent and should not be reopened without new evidence:

- Shared Drive / Google Docs as authoritative sources;
- five-sheet Backend plus separate restricted Audit Spreadsheet;
- stable Meeting/Document/Batch IDs;
- logical Active/Inactive lifecycle;
- file-granular Pitchbook retry;
- derived/rebuildable Gemini index;
- one common Active-source access boundary for initial authorized users;
- Gemini-independent Knowledge Export source resolution;
- no partial export after hard-stop;
- stale-preview fingerprinting;
- metadata-only Audit for Export and Search;
- no custom Vector DB or parallel runtime.

## Required next outcome

Work 0012 should first seal the Apps Script public server surface, then address the bounded reliability/data-integrity defects that materially affect safe use. It should add regression enforcement, update the governing documentation, and leave all optional product expansion outside scope.
