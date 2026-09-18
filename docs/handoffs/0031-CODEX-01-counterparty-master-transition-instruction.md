# CODEX-01 — Counterparty Master schema8 migration / autonomous completion

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Knowledge Sharing Platformsのbusiness entity modelからGP専用概念をnormal product contractとして除去し、すべての面談先・資料主体を単一 `Counterparty_Master` に統合する。

GPは独立master/entity classではなく `Counterparty_Type = GP` の1値としてのみ残す。

会社PCへ移行する前に、schema7 -> schema8 migration、fresh-install behavior、actual owner-only Web App runtimeを同じWorkでend-to-end完成させる。

## Authority / source of truth

Read first:
- latest `origin/main`
- root `AGENTS.md`
- `src/AGENTS.md`
- `tests/AGENTS.md`
- `docs/agent-governance/work-control.md`
- `docs/agent-governance/dispatch-control.md`
- `docs/decisions/counterparty-master-unification.md`
- `docs/planning/work0031-counterparty-master-transition.md`
- `docs/handoffs/0028-dispatches.md`
- `docs/handoffs/0028-CODEX-24-pre-rollout-ui-polish-report.md`

User explicit decision + Work0031 decision supersede only the historical GP-specific architecture assumptions in root AGENTS.md, including `GP_Master` as permanent backend baseline and Meeting/Pitchbook requiring GP as primary entity. All other security, bundle, runtime, ID stability, temporal, no-delete, and validation rules remain in force.

At successful completion, update durable repository docs/AGENTS architecture wording so future agents do not restore the superseded GP-centric model.

## Work Contract

### Goal

Implement the accepted Work0031 Counterparty-centered design, migrate the existing isolated schema7 target to schema8 without loss, and qualify the final version in the actual owner-only Web App.

### Fastest safe decisive action

Start with a bounded source-wide GP dependency inventory, then implement one coherent schema8 vertical slice across storage -> Meeting -> Material -> Search/Export -> Master/Summary -> bundle -> actual target. Do not split into multiple ChatGPT handoffs for ordinary defects.

### Evidence hierarchy

1. authoritative persisted Sheets/Drive state + actual owner-only Web App behavior
2. exact source/served-version parity + schema/migration readback
3. deterministic production-source tests
4. mock/inference

Mocks cannot qualify migration/runtime behavior.

## Required architecture

### Counterparty Master

Authoritative backend master:
`Counterparty_Master`

Fresh-install canonical columns:
- `Counterparty_ID`
- `Counterparty_Name`
- `Counterparty_Type`
- `Status`
- `Created_At`
- `Updated_At`
- `Created_By`
- `Updated_By`
- `Legacy_Source_Type`
- `Legacy_Source_ID`

Canonical ID:
`CP-000001`, `CP-000002`, ...

Canonical types:
- `GP`
- `LP_ASSET_OWNER`
- `NISSAY_INTERNAL`
- `GROUP_COMPANY`
- `CONSULTANT_GATEKEEPER`
- `OTHER`

Normal product code must resolve entity name/type from Counterparty_Master.

### Backend sheet count

Keep exactly five Backend sheets.

Replace the existing `GP_Master` slot with `Counterparty_Master`; do not add a sixth backend storage layer.

Migration may rename/reshape the existing master sheet or use another data-safe in-place approach, but:
- no physical deletion of user data
- all existing GP names/status/audit fields preserved semantically
- all existing non-GP counterparty option values migrated
- migration rerun duplicate0
- rollback ambiguity avoided

Legacy columns may remain temporarily only where necessary for safe compatibility, but normal product reads/writes must not depend on them. Document any retained legacy field and why.

### Option Master

After migration, Option_Master normal counterparty catalog source is removed.

`COUNTERPARTY_*` rows may remain only as migration provenance/legacy data if deletion would be lossy; normal UI/catalog logic must not read them.

Option_Master remains for generic options such as Asset Class, Capital Type, Location, Team.

### Meeting

Normal Meeting identity:
`Counterparty_ID`

Required create/edit UI:
- one primary selector: `面談先`
- no required `面談先区分 -> 面談先` two-step flow
- no user-facing `関連GP` field
- selected option should make type understandable where useful, e.g. label/badge/secondary text, without requiring type selection first
- quick add registers `{name, type}` into Counterparty_Master

People names/titles remain in existing `面談相手（氏名・役職）`; do not create a contact master.

