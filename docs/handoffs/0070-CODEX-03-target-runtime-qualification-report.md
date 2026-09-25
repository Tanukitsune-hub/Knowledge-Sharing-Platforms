# Work 0070 CODEX-03 — isolated target-runtime qualification 中間報告

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: USER
STATUS: ACTION_REQUIRED
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH

## Outcome / stop point

個人所有の隔離Apps Script / Workspace / owner-only Web Appでschema8 baselineを作り、synthetic Meetingと親付きPitchbookを保存した。受入れ済みcandidateを同一projectへ配置し、schema9 migrationを1回実行した。7-sheet Backend、旧folderの同一ID名称変更、既存2 recordの保持、2回目setupの冪等性、custom-name preservationをpersisted readbackで確認した。単一owner-only Web Appをimmutable version 1から2へ1回更新し、source parityとaccess boundaryをreadbackした。

Newsと評価のDIRECT_TEXTを通常Web Appから各1件保存し、本文・metadata・multi-Entity・Past/detail・編集・Inactive→Reactivate・Auditを確認した。いずれもstable source ID / Doc file IDを維持し、Versionは1→2→3→4と進んだ。Add/Pastの4 tab、title/header、shared input propagation、News保存後にNews固有入力のみclearされ評価tab未保存titleが残ることも確認した。

次はstandalone資料とNews/評価のUPLOAD_FILE。Chromeのfile chooserをagentが取得する経路で元タブの接続が切れたため、本人のnative file selectionを待っている。最初のstandalone TXT選択は元タブで行われたが、接続を復旧できず選択名を読めなかった。新しい同一隔離Web Appタブでstandaloneフォームの日付とsynthetic面談先を入力済み。そこでのファイル選択を依頼中。standalone保存はまだ行っていない。application upload defectは未観測。

## Contract and identity

- MODE: QUALIFICATION。Closed DecisionsとCODEX-02 sourceを変更しない。
- Evidence hierarchy: actual persisted Workspace / browser、Apps Script source/deployment readback、CODEX-02 deterministic evidence。
- Isolation: 個人所有synthetic fixtureのみ。会社production、real confidential data、provider、AI indexing、billing、broad access、physical deleteは0。
- PR_RECONCILED_WITH_MAIN: PASS — normal merge 1回、production source conflict 0。後続controller docs-only更新も取込み。
- PR_MERGEABLE: PASS — Draft PR #103はcontent conflictなし。
- QUALIFIED_HEAD: reconciled candidate `06f55ebe7a72a206ac3ea4d171822deef81a6abc`のproduction source。後続commitはdocs-onlyでsource不変。
- TARGET_RUNTIME_IDENTITY: PRIVATE / NOT_REPORTED。script/host owner、bound relation、隔離folder、owner-only deploymentを確認。private ID / URL / account identifierはlocal private operator mapのみ。
- Deployment: baseline release 0.1.2/schema8を1回syncしてversion 1。candidate release 0.2.0/schema9を1回syncしてversion 2。同一versioned Web Appを1回更新。remote source / immutable version / local bundleの一致をreadback。accessは`WEB_APP / MYSELF / USER_DEPLOYING / /exec`を維持。

## Migration and record evidence

- Baseline: exact 5 sheets、schema8、release 0.1.2、AI sync false。通常Web Appでsynthetic Counterparty 2件、Meeting 1件、親付きPitchbook TXT 1件を作成。Index row / Doc本文 / Drive file / parent relationをreadback。
- Migration: schema9、release 0.2.0、exact 7 sheets。root、Meeting、Pitchbook folderはそれぞれ同じIDで`記録・資料 / 面談記録 / 保存資料`へrename。新規`ニュース / 評価（ICメモ、社内整理等）`を同じroot直下に作成。exact 4 child、重複なし。Meeting/PitchbookのID、row、Doc/File ID、Status、relationを保持、本文/fileも読取可能。
- Idempotency: second setup 1回でresource/counter/source row不変、setup時刻のみ更新。新News childをsynthetic custom nameへ変更後のsetupも1回で同じID/名前を保持し、canonical重複なし。test-onlyで同じIDを用いて元の名前へ復元。
- News DIRECT_TEXT: synthetic面談先2件をcanonical sorted unique ID listとして保持。1 authoritative Doc、News folder、source URL、本文、Past/detailを確認。metadata/body editとInactive→Reactivateで同じsource/Doc IDを維持。
- 評価 DIRECT_TEXT: stable Assessment Type code / 日本語label、synthetic Meeting/News relation、1 authoritative Doc、評価folder、本文、Past/detailを確認。editとInactive→Reactivateで同じsource/Doc IDを維持。
- Restricted Audit: 代表的なEntity/Meeting/Pitchbook/News/評価 mutation計13件がSuccess、target対応、Actor分類`EMAIL`、source本文複製なし。

## Acceptance matrix

`NOT RUN`は合格扱いしない。

