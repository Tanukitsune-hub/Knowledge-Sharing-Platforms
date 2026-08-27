# Work 0016 — CODEX-01 Counterparty entity foundation

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-01`
MODE: `BUILD`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0016-counterparty-entity-foundation`

Recommended model: `Luna Max` — the product/data architecture is settled and this dispatch is primarily cross-cutting implementation plus target-runtime execution.

## Read first

Read and follow all applicable `AGENTS.md` / `AGENTS.override.md`, especially repository root and relevant `src/` / `tests/` instructions.

Then read:

1. `docs/handoffs/0016-instruction.md`
2. `docs/planning/work0016-counterparty-entity-foundation.md`
3. `docs/decisions/counterparty-entity-classification.md`
4. `docs/planning/post0015-spec-impact-and-implementation-sequence.md`
5. `docs/decisions/target-runtime-first-development.md`
6. `docs/operations/apps-script-web-app-deployment.md`
7. Work 0015 accepted source/contracts where GP Workspace compatibility is affected.

Important authority note: older root/product wording that says every Meeting requires GP is superseded for Work 0016 by the later explicit Counterparty decision and Work 0016 plan. Do not preserve that old assumption in new production behavior.

## Execution posture

Implement Work 0016 as one coherent vertical slice. Do not subdivide the Work merely to reduce local scope. Move quickly, but preserve stable IDs, existing source records, five-sheet architecture, target-runtime evidence, and safe deployment rules.

Use subagents only if they provide clear independent value; do not create coordination overhead for its own sake.

## Primary Outcome

Normal Meeting registration/edit/search must work with:

`Counterparty Type -> Counterparty Entity`

instead of requiring GP for every Meeting, while legacy GP Meetings and all accepted Work 0014/0015 behavior continue to work.

## Required implementation

Implement the full scope in `docs/handoffs/0016-instruction.md` and `docs/planning/work0016-counterparty-entity-foundation.md`, including all downstream paths. Key expectations:

- one append-only schema increment;
- `Counterparty_Type`, `Counterparty_ID`, `Related_GP_IDs` appended to Meeting_Index;
- idempotent legacy GP backfill only for blank new fields;
- fixed category definitions and display labels;
- dependent category/entity selectors;
- GP entities remain in GP_Master;
- non-GP entities use new Option_Master Types;
- category-aware normal Master add/rename/reorder/deactivate/reactivate behavior;
- no guessed real organization/department seed values;
- `Counterparty` free text remains person/role text;
- Related GP multi-select and canonical stable-ID handling;
- primary GP auto-included for GP Meetings;
- non-GP Meetings leave legacy GP_ID blank;
- create/retry/fingerprint/edit/reopen/search/result-map coverage;
- filename and authoritative Meeting Doc use Counterparty identity for new/edited records;
- legacy GP Doc parser compatibility;
- Related Pitchbook candidates derive from Related GP IDs + same Asset Class;
- preserve existing Inactive/unresolved relationships;
- shared browser-state rules from the decision;
- GP Workspace still works for GP Meetings;
- Knowledge Export and deterministic AI source metadata receive new entity fields;
- Pitchbook deterministic AI metadata derives `entity_key = GP:<GP_ID>` without changing Pitchbook required fields;
- Audit metadata remains bounded/redacted;
- no billing-enabled Gemini/File Search calls.

Prefer modifying existing reusable catalog/master/search helpers rather than building parallel systems. Do not introduce a new Counterparty database abstraction that duplicates GP/Option Master behavior.

## Schema / migration safety

Migration must be forward-only and idempotent.

Preserve:

- all existing column order before appended columns;
- Meeting IDs;
- Document IDs / Batch IDs / File IDs;
- existing Google Docs and Pitchbook files;
- filenames for legacy records unless the user explicitly edits the record and accepted edit behavior requires a rename;
- Status/Version/Created/Updated/Actor/AI fields;
- counters;
- Settings;
- Script Properties;
- user-mutated Master rows;
- existing Meeting↔Pitchbook links.

