# Work 0027 — CODEX-04 evidence recovery and quota preflight

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-04
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION

## Work contract and strategy reset

Work outcome is unchanged: a personal-DEV Gemini File Search answer with an authoritative, current source citation, before company qualification. Work acceptance is NOT_MET. This dispatch does not authorize another generation campaign or attempt to declare Gemini qualified.

Dispatch outcome: recover the already-observed CODEX-02 citation shape if possible, identify the tested project's actual quota constraint or explicitly record what is unavailable, and identify a compliant diagnostic invocation path. Deliver the evidence needed to decide the smallest next repair/capture rather than spending another generation budget blind.

Fastest safe decisive action: inspect narrowly scoped retained execution artifacts for the known CODEX-02 synthetic response or its exact Interaction ID. If available and still retained, retrieve that same Interaction read-only. Independently inspect the same personal-DEV project's usage/rate-limit settings, without changing them.

Active hypothesis: existing retained evidence or a stored Interaction may identify the actual field mismatch without generating again. This is unproven. No stored-response availability, quota dimension, or citation repair is assumed.

## Starting state and authority

Repository: Tanukitsune-hub/Knowledge-Sharing-Platforms
Branch: agent/0027-gemini-file-search-resilience
PR: #37 / Draft / Open / unmerged
Reviewed main: 8c9be2392a1247ff81efc6a153fc0be449b1318b
Reviewed CODEX-03 head: 745e34d8a04df4aaea8a9373775106b4b08b4523

Read root/nearest AGENTS, current dispatch ledger, this instruction, CODEX-02 and CODEX-03 reports, Work report/plan and runtime locator. Verify latest GitHub state; do not reset or discard newer work. Prior CODEX-03 generation, staging and version budgets have expired and are not inherited.

Closed evidence:
- CODEX-02: 3.7 File Search HTTP 200, expected token, one file_citation; aggregate identity/metadata mismatch; exact failing field unknown.
- CODEX-03: HTTP 429/too_many_requests, two attempts, one retry, 514ms cumulative sleep, 21825ms; no citation; no repair.
- CODEX-03 report discloses a prohibited temporary invocation-path modification. Do not count that invocation as qualification evidence or repeat it. Restoration was reported 82/82 with zero differences; deployment stayed at version 72.
- Existing source/index, OpenAI/FULL_OUTPUT and cleanup evidence remain valid for what was observed. Do not reopen or replay the previous campaigns.

## 1. Read-only evidence recovery

Inspect only existing artifacts of this Work in the known local workspace/execution context. No drive-wide search, unrelated account access, transcript dumping, secret printing or raw response export. Do not inspect private reasoning; only previously produced execution evidence.

If the exact CODEX-02 response is retained, analyze it locally in memory. If its exact Interaction ID is retained but not the response, use the documented interactions.get route with already-authorized credentials for the same project. Do not invent IDs, enumerate account history, recreate the deleted Store, or assume a list-Interactions API exists.

Google currently documents default stored Interactions, free-tier retention of 1 day and paid-tier retention of 55 days. These are conditional on storage, retention and access; an ID and matching project are still needed. AI Studio Interaction logs are documented for paid projects; do not assume the free project's UI exposes them. Paid logs, if already available, may be read only for the known synthetic request/time window. Do not enable logging, extend retention, export datasets, change billing, or upgrade a tier.

Recover the original upload/readback reference alongside the response if available. If only annotation shape is recoverable, mark identity comparisons requiring the missing original reference UNKNOWN. Never reconstruct missing observed values from expected fixture data and call that evidence.

Project actual values to a small sanitized fixture/field matrix only: original key names and types, source/document_uri locator category, equality relationships, presence and match flags for source_type/source_id/content_hash, and ambiguity/conflict flags. Replace all resource values and source text with deterministic fictitious values; preserve only the relationships actually observed. Do not persist original IDs, URLs, response body, question, token or credentials in GitHub/chat/Audit. A recovered old response is diagnostic evidence, not a new runtime PASS or proof that deleted resources exist.

## 2. Quota preflight without a model call

Use the existing authenticated personal account and the same API project as the failing Work runtime. Check AI Studio usage/rate-limit views read-only. Prefer exact current metrics and observation time over a peak-history display. Check whether a separate diagnostic uses the same project; do not inspect or change unrelated applications.

Record only approved non-sensitive values: matching-project-confirmed boolean, tier, model, observed timestamp, quota category RPM/TPM/RPD/OTHER/UNKNOWN, limit and usage if visible, metric time window, and retry/reset timing if explicitly available. Project name/number, key, URLs, and billing details stay private.

