# Temporal data contract

Status: `ACCEPTED / IMPLEMENTED — Work 0022 merged`

Work: `0022`

## Decision

Knowledge Sharing Platforms uses one repository-wide temporal contract. Feature-specific date/time algorithms are not authoritative.

The application distinguishes four temporal kinds:

| Kind | Meaning | Canonical representation | Timezone rule |
|---|---|---|---|
| Business Date | Meeting/Pitchbook calendar date and Date From/To filters | `YYYY-MM-DD` | interpret `Date` or strict timestamp inputs in `KSP_DEFAULTS.TIMEZONE` |
| Business Time | Meeting clock time | `HH:mm` | interpret `Date` or strict timestamp inputs in `KSP_DEFAULTS.TIMEZONE` |
| Instant | Created/Updated/Audit/AI/claim execution timestamp | UTC ISO-8601 with milliseconds | normalize to UTC |
| Duration / interval | TTL, retry delay, trigger interval, timeout | integer in the explicitly named unit | no timezone |

`KSP_DEFAULTS.TIMEZONE` and the Apps Script manifest timezone must agree. The accepted timezone is `Asia/Tokyo`.

## Canonical production helpers

The authoritative generic implementation is:

- `kspCanonicalBusinessDate_()`;
- `kspCanonicalBusinessTime_()`;
- `kspCanonicalInstantIso_()`.

### Business Date

- exact valid `YYYY-MM-DD` string -> unchanged;
- Apps Script / Sheets `Date` object -> formatted in `KSP_DEFAULTS.TIMEZONE`;
- strict ISO timestamp with `Z` or explicit offset -> parsed as an instant, then formatted in `KSP_DEFAULTS.TIMEZONE`;
- invalid or ambiguous locale dates such as `08/09/2026` -> invalid/fail closed according to caller contract;
- never derive a business date with UTC or local calendar getters.

### Business Time

- exact valid `HH:mm` string -> unchanged;
- Sheets `Date` object or strict ISO timestamp -> formatted as `HH:mm` in `KSP_DEFAULTS.TIMEZONE`;
- invalid or ambiguous text -> invalid/fail closed according to caller contract;
- never derive business time with UTC or local hour/minute getters.

### Instant

- valid `Date` or strict ISO timestamp -> normalized with UTC `toISOString()`;
- date-only/time-only values are not silently promoted to instants;
- instant comparisons must not be mixed with Business Date/Time comparisons.

## Physical storage and migration

The physical Google Sheets cell may be a string or a Sheets `Date` object. Domain, search, Audit, Export, AI, workspace, relationship, and analytics code must not depend on that physical representation.

Historical Date/Time cells are not bulk-rewritten merely to make physical types uniform. Normalize at the read/compare/serialization boundary and preserve untouched cells during metadata-only writes.

A future data migration is permitted only if target-runtime evidence proves boundary normalization cannot provide a stable contract. That requires a new explicit decision.

## Required propagation

The generic contract applies to:

- Meeting and Pitchbook registration/retry/fingerprints;
- maintenance search, sort, reopen, edit, status change, and optimistic-concurrency read models;
- Meeting and Pitchbook Audit snapshots and changed-field detection;
- Knowledge Export filtering, revision tokens, rendering, filenames, and Audit timestamps;
- deterministic AI/File Search metadata including `date_key`;
- retry/claim and execution instants;
- GP/Entity workspace and relationship displays;
- setup/diagnostics and target-runtime readback;
- Work 0017 and later period analytics;
- deterministic fixtures and fake adapters.

## Compatibility

Feature-specific helpers may remain only as private compatibility wrappers that delegate to the generic implementation and contain no independent parsing/formatting algorithm.

Legacy wrappers include:

- `kspCanonicalPitchbookDateKey_()`;
- `kspMeetingCellDate_()`;
- `kspKnowledgeExportDate_()`;
- temporal branches inside `kspMaintenanceCellText_()`.

New code uses the generic contract directly whenever practical.

## Static and test enforcement

`npm run check` includes `scripts/validate-temporal-contract.cjs`.

The gate enforces at least:

- one production implementation of the canonical Business Date/Time/Instant helpers;
- no duplicate production business-date/time algorithms;
- no UTC/local calendar getters used to derive Business Date/Time outside explicitly allowed instant/duration logic;
- no raw Meeting/Pitchbook Date/Time serialization at known Audit/Export/AI/search boundaries;
- production temporal logic is not shadowed by test-only implementations;
- legacy helpers remain thin delegates;
- mixed-representation regression coverage is present;
- Apps Script manifest timezone remains `Asia/Tokyo`.

Tests cover equivalent representations, Tokyo date boundaries, time-only Sheets values, true date/time changes, unchanged metadata edits, search/sort, Audit, Export, and deterministic AI metadata.

## Audit rule

Audit compares canonical semantic values, not physical cell types. Equivalent representations of the same Business Date/Time must not appear in `Changed_Fields`.

Existing historical Audit rows are immutable evidence and shall not be rewritten or deleted.

## Work 0022 acceptance evidence

- canonical repository validation `222/222 PASS`;
- focused temporal/maintenance regressions `68/68 PASS`;
- static temporal validator PASS;
- exact tested source readback `63/63`;
- public facade `24`;
- target-runtime qualification PASS on existing private synthetic DEV Web App;
- immutable Apps Script version `35` and same existing Web App updated in place;
- exact date search, Audit, Knowledge Export Preview, GP Workspace/relationship and Pitchbook read-only checks PASS;
- Backend remained five sheets, schema version `4`;
- no historical rewrite, Gemini/File Search call, trigger, schema expansion, new deployment, or unrelated mutation.

PR #22 was merged with commit `3eb5e4d26e32cc8356748e1f1728bac8b1dd9866`.

## Deployment order

Work 0022 is accepted and completion-latched. Work 0017 analytics executes next and must consume this contract for month/quarter/calendar-year/fiscal-year/custom/cumulative period calculations.

## Non-goals

- no user-selectable timezone;
- no company production rollout;
- no billing-enabled Gemini/File Search call;
- no historical bulk rewrite;
- no analytics implementation within Work 0022;
- no new Backend sheet or schema solely for the temporal contract.
