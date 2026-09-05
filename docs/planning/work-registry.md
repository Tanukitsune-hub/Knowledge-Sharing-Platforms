# Work Registry and Delivery Order

Current as of: 2026-09-05
Status: Active planning source of truth

## Purpose and identity rules

Work IDs identify stable outcomes, not execution order. Never renumber or reuse an issued ID. Keep the same Work through implementation, qualification, repair and PR convergence while its outcome remains unchanged. Give each new Codex execution a new Dispatch ID. Normally only one Work is active for implementation. Current ball is authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

Statuses: ACCEPTED (closed/merged evidence), ACTIVE (current implementation), READY (planned next), PLANNED, DEFERRED, BLOCKED, SUPERSEDED. An ACTIVE repair may retain an explicit acceptance blocker; ACTIVE never implies accepted or operational.

## Current delivery sequence

| Order | Work ID | Outcome | Status | Dependency | Next action |
|---:|---|---|---|---|---|
| 0 | 0020 | Provider core, OpenAI File Search, citations, lifecycle, full output | ACCEPTED | — | Preserve accepted evidence |
| 1 | 0025 | Administrator model/thinking policy | ACCEPTED | 0020 | Preserve exact tuple policy |
| 2 | 0021 | Structured search, five modes, multi-Entity, six formats | ACCEPTED | 0025 | Preserve PR #34 and version-66 evidence |
| 3 | 0023 | Deterministic single-file bundle and installer | ACCEPTED | 0021 | Preserve PR #35 and installer security |
| 4 | 0026 | Current Gemini API requalification and fail-closed safety | ACCEPTED | 0023 | Preserve PR #36; coarse failure is historical only |
| 5 | 0027 | Personal-DEV Gemini File Search baseline | ACTIVE | Citation blocker retained; evidence recovered | Prepare CODEX-05 exact resolver repair and one guarded confirmation |
| 6 | Unassigned future Work | Representative large-file qualification/recovery | DEFERRED | Small synthetic provider path qualified | Allocate separate Work |
| 7 | Unassigned future Work | Historical-material migration | PLANNED | Provider/installer stable | Select approach from actual corpus |
| 8 | Unassigned future Work | Final company qualification and rollout | PLANNED | Company credentials, Shared Drive, permissions, migration ready | Qualify approved company environment/providers |

## Accepted boundaries

### Work 0021

PR #34 merge `533c849bd1229827ec77cd5ad6506312ea286940`; private version 66. Core filters/five modes, multi-Entity/advanced filters, OpenAI six-format matrix 6/6, EML attachment boundary and FULL_OUTPUT six-format reference parity PASS. Logic 376/376. Blocker NONE.

Version 67 is unused and must never be deployed.

### Work 0023

PR #35 merge `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`. Modular sources preserved; deterministic bundle, one-paste installation, hashes/manifest, owner latch, cross-user takeover rejection, deployment attestation, URL-only READY rejection and mutable-global collision gate PASS. Personal-DEV install/upgrade PASS, duplicates 0, logic 402/402. Company Shared Drive/domain-user qualification is still a later gate.

### Work 0026

PR #36 merge `40bb7d40506c0839c35742ee0000d89650ff7ad6`. Version 70 shell and 82/82 readback PASS; exact DOC-000017/MTG-000005 Gemini documents one each, duplicates zero. Unknown/application failure not relabeled external. Historical 3.8/low/2048 Interactions result `HTTP_OR_CREDENTIAL_FAILURE`; Gemini hidden/disabled; OpenAI preserved; logic 420/420. Work remains ACCEPTED for its actual safety outcome, not successful Gemini search.

Later company-GAS diagnostics proved basic connectivity, authentication and short Interactions in the tested environment. Do not generalize the historical coarse class into universal credential/network failure.

## Work 0027 evidence and current action

CODEX-01 final ref `2c6cd20bfe6a4ef3b6262160b4126266307222dd`: resilience/upload repair, 431/431 checks, version-71 shell, upload/index/readback and cleanup PASS; 3.8 query HTTP 500/api_error/68442ms. Preserve these observed boundaries.

CODEX-02 final ref `0032a9cdb69cc1431566dee82f7e2c2196ddee50`, implementation `acd3aa08a3ecc01a7b0852afef8f58202934af82`: 440/440 checks, 82/82 readback, version-72 shell PASS. 3.7 File Search returned HTTP 200, expected token and one citation; attempts 2/retries 1; 34992ms. Strict source/metadata match failed. 3.6 correctly NOT_RUN. Cleanup confirmed. Gemini remains disabled/hidden.

CODEX-03 final ref `745e34d8a04df4aaea8a9373775106b4b08b4523`: diagnostic HTTP 429/too_many_requests before citation, attempts 2/retries 1, sleep 514ms, latency 21825ms. No product source repair, version or deployment. Cleanup and source restoration 82/82 reported. Temporary invocation-path modification was noncompliant, removed and excluded from qualification evidence.

```text
CURRENT_DISPATCH: 0027-CODEX-04 / RETURNED
MODE: INVESTIGATION
BALL: CHATGPT
STATUS: RETURNED
WORK_ACCEPTANCE: NOT_MET
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
RECOVERED_MISMATCH: SOURCE_CONTENT_IS_NOT_PROVIDER_DOCUMENT_IDENTITY
CODEX_03_429_QUOTA_CATEGORY: UNKNOWN
MODEL_CONTEXT: gemini-3.7-flash / low / 2048
NEW_GENERATION_AND_RUNTIME_MUTATIONS_AUTHORIZED: 0
PR_37: Draft / Open / unmerged
```

CODEX-04 recovered the exact stored CODEX-02 response and confirmed `source` is content text, `document_uri` is the Store, and exact metadata is present. Same-project last-hour quota showed headroom, while the earlier 429 category/reset remains UNKNOWN. The normal guarded Web App administrator route is available. No generation, Store, source, version, deployment, billing or credential mutation occurred. See the CODEX-04 report and sanitized fixture. Prior budgets remain expired; any continuation is CODEX-05.

Only a correctly grounded QUALIFIED_DISABLED result with cleanup meets Work acceptance. A read-only investigation result does not qualify Gemini. CI absence is FIX SOON, not a blocker by itself. Personal-DEV reference behavior is not company readiness.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up. Update this registry on meaningful Work/priority changes; do not renumber history.
