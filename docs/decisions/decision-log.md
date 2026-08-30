# Decision Log

Current as of: 2026-08-31

This file records active major decisions. Detailed domain sources take precedence:

- product: `docs/product/vision.md`
- architecture: `docs/architecture/target-architecture.md`
- implementation: `docs/planning/apps-script-implementation-plan.md`
- roadmap: `docs/planning/mvp-and-roadmap.md`
- runtime: `docs/operations/runtime-policy.md`
- target-runtime delivery: `docs/decisions/target-runtime-first-development.md`
- temporal data: `docs/decisions/temporal-data-contract.md`
- AI provider selection: `docs/decisions/ai-provider-selection-and-full-output.md`
- AI model/thinking policy: `docs/decisions/ai-model-policy-and-thinking-controls.md`
- AI/File Search: `docs/ai/provider-neutral-file-search.md`
- distribution/installer: `docs/decisions/modular-source-single-bundle-distribution.md`
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
- normal users do not directly edit Backend/Audit/provider Store state;
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
- no new relation/entity/analytics/provider-state sheet without explicit decision;
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

Pitchbook ownership remains GP-oriented unless a later explicit decision changes it.

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
- Types include Location, Asset Class, Capital Type, Team, and category-specific non-GP Counterparty Types.

Authorized users maintain allowed Masters with confirmation/Audit rules. Real department/entity names are not guessed as seeds.

## 2026-08-15 — Restricted Audit / best-effort Actor

Status: Accepted

- separate Restricted admin-only Audit Spreadsheet;
- no Web App Audit Viewer/custom password initially;
- Actor priority: email -> `TEMP_USER:<key>` -> `UNIDENTIFIED`;
- missing persistent identity does not block normal operation;
- Audit is operational trace, not strict non-repudiation;
- source bodies, Follow-up note, prompts/questions, answers, chunks, embeddings, full-output body, bytes, credentials, raw provider payloads, and private runtime IDs are excluded.

## 2026-08-15 — File Search retrieval baseline

Status: Historical Gemini-oriented baseline; superseded on 2026-08-28

The original accepted design used one Gemini File Search Store, stable Custom Metadata, managed chunking/embeddings, Active-source retrieval, and grounded citations.

The durable principles remain:

- Shared Drive is authoritative;
- provider indexes are derived/rebuildable;
- AI failure never rolls back authoritative capture;
- exact stable metadata handles filters;
- citations return to stable source IDs/Drive links;
- no custom Vector DB, taxonomy, Knowledge Graph, or Agent framework initially.

Provider selection and the current multi-provider design are governed by the 2026-08-28 decision below.

## 2026-08-15 — Five-mode Knowledge Search

Status: Accepted and extended

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

- one provider-neutral source/filter/citation contract;
- presets change prompt/output shape only;
- insufficient evidence is stated;
- filters use stable IDs and omit `未選択`;
- Work 0021 adds Entity-centered structured filters and 2–5 Entity comparison;
- API routes may use different provider-native retrieval strategies while preserving the same product contract.

## 2026-08-17 — Knowledge Export and public-surface hardening

Status: Accepted and implemented; expanded by 2026-08-28 AI decision

- only approved normal-user top-level facade functions;
- setup/diagnostics/triggers/raw adapters remain private;
- Export resolves Active authoritative records;
- count/character bounds precede expensive reads;
- explicit source links;
- provider-neutral five-mode prompts;
- Audit remains metadata-only;
- Knowledge Exports are derived copies requiring final permission/retention evidence;
- Copy, Google Docs, and PDF converge on one canonical Knowledge Package.

## 2026-08-26 — Target-runtime-first development

Status: Accepted

For new Work:

- implement the shortest coherent production-source slice;
- use actual target runtime with isolated synthetic/anonymized resources;
- keep production data/users/billing/triggers/exposure/destructive effects separately guarded;
- separate LOGIC_VALIDATION from TARGET_RUNTIME_QUALIFICATION;
- do not declare readiness from CI/mock/test-loader alone;
- create staging only for a material unique safety/evidence reason.

Detailed decision:

`docs/decisions/target-runtime-first-development.md`

The permanent DEV/PROD project separation is superseded; future Works use the
accepted target runtime with isolated synthetic data and guarded side effects.

## 2026-08-27 — Counterparty entity classification

Status: Accepted and implemented

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

- hierarchical Counterparty/Entity classification;
- Entity-aware activity analytics;
- bidirectional Relationship Explorer;
- Entity Workspace;
- exact Fund/Strategy drill-down;
- structured Knowledge filters;
- AI multi-Entity comparison.

