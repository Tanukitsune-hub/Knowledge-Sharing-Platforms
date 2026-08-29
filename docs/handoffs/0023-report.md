# Work 0023 planning report

WORK_ID: `0023`
DISPATCH_ID: `N/A`
BALL: `NONE`
STATUS: `PLANNED / READY_FOR_IMPLEMENTATION`
ROUTE: `A`

## Outcome of the assessment

The modular-source / generated-bundle distribution model is valid and recommended for Knowledge Sharing Platforms.

The current modular source should be preserved because it supports review, testing, maintenance, and agent-assisted development. The company operator should not recreate that internal structure manually.

## Current repository findings

- server code is distributed across function-oriented `.gs` files under `src/`;
- Web App rendering depends on multiple `.html` files and file-based template/include loading;
- setup and validation are already centralized and largely idempotent;
- the current manifest requires V8, explicit OAuth scopes, and Advanced Drive v3;
- existing deterministic validation parses modular server/client source but does not build or validate one combined distribution bundle;
- the current first-install documentation requires bootstrap JSON/raw folder IDs and private editor functions, which is not the desired non-specialist company flow.

## Design conclusion

A naive concatenation of `.gs` files is insufficient because it would omit the HTML resources used by the Web App.

The safe minimal design is:

```text
modular .gs/.html source
-> deterministic source-order build
-> embedded inert HTML resource map
-> modular/bundle-compatible template loader
-> one generated KnowledgeShare.bundle.gs
-> existing setup engine wrapped by installKnowledgeShare()
-> readiness sheet/status
```

## Normal company installation target

```text
create one Spreadsheet in the intended Shared Drive folder
-> open Apps Script
-> add Drive API service once if the release still requires it
-> paste one bundle once
-> run installKnowledgeShare()
-> approve Google permissions
-> confirm READY_FOR_DEPLOYMENT
-> create one Web App deployment
-> confirm READY
-> share the Web App URL
```

No personal Drive template, source checkout, Git, Node.js, terminal, `clasp`, raw folder IDs, manual JSON editing, or multiple Apps Script source files are required in the normal path.

## Platform limitations retained honestly

- a pasted `.gs` file cannot itself replace its project manifest or enable an Advanced Google Service;
- the ordinary script runtime cannot create its first Web App deployment;
- these actions remain minimal explicit steps unless a later proven managed deployment route is authorized;
- removing the Advanced Drive dependency is optional and must not trigger a broad Shared Drive refactor without evidence.

## Validation design

Work 0023 requires:

- modular and bundle syntax checks;
- `.gs`/`.html` source coverage and deterministic order;
- global/function collision detection;
- dangerous top-level execution detection;
- template/include resolution in modular and bundle modes;
- public-facade parity;
- existing test parity against bundle-loaded source;
- deterministic repeat build and hash/source manifest;
- secret/private-ID exclusion;
- fresh Shared Drive installation, installer rerun, Web App rendering, and representative end-to-end target-runtime evidence.

## Issue classification

### BLOCKER

None for the design decision.

### FOLLOW_UP / Work 0023 implementation scope

- implement the deterministic build and resource loader;
- implement installer/readiness wrappers and status sheet;
- add source/bundle parity validators and tests;
- conduct fresh target-runtime installation and rerun qualification;
- decide after inventory whether Advanced Drive remains one manual service step.

### OPTIONAL

- technical `clasp`/Apps Script API deployment route for specialist administrators;
- GitHub Release asset automation instead of committed `dist/` outputs;
- screenshots in the company guide when they measurably reduce mistakes.

## Repository changes in this planning Work

Created:

- `docs/decisions/modular-source-single-bundle-distribution.md`;
- `docs/planning/work0023-bundle-installer-distribution.md`;
- `docs/standards/apps-script-bundle-installer-standard.md`;
- `docs/operations/company-bundle-installation.md`;
- `docs/handoffs/0023-instruction.md`;
- `docs/handoffs/0023-report.md`;
- `docs/handoffs/0023-dispatches.md`.

Updated:

- `docs/planning/mvp-and-roadmap.md`;
- `docs/decisions/decision-log.md`;
- `docs/README.md`.

No Apps Script source, manifest, Google Drive resource, deployment, trigger, provider Store, API key, or runtime data was changed.

## Current state

Planning and specification integration are complete. Work 0023 implementation is deliberately scheduled after Work 0021 and before historical migration/final company qualification.

WORK_ID: `0023`
DISPATCH_ID: `N/A`
BALL: `NONE`
STATUS: `PLANNED / READY_FOR_IMPLEMENTATION`
