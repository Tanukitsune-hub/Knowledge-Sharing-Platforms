# Work 0022 — CODEX-01 temporal contract hardening

WORK_ID: `0022`
Dispatch ID: `0022-CODEX-01`
BALL: `CHATGPT`
STATUS: `PREPARING — DO NOT RUN BEFORE ACTIVATION`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `ACTIVATION_REQUIRED`

Draft PR: `ACTIVATION_REQUIRED`

Exact ref: `ACTIVATION_REQUIRED — final accepted main after Work 0016 merge`

Mode: `BUILD / QUALIFICATION`

Route: `C — cross-cutting source hardening, static enforcement, exact source synchronization, and bounded authenticated target-runtime qualification`.

Recommended model: `Sol High`.

## Activation requirement

This instruction is prepared but not executable yet.

Start only after ChatGPT changes the header to:

- BALL `CODEX`;
- STATUS `READY`;
- a concrete implementation branch;
- a concrete Draft PR;
- an exact accepted main SHA containing final Work 0016.

Do not run in parallel with Work 0016 CODEX-04.

## Read first

Read all applicable `AGENTS.md` / `AGENTS.override.md`, then:

1. `docs/handoffs/0022-instruction.md`;
2. `docs/decisions/temporal-data-contract.md`;
3. `docs/planning/work0022-temporal-data-contract-hardening.md`;
4. `docs/decisions/target-runtime-first-development.md`;
5. `docs/operations/apps-script-web-app-deployment.md`;
6. accepted Work 0016 reports and final source.

The temporal decision is fixed. Do not reopen the basic type model.

## Primary outcome

Create one stable temporal contract so equivalent physical representations behave identically across every current product boundary.

Canonical kinds:

- Business Date: `YYYY-MM-DD` in `KSP_DEFAULTS.TIMEZONE`;
- Business Time: `HH:mm` in `KSP_DEFAULTS.TIMEZONE`;
- Instant: UTC ISO-8601 with milliseconds;
- Duration/interval: integer in the named unit.

## Phase A — full-tree inventory before implementation

Run an automated repository-wide inventory and record every production/test occurrence involving at least:

- `Date`, `Time`, `Date_From`, `Date_To`;
- `Created_At`, `Updated_At`, `Event_Timestamp`, `AI_Indexed_At`;
- `dateKey` / `date_key`;
- `getUTC*`, `getFullYear`, `getHours`, `toISOString`, `Date.parse`, `new Date`;
- `Utilities.formatDate`;
- feature-specific temporal helpers;
- raw `String(row.Date)` / `String(row.Time)`;
- Audit snapshots, revision tokens, fingerprints, sort/filter functions, and test adapters.

Classify each occurrence as:

- Business Date;
- Business Time;
- Instant;
- Duration;
- non-temporal / safe.

Add the completed inventory to the CODEX-01 report. The existing plan inventory is a minimum and must not constrain discovery.

## Phase B — generic temporal implementation

Add one private core module, preferably:

`src/05_TemporalContracts.gs`

Implement at minimum:

- `kspCanonicalBusinessDate_(value)`;
- `kspCanonicalBusinessTime_(value)`;
- `kspCanonicalInstantIso_(value)`.

Required behavior:

### Business Date

- exact valid `YYYY-MM-DD` -> unchanged;
- valid `Date` -> `Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd')`;
- strict ISO timestamp with `Z` or explicit offset -> parse as instant and format in configured timezone;
- invalid Date / ambiguous locale text -> fail closed under the relevant caller contract;
- no UTC calendar getters.

### Business Time

- exact valid `HH:mm` -> unchanged;
- valid `Date` or strict ISO timestamp -> configured-timezone `HH:mm`;
- invalid/ambiguous input -> fail closed;
- no UTC hour/minute getters.

### Instant

- valid Date or strict ISO timestamp -> UTC `toISOString()`;
- date-only values are not silently promoted to instants.

Keep all helpers private. Do not expand the public facade.

## Phase C — migrate confirmed boundaries

Replace duplicate algorithms or reduce legacy helpers to thin delegates. At minimum review and migrate:

- `src/62_PitchbookIdentity.gs`;
- `src/30_MeetingCore.gs`;
- `src/100_MaintenanceCore.gs`;
- Meeting/Pitchbook Audit snapshots and changed fields;
- maintenance search/sort/result mapping;
- `src/140_AiSourceModels.gs`;
- `src/155_KnowledgeExportContracts.gs`;
- `src/181_FeatureFreezeSync.gs`;
- GP/Entity workspace and relationship displays;
- diagnostics/readback;
- all additional inventory findings.

Specific expected corrections:

