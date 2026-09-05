# A/B/Cの比較と条件付き推奨

WORK_ID: 0028 / DISPATCH_ID: 0028-CODEX-03

**条件付きでBの固定ナビを土台に、Aの縦方向の検索・回答構成とCの一覧密度を組み合わせる案を推奨します。** これは実際に提示した要素だけの組合せです。4番目の方向や新機能ではありません。ただし生成画像に契約不一致が残り、承認可能な最終visualとは扱いません。

## 観察結果

画像を見た後のheuristic reviewです。静的な画像から操作時間、成功率、実クリック数は測定していません。Source/明示契約を画像の見栄えより上位に置き、画像にない機能が実装されたとは扱いません。

| 観点 | A Minimal / Search-forward | B Workspace / Notion-like | C Investment Dashboard |
|---|---|---|---|
| 最初の操作 | 質問欄が大きく見つけやすい。上部の全リンクは横に長い | 「探す」配下に検索・過去記録が並ぶ。初見の入口が安定 | 検索入力と回答が左右に分かれ、作業領域を把握しやすい |
| navigation/現在地 | 下線で現在地。1440相当でも11リンクを詰める圧力 | 全11目的地の縦並びと選択背景が最も追いやすい | 2段navの選択を両方追う必要。上部は濃色だが本体はライト |
| 質問・条件・実行 | 質問→選択→条件→検索→回答の一方向 | 固定ナビは良いがlabel列・form高が大きい | 左列の幅が制約。長い日本語のモデル/条件が窮屈 |
| 一覧・日常利用 | 行の余白が広く、少件数で安心。多数行はscroll増 | 一覧の安定感は良い。sidebar分だけ表の有効幅減 | コンパクトな行・右端の明確な操作群が比較に向く |
| 操作／情報の境界 | 入力枠と青いprimaryが明瞭。初回は不要な必須印 | input/buttonと静的本文を区別できるが、回答の二重枠は減らしたい | tealのprimary、赤い削除、表の境界が明瞭。装飾iconは不要 |
| 出典 | 回答直下の2行表で読み順明瞭。資料名とIDを保持 | 同じく回答直下。縦のformが長く出典の表示位置が低い | 右側で回答と出典をまとめて確認。ただし長文で左右scrollリスク |
| 状態 | 処理中・長時間・エラー・根拠不足を文言と色で分離 | 同様。修正でGemini理由を訂正、別のcontrol欠落が残る | 同様。情報密度が高く、補助説明の文字を縮めない注意 |
| GAS HTML実装難度（相対） | 中：nav wrap、filter disclosure、custom dialog | 中：shell CSS変更、nav override維持、可視範囲調整 | 中〜高：左右layoutの再配置・breakpoint・長文折返し |
| backend変更リスク | 低：既存DOM/値/handlerを維持する条件 | 低：既存APIをそのまま使用する条件 | 低：新しい投資KPIやcombined feedを足さない条件 |

## 同じ7シナリオのwalkthrough

カウントは**提案仕様の予測値**です。開始・終了を以下に固定しました。selectの候補選択を1操作として数え、文字入力のキー数とscrollは除外。メニューを開いて候補を選ぶマウス実クリックは通常これより増えます。意味のある判断は別列。3案ともflatな目的地を維持する意図のため、基本操作数は同じです。画像欠落をゼロ操作と評価していません。

