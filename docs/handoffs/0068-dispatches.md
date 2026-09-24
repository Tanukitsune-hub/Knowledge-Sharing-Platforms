# Work 0068 dispatch control

WORK_ID: 0068
DISPATCH_ID: 0068-CODEX-01
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: COMPLETE

## Primary Outcome

左サイドバーの「面談実績の集計」を開いた時も、集計条件を変更した時も自動集計せず、利用者が画面内の「集計」ボタンを押した時だけ `getMeetingActivityAnalytics` を実行する。

## Closed Conclusions

- 現在の自動実行原因は `src/ClientActivityAnalytics.html` の `nav-activity-analytics` click handler内の `if(!activityAnalyticsLoaded)loadActivityAnalytics()`。
- 初回・2回目以降を問わず、period/date/dimension/filterの条件変更では自動再集計しない。通常の集計RPCは「集計」ボタン操作だけをtriggerとする。
- server-side analytics logic、集計条件の初期値、集計ボタン、表示構造は変更しない。
- 初回ページ表示時は現在の空の結果領域をそのまま維持し、追加の初期RPCを発生させない。

## Scope / Boundaries

Work固有instruction:
`docs/handoffs/0068-CODEX-01-activity-analytics-manual-run-instruction.md`

恒久ルールはnearest `AGENTS.md`に従う。

## Required Validation

TIER_2_STANDARD。

- focused UI test: navigationだけではanalytics RPCが発火しない
- focused UI test: 「集計」button clickではanalytics RPCが発火する
- focused UI test: 初回成功後を含め、条件変更だけではanalytics RPCが発火しない
- relevant Activity Analytics tests
- browser/client behavior check（synthetic harnessで十分。target deploymentはこのDispatchでは行わない）
- generated bundle/packageをsource変更に追随
- canonical `npm run check` 1回
- `git diff --check`

## Delivery

branch: `work/0068-activity-analytics-manual-run`
Draft PRを使用。

report:
`docs/handoffs/0068-CODEX-01-activity-analytics-manual-run-report.md`

## CODEX-01 return

- navigationと条件変更からの自動集計を解除し、「集計」button起点のみの通常集計を維持。
- focused Activity Analytics 10/10、synthetic browser 1440px / 390px、bundle 30/30、7-file package parity、canonical check 691/691 PASS。
- deployment / provider call / business-data mutation: 0。ChatGPT final review待ち。

## ChatGPT final review

- PR #102のsource diff、focused tests、synthetic browser evidence、generated bundle / 7-file package parityをreview: PASS。
- navigation / condition change / re-entryによる通常集計RPCは0。「集計」buttonのみで実行。
- 初回手動集計後も条件変更では自動再集計しない。
- Activity Analytics 10/10、1440px / 390px browser、bundle 30/30、canonical 691/691、diff check PASSを受入れ。
- release 0.1.2 / schema 8維持。server-side analytics logic変更なし。
- deployment / provider call / business-data mutation各0。
- BLOCKER: NONE。
- completion: `docs/handoffs/0068-completion-report.md`

```text
WORK_0068_COMPLETE: YES
COMPLETION_LATCH: APPLIED
```

```text
NEXT_UNUSED_DISPATCH: 0068-CODEX-02
```

WORK_ID: 0068
DISPATCH_ID: 0068-CODEX-01
BALL: NONE
STATUS: ACCEPTED