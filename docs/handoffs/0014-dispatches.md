# Work 0014 dispatch control

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

Current active dispatch:

- `0014-CODEX-04`
- Mode: `BUILD / QUALIFICATION`
- Purpose: repair the single observed Pitchbook Fund / Strategy live-edit defect, then complete the deferred Pitchbook verification and final integrity readback.
- Instruction: `docs/handoffs/0014-CODEX-04-pitchbook-maintenance-helper-repair-instruction.md`.
- Parent/canonical instruction: `docs/handoffs/0014-instruction.md`.
- Production storage decision: `docs/decisions/shared-drive-production-root.md`.

Accepted closed evidence:

- Work 0014 schema/product design: accepted;
- deterministic validation before the live defect: `176/176 PASS`;
- schema 3 append-only/idempotent migration: PASS;
- synthetic DEV data-plane migration and installation-state alignment: PASS/read back;
- Web App deployment recovery: PASS — immutable version `27`, normal `/exec` PASS;
- legacy Meeting compatibility: PASS;
- rich Meeting create/edit/search round-trip: PASS;
- Meeting ↔ Pitchbook relationship preservation: PASS;
- production Shared Drive-only storage boundary: accepted and unchanged.

CODEX-03 result:

- Pitchbook Fund / Strategy save: `FAIL` on the first and only attempt;
- target remained Active;
- submitted value remained absent;
- no duplicate or partial row/file update;
- final integrity: not run after the stop condition;
- classification: `NOT QUALIFIED — LIVE SMOKE STOPPED AT PITCHBOOK FUND / STRATEGY APPLICATION DEFECT`.

ChatGPT root-cause diagnosis:

- production Pitchbook maintenance calls `kspBuildPitchbookSavedFilename(...)` and `kspPitchbookContextMatchesRow(...)`;
- both functions exist only as injected definitions in `tests/maintenance-test-loader.cjs`, not in production `src`;
- deterministic tests therefore masked the runtime ReferenceError;
- raw Sheets `Date` versus normalized date-string comparison can also misclassify a Fund / Strategy-only edit as a context move.

Authorized CODEX-04 repair:

- add private production helpers with trailing underscores;
- update production callers;
- canonicalize date comparison;
- remove the test-only business-helper injection;
- add live-like Date-object regression coverage;
- preserve public facade count, schema, data model, deployment ID, and all accepted evidence;
- after deterministic PASS, sync exact tested source, create one immutable version, update the existing Web App deployment in place, run one Pitchbook save/reopen/search verification, then final integrity.

Only one active Codex dispatch is authorized. No second hypothesis or second live retry is allowed in CODEX-04.

PR #17 remains Draft / Open / unmerged pending ChatGPT final review.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
