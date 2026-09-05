# 選択済みLight family — A1.7 refinement

WORK_ID: 0028

DISPATCH_ID: 0028-CODEX-05

BASE_MAIN_SHA: `1a6966beae11e6b0d1e9744e78333ee925fce662`

BASE_LIGHT_PR41_SHA: `46d16b46535239e2ce91f7d6bf362836bfaf9985`

MODE: INVESTIGATION / DESIGN ONLY

Draft PR #41のcross-page visual familyを、ユーザーの実画面レビューに基づく1回のbounded refinementとして修正した静的設計資料です。Production `src/**`と`dist/**`は参照だけに留め、各HTMLは`google.script.run`、保存、認証、provider callを持ちません。

Product Design pluginのproduct grounding、audit、visual QA観点を使用しました。新しい方向のideationやImageGenは行わず、PR #41 artifacts、current source、添付済みLight referenceを同じ比較画面で確認し、deterministic HTML/CSS/local SVGへ反映しています。

## Refinement result

- normal-user Knowledge Searchは`検索モード`と1つの`使用モデル`を表示し、`実行方法`、個別model profile、Thinking controlを隠す;
- current fixtureの選択肢は`GPT-5.6 Luna`と`全文出力（AIを使わない）`。Geminiはqualified-disabledのため非表示;
- Meeting登録・編集を同じ3行構成へ統一;
- Pitchbook分類編集は`日付 | GP | Asset Class | Equity / Debt`を1行にし、GPを最も広くする;
- GP Workspaceはselectorと`印刷 / PDF`を同じrowに置き、summaryを`面談 / 資料 / 最終面談日`の3項目へ縮約;
- page背景をcool slate `#F4F7FA`、cardを`#FFFFFF`へ変更;
- 11 destinationへLucideのlocal SVG line iconを割り当て、外部runtime dependencyを作らない;
- 紗綾形は同じCC0 geometryを92px repeatへ縮小し、PR #41の168pxより高密度にする;
- card、section、grid、tableの縦paddingをmoderately compactにし、control min-height 36–37pxを維持。

## Visual artifact map

| Family | HTML reference | CSS viewport capture |
|---|---|---|
| Knowledge Search | `01-search.html`, `12-search-states.html`, `13-export.html` | `screenshots/01-search-1280x720.jpg`, `12-search-states-1280x720.jpg`, `13-export-1280x720.jpg` |
| Meeting maintenance | `02-meetings.html`, `04b-meeting-edit.html`, `14-record-states.html` | 同名`*-1280x720.jpg` |
| Pitchbook maintenance | `03-pitchbooks.html`, `05b-pitchbook-edit.html`, `14-record-states.html` | 同名`*-1280x720.jpg` |
| Registration | `04-meeting-form.html`, `05-pitchbook-form.html` | 同名`*-1280x720.jpg` |
| Workspaces | `06-gp.html`, `07-entity.html`, `07b-entity-gp.html` | 同名`*-1280x720.jpg` |
| Analytics / relationship | `08-analytics.html`, `09-relationships.html` | 同名`*-1280x720.jpg` |
| Administration | `10-masters.html`, `11-provider.html`, `11b-admin-detail.html` | 同名`*-1280x720.jpg` |

`index.html`から18のreferenceへ移動できます。`page-manifest.json`は画面一覧、`source-controls.json`はcurrent sourceから抽出した197 control、`render-design.py`は同じreferenceを再生成します。

## Source-contract mapping

将来production実装での`使用モデル`は、表示値から既存contractへmappingします。

| Visible selection | Existing contract mapping | Preserved rule |
|---|---|---|
| `GPT-5.6 Luna` | `route=OPENAI` + policyで許可された`modelProfileId` + 管理者既定`thinkingProfileId` | normal userはThinkingを選ばない。自動failoverなし |
| `全文出力（AIを使わない）` | `route=FULL_EXPORT`; model/thinking fieldを送らない既存semantics | 同じpreview/fingerprint/output packageを維持 |
| Gemini profile | current fixtureではoptionを生成しない | Work 0027のqualified-disabled / normal-user hiddenを維持 |

これはdesign specificationです。Production mapping、handler、payload変換はこのdispatchで実装していません。

## Asset provenance

- Sayagata: `sayagata-source.svg`。Wikimedia CommonsのCC0 line geometryを継続使用;
- Sidebar icons: `icons/*.svg`。Lucide公式sourceから取得した11個のindividual SVGと`icons/LICENSE.txt`をlocal保存;
- synthetic dataのみ。実URL、credential、組織固有ID、利用者データを含まない。

## Evidence boundary

1366×768 CSS viewportで18ページを再renderし、横page overflow 0、active destination各1、sidebar `rgb(24, 33, 36)`、通常要素の赤0、active `::before`の赤各1、icon各11、紗綾形`92px 92px`を確認しました。GitHub preview用captureは1280×720 browser surfaceで再取得し、このsurfaceでも横overflow 0です。Keyboard順序、focus動作、contrast実測、screen reader、200% zoom、Apps Script HTML Service、保存、認証、provider、runtimeは未検証であり、PASSとしていません。
