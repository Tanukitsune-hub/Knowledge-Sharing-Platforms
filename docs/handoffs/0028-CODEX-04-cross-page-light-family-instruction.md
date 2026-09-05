# Work 0028 — selected Light cross-page visual family

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-04
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.6 / CROSS-PAGE LIGHT FAMILY / DESIGN ONLY

## Outcome

選択済みのKnowledge Share Lightデザインを、現行の全主要ページへ同一デザインシステムとして横断展開し、ページごとの入力欄・情報配置・一覧密度・状態表示が実務上使いやすいかを確認できるvisual familyを作成する。

これはproduction実装ではない。`src/**`、`dist/**`、Apps Script runtime、deployment、provider、credentials、backend/data contractは変更しない。

今回の成果物は、ユーザーとChatGPTが「見た目は全ページで統一しつつ、各画面の入力欄配置や情報階層をどこまで調整するか」を判断するための設計資料である。

## Starting point

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Dispatch作成時のreviewed main: `b72cbaa1cdc9321bed2a477e8d2f8eb71d806223`

開始時には必ず最新mainを取得し、実際のsource SHAを記録する。Work 0029はACCEPTED済みで再オープンしない。Draft PR #40 / CODEX-03のA/B/C画像は方向性の参考であり、誤記・control欠落を含むためpixel-perfect source of truthではない。

Read first:

- applicable `AGENTS.md` / `AGENTS.override.md`;
- `docs/planning/work-registry.md`;
- `docs/handoffs/0028-dispatches.md`;
- this instruction;
- `docs/handoffs/0028-instruction.md`;
- `docs/decisions/ui-surface-language-and-backend-preservation.md`;
- `docs/planning/work0028-ui-ux-and-theme-plan.md`;
- `docs/product/vision.md`;
- `docs/handoffs/0027-dispatches.md`;
- `docs/handoffs/0029-dispatches.md`;
- Draft PR #40 design artifacts and its documented errata.

ユーザーがCodex conversationへ添付する最新の選択済みLight reference imageがある場合、それをvisual style referenceとして直接確認する。ただし画像の文字・control・機能はsource contractより下位であり、ImageGen由来の誤りを実装仕様として採用しない。

## Closed visual language — do not redesign

全ページで次を共通デザインシステムとして固定する。

- persistent left sidebar / desktop-first wide-screen layout;
- sidebar base: `#182124`をsemantic tokenとして扱う。将来の微調整が容易な構造を前提にする;
- main content: bright Light surface, warm white〜off-white;
- restrained gold line/icon/text accents;
- sidebar lower-left: 正確な幾何学の`紗綾形`をsubdued gold lineworkで配置し、右上方向へ徐々に薄く消す。生成画像の崩れた模様を複製しない;
- active sidebar item: existing selected background/border/text treatmentに加えて、左端にのみNippon Life corporate red `#E1001F`の細い縦帯;
- `#E1001F`はこの縦帯以外に使わない。button/icon/title/border/link/warning/chart/decorative motif等では禁止;
- Light contentのborder、input、button、table、card、focus/selected stateは操作可能領域が明確に見える程度に輪郭を残す;
- visual ornamentはpremium / restrained。山、鉱石、東京駅、菊、桜、日本生命ロゴ等の別モチーフは追加しない;
- Knowledge SearchはA-like linear clarity、record/maintenance listはC-like moderate density、shell/navigationはB-like workspace;
- chartは将来のDarkでも`CHART_SURFACE_THEME: LIGHT_FIXED`。今回はDarkを作らない。

このWorkでは色・装飾の新しいBest-of-N比較をしない。上記はユーザー選択済みであり、変更案を増やさず全ページへ適用する。

## Functional preservation

Work 0027/0029までのaccepted behaviorを維持する。

- five-sheet backend, stable IDs, metadata/source contracts;
- Meeting/Pitchbook registration/edit/locking/lifecycle;
- Active / Inactive / Reactivate internals and restore eligibility;
- existing facade/server contracts;
- Knowledge Search five modes, filters, 2–5 Entity comparison, provider/model/thinking policy, citations/source identity;
- explicit ChatGPT / Gemini / 全文出力 semantics and no cross-provider failover;
- current Gemini disabled/hidden baseline;
- Work 0029 shared-admin password/session/logout/password-change behavior;
- installer/bundle/security/authorization boundaries.

デザインのために新しいsheet/database/API/provider/index/relation/migration/background workflow/KPI/pagination/bulk action/saved search等を発明しない。良い見た目がbackend redesignを要求する場合はデザイン案側を変更する。

## Required source audit and page family

最新sourceから実在するページ・field・control・conditional visibilityを確認する。最低限、以下の画面群を同一visual languageで設計する。

1. Knowledge Search
   - question, mode, execution route, model/thinking, filters, detailed filters;
   - loading/long-running/recheck, answer, insufficient evidence, citations/source, empty/error, full-output representative states.

2. Past Meeting / Past Pitchbook maintenance
   - filters, list/table, record status, edit, delete/deleted/restore;
   - MeetingとPitchbookを同じcombined datasetのように見せない。

3. Meeting registration/edit
   - required vs optional fields, long-form text, related selectors, save/error/optimistic-lock state.

4. Pitchbook registration/edit
   - file/date/GP/asset-class等の実際のfieldとupload constraints/eligibilityを維持する。

5. GP Workspace and Entity Workspace
   - existing distinctions, direct/related activity, inactive/unresolved relationship historyを保持する。

