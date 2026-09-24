# Work 0065 CODEX-01 — target runtime release instruction

WORK_ID: 0065
DISPATCH_ID: 0065-CODEX-01
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH

## Goal

Work0060–0064でacceptedとなったUX改善を、既存の同一owner-controlled Apps Script Web Appへ1回だけ反映し、変更面に限定したtarget-runtime qualificationを完了する。

## Release Source

```text
RELEASE_SOURCE_COMMIT: ff953fe0bd2a79d108ad2e981700c947e6bb07ad
SOURCE_MEANING: accepted main after Work0064
```

runtimeへ反映するproduction sourceはこのaccepted mainに固定する。release branchのhandoff/report docsはdeployment sourceとして扱わない。

## Read First

- nearest `AGENTS.md`
- `docs/handoffs/0065-target-runtime-release-requirements.md`
- `docs/handoffs/0065-dispatches.md`
- `docs/operations/runtime-policy.md`
- `docs/decisions/target-runtime-first-development.md`
- `docs/governance/security.md`
- Work0053の直近accepted runtime evidence

恒久ルールはAGENTS.md等に従い、本instructionへ再展開しない。

## Authorization

ユーザーは2026-09-24に「0065を進めて」と明示承認済み。

今回の承認範囲:
- accepted sourceのApps Script source sync
- immutable version create
- existing owner-controlled Web App deployment update
- 変更面限定のtarget-runtime read-only / non-mutating qualification

今回の承認外:
- new deployment
- permission / access scope変更
- provider call
- provider設定変更
- schema migration
- resource rename
- business-data write test
- destructive operation

## Preflight — before mutation

実行前にread-onlyで必ず確認する。

1. working sourceが`RELEASE_SOURCE_COMMIT`と一致すること。
2. target Apps Script project / existing Web App deploymentが、Work0053でacceptedした同一owner-controlled targetであること。
3. current served deployment/versionとaccess boundaryをread backすること。
4. execute-as / access設定を変更する必要がないこと。
5. source sync / version create / deployment updateを1回ずつで完了できること。

private deployment ID、script ID、private URL、account identifier等はGitHub report・chatへ記録しない。

preflightでtarget identityやaccess boundaryに矛盾があれば、mutationせずSTATUS: BLOCKEDで返す。

## Mutation Budget

```text
SOURCE_SYNC_MAX: 1
IMMUTABLE_VERSION_CREATE_MAX: 1
EXISTING_DEPLOYMENT_UPDATE_MAX: 1
NEW_DEPLOYMENT: 0
PERMISSION_CHANGE: 0
PROVIDER_CALL: 0
BUSINESS_DATA_MUTATION: 0
```

version番号は実targetから決定し、Work0053のversion35から単純推測しない。

同じ操作を失敗後に反復しない。source sync / version create / deployment updateのいずれかが失敗した場合はStrategy Resetし、安全に停止してChatGPTへ返す。

## Deployment

preflight PASS後のみ:

1. accepted main sourceをtarget Apps Scriptへsource sync — 1回。
2. immutable version create — 1回。
3. existing Web App deploymentをそのversionへupdate — 1回。
4. served version / deployment状態をread back。
5. new deploymentが0、execute-as / access boundaryが変更されていないことを確認。

## Target-runtime Qualification

Work0060–0064でaccepted済みのlocal testsを再実行しない。
target runtimeでしか確認できない変更面だけを1 passで確認する。

### Work0060 — unsaved edit protection

read-onlyで既存recordを開ける場合:
- editを開く
- form値をclient-sideで変更してdirty stateを作る
- 「編集を終了」またはdetail選択解除で破棄確認が出る
- cancelで入力を維持する
- page navigationで入力が保持される

saveはしない。business-data mutation 0を維持する。
安全に開けるrecordがない場合はruntime項目をN/Aとし、Work0060 accepted local evidenceを保持する。

### Work0061 — result freshness

provider callは禁止。

