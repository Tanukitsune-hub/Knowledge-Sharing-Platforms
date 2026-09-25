# Work 0070 dispatch control

WORK_ID: 0070
ACTIVE_DISPATCH_ID: 0070-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH
PHASE: SOURCE_REVIEW_REPAIR

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
| 0070-CODEX-01 | production source実装 + deterministic validation | BUILD | CHATGPT | RETURNED | `docs/handoffs/0070-CODEX-01-record-source-expansion-instruction.md` | `docs/handoffs/0070-CODEX-01-record-source-expansion-report.md` / Draft PR #103 | — |
| 0070-CODEX-02 | ChatGPT source review findingsの限定修正 | BUILD | CODEX | READY | `docs/handoffs/0070-CODEX-02-source-review-repair-instruction.md` | pending | — |

## CODEX-01 ChatGPT review

Draft PR #103をreview。実装の大枠・schema9/4-source構造・concurrency primitivesは次段階へ進められるが、runtime qualification前に修正すべきdeterministic defectを確認した。

BLOCKER_FOR_RUNTIME:

- real server upload-format bootstrapが拡張子をdotなしで返す一方、client accept生成はその値を直接使用し、actual browser acceptが不正になる。synthetic fixtureがdot付き値を返して欠陥をmaskしていた。
- standalone 保存資料でserver-required Asset ClassがUI/client validationでrequiredになっておらず、synthetic fixtureがmissing Asset Classでもsuccessを返してfalse-positiveになっていた。
- News / AssessmentのTitle、News PublisherでUI maxlengthとserver max 255が不一致。
- explicit SOURCE_REQUEST_EXPIREDをunknown outcome扱いし、同じexpired requestIdを保持してretry/global clearを永久blockし得る。
- Work0070で追加したactionable source error codeのsafe public mappingが不足し、normal validation failureがgeneric maintenance errorへ退化する。

CODEX-02で限定修正し、ChatGPT再review後にtarget-runtime qualificationへ進む。

## CODEX-02 Boundary

- PR #103 / same branchを修正する。
- repository source/test/docs/generated artifacts only。
- deployment/runtime/company data/provider mutation = 0。
- target runtimeはまだ実行しない。

## Planned Next Dispatch

CODEX-01のChatGPT review後、必要なら:

`0070-CODEX-03` — CODEX-02 source repair受入れ後の isolated target-runtime schema9 migration / Workspace persistence / browser / concurrency qualification.

同じWork IDを維持する。

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-02
BALL: CODEX
STATUS: READY
