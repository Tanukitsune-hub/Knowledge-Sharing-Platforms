# Work 0037 — UI refinement requirements intake

WORK_ID: 0037
STATUS: ACTIVE
MODE: BUILD
PHASE: REQUIREMENTS_INTAKE

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

## Pending

他画面の修正要件をこの文書へ追記予定。現時点ではCodex promptを作成しない。
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