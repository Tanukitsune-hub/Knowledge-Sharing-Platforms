# Work 0014 — CODEX-06 Pitchbook date round-trip and post-save search repair report

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-06`
BALL: `CODEX`
STATUS: `COMPLETE`

Execution date: `2026-08-27`

Instruction ref: `76ca025a6265fdf4b667912907aef2f168f94396`

## Result

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

The active hypothesis `PITCHBOOK_DATE_REPRESENTATION_DRIFT_ON_FULL_ROW_WRITE` was reproduced independently, repaired within the bounded contract, and confirmed by the one authorized read-only exact search and reopen. The accepted CODEX-05 Pitchbook was not saved again.

## Bounded repair

`PASS`

- Date-object business dates now use the configured `Asia/Tokyo` timezone through one canonical path.
- Pitchbook search, result mapping, context comparison, and Audit snapshots use the same logical-date representation.
- Pitchbook metadata and status commits update only intended fields and do not rewrite an unchanged Date cell.
- Partial-write failures restore attempted cells in reverse order while preserving claim, filename-restoration, and optimistic-concurrency behavior.
- The Apps Script manifest records the already-active private Web App execution/access boundary so source synchronization cannot remove it.

## Deterministic validation

`PASS`

- pre-fix focused regression: `61/68 PASS`, with seven expected failures demonstrating the accepted defect;
- post-fix focused regression: `72/72 PASS`;
- `npm run check`: `190/190 PASS`;
- Apps Script validation: `46` `.gs`, `12` HTML, and manifest PASS;
- public facade: exactly `23`;
- `git diff --check`: PASS;
- independent hypothesis review: `SUPPORTED`;
- independent final diff/regression review: no findings.

## DEV source and deployment

`PASS`

- Before synchronization, all 58 code/HTML files matched the accepted saved remote source. The sole manifest delta was the Web App stanza Apps Script had automatically added during CODEX-05; the repository manifest was aligned to preserve that accepted boundary.
- The exact tested 59-file `src` tree was synchronized once.
- Disposable post-sync readback matched `59/59` files.
- Latest immutable version was `29` immediately before versioning; exactly one immutable version, `30`, was created.
- The positively identified CODEX-05 Web App was updated in place to version `30`.
- Readback confirmed `WEB_APP`, the same normal `/exec`, execute as deploying user, and access `Only myself`.
- Active deployment count remained unchanged. No second Web App deployment was created and other Library deployments were not modified.

No private IDs, URLs, account identifiers, or Script Property values are recorded in this report.

## Read-only live verification

`PASS`

- The retained exact Date / GP / Asset Class / Capital Type / Active search was run exactly once.
- Exactly one target row was returned.
- The target was reopened exactly once.
- The already-saved synthetic Fund / Strategy value and logical Date round-tripped.
- Document, file, sequence, filename, and Active identity remained stable.
- No save, status change, or other source/data mutation was performed.

## Final authoritative integrity

`PASS`

- Pitchbook rows: `16`; Meeting rows: `3`; both stable from the accepted baseline.
- Exactly one target Pitchbook row and one target source file exist.
- Meeting/Pitchbook IDs and Drive files are unique; Index file references exactly match the authoritative folder contents.
- Legacy rows/files and the accepted rich Meeting/relationship record are unchanged.
- Settings, counters, AI/store values, and `LAST_SETUP_AT` are unchanged; AI sync remains disabled.
- Backend has exactly five sheets with the accepted schema-3 headers.
- TEAM `PD` and `AE` seeds each exist exactly once.
- Audit increased only by the accepted CODEX-05 successful `PITCHBOOK_UPDATE`; that target success event remains exactly one.
- CODEX-06 added no Pitchbook update Audit event, and Follow-up note content remains absent from Audit.
- Script Properties remain the expected four-property DEV set with installation schema `3` and the Knowledge Exports mapping.
- Trigger count remains `0`.
- Exactly one existing Web App deployment was version-updated in place; no new active deployment was added.

## Residual external gaps

- Shared Drive-specific production qualification: outside Work 0014.
- Billing-enabled Gemini/File Search live qualification: outside Work 0014.
- Optional GitHub Actions CI: not configured; deterministic evidence is local and observed.

Production readiness is not claimed.

PR #17 remains Draft / Open / unmerged for ChatGPT final review and merge.
