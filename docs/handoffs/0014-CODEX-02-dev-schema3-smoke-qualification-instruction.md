# Work 0014 — CODEX-02 DEV schema 3 smoke qualification

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `QUALIFICATION`

Route: `C — bounded authenticated synthetic DEV qualification with user-assisted Apps Script Project Settings/browser actions where required`.

Recommended Codex model: `Luna Max`.

Rationale: Work 0014 implementation and deterministic validation are already complete. ChatGPT has applied the exact append-only schema 3 data-plane migration to the confirmed synthetic DEV Backend. The residual work is one bounded installation-state metadata alignment and the previously specified live smoke; no source design or root-cause investigation remains.

Before execution, read all applicable `AGENTS.md` / `AGENTS.override.md` files and follow the repository-specific subagent policy. Use subagents actively and proportionately only for independent evidence/integrity review; do not run competing diagnoses.

## Primary outcome

Complete the Work 0014 synthetic DEV live smoke without exposing private administrator functions or changing application source/deployment, then return the Work for ChatGPT final review.

## Accepted evidence — do not reopen

- Work 0014 application implementation: PASS.
- `npm run check`: `176/176 PASS`.
- public facade: unchanged at 23 functions.
- `git diff --check`: PASS.
- deterministic schema/setup migration: PASS — schema 3, append-only, idempotent, five Backend sheets preserved.
- deterministic Meeting create/edit/search/draft/retry round-trip: PASS.
- deterministic Pitchbook Fund / Strategy paths: PASS.
- deterministic Meeting↔Pitchbook relationship behavior: PASS.
- deterministic legacy compatibility: PASS.
- exact tested 59-file source sync to the confirmed synthetic DEV project: PASS.
- immutable Apps Script version 26 and existing Web App deployment update in place: PASS; no second deployment.
- Work 0013 private-admin execution-surface limitation remains an environment limitation, not an application-source defect.

Do not rerun deterministic implementation work, source sync, version creation, deployment recovery, `/dev`, or Work 0013 qualification.

## ChatGPT-completed synthetic DEV migration

ChatGPT applied and read back only the schema 3 data-plane changes required by the committed Work 0014 source:

- `Meeting_Index`: appended `Team_ID`, `Fund_Strategy`, `Meeting_Type_Codes`, `Related_Pitchbook_IDs`, `Follow_Up_Required`, `Follow_Up_Note`;
- `Pitchbook_Index`: appended `Fund_Strategy`;
- `Option_Master`: confirmed full canonical header including `Created_By` / `Updated_By` and inserted missing TEAM seeds `OPT-TEAM-001 / PD` and `OPT-TEAM-002 / AE`;
- `Settings.SCHEMA_VERSION`: updated from `2` to `3`;
- existing Meeting/Pitchbook rows remained intact with blank new fields;
- existing IDs, counters, statuses, source files, AI fields, `AI_SYNC_ENABLED=false`, Gemini settings, and `LAST_SETUP_AT` were preserved.

The first write attempt failed atomically because the Meeting sheet grid was only 26 columns wide. ChatGPT expanded only that sheet grid to the required 29 columns and then applied the migration once successfully. No partial mutation occurred from the failed request.

No raw resource IDs/URLs belong in the report/chat.

## Remaining one-time installation-state alignment

Do **not** call `setupKnowledgePlatform_()` or create any wrapper/API executable.

Use the already identity-confirmed synthetic DEV Apps Script project and Project Settings UI.

Privately inspect the existing `KSP_INSTALLATION_STATE_JSON` and verify before saving:

- `config.environment = DEV`;
- existing resource/config references still match the confirmed synthetic DEV environment;
- `schemaVersion` is not greater than `3`;
- release/app metadata and unrelated config/resources are unchanged.

If `schemaVersion` is already `3`, make no Script Property change and continue.

If it is below `3`, edit **only** the existing `KSP_INSTALLATION_STATE_JSON` so that:

- `schemaVersion = 3`;
- `updatedAt` may be refreshed;
- all config/resource references, `componentWorkId`, release/app metadata, and unrelated fields remain byte-for-byte/semantically preserved.

