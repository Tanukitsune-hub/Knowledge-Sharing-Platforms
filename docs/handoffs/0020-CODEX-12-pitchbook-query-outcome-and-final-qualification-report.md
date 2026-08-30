# Work 0020 CODEX-12 — Pitchbook query outcome and final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-12`
STATUS: `RETURNED / BLOCKER`
MODE: `INVESTIGATION -> QUALIFICATION`
ROUTE: `C`

## Final classification

```text
PITCHBOOK_EXISTING_QUERY_OUTCOME: TIMEOUT
PITCHBOOK_EXISTING_QUERY_CLASS: C — synchronous query-path / Apps Script runtime termination
PITCHBOOK_FINAL_QUERY_OUTCOME: TIMEOUT
LOGIC_VALIDATION: PASS
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: BLOCKED
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence; not rerun
FINAL_INTEGRITY: PARTIAL
READY: NO
BLOCKER: YES
```

The original CODEX-11 Pitchbook query was terminated at the Apps Script
maximum-execution-time boundary after `360.804` seconds. It had no normal
`AI_QUERY` Audit outcome. The committed pre-repair path used a synchronous
Gemini Interactions request, so this was classified as Outcome C.

The one authorized post-repair Pitchbook query was then submitted after the
background-Interaction repair and returned the safe application error
`AI_QUERY_TIMEOUT`. It produced one redacted Pitchbook `AI_QUERY` failure
Audit row with no citation. Per the handoff, no retry or competing hypothesis
was opened.

## Read-only classification before the final query

- Before the final query, Restricted Audit contained no Pitchbook `AI_QUERY`
  row from the original invocation.
- The matching Apps Script history showed one `searchKnowledge` execution with
  status `タイムアウト`, duration `360.804 秒`, and the safe class
  `Apps Script maximum execution time`.
- The successful Meeting query remained closed evidence; no second Pitchbook
  query had occurred before the authorized final attempt.
- The existing Indexed synthetic Pitchbook and the two reconciled Meeting
  provider states were unchanged.

## Deterministic repair evidence

- The pre-fix production request-shape probe reproduced a synchronous
  `POST /interactions` with no `background` field.
- The minimal repair adds Gemini-only background Interaction creation,
  bounded status polling, safe provider-failure handling, and a safe bounded
  timeout. Existing parsing, citations, Store, metadata filters, OpenAI
  behavior, and public surfaces remain unchanged.
- Focused provider/query validation: `43/43 PASS`.
- `npm run check`: `294/294 PASS`.
- Temporal validation, public-surface validation, and `git diff --check`:
  `PASS`; public facade remains `30`.
- Tests cover immediate completion, `in_progress -> completed`, provider
  failure redaction, and the bounded polling deadline.

## Delivery evidence

- The exact tested application source was synchronized once as `78/78`
  application files and read back as an exact match.
- Exactly one immutable Apps Script version was created: version `51`.
- The positively identified existing private Web App was updated in place from
  version `50` to version `51`.
- Deployment inventory remained `9`; the target remained a Web App executing
  as the deploying user with access restricted to only the owner. No Library
  deployment was changed and no second Web App was created.

## Final query evidence

- The existing private `/exec` rendered version `51` and the synthetic
  Pitchbook source filter was selected.
- Exactly one authorized final Pitchbook query was submitted.
- The Web App returned `Gemini検索が時間内に完了しませんでした。`.
- Apps Script history recorded the corresponding `searchKnowledge` execution as
  `完了` with duration `134.96 秒`; the application-level failure was returned
  safely rather than as a provider payload.
- Restricted Audit readback recorded one new Pitchbook `AI_QUERY` with
  `Result=Failure`, `Error_Code=AI_QUERY_TIMEOUT`, and zero citations.
- No Gemini HTTP status/body, credential, Store ID, provider document ID,
  upload URL, source body, or raw provider payload was exposed.

## State and integrity readback at stop

- Backend remains exactly five sheets with schema `6` and timezone
  `Asia/Tokyo`.
- `Meeting_Index` remains `4` Active rows; the two reconciled rows remain
  Gemini `Indexed`. No Meeting row or authoritative content changed.
- `Pitchbook_Index` remains `16` rows; the existing synthetic Indexed TXT
  Pitchbook remains the single current Gemini Indexed source. No Pitchbook row
  or authoritative source content changed.
- Audit contains `73` non-empty rows and `6` `AI_QUERY` rows, including the one
  expected final safe timeout outcome.
- Settings remain `AI_SYNC_BATCH_SIZE=10`, `AI_SYNC_ENABLED=false`,
  `GEMINI_ENABLED=true`, and `OPENAI_ENABLED=false`.
- No OpenAI call, FULL_OUTPUT rerun, broad sync, Store creation, trigger,
  permission, or Library mutation occurred.

The exact metadata-filter and update/Inactive/Reactivate/delete-rebuild
lifecycle gates were not run because the handoff requires stopping at the
first new provider/runtime failure after actual application execution.

## Stop decision

Do not retry the final Pitchbook query, run the lifecycle, reset provider
failure state, create another Store or deployment, call OpenAI, or rerun
FULL_OUTPUT under this dispatch. A fresh strategy/reset is required before any
further Gemini runtime investigation.

GITHUB_CI_ACTUALLY_RAN: `NO` — no GitHub Actions workflow or commit status
was present for the delivered commit.

FINAL_COMMIT: `recorded in the delivery response`
