# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned diagnosis and GitHub coordination; bounded authenticated recovery / verification by Codex`.

Recommended Codex model: `Sol High` for the active recovery run.

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
- Prior failed recovery attempt observed no authoritative data mutation.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, historical URL-navigation experiments, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search in the active recovery run.

## Current blocker

The corrected project-identity reconstruction completed successfully:

- `PROJECT_IDENTITY_CONFIRMED`;
- installation-state, source-family, operational-continuity, and uniqueness gates: PASS;
- remote source: `REMOTE_SOURCE_CURRENT` with `59` local / `59` remote files and no content diff;
- no source push was required.

The editor-only Web App test deployment then failed at the mandatory `/dev` gate. Opening the
`/dev` link displayed the Google Drive file-open error page.

Current blocker: `DEV_TEST_WEB_APP_FAIL`.

The run stopped without creating `/exec`, changing a persistent deployment, executing application
or administrator functions, or mutating authoritative data. Raw IDs and URLs remain private.

## Active next execution

Use:

`docs/handoffs/0013-project-identity-reconstruction-and-web-app-recovery-instruction.md`

ChatGPT has also hardened `.gitignore` so local clasp mappings and credentials cannot be tracked.

The active recovery contract required:

1. discover plausible Apps Script project candidates without mutation;
2. confirm exactly one project through installation-state, source-family, continuity, and uniqueness evidence;
3. reconstruct an untracked local clasp mapping;
4. compare remote source in a disposable directory;
5. synchronize only if the confirmed project is behind the tested ref;
6. prove the `/dev` Web App entrypoint;
7. create/restore one explicit DEV `/exec` Web App deployment through the Apps Script UI;
8. verify same-document `ナレッジ検索 -> 面談記録 -> ナレッジ検索` navigation;
9. confirm no authoritative data mutation.

The identity and remote-source stages are complete. The `/dev` failure is a mandatory stop
condition, so `/exec` recovery and integrated navigation remain unrun until a later explicitly
bounded instruction resolves or supersedes that gate.

## Source freeze

Do not change application source, tests, manifest, public facade, setup logic, schema, limits, Knowledge Export logic, AI/File Search logic, or navigation implementation in the active recovery run.

Do not revert inline Knowledge Search integration.

Do not create a new Apps Script project.

Do not modify/delete Library deployments.

## Matrix D/E and external residuals

Matrix D and Matrix E remain NOT RUN until the DEV Web App entrypoint is restored and integrated navigation passes.

Shared Drive-specific qualification and billing-enabled Gemini/File Search qualification remain separate external residual gaps.

## Safety / delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data or confidential source material.
- No credentials, raw IDs/URLs, tokens, cookies, or user-specific local paths in GitHub/report/chat.
- No temporary public admin/debug wrapper or blind Windows UI automation.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Keep PR Draft / Open / unmerged.
- Do not merge; ChatGPT performs final review.
