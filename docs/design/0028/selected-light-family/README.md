# Work 0028 — selected Light cross-page family

WORK_ID: 0028

DISPATCH_ID: 0028-CODEX-04

DESIGN_SOURCE_SHA: `c6701d075030385ee683925c0bbaef36221134ad`

MODE: INVESTIGATION / DESIGN ONLY

選択済みLightデザインを、現行の主要11ページと補助状態へ横断適用した静的な設計資料です。Production `src/**`や`dist/**`は参照だけに留め、HTMLは`google.script.run`、外部API、保存処理、認証処理を一切持ちません。

Product Design pluginの`get-context`で対象・目的・選択済みreferenceを固定し、`audit`のcapture-first手順で1366×768の全画面を保存・確認しました。`image-to-code`のselected-target/source-catalog観点も参照しましたが、本体buildやproduction実装の工程には進んでいません。ImageGenは使っていません。文字とcontrolを正確に保つため、current sourceから生成したinert HTMLをvisual referenceにしました。

## 共通visual rule

- persistent left sidebar、base token `#182124`;
- active itemは背景・border・textに加え、左端3pxだけ`#E1001F`;
- warm-whiteのmain content、金色は見出し線・action・細部に限定;
- input、button、table、disclosureに明瞭な輪郭を残す;
- サイドバー左下はCC0の紗綾形vectorを反復し、subdued goldで右上へ薄くする;
- A-likeなKnowledge Search、C-likeな一覧密度、B-likeなworkspace shell;
- chart内部は`CHART_SURFACE_THEME: LIGHT_FIXED`。Darkは未着手。

ページ固有の並び替えと幅は[page-layout-review.md](page-layout-review.md)、全入力の比較は[input-layout-matrix.md](input-layout-matrix.md)に分離しています。

## Visual artifact map

| Family | HTML reference | 1366×768 capture |
|---|---|---|
| Knowledge Search | `01-search.html`, `12-search-states.html`, `13-export.html` | `screenshots/01-search-1366x768.png`, `12-search-states-1366x768.png`, `13-export-1366x768.png` |
| Meeting maintenance | `02-meetings.html`, `04b-meeting-edit.html`, `14-record-states.html` | 同名`*-1366x768.png` |
| Pitchbook maintenance | `03-pitchbooks.html`, `05b-pitchbook-edit.html`, `14-record-states.html` | 同名`*-1366x768.png` |
| Registration | `04-meeting-form.html`, `05-pitchbook-form.html` | 同名`*-1366x768.png` |
| Workspaces | `06-gp.html`, `07-entity.html`, `07b-entity-gp.html` | 同名`*-1366x768.png` |
| Analytics / relationship | `08-analytics.html`, `09-relationships.html` | 同名`*-1366x768.png` |
| Administration | `10-masters.html`, `11-provider.html`, `11b-admin-detail.html` | 同名`*-1366x768.png` |

`index.html`からすべてのreferenceへ移動できます。`page-manifest.json`は画面一覧、`source-controls.json`は現行HTMLから抽出した197 controlの監査記録です。`render-design.py`は同じ静的referenceを再生成します。

## Source grounding

主に`src/Index.html`、`MaintenancePages.html`、`KnowledgeSearchPage.html`、`GpWorkspacePage.html`、`EntityWorkspacePage.html`、`ActivityAnalyticsPage.html`、`RelationshipExplorerPage.html`、`AiProviderSettingsPage.html`と対応するClient fragmentを確認しました。Source controlは内部value、payload、eligibility、provider/model/thinking policyを変えません。

使用データはすべて`サンプルGP`、`サンプルLP`、固定形式の架空IDです。実URL、credential、組織固有ID、利用者データを含みません。

## Evidence boundary

静的captureで確認したのは、配置、密度、折返し、controlの見分けやすさ、状態説明です。Keyboard順序、focus動作、contrast実測、screen reader、200% zoom、Apps Script HTML Service、認証、保存、provider、runtimeは未検証です。これらをPASSとしていません。
