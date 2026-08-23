# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned diagnosis and GitHub coordination; bounded authenticated recovery / verification by Codex`.

Recommended Codex model: `Sol High` for the active verified versioned Web App recovery run.

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

These facts exclude wrong project, stale remote source, missing `doGet`, multi-account context, and a server-side `doGet` exception as sufficient explanations. They do not yet prove one final root cause.

Do not rerun project discovery, remote source comparison, Matrix A/B/C, upload sizing, parser diagnosis, historical navigation experiments, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

## Current diagnosis boundary

The remaining material ambiguity is limited to:

1. an editor-only HEAD `/dev` serving defect;
2. incorrect or ambiguous deployment entrypoint metadata;
3. a failure between completed `doGet` and normal client bootstrap;
4. a failure after client bootstrap begins.

Do not claim a narrower cause until versioned deployment metadata and `/exec` execution-startup evidence distinguish these layers.

## Active execution

Use:

`docs/handoffs/0013-verified-versioned-web-app-recovery-instruction.md`

The active run must:

1. classify whether normal client bootstrap executions followed the accepted failed `/dev` `doGet`;
2. read the current deployment inventory by entrypoint type;
3. create no more than one explicit versioned synthetic DEV Web App when needed;
4. read back and prove `WEB_APP`, pinned version, `MYSELF`, `USER_DEPLOYING`, and `/exec` before opening it;
5. open only the verified Web App entrypoint;
6. classify browser render and `doGet` / bootstrap execution startup;
7. only after main render PASS, verify same-document `ナレッジ検索 -> 面談記録 -> ナレッジ検索`;
8. confirm no authoritative data mutation.

If deployment metadata, `/exec`, or integrated navigation fails, stop without a second deployment or source hypothesis.

## Source and data freeze

Do not change application source, tests, manifest, public facade, setup logic, schema, limits, Knowledge Export logic, AI/File Search logic, or navigation implementation.

Do not revert inline Knowledge Search integration.

Do not push or pull source, create another Apps Script project, or modify/delete Library deployments.

Do not execute setup/private admin functions, Matrix D/E, Preview, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

## Completion state

If verified versioned `/exec`, integrated navigation, and integrity checks pass:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for Web App entrypoint recovery.

The `/dev` HEAD/test defect may remain a non-blocking development-environment issue if the normal versioned Web App is proven usable.

Matrix D/E remain NOT RUN for a later bounded run.

## Safety / delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data or confidential source material.
- No credentials, raw IDs/URLs, account addresses, tokens, cookies, or user-specific local paths in GitHub/report/chat.
- No temporary public admin/debug wrapper or blind Windows UI automation.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Keep PR Draft / Open / unmerged.
- Do not merge; ChatGPT performs final review.
