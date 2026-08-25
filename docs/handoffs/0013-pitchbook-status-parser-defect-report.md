# Work 0013 Pitchbook status parser defect report

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Instruction ref: `1e03f5f61124c562eebc5e958743a43328be87cb`

Branch: `agent/0013-consolidated-dev-live-qualification`

Draft PR: `#11`

Implementation commit: `8bddc4067fcdc9d57885cb8321e353cd52bfedf7`

検証日: `2026-08-18`

## 結論

`BLOCKER: NO`（このPitchbook status parser defectについて）

単一の既定仮説どおり、保守処理が存在しない
`kspParsePitchbookDocumentId`を呼び出していた。実装を既存のprivate parser
`kspParseDocumentId_`へ置換し、status処理とedit validatorの決定的回帰テストを
追加した。修正版を既存のsynthetic DEV Apps Scriptプロジェクトへ反映し、同じ
DEV Web Appの既存deploymentを新しいversionへ更新した。

現行DEVのsynthetic `PE_04`で、通常UIから次の1回のラウンドトリップを確認した。

`Active → Inactive → Active`

各status変更は1回だけ実行し、Backend / Audit / Driveの権威データで確認した。
File_IDとFile_URLは変わらず、Drive上のsource fileは各状態で1件のままだった。
Matrix C（practical browser upload-size qualification）はこのrunでは実施していない。

## Pre-fix reproduction

指定ref時点のproduction-faithful VMで、実parser
`kspParseDocumentId_`が有効である一方、古いsymbol
`kspParsePitchbookDocumentId`が未定義であることを確認した。

- status deactivationは`ok: false`、safe error codeは`UNEXPECTED_ERROR`、表示文言は
  `管理処理を完了できませんでした。`となった。
- status mutationは実行されず、対象行は`Active`のまま、Auditは
  `PITCHBOOK_DEACTIVATE / Failure / UNEXPECTED_ERROR`となった。
- edit validatorは`ReferenceError: kspParsePitchbookDocumentId is not defined`を
  発生させた。
- `File_ID`、`File_URL`、既存Drive fileは事前再現中に変更されなかった。

## Source and regression changes

- `src/111_MaintenancePitchbookMasterService.gs`
  - status変更前のDocument ID検証を`kspParseDocumentId_`へ修正。
- `src/100_MaintenanceCore.gs`
  - Pitchbook edit validatorのDocument ID検証を`kspParseDocumentId_`へ修正。
- `tests/maintenance-test-loader.cjs`
  - production identity source `62_PitchbookIdentity.gs`をロード。
  - stale parserのtest-only fakeを削除。互換aliasは追加していない。
- `tests/maintenance-service.test.cjs`
  - valid status changeが成功し、status、File ID、File URL、Audit success、filenameを
    保持することを追加検証。
- `tests/maintenance-core.test.cjs`
  - valid Document IDのvalidator成功と、invalid IDが
    `PITCHBOOK_DOCUMENT_ID_INVALID`になることを追加検証。

`src` / `tests`内に`kspParsePitchbookDocumentId`の実行可能な残存呼出しがないことも
確認した。public facade allowlistやUI、Drive処理、別のroot-cause候補は変更していない。

## DEV deployment and live Matrix A

認証済みの既存synthetic DEV projectへ、temporary local clasp configurationをcommit
せずにsource 58 filesをpushした。その後、同じ既存Web App deploymentを新しい
Apps Script versionへ更新し、同じDEV URLを再読み込みした。temporary configuration
とstaging filesは反映後に削除し、production project / dataは使用していない。

対象は既存のsynthetic `PE_04`行（sequence `04`、saved filename
`2026-08-17_KSP_DEV_GP_0010_Renamed_PE_04.txt`）である。

| Step | Status | Authoritative evidence |
|---|---|---|
| Pre-state | PASS | Backend `Active`、File_ID/File_URL populated、Drive source file count `1`、既存の失敗Auditのみ。 |
| Normal UI deactivation | PASS | 「無効化」を1回だけ実行。Backend `Inactive`、`PITCHBOOK_DEACTIVATE / Success`、File_ID/File_URL unchanged、Drive file count `1`。 |
| UI readback after deactivation | PASS | 最初の即時DOM読み取りでは表示が更新前だったが、追加クリックなしで検索を1回再読込後、`Inactive / 再有効化`を表示。 |
| Normal UI reactivation | PASS | 「再有効化」を1回だけ実行。Backend `Active`、`PITCHBOOK_REACTIVATE / Success`、File_ID/File_URL unchanged、Drive file count `1`。 |
| UI readback after reactivation | PASS | 検索を1回再読込後、`Active / 無効化`を表示。 |

Auditのstatus変更イベントはmetadata-onlyで、source bodyやcredentialsを含まない。
Drive sourceの削除、重複作成、renameは発生していない。ブラウザconsoleのerror / warning
は観測されなかった。

## Validation

| Check | Result |
|---|---|
| Pre-fix focused reproduction | PASS — stale symbolによる`ReferenceError` / `UNEXPECTED_ERROR`を再現。 |
| Post-fix focused parser regressions | PASS — 2 tests, 2 passed, 0 failed。 |
| Stale call inventory | PASS — `kspParsePitchbookDocumentId`残存なし。 |
| `npm run check` | PASS — Apps Script 46 source、HTML 11、manifest validation、tests 158/158。 |
| `npm run test` | PASS — tests 158/158、failed 0、skipped 0。 |
| `git diff --check` | PASS — exit 0。CRLF変換に関するGit warningのみ。 |

## Scope boundary and remaining work

このrunは既定のparser defectの実装・回帰・Matrix Aだけを扱った。Matrix Cは再開
していない。実ブラウザupload-size境界、別のupload retry matrix、Docs/PDF、clipboard、
Shared Drive、Gemini/File Searchなど、Work 0013の残りのqualificationはこのreportの
PASSには含めない。

Credentials、tokens、private resource IDs、private URLs、production dataはreportや
commitへ記録していない。mergeは実行していない。