| # / 共通の開始→終了 | 共通のfirst actionと必要操作 | A / B / C予測操作数 | 意思決定 | 方向別の観察 |
|---|---|---|---|---|
| 1 初期の面談登録→サンプルGPの表示中の面談一覧 | 過去の面談記録へ→面談先区分→面談先→表示中→検索。期間は未指定でよい | 5 / 5 / 5（区分が詳細にある時は各+1） | 目的地、対象区分、対象、状態の4判断 | A横navは選択肢が密。B縦navが探しやすい。Cは2段の現在地確認。画像は区分disclosureの位置を完全には示さない |
| 2 上記一覧→同じ面談の編集保存結果 | 編集→本文を修正→変更を保存 | 2 / 2 / 2（本文入力キー除外） | 記録照合、変更内容の2判断 | A/B/Cとも行右端の編集が明確。B初回のGP/運用会社radioは不正で採用不可。競合時は保存成功にせず再読込して確認 |
| 3 表示中一覧→削除後再検索 | 削除→対象と保持説明確認→削除する | 2 / 2 / 2 | 対象、保持/復元の意味の2判断 | 全案赤い最終actionと戻るを区別。native confirmから独自dialogにする場合はFRONTEND_BEHAVIOR。all状態なら行が残る |
| 4 過去面談ページ→eligible record復元 | 表示対象=削除済み→検索→復元→復元する | 4 / 4 / 4 | 削除済みの場所、対象とeligibilityの2判断 | 全案にrestoreと原本なし不可例。実際は面談・資料は別destinationであり、混在ボードをcombined listとして実装しない |
| 5 初期登録→意図した範囲で質問送信 | ナレッジ検索→開始日→終了日→GP→検索（質問入力、自由質問/ChatGPT既定を確認） | 5 / 5 / 5 | 質問目的、期間、GP、両資料、方法、許可model/thinkingの6判断 | A縦の一方向が最も簡潔。Bは縦長。Cは左右比較しやすいが入力幅狭い。詳細条件変更ならdisclosure等を加算 |
| 6 回答表示→原資料の新タブ到達 | 根拠注意と2つの出典identity確認→原資料を開く | 1 / 1 / 1 | 根拠不足の理解、資料選択の2判断 | A/Bは下、Cは右。いずれも文単位リンクを捏造しない。Drive権限を保証しない |
| 7 ナレッジ検索・条件設定済み→全文出力previewとCopy | 実行方法=全文出力→対象資料を確認→コピー | 3 / 3 / 3 | AIを使うか、本文対象/preview可否の2判断 | ChatGPTはAI、全文出力は非AI。Geminiはcurrentでは選べない。別fixtureのenabled時はroute選択1操作＋検索1操作、認可候補のみ |

比較/面談準備は検索mode変更に加えて、2〜5対象の選択または1対象の選択が必要です。画像に並べた補助例を同時表示の仕様とはしません。model/thinkingを変更するなら各選択操作が増えます。初期登録formは抜粋であり、任意項目の省略を機能削除とみなしません。

## 計画rubricの適用

計画の重み：first-action/用語20%、操作/判断15%、nav15%、出典15%、密度10%、状態10%、実装簡潔さ15%。画像をレビューした結果、現段階では**重み付き総合点を計算しません**。全方向にhard gate未達があり、点数で補償すると誤った合格になるためです。上の7観点の定性的評価を記録しました。

| Hard gate | 判定 |
|---|---|
| 画像の機能・用語一致 | FAIL：下記の観察済みの誤記/欠落 |
| 共通fixtureの指定 | PASS（promptの同一fixture） |
| 共通fixtureの実描画 | FAIL（prompt遵守と実画像を区別） |
| 出典identityの意図 | 文書単位の2件を保持。実リンク動作はNOT_RUN |
| 現行provider/認証の意図 | Source契約を維持。画像の一部は誤りで採用不可 |
| backend不要の設計 | 既存機能へ限定すれば成立。新APIは提案しない |
| keyboard / focus / contrast / laptop実装 | NOT_RUN：静的画像では合格にできない |
| Dark | NOT_STARTED：ユーザーのLight選択前 |

## 実画像で確認した不一致と停止判断

| 場所 | 画像で見えた問題 | 正しい仕様／扱い |
|---|---|---|
| A検索初回 | 任意の期間/GP/sourceにも赤い必須印 | 任意。修正画像で除去したが、mode/route等にも「任意」を広げたのは最終コピーにしない |
| A検索修正 | 「面談と資料の関連」navが消えた | 全11目的地必須。初回/maintenanceには見える。修正画像の全置換は不可 |
| B検索 | 名称にGASが入り、ホームbreadcrumbがある | 名称Knowledge Share、breadcrumbは非clickの探す。新Home routeは追加しない |
| C検索 | 全文出力が追加buttonのようにも見える | 単一の実行方法選択に留める。新しいショートカットhandlerを要求しない |
| A/B/C maintenance資料抜粋 | 資料のGP列/条件が「面談先」になっている | PitchbookはGP所有のまま。架空データが同じでも意味は変えない |
| A maintenance | DOC-000201の通常資料行IDが欠落し、操作列がずれた。面談内容に不要な必須印 | ID保持、専用操作列。本文任意 |
| B maintenance | GPと運用会社を別radioにした | 「GP / 運用会社」は1つのcounterparty type。既存selectを維持 |
| maintenance共通 | 更新版・任意filter全項目・Pitchbook編集欄が全ては描けていない | Source inventoryが契約、画像は抜粋。完全なフォーム視覚検証ではない |
| A/C states | no-Meeting時のAI用プロンプトcopyまでdisabledにした | export3操作のみnoResults/hardStopでdisabled、promptは別条件 |
| A states | 設定確認中のdisabled検索buttonが省かれた | 実行不可状態のcontrolを維持 |
| B states初回 | Geminiを未qualificationと説明。ProviderにMaster除外操作。unlockedに旧password欄 | QUALIFIED_DISABLED。ProviderとMaster別。旧password欄は追加しない |
| B states修正 | 上記は修正されたがログアウトbuttonが消えた | 0029のログアウト必須。初回/Cに存在しても修正画像の欠落はPASSにしない |
| states共通 | mode比較状態の強調、任意hint、コピー細部が方向間で完全一致しない | 同一機能としての厳密比較はFAIL。方向性の比較だけ可能 |

