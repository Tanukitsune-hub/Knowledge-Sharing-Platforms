# CODEX-11 契約対応表

基準はmain `40d1f2759cd3d4c9e01a1fb04607293c420cb85c`。以下はsourceを読んだ設計差分であり、future BUILDを実装・認定した表ではありません。

| 論点 | 現在のsource根拠 | 今回のUI / local demo | future BUILD delta | 必要なruntime evidence |
|---|---|---|---|---|
| 親ID検証 | `src/61_PitchbookValidation.gs:108` reservation検証、`src/71_PitchbookUploadService.gs:1` uploadはDocument/Batch主体 | 単一form、親失敗ならファイル0。後日追加は既存Meeting_ID | prepare/upload/retryでauthoritative親の存在・Active・編集権・版・同じ親bindingを検証。必要なら登録元情報を既存行へ限定追加（列名未決定） | 親不存在/Inactive/競合/親差替え拒否、Drive/Index mutation=0 |
| upload/link部分失敗 | `src/71_PitchbookUploadService.gs:15` Active row再利用、`src/62_PitchbookIdentity.gs:5` stable Document_ID | file保存失敗とlink失敗を区別。同じMTG/DOCで再試行、成功分保持 | 関連確定を独立した成功状態とする。応答不明時readback。成功済みファイル再uploadなし | file失敗/link失敗/応答不明の再試行でファイル・行重複0、ID不変 |
| non-GP入力・filename | `src/61_PitchbookValidation.gs:53` PITCHBOOK_GP_REQUIRED、`src/62_PitchbookIdentity.gs:23` selected.gp.name依存 | 6 Counterparty例、LP親に資料。仮GPなし。既存資料はDocument_IDのみ再利用 | 親Counterpartyから表示名/IDを取得。資料日付は面談日と区別。共有既存資料の帰属をlink追加で上書きしない | 6区分でvalidation/filename/Index属性をreadback。面談日不変 |
| non-GP source metadata | `src/150_KnowledgeSearchModels.gs:164` PitchbookはGP由来entityKey、`src/181_FeatureFreezeSync.gs:9` GP metadata | LP + 資料のみの適格な架空例を表示。実検索とは表示しない | metadata/hash/派生index・検索候補・citationのauthoritative照合まで伝播。Meeting専用filterを無断で資料へ拡張しない | non-GP資料ヒット＋正しい出典。Team等の未対応組合せ拒否。strict citation/no-failover保持 |
| unlink/検索eligibility/復元 | `src/30_MeetingCore.gs` 明示Related_Pitchbook_IDs、`src/111_MaintenancePitchbookMasterService.gs` 資料状態管理 | 行の削除はlink解除。共有他リンク保持、元からInactiveの資料はundo後もInactive。親復元は明示unlinkを戻さない | 資料Activeだけでなく有効親関係を検索eligibilityへ反映。最後のlink解除/未確定資料を検索へ残さない。cascade physical deleteなし | 他親での検索維持・最終link解除後の検索/引用除外・親削除/復元・Inactive資料の非再活性化 |
| 関係だけの変更とDocs原文 | `src/110_MaintenanceMeetingService.gs:159` filename/bodyを再構築しupdateMeetingDocument | detailに原文、原本導線、編集、分類操作。分類操作後も本文不変 | 汎用Meeting更新へ素朴に流すだけでは原文保全を保証できない。関係のみ限定更新/facade等を検討しLock/CASを保持 | 人手編集したDocsの正確な原文をunlink/link前後にreadback。版競合時不変 |
| 独立export validator | `src/155_KnowledgeExportContracts.gs:65` mode/targetRequiredを検証、`src/156_KnowledgeExportService.gs` readback/materialization | 空質問/AI未設定/不完全compare・prepでも共通filterからMeeting-only preview。日付逆転拒否 | AI専用validatorから共通filter validatorを分離。架空質問注入なし。既存preview/readback/fingerprint・件数/文字数/時間/重複生成防止保持 | 無料非AI経路、選択scope/件数/原文一致、空/上限/読出し失敗、値不変、Docs/PDF生成は別認可 |
| legacy orphan保持 | 現行uploadに親必須bindingなし。`src/00_Core.gs` Pitchbook_Index既存行 | 独立した通常資料登録/管理routeは削除。既存資料の関連付けを補助操作として保持 | 歴史的orphanと新規処理途中を区別。実データを調査してから限定管理/移行を決定。既存orphanの一括削除・Inactive・再割当禁止 | 匿名化fixtureでlegacy保持・共有関係保持。移行前後照合は別Work/承認 |
| 受領のみ記録と集計 | `src/126_ActivityAnalyticsService.gs` Meeting集計、`src/00_Core.gs` 現行schemaに今回の新record-kindなし | 受領専用分岐なし、受領禁止も追加なし。資料追加で件数/日付が変わらない。9列・複数○維持 | 受領のみの業務扱いと集計への算入/除外をBUILD前に確認。面談種別3checkboxから受領を推測しない | 業務判断を固定後、通常面談/受領のみ/後日追加の集計期待値を分離 |

## Export業務項目

`src/00_Core.gs` Meeting_Index schema、`src/155_KnowledgeExportContracts.gs:234` counterparty解決と`:485` Docs原文出力を参照。prototypeの値はすべて架空です。

| source項目 | previewでの表現 | future BUILDの要件 |
|---|---|---|
| Meeting_ID / Date / Time | ID、日付/時刻 | Dateはcanonical business date、時刻未設定は未設定 |
| Counterparty_Type / Counterparty_ID / GP_ID fallback | 区分/ID/表示名 | IDと表示名を別扱い、legacy fallbackを検証 |
| Related_GP_IDs | IDと表示名 | 未設定を空文字による架空値補完にしない |
| Location_ID / Asset_Class_ID / Capital_Type_ID / Team_ID | 場所・Asset Class・Equity/Debt・Team | Option IDと解決名、未解決IDを区別 |
| Fund_Strategy / Meeting_Type_Codes | 業務名・canonical codeと表示名 | 複数code/未設定を保持 |
| Counterparty / Internal_Participants | 面談参加者/当社側 | source属性の境界を維持 |
| Follow_Up_Required / Follow_Up_Note / Admin_Check_Completed | フォロー有無・メモ・確認済み | falseと未設定を混同しない |
| Related_Pitchbook_IDs | IDのみ | 資料本文とPitchbook参照リンクsectionは出さない |
| Doc_File_ID / Doc_URL / Docs body | authoritative identity/URL/Docs原文全文 | demo URLは未設定。実装では原本readbackを要する。Indexへ本文を重複保存しない |

Status=Activeの共通Meeting絞り込みが対象。認証token、資格情報、provider内部JSON、監査内部情報を「全属性」としてdumpしません。

## 不変条件とgate

5-sheet backend、stable IDs、no physical delete、Shared Drive authoritative、derived index rebuildable、短いLock/CAS、provider route/securityを維持。GP/Entity summary read facadeは統合せず、通常資料操作だけparent detailへ導きます。Work 0027 hidden、Work 0029 auth/session/logout/rotationはproduction source不変。これらの本番動作を今回再認定したものではありません。

DESIGN_BLOCKER: NONE
READY_FOR_PRODUCTION_BUILD: NO
TARGET_RUNTIME_QUALIFICATION: NOT RUN
