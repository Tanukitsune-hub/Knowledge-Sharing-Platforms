# Work 0073 CODEX-02 — 確認して保存するAPIキー・モデル設定

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH
SUPERSEDES: 0073-CODEX-01
USER_NATIVE_ACTION_BUDGET: 0

## Goal

[Work0073実装計画 revision 2](../planning/work0073-provider-credential-onboarding.md)をproduction sourceへ実装する。通常は既定モデルを使い、変更時だけ`候補選択またはModel ID直接入力 → 確認して保存`で完了する。安全なキー更新・状態表示から4種類の情報源の同期整合までを1つの実装として仕上げる。

旧CODEX-01はユーザー確認で未実行。旧01を開始・再開せず、このCODEX-02だけを実行する。

## 正本と差分

最寄りのAGENTS.mdを確認して従う。最初に以下を読む。

- [Dispatch Register](0073-dispatches.md)
- [実装計画 revision 2](../planning/work0073-provider-credential-onboarding.md): Scope、画面/保存契約、Acceptance Evidence Matrix、権限、Reset、返却の正本。
- [設計Decision revision 2](../decisions/provider-credential-management.md): 製品判断と理由。

恒久ルール、長い調査比較、過去のinstruction全文を再掲しない。既存のmodel policy/request builderを使い、別のモデル管理基盤は作らない。

今回の重要差分は、内部の登録・確認・採用を維持しながら、利用者には1つのフォームと主操作だけにすること。初回に既定モデルがなくても完了できる。候補一覧は補助キャッシュであり通常検索の依存にしない。新規の思考設定は任意パラメータ省略の標準、既存明示値は保持する。選択した実効設定だけを確認する。

認証情報を受け取る経路と通常のモデル変更は認可を分ける。確認前に現在のキー/モデルを書き換えない。モデル変更だけで停止中接続の有効化、Store作り直し、業務再同期をしない。

## Authorization

許可: source/tests/docs、ローカル合成fixture/fake provider、変更画面のbrowser試験、生成配布物、branch、Draft PR、report。

禁止: 実provider呼び出し、実credential探索/読取/作成/更新、実Store/index操作、Apps Script/Workspace/deploy変更、会社/機密データ、権限拡張、Secret Manager、Azure、merge、Release公開、ユーザー実機操作。

このDispatchでは外部実行予算は0。製品として必要な外部API経路は実装し、fakeで検証する。実キーがないことを理由に実装全体を停止せず、計画のR1/R2をNOT_RUNとして返す。許可のない実キーで検証を補完しない。

## Done when

計画のMatrix A〜Fを満たす実装・必要十分な局所検証を完了し、最終diffを確認してDraft PRを返す。Tier 3は秘密操作認可のリスク分類であり、今回の外部権限や無関係な検証範囲を拡張しない。

現行計画と直接影響するcurrent docsを揃える。`docs/planning/work-registry.md`のWork0073行に旧01が残っている場合は当該行だけ02へ同期し、他Workの履歴は保持する。

```text
branch: work/0073-provider-credential-onboarding
report: docs/handoffs/0073-CODEX-02-simple-model-setup-report.md
register: docs/handoffs/0073-dispatches.md
```

reportはA〜Fの結果と証拠、R1/R2未実行、side effects、BLOCKER/FOLLOW_UP、既存様式のShared Knowledge利用receiptを記録する。新しい独自report体系は不要。

ローカル試験をtarget-runtime PASSにしない。Work0073/Work0072をACCEPTEDにせず、Completion Latchやlive検証を自動開始しない。ChatGPTが最終判断する。

同一失敗の推測修正は2案まで。計画のReset条件が成立したら、安全に完成した部分と証拠を保持し、対象blockerと最小の次行動を返す。

最終chatとreportの冒頭・末尾:

```text
WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```

実装阻害のResetならSTATUSをBLOCKEDにする。実キー・runtime証拠の意図したNOT_RUNだけでは実装をBLOCKEDとしない。

推奨実行設定: GPT-5.6 Sol / High（権限と実効設定の横断レビュー向け）。アプリ側のモデル選択とは無関係。

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-02
BALL: CODEX
STATUS: READY
