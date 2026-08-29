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
- no generated bundle edits.

### 2. Deterministic bundle builder

The builder must:

- use an explicit source-order contract;
- include each server source exactly once;
- embed each HTML resource exactly once as an inert string;
- generate a single Apps Script `.gs` code artifact;
- generate manifest/install/release metadata artifacts;
- produce byte-identical output from the same source commit/profile;
- record hashes and source mapping;
- exclude credentials, local mappings, deployment IDs, and private runtime data.

### 3. Runtime resource loader

The application must use one loader contract that supports:

```text
source mode  -> Apps Script project HTML files
bundle mode  -> generated embedded HTML resource map
```

Business code must not fork between source and bundle modes.

### 4. Project-specific installer

The installer must:

- be intentionally visible in the editor function selector;
- remain unavailable to normal Web App callers;
- reuse the product's existing setup/migration engine;
- validate context, authorization, and dependencies;
- create/reuse resources through a declarative registry;
- avoid duplicates;
- persist release/schema/install state;
- run readiness checks;
- provide plain-language next actions;
- be safe to rerun after partial failure or upgrade.

Optional resources, scopes, labels, and triggers are registered only when the product genuinely requires them.

### 5. Readiness states

Use at least:

```text
INSTALLING
READY_FOR_DEPLOYMENT
READY
ACTION_REQUIRED
FAILED
```

Do not report `READY` before required external/manual platform steps are observed.

### 6. Validation

Required checks:

- modular syntax;
- bundle syntax;
- client-script syntax;
- global/function collision detection;
- dangerous top-level execution detection;
- source coverage and deterministic order;
- source/bundle facade parity;
- source/bundle test parity;
- template/include resolution;
- repeated build reproducibility;
- installer idempotency;
- fresh target-runtime install;
- release/hash/source traceability;
- secret/private-ID scan.

### 7. Distribution kit

Recommended output:

```text
<Product>.bundle.gs
appsscript.json
INSTALL.md
release-manifest.json
```

The normal operator should need only the bundle and the install guide. Manifest or `clasp` routes may be provided for technical administrators.

## Platform boundaries

A script pasted into Apps Script cannot necessarily:

- enable an Advanced Google Service;
- replace its own project manifest;
- create its first Web App deployment;
- broaden company access policy safely.

These steps must be removed only when a proven platform-supported route exists. Otherwise they remain explicit, minimal, checklist-driven operator actions.

## Anti-patterns

Do not:

- develop directly in the generated bundle;
- concatenate HTML as executable server JavaScript;
- rely on filesystem order without a checked order contract;
- hide missing manifest/service/deployment requirements;
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
- release manifest/hash generation;
- installer/readiness shell;
- generic target-runtime fresh-install matrix.

Project-specific pieces remain:

- resource registry;
- schemas and seeds;
- permissions/scopes;
- optional labels/triggers;
- setup transaction;
- readiness rules;
- Web App pages and business behavior.
