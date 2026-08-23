# Work 0013 — DEV test Web App authentication-context recovery

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded authenticated browser-session diagnosis and DEV Web App recovery`.

Recommended Codex model: `Luna Max`.

Rationale: project identity and remote-source currentness are now proven. The remaining failure is a narrowly framed access-layer question: an Apps Script `/dev` URL is editor-only, and Apps Script does not support simultaneous multi-account sessions. Residual work is controlled session isolation, one falsifiable `/dev` reproduction, and—only after PASS—explicit `/exec` recovery and navigation verification.

Starting ref: `26b36d1e98451480bc2d3628616f4db18c6bd399`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

Prior recovery report: `docs/handoffs/0013-project-identity-reconstruction-and-web-app-recovery-report.md`.

New report: `docs/handoffs/0013-dev-test-auth-context-recovery-report.md`.

## Accepted evidence — do not reopen

- `PROJECT_IDENTITY_CONFIRMED`.
- Installation-state, source-family, continuity, and uniqueness gates: PASS.
- Remote source: `REMOTE_SOURCE_CURRENT`; local and remote inventories match with no content difference.
- Inline Knowledge Search focused tests: `36/36 PASS`.
- `npm run check` / `npm run test`: `160/160 PASS`.
- Apps Script source / HTML / manifest / public-surface validation: PASS.
- Previous `/dev` attempt showed a Google Drive file-open error and no authoritative mutation.

Do not rerun project discovery, remote source comparison, source tests, Matrix A/B/C, upload sizing, parser work, historical navigation experiments, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

## Current diagnosis

The `/dev` result has not yet demonstrated an application-code failure.

Apps Script test Web App URLs:

- end in `/dev`;
- are accessible only to users with edit access to the script project;
- are not reliably supported when multiple Google Accounts are active in the same browser profile.

The previous report did not establish that the `/dev` URL was opened in the same single-account browser session as the authenticated editor account. The observed Google Drive file-open page is therefore first treated as an authentication/session-boundary failure, not a source defect.

## Single falsifiable hypothesis

`The confirmed KSP /dev URL failed because it was opened under a multi-account or different-account browser session rather than a clean session containing only the project editor account.`

Do not investigate a competing source, deployment, routing, or data hypothesis in this run.

## Hard freeze

Do not change:

- application `.gs` / `.html` source;
- tests or manifest;
- navigation implementation;
- public facade;
- setup logic, schema, limits, Knowledge Export, or AI/File Search logic;
- Script Properties, Backend, Audit, source Docs/files, triggers, or authoritative state.

Do not push source. Do not pull into the repository. Do not create another Apps Script project. Do not update/delete Library deployments.

## Phase 1 — Account-context proof

Use one isolated browser context only:

1. Open a new Chrome Incognito window or a dedicated Chrome profile with no existing Google sessions.
2. Sign in to exactly one Google Account: the same account privately confirmed during project-identity reconstruction as having edit access to the exact KSP synthetic DEV Apps Script project.
3. Do not add or switch to a second Google Account in this context.
4. In that same browser context, open the confirmed Apps Script editor project.
5. Confirm edit access non-destructively by opening Project Settings and the code editor. Do not save or modify source.
6. Record only:
   - `SINGLE_ACCOUNT_EDITOR_CONTEXT_CONFIRMED`; or
   - `SINGLE_ACCOUNT_EDITOR_CONTEXT_NOT_CONFIRMED`.

Do not record the account address, Script ID, project URL, or any private identifier.

If the isolated context cannot be confirmed, stop without deployment action.

## Phase 2 — One `/dev` reproduction

Only after `SINGLE_ACCOUNT_EDITOR_CONTEXT_CONFIRMED`:

1. In the same isolated browser context, use `Deploy > Test deployments`.
2. Select deployment type `Web app` explicitly.
3. Open the generated `/dev` URL in a new tab within the same isolated browser context.
4. Do not send the URL to another browser, system-default profile, connector surface, or logged-in account.
5. Perform exactly one load attempt.
6. Observe whether the normal main application renders.
7. Check the Apps Script Executions view before/after and record only whether a corresponding `doGet` execution was observed. Do not copy raw logs, IDs, URLs, or account data.

Classify exactly one:

- `DEV_TEST_WEB_APP_PASS` — main application visibly renders;
- `DEV_TEST_AUTH_CONTEXT_FAIL_NO_EXECUTION` — Drive/access error remains and no `doGet` execution is observed;
- `DEV_TEST_RUNTIME_FAIL_EXECUTION_OBSERVED` — a corresponding `doGet` execution occurs but the app fails;
- `DEV_TEST_WEB_APP_NOT_SAFELY_OBSERVABLE`.

If the result is not `DEV_TEST_WEB_APP_PASS`, stop. Do not create `/exec` and do not pursue another hypothesis.

For `DEV_TEST_RUNTIME_FAIL_EXECUTION_OBSERVED`, record only a safe error category and redacted short message if available. Never record a stack trace containing private data.

## Phase 3 — Persistent DEV Web App recovery

Only after `/dev` PASS:

1. In the same confirmed Apps Script project and isolated browser account, select `Deploy > New deployment`.
2. Select deployment type `Web app` explicitly.
3. Description: `KSP Work 0013 DEV Web App restored`.
4. Execute as: deploying user.
5. Access: `Only myself` for this synthetic personal DEV qualification unless an already-approved narrower equivalent is shown.
6. Create one deployment.
7. Open its `/exec` URL in the same isolated browser context.
8. Do not record the URL or deployment ID.

Do not use `clasp deploy` / `clasp redeploy`.

Classify:

- `DEV_EXEC_WEB_APP_PASS`;
- `DEV_EXEC_WEB_APP_FAIL`;
- `DEV_EXEC_WEB_APP_NOT_SAFELY_OBSERVABLE`.

If `/exec` does not pass, stop without source changes.

## Phase 4 — Integrated navigation acceptance

Only after `/exec` PASS:

1. Confirm the main Meeting page is visible.
2. Click `ナレッジ検索` once.
3. Confirm `ナレッジ検索` and `対象資料の書き出し` are visible.
4. Click `面談記録` once and confirm the Meeting page returns.
5. Click `ナレッジ検索` once and confirm the integrated page returns.
6. Confirm no address-bar edit or top-level page navigation was required.

Classify:

- `INTEGRATED_NAVIGATION_PASS`;
- `INTEGRATED_NAVIGATION_FAIL`.

Do not run Preview, Docs, PDF, clipboard, Matrix D/E, or any data-changing action.

## Integrity readback

Confirm after the run:

- Meeting/Pitchbook row counts unchanged;
- source Docs/files unchanged;
- no Knowledge Export artifact created;
- AI state unchanged;
- no setup/private admin function executed;
- no trigger changed;
- only the confirmed synthetic DEV deployment was created if the run reached Phase 3.

## Reporting and Git

Create `docs/handoffs/0013-dev-test-auth-context-recovery-report.md` and update:

- `docs/handoffs/0013-report.md`;
- `docs/handoffs/0013-instruction.md`;
- Draft PR #11.

Run `git diff --check`. Verify no `.clasp.json`, OAuth material, account identifier, Script/deployment/resource ID, or private URL is tracked.

Keep PR #11 Draft / Open / unmerged. Do not merge.

## Completion classification

On full PASS:

`DEV WEB APP ENTRYPOINT RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for entrypoint recovery.

Matrix D/E remain NOT RUN for a later bounded run.

## Mandatory stop conditions

Stop immediately if:

- the single-account editor context cannot be confirmed;
- `/dev` fails or is not safely observable;
- a corresponding `/dev` failure reaches `doGet` and needs source diagnosis;
- Web app deployment type is unavailable;
- execute-as/access differs materially from the accepted DEV boundary;
- `/exec` fails;
- integrated same-document navigation fails;
- source/data changes appear necessary;
- continuing would require production access, broad public access, credential disclosure, or destructive cleanup.

## Completion response

Return only:

- Work ID;
- account-context result;
- `/dev` result;
- `doGet` execution observed / not observed / not safely observable;
- `/exec` result;
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

Never return raw IDs, account addresses, or full URLs.
