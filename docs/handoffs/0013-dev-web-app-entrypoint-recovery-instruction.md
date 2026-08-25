# Work 0013 — DEV Web App entrypoint recovery

Work ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — authenticated Apps Script DEV project identity verification and Web App entrypoint recovery only`

Recommended model: `Sol High`

## Rationale

The application source is deterministically green, but historical evidence about the Apps Script
project and deployment identity is contradictory. This run has external-state risk: operating on
the wrong Apps Script project or wrong deployment could cause further damage. No product
architecture or source redesign is authorized. 

## Starting ref and delivery

Starting ref: `0ea50a0601d7b1001871b5467bff02b3a69a6fa0`

Branch: `agent/0013-consolidated-dev-live-qualification`

Draft PR: `#11`

Before any Apps Script or external runtime operation:

1. Read all applicable `AGENTS.md` and `AGENTS.override.md` files.
2. Identify and follow the repository-specific subagent-use policy.
3. Use subagents actively and proportionately.
4. Use at minimum:
   - one independent read-only reviewer for Apps Script project/deployment identity and recovery safety;
   - one independent read-only reviewer for final evidence, Git diff, report, and secret/URL redaction.
5. Do not expose Script IDs, deployment IDs, full Web App URLs, OAuth files, account identifiers,
   cookies, tokens, credentials, or private resource IDs.

Because ChatGPT's GitHub write action was unavailable, first save this complete execution contract
as this file. Commit and push that handoff before performing any external Apps Script change.
Continue only from the resulting exact commit. Do not alter the scope through chat alone.

## Outcome

Restore a usable synthetic DEV Web App entrypoint in the correct existing Apps Script project
without changing application source or authoritative DEV data.

Required result:

- correct Apps Script project identity proven;
- editor-only Web App test deployment `/dev` renders the current application;
- one persistent DEV Web App `/exec` entrypoint is created or restored;
- the normal main application renders;
- same-document navigation:
  `ナレッジ検索 -> 面談記録 -> ナレッジ検索`
  works without browser URL navigation;
- no source, Script Property, Backend, Audit, Meeting, Pitchbook, Drive source, or AI state
  mutation occurs from deployment recovery.

## Accepted evidence — do not rerun

- inline Knowledge Search implementation deterministic focused tests: `36/36 PASS`;
- `npm run check`: `160/160 PASS`;
- `npm run test`: `160/160 PASS`;
- Apps Script source / HTML / manifest validation: PASS;
- public surface: `23 public / 360 private top-level functions`;
- current source contains `doGet()`, `Index.html`, `KnowledgeSearchPage.html`, and
  `showPage('knowledge')` integration;
- Matrix A/B/C evidence remains accepted.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, historical navigation mechanisms,
direct-route diagnosis, Matrix D, Matrix E, Docs, PDF, clipboard, Shared Drive, or Gemini/File
Search in this recovery run.

## Hard source freeze

Do not change:

- application `.gs` or `.html` source;
- tests;
- manifest;
- public facade;
- data schema;
- limits;
- Knowledge Export logic;
- AI/File Search logic;
- setup logic;
- navigation implementation.

Do not revert the inline integration.

Do not use another URL-navigation mechanism.

## Project identity preflight

Privately compare:

1. the local `.clasp.json` Script ID;
2. the Apps Script editor Project Settings Script ID;
3. the project title and expected synthetic DEV identity;
4. existing DEV Script Properties / installation state;
5. expected current source inventory, including:
   - `doGet`;
   - `Index`;
   - `KnowledgeSearchPage`;
   - `ClientCore` knowledge page mapping.

Do not record raw values.

Classify only:

- `PROJECT_IDENTITY_CONFIRMED`
- `PROJECT_IDENTITY_MISMATCH`
- `PROJECT_IDENTITY_NOT_PROVABLE`

If mismatch or not provable:

- do not push;
- do not pull over the worktree;
- do not deploy;
- do not create a new Apps Script project;
- stop and return evidence to ChatGPT.

Do not treat the presence of Library deployments as proof that this is the correct DEV Web App
project.

## Remote source safety

Do not run `clasp pull` into the repository worktree.

If remote source comparison is necessary, use a disposable temporary directory after project
identity is proven. Do not commit the temporary mapping or source.

Do not run `clasp push` unless a read-only comparison proves the verified DEV project is behind
the exact tested source at the current ref.

If a push is genuinely required:

- push only the exact tested source from the current ref;
- push only to the identity-confirmed synthetic DEV project;
- do not use production resources;
- remove temporary clasp configuration after use.

Do not use `clasp deploy` or `clasp redeploy` to recover the Web App entrypoint.

