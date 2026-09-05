# Work 0027 dispatch control

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CODEX
STATUS: READY
MODE: BUILD

## Current dispatch — evidence-led repair

`0027-CODEX-05` — shared strict Store/metadata citation resolver and one guarded 3.7 confirmation.

Instruction: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-instruction.md`
Report: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-report.md`

Strategy reset from INVESTIGATION to BUILD: CODEX-04 recovered the required citation representation. No new diagnosis or model selection campaign is needed. source is content, document_uri is the Store, and exact custom metadata must resolve through trusted current source/document context. Shared qualification/normal mapping must reject conflicting, stale, inactive, wrong-Store or ambiguous identities.

```text
REVIEWED_CODEX_04_FINAL: 18226013d6f98a5cb2bffdf72ced52e766a8b698
MODEL: gemini-3.7-flash / low / 2048 / Interactions + File Search
CURRENT_RUNTIME: version 72
CODEX_05_IMPLEMENTATION_AND_RUNTIME: NOT_RUN
WORK_ACCEPTANCE: NOT_MET
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
GEMINI: disabled / hidden
```

## CODEX-05 authorization

The detailed instruction is authoritative. One shared resolver repair, one logical File Search confirmation (<=2 generation HTTP attempts under existing replay/wait safeguards), one temporary Store/TXT, exact cleanup confirmation. No short generation, Models, other model, GenerateContent, OpenAI or FULL_OUTPUT live calls. No existing Store/business-source mutation. Fresh quota inspection is not a probe or permission to change billing/key. One final source delivery/readback, at most version 73 and one update of the same private Web App (72 -> 73); never deploy 67 or create 74+. No temporary diagnostic staging, handler interception or administrator-latch bypass.

Only a live, independently bound QUALIFIED_DISABLED result meets Work acceptance. Tested code may be delivered with runtime confirmation pending if quota/authorization prevents the one confirmation; do not claim acceptance or discard useful tested repairs.

## Returned dispatch history

### 0027-CODEX-04 — RETURNED / EVIDENCE_RECOVERED

Final: `18226013d6f98a5cb2bffdf72ced52e766a8b698`.

Stored CODEX-02 response inspected in place; source CONTENT_TEXT, document_uri requested STORE, exact custom_metadata present, three equivalent raw annotations / one normalized citation. Original upload/readback Document name UNAVAILABLE. No generation, provider/resource/source/version/deployment/key/billing mutation. JSON/foundation/privacy/diff checks reported PASS. Guarded administrator Web App route available but not invoked. Free-tier quota snapshot at 2026-09-05 11:05 JST: RPM 3/5, TPM 394/250000, RPD 3/20. Earlier 429 category/reset UNKNOWN; snapshot is not current authorization or a capacity guarantee.

Report: `docs/handoffs/0027-CODEX-04-evidence-recovery-and-quota-preflight-report.md`.
Fixture: `docs/handoffs/0027-CODEX-04-sanitized-citation-shape.json`.

### 0027-CODEX-03 — RETURNED / diagnostic blocked before citation

Final: `745e34d8a04df4aaea8a9373775106b4b08b4523`. HTTP 429/too_many_requests, attempts 2/retry 1, sleep 514ms, latency 21825ms. No citation or repair/version/deployment. Temporary cleanup and mutable-source restoration 82/82 reported. A noncompliant temporary invocation-path modification was removed and excluded from acceptance; never repeat it.

Report: `docs/handoffs/0027-CODEX-03-citation-identity-repair-report.md`.

### 0027-CODEX-02 — RETURNED / citation identity blocker

Implementation: `acd3aa08a3ecc01a7b0852afef8f58202934af82`.
Final: `0032a9cdb69cc1431566dee82f7e2c2196ddee50`.
Logic 440/440, bundle 27/27, readback 82/82, version-72 shell PASS. Short 3.7 Interactions HTTP 200 / 1470ms. File Search HTTP 200, token PASS, one normalized citation, attempts 2/retry 1, 34992ms; strict identity FAIL. 3.6 NOT_RUN as required; temporary cleanup PASS.

Report: `docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-report.md`.

### 0027-CODEX-01 — RETURNED / 3.8 transient query failure

Implementation: `d0456516cae5e65e68d5789e3e8e5338cffd6823`.
Final: `2c6cd20bfe6a4ef3b6262160b4126266307222dd`.
Logic 431/431, version-71 shell, upload/index/readback and cleanup PASS. 3.8 File Search HTTP 500/api_error/68442ms; no grounded qualification.

Report: `docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-report.md`.

Work 0026 remains ACCEPTED. All old dispatch budgets expired. Only CODEX-05 is active. A native-user action within that run retains CODEX-05; a new execution after return must use CODEX-06.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CODEX
STATUS: READY
