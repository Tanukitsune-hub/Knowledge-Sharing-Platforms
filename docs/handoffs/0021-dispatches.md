# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-06`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-06 — READY / RUNTIME VERSION RECONCILIATION + FINAL FULL_OUTPUT

CODEX-04 returned twice because an older local/runtime execution was still finishing while GitHub had already moved to the next dispatch. The late CODEX-04 return is preserved as evidence, not as the active instruction.

Accepted product evidence remains:

```text
PRIVATE_WEB_APP_DEPLOYED_VERSION: 65
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
STRICT_GOOGLE_EDITOR_URL_PARSER_LOCAL_VALIDATION: PASS — 376/376 canonical
```

Late CODEX-04 runtime side effects:

```text
APPS_SCRIPT_VERSION_66: CREATED / NOT DEPLOYED
APPS_SCRIPT_VERSION_67: CREATED ACCIDENTALLY / NOT DEPLOYED
WEB_APP_UPDATE_AFTER_CREATION: NONE — still version 65
LOCAL_SCOPED_FIX_COMMIT: 516a323d4ee00b3134e79719303ddf81d52d5b4b
REMOTE_PUSH: REJECTED because remote had advanced
```

`0021-CODEX-05` is `SUPERSEDED / NOT EXECUTED` because its contract assumed version 66 still needed to be created.

Active instruction:

`docs/handoffs/0021-CODEX-06-runtime-version-reconciliation-and-final-full-output-instruction.md`

CODEX-06 must start from current remote GitHub state, reconcile only the scoped parser/test diff, create no new Apps Script version, verify existing version 66 is the exact intended source, update the same Web App to version 66 at most once, run one FULL_OUTPUT preview, perform final read-only integrity, and stop.

Version 67 must remain unused/not deployed in this Dispatch. Do not delete it here.

## Dispatch history

| Dispatch ID | Purpose | Status |
|---|---|---|
| `0021-CODEX-01` | Core structured filters + five modes | RETURNED / accepted slice |
| `0021-CODEX-02` | OpenAI metadata reconciliation + core runtime | RETURNED / accepted slice |
| `0021-CODEX-03` | Multi-Entity comparison + advanced exact filters | RETURNED / accepted slice |
| `0021-CODEX-04` | Six-format OpenAI qualification + late parser-fix runtime attempt | RETURNED / closed evidence |
| `0021-CODEX-05` | Initial parser-fix instruction | SUPERSEDED / not executed |
| `0021-CODEX-06` | Runtime-version reconciliation + final FULL_OUTPUT gate | READY |

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-06`
BALL: `CODEX`
STATUS: `READY`
