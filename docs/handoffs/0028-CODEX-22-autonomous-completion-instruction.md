# CODEX-22 — Outcome-based autonomous completion

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-22
BALL: CODEX
STATUS: READY
MODE: BUILD / QUALIFICATION

## Primary Outcome

PR #51のaccepted Light UI + production contractを、既存isolated container-bound target上でprovider-independentにend-to-end認定し、Work 0028 completion gateまで到達させる。

局所的な失敗ごとにChatGPTへ返さず、安全境界内ではCodex自身が原因切り分け、最小修正、test、target-runtime再検証まで継続する。

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue:

```text
branch: codex/0028-production-contract-build
PR: #51
CODEX-21 return head: 985b9ad (開始時にexact remote HEADへresolve)
```

Read first:

- `AGENTS.md`
- `tests/AGENTS.md`
- `docs/agent-governance/work-control.md`
- `docs/agent-governance/dispatch-control.md`
- `docs/handoffs/0028-autonomous-completion-strategy-reset.md`
- `docs/handoffs/0028-CODEX-21-controller-review.md`
- PR branch `docs/handoffs/0028-CODEX-21-versioned-admin-confirmation-surface-report.md`
- `docs/handoffs/0028-dispatches.md`

## Closed evidence — do not reopen without contradiction

```text
INSTALLER_STAGE_REPAIR: PASS
INSTALLER_IDEMPOTENCY: PASS / DUPLICATES_0
BACKEND: EXACTLY_5_SHEETS / SCHEMA_7
AI_SYNC: FALSE
TRIGGERS: 0
VERSIONED_WEB_APP: SINGLE / RESTRICTED / USER_DEPLOYING / MYSELF
OPERATOR_SURFACE_VALIDATION: 522/522 PASS
BUNDLE_VALIDATION: 30/30 PASS
VERSIONED_CONFIRMATION_RESULT: READY / NONE
ATTESTATION_TO_AUTHORITATIVE_CURRENT_VERSIONED_EXEC: MATCH
VERSIONED_DEPLOYMENT_SECURITY_READINESS: ACCEPTED
PROVIDER_CALLS: 0
```

Native editorからの `DEPLOYMENT_SECURITY_ATTESTATION_STALE` はeditor/head context固有であり、actual versioned Web App readinessを反証しない。production readiness gateとしてeditor-context checkを再利用しない。

## Remaining acceptance evidence — R1-R8

R1. schema7 / exactly 5 Backend sheets / accepted resources / AI disabled。
R2. GP + non-GP parent-first Meetingをactual versioned Web Appで作成。
R3. tiny supported synthetic fileをnon-GP Meetingへ登録し、stable Document_ID + authoritative parent metadataを確認。
R4. 同じexisting Meetingへfollow-up tiny fileを追加し、Meeting_ID unchanged / new Document_ID onlyを確認。
R5. visible deleteはunlink only。physical file remains。relinkでsame Document_IDを復元。
R6. relation-only add/unlink/relinkの前後でMeeting Google Docs body exact equality。unrelated Date/Time/business fieldsも不変。
R7. dedicated Meeting-only non-AI Full Outputをactual runtimeで確認。AI/question/provider不要。bounded invalid/no-result safe behaviorも確認。
R8. single restricted deployment / AI sync disabled / provider credentials・calls0 / unexpected trigger0 / confidential data0 / physical delete0。

## Autonomous execution authority

同一PR / 同一target / 同一Outcomeの範囲で、R1-R8を完了するために必要ならCodex自身の判断で以下を行ってよい。

- root cause切り分け
- production sourceの最小coherent repair
- focused regression tests追加
- deterministic bundle/manifest再生成
- existing target source sync
- immutable version作成
- existing single WEB_APP deploymentのversion update
- versioned owner-only runtimeでの再検証
- synthetic Meeting/fileの作成・unlink/relink/Full Output
- read-only subagent review / test-gap review

各application defectやtest/runtime mismatchごとにChatGPTへ返さない。

## Internal iteration budget

最大3 repair/qualification cycles。

1 cycle:

```text
diagnose
-> minimal repair if needed
-> focused tests
-> canonical/bundle validation when source changes
-> existing target sync/version update when needed
-> target-runtime verification
```

same failure classが2回連続した場合、または3 cyclesを消費した場合のみStrategy ResetのためRETURNする。

既にclosedのinstaller/security evidenceを毎cycle再実行しない。変更がその領域を直接触った場合だけ必要十分なregressionを行う。

## Fixed boundaries

- existing isolated targetを継続利用
- existing single WEB_APP deploymentを継続。second parallel deployment禁止
- new target禁止
- historical version75 mutation 0
- real/confidential data 0
- physical delete 0
- destructive migration 0
- broad/company rollout 0
- permission/audienceをowner-onlyより広げない
- Direct OpenAI / Gemini / Azure OpenAI calls 0
- AI sync disabled
- Work 0030 DEFERRED_BY_USER
- credentials/private IDs/private URLs/hash/account dataをGitHub/chatへ保存しない
- PR #51はmergeしない

## STOP / RETURN conditions only

途中でChatGPTへ返してよいのは以下のみ。

1. USER native action / OAuth / credential inputが必要
2. permission・audienceをowner-onlyより広げる必要がある
3. real/confidential data、physical delete、destructive migration、billingが必要
4. new targetまたはsecond parallel deploymentが本質的に必要
5. accepted architecture/product contract変更が必要
6. same failure classが2回連続
7. 3 repair/qualification cyclesを消費
8. evidence contaminationまたはrollback不能リスク
9. provider callまたはWork 0030再開が必要

通常のapplication bug、test failure、runtime mismatch、small deployment-operability issueは自律修正して続行する。

USER actionが必要な場合だけ同Dispatch IDのまま `BALL: USER / STATUS: ACTION_REQUIRED`。

## Done when

次をすべて満たしたらRETURNする。

```text
R1_R8: PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

final diff、tests、runtime evidence、side effects、使用したrepair cyclesを
`docs/handoffs/0028-CODEX-22-autonomous-completion-report.md`
へ記録する。

PR #51はDraft/merge未実施のままChatGPTへ返す。

最終応答の冒頭と末尾:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-22
BALL: CHATGPT
STATUS: RETURNED
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-22
BALL: CODEX
STATUS: READY
