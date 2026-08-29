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
- `docs/planning/work0023-bundle-installer-distribution.md`
- `docs/operations/company-bundle-installation.md`
- `docs/standards/apps-script-bundle-installer-standard.md`

## Acceptance evidence

```text
SOURCE_ARCHITECTURE: MODULAR / PRESERVED
BUNDLE_BUILD: PASS / REPRODUCIBLE
BUNDLE_TEST_PARITY: PASS
INSTALLER_IDEMPOTENCY: PASS
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

## Planned timing

Work 0023 begins after Work 0021 stabilizes the intended feature surface and before historical-material migration and final company-environment qualification.

No Codex dispatch is active yet. The natural first execution dispatch is reserved as `0023-CODEX-01` after ChatGPT refreshes the exact GitHub/runtime baseline.

WORK_ID: `0023`
DISPATCH_ID: `N/A`
BALL: `NONE`
STATUS: `PLANNED / READY_FOR_IMPLEMENTATION`
