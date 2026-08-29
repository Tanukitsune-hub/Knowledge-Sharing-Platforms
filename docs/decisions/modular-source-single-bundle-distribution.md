# Modular source, generated bundle, and installer distribution

Current as of: 2026-08-29

Status: Accepted design direction

Work ID: `0023`

## Decision

Knowledge Sharing Platforms keeps its development source modular under `src/`, but company-environment delivery must not require an operator to create and paste dozens of Apps Script and HTML files manually.

The accepted split is:

```text
GitHub development source
  -> multiple function-oriented .gs files
  -> multiple page/component .html files
  -> appsscript.json
  -> tests and validators

Generated distribution
  -> one self-contained Apps Script code bundle
  -> one generated manifest compatibility artifact
  -> one plain-language install guide
  -> one release/source/hash manifest
```

The primary distribution artifact is:

```text
dist/KnowledgeShare.bundle.gs
```

It is generated from GitHub source and must never be hand-edited.

## Why this is the safest integration

The current repository is already structured for maintainability, review, testing, and Codex work:

- server logic is divided into many `.gs` modules;
- the Web App uses multiple `.html` pages and partials;
- setup/repair logic is already centralized and idempotent;
- deterministic tests run against modular source;
- the manifest explicitly declares scopes and the Advanced Drive v3 service.

Replacing that structure with one giant hand-maintained source file would reduce reviewability and increase regression risk. The bundle therefore exists only as a generated delivery representation.

## Current constraints that must be handled explicitly

### HTML resources

The Web App currently uses `HtmlService.createTemplateFromFile(...)` and `HtmlService.createHtmlOutputFromFile(...)`. Concatenating only `.gs` files would not create the HTML files that those functions expect.

The distribution build must therefore embed every authoritative HTML resource into a generated server-side resource map and route template/include loading through one abstraction that supports both modes:

```text
modular development mode -> read .html files from the Apps Script project
bundle distribution mode -> read the embedded HTML resource map
```

Apps Script supports creating an `HtmlTemplate` directly from an HTML string, so this can be done without flattening client JavaScript into server execution scope.

### Manifest and Advanced Drive service

The current manifest declares:

- V8 runtime;
- explicit OAuth scopes;
- Advanced Drive v3 service;
- Web App defaults.

A pasted `.gs` file cannot itself create or replace `appsscript.json`, enable an Advanced Service, or publish its own Web App deployment through the ordinary Apps Script runtime.

Therefore the first safe company-install target is:

```text
one bundle paste
+ one simple Advanced Drive service enablement step when still required
+ one installer run
+ one manual Web App deployment
```

A generated `dist/appsscript.json` remains available for technical/clasp or manifest-copy installation. The normal non-specialist route should prefer the simpler editor action of adding the Drive API service rather than requiring manual JSON editing.

Work 0023 may remove the Advanced Drive dependency only if a bounded source inventory proves that replacing it with built-in/HTTP adapters is small, safe, and fully qualified for Shared Drive behavior. Do not rewrite stable Drive code merely to claim literal one-file purity.

### Web App deployment

The installer can inspect whether a Web App URL exists, but the normal script runtime cannot create the initial deployment itself. One manual deployment step remains unless a separately authorized managed deployment route using `clasp` or the Apps Script API is introduced for technical administrators.

The user-facing readiness state must distinguish:

```text
READY_FOR_DEPLOYMENT
READY
ACTION_REQUIRED
```

`READY_FOR_DEPLOYMENT` means installation/resources are correct and only the one-time Web App deployment remains.

## Distribution artifacts

Work 0023 should generate:

```text
dist/KnowledgeShare.bundle.gs
  self-contained server code + embedded HTML resources + installer entry points

dist/appsscript.json
  generated manifest matching the source manifest

dist/INSTALL.md
  non-specialist company installation guide

dist/release-manifest.json
  release version, schema version, Git commit, source files, source hashes,
  bundle hash, manifest hash, and build profile
```

Release delivery may publish these as GitHub Release assets rather than committing a large regenerated bundle on every feature commit. The GitHub source remains authoritative either way.

## Installer entry points

The bundle introduces intentionally public editor entry points for installation only:

```text
installKnowledgeShare()
checkKnowledgeShareReadiness()
```

They are not normal browser functions and must not be callable through the Web App facade.

