# Work 0013 report

WORK_ID: `0013`

## Latest final non-AI qualification result (2026-08-24)

Execution source ref: `da63af75f2c90be316494918974bcb8acb24b16c`.

### Matrix D — private administrator path

Result: `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`.

The actual private entrypoint files `src/99_EntryPoints.gs` and
`src/170_AiEntryPoints.gs` were used for the boundary review. The authenticated
Apps Script editor did not provide a safely observable private return-value
surface through the available browser control; no private function execution
was claimed as evidence. No public wrapper, debug endpoint, source change,
deployment change, or trigger mutation was used to bypass the limitation.

### Matrix E — Gemini-independent Knowledge Export

Preview result: `FAIL — STOPPED AT FIRST APPLICATION/CONFIGURATION DEFECT`.

Using the recovered versioned `/exec`, the `対象資料を確認` action was invoked
once. The UI displayed `Knowledge Exports フォルダが設定されていません。`
and no valid Preview result was returned. The qualification stopped at this
first Matrix E defect; no retry or alternate route was used.

- Google Docs export: `NOT RUN — Matrix E Preview failed`.
- PDF export: `NOT RUN — Matrix E Preview failed`.
- Clipboard: `NOT RUN — Matrix E Preview failed`.
- Final integrity readback: `NOT RUN — Matrix E Preview failed`.

Overall classification:

`NOT QUALIFIED — MATRIX E STOPPED AT FIRST APPLICATION/CONFIGURATION DEFECT`

`BLOCKER: YES`

Shared Drive-specific qualification remains `DEFERRED — authorized disposable
Shared Drive not exercised`. Gemini/File Search live qualification remains
`DEFERRED — approved billing-enabled DEV credential required`. Production
readiness is not claimed. Only documentation/report updates are in scope for
this run; application source and tests remain unchanged.

## Latest bounded recovery result

The authorized recovery operation was completed once at the exact requested
ref. One versioned synthetic DEV deployment was created as a `Web app` with
description `KSP Work 0013 DEV Web App restored`, execute-as deploying user,
and access `Only myself`. The generated endpoint was confirmed as `/exec`, not
`/library/`, and the normal main page rendered.

The first required integrated-navigation action, `ナレッジ検索`, could not be
safely executed: the browser control returned a selector deadline error with
no matching button before a click occurred. The run stopped immediately with
no retry or alternate navigation. The result is:

`VERSIONED_EXEC_MAIN_PAGE_PASS — INTEGRATED_NAVIGATION_NOT_SAFELY_OBSERVABLE`

`BLOCKER: YES`

No data-changing control was used, and no authoritative mutation was observed.
Post-failure row-count/artifact readback and Matrix D/E remain `NOT RUN`.
See the detailed report:

`docs/handoffs/0013-fast-versioned-web-app-recovery-report.md`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0013-consolidated-dev-live-qualification`

Draft PR: `#11`

## Current recovery decision

The application source, project identity, remote source, account context, and prior deterministic evidence are already proven. The remaining action is not another diagnosis or source repair.

The authorized next step is the shortest safe Web App recovery:

1. use the already confirmed synthetic DEV Apps Script project;
2. create exactly one new versioned deployment explicitly typed `Web app`;
3. execute as the deploying user;
4. restrict access to `Only myself`;
5. confirm the generated endpoint is `/exec` and not `/library/`;
6. open it once;
7. if the main page renders, verify `ナレッジ検索 -> 面談記録 -> ナレッジ検索` through same-document switching;
8. confirm no authoritative data mutation;
9. stop on the first failure with no second deployment or source repair.

Active handoff:

`docs/handoffs/0013-fast-versioned-web-app-recovery-instruction.md`

Use the exact ref supplied in the Codex execution request.

Durable deployment and recurrence-prevention rules:

`docs/operations/apps-script-web-app-deployment.md`

## Accepted evidence

- `PROJECT_IDENTITY_CONFIRMED`.
- installation-state / source-family / continuity / uniqueness: PASS.
- `REMOTE_SOURCE_CURRENT`; no push required.
- `SINGLE_ACCOUNT_EDITOR_CONTEXT_CONFIRMED`.
- the editor-only `/dev` request completed `doGet` but displayed the Google Drive file-open error.
- inline Knowledge Search focused tests: `36/36 PASS`.
- `npm run check` / `npm run test`: `160/160 PASS`.
- Apps Script source / HTML / manifest / public-surface validation: PASS.
- no authoritative mutation observed in prior recovery attempts.

The `/dev` error is retained as diagnostic evidence but is not a prerequisite for a normal versioned `/exec` deployment.

## Work 0013 incident lessons

The investigation expanded because application source was reconsidered before the full project/version/deployment/account identity chain was fixed. Additional process errors included:

- inconsistent separation of Library and Web App deployments;
- treating deterministic source tests as live runtime proof;
- treating missing `.clasp.json` as authoritative identity loss;
- treating `/dev` PASS as a universal prerequisite for `/exec`;
- authorizing too many diagnostic phases before attempting the small reversible recovery operation.

These lessons are now durable repository rules in:

- `docs/operations/apps-script-web-app-deployment.md`;
- `docs/handoffs/AGENTS.md`.

Future recovery handoffs must freeze source while deployment identity is uncertain, establish the identity chain, authorize no more than one deployment mutation, distinguish Web App from Library entrypoints, and stop on the first failure.

## Current scope and status

Application source, tests, manifest, navigation, setup logic, schema, limits, Knowledge Export, and AI/File Search are frozen.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, project discovery, remote source comparison, historical navigation experiments, `/dev`, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini File Search.

Current classification:

`VERSIONED DEV WEB APP RECOVERY READY`

`BLOCKER: YES` until the one authorized `/exec` recovery and integrated navigation check pass.

On PASS:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for Web App entrypoint recovery.

Matrix D/E remain NOT RUN for the next bounded run.
