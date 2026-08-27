# Work 0018 — Relationship Explorer

WORK_ID: `0018`

Status: Planned after Work 0017

Mode: `BUILD`

## Primary outcome

Make the accepted Meeting ↔ Pitchbook stable-ID relationships easy to traverse in both directions without introducing a relation sheet or duplicate data store.

Users can answer:

- which materials were associated with this Meeting;
- which Meetings referred to this Pitchbook;
- how the relationship changes across time, entity, GP, Asset Class, and Fund / Strategy;
- which links are Inactive or unresolved.

## Authoritative relationship

The canonical relationship remains:

```text
Meeting_Index.Related_Pitchbook_IDs
```

Reverse lookup scans/indexes Meeting rows by Pitchbook `Document_ID`. No sixth/special relation sheet is added.

## Product surfaces

### Meeting relationship panel

For one Meeting show:

- Meeting identity/date/counterparty;
- related Pitchbook Document IDs;
- resolved filename, GP, Asset Class, Fund / Strategy, status, and Drive link;
- Inactive badge;
- unresolved ID badge rather than silent omission.

### Pitchbook reverse relationship panel

For one Pitchbook show all Meetings that reference it:

- date;
- Meeting ID;
- Counterparty Type / Entity;
- Related GP context;
- Asset Class / Team / Fund / Strategy;
- status;
- Meeting Doc link.

### Explorer list

Provide filters:

```text
Date range
Counterparty Type
Counterparty Entity
Related GP
Pitchbook GP
Asset Class
Fund / Strategy
Meeting Status
Pitchbook Status
```

List-first UX is preferred. A node-link graph is not required unless actual use proves it clearer and worth the browser complexity.

## Edit boundary

Initial Relationship Explorer is read-only.

- relationship add/remove continues through the existing Meeting edit workflow;
- Explorer may link to `Edit Meeting`;
- do not create a second mutation path for the same canonical field;
- do not mutate relationships merely by viewing/resolving them.

## Resolution rules

- resolve by immutable `Document_ID`, never Drive URL or filename;
- include Inactive targets and historical Meetings;
- preserve unresolved IDs;
- do not infer relationships from similar names, dates, or Fund / Strategy text;
- duplicate canonical IDs in one Meeting are prevented at write time;
- reverse lookup counts all matching Meeting rows before UI caps.

## Entity behavior

- GP Meetings and non-GP Meetings use the Work 0016 Counterparty fields;
- a non-GP Meeting can link GP Pitchbooks through `Related_GP_IDs` and explicit `Related_Pitchbook_IDs`;
- the relationship panel must distinguish Meeting counterparty from Pitchbook GP.

## Reuse in later Work

The server-side relationship resolver and safe response model should be reusable by:

- Work 0019 Entity Workspace;
- Fund / Strategy drill-down;
- Knowledge Search citation/context display;
- later Meeting preparation views.

Avoid UI-only relationship logic that cannot be reused.

## Shortest target-runtime slice

1. open the accepted synthetic Meeting with one Pitchbook link;
2. resolve the Meeting → Pitchbook panel;
3. open the Pitchbook reverse panel and find exactly the same Meeting;
4. verify stable IDs, names/statuses, and safe links;
5. exercise one Inactive or unresolved synthetic fixture if safely available without mutating authoritative data;
6. final read-only integrity confirms no Index/Audit/Drive/Script Property change.

## Logic validation

- forward/reverse resolution;
- deterministic ordering;
- full counts versus bounded lists;
- Inactive preservation;
- unresolved-ID visibility;
- non-GP counterparty + GP Pitchbook distinction;
- safe link handling;
- no inference by names;
- read-only adapter contract;
- public facade allowlist;
- `npm run check` and `git diff --check`.

## Non-goals

- relation sheet/database;
- graph visualization as a mandatory deliverable;
- automatic relationship inference;
- direct Explorer mutation path;
- AI-generated relationship summary;
- bulk link repair;
- production rollout.

## Completion latch

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: DISABLED for application data
READY: YES
BLOCKER: NO
```
