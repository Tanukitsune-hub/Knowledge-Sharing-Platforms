# Work 0028 — CODEX-02 shared administrator password bootstrap report

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Outcome

The shared administrator-password mode is implemented, deterministically validated, delivered once, and qualified through the normal personal-DEV Web App UI on immutable version 74. The page remains readable while locked; legacy Google-account authority is limited to first bootstrap; every provider/model mutation now requires a server-validated, identity-independent shared administrator token.

The supplied temporary DEV bootstrap value was entered only into password-type UI fields. It is not present as a product default or fallback and was not persisted as plaintext in source, Script Properties, Sheets, Audit, logs, browser storage, fixtures, reports, or GitHub. The runtime remains on that temporary value for the user to rotate later through the implemented password-change UI.

After the scoped result was pushed, a fresh GitHub-source-of-truth check found that `origin/main` had independently registered an unrelated UI/UX design outcome under the same Work ID 0028. PR #38 is therefore conflicting in the two Work control files and the Work registry. No merge or conflict resolution was attempted: choosing which distinct outcome retains Work 0028, or renumbering either outcome, is a controller decision outside this dispatch.

```text
TERMINAL_OUTCOME: QUALIFIED_SHARED_ADMIN_MODE
IMPLEMENTATION: PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
WORK_ACCEPTANCE: NOT_MET / GitHub reconciliation pending
GITHUB_DELIVERY: BLOCKED
READY: NO
BLOCKER: GITHUB_WORK_ID_COLLISION
```

## Git and implementation

```text
BASE_MAIN: b0efbbfd8a5ce5c2e3b3d64f5ccba56838306ef2
EXACT_STARTING_REF: 10a0cc8ea6681f91eada5a9d4d4fbb81c3dba43e
IMPLEMENTATION_COMMIT: af96c145e999ac7bed9d7aa4862e41b87ad17c82
BUNDLE_COMMIT: 94edc01f71d7627af2cba4f216002b805b72094c
FINAL_COMMIT: this report/tracking commit; resolve from PR #38 head and final return
LATEST_ORIGIN_MAIN_OBSERVED: 8a88c027764756a566e494799bba34afe98587c9
BRANCH: agent/0028-shared-admin-password
PR: #38 / Draft / Open / unmerged / conflicting
```

The implementation adds one reusable server auth primitive with Apps-Script-native HMAC, random salt, random signing material, credential generation, constant-time comparison, script-lock-protected bootstrap/rotation, and an opaque signed token containing only version, generation, random nonce, and signature. The client stores only that token in `sessionStorage`, revalidates it with the server before enabling mutation controls, and removes it on explicit logout.

The initial shared credential can be created only once by the existing legacy administrator. After creation, legacy account/email identity is not consulted by the routine mutation dispatcher. Password rotation requires a valid current token, increments generation, rotates verifier/signing material, invalidates all earlier tokens, and returns a coherent replacement token.

## Deterministic validation

```text
FOCUSED_SHARED_ADMIN_PROVIDER_TESTS: PASS / 59 of 59
NPM_RUN_CHECK: PASS / 456 of 456
NPM_RUN_CHECK_BUNDLE: PASS / 27 of 27
AGENT_FOUNDATION: PASS
TEMPORAL_VALIDATION: PASS / 3 helpers / 173 regression lines / Asia-Tokyo
PUBLIC_SURFACE_VALIDATION: PASS / 31 normal / 3 guarded / 757 private
BUNDLE_SOURCE_MODE_PARITY: PASS / 59 GS / 22 HTML
BUNDLE_REPRODUCIBILITY: PASS / repeated builds byte-identical
SECURITY_DIFF_SCAN: PASS / complete / reportable findings 0
GIT_DIFF_CHECK: PASS
SECRET_SAFETY_CHECKS: PASS
```

Required negative and recovery cases cover unauthorized/repeated bootstrap, wrong password, missing/malformed/tampered/old-generation tokens, partial or malformed credential state, legacy-account-only mutation denial, token authorization under different fake Google identities, read-only locked state, password rotation, new-password unlock, logout, reload/revalidation, and safe-response redaction. Tests execute the production `.gs` auth and mutation logic rather than a parallel implementation.

Generated release evidence:

