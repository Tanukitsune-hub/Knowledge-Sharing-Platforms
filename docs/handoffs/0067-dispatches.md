# Work 0067 dispatch control

WORK_ID: 0067
DISPATCH_ID: 0067-CODEX-01
ACTIVE_DISPATCH_ID: 0067-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_1_LOW
PHASE: CHATGPT FINAL REVIEW

## Primary Outcome

現在accept済みのPrivate Assets Intelligence会社導入artifactを、Apps Script editorで手動保存しやすい「7個の.gsファイル」に再パッケージする。runtime behaviorとcanonical sourceは変更しない。

## Closed Conclusions

- canonical development sourceは引き続き `src/`。
- current accepted single-file releaseは `dist/KnowledgeShare.bundle.gs`。
- Work0066で配送したsingle-file bundleは1,254,351 charactersで、会社Apps Script editorへの一括貼付・保存が実運用上の阻害要因になった。
- 解決策はcanonical sourceの統合・改変ではなく、accepted bundleからのderived multi-file installation packageとする。
- current release contract、schema、public surface、provider policy、deployment policyは変更しない。

## Scope / Boundaries

Work固有instruction:
`docs/handoffs/0067-CODEX-01-company-multifile-package-instruction.md`

恒久ルールはnearest `AGENTS.md`に従う。

## Required Validation

TIER_1_LOW。

- generated 7-file packageのdeterministic build
- 7ファイルをdocumented orderで連結したbytesがcurrent canonical bundleと完全一致
- concatenated SHA-256がcurrent canonical bundle file SHA-256と一致
- 各.gsがcomplete source-section boundaryで分割され、個別parse/static checkが通る
- manifest parity
- targeted package tests
- existing bundle validation
- canonical `npm run check` 1回
- `git diff --check`
- target-runtime deployment / company Workspace mutationは不要

## Codex return

- accepted bundleから7個の.gsと同一bytesの7個の.txtを生成済み。
- raw連結1,300,560 bytes / SHA-256 48eb6f2eb68c20e820e0dfb00bd9843ac968661769853574e9b95c5efa655d64はcanonical bundleと一致。
- targeted tests 3/3、bundle validation 30/30、npm run check 690/690、diff check PASS。
- deployment、provider call、business-data mutationは各0。ChatGPT final review待ち。

## Delivery

branch: `work/0067-company-multifile-package`
Draft PRを使用。

report:
`docs/handoffs/0067-CODEX-01-company-multifile-package-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0067-CODEX-02
```

WORK_ID: 0067
DISPATCH_ID: 0067-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
