# 選択済みLight family — A1.8 navigation / Workspace consolidation

WORK_ID: 0028

DISPATCH_ID: 0028-CODEX-06

BASE_MAIN_SHA: c5aa1c189c1e915a44f676ac1a8358a5f189e4bb

BASE_LIGHT_PR42_SHA: 64b5c4699422ec271f715741fd31e0350c41cdb6

MODE: INVESTIGATION / DESIGN ONLY

Draft PR #42のrefined Light visual systemを維持し、top-level navigationとWorkspace構成だけを整理した静的設計資料です。Production src/** と dist/** は参照のみで、HTML referenceはgoogle.script.run、保存、認証、provider callを持ちません。

Product Design pluginのuser-context preflight、product grounding、source-to-render比較、design QAを使用しました。新しいdirectionのideationやImageGenは行わず、PR #42とcurrent sourceを基準にdeterministic HTML/CSS/local SVGを生成しています。

## Final top-level navigation

| Group | Destination | Internal surface |
|---|---|---|
| 探す | ナレッジ検索 | — |
| 探す | 面談履歴 | YYYY-MMとindividual Meeting一覧 |
| 記録する | 記録を追加 | 面談 / 資料 |
| 振り返る | 過去の記録 | 面談 / 資料 |
| 振り返る | Workspace | GP / 非GP Entity |
| 振り返る | 面談活動の集計 | 件数推移・内訳・分析 |
| 振り返る | 面談と資料の関連 | explicit Document ID relationship |
| 設定する | マスター管理 | — |
| 設定する | AIプロバイダ設定 | — |

内部tabはsidebar destinationではありません。各referenceのsidebar active destinationは常に1件です。

## Consolidation boundary

- 記録を追加は入口だけを統合し、Meeting/Pitchbookのform、draft、handler、validation、payload、datasetを分ける。
- 過去の記録は入口だけを統合し、検索、table、status、edit、delete/restore、source actionを分ける。
- 面談履歴はYYYY-MMを既存searchMeetingRecordsのdate range、またはgetMeetingActivityAnalyticsのmonthly + drillへ対応させるfrontend設計。新endpointや新datasetは追加しない。
- Workspaceは対象がGPならgetGpWorkspaceData、非GPならgetEntityWorkspaceDataを使うfuture frontend routing。public facade、read model、relation modelを統合しない。
- GPと非GP Entityで表示内容は切り替える。GPにはcompact 3-item summary、Fund / Strategy、Meeting、Pitchbook、explicit relationshipを表示。非GPにはFund drill、direct/related、linked Pitchbook、Meetings、Mixes / Follow-ups、unresolved/Inactive relationship、timelineを表示する。

## Visual artifact map

| Surface | HTML | Capture |
|---|---|---|
| Final navigation | 00-navigation.html | screenshots/00-navigation-1280x720.jpg |
| Knowledge Search | 01-search.html | screenshots/01-search-1280x720.jpg |
| Monthly Meeting history | 02-meeting-history.html | screenshots/02-meeting-history-1280x720.jpg |
| Add Meeting / material | 03-record-add-meeting.html, 04-record-add-pitchbook.html | 同名capture |
| Past Meeting / material | 05-past-records-meeting.html, 06-past-records-pitchbook.html | 同名capture |
| Editing | 07-meeting-edit.html, 08-pitchbook-edit.html | 同名capture |
| Workspace | 09-workspace-gp.html, 10-workspace-entity.html | 同名capture |
| Analytics / relationship | 11-analytics.html, 12-relationships.html | 同名capture |
| Settings | 13-masters.html, 14-provider.html | 同名capture |
| Representative states | 15-representative-states.html | 同名capture |

index.htmlから16 referenceへ移動できます。page-manifest.jsonは画面一覧、source-controls.jsonはcurrent sourceから抽出したcontrol inventory、render-design.pyは同じreferenceを再生成します。

## Preserved visual system

Sidebar #182124、main #F4F7FA、white card、cool gray border、restrained gold、local Lucide 19px line icon、92px repeatのclean sayagataをPR #42から維持しています。#E1001Fはactive sidebar item左端3px stripだけです。Knowledge Searchはvisible model selector 1個、normal-user Thinking/Geminiは非表示です。Future Darkのchart interiorはLIGHT_FIXEDです。

## Evidence boundary

1366×768 CSS viewportのrender/static checksと1280×720 captureを行います。Static referenceからkeyboard、focus behavior、contrast実測、screen reader、Apps Script HTML Service、runtime、provider、server mappingのPASSは主張しません。
