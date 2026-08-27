# Work 0022 — Temporal data contract hardening

Status: `PREPARED — execute immediately after Work 0016 acceptance, before Work 0017`

Mode: `BUILD / QUALIFICATION`

Primary decision: `docs/decisions/temporal-data-contract.md`

## 1. Primary outcome

Eliminate representation-dependent Date/Time behavior across the repository by establishing one common temporal contract and proving it across registration, maintenance, Audit, search, Export, deterministic AI metadata, and the actual private Apps Script Web App.

This Work is complete when a Sheets `Date` object, a canonical business-date/time string, and a strict ISO timestamp that represent the same semantic value produce identical application behavior.

## 2. Why this Work is before analytics

Work 0017 will aggregate Meeting activity by month, quarter, calendar year, fiscal year, custom range, and cumulative period. Building those calculations before temporal normalization would encode existing representation drift into analytics and create immediate rework.

Work 0022 therefore executes after Work 0016 is accepted and before Work 0017, even though the Work ID was assigned after the existing 0017–0021 planning IDs.

## 3. GitHub-verified risk inventory

The following current patterns are already confirmed and form the minimum audit surface:

| Area | Current pattern / risk | Required direction |
|---|---|---|
| Core timezone | `KSP_DEFAULTS.TIMEZONE = Asia/Tokyo`; manifest also uses `Asia/Tokyo` | retain one source-of-truth contract and validate agreement |
| Pitchbook Date | `kspCanonicalPitchbookDateKey_()` correctly formats `Date` in configured timezone but is feature-named | move algorithm to generic Business Date helper; optional compatibility wrapper only |
| Meeting Date | `kspMeetingCellDate_()` depends on the Pitchbook-named helper | generic helper directly or thin wrapper |
| Maintenance Date | `kspMaintenanceCellText_(..., 'date')` delegates to the Pitchbook helper | generic Business Date contract |
| Maintenance Time | `kspMaintenanceCellText_(..., 'time')` uses UTC hours/minutes | replace with configured-timezone Business Time helper |
| Meeting Audit | Work 0016 exposed raw `Date`/`Time` representation drift | canonical snapshot values and unchanged-field regression |
| Pitchbook Audit | already canonicalizes Date | migrate to the generic helper without changing semantics |
| AI source metadata | Meeting/Pitchbook `dateKey` currently uses `String(row.Date)` in core/feature-freeze paths | canonical Business Date metadata |
| Knowledge Export | filtering uses a helper, but revision tokens include raw `Time`; Updated_At uses a generic cell serializer | canonical Date/Time/Instant tokens |
| Search/sort/read models | several paths normalize Date, with separate helper names | all route through the common contract |
| Test fixtures | many rows use canonical strings, while target Sheets may return `Date` objects | mixed-representation matrix mandatory |
| Live adapters | `getValues()` returns physical Sheets values unchanged | domain boundaries must tolerate and canonicalize physical representation |

The implementation must run an automated full-tree inventory before patching and add any additional confirmed temporal boundary to this matrix/report. The above list is a minimum, not a maximum.

## 4. Temporal field classification

### Business Date

At minimum:

- `Meeting_Index.Date`;
- `Pitchbook_Index.Date`;
- search/export/query `Date_From` and `Date_To`;
- AI/File Search `date_key`;
- filename/fingerprint date components;
- Work 0017 period derivation inputs.

Canonical value: `YYYY-MM-DD` in `KSP_DEFAULTS.TIMEZONE`.

### Business Time

At minimum:

- `Meeting_Index.Time`;
- Meeting Doc/render/read-model time;
- Audit and Export time values.

Canonical value: `HH:mm` in `KSP_DEFAULTS.TIMEZONE`.

### Instant

At minimum:

- `Created_At` / `Updated_At`;
- `Event_Timestamp`;
- `AI_Indexed_At`;
- retry/claim/operation timestamps;
- report start/finish timestamps.

Canonical value: UTC ISO-8601 with milliseconds.

### Duration / interval

- lock timeouts;
- retry delay / TTL;
- cache expiration;
- trigger interval.

Canonical value: integer with the unit stated in the field/constant name. These must not enter date/time formatting helpers.

## 5. Implementation design

### 5.1 Generic source module

Add one core private module, expected path:

`src/05_TemporalContracts.gs`

Expected private helpers:

- `kspCanonicalBusinessDate_(value)`;
- `kspCanonicalBusinessTime_(value)`;
- `kspCanonicalInstantIso_(value)`;
- strict validation/parsing helpers where necessary.

All helpers remain private with trailing underscores.

### 5.2 Strict input behavior

Business Date accepts:

1. exact valid `YYYY-MM-DD`;
2. valid `Date` object;
3. strict ISO timestamp with `Z` or explicit offset.

Business Time accepts:

1. exact valid `HH:mm`;
2. valid `Date` object;
3. strict ISO timestamp with `Z` or explicit offset.

Do not accept locale-dependent text such as `8/29/2026` or rely on implementation-dependent `Date.parse()` behavior for ambiguous strings.

### 5.3 Compatibility and replacement

