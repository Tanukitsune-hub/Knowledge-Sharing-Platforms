# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned diagnosis and GitHub coordination; bounded authenticated recovery / verification by Codex`.

Recommended Codex model: `Luna Max` for the active account-context recovery run.

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
- Installation-state, source-family, operational-continuity, and uniqueness gates: PASS.
- Remote source: `REMOTE_SOURCE_CURRENT`; no push required.
- Prior recovery attempts observed no authoritative data mutation.

Do not rerun project discovery, remote source comparison, Matrix A/B/C, upload sizing, parser diagnosis, historical URL-navigation experiments, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search in the active recovery run.

## Current blocker and corrected diagnosis

The editor-only Web App test deployment failed with a Google Drive file-open page.

Current observed result:

`DEV_TEST_WEB_APP_FAIL`.

This result does not yet prove an application-source failure. Apps Script `/dev` URLs are accessible only to users with edit access to the script project, and Apps Script/Web Apps do not reliably support multiple Google Accounts active in the same browser profile.

The previous run did not establish that the `/dev` URL was opened in the same isolated single-account browser context as the confirmed editor account. The next run therefore tests one access-layer hypothesis before any deployment or source action.

## Active next execution

Use:

`docs/handoffs/0013-dev-test-auth-context-recovery-instruction.md`

The active hypothesis is:

`The /dev Drive file-open error was caused by a multi-account or different-account browser session rather than application source.`

The run must:

1. use a clean Incognito or dedicated browser profile with exactly one Google Account;
2. confirm that account has edit access to the exact identity-confirmed synthetic DEV project;
3. open the Web App `/dev` URL once in the same browser context;
4. record whether a corresponding `doGet` execution occurs;
5. stop if `/dev` does not pass;
6. only after `/dev` PASS, create one explicit DEV `/exec` Web App through the Apps Script UI;
7. verify same-document `ナレッジ検索 -> 面談記録 -> ナレッジ検索`;
8. confirm no authoritative data mutation.

## Source and data freeze

Do not change application source, tests, manifest, public facade, setup logic, schema, limits, Knowledge Export logic, AI/File Search logic, or navigation implementation.

Do not revert inline Knowledge Search integration.

Do not push or pull source, create a new Apps Script project, or modify/delete Library deployments.

Do not execute setup/private admin functions, Matrix D/E, Preview, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

## Completion state

If the isolated `/dev`, explicit `/exec`, integrated navigation, and integrity checks pass:

`DEV WEB APP ENTRYPOINT RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for entrypoint recovery.

Matrix D/E remain NOT RUN for a later bounded run.

## Safety / delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data or confidential source material.
- No credentials, raw IDs/URLs, account addresses, tokens, cookies, or user-specific local paths in GitHub/report/chat.
- No temporary public admin/debug wrapper or blind Windows UI automation.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Keep PR Draft / Open / unmerged.
- Do not merge; ChatGPT performs final review.
