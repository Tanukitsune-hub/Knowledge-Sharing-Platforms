# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned diagnosis and GitHub coordination; one bounded versioned Web App recovery by Codex`.

Recommended Codex model: `Luna Max` for the active recovery run.

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
- Apps Script source / HTML / manifest / public-surface validation: PASS.
- Project identity: `PROJECT_IDENTITY_CONFIRMED`.
- Installation-state / source-family / continuity / uniqueness: PASS.
- Remote source: `REMOTE_SOURCE_CURRENT`; no push is required.
- Account context: `SINGLE_ACCOUNT_EDITOR_CONTEXT_CONFIRMED`.
- The editor-only `/dev` request completed `doGet` but displayed the Google Drive file-open error.
- Prior recovery attempts observed no authoritative data mutation.

Do not rerun project discovery, remote source comparison, historical navigation hypotheses, Matrix A/B/C, upload sizing, parser diagnosis, `/dev`, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini File Search.

## Current decision

The next action is intentionally simple and reversible:

- keep application source frozen;
- create exactly one versioned synthetic DEV deployment explicitly typed `Web app` in the already confirmed project;
- execute as the deploying user;
- restrict access to `Only myself`;
- confirm the generated entrypoint is `/exec`, not `/library/`;
- open it once;
- if the main page renders, verify `ナレッジ検索 -> 面談記録 -> ナレッジ検索` through same-document switching;
- confirm no authoritative mutation;
- stop on the first failure with no second deployment or source repair.

The editor-only `/dev` Drive error remains diagnostic evidence but is not a prerequisite for this normal versioned recovery.

## Active execution

Use:

`docs/handoffs/0013-fast-versioned-web-app-recovery-instruction.md`

Use the exact ref supplied in the Codex execution request.

Durable deployment and recurrence-prevention rules:

`docs/operations/apps-script-web-app-deployment.md`

## Recorded Work 0013 lessons

The incident record identifies the process failures that caused the investigation to expand:

- source changes before fixing the project/version/deployment/account identity chain;
- conflation of Library and Web App deployments;
- excessive reliance on deterministic tests for live behavior;
- treating missing `.clasp.json` as authoritative identity loss;
- treating `/dev` PASS as a universal prerequisite for `/exec`;
- repeated hypotheses before simplifying the control-plane state.

Future Apps Script deployment/recovery handoffs are required by `docs/handoffs/AGENTS.md` to follow the durable operations document and authorize no more than one bounded deployment mutation while source/deployment identity is uncertain.

## Source and data freeze

Do not change application source, tests, manifest, public facade, setup logic, schema, limits, Knowledge Export logic, AI/File Search logic, or navigation implementation.

Do not revert inline Knowledge Search integration.

Do not push or pull source, create another Apps Script project, or modify/delete Library deployments.

Do not execute setup/private admin functions, Matrix D/E, Preview, Docs, PDF, clipboard, Shared Drive, or Gemini File Search.

## Completion state

If versioned `/exec`, integrated navigation, and integrity checks pass:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for Web App entrypoint recovery.

Matrix D/E remain NOT RUN for the next bounded run.

## Safety / delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data or confidential source material.
- No credentials, raw IDs/URLs, account addresses, tokens, cookies, or user-specific local paths in GitHub/report/chat.
- No temporary public admin/debug wrapper or blind Windows UI automation.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Keep PR Draft / Open / unmerged.
- Do not merge; ChatGPT performs final review.