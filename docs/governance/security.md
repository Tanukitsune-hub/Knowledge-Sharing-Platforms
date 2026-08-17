# Security and Information Handling Baseline

## Status

本書は、Knowledge Sharing Platformsの蓄積基盤とGemini File Search検索レイヤーに適用する初期セキュリティ / 情報管理方針を定める。

Works 0004–0011は実装・マージ済みで、Work 0012はApps Script public-surface、safe-error、Export link integrityのhardeningを完了した。release versionは`0.1.2`。Work 0010–0011のDEV実機qualificationとpermission equivalence確認は未観測であり、本番承認とは別である。

## Baseline requirements

1. 実際のMeeting、Pitchbook、未公開投資情報、個人情報、credentialを公開GitHubへ保存しない。
2. 実データの正本は組織管理下のGoogle Workspace / Shared Driveに置く。
3. 個人Drive、個人API key、個人所有credentialへ恒久依存しない。
4. Gemini File SearchはShared Drive正本を置き換えず、再生成可能な派生AI indexとする。
5. 実データをGemini API / File Searchへ送る本番構成は、会社承認済みGoogle Cloud / Gemini環境だけを使用する。
6. API key / credentialをGitHub、client HTML、利用者向けSheets、原資料へ保存しない。
7. Inactive資料を通常AI検索へ返さない。
8. AI回答から元Shared Drive原資料へ戻れるtraceabilityを維持する。
9. AI回答 / 要約を原資料確認なしに正式記録や投資判断として自動確定しない。
10. AI indexing障害で正本登録 / 修正をrollbackしない。

## Common access boundary

初期版ではWeb App自体を共通アクセス境界とする。

- Web App利用を許可された利用者は、すべてのActive Meeting / Pitchbook / source materialを検索・参照できる。
- 利用者別、GP別、file別のretrieval ACLを初期版に実装しない。
- インターネット一般公開を前提としない。
- 将来、利用者ごとにsource accessを分離する要件が生じた場合だけ、新しいsecurity / architecture requirementとして再設計する。

## Apps Script server-function boundary

Apps Script HTML Serviceでは、top-level server functionは末尾`_`がない限り`google.script.run`から呼び出せる。`ksp` prefixやUI上の非表示は認証・認可境界にならない。通常利用者向けの公開関数は、実際のWeb App routeだけを列挙したcanonical facade allowlistに限定し、setup、validation、status、retention、manual sync、diagnostics、trigger、raw Drive / Docs / Sheets helperはprivate関数にする。`scripts/validate-public-surface.cjs`を`npm run check`へ組み込み、destructive helperの公開を回帰として失敗させる。

Public responsesはbackend / audit / folder / store IDs、credential state、private URLs、raw API payload、stack、source bodyを返さない。公開エラーは固定safe catalogと非機密error codeを使用する。詳細な実装エラーは通常利用者へ返さず、Auditにもsource contentやprompt本文を保存しない。

通常利用者向けfacadeは次だけである。

```text
doGet
getMeetingBootstrapData / registerMeeting
getPitchbookBootstrapData / preparePitchbookBatch / uploadPitchbookFile
getPhase1MaintenanceBootstrapData
searchMeetingRecords / getMeetingMaintenanceRecord / updateMeetingMaintenance / changeMeetingStatus
searchPitchbookRecords / getPitchbookMaintenanceRecord / updatePitchbookMaintenance / changePitchbookStatus
mutateMaster / quickAddGp
getKnowledgeSearchBootstrapData / searchKnowledge
previewKnowledgeExport / createKnowledgeExport / getKnowledgeExportPrompt / recordKnowledgeExportPromptCopy
```

## Web App execution and actor attribution

- 初期構成は、組織管理下のデプロイ主体としてWeb Appを実行し、Sheets / Shared Drive / Gemini API等のbackend権限をアプリ側へ集約する方式を第一選択とする。
- 実利用者emailが取得できる場合はAudit Actorとして記録する。
- emailが取得できない場合は、取得可能なら`Session.getTemporaryActiveUserKey()`を匿名Actorとして利用する。
- どちらも利用できない場合は`UNIDENTIFIED`を許容する。
- 恒久的な本人識別ができないことだけを理由に本番運用を停止しない。
- Temporary Active User Keyは恒久IDや本人確認手段として扱わない。

詳細Decision: `docs/decisions/audit-access-and-user-attribution.md`

## Credentials

Credentialの具体的保管方式は会社環境で実装時に確定するが、以下を必須とする。

- organization-approved ownership
- server-side only
- no hard-coded secret in repository
- no secret returned to browser
- rotation可能な構成

## Master permissions

