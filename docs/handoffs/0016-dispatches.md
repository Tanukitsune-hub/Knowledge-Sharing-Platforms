# Work 0016 dispatch control

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Dispatch history

### 0016-CODEX-01 — RETURNED / BLOCKED

- complete Counterparty Entity vertical slice implemented;
- deterministic `211/211 PASS`, public facade `24`;
- stopped before final corrected deployment/runtime campaign.

### 0016-CODEX-02 — RETURNED / BLOCKED

- focused `89/89`, canonical `212/212`, source readback `62/62`;
- schema 4 / five Backend sheets / installation-state schemaVersion 4 PASS;
- private Web App updated in place to version `32`;
- legacy GP, GP Workspace, one synthetic LP Entity and one synthetic non-GP Meeting create/reopen PASS;
- stopped at hidden edit identity/version state.

### 0016-CODEX-03 — RETURNED / BLOCKED

- direct version 32 inspection confirmed hidden edit identity/version `.value` properties were genuinely empty;
- one bounded client-state repair implemented;
- focused `21/21`, canonical `213/213`, `git diff --check` PASS, public facade `24`;
- exact source readback `62/62`, immutable version `33`, same private Web App updated in place;
- existing synthetic Entity/Meeting reused;
- one edit/save to Version 2, exact Type + Entity + Related GP search, Knowledge Export Preview, Doc/deterministic metadata PASS;
- final integrity found one defect: `Internal_Participants`-only update Audit falsely included `Date` because Before/After used different representations of the same business date;
- no Audit repair or second runtime mutation attempted;
- report: `docs/handoffs/0016-CODEX-03-edit-state-property-check-and-final-qualification-report.md`.

### 0016-CODEX-04 — ACTIVE

- mode: `BUILD / QUALIFICATION`;
- model: `Luna Max`;
- instruction: `docs/handoffs/0016-CODEX-04-audit-date-canonicalization-and-final-integrity-instruction.md`;
- purpose: canonicalize Meeting Audit Date/Time representation, verify one additional edit on the existing Meeting, and close final integrity;
- no new Entity/Meeting; preserve the earlier malformed Audit event unchanged;
- at most one source sync, one immutable version, and one in-place private Web App update.

## Accepted evidence — do not reopen

- Work 0016 architecture is closed;
- schema 4 / five sheets / installation-state version 4 PASS;
- legacy GP and GP Workspace PASS;
- Counterparty Entity, non-GP create/reopen/edit/search, Related GP/Pitchbook PASS;
- Knowledge Export Preview and deterministic metadata PASS;
- public facade `24`;
- current private Web App version `33`;
- exactly one synthetic non-GP Entity and Meeting exist and must be reused;
- no Gemini/File Search qualification belongs to this Work.

## Current blocker

`kspMeetingAuditSnapshot_()` stores Meeting Date/Time using raw cell values. The current row can contain Sheets Date objects while the committed row contains normalized strings, so `kspChangedMetadataFields_()` can falsely report unchanged logical values as changed.

The final repair is limited to Audit representation canonicalization plus final integrity. Do not alter historical Audit rows.

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