New Meeting writes must not depend on `GP_ID` or `Related_GP_IDs`.

Existing Meeting_ID, Docs ID, versioning, relation semantics, date/time semantics remain stable.

### Material / Pitchbook

Standalone Material/Pitchbook primary organization is Counterparty_ID.

Parent-bound material inherits parent Meeting Counterparty_ID.

GP-only filename/sequence/catalog/filter assumptions must be generalized to Counterparty name/ID.

New material writes must not depend on `GP_ID` or `Related_GP_IDs`.

Existing Document_ID / File_ID / Drive object identity remains stable.

### Search / export / analytics / summary

Normal entity identity is Counterparty-centered.

Preferred canonical entity key:
`COUNTERPARTY:CP-xxxxxx`

Remove from normal product behavior:
- `GP:<id>` as primary entity key
- GP-only primary filters
- `relatedGpId` user-facing filters
- `Related GP` output line
- GP-only catalog assumptions
- GP-only summary as a parallel primary concept

Counterparty Type may remain as an attribute/filter.

`GPサマリー` should be removed or folded into the existing `面談先サマリー`; do not maintain two competing primary entity experiences.

Knowledge Search, Full Output, analytics, relationship views, and filters should use Counterparty identity consistently.

Provider calls remain disabled/zero in this Work.

## schema7 -> schema8 migration

Migration must be explicit, deterministic, idempotent, and data-preserving.

Required mapping:
1. existing GP_Master rows -> Counterparty_Master rows with type `GP`
2. existing Option_Master non-GP counterparty rows -> Counterparty_Master rows with the corresponding type
3. assign stable generic `CP-*` IDs
4. rewrite Meeting authoritative references to Counterparty_ID
5. rewrite Material/Pitchbook authoritative references to Counterparty_ID
6. preserve legacy source mapping in `Legacy_Source_Type` / `Legacy_Source_ID`
7. preserve Meeting_ID / Document_ID / File_ID / Docs
8. rerun migration -> duplicate0 / same CP IDs / no extra mutation

Do not infer mappings by display name when an authoritative legacy ID/type mapping exists.

If duplicate names exist across types, they are distinct entities unless legacy IDs prove identity.

Do not silently merge entities based only on normalized name similarity.

### Existing isolated target

The current target contains only synthetic qualification data and is authorized for migration.

Before mutation, capture a bounded read-only migration baseline:
- exact five sheet names
- schema version
- GP_Master rows count/IDs/types implied
- existing non-GP counterparty option rows count/IDs/types
- existing Meeting/Pitchbook stable IDs and legacy references
- current single deployment/version identity state

Do not record private URLs, account identifiers, Script IDs, deployment IDs, or secret values in GitHub/chat.

Run migration once, verify, then run the migration/setup path a second time only for idempotency evidence.

## Source-wide GP dependency inventory

Before first implementation mutation, inventory active dependencies for at least:
- sheet/schema constants
- setup/seeds/migration
- Meeting validation/catalog/filename/metadata
- Material/Pitchbook reservation/upload/index/naming
- parent relations
- maintenance/master UI
- Knowledge Search/filter/export/citation metadata
- entity workspace / GP workspace
- analytics
- relationship explorer
- generated bundle/public surface/install docs/tests

Classify each dependency:
`REPLACE_NOW` / `LEGACY_COMPATIBILITY` / `HISTORICAL_INACTIVE` / `LABEL_ONLY`.

Do not return to ChatGPT after inventory; use it to drive implementation in the same Dispatch.

## Validation matrix

### Logic

Run focused tests first, then:
- `npm run check`
- `npm run check:bundle`
- `git diff --check`
- deterministic bundle regeneration/reproducibility
- public-surface/security validation

Add migration tests covering:
- fresh schema8 install
- schema7 GP migration
- schema7 non-GP option migration
- duplicate names across different types
- rerun idempotency
- stable legacy->CP mapping
- Meeting/Pitchbook reference rewrite
- legacy fields not used by new business logic

### Actual runtime / target

On the same isolated target and same single owner-only deployment:

R1 schema8 / exactly5 sheets / Counterparty_Master present / GP_Master absent as active master / AI disabled

R2 migration readback: old GP + old non-GP options appear in Counterparty_Master with stable CP IDs; rerun duplicate0

R3 Meeting normal UI: create one synthetic type=GP counterparty Meeting and one synthetic non-GP counterparty Meeting through the same single selector flow