- GP Master、Asset Class、Equity / Debt、面談場所のMaster変更は全利用者に許可する。
- 追加、名称変更、並び替え、無効化、再有効化を許可する。
- 物理削除は通常操作に含めない。
- 名称変更 / 無効化には確認ダイアログを表示する。
- Master変更を監査ログへ記録する。

## Audit policy

### Purpose

初期監査の目的は厳格な本人否認防止ではなく、運用トラブル追跡、変更履歴、AI利用状況、失敗調査である。

### Retention

- 監査ログは5年間保持する。
- 5年超のログは定期処理で削除する。

### Storage and access

- 通常backend 5シートとは別のAudit Spreadsheetへ保存する。
- Audit Spreadsheetは管理者専用control folderへ置く。
- Drive共有設定はRestrictedを基本とし、許可された管理者だけが直接閲覧できる状態にする。
- 通常利用者へAudit Spreadsheetを共有しない。
- 初期版ではWeb App内Audit Viewerを実装しない。
- 独自password / Sheet protectionを主要アクセス制御にせず、Google Drive共有権限をアクセス境界とする。

### Scope

少なくとも以下を記録する。

- Meeting: register / update / deactivate / reactivate
- Pitchbook: register / retry / metadata update / deactivate / reactivate / failure
- Master: add / rename / reorder / deactivate / reactivate
- AI layer: index / re-index / delete / retry / failure
- Knowledge Search: 全5モード実行

通常ログ項目:

- timestamp
- Actor
- Action
- Target type / ID
- Success / Failure
- changed fields
- before / after metadata when applicable
- Batch ID when applicable
- short error information when applicable

AI query追加項目:

- Search mode
- mode / filter metadata（Question / additional instruction本文は保存しない）
- Date From / To
- GP / Asset Class / Equity-Debt / Source Type filters
- configured Flash model ID
- cited source IDs when available

Gemini回答全文、retrieved chunk全文、Embedding、Meeting本文全文、Pitchbook内容を監査ログへ複製しない。

## Knowledge Export derived-copy risk

Knowledge Exportは`Knowledge Exports` sibling folderへ生成する派生コピーである。Meeting本文を含むGoogle Docs / PDFと、Pitchbook metadata / authoritative linkを作成するため、原本のアクセス権と同等以上に広い共有設定を許可しない。setupは親境界を検証するが、Workspaceの実効permission equivalence、共有リンク設定、削除・保持運用はDEVで確認してからproductionへ進める。自動expiry、履歴管理、削除UIは現行スコープ外であり、無期限蓄積を運用上のリスクとして扱う。

## Gemini File Search data handling

- Shared Drive: authoritative source
- File Search Store: derived retrieval index
- Google-managed chunks / embeddingsを利用し、初期版で独自Vector DBへ機密データを追加複製しない。
- Custom Metadataにはretrieval / citationに必要な固定ID、分類、Drive URL等だけを入れる。
- `未選択`等のUI状態をmetadataへ保存しない。
- File SearchからDocumentを削除してもShared Drive正本には影響させない。

## Logical deletion and AI synchronization

- 通常利用者はMeeting、Pitchbook、GP、Optionを物理削除せずActive / Inactiveで管理する。
- Meeting / PitchbookをInactive化した場合、対応File Search Documentを削除する。
- Reactivate時は現在のShared Drive正本をre-indexする。
- AI syncは15分おきのtime-driven workerで処理し、正本登録 / 更新の完了をGemini成功に依存させない。

## Initial AI baseline

- Gemini Flash系1モデルのみを使用する。
- 利用者向けmodel selector / Deep modeを設けない。
- initial AI-searchable formats: `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- `.eml`は原本をDriveへ保存し、Subject / From / To / Cc / Date / Body等を抽出したtextをindexする。
- `.eml`添付は自動indexしない。
- `.msg`は初期対象外とする。

## Release blockers for AI layer

以下が確認できない場合はAI検索を本番リリースしない。

- 会社承認済みGemini API / Google Cloud利用環境
- credentialの安全なserver-side保管
- Web App利用者全員が全Active検索対象へアクセスしてよいこと
- File Search派生データの保持 / 削除運用
- citationから正しい原資料へ戻れること
- Inactive資料が通常検索に混入しないこと
- Audit Spreadsheetが通常利用者から直接閲覧できないこと
- AI障害が正本データを破損させないこと

実利用者emailを取得できること自体はrelease blockerではない。

## GitHub data policy

GitHub上のtestには匿名化または合成データのみを使用する。実在のGP等を使う場合も、機密Meeting内容、credential、private URL等を含めない。

## References

- `docs/product/vision.md`
- `docs/architecture/target-architecture.md`
- `docs/planning/mvp-and-roadmap.md`
- `docs/planning/apps-script-implementation-plan.md`
- `docs/ai/gemini-file-search.md`
- `docs/operations/runtime-policy.md`
- `docs/decisions/audit-access-and-user-attribution.md`
