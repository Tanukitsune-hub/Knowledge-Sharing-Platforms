# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned design/diagnosis; bounded Codex implementation and authenticated DEV verification`.

Recommended Codex model: `Luna Max`.

## Current state

Accepted completed evidence:

- Pitchbook Date repair: PASS.
- Pitchbook status-parser repair: PASS.
- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: `1 / 5 / 10 / 15 / 20 / 25 MiB`: live PASS.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS.
- Work 0012 public-surface hardening: deterministic PASS.
- First top-level Knowledge navigation repair (`form target=_top`): deterministic PASS, live FAIL.
- Second top-level Knowledge navigation repair (`a target=_top`): deterministic PASS, live FAIL on DEV version 20.
- Direct deployed `?page=knowledge`: live PASS; Knowledge Search and Knowledge Export visibly render.
- Action-URL comparison: `NOT SAFELY OBSERVABLE`; no URL mismatch was inferred.

Current classification:

`NOT QUALIFIED — TOP-LEVEL KNOWLEDGE NAVIGATION PATH REMAINS UNRELIABLE`

`BLOCKER: YES`

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, direct-route proof, action-URL comparison, or either failed top-level navigation variant.

## ChatGPT design decision

Normal user access to Knowledge Search will no longer perform top-level Web App/browser navigation.

Knowledge Search is to be integrated as another page inside the existing `Index.html` document and switched with the existing `showPage()` mechanism already used for Meeting, Pitchbook, Past records, and Master management.

The direct `?page=knowledge` route may remain as a secondary/backward-compatible standalone entrypoint, but normal product use must not depend on it.

This reuses the application's already-proven page-switching architecture and removes the repeatedly failing navigation dependency rather than trying a third link/URL mechanism.

## Active next execution

Use:

`docs/handoffs/0013-inline-knowledge-page-integration-instruction.md`

Handoff commit:

`bdf2514a04afad55d1957b2f5f277911afb8364f`

Codex must read all applicable AGENTS.md / AGENTS.override.md files and follow the repository-specific mandatory subagent policy.

The run implements only the bounded same-document integration, adds production-faithful regression coverage, runs focused/full deterministic validation, deploys to the existing synthetic DEV Web App, and performs one integrated navigation confirmation.

If integrated navigation passes, continue in the same run to corrected Matrix D and Matrix E Knowledge Export preview / Docs / PDF / clipboard / integrity readback.

If integrated navigation still fails after deterministic PASS, stop and return to ChatGPT. Do not try another navigation mechanism.

## Matrix D correction retained

Actual private administrator entrypoints:

- `src/99_EntryPoints.gs`: `getInstallationStatus_()`, `validateInstallation_()`, `setupKnowledgePlatform_()`;
- `src/170_AiEntryPoints.gs`: `runAiSyncWorker_()`.

If the exact private functions cannot be safely invoked/observed from the Apps Script editor, `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION` remains an allowed non-blocking classification. Do not expose them publicly.

## Residual external categories

Do not execute in the active run:

- Shared Drive-specific qualification;
- billing-enabled Gemini / File Search qualification.

These remain explicit external residual gaps.

If integrated navigation and Matrix E pass, and Matrix D is PASS or only the allowed private-execution-surface deferral, Work 0013 may be classified:

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
