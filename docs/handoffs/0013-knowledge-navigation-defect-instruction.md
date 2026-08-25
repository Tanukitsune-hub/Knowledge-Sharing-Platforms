# Work 0013 — Knowledge Search navigation defect repair verification and non-AI completion

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `B — ChatGPT bounded edit + Codex verification / in-scope repair if needed / authenticated DEV completion`.

Recommended Codex model: `Luna Max`.

Rationale: ChatGPT has already isolated the observed white-screen defect to the HTML Service navigation path and made the minimal repair plus a deterministic regression test. Residual work is execution-focused: verify the bounded patch, deploy it to the existing synthetic DEV Web App, confirm the navigation live, then finish the already-specified private-admin and Gemini-independent Knowledge Export checks. No architecture or open-ended root-cause work is required.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

ChatGPT patch commits already on the branch:

- navigation repair: `af847bb11ad419c95a86b63af7406f1abf4bf772`;
- regression test: `966e5d985840c1d9ba380bd4080b68ce1ae8e2ca`.

Primary report: `docs/handoffs/0013-report.md`.

Dedicated final non-AI report: `docs/handoffs/0013-non-ai-final-live-qualification-report.md`.

## Accepted completed evidence — do not reopen

- Pitchbook Date normalization repair: PASS.
- Pitchbook status-parser repair: PASS.
- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: 1 / 5 / 10 / 15 / 20 / 25 MiB all live PASS.
- Largest stable supported upload: 25 MiB / 26,214,400 bytes.
- Prior parser-repair suite: 158/158 PASS.
- Work 0012 public-surface hardening: deterministic PASS.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, or unrelated browser qualification.

## Observed defect and accepted hypothesis

Observed live evidence at pre-fix ref `03b1a4b2e97b16212b5e8f495f3c595d55d05b27`:

- normal DEV registration/maintenance page loaded;
- one click on `ナレッジ検索` immediately produced an entirely white page;
- no Knowledge Search / Export controls rendered;
- no safe application error was shown;
- no retry or alternate navigation was attempted.

Accepted single hypothesis:

`src/90_WebApp.gs` injected a navigation button using `window.location.search='?page=knowledge'`. Apps Script HTML Service is iframe-sandboxed; top-level navigation must leave the sandbox through an explicit `_top`/equivalent user navigation path. The code therefore changed the iframe URL rather than reliably re-entering the published Web App `doGet()` route, causing the observed blank page.

The same legacy pattern existed on the Knowledge Search `登録・管理へ戻る` action.

Do not explore a competing root-cause hypothesis unless the bounded patch passes deterministic checks but the exact live navigation still fails.

## ChatGPT-completed repair

### `src/90_WebApp.gs`

ChatGPT changed only route navigation behavior:

- obtains the published Web App URL through `ScriptApp.getService().getUrl()`;
- main-page `ナレッジ検索` now submits a normal GET form to that published URL with `page=knowledge` and `target="_top"`;
- Knowledge Search `登録・管理へ戻る` is rendered as a normal GET form to the published Web App URL with `target="_top"`;
- the evaluated Knowledge Search HTML strips the old client-side `window.location.search=''` back-handler so it cannot override the top-level form navigation;
- no public facade, data contract, export logic, AI logic, limit, storage, or architecture changed.

### `tests/webapp-navigation.test.cjs`

Added a focused static regression that requires:

- use of `ScriptApp.getService().getUrl()`;
- explicit `_top` navigation;
- explicit `page=knowledge` GET routing;
- absence of the old forward `onclick="window.location.search..."` navigation;
- explicit removal of the legacy back-handler from evaluated HTML.

ChatGPT scratch validation confirmed the focused regression fails against the pre-fix route and passes against the patched route. Codex must independently run repository validation; do not rely solely on that scratch evidence.

## Applicable AGENTS.md and mandatory subagents

Before starting:

1. read every applicable `AGENTS.md` / `AGENTS.override.md` file;
2. identify the repository-specific subagent-use policy;
3. follow it;
4. use subagents actively and proportionately.

Subagent use is mandatory. At minimum use independent perspectives for:

- navigation patch / HTML Service regression review;
- private-admin entrypoint verification;
- Knowledge Export Drive/Docs/PDF/Audit evidence cross-check;
- final diff/report consistency review.

Do not use subagents to explore competing root causes unless the stop/escalation rule is reached.

# Phase 1 — Deterministic patch verification

## Allowed edit boundary

Start with no further source changes.

If the ChatGPT patch itself fails deterministic validation for an issue directly caused by the bounded navigation change, Codex may repair only:

- `src/90_WebApp.gs`;
- `tests/webapp-navigation.test.cjs`.

Do not change `ClientKnowledgeSearch.html`, Knowledge Export service code, public surface, architecture, limits, or unrelated tests unless ChatGPT issues a new handoff.

## Checks

Run:

1. focused navigation regression;
2. `npm run check`;
3. `npm run test`;
4. `git diff --check`.

Record exact observed totals. The new navigation regression must be included in the suite.

If a failure is unrelated to the navigation patch, classify it separately and do not broaden scope.

If the bounded patch cannot pass focused/full deterministic checks within the allowed edit boundary, stop and return to ChatGPT.

# Phase 2 — DEV deployment and exact navigation confirmation

Use only the same authenticated synthetic DEV Apps Script project and existing DEV Web App deployment used for Work 0013 Matrix A/C.

Allowed:

