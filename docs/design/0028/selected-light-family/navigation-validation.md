# CODEX-06 navigation / Workspace consolidation validation

BASE_MAIN_SHA: c5aa1c189c1e915a44f676ac1a8358a5f189e4bb

BASE_LIGHT_PR42_SHA: 64b5c4699422ec271f715741fd31e0350c41cdb6

Browser: Codex in-app browser

Validation viewport: CSS 1366 × 768

Capture surface: 1280 × 720, JPEG

## Render coverage

| Check | Result |
|---|---|
| 16 visual pages render | PASS / 16 of 16 |
| 1366×768 horizontal page overflow | PASS / 0 of 16 |
| active sidebar destination | PASS / exactly 1 per page |
| sidebar computed base | PASS / rgb(24, 33, 36) = #182124 |
| ordinary #E1001F element usage | PASS / 0 per page |
| active left-strip pseudo-element | PASS / exactly 1 per page |
| sidebar icons | PASS / 9 local SVG per page |
| sayagata repeat | PASS / 92px 92px |
| page background | PASS / rgb(244, 247, 250) = #F4F7FA |
| script elements | PASS / 0 per page |
| browser console warning/error | PASS / 0 |
| 1280×720 capture | PASS / 16 of 16 |

## Consolidation observations

| Requirement | Browser / source observation | Result |
|---|---|---|
| Top-level registration | sidebar labelは記録を追加1件。面談/資料の2 tabs | PASS |
| Top-level past records | sidebar labelは過去の記録1件。面談/資料の2 tabs | PASS |
| Separate old destinations | sidebarに面談追加、資料追加、過去Meeting、過去Pitchbookなし | PASS |
| Internal tab navigation | 記録を追加 面談→資料、過去の記録 面談→資料のlocal link到達 | PASS |
| 面談履歴 | input type=month 1件、2026-08、individual Meeting 3 rows、chart 0 | PASS |
| History backend reuse | searchMeetingRecords date range / getMeetingActivityAnalytics monthly+drillをdesign mappingに記録 | PASS |
| Analytics role | 期間推移・内訳・分析として別destination | PASS |
| Meeting type | 3 checkbox visible。ANNUAL_REVIEW / OFFICE_VISIT / ANNUAL_GENERAL_MEETING | PASS |
| Quick add | 面談先selector右。select 2件とbuttonのbottom位置が同値 | PASS |
| Workspace top-level | sidebar Workspace 1件、separate GP/Entity destinationなし | PASS |
| Workspace selector | 対象区分 / 対象 / 印刷-PDFの3 controlが同row、duplicate internal tab 0 | PASS |
| GP summary | 面談 12 / 資料 8 / 最終面談日 2026-08-25の3項目だけ | PASS |
| GP content | Fund、Meeting、Pitchbook、explicit relationship、print/PDFあり | PASS |
| Non-GP content | Fund drill、direct/related、linked Pitchbook、Meetings、Mixes/Follow-ups、unresolved/Inactive、timelineあり | PASS |
| Facade separation | getGpWorkspaceData / getEntityWorkspaceDataを別facadeとして記録 | PASS |
| Past Pitchbook source | fileUrl相当あり2 rowだけ原資料を開く。source欠落rowはaction 0 | PASS |
| Knowledge Search | visible model selector 1、optionsはGPT-5.6 Luna / 全文出力 | PASS |
| Normal-user policy | visible Thinking 0、visible Gemini 0 | PASS |
| Admin policy | AI Provider SettingsのThinking controlとshared-admin表現あり | PASS |

## Static checks

- render-design.py: compile / regeneration PASS。
- page-manifest.json: source SHA and 16 pages recorded。
- source-controls.json: current source 197 controls。
- all local nav/tab href targets: PASS。
- image dimensions: 16 of 16 are 1280×720 JPEG。
- git diff --check: delivery前に実行。
- production src/** / dist/** changes: delivery前に確認。

## Evidence boundary

Static design referenceからkeyboard、focus、contrast、screen reader、Apps Script runtime、provider、server mappingのPASSは主張しません。Interaction checkは静的HTML間のlocal navigationだけです。
