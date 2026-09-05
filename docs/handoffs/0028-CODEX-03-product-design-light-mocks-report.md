# Work 0028 — Product Design Light mock return

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
BALL: CHATGPT
STATUS: RETURNED

## Outcome

Product Designを実際に使用し、ライトの3方向を画像で生成・会話に提示・保存しました。初回9画像（検索／記録管理／補助状態を各方向1枚ずつ）と、同じ対象限定修正ラウンドの2画像です。比較・推奨・source/用語一覧を[design package](../design/0028/README.md)へ分離しました。

**返却はPARTIALです。** ImageGenは使えましたが、画像の必須印、GPの意味、provider状態、操作欠落に不一致が残りました。修正でも別のcontrolが落ちる同種の問題が続いたため、正式instruction §8に従って生成を止めました。厳密な同機能・同文言のvisual gateはFAILです。これはアプリの不具合やprovider資格の失敗ではなく、設計画像の忠実性の制約です。

推奨は条件付きのBベース＋Aの検索の読み順＋Cの一覧密度。見せていない第四案や機能は追加していません。ChatGPTが誤記・欠落をレビューするまで、承認可能な完成mockや実装ターゲットとは扱いません。

## Work Contract and preflight

- MODE: INVESTIGATION / A1 DESIGN ONLY。成果は3方向の可視比較と選択材料。
- Evidence: explicit instruction → accepted pinned source/contracts → actual generated images → static heuristic walkthrough。GASの実行・runtime証拠は対象外。
- Fastest decisive action: bounded source/contract inspection → 同fixtureの画像生成 → 実画像比較。
- Scope: `docs/design/0028/**`、本report、0028 dispatch registerのみ。
- Non-goals: production source/build、GAS、deployment、data/provider/credentials、Dark、0029 reopening。
- Budget: 初回セット1回、targeted correction round最大1回。同じ画像欠落failureが継続したら保全して返却。
- Mutation: local design filesとGitHub design-only branch/Draft PRのみ。メールや他者へのメッセージ送信なし。

`git fetch origin main --quiet`後、origin/mainは指定instruction commitと一致しました。開始時worktreeはclean、remoteは指定repository、元branchは`agent/0029-shared-admin-password`でした。旧0028 branchへ戻らず、origin/mainから`codex/0028-product-design-light-mocks`を新規作成。reviewed main `a0a646d5...`と今回sourceのsrc/dist差分はありません。

正式instructionを全文読み、適用AGENTS、Work Registry、0028 brief/dispatch/decision/plan、product vision、0027/0029 accepted register、work-control/dispatch-control/target-runtime policyを確認しました。0027/0029のruntime値は**今回読み直したcommitted completion evidence**であり、runtime再検証ではありません。

## Plugin / reference provenance

Product Design 0.1.53のindex、user-context、get-context、ideate、critical-overrides、communication-protocolを実際に読みました。user-context preflight scriptも読んで実行し、saved contextなしを確認。Product Designのideation prompt、独立した画像call、画像確認、visual selection gateを適用しました。

ユーザーの明示指示を優先し、pluginの一般的な3枚制限・borderless優先・生成後のbuild誘導は適用せず、3方向の必要な補助画像と比較文書を作成しています。image-to-code/build/share/deployは開始していません。枠線を明確にする指示を優先しています。

画像生成toolのtargeted availability checkで`image_gen.imagegen`を確認し、計11回の独立callが全て実画像を返しました。各結果をgeneratedImageで会話に表示。後続生成には、実際に表示して確認したA/B/C検索画像のlocal pathを添付しました。原本は生成toolの保存先に残し、repositoryへbyte copyしています。

repository内の既存画像とsaved contextには参照可能な現行screenshotがありませんでした。current UIはsource観察、参照画像は生成済みmockです。非公開Web App、管理者login、Googleサービスを開いていません。架空データだけを画像toolへ渡しました。実画面を取得したとの主張はありません。

## Coverage and evaluation

[source-inventory](../design/0028/source-inventory.md)は14 priority filesとGP/Admin/bootstrap/Pitchbook fragments、effective overridesを対象とします。既存action/DOM/handler/request-response/stateを記録し、record/Master/providerを分離した表示辞書を作成しました。全動的server error文字列の網羅やlive rendered auditはしていません。

