# CODEX-22 — R3 PASS / temporal readback repeated failure

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-22
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## 結果

R1・R2、およびversion2上のR3 initial attachment登録・metadata読み戻しはPASS。relation追加前後のauthoritative Docs body/tab content exact equalityも確認した。

その後「過去の記録」で入力時刻と表示時刻の不一致を観測し、自律修正を1件実施した。focused23/23、canonical523/523、bundle30/30 PASS後、既存targetへ同期1、新immutable version3を1件作成、同じsingle owner-only deploymentを1回更新した。しかしversion3でも同じtemporal readback failureが再発し、日付も前日に表示された。

**same failure classの連続2回（version2で初回観測→修正後version3で再観測）により契約どおりSTOP。version3は未認定かつ既知不具合あり。READYではない。** 追加source repair、再同期、version4、rollback、再deploymentは実施していない。R4/R5/R7とR6/R8の残項目はNOT RUN。完了扱いにはしない。

## Authority / Work Contract

- instruction: `origin/main:docs/handoffs/0028-CODEX-22-autonomous-completion-instruction.md`
- fetched main: `5eda05571f36189e5f30c6202ec87ac2b6b95f70`
- START_REMOTE_PR_HEAD: `985b9ad43ab290a5f9148922897ffb39651bac45`
- branch: `codex/0028-production-contract-build` / Draft PR #51。
- source repair commit: `6b1f180`
- exact generated artifact commit: `6363c6c27aeee55bcee701732b16cc507b44fdb5`
- Outcome: actual same versioned Web Appでprovider-independent R1-R8を完成。上限3 repair/qualification cycles。
- evidence hierarchy: actual Web App / authoritative persisted Workspace・deployment metadata > production-source deterministic tests > 推論。
- accepted installer/I2/versioned confirmation MATCH/security readinessは再実行していない。editor-context readinessはproduction gateにしていない。
- owner-only、synthetic only、provider0、AI disabled、physical delete0、new target0、second deployment0、historical75 mutation0、Work0030 deferred。
- main merge/rebase/resetなし。既存ignored evidence/historical worktreeは保存。

## Runtime evidence

### R1 / R2 — PASS on version2

read-only preflightでauthenticated principal、creator/owner、bound host/parent、single version2 deployment、USER_DEPLOYING/MYSELF、exec identity unchanged、saved/immutable source parityを確認した。

BackendはGP_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settingsのexactly5 sheets、SCHEMA_VERSION7、AI_SYNC_ENABLEDFALSE。

actual Web Appからsynthetic GP Meeting1件とnon-GP Meeting1件を親レコードとして保存。GPはseed masterを利用し、non-GP面談先は通常Option Masterフォームでsynthetic値を1件追加。Backendでdistinct stable Meeting_ID、Active、入力Date/Time、parent Type/IDを確認。本文はsynthetic qualification説明のみ。

### R3 — PASS on version2

ユーザーが指定の `0028-22-initial.txt`（97 B）を通常UIで選択。Codexが既存non-GP親の「未完了分を再試行」controlから登録した。保存済み親を照合する既存production pathであり、親Meetingを作り直していない。

- UI: 記録・資料の関連付け完了。
- Document_ID: `DOC-000001`、Status Active。
- parentは既存non-GP Meetingと一致、Counterparty_Type OTHER、Counterparty_ID一致、GP_ID空欄。
- Meeting relationに同じDocument_IDが存在、Meeting version1→2。
- file metadata readbackはtext/plain、97 B、非共有、実在。
- 原本文書bodyおよびtab contentはrelation追加前baselineとexact equality。
- Date/Timeおよび先頭business fieldsは不変。

これはversion2で実施したR3証拠。未認定version3のR1-R8完了へ転用しない。

### Native file-selection checkpointの訂正

browser filechooserイベント取得はsetFiles到達前にtimeoutした。ユーザー確認でfile-URL accessは以前から有効だったため、設定変更要求を撤回。permission errorは観測しておらず、browser tooling limitationと分類した。ブラウザー設定URLのpolicy blockを迂回していない。

最初に選択された別TXTはユーザーがtest用と確認したが、未送信タブの保持漏れで選択が失われた。その後元の97 B fixtureを再選択いただき、上記R3を完了した。別TXTのuploadは0。以後handoff tab保持を設定。native操作待ちをapplication repair失敗として数えていない。

## Cycle 1 — temporal readback repair and failed runtime requalification

### 初回観測 / version2

Backendのformatted valuesと入力はGPが2026-09-17 10:30、non-GPが2026-09-17 11:15。しかし検索UIではそれぞれ19:30、20:15と表示された。

Backend metadataのworkbook timezoneはEtc/GMT、manifest/script timezoneはAsia/Tokyo。productionの `kspReadObjectsFromSheet_` はDate/TimeセルのDate objectをそのまま返し、後段canonical helperはscript timezoneで解釈する。この境界差を単一の修正仮説にした。

### 最小source repair

`src/20_LiveEnvironment.gs` の共通Sheets read adapterだけを変更した。Date/Time列のDate objectをworkbook timezoneでformatし、既存canonical Business Date/Time helperへ渡す。その他の列・Instantはそのまま。物理セル、Spreadsheet timezone、Docs、provider、installer/security、normal UIは変更しない。

