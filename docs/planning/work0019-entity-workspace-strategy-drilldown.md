# Work 0019 — Entity Workspace and Fund / Strategy drill-down

WORK_ID: `0019`

Status: Planned after Work 0018

Mode: `BUILD`

## Primary outcome

Generalize the accepted GP Workspace into an Entity Workspace that works for GP, LP / Asset Owner, Nippon Life departments, group companies, Consultant / Gatekeeper, and Other counterparties, while adding a useful Fund / Strategy drill-down for GP-related activity.

This Work absorbs the previously vague “GP Workspace enhancement” idea. It does not create a separate static GP-comparison dashboard.

## Entity identity

Entity selection uses the Work 0016 composite identity:

```text
Counterparty_Type + ':' + Counterparty_ID
```

Selector flow:

```text
Entity Type
  -> Entity
```

Both Active and Inactive entities remain selectable for historical context, with clear status labels.

## Workspace semantics

### All entities

Show:

- entity name/type/status;
- exact direct Meeting counts;
- recent direct Meetings;
- Team / Asset Class / Meeting Type mix;
- follow-up items as informational records;
- Relationship Explorer results;
- latest activity date;
- browser print/PDF brief using the accepted Work 0015 pattern.

### GP entities

In addition show:

- Pitchbooks owned by that GP;
- Meetings where the GP is the direct counterparty;
- non-GP Meetings where the GP appears in `Related_GP_IDs`;
- direct versus related activity clearly separated;
- Fund / Strategy drill-down across Meetings and Pitchbooks.

### Non-GP entities

Show:

- direct Meetings where the entity is the counterparty;
- related GP context;
- linked Pitchbooks through explicit Meeting relationships;
- no inferred source ownership.

## Fund / Strategy aggregation

Use the existing free-text `Fund_Strategy` values.

For each exact non-blank value show:

- Meeting count;
- Pitchbook count;
- latest logical date;
- direct/related activity where applicable;
- open follow-up count;
- relationship count.

Clicking one value drills to:

- matching Meetings;
- matching Pitchbooks;
- their explicit relationships;
- safe source links.

Initial grouping is exact trimmed text with deterministic case-insensitive sorting. Do not silently fuzzy-merge variants such as:

```text
Infrastructure V
Infra V
Infrastructure Fund V
```

If actual data quality later justifies canonicalization, add a Fund / Strategy Master or alias decision separately. Work 0019 does not introduce one.

## GP Workspace compatibility

The Work 0015 GP Workspace route and behavior remain available or redirect cleanly to the GP-mode Entity Workspace.

Do not maintain two divergent aggregation implementations. Reuse one server read model with entity-mode specialization.

## Timeline

Provide one compact unified activity timeline for the selected entity:

- Meetings;
- Pitchbooks when applicable;
- explicit relationship markers;
- status and source links.

This is an operational timeline, not the full analytics charting surface from Work 0017.

## Print / PDF

Reuse browser-native `window.print()` and a bounded A4 layout. Do not generate Drive report artifacts.

The print brief may include:

- entity header/snapshot;
- latest activities;
- key Fund / Strategy rows;
- follow-ups;
- relationships;
- omitted-count indicators.

## Shortest target-runtime slice

1. open one GP entity and confirm Work 0015 parity;
2. show one direct GP Meeting, one Pitchbook, and one Fund / Strategy row;
3. open one non-GP entity and show direct Meeting + Related GP + linked Pitchbook;
4. drill into one Fund / Strategy;
5. verify direct versus related counts against Backend;
6. invoke the bounded print surface once;
7. final read-only integrity.

## Logic validation

- composite entity selection;
- Active/Inactive behavior;
- direct versus related GP aggregation;
- Fund / Strategy exact grouping;
- deterministic ordering/caps/omitted counts;
- Relationship Explorer reuse;
- GP Workspace compatibility;
- non-GP behavior without inferred Pitchbook ownership;
- safe links and no Meeting-body reads;
- bounded print model;
- public surface;
- `npm run check` and `git diff --check`.

## Non-goals

- static multi-entity comparison table;
- AI-generated entity summary;
- fuzzy Fund/Strategy merge or Master;
- entity alias/merge;
- follow-up task workflow;
- new Backend sheet/database;
- Drive-generated report;
- production rollout.

## Completion latch

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: DISABLED for application data
READY: YES
BLOCKER: NO
```
