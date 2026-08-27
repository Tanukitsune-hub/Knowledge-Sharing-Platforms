# Work 0016 — Counterparty entity foundation

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-01`
MODE: `BUILD`
BALL: `CHATGPT`
STATUS: `BLOCKED — STRATEGY RESET REQUIRED`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary design: `docs/planning/work0016-counterparty-entity-foundation.md`

Authoritative decision: `docs/decisions/counterparty-entity-classification.md`

## Primary Outcome

Replace the Meeting workflow's global GP requirement with one structured two-stage identity:

`Counterparty Type -> Counterparty Entity`

while preserving legacy GP Meetings, stable IDs, files, relationships, five-sheet Backend, and the existing Pitchbook GP contract.

The result must be usable end-to-end in the existing private Apps Script Web App for both:

1. an existing legacy GP Meeting; and
2. one synthetic non-GP Meeting with a Related GP and explicit Pitchbook relationship.

## Acceptance Evidence — strongest first

1. actual authenticated target Web App persists/reopens/searches one synthetic non-GP Meeting through the exact production source path;
2. an existing legacy GP Meeting migrates/readbacks correctly without changing its stable Meeting ID, Doc/File identity, status, or authoritative source;
3. one non-GP entity is added through the normal Master path and remains stable/reusable;
4. Related GP -> eligible Pitchbook relationship works and survives reopen/edit/search;
5. Index / Meeting Doc / filename / Audit metadata / Knowledge Export metadata / deterministic AI metadata agree;
6. final integrity proves five sheets only, no duplicates, expected counters only, no unexpected Drive/Settings/Script Property/trigger/AI side effects;
7. focused regressions plus canonical `npm run check` and `git diff --check` pass.

Logic-only or mock-only PASS cannot replace target-runtime evidence.

## Fastest Safe Decisive Action

Implement the entire accepted Work 0016 contract in one bounded vertical slice rather than splitting schema, UI, search, and migration into separate Works.

Sequence:

`schema/migration -> production contracts -> registration/edit/search UI -> relationship propagation -> Export/AI metadata -> deterministic validation -> one exact source sync/version/in-place Web App update -> bounded legacy + non-GP runtime qualification -> final integrity -> report`.

## Required Scope

Follow the detailed Work plan without reopening its fixed design. The implementation includes at minimum:

- append-only Meeting_Index columns `Counterparty_Type`, `Counterparty_ID`, `Related_GP_IDs`;
- one schema-version increment with idempotent forward migration;
- legacy GP backfill only where new fields are blank;
- fixed Counterparty category codes and dependent select behavior;
- GP entities from existing `GP_Master`;
- non-GP entities from category-specific `Option_Master` Types;
- category-aware quick-add using existing Master mutation rules;
- existing `Counterparty` free text retained as `面談相手（氏名・役職）`;
- Related GP canonical stable-ID list, with primary GP auto-inclusion for GP Meetings;
- Meeting create/retry/edit/reopen/search round-trip;
- new Meeting filename uses Counterparty display name rather than assuming GP;
- new/edited Meeting Docs contain Counterparty type/name, Related GP context, and person/role text when present;
- legacy `GP:` Meeting Docs remain readable;
- Related Pitchbook candidates use same Asset Class plus GP present in `Related_GP_IDs`;
- existing Inactive/unresolved/out-of-current-scope relationships remain preserved;
- browser shared-state rules from the accepted decision;
- GP Workspace remains correct for GP Meetings;
- Knowledge Export metadata propagation;
- deterministic AI metadata adds `entity_key`, `counterparty_type`, `counterparty_id`, `counterparty_name`, `related_gp_ids` without making live Gemini/File Search calls;
- Audit remains metadata-only and does not duplicate Follow-up note or source body;
- safe public errors and intentional public-facade changes only if truly required.

## Closed Conclusions — do not reopen

- exactly five Backend sheets; no Entity/Counterparty/relation sheet;
- no Fund / Strategy Master;
- Pitchbook remains GP-required in Work 0016;
- follow-up remains `required + note`, not a task workflow;
- static GP comparison is not part of this Work;
- non-GP entities use Option Master rather than a new database;
- Counterparty category codes are fixed product codes, not user-editable Master rows;
- legacy source Docs/files are not bulk-renamed/re-written merely by migration;
- no automatic alias/merge across similarly named organizations;
- no live/billing-enabled Gemini/File Search qualification;
- no production rollout.

## Authorization / Side-effect Boundary

Authorized after deterministic PASS only:

- synchronize the exact tested Apps Script source to the already identified private target project;
- create one immutable Apps Script version;
- update the existing positively identified private WEB_APP deployment in place;
- perform the bounded synthetic schema/data operations required by the target-runtime qualification.

Not authorized:

- confidential/company data;
- broad user access or permission changes;
- new Web App deployment;
- Library deployment mutation;
- Gemini/File Search billing/index/query calls;
- installable trigger enablement;
- physical deletion;
- broad/bulk historical migration;
- production rollout.

Use exact-ID/readback guardrails and do not expose private runtime identifiers in GitHub reports.

## Deterministic Validation

Use the detailed matrix in the Work plan. At minimum prove:

- category validation + category-to-Master mapping;
- stable non-GP Option ID behavior and allowed option Types;
- schema migration/backfill idempotency;
- legacy GP compatibility;
- GP mirror / non-GP blank GP behavior;
- composite entity identity;
- Related GP canonicalization and auto-inclusion;
- relationship candidate logic and preserved existing links;
- create/retry/edit/search/readback;
- filename and Doc metadata;
- shared-draft behavior;
- GP Workspace compatibility;
- Export/AI metadata propagation;
- Audit redaction;
- public surface;
- `npm run check`;
- `git diff --check`.

Do not weaken assertions to obtain PASS.

## Target-Runtime Qualification

After deterministic PASS, perform one bounded end-to-end campaign in the existing private target Web App:

1. verify exact project and existing WEB_APP identity before mutation;
2. sync exact tested source once, read back exact match;
3. create one immutable version and update the same existing WEB_APP in place;
4. run idempotent schema migration once and verify rerun safety without duplicated/changed durable data;
5. reopen one existing legacy GP Meeting and prove the new fields resolve as GP / existing GP ID / Related GP without changing stable source identity;
6. add exactly one synthetic non-GP entity through the normal Master path;
7. create exactly one synthetic non-GP Meeting with one Related GP and one matching Related Pitchbook;
8. reopen it, edit one non-identity field once, and search it using Counterparty Type + Counterparty Entity + Related GP;
9. verify filename, Doc metadata, Index row, Audit metadata, relationship IDs, and GP Workspace compatibility for an existing GP;
10. run final integrity/readback.

Keep retries bounded. Do not create multiple synthetic Meetings to chase UI/harness noise.

## Execution Budget / Strategy Reset

- one implementation architecture;
- one main deterministic repair loop per concrete failure class;
- one source sync;
- one immutable Apps Script version for the passing source;
- one in-place Web App deployment update;
- one legacy GP runtime case;
- one non-GP synthetic entity + Meeting runtime case;
- at most one edit of that synthetic Meeting during qualification.

Strategy Reset if:

- the five-sheet design becomes infeasible;
- legacy GP compatibility requires destructive rewrite;
- target identity/deployment is ambiguous;
- the same runtime failure class repeats after one materially different fix;
- a second storage/identity architecture appears necessary;
- target-runtime evidence contradicts the accepted Counterparty model.

Do not reset for browser harness limitations that do not indicate an application defect.

## Completion Latch

Complete only when:

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS`;
- `SIDE_EFFECT_STATE` is explicitly bounded/guarded;
- no BLOCKER remains;
- all scoped source/tests/docs are committed and pushed;
- Draft PR remains open/unmerged for ChatGPT final review;
- canonical report and dispatch state are updated.

Expected final classification on success:

`DEV QUALIFIED — WORK 0016 COUNTERPARTY ENTITY FOUNDATION`

Production readiness is not claimed.

## Current execution status

`0016-CODEX-01` completed the local vertical slice and deterministic validation at `211/211 PASS`, with public facade `24`. The single authorized Apps Script source synchronization was then consumed. Final independent review found four UI/contract defects; they were repaired and revalidated locally, but the corrected source was not synchronized a second time.

No immutable version or deployment update was created, the existing private Web App remains on version 31, and the authenticated runtime campaign was not run. A fresh bounded dispatch is required to resume from corrected-source synchronization. See `docs/handoffs/0016-CODEX-01-counterparty-entity-foundation-report.md`.
