# Work 0065 — target runtime release

WORK_ID: 0065
STATUS: ACTION_REQUIRED
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH

## Primary Outcome

Work0060–0064でacceptedとなったUX改善を、既存の同一owner-controlled Web Appへ1回だけ反映し、変更面に限定したtarget-runtime qualificationを完了する。

## User Approval Gate

このWorkは実利用Web Appのdeployment updateを伴うため、Codex dispatch開始前にユーザーの明示承認を必須とする。

承認前に行ってよいこと:
- GitHub上のrelease plan / handoff準備
- current main / accepted evidence確認
- deployment手順のread-only確認

承認前に行わないこと:
- Apps Script source sync
- immutable version create
- existing deployment update
- new deployment
- runtime data mutation
- provider call

## Release Scope

対象sourceはWork0060–0064がmergeされたcurrent mainのみ。

### Included accepted changes

- Work0060: 面談編集のunsaved edit protection
- Work0061: Knowledge Search / Entity Workspace result freshness
- Work0062: 面談登録・編集のfield-level validation
- Work0063: master reorder代替操作 + focus flow
- Work0064: secondary text contrast + Theme warning

## Deployment Boundary

- existing owner-controlled Web App deploymentのみ更新。
- new deployment: 0。
- execute-as / access boundaryを変更しない。
- permission change: 0。
- schema migration: 0。
- resource rename: 0。
- provider configuration mutation: 0。
- business data mutation: 原則0。
- source sync 1回、immutable version create 1回、existing deployment update 1回を上限とする。
- 同じ失敗の反復はしない。deployment失敗またはserved-version不一致が起きた場合はStrategy Reset。

## Target-runtime Qualification Matrix

変更面だけを確認する。0060–0064でaccepted済みのlocal testsを全面再実行しない。

### 0060 — Unsaved edit protection
- 過去の記録で既存recordを開き、dirty edit状態を作れること。
- 実business data mutationは避ける。runtime qualificationでは破棄確認 / cancel / navigation保持を中心に確認。
- saveを使う必要がある場合はsynthetic / safely reversible対象が存在する場合のみ。なければlocal accepted evidenceを正式証拠として保持し、runtime saveはN/Aとする。

### 0061 — Result freshness
- provider callなしで確認可能なclient-side stale-state behaviorを優先。
- query resultそのものを得るためのOpenAI / Gemini callは行わない。
- Entity Workspaceのentity切替時に旧contentがcurrentとして残らないことをread-onlyで確認可能なら確認。

### 0062 — Field-level validation
- 面談登録のrequired 3項目を空のままsubmitし、field-level error / first-invalid focusを確認。
- RPC / business data mutationが発生しないこと。
- edit validationはread-onlyで既存recordを開ける場合のみ確認し、saveしない。

### 0063 — Accessible reorder / focus
- master reorderは実データ順序を変えない。runtimeではmove buttonの存在 / boundary disabled / keyboard focus pathを中心に確認。
- actual reorder saveは行わない。
- sidebar page navigation、detail / edit focusをread-onlyで確認。

### 0064 — Contrast
- Theme default / current effective themeで`text.secondary`が期待値へ反映されていることを確認。
- Theme設定でwarning logicを確認するためsaved paletteを変更しない。
- runtime mutationなしでDOM/CSS stateを確認できる範囲をqualificationとする。

### Common
- current product brand: Private Assets Intelligence
- 管理者ページ3 tabs維持
- 主要変更面でmaterial console error / warningなし
- 390px変更面でmaterial horizontal overflowなし
- existing owner-only access boundary維持

## Evidence Hierarchy

1. target runtime served DOM / behavior
2. deployment/version metadata
3. accepted Work0060–0064 local browser / focused evidence
4. static source inspection

target runtimeで安全に再現できないmutation系acceptanceは、既存accepted local evidenceを保持し、無理にreal dataへ操作しない。

## Non-Goals

- 0060–0064の設計再レビュー
- additional UX改善
- provider qualification
- real AI search quality validation
- business data write test
- backup qualification
- all seven pages full regression
- historical Work全件再検証
- permission / access scope変更
- deployment architecture変更

## Retry / Reset

- source sync: max 1
- version create: max 1
- deployment update: max 1
- target-runtime qualification: 1 pass

以下でStrategy Reset:
- deployment update失敗
- served versionが作成versionと一致しない
- existing deployment ID / access boundaryに矛盾
- material console/runtime error
- real business-data mutationなしではAcceptanceを満たせないことが判明

## Completion

- existing deploymentへaccepted mainを1回反映
- target-runtime matrixの安全に確認できる項目PASS
- mutation不要項目は既存accepted evidenceで補完
- new deployment 0
- permission change 0
- provider call 0
- business data mutation 0を原則維持
- BLOCKER NONE
- runtime reportをGitHubへ記録
- ChatGPT final review後にCompletion Latch
