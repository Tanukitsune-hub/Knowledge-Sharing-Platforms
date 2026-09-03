# Work 0023 — CODEX-02 installer ownership and deployment-readiness security report

WORK_ID: `0023`
DISPATCH_ID: `0023-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `REVIEW_FIX -> FINAL PERSONAL-DEV QUALIFICATION`

## Outcome

The three CODEX-02 release blockers are closed without changing the modular-source architecture, adding a deployment-management API, touching the accepted Work 0021 runtime, or calling an AI provider.

The generated company kit remains a deterministic one-file Apps Script distribution. The final personal-DEV candidate was saved to the existing isolated project, exact-read back, executed, administrator-attested, rerun idempotently, and deployed as immutable version 2 through one update of the same restricted Web App.

## Implementation

### Atomic first-installer ownership

- `KSP_INSTALLER_OWNER_JSON` is claimed under the installer script lock before setup or status mutation.
- A first claim requires a non-empty matching active/effective identity and persists one normalized owner.
- Partial resume is restricted to the latched owner. A different or concurrent claimant fails before property, resource, or status mutation.
- Latch, bootstrap administrator, and completed configuration are reconciled fail-closed.
- The pre-latch personal-DEV installation has a bounded migration path only for an existing authoritative administrator.
- The owner is never included in normal readiness output.

### Deployment-security readiness

- A Web App URL without matching attestation returns `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`.
- `confirmKnowledgeShareDeploymentSecurity()` is a guarded operator entry point and is absent from normal HTML.
- The confirmation requires the active authoritative administrator and persists only a version, SHA-256 deployment identity, and timestamp.
- Readiness becomes `READY` only after the administrator manually verifies execute-as and restricted audience settings and runs the confirmation.
- Changed deployment identity invalidates the attestation. Documentation requires re-attestation after any later manual deployment-setting change, even when the URL does not change.
- `ScriptApp.getService().getUrl()` may return the `/dev` URL while development-mode code is running. The strict parser accepts only exact Google `/exec` or `/dev` shapes and canonicalizes the same deployment identifier to `/exec` before hashing. HTTP, look-alike hosts, malformed paths, trailing paths, and query strings remain rejected.

### Bundle collision gate

- Bundle validation inventories top-level `var`, `let`, and `const` declarations.
- It fails on duplicate global declarations and function/global collisions.
- Scanner tests cover comments, strings, regex literals, templates, and nested scopes.
- The real generated bundle passes without an exception allowlist.

## Deterministic evidence

```text
FOCUSED_INSTALLER_TESTS: PASS — 15/15
CANONICAL_TESTS: PASS — 402/402
APPS_SCRIPT_SOURCE_PARSE: PASS — 59 server files / 22 HTML resources
TEMPORAL_VALIDATION: PASS — 3 helpers / 173 regression lines
PUBLIC_SURFACE_VALIDATION: PASS — 30 normal / 3 guarded / 679 private
BUNDLE_VALIDATION: PASS — 59 server sources / 22 embedded HTML resources
BUNDLE_REPRODUCIBILITY: PASS
AGENT_FOUNDATION: PASS
GIT_DIFF_CHECK: PASS
NO_NEW_OAUTH_SCOPE_OR_ADVANCED_SERVICE: PASS
NO_GMAIL_SCOPE: PASS
```

Final generated release identity:

```text
RELEASE_VERSION: 0.1.2
SCHEMA_VERSION: 6
BUNDLE_SOURCE_COMMIT: b3556585bd4e9240793ee04a6a5f5f9d6e679561
BUNDLE_BYTES: 946446
BUNDLE_CHARACTERS: 912702
BUNDLE_LINES: 15720
SERVER_SOURCE_COUNT: 59
EMBEDDED_HTML_COUNT: 22
```

Hashes are recorded in `dist/release-manifest.json`; they are not repeated in this report.

## Personal-DEV target-runtime qualification

Qualification used only the existing isolated folder under `マイドライブ/Chat GPT-Codex-Only/KSP Work 0023 Qualification`.

```text
FINAL_BUNDLE_SAVE: PASS
FINAL_BUNDLE_EXACT_READBACK: PASS — LF-normalized bytes and SHA-256 matched
SELECTABLE_ENTRYPOINTS: PASS — install / readiness / deployment confirmation
URL_WITHOUT_ATTESTATION: PASS — ACTION_REQUIRED, never READY/shareable
MANUAL_DEPLOYMENT_SETTING_REVIEW: PASS — execute as deploying administrator / access self-only in isolated DEV
GUARDED_ADMIN_ATTESTATION: PASS
READINESS_AFTER_ATTESTATION: PASS — READY
INSTALLER_RERUN: PASS
READINESS_RERUN: PASS
RESOURCE_DUPLICATES: 0 — existing 2 folders and 3 spreadsheets retained
NEW_IMMUTABLE_VERSION: 1 — isolated version 2
EXISTING_WEB_APP_UPDATES: 1 — same isolated restricted deployment
WEB_APP_INDEX_RENDER: PASS
WEB_APP_KNOWLEDGE_SEARCH_RENDER: PASS
```

The first runtime attempt exposed only a development-mode `/dev` URL normalization mismatch. It stopped before versioning or deployment, was repaired against the documented Apps Script behavior, and did not create or duplicate installation resources. A transient browser editor buffer concatenation was also detected by exact readback; the buffer was cleared before the final candidate was saved and run.

A second safe Google identity was not available, so cross-user takeover was not attempted natively. The hostile path is covered deterministically with injected different-user, blank-user, conflict, partial-failure, sequential-claim, and lock-contention cases.

## Side-effect and scope state

```text
WORK_0021_RUNTIME_MUTATED: NO
WORK_0021_VERSION_OR_DEPLOYMENT_CREATED: NO
PERSONAL_DEV_RESOURCES_CREATED: 0
PERSONAL_DEV_RESOURCES_DELETED: 0
PERSONAL_DEV_VERSION_CREATED: 1
PERSONAL_DEV_EXISTING_WEB_APP_UPDATED: 1
PROVIDER_CONFIGURATION_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
COMPANY_OR_CONFIDENTIAL_DATA_USED: NO
```

## Completion latch

```text
FIRST_INSTALL_OWNER_LATCH: PASS
PARTIAL_INSTALL_CROSS_USER_TAKEOVER_REJECTION: PASS — deterministic hostile-call evidence
ATOMIC_FIRST_OWNER_CLAIM: PASS
WEB_APP_URL_ONLY_READY_REJECTION: PASS — deterministic and personal-DEV runtime
DEPLOYMENT_SECURITY_ADMIN_ATTESTATION: PASS
ATTESTATION_URL_BINDING_AND_INVALIDATION: PASS
NORMAL_USER_ATTESTATION_REJECTION: PASS
MUTABLE_GLOBAL_COLLISION_GATE: PASS
BUNDLE_BUILD_AND_HASHES: PASS
BUNDLE_TEST_PARITY: PASS
ONE_PASTE_SAVE_AND_EXECUTE: PASS — final exact candidate
INSTALLER_IDEMPOTENCY: PASS — duplicates 0
OAUTH_AND_SERVICE_PARITY: PASS
FRESH_INSTALL_OR_UPGRADE: PASS — existing isolated personal-DEV upgraded
FRESH_INSTALL_LOCATION: PERSONAL_DEV_ONLY
WEB_APP_RENDER_FROM_BUNDLE: PASS
WORK_0021_RUNTIME_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
LOGIC_VALIDATION: PASS
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: YES
BLOCKER: NONE
FINAL_COMMIT: reported in the CODEX-02 return after final tracking commit
```

## Residual routing

- Company Shared Drive/domain-user qualification remains the planned company-environment gate.
- GitHub CI remains absent and is not a CODEX-02 blocker.
- No CODEX-03 is required for the closed release-contract findings.

WORK_ID: `0023`
DISPATCH_ID: `0023-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