Refactor current feature-specific helpers/callers so the algorithm exists only once.

- `kspCanonicalPitchbookDateKey_()` may remain temporarily only as a thin delegate;
- `kspMeetingCellDate_()` may remain temporarily only as a thin delegate;
- `kspKnowledgeExportDate_()` may remain as a semantic wrapper only;
- `kspMaintenanceCellText_()` temporal branches must delegate;
- no new parallel algorithm is allowed.

### 5.4 Boundary propagation

Apply the contract to:

1. Meeting/Pitchbook input normalization and fingerprints;
2. physical Sheets read models;
3. search/filter/sort;
4. edit/status-change unchanged-field behavior;
5. Audit snapshots and changed-field detection;
6. Knowledge Export filters, revision tokens, render models, and timestamps;
7. core and feature-freeze AI metadata;
8. GP/Entity workspace and relationship dates;
9. diagnostics/readback;
10. all current and future period analytics inputs.

### 5.5 No historical rewrite by default

Do not rewrite historical Date/Time cells merely to change their physical type. The application must remain correct when physical values are mixed.

Metadata-only updates must preserve untouched Date/Time cells and types. True Date/Time changes may write the canonical user value through existing bounded adapters.

## 6. Static enforcement

Add a temporal validator to the canonical check, expected path:

`scripts/validate-temporal-contract.cjs`

Expected checks include:

- one production definition for each generic canonical helper;
- no UTC calendar getters used to derive Business Date/Time;
- no raw `String(row.Date)` / `String(row.Time)` at known Audit, Export, AI, and search boundaries;
- no raw Meeting/Pitchbook Date/Time in Audit snapshots;
- legacy helpers contain delegation rather than independent algorithms;
- tests load production temporal helpers rather than reproducing them;
- required regression files/cases exist.

The validator may use a narrow allowlist for legitimate instant operations such as retention calculation. It must not ban all UTC APIs indiscriminately.

## 7. Deterministic evidence matrix

### 7.1 Business Date equivalence

Prove identical output for:

- `'2026-08-29'`;
- `new Date('2026-08-28T15:00:00.000Z')` (Tokyo midnight);
- strict ISO timestamp string `'2026-08-28T15:00:00.000Z'`;
- UTC midnight that remains the same Tokyo calendar date;
- month/year boundary cases;
- invalid Date and ambiguous locale text rejection.

### 7.2 Business Time equivalence

Prove identical `14:30` for:

- `'14:30'`;
- a Sheets-like Date object representing 14:30 in Tokyo;
- a strict ISO timestamp for the same instant;
- invalid time rejection.

### 7.3 Cross-layer stability

For equivalent physical representations prove:

- Meeting and Pitchbook exact date search returns the same records;
- sort order is stable;
- Audit does not report Date/Time as changed when semantic values are unchanged;
- true Date/Time changes are reported;
- Export preview fingerprint/revision token is stable;
- AI `date_key` is identical;
- Meeting/Pitchbook filenames/fingerprints do not drift;
- workspace/relationship display dates agree.

### 7.4 Instant stability

Prove Date and equivalent ISO instant normalize to one UTC ISO value, while date-only values are rejected as instants.

## 8. Target-runtime qualification

Use the existing private synthetic DEV environment after Work 0016 is accepted.

Minimum campaign:

1. read back existing synthetic Meeting and Pitchbook Date/Time physical types and canonical values;
2. update no schema and create no new record solely for this Work;
3. reuse one existing synthetic Meeting for one harmless non-identity edit with unchanged Date/Time;
4. verify the new Audit excludes Date/Time and uses canonical Before/After values;
5. exact date-range search returns the target once;
6. Knowledge Export Preview returns the same target/date;
7. deterministic AI metadata produces canonical `date_key` without calling Gemini/File Search;
8. read-only GP/Entity/relationship displays agree;
9. final integrity confirms no duplicate/data migration/trigger/permission/AI-store drift.

If Work 0016 CODEX-04 already supplies strong direct Audit evidence for unchanged Date/Time, it remains accepted but does not replace the broader Search/Export/AI/time-value campaign.

## 9. Side-effect boundary

Authorized after deterministic PASS:

- one exact source sync;
- one immutable version;
- one in-place update of the positively identified existing private Web App;
- one harmless edit of an existing synthetic Meeting if needed for the campaign.

Not authorized:

- schema version change solely for helper refactoring;
- historical Date/Time cell rewrite;
- new Backend sheet;
- new Web App deployment;
- Library deployment mutation;
- trigger enablement;
- Gemini/File Search billing/index/query calls;
- company/confidential data;
- production rollout.

## 10. Completion

Complete only when:

- full-tree temporal inventory is recorded;
- generic helpers and all confirmed callsites are migrated;
- static temporal validator is part of `npm run check`;
- deterministic mixed-representation matrix passes;
- target-runtime Search/Audit/Export/AI/date-time evidence passes;
- public facade is unchanged unless separately authorized;
- final integrity passes;
- no BLOCKER remains.

Expected classification:

`DEV QUALIFIED — WORK 0022 TEMPORAL DATA CONTRACT HARDENING`

Production readiness is not claimed.