Inspect retained 429 structured evidence if available. Retry-After, retryDelay and quota-violation data may identify a wait condition; they are not guaranteed. Allowlist metric categories/durations and discard raw messages, project references and arbitrary metadata. The reported too_many_requests string alone does not distinguish minute limits, daily limits or provider-side throttling.

Do not claim that 514ms backoff exhausted a minute/day limit, that a new key fixes a project quota, or that payment guarantees a fix. If the metric remains unknown, say UNKNOWN and specify the minimal missing evidence. Do not probe quota with a new generation, Models call, embedding or Store operation.

## 3. Compliant next execution route

Read the existing administrator facade and authorization contract only as needed to describe a future compliant route. Do not invoke an action that generates, uploads, creates a Store, changes settings or triggers qualification.

No monkey-patching, temporary branches inside installer/readiness handlers, replacement of getActor/isAdministrator, authorization bypass, new public wrapper, or use of deployment-owner identity as caller authorization. Missing editor visibility or an administrator-latch refusal is an execution-path limitation, not permission to bypass it.

If browser login/consent is required, request the smallest native user action using BALL: USER / STATUS: ACTION_REQUIRED and keep this Dispatch ID while the same run is paused. Never ask for credentials, resource IDs or private URLs in chat. If an approved route is unavailable, record EXECUTION_PATH_BLOCKED.

## Bounds and prohibited actions

- Local retained-evidence search: <=10 minutes, then report unavailable rather than broaden.
- At most one exact known Interaction retrieval, <=2 HTTP attempts total; retry only a transient read failure within 20 seconds of cumulative wait and honor Retry-After. A longer requested delay causes a safe stop; do not retry early.
- Usage/quota UI: one inspection and at most one refresh; no polling loop or hours-long wait.
- New generation/qualification/Models/embedding requests: 0.
- New or modified Stores/documents/provider settings: 0; no cleanup is needed because no resources may be created.
- Apps Script source staging/delivery, immutable versions, deployments and runtime mutations: 0. Version 72 stays deployed; version 67 remains prohibited.
- OpenAI/FULL_OUTPUT calls, model switching, account/key rotation, billing or security-setting changes: 0.
- Product src/, tests/, dist/, workflows and AGENTS changes: 0. Do not regenerate bundles merely to update provenance for this evidence-only dispatch.

Authorized GitHub writes: this dispatch report, current ledger/Work report, narrowly necessary status updates and at most one sanitized evidence fixture under docs/handoffs/. No new infrastructure or diagnostic application.

## Evidence, validation and completion

Evidence hierarchy: actual stored synthetic response and matching upload snapshot; actual quota/error metadata from the tested project; code/API contract; inference. Label unavailable/unknown/not-run separately. A schema example is not an observed response.

Report: recovered evidence availability and provenance, actual mismatching fields or UNKNOWN, sanitized fixture path if justified, quota type/limit/usage/wait condition or UNKNOWN, compliant invocation route or blocker, zero-mutation confirmation and the cheapest next decisive action. If recovery failed, deliver an explicit quota-aware capture plan, not another unauthorized run.

Validate any sanitized JSON and diff/privacy hygiene. With no product changes, preserve the prior 440/440 and 27/27 as reported historical results; do not claim fresh product test/runtime PASS. Run only repository-required documentation checks and report exactly what ran.

Dispatch may return EVIDENCE_RECOVERED, CAPTURE_PRECONDITIONS_IDENTIFIED, or EVIDENCE_UNAVAILABLE. These are investigation outcomes, not Work acceptance. Work blocker GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH remains until a later authorized repair and end-to-end qualification succeeds.

Stop when the bounded evidence inventory and one actionable next decision are delivered. Do not turn this into a second diagnostic campaign. Keep PR #37 Draft/Open/unmerged; do not merge. Commit/push and update the ledger. Any subsequent execution after return uses CODEX-05, not CODEX-04 again.

## Official references checked by controller on 2026-09-05

- https://ai.google.dev/gemini-api/docs/rate-limits — project/model quota dimensions; current limits in AI Studio; RPD reset at midnight Pacific time.
- https://ai.google.dev/gemini-api/docs/interactions-overview — stored Interactions, retrieval and conditional retention; paid-project Logs availability.
- https://ai.google.dev/api/interactions-api-v1 — retrieve by ID; separate file-citation fields.

## Return identity

Begin and end the final report/chat with:

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
