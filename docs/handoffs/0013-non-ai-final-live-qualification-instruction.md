# Work 0013 — Final non-AI DEV qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded authenticated DEV qualification with user-assisted native browser actions where required`.

Recommended Codex model: `Luna Max`.

Rationale: Web App recovery, project identity, source currentness, deployment type, `/exec` rendering, and integrated same-document navigation are now proven. The remaining work is deterministic authenticated qualification of the private administrator path and Gemini-independent Knowledge Export. No architecture, source implementation, deployment recovery, or open-ended diagnosis is authorized.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.
Dedicated report: `docs/handoffs/0013-non-ai-final-live-qualification-report.md`.

## Accepted evidence — do not reopen

- Pitchbook Date/status-parser repairs: PASS.
- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C practical browser sizing: `1 / 5 / 10 / 15 / 20 / 25 MiB` all PASS.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS.
- Work 0012 public-surface hardening: deterministic PASS.
- Inline Knowledge Search implementation: focused `36/36 PASS`.
- `npm run check` / `npm run test`: `160/160 PASS`.
- Apps Script project identity: confirmed.
- Remote Apps Script source: current.
- One versioned synthetic DEV `Web app` deployment exists with deploying-user execution and `Only myself` access.
- Versioned `/exec`: live PASS — main page rendered.
- Integrated normal navigation: `PASS — USER-ASSISTED LIVE CONFIRMATION`.
- The user manually verified `ナレッジ検索 -> 面談記録 -> ナレッジ検索` using normal clicks and same-document switching.
- Recovery/navigation actions produced no observed authoritative mutation.

Codex's prior inability to locate the `ナレッジ検索` button through its browser selector is an automation-surface limitation and is superseded by the user's direct live confirmation.

Do not rerun:

- `/dev`;
- `/exec` deployment recovery;
- project/source/deployment identity diagnosis;
- Knowledge Search navigation;
- Matrix A/B/C;
- upload sizing;
- parser diagnosis;
- historical form/anchor navigation experiments.

## Required-now outcome

Complete only:

1. Matrix D — post-hardening private administrator path; and
2. Matrix E — Gemini-independent Knowledge Export preview / Google Docs / PDF / clipboard / final integrity readback.

If Matrix E passes, Matrix D is PASS or only the allowed private-execution-surface DEFERRED state, and no implementation blocker remains, classify Work 0013:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

with `BLOCKER: NO`.

Do not claim `PRODUCTION READY`.

## Hard scope boundary

Allowed:

- use the existing recovered versioned synthetic DEV `/exec` Web App;
- use existing authenticated private/admin execution mechanisms that do not expand the public facade;
- ask the user for only the native Apps Script editor or browser actions necessary for Matrix D/E;
- create the expected derived synthetic Knowledge Export artifacts in the existing DEV `Knowledge Exports` location;
- inspect Backend / Audit / Drive / Docs/PDF state through approved authenticated paths;
- update Work 0013 reports and PR evidence.

Not allowed:

- application source, tests, manifest, navigation, deployment, product limits, schema, public facade, setup logic, Knowledge Export business logic, or AI/File Search code changes;
- another Web App deployment;
- public wrappers, debug endpoints, temporary API deployments, or exposing private administrator functions;
- `/dev` or historical deployment diagnosis;
- production/confidential data;
- configuring Gemini credentials/File Search;
- creating a Shared Drive;
- retry loops or a second root-cause hypothesis after an actual application defect.

If an actual application/data-integrity defect is observed, stop that matrix at the first defect and return the smallest safe evidence to ChatGPT.

## Applicable AGENTS.md and subagents

Before starting, read all applicable `AGENTS.md` / `AGENTS.override.md` files and follow the repository-specific subagent policy.

Use subagents actively and proportionately, including independent review of:

- Matrix D private/admin boundary and evidence;
- Matrix E Docs/PDF/Audit/source-integrity evidence;
- final report/diff/status consistency.

Do not duplicate user interaction or run competing diagnoses.

# Matrix D — post-hardening private administrator path

Use the actual private entrypoint files:

- `src/99_EntryPoints.gs`: `getInstallationStatus_()`, `validateInstallation_()`, `setupKnowledgePlatform_()`;
- `src/170_AiEntryPoints.gs`: `runAiSyncWorker_()`.

Do not use `00_Core.gs` or `10_Setup.gs` as evidence that the private entrypoints are unavailable.

Preflight:

- confirm the recovered project remains the confirmed synthetic DEV project;
- confirm `AI_SYNC_ENABLED=false` before any AI worker invocation;
- preserve existing resource/source identity privately for comparison.

If the Apps Script editor safely exposes the private functions with observable results, execute once in this order:

