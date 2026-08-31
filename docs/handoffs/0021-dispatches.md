# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-04 — READY / LOCAL FILE UPLOAD BRIDGE DIAGNOSIS THEN SIX-FORMAT QUALIFICATION

Primary outcome remains unchanged:

- qualify `.pdf / .pptx / .xlsx / .docx / .txt / .eml` through the current OpenAI Pitchbook path;
- prove authoritative source identity and normalized citation per supported format;
- preserve EML normalized-header/body and no-attachment-auto-index boundary;
- prove FULL_OUTPUT keeps every Pitchbook format reference-only and API-independent;
- return PR #34 ready for final ChatGPT merge if all Work 0021 gates pass.

Instruction:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`

Browser diagnostic note:

`docs/handoffs/0021-CODEX-04-browser-upload-diagnostic-note.md`

## Resume state

Codex previously stopped before runtime registration/provider mutation because its browser-assisted local-file upload path reported that Chrome extension file-URL access was unavailable.

The user subsequently confirmed that **Allow access to file URLs / ファイルのURLへのアクセスを許可する is already ON** in the ChatGPT/Codex Chrome extension settings.

No further user action is currently known. Therefore the ball returns to CODEX for diagnosis.

The earlier blocker label `CHROME_EXTENSION_FILE_UPLOAD_PERMISSION` is not proven. Current diagnostic state:

```text
LOCAL_LOGIC_VALIDATION: PASS — 371/371
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
PRIVATE_WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
PR_34: Draft / Open / unmerged
DIAGNOSTIC: BROWSER_LOCAL_FILE_UPLOAD_BRIDGE_UNAVAILABLE_PENDING_DIAGNOSIS
```

Resume the SAME `0021-CODEX-04` dispatch. Do not create CODEX-05.

Before asking the user to change another setting, diagnose the actual browser/profile/session and local-file path in read-only fashion as specified in the diagnostic note. Do not mutate Drive, Backend, OpenAI, deployment, or provider state during that diagnosis.

Once the local upload bridge is positively available, continue the same bounded CODEX-04 matrix under the committed instruction.

## Accepted baseline through CODEX-03

```text
PRIVATE_WEB_APP_VERSION: 63
CODEX_03_LOGIC_VALIDATION: PASS — 368/368
CODEX_03_READBACK: PASS — 80/80
OPENAI_MULTI_ENTITY_RUNTIME: PASS
OPENAI_ADVANCED_EXACT_FILTER_RUNTIME: PASS
FULL_OUTPUT_MULTI_ENTITY_PARITY: PASS
GEMINI_API_CALLED: NO
OPENAI_PROVIDER_BASELINE: 16 completed documents
BLOCKER: NONE THROUGH CODEX-03
```

## Completion discipline

CODEX-04 remains the last planned Work 0021 dispatch. After a passing six-format/final integrity matrix, stop and return PR #34 for final merge.

Do not call Gemini, retry/mutate old large fixtures, run broad sync, implement Work 0023, add unrelated hardening, benchmark formats repeatedly, or create CODEX-05 absent a real Work 0021 blocker.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
