# Work 0070 CODEX-03 — isolated target-runtime qualification report

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH

## Outcome

受入れ済みWork0070 candidateを、個人所有の隔離Apps Script / Workspace / owner-only Web Appでqualificationした。実schema8 installationからschema9へin-place migrationし、7-sheet Backend、旧folder IDを維持した名称変更、既存Meeting/Pitchbook保持をpersisted stateで確認した。通常Web Appからstandalone保存資料、Newsと評価のDIRECT_TEXT / UPLOAD_FILE、Past/detail/edit/lifecycle、同時createとstale edit拒否を確認した。source patch、会社production migration、provider callは行っていない。

実行開始時、PR #103のcandidate sourceはlatest mainとnormal merge済みでcontent conflict 0。その後mainにcontroller-side OAuth checkpoint commitが入ったため、現時点のPRは`docs/handoffs/0070-dispatches.md`のみcontent conflict。production source/tests/generated artifactsはconflict 0。normal merge上限1/1を使用済みのため、ChatGPTへdocs reconcileを引き継ぐ。

## Contract and identity

- Evidence hierarchy: actual persisted Workspace / native browser > Apps Script source/deployment readback > accepted CODEX-02 deterministic evidence。
- PR_RECONCILED_WITH_MAIN: PASS — runtime開始前にnormal merge 1回。
- PR_MERGEABLE: CURRENTLY CONFLICTING — 後着のmain commitとdispatch control docのみ。`git merge-tree --write-tree HEAD origin/main`で唯一のconflict pathを確認。
- QUALIFIED_HEAD: reconciled candidate `06f55ebe7a72a206ac3ea4d171822deef81a6abc`のproduction source。後続branch commitsはdocs-only。
- TARGET_RUNTIME_IDENTITY: PRIVATE / NOT_REPORTED。script/host owner、bound relation、隔離folder、owner-only deploymentを確認。private ID / URL / account identifierはlocal private operator mapのみ。
- Deployment: baseline release 0.1.2/schema8を1回syncしimmutable version 1を作成。candidate release 0.2.0/schema9を1回syncしversion 2を作成。同一Web App deploymentを1回更新。remote saved source / immutable version / local bundleの一致と`WEB_APP / MYSELF / USER_DEPLOYING / /exec`維持をreadback。

## Persisted migration and source evidence

