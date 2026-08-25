# Work 0013 — Fast versioned DEV Web App recovery

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — one bounded versioned Web App deployment and live verification`.

Recommended Codex model: `Luna Max`.

Rationale: the project, account context, installation state, and remote source are already proven. The remaining recovery action is routine and reversible: create one versioned Web App deployment in the confirmed synthetic DEV project, open its `/exec`, and verify the current same-document navigation. No further architecture, source diagnosis, or broad planning is required.

Use the exact ref supplied in the Codex execution request; it must include this handoff and the current Work 0013 report.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Recovery report: `docs/handoffs/0013-fast-versioned-web-app-recovery-report.md`.

Durable deployment rules: `docs/operations/apps-script-web-app-deployment.md`.

## Outcome

Restore the normal synthetic DEV Web App entrypoint with the shortest safe operation.

Success requires:

- one new versioned deployment explicitly typed `Web app`;
- execute as the deploying user;
- access restricted to the deploying user;
- generated `/exec` visibly renders the normal main page;
- `ナレッジ検索 -> 面談記録 -> ナレッジ検索` works through same-document switching;
- no authoritative data mutation.

## Accepted evidence — do not repeat

- `PROJECT_IDENTITY_CONFIRMED`.
- installation-state / source-family / continuity / uniqueness: PASS.
- `REMOTE_SOURCE_CURRENT`; no push is required.
- `SINGLE_ACCOUNT_EDITOR_CONTEXT_CONFIRMED`.
- the editor-only `/dev` request completed `doGet` but showed the Google Drive file-open error.
- inline Knowledge Search focused tests: `36/36 PASS`.
- `npm run check` / `npm run test`: `160/160 PASS`.
- source / HTML / manifest / public-surface validation: PASS.
- no authoritative mutation observed in recovery attempts.

Do not inspect or rerun historical navigation hypotheses, project discovery, remote comparison, Matrix A/B/C, upload sizing, parser diagnosis, `/dev`, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini File Search.

## Mandatory repository instructions and subagents

Before starting, read all applicable `AGENTS.md` / `AGENTS.override.md` files and follow them.

Use subagents actively and proportionately:

- one independent read-only check of deployment type/settings before opening `/exec`;
- one independent final check of evidence, integrity, Git status, and secret redaction.

Do not duplicate the main operation across agents.

## Hard freeze

Do not change application `.gs` / `.html` source, tests, manifest, navigation, public facade, setup logic, schema, limits, Knowledge Export, or AI/File Search logic.

Do not push or pull source.

Do not create another Apps Script project.

Do not modify, archive, or delete existing Library deployments.

Never record or commit Script IDs, deployment IDs, resource IDs, full Web App URLs, account identifiers, cookies, tokens, credentials, OAuth files, `.clasp.json`, or `.clasprc.json`.

## Single authorized recovery operation

Use the already confirmed synthetic DEV Apps Script project and the confirmed single-account editor context.

1. Open `Deploy > New deployment`.
2. Select type `Web app` explicitly.
3. Set description to `KSP Work 0013 DEV Web App restored`.
4. Set execute-as to the deploying user.
5. Set access to `Only myself`.
6. Create the deployment once.
7. Confirm in the deployment UI or authoritative deployment readback that:
   - the selected deployment is a Web App, not a Library;
   - it is versioned rather than HEAD-only;
   - execute-as and access match the settings above;
   - the generated application URL ends in `/exec`, not `/library/`.
8. Open that generated `/exec` exactly once in the same single-account context.

No pre-deployment investigation is required beyond confirming the exact project and settings already established by the accepted evidence.

## Live acceptance

If the normal main page does not visibly render, stop immediately. Do not create a second deployment and do not change source.

If it renders:

1. confirm the Meeting page is visible;
2. click `ナレッジ検索` once;
3. confirm `ナレッジ検索` and `対象資料の書き出し` are visible;
4. click `面談記録` once and confirm Meeting returns;
5. click `ナレッジ検索` once and confirm the integrated page returns;
6. confirm these switches require no browser URL change.

Classify:

- `VERSIONED_EXEC_AND_INTEGRATED_NAVIGATION_PASS`; or
- the smallest observed failure.

## Integrity readback

Confirm after the probe:

- Meeting and Pitchbook row counts are unchanged;
- no source Docs/files changed;
- no Knowledge Export artifact was created;
- no AI state changed;
- no setup/private administrator function ran;
- no trigger changed;
- exactly one new DEV Web App deployment was created.

## Reporting and delivery

Create/update:

- `docs/handoffs/0013-fast-versioned-web-app-recovery-report.md`;
- `docs/handoffs/0013-report.md`;
- `docs/handoffs/0013-instruction.md`;
- Draft PR #11 body.

Run `git diff --check` and confirm no local clasp/OAuth/ID/URL/account material is tracked.

Keep PR #11 Draft / Open / unmerged. Do not merge.

## Completion

On full PASS:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for Web App entrypoint recovery.

Matrix D/E remain NOT RUN for the next bounded run.

On failure, retain `BLOCKER: YES`, report the smallest observed evidence, and stop. Do not attempt a second deployment or source repair.

## Completion response

Return only:

- Work ID;
- versioned `/exec` result;
- integrated navigation result;
- authoritative integrity result;
- deployment type;
- execute-as category;
- access category;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any failure.

Never return raw IDs or full URLs.