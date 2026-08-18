# Work 0013 完了レポート

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

検証日: `2026-08-18`

今回の実行契約ref: `99f8a2326af8b8afe43ccaa0836cdaf55ceeb921`

前回のruntime qualification ref: `8943123d8e258e4be07f8b172059870326eed2d3`

対象ブランチ: `agent/0013-consolidated-dev-live-qualification`

Draft PR: `#11`

## 結論

`MATRIX C PASS — 25 MiB boundary qualified`

今回のbounded Matrix C runでは、synthetic ASCII `.txt` を1 MiBから25 MiBまで昇順に
native file selectionし、通常のPitchbook登録を実行した。全6サイズで画面上の登録成功を
確認した後、各回のBackend / Drive / Auditを権威データで照合した。全てでIndex行1件、
`Active`、File_ID/File_URLあり、対応Driveファイル1件、`PITCHBOOK_REGISTER / Success`
Audit 1件、重複なしだった。

したがって今回のMatrix Cのlargest stable upload sizeは `25 MiB / 26,214,400 bytes`、
first reproducible failing sizeは `not established within supported range` と判定する。
25 MiB超のテスト、Matrix Aの再実行、Matrix Bのmalformed requestは行っていない。

このrunはqualification-onlyで実行し、source、tests、limits、architecture、product
documentation、deploymentは変更していない。変更対象はreport-onlyのhandoff文書だけである。

Date normalizationの診断・修正・決定的テスト・前回のsynthetic `04 / 05 / 06`
Active化は、completed diagnosis recordと既存reportの証跡を再利用した。今回のrunでは
再実行していない。

## Previous user-assisted browser qualification (retained)

### Matrix A — Current-Batch Active → Inactive → Active

Status: `FAIL (stopped at first manual application error)`

ユーザーが現行DEVの `04` 行について「無効化」を手動実行し、確認ダイアログで確定した。
画面には次の文言が表示された。

`管理処理を完了できませんでした。`

停止時のsafe evidence:

| Field | Evidence |
|---|---|
| affected saved filename | `2026-08-17_KSP_DEV_GP_0010_Renamed_PE_04.txt` |
| reserved sequence | `04` |
| visible safe error | `管理処理を完了できませんでした。` |
| Audit action/result | `PITCHBOOK_DEACTIVATE / Failure` |
| safe error code | `UNEXPECTED_ERROR` |
| Backend Status after error | `Active` |
| Backend File_ID / File_URL | present / present |
| Drive source file | one matching file remains |
| status mutation | not observed |
| Reactivate | not attempted |

Authoritative readbackでは、対象Backend行は `Active` のままで、sequence `04`、File_ID、
File_URLが維持されていた。Drive検索でも同名のsource fileは1件だった。Auditには
`2026-08-18T13:48:24.236Z` の `PITCHBOOK_DEACTIVATE` Failureがあり、safe error codeと
画面文言が一致した。原因調査や仮説検証は行っていない。

### Matrix B — Retry / duplicate protection

