# Work 0028 report

WORK_ID: 0028
ACTIVE_DISPATCH_ID: 0028-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Current outcome

Work 0028 implementation and personal-DEV runtime qualification are complete and ready for ChatGPT final review. PR #38 remains Draft/Open/unmerged.

```text
BASE_MAIN: b0efbbfd8a5ce5c2e3b3d64f5ccba56838306ef2
EXACT_STARTING_REF: 10a0cc8ea6681f91eada5a9d4d4fbb81c3dba43e
IMPLEMENTATION_COMMIT: af96c145e999ac7bed9d7aa4862e41b87ad17c82
BUNDLE_COMMIT: 94edc01f71d7627af2cba4f216002b805b72094c
CURRENT_PRIVATE_WEB_APP_VERSION: 74
IMPLEMENTATION: PASS
LOGIC_VALIDATION: PASS / 456 of 456
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
WORK_ACCEPTANCE: MET
READY: YES / ChatGPT final review
BLOCKER: NONE
```

The accepted implementation uses a shared administrator password for routine AI Provider Settings mutations. Safe provider/model status remains readable while locked. Initial setup requires the legacy account administrator only while no shared credential exists; after setup, Google account/email alone does not authorize mutation.

The server stores only random salt, password verifier, random token-signing secret, and credential generation in Script Properties. Unlock returns a signed identity-free, expiry-free token bound to the current generation and a random nonce. The browser stores only that opaque token in `sessionStorage`, revalidates it server-side, and removes it on explicit logout. Password change rotates the credential generation and invalidates older tokens.

The supplied temporary personal-DEV value was used only through normal password-type UI inputs and remains the runtime credential for the user to rotate later. It is not hard-coded or persisted as plaintext. Final runtime state is configured and locked.

The same private Web App was updated once from version 73 to 74 after exact source delivery/readback. Root and AI Provider Settings rendered, locked status remained readable, bootstrap/unlock/logout/reload revalidation passed, and browser console errors were zero.

Work 0027 provider state is unchanged: OpenAI remains active; Gemini 3.7 remains `QUALIFIED_DISABLED` and hidden from normal users. Provider/model/File Search/FULL_OUTPUT calls and business-source mutations were zero.

Detailed evidence: `docs/handoffs/0028-CODEX-02-shared-admin-password-bootstrap-report.md`.

WORK_ID: 0028
ACTIVE_DISPATCH_ID: 0028-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