6. Activity Analytics and Relationship Explorer
   - Analyticsは`面談活動の集計`として既存dataのみ;
   - Relationshipは既存table/detail model。network graphを発明しない;
   - chart interiorはLight-fixed referenceで設計する。

7. Master management and AI Provider Settings
   - normal-user languageとadministrator technical termsを文脈別に使う;
   - Work 0029のlocked/unlocked/logout/password-change stateを正しく保持する。

全ページを完全な大量画像にする必要はない。ユーザーが配置・密度・入力体験を判断できる代表画面を優先し、必要な状態はdetail boardで補う。

## Primary review target: form/input placement

今回は見た目のstyleそのものより、入力欄・control配置を重点レビューする。

各formで以下を判断し、source contractを変えずに最も自然な配置を提案する。

- 1列 / 2列 / 横並びのどれが読みやすいか;
- labelとinputの距離、label width、field width;
- required/optionalの見分け;
- 関連性の高いfieldを同一row/sectionへ置くか;
- long text / textareaは十分な横幅を与える;
- selectorが長い日本語を切らないか;
- primary actionを視線の流れの終点へ置く;
- rarely-used/advanced controlsのprogressive disclosure;
- desktop wide screenの余白を無駄にしない一方、横に詰めすぎてdecision burdenを増やさない;
- 1366x768 classでも主要actionと必須fieldが過度に下へ押し出されない;
- responsive fallbackで意味順序を壊さない。

既存DOM配置をそのまま守る必要はないが、handler/value/payload/eligibility/function semanticsは変えない。presentation-onlyで安全なreorder/groupingと、small client behaviorを伴う変更を区別する。

## Product Design use

利用可能ならProduct Design pluginを明示的に使い、selected visual languageを既存sourceへgroundしたcross-page explorationとして実行する。新しい3方向のideationではなく、1つの選択済みdesign systemを複数画面へ展開する。

画像生成を使う場合:

- actual current source and selected referenceをgroundingにする;
- synthetic/redacted data only;
- no credentials/private URLs/runtime IDs/confidential records;
- generated copy/controlsをsourceと照合し、画像の誤りをそのまま採用しない;
- 1回のtargeted correction roundまで。ImageGenに同じfield/label欠落を繰り返させる無限修正は禁止。

Plugin/image generation unavailableの場合は、source-grounded layout specificationと必要なvisual artifactsまで完成させ、正確なcapability gapを報告する。本体実装へ迂回しない。

## Deliverables

`docs/design/0028/selected-light-family/`配下にまとめる。

最低限:

- `README.md`: selected design system and artifact map;
- `design-tokens.md`: visual role tokens（exact production CSSではなく設計値）;
- `page-layout-review.md`: 各pageの現行配置→提案配置→理由→presentation-only/frontend-behavior分類;
- `input-layout-matrix.md`: required/optional/width/grouping/order/advanced disclosureの横断比較;
- selected Light visual references for representative page families;
- `visual-errata.md`: generated imageとsourceの差を明示し、採用不可の誤記・欠落を残す;
- report: `docs/handoffs/0028-CODEX-04-cross-page-light-family-report.md`.

特に「全ページで変えてよいvisual rule」と「ページ固有のlayout decision」を分ける。ページごとに独自palette/component styleを作らない。

## Acceptance evidence

PASSには少なくとも次が必要。

- selected visual languageが全representative pagesで一貫;
- sidebar/base/motif/active accentの閉じた仕様を守る;
- actual current functionality/controlsをsource inventoryで照合;
- input placement reviewが各主要formで完了;
- A/B/C比較時のdocumented errataを再導入していない;
- no invented backend/business capability;
- visual artifactsが読み取れる状態で提示・保存されている;
- `git diff --check`;
- changed pathsがdesign docs/report/dispatch control内に限定;
- production source/runtime changes zero.

静的mockだけでkeyboard/focus/contrast/runtime behaviorをPASSとしない。実装後のtarget-browser qualificationは後工程。

## Bounds and stop rule

Design-only。production `src/**`, `dist/**`, build/installer/tests/runtime/deploymentを変更・実行しない。

初回cross-page family + 1 targeted correction roundまで。重大なfunction mismatchが残る場合はerrataを固定してRETURNED PARTIALとし、無限生成をしない。

Dark versionへ進まない。Production implementationへ進まない。

完成後はdesign branchへcommitし、Draft PRを作る。PR #40を無理に上書きせず、履歴が明瞭になる形を選ぶ。mergeしない。

Return status:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
DESIGN_SOURCE_SHA: <actual>
SELECTED_LIGHT_VISUAL_LANGUAGE_APPLIED: PASS | PARTIAL | BLOCKED
CROSS_PAGE_VISUAL_FAMILY: PASS | PARTIAL | BLOCKED
INPUT_LAYOUT_REVIEW: PASS | PARTIAL | BLOCKED
SOURCE_CONTRACT_PARITY: PASS | PARTIAL | FAIL
VISUAL_ARTIFACTS_PRESENTED_AND_SAVED: PASS | PARTIAL | BLOCKED
SAYAGATA_REFERENCE_CLEAN_GEOMETRY: PASS | PARTIAL
SIDEBAR_BASE: #182124
ACTIVE_MENU_ACCENT: #E1001F / LEFT STRIP ONLY
OTHER_E1001F_USAGE: NONE
DARK_MOCK: NOT_STARTED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
BLOCKER: <NONE or precise blocker>
BRANCH: <actual>
DRAFT_PR: <actual>
FINAL_COMMIT: <actual>
REPORT_PATH: docs/handoffs/0028-CODEX-04-cross-page-light-family-report.md
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-04
BALL: CODEX
STATUS: READY
