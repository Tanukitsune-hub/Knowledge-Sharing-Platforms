# Work 0027 instruction

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-04
BALL: CODEX
STATUS: READY
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

## Strategy reset

The citation blocker and the immediate 429 diagnostic impediment are distinct. The latter does not explain the former. We lack the quota dimension and the successful response's per-field shape. Do not perform another blind generation to rediscover this gap.

CODEX-04 may only recover narrowly scoped retained evidence, retrieve one exact known stored Interaction if available, inspect same-project usage/quota read-only, and identify a compliant future execution route. Availability of stored response/ID is conditional and must not be assumed.

No new generations, Models probes, Stores, uploads, settings, source deliveries, immutable versions, deployments, billing changes or product source repairs. Keep 3.7 as the investigation context; do not call other models.

## Completion

CODEX-04 completes its investigation with the recovered field matrix or explicit unavailability, quota evidence or UNKNOWN, execution-route prerequisite and one cheapest next action. This is not Work acceptance. The exact blocker remains GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH.

Only a later authorized evidence-led repair plus end-to-end qualification can establish QUALIFIED_DISABLED. Keep Gemini disabled/hidden and PR #37 Draft/Open/unmerged. Version 72 remains deployed.

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-04
BALL: CODEX
STATUS: READY
