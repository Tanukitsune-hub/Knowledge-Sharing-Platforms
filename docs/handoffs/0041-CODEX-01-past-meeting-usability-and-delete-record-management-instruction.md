# Work 0041 CODEX-01 — 過去の記録 usability / loading UX / 削除記録の管理

WORK_ID: 0041
DISPATCH_ID: 0041-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

`過去の記録`を開いた時点で、このページで何ができるか利用者が理解でき、検索・詳細・編集・保存・資料操作の待機中も「処理中」だと明確に分かるUIへ改善する。

通常利用者の削除は分かりやすい`削除`表現に統一し、復元は通常画面へ混在させず、管理者ページの`削除記録の管理`から安全に行えるようにする。

## Routing / 推奨モデル

Route C。

local/runtime implementation、browser qualification、same existing Apps Script deploymentのbounded releaseが必要。

推奨モデル: GPT-5.6 Sol / High reasoning。

理由: Work0040でdata semanticsは確定済みだが、Past Meetingのstate transition、loading UX、Admin restore workflow、runtime visual/state validationを横断する非自明な実装である。新規アーキテクチャ探索ではなく、確定仕様を高精度に実装・検証する。

## Baseline

```text
APPLICATION_BASELINE_MERGE: f4283c6b57c6413178d6a2c4173d4970604ee751
FINAL_SERVED_BASELINE_VERSION: 20
WORK_0040: ACCEPTED
WORK_0040_COMPLETION_LATCH: APPLIED
WORK_0030: DEFERRED_BY_USER
SCHEMA_VERSION: 8 / UNCHANGED
```

実装開始時はlatest `main`を取得し、Work0041 planning docsを含むことを確認する。production applicationのAccepted baselineは上記Work0040 merge / version20。

## Authoritative sources

- `docs/handoffs/0041-past-meeting-usability-and-delete-record-management-requirements.md`
- `docs/planning/work0041-past-meeting-usability-and-delete-record-management.md`
- `docs/handoffs/0041-dispatches.md`
- `docs/handoffs/0040-completion-report.md`
- `docs/planning/work-registry.md`

## Closed Conclusions

Work0040のAccepted Evidence / Closed Conclusionsを再度開かない。

### Past Meeting initial state

- `記録の詳細`、その中の`関連資料`、`面談記録を修正`はページ初期表示からvisible。
- record未選択時はempty-stateを表示する。
- edit formは見えるがdisabled。新規登録フォームには見せない。
- detail / related actionも目的は分かるように見せつつ、record未選択時は安全に操作不可。
- `詳細`選択後は同じvisible areaへcontentをpopulateする。
- `記録を編集`選択後は同じvisible edit areaへcontentをpopulateしcontrolsをenableする。
- persistent areaを操作ごとにdisplay:noneへ戻さない。

未選択時の基本文言:
- detail: `上の一覧から「詳細」を選択すると、ここに記録内容が表示されます。`
- related: `記録を選択すると、関連資料の確認・追加・関連付けができます。`
- edit: `記録の詳細から「記録を編集」を選択すると編集できます。`

既存の`閉じる`controlがpersistent-area方針と衝突する場合は、自然なstate resetへ変更する。
推奨:
- detail: `選択解除`としてdetail / related / editをempty-stateへ戻す。
- edit: `編集を終了`としてeditだけdisabled empty-stateへ戻し、detail selectionは維持。
同等以上に明確でscope内の実装なら可。

### Loading UX

少なくとも次を対象とする:
- Past Meeting search
- detail read
- edit read
- edit save
- existing-material picker read
- relation add / unlink / undo-unlink等、Past Meeting内の主要待機操作
- 管理者ページの削除記録search / restore

要件:
- click/submit直後にvisible busy state。
- triggering controlを一時disabledにし、duplicate mutationを防止。
- 対象areaに処理内容を明示。
- indeterminate progress bar / spinner等を使用する。
- backendから実進捗率が取得できない処理にfake percentageを表示しない。
- `aria-busy` / live regionを適切に使用する。
- success/error/finallyで必ずbusy解除。
- 既存error表示を消さない。
- productionへtest専用delayを入れない。
- 実処理が長い場合のみ、timerで`少し時間がかかっています。そのままお待ちください。`等へ切替可。

