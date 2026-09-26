# Work 0073 Dispatch Register

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-03
ACTIVE_DISPATCH_ID: 0073-CODEX-03
ACTIVE_DISPATCH: 0073-CODEX-03
BALL: CODEX
STATUS: READY

更新日: 2026-09-26
実行状態: CODEX-02はChatGPT reviewで2件のBLOCKERを検出。CODEX-03を同じDraft PR #109の限定修正としてREADY。

## 現在の実行正本

- [CODEX-03 repair instruction](0073-CODEX-03-model-setup-review-repair-instruction.md)

- [CODEX-02 instruction](0073-CODEX-02-simple-model-setup-instruction.md)
- [実装計画 revision 2](../planning/work0073-provider-credential-onboarding.md)
- [設計Decision revision 2](../decisions/provider-credential-management.md)

## 履歴

| Dispatch ID | 内容 | Mode | BALL | STATUS | Instruction | Report | Supersedes |
|---|---|---|---|---|---|---|---|
| 0073-CODEX-01 | 初期のAPIキー/モデル設定指示。ユーザー確認で未実行 | BUILD | NONE | SUPERSEDED | [旧01案内](0073-CODEX-01-provider-credential-onboarding-instruction.md) | 未作成・実行なし | — |
| 0073-CODEX-02 | 1フォーム/確認して保存、初回既定なし、候補一覧の非依存化、4-source整合 | BUILD | CHATGPT | RETURNED | [02指示](0073-CODEX-02-simple-model-setup-instruction.md) | [実装報告](0073-CODEX-02-simple-model-setup-report.md) | 0073-CODEX-01 |
| 0073-CODEX-03 | ChatGPT final review repair: Gemini Model ID canonicalization + fresh model-empty state | BUILD | CODEX | READY | [03指示](0073-CODEX-03-model-setup-review-repair-instruction.md) | 未作成 | 0073-CODEX-02 |

未実行でも、発行済みinstructionの実行契約を差し替えるためdispatch-control.mdに従い次番号にする。旧01の番号や履歴を再利用・改番しない。activeは02だけ。

## Scopeと権限

安全なキー登録/更新、モデルの選択/直接入力から確認・保存までの共通処理、既定なし初回設定、標準思考設定、状態表示、4種類の情報源の同期/選択/resetの整合まで。

CODEX-02はrepository BUILDとdeterministic/local browser検証。実provider・実キー・実Store・Apps Script/Workspace/deploy・会社データ・Secret Manager・Azureの操作予算は0。詳しい受入Matrixと終了条件は実装計画だけを正本にする。

## 返却

CODEX-02 Report: [0073-CODEX-02-simple-model-setup-report.md](0073-CODEX-02-simple-model-setup-report.md)

CODEX-03 Report予定path: `docs/handoffs/0073-CODEX-03-model-setup-review-repair-report.md`

CodexはCODEX-03完了時にbranch上でこのregisterを次へ更新する。

```text
WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-03
ACTIVE_DISPATCH_ID: 0073-CODEX-03
ACTIVE_DISPATCH: 0073-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
```

実装阻害のStrategy Reset時はBLOCKED。後続runtime証拠の意図したNOT_RUNは、実装全体の停止理由にはしない。最終Acceptance、merge、runtime実行権限、Completion LatchはChatGPTが判断する。

## 文書更新の記録

このrevisionでは計画・Decisionを統合し、旧01を新02への案内に変更した。一般のAGENTS.mdや過去Workの証拠は変更しない。Work Registry等の旧01案内よりこのregisterが優先し、旧01ファイルからも新指示へ到達できる。

Shared Knowledge利用: `agent-knowledge-base/docs/knowledge/index.md`からOBS-0018を読み、実行設定に紐づくqualificationと、省略/明示値の区別へ適用。Project Source `GOOGLE-WEB-UX-KB`のFORM-006、FORM-005、NAV-005等を、入力削減と障害復旧へ適用。モデル一覧APIの確認範囲と設計採用理由はDecision末尾に記録。

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
