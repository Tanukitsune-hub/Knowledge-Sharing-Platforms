# Work 0013 — Verified versioned DEV Web App recovery

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded deployment-metadata reconciliation, one versioned DEV Web App recovery, and live verification`.

Recommended Codex model: `Sol High`.

Rationale: project identity, account context, and source currentness are proven, but the observed `/dev` browser failure occurred after a completed `doGet`. The remaining ambiguity spans Apps Script HEAD/test serving, versioned deployment metadata, and browser/client startup. This run must eliminate deployment-entrypoint mistakes and classify the failure layer without another speculative source change.

Starting ref: `11e33f3670eca63a2fcadf1fc8f28c52e3926ead`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

Recovery report: `docs/handoffs/0013-verified-versioned-web-app-recovery-report.md`.

## Confirmed facts — do not reopen

- `PROJECT_IDENTITY_CONFIRMED`.
- installation-state / source-family / continuity / uniqueness: PASS.
- `REMOTE_SOURCE_CURRENT`; no source push is required.
- `SINGLE_ACCOUNT_EDITOR_CONTEXT_CONFIRMED`.
- the `/dev` request reached the confirmed Apps Script project and completed `doGet`.
- the browser nevertheless displayed the Google Drive file-open error.
- inline Knowledge Search focused tests: `36/36 PASS`.
- `npm run check` / `npm run test`: `160/160 PASS`.
- Apps Script source / HTML / manifest / public-surface validation: PASS.
- prior recovery attempts observed no authoritative data mutation.

These facts exclude wrong project, stale remote source, missing `doGet`, a multi-account browser context, and a server-side `doGet` exception as sufficient explanations.

They do not yet prove one root cause. The remaining material possibilities are:

1. the editor-only HEAD `/dev` serving surface is defective while a normal versioned Web App remains usable;
2. the deployment UI or selected URL does not represent a real `WEB_APP` entrypoint with the intended version/access/execute-as configuration;
3. the generated HTML reaches the browser wrapper but normal client bootstrap does not start;
4. the client starts and a later browser/wrapper/application failure occurs.

## Outcome

Create or identify exactly one verified versioned synthetic DEV Web App entrypoint in the identity-confirmed project, prove its deployment metadata before opening it, and determine whether the current application renders and supports same-document Knowledge Search navigation.

Success requires:

- one versioned deployment whose readback proves `WEB_APP` entrypoint, pinned version, `MYSELF` access, and `USER_DEPLOYING` execution;
- opening only the URL returned by that verified Web App entrypoint;
- normal main page render;
- `ナレッジ検索 -> 面談記録 -> ナレッジ検索` same-document navigation PASS;
- no authoritative data mutation.

## Applicable instructions and mandatory subagents

Before starting, read every applicable `AGENTS.md` / `AGENTS.override.md` and follow the repository-specific subagent policy.

Use subagents actively and proportionately. At minimum use independent perspectives for:

- Apps Script deployment inventory and entrypoint-metadata verification;
- execution-history / browser-startup classification;
- final Git, report, and secret-redaction review.

The parent agent owns the one allowed deployment mutation and final classification.

## Hard freeze

Do not change application `.gs` / `.html` source, tests, manifest, public facade, setup logic, schema, limits, Knowledge Export logic, AI/File Search logic, or navigation implementation.

Do not push or pull source. Do not create another Apps Script project. Do not modify, archive, or delete Library deployments.

Do not run Matrix D/E, Preview, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

Never record raw Script IDs, deployment IDs, resource IDs, Web App URLs, account identifiers, cookies, tokens, credentials, or OAuth material.

## Phase 1 — Classify the already-observed `/dev` execution

Do not rerun `/dev`.

Inspect the Apps Script execution history around the accepted failed `/dev` request and record function category and status only.

Determine whether any normal initial browser bootstrap calls followed completed `doGet`, especially:

- `getMeetingBootstrapData`;
- `getPitchbookBootstrapData`;
- `getPhase1MaintenanceBootstrapData`;
- `getKnowledgeSearchBootstrapData`.

Classify exactly one:

- `DEV_HEAD_FAIL_BEFORE_CLIENT_BOOTSTRAP`;
- `DEV_HEAD_FAIL_AFTER_CLIENT_BOOTSTRAP`;
- `DEV_HEAD_BOOTSTRAP_NOT_SAFELY_OBSERVABLE`;
- `DEV_HEAD_APPLICATION_EXCEPTION_OBSERVED`.

If a concrete application exception is observed, stop before deployment and return its safe error class to ChatGPT. Otherwise continue. This phase is diagnostic evidence; `/dev` PASS is not required for the versioned deployment test.

## Phase 2 — Read-only deployment inventory before mutation

Using the Apps Script API, `clasp deployments`, or an equivalently authoritative read-only method, list deployment metadata for the identity-confirmed project.

Record only counts and classifications, not IDs or URLs:

- number of `WEB_APP` entrypoints;
- number of Library/add-on/API entrypoints;
- whether any existing `WEB_APP` entrypoint already has the exact description `KSP Work 0013 DEV Web App restored`;
- whether a usable versioned Web App already exists with `MYSELF` + `USER_DEPLOYING`.

If exactly one already-verified usable versioned Web App exists for this recovery description, do not create a duplicate; proceed with that verified entrypoint.

If none exists, one new versioned Web App deployment is authorized.

If deployment inventory cannot distinguish entrypoint types safely, or more than one candidate matches the recovery description, stop without mutation.

## Phase 3 — Create exactly one versioned DEV Web App when needed

Through the Apps Script deployment UI in the confirmed single-account editor context:

- `Deploy > New deployment`;
- type: `Web app`;
- description: `KSP Work 0013 DEV Web App restored`;
- execute as: deploying user;
- access: `Only myself`;
- deploy the current saved source as a normal versioned deployment.

Do not create a second deployment in this run.

## Phase 4 — Mandatory deployment metadata readback

Before opening any generated URL, read back the new or reused deployment through the Apps Script API or equivalent authoritative deployment listing.

PASS requires all of the following:

- project identity matches the already confirmed project;
- deployment description matches exactly;
- deployment is based on a non-zero pinned version number;
- exactly one entrypoint is classified `WEB_APP` for the selected deployment;
- access is `MYSELF`;
- execute-as is `USER_DEPLOYING`;
- the Web App entrypoint exposes an `/exec` URL;
- no Library/add-on/API entrypoint is being mistaken for the Web App.

Classify:

- `VERSIONED_WEB_APP_METADATA_PASS`;
- `VERSIONED_WEB_APP_ENTRYPOINT_TYPE_MISMATCH`;
- `VERSIONED_WEB_APP_CONFIG_MISMATCH`;
- `VERSIONED_WEB_APP_METADATA_NOT_SAFELY_OBSERVABLE`.

If metadata does not PASS, do not open the URL and stop. Do not edit or create another deployment.

## Phase 5 — Open only the verified `/exec` entrypoint

Open once, in the same single-account browser context, only the URL returned by the metadata-verified `WEB_APP` entrypoint.

Observe the browser and corresponding Apps Script executions.

Classify the browser result:

- `VERSIONED_EXEC_MAIN_PASS`;
- `VERSIONED_EXEC_DRIVE_ERROR`;
- `VERSIONED_EXEC_APPLICATION_ERROR`;
- `VERSIONED_EXEC_NOT_SAFELY_OBSERVABLE`.

Classify execution startup:

- `VERSIONED_EXEC_DOGET_AND_BOOTSTRAP_OBSERVED`;
- `VERSIONED_EXEC_DOGET_ONLY_NO_BOOTSTRAP`;
- `VERSIONED_EXEC_NO_DOGET_OBSERVED`;
- `VERSIONED_EXEC_EXECUTIONS_NOT_SAFELY_OBSERVABLE`;
- `VERSIONED_EXEC_APPLICATION_EXCEPTION_OBSERVED`.

If the main page does not visibly render, stop immediately. Do not create a second deployment or change source.

Interpretation boundaries:

- Drive error + no `doGet`: access/routing/deployment-entry issue.
- Drive error + completed `doGet` but no bootstrap: Apps Script serving/wrapper failure before client startup is strongly supported.
- Drive error + bootstrap executions: client/wrapper failure after startup is supported; record only safe function/status evidence and stop.
- visible application error or failed execution: return the safe error class to ChatGPT.

Do not claim a narrower cause than the observed evidence supports.

## Phase 6 — Integrated navigation

Only after `VERSIONED_EXEC_MAIN_PASS`:

1. confirm the Meeting page is visible;
2. click `ナレッジ検索` once;
3. confirm `ナレッジ検索` and `対象資料の書き出し` are visible;
4. click `面談記録` once and confirm Meeting returns;
5. click `ナレッジ検索` once and confirm the integrated page returns;
6. confirm no browser URL change/edit is needed.

Classify `INTEGRATED_NAVIGATION_PASS` or the smallest observed failure. Stop on failure without another navigation mechanism.

## Integrity readback

Confirm:

- Meeting and Pitchbook row counts unchanged;
- no source Docs/files changed;
- no Knowledge Export artifact created;
- no AI state changed;
- no setup/private administrator function ran;
- no trigger changed;
- only the one allowed versioned DEV Web App deployment was created, if creation was needed.

## Reporting / Git

Create/update:

- `docs/handoffs/0013-verified-versioned-web-app-recovery-report.md`;
- `docs/handoffs/0013-report.md`;
- `docs/handoffs/0013-instruction.md`;
- Draft PR #11 body.

Run `git diff --check`. Verify no local clasp/OAuth/ID/URL/account/session material is tracked.

Keep PR #11 Draft / Open / unmerged. Do not merge.

## Completion

PASS:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for Web App entrypoint recovery.

Otherwise retain `BLOCKER: YES` with the narrowest evidence-backed classification.

## Mandatory stop conditions

Stop when:

- a concrete application exception is found before deployment;
- deployment inventory is ambiguous;
- explicit Web App type, execute-as, or access cannot be selected;
- metadata readback does not prove the intended `WEB_APP` entrypoint and configuration;
- `/exec` main render fails;
- integrated navigation fails;
- source changes appear necessary;
- continuing would require production access, public access, credential disclosure, or destructive cleanup.

Do not transition to a second deployment or source hypothesis in the same run.

## Completion response

Return only:

- Work ID;
- `/dev` bootstrap classification;
- pre-mutation deployment inventory classification;
- versioned Web App metadata classification;
- `/exec` browser result;
- `/exec` execution-startup classification;
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
- one-line evidence for any FAIL/DEFERRED item.

Never return raw IDs or full URLs.
