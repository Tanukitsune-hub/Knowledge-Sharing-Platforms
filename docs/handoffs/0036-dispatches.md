# Work 0036 dispatch control

WORK_ID: 0036
DISPATCH_ID: 0036-CODEX-01
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
PHASE: COMPLETION_LATCH

## Final outcome

Work0034/version10を基準に、全normal navigation tabをMeeting-create由来の12-column / 14px layout languageへ収束し、owner-only Web App version11で受入した。

```text
PR: #58
MERGE: 9537b499ed05698ab1e981a51534fe86807d910d
FINAL_SERVED_VERSION: 11
CROSS_TAB_UI_CONVERGENCE: PASS
NEW_COUNTERPARTY_MODAL: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
NORMAL_NAVIGATION: 7/7 PASS
VIEWPORTS: 2560 / 1440 / 1280 / 390 PASS
FOCUSED_TESTS: 55/55 PASS
NPM_RUN_CHECK: 561/561 PASS
BUNDLE_VALIDATION: 30/30 PASS
CONSOLE_MATERIAL_ERROR_WARN: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
SECURITY_CHANGE: 0
BLOCKER: NONE
```

## Accepted behavior

- Equity / Debtはnormal user selection surfaceから除去。backend/schema/historical dataは保持。
- Meeting/Pitchbook editではhidden compatibility valueを読み戻して既存Capital_Type_IDを保持。
- Counterparty Typeは通常filter/analyticsから除去。
- Counterparty Typeのuser selectionは新規面談先登録modalのみ。
- Meeting-createとMastersは同一custom modalを再利用。
- modalはrequired Type + Name、inline validation、Escape/Cancel/backdrop close、focus trap/restore、background inertを実装。
- Meeting起点の新規面談先登録は登録後に新Counterpartyを即時選択。
- Masters起点はmaster list/optionsをrefresh。
- Meeting-create accepted topologyは維持。
- Knowledge / Past / Counterparty Summary / Analytics / Masters / Adminは12-column / 14px / max2000の共通layout languageへ収束。
- Work0035 UI Studio expansionはSUPERSEDED_BY_USERのまま。
- Work0030はDEFERRED_BY_USERのまま。

## Reports

- `docs/handoffs/0036-CODEX-01-cross-tab-ui-convergence-report.md`

## Completion Latch

```text
WORK_0036_COMPLETE: YES
COMPLETION_LATCH: APPLIED
ACTIVE_BLOCKER: NONE
ACTIVE_DISPATCH: NONE
BALL: NONE
STATUS: ACCEPTED
NEXT_UNUSED_DISPATCH: 0036-CODEX-02
```

新しいmaterial contradictory evidenceまたは明示scope変更がない限りWork0036を再開しない。

WORK_ID: 0036
DISPATCH_ID: 0036-CODEX-01
BALL: NONE
STATUS: ACCEPTED