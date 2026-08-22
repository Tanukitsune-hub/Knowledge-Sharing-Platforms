# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-led diagnosis / bounded edit; Codex authenticated DEV execution and verification`.

Recommended Codex model: `Luna Max`.

## Latest execution state (2026-08-23)

Anchor repair deterministic evidence: focused `1/1 PASS`; `npm run check` and `npm run test`
`159/159 PASS`; Apps Script / HTML / manifest validation PASS; public surface `23 public / 360
private`; `git diff --check` PASS; existing synthetic DEV source push `58 files PASS`; existing
Work 0013 Web App deployment updated to version `20`.

The user opened the normal synthetic DEV page and clicked `ナレッジ検索` exactly once. The user
reported `白画面またはエラー` remained, so the required Knowledge Search heading and Export
section were not confirmed as rendered.

Current classification:

`NOT QUALIFIED — ANCHOR NAVIGATION STILL FAILS`

`BLOCKER: YES`

Corrected Matrix D and Matrix E were not started. No retry, refresh, alternate URL, direct-route
proof, action-URL comparison, third navigation hypothesis, browser workaround, Shared Drive, or
Gemini/File Search work was performed in the current run.

The current run is complete at the first post-anchor live defect. The detailed evidence is in
`docs/handoffs/0013-report.md` and
`docs/handoffs/0013-non-ai-final-live-qualification-report.md`.

## Previous state before anchor repair

Accepted completed evidence:

- Pitchbook Date repair: PASS.
- Pitchbook status-parser repair: PASS.
- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: `1 / 5 / 10 / 15 / 20 / 25 MiB`: live PASS.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS.
- Work 0012 public-surface hardening: deterministic PASS.
- First navigation repair: deterministic focused `1/1` and full `159/159` PASS, but live normal navigation FAIL.
- DEV version 19 direct `?page=knowledge`: PASS; Knowledge Search and Knowledge Export render normally.
- Navigation action URL comparison: `NOT SAFELY OBSERVABLE`; no URL mismatch was inferred.

Current classification:

`NOT QUALIFIED — NORMAL NAVIGATION CONTROL DEFECT REMAINS`

`BLOCKER: YES`

## ChatGPT second bounded repair

The route/render layer is proven live-good. The remaining failing control after the first repair was a top-level HTML `<form>` submission.

ChatGPT has replaced that form-based navigation with the Apps Script HTML Service documented pattern: explicit `<a>` links using `target="_top"`.

Changed only:

- `src/90_WebApp.gs`;
- `tests/webapp-navigation.test.cjs`.

Repair commits:

- `6a7dd8544b85b2fa415d79bcc2c6f16cccf871a8`;
- `e7a7ea065daa2f9bac7920c4c7eea9b9303ba852`.

No data, export, AI, limit, storage, public-facade, manifest, or architecture contract changed.

## Active next execution

Use:

`docs/handoffs/0013-navigation-anchor-repair-instruction.md`

Handoff commit:

`100385bd8dc2601d75dbf97ab36add977c72e6aa`

Codex must verify the anchor patch, run focused/full local checks, deploy it to the existing synthetic DEV Web App, and ask the user for exactly one normal `ナレッジ検索` click.

If the normal click still fails after deterministic PASS, stop immediately and return to ChatGPT. Do not pursue a third navigation hypothesis.

If the normal click passes, continue in the same bounded run to:

- corrected Matrix D using the actual private entrypoints in `99_EntryPoints.gs` / `170_AiEntryPoints.gs`;
- Matrix E Knowledge Export preview, Google Docs, PDF, clipboard, and integrity readback.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, direct-route proof, or action-URL comparison.

## Residual external categories

Do not execute in the active run:

- Shared Drive-specific qualification;
- billing-enabled Gemini / File Search qualification.

These remain explicit external residual gaps.

If anchor navigation and Matrix E pass, and Matrix D is PASS or only the allowed private-execution-surface DEFERRED state, Work 0013 may be classified:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

with `BLOCKER: NO`.

Do not claim `PRODUCTION READY` while Shared Drive/Gemini live qualification remains deferred.

## Safety / delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data or confidential source material.
- No credentials, private IDs/URLs, tokens, cookies, or user-specific local paths in GitHub/report/chat.
- No temporary public admin/debug wrapper or blind Windows UI automation.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Do not merge; ChatGPT performs final review.
