# Work 0070 CODEX-03 — isolated target-runtime qualification 中間報告

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: USER
STATUS: ACTION_REQUIRED
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH

## 結果と停止点

Draft PR [#103](https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/103)をlatest `origin/main`へ通常mergeし、content conflictがないことを確認した。隔離された個人所有のsynthetic Apps Script / Workspace targetを1組準備し、schema8 baseline bundleを1回syncしてremote source SHA一致を確認した。

baseline installerの実行はGoogle OAuthの「このアプリは Google で確認されていません」画面で止まった。ユーザーは外出中でnative承認操作を実施できない。Apps Scriptの実行履歴は0件、triggerは0件であり、setup、fixture記録、schema9 migration、Web App qualificationは**未実施**。これはapplication defectとして扱わない。本人操作が可能になるまで同じDispatch IDを`BALL: USER / STATUS: ACTION_REQUIRED`に保つ。

## Work contract / evidence hierarchy

- MODE: `QUALIFICATION`。Closed DecisionsとCODEX-02の受入れ済みsourceは変更しない。
- Outcome: exact candidateのschema8→schema9 migration、4-source persistence、browser、concurrency、Auditをactual targetで観測する。
- Evidence: Workspaceの永続状態とnative browser、Apps Script project/deployment/source readback、受入れ済みdeterministic evidenceの順。
- Boundaries: 個人所有のsynthetic resourceのみ。会社production、provider、billing、credential設定、AI indexing、physical deleteは行わない。
- Reset condition: target identity不一致、material application/data-integrity defect、stateful mutationの失敗。今回はOAuth承認が必要な時点で停止した。

## PRとsource identity

| 項目 | 結果 |
|---|---|
| PR_RECONCILED_WITH_MAIN | PASS — `origin/main` `5a2bbbd4a851f2babc0ac24203226e9cc06f5d46`を既存branchへnormal merge。競合はWork-control文書2件のみで、main側のCODEX-03指示・受入れ記録を維持 |
| PR_MERGEABLE | PASS — PR #103 `MERGEABLE`をreadback |
| QUALIFIED_HEAD | `2e31ae723dcb562a6de46703283fea86f3907260`をruntime候補として固定。**qualification完了を意味しない** |
| Production source drift | NONE — merge前headから`src/`、`dist/`、`tests/`、`AGENTS.md`、architecture/decisionへの差分0 |
| Baseline source | accepted pre-Work0070 commit `ebfd13b3b2b7b806a0da17956d95b6c7b3ff3c62`のrelease `0.1.2` / schema8 bundleを使用。local hashはmanifest一致、1回のsource sync後のremote `Code.gs` SHAも一致 |
| TARGET_RUNTIME_IDENTITY | PRIVATE / NOT_REPORTED。CLI principalとproject creator一致、Apps Script parentとbound Spreadsheet一致、hostは個人所有の専用隔離フォルダ内。private ID、URL、account identifierはreportに含めない |

## Target preparationと実際のside effects

個人所有の既存専用Drive作業フォルダ配下にsynthetic fixture folderを1件作成した。host作成後、`clasp create --type sheets --parentId`が指定済みSpreadsheetではなく新規のbound Spreadsheetを作ったことをproject metadataで検出した。新規bound hostのowner、作成時刻、root親、script bindingを確認し、専用fixture folderへ移動した。先に作った未使用の空Spreadsheetは正確なIDを確認して可逆的にTrashへ移した。physical deleteは0。現在のfixture folderのactive childはbound host 1件のみ。

baseline source syncは1回、remote `Code.gs`とmanifestの2ファイルをreadbackした。Apps Script editorにはbaseline release `0.1.2` / schema8とDrive v3 serviceが表示された。installer選択後に実行ボタンを1回押したが、OAuth承認で実行前に中断された。editorの実行履歴は過去7日間0件、trigger一覧は0件。immutable versionは0件、versioned Web App deploymentの作成・更新は0件。platformが生成したunversioned deployment metadataはversioned release evidenceに数えていない。

Google Sheets REST APIのread-only metadata取得は、clasp OAuth client側でSheets APIがdisabledのため403となった。API設定変更や代替credentialは行っていない。今後のauthoritative sheet readbackは通常のApps Script/Workspace UIまたは既存許可済み経路で行う。

## Acceptance matrix

以下の`NOT RUN`は合格扱いしない。schema8 sourceの配置と実際のbaseline installationを区別する。

| Field | State |
|---|---|
| BASELINE_SCHEMA8 | SOURCE VERIFIED / persisted installation NOT RUN |
| BASELINE_5_SHEETS | NOT RUN |
| MIGRATION_SCHEMA9 | NOT RUN |
| BACKEND_7_SHEETS | NOT RUN |
| LEGACY_ROOT_SAME_ID_RENAME | NOT RUN |
| LEGACY_MEETING_FOLDER_SAME_ID_RENAME | NOT RUN |
| LEGACY_PITCHBOOK_FOLDER_SAME_ID_RENAME | NOT RUN |
| NEWS_FOLDER_CREATED | NOT RUN |
| ASSESSMENT_FOLDER_CREATED | NOT RUN |
| MIGRATION_EXISTING_MEETING_PRESERVED | NOT RUN |
| MIGRATION_EXISTING_PITCHBOOK_PRESERVED | NOT RUN |
| SECOND_SETUP_IDEMPOTENT | NOT RUN |
| CUSTOM_NAME_PRESERVED | NOT RUN |
| PRODUCT_TITLE | NOT RUN in Web App |
| ADD_4_TABS | NOT RUN |
| PAST_4_TABS | NOT RUN |
| BROWSER_DESKTOP | NOT RUN |
| BROWSER_390 | NOT RUN |
| UPLOAD_ACCEPT_REAL | NOT RUN |
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
| AUDIT_TARGET_TRACE | NOT RUN |
| AUDIT_ACTOR_CLASS | NOT RUN |
| AI_SYNC | persisted setting NOT RUN; source default false、observed triggers 0 |
| PROVIDER_CALL_COUNT | 0 |
| AI_INDEX_CALL_COUNT | 0 |
| TRIGGER_STATE | 0 observed in isolated Apps Script editor |
| COMPANY_DATA_MUTATION_COUNT | 0 |
| CONFIDENTIAL_DATA_COUNT | 0 |
| PHYSICAL_DELETE_COUNT | 0 |
| LOGIC_VALIDATION | CODEX-02の716/716を受入れ済み。今回のdocs-only reconcile後に全面再実行していない |
| TARGET_RUNTIME_QUALIFICATION | BLOCKED BEFORE BASELINE SETUP。source identityのみPASS |
| SIDE_EFFECT_STATE | TEST_ONLY fixture folder・bound host・script作成、未使用hostを可逆的にTrash、baseline source sync 1。candidate sync/versioned deployment/business source mutation 0 |
| BLOCKER | Google OAuthの未確認アプリ警告と権限承認には本人のnative操作が必要。ユーザーは現時点で操作不可。application defectではない |
| FOLLOW_UP | 同じDispatch IDで、本人が期待どおりの権限だけを承認した後、実行履歴0・source SHA・target bindingを再確認してbaseline installerを最初の実実行として進める。新targetや追加source syncを作らない |
| READY | NO |

## Mutation budget readback

| 操作 | 使用 / 上限 |
|---|---:|
| normal merge | 1 / 1 |
| new isolated Apps Script target | 1 / 1 |
| baseline source sync | 1 / 1 |
| candidate source sync | 0 / 1 |
| immutable versions | 0 / 2 |
| owner-only versioned Web App deployment | 0 / 1 |
| baseline setup実実行 | 0 / 1 |
| migration / idempotency / custom-name setup | 0 / 各1 |
| synthetic source records | 0 / 目安8 |
| concurrency distinct-create pair | 0 / 1 |
| same-record stale-edit scenario | 0 / 1 |

## 再開のためのnative操作

保持されたGoogle OAuthタブで、自己所有の隔離用Apps Scriptの承認画面を本人が確認する。Drive、Docs、Sheets、script management、external requestの想定権限のみの場合に承認し、Gmail等の想定外権限が出た場合は中止して知らせる。未確認アプリ警告の通過はCodexが代行しない。完了後、同じDispatchでread-only preflightをやり直し、残りのtarget-runtime matrixへ進む。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004, RULE-0002, PAT-0002
KNOWLEDGE_APPLIED: PAT-0004, RULE-0002, PAT-0002
NEW_KNOWLEDGE_CANDIDATE: YES — claspのbound host生成挙動を実際のproject parent readbackで確かめる必要がある

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: USER
STATUS: ACTION_REQUIRED
