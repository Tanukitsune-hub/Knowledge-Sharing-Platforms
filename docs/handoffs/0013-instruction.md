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
- First navigation repair deterministic verification: focused `1/1 PASS`, full `159/159 PASS`.
- DEV version 19 normal `ナレッジ検索` control: white-screen FAIL.
- DEV version 19 direct `?page=knowledge`: PASS; Knowledge Search and Knowledge Export controls visibly render.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, the broken normal navigation click, or the direct-route proof.

## Current classification

`NOT QUALIFIED — NORMAL NAVIGATION CONTROL DEFECT REMAINS`

`BLOCKER: YES`

The direct route has falsified the hypothesis that the deployed Knowledge Search route/render layer is broken. The remaining defect is confined to the normal navigation control.

## Active next execution

ChatGPT has not made a second source patch.

The next single hypothesis is that the rendered navigation form generated from `ScriptApp.getService().getUrl()` does not target the same current DEV deployment base URL whose direct `?page=knowledge` route passed.

Use:

`docs/handoffs/0013-navigation-action-url-diagnosis-instruction.md`

Exact handoff commit:

`c0cf7ddf12577a8ad99c8fce1a0e6e813e82f9b2`

The run is diagnosis-only. Inspect the rendered `#nav-knowledge` form action without clicking it and compare its deployment/base identity privately with the successful current DEV deployment base. Record only `ACTION_URL_MISMATCH`, `ACTION_URL_MATCH`, or `NOT_SAFELY_OBSERVABLE` plus non-secret structural differences. Then stop.

Do not modify source, tests, deployment, manifest, public facade, limits, or architecture in this run. Do not proceed to Matrix D/E.

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
