# Work 0027 — Gemini GAS File Search resilience and qualification

WORK_ID: 0027
MODE: BUILD
ACTIVE_DISPATCH_ID: 0027-CODEX-03
BALL: CODEX
STATUS: READY

## Primary outcome

A working personal-DEV Gemini Interactions + File Search baseline with exact authoritative citation identity, before company qualification. An optional-provider safe stop is not a substitute for the user's requested grounded-search success.

Current execution contract: `docs/handoffs/0027-CODEX-03-citation-identity-repair-instruction.md`.
Current ball: `docs/handoffs/0027-dispatches.md`.

## Preserved starting evidence

Main: `8c9be2392a1247ff81efc6a153fc0be449b1318b`.
Work 0026: ACCEPTED, PR #36 merge `40bb7d40506c0839c35742ee0000d89650ff7ad6`.
OpenAI/FULL_OUTPUT, structured search, bundle and installer accepted boundaries remain unchanged.
Independent company-GAS results are preserved in `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`. They demonstrate basic connectivity in that tested account/environment, not completed company File Search qualification.

CODEX-01: transient/auth separation, bounded retry, correct GAS upload headers and resumable recovery implemented; 431/431 checks; version 71; upload/index/readback and cleanup PASS; 3.8 File Search HTTP 500 after 68,442ms. Report: `docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-report.md`.

CODEX-02: stable candidate parameterization implemented; 440/440 checks; version 72, 82/82 source readback, shell PASS; 3.7 File Search HTTP 200 with token and one citation, but exact identity/metadata mismatch; 3.6 not called; cleanup PASS. Final ref `0032a9cdb69cc1431566dee82f7e2c2196ddee50`. Report: `docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-report.md`.

## Strategy reset after CODEX-02

The remaining problem is no longer basic transport, upload or model selection. Fix the citation identity/metadata boundary without changing model/transport.

```text
MODEL: gemini-3.7-flash
THINKING: explicit low
MAX_OUTPUT_TOKENS: 2048
TRANSPORT: Interactions + File Search
OTHER_MODEL_CALLS: prohibited in CODEX-03
CURRENT_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

The present qualifier's source-equals-Document-name predicate is not guaranteed by the reviewed public schema. Its actual involvement is a hypothesis until per-field runtime evidence is captured. Do not weaken grounding based on that hypothesis alone.

## Required scope

Establish the actual raw-to-normalized citation shape using retained evidence or one optional synthetic diagnostic. Preserve a sanitized shape-faithful regression fixture. Repair only the observed gap. Use the same strict identity resolver in qualification and normal Gemini source mapping. Verify exact Active source, configured-Store binding, current Gemini hash and authoritative source links. Ambiguous, conflicting, stale or unresolvable citations must reject.

No token-only, filename-only, filter-only or singleton-Store inference. Missing optional metadata may be resolved only through a trusted canonical provider locator and verified document metadata, never by copying expected request data.

## Bounds and evidence

Detailed CODEX-03 limits supersede expired CODEX-02 budgets: optional diagnostic query <=1, post-fix confirmation <=1, generation HTTP attempts <=4 under existing retry rules; temporary Stores <=2 sequential, one active at a time; at most one tiny document each; final version <=1 expected 73; same Web App update <=1; no version 74+ and never version 67. No existing source mutation, OpenAI/FULL_OUTPUT call, company data or rollout.

Evidence hierarchy:

1. post-fix personal-DEV response/citation bound to the exact current authoritative source through production mapping;
2. temporary-resource deletion/nonexistence confirmation;
3. exact final source readback and same-private-Web-App shell smoke;
4. observed-shape failing-before/passing-after tests, wrong-source/ambiguity/stale/inactive negatives;
5. canonical checks, bundle reproducibility, secret scan and diff hygiene.

## Completion latch

Only `QUALIFIED_DISABLED` on 3.7 with correct token/citation/source/hash, shared mapping parity, cleanup and logic/runtime PASS satisfies this scope. Keep Gemini disabled/hidden pending ChatGPT final review. Other terminal outcomes are safe stops and preserve the exact unresolved blocker. One evidence-led repair and one post-fix confirmation; no further model/transport/reindex experiment within CODEX-03.

Large-file qualification, other models, company credentials/permissions, historical migration and rollout remain later work. No decision here authorizes confidential indexing.
