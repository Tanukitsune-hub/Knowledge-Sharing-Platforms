# Work 0071 CODEX-01 — Phase A interaction stability report

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-01
BALL: USER
STATUS: ACTION_REQUIRED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Outcome

「記録を追加」の4フォームと共通ファイルキューに、位置が固定された主要操作・status領域、focusを保つbusy制御、入力欄に結び付くエラーを実装した。Work0070 release 0.2.0 / schema9を基準とし、server/API/schema/providerの契約は変更していない。隔離Web Appで面談・ニュース・評価の実保存、4フォームのinvalid状態、1440px/390pxの位置とfocusを確認した。standalone資料保存の**実ファイル選択以降**はブラウザー自動操作の制約で未確認であり、本人のファイル選択後に同一Dispatchで続行する。

## Evidence hierarchy and implementation

`RULES_APPLIED`: `docs/product/work0071-google-web-ux-adoption.md`のUX-CLS-002/003/004/005、UX-INP-001、UX-FORM-003/004/005/007、UX-A11Y-002/003/008、UX-RWD-001/004、UX-QA-001/002/005/006、R03、T02/03/04/05/07を適用判断に使用した。規則の引用自体を改善証拠とは扱わず、以下の測定と操作を証拠とした。実Web App > local browser > source/unitの順で判断する。

`PHASE_A`: 4フォームの主要ボタンとstatusを動的フォーム内容より前に置き、180×48pxの操作枠と48pxのstatus枠を共有した。status文言は枠内で更新し、長文は内部で読める。選択中の主要ボタンはbusy中もkeyboard focusを保持し、`aria-disabled`と既存busy guardで重複送信を止める。関連しない既存ボタンのnative disabled動作は維持した。Meetingはpendingを即時表示。News/評価/standaloneの特定可能なinvalid fieldには日本語のinline error、`aria-invalid`、`aria-describedby`、first-invalid focusを追加し、修正時にその欄のerrorを解除する。ファイルキューは元ファイル名を主表示、保存名を開ける詳細、size/statusを同じ行に置いた。最大10件でも操作位置を押し下げない。server-side validationを維持した。

`BEFORE_GEOMETRY`: production source変更前、accepted main `09c18a6375f64965dd4a81b0cba24cb32e6d60e5`のlocal synthetic browserでprimary rect、status rect、queue height、scroll、focus、overflowを記録した。1440pxのidle比でファイル10件時のbutton Y移動はMeeting +903px、standalone +523px。390pxではNews +478px、評価 +766pxの代表状態を観測した。pendingでbutton heightはMeeting/News/評価 +3.5px、standaloneはwidth +12.56px・height +3.5px。status表示や入力下部の内容が読位置を動かしていた。before raw evidenceはprivate tempに保持し、リポジトリに環境情報を持ち込まない。

`AFTER_GEOMETRY`: 同じlocal synthetic browser matrixで1440px/390pxのidle、pending、success、error、validation、1/10 filesを比較し、4フォームの主要ボタンのX/Y/width/height差はいずれも0px。status枠も同じ位置・高さ、material status layout jump 0。実Web App最終candidateでは1440pxのMeeting/News/評価/standalone primary rectはX=289、document Y=165付近、180×48px、status 48px。invalid/pending/successでY差最大1px、X/size差0。390pxでも4フォームのinvalid後のY差最大1px、X/size差0。focusによる意図したinvalid fieldへのscrollは除き、unexpected page scroll 0。390pxのmaterial horizontal overflow 0。

## Validation matrix