1初回セット（3方向×3画像）後、1回の対象限定修正ラウンドをA検索/B状態へ実施しました。修正で別controlを落とす同種の失敗が続いたため、instruction §8のreset/停止境界に従い生成を停止しました。画像そのものに残る不一致を文書で訂正しただけで「visual PASS」にしていません。

**BLOCKER: VISUAL_CONTRACT_PARITY_NOT_MET。** 未修正の画像を承認済み実装ターゲットとして使うことを阻止します。Product DesignやImageGenは利用可能であり、能力未接続のblockerではありません。アプリ本体の不具合や0027/0029の再オープン理由でもありません。

## 1440×900 / 1366×768の適合見積り

検索画像の実ファイルは約1.6:1の構図ですが、CSS viewportではありません。横1440/1366で自然比表示すると高さはおよそ900/855となり、1366×768では縦scrollを要します。下端のcitationを縮小して全体をfitさせる提案はしません。

- A：horizontal navを折り返す余地が必要。現画像の小さいnavは1366で特に厳しく、本文を14〜16pxより小さくして解決しない。検索/出典は縦flow維持。
- B：sidebar幅約220〜250を確保し、main余白と過大なlabel列を調整。出典は下へscroll。固定sidebarの高さもoverflowを許し、設定への到達を切らない。
- C：左右splitはlaptopで長いmodel名・質問を圧迫。縦積みへ移すbreakpointとtable横scrollを将来検証。左右配置を守るための文字縮小はしない。
- maintenance/statesボードは画面抜粋の縦連結です。ボード全体を768pxに縮めた可読性を合格基準にしません。実CSS keyboard/scroll/日本語折返し検証は未実施です。

## 推奨の範囲と実装リスク

Bの選択理由は、全11目的地を常時確認できることです。Aの質問→明示条件→実行→回答→原資料という読み順をBのmainへ適用し、Cの表の行間と右端操作群を借ります。Bの二重枠や広いlabel列は踏襲しません。検索landingを新defaultにせず、既存の面談登録を維持します。

| 分類 | 含める要素／境界 |
|---|---|
| PRESENTATION_ONLY | 既存navのgroup表示、見出し/用語、余白、border、行密度、出典title/ID/dateの配置、入力と本文の境界 |
| FRONTEND_BEHAVIOR | 任意filterのdisclosure、effective条件summary、label翻訳前の明示option value、custom confirmを選ぶならfocus trap/Escape/戻りfocus/1回送信、将来theme storage。現行handler/ページ初期化を保持して検証する |
| OUT_OF_SCOPE / BACKEND_REDESIGN | 新sheet/API、combined面談・資料endpoint、KPI、推測graph、saved search、favorites、pagination、bulk delete、file replacement、文単位citation、provider auto routing、Gemini enable、認証再設計、テーマbackend同期 |

見た目だけの変更でもoptionの暗黙value、include順override、filter変更時のpreview/pending無効化、nav初回loadを壊す可能性があります。将来の本体実装ではこの境界を重点検証し、今回その動作が合格したとは言いません。

FOLLOW_UP：ChatGPTが残るvisual不一致を確認し、必要なら新しいDispatchを発行する判断。OPTIONAL：より簡潔なコピーや装飾削減。ユーザーの選択前に追加Dark/本体buildへ進みません。

WORK_ID: 0028 / DISPATCH_ID: 0028-CODEX-03 / BALL: CHATGPT / STATUS: RETURNED