Status: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`

このrunではmalformed `sizeBytes` requestを作成していない。現在のnormal UIにはその操作が
なく、今回の実行でretry対象となる完全一致のsynthetic local file付きFailed/Pending
スロットも用意していない。新しい失敗、Index行、Driveファイル、retryは作成していない。

### Matrix C — Manual upload-size qualification

Status: `NOT RUN (stopped after Matrix A safe error)`

Matrix Aの停止後はnative file selectionを開始していない。したがって1MB〜25MBの
upload call、Drive/Index write、サイズ境界は未観測である。

Largest stable upload size: `not established`.

First reproducible failing size: `not established`; the run stopped before the upload path.

## Current bounded Matrix C — Practical browser upload boundary

Status: `PASS`

The existing approved synthetic DEV Web App was used without redeployment. The user completed
native file selection and normal Pitchbook registration one file at a time in strict ascending
order. No production or confidential data was used.

| Size | Native selection | Upload/application path | Result | Index rows | Status | File_ID/File_URL | Drive files | Audit |
|---:|---|---|---|---:|---|---|---:|---|
| 1 MiB / 1,048,576 bytes | completed | reached | PASS | 1 | Active | present / present | 1 | 1 Success |
| 5 MiB / 5,242,880 bytes | completed | reached | PASS | 1 | Active | present / present | 1 | 1 Success |
| 10 MiB / 10,485,760 bytes | completed | reached | PASS | 1 | Active | present / present | 1 | 1 Success |
| 15 MiB / 15,728,640 bytes | completed | reached | PASS | 1 | Active | present / present | 1 | 1 Success |
| 20 MiB / 20,971,520 bytes | completed | reached | PASS | 1 | Active | present / present | 1 | 1 Success |
| 25 MiB / 26,214,400 bytes | completed | reached | PASS | 1 | Active | present / present | 1 | 1 Success |

The six corresponding synthetic filenames were `KSP0013_MatrixC_01MiB.txt`,
`KSP0013_MatrixC_05MiB.txt`, `KSP0013_MatrixC_10MiB.txt`, `KSP0013_MatrixC_15MiB.txt`,
`KSP0013_MatrixC_20MiB.txt`, and `KSP0013_MatrixC_25MiB.txt`. Each Drive file's observed
byte size matched the requested exact size. Each Backend row had one coherent batch/document/
sequence allocation and no duplicate Index row or Drive file was found. Audit entries were
metadata-only registration records with no error code or error message.

Largest stable upload size: `25 MiB / 26,214,400 bytes`.

First observed failing size: `not observed`.

First reproducible failing size: `not established within supported range`.

No size above the accepted 25 MiB boundary was tested. Matrix A and Matrix B were not rerun.

## Prior automated runtime qualification evidence

### Previous automated runtime Matrix A — Current-Batch Active → Inactive → Active

Status: `FAIL (stopped at first unexpected result)`

事前に現行DEVの検索画面で、対象の `06` 行について次を確認した。

- rendered Date: `2026-08-17`
- saved filename: `2026-08-17_KSP_DEV_GP_0010_Renamed_PE_06.txt`
- visible Status: `Active`
- 「開く」Drive link: visible
- 検索画面のvisible status: `10件を表示しました。`
- browser error log: 0件

「編集」を1回実行したが、期待した編集カードが表示されず、Date / Updated Atの
読み取りへ進めなかった。アプリケーションのsafe error code/messageは表示されなかった。
この時点でstatus mutationは実行していないため、Active行・Drive・Indexへの変更はない。
再クリック、Inactive、Reactivate、原因調査は行っていない。

停止証跡:

| Field | Evidence |
|---|---|
| failed step | Active `06` rowの編集カード事前読取 |
| expected | 編集カード表示、Date / expected Updated At読取 |
| observed | 編集カード非表示、visible errorなし |
| safe application error code | なし |
| visible browser errors | 0件 |
| mutation after stop | なし |
| Index / Drive / Audit detailed counts | この停止点では未取得 |

### Previous automated runtime Matrix B — size mismatch → same-slot retry → duplicate protection

Status: `DEFERRED (controlled request not executed)`

現行normal public Web App UIには、選択ファイルの実サイズに対して送信
`sizeBytes`だけを `actual + 1` にする操作がない。DEVのApps Script API executableを
使った公開関数の引数実行経路も、既存の管理者経路確認で利用不能と記録されている。

したがって、予約Batchを作成して不完全な状態を残すことを避け、controlled mismatch
call自体を送信しなかった。Matrix Bについて新しいIndex行、Driveファイル、Audit行は
作成していない。size-mismatch / same-slot retry / idempotent replayのdeterministic
testsと前回のserver-side evidenceはPASSだが、今回のlive Matrix BのPASSとは判定しない。

### Previous automated runtime Matrix C — Practical browser upload boundary

Status: `FAIL (stopped before first upload)`

Round 1の1MB synthetic TXT fileを用意した。filechooser API経路を試したところ、選択前に
filechooser eventがtimeoutした。その後、現行DEVのネイティブ選択UIを開くための操作で
ブラウザ対象が閉じた。ファイル選択、FileReader、Apps Script upload call、Drive/Index
writeは発生していない。

安全な停止証跡:

- safe application error code: なし
- filechooser stage: selection前にtimeout
- fallback native-picker stage: browser target closed while handling the command
- upload response: 未取得
- final row Status: 未作成のため該当なし
- File_ID / File_URL: 未作成のため該当なし
- new Drive / Index row: なし
- retry/escalation: 指示に従い実施していない

### Upload-size table

| Nominal size | Synthetic file | FileReader/base64 | Apps Script call | Final status | Drive/Index evidence |
|---:|---|---|---|---|---|
| 1MB | prepared | NOT EXECUTED | NOT EXECUTED | STOPPED before selection | no new row/file observed |
| 5MB | not attempted | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED after Round 1 stop | no new row/file observed |
| 10MB | not attempted | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED after Round 1 stop | no new row/file observed |
| 15MB | not attempted | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | no new row/file observed |
| 20MB | not attempted | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | no new row/file observed |
| 25MB exact | not attempted | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | no new row/file observed |

Largest stable upload size: `not established`.

First reproducible size failure: `not established`; the observed stop occurred before any
size-dependent upload request.

## Scope and safety

- このrunで変更したtracked fileはreportだけ。
- source / tests / limits / architecture / product documentationは変更していない。
- synthetic DEV dataだけを使用し、production、confidential data、credentials、tokens、
  private IDs、private URLsは報告書へ記録していない。
- public qualification wrapper、debug endpoint、temporary source changeは追加していない。
- 前回のMatrix A停止時には、再クリック・再試行・原因調査を行わなかった。今回のMatrix Cでは
  各サイズを権威確認してから次へ進み、25 MiB後の上限超えテスト、再試行、別仮説は行っていない。

## Prior evidence retained

- Date canonical key、slot fingerprint、sequence継続、native Date preservation:
  completed diagnosis recordのPASSを再利用。
- 現行DEVのsynthetic `04 / 05 / 06` Active化、Drive link、`2026-08-17` date readback:
  前回reportのPASSを再利用。
- deterministic retry/idempotency and size validation:
  local tests / prior server-side evidenceのPASSを再利用。今回のlive Matrix B/CのPASSとは分離。

## 今回のローカル検証

```text
npm run check
  NOT RERUN — source/tests unchanged; prior PASS retained above.

npm run test
  NOT RERUN — source/tests unchanged; prior PASS retained above.

git diff --check
  PASS — no whitespace errors.
```

## Delivery

- 前回までのreport-only commitは維持する。
- 今回は `docs/handoffs/0013-report.md` のevidenceだけをreport-only commitとしてcommit・pushする。
- Draft PR #11はDraft / 未mergeのまま更新する。
- mergeは実行しない。
