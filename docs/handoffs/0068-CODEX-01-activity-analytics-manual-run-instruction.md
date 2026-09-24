# Work 0068 CODEX-01 — Activity Analytics manual run only

WORK_ID: 0068
DISPATCH_ID: 0068-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Goal

左サイドバーの「面談実績の集計」を開いた時も、period/date/dimension/filter等の集計条件を変更した時も集計を自動実行しない。

初回・2回目以降を問わず、通常の `getMeetingActivityAnalytics` 実行は利用者が画面内の「集計」ボタンを押した時だけ行う。

## Read First

- nearest `AGENTS.md`
- `src/ClientActivityAnalytics.html`
- `src/ActivityAnalyticsPage.html`
- `tests/activity-analytics-ui.test.cjs`
- `tests/activity-analytics.test.cjs`
- current distribution/package build rules
- `docs/handoffs/0068-dispatches.md`

恒久ルールはAGENTS.md等に従い、本instructionへ再展開しない。

## Confirmed Current Behavior

current mainのclient codeには次のnavigation behaviorがある。

- `nav-activity-analytics` click
- `showPage('activity-analytics')`
- `selectActivityView(activityActiveView)`
- `if(!activityAnalyticsLoaded)loadActivityAnalytics()`

この最後の呼び出しにより、初回tab openだけでdefault条件のanalytics RPCが走る。

filter change handlerは `if(activityAnalyticsLoaded)loadActivityAnalytics()` となっているため、初回manual run成功後は条件変更だけでRPCが発火する。今回、この自動再集計も廃止対象とする。

## Required Behavior

1. sidebarの「面談実績の集計」を開く:
   - pageは表示される
   - current graph/list view selectionは維持
   - analytics RPCは0
   - loading / busy statusへ遷移しない
2. 初回manual run前にperiod/date/dimension/filterを変更:
   - analytics RPCは0
3. 「集計」buttonを押す:
   - existing `loadActivityAnalytics` flowを1回実行
   - success時に`activityAnalyticsLoaded=true`
   - existing render/status behaviorを維持
4. 初回成功後にperiod/date/dimension/filterを変更:
   - analytics RPCは0
   - 既存結果が表示されたままでもよく、変更条件は次回「集計」button押下時に反映する
5. sidebarから離れて戻る:
   - navigationだけで新しいanalytics RPCを発火しない
   - 直前にrender済みの結果は既存stateのまま保持してよい

## Implementation Constraint

最小変更を優先する。

想定修正は `src/ClientActivityAnalytics.html` で、navigation handlerのauto-loadと、条件change handlerからのauto-loadを外すこと。`loadActivityAnalytics` 自体と「集計」button handlerは維持する。

server-side analytics logic、payload、default filter値、chart/table rendering、admin check、button label、page layoutは変更しない。

追加UX文言やplaceholder redesignは今回のscope外。

## Distribution Impact

`src/`が変更されるため、repositoryのcanonical distribution規約に従ってgenerated bundleを更新する。

Work0067で追加した `dist/company-multifile/` も、新しいcanonical bundleから再生成し、7-file packageのbyte identity / hash parityを維持する。

release version / schemaは変更しない。bundle hashはsource変更に伴って更新されてよい。

## Acceptance Evidence

必須:

- sidebar navigation alone does not call `getMeetingActivityAnalytics`
- pre-first-run filter changes do not call `getMeetingActivityAnalytics`
- first `activity-analytics-refresh` click calls `getMeetingActivityAnalytics`
- successful first run sets loaded state and renders existing data
- post-success period/date/dimension/filter changes do not call `getMeetingActivityAnalytics`
- leaving/re-entering analytics page does not trigger a fresh RPC by navigation itself
- relevant Activity Analytics unit/static tests PASS
- relevant client/browser harness PASS
- generated bundle validation PASS
- regenerated Work0067 multi-file package reconstructs the new canonical bundle byte-for-byte
- canonical `npm run check` PASS once
- `git diff --check` PASS
- server-side analytics logic unchanged
- deployment / provider call / business-data mutation: 0

## Non-Goals

- analytics formula/aggregation changes
- initial filter/default value changes
- graph/list redesign
- button wording changes
- admin-check behavior changes
- provider configuration
- Apps Script deployment
- company Workspace mutation
- release/schema bump

## Authorization / Side Effects

Repository source/test/generated-artifact changes only.

No deployment, provider call, company environment write, business-data mutation, or permission change。

## Execution Budget / Strategy Reset

- implementation strategy: 1
- speculative repair attempts for same failure class: max 2
- deployment mutations: 0

Reset and return if:
- removing navigation auto-load breaks unrelated page bootstrap
- distribution regeneration reveals a material unrelated failure
- target behavior requires server-side changes

## Delivery

Create branch:
`work/0068-activity-analytics-manual-run`

Open a Draft PR.

Report:
`docs/handoffs/0068-CODEX-01-activity-analytics-manual-run-report.md`

Update:
`docs/handoffs/0068-dispatches.md`

Report minimum:

```text
NAVIGATION_RPC_COUNT_BEFORE_FIRST_RUN
PRE_FIRST_RUN_FILTER_RPC_COUNT
MANUAL_RUN_RPC_COUNT
POST_SUCCESS_CONDITION_CHANGE_RPC_COUNT
REENTRY_NAVIGATION_RPC_COUNT
FOCUSED_TESTS
ACTIVITY_ANALYTICS_TESTS
CLIENT_BROWSER_CHECK
BUNDLE_VALIDATION
MULTIFILE_PACKAGE_PARITY
CANONICAL_CHECK
DIFF_CHECK
DEPLOYMENT_MUTATION_COUNT
PROVIDER_CALL_COUNT
BUSINESS_DATA_MUTATION_COUNT
BLOCKER
```

ChatGPT final reviewまでは`ACCEPTED` / Completion Latchを適用しない。

WORK_ID: 0068
DISPATCH_ID: 0068-CODEX-01
BALL: CODEX
STATUS: READY