user-facing例:
- `検索中…`
- `記録を読み込んでいます…`
- `編集内容を読み込んでいます…`
- `保存中…`
- `資料候補を読み込んでいます…`
- `復元中…`

共通helper化は、Past Meeting/Admin scopeで重複を安全に減らせる場合のみ行う。無関係screenの大規模refactorはしない。

### Past Meeting list border alignment

現在の`td.row-actions`のようにtable cell自体へflexを当てない。

推奨DOM:
```html
<td>
  <div class="row-actions">...</div>
</td>
```

- `td`はtable-cell semanticsを維持。
- inner wrapperのみflex。
- desktopのrow border / row heightを操作列を含め揃える。
- 390pxでは既存horizontal scroll affordanceを維持。

### Delete wording / semantics

normal `過去の記録`:
- Active record action label: `削除`
- detail: `記録を削除`を維持。
- backend: existing `Active -> Inactive` status mutationをそのまま使う。
- physical delete 0。

confirmation:
`この記録を削除します。記録本体は完全には削除されず、管理者ページから復元できます。`

削除成功後:
- normal Active listをauthoritative refresh。
- deleted recordがcurrent detail/edit selectionならpersistent areaをstaleなまま残さずempty-stateへreset。
- Google Doc / relation / body / related material Statusを変更しない。

### 管理者ページ — 削除記録の管理

existing `管理者ページ`に一般管理sectionとして`削除記録の管理`を追加する。
既存AI provider settingsを壊さない。

基本:
- default status = Inactive / user label `削除済み`
- dateFrom / dateTo
- Counterparty
- Asset Class
- Status: `削除済み / 有効 / すべて`
- bounded result count（既存maintenance search limitを再利用、通常100件）
- list: 日付 / Meeting ID / 面談先 / Asset Class / Team / Status / Version / 操作

Actions:
- Inactive -> `復元`
- Activeはこのsectionの主目的ではないためread-onlyでよい。新しい削除経路を増やさない。
- `復元`はexisting Meeting status mutation / optimistic concurrency / Audit pathを再利用。
- success後にadmin listをauthoritative refresh。
- default Inactive表示では復元済みrecordが一覧から消えることが自然な挙動。
- normal `過去の記録`へ戻りActive searchすると再表示される。

通常の`過去の記録`にはInactive filter / 復元buttonを追加しない。

## Preserve

- Work0040 follow-up UI cleanup / hidden compatibility preservation
- human-readable existing-material picker
- existing related-material list
- original Doc open
- classification edit
- unlink / undo-unlink
- 資料追加
- Meeting ID / Google Doc identity
- Meeting body
- relation semantics
- optimistic version semantics
- existing status mutation / Audit semantics
- all existing AI provider admin functionality
- same owner-only authenticated Web App deployment

