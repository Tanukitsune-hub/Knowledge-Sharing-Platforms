# Work 0070 dispatch control

WORK_ID: 0070
ACTIVE_DISPATCH_ID: 0070-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH
PHASE: SOURCE_IMPLEMENTATION

## Primary Outcome

API providerなしで、`面談メモ / 保存資料 / ニュース / 評価（ICメモ、社内整理等）` の4-source authoritative record layerをschema9 / 7-sheet / team-use前提で完成させる。

## Closed Conclusions

- Work0069 planningはACCEPTED。Closed Decisionsを重大な反証なく再設計しない。
- Work0070はcurrent 5-sheet AGENTS baselineをschema9 / 7-sheetへsupersedeするtask-specific exceptionを持つ。
- product titleは `Alternative Assets Intelligence`。
- authoritative Drive rootは `記録・資料`、direct childrenは `面談記録 / 保存資料 / ニュース / 評価（ICメモ、社内整理等）`。
- News ID = `NEWS-`、Assessment ID = `ASMT-`。
- News / AssessmentはDIRECT_TEXTまたはUPLOAD_FILEのexactly one authoritative content route。
- multi-Entityはcanonical `Counterparty_IDs` listで保持し、sourceをEntityごとに複製しない。
- 24h silent draft restoreは廃止するが、retry / unknown-outcome / partial-upload safety stateは維持する。
- Work0070はprovider / Full Output / Digestを実装しない。

## Dispatch Table

| Dispatch ID | Purpose | Mode | Ball | Status | Instruction | Report | Supersedes |
|---|---|---|---|---|---|---|---|
| 0070-CODEX-01 | production source実装 + deterministic validation | BUILD | CODEX | READY | `docs/handoffs/0070-CODEX-01-record-source-expansion-instruction.md` | pending | — |

## CODEX-01 Boundary

- repository source/test/docs/generated artifacts only.
- deployment/runtime/company data/provider mutation = 0.
- Draft PRを作成しChatGPTへreturn。
- `TARGET_RUNTIME_QUALIFICATION: NOT RUN` by design.

## Planned Next Dispatch

CODEX-01のChatGPT review後、必要なら:

`0070-CODEX-02` — isolated target-runtime schema9 migration / Workspace persistence / browser / concurrency qualification.

同じWork IDを維持する。

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-01
BALL: CODEX
STATUS: READY
