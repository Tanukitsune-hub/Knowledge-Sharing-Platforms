# Work 0014 report

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Current state

The structured Meeting/Pitchbook implementation, schema 3 migration, Web App recovery, legacy Meeting smoke, rich Meeting round-trip, and relationship behavior remain accepted.

The only active blocker is the first live Pitchbook Fund / Strategy metadata save.

## Accepted evidence

- structured Meeting/Pitchbook implementation: PASS;
- deterministic validation before the live defect: `176/176 PASS`;
- public facade: 23 functions;
- append-only schema 3/idempotent migration: PASS;
- synthetic DEV data-plane migration and installation-state alignment: PASS/read back;
- exact source synchronization: PASS;
- Web App deployment recovery: PASS — immutable version `27`, normal `/exec` PASS;
- legacy Meeting live compatibility: PASS;
- rich Meeting create/edit/search live round-trip: PASS;
- relationship preservation live behavior: PASS;
- failed Pitchbook save left the Active target, row/file identity, and persisted value unchanged; no duplicate or partial update.

## Root cause fixed for the next dispatch

ChatGPT confirmed that the deterministic maintenance loader injects two production-named Pitchbook helpers that do not exist in the production `src` tree:

- `kspPitchbookContextMatchesRow`
- `kspBuildPitchbookSavedFilename`

The live service calls those missing helpers, while tests pass against the injected copies. The same path compares a raw Sheets `Date` object with a normalized date string, potentially treating a Fund / Strategy-only edit as a context move.

This explains the deterministic/live discrepancy and the safe `UNEXPECTED_ERROR` boundary.

## Active dispatch

Instruction:

`docs/handoffs/0014-CODEX-04-pitchbook-maintenance-helper-repair-instruction.md`

CODEX-04 is authorized only to:

- productionize the two helpers as private trailing-underscore functions;
- update their callers;
- canonicalize the date comparison;
- remove the test-loader business-helper injection;
- add live-like regression coverage;
- run deterministic validation;
- after PASS, synchronize exact source, version-update the existing Web App deployment, run one Pitchbook save/reopen/search verification, and complete final integrity.

No second hypothesis or second live retry is authorized.

## Classification

`REPAIR READY — PITCHBOOK MAINTENANCE TEST/RUNTIME CONTRACT`

`BLOCKER: YES` until CODEX-04 live verification and final integrity pass.

PR #17 remains Draft / Open / unmerged pending ChatGPT final review.
