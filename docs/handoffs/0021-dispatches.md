# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-04 — READY / HUMAN-ASSISTED FILE SELECTION + FINAL SIX-FORMAT QUALIFICATION

Primary outcome remains unchanged:

- qualify `.pdf / .pptx / .xlsx / .docx / .txt / .eml` through the current OpenAI Pitchbook path;
- prove authoritative source identity and normalized citation per format;
- preserve EML normalized-header/body and no-attachment-auto-index boundary;
- prove FULL_OUTPUT keeps every Pitchbook format reference-only and API-independent;
- return PR #34 ready for final ChatGPT merge if all Work 0021 product gates pass.

Authoritative instructions:

- `docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`
- `docs/handoffs/0021-CODEX-04-human-assisted-file-selection-resume.md`

Browser diagnostic evidence:

- `docs/handoffs/0021-CODEX-04-browser-upload-diagnostic-note.md`
- `docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

## Current state

```text
LOCAL_LOGIC_VALIDATION: PASS — 371/371
TARGET_RUNTIME_QUALIFICATION: NOT RUN
PRIVATE_WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
PR_34: Draft / Open / unmerged
CHROME_AUTOMATION_DIAGNOSTIC: COMPLETE
```

The Chrome extension/plugin connection is healthy enough to reach and inspect the Web App, but the agent automation bridge does not open the native file chooser. The user has already reinstalled the Chrome extension and confirmed file-URL access is ON.

This is now classified as an external browser-automation tooling issue, not a Work 0021 product blocker unless a human user also cannot open/select files through the normal Web App UI.

## Required resume path

Follow `0021-CODEX-04-human-assisted-file-selection-resume.md`:

1. stage the six validated fixture files in one clear user-accessible folder;
2. navigate the existing private Web App to the normal Pitchbook upload UI;
3. stop and hand only the native file-selection step to the user;
4. after the user selects/registers the six files through the ordinary product flow, resume CODEX-04 automatically;
5. complete exact OpenAI sync, six grounded retrieval/citation checks, EML boundary, FULL_OUTPUT preview and final integrity;
6. if the human file chooser also fails, stop with that product/environment evidence;
7. otherwise record the Chrome automation chooser issue as FIX SOON and do not extend Work 0021 for it.

Do not create CODEX-05 for the browser automation bridge.

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

CODEX-04 remains the final planned Work 0021 dispatch. After a passing six-format/final integrity matrix, stop and return PR #34 for final merge.

Do not call Gemini, retry/mutate old large fixtures, run broad sync, implement Work 0023, add unrelated hardening, benchmark formats repeatedly, or create CODEX-05 absent a genuine Knowledge Share product blocker.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
