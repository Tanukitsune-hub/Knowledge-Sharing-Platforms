# Work Registry and Delivery Order

Current as of: 2026-09-07
Status: Active planning source of truth

## Purpose and identity rules

Work IDs identify stable outcomes, not execution order. Never renumber or reuse an issued ID. Keep the same Work through implementation, qualification, repair and PR convergence while its outcome remains unchanged. Give each new Codex execution a new Dispatch ID. Normally only one Work is active for implementation. Current ball is authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

Statuses: ACCEPTED, ACTIVE, READY, PLANNED, DEFERRED, BLOCKED, SUPERSEDED.

## Current delivery sequence

| Order | Work ID | Outcome | Status | Dependency | Next action |
|---:|---|---|---|---|---|
| 0 | 0020 | Provider core, OpenAI File Search, citations, lifecycle, full output | ACCEPTED | — | Preserve accepted evidence |
| 1 | 0025 | Administrator model/thinking policy | ACCEPTED | 0020 | Preserve exact tuple policy |
| 2 | 0021 | Structured search, five modes, multi-Entity, six formats | ACCEPTED | 0025 | Preserve PR #34 and version-66 evidence |
| 3 | 0023 | Deterministic single-file bundle and installer | ACCEPTED | 0021 | Preserve PR #35 and installer security |
| 4 | 0026 | Current Gemini API requalification and fail-closed safety | ACCEPTED | 0023 | Preserve PR #36 and its historical boundary |
| 5 | 0027 | Personal-DEV Gemini File Search baseline and citation integrity | ACCEPTED | 0026 | Preserve PR #37 merge and version-73 qualified-disabled evidence |
| 6 | 0028 | 単一記録・資料導線と高品質Light UIの整合 | ACTIVE (design only) | Accepted 0027 and 0029 baseline | CODEX-11 RETURNED。新規Draft PRのdesign・契約対応表をChatGPT review→ユーザーLight acceptへ |
| 7 | 0029 | Portable shared-password administrator mode | ACCEPTED | Work 0028 preserved; canonical port and version-75 smoke passed | Preserve PR #39 merge and version-75 configured/locked evidence; rotate temporary DEV password later |
| 8 | Unassigned future Work | Representative large-file qualification/recovery | DEFERRED | Small synthetic Gemini path qualified | Allocate separate Work |
| 9 | Unassigned future Work | Historical-material migration | PLANNED | Provider/installer stable | Select approach from actual corpus |
| 10 | Unassigned future Work | Final company qualification and rollout | PLANNED | Company credentials, Shared Drive, permissions, migration ready | Qualify approved company environment/providers |

## Accepted boundaries

### Work 0021

PR #34 merge `533c849bd1229827ec77cd5ad6506312ea286940`; private version 66. Core filters/five modes, multi-Entity/advanced filters, OpenAI six-format matrix 6/6, EML attachment boundary and FULL_OUTPUT six-format reference parity PASS. Logic 376/376.

### Work 0023

PR #35 merge `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`. Deterministic bundle/installer, owner latch, takeover rejection, deployment attestation, source parity, and idempotent install evidence accepted.

### Work 0026

PR #36 merge `40bb7d40506c0839c35742ee0000d89650ff7ad6`; version 70 shell/readback accepted. Its old coarse Gemini failure classification is historical only and was superseded as a general causal explanation by later Work 0027 evidence.

### Work 0027

PR #37 merge `9cd5d2984d0d584ed05c447ed09d2ddf0e1e2366`; implementation `40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7`; final branch head `497ecff400624330f1d5041de166f6c6e3485220`.

```text
PRIVATE_WEB_APP_VERSION: 73
MODEL: gemini-3.7-flash / explicit low / 2048 / Interactions + File Search
TERMINAL_OUTCOME: QUALIFIED_DISABLED
LOGIC_VALIDATION: PASS / 448 of 448
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
AUTHORITATIVE_CITATION: PASS
TEMP_RESOURCE_CLEANUP: PASS
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
BLOCKER: NONE
```

The accepted strict Gemini citation resolver binds the returned Store and exact metadata tuple to one current Active authoritative source/current Gemini hash and one independently verified current provider document. Qualification and normal immediate/POLL mapping share this resolver. OpenAI/FULL_OUTPUT behavior remains preserved.

### Work 0029

PR #39 merge `872dbec83d17e6dfe1f33d8260006c2124d38a6c`; canonical implementation `9fa668619a0b91fb60ed53f696363d3954cf709e`; final branch head `b29ee3e538e72c4641f8d825e304fea1c186a265`.

