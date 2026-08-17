# Work 0013 完了レポート

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

検証日: `2026-08-18`

対象ブランチ: `agent/0013-consolidated-dev-live-qualification`

開始時点の指定ref: `3b780deaa13693eab1325bfd0367cb0a502ca5c7`

Draft PR: `#11`

最終commit: delivery response に記載

## 結論

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

Pitchbook_Index の Date が Apps Script の native `Date`、`YYYY-MM-DD`、保存済み
ISO date string のいずれで返っても同じ canonical date key になるよう修正した。
`kspBuildPitchbookSlotFingerprint_` と `reservePitchbookBatch` の `sameContext`
判定を同じ helper に統一し、既存行を予約判定のために書き換えないことを決定的
テストで固定した。

現行DEVでは synthetic 3ファイルの新規 Batch を登録し、同一 context の保存済み
sequence `01`–`03` に続く `04`–`06` として、3件すべてが `Active` になった。
検索結果には各行の「開く」リンクが表示され、編集フォームの日付は
`2026-08-17` として読み戻された。production / confidential dataは使用していない。

## コード変更

- `src/62_PitchbookIdentity.gs`
  - `kspCanonicalPitchbookDateKey_` を追加。
  - slot fingerprint の Date 部分を canonical date key に変更。
- `src/81_PitchbookReservationAdapters.gs`
  - `sameContext` の Date 比較を canonical date key 比較に変更。
  - 既存 `Pitchbook_Index` 行への不要な Date 書き込みは追加していない。
- `src/100_MaintenanceCore.gs`
  - 実DEVで観測した persisted ISO date string が編集フォームで空になる事象を、
    `YYYY-MM-DD` へ正規化して修正。
- `tests/pitchbook.test.cjs`
  - Date / date string / ISO string の同一 key、fingerprint 一致、sequence 継続、
    native Date の保持を回帰テスト。
- `tests/maintenance-core.test.cjs`
  - persisted ISO date string の検索結果日付を回帰テスト。

## 観測マトリクス

| Matrix | Status | Evidence / limitation |
|---|---|---|
| Exact ref / branch / Draft PR | PASS | 指定refを起点に対象branchを確認。Draft PR #11はDraft / 未mergeのまま維持。 |
| AGENTS / handoff / prior reports | PASS | rootおよび適用nested `AGENTS.md`、resume instruction、Work 0010–0012の関連証跡を確認。 |
| Mandatory independent reviews | PASS | public/private surface、Pitchbook、Knowledge Export、security/reportの独立read-onlyレビューを実施。 |
| Date canonical key | PASS | native Date、`YYYY-MM-DD`、ISO date string が同じ keyになる決定的テストに合格。 |
| Slot fingerprint | PASS | prepared slotとPitchbook_Index相当行の Date 表現が違っても fingerprint が一致。 |
| Sequence continuation | PASS | 決定的テストで `05`、後続Batchで `06`。現行DEVでも新Batchが `04`–`06` となり `01` に戻らないことを確認。 |
| Existing native Date preservation | PASS | 予約・upload回帰テストで既存native Date objectの値・参照を保持。既存行への不要な書き換えなし。 |
| Current DEV Web App load | PASS | 公式 Apps Script UIで作成した現行DEV Web Appを読み込み、Pitchbook画面と選択肢を確認。browser error logは空。 |
| Synthetic Pitchbook Batch | PASS | `pb-alpha.txt`、`pb-beta.txt`、`pb-gamma.txt` を登録。保存名の sequence `04`、`05`、`06` が検索結果に表示され、3件すべて `Active`。 |
| File_ID / File_URL evidence | PASS | 3件すべてに「開く」リンクが表示され、File_ID/File_URLがIndexからUIへ渡されたことを確認。値そのものは報告書へ記録していない。 |
| Metadata date readback | PASS | 新Batchの編集フォームで日付 `2026-08-17` を読み戻し。実DEVで観測したISO string表示欠落を再発させないことを確認。 |
| Pitchbook retry / duplicate protection | PASS (bounded) | deterministic retry/idempotency testsはPASS。現行DEVでは既存Pending行を新Batchで再利用せず、04–06を新規保存。native retryの再操作とDriveの重複なしを別Batchで再確認する matrixはDEFERRED。 |
| Active / Inactive / Reactivate | DEFERRED | 現行DEVの検索・Active・編集・リンクは確認。確認ダイアログを伴う status mutation はブラウザ接続がタイムアウトしたため、前回PASS証跡を再利用し、今回の新Batchでは追加操作を行っていない。 |
| Practical upload limit | DEFERRED | 小さいsynthetic filesの登録のみ。25MB boundaryの実ブラウザtransport qualificationは未実施。 |
| Private setup / validation / status / trigger path | DEFERRED | private functionはeditor selectorに出ず、DEV API executableも作成できなかった。public wrapperは追加していない。 |
| Knowledge Export real Docs / PDF / hyperlinks / Audit | DEFERRED | Work 0011–0012のdeterministic/fake testsとprior evidenceはPASS。authenticated DEVの実Docs/PDF、Audit非本文、clipboard readbackは未観測。 |
| Disposable Shared Drive | DEFERRED | authorized disposable Shared Driveがないため、My Drive相当のDEV結果から推測していない。 |
| Gemini / File Search | DEFERRED | Work 0010のlocal/deterministic evidenceを再利用。credential、billing、Storeを要求・入力・記録していない。 |
| Production readiness | NOT APPLICABLE | production deployment、production permission、全外部qualification matrix未完了のため主張しない。 |

## Deployment / 安全境界

- 認証済みDEV環境のみを使用し、登録ファイルはsynthetic dataだけとした。
- credentials、API key、token、private resource ID、private URL、source bodyをGit、
  report、PRへ記録していない。
- `clasp` 操作中、既存の古いdeploymentをCLIで更新した際にWeb Appではなく一時的な
  library deploymentとなり、旧Web App URLが利用できなくなった。これはsourceの
  欠陥ではなくdeployment操作の事象である。公式 Apps Script UIで現行sourceの新しい
  DEV Web Appを作成し、そこだけを現行qualification対象とした。誤った一時deployment
  は対象を限定して整理し、現行DEV Web Appは削除していない。
- 未追跡のローカル `.clasp.json` は、DEV resource情報を含むためcommit対象から除外し、
  最終worktreeから削除した。
- production deploy、production resource変更、merge、force-push、破壊的Git操作は
  行っていない。

## 最終ローカル検証

```text
npm run check
  PASS — `Validated 46 Apps Script source files, 11 HTML files, and available manifest.`;
  `Validated Apps Script public facade: 23 public, 360 private top-level functions.`;
  tests 156/156 PASS, 0 failed, 0 skipped.

npm run test
  PASS — tests 156/156 PASS, 0 failed, 0 skipped.

git diff --check
  PASS — exit code 0、whitespace errorなし（改行コード変換warningのみ）。
```

## 残存する外部qualification gap

現行DEVの新規Pitchbook Batch、Active化、File link、sequence継続、Date readbackは
確認済み。残るのは native retryの別ケース、実ブラウザ25MB境界、status確認ダイアログ、
private administrator path、実Docs/PDF/clipboard/Audit readback、Shared Drive、
Gemini/File Searchである。必要な権限・API経路・環境がないものは推測せず `DEFERRED`
とした。今回の実装BLOCKERは観測していない。

## Delivery

- このreportとDate canonical normalizationのsource / testsを対象branchへcommit・pushする。
- Draft PR #11をDraftのまま更新する。
- mergeは実行しない。
