# Work 0070 CODEX-03 — isolated target-runtime qualification 中間報告

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: USER
STATUS: ACTION_REQUIRED
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH

## 結果と停止点

OAuth承認後、同じ個人所有の隔離targetをread-onlyで再確認してから、schema8 baseline installerを1回実行した。Apps Scriptの実行ログは`READY_FOR_DEPLOYMENT / NONE`と正常終了を示した。実際のBackendは5シート、`SCHEMA_VERSION=8`、`APP_VERSION=0.1.2`、`AI_SYNC_ENABLED=FALSE`である。baseline immutable version 1を作成し、owner-only / execute-as-ownerのversioned Web Appを1件作成した。

Web Appの通常画面からsynthetic Counterpartyを2件、Meetingを1件登録した。Meetingのstable ID、Index row、Google Docの本文、AuditのTarget / Result / ActorをWorkspace readbackで確認した。

移行前fixtureに必須の親付きPitchbook用TXTを添付する際、Chrome browser automationのfile chooser取得がbutton pathと実際の`input[type=file]` pathの両方でtimeoutし、接続が外れた。Web Appのupload failureやapplication defectは観測していない。native file selectionが必要なため、同じDispatch IDを`BALL: USER / STATUS: ACTION_REQUIRED`として停止する。Pitchbook未作成のままschema9へ進めるとmigration preservation evidenceを失うため、candidate source sync、migration、後続matrixは実施していない。

本人から最初の「選択したよ」返信後に隔離Backendをread-only照合したが、`Pitchbook_Index`はheaderのみでrow 0だった。その時Chromeに残っていたWeb Appタブは今回の隔離deploymentとは別のURLであり、そのタブの内容やデータは触っていない。Apps Script editorのowner-only deployment導線から正しい隔離Web Appを開き直し、`過去の記録`の`MTG-000001`詳細で`親記録: MTG-000001`の資料追加欄を表示した。現在、その欄のupload buttonはfile未選択でdisabledである。正しいタブでのnative選択を待つ。

## Work contract / evidence hierarchy

- MODE: `QUALIFICATION`。Work0069 / Work0070のClosed DecisionsとCODEX-02の受入れ済みsourceは変更しない。
- Outcome: exact candidateのschema8→schema9 migration、4-source persistence、browser、concurrency、Auditをactual targetで観測する。
- Evidence: Workspace persisted state / native browser、Apps Script project・deployment readback、CODEX-02 deterministic evidenceの順。
- Boundary: 個人所有のsynthetic resourceのみ。会社production、provider、billing、credential設定、AI indexing、physical deleteは行わない。
- Reset condition: target identity不一致、material application/data-integrity defect、stateful mutationの失敗。今回はbrowser file pickerのautomation制約で停止した。

## PRとsource identity

| 項目 | 結果 |
|---|---|
| PR_RECONCILED_WITH_MAIN | PASS — original normal mergeで`origin/main`を取込み、後続のcontroller-side dispatch-only更新はdocs-only commitで整合。production source conflict 0 |
| PR_MERGEABLE | PASS — PR #103 `MERGEABLE`、local content conflict 0 |
| QUALIFIED_HEAD | `06f55ebe7a72a206ac3ea4d171822deef81a6abc`。このHEADのproduction sourceは受入れ済みCODEX-02候補`2e31ae723dcb562a6de46703283fea86f3907260`から不変。**candidate runtime qualificationは未実施** |
| TARGET_RUNTIME_IDENTITY | PRIVATE / NOT_REPORTED。script owner、bound host owner、親関係、専用fixture folderを照合。private ID、URL、account identifierは記録しない |
| Baseline source | pre-Work0070 `ebfd13b3b2b7b806a0da17956d95b6c7b3ff3c62`のrelease 0.1.2 / schema8。remote sourceとimmutable version 1の`Code.gs`がlocal baselineに一致 |
| Deployment | version 1を指す1件のversioned `WEB_APP`、URLは`/exec`、`MYSELF`、`USER_DEPLOYING`をAPIとEditor UIでreadback。platform-created unversioned metadataはversioned releaseに数えない |

## Baseline Workspace readback

- Backendは`Counterparty_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settings`の5シートのみ。
- Settingsは`SCHEMA_VERSION=8`、`APP_VERSION=0.1.2`、`AI_SYNC_ENABLED=FALSE`、`GEMINI_ENABLED=FALSE`、`OPENAI_ENABLED=FALSE`。root、子folder、Backend、Auditのresource参照は専用隔離resourceと一致した。Settingsの`ENVIRONMENT=PROD`はbaseline定数の文字列であり、実resourceは個人所有の隔離fixtureである。
- Root `Private Assets Knowledge`の直下は`Meeting Records`と`Pitchbooks`のみ。各IDはprivate operator mapに保持した。
- Web Appからsynthetic Entity A/Bを登録。Meeting `MTG-000001`のIndex row 2はActive / Version 1、Entity A、PE、Google Doc File IDあり。Doc本文に期待したsynthetic文が存在し、ID・row・Doc IDはprivate operator mapへ記録した。
- Restricted AuditはEntity 2件の追加とMeeting 1件の作成を`Success`として記録。Meeting Targetは`MTG-000001`、Actor分類は`EMAIL`。reportに識別子を記載しない。
- provider call、AI indexing callは各0。会社dataとconfidential contentは使用していない。

## Acceptance matrix

`NOT RUN`は合格扱いしない。

