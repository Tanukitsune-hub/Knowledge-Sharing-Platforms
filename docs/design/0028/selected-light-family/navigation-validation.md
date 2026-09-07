# Navigation and static-browser validation — A1.10

Validation viewport: `1366x768`  
Browser: local deterministic HTML in Chrome  
Source SHA: `960d225c388912791443cbc68efe5e5426f2a9d2`

## Result

| Check | Result | Evidence |
|---|---|---|
| rendered manifest pages | PASS | 14 / 14 |
| product start surface | PASS | `ナレッジ検索`; navigation overview is review-only |
| sidebar destinations | PASS | 全14ページでexactly 7 |
| text group headings | PASS | 全14ページで0 |
| standalone relationship destination | PASS | 0 |
| gold system/tool separator | PASS | 全14ページでexactly 1、analyticsとmastersの間 |
| active destination | PASS | 全14ページでexactly 1 |
| horizontal overflow | PASS | 全14ページで0 |
| sidebar computed base | PASS | `rgb(24, 33, 36)` / `#182124` |
| page computed background | PASS | `rgb(244, 247, 250)` / `#F4F7FA` |
| ordinary `#E1001F` usage | PASS | 全14ページで0 |
| active left strip | PASS | 全14ページでexactly 1 |
| local sidebar icons | PASS | 全14ページで7 |
| inline script | PASS | 全14ページで0 |
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

- `記録を追加`: `面談`から`資料`へのinternal tab navigationを確認した。
- `過去の記録`: `面談`から`資料`へのinternal tab navigationを確認した。
- Sidebar linksは7つの既存design surfaceへ遷移可能で、各pageでactive destinationが1件だった。
- `確認済み` checkboxのvisible ON/OFFを確認した。保存persistenceはdesign-onlyのため未検証。

## Deterministic validator

`python docs/design/0028/selected-light-family/validate-light-only-polish.py`

Result: `PASS: 14 pages, 7 destinations, relationship views integrated, Light-only polish verified`

Static HTMLのため、keyboard / focus / contrast / screen reader / Apps Script runtime / persistenceのPASSは主張しません。
