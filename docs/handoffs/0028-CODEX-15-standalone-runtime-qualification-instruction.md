# CODEX-15 — standalone target runtime qualification for PR #51

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-15
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.4 / STANDALONE EDITOR RUNTIME QUALIFICATION

## Primary Outcome

PR #51の既にpush済みfrozen production sourceを、既存standalone Apps Script projectに適したprivate editor control pathでschema 7へ安全に更新し、positive-proof済みexisting WEB_APP `/exec`からprovider-independent primary flow R1–R8をend-to-end認定する。

このdispatchはinstallerをstandalone対応へ作り替えるWorkではない。company fresh installのcontainer-bound installer契約を維持したまま、既存standalone qualification targetの継続経路だけを使う。

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / Draft PR:

```text
branch: codex/0028-production-contract-build
PR: #51
returned HEAD: 0aeced527ca0efe93d41c337dc10db17613b79cc
frozen source commit: 5842a07255a10415d39d524fd8ec174450248855
bundle commit: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
remote saved source parity: 83/83 PASS
existing deployed version: 75 / unchanged
```

Read first:

- latest `origin/main`
- applicable `AGENTS.md`
- `docs/handoffs/0028-CODEX-14-controller-review.md`
- this instruction
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/decisions/modular-source-single-bundle-distribution.md`
- `docs/decisions/company-azure-openai-provider.md`

Do not merge/rebase main into PR branch merely to import control docs. `docs/handoffs/0028-dispatches.md` and `docs/planning/work-registry.md` are ChatGPT-owned.

## Closed Conclusions

1. CODEX-14の`INSTALLER_BOUND_SPREADSHEET_REQUIRED`はexpected installer preconditionでありapplication defectではない。
2. `installKnowledgeShare()` / `checkKnowledgeShareReadiness()` / `confirmKnowledgeShareDeploymentSecurity()`はfresh company install用container-bound Spreadsheet pathであり、既存standalone targetでは使わない。
3. installerのbound Spreadsheet guardを削除・緩和しない。company distribution architectureを変更しない。
4. Existing standalone targetのprivate core control pathはApps Script editorから直接実行する:
   - `getInstallationStatus_()`
   - `validateInstallation_()`
   - `setupKnowledgePlatform_()` only when the existing installation state/resource continuity is proven and schema 7 append is required.
5. private `_` functionsをExecution API `scripts.run`や`google.script.run`から呼ばない。public diagnostic wrapperも追加しない。
6. CODEX-13 source direction / deterministic evidence / prepare lifecycleはAccepted Evidenceとして保持し、runtimeの直接反証がない限り再設計しない。
7. Direct OpenAI / Gemini / Azure OpenAI provider callsは本dispatchで0。actual Azure File Search/citationはWork 0030。

## Accepted Evidence — do not rerun without contradiction

```text
PREPARE_LIFECYCLE: PASS
160 completed batches: PASS
recent exact replay: PASS
retired-token safe rejection: PASS
unresolved INTENT preservation: PASS
bounded Script Properties: PASS
focused tests: 78/78 PASS
canonical tests: 515/515 PASS
bundle: 27/27 PASS
remote saved source parity after CODEX-14 push: 83/83 PASS
```

Broad deterministic re-runは不要。sourceを変更した場合だけaffected focused + canonical + bundleを再実行する。

## Pre-mutation identity refresh

CODEX-14終了状態からread-onlyでrefreshする。

```text
Git frozen source
-> Apps Script project
-> remote saved source = frozen source
-> existing immutable version 75 = previous accepted source
-> intended existing WEB_APP deployment
-> intended /exec
-> USER_DEPLOYING / MYSELF
-> owner browser account
```

重要:
- remote saved sourceは新source、existing deployed version 75は旧source。この差を保持して認識する。
- saved source parityが83/83でなくなっていたらSTOP、mutation 0。
- deployment identityが前回positive proofから変わっていたらSTOP。
- source pushは既に1回消費済み。再push禁止。

## Phase 1 — existing standalone installation continuity

Apps Script editorのowner contextで、source変更なしにprivate functionを直接実行する。

### 1A `getInstallationStatus_()`

実行結果またはdebugger/localsで、秘密IDをreportせず次を分類する。

- existing installation stateが存在するか
- schema version currently recorded
- config exists / environment is expected
- stored resource setが存在するか
- errors/warningsのsafe code

このfunctionがunexpected errorで失敗したらSTOP。別surfaceへ切替しない。

### 1B `validateInstallation_()`

current saved sourceのschema contractに対して既存resourcesをvalidateする。

PASSならsetupは不要。Phase 2へ進む。

FAILの場合、次の条件をすべて満たすときだけsetupを許可する。

```text
existing installation state/config present
stored authoritative resources accessible
resource parent/type continuity valid
failure is expected forward schema/setup drift compatible with append-only migration
no resource-ID/config/admin/parent contradiction
AI sync remains disabled
no unexpected trigger exists
```

`INSTALLATION_STATE_MISSING`、stored resource inaccessible/type/parent mismatch、config/admin contradiction、duplicate resource candidates等があればsetupを推測実行せずSTOP。

## Phase 2 — append-only setup at most once

Phase 1でsafe migration caseと証明された場合のみ、Apps Script editorで`setupKnowledgePlatform_()`を1回実行する。

Required behavior:

- existing stored resource IDsをauthoritativeとしてreuse
- schema 7へforward-only append
- `Pitchbook_Index`末尾へ4列だけ追加:
  - `Parent_Meeting_ID`
  - `Counterparty_Type`
  - `Counterparty_ID`
  - `Related_GP_IDs`
- existing rows/cells/counters/provider settings/admin settingsを保持
- historical Pitchbookへparentを自動推定しない
- AI syncをenableしない
- unexpected triggerを作らない
- new DB/sheet/relationship tableなし

setup returnでerrorが1件でもあればSTOP。第二setup attemptなし。

setup後、`validateInstallation_()`を1回実行しPASSをrequireする。schema 7とresource integrityをauthoritative readbackで確認する。

## Phase 3 — immutable version + existing WEB_APP update

Phase 1/2のvalidation PASS後のみ実行。

1. saved source parity 83/83を再確認。
2. reviewed saved sourceからimmutable versionを exactly 1つ作成。
3. version sourceがsaved frozen sourceとexact parityであることを確認。
4. positive proof済みexisting WEB_APP deploymentをそのversionへ exactly 1回 update。
5. new deployment作成禁止。
6. same deployment identity / WEB_APP / intended `/exec` / USER_DEPLOYING / MYSELFをreadback。
7. deployment sourceがnew immutable versionに一致することを確認。

version creationまたはdeployment updateが失敗したらSTOP。第二version/deploymentを作らない。

## Phase 4 — `/exec` synthetic provider-independent R1–R8

Verified owner browserでexisting `/exec`を開き、new versionがserveされていることをexecution historyと画面で確認してから業務flowへ進む。

Use synthetic/anonymized data only. Real confidential content禁止。

### R1 Schema / setup

PASS requires:

- target runtime schema 7
- `Pitchbook_Index` 4 append columns present
- existing columns/rows preserved
- validation PASS
- 5-sheet backend unchanged
- unexpected trigger 0

### R2 GP + non-GP Meeting parent-first

Normal Web App UI/public facades only:

- synthetic GP Meeting 1件
- synthetic non-GP Meeting 1件
- stable Meeting_ID / Version / Google Docs sourceをreadback
- parent commit前にPitchbook registrationが起きていないこと

### R3 Parent-bound tiny file

non-GP Meetingへtiny supported synthetic file 1件をattach。

Require authoritative readback:

- stable Document_ID
- Drive file exists
- `Parent_Meeting_ID` = parent
- `Counterparty_Type` = parent
- `Counterparty_ID` = parent
- `Related_GP_IDs` = parent snapshot
- non-GPなら`GP_ID`を架空補完しない
- parent `Related_Pitchbook_IDs`にDocument_ID

Provider callは禁止。

### R4 Existing Meeting follow-up

Past Records / same saved Meeting contextから2件目のtiny synthetic fileを追加。

- new Meeting_IDを作らない
- new Document_IDだけ発行
- parent contextを保持

### R5 unlink / relink

- visible `削除`でcurrent Meetingからunlink
- Document_ID / Drive file存続
- physical delete 0
- Pitchbook-wide Inactive/Reactivateを勝手にしない
- same Document_IDをrelink
- authoritative relation listを各stateでreadback

### R6 Meeting Google Docs body preservation

relation-only mutation直前のauthoritative Meeting Google Docs body textを取得。
unlink後・relink後も取得。

Require exact text equality。Date/Timeとunrelated business metadataも不変。

診断wrapperを追加しない。既存product/read pathまたはauthoritative Google Docの直接確認を使う。

### R7 Dedicated Full Output

AI question/modelを設定せず、dedicated `全文出力`をsynthetic Meeting scopeで実行。

Require:

- Meeting-only count/scope
- authoritative Meeting Docs body
- Meeting business attributes
- Pitchbook body absent
- Pitchbook reference-link section absent
- bounded no-resultまたはinvalid-date safe path 1件
- provider calls 0

### R8 Integrity / security

- Gemini remains disabled / normal-user hidden
- Work 0029 shared-admin login/session behaviorを1 bounded smokeで確認し、password rotationなし
- credential/provider resource IDsをreport/logへ抽出しない
- Direct OpenAI/Gemini/Azure calls = 0
- access expansion = 0
- physical delete = 0
- real confidential writes = 0
- unexpected trigger = 0

## Cleanup

Physical deleteは不可。

- clearly synthetic Meetingはevidence capture後にInactiveへできる
- synthetic relationは必要ならunlink可能
- Drive/Docs/fileはphysical deleteしない
- residual synthetic resource types/countsだけをreportし、private IDs/URLsを書かない

## Stop conditions

runtime mutation開始後の最初のfailureで即STOP。

Do not:

- source再push
- installer wrapperへ戻る
- installer guardを変更
- second setup
- second version/deployment
- new deployment
- Execution API `scripts.run`
- OAuth/Cloud project/access変更
- public diagnostic wrapper追加
- provider call
- 同dispatch内で別仮説へ拡張

Google OAuth/consent等のinteractive user actionが真に必要な場合は、同じ`0028-CODEX-15`のまま`BALL: USER / STATUS: ACTION_REQUIRED`で具体的なUI操作だけを返し、完了後resumeする。credential/token/private IDをchatへ要求しない。

## Mutation budget

```text
source push: 0 remaining (CODEX-14で1回済み)
private status/validation reads: bounded as specified
setup: max 1
immutable version creation: max 1
deployment update: max 1
new deployment: 0
provider calls: 0
business synthetic pass: 1
source repair: 0 unless direct runtime application defect is observed; if observed STOP and RETURN
```

## Required report

Create/update on PR #51 branch:

`docs/handoffs/0028-CODEX-15-standalone-runtime-qualification-report.md`

Separate explicitly:

```text
INSTALLATION_CONTINUITY
SETUP_MIGRATION
SOURCE_VERSION_DEPLOYMENT_PARITY
TARGET_RUNTIME_QUALIFICATION_R1_R8
PROVIDER_RUNTIME_QUALIFICATION: DEFERRED_TO_WORK_0030 / CALLS_0
SIDE_EFFECT_STATE
RESIDUAL_SYNTHETIC_RESOURCES
BLOCKER
READY
```

Do not include private IDs, URLs, account names, credentials, OAuth material, or organization-specific data.

Return:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-15
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
```

If all R1–R8 PASS and no BLOCKER remains, set `READY: YES` for ChatGPT merge review. Do not merge PR #51 yourself.
