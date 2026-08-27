# Work 0018 — Relationship Explorer

WORK_ID: `0018`
DISPATCH_ID: `0018-CODEX-01`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary plan:

`docs/planning/work0018-relationship-explorer.md`

Accepted predecessors:

- Work 0016 Counterparty Entity foundation;
- Work 0022 repository-wide temporal data contract;
- Work 0017 Meeting Activity Analytics / schema 5.

## Primary outcome

Deliver one read-only `Relationship Explorer` page that makes the existing stable-ID Meeting ↔ Pitchbook relationship traversable in both directions without adding a relation sheet, duplicate store, inference layer, or second mutation path.

The canonical relationship remains only:

`Meeting_Index.Related_Pitchbook_IDs`.

## Fastest safe decisive action

Implement one coherent vertical slice:

relationship resolver/read model -> filters/full counts -> one read facade -> list/detail UI -> deterministic validation -> one exact Apps Script sync/version/in-place Web App update -> bounded read-only runtime campaign -> final integrity.

Do not split schema/server/UI/runtime into separate Works or dispatches.

## Fixed data contract

No schema change is required.

- Backend remains exactly five sheets;
- `KSP_SCHEMA_VERSION` remains `5`;
- no migration or new persistent columns;
- no new relation sheet/database/materialized graph;
- relationship identity is immutable Pitchbook `Document_ID` stored in `Related_Pitchbook_IDs`;
- reverse lookup scans/indexes Meeting rows by those explicit IDs;
- duplicate IDs within one Meeting remain prevented by the existing write path;
- unresolved IDs remain visible rather than being silently dropped;
- Inactive Meetings and Pitchbooks remain visible when they are in the explicit relationship set.

## Resolver/read model

Create one reusable private server-side relationship resolver suitable for later reuse by Work 0019.

Read only:

- `Meeting_Index`;
- `Pitchbook_Index`;
- `GP_Master`;
- `Option_Master`.

Never read Meeting Doc bodies, Pitchbook file bytes, Audit rows, Gemini/File Search, or any external index.

The response must support:

### Meeting -> Pitchbook

For each matching Meeting expose at least:

- Meeting ID;
- canonical Business Date / Time;
- Counterparty Type / ID / stable entity key;
- Related GP IDs;
- Meeting Asset Class / Team / Fund Strategy / Status;
- safe Meeting Doc link;
- exact full related Pitchbook count;
- bounded related Pitchbook items;
- omitted count.

Each related Pitchbook item exposes:

- Document ID;
- resolution state (`resolved` vs unresolved; duplicate target IDs fail closed);
- saved/original filename when resolved;
- Pitchbook GP;
- Pitchbook Asset Class;
- Pitchbook Fund / Strategy;
- Pitchbook Status including Inactive;
- canonical date;
- safe Drive link;
- an explicit unresolved badge/reason when not uniquely resolvable.

### Pitchbook -> Meeting

For each matching Pitchbook expose at least:

- Document ID / filename;
- Pitchbook Date / GP / Asset Class / Fund Strategy / Status;
- safe Drive link;
- exact full reverse Meeting count;
- bounded referencing Meeting items;
- omitted count.

Each reverse Meeting item exposes:

- Meeting Date / ID;
- Counterparty Type / ID / entity key;
- Related GP IDs;
- Meeting Asset Class / Team / Fund Strategy / Status;
- safe Meeting Doc link.

Reverse lookup counts all explicit references before UI caps.

## Filter semantics

Support these filters:

- Meeting Date From / To — canonical Meeting Business Date, inclusive;
- Counterparty Type — exact Meeting-side type;
- Counterparty Entity — exact stable `TYPE:ID` identity;
- Related GP — exact membership in Meeting `Related_GP_IDs`;
- Pitchbook GP — exact resolved Pitchbook GP ID;
- Asset Class — exact match on either Meeting or resolved Pitchbook Asset Class; response must keep the two sides distinguishable;
- Fund / Strategy — exact match on either Meeting or resolved Pitchbook free-text value; no fuzzy normalization beyond trim/exact text;
- Meeting Status — exact Meeting status;
- Pitchbook Status — exact resolved Pitchbook status.

For unresolved Pitchbook IDs, only Meeting-side filters can match because no resolved Pitchbook metadata exists.

No name/date/fund-strategy inference may create a relationship.

## Counts / bounds

- compute exact matching relationship/Meeting/Pitchbook counts from the full matching rows first;
- cap display payloads only after exact counts are known;
- expose omitted counts honestly;
- deterministic ordering: canonical date descending, then stable ID ascending unless a more specific accepted existing ordering is reused consistently;
- empty and truncated states must be explicit.

## Public surface

Prefer exactly one new normal-user read facade:

`getRelationshipExplorerData(input)`

or one equivalent explicitly allowlisted name.

- read-only call must not Audit;
- safe errors only;
- do not add any Relationship Explorer mutation facade;
- public facade baseline before this Work is `26`; expected normal completion is `27` if exactly one facade is added.

## UI

Add one `Relationship Explorer` page to the existing Web App navigation.