`installKnowledgeShare()` wraps and reuses the existing setup engine rather than creating a second installer implementation.

Normal install behavior:

1. require a container-bound Google Spreadsheet;
2. infer the Spreadsheet parent folder as the default installation parent;
3. use production-safe defaults with AI providers and recurring triggers disabled;
4. validate authorization and required services;
5. create/reuse the accepted folder, Backend, Audit, schema, Master, and Settings resources;
6. record app version, schema version, bundle hash, and source commit;
7. run the existing validation/readiness path;
8. write a human-readable installation status sheet;
9. return `READY_FOR_DEPLOYMENT`, `READY`, or one plain-language action.

The installer must be idempotent. Re-running it is the supported repair/migration path and must not duplicate folders, Spreadsheets, rows, labels, triggers, or deployments.

## Folder and configuration defaults

For the lowest-burden normal route, the user creates the host Spreadsheet in the Shared Drive folder intended to contain the installation. The installer uses that parent as the default control and knowledge parent.

The resulting current-compatible shape is:

```text
Selected Shared Drive folder
├─ installation host Spreadsheet
├─ Private Assets Knowledge
│  ├─ Meeting Records
│  └─ Pitchbooks
├─ Knowledge Exports
├─ Knowledge Platform Backend
└─ Knowledge Platform Audit
```

A separate restricted control folder remains an optional advanced production configuration when the organization requires stronger Backend/Audit separation. The normal installer must not require the user to know or paste raw folder IDs; folder URLs may be accepted only in the advanced path.

## Resources not currently required

Knowledge Sharing Platforms currently does not require Gmail labels. The installer must not request Gmail permissions or create Gmail labels merely because the reusable installer framework can support them for another project.

Resource creation is registry-driven and project-specific. Optional triggers are created only when the corresponding feature is explicitly enabled. AI sync remains disabled by default and zero recurring triggers is a valid core-ready state.

## Bundle generation rules

The build must:

- take all authoritative `.gs` sources from `src/` exactly once;
- use an explicit, reviewed deterministic order rather than filesystem accident;
- embed all authoritative `.html` resources exactly once as inert strings;
- add source-boundary comments to the bundle;
- include deterministic release metadata;
- exclude secrets, runtime IDs, `.clasp.json`, local paths, reports, and test data;
- fail if an expected source is omitted or duplicated;
- produce byte-identical output from the same source commit and build profile.

## Validation contract

At minimum, CI/local validation must prove:

- every source `.gs` parses;
- the generated bundle parses;
- client scripts embedded from HTML parse;
- every template/include reference resolves in both modular and bundled modes;
- duplicate top-level function/global declarations are rejected unless explicitly allowlisted with justification;
- dangerous top-level service/API execution is rejected;
- source and bundle public facades are identical;
- existing deterministic tests pass against modular source;
- the same relevant tests pass against the generated bundle;
- the generated manifest matches required services/scopes;
- two builds from the same commit are byte-identical;
- release/source/hash mapping is complete;
- a fresh target-runtime Spreadsheet can install from the bundle, rerun idempotently, render the Web App, and preserve the accepted architecture.

## Final company installation target

The normal operator should perform only:

```text
1. Create a new Google Spreadsheet in the intended Shared Drive folder
2. Open Apps Script
3. Add the Drive API service if the release guide says it is required
4. Replace the default code with KnowledgeShare.bundle.gs once
5. Run installKnowledgeShare()
6. Approve Google permissions
7. Confirm READY_FOR_DEPLOYMENT
8. Create one Web App deployment using the prescribed company access setting
9. Run checkKnowledgeShareReadiness() or open the Web App
10. Confirm READY and share the Web App URL
```

No personal Google Drive template, cross-account Drive copy, local Node.js, `clasp`, Git, terminal, source-file creation, JSON editing, model ID, Store ID, or provider-document knowledge is required for the normal operator.

## Reusable standard

The general pattern is intended for later reuse by other Apps Script products, including the task-management tool:

```text
modular source
-> deterministic generated bundle
-> project-specific idempotent installer
-> bundle parity tests
-> target-runtime fresh-install qualification
```

Product-specific resources, scopes, triggers, and readiness checks remain declarative extensions; the underlying distribution framework should be reusable without forcing every project into the same runtime architecture.
