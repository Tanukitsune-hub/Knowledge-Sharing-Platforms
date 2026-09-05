# Work 0028 — Light visual alternatives

WORK_ID: 0028 / DISPATCH_ID: 0028-CODEX-03 / DESIGN ONLY

**返却状態：PARTIAL。3方向の画像は生成・提示・保存済みですが、厳密な機能・文言一致のvisual gateは未通過です。** 推奨は条件付きのBベース。画像をそのまま実装仕様として使わないでください。

DESIGN_SOURCE_SHA: `c1db45e4e30986fc0cd0df2fcfed3445817a71cd`

- [ソース・機能・用語一覧](source-inventory.md)
- [7シナリオ比較、推奨、画像の誤記・欠落](comparison.md)
- [実行報告](../../handoffs/0028-CODEX-03-product-design-light-mocks-report.md)
- [画像の寸法・SHA-256](asset-manifest.json)

## 画像と会話上の表示順

番号は実際に会話へ表示した順です。A/B/Cは方向名であり、生成の予定順から選択を推定しません。各画像はImageGenの結果として会話内に表示済みです。初回9画像と、同じ修正ラウンドの2画像を保存しました。修正画像は初回の完全な置換として承認していません。

| 表示順 | 方向 | 実際の画像ファイル | 内容 |
|---:|---|---|---|
| 1 | A Minimal / Search-forward | [a-search-initial.png](a-search-initial.png) | 横ナビ・検索・回答・出典 |
| 2 | B Workspace / Notion-like | [b-search.png](b-search.png) | 固定サイドバー・検索・回答・出典 |
| 3 | C Investment Dashboard | [c-search.png](c-search.png) | 横ナビ・左右分割の検索と回答 |
| 4 | A | [a-maintenance-initial.png](a-maintenance-initial.png) | 面談／資料一覧・編集・削除確認・削除済み・復元 |
| 5 | B | [b-maintenance-initial.png](b-maintenance-initial.png) | 同じ記録管理状態 |
| 6 | C | [c-maintenance-initial.png](c-maintenance-initial.png) | 同じ記録管理状態 |
| 7 | A | [a-states-initial.png](a-states-initial.png) | 初期登録・5モード・詳細条件・処理状態・全文出力・管理者 |
| 8 | B | [b-states-initial.png](b-states-initial.png) | 同じ補助状態 |
| 9 | C | [c-states-initial.png](c-states-initial.png) | 同じ補助状態 |
| 10 | A 修正 | [a-search-correction.png](a-search-correction.png) | 任意フィルターの必須印修正。ただしナビ欠落が発生 |
| 11 | B 修正 | [b-states-correction.png](b-states-correction.png) | Gemini理由・管理者欄修正。ただしログアウト欠落が発生 |

画像は静的な設計案です。記録管理ボードの面談／資料は別ページの抜粋、編集／確認／復元は別時点です。補助状態ボードも同時に出る画面ではありません。既存アプリの実画面や動作する代替アプリではありません。

## 同条件の架空データ

日付基準は2026-09-05。実在する組織・投資情報・原資料URLは使用していません。

| 項目 | 全方向共通の設計fixture |
|---|---|
| 面談 | MTG-000101、2026-09-03、GP / 運用会社、サンプルGP、インフラ、Active |
| 面談本文 | 運用体制を確認。費用条件は未確認。 |
| 資料 | DOC-000201、2026-09-02、サンプルGP、インフラ、説明資料.pdf、Active、原本あり |
| 復元不可資料 | DOC-000202、Inactive、原本なし（補助例） |
| 比較対象 | サンプルGP / サンプルLP。通常の自由質問fixtureとは別のモード説明用状態 |
| 質問 | サンプルGPの面談で確認した事項と未確認事項は？ |
| 回答 | 面談では運用体制を確認しました。費用条件は資料に根拠がなく、追加確認が必要です。 |
| 根拠注意 | 費用条件の根拠が不足しています。 |
| 出典 | 上記MeetingとPitchbookの2件。原資料を開く。文単位マッピングやページ番号を捏造しない |
| 検索条件 | 自由質問、2026-09-01〜05、GP=サンプルGP、資料の種類=両方、その他指定なし |
| 現行方針 | ChatGPT / 全文出力。Geminiはqualified-disabled・非表示。管理者はconfigured / locked |
| モデル表示fixture | 管理者設定の既定モデル / プロバイダ既定。実モデル名のlive確認ではない。実装時は既存bootstrapが返すdisplayName/labelをそのまま使う |
| 仮定の別方針 | 管理者が適格性確認後に有効化した場合のみChatGPT / Gemini / 全文出力。自動切替なし |

共通promptは同じfixtureを指定しました。ただし生成画像には相違が残りました。**共通promptを使ったことだけを同条件PASSの根拠にはしていません。** 誤りの場所はcomparison.mdに記録しています。

## 寸法と証拠の境界

検索画像の指定構図は1440×900、ボードは1440×1800。実際の出力ピクセル寸法はasset-manifest.jsonに記録し、画像を引き伸ばして指定寸法に合わせていません。ボードは元ファイルを拡大して読む資料です。画像内の表示はブラウザの実CSSピクセル計測ではありません。

1440×900と1366×768の適合性は比較文書の設計上の見積りです。ブラウザ実測、キーボード操作、コントラストの正式合格、GAS実行はNOT_RUNです。

## テーマ境界

CHART_SURFACE_THEME: LIGHT_FIXED

今回はライトだけです。検索・記録管理に不要なグラフは足していません。既存の面談活動集計のグラフは、将来ダーク案でも背景・軸・数値・ラベル・系列・既存title tooltip/empty表示を含めライトの局所色役割を維持します。現行の棒グラフにない凡例等は追加しません。画面／カード／境界だけダークへ適応し、一般の表・フォーム・回答まで白固定にしません。単一rendererを維持します。

将来のテーマ選択はシステム設定に合わせる／ライト／ダーク。明示選択優先、ブラウザ内保存、保存失敗時も動作継続。下書き・query token・管理者tokenとは分離し、バックエンド保存や再読込を追加しません。ライト選択後に選択案のみダーク化し、その後も本体実装には別途許可が必要です。
