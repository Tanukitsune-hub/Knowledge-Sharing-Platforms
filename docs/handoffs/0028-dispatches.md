# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-22
ACTIVE_DISPATCH_ID: 0028-CODEX-22
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
PHASE: B1.1 / PRODUCTION CONTRACT BUILD + TARGET RUNTIME QUALIFICATION

## Current state

CODEX-22返却: version2でR1/R2/R3 initial attachment PASS、relation追加前後のDocs本文/Date/Time不変。検索UIのtemporal mismatchに対しSheets read adapterを最小修正、focused23/canonical523/bundle30 PASS。sync1/version3作成1/same owner-only deployment update1後も同じfailureが再発し、日付も前日表示となった。same failure class連続2回でSTOP。version3は既知不具合あり・未認定、R4/R5/R7およびR6/R8残項目NOT RUN、READY NO。物理セルとDocsはread-onlyで不変確認。詳細: `0028-CODEX-22-autonomous-completion-report.md`。追加repair/deployment/rollbackなし、ChatGPTのStrategy Resetへ返す。以下USER checkpointは履歴。

CODEX-22再開時訂正: file-URL permissionはユーザー確認により既に有効。設定変更要求を撤回。文書化された通常click/filechooser待受でもsetFiles前にtimeoutし、native file選択のみUSER actionとして依頼。application repairではなくbrowser tooling limitation、Cycle1継続。既存non-GP親と本文baselineは保持。

CODEX-22中間checkpoint: Cycle1でR1/R2 PASS。既存version2 owner-only targetにsynthetic GP/non-GP Meeting各1、non-GP master1を作成。R6本文baseline取得済み。R3のbrowser file chooser取得timeout、upload設定確認先がbrowser policyでblockedのためUSER native file-upload設定待ち。uploaded files0、source repair/sync/version/update0。R3から同Dispatchを再開、親再作成不要。詳細: `0028-CODEX-22-autonomous-completion-report.md`。CODEX-21のversioned security readinessはmain controller reviewでACCEPTED、editor-context readinessを再gateにしない。

CODEX-21返却: 最小unlinked operator confirmation surfaceを追加、522 tests/bundle30 tests PASS。同じtargetへ同期1、version2作成1、同じsingle owner-only deployment更新1。通常UI confirmation1でREADY/NONE、独立attestation対authoritative exec比較MATCH。その後native editorからreadiness1を実行しACTION_REQUIRED/DEPLOYMENT_SECURITY_ATTESTATION_STALEとなったためSTOP。versioned-context readinessは未実行であり、MATCH再発失敗とは扱わない。R1-R8 NOT RUN、追加repair/sync/version/update/confirmationなし。詳細: `0028-CODEX-21-versioned-admin-confirmation-surface-report.md`。final review/merge/Completion LatchはChatGPTへ委ねる。

CODEX-20返却: existing target / single owner-only version1 / saved and immutable source parityをread-only確認。browser harnessのpage evaluationはread-onlyであり、書き込みを伴うgoogle.script.run confirmationを実行できる許可された経路がないためAUTOMATION_TOOLING_LIMITATIONでSTOP。confirmation0、exec render/hash再比較/post-readiness/R1-R8はNOT RUN。MISMATCH再発やapplication failureではない。source/sync/version/deployment mutation0。詳細: `0028-CODEX-20-versioned-runtime-attestation-qualification-report.md`。mainとのcontrol-doc収束はChatGPTへ委ねる。

CODEX-19返却: stage分離修正・518 tests・bundle30 tests PASS。既存targetへの同期1、installer/I2 rerun1でREADY_FOR_DEPLOYMENT、duplicate0、Backend5 sheets/schema7/AI sync FALSE/trigger0。owner-only version1 WEB_APPを1件作成しauthoritative metadataを確認。pre-attestation readinessは期待どおりACTION_REQUIRED。confirmation1回後、保存attestationと実versioned execのprivate hash比較がMISMATCHとなり即STOP。post-readinessとR1-R8はNOT RUN。詳細: `0028-CODEX-19-installer-deployment-stage-repair-report.md`。source再修正・second deploymentなし。mainとのcontrol-doc最終収束はChatGPTへ委ねる。

CODEX-18返却: minimum scope/safe log修正、517 tests、bundle/parity 29 tests、既存CODEX-17 bound targetへの1回同期とremote exact readbackを完了。OAuth後にrepaired I1は自動継続して1回完了。identity/setupは通過したが `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED` でREADY_FOR_DEPLOYMENT未達のためSTOP。versioned deployment 0、I2/R1-R8 NOT RUN、追加repair/retryなし。Backend5 sheets/schema7、AI sync FALSE、trigger0。詳細: `0028-CODEX-18-installer-identity-scope-repair-report.md`。以下の旧branch記録は履歴として保持し、mainのcontroller履歴との最終収束はChatGPTへ委ねる。

CODEX-12はproduction sourceとgenerated bundleを返却。`npm run check` 512/512、bundle 27/27、local browser renderingはPASS。runtime preflightの自動選択条件がHEAD/旧版を含む複数WEB_APPで停止し、stop-on-first-failureを適用。既取得metadataではversion 75のWEB_APP + `/exec`は一意だが、remote source/browser identity以降はNOT RUN。source push・version/deployment mutationは0。詳細: `0028-CODEX-12-production-contract-build-report.md`。Workは未完了、source凍結、次はChatGPT reviewとbounded runtime qualification。

ユーザーがPR #50のLight案を現時点のproduction baselineとして受け入れ、細部は後続で詰める方針を明示した。PR #50はmainへsquash merge済み。

