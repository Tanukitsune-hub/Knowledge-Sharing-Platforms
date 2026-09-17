# CODEX-23 — 日時修復PASS / follow-up添付のnative選択待ち

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
BALL: USER
STATUS: ACTION_REQUIRED
MODE: BUILD

## 結果 / 再開点

同じ2件の元セルを保持したまま、実Apps Script観測に基づく共通read adapter修正を行った。既存single owner-only deploymentのversion4で検索・GP/non-GP詳細の日時一致を確認した。初回資料のunlink/relink、同じDocument_ID/File_ID保持、Docs body/tab content完全一致、専用非AI Full OutputもPASS。

残るR4 follow-up添付は、通常browser filechooserの自動取得がsetFiles前にtimeoutした。これはapplication failureでもrepair cycle失敗でもない。ユーザーの通常ファイル選択だけが必要。親Meetingを登録し直さず、同じDispatchで続行する。R1-R8完了、ユーザー実機確認準備完了とはまだしない。

## 正本 / Work Contract

- authoritative instruction: 最新origin/mainの `0028-CODEX-23-temporal-recovery-autonomous-completion-instruction.md`。controller-review・dispatch registerを併読。
- fetched main: `6cb0bbc7d1634a77fff2e9c9f6e7bc008dd22fad`
- 開始local/PR HEAD: `7c18e6dc5184209882c807db08365bd12007f0bc`。branch `codex/0028-production-contract-build`、PR #51 OPEN/Draft、開始working tree clean。
- mode BUILD。actual同一fixtureの保存値→Apps Script→adapter→UIを最優先証拠とし、logic/mockをruntime PASSに転用しない。
- 同一target・single owner-only deployment、synthetic only。追加repair/runtime最大3cycles、診断同期を含めsource sync最大4、新version/update最大3。
- installer/I2・既存versioned attestation/security READYは非影響の受入証拠として保持。editor readiness再実行なし。
- main merge/rebase/reset、force push、PR mergeなし。既存ignored evidence/historical worktreeを保持。

## 実測した最初の不一致

修正前の同じ2件をSheets CellDataで限定読取した。

| 境界 | GP Date / Time | non-GP Date / Time |
|---|---|---|
| userEnteredValue / effectiveValue | 46282 / 0.4375 | 46282 / 0.46875 |
| native formattedValue | 2026-09-17 / 10:30 | 2026-09-17 / 11:15 |
| number format | DATE yyyy-mm-dd / TIME h:mm | DATE yyyy-mm-dd / TIME h:mm |
| actual Apps Script Date ISO | 2026-09-17T00:00:00.000Z / 1899-12-30T10:30:00.000Z | 2026-09-17T00:00:00.000Z / 1899-12-30T11:15:00.000Z |
| actual getDisplayValues | 2026-09-17 / 10:30 | 2026-09-17 / 11:15 |
| Utilities.formatDate(workbookZone) / version3 adapter | 2026-09-16 / 02:30 | 2026-09-16 / 03:15 |
| Utilities.formatDate(GMT) | 2026-09-17 / 10:30 | 2026-09-17 / 11:15 |
| Utilities.formatDate(Asia/Tokyo) | 2026-09-17 / 19:30 | 2026-09-17 / 20:15 |

全4セルは実Apps Scriptで `[object Date]`。Sheets metadataのtimezoneは `Etc/GMT` だが、同じbackendを読むnative `getSpreadsheetTimeZone()` は `America/Los_Angeles`、script timezoneは `Asia/Tokyo` だった。

したがって「metadataとnative timezone getterは同じ」「workbook timezoneで再formatすれば復元できる」というCODEX-22の仮説は実測で棄却。Date値とdisplayが一致するところからversion3 adapterで初めてずれ、その出力が検索UIと一致した。API間timezone不一致の内部要因そのものは未確定。時間の加減算、全列string化、元セル/timezone書換えは行っていない。

観測は既存read-only検索関数のnative editor実行1回。既存active/effective/admin照合とexact synthetic 2行条件に限定した一時private helperがDate/Time型・変換値だけをlogへ出した。ID/account/URL/Docs本文はlog対象外。追加公開function・汎用runner・browser評価RPCは0。一時観測はfinal sourceから除去済み。

## Cycle 1 / 修正・検証・release

- diagnostic source commit: `96ff683`。診断専用saved source sync1、version/deployment更新なし。
- repair source commit: `998c9d1`。
- generated artifact commit: `c0f694c9f69118d8329dc27264a5c02c02cf927a`。
- final candidate: 同じdeploymentのimmutable **version4**。saved/immutable source+manifest exact parity、same identity、WEB_APP / USER_DEPLOYING / MYSELF / same execを独立readbackで確認。

`src/20_LiveEnvironment.gs` はDate型のDate/Time列だけをdisplay経由でcanonical化する。`src/05_TemporalContracts.gs` の共通helperは有効な `yyyy-mm-dd` / `HH:mm` とSheets `h:mm` の先頭0省略だけを受理する。locale依存の曖昧な文字列・AM/PM・不正日付は `BUSINESS_CELL_DISPLAY_UNSUPPORTED` でfail-closed。汎用的なdisplay parserとはしていない。文字列セルと他列・真のInstantはraw型を保持、書込処理は変更しない。

testsは実観測したDate ISOとtimezone不一致を含み、production helper/adapter、mapping、曖昧表示拒否、元array不変・Instant同一性・不要display読取なしを検証。従来のmixed Date/string、partial-write保全テストも維持した。

