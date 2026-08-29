# Planning Baseline and Roadmap

Current as of: 2026-08-29

Status: Active product/roadmap baseline

Current delivery follows `docs/decisions/target-runtime-first-development.md` and `docs/planning/apps-script-implementation-plan.md`.

Accepted product design is not reopened merely because later production qualification remains pending. Logic-only completion is never substituted for required target-runtime evidence.

## 1. Product baseline

Knowledge Sharing Platforms provides or is implementing:

- Meeting registration, search, edit, Active/Inactive/Reactivate, and structured context;
- Pitchbook/source registration, search, metadata maintenance, file-granular retry, and stable links;
- GP / Option Masters and append-only structured fields;
- read-only GP/Entity Workspaces with bounded browser-native print/PDF briefs;
- hierarchical Counterparty Type -> Entity Meeting classification;
- repository-wide Business Date / Business Time / Instant temporal contract;
- Activity Analytics with period/dimension breakdowns, exact drill lists, and the binary `月次管理反映済み` administrative check;
- read-only Relationship Explorer with explicit Meeting -> Pitchbook and Pitchbook -> Meeting traversal;
- exact Fund / Strategy aggregation and drill-down;
- separate Restricted Audit Spreadsheet and best-effort Actor;
- Shared Drive as authoritative source;
- provider-neutral derived/rebuildable AI retrieval with independent OpenAI and Gemini File Search adapters;
- exactly three normal-user generation choices: `ChatGPT / Gemini / 全文出力`;
- five Knowledge Search modes: `自由質問 / 要約 / 時系列 / 比較 / 面談準備`;
- canonical full-text Knowledge Package with Copy / Google Docs / PDF parity;
- one organization-controlled Apps Script HTML Service Web App;
- modular GitHub source plus a deterministic generated single-file Apps Script distribution bundle;
- one project-specific idempotent installer and plain-language readiness flow for company deployment.

Work IDs and application release versions are separate. Historical Works remain evidence routes rather than the current delivery sequence.

## 2. Accepted architecture baseline

- one Web App for authorized users;
- Shared Drive authoritative `Meeting Records / Pitchbooks`;
- five-sheet Backend: `GP_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settings`;
- separate Restricted Audit Spreadsheet;
- stable IDs rather than row numbers;
- Google Doc is authoritative for Meeting body;
- original Drive file is authoritative for Pitchbook/source material;
- OpenAI/Gemini indexes and Knowledge Export artifacts are derived and rebuildable;
- Business Date/Time semantics are independent of physical Sheets cell representation;
- canonical Meeting ↔ Pitchbook relationship remains `Meeting_Index.Related_Pitchbook_IDs` with reverse lookup derived at read time;
- AI provider selection is explicit; no automatic cross-provider failover;
- ChatGPT and Gemini use File Search as the required default source-reading path;
- full output calls no AI API and reuses one canonical package for Copy/Docs/PDF;
- modular `.gs` and `.html` files under `src/` remain the development source of truth;
- `dist/KnowledgeShare.bundle.gs` is a generated release artifact, never a hand-maintained development source;
- the company installation path must not depend on copying a personal-Google-Drive template;
- no new database, relation sheet, custom Vector DB, Knowledge Graph, or broad workflow engine without a new explicit decision.

## 3. Current delivery path

```text
bounded preflight
→ shortest coherent production-source vertical slice
→ actual target runtime
→ isolated synthetic/anonymized test data/resources
→ guarded side effects
→ focused LOGIC_VALIDATION
→ bounded TARGET_RUNTIME_QUALIFICATION
→ expand after native readback
→ freeze the intended feature surface
→ generate and validate the distribution bundle
→ fresh-install qualification from the bundle
→ separately authorize production data/users/billing/triggers/destructive effects
```

AI Works additionally report provider matrices separately rather than hiding partial capability behind one status.

## 4. Historical / accepted Work map

