# Work 0013 report

WORK_ID: `0013`

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

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, project discovery, remote source comparison, historical navigation experiments, `/dev`, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search.

Current classification:

`VERSIONED DEV WEB APP RECOVERY READY`

`BLOCKER: YES` until the one authorized `/exec` recovery and integrated navigation check pass.

On PASS:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for Web App entrypoint recovery.

Matrix D/E remain NOT RUN for the next bounded run.