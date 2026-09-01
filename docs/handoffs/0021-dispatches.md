# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Active dispatch

### 0021-CODEX-04 — ACTION REQUIRED / CHROME PLUGIN + FILE-CHOOSER BRIDGE RECOVERY

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

## Current blocker

Read-only diagnosis completed against the attached ChatGPT/Codex Chrome extension and Chrome Profile 2.

```text
LOCAL_LOGIC_VALIDATION: PASS — 371/371
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
PRIVATE_WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
PR_34: Draft / Open / unmerged
DIAGNOSTIC: COMPLETE
BLOCKER: BROWSER_EXTENSION_FILE_CHOOSER_BRIDGE_UNAVAILABLE_PROFILE_2
```

The extension is installed/enabled, native host is valid, six workspace fixture files are readable, and the Web App file input is present/enabled. The failure occurs before file-path assignment: the native chooser does not open through the browser automation bridge.

The user has already reinstalled the Chrome extension and confirmed `Allow access to file URLs / ファイルのURLへのアクセスを許可する` is ON. Do not ask for either action again without contradictory evidence.

## Correct next recovery target

OpenAI's current Chrome-extension troubleshooting refers to the ChatGPT desktop app **Chrome plugin** in `Plugins`; this is distinct from the built-in `@Browser` browser.

The next user action is:

1. update/restart the ChatGPT desktop app if needed;
2. in ChatGPT desktop, open `Plugins`;
3. remove the **Chrome** plugin;
4. add/install the **Chrome** plugin again and complete its setup;
5. confirm the Chrome side chat loads in the intended Chrome Profile 2;
6. confirm file-URL access remains ON on the newly installed Chrome extension;
7. resume the same CODEX-04 task.

If the chooser still fails after the Chrome plugin has been removed/re-added and the desktop app restarted, create a fresh Work/Codex chat only as a browser-connection-state test while preserving this GitHub dispatch identity. If the failure still reproduces, use `/feedback` in the ChatGPT desktop app and include the affected chat/task ID when contacting OpenAI Support.

Do not create CODEX-05. Do not substitute the built-in Browser plugin/name for the Chrome plugin recovery step.

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
BALL: `USER`
STATUS: `ACTION_REQUIRED`
