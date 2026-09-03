# Apps Script modular-source / bundle-distribution standard

Status: Proposed reusable standard, adopted first by Knowledge Sharing Platforms Work `0023`

## Principle

```text
Develop modularly
Test modularly and as a bundle
Distribute one generated bundle
Install through one project-specific idempotent installer
```

The bundle is a release artifact, not the development source of truth.

## Required layers

### 1. Authoritative modular source

- separate server modules by responsibility;
- separate HTML pages/components where useful;
- manifest under source control;
- unit/contract/runtime tests target the modular source;
- no generated bundle edits;
- source and bundle modes share the same business logic.

### 2. Deterministic bundle builder

The builder must:

- use an explicit source-order contract;
- include each server source exactly once;
- embed each HTML resource exactly once as an inert string;
- generate a single Apps Script `.gs` code artifact;
- generate manifest/install/release metadata artifacts;
- produce byte-identical output from the same source commit/profile;
- record source mapping, source hashes, bundle size metrics, and release metadata;
- exclude credentials, local mappings, deployment IDs, private runtime data, and test fixtures.

#### Hash integrity

A bundle must not claim to contain an ordinary SHA-256 of its own final bytes without defining a canonicalization rule.

Use:

```text
bundle_payload_sha256
  hash of canonical bundle bytes with one versioned fixed placeholder in the payload-hash field

bundle_file_sha256
  hash of the final emitted bundle bytes
```

The bundle may contain the payload hash. The release manifest records both hashes, and validators recompute both.

### 3. Runtime resource loader

The application must use one loader contract that supports:

```text
source mode  -> Apps Script project HTML files
bundle mode  -> generated embedded HTML resource map
```

Business code must not fork between source and bundle modes. Embedded client JavaScript remains an inert HTML string until served by `HtmlService`; it is never evaluated as server code by the builder.

### 4. Project-specific installer

The installer must:

- be intentionally visible in the editor function selector when that is part of the operator flow;
- be omitted from normal product pages;
- be treated as externally invocable because a top-level function without a trailing underscore may be called by name from HTML Service;
- perform strict server-side identity and administrator authorization before any mutation;
- atomically latch the first verified installer under a script lock before setup mutation and reject cross-user takeover of an incomplete install;
- never authorize a caller solely because the Web App executes as the deploying user;
- reuse the product's existing setup/migration engine;
- keep all underlying setup, validation, migration, trigger, provider, and storage helpers private;
- validate container context, dependencies, and required services;
- create/reuse resources through a declarative registry;
- avoid duplicates;
- persist release/schema/install state;
- run readiness checks;
- provide plain-language next actions;
- be safe to rerun after partial failure or upgrade.

First installation must require an identified, unambiguous installer identity. Later runs must use the authoritative administrator allowlist. Optional resources, scopes, labels, and triggers are registered only when the product genuinely requires them.

### 5. Readiness states

Use at least:

```text
INSTALLING
READY_FOR_DEPLOYMENT
READY
ACTION_REQUIRED
FAILED
```

Do not report `READY` before required external/manual platform steps are observed. When deployment security cannot be inspected programmatically, require a guarded administrator attestation bound to the current versioned Web App identity; URL existence alone is not readiness. Document that later manual deployment-setting changes require re-attestation even when the URL does not change.

### 6. Validation

Required checks:

- modular syntax;
- bundle syntax;
- client-script syntax;
- duplicate top-level `var`/`let`/`const` and function/global collision detection;
- dangerous top-level execution detection;
- source coverage and deterministic order;
- source/bundle facade parity;
- source/bundle test parity;
- template/include resolution;
- repeated build reproducibility;
- canonical payload-hash verification;
- final-file checksum verification;
- installer unauthorized-call rejection;
- installer first-run identity gate;
- installer-owner latch, interrupted-install takeover rejection, and hostile failure injection;
- guarded deployment-security attestation and stale-identity rejection;
- installer idempotency;
- manifest/OAuth/Advanced Service parity;
- bundle byte/character/line/resource counts;
- exact one-paste save, function selection, and execution in the target Apps Script runtime;
- fresh target-runtime install;
- release/hash/source traceability;
- secret/private-ID/local-path scan.

A JavaScript parse pass does not prove manifest, service, OAuth, editor-size, deployment, or runtime readiness.

### 7. Distribution kit

Recommended output:

```text
<Product>.bundle.gs
appsscript.json
INSTALL.md
release-manifest.json
```

The normal operator should need only the bundle and the install guide. Manifest or `clasp` routes may be provided for technical administrators.

The release manifest should include at least:

```text
product/release/schema/build profile
source commit and ordered source inventory
source hashes
bundle_payload_sha256
bundle_file_sha256
manifest hash
bundle byte/character/line counts
server source count and embedded HTML resource count
```

## Platform boundaries

A script pasted into Apps Script cannot necessarily:

- enable an Advanced Google Service;
- replace its own project manifest;
- create its first Web App deployment;
- broaden company access policy safely.

These steps must be removed only when a proven platform-supported route exists. Otherwise they remain explicit, minimal, checklist-driven operator actions.

The normal paste route must still be qualified against the approved manifest/OAuth contract. Unexpected scopes, missing required services, or inability to save/execute the exact single file are release blockers.

## Anti-patterns

Do not:

- develop directly in the generated bundle;
- concatenate HTML as executable server JavaScript;
- rely on filesystem order without a checked order contract;
- embed an undefined self-referential final-file hash inside the same bundle;
- assume that hiding an installer button prevents browser invocation;
- use effective/deploying-user identity alone to authorize installer mutation;
- treat JavaScript parity as manifest/OAuth/service parity;
- hide missing manifest/service/deployment requirements;
- ignore actual single-file editor/runtime limits;
- silently fall back to many manual source files when one-file qualification fails;
- make optional integrations block core installation;
- create broad triggers or Gmail scopes merely because the framework supports them;
- require users to edit raw JSON, IDs, retry counters, or provider state in the normal path;
- use a personal Drive template as a cross-environment deployment mechanism;
- claim zero-click installation when manual platform actions remain.

## Reuse boundary

The standard is reusable across Apps Script projects, including a future task-management tool. Reusable pieces are:

- bundle builder;
- source-order and coverage validator;
- HTML resource embedding;
- collision/top-level execution checks;
- canonical payload/final-file hash generation;
- release manifest generation;
- guarded installer/readiness shell;
- manifest/OAuth/service parity checks;
- one-paste target-runtime gate;
- generic target-runtime fresh-install matrix.

Project-specific pieces remain:

- resource registry;
- schemas and seeds;
- permissions/scopes;
- optional labels/triggers;
- setup transaction;
- authorization policy and administrator source;
- readiness rules;
- Web App pages and business behavior.
