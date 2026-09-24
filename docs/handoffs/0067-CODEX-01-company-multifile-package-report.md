# Work 0067 CODEX-01 — company multi-file package report

WORK_ID: 0067
DISPATCH_ID: 0067-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_1_LOW

## Outcome

Work0066でacceptedとなったPrivate Assets Intelligence 0.1.2のsingle-file bundleを、会社Apps Script editorで手動導入するための7個の.gsへ再パッケージした。canonical src/、既存bundle、release/schema、public surface、runtime behaviorは変更していない。dist/company-multifile/には、7個の.gs、同一bytesの7個のメール添付用.txt、accepted appsscript.jsonのcopy、checksum付きPACKAGE_MANIFEST.json、日本語INSTALL.mdを含めた。

## Release basis and package size

- MAIN_AT_START: bb0c571e7d106d622d8cc1350d77a45f8e07670d
- BUNDLE_RELEASE: 0.1.2
- SCHEMA: 8
- BUNDLE_SOURCE_COMMIT: d12857ffecab73d2f2b36725a63cf10f585a883a
- CANONICAL_BUNDLE_PAYLOAD_SHA256: 327c324ff57035bf92ee9160d1bf872941892e51d4aa9a0b5da88e17732acb06
- CANONICAL_BUNDLE_SHA256: 48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64

current mainのGit blobとrelease manifestは固定Release Basisに一致した。Windowsのcheckoutではcore.autocrlfによって作業ファイルだけがCRLF化されたため、.gitattributesで既存dist artifactと新packageのLF checkoutを固定した。既存bundle等のcommitted blobは変更していない。生成物のstaged Git blobを7個連結したbytesもaccepted bundleのGit blobと完全一致した。

| ファイル | bytes | server sections |
|---|---:|---:|
| 00_BundleResources.gs | 364,395 | header / release metadata / complete HTML resource map |
| 10_ServerPart01.gs | 146,395 | 11 |
| 20_ServerPart02.gs | 144,702 | 20 |
| 30_ServerPart03.gs | 155,598 | 11 |
| 40_ServerPart04.gs | 142,391 | 10 |
| 50_ServerPart05.gs | 162,337 | 4 |
| 60_ServerPart06.gs | 184,742 | 7 |

各.gsは400,000 bytes以下。server partはsection単位の連続分割で、142,391～184,742 bytesに収まった。

## Acceptance evidence

- GENERATED_GS_COUNT: 7
- MAX_FILE_BYTES: 364395
- CONCAT_BYTE_IDENTITY: PASS (1300560 bytes; staged Git blobsも一致)
- CONCAT_SHA256: 48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64
- CANONICAL_BUNDLE_SHA256: 48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64
- MANIFEST_PARITY: PASS (packaged appsscript.jsonはaccepted dist/appsscript.jsonとbyte-identical)
- TARGETED_TESTS: 3/3 PASS; generator --check PASS
- BUNDLE_VALIDATION: 30/30 PASS
- CANONICAL_CHECK: 690/690 PASS (npm run check 1回)
- DIFF_CHECK: PASS (git diff --cached --check / git diff HEAD --check)
- RUNTIME_SOURCE_CHANGED: NO
- DEPLOYMENT_MUTATION_COUNT: 0
- PROVIDER_CALL_COUNT: 0
- BUSINESS_DATA_MUTATION_COUNT: 0
- BLOCKER: NONE

focused testsでは、7個のraw連結と固定SHA-256、resource mapの全23 HTML項目、63 server sectionのBEGIN/END同一ファイル内保持、7ファイル個別parse、各.gsと対応.txtのbyte identity、manifest parity、再生成結果のbyte identityを確認した。既存bundle validationは63 server sources / 23 HTML resourcesとrelease hashを含む30/30 PASS。canonical checkはsource/public surfaceを含む690/690 PASS。

Git diffは.gitattributes、new generator、focused test、new package、本report、dispatchのみ。src/、scripts/bundle-source-order.json、dist/KnowledgeShare.bundle.gs、dist/release-manifest.json、dist/appsscript.jsonのGit blobに変更はない。diff hygieneでは、raw concatの境界を保持するため生成片の末尾に必要な空行だけを.gitattributesで許容し、その他のwhitespace checkを維持した。

## Installation boundary

日本語INSTALL.mdは7個の対応.gs/.txt、Apps Script manifest設定、既存会社導入ガイドの手順5以降への接続を記載する。現在の単一bundle貼付手順は、このalternative package使用時だけ7ファイル手順へ置き換える。会社へのメール送信、Apps Script保存・実行、Web App deployment、Workspace resource作成は本Dispatchで行っていない。

- LOGIC_VALIDATION: PASS
- TARGET_RUNTIME_QUALIFICATION: NOT APPLICABLE (accepted bundleのbyte-identical derived package)
- SIDE_EFFECT_STATE: DISABLED (repository artifact生成のみ)
- READY: YES (ChatGPT final review向け)
- WORK_0067_COMPLETE: NO
- COMPLETION_LATCH: NOT_APPLIED

## Shared Knowledge

- KNOWLEDGE_RETRIEVAL: PAT-0005
- KNOWLEDGE_APPLIED: PAT-0005
- NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0067
DISPATCH_ID: 0067-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