```text
BUNDLE_BYTES: 1093025
BUNDLE_LINES: 18424
BUNDLE_SHA256: b3cd47170ad277760a096bf6bd96b4d33d67a01f582cddc884ff6a52ff28bcec
MANIFEST_SHA256: e015d4958603c7643c43355c0dabbbefc5f34a503dce715c8f1a9d3be4fffb41
INSTALL_SHA256: ea4f9554d09d357af28f01a3fe528da6326f55904ebfeded04d48bed303b3b74
```

## Source delivery and deployment

The exact tested modular source was delivered once. One authoritative Apps Script API readback immediately after delivery matched every deployable local file after newline normalization.

```text
SOURCE_DELIVERY: 1
SOURCE_READBACK: PASS / 82 of 82
MISSING_DEPLOYABLE_FILES: 0
EXTRA_DEPLOYABLE_FILES: 0
CONTENT_MISMATCHES: 0
NEW_IMMUTABLE_VERSION: 1 / version 74
SAME_PRIVATE_WEB_APP_UPDATE: 1 / 73 -> 74
DEPLOYMENT_ENTRYPOINT: WEB_APP / HTTPS /exec
EXECUTE_AS: USER_DEPLOYING
ACCESS: MYSELF
VERSION_67_DEPLOYED: NO
VERSION_75_OR_HIGHER_CREATED: NO
```

Before mutation, the chain from exact Git source through the existing personal-DEV Apps Script project, saved source, version 73, same Web App `/exec`, deployment owner execution, owner-only access, signed-in bootstrap administrator, and observed guarded page was proven. The authoritative API update targeted the unique version-73 Web App and read back the same Web App at version 74. No new deployment or endpoint was created.

## Target-runtime qualification

```text
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
AI_PROVIDER_SETTINGS_RENDER_AND_BOOTSTRAP: PASS
LOCKED_SAFE_STATUS_READ: PASS
INITIAL_CREDENTIAL_STATE: unconfigured / locked
LEGACY_ADMIN_BOOTSTRAP: PASS / normal UI
POST_BOOTSTRAP_UNLOCKED: PASS / server validated
EXPLICIT_LOGOUT: PASS
ACCOUNT_ONLY_AFTER_BOOTSTRAP: DENIED / canMutate false
SHARED_PASSWORD_REUNLOCK: PASS / normal UI
IDENTITY_INDEPENDENT_SESSION: PASS / deterministic fake-session evidence
SESSIONSTORAGE_RELOAD_PERSISTENCE: PASS
POST_RELOAD_SERVER_REVALIDATION: PASS
PASSWORD_CHANGE_UI: PRESENT / enabled only while unlocked
PASSWORD_ROTATION: PASS / deterministic production-logic test
FINAL_ADMIN_STATE: configured / locked
APPLICATION_BLOCKING_CONSOLE_ERRORS: 0
```

The runtime password was deliberately not rotated during qualification. Rotation behavior is fully implemented and deterministically proven, while avoiding an unnecessary second secret and leaving the disclosed temporary DEV credential available for the user's later normal-UI change.

## Integrity and side effects

```text
OPENAI_LIVE_CALLS: 0
GEMINI_LIVE_CALLS: 0
FULL_OUTPUT_LIVE_CALLS: 0
MODELS_OR_FILE_SEARCH_CALLS: 0
API_KEY_CHANGES: 0
PROVIDER_MODEL_POLICY_CHANGES: 0
EXISTING_STORE_OR_BUSINESS_SOURCE_MUTATIONS: 0
NEW_WEB_APP_OR_LIBRARY: 0
SHARED_ADMIN_SCRIPT_PROPERTIES: 4 non-plaintext values / intended
OPENAI_STATUS: preserved / active
GEMINI_MODEL: gemini-3.7-flash preserved
GEMINI_STATUS: QUALIFIED_DISABLED preserved
NORMAL_USER_GEMINI_VISIBILITY: false preserved
GITHUB_CI_ACTUALLY_RAN: NO
```

## Classification

```text
IMPLEMENTATION: PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: CLEAN / intended shared credential plus version-74 deployment only
FUNCTIONAL_ACCEPTANCE: MET
GITHUB_DELIVERY: BLOCKED / latest main assigns a different outcome to Work 0028
READY: NO
BLOCKER: GITHUB_WORK_ID_COLLISION
FOLLOW_UP: user rotates the temporary DEV password through the normal management UI
CONTROLLER_ACTION_REQUIRED: assign distinct Work identity or explicitly reconcile the two Work 0028 outcomes
```

## Shared Knowledge

```text
KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: YES
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
