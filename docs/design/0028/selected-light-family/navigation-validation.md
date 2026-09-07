# Navigation and static-browser validation — CODEX-10

Validation viewport: `1366x768`
Browser: local deterministic HTML in Chrome
Source SHA: `9fa668619a0b91fb60ed53f696363d3954cf709e`

## Result

| Check | Result | Evidence |
|---|---|---|
| rendered current manifest pages | PASS | 12 / 12 |
| product start surface | PASS | `ナレッジ検索`; navigation overview is review-only |
| sidebar destinations | PASS | 全12ページでexactly 7 |
| text group headings | PASS | 全12ページで0 |
| standalone relationship destination | PASS | 0 |
| standalone Pitchbook add/list/edit surface | PASS | 0 |
| gold system/tool separator | PASS | 全12ページでexactly 1、analyticsとmastersの間 |
| active destination | PASS | 全12ページでexactly 1 |
| horizontal overflow | PASS | 全12ページで0 |
| sidebar computed base | PASS | `rgb(24, 33, 36)` / `#182124` |
| page computed background | PASS | `rgb(244, 247, 250)` / `#F4F7FA` |
| ordinary `#E1001F` usage | PASS | 全12ページで0 |
| active left strip | PASS | 全12ページでexactly 1 |
| local sidebar icons | PASS | 全12ページで7 |
| inline script | PASS | `01-search.html` and `14-mode-settings.html` only |
| browser console warning/error | PASS | 0 |

Flat destinations:

1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計
6. プルダウンの管理
7. 管理者ページ

## Primary interaction probes

- `記録を追加`: Meeting-only、親`Meeting_ID` first、任意の関連資料、file-level retry boundaryを確認した。
- `過去の記録`: `面談 / 資料` subtabsなし、単一record list、detail内の関連資料追加と`削除（紐付け解除）`を確認した。
- Sidebar linksは7つの既存design surfaceへ遷移可能で、各pageでactive destinationが1件だった。
- `確認済み` checkboxのvisible ON/OFFを確認した。保存persistenceはdesign-onlyのため未検証。

## Deterministic validator

`python docs/design/0028/selected-light-family/validate-light-only-polish.py`

Result: `PASS: 12 pages, 7 destinations, relationship views integrated, Light-only polish verified`

Static HTMLのため、keyboard / focus / contrast / screen reader / Apps Script runtime / persistenceのPASSは主張しません。