- push the verified current branch source to the existing synthetic DEV project;
- create/update the existing DEV Web App deployment to the patched version using the already-established deployment procedure;
- temporary local clasp configuration may be used only if required and must not be committed; remove it after use.

Not allowed:

- production deployment/data;
- new public wrapper/debug endpoint;
- new API executable solely for qualification;
- credentials or private URLs in GitHub/report/chat.

Live confirmation:

1. load the normal DEV registration/maintenance page;
2. ask the user to click `ナレッジ検索` exactly once;
3. PASS only if the Knowledge Search page visibly renders its normal controls, including the Knowledge Export section, rather than a white page;
4. if practical later in the same run, confirm `登録・管理へ戻る` also returns to the main page through normal user navigation.

If the page is still white or a new application error appears after deterministic PASS, stop immediately. Do not explore another hypothesis in this run.

# Phase 3 — Matrix D corrected private administrator check

The prior Matrix D selection used helper files that do not contain the private administrator entrypoints. Do not repeat that path.

The actual entrypoint locations are:

- `src/99_EntryPoints.gs`:
  - `getInstallationStatus_()`;
  - `validateInstallation_()`;
  - `setupKnowledgePlatform_()`;
- `src/170_AiEntryPoints.gs`:
  - `runAiSyncWorker_()`.

If Apps Script editor execution is needed, direct the user to these exact files/functions rather than `00_Core.gs` or `10_Setup.gs`.

Attempt once, in the already-approved order:

1. `getInstallationStatus_()`;
2. `validateInstallation_()`;
3. `setupKnowledgePlatform_()`;
4. post-setup status and validation reread;
5. `runAiSyncWorker_()` only while `AI_SYNC_ENABLED=false`.

Expected behavior remains the prior Matrix D contract:

- installed/validation healthy;
- setup reuses resources without duplication;
- source identities/counters remain stable;
- disabled AI sync is a no-op and does not require Gemini credentials.

If the editor still exposes no safely executable private function at the exact entrypoint files, classify Matrix D `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`; this alone is non-blocking. Do not add a public wrapper or deployment workaround.

Any actual execution defect is a blocker and stops Matrix D.

# Phase 4 — Resume Matrix E from the repaired navigation

Only after live navigation PASS, continue the original Gemini-independent Knowledge Export qualification without rerunning prior matrices.

Use the existing synthetic DEV source set.

## E1 Preview

- preview a compact mixed Active Meeting/Pitchbook set;
- verify counts, chronological order, exact Meeting character count, no artifact creation, metadata-only Audit;
- Gemini must remain unconfigured and unnecessary.

## E2 Google Docs export

Create one normal Google Docs export and verify:

- exactly one retained Doc in `Knowledge Exports`;
- complete Meeting text, correct order, functional source hyperlinks;
- Pitchbook metadata/link-only representation;
- artifact URL resolves;
- no source Index row or AI-state mutation;
- metadata-only Audit.

## E3 PDF export

Create one PDF export from a valid preview and verify:

- one non-empty PDF in `Knowledge Exports`;
- artifact URL resolves;
- expected content/order;
- temporary Doc cleanup when applicable;
- no source Index/AI-state mutation;
- metadata-only Audit.

## E4 Clipboard

Ask the user to press `AI用プロンプトをコピー` once and confirm only whether a paste into an empty local temporary area succeeds. Do not request prompt contents.

PASS requires successful copy or documented fallback plus metadata-only success Audit after confirmed copy. If browser permission blocks both native and fallback while Docs/PDF otherwise pass, clipboard alone may remain DEFERRED as an environment limitation.

## E5 Integrity readback

Confirm no unexpected source-row/file mutation, no export AI indexing, no duplicate artifacts from a single action, and only expected metadata Audit events.

Stop Matrix E at the first actual application/data-integrity defect and return the smallest safe evidence to ChatGPT. Do not diagnose a second hypothesis.

# Residual external categories

Do not execute:

- Shared Drive-specific qualification;
- billing-enabled Gemini / File Search qualification.

Retain both as explicit external residual gaps unless separately proven.

# Completion / reporting

Update:

- `docs/handoffs/0013-report.md`;
- `docs/handoffs/0013-non-ai-final-live-qualification-report.md`;
- Draft PR #11.

Write the final current-state summary so repaired historical failures are clearly superseded rather than left as ambiguous current FAILs.

If navigation and Matrix E pass, and Matrix D is either PASS or only the allowed private-execution DEFERRED state, classify:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

with `BLOCKER: NO`.

Shared Drive and Gemini/File Search remain explicit residual external gaps and do not block this Work 0013 DEV qualification classification.

Commit/push all in-scope changes and reports. Do not merge PR #11; ChatGPT performs final review.

# Stop / escalation conditions

Stop and return to ChatGPT when:

- the ChatGPT navigation patch fails deterministic validation outside the allowed bounded repair;
- patched live `ナレッジ検索` still produces a white page or other application error;
- an actual private-admin execution defect appears;
- Knowledge Export preview/Docs/PDF/integrity shows an application or data-integrity defect;
- source content appears in Audit;
- continuing requires public-surface expansion, a second root-cause hypothesis, architecture work, production access, Shared Drive creation, or Gemini credentials.

# Completion response

Return only:

- Work ID;
- navigation patch deterministic result;
- live Knowledge Search navigation result;
- Matrix D result;
- Matrix E result;
- Docs export result;
- PDF export result;
- clipboard result;
- Shared Drive residual status;
- Gemini/File Search residual status;
- overall Work 0013 classification;
- report path;
- primary report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any FAIL/DEFERRED item.
