# Work 0028 / CODEX-08 — Light-only final polish report

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.10 / LIGHT-ONLY FINAL POLISH / DESIGN ONLY

## Outcome

最新`origin/main`の`960d225c388912791443cbc68efe5e5426f2a9d2`をbaseとし、Draft PR #44 head `7a82b530b51227d1cc44a8cbd2b4e4b225c57d6d`をpre-CODEX-08 visual baselineとして、選択済みLight familyの最終polishを完了した。

Web Appの初期画面を`ナレッジ検索`として明記し、sidebarを7 destinationsへ整理した。Standalone `面談と資料の関連`の目的は`過去の記録 / 面談・資料`の双方向read-only relationship detailへ統合した。Normal taskとsystem/tool destinationsの間へpointed gold separatorを置き、brand/icon/small ruleをrestrained champagne / antique metallic goldへ調整した。

Production `src/**`、`dist/**`、Apps Script runtime、deployment、provider、credential、backend/data contractは変更していない。Dark/System/theme selector/persistenceも作成していない。

## Work contract

- Mode: `INVESTIGATION / DESIGN ONLY`
- Outcome: UserがLight familyを最終visual acceptanceできる、source-groundedな静的referenceとscreenshotsを返す。
- Evidence hierarchy: current main source and controller decisions → exact PR #44 baseline → deterministic browser render → Product Design paired comparison → static validation。
- Mutation budget: design/docsだけ。Production source/runtime/deploymentは0。
- Visual correction budget: paired comparison後のtargeted correctionは最大1回。First passでactionable issueがなかったため0回。
- Reset condition: source-contract contradiction、production path change、P0/P1/P2、同じrender failureの反復。

## Final sidebar

1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計
6. プルダウンの管理
7. 管理者ページ

Text group headingは0。`面談実績の集計`と`プルダウンの管理`の間に、約1 rowの余白と3pxのpointed gold separatorを1件だけ置いた。Active destinationは全pageでexactly 1、`#E1001F`はそのleft stripだけである。

## Relationship integration and source parity

- Relationship truth: `Meeting_Index.Related_Pitchbook_IDs`の明示Document ID。
- Meeting view: `関連資料 n件`とresolved / Inactive / unresolved rows。Unresolvedは`PITCHBOOK_NOT_FOUND`を隠さない。
- Document view: `関連面談 n件`と、当該Document IDを明示参照するMeetingだけのreverse lookup。
- GP名一致によるinference: なし。
- Relation mutation: Meeting registration/editだけ。Past Recordsのmutation actionは0。
- Source URL: 存在するrowだけ`原資料を開く`。存在しないrowにactionをfabricateしていない。
- New endpoint / DB / sheet / dataset / relation model: なし。

Meeting/Pitchbookのdataset・handler・validation・lifecycle、GP/non-GP separate read facade、Activity Analyticsの統合構成、Work 0027 Gemini qualified-disabled / normal-user hidden、Work 0029 shared-admin session/logout/password-changeを維持した。

## Visual artifacts

保存先: `docs/design/0028/selected-light-family/light-only-final-polish/`

| # | Screenshot |
|---:|---|
| 1 | `screenshots/01-knowledge-search.png` |
| 2 | `screenshots/02-register-meeting.png` |
| 3 | `screenshots/03-register-document.png` |
| 4 | `screenshots/04-past-records-meeting-relationships.png` |
| 5 | `screenshots/05-past-records-document-relationships.png` |
| 6 | `screenshots/06-counterparty-summary-gp.png` |
| 7 | `screenshots/07-counterparty-summary-entity.png` |
| 8 | `screenshots/08-activity-analytics-top.png` |
| 9 | `screenshots/09-activity-analytics-bottom.png` |
| 10 | `screenshots/10-dropdown-management.png` |
| 11 | `screenshots/11-admin-page.png` |

`README.md`と`index.html`にreview orderを整理した。Draft PR本文上部へ主要8枚を直接埋め込む。

## Product Design QA

Product Design pluginのindex、user-context preflight、get-context/product grounding、design-qa rubricを使用した。ImageGenと新direction ideationは使用していない。

