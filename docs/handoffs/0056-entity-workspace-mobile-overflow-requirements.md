# Work 0056 — Entity Workspace 390px overflow fix requirements

WORK_ID: 0056
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0055 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

390px mobile viewportで「面談先サマリー」だけに発生しているhorizontal overflowを解消し、画面全体の横スクロールを0にする。

## Discovery evidence

Work0052 CODEX-02のexpanded all-seven-page synthetic measurementで:
- Entity Workspace only: +176px horizontal overflow
- other six pages: 0
- Work0052 branchとmainで以下は完全一致:
  - `src/Styles.html`
  - `src/EntityWorkspacePage.html`
  - `src/ClientEntityWorkspace.html`

Therefore this is a pre-existing layout issue, not a Work0052 regression.

## Required behavior

- viewport 390pxでdocument-level horizontal overflow 0
- Entity Workspace content remains usable
- tables/cards that legitimately need wide content should scroll inside their own bounded container rather than widening the page
- long IDs / labels / links wrap or truncate safely as appropriate
- selector and accepted three summary cards remain intact
- desktop 1280 / 1440 / 2560 layout materially unchanged
- no data / RPC / business-logic changes

## Fastest Safe Decisive Action

1. identify exact overflowing DOM element and computed width/min-width/white-space cause
2. fix the narrowest responsible CSS/layout rule
3. avoid global overflow:hidden masking
4. verify 390 / 1280 / 1440 / 2560
5. run 7-page mobile overflow matrix

## Non-goals

- Entity Workspace redesign
- copy rewrite
- navigation changes
- backend/API changes
- Work0030

## Acceptance Evidence

- entity-workspace 390 overflowPx = 0
- all seven pages 390 overflow = 0
- no clipping of required controls
- desktop regression 0
- console material error/warn 0
- `npm run check` PASS
- bundle PASS
- business/backend change 0