| Field | State |
|---|---|
| BASELINE_SCHEMA8 / BASELINE_5_SHEETS | PASS — persisted Settings / exact 5 sheets |
| MIGRATION_SCHEMA9 / BACKEND_7_SHEETS | PASS — persisted Settings / exact 7 sheets |
| LEGACY_ROOT_SAME_ID_RENAME | PASS — same ID, 記録・資料 |
| LEGACY_MEETING_FOLDER_SAME_ID_RENAME | PASS — same ID, 面談記録 |
| LEGACY_PITCHBOOK_FOLDER_SAME_ID_RENAME | PASS — same ID, 保存資料 |
| NEWS_FOLDER_CREATED / ASSESSMENT_FOLDER_CREATED | PASS — same root, exact 4 children |
| MIGRATION_EXISTING_MEETING_PRESERVED | PASS — row / Doc / body / status |
| MIGRATION_EXISTING_PITCHBOOK_PRESERVED | PASS — row / File / relation / bytes |
| SECOND_SETUP_IDEMPOTENT / CUSTOM_NAME_PRESERVED | PASS — resources/counters/rows stable、custom name保持 |
| PRODUCT_TITLE / ADD_4_TABS / PAST_4_TABS | PASS — actual candidate Web App |
| BROWSER_DESKTOP | PASS — candidate 4-tabと代表News/評価flow、material visual issueなし |
| BROWSER_390 | NOT RUN |
| UPLOAD_ACCEPT_REAL | PASS — candidate DOMのfile accept = .pdf,.pptx,.xlsx,.docx,.txt,.eml |
| STANDALONE_ASSET_REQUIRED / STANDALONE_PITCHBOOK | NOT RUN — new tabでnative selection待ち |
| NEWS_DIRECT / NEWS_MULTI_ENTITY / NEWS_EDIT_LIFECYCLE | PASS — browser、Index/Doc/Version |
| NEWS_UPLOAD | NOT RUN — native selection待ち |
| ASSESSMENT_DIRECT / ASSESSMENT_EDIT_LIFECYCLE | PASS — browser、Index/Doc/Version |
| ASSESSMENT_UPLOAD | NOT RUN — native selection待ち |
| CONCURRENT_DISTINCT_CREATE / STALE_EDIT_REJECTED | NOT RUN |
| CROSS_SESSION_INPUT_BLEED | PARTIAL — tab内shared/source-specific分離PASS。独立session/reload/global clear NOT RUN |
| AUDIT_TARGET_TRACE / AUDIT_ACTOR_CLASS | PASS — 13 Success、Actor分類EMAIL、本文複製なし |
| AI_SYNC | FALSE — migration後persisted Settings |
| PROVIDER_CALL_COUNT / AI_INDEX_CALL_COUNT | 0 / 0 |
| TRIGGER_STATE | NOT RUN — final readback待ち |
| COMPANY_DATA_MUTATION_COUNT / CONFIDENTIAL_DATA_COUNT / PHYSICAL_DELETE_COUNT | 0 / 0 / 0 |
| LOGIC_VALIDATION | CODEX-02 716/716 accepted。今回source変更なし、全面再実行なし |
| TARGET_RUNTIME_QUALIFICATION | PARTIAL — migration/DIRECT_TEXT PASS、UPLOAD/concurrency/390等NOT RUN |
| SIDE_EFFECT_STATE | TEST_ONLY — isolated fixtures/resourcesとsynthetic records。provider側変更なし |
| BLOCKER | browser file chooser automation制約によるnative selection待ち。application defect未観測 |
| FOLLOW_UP | 同じDispatchでstandalone、News/評価upload、concurrency、browser残項目、trigger readback |
| READY | NO |

## Mutation budget

| Operation | Used / Max |
|---|---:|
| normal merge | 1 / 1 |
| new isolated target | 1 / 1 |
| baseline / candidate source sync | 各1 / 1 |
| immutable versions | 2 / 2 |
| owner-only deployment / existing update | 各1 / 1 |
| baseline / migration / idempotency / custom-name setup | 各1 / 1 |
| synthetic source records | 4 / 目安8（Meeting、親付きPitchbook、News DIRECT、評価 DIRECT） |
| concurrent distinct-create pair | 0 / 1 |
| same-record stale edit scenario | 0 / 1 |

## Native step to resume

新しく開いた隔離Web Appの`記録を追加 > 資料保存`で、日付とsynthetic面談先は入力済み、アセットクラスは未選択。本人が`添付資料を選択`からlocal private operator folderの`synthetic-standalone.txt`を選択し、保存せずそのまま返信する。Codexがファイル名とparentなしのform stateを確認後、Asset Class未選択validationを見て、PE指定で1回保存する。元の接続切れタブは操作しない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004, RULE-0002, PAT-0002
KNOWLEDGE_APPLIED: PAT-0004, RULE-0002, PAT-0002
NEW_KNOWLEDGE_CANDIDATE: YES — isolated migration evidenceとChrome file picker limitationの分類

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: USER
STATUS: ACTION_REQUIRED
