# Apps Script-first Implementation Plan

Work ID: 0003 (historical planning origin; active Work state belongs in handoffs and PRs)

Current as of: 2026-08-28

Status: Active under `docs/decisions/target-runtime-first-development.md`

## 1. Goal

Complete Knowledge Sharing Platforms as one production-shaped Google Apps Script / Google Workspace / Shared Drive application with provider-neutral Knowledge Search.

Normal-user generation choices are exactly:

```text
ChatGPT
Gemini
全文出力
```

ChatGPT and Gemini use independent File Search adapters. Full output uses one canonical package for Copy / Google Docs / PDF.

New Work implements the shortest coherent vertical slice in the production source path, executes it in the actual target runtime with isolated data/resources, and expands only after native readback.

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
- use actual Apps Script/Workspace/browser/provider behavior early;
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
- every AI provider enabled by the qualification environment.

### ISOLATED_TEST_DATA

- synthetic or appropriately anonymized records/files;
- clearly segregated folders, Sheets, Docs, stable IDs, provider Store documents, or namespaces;
- exact identity readback before mutation;
- no confidential source content, credentials, private Store IDs, or private runtime IDs in GitHub.

### SIDE_EFFECT_STATE

State explicitly for each Work:

```text
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
```

AI Works separate application data, provider Store, export artifact, billing, deployment, and trigger effects when material.

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
- external services behind thin private adapters;
- pure logic locally testable;
- production business helpers must live in production source;
- test loaders may stub external boundaries but cannot inject missing production business behavior;
- native Date, Blob, Drive, permissions, browser, provider API, and Store behavior require target-runtime evidence when material.

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
- exact readback after mutation;
- provider credentials and private Store IDs never enter GitHub or browser responses.

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
- AI provider: one source index/filter/query/citation before all modes/formats;
- full output: one canonical package before Copy/Docs/PDF adapters;
- trigger: private/direct handler evidence before schedule enablement.

## 8. Accepted foundation Works

- Work 0016: Counterparty Entity foundation;
- Work 0022: temporal contract;
- Work 0017: Activity Analytics/monthly check;
- Work 0018: Relationship Explorer;
- Work 0019: Entity Workspace/Fund Strategy.

These provide stable Entity, date, relationship, analytics, and workspace contracts for AI expansion.

## 9. Work 0020 — AI Provider Core, dual File Search, and full output

Sources:

- `docs/decisions/ai-provider-selection-and-full-output.md`;
- `docs/ai/provider-neutral-file-search.md`;
- `docs/planning/work0020-personal-pc-gemini-core-qualification.md`.

At kickoff, verify current official OpenAI and Gemini API/File Search/model/filter/citation/pricing/retention contracts. Existing source mappings are not assumed current merely because deterministic tests pass.

Implement as one coherent Work:

1. provider-neutral `Canonical AI Source`;
2. provider-neutral `Canonical Knowledge Request`;
3. one `Canonical Knowledge Package` reused by Copy/Docs/PDF;
4. exact route selector `ChatGPT / Gemini / 全文出力`;
5. no automatic provider failover;
6. OpenAI and Gemini provider adapters;
7. independent provider configuration/state;
8. append-only provider-state migration while retaining five Backend sheets;
9. full-output summary, buttons above body, bottom fixed-height internal-scroll preview;
10. one Meeting + one Pitchbook per enabled provider;
11. query/citation/filter;
12. update/inactivate/reactivate/delete/rebuild;
13. provider-specific disabled error/no-failover proof;
14. cost/rate-limit/retry/retention and final integrity.

Report:

```text
OPENAI_RUNTIME
GEMINI_RUNTIME
FULL_OUTPUT_RUNTIME
```

Overall completion requires full output PASS, provider-neutral core PASS, at least one File Search provider live PASS, every enabled provider PASS, and every deliberately disabled provider safe-error/no-failover PASS.

Use bounded billing-enabled TEST_ONLY calls. No company confidential data, recurring trigger, or production declaration.

## 10. Work 0021 — Structured Knowledge Search / five modes / multi-Entity

Source:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Implement from actual Work 0020 evidence.

One shared UI and filter/mode model serves all routes:

```text
ChatGPT
Gemini
全文出力
```

Slice:

1. one exact stable `entity_key` filter;
2. same bounded query on every enabled provider;
3. normalized citations and Drive links;
4. one 2-Entity comparison per enabled provider;
5. Team/Meeting Type/follow-up filter;
6. all five modes;
7. same filters/modes through full output;
8. Copy/Docs/PDF package parity;
9. accepted six-format matrix;
10. disabled-provider no-failover proof;
11. final provider Store/Index/Audit/source integrity and cost summary.

Use exact metadata behavior. Do not treat comma substring matching as exact multi-value filtering. If a provider requires bounded separate retrieval per Entity, use it rather than weakening correctness.

Report provider matrices separately:

```text
OPENAI_SEARCH_MATRIX
GEMINI_SEARCH_MATRIX
FULL_OUTPUT_MATRIX
```

## 11. Historical migration

After Work 0021, inspect the real corpus and choose manual, hybrid, or selective automation.

- manual entry is a valid default;
- automate only repeatable structures with measurable benefit;
- no universal converter requirement;
- preserve stable IDs, source traceability, deduplication, full-output package correctness, and rebuildable provider indexes;
- validate bounded non-production batches before broader migration.

## 12. Final production qualification

Last phase only:

- actual company Shared Drive parentage/permissions;
- organization-controlled Apps Script/Web App;
- Backend/Audit boundaries;
- production users/data/access model;
- full-output artifact permissions/retention/cleanup;
- every provider enabled by company policy:
  - approved credentials/billing;
  - exact Store identity/ownership;
  - index/query/filter/citations;
  - update/inactivate/cleanup/retention;
  - safe errors/no cross-provider failover;
- authorized scheduled triggers;
- rollout/rollback controls.

The company may enable OpenAI, Gemini, both, or neither. Production readiness is declared only here.

## 13. Logic validation

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
- temporal contract;
- retry/concurrency/rollback;
- Audit redaction/safe errors;
- provider-neutral source/request/package/citation contracts;
- OpenAI/Gemini adapter mapping;
- provider state independence;
- no-failover behavior;
- full-output package parity and UI placement;
- public facade.

## 14. Target-runtime qualification

TARGET_RUNTIME_QUALIFICATION proves only the changed runtime-dependent slice, such as:

- exact source synchronization;
- one immutable version/deployment update where authorized;
- actual Sheets Date/object shape;
- create/persist/reopen/edit/search/link readback;
- actual browser/print/copy/internal-scroll behavior;
- actual Drive/Docs parent/link behavior;
- actual enabled-provider Store/index/filter/query/citation/deletion behavior;
- full-output Docs/PDF artifact equality;
- final count/ID/duplicate/Audit/credential/trigger integrity.

Do not repeat every unit test in Apps Script.

## 15. Reporting and completion

```text
LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
READY: YES | NO
```

A Work completes when the usable outcome exists, required logic and native evidence pass, side effects are explicit, no BLOCKER remains, residuals are routed, GitHub is current, and Completion Latch is applied.

## 16. Governing order

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0022 temporal data contract hardening
→ 0017 analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 AI provider core / OpenAI + Gemini File Search / full output
→ 0021 structured filters / five modes / multi-Entity / provider parity
→ historical migration
→ final production qualification
```
