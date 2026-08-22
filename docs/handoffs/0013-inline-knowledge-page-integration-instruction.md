# Work 0013 — Inline Knowledge Search page integration and final non-AI qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded UI integration implementation + deterministic/runtime validation`.

Recommended Codex model: `Luna Max`.

Rationale: ChatGPT has resolved the remaining design choice. Two different top-level navigation implementations (`form target=_top` and `a target=_top`) both passed deterministic tests but failed the normal live click, while the deployed direct `?page=knowledge` route rendered successfully. The shortest coherent repair is therefore to stop navigating between Web App documents for normal use and integrate Knowledge Search into the existing single-document `showPage()` navigation model already used by Meeting, Pitchbook, maintenance, and Master pages. The residual task is bounded implementation and validation, not open-ended architecture discovery.

Starting ref: `d8dd0e32bdcc5ad8807857bc765b8ed7f60fc784`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.
Dedicated non-AI report: `docs/handoffs/0013-non-ai-final-live-qualification-report.md`.

## Accepted evidence — do not reopen

- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: `1 / 5 / 10 / 15 / 20 / 25 MiB`: live PASS.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Pitchbook Date and status-parser repairs: PASS.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS.
- Work 0012 public-surface hardening: deterministic PASS.
- First navigation repair (`form target=_top`): deterministic PASS, live normal click FAIL.
- Second navigation repair (`a target=_top`): deterministic PASS, live normal click FAIL on DEV version 20.
- Direct deployed `?page=knowledge`: live PASS and visibly renders `ナレッジ検索` and `対象資料の書き出し`.
- Action-URL comparison: `NOT SAFELY OBSERVABLE`; no URL mismatch was inferred.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, direct-route proof, action-URL comparison, or the failed top-level navigation variants.

## ChatGPT design decision

Normal user navigation to Knowledge Search will no longer perform a browser/Web App document navigation.

Instead, Knowledge Search becomes another page inside the existing `Index.html` application document and is shown/hidden by the same client-side `showPage()` mechanism already used for:

- Meeting registration;
- Pitchbook registration;
- Past Meetings;
- Past Pitchbooks;
- Master management.

The direct `?page=knowledge` route may remain as a secondary/backward-compatible standalone entrypoint, but normal product use must not depend on it.

This is not a new application architecture. It consolidates the one outlier page into the application's existing page-switching architecture and removes the repeatedly failing top-level navigation dependency.

## Required-now outcome

After implementation and DEV deployment:

1. the main Web App shows a normal `ナレッジ検索` navigation button in the same navigation group as the other pages;
2. clicking it once switches the existing document to the Knowledge Search/Export UI without a full-page Web App navigation;
3. clicking an existing page such as `面談記録` and then `ナレッジ検索` again works through local `showPage()` switching;
4. Knowledge Search bootstrap and Gemini-independent Knowledge Export controls function in the integrated page;
5. no duplicate DOM IDs, duplicate client bootstrap, or public-facade expansion is introduced;
6. the standalone direct `?page=knowledge` route remains usable or is explicitly retained without regression if practical;
7. once live integrated navigation passes, complete corrected Matrix D and Matrix E in the same run unless a stop condition is reached.

## Hard scope boundary

Allowed source files:

- `src/Index.html`;
- `src/ClientCore.html`;
- `src/KnowledgeSearch.html`;
- `src/ClientKnowledgeSearch.html`;
- `src/Styles.html`;
- `src/90_WebApp.gs`;
- at most one new HTML partial under `src/` for shared Knowledge Search page markup (preferred name: `KnowledgeSearchPage.html` or similarly narrow descriptive name).

Allowed tests:

- `tests/webapp-navigation.test.cjs`;
- `tests/knowledge-export-ui.test.cjs`;
- `tests/ai-query-ui.test.cjs` only when needed for the shared markup/client contract;
- one narrowly scoped new UI integration test only if the existing tests cannot express the integrated-page contract clearly.

Allowed documentation/report files:

- current Work 0013 handoffs/reports and PR text.

Not allowed:

- changes to Meeting/Pitchbook/maintenance service logic;
- changes to Knowledge Export server business logic;
- changes to AI/File Search server logic;
- public facade expansion;
- manifest, data schema, storage, limits, credentials, Shared Drive, or Gemini configuration changes;
- new router framework, SPA library, bundler, external dependency, or parallel application;
- temporary public/debug/qualification wrapper;
- production data/deployment.

## Implementation contract

### 1. Shared Knowledge Search markup

