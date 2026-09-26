# Work 0073 — APIキー・モデル設定と4種類の情報源の整合

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH
PLAN_REVISION: 2
IMPLEMENTATION_STATUS: NOT_STARTED_USER_CONFIRMED
ROUTE: C

更新日: 2026-09-26
設計正本: [provider-credential-management.md](../decisions/provider-credential-management.md)
現在のボール: [0073-dispatches.md](../handoffs/0073-dispatches.md)
実行指示: [0073-CODEX-02](../handoffs/0073-CODEX-02-simple-model-setup-instruction.md)

## 1. Primary Outcomeと今回の変更

利用者が内部IDやqualification手順を管理せずに、AI接続を設定し、モデルを`選択または直接入力 → 確認して保存`で安全に変更できる。面談メモ・保存資料・ニュース・評価の同期操作も同じ導線で扱える実装を完成させる。

ユーザーはWork0073未実行と確認し、直前の設計簡素化案を採用した。旧CODEX-01は未実行のままSUPERSEDEDとし、実行要求をCODEX-02へ更新する。Work IDは変更しない。

### 旧計画から置き換える事項

| 旧計画の解釈余地 | 今回の確定仕様 |
|---|---|
| 登録・資格確認・既定化を個別操作にする | モデル変更フォームと`確認して保存`に統合。内部検証は維持 |
| 初回にも承認済み既定モデルが存在する前提 | 既定なしでも候補選択/直接入力で完了可能 |
| 状態項目を通常カードへ大量表示 | 現在のモデル、利用状態、次の操作を中心にし、詳細は展開 |
| 新Model IDは無条件にコード変更不要 | 既存API/要求形式で動く範囲では設定だけで追加可能 |
| モデル名の固定値を全面禁止 | 通常登録の完全なallowlistにはしない。限定的な初期候補・adapter定義は可 |
| 思考値を全モデル共通化、全組み合わせを確認 | 新規はパラメータ省略の標準、選択した実行設定だけ確認 |
| 発見・登録・確認等をそれぞれ永続化 | 候補キャッシュ、既存モデルポリシー、設定に紐づく確認結果を区別 |
| alias専用選択モードと同意画面 | 性質が分かる候補への補助表示とModel IDの明示選択だけ |
| runtime未確認でも全Work完了と誤読できる | 今回は実装レビュー用Draft PR。運用READYと最終Acceptanceは別 |

## 2. Work Contract

| 項目 | 契約 |
|---|---|
| Fastest Safe Decisive Action | 既存モデルポリシー・request builderを再利用し、候補検証と安全な切替の共通処理を先に固定。その上に1つの変更フォームを接続 |
| 必須範囲 | Credential Operator、キー更新保護、モデル変更の簡素化、状態表示、4-source選択/同期/reset、関連検証と配布物 |
| 現行基準 | Work0070/0071 ACCEPTED、Work0072 core統合、release 0.2.3、schema9/7 sheets。ライブ実行結果は別証拠 |
| 現在の作業 | GitHub文書更新はRoute A/TIER_1_LOW。次の実装DispatchはRoute C |
| 実装Validation Tier | TIER_3_HIGH。認証情報の操作認可・安全な切替を変更するため、work-control.mdのsecurity enforcement条件に合わせ旧Tier 2を訂正 |
| 今回の証拠 | production sourceを使う局所logic/integration試験、変更画面のブラウザ操作、直接結合する回帰、配布物整合 |
| Target runtime | Apps Script V8/Workspace/Web App/許可されたprovider API。ただしCODEX-02では更新・実呼び出しをしない |
| テスト境界 | 合成fixture、fake provider、ローカルbrowser。実キー・業務データなし |
| 外部変更境界 | CODEX-02はrepository branch/Draft PRのみ。実provider、Workspace、deploy、権限、秘密作成/更新は0 |
| Staging | 新設しない。後続runtime検証は対象と権限を別途確定 |
| 試行上限 | 同一失敗の推測修正は2案まで。canonical checkは局所検証後1回、実質修正時だけ再実行 |
| 戻し先 | ChatGPTがdiff、証拠、次のruntime検証を判断する。CodexはWork全体をACCEPTEDにしない |

