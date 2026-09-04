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
| 5 | 0027 | Personal-DEV Gemini File Search baseline | ACTIVE | CODEX-02 returned; citation blocker retained | Execute 0027-CODEX-03 citation identity repair on 3.7 only |
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

CODEX-01 final ref `2c6cd20bfe6a4ef3b6262160b4126266307222dd`: resilience/upload repair, 431/431 checks, version-71 shell, upload/index/readback and cleanup PASS; 3.8 query HTTP 500/api_error/68,442ms. Preserve these observed boundaries.

CODEX-02 final ref `0032a9cdb69cc1431566dee82f7e2c2196ddee50`, implementation `acd3aa08a3ecc01a7b0852afef8f58202934af82`: 440/440 checks, 82/82 readback, version-72 shell PASS. 3.7 File Search returned HTTP 200, expected token and one citation; attempts 2/retries 1; 34,992ms. Strict source/metadata match failed. 3.6 correctly NOT_RUN. Cleanup confirmed. Gemini remains disabled/hidden.

```text
CURRENT_DISPATCH: 0027-CODEX-03
BALL: CODEX
STATUS: READY
WORK_ACCEPTANCE: NOT_MET
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
MODEL: gemini-3.7-flash / low / 2048
PR_37: Draft / Open / unmerged
```

Scope: explain actual field mismatch, preserve a sanitized observed-shape fixture, repair shared Gemini identity mapping, confirm once in personal DEV. No 3.6/3.8/GenerateContent call or general model campaign. Latest bounded authorization is in `docs/handoffs/0027-CODEX-03-citation-identity-repair-instruction.md`; previous Dispatch budgets have expired.

Only a correctly grounded `QUALIFIED_DISABLED` result with cleanup meets current Work acceptance. CI absence is FIX SOON, not a blocker by itself. Accepted reference behavior in personal DEV is not proof of company readiness.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up. Update this registry on meaningful Work/priority changes; do not renumber history.
