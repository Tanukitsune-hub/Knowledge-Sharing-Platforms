# Work 0026 — current Gemini Flash / File Search requalification

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `TERMINAL / DISABLED_EXTERNAL_LIMITATION`

## Primary outcome

Bring the optional Gemini route up to the current official Gemini Flash/File Search/model-policy contract and complete one bounded requalification against the accepted OpenAI/FULL_OUTPUT reference system.

Active detailed instruction:

`docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-instruction.md`

Planning:

`docs/planning/work0026-gemini-current-api-requalification.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted baseline

```text
WORK_0020 / 0025 / 0021 / 0023: ACCEPTED
PR_36: Draft / Open / unmerged
CURRENT_PRIVATE_WEB_APP_VERSION: 69 / modular shell PASS
VERSION_67: unused / prohibited from deployment
OPENAI: accepted
FULL_OUTPUT: accepted
BUNDLE_INSTALLER: accepted
```

## CODEX-01 returned state

CODEX-01 implemented the current Gemini provider/model-policy path and passed deterministic validation. After its one authorized version/update, version 68 exposed a modular HTML template regression: server-side include directives were rendered literally, so the Web App could not load the included application resources and the Gemini campaign stopped before any provider call.

The smallest repair is committed and tested:

`681768824f298eff24439b2ee69c9ce159af1e0e`

```text
LOGIC_VALIDATION: PASS / 410 of 410
RUNTIME_DEPLOYMENT_VERSION: 68
GEMINI_API_CALLED: NO
OPENAI_API_CALLED: NO
BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
```

## CODEX-02 authority

CODEX-02 may:

1. revalidate the existing repair and deterministic suite;
2. deliver/read back repaired source once;
3. create exactly one immutable version, expected `69`;
4. update the same private Web App exactly once;
5. prove root/Knowledge Search include expansion and normal bootstrap;
6. only then resume the bounded Gemini campaign using `DOC-000017` and `MTG-000005`;
7. qualify `gemini-3.8-flash / low / 2048`, using `gemini-3.7-flash / low / 2048` only after explicit model-access/model-unsupported evidence;
8. stop as `QUALIFIED`, `DISABLED_EXTERNAL_LIMITATION`, or a new exact product blocker.

## Fixed boundaries

- no moving `latest` alias and no `minimal` for 3.8/3.7;
- Gemini credential, Store, model/thinking qualification and user visibility remain administrator-controlled;
- no automatic model fallback and no cross-provider fallback;
- authoritative normalized citations remain mandatory;
- normal query execution must use the exact Work 0025 server-resolved tuple;
- no broad source sync/reindex;
- no `DOC-000018`, six-format fixtures, or large-file fixtures;
- no OpenAI runtime call;
- no FULL_OUTPUT live rerun;
- no version 67 deployment;
- no version 70 or higher in this Dispatch;
- all source changes regenerate and validate the deterministic Work 0023 bundle;
- company rollout, historical migration, CI and general hardening are out of scope.

After the bounded terminal outcome, stop and return PR #36 to ChatGPT. Do not merge it.

## CODEX-02 returned outcome

```text
MODULAR_TEMPLATE_REPAIR: PASS / version 69
ROOT_AND_KNOWLEDGE_SHELL: PASS / literal includes 0 / blocking console errors 0
GEMINI_KEY_AND_STORE: accessible
DOC-000017_AND_MTG-000005_EXACT_SYNC: PASS
PRIMARY_TUPLE: gemini-3.8-flash / low / 2048
DIRECT_INTERACTIONS_CONTROL: FAIL / safe final result after approximately 79 seconds
GEMINI_3_7_FALLBACK: NOT_USED / no explicit access-or-unsupported evidence
GEMINI_STATUS: DISABLED_EXTERNAL_LIMITATION / normal-user route hidden
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
FINAL_INTEGRITY: PASS
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

This bounded Work is complete at its allowed external-limitation terminal state. Do not resume the provider campaign without a new instruction and materially new evidence.

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