Tierを上げても全画面・全provider・過去Workの総再検証は追加しない。今回外部実行が許可されていないことは、実装と局所検証を止める理由にしない。

## 3. Closed Conclusions / Non-Goals

維持する決定:

- 入口は`管理者ページ > AI設定`、通常操作は既存のrolelessモデルを維持する。
- 生キーを受け取る操作だけ強いサーバー認可を要求し、共有パスワード/アプリ全体の新RBACは作らない。
- キーはScript Propertiesを小さなinterface経由で扱う。未検証候補でactive keyを上書きしない。
- `利用開始`、キー削除、業務資料同期の副作用をモデル変更へ混在させない。
- Work0072のsourceTypes[]、Active-only、provenance、件数上限、Full Output、multi-Counterparty非重複を保持する。
- schema9/7 sheets、既存レコード/ID、停止中のprovider、業務資料を保持する。
- ChatGPTサブスクリプションとOpenAI APIの請求差の注意書きは表示しない。

対象外: Secret Manager、Cloud/IAM/OAuth変更、Azure/Work0030、会社展開、履歴資料移行、全モデル巡回/評価、外部モデルカタログ依存、自動upgrade/failover、汎用JSON設定エンジン、新モデル管理DB、無関係な画面改修。

## 4. 画面契約

### 4.1 通常カード

現在のモデル、利用状態、次の主要操作を表示する。接続・資料検索・同期の詳細は展開時に表示する。`資格情報/接続確認/4-source検索確認`等を独立した利用者の作業チェックリストにしない。

未取得・通信失敗・未設定・資料0件を区別する。状態取得が失敗してもカードを消したり未設定へ戻したりしない。古い状態を残す場合は更新失敗と分かる表示にし、古い認可だけで秘密操作を許可しない。

APIキー欄は初回/更新時だけ表示し、通常のモデル変更ではキー再入力不要。検索画面の任意モデル/思考選択を削除せず、既定選択と確認済み候補で利用負担を抑える。

### 4.2 初回設定

```text
1. 利用環境と接続先を確認
2. APIキーとモデルを設定 → 確認して保存
3. 利用開始
   └ 資料同期は別操作
```

- 保存済み既定があれば初期選択。なければ候補から選ぶ。
- 候補一覧を取得できない/目的のモデルがない場合はModel ID直接入力で進む。
- Model ID以外の内部管理項目を利用者へ要求しない。既存ポリシーを全削除/初期化しない。
- 新規の思考設定は`プロバイダ標準`。選んだ設定を1つの確認・保存操作へ渡す。
- API確認と4種類の合成資料での検索/引用確認を内部で実施し、未検証の設定を有効扱いしない。
- 資料0件でも接続準備は完了できる。`接続準備完了/資料未同期`を未設定と混同しない。

### 4.3 モデル変更

同じフォームで候補選択と手入力を扱い、主操作は`確認して保存`だけにする。表示名は取得値またはModel IDで補完、Profile IDは内部生成、familyやraw thinkingの手入力は通常必須にしない。

既定モデル変更では、確認に成功した候補をその操作内で既定として採用する。別の登録・資格確認・既定化ボタンを順に押させない。非既定の設定違いを管理する既存expert機能は詳細側へ残し、同じ保存処理を再利用する。

候補の失敗では現在のモデルと他の確認済み設定を維持する。停止中の接続を勝手に有効化しない。回答モデル変更だけでStore再作成、キー再登録、全資料同期を発生させない。

### 4.4 キー更新・停止・削除

キー更新は候補による確認後にだけ採用し、失敗時に旧キー/モデル/有効状態/Store/同期状態を保持する。更新前に停止中なら停止のまま。

停止はキーとStoreを残す。資格情報削除は停止中かつCredential Operatorのみ許可。このアプリのキー削除とprovider側失効/Store削除を混同しない。

## 5. モデル候補取得

