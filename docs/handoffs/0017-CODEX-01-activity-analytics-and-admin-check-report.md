# Work 0017 CODEX-01 — Activity Analytics and monthly admin check report

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-01`
MODE: `BUILD / QUALIFICATION`
STATUS: `COMPLETE`
BRANCH: `agent/0017-meeting-activity-analytics`
DRAFT_PR: `#23`

## Outcome

`DEV QUALIFIED — WORK 0017 MEETING ACTIVITY ANALYTICS`

`LOGIC_VALIDATION: PASS`

`TARGET_RUNTIME_QUALIFICATION: PASS`

`SIDE_EFFECT_STATE: GUARDED`

`READY: YES`

`BLOCKER: NO`

The Activity Analytics page and the single binary `月次管理反映済み` control were
implemented and qualified in the existing private synthetic DEV installation.
No production rollout, Gemini/File Search call, trigger enablement, or new Web
App deployment was performed.

## Deterministic validation

- focused Activity Analytics server/UI suites: `36/36 PASS`;
- canonical `npm run check`: `230/230 PASS`;
- Apps Script source validation: 50 source files pass;
- HTML validation: 16 files pass;
- public facade: `26` allowlisted entry points;
- `git diff --check`: PASS;
- the final scoped diff was reviewed before delivery.

The deterministic coverage proves all period modes, Tokyo Business Date
consumption, fiscal boundaries, cumulative aggregation, dimensions and filters,
unset buckets, exact metrics before display caps, stable ordering, omitted
counts, no Meeting Doc-body adapter use, append-only/idempotent migration,
admin-check optimistic behavior and Audit redaction, and accessible table/empty
states.

## Schema and source delivery

- the existing Backend remains exactly five sheets;
- `Meeting_Index` gained only the three `Admin_Check_*` columns at the end;
- the existing four Meeting rows, IDs, source files, counters, statuses, and AI
  metadata were preserved;
- Settings `SCHEMA_VERSION` advanced from 4 to 5 and no other Settings value or
  counter changed;
- `KSP_INSTALLATION_STATE_JSON` was read back as schema 5 with `DEV`,
  `Asia/Tokyo`, AI sync disabled, and the existing resource mapping preserved;
- the physical Knowledge Exports resource was already present exactly once under
  its configured parent and was not recreated;
- the private setup function was not exposed through a wrapper or API
  executable. The bounded append-only migration was applied through the existing
  Backend and Project Settings surfaces and verified by authoritative readback.

The exact tested deployable source was synchronized once and read back exactly:
`67/67` files. One immutable Apps Script version, version `36`, was created. The
positively identified existing private Web App was updated in place and retained
Web app type, deploying-user execution, and Only myself access. No second Web
App deployment was created, and Library deployments were left untouched.

## Target-runtime qualification

### Analytics

- the private Web App rendered Activity Analytics from actual Meeting_Index rows;
- monthly aggregation rendered one `2026-08` bucket with `4` Meetings, `4`
  Active Meetings, `2` distinct counterparties, and `2` open follow-ups;
- the selected breakdown switched from Counterparty Type (`GP: 3`,
  `LP_ASSET_OWNER: 1`) to Team (`OPT-TEAM-001: 2`, `未設定: 2`);
- an exact Counterparty Entity filter returned one target Meeting and the
  accessible drill table showed exactly one row with matching headline count;
- fiscal-year aggregation rendered `FY2026` with the expected `4` Meetings;
- the rendered desktop page showed the dependency-free SVG chart and its
  accessible tabular equivalents. No Meeting Doc body was opened or read.

### Monthly admin check

- one existing synthetic Meeting with blank/false baseline state was reused;
- `月次管理反映済み=true` was set exactly once and persisted after Web App
  reload;
- the first new Audit event was one successful metadata-only admin-check event
  with exactly `Admin_Check_Completed,Admin_Check_Updated_At,Admin_Check_Updated_By`;
- the normal Meeting Version, Updated fields, Doc metadata/content, follow-up
  content, and AI fields remained unchanged;
- the state was restored to false exactly once for a clean final state, producing
  the expected second admin-check Audit event and no other mutation.

## Final integrity

- Backend sheet count: 5;
- Meeting rows: 4, with unique stable IDs;
- GP Master, Option Master, Pitchbook Index, and all non-schema Settings values
  matched the pre-qualification snapshot;
- the target source Doc metadata was unchanged;
- Audit increased from 62 to 64 rows only through the two expected admin-check
  events; all prior Audit rows remained unchanged;
- both admin-check Audit payloads contain only the three admin-check fields and
  no body, follow-up, Doc, Version, normal Updated, or AI metadata;
- `AI_SYNC_ENABLED` remains false, no Gemini/File Search call occurred, and the
  Apps Script trigger list remains at zero;
- no duplicate Meeting row/file, permission mutation, Library deployment
  mutation, or unexpected counter/resource mutation was observed.

## CODEX-02 finalization

CODEX-02 verified the ChatGPT client repair and closed the remaining
Counterparty Type filter defect. The repaired client reads
`filterOptions.counterpartyTypes`, and its UI contract regression passes.

- focused Activity Analytics suite: `8/8 PASS`;
- canonical `npm run check`: `231/231 PASS`;
- public facade: `26`; exact tested source readback: `67/67`;
- immutable version `37` was created once and the same private Web App was
  updated in place with Web app / deploying-user / Only myself settings;
- the live filter showed `GP` and `LP_ASSET_OWNER`, narrowed to one target for
  `LP_ASSET_OWNER`, restored to four after clearing, and retained the
  Counterparty Type (`GP: 3`, `LP_ASSET_OWNER: 1`) to Team (`OPT-TEAM-001: 2`,
  `未設定: 2`) dimension behavior;
- final read-only integrity remained PASS: five Backend sheets, schema 5,
  unchanged records/files/settings/counters/AI state, 64 Audit rows, zero
  triggers, and unchanged Library deployments.

## Delivery

PR #23 remains Draft / Open / unmerged for ChatGPT final review and merge.
