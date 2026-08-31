# Work 0021 — CODEX-04 six-format OpenAI capability and final Work qualification report

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Outcome

CODEX-04 remains the active final Work 0021 dispatch. Deterministic six-format logic passed, but the target-runtime matrix did not start because the attached Chrome extension could not open or expose a native file chooser for the normal Pitchbook registration flow.

This run replaced the earlier unproven permission-toggle label with a narrower evidence-backed classification:

```text
BLOCKER: BROWSER_EXTENSION_FILE_CHOOSER_BRIDGE_UNAVAILABLE_PROFILE_2
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
PRIVATE_WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
```

The user reported that Chrome `Allow access to file URLs / ファイルのURLへのアクセスを許可する` is already ON. This run did not ask for the toggle again and did not independently claim that the toggle is OFF.

## Work Contract and evidence hierarchy

Mode: `QUALIFICATION` with a read-only browser-path diagnostic before any runtime mutation.

Evidence order:

1. current attached browser surface/profile and bundled extension/native-host diagnostics;
2. direct workspace file readability;
3. visible Web App file-input/drop-zone state;
4. file-chooser/native-window observation after bounded activation paths;
5. local deterministic tests;
6. user-reported extension toggle state.

Mutation budget remained zero until the local upload bridge became positively available. It never became available, so no Drive, Backend, Audit, OpenAI, provider, Apps Script source, version or deployment operation was authorized or executed.

## Browser/local-file diagnosis

### Actual browser surface and profile

```text
BROWSER_SURFACE: Chrome extension
BROWSER_FAMILY: Chrome
ATTACHED_PROFILE: Profile 2
PROFILE_LAST_USED: YES
EXTENSION_CONNECTED: YES
EXTENSION_INSTALLED_AND_ENABLED: YES
NATIVE_HOST_MANIFEST: PASS
PRIVATE_WEB_APP_TARGET: version 63 / WEB_APP / USER_DEPLOYING / MYSELF
```

This was not the ChatGPT desktop built-in browser and not another Chrome profile.

### Fixture readability

The six generated valid synthetic files were copied temporarily into a workspace-local diagnostic directory and read byte-for-byte by the Codex process:

```text
PDF: 954 bytes
PPTX: 45,493 bytes
XLSX: 1,974 bytes
DOCX: 8,550 bytes
TXT: 73 bytes
EML: 678 bytes
WORKSPACE_FIXTURE_READABILITY: PASS
```

The temporary workspace copies were removed after diagnosis. No fixture was uploaded or registered. The reproducible originals remain outside Git in the existing temporary generation directory.

### Failure layer

The rendered private Web App exposed one connected, enabled, multiple-file `input[type=file]`. The input is intentionally hidden and the visible `#pitchbook-drop-zone` is the user activation surface.

Bounded activation evidence:

```text
VISIBLE_DROP_ZONE_PLAYWRIGHT_CLICK: chooser not opened / 3-second bridge timeout
VISIBLE_DROP_ZONE_KEYBOARD_ENTER: chooser not opened / 3-second bridge timeout
VISIBLE_DROP_ZONE_DOM_CUA_CLICK: no native chooser window observed
FRESH_PROFILE_2_WINDOW: same result
BROWSER_CONSOLE_ERRORS: 0
```

Because all failures occurred before a file path was supplied, this is not a local-file read failure and not a provider/application upload error. The supported `filechooser.setFiles(...)` assignment stage was never reached.

The attached browser security policy did not permit programmatic inspection of `chrome://extensions` or direct `file://` navigation. Therefore this run does not independently assert the current toggle value; it records the user's ON confirmation and the fresh same-profile bridge failure separately.

### Alternative existing route check

The existing Apps Script public facade was probed read-only through the Apps Script Execution API. The existing project did not permit that execution route (`PERMISSION_DENIED`). No API executable deployment, new endpoint, direct row insertion or qualification-only bypass was created.

## Deterministic six-format evidence

The scoped tests cover:

- exact provider-payload hashing and canonical metadata for PDF/PPTX/XLSX/DOCX/TXT/EML;
- EML allowed headers/body and attachment exclusion;
- retrieved-source normalization through provider file identity plus authoritative `source_type`, `source_id` and `content_hash`;
- deduplication/redaction boundaries;
- FULL_OUTPUT six-format reference-only behavior without Pitchbook byte reads.

Required validation is recorded after the final rerun in this same report commit.

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

## Resume action

Do not repeat the already-enabled file-URL toggle. Fully exit all Chrome processes and reopen Chrome Profile 2 so the extension and native file-chooser permission state are reloaded, then resume this same `0021-CODEX-04` dispatch. If the same fresh-process failure persists, reinstall the Browser plugin from the ChatGPT plugin UI before the next resume.

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
FINAL_COMMIT: reported from the pushed PR head
```

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
