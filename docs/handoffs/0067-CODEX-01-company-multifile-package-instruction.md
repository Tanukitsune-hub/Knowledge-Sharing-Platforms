# Work 0067 CODEX-01 — company multi-file installation package

WORK_ID: 0067
DISPATCH_ID: 0067-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_1_LOW

## Goal

Private Assets Intelligenceのcurrent accepted company-install bundleを、会社Apps Script editorで手動保存しやすい7個の`.gs`ファイルへdeterministically再パッケージする。

これはruntime source refactorではない。canonical `src/`、runtime behavior、release/schema、public surfaceを変更せず、現在のgenerated bundleを複数Apps Script filesとして安全に貼り付けられるderived installation artifactを作る。

## Read First

- nearest `AGENTS.md`
- `docs/handoffs/0066-company-install-package.md`
- `docs/handoffs/0066-completion-report.md`
- `scripts/build-apps-script-bundle.cjs`
- `scripts/bundle-source-order.json`
- `dist/release-manifest.json`
- `dist/KnowledgeShare.bundle.gs`

恒久ルールはAGENTS.md等に従い、本instructionへ再展開しない。

## Fixed Release Basis

Work0066でaccepted済みのcurrent artifactをbasisとする。

```text
PRODUCT: Private Assets Intelligence
BUNDLE_RELEASE: 0.1.2
SCHEMA: 8
BUNDLE_SOURCE_COMMIT: d12857ffecab73d2f2b36725a63cf10f585a883a
CANONICAL_BUNDLE_FILE_SHA256: 48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64
CANONICAL_BUNDLE_PAYLOAD_SHA256: 327c324ff57035bf92ee9160d1bf872941892e51d4aa9a0b5da88e17732acb06
```

上記hashとrepositoryのcurrent `dist/release-manifest.json` / `dist/KnowledgeShare.bundle.gs`が一致しなければ、実装せずBLOCKEDで返す。

## Design Decisions — Closed

1. `src/`の多数の`.gs`ファイルは統合・rename・削除しない。
2. `scripts/bundle-source-order.json`のcanonical server/html inventoryは変更しない。
3. `dist/KnowledgeShare.bundle.gs`は変更・再生成しない。
4. derived packageはexactly 7個の`.gs`ファイルとする。`appsscript.json`は別。
5. canonical bundleのheader / release metadata / complete `KSP_BUNDLED_HTML_RESOURCES` assignmentは、1個のstandalone resource fileに丸ごと保持する。HTML map自体を分割・書換えしない。
6. server source sectionsは、`// ===== BEGIN src/... =====`〜対応するENDまでのcomplete section単位で、残り6ファイルへcontiguousかつbalancedに分割する。section内部では切らない。
7. 7ファイルをdocumented orderでbyte-for-byte連結すると、current canonical bundleを完全復元できる形を最優先する。
8. runtime function、identifier、property key、schema、prompt、HTML contentは変更しない。
9. single-file bundleは今後もcanonical distribution artifactとして保持し、このmulti-file packageはmanual company-install alternativeとする。

## Fastest Safe Decisive Action

current canonical bundleを入力にする小さなgeneratorを追加し、7-file packageを生成する。source semanticsを再編集しない。

推奨出力directory:
`dist/company-multifile/`

file namingは安定した数字prefixを使う。例:
- `00_BundleResources.gs`
- `10_ServerPart01.gs`
- `20_ServerPart02.gs`
- `30_ServerPart03.gs`
- `40_ServerPart04.gs`
- `50_ServerPart05.gs`
- `60_ServerPart06.gs`

exact nameは上記を基本とし、必要な理由がない限り変更しない。

## Required Scope

- deterministic generator script
- exactly 7 generated `.gs` files
- canonical `appsscript.json`のcopy
- multi-file package manifest:
  - ordered filenames
  - bytes / SHA-256 per file
  - concatenated SHA-256
  - canonical bundle SHA-256
  - release/schema/source commit
