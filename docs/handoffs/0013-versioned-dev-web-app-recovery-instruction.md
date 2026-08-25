# Work 0013 — Versioned DEV Web App recovery and live navigation qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded authenticated deployment recovery and live verification`.

Recommended Codex model: `Luna Max`.

Rationale: Apps Script project identity, remote-source currentness, single-account editor context, and successful `doGet` execution are already proven. The remaining ambiguity is whether the editor-only `/dev` HEAD/test endpoint itself is defective while a normal versioned Web App deployment remains usable. This is bounded deployment/recovery work, not open-ended architecture or source debugging.

Starting ref: `4a01ce0eb1dca5fe1a7a95ce6213a1eca8c14725`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

## Outcome

Restore one usable versioned synthetic DEV Web App `/exec` entrypoint in the already identity-confirmed Apps Script project and verify the current same-document Knowledge Search navigation without changing application source or authoritative DEV data.

## Accepted evidence — do not reopen

- `PROJECT_IDENTITY_CONFIRMED`.
- installation-state / source-family / continuity / uniqueness: PASS.
- `REMOTE_SOURCE_CURRENT`; no source push required.
- `SINGLE_ACCOUNT_EDITOR_CONTEXT_CONFIRMED`.
- `/dev` request reached Apps Script and produced a completed `doGet` execution, but browser showed the Google Drive file-open error.
- Inline Knowledge Search focused tests: `36/36 PASS`.
- `npm run check` / `npm run test`: `160/160 PASS`.
- Apps Script source / HTML / manifest / public-surface validation: PASS.
- Prior recovery attempts: `NO MUTATION OBSERVED`.

The `/dev` failure is no longer a hard prerequisite for `/exec` creation. `/dev` is an editor-only HEAD/test surface; this run explicitly tests whether a normal versioned Web App deployment is usable independently.

## Additional source evidence already reviewed by ChatGPT

- `doGet()` returns evaluated `Index` for the normal route.
- `Index.html` contains static same-document `nav-knowledge` and `KnowledgeSearchPage` markup.
- `ClientCore.html` switches `knowledge` through the existing `showPage()` map.
- initial `ClientBootstrap.html` performs only `google.script.run` bootstrap calls and does not perform top-level browser navigation.
- `ClientKnowledgeSearch.html` contains a guarded standalone-only back handler; the integrated `KnowledgeSearchPage.html` does not contain `knowledge-back`, so that handler is not executed in the normal integrated main page.

Do not reinterpret the observed `/dev` Drive page as proof of a source/navigation defect without new evidence.

## Applicable instructions and mandatory subagents

Before starting, read every applicable `AGENTS.md` / `AGENTS.override.md`, identify the repository-specific subagent policy, and follow it.

Use subagents actively and proportionately. At minimum use independent perspectives for:

- versioned Web App deployment safety and account/deployment-state review;
- read-only Apps Script execution-history interpretation;
- final Git/report/secret-redaction consistency.

## Hard source freeze

Do not change application `.gs` / `.html` source, tests, manifest, public facade, setup logic, schema, limits, Knowledge Export logic, AI/File Search logic, or navigation implementation.

Do not pull source into the repository worktree and do not push source. Remote source is already proven current.

Do not create another Apps Script project.

Do not modify, archive, or delete existing Library deployments.

Do not run Matrix D/E, Preview, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

## Phase 1 — Read-only `/dev` execution-history classification

Do not rerun `/dev` merely for this phase.

Using the already-observed failed `/dev` attempt, inspect the Apps Script Executions view around that attempt and record only non-secret function categories/statuses.

Check whether the initial browser bootstrap calls occurred after completed `doGet`, especially:

- `getMeetingBootstrapData`;
- `getPitchbookBootstrapData`;
- `getPhase1MaintenanceBootstrapData`;
- `getKnowledgeSearchBootstrapData`.

Classify one:

- `DEV_HEAD_FAIL_BEFORE_CLIENT_BOOTSTRAP` — `doGet` completed but no normal initial client bootstrap execution was observed;
- `DEV_HEAD_FAIL_AFTER_CLIENT_BOOTSTRAP` — one or more normal initial client bootstrap executions were observed;
- `DEV_HEAD_BOOTSTRAP_NOT_SAFELY_OBSERVABLE`.

