# Work 0014 dispatch control

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-06`
BALL: `CODEX`
STATUS: `READY`

## Current active dispatch

- Dispatch: `0014-CODEX-06`
- Mode: `BUILD / QUALIFICATION`
- Purpose: repair Pitchbook Date representation drift and exact post-save search, then perform read-only reopen and final integrity.
- Instruction: `docs/handoffs/0014-CODEX-06-pitchbook-date-roundtrip-search-repair-instruction.md`.
- Parent/canonical instruction: `docs/handoffs/0014-instruction.md`.
- Deployment guardrails: `docs/operations/apps-script-web-app-deployment.md`.
- Production storage decision: `docs/decisions/shared-drive-production-root.md`.

## Accepted closed evidence

- Work 0014 schema/product design: accepted;
- schema 3 append-only/idempotent migration: PASS;
- CODEX-04 helper/runtime repair: implemented;
- local deterministic result recorded by CODEX-04: `179/179 PASS`;
- public facade: `23`;
- exact tested DEV source readback: `59/59 PASS`;
- synthetic DEV migration and installation-state alignment: PASS/read back;
- legacy Meeting compatibility: PASS;
- rich Meeting create/edit/search round-trip: PASS;
- Meeting ↔ Pitchbook relationship preservation: PASS;
- CODEX-05 created exactly one private Web App, immutable version `29`, and a working `/exec`;
- CODEX-05 Fund / Strategy save: PASS exactly once;
- saved value and stable Document/File/sequence/filename/Active identity: PASS;
- successful metadata-level `PITCHBOOK_UPDATE` Audit event: exactly one;
- no duplicate or partial row/file mutation;
- production Shared Drive-only storage boundary: accepted and unchanged.

## CODEX-05 blocker

- the exact Date / GP / Asset Class / Capital Type / Active search returned one target before saving and zero afterward;
- Backend still contained one Active target row with the saved value and stable identity;
- reopen and final authoritative integrity were not run;
- classification: `NOT QUALIFIED — PITCHBOOK POST-SAVE SEARCH FAILED`.

## ChatGPT root-cause conclusion

Active hypothesis: `PITCHBOOK_DATE_REPRESENTATION_DRIFT_ON_FULL_ROW_WRITE`.

Direct evidence:

- Fund / Strategy-only Audit changed fields included `Date`;
- Audit before Date was a Date/timestamp representation and after Date was a date-only string for the same logical day;
- the live Backend cell is a numeric Sheets Date in an `Asia/Tokyo` spreadsheet;
- the manifest is `Asia/Tokyo`;
- search and Pitchbook identity currently canonicalize Date objects with UTC getters;
- Pitchbook edit/status writes replace the whole row, while Meeting status already preserves untouched Date/Time cells with partial writes.

## CODEX-06 authorization

- implement timezone-aware logical date canonicalization;
- prevent metadata-only Pitchbook edit/status operations from rewriting untouched Date and unrelated cells;
- normalize logical Date in Audit comparisons;
- add deterministic Sheets-like date round-trip and post-save exact-search regressions;
- after deterministic PASS, sync exact source, create one immutable version, and update the positively identified CODEX-05 Web App deployment in place;
- run one read-only exact search and one reopen only;
- do not save again, create another deployment, broaden filters, or open a second hypothesis;
- then complete final integrity.

Only one active Codex dispatch is authorized.

PR #17 remains Draft / Open / unmerged pending CODEX-06 and ChatGPT final review.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-06`
BALL: `CODEX`
STATUS: `READY`