```text
FOCUSED_VALIDATION: PASS / 24_OF_24
LOGIC_VALIDATION: PASS / npm run check / 524_OF_524
BUNDLE_VALIDATION: PASS / npm run check:bundle / 30_OF_30
DIFF_HYGIENE: PASS / git diff --check
CYCLES_USED: 1_OF_3 / RUNTIME_TEMPORAL_PASS
REPAIR_FAILURE_CYCLES: 0
SOURCE_SYNC: 2_OF_4 / DIAGNOSTIC_1 + REPAIR_1
NEW_IMMUTABLE_VERSION: 1_OF_3 / VERSION4
EXISTING_DEPLOYMENT_UPDATE: 1_OF_3
CONFIRMATION_REEXECUTION: 0 / SECURITY_CODE_UNCHANGED
```

## Runtime matrix / version4 checkpoint

| 項目 | 判定・証拠 |
|---|---|
| Temporal | PASS、検索2件およびGP/non-GP詳細が2026-09-17 10:30 / 11:15。元4セルCellData exact equality |
| R1 | PASS、exactly5 backend tabs・Settings SCHEMA_VERSION7 / AI_SYNC_ENABLEDFALSEを今回read。installer resources/I2は非影響の既存受入証拠継承 |
| R2 | PASS、version2作成済み親2件を再利用。version4検索/詳細で同じID・GP/non-GP・Active・日時を直接readback。再登録0 |
| R3 | PASS、version2作成済み初回資料を再利用。version4詳細・Index・file metadataで同じDocument_ID/File_ID/parent、Active、97B・非共有・実在を確認。再upload0 |
| R4 | NOT_RUN、同じnon-GP親のfollow-up選択待ち。file upload0 |
| R5 | PASS、version4通常詳細の「削除」→unlinkを実行、Index relation空・Meeting version3、UI解除済みを確認。その後「削除を取り消す」→同じDocument_ID再link、Meeting version4。file ID/Active/parent保持、物理削除0 |
| R6 | PARTIAL_PASS、初回addは非影響の既存証拠継承。今回unlink前・unlink後・relink後のDocs body/tab contentをbaselineとexact比較してPASS。元Date/Time CellDataと無関係business fields完全一致。follow-up add後の比較は未実行 |
| R7 | PASS、version4通常UIの面談先=既存synthetic non-GP、情報ソース=面談記録のみ、全期間、質問空・AIモデル未設定で専用「全文出力」。Meeting1件/原文332文字・元日時・authoritative本文を画面プレビューで確認。AI検索/出力ファイル作成なし。invalid/no-result境界は非変更の既存logic tests維持、今回live追加試験なし |
| R8 | CHECKPOINT_PASS、same single owner-only version4、native trigger画面0、AI FALSE。今回provider操作0・機密0・物理削除0。R4後のfinal checkは保留 |

Browserは既存Chrome同じexecをreload。main render、検索・両詳細・relation操作・Full Outputを直接確認し、console error/warn0。frontend-testing-debuggingとSheets/Docsスキルは、画面結果と元セル/本文の独立読取・保全確認に使用した。

## Native操作待ち / 同じDispatchの継続

添付先は既存non-GP Meeting、画面表示「親記録: MTG-000002 / Version 4（新規記録は作成しません）」。follow-up fixtureは既存ローカル `0028-22-followup.txt`、106B、syntheticのみ。

今回のbrowser chooserもsetFiles到達前にtimeout。設定不備の証拠はなく、既に有効と確認済みのfile-URL権限変更は再依頼しない。追加target/deploymentや別upload経路へ迂回しない。native選択後、同じ画面で選択ファイルを確認し既存親へ1回追加、metadata・Docs/元セル保全、必要なfinal matrix確認を続行する。

ユーザー操作は「添付資料を選択」から指定TXTを選ぶだけ。登録ボタンはCodexがreadback後に操作する。tabはhandoff保持、現時点で未送信ファイル0・follow-up upload0。

```text
R1_R8: INCOMPLETE / R4_AND_POST_FOLLOWUP_R6_FINAL_CHECK_PENDING
PROVIDER_CALLS: DIRECT_OPENAI_0 / GEMINI_0 / AZURE_OPENAI_0
AI_SYNC: DISABLED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
HISTORICAL_VERSION75_MUTATION: 0
TRIGGERS: 0
WORK0030: DEFERRED_BY_USER / NOT_STARTED
SIDE_EFFECT_STATE: DIAGNOSTIC_SYNC_1 / REPAIR_SYNC_1 / VERSION4_1 / SAME_DEPLOYMENT_UPDATE_1 / INITIAL_RELATION_UNLINK_1_RELINK_1 / FOLLOWUP_UPLOAD_0
BLOCKER: USER_NATIVE_FILE_SELECTION
READY_FOR_CHATGPT_FINAL_REVIEW: NO
```

FOLLOW_UP: locale依存の任意表示形式対応は未実装。受理形式外は安全に拒否する。API間timezone getter差の内部要因調査は、実測済みの壁時計値保全より先行させない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: OBS-0014
KNOWLEDGE_APPLIED: OBS-0014
NEW_KNOWLEDGE_CANDIDATE: YES

既存知見の「timezoneを同一視しない・元セルを保持」を適用。ただし過去のconfigured-timezone修正をそのまま再利用せず、今回のnative getterとCellDataの差を実測した。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
BALL: USER
STATUS: ACTION_REQUIRED
