# Work 0021 — CODEX-04 six-format OpenAI capability and final Work qualification report

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Outcome

CODEX-04 remains the active final Work 0021 dispatch. Deterministic six-format logic passed, but the target-runtime matrix did not start because the attached Chrome extension could not open or expose a native file chooser for the normal Pitchbook registration flow.

Current evidence-backed classification:

```text
BLOCKER: BROWSER_EXTENSION_FILE_CHOOSER_BRIDGE_UNAVAILABLE_PROFILE_2
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
PRIVATE_WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
```

The user confirmed Chrome `Allow access to file URLs / ファイルのURLへのアクセスを許可する` is ON and subsequently reinstalled the Chrome extension. The failure still reproduced. Do not ask for another extension reinstall or toggle cycle without contradictory evidence.

## Browser/local-file diagnosis

```text
BROWSER_SURFACE: Chrome extension
BROWSER_FAMILY: Chrome
ATTACHED_PROFILE: Profile 2
EXTENSION_CONNECTED: YES
EXTENSION_INSTALLED_AND_ENABLED: YES
NATIVE_HOST_MANIFEST: PASS
WORKSPACE_FIXTURE_READABILITY: PASS — 6/6
WEB_APP_FILE_INPUT: present / connected / enabled / multiple
FILECHOOSER_EVENT: not fired
FILE_ASSIGNMENT: not reached
SELECTED_FILE_COUNT: 0
REGISTER_BUTTON: disabled
BROWSER_CONSOLE_ERRORS: 0
FAILURE_LAYER: before path assignment and local-file read
```

The six generated valid synthetic files are readable by Codex. No fixture has been uploaded or registered.

## Deterministic six-format evidence

The scoped tests cover:

- exact provider-payload hashing and canonical metadata for PDF/PPTX/XLSX/DOCX/TXT/EML;
- EML allowed headers/body and attachment exclusion;
- retrieved-source normalization through provider file identity plus authoritative `source_type`, `source_id` and `content_hash`;
- deduplication/redaction boundaries;
- FULL_OUTPUT six-format reference-only behavior without Pitchbook byte reads.

```text
SIX_FORMAT_REGISTRY: PASS — deterministic
EML_NORMALIZATION: PASS — deterministic
EML_ATTACHMENT_BOUNDARY: PASS — deterministic
AUTHORITATIVE_SOURCE_IDENTITY: PASS — deterministic
NORMALIZED_CITATION_MATRIX: PASS — deterministic
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS — deterministic
LOGIC_VALIDATION: PASS — 371/371
GITHUB_CI_ACTUALLY_RAN: NO
```

## Target-runtime matrix

```text
FORMAT_PDF: NOT RUN
FORMAT_PPTX: NOT RUN
FORMAT_XLSX: NOT RUN
FORMAT_DOCX: NOT RUN
FORMAT_TXT: NOT RUN
FORMAT_EML: NOT RUN
OPENAI_EXACT_SYNC: NOT RUN
OPENAI_FILE_SEARCH_QUERIES: 0
FULL_OUTPUT_RUNTIME_PREVIEW: NOT RUN
```

No format is labeled unsupported or failed because no provider operation was reached.

## Side-effect and integrity state

```text
DRIVE_REGISTRATION: NONE
BACKEND_MUTATION: NONE
AUDIT_MUTATION: NONE
OPENAI_MUTATION: NONE
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
BROAD_SYNC_OR_REINDEX: NO
DOC_000018_MUTATION: NO
OLD_LARGE_FIXTURE_MUTATION: NO
PRIVATE_WEB_APP_DEPLOYMENT: UNCHANGED / VERSION 63
OPENAI_PROVIDER_BASELINE: accepted 16 completed documents / untouched
CONFIDENTIAL_DATA: NONE
NEW_GOOGLE_OR_PROVIDER_RESOURCE: NONE
```

## Correct recovery target

The next recovery target is the ChatGPT desktop **Chrome plugin** in the `Plugins` UI, not the built-in `@Browser` capability.

OpenAI's Chrome-extension troubleshooting sequence calls for removing and re-adding the Chrome plugin in the ChatGPT desktop app when extension/native-host troubleshooting has not restored the connection. The sequence should be:

1. restart/update the ChatGPT desktop app if needed;
2. open ChatGPT desktop `Plugins`;
3. remove the **Chrome** plugin;
4. add/install the **Chrome** plugin again and finish its setup;
5. confirm the side chat loads in Chrome Profile 2;
6. confirm `Allow access to file URLs` remains ON on the newly installed extension;
7. resume the same `0021-CODEX-04`.

If the chooser still fails, try a fresh Work/Codex chat as a connection-state test without changing this GitHub Dispatch identity. If it remains reproducible, submit `/feedback` from the ChatGPT desktop app and include the affected chat/task ID when contacting OpenAI Support.

Do not create CODEX-05. Do not create a new Web App/API executable endpoint or bypass normal Pitchbook registration.

## Completion latch

```text
SIX_FORMAT_REGISTRY: PASS — deterministic
FORMAT_PDF: NOT RUN
FORMAT_PPTX: NOT RUN
FORMAT_XLSX: NOT RUN
FORMAT_DOCX: NOT RUN
FORMAT_TXT: NOT RUN
FORMAT_EML: NOT RUN
EML_NORMALIZATION: PASS — deterministic
EML_ATTACHMENT_BOUNDARY: PASS — deterministic / runtime NOT RUN
AUTHORITATIVE_SOURCE_IDENTITY: PASS — deterministic / runtime NOT RUN
NORMALIZED_CITATION_MATRIX: PASS — deterministic / runtime NOT RUN
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS — deterministic / runtime NOT RUN
OPENAI_SEARCH_MATRIX: NOT RUN
GEMINI_SEARCH_MATRIX: DISABLED_BY_CONFIG / DEFERRED
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
LOGIC_VALIDATION: PASS — 371/371
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
FINAL_PROVIDER_INTEGRITY: PASS — no provider mutation; accepted baseline preserved
RUNTIME_DEPLOYMENT_VERSION: 63 / unchanged
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: BROWSER_EXTENSION_FILE_CHOOSER_BRIDGE_UNAVAILABLE_PROFILE_2
FINAL_COMMIT: report/tracking commit after recovery wording correction
```

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
