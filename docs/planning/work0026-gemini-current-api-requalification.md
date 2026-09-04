# Work 0026 — current Gemini Flash / File Search requalification

Current as of: 2026-09-04

Status: ACTIVE / `0026-CODEX-03` ready

## Purpose

Re-evaluate the optional Gemini provider against the current model, File Search, citation, metadata-filter and lifecycle contracts while preserving the accepted OpenAI/FULL_OUTPUT product.

The acceptable final result is either one qualified exact Gemini tuple or a safely disabled Gemini route with the exact external limitation evidenced. This Work must not become an open-ended provider experiment.

## Accepted baseline

```text
WORK_0020: ACCEPTED — OpenAI provider core, citations, lifecycle and FULL_OUTPUT
WORK_0025: ACCEPTED — administrator model/thinking policy
WORK_0021: ACCEPTED — structured search, five modes, multi-Entity and six formats
WORK_0023: ACCEPTED — deterministic bundle and installer
MAIN_BASE: 8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f
CURRENT_PRIVATE_WEB_APP_VERSION: 69 / shell PASS
VERSION_67: unused / never deploy
GITHUB_CI: absent
```

## CODEX-01 and CODEX-02 closed evidence

CODEX-01 implemented the current Gemini API/model-policy route and exposed a modular template regression on version 68. Commit `681768824f298eff24439b2ee69c9ce159af1e0e` repaired the modular/bundle template split.

CODEX-02 deployed the repair as version 69 on the same private Web App. Root and Knowledge Search passed, with zero literal includes and zero blocking console errors. Exact readback found one active metadata-matching Gemini document for each authorized source and no duplicates.

```text
DOC-000017: exact current Gemini document 1
MTG-000005: exact current Gemini document 1
PRIMARY_TUPLE: gemini-3.8-flash / explicit low / max output 2048
DIRECT_INTERACTIONS_QUALIFICATION: FAIL / approximately 79 seconds
GEMINI_3_7_FALLBACK: NOT_USED
GEMINI_ROUTE: disabled / hidden
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
LOGIC_VALIDATION: PASS / 410 of 410
```

These runtime and integrity facts are closed unless contradicted by stronger evidence.

## ChatGPT review finding

The CODEX-02 report called the outcome `DISABLED_EXTERNAL_LIMITATION`, but the application did not preserve enough safe evidence to support that classification.

The qualification may fail because of provider/model/access/quota behavior, provider terminal status, missing grounded answer, missing citation, citation identity mismatch, or response-shape/application parsing. The current administrator catch writes `DISABLED_EXTERNAL_LIMITATION` for every non-access Gemini qualification exception and then replaces the underlying cause with generic `AI_MODEL_QUALIFICATION_FAILED`.

```text
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: GEMINI_EXTERNAL_LIMITATION_CLASSIFICATION_NOT_EVIDENCED
```

Gemini remains safely hidden, but Work 0026 and PR #36 cannot be accepted until this evidence gap is resolved.

## Current official-documentation signal

At ChatGPT review on 2026-09-04, Google's Gemini 3.8 model page and File Search page described Gemini 3.8 Flash as stable and File Search capable. The current Interactions API reference model enumeration did not yet list Gemini 3.8 Flash while listing earlier Flash models.

This may indicate rollout/schema lag, but it is not runtime proof. CODEX-03 must preserve the exact safe provider status/error class rather than infer the cause from documentation alone.

## Candidate and control policy

Required primary candidate:

```text
gemini-3.8-flash / explicit low / max output 2048 / Interactions + File Search
```

At most one mutually exclusive second call is allowed:

- one `gemini-3.7-flash / low / 2048` Interactions fallback only after explicit model access/unsupported evidence; or
- one `gemini-3.8-flash / low / 2048` GenerateContent + File Search control for a non-model-specific terminal or grounding/citation failure.

No other candidate, alias, transport, Store, prompt, filter, chunking, embedding, retry or timeout experiment is allowed.

## CODEX-03 outcome

CODEX-03 must:

1. preserve distinct safe failure causes;
2. prevent generic/application failures from being relabeled external;
3. add deterministic tests for each material failure class;
4. deploy the minimal repair once as version 70;
5. preserve the version-69 shell result;
6. read back the existing two exact documents without source sync/upload;
7. execute the bounded one-or-two-call decision tree;
8. return an exact evidence-supported terminal state.

Runtime bounds:

```text
SOURCE_DELIVERY: max 1
NEW_VERSION: max 1 / expected 70
SAME_WEB_APP_UPDATE: max 1
VERSION_67: never deploy
VERSION_71_OR_HIGHER: prohibited
GEMINI_QUERY_CALLS: max 2
STORE_CREATE: 0
SOURCE_SYNC_OR_UPLOAD: 0 unless closed evidence is contradicted; then stop
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

## Completion semantics

### `QUALIFIED`

The exact selected tuple returns the expected grounded answer and one authoritative citation and may be exposed through the normal product route.

### `DISABLED_EXTERNAL_LIMITATION`

Safe runtime evidence identifies the exact provider/account/model/transport/quota/terminal/citation limitation, application/source-integrity defects are excluded, and Gemini remains disabled/hidden.

### `BLOCKED_PRODUCT_DEFECT`

A response-shape, parser, citation mapping, source identity, security, shell or other application defect explains the failure. Do not relabel it external.

## Scope exclusions

Do not broaden into company rollout, Shared Drive/domain qualification, representative large files, historical migration, Store redesign, model sweeps, chunk/embedding benchmarks, OpenAI requalification, FULL_OUTPUT live reruns, CI implementation or general hardening.

## Dispatch history

```text
0026-CODEX-01 — current API implementation; version 68 shell regression
0026-CODEX-02 — version 69 shell repaired; exact tuple failed but cause classification was insufficient
0026-CODEX-03 — active safe classification repair and bounded requalification
```

Active instruction:

`docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-instruction.md`