Rejected/absorbed:

- advanced follow-up task workflow: rejected; task management occurs elsewhere;
- static GP-comparison dashboard: rejected; numeric comparison belongs in analytics and qualitative comparison in Knowledge Search;
- standalone GP Workspace enhancement: absorbed into Relationship Explorer/Entity Workspace;
- mandatory universal legacy converter: rejected.

## 2026-08-27 — Temporal data contract hardening

Status: Accepted and implemented

The application distinguishes:

```text
Business Date -> YYYY-MM-DD in configured timezone
Business Time -> HH:mm in configured timezone
Instant       -> UTC ISO-8601 with milliseconds
Duration      -> integer in the named unit
```

- one generic production helper family owns temporal normalization;
- equivalent Sheets `Date`, canonical string, and strict ISO timestamp representations behave identically;
- Audit compares semantic values rather than physical cell types;
- Search, Export, deterministic AI metadata, workspaces, and analytics consume the same contract;
- a static temporal validator is part of `npm run check`;
- historical Date/Time cells and Audit rows are not bulk-rewritten.

Detailed decision:

`docs/decisions/temporal-data-contract.md`

## 2026-08-28 — AI provider selection, dual File Search, and full output

Status: Accepted

Normal-user generation choices are exactly:

```text
ChatGPT
Gemini
全文出力
```

Internal routes:

```text
OPENAI
GEMINI
FULL_EXPORT
```

- ChatGPT uses the approved OpenAI API and File Search;
- Gemini uses the approved Gemini API and File Search;
- File Search is the required default source-reading path for both API routes;
- both API routes may retrieve authoritative Meeting records and Pitchbook/source materials;
- 全文出力 calls no AI API;
- FULL_EXPORT body contains authoritative Meeting Google Docs text only;
- matching Pitchbooks may appear only as bounded reference metadata and authoritative Drive links, without body extraction;
- no automatic cross-provider failover;
- disabled/unconfigured providers return provider-specific safe errors;
- normal users may select only model/thinking combinations allowed by administrator policy, accessible to the current credential/project, and qualified for the route;
- administrators may hide Sol, retain approved older models, and control model-specific thinking choices;
- discovery or a newer/latest provider release never auto-enables a model;
- Canonical AI Source, Knowledge Request, Knowledge Package, structured filters, and citation model are provider-neutral;
- provider adapters own provider-native Store/index/query/filter/citation/retry/cleanup details;
- OpenAI and Gemini index state must be independently observable;
- no new provider-state sheet is introduced; Work 0020 performs append-only state migration in the existing five-sheet Backend;
- Copy/Docs/PDF use the exact same canonical package;
- long full output does not use a popup;
- Copy/Docs/PDF buttons appear above the body;
- the full-text preview is at the bottom, fixed-height, and internally scrollable.

Detailed decisions:

- `docs/decisions/ai-provider-selection-and-full-output.md`;
- `docs/decisions/ai-model-policy-and-thinking-controls.md`;
- `docs/ai/provider-neutral-file-search.md`.

## 2026-08-28 — Optimized AI implementation order

Status: Accepted and extended on 2026-08-29

```text
0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 AI provider core / OpenAI + Gemini File Search / full output
→ 0025 administrator-governed model / thinking selection
→ 0021 structured filters / five modes / multi-Entity / provider parity
→ 0023 generated bundle / installer / fresh-install qualification
→ historical migration
→ final production qualification
```

Work 0020 is one coherent core Work rather than separate OpenAI, Gemini, and export Works. It implements three-route UX, provider-neutral contracts, independent provider state, both adapters, at least one enabled-provider live path, every enabled-provider qualification, disabled-provider safe errors, and full-output parity.

Work 0025 follows the stable Work 0020 OpenAI path. It adds policy-governed model/thinking choices without automatically enabling discovered/latest models or allowing users to bypass administrator policy.

Work 0021 builds the intended search product once on that core: structured filters, five modes, 2–5 Entity comparison, provider parity, full-output parity, and the bounded six-format matrix.

Work 0023 separates modular development source from low-friction distribution and proves the generated bundle before loading historical volume or qualifying the company environment.

Personal-PC AI qualification precedes historical migration so actual provider index/metadata/search contracts are proven before loading volume.

## 2026-08-31 — Work 0020 OpenAI primary qualification

Status: Accepted and completed for the personal DEV OpenAI path

