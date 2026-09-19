# Work 0037 — UI refinement requirements intake

WORK_ID: 0037
STATUS: ACTIVE
MODE: BUILD
PHASE: REQUIREMENTS_FROZEN

## Purpose

Work0036/version11をbaselineに、ユーザーが各画面を実機確認しながら順番に提示するUI修正要件を蓄積する。

この段階ではCodex Dispatchを開始しない。複数チャットにまたがる要件収集が完了し、ユーザーが実装開始を指示した時点でWork Contractを確定してDispatchを発行する。

## Baseline

```text
PRODUCTION_BASELINE: Work0036 / version11
PR_BASELINE: #58 merged
LAYOUT_LANGUAGE: 12 columns / 14px gap / width100% / max2000
WORK_0030: DEFERRED_BY_USER
```

## Screen: 過去の記録

### Labels / grouping

- `Date From` を `開始日` に変更する。
- `Date To` を `終了日` に変更する。
- 開始日・終了日の直上にgroup label `対象期間` を表示する。

### Placement

- `開始日`、`終了日`、`Asset Class`、`Team` は左側へ詰めて配置する。
- `面談先` は `開始日` の下に配置する。

### Hidden / fixed

- `Fund / Strategy` はnormal UIから非表示にする。
- `Status` は検索条件として `Active` 固定とし、normal UIから非表示にする。

### Compatibility intent

- hidden fieldsのbackend/search contractは必要に応じて保持する。
- Status hidden化後のsearch payloadは常に`Active`を送る。
- Fund / Strategy hidden化後はfilter値を空として扱い、historical data/schemaを変更しない。

## Requirements freeze

2026-09-19: ユーザー確認により、この文書に記載した要件をCODEX-01の実装scopeとしてfreezeする。追加要件は新しい明示指示がある場合のみ扱う。
## Screen: ナレッジ検索

### Visibility

- `詳細条件`は折りたたまず、常時表示する。
- `Fund / Strategy`は非表示。
- `要フォロー`は非表示。
- `Meeting Type`は非表示。
- `Equity / Debt`はWork0036 accepted policyどおり非表示を維持。

### Layout intent

ユーザーの「1列目〜5列目」は、上から順に並ぶ5段のrowとして一旦解釈する。

#### Row 1 — 対象期間

- `開始日`
- `終了日`
- `全期間` checkbox
- 左詰めでコンパクトに配置。

#### Row 2 — 対象

- `面談先`
- `Asset Class`
- `Team`
- 面談先は会社名が長くなる前提で、`過去の記録`タブの面談先selectorと同程度の横幅を確保する。
- Asset Class / Teamは面談先の右側に配置し、不要な空白を作らない。

#### Row 3 — 検索方法 / AI

- `検索モード`
- `AIモデル`
- `検索モード`の初期値は`要約`。
- `全文出力`buttonを検索モードのすぐ右側に配置する。
- AIモデル選択はその同じrow内で自然に続ける。

#### Row 4 — 指示

- 現在のlabel `質問`を`AI検索 指示入力欄`へ変更する。
- textareaはfull widthを基本とする。
- 現在のread-only/help文言は、`AI検索 指示入力欄`という名称に合わせて必要なら自然な日本語へ調整する。

#### Row 5 — Actions

- `AI検索を実行`buttonを配置する。
- `条件クリア`buttonを配置する。
- 両buttonは左寄せ。
- `AI検索を実行`をprimary action、`条件クリア`をsecondary actionとして視覚的に区別する。

### Button naming / behavior

- 現在の`検索`buttonは`AI検索を実行`へrenameする。
- `全文出力`はRow 3に移動するが、既存non-AI full output behaviorは変更しない。
- `条件をクリア` / `条件クリア`は表記を`条件クリア`へ統一する。

### Functional compatibility

- 非表示化したFund / Strategy、要フォロー、Meeting Typeはnormal UIから使わない。
- search payloadはこれらをfilterなしの既定値として扱う。
- backend/schema/search contract自体を削除しない。
- `AIモデル`未設定時の既存validation/error behaviorは維持する。
- 全文出力はAIモデル未設定でも利用可能という既存contractを維持する。

### Visual consistency

- Work0036/version11の12-column / 14px gap / max-width2000 baselineを維持。
- date controlsやcheckboxは過度に横へ伸ばさず、左詰めで短い視線移動にする。
- selector/inputのheightは他画面と同じ約37px。
- 1440/1280でも同じrow構造を維持し、<=720pxは安全にstackする。
## Screen: 面談実績の集計

### Top filter area

