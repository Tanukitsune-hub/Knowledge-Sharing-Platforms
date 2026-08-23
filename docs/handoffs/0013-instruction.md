# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-owned diagnosis / coordination; bounded authenticated DEV qualification by Codex`.

Recommended Codex model: `Luna Max` for the remaining Matrix D/E qualification.

## Current state

The Web App recovery incident is closed.

Accepted live evidence:

- project identity: `PROJECT_IDENTITY_CONFIRMED`;
- installation-state / source-family / continuity / uniqueness: PASS;
- remote Apps Script source: `REMOTE_SOURCE_CURRENT`;
- single-account editor context: confirmed;
- exactly one versioned synthetic DEV deployment was created as `Web app`;
- execute-as: deploying user;
- access: `Only myself`;
- versioned `/exec`: PASS — normal main page rendered;
- integrated navigation: `PASS — USER-ASSISTED LIVE CONFIRMATION`;
- the user manually verified `ナレッジ検索 -> 面談記録 -> ナレッジ検索` on the recovered `/exec` using normal clicks with same-document switching;
- no authoritative mutation was observed during recovery/navigation.

Codex's earlier `INTEGRATED_NAVIGATION_NOT_SAFELY_OBSERVABLE` result reflected only its browser selector limitation. It is superseded by the user's direct live browser confirmation.

Web App recovery classification:

`DEV VERSIONED WEB APP RESTORED — MATRIX D/E READY`

Web App recovery blocker: `NO`.

Work 0013 overall remains `BLOCKER: YES` only because Matrix D/E have not yet completed.

Detailed recovery report:

`docs/handoffs/0013-fast-versioned-web-app-recovery-report.md`

## Accepted completed evidence — do not rerun

- Pitchbook Date repair: PASS.
- Pitchbook status-parser repair: PASS.
- Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C: `1 / 5 / 10 / 15 / 20 / 25 MiB`: live PASS.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS.
- Work 0012 public-surface hardening: deterministic PASS.
- Inline Knowledge Search implementation: focused `36/36 PASS`.
- `npm run check` / `npm run test`: `160/160 PASS`.
- Apps Script source / HTML / manifest / public-surface validation: PASS.
- versioned `/exec` recovery and integrated same-document navigation: live PASS.

Do not rerun or reopen:

- project identity reconstruction;
- remote source comparison;
- `/dev` diagnosis;
- Library/Web App deployment diagnosis;
- versioned `/exec` recovery;
- Knowledge Search navigation mechanisms;
- Matrix A/B/C;
- upload sizing;
- parser diagnosis.

Do not create another Web App deployment unless new contradictory evidence proves the recovered `/exec` unusable.

## Active execution

Resume only the final non-AI DEV qualification using:

`docs/handoffs/0013-non-ai-final-live-qualification-instruction.md`

The remaining outcome is:

1. Matrix D — post-hardening private administrator path; and
2. Matrix E — Gemini-independent Knowledge Export preview / Google Docs / PDF / clipboard / final integrity readback.

The recovered versioned `/exec` is the accepted normal DEV Web App entrypoint. Do not ask the user to re-prove normal navigation before Matrix E.

## Matrix D correction

Use the actual private administrator entrypoints:

- `src/99_EntryPoints.gs`: `getInstallationStatus_()`, `validateInstallation_()`, `setupKnowledgePlatform_()`;
- `src/170_AiEntryPoints.gs`: `runAiSyncWorker_()`.

If these private functions cannot be safely invoked with observable return values without changing source/deployment/public exposure, classify:

`DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`

and continue Matrix E. This alone is non-blocking.

Do not expose private functions publicly.

## Remaining external categories

Do not execute in Work 0013 final non-AI qualification:

- Shared Drive-specific qualification;
- billing-enabled Gemini / File Search qualification.

They remain explicit residual external gaps.

If Matrix E passes, Matrix D is PASS or only the allowed private-execution-surface DEFERRED state, and no implementation blocker remains, classify:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

with `BLOCKER: NO`.

Do not claim `PRODUCTION READY` while Shared Drive and Gemini/File Search live qualification remain deferred.

## Durable recurrence prevention

Apps Script deployment/recovery work must follow:

`docs/operations/apps-script-web-app-deployment.md`

The Work 0013 incident lessons are also enforced by `docs/handoffs/AGENTS.md`.

Do not reopen deployment/source hypotheses without new material evidence.

## Safety / delivery

- DEV only; synthetic/anonymized data only.
- No production deployment/data or confidential source material.
- No credentials, raw IDs/URLs, account addresses, tokens, cookies, or user-specific local paths in GitHub/report/chat.
- Application source, tests, manifest, navigation, setup logic, schema, limits, Knowledge Export logic, and AI/File Search logic remain frozen during qualification-only execution.
- Continue on `agent/0013-consolidated-dev-live-qualification` and Draft PR #11.
- Keep PR Draft / Open / unmerged.
- Do not merge; ChatGPT performs final review.
