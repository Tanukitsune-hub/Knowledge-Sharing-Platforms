# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-led diagnosis / bounded edit; Codex authenticated DEV execution and verification`.

Recommended Codex model: `Luna Max`.

## Current operating rule

Product architecture and feature scope are settled through Work 0012. When a live defect appears, Codex stops with the smallest safe evidence and ChatGPT owns diagnosis, scope, and the next bounded handoff.

## Accepted completed evidence — do not rerun

- Pitchbook Date representation repair: PASS.
- Pitchbook status-parser repair: PASS.
- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C normal-browser upload-size qualification: PASS at `1 / 5 / 10 / 15 / 20 / 25 MiB`.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS.
- Work 0012 public-surface hardening: deterministic PASS.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, or prior defect work.

## Latest navigation state

ChatGPT's first bounded navigation repair replaced the iframe-local `window.location.search` route with published-Web-App GET navigation using `_top`, and added `tests/webapp-navigation.test.cjs`.

Codex independently verified the patch:

- focused navigation regression: `1/1 PASS`;
- `npm run check`: `159/159 PASS`;
- `npm run test`: `159/159 PASS`;
- Apps Script / HTML / manifest validation: PASS;
- public surface: `23 public / 360 private top-level functions`;
- `git diff --check`: PASS.

The verified source was deployed to the existing synthetic DEV Web App as version 19. One normal user click on `ナレッジ検索` still produced a fully white page. Matrix D/E were not run after that failure.

Current Work 0013 classification remains:

`NOT QUALIFIED — POST-REPAIR LIVE NAVIGATION STILL FAILS`

`BLOCKER: YES`

## Active next execution

ChatGPT has deliberately not made a second speculative navigation patch. The remaining ambiguity is now a single runtime distinction: whether the deployed `?page=knowledge` route itself fails independently of the main-page navigation control.

Use:

`docs/handoffs/0013-knowledge-direct-route-diagnosis-instruction.md`

Exact handoff commit:

`a986d2feb96b52c8bcd6053bb595cf7cdaff5c75`

The active run is diagnosis-only. Perform one direct user navigation to the current version-19 Web App with `page=knowledge`, classify the result, update report evidence, and stop. Do not modify source/deployment or continue to Matrix D/E.

If the direct route renders, the remaining defect is in the navigation-control layer. If the direct route is also white, the server route/render layer is confirmed. ChatGPT will author the next bounded repair only after that result.

## Matrix D correction retained

When Matrix D eventually resumes, the actual private administrator entrypoints are:

- `src/99_EntryPoints.gs`: `getInstallationStatus_()`, `validateInstallation_()`, `setupKnowledgePlatform_()`;
- `src/170_AiEntryPoints.gs`: `runAiSyncWorker_()`.

Do not treat prior selection of `00_Core.gs` / `10_Setup.gs` as proof that the private entrypoints are unavailable.

## Remaining external categories

Do not execute in the active diagnosis run:

- disposable Shared Drive-specific behavior;
- billing-enabled Gemini / File Search live qualification.

These remain explicit external residual gaps unless separately proven.

Do not claim `DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS` or `PRODUCTION READY` while the current navigation blocker remains.

## Safety and delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data, credentials, private IDs/URLs, source content, or user-specific local paths in GitHub/report/chat.
- No temporary public admin/debug wrapper or blind Windows UI automation.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Do not merge; ChatGPT performs final review.
