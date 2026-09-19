# CODEX-02 — マスター追加フォームのタブ別入力状態を保護

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

PR #59のマスター管理で、入力中の名称が別区分へ持ち越されて登録されたり、過去の送信の完了によって別タブの新しい入力が消えたりしない状態を完成させる。Work0037の他の確認済み成果を保持し、同じPRを最終受入可能にする。

Route C。推奨モデルはGPT-5.6 Luna / Medium。原因・修正範囲・受入ケースが固定済みの限定的な実装であり、広い再設計や追加の高コスト調査は行わない。

## 開始時に読む正本

- latest origin/mainのroot/nearest AGENTS.md
- `docs/handoffs/0037-dispatches.md`
- `docs/handoffs/0037-CODEX-01-controller-review.md`
- `docs/handoffs/0037-ui-refinement-requirements.md`
- PR branchの`docs/handoffs/0037-CODEX-01-ui-refinement-report.md`

```text
PR: #59 / Draft / 未merge
BRANCH: codex/0037-ui-refinement
RETURNED_HEAD: d1310034b2fe6b6ff5a847108fdae22d2f8f79c7
CURRENT_RUNTIME: version12 / same single owner-only Web App
```

同じbranch/PRを継続する。mainのcontroller文書を取り込む際に実装差分を破棄しない。mainのdispatchと旧branchのCODEX-01返却状態が競合した場合は、今回のCODEX-02を現在の指示として保持する。

## 確認済みfailure class

`MASTER_TAB_DRAFT_OWNERSHIP`

主対象: `src/ClientMaintenance.html`

- `selectMasterTab()`はactiveMasterTabだけを更新する。
- `renderMasterTab()`は共有名称inputのplaceholder等だけを変更する。
- `option-add-form` submitは現在のtypeと共有inputを送信する。
- 成功後に共有inputを無条件で空にする。

再現A: Asset Classで未送信の名称を入力 -> Teamへ切替 -> 名称が残り、Teamのpayloadとして送信される。
再現B: Asset Classの追加送信を未完了にする -> Teamで別の名称を入力 -> 最初の応答が完了 -> Teamの入力が空になる。

ChatGPTはレビュー対象source functionsをNodeの隔離DOM/RPC harnessで実行し、両方を再現した。live mutationは0。まず実際のproduction sourceを読み込むfocused testで同じpre-fix failureを確認する。テスト用の別実装を作って通過させない。

## 最小修正方針

1. `ASSET_CLASS` / `LOCATION` / `TEAM`ごとに名称draftを分離し、タブ切替では切替元を保存、切替先を復元する。RAM上の小さなstateで十分。localStorage等の新しい永続化は不要。
2. master一覧の再描画・再読込はdraftとactive tabを失わない。Counterpartyタブを経由してもOption側draftを混在させない。
3. 送信開始時のtype・name・request identityをsnapshotし、以降のUI変更に左右されないようにする。OPTION追加可能typeは既存3種のallowlistで検証する。
4. 成功時に消すのは送信元タブの該当draftだけ。ユーザーが送信後に同じタブの値を書き換えた場合も、その新しい入力を消さない。別タブの値へは作用しない。
5. エラーでは入力を保持し、どの区分の送信エラーかを分かるようにする。別タブへ古い値を上書きしない。
6. 送信中の同じ追加の二重実行を防ぐ。タブ切替を許す場合は上記帰属を維持し、UI状態を安全に復元する。

必要最小限のclient修正とtestsに限定する。新しい汎用state framework、レイアウト変更、新modal、backend変更は不要。

## Acceptance Evidence

### D1 — 未送信draftの分離

Asset ClassでA -> Teamへ切替 -> AをTeamの入力として表示・送信しない。TeamでT -> Asset Classへ戻るとA、Teamへ戻るとT。LOCATIONとCOUNTERPARTY経由も同じ原則。

### D2 — 非同期成功

Asset ClassでAを送信 -> 応答待ちの間にTeamでTを入力 -> A成功後もTを保持。payload typeはASSET_CLASS。成功時のclearは送信元snapshotにだけ適用する。

### D3 — 非同期失敗 / 新しい入力

失敗時は送信元draftを保持。他タブの入力を壊さない。送信後に入力を新しい文字列へ変更した場合も、遅い成功応答が新しい文字列を消さない。

### D4 — その他の回帰

連打で追加RPCを重複させない。再読込はactive tabとdraftを保持。Counterparty shared modal、既存名称変更・順序・無効化/再有効化、CAPITAL_TYPE非表示を維持。

### 検証手順

- production sourceを使うfocused tests: D1–D4。非同期ケースはdeferred Promise等で決定的に検証する。
- 既存rendered browser harnessでマスターtab/入力/送信handlerを操作する。文字列一致testだけで合格にしない。
- `npm run check`
- canonical bundle再生成、`npm run check:bundle`
- `git diff --check`

### 実機確認

同一target・単一owner-only deploymentだけを更新する。事前のidentity/source/version/access readbackを行う。

- 実機でASSET_CLASS / TEAM / LOCATION / COUNTERPARTY間を移動し、draftが分離・復元されることを確認。
- 必要な場合だけ、明確なsynthetic Optionを最大1件追加して正しい区分への反映・入力状態を確認する。
- 非同期応答のタイミングが実機で観測できなければ、タイミングを合わせるためにmutationを繰り返さない。D2/D3のsource-based deferred testと実機通常経路を組み合わせ、実機未観測部分を明記する。
- 実機consoleのmaterial error/warn0。4タブ、再読込、Counterparty modalの短いsmoke。
- 他画面はshared source/bundle差分と最低限のnavigation smokeで回帰確認し、確定済みの全要件を一からやり直さない。

## Closed Conclusions / Non-Goals

- CODEX-01で確認済みのUI配置、Past Active固定、non-AI Full Output、Analytics一年初期期間、入力label、Counterparty modalは保持。
- 管理者ページの追加shared-password gate撤去はfrozen instructionで明示承認済み。再導入・別認証方式への変更はしない。
- `ACCESS: MYSELF` / `EXECUTE_AS: USER_DEPLOYING`を維持。会社内・一般公開への拡張は行わない。
- Work0035はSUPERSEDED、Work0030はDEFERRED_BY_USERのまま。

## 権限・試行上限

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
SECURITY_MODEL_CHANGE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
SYNTHETIC_OPTION_CREATE: MAX_1
REPAIR_RUNTIME_CYCLES: MAX_2
SOURCE_SYNC: MAX_2
IMMUTABLE_VERSION_CREATE: MAX_2
SAME_DEPLOYMENT_UPDATE: MAX_2
```

通常のtest/JS不具合は上限内で自律修正する。原因が再現しない、中核前提が否定された、同じ修正方針が2回失敗した、安全境界を維持できない場合だけStrategy Resetする。mutationの結果不明時は再送せずread-onlyで確認する。

## Git / report

同じPR #59を更新。新PRは作らない。mergeしない。

Report:
`docs/handoffs/0037-CODEX-02-master-tab-state-repair-report.md`

reportはD1–D4、logicとactual runtimeの区別、new version/source parity、side effects、残BLOCKERを記載する。CODEX-01 reportは履歴として保持する。

mainのdispatchが現在のボールの正本。branch側control文書も今回のWork/Dispatchに合わせて整合し、旧CODEX-01のREADY/RETURNEDを復活させない。

## Completion Latch

D1–D4・最小実機確認・canonical/bundle checksがPASSし、BLOCKER NONEになったら修正を止め、ChatGPTへ返す。Completion LatchとmergeはChatGPTが行う。

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