- Knowledge Searchはprovider RPCを起こさず確認できるDOM / invalidation behaviorだけ確認する。real AI answer生成はN/A。
- Entity Workspaceはread-only dataでentity切替が安全にできる場合、旧contentが新entity loading/current contentとして残らないことを確認。
- provider callなしでは確認できないpoll/answer raceはWork0061 accepted local evidenceを正式証拠として保持する。

### Work0062 — field-level validation

面談新規登録画面でrequired 3項目を空のままsubmit:
- 日付 / 面談先 / アセットクラスのfield-level error
- first-invalid focus
- registration RPC / business data mutation 0

edit validationは安全に既存recordをreadできる場合のみ確認し、saveしない。

### Work0063 — accessible reorder / focus

master dataは変更しない。

- move buttonsの存在
- first / last boundary disabled
- keyboard focus path
- actual reorder draftを作る場合もsaveしない。最後にresetしてclient stateを戻す。
- sidebar keyboard navigationのpage heading focus
- detail / edit focusはread-only recordが安全に利用可能な場合のみ確認

### Work0064 — secondary contrast

Theme保存はしない。

- effective `--theme-text-secondary` / fallback stateを確認。
- defaultを利用しているtargetなら`#5A6D79`を確認。
- persisted custom Themeが有効なら、その値を勝手に変更せず「custom override active」として記録し、default source evidenceで補完。
- Theme warningはruntime mutationなしに確認できる範囲のみ。save/resetは行わない。

### Common

- browser title / visible brand: `Private Assets Intelligence`
- 管理者ページ3 tabs維持
- material console error / warning 0
- 390pxの変更面でmaterial horizontal overflow 0
- same existing owner-controlled access boundary維持

## Evidence Rules

Evidence hierarchy:
1. target runtime served DOM / behavior
2. deployment/version readback
3. accepted Work0060–0064 local evidence
4. static source

mutationが必要なacceptanceを無理にreal dataで再現しない。N/AはFAILではなく、accepted local evidenceとの組合せで判断する。

browser harness / selector制約だけでアプリ不具合と断定しない。未観測をPASSにしない。

## Retry / Strategy Reset

以下のいずれかで即Strategy Reset:
- source sync / version create / deployment update失敗
- served version readback不一致
- existing target / deployment identityの矛盾
- access boundary差異
- material runtime/console error
- qualificationにbusiness-data mutationやprovider callが必要だと判明

Reset時は再deployしない。accepted sourceと既に成功したmutationを保持し、BLOCKERと最小の次行動だけreportする。

## Delivery

既存Draft PR #97 / branch `work/0065-target-runtime-release` を使う。新PRは作成しない。

report:
`docs/handoffs/0065-CODEX-01-target-runtime-release-report.md`

dispatch:
`docs/handoffs/0065-dispatches.md`

Reportにはprivate IDs / private URLs / account identifiersを含めず、最低限以下を記録する:

```text
RELEASE_SOURCE_COMMIT
PREVIOUS_SERVED_VERSION
NEW_IMMUTABLE_VERSION
FINAL_SERVED_VERSION
SOURCE_SYNC_COUNT
VERSION_CREATE_COUNT
EXISTING_DEPLOYMENT_UPDATE_COUNT
NEW_DEPLOYMENT_COUNT
ACCESS_BOUNDARY_CHANGED
PERMISSION_CHANGE_COUNT
PROVIDER_CALL_COUNT
BUSINESS_DATA_MUTATION_COUNT
TARGET_RUNTIME_QUALIFICATION
LOGIC_VALIDATION
SIDE_EFFECT_STATE
BLOCKER
```

各matrix項目をPASS / N/A / FAILで記録し、N/Aにはaccepted local evidenceでの補完元を示す。

ChatGPT final reviewまで`ACCEPTED` / Completion Latchは適用しない。

WORK_ID: 0065
DISPATCH_ID: 0065-CODEX-01
BALL: CODEX
STATUS: READY
