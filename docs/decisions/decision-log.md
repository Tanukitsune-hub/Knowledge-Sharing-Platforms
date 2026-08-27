# Decision Log

Current as of: 2026-08-27

This file records active major decisions. Detailed domain sources take precedence:

- product: `docs/product/vision.md`
- architecture: `docs/architecture/target-architecture.md`
- implementation: `docs/planning/apps-script-implementation-plan.md`
- roadmap: `docs/planning/mvp-and-roadmap.md`
- runtime: `docs/operations/runtime-policy.md`
- target-runtime delivery: `docs/decisions/target-runtime-first-development.md`
- Gemini: `docs/ai/gemini-file-search.md`
- security: `docs/governance/security.md`

## 2026-08-14 — Google Workspace-centered product reset

Status: Accepted

Build a simple private-assets knowledge base rather than a Wiki/SNS/complex external platform.

- Shared Drive is authoritative.
- Users interact through one Apps Script Web App.
- Sheets hold Masters/Index/Settings, not full duplicated source content.
- AI remains a derived convenience layer.

## 2026-08-15 — One shared Web App

Status: Accepted

- one organization-controlled Web App for authorized users;
- no per-user copies;
- Meeting, Pitchbook, Workspace/analytics, Knowledge Search, and Master Management share the application;
- normal users do not directly edit Backend/Audit/File Search state;
- browser drafts are per user/browser.

## 2026-08-15 — Authoritative storage and five-sheet Backend

Status: Accepted

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

Backend:

```text
GP_Master
Option_Master
Meeting_Index
Pitchbook_Index
Settings
```

- stable IDs, not row numbers;
- append-only schema evolution where practical;
- no new relation/entity/analytics sheet without explicit decision;
- separate Restricted Audit Spreadsheet.

## 2026-08-15 — Meeting baseline

Status: Accepted historical baseline; prospectively extended on 2026-08-27

Baseline required fields were Date, GP, Asset Class. Optional fields include Time, Location, Equity/Debt, person/counterparty text, internal participants, body notes, and later structured fields.

Meeting body is authoritative only in Google Docs. Stable Meeting ID remains immutable.

The global GP requirement is prospectively superseded by the 2026-08-27 Counterparty Entity decision; legacy GP records remain valid.

## 2026-08-15 — Pitchbook identity, filename, and retry

Status: Accepted

- file, Date, GP, Asset Class remain required;
- optional Equity/Debt and Fund/Strategy;
- stable Document ID / Batch ID / Drive File ID;
- sequence starts at `01` and continues from destination max;
- historical gaps remain;
- metadata edits preserve identity;
- file-granular partial success;
- idempotent retry avoids duplicate Drive/Index records;
- current limits: 25MB/file, 10 files/selection, 100MB total.

Work 0016 does not generalize Pitchbook ownership to non-GP entities.

## 2026-08-15 — Drafts, maintenance, and lifecycle

Status: Accepted, with prospective counterparty sharing update

- text/selection drafts persist for 24h in one browser;
- registration success keeps shared fields and clears page-specific fields;
- normal lifecycle is Active/Inactive/Reactivate;
- stable IDs and optimistic locking are preserved;
- LockService covers short critical sections only.

After Work 0016, Date/Asset Class/Capital Type/Fund Strategy remain shared across Meeting/Pitchbook, while GP shares only from a GP-counterparty Meeting.

## 2026-08-15 — Masters

Status: Accepted and extended

GP Master:

- immutable GP ID;
- mutable name;
- Active/Inactive;
- normalized duplicate check;
- quick-add.

Option Master:

- immutable Option ID;
- mutable name/Sort Order/status;
- existing Types include Location, Asset Class, Capital Type, Team;
- Work 0016 adds category-specific non-GP counterparty Types.

Authorized users maintain allowed Masters with confirmation/Audit rules. Real department/entity names are not guessed as seeds.

## 2026-08-15 — Restricted Audit / best-effort Actor

Status: Accepted

- separate Restricted admin-only Audit Spreadsheet;
- no Web App Audit Viewer/custom password initially;
- Actor priority: email -> `TEMP_USER:<key>` -> `UNIDENTIFIED`;
- missing persistent identity does not block normal operation;
- Audit is operational trace, not strict non-repudiation;
- source bodies, Follow-up note, prompts/questions, answers, chunks, embeddings, bytes, secrets, and private runtime IDs are excluded.

## 2026-08-15 — Gemini File Search retrieval

Status: Accepted design; live qualification planned

- Shared Drive remains authoritative;
- one derived/rebuildable Store initially;
- stable Custom Metadata for exact filtering;
- managed chunking/embeddings;
- only Active sources normally retrievable;
- one configured Flash model;
- AI failure never rolls back authoritative capture;
- citations return to stable source IDs/Drive links;
- no custom Vector DB, taxonomy, Knowledge Graph, Agent framework, or model router initially.