- 0004: scaffold + setup engine;
- 0005: Meeting vertical slice;
- 0006: Pitchbook vertical slice;
- 0007: maintenance / concurrency / Masters;
- 0008: File Search client / sync / free question;
- 0009: six formats / EML / five modes;
- 0010: consolidated synthetic DEV qualification;
- 0011: provider-neutral Knowledge Export / external-AI handoff;
- 0012: public-surface / reliability hardening;
- 0013: qualification / recovery history;
- 0014: structured Meeting/Pitchbook context foundation, qualified and merged under PR #17;
- 0015: GP Workspace / one-page summary, qualified and merged under PR #20;
- 0016: Counterparty entity foundation, qualified and merged under PR #21;
- 0022: repository-wide temporal data contract hardening, qualified and merged under PR #22;
- 0017: Meeting activity analytics + monthly administrative check, qualified and merged under PR #23;
- 0018: read-only Relationship Explorer, qualified and merged under PR #24;
- 0019: Entity Workspace + exact Fund / Strategy drill-down, qualified and merged under PR #25; Apps Script version `40`; legacy GP Workspace direct-only compatibility preserved.

## 5. Current Work

### Work 0020 — AI Provider Core, dual File Search, and full output

Status: CURRENT after accepted/merged Work 0019.

Detailed plan:

`docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Authoritative AI decision:

`docs/decisions/ai-provider-selection-and-full-output.md`

Provider-neutral architecture:

`docs/ai/provider-neutral-file-search.md`

Primary outcome:

- current official OpenAI/Gemini API, File Search, model, filter, pricing, retention, and citation contracts verified at Work start;
- exactly three UI choices: `ChatGPT / Gemini / 全文出力`;
- provider-neutral source/request/package/citation contracts;
- independent OpenAI/Gemini provider configuration and derived index state;
- OpenAI and Gemini File Search adapters;
- no automatic provider failover;
- provider-specific safe errors when disabled/unavailable;
- one Meeting + one Pitchbook index/query/citation path for every enabled provider;
- update/inactivate/reactivate/delete/rebuild behavior per provider;
- full-output source/character summary;
- `コピー / Google Docs / PDF` buttons above the body;
- fixed-height internally scrollable preview at the bottom;
- exact package parity across Copy/Docs/PDF;
- cost/rate-limit/retry/retention guardrails;
- no company confidential data or production rollout.

Work 0020 is one coherent core Work rather than separate OpenAI, Gemini, and export Works.

## 6. Next implementation-ready Work

### Work 0021 — Structured Knowledge Search, five modes, and multi-entity comparison

Detailed plan:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Outcome:

- one shared filter/mode UI across ChatGPT, Gemini, and full output;
- structured filters for Entity, Related GP where exact capability permits, Asset Class, Team, Fund / Strategy, Meeting Type, follow-up, date, and source type;
- all five modes on every enabled File Search provider;
- 2–5 Entity qualitative comparison across categories;
- grounded common-dimension comparison with per-Entity citations;
- provider-parity matrices and explicit capability differences;
- full-output parity using the same filters/modes/Entity scope;
- bounded format matrix for `.pdf / .pptx / .xlsx / .docx / .txt / .eml`;
- disabled-provider safe errors and no failover.

This replaces a separate static GP-comparison dashboard.

## 7. Distribution and installation Work

### Work 0023 — Generated Apps Script bundle and low-friction installer

Status: PLANNED after Work 0021 and before historical-material migration.

Detailed plan:

`docs/planning/work0023-bundle-installer-distribution.md`

Authoritative decision:

`docs/decisions/modular-source-single-bundle-distribution.md`

Company operator guide target:

`docs/operations/company-bundle-installation.md`

Reusable standard:

`docs/standards/apps-script-bundle-installer-standard.md`

Outcome:

- preserve modular `.gs`/`.html` development source under `src/`;
- generate `dist/KnowledgeShare.bundle.gs` deterministically from GitHub source;
- embed all HTML resources so one code paste remains self-contained;
- generate `dist/appsscript.json`, `dist/INSTALL.md`, and `dist/release-manifest.json`;
- provide `installKnowledgeShare()` and `checkKnowledgeShareReadiness()` as editor-only installation functions;
- reuse the existing setup/validation engine rather than creating a second installer;
- infer the normal installation folder from the host Spreadsheet parent;
- keep AI providers and recurring AI sync disabled by default;
- require no personal Drive template, local runtime, Git, `clasp`, raw folder IDs, or manual source-file creation in the normal path;
- validate source/bundle syntax, global collisions, dangerous top-level execution, HTML resource resolution, facade parity, test parity, deterministic hashes, and fresh-install idempotency;
- accurately retain any unavoidable one-time platform steps, currently expected to be Advanced Drive service enablement where required and the first Web App deployment.

The production release bundle is cut after the intended feature surface is stable. The underlying bundle/installer standard is designed for later reuse by other Apps Script projects, including the task-management tool.

## 8. Selected and rejected enhancement ideas

### Selected

- hierarchical counterparty/entity classification;
- repository-wide temporal data contract before analytics;
- structured operational/search filters;
- bidirectional Relationship Explorer;
- Entity Workspace and Fund / Strategy drill-down;
- explicit `ChatGPT / Gemini / 全文出力` generation routes;
- File Search as the required default for both API providers;
- provider-neutral canonical source/request/package/citation layers;
- AI multi-Entity comparison;
- bottom fixed-height full-output preview with output buttons above it;
- modular source plus generated single-file Apps Script distribution;
- idempotent one-function installer and plain-language readiness state;
- reusable Apps Script bundle/installer standard.

### Rejected / absorbed

- advanced follow-up task management;
- separate static GP comparison screen;
- standalone GP Workspace enhancement;
- generalized legacy converter as mandatory product;
- automatic AI provider routing/failover;
- user-facing model selector;
- popup/modal long-form export;
- full-context API route as a substitute for File Search;
- developing the product directly as one giant hand-maintained Apps Script file;
- personal Drive template copying as the company deployment mechanism;
- mandatory local Node.js/Git/`clasp` use by the company operator.

## 9. Historical-material migration

After Works 0020–0021 and the Work 0023 distribution/install path are qualified, inspect the actual historical corpus and select:

```text
manual entry
hybrid/manual-assisted entry
selective automation for repeatable subsets
```

The default may be manual because historical materials are highly heterogeneous. Any automation must preserve source traceability, stable IDs, deduplication, legacy compatibility, rebuildable provider indexes, and full-output package correctness.

## 10. Final production-environment qualification and rollout readiness

This is the final phase, after product features, personal-PC AI/File Search, distribution/install readiness, and the historical-migration approach are ready.

Qualify:

- installation from the release bundle without a personal Drive template;
- actual company Shared Drive hierarchy and parentage;
- permissions and ordinary-user access;
- organization-controlled Apps Script Web App;
- Backend/Audit boundaries;
- production data/access model;
- every provider enabled by company policy: credentials/billing, Store identity/ownership, indexing/query/filter/citation behavior, update/inactivate/cleanup/retention, and safe errors/no failover;
- full-output permissions, artifacts, cleanup, and retention;
- real users;
- scheduled triggers only where authorized;
- rollback and rollout controls.

The company may enable OpenAI, Gemini, both, or neither. Production readiness is declared only after all enabled routes pass in the company environment.

## 11. Governing order

```text
0015 GP Workspace [ACCEPTED]
  -> 0016 Counterparty entity foundation [ACCEPTED]
  -> 0022 temporal data contract hardening [ACCEPTED]
  -> 0017 analytics / monthly checks [ACCEPTED]
  -> 0018 Relationship Explorer [ACCEPTED]
  -> 0019 Entity Workspace / Fund-Strategy drill-down [ACCEPTED]
  -> 0020 AI provider core / OpenAI + Gemini File Search / full output [CURRENT]
  -> 0021 structured filters / five modes / multi-Entity / provider parity
  -> 0023 generated bundle / idempotent installer / fresh-install qualification
  -> historical migration (manual / hybrid / selective automation)
  -> final company production qualification / rollout readiness
```