Avoid maintaining two independent copies of the Knowledge Search/Export DOM.

Preferred implementation:

- extract the current Knowledge Search content cards/results into one reusable HTML partial such as `KnowledgeSearchPage.html`;
- the partial must contain a single page container suitable for the existing `.page` / `.page.active` model, e.g. `id="page-knowledge"`;
- `Index.html` includes this partial once inside its main application shell;
- `KnowledgeSearch.html`, if retained as the direct standalone route, reuses the same partial rather than duplicating form/export markup.

Do not create duplicate IDs when both contexts are rendered separately.

### 2. Main navigation

In `Index.html`:

- add `button id="nav-knowledge" type="button">ナレッジ検索</button>` statically in the existing navigation;
- do not inject the normal Knowledge navigation from `90_WebApp.gs`;
- include the shared Knowledge Search page partial;
- include `ClientKnowledgeSearch` exactly once in the main document.

In `ClientCore.html`:

- add `knowledge: document.getElementById('page-knowledge')` to the existing `pages` map;
- rely on the existing generic `showPage()` and generic nav-button binding;
- do not add a second page router.

### 3. Knowledge Search client compatibility

`ClientKnowledgeSearch.html` must work in both the integrated main-document context and, if retained, the standalone direct-route context.

Requirements:

- do not assume `#knowledge-back` exists; guard any back-control binding;
- do not duplicate bootstrap calls when the script is included once;
- integrated page bootstrap may occur while the page is hidden, but it must not make another page unusable or throw due to missing elements;
- Gemini-unconfigured warning behavior remains unchanged;
- Gemini-independent Preview/Docs/PDF/prompt controls remain usable even when Gemini is unconfigured;
- no source body or prompt content is added to Audit.

### 4. Standalone direct route

The direct `?page=knowledge` route is already live-proven and should not become the primary navigation dependency again.

Preferred behavior:

- keep `doGet(page=knowledge)` as a compatible standalone entrypoint using the shared partial;
- normal/default `doGet` simply returns evaluated `Index` and does not inject navigation markup;
- if the standalone wrapper has a back control, it may use the existing safe method, but failure of that optional back control must not reintroduce a dependency into normal main-page navigation.

Do not remove the direct route unless doing so is necessary for a substantially simpler implementation and deterministic tests prove no accepted contract depends on it. If removal appears necessary, stop and return to ChatGPT rather than broadening scope.

### 5. Styling

Preserve the current Knowledge Search visual behavior.

If its four page-specific CSS rules currently live inside `KnowledgeSearch.html`, move/reuse them through the existing `Styles.html` or one narrow shared style include so the integrated page renders correctly. Do not redesign UI.

## Expected pre-fix failing regression

Before implementing the source repair, add/adjust a deterministic regression that expresses the new accepted product contract and fails against the current branch because:

- `Index.html` does not contain a static `nav-knowledge` button;
- the main application does not contain `page-knowledge`;
- `ClientCore.html` does not register `knowledge` in the `pages` map; and/or
- `90_WebApp.gs` still injects top-level Knowledge navigation.

The regression should verify the actual same-document contract, not merely search for generic strings.

Do not write a test that can pass while normal navigation still performs a top-level URL change.

## Deterministic validation

Run at minimum:

1. the focused integrated-navigation regression;
2. focused Knowledge Export UI tests;
3. focused AI/Knowledge Search UI parse/contract tests if affected;
4. `npm run check`;
5. `npm run test`;
6. `git diff --check`.

Record exact totals.

Treat duplicate IDs, missing DOM references, script parse errors, public-surface changes, or regressions in existing Meeting/Pitchbook navigation as blockers.

## DEV deployment and live confirmation

Use only the existing authenticated synthetic DEV Apps Script project and existing Work 0013 Web App deployment.

Push/deploy the verified implementation using the already-established procedure. Temporary local clasp configuration may be used if required but must not be committed.

### Integrated navigation live check

Ask the user for only these actions:

1. open the normal main DEV Web App page;
2. click `ナレッジ検索` once;
3. confirm `ナレッジ検索` and `対象資料の書き出し` are visibly shown;
4. click `面談記録` once;
5. confirm the Meeting page is visibly shown;
6. click `ナレッジ検索` once more;
7. confirm the Knowledge Search/Export UI returns.

PASS requires same-document page switching with no white page/application error and no need to edit the browser URL.

If the integrated navigation fails after deterministic PASS, stop immediately. Do not try a fourth navigation mechanism in the same run.

