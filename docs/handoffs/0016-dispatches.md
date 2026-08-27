# Work 0016 dispatch control

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

## Dispatch history

### 0016-CODEX-01 — RETURNED / BLOCKED

- mode: `BUILD`;
- complete Counterparty Entity vertical slice implemented;
- deterministic result: `211/211 PASS`, public facade `24`, `git diff --check` PASS;
- one Apps Script saved-source sync occurred before four final-review fixes;
- no immutable version, deployment update, schema/data migration, or runtime campaign occurred;
- report: `docs/handoffs/0016-CODEX-01-counterparty-entity-foundation-report.md`.

### 0016-CODEX-02 — RETURNED / BLOCKED

- mode: `BUILD / QUALIFICATION`;
- instruction: `docs/handoffs/0016-CODEX-02-final-corrected-sync-and-runtime-qualification-instruction.md`;
- focused `89/89 PASS`, canonical `212/212 PASS`, public facade `24`, exact source readback `62/62`;
- schema 4 and installation-state schemaVersion 4 aligned;
- existing private Web App updated in place to immutable version `32`;
- legacy GP and GP Workspace passed;
- exactly one synthetic LP Entity and one synthetic non-GP Meeting were created; reopen and visible relationship round-trip passed;
- stopped before edit/save/search because hidden edit identity/version controls were reported blank;
- no edit/save retry, duplicate record, Gemini/File Search call, trigger enablement, second sync/version/deployment occurred;
- report: `docs/handoffs/0016-CODEX-02-final-corrected-sync-and-runtime-qualification-report.md`.

### 0016-CODEX-03 — ACTIVE

- mode: `QUALIFICATION`, with one bounded repair path only if direct runtime evidence proves a source defect;
- instruction: `docs/handoffs/0016-CODEX-03-edit-state-property-check-and-final-qualification-instruction.md`;
- purpose: distinguish live DOM `.value` from serialized `value` attribute, then complete the existing Meeting edit/search/Export/final-integrity campaign without creating new test records;
- model: `Sol High` — remaining issue is an unresolved target-runtime observation/root-cause question;
- branch: `agent/0016-counterparty-entity-foundation`;
- Draft PR: `#21`.

## Accepted evidence

- Work 0016 architecture and broad implementation remain closed;
- deterministic validation through CODEX-02 is accepted: focused `89/89`, canonical `212/212`, public facade `24`;
- schema 4, five Backend sheets, installation-state schemaVersion 4: PASS;
- existing private Web App: version `32`;
- legacy GP compatibility and GP Workspace: PASS;
- exactly one synthetic non-GP Entity and one synthetic non-GP Meeting already exist and must be reused;
- non-GP create/reopen/Related GP/Related Pitchbook round-trip: PASS;
- branch is not behind main;
- GitHub Actions/status checks are not configured.

## Current blocker / Strategy Reset

CODEX-02 classified blank hidden Meeting ID/Version controls as an application defect. ChatGPT's GitHub review found that `openMeetingEdit()` synchronously assigns both live input `.value` properties from the same record values used to render the correct Meeting/Version heading, and no reviewed later path intentionally clears them.

Because programmatic `.value` changes need not update the serialized HTML `value` attribute, the prior observation is not sufficient to prove a source defect unless the live DOM properties themselves are blank.

CODEX-03 must first read the live `.value` properties directly on version 32. If they are populated, treat CODEX-02 as an observer attribute-vs-property limitation and finish qualification with no source sync/version/deployment change. If they are truly blank, only one bounded source hypothesis/repair is authorized.

Only one active Codex dispatch is authorized.

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
