# Work 0028 — selected Light cross-page family report

WORK_ID: 0028

DISPATCH_ID: 0028-CODEX-04

BALL: CHATGPT

STATUS: RETURNED

MODE: INVESTIGATION

PHASE: A1.6 / CROSS-PAGE LIGHT FAMILY / DESIGN ONLY

## Outcome

選択済みLight visual languageを、current sourceの主要11ページと補助状態へ同じdesign systemとして横断展開しました。18のinert HTML referenceと各1366×768 CSS viewport captureを`docs/design/0028/selected-light-family/`へ保存しています。

Searchは質問から結果・出典までを線形にし、maintenanceは比較可能なtable密度、shellはpersistent workspace sidebarで統一しました。Meeting/Pitchbook、GP/Entity、Analytics/Relationship、record/Master/providerの意味を統合していません。

## Work contract result

| Item | Result |
|---|---|
| Primary outcome | PASS — selected Lightのcross-page familyとinput placement reviewが存在 |
| Acceptance evidence | current source audit、添付referenceの直接確認、18 page capture、7 scenario expert walkthrough |
| Design correction budget | 1 / 1 — 初回capture後のsource/geometry correctionを一括適用して終了 |
| Scope | design docs、static visual refs、dispatch/reportのみ |
| Non-goals | Dark、production code、runtime、GAS、deployment、provider/data mutation |
| Blocker | NONE |

## Source and preserved boundaries

DESIGN_SOURCE_SHA: `c6701d075030385ee683925c0bbaef36221134ad`

開始時に`origin/main`を取得し、current main、clean worktree、remote、適用AGENTS、Work Registry、0028 instruction/dispatch/decision/plan、product vision、0027/0029 completion、Draft PR #40 artifacts/errataを確認しました。Draft PR #40 headとの差分で`src/**`は同一でした。

Work 0027のGemini `QUALIFIED_DISABLED` / normal-user hidden baselineと、Work 0029のconfigured/locked shared-admin、opaque `sessionStorage` token、server validation、logout、password changeを維持しました。0027/0029を再オープンしていません。

## Deliverables

- `docs/design/0028/selected-light-family/README.md`
- `design-tokens.md`
- `page-layout-review.md`
- `input-layout-matrix.md`
- `heuristic-review.md`
- `visual-errata.md`
- `source-controls.json`（current HTMLから抽出した197 control）
- 18 inert HTML visual references、19 screenshot files、page manifest、reproducible renderer
- CC0 `sayagata-source.svg`

## Visual and layout judgment

### Common rules

- sidebar baseはsemantic token `#182124`;
- `#E1001F`はactive itemの左端3px pseudo-elementだけ;
- active itemは非赤の背景・border・textでも識別;
- warm-white main、restrained gold、visible control borders;
- CC0の実在line vectorから作る正しいrepeatable sayagata。左下から右上へ減衰;
- chart interiorはLight固定。

### Page-specific rules

Required/primary fieldsはfirst view、textarea/multi-select/long selectorは全幅、optional filtersはactive summary付きdetailsへ配置しました。1366×768 CSS viewportではKnowledge Search、Meeting registration、Pitchbook registrationの主要actionがview内にあることをDOM矩形で確認しました。全18 screenでhorizontal page overflowなしです。

`PRESENTATION_ONLY`と`FRONTEND_BEHAVIOR`は`page-layout-review.md`と`input-layout-matrix.md`で分離しました。主なbehavior候補はfilter disclosure、sticky action、styled confirmationです。これらは実装後のkeyboard/focus/target-browser確認が必要です。

## Source contract parity

- Meeting required Date / Counterparty Type / Entity / Asset Class、optional fields、24h draft、optimistic lockを維持;
- Pitchbook file/date/GP/Asset Class、format/size/count limits、file-granular retry、no file replacementを維持;
- Maintenance status blankは全状態。Active/Inactive internal value、restore eligibility、original source保持を維持;
- Knowledge five modes、same filters、2–5 comparison Entities、explicit route、model/thinking policy、pending recheck、document-level citations、full output contractを維持;
- AnalyticsはMeeting metadataだけ、Relationshipはexplicit ID tableだけ;
- Master DEACTIVATE/REACTIVATEをrecord deletionと区別;
- Admin auth/session/provider stateをcurrent sourceどおり分離。

Sourceとvisualの差は`visual-errata.md`に固定し、添付画像のbell/avatar/Home/全文toggle/許可checkbox/500文字、PR #40の誤記・欠落を採用していません。

## Review and validation

| Check | Result |
|---|---|
| 18 visual pages captured and inspected | PASS |
| 1366×768 CSS viewport / horizontal overflow | PASS / 0 of 18 overflow |
| active nav count | PASS / exactly 1 per page |
| sidebar computed color | PASS / `rgb(24, 33, 36)` |
| red computed use | PASS / active `::before` exactly 1, normal elements 0 |
| Search/Meeting/Pitchbook primary action visible | PASS |
| Static artifact has no script/form/server call | PASS |
| `git diff --check` | PASS |
| changed-path boundary | PASS |
| production `src/**`, `dist/**`, dependencies | NO CHANGE |

添付referenceとimplementation captureを`data:` comparison pageへ同時表示する試みはbrowser security policyで拒否されたため、迂回していません。両画像は個別に直接確認し、pixel-perfect、keyboard、focus、contrast、screen reader、runtimeのPASSは主張しません。

## Risk and next gate

Backend change riskはNONEです。Production implementation complexityは、common token/sidebar/table/cardがLOW、filter disclosure/sticky action/custom confirmationがMEDIUMです。実装は未許可であり、Darkも未着手です。

次のgateはChatGPT/ユーザーによるこのLight cross-page familyのaccept/correctionです。Darkまたはproduction buildへ自動的に進みません。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002

KNOWLEDGE_APPLIED: RULE-0001, RULE-0002

NEW_KNOWLEDGE_CANDIDATE: NO

## Return status

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
DESIGN_SOURCE_SHA: c6701d075030385ee683925c0bbaef36221134ad
SELECTED_LIGHT_VISUAL_LANGUAGE_APPLIED: PASS
CROSS_PAGE_VISUAL_FAMILY: PASS
INPUT_LAYOUT_REVIEW: PASS
SOURCE_CONTRACT_PARITY: PASS
VISUAL_ARTIFACTS_PRESENTED_AND_SAVED: PASS
SAYAGATA_REFERENCE_CLEAN_GEOMETRY: PASS
SIDEBAR_BASE: #182124
ACTIVE_MENU_ACCENT: #E1001F / LEFT STRIP ONLY
OTHER_E1001F_USAGE: NONE
DARK_MOCK: NOT_STARTED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
BLOCKER: NONE
BRANCH: codex/0028-selected-light-family
DRAFT_PR: https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/41
FINAL_COMMIT: RECORDED_IN_DRAFT_PR_AND_RETURN_STATUS
REPORT_PATH: docs/handoffs/0028-CODEX-04-cross-page-light-family-report.md
```
