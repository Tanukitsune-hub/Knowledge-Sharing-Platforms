# Work 0013 — Navigation action URL diagnosis

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded authenticated DEV runtime diagnosis only`.

Recommended Codex model: `Luna Max`.

Rationale: the direct `?page=knowledge` route is now proven live-good on the same DEV version 19 deployment, so the remaining defect is confined to the navigation control. The next unresolved fact is whether the rendered control points to the same deployment URL that succeeded when opened directly. This is a single binary runtime comparison; no architecture or source implementation is required.

Parent evidence ref: `11362f6f47b83cf96c367c676b1544aacaa79733`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

Dedicated report: `docs/handoffs/0013-non-ai-final-live-qualification-report.md`.

## Accepted evidence — do not rerun

- Matrix A: PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: `1 / 5 / 10 / 15 / 20 / 25 MiB` all PASS.
- Navigation patch deterministic verification: focused `1/1 PASS`, full `159/159 PASS`.
- DEV version 19 normal `ナレッジ検索` control: white-screen FAIL.
- DEV version 19 direct `?page=knowledge`: PASS; `ナレッジ検索` and `対象資料の書き出し` visibly render.

Do not rerun the normal navigation click or the direct-route proof in this diagnostic.

## Single accepted hypothesis

The rendered main-page navigation form created from `ScriptApp.getService().getUrl()` does not target the same current DEV deployment base URL that the user directly opened successfully.

If the form action base and the successful direct-route base differ, the live failure is explained by deployment-target drift rather than the Knowledge Search route/render layer.

If they are the same, this hypothesis is falsified and the run must stop for ChatGPT to author the next diagnosis. Do not switch to form-vs-anchor, sandbox, authentication, or another hypothesis in the same run.

## Evidence supporting the hypothesis

Current source in `src/90_WebApp.gs` builds the navigation form server-side from:

`ScriptApp.getService().getUrl()`

and submits `page=knowledge` with `target="_top"`.

Google documents `getUrl()` as returning a deployed Web App URL, while the live evidence only proves that one specific existing DEV version-19 URL succeeds when `?page=knowledge` is appended directly. The exact identity relationship between those two URLs has not yet been observed.

## Hard scope boundary

Allowed:

- inspect the already-rendered main-page navigation control in the existing authenticated synthetic DEV Web App;
- read its resolved form `action` value through browser DOM inspection without clicking it;
- read the currently open successful DEV Web App base URL from the browser/runtime context;
- compare only normalized deployment identity/base privately;
- record only `SAME_DEPLOYMENT_BASE`, `DIFFERENT_DEPLOYMENT_BASE`, or `NOT_SAFELY_OBSERVABLE` plus non-secret structural facts such as `/exec` vs `/dev` if useful;
- update Work 0013 reports and PR evidence.

Not allowed:

- source/test/deployment/manifest/public-facade changes;
- clicking the broken normal navigation control;
- retrying the direct-route proof;
- exposing or recording full Web App URLs, deployment IDs, script IDs, resource IDs, credentials, cookies, or tokens;
- Matrix D/E, Docs/PDF/clipboard, Shared Drive, Gemini/File Search work;
- open-ended browser debugging or a second hypothesis.

## Required runtime comparison

Using the existing version-19 synthetic DEV Web App main page:

1. Inspect the element `#nav-knowledge` and its nearest parent `<form>`.
2. Read the resolved `form.action` value without submitting it.
3. Read the current DEV Web App base URL corresponding to the deployment whose direct `?page=knowledge` route already passed.
4. Normalize both only enough to compare the deployment target/base; ignore the `page=knowledge` query parameter.
5. Do not print either full URL or deployment identifier.

Classify exactly one of:

### `ACTION_URL_MISMATCH — HYPOTHESIS CONFIRMED`

Use only when the rendered form action and the successful current DEV deployment base are different.

Record, if safely observable, whether the difference is structural such as `/exec` vs `/dev` or a different deployment target, without recording identifiers.

Then stop. Do not repair.

### `ACTION_URL_MATCH — HYPOTHESIS FALSIFIED`

Use only when the rendered form action and the successful current DEV deployment base are the same.

Then stop. Do not investigate form submission semantics, sandbox behavior, anchors, authentication, or any other cause.

### `ACTION_URL_COMPARISON_NOT_SAFELY_OBSERVABLE`

Use only when the comparison cannot be performed without exposing secrets/private identifiers or using unstable/blind UI automation.

Then stop and state the exact observation limitation.

## Subagents

Before starting, read all applicable `AGENTS.md` / `AGENTS.override.md` files and identify the repository-specific subagent-use policy.

Subagent use is mandatory but proportionate. Use one independent perspective to verify the URL-comparison logic/classification and one final evidence/report consistency check. Do not dispatch competing root-cause exploration.

## Reporting

Update only report/instruction evidence if needed. No source/tests should change.

If tracked files change, run `git diff --check` before committing.

Keep PR #11 Draft / open / unmerged.

## Completion response

Return only:

- Work ID;
- action URL comparison result;
- structural difference, if any, without identifiers;
- report path;
- primary report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES`;
- one-line evidence.
