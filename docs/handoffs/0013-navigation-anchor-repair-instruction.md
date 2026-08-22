# Work 0013 — Knowledge Search top-level anchor repair verification and non-AI completion

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `B — ChatGPT bounded edit + Codex deterministic/runtime verification and in-scope completion`.

Recommended Codex model: `Luna Max`.

Rationale: the live defect is now isolated to the normal navigation control. Direct `?page=knowledge` on DEV version 19 renders correctly, proving the Knowledge Search route/render layer. The prior form-based `_top` navigation still produced a white page, and its action URL could not be safely inspected because the browser observation was outside the HTML Service sandbox iframe. ChatGPT has therefore made one minimal second repair that follows Google's documented HTML Service navigation pattern: an `<a>` link with `target="_top"`. Residual work is bounded verification, DEV deployment, one live navigation confirmation, and—only if that passes—the already-specified non-AI Matrix D/E completion.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Starting accepted evidence ref before this repair: `bc232e8b0f02a25072de2e42796877b4bc00cd72`.

ChatGPT repair commits already on the target branch:

- `6a7dd8544b85b2fa415d79bcc2c6f16cccf871a8` — replace form-based navigation with explicit top-level anchors;
- `e7a7ea065daa2f9bac7920c4c7eea9b9303ba852` — update focused regression for anchor routing.

Primary report: `docs/handoffs/0013-report.md`.

Dedicated report: `docs/handoffs/0013-non-ai-final-live-qualification-report.md`.

## Accepted completed evidence — do not rerun

- Pitchbook Date normalization repair: PASS.
- Pitchbook status-parser repair: PASS.
- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: `1 / 5 / 10 / 15 / 20 / 25 MiB`: live PASS.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- First navigation repair deterministic result: focused `1/1 PASS`, full `159/159 PASS`.
- DEV version 19 normal navigation after first repair: white-screen FAIL.
- DEV version 19 direct `?page=knowledge`: PASS; `ナレッジ検索` and `対象資料の書き出し` visibly rendered.
- Rendered action URL comparison: `NOT SAFELY OBSERVABLE`; no URL mismatch was inferred.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, the direct-route proof, or action-URL DOM diagnosis.

## Falsifiable hypothesis

The remaining white-screen defect is caused by using an HTML `<form>` submission as the top-level cross-sandbox navigation control. The deployed route itself is healthy. Apps Script HTML Service runs in an iframe sandbox, and the documented top-level navigation pattern is a normal link with `target="_top"` (or equivalent `<base target="_top">`). Replacing the form submission with an explicit anchor to the same deployed Web App URL removes the remaining control-layer behavior while preserving the already-proven route.

This run tests only that hypothesis.

## ChatGPT-completed repair

### `src/90_WebApp.gs`

- retain `ScriptApp.getService().getUrl()` and the existing `doGet(event)` route contract;
- retain direct `page=knowledge` rendering logic;
- replace main-page form submission with:
  - one anchor `#nav-knowledge`;
  - `href = webAppUrl + '?page=knowledge'`;
  - `target="_top"`;
- replace Knowledge Search back form with:
  - one anchor `#knowledge-back`;
  - `href = webAppUrl`;
  - `target="_top"`;
- retain removal of the legacy `window.location.search=''` back handler from evaluated Knowledge Search HTML;
- no public facade, data, export, AI, limits, storage, manifest, or architecture change.

### `tests/webapp-navigation.test.cjs`

The focused regression now requires explicit anchor-based `_top` navigation and rejects the form-based route.

## Applicable AGENTS.md and mandatory subagents

Before starting:

1. read every applicable `AGENTS.md` / `AGENTS.override.md`;
2. identify and follow the repository-specific subagent-use policy;
3. use subagents actively and proportionately.

Subagent use is mandatory. At minimum use independent perspectives for:

- navigation patch/regression review;
- private administrator entrypoint verification;
- Knowledge Export Drive/Docs/PDF/Audit verification;
- final report/diff consistency.

Do not use subagents to explore competing navigation hypotheses.

# Phase 1 — Deterministic verification

Start with no source changes.

Run:

1. focused `tests/webapp-navigation.test.cjs`;
2. `npm run check`;
3. `npm run test`;
4. `git diff --check`.

Record exact totals.

Allowed repair boundary if and only if the ChatGPT anchor patch itself has a deterministic defect:

- `src/90_WebApp.gs`;
- `tests/webapp-navigation.test.cjs`.

Do not change any other production/test file in this run without a new ChatGPT handoff.

If deterministic checks do not pass within that boundary, stop and return evidence.

# Phase 2 — DEV deployment and one normal navigation proof

Use only the same authenticated synthetic DEV Apps Script project and existing Work 0013 Web App deployment.

- push the verified branch source;
- update the existing DEV Web App deployment to the new version using the established procedure;
- do not create a new production/public/API deployment;
- do not record private URLs/IDs.

Ask the user to open the normal DEV main page and click `ナレッジ検索` exactly once.

PASS requires the normal click to render the Knowledge Search page with at least:

- heading `ナレッジ検索`;
- section `対象資料の書き出し`.

