# CODEX-12 production UI ローカル描画証跡

- `RESULT`: PASS
- `CLASSIFICATION`: SYNTHETIC_RENDER_ONLY
- `SOURCE_COMMIT`: `f1c5cb7ae0e98c7ab68b78d5ddf9384caf0f09f7`
- `TARGET_RUNTIME_QUALIFICATION`: NOT RUN
- `SOURCE_MUTATION`: NONE
- `BLOCKER`: NONE（今回のローカル描画範囲）

実行コマンド:

```powershell
node tests/production-ui-browser.cjs
```

キャッシュ済みChromium `151.0.7922.34`、1366×900／390×844で実行した。production HTMLの既存includeだけを展開し、`google.script.run`の通信境界にsyntheticな固定応答を返した。backend business helperの注入、Apps Script／Workspace／provider API実行は行っていない。localhost以外への通信は遮断し、実際の外部通信要求は0。

## 確認結果

- 初期表示はナレッジ検索。sidebarは7項目で、全ボタンが同一document内の単一pageへ切り替わる。
- non-GP単一記録formから親登録→資料prepare→uploadのclient wiringが動く。
- 過去記録の検索→詳細→分類編集が動く。non-GP分類のGPは空欄・変更不可で、送信値にも架空GPを加えない。
- 質問空欄・AIモデル未設定でも独立した全文出力previewが表示され、質問／モデルは変更されない。
- 390px幅で登録・過去記録・検索のページ全体に横overflowなし。
- page error 0、console warning/error 0。

サマリーの実データ集計と管理者操作の成立は対象外。ナビ先の表示のみ確認した。fixtureの本文表示はGoogle Docs本文保全の実機証明ではなく、登録結果も実際のDrive／Index mutationの証明ではない。

## 画像と機械可読証跡

- [登録](01-registration.png)
- [過去記録・詳細・non-GP分類](02-past-detail-classification.png)
- [独立全文出力](03-independent-full-output.png)
- [390px幅](04-narrow-390.png)
- [実行結果・source hashes](validation.json)

`failed-render.png`は前回のfixture名不一致による通信500の履歴画像であり、最新PASSの証跡ではない。fixture名をproduction facadeの`getEntityWorkspaceData`へ修正した後、上記凍結commitで再実行しPASSした。