- 既存接続で変更フォームを開く際、短時間キャッシュがなければ1回取得する。明示的な`一覧を更新`でも取得する。通常検索時、通常カード再描画時の一覧取得は0回。
- 初期TTLは10分とする製品側の設計値。定期ジョブは不要。キャッシュ失効は保存済み設定やqualificationの失効ではない。
- キャッシュを使う場合はprovider、環境/接続境界、active credential世代を分離し、raw keyをキー名や値へ格納しない。候補キーでの取得結果は共有キャッシュへ保存しない。
- 初回/キー更新中の一覧取得は、候補キーを送る専用認可済みRPCで可能にする。各RPCで再認可し、キーはその呼び出しのローカルだけで利用する。
- モデル一覧をページングするAPIはページ数/件数を有限にし、途中までなら不完全と表示する。Model ID直接入力を常に残し、ページ上限を登録allowlistにしない。
- 既存・確認済み候補を見つけやすくする。名前や作成日時だけから最新/高性能の自動推薦はしない。
- modelId/displayName/取得時刻等だけを返し、外部の生応答、所有者ID、資格情報、private resource IDは返さない。
- 一覧の欠落/取得失敗を実行不可とみなさない。存在一覧と実行能力のチェックは別責任にする。

## 6. 思考設定とprovider adapter

新規の標準設定では任意の思考パラメータを送らない。省略を`auto`や推定した強度へ書き換えない。既存の明示設定、アプリ側の出力上限、安全上の必須設定は保持する。

既知の能力に合う選択肢だけ提示し、未知モデルにLow/Medium/Highを機械的に付けない。未知モデルは既存API形式の標準設定で確認できる経路を残す。

上書きは既存adapterが扱える型/形式に限定し、同一モデル内の設定違いとして保持する。一般利用者は確認済み組み合わせだけを選択できる。詳細側で新しい組み合わせを設定した場合は、当該候補だけを確認する。

新Model IDは既存API互換範囲なら設定で追加可能。未対応の要求形式を必要とする場合は、既存設定を壊さず、必要なadapter対応を具体的に返す。将来仕様の自動推定や任意JSONパラメータ送信は実装しない。

Model IDはproviderの正規化規則に従い、大文字小文字を無断変換しない。長さ/制御文字等を検証し、URL・ヘッダー・任意API経路として使わない。候補リスト由来でなくても同じ検証を行う。

## 7. 保存・確認結果の内部契約

### 7.1 最小構成

既存`AI_MODEL_POLICY_JSON`/profile構造とprovider request builderを再利用する。別モデル台帳や二重の状態正本を作らない。

- 候補一覧: 短期の選択補助。
- 保存済みモデルポリシー: 実行の正本。
- 確認結果: 実行に影響する設定と確認範囲を保持。
- operation状態とsource sync状態: モデルの利用可否とは別に扱う。

公開UIの状態はこれらから導出する。旧ready enumを変更する場合は互換変換し、既存設定を勝手に有効化しない。

### 7.2 1つのモデル確認・保存処理

```text
候補選択または直接入力
→ 同じ正規化/サーバー認可
→ 実際の要求設定を構築
→ 同一設定の有効な証拠があれば再利用、なければ必要な確認
→ 設定/credential/Store世代の照合
→ 候補を保存し、当該操作の既定/表示指定を採用
→ 安全な結果を返す
```

同じ処理を初回設定、モデル変更、設定違いの追加に利用する。キー変更の認可を通常モデル変更と同一にする必要はなく、共通化するのは正規化・要求構築・確認・採用のロジックである。

必要に応じoperation IDと保存世代で二重送信・応答消失を扱う。ブラウザのdisabledだけに依存しない。未確認結果の自動再送やoptimistic successは禁止。外部処理中は長いScriptLockを取らず、採用時に短いロック/CAS等で古い候補の上書きを防ぐ。

複数Sheet/Propertiesの更新をAPI横断で原子的だと仮定しない。途中失敗でも現在のキーと未確認モデル設定が組み合わさらないことを証明する。provider単位の保存済みsnapshot等、既存構造に沿う最小の整合手段を選び、一般的な分散transaction基盤は作らない。

### 7.3 qualificationの有効範囲

確認するのは採用する実行設定だけ。provider、正確なModel ID、パラメータ省略/指定、思考値、実際の出力上限、request/tool形状、adapter互換version、接続境界、credential世代を照合する。

4種類の合成sourceの検索/引用確認を内部campaignでまとめる。候補一覧取得や短文生成だけでFile SearchをQUALIFIEDにしない。選択外のモデルや思考値まで試さない。テスト時と通常時に同じrequest builderを使用する。