Accepted initial formats:

```text
.pdf / .pptx / .xlsx / .docx / .txt / .eml
```

`.msg` and automatic EML attachment indexing remain out of scope.

## 2026-08-15 — Five-mode Knowledge Search

Status: Accepted and extended

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

- one retrieval/citation layer;
- presets change prompt/output shape only;
- insufficient evidence is stated;
- filters use stable IDs and omit `未選択`;
- Work 0021 adds entity-centered structured filters and 2–5 entity comparison.

## 2026-08-17 — Knowledge Export and public-surface hardening

Status: Accepted and implemented

- only approved normal-user top-level facade functions;
- setup/diagnostics/triggers/raw adapters remain private;
- Export resolves Active authoritative records;
- count/character bounds precede expensive reads;
- explicit source links;
- provider-neutral five-mode prompts;
- Audit remains metadata-only;
- Knowledge Exports are derived copies requiring final permission/retention evidence.

## 2026-08-26 — Target-runtime-first development

Status: Accepted

For new Work:

- implement the shortest coherent production-source slice;
- use actual target runtime with isolated synthetic/anonymized resources;
- keep production data/users/billing/triggers/exposure/destructive effects separately guarded;
- separate LOGIC_VALIDATION from TARGET_RUNTIME_QUALIFICATION;
- do not declare readiness from CI/mock/test-loader alone;
- create staging only for a material unique safety/evidence reason.

The former permanent DEV/PROD project separation is superseded.

Detailed decision:

`docs/decisions/target-runtime-first-development.md`

## 2026-08-27 — Counterparty entity classification

Status: Accepted

Meeting classification becomes:

```text
Counterparty Type -> Counterparty Entity
```

Fixed categories:

```text
GP
LP_ASSET_OWNER
NISSAY_INTERNAL
GROUP_COMPANY
CONSULTANT_GATEKEEPER
OTHER
```

- GP choices use `GP_Master`;
- non-GP choices use category-specific `Option_Master` Types;
- no sixth Entity/Counterparty sheet;
- composite identity is `Counterparty_Type + ':' + Counterparty_ID`;
- append `Counterparty_Type`, `Counterparty_ID`, `Related_GP_IDs` to Meeting Index;
- keep existing `GP_ID` and free-text person/role field for compatibility;
- GP Meetings mirror GP_ID and auto-include it in Related GPs;
- non-GP Meetings may have blank GP_ID and optional Related GPs;
- legacy GP rows backfill new columns without changing stable IDs/Docs/files;
- Pitchbook remains GP-required.

Detailed decision:

`docs/decisions/counterparty-entity-classification.md`

## 2026-08-27 — Product enhancement selection

Status: Accepted

Selected:

- hierarchical counterparty/entity classification;
- entity-aware activity analytics;
- bidirectional Relationship Explorer;
- Entity Workspace;
- exact Fund/Strategy drill-down;
- structured Knowledge filters;
- AI multi-entity comparison.

Rejected/absorbed:

- advanced follow-up task workflow: rejected; task management occurs elsewhere;
- static GP-comparison dashboard: rejected; numeric comparison belongs in analytics and qualitative comparison in Gemini;
- standalone GP Workspace enhancement: absorbed into Relationship Explorer/Entity Workspace;
- mandatory universal legacy converter: rejected.

## 2026-08-27 — Implementation order

Status: Accepted

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0017 activity analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 personal-PC Gemini/File Search core
→ 0021 structured filters / multi-entity comparison
→ historical migration
→ final production qualification
```

Analytics follows entity foundation to avoid building a GP-only dimension that must immediately be replaced.

Personal-PC Gemini qualification precedes historical migration so the actual index/metadata/search contract is proven before loading volume.

## 2026-08-27 — Historical migration and final production

Status: Accepted

Historical materials are heterogeneous. Manual entry is a valid default. Use hybrid/selective automation only for repeatable subsets with measurable benefit.

Final production qualification is last and includes actual company Shared Drive hierarchy/permissions, organization-controlled Apps Script, Backend/Audit boundaries, production credentials/billing, real users, retention/cleanup/rollback, and authorized triggers.

Personal-PC/synthetic success is not company production readiness.

## Current genuine choices

- exact monthly administrative check label/state in Work 0017;
- whether scale later requires caching/materialized summaries;
- whether non-GP Pitchbook ownership is materially needed;
- whether cross-category duplicate entities require alias/canonical identity;
- current Gemini model/embedding model/credentials at Work 0020 start;
- exact Related GP multi-value filter strategy based on actual API behavior;
- observed rate limit, retry, batch size, cost, and retention guardrails;
- manual/hybrid/selective historical migration method;
- final production permissions/cleanup/rollback/rollout route.