This classification is evidence only and does not block the versioned `/exec` test unless it reveals an actual application exception.

If a failed execution with a concrete application exception is observed, stop and return the safe error class to ChatGPT without source changes.

## Phase 2 — Create one explicit versioned DEV Web App deployment

Use only the already identity-confirmed synthetic DEV Apps Script project and the same confirmed single-account editor context.

Through the Apps Script deployment UI:

- `Deploy > New deployment`;
- deployment type: `Web app`;
- description: `KSP Work 0013 DEV Web App restored`;
- execute as: deploying user;
- access: `Only myself`;
- deploy the current saved source as a normal versioned deployment.

Do not record or paste the Script ID, deployment ID, or full `/exec` URL into GitHub/chat.

Creation of this one DEV Web App deployment is authorized even though `/dev` failed, because project identity and source currentness are already independently proven.

## Phase 3 — `/exec` live gate

Open the generated `/exec` URL once in the same single-account browser context.

Classify:

- `VERSIONED_EXEC_MAIN_PASS` — normal main application visibly renders;
- `VERSIONED_EXEC_DRIVE_ERROR` — Google Drive file-open error is shown;
- `VERSIONED_EXEC_APPLICATION_ERROR` — an application/runtime error is visibly shown;
- `VERSIONED_EXEC_NOT_SAFELY_OBSERVABLE`.

Also inspect whether a corresponding `doGet` execution occurred and whether initial bootstrap executions were observed. Record function categories/status only; never raw URLs/IDs/accounts/log bodies.

If `/exec` does not PASS, stop immediately. Do not create a second Web App deployment and do not change source.

## Phase 4 — Integrated navigation confirmation

Only after `VERSIONED_EXEC_MAIN_PASS`:

1. confirm the Meeting page is visible;
2. click `ナレッジ検索` once;
3. confirm `ナレッジ検索` and `対象資料の書き出し` are visible;
4. click `面談記録` once and confirm Meeting returns;
5. click `ナレッジ検索` once and confirm the integrated page returns;
6. confirm the browser URL did not need to change for these page switches.

PASS requires same-document switching with no white page, Drive error, or application error.

If integrated navigation fails, stop without another navigation mechanism or source change.

## Authoritative integrity readback

After the deployment/navigation probe, confirm:

- Meeting and Pitchbook row counts unchanged;
- no source Docs/files changed;
- no Knowledge Export artifact created;
- no AI state changed;
- no setup/private admin function executed;
- no trigger changed;
- only the one new synthetic DEV Web App deployment was created.

## Reporting / Git

Create/update:

- `docs/handoffs/0013-versioned-dev-web-app-recovery-report.md`;
- `docs/handoffs/0013-report.md`;
- `docs/handoffs/0013-instruction.md`;
- Draft PR #11 body.

Run `git diff --check` and verify no `.clasp.json`, OAuth material, Script ID, deployment ID, private URL, account identifier, cookie, token, or credential is tracked.

Keep PR #11 Draft / Open / unmerged. Do not merge.

## Completion classification

If `/exec` main render, integrated navigation roundtrip, and integrity all PASS:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for Web App entrypoint recovery.

The `/dev` defect remains a non-blocking development-environment issue unless later evidence shows it affects normal `/exec` operation.

If `/exec` fails, keep `BLOCKER: YES` and return the bounded evidence to ChatGPT.

## Mandatory stop conditions

Stop if:

- read-only execution history shows a concrete application exception;
- explicit Web App deployment type cannot be selected;
- execute-as/access differs materially from the accepted DEV boundary;
- `/exec` fails;
- integrated same-document navigation fails;
- source changes appear necessary;
- continuing would require production access, public access, credential disclosure, or destructive cleanup.

Do not pursue a second runtime/source hypothesis in this run.

## Completion response

Return only:

- Work ID;
- `/dev` bootstrap classification;
- versioned `/exec` result;
- `doGet` / bootstrap execution observation;
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
