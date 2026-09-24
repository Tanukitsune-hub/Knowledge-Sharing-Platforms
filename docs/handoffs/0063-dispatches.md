# Work 0063 dispatch control

WORK_ID: 0063
DISPATCH_ID: 0063-CODEX-01
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: COMPLETE

## Primary Outcome

dragに依存しないマスター並び替え操作と、主要page/detail/edit遷移後の意味のあるfocus flowを追加する。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0063-accessible-reorder-focus-requirements.md`
- accepted main including Work0060–0062

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従う。

client-side reorder alternative / focus behaviorのみ。master API / schema / navigation IA / modal focus / deployment変更なし。

## Required Validation

TIER_2_STANDARD。

- focused reorder + focus tests
- relevant browser: Master + Past Records + representative navigation、desktop + 390px
- keyboard interaction proof
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- provider call / target-runtime deployment不要

## Delivery

branch: `work/0063-accessible-reorder-focus`
Draft PRを使用。
report: `docs/handoffs/0063-CODEX-01-accessible-reorder-focus-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0063-CODEX-02
WORK_0063_COMPLETE: YES
COMPLETION_LATCH: APPLIED
```

WORK_ID: 0063
DISPATCH_ID: 0063-CODEX-01
BALL: CHATGPT
STATUS: RETURNED

CODEX-01は実装とTIER_2_STANDARDのlocal validationを`0063-CODEX-01-accessible-reorder-focus-report.md`へ記録し、Draft PR #95でChatGPT final reviewへ返却した。ACCEPTED / Completion Latchは未適用。

## ChatGPT final review

- PR #95 implementation diff / report / focused interaction evidenceをreview: PASS。
- 「上へ」「下へ」は既存`masterOrderDrafts` / `masterDraftMove`を共有し、dragとは別stateを作っていない。
- first / last boundaryをdisableし、再描画後も移動対象rowの有効controlへfocusを戻す。
- 既存`REORDER_BATCH`、未保存表示、save/reset、tab別draft semanticsを維持。
- keyboard起点のsidebar page切替だけpage headingへprogrammatic focusし、pointer clickではnav button focusを維持する設計を受入れ。
- detail / editの明示遷移はread成功後に`tabindex=-1` headingへfocus。tab orderは増やさない。
- modal focus logicとWork0060 dirty edit protectionは未変更。
- focused 26/26、1440/390 synthetic browserでkeyboard reorder→save、touch/click、page/detail/edit focus、dirty edit保持を確認。bundle 30/30、canonical 684/684を受入れ。
- provider call / deployment / business-data mutation 0。TIER_2_STANDARDとしてtarget runtime deployは不要。Work0065へ集約する。
- BLOCKER: NONE。

Completion: `docs/handoffs/0063-completion-report.md`

WORK_ID: 0063
DISPATCH_ID: 0063-CODEX-01
BALL: NONE
STATUS: ACCEPTED