- 1段目のcontrol間に空きすぎる余白があるため、全体を左へ詰めてcompactに配置する。
- `集計`buttonも右端ではなく左寄せにする。
- controlsは必要以上に横へ引き伸ばさず、Work0036の12-column / 14px gap languageを維持しつつ短い視線移動にする。

### Label

- 現在の`期間`labelを`期間粒度`へ変更する。

### Target period default

- `開始日`の初期値は、`終了日`の初期値から1 calendar year前の同月同日とする。
- 例: 終了日が`2026/09/19`なら開始日は`2025/09/19`。
- leap day等で同日が存在しない場合は、その月の最終有効日へsafe clampする。
- ユーザーが明示的に日付を変更した後は、その入力を勝手に再計算しない。

### Result section ordering

現在の表示順を変更し、上から以下の順にする。

1. `選択した内訳`
2. `該当Meeting`
3. `集計サマリー`

- `集計サマリー`は最下段へ移動する。
- section内部のchart/table/content contractは原則維持し、まずは表示順だけを変更する。

### Compatibility intent

- 集計ロジック・period aggregation semantics・backend service contractは変更しない。
- label / default date / layout / section orderのUI refinementとして扱う。
- existing owner-only analytics behaviorを維持する。
## Screen: プルダウンの管理

### Page structure

- 現在は面談先・Asset Class・面談場所・Team等が同じ画面内で一括表示されているが、ページ内tabへ分割する。
- tabを切り替えると、その区分の追加・一覧・編集操作だけを表示する。

### Initial tabs

少なくとも以下のtabを設ける。

1. `面談先`
2. `Asset Class`
3. `面談場所`
4. `Team`

- Work0036 accepted policyどおり、`Equity / Debt` / `CAPITAL_TYPE` は管理tabとして出さない。
- backend上の既存CAPITAL_TYPE dataは保持し、削除・migrationはしない。

### Tab: 面談先

- 面談先マスターだけを表示する。
- `新規面談先を追加`buttonを表示する。
- 追加時はWork0036で導入済みのshared modalを使用し、modal内で`面談先種別` + `面談先名`を入力する。
- 一覧では既存の面談先、Status、名称変更、無効化/再有効化を管理できる。
- 面談先種別は既存metadataとしてread-only表示してよいが、一覧上で直接編集するselectにはしない。

### Tab: Asset Class

- Asset ClassのOption Master rowsだけを表示する。
- 追加formではType selectorを出さず、入力欄は名称 + 追加buttonにする。
- 一覧で名称変更、順序変更、無効化/再有効化を維持する。

### Tab: 面談場所

- LOCATIONのOption Master rowsだけを表示する。
- 追加formではType selectorを出さず、名称 + 追加button。
- 一覧で名称変更、順序変更、無効化/再有効化を維持する。

### Tab: Team

- TEAMのOption Master rowsだけを表示する。
- 追加formではType selectorを出さず、名称 + 追加button。
- 一覧で名称変更、順序変更、無効化/再有効化を維持する。

### Interaction

- tab切替はpage reloadなし。
- 初期tabは`面談先`。
- active tabが明確に分かるvisual stateを付ける。
- tab切替で各区分の入力中stateを誤って別区分へsubmitしない。
- `再読込`は現在選択中tabを維持したまま全master dataをrefreshしてよい。

### Layout

- 1つの区分だけを表示するため、現在の左右2分割master-layoutは廃止してよい。
- 各tabのcontentはfull widthを基本とし、追加formは左寄せでcompactにする。
- tableはpage widthを有効活用し、操作列だけ必要幅にする。
- Work0036/version11のLight UI / max-width2000 / 14px rhythmを維持。
- mobileではtab barを横scrollまたはsafe wrapし、contentは1-column。

### Compatibility intent

- master mutation service / schema / option type codesは変更しない。
- UIで現在選択中tabに対応するtype codeを内部的に固定して送信する。
- userがType codeを手入力・選択する必要をなくす。
- existing inactive rowsやsort order contractは維持する。
## Screen: 管理者ページ

### Authentication simplification

- 現時点ではアプリ内の共有管理者パスワードを設定しない。
- `共有管理者パスワード`の初期設定、確認入力、管理者モード開始、管理者モード終了、パスワード変更などの一連のUIを撤去する。
- 管理者ページを開いた時点で、そのページ内の設定操作をそのまま利用可能にする。
- `ロック中 / 管理者モード`というアプリ内状態概念もnormal UIから撤去する。

### Security boundary

- これはWeb App自体をpublic化する指示ではない。
- Work0036/version11でacceptedなApps Script deployment securityを維持する。
- same owner-only / authenticated deployment boundaryを維持し、permission broadeningは行わない。
- 追加の“第2パスワード”だけを撤去する。

### UI cleanup

