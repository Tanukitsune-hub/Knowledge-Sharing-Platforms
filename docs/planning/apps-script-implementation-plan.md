# Apps Script-first Implementation Plan

Work ID: 0003 (historical planning origin; active Work state belongs in handoffs and PRs)

Current as of: 2026-08-27

Status: Active under `docs/decisions/target-runtime-first-development.md`

## 1. Goal

Complete Knowledge Sharing Platforms as one production-shaped Google Apps Script / Google Workspace / Shared Drive / Gemini File Search application.

New Work implements the shortest coherent vertical slice in the production source path, executes it in the actual target runtime with isolated data/resources, and expands only after native readback.

A separate test-runtime completion milestone is not a user outcome.

## 2. Standard delivery flow

```text
bounded preflight
→ shortest coherent production-source vertical slice
→ actual target runtime + isolated synthetic/anonymized resources
→ focused LOGIC_VALIDATION
→ bounded TARGET_RUNTIME_QUALIFICATION
→ repair observed incompatibility before broadening scope
→ separately authorize production data/users/billing/triggers/destructive effects
```

Principles:

- target runtime and production/confidential data are different concepts;
- use actual Apps Script/Workspace/browser behavior early;
- CI/mock/fixture/test-loader PASS cannot establish unobserved runtime behavior;
- separate DEV/Staging requires a documented material safety/evidence reason;
- do not add architecture for speculative future requirements;
- accepted evidence is not reopened without material contradiction.

## 3. Target runtime and boundaries

### TARGET_RUNTIME

- organization-controlled Apps Script V8 project;
- intended Web App deployment/execution shape;
- Google Drive / Shared Drive / Sheets / Docs;
- supported browser;
- approved Gemini/File Search environment when AI is in scope.

### ISOLATED_TEST_DATA

- synthetic or appropriately anonymized records/files;
- clearly segregated folders, Sheets, Docs, stable IDs, Store documents, or namespaces;
- exact identity readback before mutation;
- no confidential source content or private runtime IDs in GitHub.

### SIDE_EFFECT_STATE

State explicitly for each Work:

```text
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
```

Billing, confidential indexing, real users, broad access, triggers, physical delete, bulk migration, retention purge, and permission changes remain separately guarded until authorized.

## 4. Responsibility model

### ChatGPT

- outcome, scope, accepted design, Work/Dispatch IDs;
- GitHub source of truth;
- target/data/effect boundaries;
- handoffs and PR coordination;
- ambiguity resolution;
- final diff/evidence review;
- BLOCKER/FOLLOW_UP/OPTIONAL classification;
- completion latch and merge.

### Codex

- non-trivial Apps Script/HTML implementation;
- multi-file edits;
- focused deterministic tests;
- exact-source synchronization;
- bounded target-runtime smoke/readback;
- observed runtime defect repair;
- reports, commits, pushes, and PR updates under the handoff.

## 5. Runtime source strategy

- Apps Script V8 plain JavaScript;
- `.gs`, `.html`, and `appsscript.json` in GitHub;
- no production-required TypeScript/bundler/external server;
- external services behind thin adapters where practical;
- pure logic locally testable;
- production business helpers must live in production source;
- test loaders may stub external boundaries but cannot inject missing production business behavior;
- native Date, Blob, Drive, permissions, browser, and API behavior require target-runtime evidence when material.

## 6. Setup and migration

Private editor entry points:

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Setup/migration rules:

- stored exact resource IDs first;
- fail on ambiguous candidates;
- forward-only schema versioning;
- append-only columns where practical;
- stable-ID seed upsert;
- preserve user-mutated Masters and authoritative files;
- no generic destructive reset;
- triggers only when explicitly authorized;
- exact readback after mutation.

## 7. Prospective Work slicing

For each feature:

1. contract/schema decision;
2. production service path;
3. one UI or private/operator path;
4. one bounded operation using isolated data;
5. persisted readback/reopen/search;
6. focused regression;
7. broader surfaces only after the slice passes.

Examples:

- Meeting field: schema + create + reopen + search before analytics/export/AI expansion;
- relationship: forward resolve + reverse resolve before workspace generalization;
- AI metadata: one source index/filter/citation before all modes/formats;
- trigger: private/direct handler evidence before schedule enablement.

## 8. Work 0016 — Counterparty entity foundation

Authoritative sources:

- `docs/decisions/counterparty-entity-classification.md`;
- `docs/planning/work0016-counterparty-entity-foundation.md`.

Required implementation slice:

1. append `Counterparty_Type`, `Counterparty_ID`, `Related_GP_IDs` to `Meeting_Index`;
2. add category-specific non-GP `Option_Master` Types;
3. backfill legacy GP rows only where new columns are blank;
4. replace Meeting's global GP requirement with dependent Counterparty Type/Entity selection;
5. retain `GP_ID` mirror for GP Meetings and free-text person/role field;
6. update filename, Doc, retry, edit, search, Audit, Export, GP Workspace compatibility, and deterministic AI metadata;
7. qualify one legacy GP Meeting and one synthetic non-GP Meeting in target runtime.

