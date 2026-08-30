# Work 0023 — generated Apps Script bundle and low-friction installer

WORK_ID: `0023`
DISPATCH_ID: `N/A`
BALL: `NONE`
STATUS: `PLANNED / READY_FOR_IMPLEMENTATION`
MODE: `BUILD / QUALIFICATION`

## Primary outcome

Preserve the modular GitHub development architecture while delivering a generated single-file Apps Script distribution and one idempotent installer that a non-specialist can use in a fresh company Google Workspace environment.

## Authoritative sources

- `docs/decisions/modular-source-single-bundle-distribution.md`
- `docs/decisions/bundle-integrity-and-installer-security.md`
- `docs/planning/work0023-bundle-installer-distribution.md`
- `docs/operations/company-bundle-installation.md`
- `docs/standards/apps-script-bundle-installer-standard.md`

The security/integrity clarification governs conflicts involving bundle hashing, installer exposure, OAuth/service parity, or one-file feasibility.

## Acceptance evidence

```text
SOURCE_ARCHITECTURE: MODULAR / PRESERVED
BUNDLE_BUILD: PASS / REPRODUCIBLE
BUNDLE_TEST_PARITY: PASS
INSTALLER_IDEMPOTENCY: PASS
INSTALLER_UNAUTHORIZED_CALL_REJECTION: PASS
INSTALLER_FIRST_RUN_IDENTITY_GATE: PASS
BUNDLE_HASH_CANONICALIZATION: PASS
BUNDLE_FILE_CHECKSUM: PASS
OAUTH_AND_SERVICE_PARITY: PASS
ONE_PASTE_SAVE_AND_EXECUTE: PASS
FRESH_SHARED_DRIVE_INSTALL: PASS
WEB_APP_RENDER_FROM_BUNDLE: PASS
COMPANY_INSTALL_GUIDE: PASS
NORMAL_OPERATOR_MANUAL_SOURCE_FILES: 1
BLOCKER: NO
```

## Fixed product boundaries

- `src/` remains authoritative and modular;
- `dist/KnowledgeShare.bundle.gs` is generated and never hand-edited;
- all required HTML resources are embedded in the distribution bundle;
- installer reuses the existing setup/validation engine;
- the normal company route does not use a personal Drive template;
- AI providers and recurring AI synchronization remain disabled by default;
- Gmail labels/scopes are not added because Knowledge Share does not require them;
- no major application/business-logic rewrite is authorized;
- unavoidable platform actions are described accurately rather than hidden.

## Security and integrity boundaries

- `installKnowledgeShare()` and `checkKnowledgeShareReadiness()` are editor-visible but must be treated as externally invocable because any top-level function without a trailing underscore may be called by name from HTML Service;
- no normal page links to them, and strict server-side active-user/administrator authorization must run before any mutation;
- first installation requires an identified active user and an unambiguous active/effective-user identity boundary;
- all setup, validation, migration, trigger, provider, and Drive helpers remain private;
- the bundle header must not contain an undefined ordinary hash of its own final bytes;
- use a versioned canonical payload hash in the bundle and record the actual final-file SHA-256 in `dist/release-manifest.json`;
- fresh installation must verify actual OAuth/service behavior against the approved manifest contract;
- the exact generated bundle must be proven pasteable, saveable, selectable, and executable as one file in the target Apps Script runtime.

## Planned timing

Work 0023 begins after Work 0021 stabilizes the intended feature surface and before historical-material migration and final company-environment qualification.

No Codex dispatch is active yet. The natural first execution dispatch is reserved as `0023-CODEX-01` after ChatGPT refreshes the exact GitHub/runtime baseline.

WORK_ID: `0023`
DISPATCH_ID: `N/A`
BALL: `NONE`
STATUS: `PLANNED / READY_FOR_IMPLEMENTATION`
