# Work 0013 — Knowledge Export installation-state repair and Matrix E resume

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded authenticated DEV configuration repair and qualification continuation`.

Recommended Codex model: `Luna Max`.

Rationale: the remaining blocker is a settled DEV migration/configuration gap, not source design or open-ended diagnosis. ChatGPT has already repaired the Drive and Backend portions. Codex only needs to patch one existing Script Property in the identity-confirmed DEV project and then resume Matrix E.

## Primary outcome

Complete the missing Work 0011 DEV migration state for Knowledge Export without changing application source or deployment, then resume Matrix E through Preview, Google Docs, PDF, clipboard, and final integrity readback.

## Accepted evidence — do not reopen

- Web App recovery: PASS.
- Versioned `/exec`: PASS.
- Integrated navigation: `PASS — USER-ASSISTED LIVE CONFIRMATION`.
- Matrix A/B/C: accepted.
- Inline Knowledge Search implementation and deterministic tests: accepted.
- Project identity and remote source currentness: accepted.
- Matrix D: `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`.

Matrix D is CLOSED for Work 0013. Do not attempt `setupKnowledgePlatform_()`, `validateInstallation_()`, `getInstallationStatus_()`, or `runAiSyncWorker_()` again in this dispatch.

## ChatGPT-completed DEV repair

ChatGPT independently verified that the existing DEV installation state predates the Work 0011 Knowledge Export migration.

ChatGPT has already completed and read back the following bounded DEV-only repairs:

1. created exactly one `Knowledge Exports` folder directly under the configured knowledge parent, as a sibling of the authoritative `Private Assets Knowledge` root;
2. updated Backend `Settings` to schema version `2` and app version `0.1.2`;
3. added the `KNOWLEDGE_EXPORTS_FOLDER_ID` Settings row referencing that folder;
4. preserved counters, AI configuration values, source rows, existing source folders/files, and `LAST_SETUP_AT`;
5. confirmed no duplicate `Knowledge Exports` folder existed before creation.

No raw IDs, URLs, account identifiers, or credentials may be copied into GitHub/chat/report.

## Remaining one-time repair

The only missing migration state is the existing Script Property:

`KSP_INSTALLATION_STATE_JSON`

Use the already identity-confirmed synthetic DEV Apps Script project and its Project Settings UI. Do not create an API executable, public wrapper, new deployment, or source change.

Privately inspect the existing JSON and verify before editing:

- `config.environment` is `DEV`;
- existing Backend/Audit/knowledge-root resources match the already confirmed DEV resource set;
- `resources.knowledgeExportsFolderId` is absent or empty;
- the single existing `Knowledge Exports` folder is directly under `config.knowledgeParentFolderId`.

Then edit ONLY the existing `KSP_INSTALLATION_STATE_JSON` value so that:

- `resources.knowledgeExportsFolderId` points to the single existing `Knowledge Exports` folder;
- `schemaVersion` is `2`;
- `releaseVersion` is `0.1.2`;
- `appVersion` is `0.1.2`;
- `componentWorkId`, `config`, all other resource references, and all unrelated fields are preserved;
- `updatedAt` may be refreshed to the current ISO timestamp.

Do NOT modify:

- `KSP_LAST_SETUP_REPORT_JSON`;
- `BOOTSTRAP_CONFIG_JSON`;
- any other Script Property;
- Backend counters;
- `LAST_SETUP_AT`;
- triggers;
- application source/tests/manifest;
- Web App deployment;
- Library deployments.

After saving, re-open/read back the property once and verify the new resource key is present and all preserved fields remain unchanged.

If the existing JSON does not match the confirmed DEV identity or contains unexpected divergence, stop without saving and return to ChatGPT.

## Matrix E resume

A single retry of Preview is authorized because the previously observed configuration blocker has now been repaired. This is not an unchanged-state retry.

Use the recovered versioned `/exec`. Do not re-prove navigation.

### E1 Preview

Run `対象資料を確認` once with the compact mixed Active synthetic source set.

PASS requires:

- Preview succeeds without Gemini configuration;
- Meeting/Pitchbook counts match authoritative Active rows;
- ordering is oldest-to-newest then stable source ID;
- Meeting character count matches authoritative Docs;
- no export artifact is created by Preview;
- Audit remains metadata-only/content-redacted.

If Preview still reports the Knowledge Exports folder missing, stop immediately. Do not make a second Script Property edit.

### E2 Google Docs

From a valid Preview, create one Google Docs export and verify the existing Matrix E contract in `docs/handoffs/0013-non-ai-final-live-qualification-instruction.md`.

### E3 PDF

Create one PDF export from a valid/fresh Preview and verify the existing Matrix E contract.

### E4 Clipboard

Use the normal `AI用プロンプトをコピー` action. The user may confirm only `貼り付けられた` / `貼り付けられない`; never paste prompt contents into chat/report.

### E5 Integrity

Confirm exports did not mutate authoritative Meeting/Pitchbook rows/files, did not create AI source state, and Audit contains only expected redacted metadata. Confirm no duplicate artifact from one action.

## Stop conditions

Stop at the first actual application/data-integrity defect after the one authorized configuration repair. Do not pursue a second hypothesis, second property edit, new deployment, or source repair in this dispatch.

## Completion

If Matrix E passes, Matrix D remains only the allowed private-execution-surface deferral, and no implementation blocker remains, classify:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

`BLOCKER: NO`

Residuals remain:

- Shared Drive-specific behavior: deferred;
- billing-enabled Gemini/File Search: deferred.

Do not claim production readiness.

## Reporting / delivery

Update:

- `docs/handoffs/0013-CODEX-01-knowledge-export-installation-state-repair-report.md`;
- `docs/handoffs/0013-report.md`;
- `docs/handoffs/0013-non-ai-final-live-qualification-report.md`;
- `docs/handoffs/0013-instruction.md`;
- `docs/handoffs/0013-dispatches.md`;
- Draft PR #11 body.

Run `git diff --check` and verify no private IDs/URLs, local clasp mappings, credentials, account information, or source content were recorded.

Keep PR #11 Draft / Open / unmerged. ChatGPT owns final review and merge decision.

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