- 画面上部の`管理者モード`card / password関連formを削除する。
- `状態は閲覧できます。変更には管理者モードのロック解除が必要です。`等のpassword前提help文言を削除・更新する。
- OpenAI / Gemini / model policy等の各設定cardは直接操作可能な状態を基本とする。
- disabled状態がshared-password gate由来の場合は解除する。
- provider未設定・qualification未達・feature policy等、password以外の理由によるdisabled状態は維持する。

### Code / state cleanup intent

- shared admin passwordのactive code path、unlock/lock session state、password initialize/change flowを削除する。
- password hash/secret値をnormal UIへ表示しない。
- legacy password-related Script Properties等が存在する場合は、既存deploymentのsecurityを壊さない範囲で未使用化する。不要な値の物理削除はimplementation時に安全性を確認して判断する。
- password mechanismを将来再導入しやすくするために残骸UIを残すのではなく、現行product surfaceからは明確に撤去する。

### Acceptance intent

- owner-only Web Appへアクセスできるユーザーは、管理者ページを開いてそのまま設定変更操作に入れる。
- password入力要求0。
- unlock/lock button0。
- shared admin password initialize/change UI0。
- provider/security behavior自体は変更しない。
- permission broadening0。

### Future note

- 将来会社展開時に追加認証が必要と判断した場合は、別Workとして再設計する。
- Work0037では“パスワード無し”をcurrent product behaviorとして扱う。
## Screen: 記録を追加

### Space-saving refinement

Work0036/version11のaccepted Meeting-create layoutをbaselineとし、fieldの意味・backend contractは変えず、未使用の右側spaceを活用して縦方向の占有を減らす。

### Row 1 — Meeting Typeを右側へ

- 現在別rowを使っている`Meeting Type` checkbox groupを、1段目の右側へ移動する。
- Date / Time / 面談場所 / Team / Asset Classの右側に残るspaceを使う。
- 12-column基準では、既存Row 1がcolumns 1–9を使用しているため、Meeting Typeは原則columns 10–12を使用する。
- 3 checkboxは可能なら同一row内にcompactに並べる。
- 1440/1280で窮屈な場合はMeeting Type block内だけsafe wrapしてよいが、別のfull-width rowへ戻さない。
- mobile <=720pxは通常stackでよい。

### Internal Participants + 登録button

- `登録`buttonをform最下部から移動する。
- `当社側`入力欄の右側に配置する。
- `当社側`fieldは現状の左側spanを維持し、その右隣の空きgrid spaceへcompactな登録actionを置く。
- buttonは入力欄と同じrowで、control bottom lineに揃える。
- 12-column基準では`当社側`がstart1 span6なので、登録buttonはstart7側から自然に配置する。
- button自体を不要に横長にせず、labelに必要なfit-content程度とする。
- submit semantics、disabled/busy state、validation、retry behaviorは変更しない。
- 現在最下部にある登録button用action rowは、button移動後に不要なら撤去する。

### Attachment section

- `資料を添付（任意）`のfile drop areaを現状より少し短くする。
- drop areaの右側にaction columnを作る。
- `選択をクリア`と`未完了分を再試行`を、その右側spaceに縦並びで配置する。
- 2つのbuttonのためだけに独立した横1段を使わない。
- desktopではdrop area + right action columnを同一rowにする。
- 目安としてdrop areaは横幅の約80–85%、action columnは残り15–20%程度。実装時はbutton labelが切れないことを優先して調整可。
- right action column内は上から:
  1. `選択をクリア`
  2. `未完了分を再試行`
- button幅はcolumn内で揃える。
- mobile <=720pxではdrop areaの下にbuttonsをstackしてよい。
- file drop / click selection / retry / clearの既存behaviorは変更しない。

### Vertical rhythm

- Meeting Typeのrow削減、attachment action row削減、登録buttonのbottom row削減により、画面全体をよりcompactにする。
- `面談内容`textareaの高さは現状accepted値を維持し、単に上部の無駄な縦spaceを減らす。
- success/status messageの表示領域は維持し、submit resultが見えなくならないようにする。
## Closed interpretation

- ナレッジ検索の`情報ソース`はユーザーから削除指示がないため機能を維持する。Row 2の右端にcompactに残し、`面談先 / Asset Class / Team`の優先配置を壊さない。
- 過去の記録のMeeting Type filterは維持する。Fund / StrategyとStatusだけを指示どおり非表示化する。
- 管理者ページのshared password撤去はApps Script deploymentのowner-only / authenticated boundaryを変更しない。
- legacy shared-password Script Propertiesが存在してもWork0037では物理削除しない。active gate/UI/code pathから外してinertにする。
- Work0030はDEFERRED_BY_USERのまま。