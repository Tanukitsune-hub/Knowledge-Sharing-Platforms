# Planning Baseline and Roadmap

Current as of: 2026-08-28

Status: Active product/roadmap baseline

Current delivery follows `docs/decisions/target-runtime-first-development.md` and `docs/planning/apps-script-implementation-plan.md`.

Accepted product design is not reopened merely because target-runtime qualification is pending. Conversely, implementation or logic-test completion is not native readiness without required Apps Script / Workspace / browser / Gemini evidence.

## 1. Product baseline

Knowledge Sharing Platforms provides or is implementing:

- Meeting registration, search, edit, Active/Inactive/Reactivate, and structured context;
- Pitchbook/source registration, search, metadata maintenance, file-granular retry, and stable links;
- GP / Option Masters and append-only structured fields;
- read-only GP Workspace with bounded browser-native print/PDF brief;
- hierarchical Counterparty Type -> Entity Meeting classification;
- separate Restricted Audit Spreadsheet and best-effort Actor;
- Shared Drive as authoritative source;
- Gemini File Search as derived/rebuildable retrieval index;
- five Knowledge Search modes: `自由質問 / 要約 / 時系列 / 比較 / 面談準備`;
- Gemini-independent Knowledge Export / external-AI handoff;
- one organization-controlled Apps Script HTML Service Web App.

Work IDs and application release versions are separate. Historical Works remain evidence routes rather than the current delivery sequence.

## 2. Accepted architecture baseline

- one Web App for authorized users;
- Shared Drive authoritative `Meeting Records / Pitchbooks`;
- five-sheet Backend:
  - `GP_Master`;
  - `Option_Master`;
  - `Meeting_Index`;
  - `Pitchbook_Index`;
  - `Settings`;
- separate Restricted Audit Spreadsheet;
- stable IDs rather than row numbers;
- Google Doc is authoritative for Meeting body;
- original Drive file is authoritative for Pitchbook/source material;
- AI/Export layers are derived and rebuildable;
- no new database, relation sheet, Vector DB, Knowledge Graph, or broad workflow engine without a new explicit decision.

## 3. Current delivery path

New Work uses:

```text
bounded preflight
→ shortest coherent production-source vertical slice
→ actual target runtime
→ isolated synthetic/anonymized test data/resources
→ guarded side effects
→ focused LOGIC_VALIDATION
→ bounded TARGET_RUNTIME_QUALIFICATION
→ expand after native readback
→ separately authorize production data/users/billing/triggers/destructive effects
```

Do not define a separate test-environment completion milestone unless the staging decision gate passes.

Report:

```text
LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
READY: YES | NO
```

A local/CI/mock/simulator/test-loader pass proves only what it exercised.

## 4. Historical Work map

- 0004: scaffold + setup engine;
- 0005: Meeting vertical slice;
- 0006: Pitchbook vertical slice;
- 0007: maintenance / concurrency / Masters;
- 0008: File Search client / sync / free question;
- 0009: six formats / EML / five modes;
- 0010: consolidated synthetic DEV qualification;
- 0011: Gemini-independent Knowledge Export / external-AI handoff;
- 0012: public-surface / reliability hardening;
- 0013: qualification / recovery history;
- 0014: structured Meeting/Pitchbook context foundation, qualified and merged under PR #17;
- 0015: GP Workspace / one-page summary, qualified and merged under PR #20;
- 0016: Counterparty entity foundation, qualified and merged under PR #21.

## 5. Current Work

### Work 0022 — Temporal data contract hardening

Status: active next Work after accepted/merged Work 0016; execute before Work 0017 analytics.

Decision:

`docs/decisions/temporal-data-contract.md`

Detailed plan:

`docs/planning/work0022-temporal-data-contract-hardening.md`

Outcome:

- classify Business Date, Business Time, Instant, and Duration as separate temporal kinds;
- establish one generic production implementation for `YYYY-MM-DD`, `HH:mm`, and UTC ISO timestamp normalization;
- remove or reduce feature-specific Date/Time algorithms to thin compatibility wrappers;
- propagate the contract through registration, maintenance, Audit, search/sort, Knowledge Export, deterministic AI metadata, workspaces, relationships, and diagnostics;
- add a temporal-contract static validator to `npm run check`;
- prove mixed Sheets `Date` objects / canonical strings / ISO timestamps behave identically;
- avoid historical Date/Time cell rewrites and preserve untouched physical cells.

This Work was assigned ID 0022 after 0017–0021 were already reserved, but it executes before analytics because period bucketing must not be built on unstable temporal representations.

## 6. Implementation-ready sequence

### Work 0017 — Meeting activity analytics + monthly administrative checks

Detailed plan:

`docs/planning/work0017-meeting-activity-analytics.md`

Outcome:

- monthly / calendar-quarter / calendar-year / fiscal-year / custom-range / cumulative views;
- Counterparty Type / Entity, Related GP, Asset Class, Team, Meeting Type, and Status slices;
- exact underlying Meeting lists;
- lightweight monthly administrative completion check.

The exact label/state model for the administrative check is confirmed at Work kickoff. Default is one binary `月次管理反映済み` flag rather than a generic workflow engine.

Work 0017 consumes the accepted Work 0022 Business Date contract for every period and fiscal-year calculation. It must not create another date parsing/bucketing implementation.

### Work 0018 — Relationship Explorer

Detailed plan:

`docs/planning/work0018-relationship-explorer.md`

Outcome:

- Meeting -> Pitchbook resolution;
- Pitchbook -> Meeting reverse lookup;
- Inactive/unresolved relationship visibility;
- entity/GP/Fund-Strategy/date filters;
- read-only list-first UX;
- no relation sheet and no automatic inference.

### Work 0019 — Entity Workspace + Fund / Strategy drill-down

Detailed plan:

`docs/planning/work0019-entity-workspace-strategy-drilldown.md`

Outcome:

- generalize GP Workspace to all Counterparty Types;
- direct versus Related GP activity;
- non-GP Meeting context and explicitly linked materials;
- GP Pitchbooks;
- unified timeline;
- exact free-text Fund / Strategy grouping and drill-down;
- reuse Relationship Explorer and Work 0015 print patterns.

Fund / Strategy remains free text. Similar-looking values are not silently fuzzy-merged.

### Work 0020 — Personal-PC Gemini / File Search core qualification

Detailed plan:

`docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Outcome:

- current official API/model/embedding/filter contract verified at Work start;
- isolated personal-PC Store/credentials/billing path;
- one Meeting + one Pitchbook index/query/citation path;
- entity metadata filter;
- update/inactivate/reactivate/delete/rebuild behavior;
- cost/rate-limit/retry/retention guardrails;
- no company confidential data or production rollout.

### Work 0021 — Structured Knowledge filters + multi-entity comparison

Detailed plan:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Outcome:

- structured filters for entity, Related GP where API-exactness permits, Asset Class, Team, Fund / Strategy, Meeting Type, follow-up, date, and source type;
- comparison mode selecting 2–5 entities across categories;
- grounded common-dimension comparison with per-entity citations;
- five-mode target-runtime qualification;
- bounded format matrix for `.pdf / .pptx / .xlsx / .docx / .txt / .eml`.

This replaces a separate static GP-comparison dashboard.

## 7. Selected and rejected enhancement ideas

### Selected

- hierarchical counterparty/entity classification;
- repository-wide temporal data contract before analytics;
- structured operational/search filters;
- bidirectional Relationship Explorer;
- Entity Workspace and Fund / Strategy drill-down;
- AI multi-entity comparison in the Gemini phase.

### Rejected / absorbed

- advanced follow-up task management: rejected because task execution is managed elsewhere; retain `要フォロー + note` for recall/search;
- separate static GP comparison screen: rejected; numeric comparison belongs in Work 0017 and qualitative comparison in Work 0021;
- standalone “GP Workspace enhancement” Work: absorbed into Work 0018/0019;
- generalized legacy converter as mandatory product: rejected.

## 8. Historical-material migration

After personal-PC Gemini/File Search and structured comparison are qualified, inspect the actual historical corpus and select:

```text
manual entry
hybrid/manual-assisted entry
selective automation for repeatable subsets
```

The default may be manual because historical materials are highly heterogeneous.

Do not build a universal converter unless repeatable source structure and measurable benefit justify it. Any automation must preserve source traceability, stable IDs, deduplication, legacy compatibility, and rebuildable AI indexing.

A converter is not a prerequisite for final production qualification when manual migration is selected.

## 9. Final production-environment qualification and rollout readiness

This is the final phase, after product features, personal-PC Gemini/File Search, and the historical-migration approach are ready.

Qualify:

- actual company Shared Drive hierarchy and parentage;
- permissions and ordinary-user access;
- organization-controlled Apps Script Web App;
- Backend/Audit boundaries;
- production data/access model;
- production Gemini credentials/billing/index/query/citations;
- cleanup/rollback/retention;
- scheduled triggers only where authorized;
- real-user rollout controls.

Production readiness is declared only here.

## 10. Governing order

```text
0015 GP Workspace [ACCEPTED]
  -> 0016 Counterparty entity foundation [ACCEPTED]
  -> 0022 temporal data contract hardening [CURRENT]
  -> 0017 analytics / monthly checks
  -> 0018 Relationship Explorer
  -> 0019 Entity Workspace / Fund-Strategy drill-down
  -> 0020 personal-PC Gemini/File Search core
  -> 0021 structured filters / multi-entity comparison
  -> historical migration (manual / hybrid / selective automation)
  -> final production qualification / rollout readiness
```
