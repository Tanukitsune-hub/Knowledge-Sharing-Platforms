# Work 0023 report

WORK_ID: `0023`
ACTIVE_DISPATCH_ID: `0023-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Executive conclusion

CODEX-01 successfully implemented and personally qualified the major one-file bundle and installer vertical slice. The architecture is valid and does not require a Strategy Reset.

Accepted CODEX-01 evidence:

```text
SOURCE_ARCHITECTURE: MODULAR_PRESERVED
BUNDLE_BUILD: PASS / reproducible
SOURCE_ORDER_AND_COVERAGE: PASS
HTML_RESOURCE_EMBEDDING: PASS / 22 resources
BUNDLE_PAYLOAD_HASH / FILE_CHECKSUM / MANIFEST: PASS
BUNDLE_PARSE_AND_TEST_PARITY: PASS
NORMAL_OPERATOR_MANUAL_SOURCE_FILES: 1
ONE_PASTE_SAVE_AND_EXECUTE: PASS
INSTALLER_IDEMPOTENCY: PASS / duplicates 0
PERSONAL_DEV_INSTALL: READY
WEB_APP_RENDER_FROM_BUNDLE: PASS / 11 pages
LOGIC_VALIDATION: PASS — 390/390
WORK_0021_RUNTIME_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
STRATEGY_RESET_REQUIRED: NO
```

Detailed report:

`docs/handoffs/0023-CODEX-01-deterministic-bundle-installer-and-first-runtime-qualification-report.md`

## Final-review blockers

### 1. Partial first-install ownership takeover

The installer currently treats an installation as first-run whenever completed `state.config` is absent. It writes the bootstrap administrator before setup, but after an interrupted setup another editor can enter the same first-run path and replace the bootstrap administrator. The first verified installer identity is not atomically latched across partial failure.

### 2. False READY from Web App URL existence

Readiness currently treats any non-empty `ScriptApp.getService().getUrl()` as sufficient for `READY` and “shareable” wording. URL existence does not establish the required restricted audience and execute-as settings. A guarded explicit administrator attestation is required unless a low-friction native inspection method is proven without adding a new API/service/scope.

### 3. Mutable global collision gate missing

The bundle validator rejects duplicate top-level functions, but it does not yet enforce the specified duplicate mutable-global and function/global collision gate.

Active instruction:

`docs/handoffs/0023-CODEX-02-installer-owner-latch-and-deployment-readiness-security-instruction.md`

## Current completion state

```text
DETERMINISTIC_BUNDLE_CORE: PASS
PERSONAL_DEV_ONE_PASTE_INSTALL: PASS
FIRST_INSTALL_OWNER_LATCH: FAIL / NOT IMPLEMENTED
PARTIAL_INSTALL_CROSS_USER_TAKEOVER_REJECTION: FAIL / NOT TESTED
WEB_APP_URL_ONLY_READY_REJECTION: FAIL
DEPLOYMENT_SECURITY_ADMIN_ATTESTATION: NOT IMPLEMENTED
MUTABLE_GLOBAL_COLLISION_GATE: INCOMPLETE
SHARED_DRIVE_DOMAIN_QUALIFICATION: PARTIAL_ENVIRONMENT_LIMITATION / later company gate
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: INSTALLER_SECURITY_COMPLETION_REQUIRED
```

## Classification

### BLOCKER

- atomic first-installer ownership across partial failure;
- deployment security confirmation before READY/shareable status;
- promised mutable global/function collision validation.

### FIX SOON

- GitHub CI is absent;
- Chrome automated native-file chooser remains unreliable;
- optional separate restricted control-folder flow needs company-environment validation.

### DEFERRED / separate Work

- Shared Drive/domain-user company qualification;
- Gemini recovery;
- representative large-file qualification;
- historical-material migration.

After CODEX-02 closes the three exact blockers and bounded personal-DEV validation passes, Work 0023 should stop and return PR #35 for final review rather than entering another general hardening loop.

WORK_ID: `0023`
ACTIVE_DISPATCH_ID: `0023-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