| Field | Result / evidence |
|---|---|
| `KEYBOARD_FOCUS` | local keyboard flowでタブ移動、元ファイル名の詳細開閉、invalid first focus、pending/successの操作focus保持を確認。実Web Appでも面談・News・評価の保存中および成功後、起点buttonにfocusが残った。 |
| `RESPONSIVE_1440` | local matrixと実Web Appの4フォームを確認。primary/status geometryは上述の範囲内。 |
| `RESPONSIVE_390` | local matrixと実Web Appの4フォームを確認。主要操作に最大1pxのY差、material overflow 0。 |
| `RESPONSIVE_320` | local synthetic browser smoke PASS。主要操作、status、file detailは到達可能でmaterial overflowなし。実Web App 320pxはNOT RUN。 |
| `TEXT_ZOOM` | local synthetic browserで200%/high-zoom smoke PASS。実Web AppはNOT RUN。 |
| `REDUCED_MOTION` | local synthetic browserでreduced-motion smoke PASS。 |
| `RECOVERY` | local focused testsでduplicate submit guard、explicit safe error、partial successのファイル別retry、unknown-outcome fail-closedを確認。実Web Appのstandalone upload/retryは本人ファイル選択待ち。 |
| `WORK0049_REGRESSION` | focused busy feedback tests 26/26 PASS。spinner、`aria-busy`、重複実行防止を維持。 |
| `WORK0070_REGRESSION` | `work0070-source-client-browser.cjs` 1440px/390px PASS。4-tab draft/retry/unknown-outcome契約に関わる既存テストと`npm run check` PASS。 |
| `LOGIC_VALIDATION` | `tests/work0071-stable-interaction-browser.cjs` PASS。invalid submit RPC 0、focus/geometry、10件・長い元ファイル名、pending/success、重複操作を確認。`production-ui-browser.cjs` PASS。`npm run check` 716/716 PASS。`git diff --check` PASS。 |
| `BUNDLE_VALIDATION` | generated bundle validator: server 67、HTML 24 PASS。bundle 1,416,811 bytes。 |
| `MULTIFILE_PACKAGE_PARITY` | 7 `.gs` package validation PASS、各ファイル上限内。7ファイル連結のhashはbundleと一致。生成scriptの過去commit固定値を現在manifestからの検証へ修正した。 |
| `TARGET_RUNTIME_QUALIFICATION` | 既存owner-only隔離targetをread-only preflightし、project/既存deployment/execute-as/access/fixture所有と配置を確認。最終candidateを同じdeploymentへ更新し、served immutable versionとsaved sourceがlocal bundleに一致。1440px/390pxで4フォームのinvalid、面談・News・評価の実保存/pending/success/focusを確認。standalone実ファイル選択以降はNOT RUN（browser file chooser制約）。最後に観測したconsole material error/warn 0。 |
| `SIDE_EFFECT_STATE` | 隔離targetのsource sync 2、immutable version 2、既存deployment update 2。新規deployment 0、permission/access変更 0。隔離synthetic records: Meeting 2、News 1、評価 1。standalone保存 0。初回candidateのMeeting成功時focus lossを観測し、2回目candidateで修正・再確認。許容したruntime mutation budgetを使い切った。 |
| `PROVIDER_CALL_COUNT` | 0。AI query/indexingを実行していない。 |
| `COMPANY_DATA_MUTATION_COUNT` | 0。隔離synthetic folder/recordsのみ。 |
| `BLOCKER` | standalone資料保存の実Web App file upload/retry/partial status検証にはnative file selectionが必要。IABのfilechooser待機とinput clickは選択イベントを取得できなかった。Chrome extension側の隔離Web Appはこの実行で画面遷移が反応せず、代替検証経路にならなかった。これはアプリの不具合とは判定しない。 |
| `FOLLOW_UP` | 本人が保持中の隔離Web App「記録を追加 > 資料保存」で用意済みのsynthetic TXTを1件選択した後、同一Dispatchでstandalone pending/successと必要な安全なerror/retry状態、final consoleを確認する。Phase Bの項目は別Dispatch候補。 |
| `READY` | NO。standalone file runtime matrixが未完了。ChatGPT final diff/evidence review前にACCEPTED/Completion Latchを適用しない。 |

隔離targetのSettings readbackは利用可能なSheets API scopeで403となった。Work0070 accepted evidenceで`AI_SYNC_ENABLED=false`、今回Settings/triggerは変更せず、AI機能は実行していない。今回fresh persisted valueを観測したとは主張しない。

## Phase B audit（実装なし）

| Surface | Observed issue | Before evidence | Decision-Impact | Route |
|---|---|---|---|---|
| Activity Analytics | checkbox更新でdrill resultが再描画され、focused checkboxが置換される | `render`経路のbounded source audit | keyboardの操作位置を失う | CODEX-02 |
| Master | 順序変更時`renderMasters`が操作row buttonを置換 | bounded source audit | keyboard reorderのfocus continuity | CODEX-02 |
| 過去の記録 News/評価 edit | validationは汎用status中心でinvalid fieldへfocusしない | bounded source audit | エラー修正箇所を探す必要 | CODEX-02 |
| 過去の記録 Meeting/資料 lifecycle | clicked row再描画後のfocus restoreがない | bounded source audit | 操作後の読位置を失う | CODEX-02 |

Knowledge Search、Full Output、Entity Workspace、管理者ページ、modalについては、このbounded source auditでmaterial issueを立証していない。PASSやruntime qualificationとは扱わない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-01
BALL: USER
STATUS: ACTION_REQUIRED