A second migration run must not create duplicates or rewrite already-correct rows/timestamps.

## Logic validation

Add focused regression coverage before running the full suite. Include realistic cross-cutting cases rather than only helper unit tests.

Required evidence includes:

- category and Master mapping;
- stable ID validation;
- schema migration idempotency and legacy backfill;
- GP and non-GP create/edit/retry/search flows;
- Related GP logic;
- relationship candidate logic;
- legacy parser/filename behavior;
- browser draft/dependent-select behavior;
- GP Workspace compatibility;
- Export/AI metadata;
- Audit redaction;
- public facade inventory;
- no new privileged browser-callable functions;
- `npm run check`;
- `git diff --check`.

If `npm run check` changes its test count, report the exact new count; do not target an arbitrary count.

## Target-runtime execution

Only after deterministic PASS:

1. prove the exact Apps Script project and positively identify the existing private WEB_APP `/exec` per deployment guardrails;
2. synchronize the exact tested source once and read it back exactly;
3. create one immutable version for the passing source;
4. update the same existing WEB_APP deployment in place; do not create a new deployment and do not touch Library deployments;
5. run the bounded target-runtime campaign from the canonical instruction.

Use synthetic/anonymized data only.

### Runtime campaign

Required:

- schema migration + rerun safety;
- one existing legacy GP Meeting reopen/readback;
- exactly one synthetic non-GP entity added via normal Master path;
- exactly one synthetic non-GP Meeting with one Related GP and one matching existing synthetic Pitchbook;
- reopen;
- edit one non-identity field once;
- exact Past Meeting search using Counterparty Type + Counterparty Entity + Related GP;
- readback filename, Doc metadata, Index, Audit metadata, relation IDs;
- confirm existing GP Workspace remains correct for a GP;
- final integrity.

Do not create more test records merely because a browser automation observation is awkward. Strong direct Backend/Doc/readback evidence may resolve automation limitations where the application behavior is otherwise clear.

## Final integrity

Verify at least:

- exactly five Backend sheets;
- expected schema version and appended columns only;
- all legacy rows retain stable IDs/source files;
- exactly expected synthetic entity/Meeting additions;
- no duplicate Master rows/Meeting rows/Drive files;
- only expected counter changes;
- no unintended Pitchbook data mutation;
- no unexpected Audit payload content;
- no Follow-up note/source body duplication into Audit;
- no unexpected AI/store state change;
- no trigger/Script Property drift;
- same existing private Web App deployment updated in place;
- no Library deployment mutation;
- no Gemini/File Search call.

## Stop / reset conditions

Stop and report instead of inventing a new architecture if:

- target project/deployment identity is ambiguous;
- five-sheet architecture cannot satisfy a required behavior;
- legacy data would require destructive rewrite;
- same concrete runtime failure persists after one materially different repair;
- a second storage/entity identity mechanism is required;
- actual target-runtime behavior materially contradicts the accepted Counterparty design.

Do not stop merely because a browser harness cannot manipulate a native UI surface when stronger evidence settles application behavior.

## Delivery

Create:

`docs/handoffs/0016-CODEX-01-counterparty-entity-foundation-report.md`

Update:

- `docs/handoffs/0016-report.md`
- `docs/handoffs/0016-instruction.md`
- `docs/handoffs/0016-dispatches.md`
- Draft PR body

Commit and push all scoped source/tests/docs changes.

Keep the PR Draft / Open / unmerged. ChatGPT owns final review and merge.

Do not commit private URLs, deployment IDs, Drive IDs, account identifiers, credentials, Script Property values, or confidential source content.

## Success classification

On full PASS report:

`DEV QUALIFIED — WORK 0016 COUNTERPARTY ENTITY FOUNDATION`

with:

- `LOGIC_VALIDATION: PASS`
- `TARGET_RUNTIME_QUALIFICATION: PASS`
- explicit `SIDE_EFFECT_STATE`
- `READY: YES`
- `BLOCKER: NO`

Production readiness is not claimed.
