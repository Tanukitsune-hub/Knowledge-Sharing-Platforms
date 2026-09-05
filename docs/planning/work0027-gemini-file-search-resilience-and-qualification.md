# Work 0027 — Gemini GAS File Search resilience and qualification

WORK_ID: 0027
MODE: INVESTIGATION
ACTIVE_DISPATCH_ID: 0027-CODEX-04
BALL: CHATGPT
STATUS: RETURNED

## Primary outcome

A working personal-DEV Gemini Interactions + File Search baseline with exact authoritative citation identity, before company qualification. An optional-provider safe stop is not a substitute for the user's grounded-search success.

Current execution contract: `docs/handoffs/0027-CODEX-04-evidence-recovery-and-quota-preflight-instruction.md`.
Current ball: `docs/handoffs/0027-dispatches.md`.

## Preserved starting evidence

Main: `8c9be2392a1247ff81efc6a153fc0be449b1318b`.
Work 0026: ACCEPTED, PR #36 merge `40bb7d40506c0839c35742ee0000d89650ff7ad6`.
OpenAI/FULL_OUTPUT, structured search, bundle and installer accepted boundaries remain unchanged.
Independent company-GAS results remain in `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`; they prove basic connectivity in that account/environment, not company File Search qualification.

CODEX-01: transient/auth separation, bounded retry, correct GAS upload headers and resumable recovery implemented; 431/431 checks; version 71; upload/index/readback and cleanup PASS; 3.8 File Search HTTP 500 after 68442ms. Preserve its report.

CODEX-02: stable candidate parameterization; 440/440 checks; version 72, 82/82 readback, shell PASS; 3.7 HTTP 200 with token and one citation but exact identity/metadata mismatch; 3.6 not called; cleanup PASS. Final ref `0032a9cdb69cc1431566dee82f7e2c2196ddee50`.

CODEX-03: final ref `745e34d8a04df4aaea8a9373775106b4b08b4523`. One diagnostic returned HTTP 429/too_many_requests, attempts 2/retry 1, sleep 514ms, latency 21825ms, no citation. No repair/version/deployment. Cleanup and 82/82 source restoration reported. Its temporary invocation-path modification violated the instruction and is not qualification evidence; do not repeat it.

## CODEX-04 investigation result

CODEX-04 recovered the exact successful CODEX-02 Interaction without generation. It observed content text in `source`, the requested Store in `document_uri`, and exact source metadata in `custom_metadata`. This identifies the invalid `source === Document.name` assumption while preserving the original upload/readback Document name as unavailable evidence.

Same-project AI Studio showed Free tier and last-hour Gemini 3.7 values of RPM 3/5, TPM 394/250000 and RPD 3/20. A 28-day RPM peak of 6/5 is historical evidence only; the exact dimension and reset/wait behind CODEX-03's 429 remain UNKNOWN. The guarded version-72 Web App administrator qualification route is available and was not invoked.

```text
MODEL_CONTEXT: gemini-3.7-flash / low / 2048
WORK_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
RECOVERED_MISMATCH: SOURCE_CONTENT_IS_NOT_PROVIDER_DOCUMENT_IDENTITY
CODEX_03_429_QUOTA_CATEGORY: UNKNOWN
CURRENT_RUNTIME: version 72
```

The sanitized relationship-preserving fixture is `docs/handoffs/0027-CODEX-04-sanitized-citation-shape.json`. No original IDs, URLs, prompt, token, source text or project identity is retained there.

## Subsequent repair boundary — not authorized by CODEX-04

After actual shape is known, repair only the observed normalization/resolution gap through shared qualification and normal Gemini mapping. Verify exact Active source, configured-Store binding, current Gemini hash and authoritative link. Reject ambiguous/conflicting/stale/unresolvable citations.

No token-only, filename-only, filter-only or singleton-Store inference. Missing metadata may be resolved only using trusted provider identity and verified document metadata, not copied expected values. Preserve accepted OpenAI mapping.

A future fresh capture, if necessary, must have same-project quota headroom/wait evidence, a compliant invocation path and instrumentation that retains a sanitized per-field fixture before cleanup. Merely changing the Dispatch number is not sufficient.

## Evidence and completion

CODEX-04 returned `EVIDENCE_RECOVERED` with zero generation, Store, source, version, deployment, billing or credential mutation. No Work PASS is claimed.

Work completion still requires post-fix personal-DEV token/citation/source/hash correctness through production mapping, cleanup, exact source/runtime evidence and deterministic regressions. Only QUALIFIED_DISABLED with required evidence satisfies Work acceptance. Keep Gemini hidden/disabled pending final review.

All prior source/version/call budgets remain expired. Any repair or runtime confirmation requires a new CODEX-05 instruction with fresh bounded authority. The cheapest next action is the evidence-led shared resolver repair, followed by one guarded confirmation only after deterministic PASS and current quota headroom.

Large files, other models, migration, company credentials/permissions and rollout remain later work. No confidential indexing or billing change is authorized.
