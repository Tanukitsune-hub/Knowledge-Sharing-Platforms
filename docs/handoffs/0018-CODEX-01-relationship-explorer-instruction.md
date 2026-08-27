# Work 0018 — CODEX-01 Relationship Explorer

WORK_ID: `0018`
DISPATCH_ID: `0018-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0018-relationship-explorer`

Draft PR: `TO_BE_ASSIGNED`

Exact ref: `TO_BE_UPDATED_AFTER_PR_SETUP`

Mode: `BUILD / QUALIFICATION`

Route: `C`

Recommended model: `Luna Max`.

## Read first

Read all applicable `AGENTS.md` / `AGENTS.override.md`, then:

1. `docs/handoffs/0018-instruction.md`;
2. `docs/planning/work0018-relationship-explorer.md`;
3. `docs/decisions/temporal-data-contract.md`;
4. accepted Work 0016 / 0022 / 0017 reports;
5. `src/125_GpWorkspaceService.gs`, maintenance search mappers, navigation, public-surface source/tests.

The architecture is settled. Do not redesign relationship persistence.

## Primary outcome

Build and qualify one read-only `Relationship Explorer` page that traverses the explicit stable-ID Meeting ↔ Pitchbook relationship in both directions.

Canonical source of truth:

`Meeting_Index.Related_Pitchbook_IDs`.

Do not split this Work into server/UI/runtime sub-Works.

## Required implementation

### 1. Reusable resolver

Create one reusable private relationship service/read model, preferably in a dedicated server module near the current workspace/analytics services.

Read only:

- Meeting_Index;
- Pitchbook_Index;
- GP_Master;
- Option_Master.

No Meeting Doc body, Pitchbook bytes, Audit read, Gemini/File Search, or external data source.

Implement forward Meeting -> Pitchbook resolution and reverse Pitchbook -> Meeting lookup by immutable `Document_ID` only.

Preserve:

- Inactive Meetings/Pitchbooks;
- unresolved explicit IDs;
- duplicate target IDs as fail-closed unresolved/integrity state;
- non-GP Meeting counterparty distinct from Pitchbook GP.

Use Work 0022 Business Date/Time/Instant helpers for every temporal field.

### 2. Filter / count contract

Implement the exact filter semantics in `docs/handoffs/0018-instruction.md`.

Important:

- Meeting Date From/To = Meeting-side canonical date;
- Counterparty Type/Entity/Related GP/Meeting Status = Meeting side;
- Pitchbook GP/Pitchbook Status = resolved Pitchbook side;
- Asset Class and Fund/Strategy match either side exactly, while keeping meeting-side and pitchbook-side values distinct in the response;
- unresolved relation items can satisfy only Meeting-side filters;
- no fuzzy inference.

Compute exact full counts before display caps and expose omitted counts.

### 3. Public facade

Prefer exactly one new browser-callable read function:

`getRelationshipExplorerData(input)`

or one equivalent name.

Baseline facade is 26; expected facade is 27.

No Explorer mutation facade. Reads must not Audit.

### 4. UI

Add `Relationship Explorer` to the existing Web App navigation.

List-first, dependency-free UI:

- filters;
- summary counts;
- Meeting -> Pitchbook list/detail;
- Pitchbook -> Meeting reverse list/detail;
- clear Meeting Counterparty vs Pitchbook GP labels;
- Inactive badges;
- unresolved ID badges/reasons;
- safe authoritative links;
- link/route to existing Meeting maintenance for edits;
- accessible tables;
- keyboard-usable selection;
- empty/truncated states.

No graph library and no relationship mutation in this page.

### 5. Reuse

The server-side resolver/read model should be directly reusable by Work 0019. Avoid burying relationship logic only in browser JavaScript.

Reuse existing safe-link/mapping helpers when doing so does not create an awkward dependency. A small generic private extraction is allowed if it reduces duplication without expanding the public surface.

## Deterministic validation

Add focused tests covering:

- forward resolution;
- reverse resolution including one-to-many;
- stable-ID-only semantics and no name/date inference;
- unresolved explicit IDs preserved;
- duplicate target IDs fail closed;
- Inactive preservation;
- non-GP counterparty vs GP Pitchbook distinction;
- all filters and exact filter-side semantics;
- temporal canonicalization using Work 0022 helpers;
- exact counts before caps and omitted counts;
- deterministic ordering;
- safe links;
- no Doc-body/file-byte/Audit adapter use;
- read-only environment;
- UI list/detail, badges, filters, accessible table, empty/truncated states;
- one additional allowlisted public read facade only.

Then run:

- focused tests;
- `npm run check`;
- `git diff --check`;
- public-surface validation;
- final scoped diff review.

Do not synchronize Apps Script before deterministic PASS.

## Target-runtime qualification

Use existing synthetic DEV data only. Do not create/mutate relationships or records for qualification.

After positively identifying the existing Apps Script project and private Web App:

1. synchronize exact tested source once;
2. exact source readback;
3. create exactly one immutable version;
4. update the same existing private `WEB_APP` in place;
5. no new deployment or Library mutation;
6. open Relationship Explorer;
7. locate the accepted existing synthetic Meeting with one explicit Pitchbook link;
8. prove Meeting -> Pitchbook resolves the expected Document ID/file/status/safe link;
9. prove the Pitchbook reverse view contains exactly the same Meeting;
10. prove Meeting counterparty and Pitchbook GP are shown as separate fields;
11. exercise existing-data filters including Date and at least two of Counterparty Type / Pitchbook GP / Asset Class;
12. verify exact headline/list/reverse counts;
13. if an Inactive or unresolved explicit relationship already exists, observe it; otherwise do not create one and rely on deterministic regression coverage;
14. final integrity must prove zero application-data mutations: five sheets/schema 5, Meeting/Pitchbook rows and files unchanged, Audit count unchanged, Script Properties unchanged, AI sync disabled, zero triggers, no Gemini/File Search call, no permission/Library mutation.

## Side-effect classification

Expected:

- application data: `DISABLED`;
- deployment/source delivery: `GUARDED`.

If reporting one combined field, clearly distinguish these two facts in the report.

## Non-goals / prohibitions

Do not:

- add a relation sheet/database;
- infer links;
- add Explorer write/edit APIs;
- build graph visualization as a required deliverable;
- add AI commentary;
- implement Entity Workspace / Work 0019;
- call Gemini/File Search;
- enable triggers;
- use confidential/company production data;
- perform production rollout;
- create another Web App deployment.

## Delivery

Create:

`docs/handoffs/0018-CODEX-01-relationship-explorer-report.md`

Update:

- `docs/handoffs/0018-report.md`;
- `docs/handoffs/0018-instruction.md`;
- `docs/handoffs/0018-dispatches.md`;
- Draft PR body.

Commit and push all scoped changes. Keep PR Draft / Open / unmerged for ChatGPT final review.

Return:

- Work ID / Dispatch ID;
- LOGIC_VALIDATION;
- TARGET_RUNTIME_QUALIFICATION;
- SIDE_EFFECT_STATE;
- forward resolution result;
- reverse lookup result;
- unresolved/Inactive result;
- filter/count result;
- no-mutation/read-only result;
- public facade count;
- Apps Script version;
- final integrity;
- report path;
- final commit;
- branch / Draft PR;
- BLOCKER YES/NO.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0018 RELATIONSHIP EXPLORER
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
APPLICATION_DATA_SIDE_EFFECT_STATE: DISABLED
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```
