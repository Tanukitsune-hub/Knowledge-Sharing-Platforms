# CODEX-11 validation

実行日: 2026-09-08 JST。LOGIC_VALIDATIONとlocal browserの結果です。Apps Script TARGET_RUNTIME_QUALIFICATIONはNOT RUN。

## Evidence matrix

| ID | 結果 | 今回の証拠 |
|---|---|---|
| E1 | PASS | 12 unique manifest、単一form、6区分、不要3routeなし。`control-coverage.md`197 entries。GP/LP新規画像 |
| E2 | PASS | parent-fail=file0/parent0、file-fail=file1、link-fail=file2/link未完了。同じDOC-DEMO-002/MTG-DEMO-001でretry後file2。処理順を結果に表示 |
| E3 | PASS | LP MTG-000102→原本文脈→分類変更→編集→LPに戻る。既存親への追加で新規親0、ファイル2 |
| E4 | PASS | 共有DOC-000201のunlink後も他リンク1。親復元でもunlink保持。DOC-000202のundo後もInactive。既存Document reuseで新規ファイル0 |
| E5 | PASS | LP/Pitchbook架空ヒット。compare selectedEntityKeysのみ。固定質問readonly、自由draft復元、全期間解除で日付復元 |
| E6 | PASS | 空質問/AI空でLP Meeting1件、値不変。compare/prep不完全でも共通filter出力。date逆転拒否。0件/limit/read-failを切捨て成功扱いにしない |
| E7 | PASS | 最新12画面を実1366×768で描画。page/table横overflow0、nav7/active1、console warning/error0。`browser-results.json`に全行 |
| E8 | PASS（設計QA） | exact PR46/48を同viewportで新規撮影。`comparison.html`、current12枚、番号付きstate10枚。Product Design QA参照。ユーザーacceptは未実施 |
| E9 | PASS（local） | npm check 456/456、design assertions、3 demo JS syntax、git diff --check。CIはPR側の実行状況を別記 |
| E10 | PASS | production src/dist/test/依存差分なし。local demo script外部通信・storage/file内容readなし。変更対象はdesign＋report＋Work管理文書のみ |

## Browser routeと撮影不整合

Browser plugin/`browser` skillは利用不可。利用可能なCUAのIABで先に実操作しDOM結果を確認したところ、IABのDOM viewport=1366×768に対し保存画像が1275×760にcroppingされました。これは撮影環境の不整合であり、ページoverflowの証拠にしていません。

handoffの代替harness許容に基づき、既存Playwright/Headless Chromeへ撮影とdecisive case検証を限定移行しました。新依存追加なし。外部hostを遮断し、localhostだけを許可。最終画像はすべてこの実1366×768から取り直し、22 caseをassertion付きで再検証しました。IAB撮影画像をcurrentとして残していません。

Visual/interaction修正は2round。round1で失敗状態/既存補助操作を確認、round2で分類・関連GP・要フォロー・単一entity/exportの整合を修正して再確認。撮影fallbackは証拠取得経路のみの補正で、第三の製品design変更ではありません。

## 境界

- LOGIC_VALIDATION: PASS（456 tests、design assertions、JS syntax）
- LOCAL_BROWSER_VALIDATION: PASS（12 pages / 22 cases）
- TARGET_RUNTIME_QUALIFICATION: NOT RUN（Apps Script / Workspace / providers）
- SIDE_EFFECT_STATE: design/docs/local screenshotとDraft PRのみ。実データ・provider・deploy変更NONE
- CI: local結果と分離。返却reportのGitHub snapshotを参照
- Mobile/Safari/実iPhone: NOT RUN（本dispatchの1366×768 gate外）
- 実ファイルサイズ上限/ファイル内容/原本編集/検索/認証/Docs/PDF生成: NOT RUN
- 過去一覧filter、summary/analytics/master/providerの実サービス操作: NOT RUN（配置/表示参照だけ）
- USER_LIGHT_ACCEPTANCE: PENDING
- READY_FOR_PRODUCTION_BUILD: NO