## Matrix D — corrected private administrator path

Only after integrated navigation PASS, continue Matrix D.

Actual private administrator entrypoints:

- `src/99_EntryPoints.gs`: `getInstallationStatus_()`, `validateInstallation_()`, `setupKnowledgePlatform_()`;
- `src/170_AiEntryPoints.gs`: `runAiSyncWorker_()`.

Use the exact prior Matrix D contract:

1. status;
2. validation;
3. setup once;
4. status/validation reread;
5. `runAiSyncWorker_()` once only while `AI_SYNC_ENABLED=false`.

If exact private functions still cannot be safely invoked/observed from the Apps Script editor, classify `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`; this alone is non-blocking. Do not expose them publicly.

Any actual setup/validation/status/no-op mutation defect is a blocker.

## Matrix E — Gemini-independent Knowledge Export

Only after integrated navigation PASS, complete the previously defined Matrix E without reopening deterministic threshold tests.

### E1 Preview

Use a compact mixed Active Meeting/Pitchbook source set and verify:

- preview succeeds without Gemini credentials;
- counts/order/Meeting character count match authoritative sources;
- no artifact from preview;
- metadata-only Audit.

### E2 Google Docs

Create one normal Google Docs export and verify:

- exactly one retained export Doc in `Knowledge Exports`;
- complete Meeting text and correct order;
- functional authoritative source hyperlinks;
- Pitchbook metadata/link only;
- artifact URL resolves;
- no source Index/AI-state mutation;
- metadata-only Audit.

### E3 PDF

Create one PDF from a valid preview and verify:

- one non-empty PDF in `Knowledge Exports`;
- artifact URL resolves;
- expected structure/order;
- temporary Doc cleanup when applicable;
- no source Index/AI-state mutation;
- metadata-only Audit.

### E4 Clipboard

Ask the user to press `AI用プロンプトをコピー` once and confirm only whether paste into an empty local temporary text area/file succeeds. Do not ask for prompt content.

PASS requires successful copy or documented fallback plus metadata-only prompt-copy Audit only after success. If both browser clipboard paths fail while Docs/PDF pass, clipboard alone may be `DEFERRED` as an environment limitation.

### E5 Integrity

Confirm no unexpected source mutation, no derived-export AI indexing, no duplicate artifact from one action, and only expected metadata Audit events.

Stop Matrix E at the first actual application/data-integrity defect and return the smallest safe evidence to ChatGPT. Do not begin a second hypothesis.

## Residual external categories

Do not execute in this run:

- Shared Drive-specific qualification;
- billing-enabled Gemini / File Search qualification.

Retain both as explicit external residual gaps.

## Completion classification

If:

- integrated normal Knowledge navigation PASS;
- Matrix E PASS except an allowed clipboard-only environment deferral;
- Matrix D is PASS or only the allowed private-execution-surface deferral;
- no implementation blocker remains;

then Work 0013 may be classified:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

with `BLOCKER: NO`.

Do not claim `PRODUCTION READY` while Shared Drive and Gemini/File Search live qualification remain deferred.

## Git / PR / report requirements

- stay on `agent/0013-consolidated-dev-live-qualification`;
- no force push or history rewrite;
- preserve unrelated work;
- write/update the existing Work 0013 reports with the latest result clearly superseding historical failed navigation attempts;
- write `docs/handoffs/0013-inline-knowledge-page-integration-report.md` for this implementation/run;
- link this instruction and its report from Draft PR #11;
- commit/push all scoped source/tests/report changes;
- keep PR #11 Draft / Open / unmerged;
- do not merge.

## Mandatory stop/escalation conditions

Stop and return to ChatGPT if:

- the pre-fix integrated-navigation regression does not fail as expected;
- implementing same-document navigation requires changes outside the allowed files/contracts;
- deterministic checks fail after the bounded repair;
- integrated navigation still fails live after deterministic PASS;
- Knowledge Export produces an actual application/data-integrity defect;
- private admin execution exposes an actual defect rather than only an editor-surface limitation;
- any new architecture, credential, Shared Drive, Gemini, or production action would be required.

Do not continue to another navigation hypothesis or broader refactor in the same run.

## Completion response

Return only:

- Work ID;
- integrated navigation result;
- Matrix D result;
- Matrix E result;
- Docs export result;
- PDF export result;
- clipboard result;
- Shared Drive residual;
- Gemini/File Search residual;
- overall Work 0013 classification;
- report path;
- primary report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any FAIL/DEFERRED item.
