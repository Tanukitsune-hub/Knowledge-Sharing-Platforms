# Work 0014 — CODEX-01 structured Meeting context implementation

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD`

Route: `C — non-trivial cross-cutting implementation and synthetic DEV execution verification`.

Recommended model: `Luna Max`.

Rationale: ChatGPT has fixed the product/data-model design. The remaining work is implementation across the existing Apps Script/UI/test architecture plus bounded DEV smoke verification; no open architecture choice remains.

Source of truth:

- `docs/planning/work0014-structured-meeting-context.md`
- `docs/handoffs/0014-instruction.md`
- applicable repository `AGENTS.md` / `AGENTS.override.md` files

Target branch:

`agent/0014-structured-meeting-context-foundation`

Target PR:

Create one Draft PR to `main` for Work 0014 if none exists. Keep it Draft / Open / unmerged until ChatGPT final review.

## Primary outcome

Implement the structured record foundation needed for later GP summary, traceability, follow-up, and meeting analytics:

1. Team;
2. Fund / Strategy;
3. Meeting type flags;
4. Meeting ↔ Pitchbook links;
5. follow-up flag/note;
6. corresponding create/edit/search/export/migration behavior.

The user must be able to create, edit, search, and reopen a Meeting carrying these fields without breaking existing legacy Meeting/Pitchbook records.

## Required preflight

Before implementation:

- read all applicable `AGENTS.md` / `AGENTS.override.md` files;
- identify and follow the repository-specific subagent policy;
- use subagents actively and proportionately for independent schema/migration review, UI/service contract review, and final regression/security review where useful;
- confirm local branch/HEAD matches the supplied exact Git ref and the working tree is clean or contains only expected Work 0014 changes;
- inspect the existing schema/setup, Meeting, Pitchbook, maintenance/search, browser shared-draft, Knowledge Export, AI source-metadata, and public-surface tests before editing.

Do not reopen Work 0013 qualification or deployment history.

## Fixed data model

Follow `docs/planning/work0014-structured-meeting-context.md` exactly.

### Option_Master

Add type `TEAM` with seeds:

- `OPT-TEAM-001` / `PD`
- `OPT-TEAM-002` / `AE`

Use existing Option Master maintenance conventions. Team is optional; never infer or default it.

### Meeting_Index append-only columns

Append:

- `Team_ID`
- `Fund_Strategy`
- `Meeting_Type_Codes`
- `Related_Pitchbook_IDs`
- `Follow_Up_Required`
- `Follow_Up_Note`

### Pitchbook_Index append-only column

Append:

- `Fund_Strategy`

Keep the existing five backend sheets. Do not add a relation sheet.

## Fixed field behavior

### Fund / Strategy

- optional free text;
- max 500 chars;
- Meeting + Pitchbook register/edit/search;
- preserve through Pitchbook prepare/upload/retry;
- include in the existing browser shared-draft state where Meeting/Pitchbook shared metadata is managed.

### Meeting type

Stable codes only:

- `ANNUAL_REVIEW`
- `OFFICE_VISIT`
- `ANNUAL_GENERAL_MEETING`

UI: three independent checkboxes.

Persist one canonical comma-separated list in the code order above, no spaces. Blank valid. Reject unknown codes on writes.

### Meeting ↔ Pitchbook

- Meeting may link zero or more Pitchbooks;
- persist immutable `Document_ID`s only in canonical comma-separated form;
- selectable new links: Active Pitchbooks matching selected GP + Asset Class;
- choices sorted Date descending then Document ID;
- preserve already-linked IDs during edit even if a linked Pitchbook is later Inactive;
- do not silently unlink on Pitchbook inactivation;
- reverse lookup may scan Meeting_Index; no relation table.

### Follow-up

- checkbox `Follow_Up_Required`;
- optional `Follow_Up_Note`, max 2,000 chars;
- Past Records supports `要フォローのみ`;
- Audit may record metadata/changed-field names but must not duplicate Follow_Up_Note text.

### Team

- optional single-select from active TEAM options;
- stored as `Team_ID`;
- Team maintenance uses existing Option Master behavior;
- legacy and new Meeting records may be blank.

## Required product surfaces

### Meeting register/edit

Add and round-trip:

- Team;
- Fund / Strategy;
- three Meeting type checkboxes;
- Related Pitchbooks;
- follow-up flag/note.

Update normalization, validation, request fingerprint/retry safety, document text, metadata/index writes, draft state, edit payloads, and optimistic-lock update behavior as required.

### Pitchbook register/edit

Add optional Fund / Strategy through normal registration, prepare, upload, retry, edit, search, and result payloads.

### Past Records

Meeting filters:

- Team;
- Fund / Strategy text;
- Meeting type;
- follow-up only.

Pitchbook filter:

- Fund / Strategy text.

Expose the new values in result/edit payloads without leaking private IDs/URLs beyond existing safe contracts.

### Knowledge Export / AI derived metadata

- include new structured metadata in Knowledge Export output when present;
- include Pitchbook Fund / Strategy;
- keep Follow_Up_Note out of Audit content;
- update deterministic AI/source metadata contracts only where necessary for future re-indexing;
- do not enable Gemini or run billing-enabled File Search qualification.

## Migration requirements

- increment persistent schema version once;
- setup/migration append-only and idempotent;
- preserve legacy rows and existing IDs/counters/status/files/AI fields/user Master changes;
- PD/AE seeds insert only if missing and do not overwrite user-mutated TEAM rows;
- blank new fields on legacy rows remain valid;
- setup rerun must not reset counters or Gemini config;
- update retry/fingerprint behavior deliberately so new mutable inputs are protected without invalidating existing successful records.

## Required deterministic tests

Add/extend focused tests for at least:

- schema migration and idempotent setup;
- Team seed/optional behavior/maintenance compatibility;
- Meeting normalization/validation/fingerprint/document/index metadata;
- Meeting create/edit/search round-trip;
- Meeting type canonicalization and invalid-code rejection;
- Related Pitchbook filtering, ordering, canonical IDs, edit preservation after inactivation;
- follow-up filtering and Audit redaction;
- Pitchbook Fund / Strategy prepare/upload/retry/edit/search;
- legacy records with blank new columns;
- shared draft state for new shared Fund / Strategy field;
- Knowledge Export structured metadata and Audit redaction;
- public-surface allowlist unchanged except where an existing approved facade must accept new fields.

Run targeted tests while implementing, then run the repository canonical full check:

`npm run check`

and:

`git diff --check`

Do not weaken existing assertions to obtain PASS.

## Synthetic DEV live smoke

Only after deterministic PASS, use the existing confirmed synthetic DEV project and existing Web App deployment pattern.

Do not create a second Web App deployment.

Synchronize only the exact tested source, create/update one immutable version as appropriate, and preserve the existing deployment security boundary.

Perform one bounded smoke campaign:

1. confirm one existing legacy Meeting still opens/edits with all new optional fields blank;
2. create one new Meeting with:
   - Team set;
   - Fund / Strategy;
   - at least two Meeting type flags;
   - at least one Related Pitchbook when a valid matching synthetic Pitchbook exists;
   - follow-up flag/note;
3. reopen/edit the Meeting and verify all fields round-trip;
4. search it using Team + Meeting type + follow-up filters and verify Fund / Strategy display;
5. if safely available, inactivate one linked synthetic Pitchbook and verify the existing Meeting link is preserved on edit; restore the Pitchbook afterward if this can be done without contaminating evidence;
6. create or edit one synthetic Pitchbook with Fund / Strategy and verify search/reopen round-trip;
7. verify no duplicate source rows/files, no ID-counter regression, and no unexpected Audit content leakage.

Use only synthetic/anonymized DEV data. Do not run Shared Drive-specific or Gemini billing qualification.

## Scope boundaries / non-goals

Do not implement:

- GP one-page/dashboard;
- charts/analytics;
- monthly admin check workflow;
- follow-up owner/deadline/completion/reminder;
- Fund master;
- new backend sheet/database;
- legacy converter/bulk upload;
- production deployment/rollout;
- Shared Drive-specific qualification;
- billing-enabled Gemini/File Search qualification;
- unrelated UI redesign/refactor.

## Stop / escalation conditions

Stop and return to ChatGPT if:

- the fixed data model cannot be implemented without adding a backend sheet or materially changing accepted architecture;
- existing legacy rows cannot be preserved safely;
- the required migration would overwrite user-mutated Master data/counters/Gemini settings;
- a public-surface expansion appears necessary beyond accepting the new fields through existing facades;
- deterministic checks fail after one bounded repair attempt on the same hypothesis;
- live smoke reveals an application/data-integrity defect requiring a new design choice;
- continuing would require production/confidential data, new credentials, public exposure, or destructive cleanup.

Do not open a second architecture hypothesis within this dispatch after a stop condition.

## Reporting / delivery

Create/update:

- `docs/handoffs/0014-CODEX-01-structured-meeting-context-implementation-report.md`;
- `docs/handoffs/0014-report.md`;
- `docs/handoffs/0014-instruction.md`;
- `docs/handoffs/0014-dispatches.md`;
- Draft PR body.

Commit and push scoped changes to `agent/0014-structured-meeting-context-foundation`.

PR remains Draft / Open / unmerged.

Completion response must contain only:

- Work ID;
- Dispatch ID;
- deterministic validation summary;
- schema/migration result;
- Meeting round-trip result;
- Pitchbook Fund/Strategy result;
- relationship behavior result;
- legacy compatibility result;
- synthetic DEV smoke result;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any FAIL/DEFERRED item.
