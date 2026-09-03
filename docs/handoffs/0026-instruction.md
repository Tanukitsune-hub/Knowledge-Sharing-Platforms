# Work 0026 — current Gemini Flash / File Search requalification

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `IMPLEMENT -> BOUNDED PROVIDER DIAGNOSIS -> QUALIFICATION`

## Primary outcome

Bring the optional Gemini route up to the current official Gemini Flash/File Search/model-policy contract and complete one bounded requalification against the accepted OpenAI/FULL_OUTPUT reference system.

Active detailed instruction:

`docs/handoffs/0026-CODEX-01-current-gemini-flash-file-search-requalification-instruction.md`

Planning:

`docs/planning/work0026-gemini-current-api-requalification.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted baseline

```text
WORK_0020 / 0025 / 0021 / 0023: ACCEPTED
PRIVATE_WEB_APP_VERSION: 66
VERSION_67: unused / prohibited from deployment
OPENAI: accepted
FULL_OUTPUT: accepted
BUNDLE_INSTALLER: accepted
```

## Fixed boundaries

- preferred live candidate: exact `gemini-3.8-flash`, explicit `low`, output ceiling 2048;
- only explicit model-access failure permits one candidate fallback to `gemini-3.7-flash`;
- no moving `latest` alias and no `minimal` for 3.8/3.7;
- Gemini credential, Store, model/thinking qualification and user visibility remain administrator-controlled;
- no automatic model fallback and no cross-provider fallback;
- authoritative normalized citations remain mandatory;
- normal query execution must use the exact Work 0025 server-resolved tuple rather than fixed Gemini constants;
- current Interactions/File Search behavior is tested first under bounded responsive START/POLL rules;
- if the provider still cannot qualify, leave Gemini disabled and record the exact external limitation rather than starting another open-ended loop;
- all source changes regenerate and validate the deterministic Work 0023 bundle;
- company rollout, large files, historical migration, broad sync, CI and general hardening are out of scope.

After the bounded terminal outcome, stop and return the Draft PR to ChatGPT. Do not merge it.

## CODEX-01 returned state

Version 68 was created and deployed once after deterministic and exact-source-readback PASS. The deployed modular Web App then rendered `include_` directives literally, so the provider campaign stopped before Gemini or OpenAI was called. The branch contains the minimal modular-template repair and regression test, but it was not redeployed because the one-version/one-update budget had been consumed.

```text
LOGIC_VALIDATION: PASS / 410 of 410
TARGET_RUNTIME_QUALIFICATION: FAIL
RUNTIME_DEPLOYMENT_VERSION: 68
BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
NEXT_AUTHORITY_REQUIRED: new Dispatch authorizing one repaired immutable version and same-Web-App update
```

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