```text
PRIVATE_WEB_APP_VERSION: 75
FOCUSED_TESTS: PASS / 59 of 59
LOGIC_VALIDATION: PASS / 456 of 456
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
SHARED_ADMIN_CREDENTIAL: configured
FINAL_ADMIN_STATE: locked
ACCOUNT_INDEPENDENT_ADMIN_SESSION: PASS
SESSIONSTORAGE_RELOAD_AND_SERVER_REVALIDATION: PASS
EXPLICIT_LOGOUT: PASS
PROVIDER_DATA_MUTATIONS: 0
WORK_0028_CONTROL_FILES_PRESERVED: PASS
BLOCKER: NONE
```

Routine AI Provider Settings administration remains unlocked by the accepted shared administrator password contract. Browser-side opaque session token, server validation, logout and password rotation semantics are preserved.

## Active design boundary

### Work 0028

MODE: INVESTIGATION
PHASE: A1.15 / INTEGRITY-RECONCILED LIGHT CORRECTION / DESIGN ONLY

現在の実行はCODEX-11。CODEX-10未使用という旧記述は無効。GitHubにPR #47/#48のCODEX-10返却があるため、これを使用済み履歴として保持する。

| Dispatch | Design history |
|---|---|
| CODEX-03〜07 | PR #40〜44、Light探索・展開・改善の履歴 |
| CODEX-08 | PR #45、controller technical review PASS |
| CODEX-09 | PR #46、controller technical review PASS / user acceptance pending |
| CODEX-10 | PR #47（検索action）およびPR #48（記録中心設計）にRETURNED。最新PR #48は不要分岐と既存機能欠落の修正が必要 |
| CODEX-11 | `codex/0028-codex11-integrity-light-design`、RETURNED / BALL=CHATGPT。12画面/22case/456 local tests PASS、契約対応表あり。report: `0028-CODEX-11-meeting-centric-design-report.md` |

最新返却/再利用候補はPR #48 `108a6e9002270ed0d4264991dd8971cff7cc663f`。以前のcontroller確認済みvisual基準はPR #46 `400f2f0e77acf81deb32e363d79a3962dfd2f017`。新しいこととaccept済みであることは区別する。

### 閉じたUI方針

- Light-only、sidebar 7項目、#182124、active左stripのみ#E1001F、gold icons/separator、紗綾形は維持。Dark/Systemなし。
- `記録を追加`は単一form。面談/資料tab、記録種別selector、データ受領専用form、独立した資料だけ追加経路は置かない。
- `過去の記録`は単一一覧。本文・属性・面談原本・編集・記録削除/復元・関連資料操作を同じ文脈に集約する。
- 新規資料は保存成功済みの親Meeting_IDが必須。非GPも対象。既存親へのfollow-up資料追加は親を再作成しない。
- 通常資料buttonの`削除`は当該リンク解除。記録Inactive、資料Inactive、物理削除を混同しない。
- ナレッジ検索は`面談先 / 情報ソース / 開始日 / 終了日 / 全期間`、`検索モード / AIモデル`、大きな質問欄。
- 情報ソース3択は維持。専用`全文出力`buttonを設け、AIモデルoptionから除く。共通条件のActive MeetingのDocs全文と業務属性を出力し、質問/AI設定を前提にしない。
- admin preset、自由質問保護、readonly/draft復元、面談集計の承認済み構成と9列、Work 0027/0029は保持。

### 本番境界と残余事項

GP必須の撤廃、親binding、関連確定の再試行、source metadata/引用、unlink後の検索eligibility、Docs原文保全、export validatorは後続BUILDで必要な限定契約変更。単なるUI置換で実装済みになるとは扱わない。

「データ受領タブ不要」を「受領のみの記録自体を登録禁止」と拡張した前回答は未確認の解釈として確定扱いから外す。今回専用分岐を復活させず、受領のみ記録と面談集計の扱いをBUILD前確認事項にする。Record_Type/DATA_RECEIPT schemaを今作らない。

既存の親のない資料・共有関連は破壊せず、必要な移行は実データ確認後の限定課題とする。資料タブの廃止で既存metadata編集や文脈付きsummary参照を黙って失わない。

実行instruction:
`docs/handoffs/0028-CODEX-11-meeting-centric-design-instruction.md`

整合性レビュー:
`docs/handoffs/0028-CODEX-11-consistency-review.md`

更新済み詳細判断:
- `docs/handoffs/0028-CODEX-10-record-centric-architecture-decisions.md`
- `docs/handoffs/0028-CODEX-10-knowledge-search-action-corrections.md`

現在のBALL/STATUS:
`docs/handoffs/0028-dispatches.md`

## Next gate

CODEX-11はdesign/docs/local synthetic demoのみで、新規Draft PR・screenshots・validation・契約対応表・reportを返す。ユーザーのLight accept後もproduction BUILDには別の明示承認とStrategy Resetが必要。deploy、実データ移行、provider外部操作は別途scopeとする。

## Work 0029 collision recovery and dispatch tombstones

Historical `0028-CODEX-01` and `0028-CODEX-02` remain consumed identifiers and are never reused. Work 0029 remains the canonical accepted shared-admin implementation.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up.
