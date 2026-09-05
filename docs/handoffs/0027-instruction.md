# Work 0027 instruction

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION

## Primary outcome

Make personal-DEV Gemini File Search return an answer with an authoritative current source citation before company qualification. CODEX-02 already returned a 3.7 answer and one file_citation, but identity/metadata matching failed. This Work is not accepted.

## Current execution contract

`docs/handoffs/0027-CODEX-04-evidence-recovery-and-quota-preflight-instruction.md`

Current ball: `docs/handoffs/0027-dispatches.md`.
Current result: `docs/handoffs/0027-report.md`.

Read root/nearest AGENTS, CODEX-02/03 reports, Work plan and runtime locator. CODEX-04 replaces the expired CODEX-03 execution authority; it does not inherit unused generation, staging or version budgets.

## Preserved evidence

- Work 0026 remains accepted for its observed safety boundary, not successful Gemini search.
- CODEX-01 transport/retry/upload and cleanup evidence is retained.
- CODEX-02: reported 440/440 checks, 82/82 readback, version-72 shell PASS; 3.7 HTTP 200 with token and one citation; strict identity/metadata FAIL; 3.6 not called; cleanup PASS.
- CODEX-03: HTTP 429/too_many_requests, attempts 2/retry 1, cumulative sleep 514ms, latency 21825ms; no citation shape, implementation or deployment; source restoration reported 82/82.
- CODEX-03's temporary invocation modification violated its instruction and is not acceptance evidence. Do not repeat it.

## Returned investigation result

The exact CODEX-02 response was recovered from the same-project AI Studio Interaction log. `source` is content text, `document_uri` is the requested Store, and exact `source_type`, `source_id` and `content_hash` are in `custom_metadata`. This establishes that the qualification matcher's `citation.source === documentValue.name` condition is the mismatch. The original upload/readback Document name itself was not retained and was not reconstructed.

Same-project AI Studio quota showed Free tier and current last-hour headroom, while its 28-day view contained a historical RPM peak above the limit. The exact quota category behind CODEX-03's 429 remains UNKNOWN because no Retry-After, quota metric or reset value was retained.

The compliant future route is the existing version-72 private Web App's enabled administrator `接続・File Search確認` action through the guarded facade. It was observed but not invoked. No monkey-patch or latch bypass is needed.

## Completion

CODEX-04 completed with `EVIDENCE_RECOVERED`, zero generation/runtime mutation, and the sanitized fixture/report. This is not Work acceptance. The exact blocker remains `GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH` until an authorized CODEX-05 repair and bounded qualification pass.

Only a later authorized evidence-led repair plus end-to-end qualification can establish QUALIFIED_DISABLED. Keep Gemini disabled/hidden and PR #37 Draft/Open/unmerged. Version 72 remains deployed.

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