List-first UX; no graph library or mandatory node-link visualization.

The page must provide:

- the accepted filters;
- summary counts including unresolved and Inactive relationship visibility;
- Meeting -> Pitchbook list with selectable/detail relationship panel;
- Pitchbook -> Meeting reverse list with selectable/detail panel;
- badges that clearly distinguish Meeting counterparty from Pitchbook GP;
- Inactive and unresolved indicators;
- safe links to authoritative Meeting Doc / Pitchbook Drive file;
- a clear route/link back to existing Meeting maintenance for relationship edits, without adding a second mutation implementation;
- accessible tabular equivalents and keyboard-usable controls;
- honest empty/truncated states.

Do not place Meeting body text or Pitchbook content bytes in the response or DOM.

## Side-effect boundary

Application-data state for this Work is read-only.

Allowed only after deterministic PASS:

- synchronize exact tested source once;
- exact source readback;
- create one immutable Apps Script version;
- update the same positively identified private Web App in place.

Not allowed:

- Meeting/Pitchbook/relationship mutation;
- new synthetic records solely for this Work;
- schema migration;
- Audit writes caused by Explorer reads;
- new Web App deployment;
- Library deployment mutation;
- trigger enablement;
- Gemini/File Search calls;
- production rollout;
- confidential/company production data.

## Acceptance evidence — strongest first

1. Existing private Web App shows the accepted synthetic Meeting -> Pitchbook link and the same Pitchbook -> Meeting reverse reference with stable IDs and safe links.
2. Exact forward and reverse counts agree for the target explicit relationship.
3. Counterparty and Pitchbook GP are visibly distinct in the read model/UI.
4. Inactive/unresolved behavior is proven deterministically and, only if such a fixture already exists safely, observed at runtime without mutating authoritative data.
5. Filters, full counts, bounded payloads, deterministic ordering, and omitted counts pass.
6. Explorer reads cause no Audit/Index/Drive/Script Property/AI/trigger mutation.
7. focused tests, `npm run check`, temporal validator, public-surface validation, `git diff --check`, exact source readback, and final integrity pass.

Logic-only evidence does not replace the target-runtime forward/reverse traversal.

## Target-runtime campaign

Use existing synthetic DEV data only.

1. positively identify the existing Apps Script project and current private Web App;
2. sync exact tested source once;
3. exact readback;
4. create exactly one immutable version;
5. update the same existing private `WEB_APP` in place; no new deployment;
6. open Relationship Explorer;
7. locate the existing accepted synthetic Meeting that has one explicit Pitchbook relationship;
8. prove Meeting -> Pitchbook resolves the expected Document ID/file/status/link;
9. select/open the Pitchbook reverse panel and prove exactly the same Meeting is present;
10. prove Meeting counterparty and Pitchbook GP remain distinct;
11. exercise at least Date + Counterparty Type + Pitchbook GP or Asset Class filtering using existing data and verify exact counts;
12. if an Inactive or unresolved explicit relationship already exists, observe it; otherwise do not mutate data merely to create one and rely on deterministic regression evidence for that case;
13. final read-only integrity: Backend five sheets/schema 5, Meeting/Pitchbook rows/IDs/statuses/files unchanged, Audit count unchanged, Script Properties unchanged, AI sync disabled, zero triggers, no Gemini/File Search call, no Library/permission mutation.

## Deterministic validation

Must cover:

- forward resolution;
- reverse resolution;
- one-to-many reverse lookup;
- exact stable-ID matching only;
- unresolved ID preservation;
- duplicate target ID fail-closed behavior;
- Inactive preservation;
- non-GP Meeting counterparty + GP Pitchbook distinction;
- all filters and exact semantics above;
- Work 0022 canonical temporal helpers, with no duplicate date parser;
- exact counts before caps / omitted counts;
- deterministic ordering;
- safe link handling;
- no Doc-body/file-byte/Audit adapter reads;
- read-only environment contract;
- UI list/detail/accessible table/empty/truncated states;
- public facade allowlist;
- `npm run check` and `git diff --check`.

## Closed conclusions / non-goals

Do not implement:

- relation sheet/database;
- graph visualization as a required deliverable;
- automatic relationship inference;
- relationship write/edit path in Explorer;
- AI-generated relationship summary;
- bulk link repair;
- Entity Workspace / Work 0019;
- Gemini/File Search calls;
- production rollout.

## Strategy reset conditions

Reset only if:

- canonical reverse lookup cannot be represented from `Related_Pitchbook_IDs` without a new persistent relation model;
- existing stable-ID semantics are materially contradicted;
- target project/deployment identity is ambiguous;
- the same target-runtime failure remains after one materially different bounded repair.

Browser automation awkwardness alone is not an application defect when stronger direct readback/UI evidence is available.

## Completion latch

Complete only when:

```text
DEV QUALIFIED — WORK 0018 RELATIONSHIP EXPLORER
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: DISABLED_FOR_APPLICATION_DATA / GUARDED_DEPLOYMENT
READY: YES
BLOCKER: NO
```

PR remains Draft / Open / unmerged until ChatGPT final review.