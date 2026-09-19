# Work 0038 — Post-version13 UI refinement intake

WORK_ID: 0038
STATUS: ACTIVE
MODE: BUILD
PHASE: REQUIREMENTS_INTAKE

## Purpose

Work0037/version13をbaselineに、追加の画面レイアウト修正を口頭指示ベースで収集する。

現時点ではCodex Dispatchを発行しない。要件の曖昧点を解消してからimplementation contractをfreezeする。

## Baseline

```text
PRODUCTION_BASELINE: Work0037 / version13
PR_BASELINE: #59 merged
NORMAL_NAVIGATION: 7/7 PASS
LAYOUT_LANGUAGE: 12 columns / 14px / max-width2000
WORK_0030: DEFERRED_BY_USER
```

## Screen: ナレッジ検索

### Label

- `検索モード`を`AI検索モード`へ変更する。

### Non-AI output control

- 既存のnon-AI Full Output / `全文出力` behavior自体は維持する。
- exact placementは次で確定:
  - `AI検索モード`
  - そのすぐ右に`AIモデル`
  - その右に少し間を空けて`非AI出力` / `全文出力`button
- AI controlsとnon-AI outputの間には通常のfield gapより少し大きいvisual separationを持たせ、別系統の操作であることを示す。
- buttonは同じrow内に置き、desktopでは右端へ飛ばさずAIモデルの隣接領域に配置する。

### Preserve

- AI検索モードの既存mode semanticsは変更しない。
- non-AI Full OutputはAI provider未設定でも利用可能というaccepted behaviorを維持する。

## Screen: 記録を追加

### Register button

- `登録`buttonを`当社側`入力欄のすぐ下に配置する。
- 左寄せ / compactを基本とし、既存submit / busy / validation / retry semanticsは変更しない。

### Attachment placement

- `資料を添付（任意）`sectionを、`面談相手` / `当社側`の右側へ移動する。
- desktopでは、左側に`面談相手`→`当社側`→`登録`、右側にattachment blockを置く2-column regionとして整理する。
- attachment blockは十分な縦スペースを確保し、左側のparticipants領域と視覚的に揃える。
- file drop areaの横幅はversion13よりさらに小さくする。
- drop areaとaction buttonsの配置はbutton labelが切れず、操作しやすい幅を優先する。
- mobile <=720pxでは安全にstackしてよい。

### Rename

- attachment action `選択をクリア`を`資料選択をクリア`へ変更する。
- clear behavior自体は変更しない。

### Preserve

- file drop / click selection / retry / clear semanticsは維持。
- notes height、Counterparty modal、Equity/Debt policy、Meeting Type behaviorは本要件で変更しない。

## Closed decision

ナレッジ検索のnon-AI Full Output placementは`AI検索モード → AIモデル → 少し間を空けて → 非AI出力`で確定。

## Dispatch state

Codex Dispatchはまだ発行しない。