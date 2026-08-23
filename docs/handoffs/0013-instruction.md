# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned diagnosis and GitHub coordination; bounded authenticated recovery / verification by Codex`.

Recommended Codex model: `Luna Max` for the active versioned Web App recovery run.

## Accepted completed evidence — do not rerun

- Pitchbook Date repair: PASS.
- Pitchbook status-parser repair: PASS.
- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: `1 / 5 / 10 / 15 / 20 / 25 MiB`: live PASS.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS.
- Work 0012 public-surface hardening: deterministic PASS.
- Inline Knowledge Search implementation: focused `36/36 PASS`.
- `npm run check` / `npm run test`: `160/160 PASS`.
- Current source inventory and public-surface validation: PASS.
- Project identity: `PROJECT_IDENTITY_CONFIRMED`.
- Installation-state / source-family / continuity / uniqueness: PASS.
- Remote source: `REMOTE_SOURCE_CURRENT`; no push required.
- Account context: `SINGLE_ACCOUNT_EDITOR_CONTEXT_CONFIRMED`.
- `/dev` request produced a completed `doGet` execution but browser displayed the Google Drive file-open error.
- Prior recovery attempts observed no authoritative data mutation.

Do not rerun project discovery, remote source comparison, Matrix A/B/C, upload sizing, parser diagnosis, historical navigation experiments, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

## ChatGPT correction to the recovery gate

The prior contract incorrectly treated `/dev` PASS as a mandatory prerequisite for creating a normal versioned `/exec` deployment.

`/dev` is an editor-only HEAD/test surface. The current evidence proves the request reaches the correct script and completes `doGet`, while known Apps Script behavior includes cases where the same Google Drive file-open error affects `/dev` independently of a usable versioned `/exec` deployment.

Therefore `/dev` failure is no longer a hard gate for `/exec` recovery.

ChatGPT also reviewed the current startup source: the normal `Index` route has no automatic top-level navigation on initial load; startup client code performs `google.script.run` bootstrap calls, and the only remaining `window.location` handler is guarded behind the standalone-only `knowledge-back` control that is absent from the integrated main page.

Do not change source based only on the `/dev` Drive error.

## Active execution

Use:

`docs/handoffs/0013-versioned-dev-web-app-recovery-instruction.md`

The run must:

1. read existing execution history around the failed `/dev` attempt and classify whether normal client bootstrap executions followed completed `doGet`;
2. create exactly one explicit versioned synthetic DEV Web App deployment in the already confirmed project;
3. use `execute as deploying user` and `Only myself`;
4. open the generated `/exec` once in the same single-account context;
5. if the main page renders, verify same-document `ナレッジ検索 -> 面談記録 -> ナレッジ検索`;
6. confirm no authoritative data mutation.

If `/exec` fails, stop without another deployment or source hypothesis.

## Source and data freeze

Do not change application source, tests, manifest, public facade, setup logic, schema, limits, Knowledge Export logic, AI/File Search logic, or navigation implementation.

Do not revert inline Knowledge Search integration.

Do not push or pull source, create another Apps Script project, or modify/delete Library deployments.

Do not execute setup/private admin functions, Matrix D/E, Preview, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

## Completion state

If versioned `/exec`, integrated navigation, and integrity checks pass:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for Web App entrypoint recovery.

The `/dev` HEAD/test defect remains a non-blocking development-environment issue unless later evidence shows it affects normal `/exec` operation.

Matrix D/E remain NOT RUN for a later bounded run.

## Safety / delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data or confidential source material.
- No credentials, raw IDs/URLs, account addresses, tokens, cookies, or user-specific local paths in GitHub/report/chat.
- No temporary public admin/debug wrapper or blind Windows UI automation.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Keep PR Draft / Open / unmerged.
- Do not merge; ChatGPT performs final review.
