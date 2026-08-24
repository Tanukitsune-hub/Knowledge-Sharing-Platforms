# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned root-cause analysis and minimal repair; bounded Codex validation, DEV synchronization, deployment-version update, and live qualification`.

## Active dispatch

Use:

`docs/handoffs/0013-CODEX-02-pdf-export-transport-fix-verification-instruction.md`

Dispatch control:

`docs/handoffs/0013-dispatches.md`

Recommended model: `Luna Max`.

## Accepted completed evidence — do not reopen

- Project identity and remote source currentness: PASS.
- Versioned `/exec`: PASS.
- Integrated navigation: `PASS — USER-ASSISTED LIVE CONFIRMATION`.
- Matrix A/B/C and 25 MiB upload sizing: accepted.
- Matrix D: `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`; closed and non-blocking.
- Knowledge Export installation-state repair: PASS.
- Matrix E Preview: PASS.
- Google Docs export: PASS.
- Shared Drive-specific and billing-enabled Gemini/File Search qualification: deferred external gaps.

## Observed defect

The first qualified PDF export failed with `KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED`; no PDF artifact was created. The previous dispatch stopped immediately and did not retry.

## ChatGPT root-cause conclusion and repair

The live adapter used Apps Script Advanced Drive Service `Drive.Files.export()` to retrieve Google Docs export bytes. This Apps Script Advanced Service path is not reliable for byte-content export. Google’s Apps Script guidance uses the Drive v3 REST export endpoint through `UrlFetchApp.fetch()` with `ScriptApp.getOAuthToken()` and then `response.getBlob()`.

ChatGPT applied the minimal repair only in:

- `src/157_KnowledgeExportLiveEnvironment.gs`

and added focused regression coverage in:

- `tests/knowledge-export-live-environment.test.cjs`

No manifest, schema, public facade, UI, navigation, setup logic, Knowledge Export business rules, AI logic, or deployment settings were changed.

## Required next execution

Codex must execute only the active CODEX-02 handoff:

1. focused PDF transport regression tests;
2. existing Knowledge Export tests;
3. full `npm run check` and `git diff --check`;
4. exact tested source sync to the already confirmed synthetic DEV Apps Script project;
5. create one new immutable Apps Script version and update the existing recovered Web App deployment to that version without changing type/execute-as/access;
6. one fresh Preview only if needed for a current fingerprint;
7. one PDF export attempt;
8. clipboard qualification only after PDF PASS;
9. final authoritative integrity readback.

Do not create another Web App deployment. Do not rerun Docs export, Matrix A/B/C/D, Web App recovery, `/dev`, integrated navigation, or installation-state migration.

If the first post-fix PDF attempt still fails, stop and return to ChatGPT. Do not open a second hypothesis in the same dispatch.

## Completion target

If PDF and final integrity pass, and clipboard is PASS or only a documented browser-environment limitation, classify:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

`BLOCKER: NO`.

Do not claim `PRODUCTION READY` while Shared Drive-specific and billing-enabled Gemini/File Search qualification remain deferred.

Keep PR #11 Draft / Open / unmerged pending ChatGPT final review.

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
