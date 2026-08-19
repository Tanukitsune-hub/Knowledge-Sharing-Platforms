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
- Prior parser-repair local suite: `158/158 PASS`.
- Work 0010 pre-hardening setup / validation / status / setup-idempotency: live PASS.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS.
- Work 0012 public-surface hardening: deterministic PASS.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, or prior defect work.

## Latest observed non-AI qualification result

At pre-fix ref `03b1a4b2e97b16212b5e8f495f3c595d55d05b27`:

- Matrix D was reported `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION` after `00_Core.gs` and `10_Setup.gs` were selected in the Apps Script editor and the toolbar showed `関数なし`.
- Matrix E stopped immediately when one click on `ナレッジ検索` produced an entirely white page. Preview, Docs, PDF, clipboard, and integrity checks were not reached.

The durable stopped-run evidence remains in:

- `docs/handoffs/0013-non-ai-final-live-qualification-report.md`;
- `docs/handoffs/0013-report.md`.

## ChatGPT diagnosis and bounded repair

ChatGPT inspected the current source and isolated the Matrix E defect to Web App navigation:

- `src/90_WebApp.gs` used `window.location.search='?page=knowledge'` inside the Apps Script HTML Service iframe.
- The bounded repair now uses the published Web App URL from `ScriptApp.getService().getUrl()` and normal GET navigation with `target="_top"` for both directions.
- `tests/webapp-navigation.test.cjs` adds a focused regression for the route.

ChatGPT patch commits:

- `af847bb11ad419c95a86b63af7406f1abf4bf772`;
- `966e5d985840c1d9ba380bd4080b68ce1ae8e2ca`.

Matrix D also requires a corrected execution attempt: the actual private administrator entrypoints are in `src/99_EntryPoints.gs`, and `runAiSyncWorker_()` is in `src/170_AiEntryPoints.gs`; the previous helper-file selection is not treated as proof that the entrypoints are absent.

## Active next execution

Use:

`docs/handoffs/0013-knowledge-navigation-defect-instruction.md`

Exact ref:

`11a123e43044ce5e1207cece4610bc8206d44144`

This is Route B: verify the ChatGPT patch, run the repository checks, update the existing synthetic DEV deployment, confirm live Knowledge Search navigation, then complete corrected Matrix D plus Knowledge Export preview / Docs / PDF / clipboard / integrity readback.

If the patched live navigation still fails after deterministic PASS, stop and return to ChatGPT without exploring a second hypothesis.

## Remaining external categories

Do not execute in the active run:

- disposable Shared Drive-specific behavior;
- billing-enabled Gemini / File Search live qualification.

These remain explicit external residual gaps unless separately proven.

If the bounded navigation repair and Matrix E pass, and Matrix D is either PASS or only the allowed private-execution-surface DEFERRED state, Work 0013 may be classified:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

with `BLOCKER: NO`.

Do not claim `PRODUCTION READY` without Shared Drive-specific and Gemini/File Search live evidence.

## Safety and delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data, credentials, private IDs/URLs, source content, or user-specific local paths in GitHub/report/chat.
- No temporary public admin/debug wrapper or blind Windows UI automation.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Do not merge; ChatGPT performs final review.
