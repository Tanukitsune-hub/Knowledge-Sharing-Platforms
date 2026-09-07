# Product Design QA — CODEX-09

final result: passed

## Evidence / comparison

- source visual truth: PR #45 `2a1843048f76b6a48cec35fcdfe2c5b116c7e3dd`、同梱`00-pr45-search.jpg / 00-pr45-analytics.jpg`。
- implementation: `screenshots/01-free-question.jpg`〜`08-sidebar-comparison.jpg`。
- comparison input: [comparison.html](comparison.html)。両者を同じbrowser画面内に表示して確認した。Sidebarは原寸236px幅のfocused comparison、検索と集計はfull-view paired comparison。
- CSS viewport 1366×768 / DPR 1。full-page画像の高さは内容に応じて異なる。サイズは`image-dimensions.json`を参照。画像の縦横比を保持し、同じ幅で比較。
- Full-page captureは縦scrollbarのあるページではdocument幅1351px、ないページでは1366pxを返す。Sidebar比較は画像全体を伸縮せず、236pxの同じ原寸領域を表示した。検索full-view比較ではこの15px差と状態差を明示的に許容する。
- 検索のsourceは回答表示済み、修正版は初期画面。回答の有無・期間・GP初期値・質問欄順序は明示的な状態差として扱い、誤ったpixel一致は主張しない。集計の同じfixtureとsidebarの同じactive destinationを比較した。

## Findings

Actionable P0/P1/P2: 0。追加のvisual修正なしで初回比較を通過。

| 必須surface | 観察 / 判断 |
|---|---|
| Fonts / typography | 既存Yu Gothic UI / Meiryo、見出しYu Mincho、brand Georgiaを保持。ラベルと補足の階層は維持。新9列は12px、○/—は16pxで読み分け可能。 |
| Spacing / layout | 236px sidebarと既存card・背景を保持。検索3段の順序、132pxの質問欄、primary actionは1366×768内。全期間も1行目に収まる。新admin設定は縦scrollを許容し、横overflowなし。 |
| Colors / tokens | #182124とactive red左stripを維持。新goldはhighlightと深いshadowが同一icon内に見える。白いeditable欄、灰色readonly、disabled日付欄の状態を区別可能。 |
| Image / asset fidelity | local Lucide形状と紗綾形を保持。maskにより元のvector輪郭を維持し22px表示。原寸sidebar比較でbrightnessとmaterial感の増加を確認。新規asset描画・CDNなし。 |
| Copy / content | 情報ソース3択、AIモデル、種別3列、自由質問の保護表示が指定どおり。固定質問・全期間・全文出力の説明を確認。 |

## Interaction checks

- 自由質問入力→要約で固定文とreadonly→自由質問でdraft復元。
- 全期間ONで日付disabled→OFFで直前値復元。
- 全文出力でMeeting固定・source選択不可、資料リンクのない原文例を表示。
- 比較の0件は拒否、2件で表示例を確認。面談準備のtarget必須を確認。
- preset追加、表示名・固定質問欄、有効/無効、表示順、保護された自由質問を確認。保存は明示的なdemo結果。
- browser console warn/error 0。15画面でoverflow 0、nav 7、active 1。

## Gaps / follow-up

測定contrast、screen reader、全keyboard経路、mobile qualification、Apps Scriptの保存・認証・provider・prompt resolutionは未認定。静的デザインの受入れをproduction READYへ読み替えない。

## Implementation checklist

- 今回指定の視覚修正・比較・操作デモ：完了。
- ユーザーによる最終Light visual acceptance：次のgate。
- production BUILDは別の明示承認・Strategy Reset後。