運用Storeへのアクセス確認と合成Storeでの検索能力の証拠は分ける。合成Store IDを運用Storeの確認済みIDへコピーして済ませない。初回は運用Store未作成でも能力確認を進められ、利用開始時に既存のStore-bound readiness条件を満たす。これにより「Store作成には資格確認、資格確認には未作成の運用Storeが必須」という循環を作らない。

初回確認で作った一時資源は片付ける。後片付けに失敗した場合は、候補を採用せず旧設定を維持して、その操作の要対応事項として返す。無関係な確認済み設定の証拠まで失効させない。

Model ID/思考値/出力設定/接続や要求互換性が変われば該当証拠を再確認する。表示名/並び順だけは再確認不要。全く同じ有効設定の再保存ではproviderを再呼び出ししない。既存の証拠に必要なbindingがなければ成功を捏造せず、該当設定だけ再確認とする。

### 7.4 秘密情報と権限

Credential Operatorは既存installer/deployment-securityの本人確認を副作用なく再利用する。active identityが不明なら秘密操作を拒否し、effective userだけで所有者と扱わない。通常のroleless操作権限へこの制限を広げない。

秘密操作用facadeを分け、旧alias/通常RPC/raw credential fieldからの迂回を拒否する。候補一覧取得にraw keyを渡す場合も同じ認可を要求する。authoritative owner設定を書き換えるbootstrap helperを認可のために呼ばない。

候補キーはフォームの操作中メモリと各RPCのローカルに限る。サーバー永続化、CacheService、browser storage、ログ、Audit、エラーresponseへ残さず、完了/取消/離脱/送信失敗後はフォームから消去する。クライアントの基本入力検証だけで拒否された段階は再入力を不必要に要求しない。

候補の確認中はactive keyを一時的にも上書きしない。既存運用Storeへのアクセスを確認できない候補キーは採用せず、自動Store置換をしない。秘密が必要な製品経路を実装することと、今回のCodexに実キー操作を許可することは別である。

## 8. 4種類の情報源との整合

| Canonical source type | 表示名 | 既存ID |
|---|---|---|
| Meeting | 面談メモ | MTG-* |
| Pitchbook | 保存資料 | DOC-* |
| News | ニュース | NEWS-* |
| Internal Assessment | 評価（ICメモ、社内整理等） | ASMT-* |

source registryを再利用する。`同期・診断`で種類、日付、名前/面談先等から対象を選び、内部では安定IDを渡す。個別同期は旧来のID文字列入力を必須にしない。

選択、exact resolution、sync、失敗対象再実行、Store変更に伴う派生状態reset/rebuildを4種類で揃える。News/Assessmentの古いprovider stateだけが残る状態を許容しない。resetは該当provider派生状態だけを対象にし、元資料や他providerを破壊しない。

同期前に送信先と対象を示す。同期後はselected/indexed/unchanged/metadataRefreshed/removed/failed等と部分/残りを区別し、1batch完了を全体完了にしない。再試行は失敗対象へ限定し、通常のActive/Inactive契約・重複防止を維持する。

## 9. 障害・変更時の扱い

| 発生事象 | 挙動 |
|---|---|
| 一覧API失敗・空・候補の欠落 | 現在設定保持、直接入力/再取得可。実行不可とは断定しない |
| 新モデル発見 | 候補追加のみ。自動既定化しない |
| 非推奨/終了予定 | 確認できた情報を変更画面で補助表示。即時停止しない |
| 実呼び出しでモデル利用不可 | 対象モデル/設定の要対応を表示。別モデルへ切り替えない |
| 一時制限/通信障害 | 恒久的な提供終了と分け、設定保持 |
| 新設定の検証失敗 | 候補だけ不採用。旧設定不変 |
| 保存応答消失 | operation結果を照会。確定前に再保存しない |
| aliasの選択 | 確認できる性質を補助表示。追加モード/同意画面なし。将来の不変性を保証しない |

## 10. 実装順と変更対象

