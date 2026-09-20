# Work 0040 CODEX-02 — legacy follow-up preservation runtime qualification

WORK_ID: 0040
DISPATCH_ID: 0040-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## 背景

CODEX-01の実装・focused tests・same existing owner-only Web App version20のruntime qualificationは概ねPrimary Outcomeを満たしている。

ChatGPT final reviewで、authoritative Acceptance Evidenceのうち次の1点だけがactual runtimeで直接確認されていないことを確認した。

- non-empty legacy `followUpRequired` / `followUpNote` を持つMeetingをactual deployed UIでunrelated edit/saveした後も、legacy valuesと既存`relatedPitchbookIds`がauthoritative readbackで不変であること。

CODEX-01 reportはこの点をproduction service focused testでは確認しているが、actual runtimeではrelation/body preservationのみを直接readbackしているため、merge前のAcceptance Evidenceを閉じる。

## Primary Outcome

PR #62 / version20の実装を変更せずに済むなら変更せず、isolated synthetic runtime evidenceでlegacy follow-up preservationを直接証明してWork0040のmerge blockerを解消する。

## 推奨モデル

GPT-5.6 Luna / reasoning max。

理由: 設計は確定済みで、今回は限定されたruntime qualificationと証拠固定が主目的。新しい設計探索は不要。

## Authoritative sources

- `docs/handoffs/0040-past-meeting-edit-cleanup-requirements.md`
- `docs/planning/work0040-past-meeting-edit-cleanup.md`
- `docs/handoffs/0040-CODEX-01-past-meeting-edit-cleanup-instruction.md`
- `docs/handoffs/0040-CODEX-01-past-meeting-edit-cleanup-report.md`
- `docs/handoffs/0040-dispatches.md`
- Draft PR #62
- existing branch `codex/0040-past-meeting-edit-cleanup`

## Closed Conclusions

- CODEX-01 implementation diffはChatGPT review上、現時点でscope blockerなし。
- version20はsame existing owner-only Web Appでserved済み。
- schema / migration / provider / permission / public exposureは変更しない。
- Work0030はDEFERRED_BY_USERのまま。
- PR #62はこのevidenceが閉じるまでmergeしない。
- 新しいUI設計、storage、relation semanticsは追加しない。

## Required runtime evidence

actual owner-only version20で、real business recordではなくisolated synthetic Meetingを使う。

1. synthetic Meetingを、少なくとも次の状態にする。
   - `followUpRequired = true`
   - `followUpNote` = non-emptyで識別可能なsynthetic文字列
   - `relatedPitchbookIds` = 1件以上
   - Status = Active

2. setup直後にauthoritative pre-readを取り、上記3値を固定する。
   - UIから設定できないlegacy値のsetupは、owner-only synthetic setupとして最小の既存経路を使ってよい。
   - real recordを変更しない。
   - setup mutationとAcceptance actionをreport上で明確に分離する。
   - private URL / deployment ID / Script ID / account /秘密情報は記録しない。

3. deployed browser UIで対象Meetingを開く。
   - detailで要フォロー / フォローメモが非表示。
   - edit formで要フォロー / フォローアップメモ / related selectorが非表示。

4. unrelated fieldを1つだけ変更してsaveする。
   - 例: `internalParticipants`等、今回のlegacy valuesと無関係なfield。
   - notes/bodyを不用意に変更しない。
   - optimistic version semanticsを通常どおり通す。

5. save後、authoritative readbackで以下を直接確認する。
   - `followUpRequired`: pre-readとexact equal
   - `followUpNote`: pre-readとexact equal
   - `relatedPitchbookIds`: pre-readとexact set/order semanticsで不変
   - unrelated fieldだけ意図どおり更新
   - existing relation count unchanged
   - unintended Doc/body mutation 0
   - material status mutation 0
   - physical delete 0

6. browser console material error/warn 0を確認する。

## Execution boundary

まずread-only preflightでsame existing target / served version20 / PR #62 branch stateを確認する。

期待どおりPASSする場合:
- production source code変更 0
- bundle regeneration 0
- new immutable version 0
- deployment update 0
- PR #62の既存実装diffを維持
- report / dispatchのみ更新してRETURNする

もしactual runtimeでlegacy valuesが変化する不具合を再現した場合のみ:
- 最小のscope-limited fixを実装
- relevant focused testを追加/修正
- `npm run check`
- `npm run check:bundle`
- `git diff --check`
- same existing deploymentだけを必要最小限に更新
- その場合はversion21以降のserved versionをreportする
- 新規target / second deploymentは禁止

## Safety

```text
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
REAL_BUSINESS_RECORD_MUTATION: 0
WORK_0030: DEFERRED_BY_USER
```

## Return artifacts

同じbranch / Draft PR #62を継続する。

新規report:
- `docs/handoffs/0040-CODEX-02-runtime-legacy-preservation-qualification-report.md`

更新:
- `docs/handoffs/0040-dispatches.md`

reportに必須:
- exact branch/head
- served version
- pre-read / post-read comparison（synthetic値は機密でない範囲の識別文字列可）
- relation count
- unintended mutations
- console material error/warn
- source/bundle/deployment mutation count
- BLOCKER有無
- READY_FOR_CHATGPT_FINAL_REVIEW

PASS時はPRをmergeしない。BALLをCHATGPTへ返す。

WORK_ID: 0040
DISPATCH_ID: 0040-CODEX-02
BALL: CODEX
STATUS: READY
