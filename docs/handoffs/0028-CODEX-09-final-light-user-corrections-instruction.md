# Work 0028 / Dispatch 0028-CODEX-09 — final Light user corrections

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-09
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.12 / LIGHT-ONLY FINAL USER CORRECTIONS / DESIGN ONLY

## Goal

Draft PR #45をvisual baselineとして、ユーザーが確定した最後のLight修正をdesign-onlyで反映し、最終visual acceptanceに必要なreview packageを返す。

## Source of truth / context

開始時に最新`main`、root / nearest `AGENTS.md`、以下のdecisionを確認すること。

- `docs/handoffs/0028-CODEX-09-analytics-meeting-type-columns-decisions.md`
- `docs/handoffs/0028-CODEX-09-knowledge-search-layout-and-mode-policy-decisions.md`
- `docs/handoffs/0028-dispatches.md`

Prepared branch:
`codex/0028-final-light-user-corrections`

PR #45 / head `2a1843048f76b6a48cec35fcdfe2c5b116c7e3dd` は現行Light visual baseline。新しいDraft PRはprepared branchから`main`向けに作成する。PR #45を直接更新しない。

PR #45のdesign artifactsを引き継ぐ際、current `main`のcontroller files（特に`docs/handoffs/0028-dispatches.md`、`docs/planning/work-registry.md`）を古いbranch内容で上書きしない。

## Required design corrections

### 1. 面談実績の集計 — 下部Meeting一覧

visible columnsを次の順に固定する。

`日付 / 面談先 / Asset Class / Team / 原資料 / 年1回面談 / オフィス訪問 / 年次総会 / 確認済み`

既存`meetingTypeCodes`を使い、各種別列は該当`○`、非該当`—`。1行で複数`○`を許容する。

- `ANNUAL_REVIEW` → 年1回面談
- `OFFICE_VISIT` → オフィス訪問
- `ANNUAL_GENERAL_MEETING` → 年次総会

`Fund / Strategy`はこの一覧だけから外す。`確認済み`は右端のまま既存mappingを示す。

### 2. Sidebar gold icons

PR #45より明確に強いgold metallic presenceへ改善する。

- bright highlight + rich gold + antique shadow
- gradient / duotone / subtle shadow可
- slightly heavier / semi-filled icon family可
- 必要ならpermissive-licenseの外部SVG familyをlocal vendor可
- runtime CDN / remote fetch禁止
- license / attribution requirementがあればrepositoryに保持
- 7 destinationsで統一感を保つ
- brand / separatorも同系gold material languageへ整合
- neon、強いglow、animation、過度なchromeは避ける

PR #45との差が分かるsidebar review screenshotを残す。

### 3. Knowledge Search — 情報ソース

user-facing labelを`情報ソース`へ変更し、表示選択肢を固定する。

- `面談記録・資料` → Meeting + Pitchbook
- `面談記録のみ` → Meeting
- `資料のみ` → Pitchbook

通常AI検索のexisting File Search / provider filter / citation / source identityはdesign上維持する。

`全文出力（AIを使わない）`は`面談記録のみ`固定のdesignとし、Pitchbook本文・Pitchbook参照リンクを対象に含めない。

### 4. Knowledge Search — primary layout

検索条件cardのprimary areaを3段にする。

Row 1:
`GP / 情報ソース / 開始日 / 終了日 / 全期間`

Default periodはrolling 3 years。design fixtureではcurrent review dateに整合する具体例を使ってよい。`全期間`はdefault OFF。ON stateではdate inputsをdisabled / visually inactiveとする。OFFへ戻すと同一画面内の直前値を復元するinteraction contractをannotationに明記する。

Row 2:
`検索モード / AIモデル`

現行user-facing `使用モデル`は`AIモデル`へ改称。Thinkingは通常ユーザーへ表示しない。

Row 3:
card幅いっぱいのwide / larger `質問` textarea。

既存のその他filterは`詳細条件`disclosureへ維持する。

### 5. Search mode preset design

`自由質問`:
- editable / required
- protected baseline
- 削除不可 / 無効化不可のdesign cue

非自由質問mode:
- 管理者定義の固定質問 / 指示文をtextareaへ自動表示
- muted gray text + gray read-only surface
- `readonly`相当のinteractionとして、内容確認 / copyは可能、変更不可
- 自由質問へ戻した際は自由質問draftを復元するinteraction contractをannotationに記載

管理者ページへ`検索モード設定`section designを追加し、少なくとも以下を確認可能にする。

- 表示名
- 固定質問 / 指示文
- 有効 / 無効
- 表示順
- generic preset追加

既存special modesはdesign上意味を失わせない。

- `比較`: existing 2–5 Entity semantics
- `面談準備`: existing target requirement

新規modeは`GENERIC_PRESET`相当として扱い、新しい特殊validationを発明しない。

このadmin-managed preset persistence / server-side authoritative prompt resolutionはfuture production BUILD requirementであり、CODEX-09では実装しない。design annotationで「client readonlyだけではなくproductionではserverがstable mode IDからfixed promptを解決する」ことを明記する。

## Constraints / preserved conclusions

- design-only。`src/**` / `dist/**`を変更しない。
- deploy / runtime / production implementationを行わない。
- Dark / System / theme selectorを作らない。
- sidebar destinationsは7のまま。
- sidebar base `#182124`、active `#E1001F` thin left strip only、ordinary UI redなし。
- Past Records relation integrationを維持。
- Work 0027 Gemini qualified-disabled / normal-user hiddenを維持。
- Work 0029 shared-admin security contractを変更しない。
- Meeting / Pitchbook source contract、existing five-mode special semantics、provider/citation contractをdesign都合で壊さない。

## Required output

- 新しいDraft PR（main向け）
- updated Light design artifacts
- key screenshots / review index
- validation evidence
- `docs/handoffs/0028-CODEX-09-final-light-user-corrections-report.md`

最低限のreview screenshots:

1. Knowledge Search / 自由質問 / rolling 3-year default
2. Knowledge Search / 非自由質問preset / gray read-only fixed prompt
3. Knowledge Search / 全期間ON
4. 管理者ページ / 検索モード設定
5. 面談実績の集計 / 下部Meeting一覧
6. sidebar gold icon final state（PR #45との差が確認可能）

## Validation / acceptance evidence

- required correctionsが全てvisibleに反映
- 1366×768 horizontal overflow 0
- sidebar destinations exactly 7 / active exactly 1
- Product Design QAでactionable P0/P1/P2 = 0
- browser console warning/error 0 in static harness
- `git diff --check` PASS
- repositoryの既存deterministic validation / `npm run check`を影響範囲に応じて実行し結果をreport
- changed-path reviewでproduction `src/**` / `dist/**` = NONE
- external icon asset使用時はlicense / local-vendor / no-runtime-dependency evidenceをreport

## Done

上記evidenceとscreenshotsが揃い、BLOCKERがなく、Draft PRとreportを作成したらChatGPTへ返却する。

返却時は以下を冒頭と末尾に示す。

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-09
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.12 / LIGHT-ONLY FINAL USER CORRECTIONS / DESIGN ONLY
```