1. 認可/秘密経路、既存profileと要求構築の接点を局所確認し、単一の候補検証・採用経路を作る。
2. active/candidate credentialの分離、短い保存ロックと世代照合、結果不明時の照会を実装する。
3. モデル候補取得・直接入力・標準思考設定を同じフォームへ接続する。初回既定なしを最初のUIシナリオに含める。
4. 通常カード、状態不明/失敗表示、詳細設定、停止/削除を接続する。
5. 4-source同期/選択/resetを統合し、対象テストを通す。
6. current docsの直接影響箇所、配布bundle/company packageを更新し、局所→canonical検証を実施してDraft PRで返却する。

想定箇所（全変更必須ではない）:

- `src/130_AiConstants.gs`、`src/134_AiModelPolicyContracts.gs`
- `src/160_AiEnvironment.gs`、`src/161_GeminiRestClient.gs`、`src/163_OpenAiRestClient.gs`
- `src/164_AiProviderCore.gs`、`src/165_AiProviderAdmin.gs`、`src/170_AiEntryPoints.gs`
- `src/AiProviderSettingsPage.html`、`src/ClientAiProviderSettings.html`、局所`Styles.html`
- `tests/ai-model-policy.test.cjs`、`tests/ai-provider-admin.test.cjs`、直接結合するprovider/sync/Work0072 tests
- 生成配布物、必要なfacade allowlist/manifest/current docs。新モジュールは独立性がある最小範囲のみ。

registryのWork0073行が旧CODEX-01を案内している場合は、このDispatchのローカル文書整合で当該行だけCODEX-02へ同期する。他Workの履歴は変更しない。現在の実行正本はdispatch registerであり、旧01ファイルも新指示への案内に変更してある。

## 11. Acceptance Evidence Matrix

本Matrixは実装要件であり、PASSを事前宣言するものではない。CODEX-02ではA〜Fを合成/ローカルで検証し、Rは後続の権限確定までNOT_RUNとする。

| ID | 必要な証拠 |
|---|---|
| A1 | 初回・既定なし・一覧成功からモデルを選び、1回の`確認して保存`で接続準備まで到達 |
| A2 | 一覧失敗/空/候補外でも手入力から同じ処理で保存可能。既存モデル名にない合成Model IDを使用 |
| A3 | 既存モデル変更はキー再入力0、業務再同期0、運用Store再作成0。停止中は停止維持 |
| A4 | Profile ID/family/raw thinking記法を必須入力にしない。通常カードにキー空欄・不要な請求説明なし |
| B1 | 通常検索で候補一覧の外部呼び出し0回。キャッシュ/明示更新/取得日時/部分一覧を確認 |
| B2 | 一覧失敗・候補欠落・非推奨だけで保存済みモデル/確認結果を変更しない |
| B3 | candidate discoveryはoperator認可必須、candidate keyの共有キャッシュ/永続化0、active cacheは接続/世代を分離 |
| C1 | 標準は任意思考パラメータ省略。既存明示値と出力上限は保持。未知モデルへ強度を捏造しない |
| C2 | 同じ正規化/要求構築で選択tupleだけ確認。選択外モデル/思考値の呼び出し0。未確認値を通常実行で拒否 |
| C3 | 実行に影響する設定変更で当該証拠だけ再確認。同一有効設定/表示名変更は再検証0回 |
| C4 | 一覧取得・短文生成だけでは4-source検索確認をPASSにしない。temp Storeと運用Storeの証拠を混同せず初回の循環依存なし |
| D1 | 未認可、identity不明、偽装client、旧RPC/alias/raw field経由で秘密操作を拒否。認可自体のinstaller状態変更0 |
| D2 | 候補キー/モデル検証失敗、Storeアクセス不一致でactive key/model/enabled/Store/source state不変 |
| D3 | 同時保存/古い世代/二重クリック/応答消失/保存途中失敗で古い候補の上書き・誤った成功・不安全な再送なし |
| D4 | status/error/log/Audit/browser storageにraw keyや断片なし。terminal/cancel/離脱時の消去。disable保持、remove認可と停止条件 |
| E1 | 4種類すべて人が判別できる選択→安定ID解決→syncまで到達。複数Counterpartyでもsource重複0 |
| E2 | 4種類すべて該当providerのreset/rebuildが整合し、元資料・他providerの状態は保持 |
| E3 | 部分同期/失敗/残りと全体完了を区別し、失敗再試行が正常完了分の重複処理を起こさない |
| F1 | 変更画面のdesktop/390px、keyboard、focus復帰、busy/error/unknown/retry、horizontal overflow、material console errorを確認 |
| F2 | 直接結合する回帰、`npm run check`、`git diff --check`、`python tools/validate_agent_foundation.py`、bundle/company package整合 |
| R1 | 後続: 実際の認可済みApps Scriptで本人確認、保存/結果照会、provider世代束縛を確認 |
| R2 | 後続: 専用の許可済みキーと合成資料だけで対象providerの一覧/設定/4-source検索・引用・cleanupを確認 |

