# Work 0013 — Knowledge Search direct-route diagnosis

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded authenticated DEV runtime diagnosis only`.

Recommended Codex model: `Luna Max`.

Rationale: the remaining ambiguity is now a single binary runtime question. Deterministic navigation tests pass, but the deployed DEV Web App still becomes white after one normal `ナレッジ検索` click. ChatGPT has reduced the next step to one falsifiable live hypothesis and no implementation or architecture reasoning is required in this run.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Starting ref: `0c889dc0130dfbb282c4d958f0cd8c9b450b1676`.

Primary report: `docs/handoffs/0013-report.md`.
Dedicated non-AI report: `docs/handoffs/0013-non-ai-final-live-qualification-report.md`.

## Accepted evidence — do not reopen

- Matrix A: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: 1 / 5 / 10 / 15 / 20 / 25 MiB live PASS.
- Largest stable supported upload: 25 MiB / 26,214,400 bytes.
- Pitchbook parser/date repairs: accepted PASS.
- Navigation patch deterministic evidence at the post-repair branch: focused `1/1 PASS`; `npm run check` / `npm run test` `159/159 PASS`.
- DEV deployment was updated to version 19.
- One normal user click on `ナレッジ検索` in version 19 still produced a fully white page.

Do not rerun any of the above.

## Single falsifiable hypothesis

`The deployed version-19 Knowledge Search server route itself fails to render when requested directly as ?page=knowledge, independent of the main-page navigation control.`

This run exists only to reproduce or falsify that hypothesis.

## Why this diagnosis is necessary

The live failure after the first repair does not distinguish between two materially different layers:

1. the main-page navigation control is still sending the browser to the wrong place; or
2. the browser reaches the published Web App route, but `doGet({parameter:{page:'knowledge'}})` / Knowledge Search rendering fails in the deployed runtime.

A direct user navigation to the already-deployed version-19 URL with the `page=knowledge` query separates these layers without another speculative source change.

## Hard scope boundary

Allowed:

- use the same authenticated synthetic DEV Web App deployment version 19;
- ask the user for one direct browser navigation using the already-open DEV Web App URL, without copying the private URL into chat or GitHub;
- inspect the resulting visible page state;
- inspect non-secret Apps Script execution evidence if already available through the authenticated local/runtime environment;
- update report/instruction/PR evidence only.

Not allowed:

- source, tests, deployment, manifest, public facade, limits, architecture, or product behavior changes;
- another navigation patch;
- browser automation or blind Windows UI control;
- refresh/retry loops;
- Matrix D, Matrix E, Docs, PDF, clipboard, Shared Drive, or Gemini/File Search execution;
- production or confidential data;
- exposing private URLs, IDs, tokens, cookies, credentials, or source bodies.

## Applicable AGENTS.md and subagents

Before starting, read all applicable `AGENTS.md` / `AGENTS.override.md` files and identify the repository-specific subagent policy.

Subagent use is mandatory and proportionate. Use subagents only for:

- independent review that the hypothesis and route distinction are correctly framed;
- final evidence/report consistency cross-check.

Do not dispatch competing root-cause exploration.

## Exact live diagnostic

Use the same browser/session and same deployed synthetic DEV Web App version 19 already used for the failed click.

1. Confirm the normal registration/maintenance page still renders before the probe.
2. Ask the user to open the current DEV Web App route directly with the existing base Web App URL plus the query parameter `page=knowledge`.
   - Do not ask the user to paste the URL into chat.
   - The user may edit the address bar locally or open a local duplicate tab and append the query.
3. Perform exactly one direct navigation.
4. Observe only whether the normal Knowledge Search page renders, including the `ナレッジ検索` heading and `対象資料の書き出し` section, or whether the page is white / visibly erroneous.
5. Do not click any Knowledge Export control in this run.
6. If safe authenticated Apps Script execution evidence is already available without changing deployment/source, record only whether a new `doGet` execution corresponding to the direct route was observed; do not record resource IDs, URLs, account identifiers, or raw private logs.

## Classification

### If direct `?page=knowledge` renders normally

Hypothesis is falsified.

Return:

`DIRECT_ROUTE_PASS — NAVIGATION_CONTROL_LAYER_REMAINS_DEFECTIVE`

This means the Knowledge Search page/route itself is usable and the remaining defect is in main-page navigation behavior. Stop immediately and return to ChatGPT. Do not patch the navigation in this run.

### If direct `?page=knowledge` is also white / visibly fails

Hypothesis is reproduced.

Return:

`DIRECT_ROUTE_FAIL — ROUTE_OR_RENDER_LAYER_CONFIRMED`

If execution evidence can safely distinguish whether `doGet` ran, include only one of:

- `doGet execution observed`; or
- `doGet execution not observed / not safely observable`.

Stop immediately and return to ChatGPT. Do not investigate template/client/service code in this run.

### If the direct route cannot be performed safely

Return:

`DEFERRED — DIRECT_ROUTE_USER_ACTION_UNAVAILABLE`

with the smallest non-secret reason. Do not infer root cause.

## Stop conditions

Stop after the single direct-route result. Do not:

- retry the direct route;
- click `ナレッジ検索` again;
- refresh to obtain a different result;
- modify source/deployment;
- transition to a second hypothesis;
- continue to Matrix D/E.

## Validation and delivery

This is diagnosis-only. No source/tests should change.

- If only report/docs change, `npm run check` / `npm run test` need not be rerun; retain the accepted `159/159` evidence.
- Run `git diff --check` before report-only commit.
- Update `docs/handoffs/0013-report.md` and `docs/handoffs/0013-non-ai-final-live-qualification-report.md` with the direct-route classification.
- Update Draft PR #11.
- Commit/push report-only changes.
- Do not merge.

## Completion response

Return only:

- Work ID;
- direct-route result;
- visible result;
- `doGet` execution observed / not observed / not safely observable;
- report path;
- primary report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES`;
- one-line evidence.
