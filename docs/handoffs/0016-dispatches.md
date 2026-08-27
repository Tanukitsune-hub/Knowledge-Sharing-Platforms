# Work 0016 dispatch control

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Dispatch history

### 0016-CODEX-01 — RETURNED / BLOCKED

- mode: `BUILD`;
- complete Counterparty Entity vertical slice implemented;
- deterministic result: `211/211 PASS`, public facade `24`, `git diff --check` PASS;
- one Apps Script saved-source sync occurred before four final-review fixes;
- no immutable version, deployment update, schema/data migration, or runtime campaign occurred;
- saved Apps Script source is stale relative to GitHub;
- report: `docs/handoffs/0016-CODEX-01-counterparty-entity-foundation-report.md`.

### 0016-CODEX-02 — ACTIVE

- mode: `BUILD / QUALIFICATION`;
- instruction: `docs/handoffs/0016-CODEX-02-final-corrected-sync-and-runtime-qualification-instruction.md`;
- purpose: close four bounded pre-sync findings, perform the one final exact source synchronization, align synthetic schema 4, update the existing private Web App in place, and complete the legacy GP + one non-GP Meeting runtime campaign and final integrity;
- model: `Luna Max`;
- branch: `agent/0016-counterparty-entity-foundation`;
- Draft PR: `#21`.

## Accepted evidence

- schema/data/identity architecture remains fixed;
- broad implementation and deterministic Work 0016 behavior are accepted for what `211/211` exercised;
- CODEX-01 made no target data, version, deployment, trigger, permission, or AI-store mutation;
- existing private Web App remains on version `31`;
- branch was not behind main at CODEX-01 return.

## Remaining blockers

1. registration-side Related Pitchbook Date objects use UTC calendar getters instead of the configured `Asia/Tokyo` logical date;
2. final source/tests must close the authoritative GP label, Related Pitchbook hint, and quick-add retry-invalidation findings;
3. corrected source has not been synchronized/versioned/deployed;
4. schema 4 target alignment, legacy GP readback, one non-GP Meeting end-to-end campaign, and final integrity have not run.

Only one active Codex dispatch is authorized. Do not split the residual work into additional Works.

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
