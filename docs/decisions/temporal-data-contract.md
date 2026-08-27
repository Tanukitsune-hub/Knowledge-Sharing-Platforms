# Temporal data contract

Status: `PROPOSED — activate after Work 0016 is accepted`

Work: `0022`

## Decision

Knowledge Sharing Platforms shall use one repository-wide temporal contract. Feature-specific date/time algorithms are not authoritative.

The application distinguishes four temporal kinds:

| Kind | Meaning | Canonical representation | Timezone rule |
|---|---|---|---|
| Business Date | Meeting/Pitchbook calendar date and Date From/To filters | `YYYY-MM-DD` | interpret `Date` or timestamp inputs in `KSP_DEFAULTS.TIMEZONE` |
| Business Time | Meeting clock time | `HH:mm` | interpret `Date` or timestamp inputs in `KSP_DEFAULTS.TIMEZONE` |
| Instant | Created/Updated/Audit/AI/claim execution timestamp | UTC ISO-8601 with milliseconds, e.g. `2026-08-27T12:34:56.789Z` | normalize to UTC |
| Duration / interval | TTL, retry delay, trigger interval, timeout | integer in the explicitly named unit | no timezone |

`KSP_DEFAULTS.TIMEZONE` and the Apps Script manifest timezone must agree. The current accepted timezone is `Asia/Tokyo`.

## Canonical production helpers

Work 0022 shall establish one generic production implementation for at least:

- `kspCanonicalBusinessDate_()`;
- `kspCanonicalBusinessTime_()`;
- `kspCanonicalInstantIso_()`.

Required behavior:

### Business Date

- exact valid `YYYY-MM-DD` string -> unchanged;
- Apps Script / Sheets `Date` object -> formatted in `KSP_DEFAULTS.TIMEZONE`;
- strict ISO timestamp with `Z` or offset -> parsed as an instant, then formatted in `KSP_DEFAULTS.TIMEZONE`;
- invalid, ambiguous locale dates such as `08/09/2026` -> rejected or returned as invalid according to the caller contract;
- never derive a business date with UTC calendar getters.

### Business Time

- exact valid `HH:mm` string -> unchanged;
- Sheets `Date` object or strict ISO timestamp -> formatted as `HH:mm` in `KSP_DEFAULTS.TIMEZONE`;
- invalid or ambiguous text -> rejected or returned as invalid according to the caller contract;
- never derive business time with UTC hour/minute getters.

### Instant

- valid `Date` or strict ISO timestamp -> normalized with UTC `toISOString()`;
- a date-only value is not silently promoted to an instant;
- instant comparisons must not be mixed with Business Date/Time comparisons.

## Physical storage and migration

The physical Google Sheets cell may be a string or a Sheets `Date` object. Domain, search, Audit, Export, and AI code must not depend on that physical representation.

Work 0022 shall not bulk-rewrite historical Date/Time cells merely to make their physical types uniform. Existing records remain authoritative. Normalize at the read/compare/serialization boundary and preserve untouched cells during metadata-only writes.

A data migration is permitted only if target-runtime evidence proves that boundary normalization cannot provide a stable contract. Such a migration requires a new explicit decision.

## Required propagation

The generic contract applies to all of the following:

- Meeting and Pitchbook registration/retry/fingerprints;
- maintenance search, sort, reopen, edit, status change, and optimistic-concurrency read models;
- Meeting and Pitchbook Audit snapshots and changed-field detection;
- Knowledge Export filtering, revision tokens, rendering, and filenames where temporal values participate;
- deterministic AI/File Search metadata including `date_key`;
- GP/Entity workspace and relationship displays;
- upcoming Work 0017 monthly/quarterly/yearly/fiscal analytics;
- setup/diagnostics and target-runtime readback;
- all deterministic fixtures and fake adapters.

## Compatibility

Feature-specific helpers may remain temporarily as private compatibility wrappers only when they delegate to the generic implementation and contain no independent parsing/formatting algorithm. New code must call the generic helpers directly.

Examples of legacy helpers to remove or reduce to wrappers include:

- `kspCanonicalPitchbookDateKey_()`;
- `kspMeetingCellDate_()`;
- `kspKnowledgeExportDate_()`;
- temporal branches inside `kspMaintenanceCellText_()`.

## Static and test enforcement

`npm run check` shall include a temporal-contract validation gate. At minimum it must detect:

- duplicate production business-date/time algorithms;
- UTC calendar getters used to derive Business Date/Time;
- raw Meeting/Pitchbook `Date` or `Time` serialization at known Audit/Export/AI boundaries;
- test-only production temporal business logic;
- missing mixed-representation regression coverage.

Tests must cover equivalent representations, year/month boundaries, Tokyo-midnight behavior, time-only Sheets values, true date/time changes, unchanged metadata edits, search/sort, Audit, Export, and AI metadata.

## Audit rule

Audit compares canonical semantic values, not physical cell types. Equivalent representations of the same Business Date/Time must not appear in `Changed_Fields`.

Existing historical Audit rows are immutable evidence and shall not be rewritten or deleted.

## Deployment order

Work 0022 executes immediately after Work 0016 is accepted and before Work 0017 analytics. Analytics must not be built on an unstable temporal contract.

## Non-goals

- no user-selectable timezone;
- no company production rollout;
- no billing-enabled Gemini/File Search call;
- no historical bulk rewrite;
- no analytics implementation;
- no new Backend sheet or schema solely for this contract.
