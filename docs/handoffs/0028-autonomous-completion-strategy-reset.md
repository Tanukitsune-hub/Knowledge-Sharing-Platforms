# Work 0028 — 自律完了型 Codex 運用への Strategy Reset

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: ACCEPTED
MODE: BUILD / QUALIFICATION

## 背景

CODEX-17〜20では、Google Workspace / Apps Script の外部状態、deployment identity、security attestation の証拠保全を優先し、first material failureでSTOPしてChatGPTへ返す契約を採用した。この方針は、target identityやside effectが不明な段階では妥当だった。

一方、現在は以下が閉じている。

- single isolated fresh container-bound targetを確定済み
- installer/idempotency PASS
- Backend exactly 5 sheets / schema7
- AI sync disabled / triggers0 / provider calls0
- single restricted owner-only WEB_APPを確定済み
- historical version75は明確にscope外
- real/confidential data、broad rollout、provider migrationはscope外

この状態で各局所failureごとにChatGPTへballを戻すと、同一Outcome内の診断・修正・再検証がDispatch単位に分断され、end-to-end completionまでのlatencyが不必要に増える。

## Strategy Reset

Work 0028のPrimary Outcomeは不変。

```text
accepted Light UI + production contractを
final container-bound architectureで
provider-independentにend-to-end認定する
```

CODEX-21は既に発行済みのため、そのexecution contractは途中変更しない。

CODEX-21が未完了でRETURNEDした場合、次Dispatch（0028-CODEX-22）は「局所手順実行」ではなく「Outcome-based autonomous completion」とする。

## Autonomous completion contract

Codexには Goal / Context / Boundaries / Done when を与え、Goal達成までの局所的な診断、修正、テスト、runtime再検証の順序はCodex自身に判断させる。

### Goal

PR #51のaccepted production implementationを、既存isolated target上でWork 0028 completion gateまで到達させる。

### Codexが自律的に行ってよいこと

同一PR / 同一target / 同一Outcome内で、以下を自己判断して継続してよい。

- failureのroot cause切り分け
- production sourceの最小修正
- focused regression test追加
- deterministic bundle再生成
- existing targetへのsource sync
- immutable version作成
- existing single WEB_APP deploymentのversion update
- owner-only restricted runtimeでの再検証
- synthetic records/filesによるR1-R8
- 必要に応じたread-only subagent review / test-gap review

各局所failureごとにChatGPTへ返さない。安全境界内であれば、そのrun内で修正→検証→次gateへ進む。

### Internal iteration budget

1 Dispatch内で最大3 repair/qualification cyclesを許可する。

1 cycleは概ね以下を含めてよい。

```text
diagnose
-> minimal repair
-> targeted tests
-> canonical/bundle validation when needed
-> existing target sync/version update when needed
-> target-runtime verification
```

同一failure classが2回連続する、または3 cyclesを使い切った場合はStrategy ResetのためChatGPTへRETURNする。

### STOP条件

Codexが途中でChatGPTへ返すのは、次のいずれかに限る。

1. USER native action / OAuth / credential inputが必要
2. permission・audienceをowner-onlyより広げる必要がある
3. real/confidential data、physical delete、destructive migration、billingを使う必要がある
4. new targetまたはsecond parallel deploymentが本質的に必要
5. architecture / accepted product contractを変更しないと解けない
6. same failure classが2回連続
7. 3 repair cyclesを使い切った
8. evidence contaminationやrollback不能リスクを検出
9. provider callまたはWork 0030再開が必要

それ以外の通常のapplication defect、test failure、runtime mismatch、small deployment-operability issueはCodex自身が修正・再検証して進める。

### Fixed boundaries

- existing isolated targetを継続利用
- PR #51を継続
- historical version75 mutation 0
- real/confidential data 0
- physical delete 0
- broad/company rollout 0
- Direct OpenAI / Gemini / Azure OpenAI calls 0
- AI sync disabled
- Work 0030 DEFERRED_BY_USER
- secrets/private IDs/private URLsをGitHub/chatへ保存しない

### Done when

次をすべて満たした時だけ通常RETURNする。

- installer / idempotency accepted
- schema7 / exactly5 Backend sheets
- restricted versioned WEB_APP / deployment security READY
- R1-R8 PASS
- provider calls0 / AI sync disabled
- no BLOCKER
- final diff / tests / runtime evidenceをreport化
- PR #51はmergeせずChatGPT reviewへ返す

## Controller behavior

ChatGPTは局所的な実装手順を毎回設計しない。Outcome、boundary、acceptance evidence、retry capだけを固定し、Codexに実行順序と局所修正を委ねる。

ChatGPTが介入するのはSTOP条件、scope変更、final review/merge、Completion Latchのみ。

## Completion Latch

Work 0028が完了したら開発を停止し、次はユーザー実機確認へ移る。Work 0030は明示的な再開判断までDEFERREDを維持する。

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: ACCEPTED