If the normal click is still white or otherwise fails after deterministic PASS, stop immediately and return to ChatGPT. Do not try a third navigation hypothesis, alternate URL, refresh loop, direct route, or browser automation workaround.

If navigation passes, optionally confirm the normal `登録・管理へ戻る` anchor once later in the same run after Matrix E, but failure of the back anchor is a new navigation defect and must stop that path.

# Phase 3 — Corrected Matrix D private administrator path

Proceed only after normal navigation PASS.

The actual private entrypoints are:

- `src/99_EntryPoints.gs`:
  - `getInstallationStatus_()`;
  - `validateInstallation_()`;
  - `setupKnowledgePlatform_()`;
- `src/170_AiEntryPoints.gs`:
  - `runAiSyncWorker_()`.

Do not use `00_Core.gs` / `10_Setup.gs` as the execution-location test.

Attempt once through the approved private/editor path:

1. `getInstallationStatus_()`;
2. `validateInstallation_()`;
3. `setupKnowledgePlatform_()`;
4. post-setup status/validation reread;
5. `runAiSyncWorker_()` only while `AI_SYNC_ENABLED=false`.

PASS requirements remain:

- installation/status healthy;
- validation healthy;
- setup reuses existing resources and does not duplicate/reset authoritative state;
- disabled AI sync is a no-op and does not require Gemini credentials.

If the exact private entrypoint files/functions are still not safely executable/observable without changing the private/public boundary, classify Matrix D `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`. This alone is non-blocking.

Any actual private execution data/setup defect is a blocker and stops Matrix D.

# Phase 4 — Matrix E Knowledge Export completion

Proceed only after normal navigation PASS.

Use existing synthetic Active Meetings/Pitchbooks. Do not configure Gemini.

## E1 Preview

Through the normal Knowledge Search/Export UI:

- preview a compact mixed Active Meeting/Pitchbook set;
- verify Backend counts and chronological ordering;
- verify exact Meeting character count against authoritative Docs;
- verify no artifact is created by preview;
- verify preview Audit is metadata-only/content-redacted.

## E2 Google Docs export

Create one normal Docs export and verify:

- exactly one retained Doc in `Knowledge Exports`;
- complete authoritative Meeting text and correct order;
- functional source hyperlinks;
- Pitchbook metadata/link-only representation;
- valid artifact link;
- no new Meeting/Pitchbook Index source row;
- no source AI-state change / no derived export indexing;
- metadata-only Audit.

## E3 PDF export

Create one normal PDF export from a valid preview and verify:

- one non-empty PDF in `Knowledge Exports`;
- valid artifact link and expected content/order;
- temporary Doc cleanup when applicable;
- no source Index/AI-state change;
- metadata-only Audit.

## E4 Clipboard

Ask the user to press `AI用プロンプトをコピー` once and confirm only whether pasting into an empty local temporary area succeeds. Do not request prompt contents.

PASS requires successful native or fallback copy plus metadata-only success Audit after confirmed copy. If browser permissions block both native and fallback while Docs/PDF pass, clipboard may be `DEFERRED — BROWSER CLIPBOARD LIMITATION` without invalidating the rest of Matrix E.

## E5 Integrity readback

Confirm:

- export operations created no authoritative source rows;
- original Meeting/Pitchbook sources remain intact;
- no export is an AI source/index candidate;
- one normal action does not create duplicates;
- Audit contains only expected metadata events.

Stop Matrix E at the first actual application/data-integrity defect and return evidence; do not diagnose another cause in this run.

# Residual categories

Do not execute:

- Shared Drive-specific qualification;
- billing-enabled Gemini / File Search qualification.

Retain both as explicit external residual gaps.

# Validation / delivery

After the available phases:

- update `docs/handoffs/0013-report.md` so current accepted PASS/FAIL/DEFERRED states supersede historical stopped runs;
- update `docs/handoffs/0013-non-ai-final-live-qualification-report.md`;
- update `docs/handoffs/0013-instruction.md` to the resulting current state;
- update Draft PR #11;
- commit and push all in-scope changes/report evidence;
- do not merge.

If normal anchor navigation passes, Matrix E passes, and Matrix D is PASS or only the allowed private-execution-surface DEFERRED state, classify:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

and `BLOCKER: NO`.

Do not claim `PRODUCTION READY` while Shared Drive/Gemini live qualification remains deferred.

## Stop conditions

Stop immediately and return to ChatGPT if:

- deterministic anchor checks fail outside the bounded repair;
- the one normal navigation click still fails after the anchor repair;
- any Matrix D execution reveals an actual setup/status/integrity defect;
- any Matrix E action produces an application/data-integrity defect;
- a new source file outside the allowed scope would need modification;
- a third navigation hypothesis, broad investigation, or architecture change would be needed.

## Completion response

Return only:

- Work ID;
- anchor patch deterministic result;
- live normal Knowledge Search navigation result;
- Matrix D result;
- Matrix E result;
- Docs export result;
- PDF export result;
- clipboard result;
- Shared Drive residual;
- Gemini/File Search residual;
- overall classification;
- report path;
- primary report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any FAIL/DEFERRED item.
