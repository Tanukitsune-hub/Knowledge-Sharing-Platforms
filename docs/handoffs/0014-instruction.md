# Work 0014 — Structured meeting context foundation

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-06`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD / QUALIFICATION`

Primary design:

`docs/planning/work0014-structured-meeting-context.md`

Active execution instruction:

`docs/handoffs/0014-CODEX-06-pitchbook-date-roundtrip-search-repair-instruction.md`

Deployment guardrails:

`docs/operations/apps-script-web-app-deployment.md`

## Primary outcome

Deliver and prove end-to-end the structured Meeting/Pitchbook context foundation:

- optional Team through Option Master;
- optional Fund / Strategy on Meeting and Pitchbook;
- three Meeting type flags;
- Meeting ↔ Pitchbook stable-ID relationships;
- follow-up flag and note;
- create/edit/search/export compatibility with legacy records.

## Closed design conclusions

- keep exactly five Backend sheets;
- Team is optional and seeded with PD / AE;
- Fund / Strategy is optional free text, not a Fund master;
- Meeting types use stable canonical codes;
- relationships use immutable Pitchbook Document IDs in Meeting_Index;
- Follow-up is a flag plus note, not a workflow engine;
- production storage remains Shared Drive-only with no My Drive fallback;
- GP workspace, analytics, legacy conversion, Shared Drive production qualification, and billing-enabled Gemini qualification are separate later Works.

## Accepted evidence — do not reopen

- Work 0014 schema/data model and broad implementation: accepted;
- schema 3 append-only/idempotent migration: PASS;
- synthetic DEV migration and installation-state alignment: PASS/read back;
- CODEX-04 Pitchbook helper/runtime repair: implemented;
- local deterministic result recorded by CODEX-04: `179/179 PASS`;
- public facade: `23`;
- exact Apps Script source readback: `59/59 PASS`;
- legacy Meeting live compatibility: PASS;
- rich Meeting create/edit/search live round-trip: PASS;
- Meeting ↔ Pitchbook relationship live preservation: PASS;
- CODEX-05 created exactly one private synthetic DEV Web App and version `29`; `/exec` rendered normally;
- CODEX-05 Pitchbook Fund / Strategy save succeeded exactly once;
- authoritative Backend and Audit proved the saved value, stable Document/File/sequence/filename/Active identity, unique row, and exactly one successful `PITCHBOOK_UPDATE` event;
- no duplicate or partial row/file mutation occurred.

The saved value is accepted. No second Pitchbook save is required or authorized for completion.

## Observed blocker

The exact Date / GP / Asset Class / Capital Type / Active search returned the target before saving and zero rows after the successful save. The record remained present and Active in Backend.

Reopen and final authoritative integrity remain pending.

## ChatGPT root-cause conclusion

Active hypothesis: `PITCHBOOK_DATE_REPRESENTATION_DRIFT_ON_FULL_ROW_WRITE`.

A Fund / Strategy-only update unexpectedly recorded `Date` as changed. Audit showed the same logical day moving from a Date/timestamp representation to a date-only string. The row commit and Pitchbook status paths write complete rows, while search and Pitchbook identity derive Date-object keys with UTC getters. The live spreadsheet and Apps Script use `Asia/Tokyo`.

This creates a representation-sensitive calendar-day comparison and explains why all non-Date search fields remained stable while the exact result disappeared only after the save.

## Active repair contract

CODEX-06 must:

1. use the configured application timezone for Date-object calendar-day canonicalization;
2. apply the canonical key consistently to search, mapping, and Pitchbook context comparison;
3. use partial Pitchbook edit/status writes so unchanged Date and unrelated cells are not rewritten;
4. compare logical Date values in Audit metadata;
5. add deterministic timezone/date-roundtrip/post-save-search regressions;
6. keep schema, product surface, public facade, data, and deployment access boundary unchanged;
7. after deterministic PASS, update the positively identified existing Web App deployment in place to one new immutable version;
8. perform one read-only exact search and one reopen—without saving again;
9. complete final integrity.

If the active hypothesis is disproved or the exact read-only search still fails, stop for Strategy Reset. Do not broaden filters or open a second hypothesis in CODEX-06.

## Completion

If deterministic validation, exact search/reopen, and final integrity PASS, classify:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

PR #17 remains Draft / Open / unmerged until ChatGPT final review and merge.