- AI `dateKey` / `date_key` never use raw `String(row.Date)`;
- Export revision tokens never depend on physical Date/Time representation;
- Audit compares canonical semantic values;
- equivalent representations do not appear in `Changed_Fields`;
- true Date/Time changes remain observable;
- metadata-only writes preserve untouched physical Date/Time cells;
- Instant fields remain UTC ISO and are not passed through Business Date helpers.

Do not bulk-rewrite historical Sheets cells or historical Audit rows.

## Phase D — static enforcement

Add:

`scripts/validate-temporal-contract.cjs`

Wire it into `npm run check`.

The validator must fail for at least:

- duplicate production Business Date/Time parsing algorithms;
- UTC calendar getters used for Business Date/Time;
- raw Date/Time serialization at known Audit/Export/AI/search boundaries;
- feature-specific helpers that retain independent algorithms;
- test-only production temporal business logic;
- missing required temporal regression contracts.

Use a narrow allowlist for legitimate instant/retention operations. Do not globally ban UTC APIs.

Update `src/AGENTS.md` and `tests/AGENTS.md` with durable temporal rules only after the implementation and validator exist.

## Phase E — deterministic evidence

Add a mixed-representation matrix covering:

- canonical date string;
- Tokyo-midnight Date object;
- strict ISO timestamp string for the same instant;
- month/year boundary;
- invalid Date and ambiguous locale text;
- canonical time string;
- Sheets-like time Date object;
- strict ISO time instant;
- valid/invalid Instant normalization.

Cross-layer tests must prove:

1. Meeting/Pitchbook exact date search equivalence;
2. stable sort order;
3. unchanged Date/Time excluded from Audit;
4. true Date/Time changes included in Audit;
5. stable Export preview/revision fingerprint;
6. canonical core and feature-freeze AI `date_key`;
7. stable filename/fingerprint behavior;
8. workspace/relationship display consistency;
9. raw physical Date/Time cells are not rewritten by unrelated updates.

Test loaders may stub `Utilities.formatDate` as an external adapter, but must load all temporal business logic from production source.

Run focused tests, then:

- `npm run check`;
- `git diff --check`;
- public facade validation;
- one final full temporal diff/inventory review.

Do not synchronize Apps Script until all gates pass.

## Phase F — target-runtime qualification

Use the existing private synthetic DEV Web App and existing synthetic records.

Do not create a new Entity or Meeting solely for this Work.

After proving project/deployment identity:

1. sync the exact tested source once;
2. exact readback;
3. create one immutable version;
4. update the same existing private `WEB_APP` in place;
5. do not create a new deployment or touch Library deployments.

Bounded runtime campaign:

- inspect existing Meeting/Pitchbook physical Date/Time types and canonical values;
- reuse one existing synthetic Meeting;
- make one harmless non-identity edit with Date/Time unchanged;
- verify latest Audit excludes Date/Time and stores canonical Before/After temporal values;
- exact date-range search returns exactly the target;
- Knowledge Export Preview uses the same canonical date/time and stable revision state;
- deterministic AI metadata produces canonical `date_key` without Gemini/File Search;
- workspace/relationship dates agree;
- final integrity proves no duplicate, historical rewrite, unexpected Settings/Script Property/trigger/AI/store/permission mutation.

Existing strong Work 0016 Audit evidence may be retained, but broader Search/Export/AI/Time qualification remains required.

## Stop conditions

Stop for Strategy Reset if:

- a second temporal type model becomes necessary;
- generic helpers cannot represent an accepted field without destructive migration;
- a full-tree inventory reveals a material incompatible storage contract;
- the same target-runtime failure remains after one materially different bounded repair;
- target identity/deployment is ambiguous.

Do not stop merely because physical Sheets cells use mixed types; supporting that safely is the Work outcome.

## Non-goals

- Work 0017 analytics implementation;
- historical temporal cell migration;
- schema expansion solely for temporal helpers;
- user-selectable timezone;
- billing-enabled Gemini/File Search;
- triggers;
- production rollout.

## Delivery

Create:

`docs/handoffs/0022-CODEX-01-temporal-contract-hardening-report.md`

Update:

- `docs/handoffs/0022-report.md`;
- `docs/handoffs/0022-instruction.md`;
- `docs/handoffs/0022-dispatches.md`;
- decision/plan if actual inventory materially extends them;
- Draft PR body.

Commit and push all scoped source/tests/scripts/docs.
Keep the Draft PR Open / unmerged for ChatGPT final review.

On full PASS classify:

`DEV QUALIFIED — WORK 0022 TEMPORAL DATA CONTRACT HARDENING`

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS`;
- `SIDE_EFFECT_STATE: GUARDED`;
- `READY: YES`;
- `BLOCKER: NO`.

Production readiness is not claimed.