## Safety / change boundary

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
NEW_STORAGE: 0
PHYSICAL_DELETE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
REAL_BUSINESS_RECORD_MUTATION: 0
WORK_0030: DEFERRED_BY_USER
```

Do not:
- introduce recycle-bin retention/purge
- bulk delete / bulk restore
- add restore to normal Past Meeting
- redesign unrelated tabs
- modify provider code/settings
- add fake progress percentages
- expose internal IDs as primary normal-user UI

## Implementation guidance

既存pathを最優先:
- `searchMeetingRecords`
- `getMeetingMaintenanceRecord`
- `updateMeetingMaintenance`
- `changeMeetingStatus`
- current Past Meeting / maintenance client
- current Admin page
- current status/live-region patterns

new backend facadeは、既存facadeで要件を安全に満たせないことを具体的に確認した場合だけ。新storageは禁止。

CSSはscoped。global `.actions`等の既存cross-screen contractを不用意に変更しない。

## Acceptance Evidence

### A. Source / behavioral tests

focused testsで最低限:
1. detail / related / edit persistent empty-state。
2. edit controls disabled before selection, enabled after edit load。
3. selection/reset state。
4. visible busy state and duplicate action guard for search/detail/edit/save。
5. no fake percent。
6. table cell remains table-cell; inner action wrapper flex。
7. normal Active list label `削除`、no `無効化`。
8. admin `削除記録の管理` default Inactive + filters。
9. Inactive `復元` invokes existing status mutation with expectedVersion。
10. Work0040 hidden follow-up / related selector / picker regression。

Run:
- focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

### B. Runtime / browser

same existing owner-only targetでactual browser qualification。

1. `過去の記録`を開く。
   - detail / related / edit visible。
   - empty-state meaningful。
   - edit disabled。

2. search。
   - click直後`検索中…` + visual indeterminate indicator。
   - duplicate action disabled。
   - result loaded後busy解除。

3. list。
   - desktop 2560 / 1440 / 1280で操作列の罫線を含むrow alignment PASS。
   - 390でsafe horizontal scroll。
   - Active action = `削除`。

4. detail。
   - click直後にdetail areaへbusy stateが出る。
   - completion後content表示。
   - primary/related actions Work0040 behavior preserved。

5. edit。
   - click直後にedit areaへbusy state。
   - completion後controls enabled。
   - saveで`保存中…`、completionで解除。
   - legacy hidden values / relations preservationをWork0040 accepted contractどおり維持。

6. synthetic delete -> restore end-to-end。
   - isolated synthetic Active Meetingをnormal Past Meetingから`削除`。
   - confirmation wordingを確認。
   - authoritative Status Active -> Inactive。
   - normal Active listから消える。
   - Doc identity / Meeting body / relation / related material Status unchanged。
   - 管理者ページ`削除記録の管理` default Inactiveに表示。
   - `復元`を実行。
   - authoritative Status Inactive -> Active。
   - normal Past Meeting Active searchへ再表示。
   - delete / restore each optimistic Version update expected。
   - existing Audit semanticsを確認。可能なら`MEETING_DEACTIVATE` / `MEETING_REACTIVATE`の対応eventを確認。

7. Admin regression。
   - existing AI provider settings section nonblank / existing read behavior intact。
   - provider call 0。

8. all normal pages nonblank。
9. console material error/warn 0。

## Runtime mutation budget

最初にread-only preflight:
- same existing target
- current served version20
- owner-only WEB_APP / USER_DEPLOYING / MYSELF
- source parity
- Work0040 accepted baseline

CODEX-01のbounded release budget:
```text
SOURCE_SYNC_MAX: 1
IMMUTABLE_VERSION_CREATE_MAX: 1
SAME_DEPLOYMENT_UPDATE_MAX: 1
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
```

期待されるserved versionは21。

deployment後にimplementation defectが見つかり、追加source mutation / second deploymentが必要になった場合:
- 同じ失敗を反復しない。
- new deploymentを自動で行わない。
- accepted evidenceを保持してStrategy Reset。
- blocker / cause / safest next actionをreportし、BALLをCHATGPTへ返す。
- 次の修正は必要なら`0041-CODEX-02`で行う。

一時的なdeployment propagationのみ疑われる場合は、updateを再送せずread-only recheckで分類する。

## Branch / PR / report

- branch: `codex/0041-past-meeting-usability`
- Draft PRを作成し、mergeしない。
- report: `docs/handoffs/0041-CODEX-01-past-meeting-usability-report.md`
- update: `docs/handoffs/0041-dispatches.md`

PR / report / statusは日本語中心。code / identifier / path / fixed labelsは英語維持。

## Return contract

Return時:
```text
WORK_ID: 0041
DISPATCH_ID: 0041-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

必須報告:
- branch / final HEAD / Draft PR
- implementation summary
- exact tests
- bundle parity
- final served version
- runtime evidence A-E
- delete -> restore sequence
- Audit / version semantics
- viewport evidence
- console state
- mutation budget actual counts
- safety counters
- BLOCKER
- READY_FOR_CHATGPT_FINAL_REVIEW

PRをmergeしない。

WORK_ID: 0041
DISPATCH_ID: 0041-CODEX-01
BALL: CODEX
STATUS: READY