| Field | State |
|---|---|
| BASELINE_SCHEMA8 | PASS — installer実行とpersisted Settings readback |
| BASELINE_5_SHEETS | PASS — Workspace metadataでexact 5 |
| MIGRATION_SCHEMA9 | NOT RUN |
| BACKEND_7_SHEETS | NOT RUN |
| LEGACY_ROOT_SAME_ID_RENAME | NOT RUN |
| LEGACY_MEETING_FOLDER_SAME_ID_RENAME | NOT RUN |
| LEGACY_PITCHBOOK_FOLDER_SAME_ID_RENAME | NOT RUN |
| NEWS_FOLDER_CREATED | NOT RUN |
| ASSESSMENT_FOLDER_CREATED | NOT RUN |
| MIGRATION_EXISTING_MEETING_PRESERVED | NOT RUN |
| MIGRATION_EXISTING_PITCHBOOK_PRESERVED | NOT RUN — baseline親付きPitchbook未作成 |
| SECOND_SETUP_IDEMPOTENT | NOT RUN |
| CUSTOM_NAME_PRESERVED | NOT RUN |
| PRODUCT_TITLE | NOT RUN — candidate Web App未配置 |
| ADD_4_TABS | NOT RUN |
| PAST_4_TABS | NOT RUN |
| BROWSER_DESKTOP | BASELINE only。candidate NOT RUN |
| BROWSER_390 | NOT RUN |
| UPLOAD_ACCEPT_REAL | baseline inputの`accept=.pdf,.pptx,.xlsx,.docx,.txt,.eml`をDOM確認。candidate NOT RUN |
| STANDALONE_ASSET_REQUIRED | NOT RUN |
| STANDALONE_PITCHBOOK | NOT RUN |
| NEWS_DIRECT | NOT RUN |
| NEWS_UPLOAD | NOT RUN |
| NEWS_MULTI_ENTITY | NOT RUN |
| NEWS_EDIT_LIFECYCLE | NOT RUN |
| ASSESSMENT_DIRECT | NOT RUN |
| ASSESSMENT_UPLOAD | NOT RUN |
| ASSESSMENT_EDIT_LIFECYCLE | NOT RUN |
| CONCURRENT_DISTINCT_CREATE | NOT RUN |
| STALE_EDIT_REJECTED | NOT RUN |
| CROSS_SESSION_INPUT_BLEED | NOT RUN |
| AUDIT_TARGET_TRACE | baseline Entity / Meeting PASS、4-source matrix NOT RUN |
| AUDIT_ACTOR_CLASS | baseline `EMAIL`、4-source matrix NOT RUN |
| AI_SYNC | `FALSE` persisted baseline。migration後はNOT RUN |
| PROVIDER_CALL_COUNT | 0 |
| AI_INDEX_CALL_COUNT | 0 |
| TRIGGER_STATE | baseline setup後の最終readbackはNOT RUN。AI triggerは意図的に作成していない |
| COMPANY_DATA_MUTATION_COUNT | 0 |
| CONFIDENTIAL_DATA_COUNT | 0 |
| PHYSICAL_DELETE_COUNT | 0 |
| LOGIC_VALIDATION | CODEX-02 716/716受入れ済み。今回source変更なし、全面再実行なし |
| TARGET_RUNTIME_QUALIFICATION | PARTIAL — schema8 baseline PASS、schema9 candidate NOT RUN |
| SIDE_EFFECT_STATE | TEST_ONLY: fixture folder、bound host、script、baseline setup/control resources、synthetic Counterparty 2件とMeeting 1件。未使用hostは可逆的にTrash。candidate sync/version/update 0 |
| BLOCKER | browser automationがnative file chooserを取得できない。親付きsynthetic PitchbookのTXT選択待ち。application defectは未観測 |
| FOLLOW_UP | 同じDispatchでnative selection後、Pitchbook保存・readbackを完了してからcandidate migrationへ進む |
| READY | NO |

## Mutation budget

| 操作 | 使用 / 上限 |
|---|---:|
| normal merge | 1 / 1 |
| new isolated Apps Script target | 1 / 1 |
| baseline source sync | 1 / 1 |
| candidate source sync | 0 / 1 |
| immutable versions | 1 / 2 |
| owner-only versioned Web App deployment | 1 / 1 |
| existing deployment update | 0 / 1 |
| baseline setup | 1 / 1 |
| migration / idempotency / custom-name setup | 0 / 各1 |
| synthetic source records | Meeting 1 / 目安8 |
| concurrency distinct-create pair | 0 / 1 |
| same-record stale-edit scenario | 0 / 1 |

## 再開に必要なnative操作

新たに開いた正しい隔離Web Appの`過去の記録`で、`MTG-000001`詳細の`親記録: MTG-000001`と表示される資料追加欄が待機している。本人が`添付資料を選択`を押し、local private operator folderの`synthetic-pitchbook.txt`を選択する。**選択だけ**行い、登録や再読込はしない。画面をそのまま残して「隔離タブで選択完了」と返信する。その後Codexがupload completion、`Pitchbook_Index`、Drive fileとparent relationをreadbackする。同じtarget・branch・Dispatch IDを使い、source syncやsetupを再試行しない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004, RULE-0002, PAT-0002
KNOWLEDGE_APPLIED: PAT-0004, RULE-0002, PAT-0002
NEW_KNOWLEDGE_CANDIDATE: YES — Apps Script bound host identityとChrome file picker制約を別々に検証する必要がある

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: USER
STATUS: ACTION_REQUIRED