Save once, then read back once. Do not modify any other Script Property, trigger, Backend row, source file, deployment, or permission.

If the property identity/config does not match the accepted DEV environment, stop without saving.

## Synthetic DEV smoke

Use the existing versioned `/exec` deployment already updated to version 26. Do not create or update a deployment in this dispatch.

Use only synthetic/anonymized DEV records.

1. Legacy compatibility
   - open one existing legacy Meeting;
   - confirm it loads with the new optional fields blank/unset and remains usable;
   - do not change unrelated legacy content merely to create evidence.

2. Rich Meeting create
   - create exactly one new synthetic Meeting with:
     - Team set to one TEAM option;
     - non-empty Fund / Strategy;
     - at least two Meeting type flags;
     - at least one Related Pitchbook if a matching Active synthetic Pitchbook is available;
     - `要フォロー` enabled with a synthetic follow-up note;
   - confirm one source Doc and one Meeting_Index row only.

3. Meeting reopen/edit/search
   - reopen the new Meeting and verify all new fields round-trip;
   - perform one bounded edit of a new structured field and save;
   - search using Team + Meeting type + follow-up-only filters;
   - confirm Fund / Strategy and related Pitchbook IDs are returned/displayed as designed.

4. Relationship preservation
   - if safely available without contaminating unrelated evidence, temporarily inactivate one linked synthetic Pitchbook and verify the existing Meeting relationship remains present during edit; restore the Pitchbook afterward;
   - if this cannot be done safely through normal UI, classify only this subcheck `DEFERRED — SAFE SYNTHETIC RELATIONSHIP TOGGLE NOT AVAILABLE`; it is non-blocking because deterministic coverage is already accepted.

5. Pitchbook Fund / Strategy
   - create or edit exactly one synthetic Pitchbook with non-empty Fund / Strategy;
   - verify reopen/search round-trip;
   - do not retest upload-size limits.

6. Final integrity
   - no duplicate Meeting/Pitchbook source rows/files;
   - counters advance only as expected;
   - legacy rows remain intact;
   - new schema headers remain canonical and no sixth Backend sheet exists;
   - no AI state/store/trigger mutation beyond existing accepted behavior;
   - Audit contains expected metadata-level events and does not duplicate `Follow_Up_Note` content;
   - no real/private content, IDs, or URLs are copied into GitHub/report/chat.

## Stop conditions

Stop immediately on the first actual application/data-integrity defect. Do not open a second implementation hypothesis or change application source in this dispatch.

Do not:

- expose/call private admin functions through wrappers;
- create API executable/public/debug deployments;
- change source/tests/manifest/schema design;
- create another Web App deployment;
- use production/confidential data;
- run Shared Drive-specific production qualification;
- run billing-enabled Gemini/File Search qualification.

## Completion classification

If the installation-state alignment passes (or is already current), the bounded smoke passes, final integrity passes, and no implementation blocker appears:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

The following remain external/follow-on and do not block Work 0014:

- production Shared Drive-specific qualification;
- billing-enabled Gemini/File Search qualification;
- GP workspace/dashboard (Work 0015);
- activity analytics/admin checks (Work 0016).

## Reporting / delivery

Create/update:

- `docs/handoffs/0014-CODEX-02-dev-schema3-smoke-qualification-report.md`;
- `docs/handoffs/0014-report.md`;
- `docs/handoffs/0014-instruction.md`;
- `docs/handoffs/0014-dispatches.md`;
- Draft PR #17 body.

Only report IDs/URLs by safe labels; never record raw private resource identifiers.

Commit and push report/status-only repository updates after the live run. Keep PR #17 Draft / Open / unmerged. ChatGPT owns final diff review and merge.

Completion response must contain only:

- Work ID;
- Dispatch ID;
- installation-state alignment result;
- legacy Meeting smoke result;
- rich Meeting round-trip result;
- relationship live result;
- Pitchbook Fund / Strategy live result;
- final integrity result;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any FAIL/DEFERRED item.
