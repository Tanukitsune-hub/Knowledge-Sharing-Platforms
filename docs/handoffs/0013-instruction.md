# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned diagnosis / GitHub / final judgment; bounded authenticated DEV repair and qualification by Codex`.

Recommended Codex model: `Luna Max`.

## Current blocker and correction

Matrix D is closed as:

`DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`

This is explicitly non-blocking and must not stop Work 0013.

Matrix E reached Preview and exposed the first real remaining blocker:

`Knowledge Exports フォルダが設定されていません。`

ChatGPT reviewed the source and live DEV state and confirmed this is a missing Work 0011 installation-state migration, not a navigation or source-code defect.

The source contract already expects:

- a `Knowledge Exports` folder as a sibling of the authoritative `Private Assets Knowledge` root;
- Backend schema version `2` / app version `0.1.2`;
- `KNOWLEDGE_EXPORTS_FOLDER_ID` in Backend Settings;
- `resources.knowledgeExportsFolderId` in `KSP_INSTALLATION_STATE_JSON`.

## ChatGPT-completed repair

ChatGPT has already, in the confirmed synthetic DEV environment:

- verified the knowledge-parent boundary;
- confirmed no existing `Knowledge Exports` sibling folder existed;
- created exactly one `Knowledge Exports` sibling folder;
- updated Backend Settings to schema `2` and app `0.1.2`;
- added `KNOWLEDGE_EXPORTS_FOLDER_ID`;
- read back those Settings successfully;
- preserved counters, source rows/files, AI settings, and `LAST_SETUP_AT`.

No raw IDs/URLs are stored in GitHub/chat.

## Active execution

Use:

`docs/handoffs/0013-CODEX-01-knowledge-export-installation-state-repair-instruction.md`

Dispatch control:

`docs/handoffs/0013-dispatches.md`

Codex must patch only the existing `KSP_INSTALLATION_STATE_JSON` in Project Settings to register the already-created `Knowledge Exports` folder and current schema/app version, preserving all other identity/config/resource fields.

Then retry Matrix E Preview once and, on PASS, continue through Google Docs, PDF, clipboard, and final integrity readback.

A retry is authorized because the observed configuration blocker has been repaired; this is not an unchanged-state retry.

## Accepted completed evidence — do not reopen

- Project identity: PASS.
- Remote source currentness: PASS.
- Versioned `/exec`: PASS.
- Integrated navigation: `PASS — USER-ASSISTED LIVE CONFIRMATION`.
- Matrix A/B/C: accepted.
- Upload sizing through 25 MiB: accepted.
- Pitchbook Date/status-parser repairs: PASS.
- Inline Knowledge Search deterministic validation: PASS.
- Work 0011 Knowledge Export deterministic tests: PASS.
- Matrix D: allowed non-blocking DEFERRED state; closed.

Do not rerun or reopen project/deployment recovery, `/dev`, navigation, Matrix A/B/C, upload sizing, parser diagnosis, or Matrix D.

## Hard boundary

Do not:

- change application source/tests/manifest/navigation/public facade;
- run `setupKnowledgePlatform_()` or other private admin functions;
- create an API executable or public wrapper;
- create another Web App deployment;
- modify Library deployments;
- configure Gemini/File Search;
- create a Shared Drive;
- touch production/confidential data.

## Completion

If Matrix E passes and no implementation/data-integrity blocker remains, classify:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

`BLOCKER: NO`

Residual external gaps:

- Shared Drive-specific qualification: deferred;
- billing-enabled Gemini/File Search qualification: deferred.

Do not claim production readiness.

Keep PR #11 Draft / Open / unmerged. ChatGPT owns final review and merge decision.

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
