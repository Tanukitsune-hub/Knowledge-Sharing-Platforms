# CODEX-13 / PR #51 — Controller review

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-13
BALL: CHATGPT
STATUS: REVIEW
MODE: BUILD

## 結論

PR #51 / CODEX-13の返却をレビューした。

- prepare request lifecycleのfinite-lifetime BLOCKERは修正済みと判断する。
- deterministic evidenceはfocused 78/78、canonical 515/515、bundle 27/27 PASSとして返却され、実装差分もbounded retirement / recent exact replay / unresolved INTENT保持 / retired-token fail-closedの契約に整合している。
- Apps Script project / saved source / immutable version 75 / WEB_APP + `/exec` / execute-as / access / browser account / observed version-75 executionのidentity chainはpositive proof済み。
- 残BLOCKERは`private getInstallationStatus_`をGoogle Apps Script Execution API `scripts.run`で呼んだHTTP 403で、application runtime defectとは認定しない。

CONTROLLER_SOURCE_REVIEW: PASS
PREPARE_LIFECYCLE_BLOCKER: CLOSED
TARGET_RUNTIME_PRIMARY_FLOW: NOT_RUN
MERGE_READY: NO

## 403の分類

Google公式のApps Script API `scripts.run`は、scriptをAPI executableとしてdeployし、calling applicationとscriptが共通standard Google Cloud projectを使い、Apps Script API enablementとscriptが要求する全OAuth scopeを含むtokenを必要とする。`devMode:true`はownerだけが使用できる。

Work 0028のtargetは既存versioned Web Appであり、runtime qualificationのためにAPI executable / OAuth client / Cloud project権限面を追加する必要はない。Execution APIのpermissionを拡張して403を解消することは、Primary Outcomeを変えない追加surfaceでありYAGNI。

Repository policyも、setup/status/diagnostic private functionをnormal Web Appへ公開せず、editor/triggerまたはprivacy boundaryを維持する承認済みDEV経路で実行することを要求している。

したがって次の正式実行経路を確定する。

```text
private/operator control
  -> Apps Script editor
  -> installKnowledgeShare()
  -> checkKnowledgeShareReadiness()
  -> 必要時のみ confirmKnowledgeShareDeploymentSecurity()

normal business acceptance
  -> verified versioned WEB_APP /exec
  -> existing normal-user public facades
```

`getInstallationStatus_`をExecution APIまたは`google.script.run`から呼ばない。private functionへ到達するための新public qualification wrapperも作らない。

## CODEX-13 accepted source evidence

### Prepare lifecycle

PR branch implementationは`NEXT_BATCH_ID`由来のgenerationを使い、recent request recordをboundedに保持する。

Accepted properties:

- 160 completed batch継続。
- latest 32 requestはexact Batch/Document IDsへreplay。
- retired token / legacy unstored token / future generationは新規採番せずfail-closed。
- unresolved INTENTは自動削除しない。
- completed batch reservationはauthoritative Active/File_ID/File_URL readback後のみ整理。
- missing requestIdでidempotency guardを回避できない。
- unfinished batch backlogは32でbackpressureし、完了後に再開する。
- new DB/sheet/tombstone storeなし。

ControllerはGitHub source/test/report reviewを行った。Codexの78/78、515/515、27/27をChatGPTが再実行したとは扱わない。

### PR #51 production scope

引き続き以下をaccept候補として保持する。

- schema 7 / Pitchbook_Indexの4列append。
- Meeting-first parent binding。
- GP/non-GP parent context。
- stable Document_ID / file-link partial failure recovery。
- relation-only add/unlink/relink。
- Google Docs本文をrelation-only updateで再生成しない構造。
- new parent-bound Pitchbook retrieval eligibility。
- authoritative citation context revalidation。
- independent Meeting-only / non-AI Full Output。
- accepted Light production UI。

## Approved target-runtime path

次dispatch `0028-CODEX-14`ではsource repairを原則行わない。CODEX-13 frozen sourceをruntime qualificationする。

### Control plane

1. identity chainをfresh read-onlyで再確認。
2. exact reviewed modular sourceを同じApps Script projectのsaved sourceへ1回pushする。
3. Apps Script editorで`checkKnowledgeShareReadiness()`を実行する。
4. schema/setup action requiredの場合のみ同editorで`installKnowledgeShare()`を実行する。
5. 再度`checkKnowledgeShareReadiness()`を実行する。
6. deployment security confirmationがreadiness上必要な場合のみ、current WEB_APPが`USER_DEPLOYING / MYSELF`であることを再確認後、editorで`confirmKnowledgeShareDeploymentSecurity()`を実行する。
7. immutable versionを1つ作成し、positive proof済みexisting WEB_APP deploymentをそのversionへupdateする。deployment mutationは最大1回。
8. existing `/exec`を開き、新versionの実行を確認する。

No API executable creation. No OAuth consent/scope expansion. No GCP project変更。No second deployment。

### Business plane

versioned `/exec`の通常public facadeだけで、synthetic/anonymized primary flowを確認する。

- schema 7/readiness
- GP Meeting registration
- non-GP Meeting registration
- parent-first tiny file registration
- existing Meeting follow-up file
- unlink/relink
- stable Meeting/Document/File identities
- physical delete 0
- relation-only前後のauthoritative Meeting body exact equality
- parent/counterparty metadata readback
- independent Full Output preview/readback
- Gemini disabled state / shared-admin securityの非破壊

Provider API callは全て0。Azure provider File Search/citation live qualificationはWork 0030へDEFER。

## Mutation bounds

```text
source push: max 1
install/setup: max 1
immutable version create: max 1
deployment update: max 1
new deployment: 0
API executable deployment: 0
provider calls: 0
real confidential records: 0
```

最初のruntime failureで停止する。source defectが直接観測されない限りsourceを再修正しない。

## Completion gate

R1–R8がprovider-independent target runtimeでPASSし、source/bundle/deployed version continuity、synthetic side effects、existing security stateを確認できればPR #51をmerge候補とする。

Actual Azure OpenAI runtimeはWork 0030のAcceptance EvidenceでありWork 0028完了条件から除外する。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-13
BALL: CHATGPT
STATUS: REVIEW