Do not update or delete Library deployments.

## Test deployment gate

In the verified Apps Script project:

1. Open Deploy > Test deployments.
2. Select deployment type Web app.
3. Open the editor-only `/dev` URL.
4. Ask the user only to confirm whether the normal application page renders.
5. Do not ask the user to paste the URL.

Classify:

- `DEV_TEST_WEB_APP_PASS`
- `DEV_TEST_WEB_APP_FAIL`
- `DEV_TEST_WEB_APP_UNAVAILABLE`

If `/dev` does not render:

- do not create an `/exec` deployment;
- stop;
- record the smallest non-secret evidence;
- return to ChatGPT.

## Persistent DEV Web App recovery

Only after `/dev` PASS:

1. Open Deploy > New deployment.
2. Select type Web app explicitly.
3. Use description: `KSP Work 0013 DEV Web App restored`.
4. Execute as the deploying user.
5. Use the most restrictive usable DEV access:
   Only myself by default for personal synthetic DEV,
   unless a broader DEV audience has already been explicitly approved.
6. Create the deployment.
7. Open the generated `/exec` URL.
8. Do not record the URL or deployment ID in GitHub or chat.

Do not create a new Apps Script project.

Do not delete or archive existing Library deployments in this run.

## Live acceptance check

After the new `/exec` page renders:

1. Confirm the normal main page is visible.
2. Ask the user to click `ナレッジ検索` once.
3. Confirm `ナレッジ検索` and `対象資料の書き出し` are visible.
4. Ask the user to click `面談記録` once.
5. Confirm the Meeting page is visible.
6. Ask the user to click `ナレッジ検索` once more.
7. Confirm the Knowledge Search/Export page returns.
8. Confirm the browser URL did not need to change for these page switches.

Do not perform Preview, Docs, PDF, clipboard, or any data-changing action.

## Authoritative integrity readback

Confirm:

- no Meeting or Pitchbook row count changed;
- no source file or Google Doc changed;
- no new Knowledge Export artifact was created;
- no AI state changed;
- no setup function was run;
- no trigger was created or changed;
- no production resource was touched.

## Repository hardening allowed in this run

After runtime recovery, documentation-only and ignore-file changes are allowed:

1. Update `.gitignore` to exclude:
   - `.clasp.json`
   - `.clasp.*.json`
   - `.clasprc.json`
   - `.clasp/`
2. Add `docs/operations/apps-script-web-app-deployment.md`.
3. Create `docs/handoffs/0013-dev-web-app-entrypoint-recovery-report.md`.
4. Update:
   - `docs/handoffs/0013-report.md`;
   - `docs/handoffs/0013-inline-knowledge-page-integration-report.md`;
   - `docs/handoffs/0013-instruction.md`;
   - Draft PR `#11`.

Never commit any actual clasp mapping, credentials, IDs, URLs, cookies, tokens, or private
runtime output.

## Validation

Because application source is frozen and prior `160/160` evidence is accepted:

- do not rerun the full suite solely for deployment recovery;
- run `git diff --check` for documentation and `.gitignore` changes;
- inspect `git status` for accidental local configuration;
- verify no `.clasp.json`, `.clasprc.json`, private URL, Script ID, deployment ID, or credential is
  tracked.

## Completion classification

PASS only when:

- `PROJECT_IDENTITY_CONFIRMED`;
- `/dev` Web App PASS;
- new/restored `/exec` Web App PASS;
- integrated navigation roundtrip PASS;
- authoritative data integrity PASS;
- no secret/private deployment material is committed.

On PASS:

- classification: `DEV WEB APP ENTRYPOINT RESTORED — MATRIX D/E READY`;
- BLOCKER: `NO` for entrypoint recovery;
- Matrix D/E remain NOT RUN and must be handled in a later bounded run.

## Mandatory stop conditions

Stop immediately when:

- project identity mismatches or cannot be proven;
- `/dev` does not render;
- Web app deployment type cannot be selected;
- access or execute-as settings are materially different from the accepted DEV boundary;
- `/exec` does not render;
- integrated page switching fails;
- source changes appear necessary;
- continuing would require production access, public internet access, credential disclosure, or
  destructive deployment cleanup.

Do not diagnose a second hypothesis within this run.

## Git / PR requirements

- remain on `agent/0013-consolidated-dev-live-qualification`;
- no force push or history rewrite;
- keep PR `#11` Draft / Open / unmerged;
- commit and push the instruction, runbook, `.gitignore` hardening, report, and report updates;
- do not merge.

## Completion response

Return only:

- Work ID;
- project identity classification;
- `/dev` result;
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

Never return full URLs or IDs.
