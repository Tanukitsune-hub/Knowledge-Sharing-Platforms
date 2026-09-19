# Work 0037 CODEX-01 — Controller review

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-01
BALL: CHATGPT
STATUS: REVIEW
MODE: BUILD

## 判定

PR #59はDraft・未mergeで保持する。唯一のmerge阻害要因は、Option Master追加フォームのタブ間入力状態と非同期完了処理の帰属が分離されていないこと。

```text
REVIEWED_HEAD: d1310034b2fe6b6ff5a847108fdae22d2f8f79c7
REVIEWED_CLIENT_BLOB: 70834bc99c93a4e9e07dbdb3abd81f2386fd39ea
PR: #59
BLOCKER: MASTER_TAB_DRAFT_OWNERSHIP
WORK_0037_ACCEPTED: NO
COMPLETION_LATCH: NOT_APPLIED
```

## 保持する証拠

CODEX-01 reportの563/563、bundle30/30、version12の7画面・2560/1440/1280/390、overflow0、non-AI Full Output、Analytics、Counterparty modal、provider0等は、それぞれ報告された確認範囲の証拠として保持する。今回の反証はMastersの未送信入力・送信中入力の分離に限定し、画面全体の再設計はしない。

対象report: `docs/handoffs/0037-CODEX-01-ui-refinement-report.md`

ChatGPTは差分、frozen instruction、reportを読み、後述のsource-function harnessで反証を確認した。ChatGPTによるauthenticated Web Appの操作・書き込み・再deploymentは実施していない。

## 管理者パスワード撤去の確認

`docs/handoffs/0037-CODEX-01-ui-refinement-instruction.md` §5に明示承認がある。追加の共有パスワードを撤去し、same owner-only deploymentを維持する方針であり、今回これを再び設計論点にはしない。

Reportでは`ACCESS: MYSELF` / `EXECUTE_AS: USER_DEPLOYING` / public exposure0を確認している。今回のPRにはdeployment access設定やinstaller authorizationを広げる変更は含まれていない。将来の会社内複数ユーザー展開はこの受入範囲外であり、アクセス範囲を広げる前に管理者権限を別途設計・確認する。

## BLOCKER — MASTER_TAB_DRAFT_OWNERSHIP

### 根拠となる凍結済み要件

`docs/handoffs/0037-ui-refinement-requirements.md`の「プルダウンの管理 / Interaction」には、タブ切替で各区分の入力中stateを誤って別区分へsubmitしないことが指定されている。

### 再現A: 別区分への入力持ち越し

1. `Asset Class`タブで名称に`SYNTHETIC_ASSET_DRAFT`と入力し、登録しない。
2. `Team`タブへ切り替える。
3. 同じ入力が残る。そのまま追加するとpayloadは`type: TEAM, name: SYNTHETIC_ASSET_DRAFT`になる。

`selectMasterTab()`はactiveMasterTabだけを変更し、`renderMasterTab()`はplaceholder等だけを変更する。共有の`option-add-name.value`に対するタブ別保存・復元がない。

### 再現B: 遅れて完了した登録による別タブ入力の消去

1. `Asset Class`で追加を送信し、Promiseを未完了にする。
2. `Team`へ切り替え、名称に`SYNTHETIC_NEW_TEAM_DRAFT`と入力する。
3. 最初のAsset Class追加が成功する。
4. submit handlerが無条件で`el('option-add-name').value=''`を実行し、Team側の新しい入力が消える。

payloadのtype自体は送信開始時に評価されている。一方、完了後の入力消去は現在表示中の共有DOMへ無条件に作用する。

### ChatGPTによる再現分類

```text
CLASSIFICATION: SOURCE_FUNCTION_HARNESS
RUNTIME: Node.js v22.16.0 / isolated DOM and RPC doubles
SOURCE: reviewed headのrenderMasters / renderMasterTab / selectMasterTab / performMasterMutation / option-add submit handler
CASE_A_CROSS_TAB_PAYLOAD: REPRODUCED
CASE_B_LATE_RESPONSE_CLEARS_OTHER_DRAFT: REPRODUCED
LIVE_APPS_SCRIPT_CALLS: 0
PROVIDER_CALLS: 0
PERSISTENT_DATA_MUTATIONS: 0
```

本番データが誤登録・消去されたという観測ではない。レビュー対象ソースのstate transitionを隔離環境で実行した結果である。

既存MastersテストはタブID、active type、一覧filter等を確認しているが、未送信の名称を残してタブを切り替えるケースと遅延応答ケースは確認していない。

## 次の決定的行動

`0037-CODEX-02`でこの1 failure classだけを修復する。同じPR #59 / branchを使い、追加フォームのタブ別draft、送信snapshot、遅延完了時の帰属を固定する。source-based testsと短い同一target smokeを行う。他画面・認証・provider・schemaは再設計しない。

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-01
BALL: CHATGPT
STATUS: REVIEW