- Baseline: exact 5 Backend sheets、schema8、AI sync false。通常Web Appでsynthetic Counterparty 2件、Meeting `MTG-000001`、親付きPitchbook `DOC-000001`を保存。Index / Doc本文 / Drive file / parent relationをreadback。
- Migration: schema9、release 0.2.0、exact 7 sheets（`Counterparty_Master`, `Option_Master`, `Meeting_Index`, `Pitchbook_Index`, `News_Index`, `Internal_Assessment_Index`, `Settings`）。root、Meeting、Pitchbook folderは同じIDで`記録・資料 / 面談記録 / 保存資料`へrename。新規`ニュース / 評価（ICメモ、社内整理等）`は同じrootのdirect children。exact 4 children、重複なし。既存Meeting/Pitchbookのstable ID、Index row、Doc/File ID、Status、relation、本文/fileを保持。
- Idempotency: second setup 1回でresource/counter/source row不変。News childをsynthetic custom nameへ変更後のsetupも1回で同じID/名前を保持し、canonical重複なし。test-onlyで同じIDを用いて元の名前へ復元。
- Standalone保存資料: Asset Class空欄submitは具体的field errorとfocus、Index不変。client sourceはprepare RPC前にreturn。PE選択後の1回のsaveで`DOC-000002` Active、Parent_Meeting_ID空、synthetic面談先B、TXT 61 Bを保存資料folderに作成。既存Meeting Version / relationは不変。
- News DIRECT_TEXT `NEWS-000001`: synthetic面談先2件をcanonical sorted unique ID listに保持。1 authoritative Doc、News folder、URL、本文、Past/detailを確認。metadata/body edit、Inactive→Reactivateでstable ID / Doc IDを維持しVersion 1→4。
- 評価 DIRECT_TEXT `ASMT-000001`: stable type code、日本語label、synthetic Meeting/News relation、1 authoritative Doc、評価folder、本文、Past/detailを確認。edit、Inactive→Reactivateでstable ID / Doc IDを維持しVersion 1→4。
- News UPLOAD_FILE `NEWS-000002`: 独立Web App tabからsynthetic TXT 53 Bを1回save。`Input_Mode=UPLOAD_FILE`、synthetic面談先B、News folder、1 real `text/plain` file、Past/detail/原本link、Version 1をreadback。
- 評価 UPLOAD_FILE `ASMT-000002`: 別の独立Web App tabからsynthetic TXT 59 Bを1回save。`Input_Mode=UPLOAD_FILE`、type `GP_FUND_ASSESSMENT`、synthetic面談先A、評価folder、1 real `text/plain` file、Past/detail/原本link、Version 1をreadback。各source folderにはdirect Docとuploaded TXTのexact 2 files、重複なし。
- Concurrent distinct create: 上記News/評価UPLOAD_FILEを2 top-level browser contextsから近接同時開始。両方成功、NEWS/ASMT各Index 2 rows、NEXT ID各3、source/file ID重複・lost rowなし。別tabの入力値混入なし。
- Stale same-record edit: 2独立tabでNews `NEWS-000001` Version 4を編集。Aのvalid saveがVersion 5となり、BのVersion 4 saveは`他の利用者が先に更新しています。最新情報を読み直してください。`で拒否。Index titleとauthoritative Doc本文はAのみ、Version increment 1回、File ID不変。Bの文言は原本に残らない。
- Restricted Audit: synthetic Entity/Meeting/Pitchbook/News/評価の代表mutation 17 rowsはSuccessでtarget対応、Actor分類`EMAIL`、source本文複製なし。stale rejectionを成功mutationと混同していない。

## Browser state and side effects

- Product title/header、Add/Pastの4 tabsを実Web Appで確認。desktopにmaterialな表示問題なし。390pxのin-app browserでは`window.innerWidth=390`、content viewport 375、Add/Past各4 tabsの`documentElement.scrollWidth=375`でmaterial horizontal overflowなし。viewport overrideはreset済み。
- actual upload acceptは`.pdf,.pptx,.xlsx,.docx,.txt,.eml`。shared date / Asset Class / Fund Strategyのtab間伝播、source-specific入力の分離、News保存後にNews固有入力のみclearされ評価tab未保存titleが残ることを確認。
- 別tabで未保存News titleを入力してreload後、silent draft restoreなし。4 Add tabsに個別の未保存値を用意し、global `クリア`確認dialogをacceptすると全4値が空になった。未解決retry/unknown-outcome safetyは今回状態を人為的に作らず、accepted CODEX-02 deterministic evidenceを使用。
- Final Settingsは`AI_SYNC_ENABLED=false`。Apps Script Triggers pageはtime-based `runBackendDailyBackup_` 1件、AI sync triggerなし。baseline側のtrigger 0からsetupでtest-only backup triggerが作成された。
- provider call 0、provider Store mutation 0、AI indexing call 0、credential change 0、company data mutation 0、confidential data 0、broad access change 0、physical delete 0。browser consoleにmaterial error/warning 0。

## Acceptance matrix