[comparison](../design/0028/comparison.md)に7シナリオの共通開始/終了、予測操作数、判断数、各方向の観察、実装難度、backend risk、画像errataがあります。計画rubricの各観点を評価しましたが、hard gate FAILを点数で補償しないため総合点は未計算です。操作時間・成功率は作っていません。

検索画像は実1586×992、補助ボードは実1024×1536です。promptは1440×900/1440×1800を指定しましたが、出力寸法は一致しません。全体縮小によるlaptop fit合格とは扱わず、1440×900/1366×768でのscroll/折返しリスクを設計見積りとして記録。ブラウザ計測はNOT_RUNです。

画像はshell/初期登録抜粋、面談・資料一覧、編集抜粋、削除確認/削除済み/復元、検索/モード/条件/許可モデル、回答/根拠不足/原資料、処理中/長時間/再確認/empty/error、全文出力preview/出力操作、管理者抜粋を含みます。ただし画像の厳密な文言/機能一致とフォーム全項目視認は未達です。詳しい欠落を隠してPASSにしていません。

## Validation / side effects

- 11 PNGのsignature、chunk CRC、IDAT decode確認。寸法・byte数・SHA-256を[asset-manifest.json](../design/0028/asset-manifest.json)に記録。
- 会話上の実画像を目視。生成promptへの準拠を推測でPASSにせず、画像errataを記録。
- 許可pathだけの最終diffと`git diff --check`を確認。src/dist/installer/dependencies/tests/CI/AGENTS/accepted Work filesの差分なし。
- application tests、npm run check、bundle regeneration、GAS qualificationは実施していません。今回のdocs/image成果を検証しない試験や過去0029のcountsを今回の合格として流用しません。
- LOGIC_VALIDATION: design artifact integrity / diff hygieneのみPASS。アプリlogicはNOT_RUN。
- SIDE_EFFECT_STATE: LOCAL_DESIGN_ARTIFACTS_AND_GITHUB_DESIGN_DRAFT_ONLY。source/data/provider/auth/runtime mutationsは0。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002
NEW_KNOWLEDGE_CANDIDATE: NO

canonical origin/mainのindexから上記2件のみを読みました。RULE-0001は再生成ループを止めて成果を保全する判断、RULE-0002は静的mockをruntime READYと扱わない判定へ適用しました。knowledge worktreeのmerge/checkoutはしていません。memory registryはhistorical runtime権限の流用を避けるquick passだけで、現在状態はrepositoryを再確認しました。

## Required return fields

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
DESIGN_SOURCE_SHA: c1db45e4e30986fc0cd0df2fcfed3445817a71cd
PRODUCT_DESIGN_PLUGIN_USED: YES
PLUGIN_SKILLS_AND_TOOLS: Product Design index/user-context/get-context/ideate; user_context_preflight.py; image_gen.imagegen; generatedImage; exec_command; apply_patch
CURRENT_SURFACE_INVENTORY: PARTIAL
THREE_DISTINCT_LIGHT_DIRECTIONS: PASS
VISUAL_ARTIFACTS_PRESENTED_AND_SAVED: PASS
SAME_FUNCTIONAL_SCOPE_AND_FIXTURES: FAIL
TERMINOLOGY_INVENTORY: PASS
SEVEN_SCENARIO_REVIEW: PASS
RECOMMENDATION: CONDITIONAL B shell + A search reading order + C table density; not an approved visual
CHART_SURFACE_THEME: LIGHT_FIXED
USER_DIRECTION_SELECTED: NO
DARK_MOCK: NOT_STARTED / AWAITING_LIGHT_SELECTION
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
TARGET_RUNTIME_QUALIFICATION: NOT_RUN / OUT_OF_SCOPE
READY_FOR_PRODUCTION_BUILD: NO
WORK_0029_REOPENED: NO
BLOCKER: VISUAL_CONTRACT_PARITY_NOT_MET
BRANCH: codex/0028-product-design-light-mocks
DRAFT_PR: NOT_CREATED_YET
FINAL_COMMIT: PENDING_GIT_RECEIPT
REPORT_PATH: docs/handoffs/0028-CODEX-03-product-design-light-mocks-report.md
```

SOURCE_CODE_CHANGEDはproductionを指します。design artifactsとreport/registerは変更しています。RETURNEDはcontrollerへの返却であり、ACCEPTEDやWork 0028完了ではありません。最も安い次の判断はChatGPTによるerrata付きの方向性レビューです。必要な追補はChatGPTが新Dispatchを発行する場合のみで、本runは継続しません。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