PR #44のnavigation / standalone Relationship Explorerと、CODEX-08のnavigation / Past Records relation detailをそれぞれ`1280x720`へnormalizeし、同一browser input内のpaired comparisonで確認した。P0 / P1 / P2は0。Targeted correction roundは不要だった。

## Validation

| Check | Result |
|---|---|
| design page render | PASS / 14 of 14 |
| product start surface | PASS / ナレッジ検索 |
| navigation overview boundary | PASS / review-only |
| 1366×768 horizontal overflow | PASS / 0 of 14 |
| sidebar destinations | PASS / exactly 7 per page |
| text group headings | PASS / 0 per page |
| standalone relationship destination | PASS / 0 |
| system/tool separator | PASS / exactly 1 per page |
| active sidebar destination | PASS / exactly 1 per page |
| sidebar base | PASS / `#182124` |
| ordinary `#E1001F` usage | PASS / 0 per page |
| active red left strip | PASS / exactly 1 per page |
| bidirectional relationship view | PASS |
| browser console warning/error | PASS / 0 |
| primary tab/checkbox interaction probes | PASS / static visible state only |
| Product Design actionable P0/P1/P2 | PASS / 0 |
| screenshots | PASS / 11 PNG saved and inspected |
| deterministic validator | PASS |
| `npm run check` | PASS / 456 tests |
| `git diff --check` | PASS |
| production `src/**` / `dist/**` change | NONE |

Deterministic validator:

```text
python docs/design/0028/selected-light-family/validate-light-only-polish.py
PASS: 14 pages, 7 destinations, relationship views integrated, Light-only polish verified
```

Static artifactからkeyboard、focus order、contrast測定、screen reader、Apps Script runtime、server mapping、admin-check save persistenceのPASSは主張しない。

## Delivery

BRANCH: `codex/0028-light-only-final-polish`
DRAFT_PR: `https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/45`
DESIGN_ARTIFACT_COMMIT: `d59bae3f65f2679904449ea50c4136354c6682f8`
REPORT_PATH: `docs/handoffs/0028-CODEX-08-light-only-final-polish-report.md`

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0003
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0003
NEW_KNOWLEDGE_CANDIDATE: NO

## Return state

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.10 / LIGHT-ONLY FINAL POLISH / DESIGN ONLY
BASE_MAIN_SHA: 960d225c388912791443cbc68efe5e5426f2a9d2
BASE_LIGHT_PR44_SHA: 7a82b530b51227d1cc44a8cbd2b4e4b225c57d6d
PRODUCT_START_SURFACE: ナレッジ検索
SIDEBAR_DESTINATIONS: PASS / EXACTLY 7
STANDALONE_RELATIONSHIP_DESTINATION: REMOVED
PAST_RECORD_RELATIONSHIP_INTEGRATION: PASS
RELATIONSHIP_TRUTH: Meeting_Index.Related_Pitchbook_IDs / EXPLICIT DOCUMENT IDS
GOLD_SEPARATOR_AND_POLISH: PASS
LIGHT_ONLY_SCOPE: PASS
SOURCE_CONTRACT_PARITY: PASS
PRODUCT_DESIGN_QA: PASS / P0 0 / P1 0 / P2 0
SCREENSHOTS_SAVED: PASS / 11
PR_VISUAL_PREVIEW_EMBEDDED: PASS / 8 IMAGES
SIDEBAR_BASE: #182124
ACTIVE_MENU_ACCENT: #E1001F / LEFT STRIP ONLY
OTHER_E1001F_USAGE: NONE
GEMINI_NORMAL_USER_VISIBILITY: HIDDEN
DARK_MOCK: CANCELED
SYSTEM_THEME: CANCELED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
BLOCKER: NONE
BRANCH: codex/0028-light-only-final-polish
DRAFT_PR: https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/45
DESIGN_ARTIFACT_COMMIT: d59bae3f65f2679904449ea50c4136354c6682f8
REPORT_PATH: docs/handoffs/0028-CODEX-08-light-only-final-polish-report.md
```
