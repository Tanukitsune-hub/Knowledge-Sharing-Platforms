# Work 0027 dispatch control

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Current dispatch — returned / qualified disabled

`0027-CODEX-05` implemented the shared strict Store/metadata/current-document resolver and completed one guarded 3.7 confirmation.

Instruction: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-instruction.md`
Report: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-report.md`

CODEX-04's recovered representation drove the repair: source is content, document_uri is the Store, and exact custom metadata resolves through trusted current source/document context. Qualification and normal immediate/POLL mapping now share the strict fail-closed resolver.

```text
REVIEWED_CODEX_04_FINAL: 18226013d6f98a5cb2bffdf72ced52e766a8b698
MODEL: gemini-3.7-flash / low / 2048 / Interactions + File Search
IMPLEMENTATION_COMMIT: 40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7
CURRENT_RUNTIME: version 73
CODEX_05_IMPLEMENTATION_AND_RUNTIME: PASS
TERMINAL_OUTCOME: QUALIFIED_DISABLED
WORK_ACCEPTANCE: MET
BLOCKER: NONE
GEMINI: disabled / hidden
```

## Consumed CODEX-05 authorization

The detailed instruction is authoritative. One shared resolver repair, one logical File Search confirmation (<=2 generation HTTP attempts under existing replay/wait safeguards), one temporary Store/TXT, exact cleanup confirmation. No short generation, Models, other model, GenerateContent, OpenAI or FULL_OUTPUT live calls. No existing Store/business-source mutation. Fresh quota inspection is not a probe or permission to change billing/key. One final source delivery/readback, at most version 73 and one update of the same private Web App (72 -> 73); never deploy 67 or create 74+. No temporary diagnostic staging, handler interception or administrator-latch bypass.

The bounded authorization was consumed by one source delivery/readback, one version-73 creation, one same-Web-App update, one temporary Store/TXT, one logical File Search query, and confirmed cleanup. No old budget remains. Any new execution requires `0027-CODEX-06`.

## Returned dispatch history

### 0027-CODEX-05 — RETURNED / QUALIFIED_DISABLED

Implementation: `40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7`. Final: resolve from PR #37 head/final return.

Strict Gemini citation resolution, focused 111/111, full logic 448/448, bundle 27/27, source readback 82/82 and version-73 shell PASS. One guarded 3.7/low/2048 File Search campaign returned the expected token and an authoritative normalized citation with shared normal-mapper parity. One temporary Store/TXT was deleted and absence confirmed. Gemini remains qualified-but-disabled and hidden; existing provider/business sources were not mutated. The safe Audit append was not observed and is a non-blocking evidence-retention follow-up.

Report: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-report.md`.

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

Work 0026 remains ACCEPTED. All CODEX-01 through CODEX-05 budgets are consumed. Work 0027 is ready for ChatGPT final review; any new execution after return must use CODEX-06.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
