# Work 0039 — 月次面談確認フローの回帰調査

WORK_ID: 0039
STATUS: RESOLVED
MODE: INVESTIGATION / RESOLVED
DATE: 2026-09-20

## Primary Outcome

「面談実績の集計」で、事務担当者が月次でMeeting Typeを確認し、各Meetingを確認済みcheckboxで管理する業務フローが現在見えなくなっている理由を特定し、復元方針を決める。

## Accepted historical evidence

### Work0017 / PR #23

Work0017でMeeting Activity Analyticsとmonthly admin checkを実装・実機認定。

- schema5で`Admin_Check_Completed` / `Admin_Check_Updated_At` / `Admin_Check_Updated_By`をMeeting_Indexへ追加。
- `updateMeetingAdminCheck` pathでtrue -> reload -> falseをactual runtime認定。
- metadata-only Audit、Meeting Version/Updated/Doc/follow-up/AI非変更。
- current backend/live implementationにもatomic update pathが残る。

### Work0028 final Light design / PR #44

final Light designでは、独立した月次面談一覧を`面談実績の集計`へ統合し、個別Meeting一覧の右端へ`確認済み`checkboxを置くことを明示。

`確認済み`は既存`adminCheckCompleted` / `updateMeetingAdminCheck` / expected timestamp semanticsへmappingするdesign contractだった。

ただしPR #44はdesign/docs onlyで、production `src/**` / `dist/**` diffはNONE。

### Work0028 production implementation / PR #51

production Light buildではActivity Analyticsのproduction filesを変更していない。

PR #51のActivity Analytics関連production diffはなく、Work0017由来の旧UI/rendererをそのまま保持した。

そのためPR #44で確定した「該当Meeting一覧の右端checkbox」presentationはproductionへ移植されなかった。

## Current implementation findings

### 1. Backend機能は消えていない

現行`src/127_ActivityAnalyticsLiveEnvironment.gs`に`updateMeetingAdminCheckAtomic`が残る。

現行`src/126_ActivityAnalyticsService.gs`のMeeting read modelには:
- `adminCheckCompleted`
- `adminCheckUpdatedAt`
- `adminCheckUpdatedBy`

が含まれる。

現行`src/ClientActivityAnalytics.html`にも`updateMeetingAdminCheck` RPC wiringが残る。

### 2. 月次管理cardはsingle-month限定

現行serviceは:

```text
singleMonth = period === monthly && series.length === 1
adminChecks = singleMonth ? drill.records : []
adminCheckAvailable = singleMonth
```

としている。

frontendは`adminCheckAvailable === false`なら`activity-admin-check-card`を`hidden-panel`にする。

### 3. Work0037の1-year defaultで通常状態から見えなくなった

Work0037でActivity Analyticsの初期date rangeを`終了日 - 1 calendar year`へ変更した。

period modeの既定`monthly`に対して1年rangeを渡すためseriesは複数月bucketとなり、`series.length === 1`を満たさない。

結果として通常の初期表示では`adminCheckAvailable=false`となり、legacy月次管理cardが常時隠れる。

Work0037はadmin check機能を削除したわけではないが、legacy表示条件と新しいdefault rangeが非整合になった。

### 4. 該当Meeting tableのheader/rendererが不整合

現行`ActivityAnalyticsPage.html`の該当Meeting table右端headerは`月次管理`。

しかし`ClientActivityAnalytics.html`の`activityRenderDrill`は右端cellに`Doc` linkを描画している。

checkboxは描画していない。

この不整合はWork0017時点のproduction rendererにも存在し、PR #44のLight designで直す意図は示されたがproduction buildへ移植されなかった。

### 5. Meeting Typeはデータあり、表示だけ不十分

現行drill recordには`meetingTypeCodes`があり、backend canonical definitionsも保持:
- `ANNUAL_REVIEW` -> `定例年1回`
- `OFFICE_VISIT` -> `先方オフィス訪問`
- `ANNUAL_GENERAL_MEETING` -> `年次総会`

しかしcurrent drill rendererはraw codeをcomma joinして`Team / Type` cellへ表示するだけ。

事務担当者向けの判別性が落ちている。

## Root cause

単一の削除commitではなく、次の積み重ね:

1. Work0017: backend + separate monthly admin check cardを実装。
2. Work0028 final Light design: inline checkboxへ統合するdesignを確定。
3. Work0028 production build: Activity Analytics production sourceへそのdesignを移植しなかった。
4. Work0037: default rangeを1年へ拡大した結果、single-month限定legacy cardが初期状態で非表示になった。

したがってcurrent productはbackend capabilityを保持している一方、user-facing monthly workflowだけが事実上退行している。

## Closed Conclusions

- schema追加不要。
- migration不要。
- 新しいstorage不要。
- `updateMeetingAdminCheck` / optimistic concurrency / Audit semanticsは再利用する。
- 直すべき主対象はActivity Analyticsのfrontend presentationとread-model label整形。
- Work0038とは別theme。PR #60のUI refinementとは分離する。
## Resolution

PR #61 merged at `4fe28048e90df1a264dea836e8909d80ada0be57`.

Root cause was repaired by restoring the intended inline administrative workflow in the drill list:
- canonical Meeting Type labels
- dedicated 原本 column
- autosave 確認済み checkbox
- all-range visibility
- legacy separate card removal

Accepted served version: 19.

Completion: `docs/handoffs/0039-completion-report.md`