| Field | State |
|---|---|
| BASELINE_SCHEMA8 / BASELINE_5_SHEETS | PASS — persisted Settings / exact 5 sheets |
| MIGRATION_SCHEMA9 / BACKEND_7_SHEETS | PASS — persisted Settings / exact 7 sheets |
| LEGACY_ROOT_SAME_ID_RENAME | PASS — same ID, 記録・資料 |
| LEGACY_MEETING_FOLDER_SAME_ID_RENAME | PASS — same ID, 面談記録 |
| LEGACY_PITCHBOOK_FOLDER_SAME_ID_RENAME | PASS — same ID, 保存資料 |
| NEWS_FOLDER_CREATED / ASSESSMENT_FOLDER_CREATED | PASS — same root、exact 4 children |
| MIGRATION_EXISTING_MEETING_PRESERVED | PASS — row / Doc / body / status |
| MIGRATION_EXISTING_PITCHBOOK_PRESERVED | PASS — row / File / relation / bytes |
| SECOND_SETUP_IDEMPOTENT / CUSTOM_NAME_PRESERVED | PASS — resources/counters/rows stable、custom name保持 |
| PRODUCT_TITLE / ADD_4_TABS / PAST_4_TABS | PASS — actual candidate Web App |
| BROWSER_DESKTOP / BROWSER_390 | PASS — actual desktopと390px、changed Add/Past全tabsでmaterial overflowなし |
| UPLOAD_ACCEPT_REAL | PASS — actual DOMの6 extension tokens |
| STANDALONE_ASSET_REQUIRED / STANDALONE_PITCHBOOK | PASS — invalid focus/error、valid standalone real File |
| NEWS_DIRECT / NEWS_MULTI_ENTITY / NEWS_EDIT_LIFECYCLE | PASS — browser、Index/Doc/Version |
| NEWS_UPLOAD | PASS — 53 B TXT、Index/Drive/Past/detail |
| ASSESSMENT_DIRECT / ASSESSMENT_EDIT_LIFECYCLE | PASS — browser、Index/Doc/Version |
| ASSESSMENT_UPLOAD | PASS — 59 B TXT、Index/Drive/Past/detail |
| CONCURRENT_DISTINCT_CREATE | PASS — independent top-level tabs、both rows/files persist、counters stable |
| STALE_EDIT_REJECTED | PASS — A Version 5、B stale rejected、Index/Doc agree |
| CROSS_SESSION_INPUT_BLEED | PASS — independent tab入力分離、reload no silent restore、global clear全4tabs |
| AUDIT_TARGET_TRACE / AUDIT_ACTOR_CLASS | PASS — 17 Success、Actor classification EMAIL、本文複製なし |
| AI_SYNC | FALSE — persisted Settings、AI sync triggerなし |
| PROVIDER_CALL_COUNT / AI_INDEX_CALL_COUNT | 0 / 0 |
| TRIGGER_STATE | TEST_ONLY — daily backup trigger 1、AI sync trigger 0 |
| COMPANY_DATA_MUTATION_COUNT / CONFIDENTIAL_DATA_COUNT / PHYSICAL_DELETE_COUNT | 0 / 0 / 0 |
| LOGIC_VALIDATION | CODEX-02 716/716 accepted。今回source変更なし、全面再実行なし |
| TARGET_RUNTIME_QUALIFICATION | PASS — isolated schema8→9 migration、4-source Web App、persistence、browser、concurrency |
| SIDE_EFFECT_STATE | TEST_ONLY — isolated Apps Script/Workspace resources、synthetic records、backup trigger 1 |
| BLOCKER | APP/DATA: NONE。PR merge: dispatch doc-only content conflict pending ChatGPT reconcile |
| FOLLOW_UP | ChatGPT final diff/evidence review、docs-only PR conflict解決とmerge判断。会社production migration/rolloutは別認可 |
| READY | YES_FOR_CHATGPT_FINAL_REVIEW — runtime candidate qualified。PR conflictはmerge前に要解決 |

## Mutation budget

| Operation | Used / Max |
|---|---:|
| normal merge | 1 / 1 |
| new isolated target | 1 / 1 |
| baseline / candidate source sync | 各1 / 1 |
| immutable versions | 2 / 2 |
| owner-only deployment / existing update | 各1 / 1 |
| baseline / migration / idempotency / custom-name setup | 各1 / 1 |
| synthetic source records | 7 / target <= 8 |
| concurrent distinct-create pair | 1 / 1 |
| same-record stale edit scenario | 1 / 1 |

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004, RULE-0002, PAT-0002
KNOWLEDGE_APPLIED: PAT-0004, RULE-0002, PAT-0002
NEW_KNOWLEDGE_CANDIDATE: YES — isolated migration evidenceとbrowser native file picker limitationの分類

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
