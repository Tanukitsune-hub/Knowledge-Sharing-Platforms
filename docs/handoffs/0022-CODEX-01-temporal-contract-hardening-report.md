# Work 0022 — Temporal data contract hardening report

WORK_ID: `0022`
DISPATCH_ID: `0022-CODEX-01`
MODE: `BUILD / QUALIFICATION`
STATUS: `COMPLETE`

## Outcome

`DEV QUALIFIED — WORK 0022 TEMPORAL DATA CONTRACT HARDENING`

`LOGIC_VALIDATION: PASS`

`TARGET_RUNTIME_QUALIFICATION: PASS`

`SIDE_EFFECT_STATE: GUARDED`

`READY: YES`

`BLOCKER: NO`

Work 0016 remained accepted, merged, and completion-latched. It was not
reopened. Work 0022 established one repository-wide temporal contract while
preserving existing physical Sheets values and historical Audit rows.

## Full-tree temporal inventory

The repository-wide inventory was completed before implementation. The
confirmed boundary classes and disposition were:

| Boundary | Confirmed risk | Disposition |
| --- | --- | --- |
| Meeting and core date/time handling | UTC calendar getters, string-biased row matching, and raw Audit temporal values | Routed through the generic Business Date, Business Time, and Instant helpers. |
| Maintenance and Pitchbook | feature-specific date conversion, context comparison, search sorting, and Audit snapshots | Replaced with thin delegates to the generic contract; the retained UTC year arithmetic is duration/retention logic only. |
| Search, workspace, relationship, and diagnostics | mixed Sheets values could produce different display, filter, sort, or comparison results | Canonicalized mapping, comparison, and read-model boundaries. |
| Knowledge Export | raw temporal values in source filters, revision/read-model tokens, rendered output, filenames, and Audit metadata | Canonicalized Date, Time, and Instant values without creating an export during qualification. |
| AI and feature-freeze metadata | raw `dateKey`, retry timestamps, and claim timestamps | Canonicalized deterministic metadata and retry/claim instants; no Gemini/File Search call. |
| Runtime adapters | raw `now`/claim timestamps and Date/Time formatting assumptions | Routed through the same configured-timezone contract. |
| Test loaders and fixtures | test-only temporal helpers and string-only assumptions masked production behavior | Production helper is loaded by the harness; mixed string/Date/strict-ISO regressions were added. |
| Client/UI inputs | native `date`/`time` controls | Retained as input controls; no duplicate client temporal algorithm was found. |

No historical Date/Time cells or historical Audit rows were bulk-rewritten.

## Implementation

- Added `src/05_TemporalContracts.gs` as the single private helper family.
- Business Date and Business Time use `KSP_DEFAULTS.TIMEZONE` (`Asia/Tokyo`)
  for valid `Date` and strict ISO timestamp inputs and fail closed for invalid
  or ambiguous values.
- Instant values use canonical UTC ISO strings; date-only values are not
  promoted to instants.
- Migrated confirmed Meeting, Maintenance, Pitchbook, Search, Workspace,
  Knowledge Export, AI, retry, claim, relationship, and diagnostic boundaries.
- Removed test-loader implementations that could mask missing production
  behavior and added the static temporal-contract validator to `npm run check`.
- Updated the source and test instruction maps to require the shared contract.
- No schema, manifest, UI/public facade, Script Property, trigger, Gemini, or
  deployment architecture change was introduced for this refactor.

## Deterministic validation

- Focused temporal and maintenance regression suite: `68/68 PASS`.
- Canonical `npm run check`: `222/222 PASS`.
- Temporal static validator: `PASS` (`3` canonical helpers and `173`
  regression lines validated).
- Public facade: `24` public entry points and `398` private top-level
  functions; unchanged facade contract.
- `git diff --check`: `PASS`.
- The regression suite covers Tokyo boundary behavior, mixed Sheets-like Date
  values, strict ISO values, Audit canonicalization, Search/Export/AI mapping,
  and the pre-fix reference behavior.

## Source synchronization and deployment

- The exact tested deployable source was synchronized once.
- Remote source readback matched the tested local source: `63/63` normalized
  files.
- One immutable Apps Script version was created: version `35`.
- The positively identified existing private Web App was updated in place.
- Deployment readback showed the same Web app boundary, deploying-user
  execution, and Only myself access; the project contained `9` deployments and
  no second deployment was created.
- Library deployments were not changed.

## Target-runtime qualification

The existing authenticated synthetic DEV installation and existing synthetic
records were reused. No Entity, Meeting, Pitchbook, export artifact, or new
deployment was created by this Work.

- Physical temporal readback: the target Meeting Date was a numeric Sheets
  value displayed as canonical `2026-08-27`; its Time was blank. An existing
  non-empty Meeting Time was a numeric Sheets value displayed as `14:30`, and
  the sampled Pitchbook Date was also a numeric Sheets value. This confirms the
  mixed physical representation boundary was exercised without rewriting the
  cells.
- Meeting edit: one harmless non-identity field was edited once. Date and Time
  were not touched. The same Meeting identity remained, the saved heading
  advanced from Version 3 to Version 4, and the target remained Active.
- Exact date search: the retained `2026-08-27` to `2026-08-27` range with
  Meeting scope returned exactly one target.
- Audit: authoritative readback showed the latest successful Meeting update
  with `Internal_Participants,Version,Updated_At`; canonical Before/After Date
  values were equal and Time remained blank. Body and follow-up note content
  were absent from the snapshots.
- Knowledge Export Preview: one authorized Preview returned `Meeting: 1件`,
  `Pitchbook: 0件`, and success status for the same canonical date range.
  No Google Docs/PDF export action was invoked and no export artifact was
  created by Preview.
- Deterministic AI metadata: the Preview path explicitly remained
  Gemini-independent; its Audit row had no model ID, and `AI_SYNC_ENABLED`
  remained `FALSE`. No Gemini/File Search call occurred.
- GP Workspace/relationship: the existing synthetic GP Workspace loaded
  successfully in read-only mode and displayed canonical Meeting/Pitchbook
  dates and the existing relationship.
- Pitchbook read-only check: the existing list displayed canonical dates and
  stable Active/Pending states; no Pitchbook save was performed.

## Final integrity readback

- Backend contained exactly five sheets: `GP_Master`, `Option_Master`,
  `Meeting_Index`, `Pitchbook_Index`, and `Settings`.
- Current Backend row counts were 31 GP, 18 Option, 4 Meeting, 16 Pitchbook,
  and 19 Settings rows; the expected Work 0022 change was the single Meeting
  Version increment.
- Schema version remained `4`; `TEAM` seed values `PD` and `AE` each occurred
  once; Meeting and Pitchbook stable IDs were unique.
- The target Meeting remained one coherent Active row with one authoritative
  Doc, its structured metadata, relationship, follow-up flag, and canonical
  Date/Time read model.
- The target Pitchbook remained Active with its file and metadata intact.
- Audit readback contained metadata-only rows; no body, follow-up note, source
  bytes, prompt, answer, or Gemini model content was introduced.
- Only the expected bounded runtime operations were observed: one Meeting
  update and one Knowledge Export Preview. No source-file, Script Property,
  trigger, permission, AI/store, or Library deployment mutation was performed.

Shared Drive-specific qualification and billing-enabled Gemini/File Search
qualification remain external residual gaps. This report does not claim
production readiness.

## Delivery

PR `#22` remains Draft / Open / unmerged for ChatGPT final review and merge.

Final commit SHA is the pushed head of
`agent/0022-temporal-data-contract-hardening`.