- merged PR: #50
- merge commit: `98bd1f233a5a462c55a9a3f9e4bc0dda6c705067`
- design acceptance / Strategy Reset: `docs/handoffs/0028-design-acceptance-and-build-reset.md`
- CODEX-12 instruction: `docs/handoffs/0028-CODEX-12-production-contract-build-instruction.md`
- prepared branch: `codex/0028-production-contract-build`

INVESTIGATION/design-only phaseは受入れ済みとして閉じ、production codeへ反映して裏側contractをtarget runtimeで検証するBUILDへ移行する。

## Primary Outcome

確定Light UIの主要フローが、既存データを破壊せず次のend-to-end契約で動くこと。

1. Meeting commit後にauthoritative `Meeting_ID`を発行。
2. 保存済みActive Meetingだけをparentとして資料登録。
3. GP以外のCounterpartyでも資料registration / metadata / retrieval / citation contextを保持。
4. file保存とrelationship確定を分離し、部分失敗を同じIDで安全に回復。
5. 既存Meetingへ後日資料追加、`削除`はunlink。
6. relation-only mutationでMeeting Google Docs本文を変更しない。
7. Knowledge Searchとdedicated Meeting-only / non-AI `全文出力`を新UI contractへ整合。
8. Work 0027 Gemini hidden/qualified-disabledとWork 0029 shared-adminを保持。

## Accepted design conclusions

- Light only。Dark/System/theme selectorなし。
- sidebar 7、`#182124`、active `#E1001F` left strip、metallic gold、紗綾形。
- `記録を追加`: 単一Meeting form。資料tab / record type / Data Receipt専用UI / standalone資料登録なし。
- `過去の記録`: 単一Meeting list/detail。本文・属性・原本・編集・記録削除/復元・関連資料操作を集約。
- related file `削除`はcurrent Meetingからのunlink。Pitchbook全体Inactive/physical deleteとは別。
- Knowledge Search: `面談先 / 情報ソース / 開始日 / 終了日 / 全期間` -> `検索モード / AIモデル` -> wide `質問`。
- `情報ソース`: `面談記録・資料 / 面談記録のみ / 資料のみ`。
- `全文出力`: dedicated action、Meeting-only / non-AI、Docs全文 + Meeting business attributes。
- 面談実績の承認済み9列、面談先サマリーのGP/Entity read facade、admin preset/shared-adminを保持。

## BUILD authorization boundary

許可:
- production `src/**`
- required tests
- exact-source regenerated `dist/**`
- required docs/report
- synthetic/anonymized isolated target-runtime qualification

未許可:
- real confidential data
- broad user rollout / access expansion
- destructive migration / physical delete
- secret rotation
- Gemini enablement
- Dark/System
- new DB/sheet/relationship model
- historical orphan bulk migration/auto-parent inference

Apps Script version/deploymentが必要な場合は`docs/operations/apps-script-web-app-deployment.md`に従う。identity chainを先に固定し、既存deploymentの`WEB_APP` + `/exec`をpositive proofする。ambiguous/Libraryへmutationしない。deployment mutationは本dispatch最大1回、stop-on-first-failure。

## Evidence hierarchy

1. target Apps Script / Workspace authoritative readback
2. versioned Web App actual browser behavior
3. exact remote source / bundle parity
4. repository deterministic tests
5. inference

## Bounds / reset

- implementation + focused repair: maximum 2 rounds
- deployment mutation: maximum 1
- same failure repeat / identity mismatch / architecture or migration expansion / data-integrity contradiction -> Strategy Reset
- only BLOCKER stops completion

## Dispatch history

| Dispatch | Disposition |
|---|---|
| 0028-CODEX-01 / 02 | Historical tombstone; never reuse |
| 0028-CODEX-03 | PR #40 / RETURNED PARTIAL |
| 0028-CODEX-04 | PR #41 / RETURNED |
| 0028-CODEX-05 | PR #42 / RETURNED |
| 0028-CODEX-06 | PR #43 / RETURNED |
| 0028-CODEX-07 | PR #44 / RETURNED |
| 0028-CODEX-08 | PR #45 / RETURNED / controller PASS |
| 0028-CODEX-09 | PR #46 / RETURNED / controller PASS |
| 0028-CODEX-10 | PR #47/#48/#49返却履歴。consumed |
| 0028-CODEX-11 | PR #50 / RETURNED -> controller scoped repair -> user accepted -> merged |
| 0028-CODEX-12 | Draft PR #51 / RETURNED PARTIAL / deterministic PASS・runtime BLOCKED |

## Next gate

CODEX-12がproduction implementation、tests、bundle parity、target-runtime synthetic evidenceをDraft PRとreportで返す。ChatGPTがfinal diff/runtime evidenceをreviewする。主要acceptance達成後にCompletion Latchを適用する。Broad deployment/rolloutは別gate。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
DESIGN_MERGE_SHA: 98bd1f233a5a462c55a9a3f9e4bc0dda6c705067
USER_LIGHT_ACCEPTANCE: ACCEPTED_WITH_FOLLOW_UP_POLISH
MODE: BUILD
ACTIVE_DISPATCH: 0028-CODEX-12
BALL: CHATGPT
STATUS: RETURNED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: YES
TARGET_RUNTIME_SYNTHETIC_QUALIFICATION_AUTHORIZED: YES
REAL_DATA_ROLLOUT_AUTHORIZED: NO
BROAD_DEPLOYMENT_AUTHORIZED: NO
NEXT_UNUSED_DISPATCH: 0028-CODEX-13
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-12
BALL: CHATGPT
STATUS: RETURNED