Pitchbook remains GP-required. Five Backend sheets remain.

## 9. Work 0017 — Activity analytics / monthly checks

Source:

`docs/planning/work0017-meeting-activity-analytics.md`

Build only after Work 0016 so dimensions are entity-aware.

Slice:

1. monthly time series from `Meeting_Index`;
2. Counterparty Type/Entity and Team dimension switch;
3. exact underlying Meeting list;
4. one narrow monthly administrative check mutation;
5. persistence/Audit/readback;
6. no Meeting body read or external BI layer.

## 10. Work 0018 — Relationship Explorer

Source:

`docs/planning/work0018-relationship-explorer.md`

Slice:

1. resolve one Meeting -> Pitchbook link;
2. reverse resolve the same Pitchbook -> Meeting;
3. preserve Inactive/unresolved IDs;
4. expose safe links and entity context;
5. final read-only integrity.

Canonical relationship remains `Meeting_Index.Related_Pitchbook_IDs`; no relation sheet or inferred links.

## 11. Work 0019 — Entity Workspace / Fund Strategy

Source:

`docs/planning/work0019-entity-workspace-strategy-drilldown.md`

Slice:

1. preserve GP Workspace parity;
2. render one non-GP entity;
3. separate direct from Related GP activity;
4. drill into one exact Fund / Strategy value;
5. reuse Relationship Explorer and bounded print model;
6. no fuzzy Fund/Strategy merging or new Master.

## 12. Work 0020 — Personal-PC Gemini core

Source:

`docs/planning/work0020-personal-pc-gemini-core-qualification.md`

At kickoff, verify current official Google API/model/embedding/filter contracts. Existing source mappings are not assumed current merely because deterministic tests pass.

Evidence order:

1. isolated Store/credential readback;
2. one Meeting index;
3. one grounded query/citation;
4. one Pitchbook index;
5. one exact metadata filter;
6. update/inactivate/reactivate;
7. delete/rebuild;
8. cost/rate-limit/retry/retention and integrity.

Use bounded billing-enabled TEST_ONLY calls. No company confidential data, broad trigger, or production declaration.

## 13. Work 0021 — Structured filters / multi-entity comparison

Source:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Implement from the actual Work 0020 API evidence.

Slice:

1. one stable `entity_key` filter;
2. one 2-entity comparison;
3. citations for each entity;
4. Team/Meeting Type/follow-up filter;
5. five modes;
6. accepted six-format matrix;
7. final Store/Index/Audit/source integrity.

Use exact metadata behavior. Do not treat comma substring matching as exact multi-value filtering. If actual API requires separate bounded retrieval per entity, use that rather than weakening correctness.

## 14. Historical migration

After Work 0021, inspect the real corpus and choose manual, hybrid, or selective automation.

- manual entry is a valid default;
- automate only repeatable structures with measurable benefit;
- no universal converter requirement;
- preserve stable IDs, source traceability, deduplication, and rebuildable AI index;
- validate bounded non-production batches before broader migration.

## 15. Final production qualification

Last phase only:

- actual company Shared Drive parentage/permissions;
- organization-controlled Apps Script/Web App;
- Backend/Audit boundaries;
- production users/data/access model;
- production Gemini credentials/billing/index/query/citations;
- retention/cleanup/rollback;
- authorized scheduled triggers;
- broad rollout controls.

Production readiness is declared only here.

## 16. Logic validation

Run targeted tests first, then when risk justifies:

```text
npm run check
git diff --check
```

LOGIC_VALIDATION covers:

- schema/migration/idempotency;
- stable IDs/entity keys;
- validation/filtering/drafts;
- filename/Doc representation;
- relationship resolution;
- analytics bucketing;
- retry/concurrency/rollback;
- Audit redaction/safe errors;
- Gemini request/metadata/filter/citation mapping;
- public facade.

## 17. Target-runtime qualification

TARGET_RUNTIME_QUALIFICATION proves only the changed runtime-dependent slice, such as:

- exact source synchronization;
- one immutable version/deployment update where authorized;
- actual Sheets Date/object shape;
- create/persist/reopen/edit/search/link readback;
- actual browser/print behavior;
- actual Drive/Docs parent/link behavior;
- actual Gemini Store/index/filter/query/citation/deletion behavior;
- final count/ID/duplicate/Audit integrity.

Do not repeat every unit test in Apps Script.

## 18. Reporting and completion

```text
LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
READY: YES | NO
```

A Work completes when the usable outcome exists, required logic and native evidence pass, side effects are explicit, no BLOCKER remains, residuals are routed, GitHub is current, and Completion Latch is applied.

## 19. Historical map and governing order

Works 0004–0014 remain historical implementation/evidence routes. Work 0015 is the current GP Workspace Work.

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0017 analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 personal-PC Gemini core
→ 0021 structured filters / multi-entity comparison
→ historical migration
→ final production qualification
```
