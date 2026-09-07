# CODEX-11 単一記録Light review

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: RETURNED

単一の記録フォーム、記録本文を含むdetail、親の保存に続く資料登録、資料unlink、独立した全文出力をdesign-onlyで修正した返却です。UIを作り直さず、PR #48のLight/assets/検索/presetを再利用しました。

- [操作デモ](../01-search.html) / [12画面manifest](../page-manifest.json)
- [今回の全画像](index.html) / [PR #46・#48との比較](comparison.html)
- [validation](validation.md) / [機械実行結果](browser-results.json) / [Product Design QA](design-qa.md)
- [契約対応表](contract-impact-map.md) / [既存197 control対応](control-coverage.md)
- [返却report](../../../../handoffs/0028-CODEX-11-meeting-centric-design-report.md)

## 操作デモの手順

repository rootで`python -m http.server 8772 --bind 127.0.0.1`を実行し、`http://127.0.0.1:8772/docs/design/0028/selected-light-family/index.html`を開きます。認証情報や実ファイルは不要です。iPhoneからのlocalhost接続を公開・設定変更する作業はしていません。

1. **記録を追加**：面談先区分をGP/LP等で切替。資料領域の「架空の2ファイルを選択」→下部のデモ設定で成功/記録失敗/file失敗/link失敗→「登録」。失敗分の再試行で同じMTG/DOCのまま結果が完了します。設定変更時はデモを初期化。
2. **過去の記録**：GP/LP行の詳細→原本文脈、編集→戻る。資料「削除」はそのlinkだけ解除。「元に戻す」はlink undoで、元からInactiveな資料を再活性化しません。記録を削除/復元しても明示unlinkは戻りません。
3. **既存親へ追加**：「資料を追加」→架空ファイル→この記録に追加。新規親0件。同じ領域の「既存資料を関連付ける」はDocument_ID再利用で新規ファイル0件。分類編集はdate/Asset/Capital/Fundだけの画面内state、原文を変更しません。
4. **検索**：LP＋資料のみ＋自由質問→架空の適格資料例。compareでは2件を選択し、送信scopeから単一entityKeyが外れることを確認。固定質問readonly→自由質問でdraft復元。
5. **全文出力**：質問を空、AIを未設定のまま「全文出力」。共通面談先・期間・詳細条件だけで架空Active Meeting全文/業務属性を表示。情報ソースや質問の値は変わりません。デモ設定で0件/上限/原本失敗を選べます。開始日>終了日は拒否します。

## 再生成・検証

```text
python docs/design/0028/selected-light-family/render-design.py
python docs/design/0028/selected-light-family/validate-integrity.py
node --check docs/design/0028/selected-light-family/record-demo.js
node --check docs/design/0028/selected-light-family/search-demo.js
node --check docs/design/0028/selected-light-family/admin-demo.js
npm run check
git diff --check
```

browser再検証は既存PlaywrightとChromeを使用します（依存を追加しません）。`KSP_PLAYWRIGHT_MODULE`で既存module絶対pathを指定可能。`verify-browser.cjs`は8772のcurrentと、8773のbaseline serverを参照し、12画面と22 caseのassertion、画像、JSONを再生成します。baseline serverにはPR #46/#48各commitの当該HTML/family.css/icons/sayagataを`46/docs/design/...`と`48/docs/design/...`に展開してください。`render-review.py`でindex/比較/control対応を再生成します。

## 範囲と残余

local stateはreload/画面遷移で初期化されます。原本/原資料の表示、copy/Docs/PDF、過去一覧filterのserver照合、管理者認証/実保存は模擬・設計参照です。実API、永続保存、ファイル内容read、クリップボード、Drive/Sheets、provider、migration、deployは実行しません。通常のユーザー入力を本番データにした証拠ではありません。

既存`action-corrections/`、`record-centric-qa/`、`final-user-corrections/`等とrootの旧QA文書/旧validatorは履歴であり、今回のcurrent evidenceではありません。現行検証入口は`validate-integrity.py`と本reviewです。

DESIGN_BLOCKER: NONE
USER_LIGHT_ACCEPTANCE: PENDING
READY_FOR_PRODUCTION_BUILD: NO

受領のみ記録と集計、parent binding、non-GP/eligibility、Docs保全、export validator、legacy保持は次のBUILD前gateです。Light acceptやこの返却はproduction実装・merge・deploy許可ではありません。
