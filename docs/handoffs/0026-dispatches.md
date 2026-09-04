# Work 0026 dispatch control

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

## Dispatch history

### 0026-CODEX-01 — RETURNED / product blocker before provider qualification

CODEX-01 implemented and deterministically validated the current Gemini request/model-policy path. Its one authorized deployment created version 68, where the modular Web App rendered server include directives literally. Gemini and OpenAI were not called.

The repair commit was:

`681768824f298eff24439b2ee69c9ce159af1e0e — fix: preserve modular HTML template evaluation`

### 0026-CODEX-02 — RETURNED / shell repaired; Gemini exact tuple failed

CODEX-02 delivered/read back the repaired source once, created version 69 and updated the same private Web App once. Root and Knowledge Search passed normal and cache-bypassed smoke with zero literal includes and zero blocking console errors.

Closed evidence:

```text
VERSION_69_SHELL: PASS
SOURCE_READBACK: PASS / 82 of 82
DOC-000017_EXACT_SYNC: PASS / one current document
MTG-000005_EXACT_SYNC: PASS / one current document
DUPLICATES: 0
GEMINI_KEY_AND_STORE: accessible
PRIMARY_TUPLE: gemini-3.8-flash / low / 2048
DIRECT_INTERACTIONS_QUALIFICATION: FAIL / approximately 79 seconds
GEMINI_3_7_FALLBACK: NOT_USED
GEMINI_ROUTE: disabled / hidden
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
LOGIC_VALIDATION: PASS / 410 of 410
```

CODEX-02 report:

`docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-report.md`

## ChatGPT independent review

GitHub PR head `36d748828e9fd16368266e09d095426126586d06`, the final report, relevant source, tests, PR state, review threads and CI state were independently checked.

The product remains usable because OpenAI and FULL_OUTPUT are preserved and Gemini failed closed. However, Work 0026 cannot yet be accepted or PR #36 merged as `DISABLED_EXTERNAL_LIMITATION`.

The qualification path can fail at multiple materially different layers, but the administrator catch currently writes `DISABLED_EXTERNAL_LIMITATION` for every non-access Gemini qualification exception and then exposes only generic `AI_MODEL_QUALIFICATION_FAILED`. The transport also drops the safe Interaction error-code evidence before review. Therefore CODEX-02 did not establish whether the 79-second result was provider terminal, completed without grounding, completed without citation, citation mapping mismatch, or an application response-shape defect.

```text
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: GEMINI_EXTERNAL_LIMITATION_CLASSIFICATION_NOT_EVIDENCED
PR_36_MERGE: BLOCKED
```

## Active dispatch

### 0026-CODEX-03 — READY / safe classification repair and bounded requalification

Detailed instruction:

`docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-instruction.md`

Primary outcome:

1. preserve distinct safe failure causes instead of collapsing them;
2. write `DISABLED_EXTERNAL_LIMITATION` only when exact evidence supports it;
3. deploy the minimal repair as version 70 on the same private Web App once;
4. run one required 3.8 Interactions qualification and at most one mutually exclusive fallback/control call;
5. end as `QUALIFIED`, exact `DISABLED_EXTERNAL_LIMITATION`, or `BLOCKED_PRODUCT_DEFECT`.

Runtime/provider budget:

```text
APPS_SCRIPT_SOURCE_DELIVERY: max 1
NEW_IMMUTABLE_VERSION: max 1 / expected 70
SAME_PRIVATE_WEB_APP_UPDATE: max 1 / expected 69 -> 70
VERSION_67_DEPLOYMENT: prohibited
VERSION_71_OR_HIGHER: prohibited
GEMINI_STORE_CREATE: 0
GEMINI_SOURCE_SYNC_OR_UPLOAD: 0 unless closed readback is contradicted; then stop
GEMINI_QUERY_CALLS_TOTAL: max 2
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

## Accepted baseline

```text
WORK_0020: ACCEPTED
WORK_0025: ACCEPTED
WORK_0021: ACCEPTED
WORK_0023: ACCEPTED
CURRENT_PRIVATE_WEB_APP_VERSION: 69 / shell PASS
VERSION_67: unused / never deploy
OPENAI/FULL_OUTPUT: accepted production-capable routes
GEMINI: disabled / hidden pending exact qualification
PR_36: Draft / Open / unmerged
GITHUB_CI: absent / non-blocking by itself
```

Do not broaden into large-file work, historical migration, company rollout, Store redesign, chunk/embedding experiments, model sweeps, OpenAI requalification, FULL_OUTPUT live reruns, CI implementation or general hardening.

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