- the OpenAI base model, temporary Vector Store/File lifecycle, exact metadata filter, grounded answer and cleanup passed directly;
- inline citation and retrieved-source normalization passed fail closed using provider file identity plus `source_type`, `source_id` and `content_hash`;
- the existing private Web App version 57 passed exact native Pitchbook `DOC-000017` and Meeting `MTG-000005` grounded query/citation gates;
- exact sync, metadata filtering, update/reindex, Inactive, Reactivate, delete/rebuild, disable/re-enable and no-duplicate reuse passed;
- item-level sync failure no longer invalidates a viable provider or discards a last known-good source;
- old large-file OpenAI indexing timeouts remain separate follow-up evidence;
- Gemini provider recovery remains deferred, with no automatic provider fallback;
- FULL_EXPORT accepted evidence remains Meeting-body-only and was not rerun during final Git reconciliation.

Detailed report:

`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-report.md`

## 2026-08-28 — Historical migration and final production

Status: Accepted and extended on 2026-08-29

Historical materials are heterogeneous. Manual entry is a valid default. Use hybrid/selective automation only for repeatable subsets with measurable benefit.

The generated bundle/installer path is qualified before historical migration so company installation does not depend on personal Drive resources or manual reconstruction of source files.

Final production qualification is last and includes actual company Shared Drive hierarchy/permissions, organization-controlled Apps Script, Backend/Audit boundaries, full-output permissions/retention, real users, and every provider enabled by company policy:

- approved credentials/billing;
- exact Store identity/ownership;
- indexing/query/filter/citations;
- update/inactivate/cleanup/retention;
- safe errors/no cross-provider failover;
- authorized triggers and rollout/rollback.

The company may enable OpenAI, Gemini, both, or neither. Personal-PC/synthetic success is not company production readiness.

## 2026-08-29 — Modular source, generated bundle, and low-friction installer

Status: Accepted design direction

Development and distribution are deliberately separated:

```text
modular GitHub source
→ deterministic generated distribution bundle
→ project-specific idempotent installer
→ fresh target-runtime installation qualification
```

- `.gs` and `.html` sources under `src/` remain authoritative and modular;
- the product is not developed as one giant hand-maintained script;
- company operators do not manually create or paste dozens of source files;
- `dist/KnowledgeShare.bundle.gs` is generated from GitHub source and is never hand-edited;
- all HTML resources are embedded in the generated bundle and loaded through one modular/bundle-compatible abstraction;
- the normal install begins from a new Spreadsheet in the intended Shared Drive folder and does not copy a personal Drive template;
- `installKnowledgeShare()` reuses the existing setup/migration engine and is safe to rerun;
- `checkKnowledgeShareReadiness()` reports plain-language `READY_FOR_DEPLOYMENT`, `READY`, or action-required states;
- AI providers and recurring AI synchronization remain disabled by default;
- Knowledge Share does not add Gmail labels or Gmail scopes because the current product does not require them;
- bundle generation validates syntax, source coverage/order, global collisions, dangerous top-level execution, template resolution, facade/test parity, deterministic hashes, and secret/private-ID exclusion;
- current platform boundaries are stated honestly: the Advanced Drive service may require one editor service-add step and the first Web App deployment remains a one-time manual platform action;
- Work 0023 follows Work 0021 and precedes historical migration and final company qualification;
- the underlying standard is designed for later reuse by other Apps Script products, including the task-management tool.

Detailed sources:

- `docs/decisions/modular-source-single-bundle-distribution.md`;
- `docs/planning/work0023-bundle-installer-distribution.md`;
- `docs/operations/company-bundle-installation.md`;
- `docs/standards/apps-script-bundle-installer-standard.md`.

## Current genuine choices

- whether scale later requires caching/materialized summaries;
- whether non-GP Pitchbook ownership is materially needed;
- whether cross-category duplicate Entities require alias/canonical identity;
- current OpenAI and Gemini models/credentials at Work 0020 start;
- exact provider-state physical compatibility/mirroring after source inventory;
- exact Related GP/Meeting Type multi-value filter strategy from actual provider behavior;
- observed rate limit, retry, batch size, cost, and retention guardrails per provider;
- whether Work 0023 can safely remove the Advanced Drive service dependency or retains one simple service-enable step;
- whether bundle files are committed under `dist/` or generated only as CI/GitHub Release assets, subject to freshness/hash enforcement;
- which providers are enabled by company policy in final production;
- manual/hybrid/selective historical migration method;
- final production permissions/cleanup/rollback/rollout route.
