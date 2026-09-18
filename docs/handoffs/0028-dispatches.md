# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-24
ACTIVE_DISPATCH_ID: 0028-CODEX-24
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: USER HANDS-ON REOPEN / PRE-ROLLOUT UI POLISH

## Reopen

Work 0028はversion4 / PR #51で一度Completion Latch済みだったが、会社PC移行前のユーザー実機確認でrequired-flow contradictionと追加UI polishが確認されたため再オープンした。

Reopen review:
`docs/handoffs/0028-user-review-reopen.md`

## Accepted evidence retained

反証がない限り保持:

- PR #50 + #51 accepted implementation direction。
- schema7 / Backend exactly5。
- parent-first Meeting/file relation architecture。
- stable IDs / unlink-relink / physical delete0。
- Business Date/Time version4 readback contract。
- Meeting Docs preservation。
- Meeting-only non-AI Full Output。
- owner-only deployment security。
- provider calls0 / AI sync disabled。
- Work0030 DEFERRED_BY_USER。

## CODEX-24 required outcome

1. native date picker interactionを実用化。
2. From/Toを3年前応当日→今日でpreset。
3. 「記録を追加」選択不能をactual runtimeで修復しsynthetic登録まで確認。
4. wide desktopでinput/selectの過剰stretchを抑え、概ね30ch基準の自然なresponsive layout。
5. Past Meetingsを面談先中心にし、user-facing関連GP filter/sublineを除去。GP/non-GPを統一表示。

Active instruction:
`docs/handoffs/0028-CODEX-24-pre-rollout-ui-polish-instruction.md`

## Boundaries

```text
REAL_CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
NEW_TARGET: 0
SECOND_PARALLEL_DEPLOYMENT: 0
DIRECT_OPENAI/GEMINI/AZURE: 0
AI_SYNC: DISABLED
WORK_0030: DEFERRED_BY_USER
```

Codexは最大3cyclesまで自律修正・実機検証。通常bugごとに返却しない。

## Completion gate

CODEX-24の5項目がactual owner-only runtimeでPASSし、必要logic/bundle checks PASS、BLOCKER NONE。ChatGPT final review/merge後にCompletion Latchを再適用し、会社PC移行準備へ進む。

```text
WORK_0028_COMPLETE: REOPENED
COMPLETION_LATCH: RELEASED_BY_USER_CONTRADICTION_AND_SCOPE
ACTIVE_DISPATCH: 0028-CODEX-24
NEXT_UNUSED_DISPATCH: 0028-CODEX-25
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-24
BALL: CODEX
STATUS: READY
