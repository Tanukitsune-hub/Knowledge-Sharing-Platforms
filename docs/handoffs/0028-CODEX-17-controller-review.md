# Work 0028 / CODEX-17 Controller Review

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: CHATGPT
STATUS: REVIEW
MODE: BUILD

## Review result

CODEX-17の停止判断は受入れる。

CODEX-16の外部状態はread-only回収により `NOT_STARTED_CONFIRMED` と確定し、CODEX-17でfinal architectureと同じsingle fresh container-bound targetを1件だけ作成した。accepted bundle / manifestのidentityを確認し、ユーザーOAuth後に初回 `installKnowledgeShare()` を1回実行した。

Observed target-runtime evidence:

```text
CODEX16_RECOVERY_STATE: NOT_STARTED_CONFIRMED
TARGET_CREATED: 1
SOURCE_INSTALL: 1
INSTALLER_I1_EXECUTION: 1
INSTALLER_EXECUTION_HISTORY: COMPLETED
INSTALLATION_STATUS_SHEET: ABSENT
BACKEND_AND_INSTALLER_RESOURCES: ABSENT
SCRIPT_PROPERTIES_AFTER_I1: EMPTY
TRIGGERS: 0
QUALIFICATION_WEB_APP: 0
TARGET_RUNTIME_R1_R8: NOT_RUN
PROVIDER_CALLS: 0
READY: NO
```

初回installerが正常終了条件 `READY_FOR_DEPLOYMENT` を満たさなかったため、I2、deployment、R1-R8、同run修正を実施せず停止したことは正しい。

## Diagnostic finding

これは現時点でWork 0028のBLOCKERであるが、R1-R8 product flowまで到達していないため、Meeting / file / Full Output等のproduction contract defectとはまだ判定しない。

Source reviewでは、`installKnowledgeShare()` は `kspRunInstaller_(kspCreateInstallerEnvironment_())` を返すだけである。installerの最初のauthorization / identity gateは例外をcatchして `ACTION_REQUIRED` status objectをreturnするが、このearly returnではinstallation status sheetへstatusをpersistしない。したがってApps Script editorのExecution Historyが「完了」でも、authorization gateでfail-closedした場合はresource / status sheetが一切作成されない挙動と整合する。

またlive installer environmentは、`Session.getActiveUser().getEmail()` / `Session.getEffectiveUser().getEmail()` の例外を空文字へ変換する。現在のexplicit `dist/appsscript.json` OAuth scopesには `https://www.googleapis.com/auth/userinfo.email` がない。

Google公式のApps Script scope仕様では、explicit `oauthScopes`を使用する場合は必要scopeをmanifestへ列挙し、`https://www.googleapis.com/auth/userinfo.email` はGoogle Accountのemail addressを読むscopeとして定義される。

したがって次DispatchのActive Hypothesisは次の1つに固定する。

```text
ACTIVE_HYPOTHESIS:
explicit manifestにuserinfo.email scopeがないため、fresh bound editor executionでinstaller identityを取得できず、initial authorization gateがside-effect前にfail-closedした。
```

これは強い仮説だが、CODEX-17ではreturned safe error codeを直接観測していないため、root cause確定とはしない。

## Strategy Reset / next decisive action

新targetは作らない。CODEX-17で保持したexact fresh bound targetを継続利用する。

CODEX-18では、まずmanifestのcanonical source/generatorとinstaller early authorization pathを限定レビューし、上記仮説を最小変更で修復・検証する。

Authorized repair boundary:

1. canonical manifest sourceへ `https://www.googleapis.com/auth/userinfo.email` を必要scopeとして追加し、generated distributionを再生成する。
2. installer early authorization rejectionを、email / account / private IDsを残さずsafe error code/stateだけ観測できる最小runtime observabilityを追加する。verified identity前のfail-closed / no-mutation security boundaryは弱めない。
3. blank/ambiguous identityの既存fail-closed semanticsを維持するregression testと、required identity scopeがdistribution manifestに存在するtestを追加する。
4. source change後はfocused test -> canonical `npm run check` -> bundle/parity -> `git diff --check` を実行する。
5. accepted CODEX-17 targetへrepaired exact source/manifestを1回だけ同期する。
6. scope追加でGoogle consentが必要なら同Dispatchの `BALL: USER / ACTION_REQUIRED` とし、ユーザー操作後に同Dispatchで再開する。
7. repaired I1は1回だけ。成功した場合のみI2 idempotencyを1回、qualification WEB_APPを最大1件、security/readiness、R1-R8へ進む。
8. repaired I1が同じ無出力または別failureで停止した場合は、追加repair/retryをせずChatGPTへ返す。

## Preserved evidence

以下は反証がない限り再実施しない。

- PR #50 Light design accepted/merged
- PR #51 provider-independent production direction
- schema7 / Pitchbook append contract
- prepare lifecycle blocker CLOSED
- focused 78/78 PASS
- canonical 515/515 PASS
- bundle 27/27 PASS
- CODEX-17 target identity and source-install evidence
- historical standalone version75 strategy SUPERSEDED

## Provider / Azure boundary

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
AI sync: disabled
WORK_0030: DEFERRED_BY_USER
```

Azure OpenAIはWork 0028の完了条件に含めない。

## Controller decision

```text
CODEX17_STOP: ACCEPTED
APPLICATION_DEFECT: LIKELY_INSTALLER_IDENTITY_SCOPE_PATH / NOT_YET_CONFIRMED
R1_R8_PRODUCT_DEFECT: NOT_ESTABLISHED
SOURCE_REPAIR_REQUIRED: YES / BOUNDED
REUSE_EXISTING_TARGET: YES
NEW_TARGET_AUTHORIZED: NO
NEXT_DISPATCH: 0028-CODEX-18
MERGE_READY: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: NONE
STATUS: ACCEPTED
