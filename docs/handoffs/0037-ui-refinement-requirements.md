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