1. `getInstallationStatus_()` — healthy installed DEV state;
2. `validateInstallation_()` — healthy resources/schemas/seeds;
3. `setupKnowledgePlatform_()` once — idempotent reuse, no duplicate resources/source rows;
4. status + validation reread — still healthy and resource-stable;
5. `runAiSyncWorker_()` once while AI sync is disabled — disabled/no-op, no Gemini credential/store requirement, no authoritative mutation, no new trigger.

If the exact private entrypoint files still do not provide a safe observable private execution path without source/deployment/public exposure changes, classify:

`DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`

This alone is non-blocking. Continue Matrix E.

Any actual status/validation/setup/no-op mutation defect is a blocker; stop Matrix D and return evidence.

# Matrix E — Gemini-independent Knowledge Export

Use the already recovered versioned `/exec`. Do not ask the user to re-prove navigation before beginning Matrix E.

Prefer the existing compact synthetic Active source set with at least two Meetings and one Pitchbook. Do not create threshold populations or retest deterministic size/count limits.

## E1 — Preview

Ask the user only for the minimum normal UI action needed to preview the mixed Active source set.

Verify authoritatively:

- preview succeeds without Gemini credentials;
- Meeting/Pitchbook counts match Backend Active rows for the selected filters;
- ordering is oldest-to-newest then stable source ID;
- Meeting character count matches authoritative Meeting Docs;
- preview creates no artifact;
- Audit is metadata-only and contains no source body, prompt, answer, chunk, embedding, or bytes.

## E2 — Google Docs

From a valid preview, ask the user to create exactly one Google Docs export.

Verify:

- exactly one retained export Doc;
- stored in configured `Knowledge Exports`, outside the authoritative source root;
- complete Meeting authoritative text in correct order;
- explicit functional authoritative source hyperlinks;
- Pitchbooks represented by metadata/link only;
- returned artifact link resolves;
- no source Index row or AI-state mutation;
- derived export is not an AI/source candidate;
- Audit is metadata-only/content-redacted.

Do not put source text or private URLs in chat/report.

## E3 — PDF

Use a fresh valid preview only if required by the stale-preview contract. Ask for exactly one PDF export.

Verify:

- one non-empty PDF in `Knowledge Exports`;
- artifact link resolves;
- expected source order/content structure;
- temporary Doc cleanup occurs when applicable;
- no source Index or AI-state mutation;
- Audit remains metadata-only/content-redacted.

A reported success without a valid PDF artifact is an application defect; stop.

## E4 — Clipboard

Ask the user to press `AI用プロンプトをコピー` once.

For confirmation, the user pastes into an empty local temporary text area/file and replies only:

- `貼り付けられた`; or
- `貼り付けられない`.

Never request the prompt contents.

PASS requires successful clipboard/fallback behavior plus one successful metadata-only prompt-copy Audit event after confirmed copy, with no Gemini call and no source/AI mutation.

If native clipboard and fallback both fail while Docs/PDF pass, clipboard alone may be `DEFERRED — BROWSER/ENVIRONMENT LIMITATION` and does not invalidate successful Docs/PDF qualification.

## E5 — Final integrity readback

Confirm:

- Meeting/Pitchbook source row counts unchanged except any explicitly created synthetic setup row (prefer none);
- export operations created no source rows;
- original source Docs/files remain intact;
- no export artifact is an authoritative/AI-index source;
- only expected metadata Audit events exist;
- no duplicate artifact arose from a single action;
- the versioned Web App deployment remains the same recovered deployment.

Stop at the first actual UI/data-integrity/source/Audit/duplicate defect. Do not diagnose a second hypothesis in this run.

# Residual external categories

Do not execute:

- Shared Drive-specific qualification: retain `DEFERRED — authorized disposable Shared Drive not exercised`;
- Gemini/File Search live qualification: retain `DEFERRED — approved billing-enabled DEV credential required`.

These are external gaps, not blockers for the non-AI DEV outcome.

# Delivery

No source/tests should change.

- do not rerun the full deterministic suite solely for report updates;
- run `git diff --check`;
- verify no clasp/OAuth/private IDs/URLs/account data are tracked;
- update `docs/handoffs/0013-report.md`;
- update `docs/handoffs/0013-non-ai-final-live-qualification-report.md`;
- update `docs/handoffs/0013-instruction.md`;
- update Draft PR #11;
- commit/push documentation/report changes only;
- keep PR Draft / Open / unmerged;
- do not merge; ChatGPT performs the final review.

# Completion response

Return only:

- Work ID;
- Matrix D result;
- Matrix E result;
- Docs export result;
- PDF export result;
- clipboard result;
- final integrity result;
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