R4 Meeting edit/search/detail: both records read back under `面談先`; no `関連GP` user-facing field; type is attribute only

R5 Material: parent-bound synthetic material inherits parent CP; standalone material can select generic counterparty; IDs/file semantics remain stable

R6 unlink/relink/parent-first/Docs body/date-time regressions remain PASS

R7 Knowledge Search + Meeting-only Full Output: generic counterparty filtering/output, no Related GP business line, provider calls0

R8 Master/Summary/Analytics: `面談先マスター` and `面談先サマリー` are authoritative; GP is visible only as a type/filter, not a separate master/primary experience

R9 Security/integrity: same single owner-only deployment, no permission broadening, AI disabled, triggers unchanged unless setup contract explicitly requires none, confidential0, physical delete0

R10 source/runtime parity: final served immutable version matches reviewed source/bundle

## Autonomous authority / retry budget

Route C. Codex owns local implementation, diagnosis, migration, deployment update, browser verification, and bounded fixes.

Within this single Dispatch, continue through ordinary compile/test/runtime failures without returning after each defect.

Budget:
- coherent repair/runtime cycles: max 3
- existing target source sync: max 4
- new immutable versions: max 3
- same existing deployment version updates: max 3
- migration on target: one initial migration + one idempotency rerun
- new target: 0
- second parallel deployment: 0
- physical delete: 0
- real/confidential data: 0
- provider calls: 0

Strategy Reset inside the same run when:
- a migration assumption is contradicted by actual target data
- the same repair approach fails target runtime twice
- schema/model choice no longer preserves stable IDs/data

Preserve accepted evidence across reset; do not restart from scratch unnecessarily.

## Stop / return early only if

- USER OAuth/credential/native action is strictly required
- permission/audience broadening is required
- real/confidential data is required
- physical/destructive deletion or irreversible migration becomes necessary
- new target / second deployment becomes necessary
- accepted Work0031 architecture must materially change
- existing non-synthetic data is unexpectedly discovered in the isolated target
- 3 coherent cycles are exhausted
- evidence is contaminated or rollback/data-preservation cannot be established
- provider call or Work0030 reactivation would be required

Otherwise, fix and continue to completion.

## Fixed boundaries

```text
WORK_ID: 0031
MODE: BUILD
TARGET_SCHEMA: 8
BACKEND_SHEETS: EXACTLY_5
PRIMARY_MASTER: Counterparty_Master
GENERIC_ID: CP-*
GP_ROLE: Counterparty_Type only
NEW_TARGET: 0
SECOND_PARALLEL_DEPLOYMENT: 0
REAL_CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
PERMISSION_BROADENING: 0
DIRECT_OPENAI_CALLS: 0
GEMINI_CALLS: 0
AZURE_OPENAI_CALLS: 0
AI_SYNC: DISABLED
WORK_0030: DEFERRED_BY_USER
```

## Git / delivery

Create a new branch from latest main.

Recommended:
`codex/0031-counterparty-master-transition`

Open one Draft PR against main.

Do not merge.

Update PR body with:
- WORK_ID / DISPATCH_ID / BALL / STATUS
- schema/migration result
- deterministic validation
- actual runtime R1-R10
- side effects
- provider calls
- blocker/ready

Report path:
`docs/handoffs/0031-CODEX-01-counterparty-master-transition-report.md`

Create/update:
`docs/handoffs/0031-dispatches.md` only if explicitly instructed by ChatGPT? No: main-side dispatch register is controller-owned. Do not overwrite main control docs from the implementation branch.

Update durable architecture docs/AGENTS on the implementation branch only where the Work0031 accepted architecture permanently supersedes GP-centric wording; ChatGPT will review before merge.

## Done when

```text
SCHEMA8_MIGRATION: PASS
COUNTERPARTY_MASTER: PASS
GP_AS_TYPE_ONLY: PASS
GP_SPECIFIC_NORMAL_PRODUCT_CONCEPTS: REMOVED
FRESH_INSTALL: PASS
MIGRATION_IDEMPOTENCY: PASS
R1_R10: PASS
LOGIC_VALIDATION: PASS
BUNDLE_VALIDATION: PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

Final response:

```text
WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

If genuine user-native action is required, keep the same Dispatch ID:

```text
WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
BALL: USER
STATUS: ACTION_REQUIRED
```