# Work 0041 — 過去の記録 usability / 削除記録の管理 requirements

WORK_ID: 0041
STATUS: ACTIVE
MODE: BUILD
BALL: CODEX
ACTIVE_DISPATCH: 0041-CODEX-01

## Dependency

- Work0040のAcceptance / Completion Latch後に開始する。
- Work0040のAccepted Evidence / Closed Conclusionsを再び開かない。
- Work0030はDEFERRED_BY_USERのまま。

## Primary Outcome

`過去の記録`を開いた時点で、このページで何ができるか利用者が把握できるようにし、非同期処理中の状態を明確化する。
通常利用者の削除操作は分かりやすい`削除`表現に統一し、復元は通常画面へ混在させず、管理者ページの`削除記録の管理`から安全に行えるようにする。

## Closed decisions

### 1. Detail / related-material / editを初期表示

- `記録の詳細`、`関連資料`、`面談記録を修正`はページ初期表示から見せる。
- 未選択時はempty-stateを表示する。
- edit controlsは未選択時disabledとし、新規登録フォームと誤認させない。
- 対象recordを選択したら同じvisible areaへ内容をpopulateする。

Suggested empty-state:
- 記録の詳細: `上の一覧から「詳細」を選択すると、ここに記録内容が表示されます。`
- 関連資料: `記録を選択すると、関連資料の確認・追加・関連付けができます。`
- 面談記録を修正: `記録の詳細から「記録を編集」を選択すると編集できます。`

### 2. Loading UX

- 検索、詳細読込、編集読込、保存、資料候補読込、relation mutationでvisible busy stateを表示する。
- 操作直後に対象buttonをbusy表示・一時disabledにする。
- indeterminate progress indicator / spinnerは使用可。
- 実測不能なpercentageは表示しない。
- 長時間時は`少し時間がかかっています。そのままお待ちください。`等の表示へ移行可。
- `aria-busy` / live regionを既存patternと整合させる。

### 3. 一覧罫線

- `td.row-actions`自体をflexにしない。
- table cellは通常のtable-cellを維持し、button配置はtd内部wrapperだけをflex化する。
- desktopで全列のrow border / row heightを揃え、mobile horizontal scrollを維持する。

### 4. 通常利用者向け削除

- 一覧の`無効化`を`削除`へ変更する。
- detail側の`記録を削除`と用語を統一する。
- backend semanticsは`Active -> Inactive`のまま。
- physical deleteは行わない。
- confirmationで管理者ページから復元可能と説明する。

Suggested confirmation:
`この記録を削除します。記録本体は完全には削除されず、管理者ページから復元できます。`

### 5. 管理者ページ — 削除記録の管理

- section名は`削除記録の管理`とする。
- 通常の`過去の記録`には復元workflowを追加しない。
- defaultはInactive Meetingのみ表示。
- filter: 開始日 / 終了日 / 面談先 / Asset Class / Status（削除済み / 有効 / すべて）。
- bounded human-readable result list。
- candidate columns: 日付 / Meeting ID / 面談先 / Asset Class / Team / Status / Version / 操作。
- Inactive record actionは`復元`。
- 既存status mutation / optimistic concurrency / Auditを再利用する。
- 復元成功後はauthoritative refreshする。

## Preserve

- Meeting ID / Google Doc identity / Meeting body
- related-material relations
- optimistic version semantics
- status mutation / Audit semantics
- owner-only deployment boundary
- Work0040 accepted detail/edit/related-material behavior

## Safety / Non-Goals

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
NEW_STORAGE: 0
PHYSICAL_DELETE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
NEW_DEPLOYMENT_TARGET: 0
WORK_0030: DEFERRED_BY_USER
```

Non-Goals:
- bulk delete / bulk restore
- physical purge
- normal-user画面へのInactive一覧・復元control追加
- provider / AI変更

## Acceptance Evidence

1. 初期表示: detail / related / editがempty-state込みでvisible、未選択editはdisabled。
2. Loading: search/detail/edit/save/material-loadでvisible busy state、duplicate action防止、success/errorで解除。
3. Table: 2560 / 1440 / 1280で罫線整合、390でsafe horizontal scroll。
4. Delete: normal UIは`削除`、Active -> Inactiveのみ、physical delete 0。
5. 削除記録の管理: default Inactive、filter、`復元`でActiveへ戻りnormal一覧へ再表示。
6. Regression: Work0040 accepted behavior維持、console material error/warn 0、schema/migration/provider変更0。

## Dispatch policy

Work0040がACCEPTEDになるまでCodex Dispatchは開始しない。
Work0040完了後、`0041-CODEX-01`を発行する。