# Work 0071 dispatch control

WORK_ID: 0071
ACTIVE_DISPATCH_ID: 0071-CODEX-01
BALL: USER
STATUS: ACTION_REQUIRED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: PHASE_A_IMPLEMENTATION

## Primary Outcome

非同期save/upload/status変化があっても、主要action・読位置・focus位置を探し直さなくてよいinteraction modelを、まず「記録を追加」4 sourceとshared file flowで完成させる。

## Closed Conclusions

- Work0070 release 0.2.0 / schema9はACCEPTED baseline。
- Work0049 busy feedback standardを維持する。
- Work0070 retry / unknown-outcome / concurrency / 4-tab stateを変更しない。
- selected Google Web UX KB rulesは `docs/product/work0071-google-web-ux-adoption.md` を正本とする。
- primary issueはfeedback不足ではなく、feedback/content追加によるgeometry movement。
- fullscreen overlay / fake progress / schema/provider changeはしない。
- CODEX-01はPhase A implementation + Phase B auditまで。Phase B surface-specific implementationは別Dispatch。

## Dispatch Table

| Dispatch ID | Purpose | Mode | Ball | Status | Instruction | Report | Supersedes |
|---|---|---|---|---|---|---|---|
| 0071-CODEX-01 | before geometry -> Phase A stable interaction implementation -> isolated runtime qualification -> Phase B audit | BUILD | USER | ACTION_REQUIRED | `docs/handoffs/0071-CODEX-01-phase-a-interaction-stability-instruction.md` | `docs/handoffs/0071-CODEX-01-phase-a-interaction-stability-report.md` | — |

## Current handoff

Phase A source、generated artifacts、deterministic validation、面談/News/評価の隔離target-runtime確認は完了。standalone資料保存のfile chooserをbrowser automationで取得できなかったため、同じ隔離Web Appの「記録を追加 > 資料保存」で用意済みsynthetic TXTのnative選択だけを本人に依頼する。選択後に同一Dispatchでfile flowとfinal evidenceを確認し、BALLをChatGPTへ返す。Work0071は未ACCEPTED。

## Authorization Boundary

Allowed:

- repository branch / source / tests / generated artifacts
- existing Work0070 isolated owner-only targetの確認・再利用
- same isolated deploymentのbounded candidate update
- synthetic test records/files

Not allowed:

- company production
- confidential/company data
- broad Web App access
- provider/indexing/billing
- permission changes
- schema/migration
- physical delete

## Completion Gate

CODEX-01 return後にChatGPTがbefore/after geometry、diff、browser/runtime evidenceをreviewする。

Work0071はまだACCEPTEDにしない。

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-01
BALL: USER
STATUS: ACTION_REQUIRED
