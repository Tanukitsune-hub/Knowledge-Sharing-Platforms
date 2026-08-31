# Work 0021 — CODEX-04 browser/local-file upload diagnostic note

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Why this note exists

CODEX-04 stopped before runtime mutation because the browser-assisted local-file upload path reported missing Chrome extension file-URL access.

The user has verified that `Allow access to file URLs / ファイルのURLへのアクセスを許可する` is already ON.

Therefore do not treat that setting as the proven root cause.

The leading hypothesis is browser-state/profile mismatch, a stale browser task session, or a local-file upload bridge/path issue rather than the toggle itself. OpenAI documents that the ChatGPT desktop built-in browser has its own browser state and does not share the user's Chrome profile; the Codex Chrome extension is the path that uses an existing Chrome profile/session.

## Resume order

When the same CODEX-04 run resumes, diagnose before requesting any further user permission:

1. Determine the actual browser surface used by the task: Codex Chrome extension, ChatGPT desktop built-in browser, or another browser/profile/session.
2. If the Codex Chrome extension is required, verify the exact Chrome profile controlled by the task is the same profile where file-URL access is ON.
3. Refresh/reload the extension/browser task session if the permission may be stale.
4. Verify the generated synthetic fixture files exist inside the Codex-accessible project/workspace and are locally readable.
5. Distinguish between: local file cannot be read; local file can be read but cannot be assigned to `input[type=file]`; browser task is not attached to the intended Chrome extension/profile.
6. Do not mutate Drive, Backend, OpenAI, Web App deployment, or provider resources until the local upload bridge is positively available.
7. If current product/browser tooling already has another supported route to exercise the normal Pitchbook registration flow, it may be used. It must still go through normal product validation/registration; no direct row insertion or qualification-only bypass.
8. If a different native permission is genuinely required, stop with the exact setting, exact browser surface and evidence explaining why. Do not repeat the already-enabled file-URL toggle.

## Current safe state

```text
LOCAL_LOGIC_VALIDATION: PASS — 371/371
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
PRIVATE_WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
BLOCKER: BROWSER_LOCAL_FILE_UPLOAD_BRIDGE_UNAVAILABLE_PENDING_DIAGNOSIS
```

This is a continuation of `0021-CODEX-04`, not a new Dispatch.