`tests/temporal-contract.test.cjs` にEtc/GMT / Asia/TokyoのDate/Time、文字列、Instant保持、入力array不変、search mappingの回帰テストを追加。

```text
FOCUSED_VALIDATION: PASS / 23_OF_23
CANONICAL_VALIDATION: PASS / npm run check / 523_OF_523
BUNDLE_VALIDATION: PASS / npm run check:bundle / 30_OF_30
DIFF_HYGIENE: PASS / git diff --check
```

### Release / version3

canonical buildで再生成。existing target sync1、saved source/manifest byte-exact readback、新version3 source/manifest byte-exact readback、same existing deployment update1を実施。

更新直後のlist metadata verificationはversion期待値と不一致となった。mutating operationを繰り返さずread-onlyで再読し、同じdeployment identity / version3 / WEB_APP / USER_DEPLOYING / MYSELF / same execを確認した。second deploymentなし。

### 再観測 / version3 — FAIL

updated actual execをreloadし同じ2件を検索した結果:

| record | authoritative formatted cells / 入力 | version2 UI | version3 UI |
|---|---|---|---|
| GP synthetic | 2026-09-17 10:30 | 2026-09-17 19:30 | 2026-09-16 02:30 |
| non-GP synthetic | 2026-09-17 11:15 | 2026-09-17 20:15 | 2026-09-16 03:15 |

source-level仮説とdeterministic mockがactual Apps Script/Sheets Date・timezone挙動を十分に再現していない。原因を「workbook timezoneで変換すれば解決」と確定できず、今回の修正はruntime不合格。実際のDate objectとformatterの挙動は次のcontroller判断で切り分ける必要がある。追加の推測修正は行っていない。

STOP後、bounded read-only検査でBackendのformatted Date/Timeは両件とも元の値のまま、non-GP business fieldsは不変、authoritative Docs body/tab contentもbaselineとexact equalityを確認した。表示不具合と物理data変更を混同しない。

## Completion matrix / side effects

```text
CYCLES_USED: 1_OF_3 / ONE_REPAIR_AND_REQUALIFICATION
CONSECUTIVE_SAME_FAILURE_CLASS: 2 / TEMPORAL_READBACK_MISMATCH
STOP_REASON: SAME_FAILURE_CLASS_TWICE
R1: PASS_VERSION2
R2: PASS_VERSION2 / GP_AND_NON_GP_PARENT_FIRST
R3: PASS_VERSION2 / INITIAL_ATTACHMENT_ONLY
R4: NOT_RUN
R5: NOT_RUN
R6: PARTIAL_PASS / INITIAL_RELATION_ADD_BODY_AND_BUSINESS_FIELDS_UNCHANGED / UNLINK_RELINK_NOT_RUN
R7: NOT_RUN
R8: PARTIAL / SINGLE_RESTRICTED_METADATA_PASS / FINAL_CAMPAIGN_NOT_COMPLETE
R1_R8: INCOMPLETE / FINAL_VERSION3_NOT_QUALIFIED
SOURCE_REPAIR_COUNT: 1
SOURCE_SYNC_COUNT: 1
NEW_VERSION_COUNT: 1 / VERSION3
EXISTING_DEPLOYMENT_UPDATE_COUNT: 1
SECOND_DEPLOYMENT_COUNT: 0
NEW_TARGET_COUNT: 0
PROVIDER_CALLS: DIRECT_OPENAI_0 / GEMINI_0 / AZURE_OPENAI_0
AI_SYNC: DISABLED / NO_ENABLE_ACTION
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
HISTORICAL_VERSION75_MUTATION: 0
WORK_0030: DEFERRED_BY_USER / NO_PREPARATION
SIDE_EFFECT_STATE: SYNTHETIC_MEETINGS_2 / SYNTHETIC_NON_GP_MASTER_1 / INITIAL_FILE_1 / INITIAL_RELATION_ADD_1 / SOURCE_SYNC_1 / VERSION3_CREATED / SAME_DEPLOYMENT_UPDATED
BLOCKER: REPEATED_TEMPORAL_READBACK_MISMATCH
READY: NO
READY_FOR_CHATGPT_FINAL_REVIEW: NO
```

保存済みsynthetic resourcesはそのまま保持。follow-up file、unlink/relink、Full Outputは未実行。既存installer/security結論は開き直していないが、version3のapplication readinessは不合格。PRはDraft、mergeなし。次cycleを無断で消費せずChatGPTのStrategy Resetへ返す。

## Skill / Shared Knowledge

frontend-testing-debuggingで実browser stateとdeterministic結果を区別し、後者のPASSでruntime failureを覆さなかった。Google Drive/Sheets/Docsはmetadata-grounded bounded readbackと本文equality検証に使用。

KNOWLEDGE_RETRIEVAL: PAT-0004
KNOWLEDGE_APPLIED: PAT-0004
NEW_KNOWLEDGE_CANDIDATE: YES

target identityとsource parityを別gateとして確認。候補はworkbook/script timezoneをまたぐDate/Timeの実runtime差異であり、今回の不合格修正を成功patternとして共有しない。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-22
BALL: CHATGPT
STATUS: RETURNED
