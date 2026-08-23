# Work 0013 — Apps Script project identity reconstruction and DEV Web App recovery

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — authenticated external-state reconciliation and bounded DEV recovery`.

Recommended Codex model: `Sol High`.

Rationale: application source is deterministically green, but the local clasp mapping was intentionally ephemeral and is now absent. The prior recovery gate incorrectly treated the missing local mapping as the only possible proof of project identity. The residual work requires careful reconciliation of Apps Script project identity, Script Properties, deployed resources, and remote source before any mutation. A wrong-project push or deployment would be materially harmful.

Starting ref before this handoff: `203498b42743ca0d4e526069116a7c920eb7fda7`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

Recovery report: `docs/handoffs/0013-project-identity-reconstruction-and-web-app-recovery-report.md`.

## ChatGPT correction to the prior identity gate

The previous run classified `PROJECT_IDENTITY_NOT_PROVABLE` solely because `.clasp.json` was absent. That is safe but too strict.

`.clasp.json` is a local mapping, not the authoritative identity source. It may be reconstructed only after the correct Apps Script project is proven through independent authoritative evidence.

ChatGPT independently confirmed that the existing `Knowledge Platform Backend` remains a DEV resource set and its `Settings` sheet retains a coherent resource fingerprint, including:

- `ENVIRONMENT = DEV`;
- matching Backend and separate Audit references;
- configured knowledge/source folder references;
- `AI_SYNC_ENABLED = FALSE`;
- live operational ID counters;
- a retained last successful setup timestamp.

Do not record any raw resource ID, Script ID, deployment ID, URL, account identifier, cookie, token, or credential in GitHub, report, or chat.

## Accepted evidence — do not rerun

- Matrix A: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: `1 / 5 / 10 / 15 / 20 / 25 MiB` live PASS.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Pitchbook Date and status-parser repairs: PASS.
- Inline Knowledge Search implementation: focused `36/36 PASS`.
- `npm run check`: `160/160 PASS`.
- `npm run test`: `160/160 PASS`.
- Apps Script source / HTML / manifest validation: PASS.
- Public surface: `23 public / 360 private top-level functions`.
- Current repository source contains `doGet`, `Index.html`, `KnowledgeSearchPage.html`, `page-knowledge`, and the `ClientCore` knowledge page mapping.
- No mutation was observed in the prior failed recovery attempt.

Do not rerun source implementation, Matrix A/B/C, upload sizing, parser diagnosis, historical navigation experiments, Matrix D/E, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search in this recovery run.

## Outcome

Reconstruct the exact synthetic DEV Apps Script project identity without relying on a pre-existing `.clasp.json`, restore a valid local mapping only after identity is proven, and recover one usable DEV Web App entrypoint.

Required end state:

1. exactly one Apps Script project is proven to own the existing DEV resource set;
2. a local untracked `.clasp.json` is reconstructed for that project;
3. remote source is compared safely against the tested repository source;
4. the tested source is pushed only if the confirmed project is behind;
5. an editor-only Web App test deployment `/dev` renders the normal application;
6. one persistent DEV Web App `/exec` entrypoint exists and renders;
7. same-document navigation `ナレッジ検索 -> 面談記録 -> ナレッジ検索` passes;
8. authoritative DEV data remains unchanged.

## Applicable repository instructions and subagents

Before starting, read all applicable `AGENTS.md` and `AGENTS.override.md` files and follow the repository-specific policy.

Subagent use is mandatory and proportionate. Use at least:

- one independent read-only reviewer for candidate-project identity evidence and wrong-project risk;
- one independent read-only reviewer for remote-source comparison and deployment safety;
- one independent read-only reviewer for final Git/report/secret-redaction consistency.

The parent agent owns candidate selection, mutation authorization, and final synthesis.

## Hard source freeze

Do not change application `.gs` / `.html` source, tests, manifest, public facade, setup logic, schema, limits, Knowledge Export logic, AI/File Search logic, or navigation implementation.

Do not revert inline Knowledge Search integration.

Do not create a new Apps Script project.

Do not delete, archive, or modify any Library deployment.

Do not operate any production project or production resource.

## Phase 1 — Candidate discovery without mutation

Use the authenticated Apps Script account and user-assisted UI as needed.

Candidate discovery sources, in preferred order:

1. Apps Script home dashboard recent projects;
2. browser history for Apps Script editor pages used during Work 0010–0013;
3. currently open/recent Web App or editor tabs;
4. Drive/Apps Script project listings available through the authenticated environment.

Do not inspect unrelated project source bodies beyond what is necessary to identify KSP candidates.

For every plausible KSP candidate, record only a private temporary comparison worksheet containing non-exported fingerprints. Do not put raw values in GitHub or chat.

## Phase 2 — Authoritative project identity proof

A candidate may be classified `PROJECT_IDENTITY_CONFIRMED` only when all mandatory checks pass:

### A. DEV installation-state fingerprint

In Project Settings / Script Properties, the candidate contains `KSP_INSTALLATION_STATE_JSON` and it parses successfully.

Its stored resource references must exactly match, privately, the currently accessible DEV resources identified through the existing `Knowledge Platform Backend` and `Knowledge Platform Audit` files and the Backend `Settings` rows.

The environment must be DEV.

### B. Source-family fingerprint

The candidate source must be recognizably the KSP application and include the expected source family, including the Web App entrypoint, setup/private entrypoints, Meeting/Pitchbook flows, and Knowledge Search files/functions appropriate to its deployed version.

This check proves product family, not currentness; currentness is handled later.

### C. Operational continuity fingerprint

At least one additional continuity signal must agree:

- execution history consistent with Work 0010–0013 dates/actions;
- deployment descriptions/versions consistent with prior KSP DEV activity;
- Script Property setup/report timestamps consistent with the Backend setup history;
- ownership/account and project-title context consistent with the synthetic DEV environment.

### D. Uniqueness

Exactly one candidate may satisfy A+B+C.

Classify:

- `PROJECT_IDENTITY_CONFIRMED` — exactly one full match;
- `PROJECT_IDENTITY_AMBIGUOUS` — more than one full match;
- `PROJECT_IDENTITY_NOT_FOUND` — no full match;
- `PROJECT_IDENTITY_NOT_SAFELY_OBSERVABLE` — required evidence cannot be inspected safely.

If identity is not confirmed, stop without creating `.clasp.json`, pushing, pulling, or deploying.

The absence of a pre-existing `.clasp.json` is no longer a standalone stop condition.

## Phase 3 — Reconstruct local clasp mapping

Only after `PROJECT_IDENTITY_CONFIRMED`:

1. read the confirmed project's Script ID privately from Project Settings;
2. create a local `.clasp.json` with the confirmed Script ID and `rootDir` set to `src`;
3. confirm `.clasp.json` is ignored by Git and remains untracked;
4. confirm clasp authentication belongs to the expected DEV account;
5. run read-only mapping/status commands.

Never commit `.clasp.json`, `.clasprc.json`, OAuth material, or IDs.

The repository `.gitignore` already excludes clasp mappings after ChatGPT's bounded hardening commit.

## Phase 4 — Safe remote source reconciliation

Never run `clasp pull` into the repository worktree.

Clone or pull the confirmed remote project into a disposable temporary directory and compare:

- manifest;
- source file inventory;
- selected high-signal source hashes/content;
- presence/absence of current inline Knowledge Search integration.

Classify:

- `REMOTE_SOURCE_CURRENT`;
- `REMOTE_SOURCE_BEHIND_TESTED_REF`;
- `REMOTE_SOURCE_DIVERGED`.

If diverged with remote-only application changes that are not safely understood, stop and return evidence to ChatGPT. Do not overwrite.

If behind, push only the exact tested `src` tree from the current repository ref to the identity-confirmed DEV project. Do not use force options beyond normal clasp behavior. Verify the remote inventory after push.

## Phase 5 — DEV Web App recovery

Only after identity confirmation and source reconciliation:

### Test deployment gate

1. In Apps Script, open `Deploy > Test deployments`.
2. Select `Web app` explicitly.
3. Use/open the editor-only `/dev` entrypoint.
4. Ask the user only to confirm whether the normal main application renders.

Classify:

- `DEV_TEST_WEB_APP_PASS`;
- `DEV_TEST_WEB_APP_FAIL`;
- `DEV_TEST_WEB_APP_UNAVAILABLE`.

If `/dev` does not pass, do not create `/exec`; stop.

### Persistent DEV deployment

Only after `/dev` PASS:

1. create a new deployment of type `Web app` in the same confirmed project;
2. description: `KSP Work 0013 DEV Web App restored`;
3. execute as deploying user;
4. use the narrowest usable synthetic DEV access, defaulting to `Only myself` unless a broader DEV audience was already explicitly approved;
5. open the generated `/exec` locally without recording it.

Do not use `clasp deploy` or `clasp redeploy` for this recovery. Use the Apps Script deployment UI so deployment type, execute-as, and access are explicit.

## Phase 6 — Bounded live acceptance

On the recovered `/exec` page:

1. confirm the main Meeting page renders;
2. click `ナレッジ検索` once and confirm `ナレッジ検索` plus `対象資料の書き出し` are visible;
3. click `面談記録` once and confirm the Meeting page returns;
4. click `ナレッジ検索` once and confirm the integrated page returns;
5. confirm no browser URL edit/navigation was required for these page switches.

Do not execute preview, export, PDF, clipboard, Matrix D, or any data mutation in this run.

## Authoritative integrity readback

Confirm after recovery:

- Meeting and Pitchbook row counts are unchanged;
- source Docs/files are unchanged;
- no Knowledge Export artifact was created;
- no AI state changed;
- no setup/private admin function was run;
- no trigger changed;
- only the confirmed DEV project/deployment was touched.

## Git / reporting

Create/update:

- `docs/handoffs/0013-project-identity-reconstruction-and-web-app-recovery-report.md`;
- `docs/handoffs/0013-report.md`;
- `docs/handoffs/0013-instruction.md`;
- Draft PR #11 body.

Run `git diff --check` and verify no clasp/OAuth/ID/URL material is tracked.

Keep PR #11 Draft / Open / unmerged.

Do not merge.

## Completion classification

PASS only when:

- `PROJECT_IDENTITY_CONFIRMED`;
- remote source is current or safely synchronized to the tested ref;
- `/dev` PASS;
- `/exec` PASS;
- integrated navigation roundtrip PASS;
- authoritative integrity PASS;
- no private deployment material is committed.

On PASS:

`DEV WEB APP ENTRYPOINT RESTORED — MATRIX D/E READY`

`BLOCKER: NO` for entrypoint recovery. Matrix D/E remain NOT RUN for a later bounded run.

## Mandatory stop conditions

Stop immediately if:

- identity is ambiguous/not found/not safely observable;
- the candidate installation-state resource fingerprint does not match exactly;
- remote source diverged materially;
- `/dev` fails;
- explicit Web App deployment type is unavailable;
- execute-as/access differs materially from the accepted DEV boundary;
- `/exec` fails;
- integrated same-document navigation fails;
- source changes appear necessary;
- continuing would require production access, public internet access, credential disclosure, or destructive cleanup.

Do not transition to a second recovery hypothesis in the same run.

## Completion response

Return only:

- Work ID;
- project identity classification;
- matching evidence categories (`installation-state`, `source-family`, `continuity`, `uniqueness`) without values;
- remote source classification;
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

Never return raw IDs or full URLs.
