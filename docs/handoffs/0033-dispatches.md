# Work 0033 dispatch control

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
PHASE: COMPLETION_LATCH

## Final outcome

Knowledge Sharing Platforms専用のlocal-only UI Layout Lab v2を完成・受入した。production appには変更を入れていない。

```text
PR: #55
MERGE: 24c8e78b0a446eddf0f1540885eb10db0bc865fa
LAYOUT_LAB: USABLE
SPEC_VERSION: 2
PREFERRED_CANDIDATE: CURRENT_12_COLUMN
CURRENT_MAX_WIDTH_PX: 2000
DESKTOP_TOPOLOGY: PRESERVED_WIDE_LAPTOP_COMPACT
MOBILE_PROJECTION: ONE_COLUMN_VISUAL_ONLY
DIRECT_PLACEMENT_MODEL: PASS
EIGHT_DIRECTION_RESIZE_MODEL: PASS
STANDARD_FINE_CONVERSION: PASS
V1_MIGRATION: PASS
V2_JSON_ROUNDTRIP: PASS
FOCUSED_TESTS: 20/20 PASS
CANONICAL_CHECK: 544/544 PASS
MANUAL_BROWSER_QUALIFICATION: PASS / USER_CONFIRMED
CONSOLE_MATERIAL_ERROR_WARN: 0
PRODUCTION_SRC_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
NETWORK_CALLS: 0
PROVIDER_CALLS: 0
BLOCKER: NONE
```

## Current authoritative candidate

`docs/handoffs/0033-user-layout-candidate-current.json`

Current candidate:
- 12 columns
- width 100%
- max-width 2000px
- left aligned
- gap 14px / 14px
- Wide 2560 / Laptop 1440 / Compact 1280でcanonical topology維持
- <=720pxだけsingle-column visual projection

## Closed conclusions

- Layout Labはproductionから独立したlocal static tool。
- direct row/column placement、8-direction resize、Standard12/Fine24を利用可能。
- specVersion1はv2へdeterministic migrate。
- local variants / JSON / Codex handoff / screenshot overlayを維持。
- viewport preview変更はcanonical desktop placementをmutationしない。
- current preferred Meeting-create layoutは上記candidate。
- production `src/**`はWork0033で変更していない。
- Apps Script version9等のproduction deploymentも行っていない。
- Work0030はDEFERRED_BY_USERのまま。

## Residual / next

他タブは同時に広げず、一つずつLayout Labで調整する。

次の自然なstepは、current Meeting-create candidateを別Workでproductionへ忠実に反映・actual Web App認定した後、次のタブを選んでLayout Lab対象へ追加すること。

## Completion Latch

```text
WORK_0033_COMPLETE: YES
COMPLETION_LATCH: APPLIED
ACTIVE_BLOCKER: NONE
ACTIVE_DISPATCH: NONE
BALL: NONE
STATUS: ACCEPTED
NEXT_UNUSED_DISPATCH: 0033-CODEX-03
```

新しいmaterial contradictory evidence、Layout Lab defect、または明示scope変更がない限りWork0033を再開しない。

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
BALL: NONE
STATUS: ACCEPTED