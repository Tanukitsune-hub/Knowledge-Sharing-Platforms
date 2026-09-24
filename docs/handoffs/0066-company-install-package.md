# Work 0066 — company installation package

WORK_ID: 0066
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: IN_PROGRESS
MODE: BUILD
VALIDATION_TIER: TIER_1_LOW

## Primary Outcome

現在accept済みのPrivate Assets Intelligenceを会社環境へ初回導入できるよう、既存のgenerated bundle / release識別情報 / 日本語導入手順を会社メールで利用可能な形にまとめて配送する。

## Release Basis

- product: Private Assets Intelligence
- bundle release: 0.1.2
- schema: 8
- bundle source commit: `d12857ffecab73d2f2b36725a63cf10f585a883a`
- bundle file SHA-256: `48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64`
- bundle payload SHA-256: `327c324ff57035bf92ee9160d1bf872941892e51d4aa9a0b5da88e17732acb06`
- Work0065 qualified runtime release source: `ff953fe0bd2a79d108ad2e981700c947e6bb07ad`
- accepted served version: 36

The generated bundle / release manifest pair remains the installation artifact. Work0065 docs-only merge after the bundle build does not require a regenerated bundle.

## Fastest Safe Decisive Action

1. Current `dist/KnowledgeShare.bundle.gs` and release identity are used without hand editing.
2. Japanese company-install guide is created for the current pilot boundary.
3. Company email delivery is used because the company PC does not rely on personal Google Drive.
4. Initial pilot Web App access stays self-only, matching Work0065.
5. Actual company installation, provider configuration, or access broadening is not performed by ChatGPT in this Work.

## Required Delivery

- generated bundle content
- release/checksum information
- Japanese installation guide
- clear statement that AI providers remain disabled until separately configured
- current pilot security boundary: execute as self / access self only

## Non-Goals

- company Workspace resource creation
- Apps Script deployment execution
- API key configuration
- provider calls
- domain-wide sharing
- schema/data migration
- source regeneration or code modification

## Acceptance Evidence

- canonical company installation doc updated for current self-only pilot.
- guide is consistent with `dist/INSTALL.md`, `src/appsscript.json`, security/runtime policy, and Work0065 accepted boundary.
- release/checksum values match `dist/release-manifest.json`.
- user receives the bundle content and guide through the established company-email path.
- no company environment mutation occurs in Work0066.

## Completion

ChatGPT final delivery review after email send and artifact checks.

WORK_ID: 0066
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: IN_PROGRESS
