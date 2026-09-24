# Work 0066 — company installation package

WORK_ID: 0066
DISPATCH_ID: N/A
BALL: NONE
STATUS: ACCEPTED
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

- text-file bundle `dist/Private_Assets_Intelligence_KnowledgeShare_bundle_v0.1.2.txt` (byte-identical to generated `.gs` bundle)
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
- text-file bundle blob SHA matches the generated bundle blob SHA (`f5d8df671509aaa6c49077fc1cfbb7dfe4abc836`).
- user receives the text-file bundle and guide for company-environment transfer.
- no company environment mutation occurs in Work0066.

## Completion

ChatGPT final delivery review: PASS。会社メール配送とguide render確認を完了。

WORK_ID: 0066
DISPATCH_ID: N/A
BALL: NONE
STATUS: ACCEPTED

## Accepted Delivery Evidence

- canonical installation doc updated for the current self-only pilot.
- Japanese Word guide created and rendered as 3 A4 pages; clipping/overlapなし。
- plain-text guide and release checksum file created.
- guide/checksum package sent to the established company-email route with attachments.
- final code delivery is `Private_Assets_Intelligence_KnowledgeShare_bundle_v0.1.2.txt` as an email attachment.
- attachment bytes: 1,300,560; SHA-256: `48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64`; current generated bundle / release manifestと一致。
- Gmail SENT readbackでattachment filename / text/plain / 1,300,560 bytesを確認。
- earlier bundle-body emails are superseded; company installation should use the final attached text file.
- company Workspace resources、Web App deployment、provider settings、business dataはWork0066では変更していない。

```text
WORK_0066_COMPLETE: YES
COMPLETION_LATCH: APPLIED
BLOCKER: NONE
```

## Delivery Artifact

```text
TEXT_BUNDLE: dist/Private_Assets_Intelligence_KnowledgeShare_bundle_v0.1.2.txt
SOURCE_BUNDLE: dist/KnowledgeShare.bundle.gs
TEXT_BUNDLE_BLOB_SHA: f5d8df671509aaa6c49077fc1cfbb7dfe4abc836
SOURCE_BUNDLE_BLOB_SHA: f5d8df671509aaa6c49077fc1cfbb7dfe4abc836
BYTE_IDENTITY: PASS
```

WORK_ID: 0066
DISPATCH_ID: N/A
BALL: NONE
STATUS: ACCEPTED