- short Japanese INSTALL guide:
  - Apps Scriptで7個のscript filesを作る
  - 添付text / generated fileの内容を対応fileへ貼る
  - save
  - manifest設定
  - その後のinstall flowはcurrent accepted company-install guideへ従う
- company-email delivery用に、7個のcode fileと同一内容のplain-text artifactを生成するか、既存のdelivery toolingから安全にtextとして取り出せる明確なartifactを用意する
- focused tests
- Codex report

必要なら`package.json`へbuild/check scriptを追加してよい。

## Size Constraint

目的はApps Script editorでのmanual save負荷を下げること。

- each generated `.gs` file: target <= 400,000 bytes
- unavoidableなresource fileが400,000 bytesを僅かに超える場合のみ、450,000 bytesをhard maximumとする
- 450,000 bytesを超える場合は設計を勝手に変えずStrategy ResetしてChatGPTへ返す

server partsは6個の間で大きく偏らないよう、source-section boundaryを保ったままbalancedにする。

## Acceptance Evidence

必須:

1. exactly 7 generated `.gs` files。
2. 7 filesをmanifest orderでraw concatしたbytesが`dist/KnowledgeShare.bundle.gs`と完全一致。
3. concatenated SHA-256 = `48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64`。
4. no source section is split internally; each BEGIN/END pair stays in one generated file。
5. each generated file is syntactically valid as an Apps Script/JavaScript file under existing local validation approach。
6. generated `appsscript.json` is byte/content equivalent to current accepted manifest。
7. source/runtime/release/schema/public surface changes = 0。
8. targeted package tests PASS。
9. existing bundle validation PASS。
10. canonical `npm run check` PASS once。
11. `git diff --check` PASS。
12. generated install guide is Japanese and does not tell the operator to paste the 1.25M-character single bundle。

Evidence hierarchy:
1. byte identity / SHA-256 parity with accepted canonical bundle
2. deterministic package tests
3. existing bundle validation / canonical checks
4. static inspection

## Non-Goals

- canonical `src/` consolidation
- runtime behavior changes
- release/schema bump
- Web App deploy/update
- Apps Script project mutation
- company Workspace resource creation
- provider setup/call
- API key / secret handling
- domain sharing
- real-data migration
- UI/UX changes
- refactoring unrelated source

## Authorization / Side Effects

Repository changes and generated artifacts only。
No deployment、provider call、company environment write、business-data mutation。

public GitHubへprivate script ID、deployment ID、private URL、account identifier、credentials等を記録しない。

## Execution Budget / Strategy Reset

- implementation strategy: 1
- speculative repair attempts per failure class: max 2
- deployment mutations: 0

Reset and return if:
- current canonical bundle/hash basis differs from Fixed Release Basis
- exact byte reconstruction cannot be preserved without semantic source rewriting
- resource file exceeds hard 450,000-byte limit
- existing bundle/canonical checks reveal material regression
- requirement would force canonical `src/` restructuring

## Delivery

Create branch:
`work/0067-company-multifile-package`

Open a Draft PR.

Report:
`docs/handoffs/0067-CODEX-01-company-multifile-package-report.md`

Update:
`docs/handoffs/0067-dispatches.md`

Report minimum:
```text
GENERATED_GS_COUNT
MAX_FILE_BYTES
CONCAT_BYTE_IDENTITY
CONCAT_SHA256
CANONICAL_BUNDLE_SHA256
MANIFEST_PARITY
TARGETED_TESTS
BUNDLE_VALIDATION
CANONICAL_CHECK
DIFF_CHECK
RUNTIME_SOURCE_CHANGED
DEPLOYMENT_MUTATION_COUNT
PROVIDER_CALL_COUNT
BUSINESS_DATA_MUTATION_COUNT
BLOCKER
```

ChatGPT final reviewまで`ACCEPTED` / Completion Latchは適用しない。

WORK_ID: 0067
DISPATCH_ID: 0067-CODEX-01
BALL: CODEX
STATUS: READY