既存の合格証拠を再利用できる直接依存は重複実行せず、再利用根拠を記載する。今回無関係な7画面viewport sweep、全モデル/全思考値/全provider巡回は行わない。

## 12. 権限・予算・Strategy Reset

CODEX-02許可: repository source/tests/docs、ローカルfake/合成fixture、browser、生成配布物、branch/Draft PR/report。

```text
REAL_PROVIDER_CALLS: 0
REAL_CREDENTIAL_ACCESS_OR_MUTATION: 0
AI_INDEX_MUTATION: 0
APPS_SCRIPT_OR_WORKSPACE_MUTATION: 0
PERMISSION_OR_PUBLIC_EXPOSURE_CHANGE: 0
COMPANY_DATA: 0
SECRET_MANAGER_CHANGE: 0
USER_NATIVE_ACTION_BUDGET: 0
```

候補検証/外部呼び出しの製品コードを実装しても、今回のテストで実キーを探索・使用しない。ユーザーにキー入力や実機操作を要求しない。外部権限不足はR1/R2のNOT_RUN理由とし、A〜Fの安全に進められる作業は完了させる。

Reset条件: 既存権限境界で秘密操作を保護できない、plaintext候補の呼び出し間サーバー保存が必須になる、旧設定保持に重大な矛盾がある、schema9以外/新DB/Cloud変更が不可欠、同じ重大な失敗が2修正案後も続く。影響する経路を止め、Accepted Evidenceと最小の次行動をChatGPTへ返す。製品全体の再設計へ広げない。

## 13. 返却とCompletion Latch

Branch: `work/0073-provider-credential-onboarding`
Draft PR: main向け1件。Codexによるmergeなし。
Report: `docs/handoffs/0073-CODEX-02-simple-model-setup-report.md`

reportはA〜Fの結果/証拠、R1/R2 NOT_RUN、変更path、直接依存の回帰、side effects、BLOCKER/FOLLOW_UP、Shared Knowledge利用receiptを記録する。画面合成試験をApps Script/live provider PASSへ言い換えない。

CODEX-02で許される完了主張は`実装・ローカル検証済み、レビュー待ち`まで。runtime証拠未取得のWork0073は運用READY/ACCEPTEDにせず、Completion Latchも未適用。ChatGPTが必要なruntime証拠と最終diffを確認した後にだけ適用する。Work0072の保留済みlive検証を自動再開しない。

## 14. 参照・設計判断の記録

- `GOOGLE-WEB-UX-KB` v1.0: 必要入力の削減（FORM-006）、適切な検証・復旧（FORM-003/004/005/007）、状態/位置（CLS-002/005、NAV-005）、keyboard（A11Y-002/003）、一巡と証拠（QA-002/005/006）。資料はProject Sourceにあり、上記要件へ必要部分を反映済み。Codexが資料全体を取得できないこと自体をblockerにしない。
- Shared Knowledge: indexから`OBS-0018-runtime-qualification-should-bind-the-full-behavior-affecting-configuration-tuple.md`を参照し、省略と明示値・出力上限を含む実効設定へ証拠を束縛。見た目だけの変更では再検証しない。
- 前回のDify/Open WebUI/LibreChat/OpenCode比較の適用とURLは設計正本末尾を参照。今回新しい製品比較を繰り返す必要はない。
- Codex Project SourceのGoal/Context/Constraints/Done whenと恒久ルール外出しを採用。公式best practices/modelsも2026-09-26に確認。
- 推奨実行設定: GPT-5.6 Sol / High。権限・複数保存先・provider要求の結合レビューが残るため。Max/Ultraや固定subagent数は要求しない。これは開発用モデルであり、アプリの初期Model IDを固定する指示ではない。

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-02
BALL: CODEX
STATUS: READY
