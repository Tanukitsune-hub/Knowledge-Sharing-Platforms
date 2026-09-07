# Navigation and static-browser validation — A1.9

Validation viewport: `1366x768`
Browser: local deterministic HTML in Chrome
Source SHA: `02cc825fce3ed7debdeaaefe6ff5dd97f926e9f1`

## Result

| Check | Result | Evidence |
|---|---|---|
| sidebar destinations | PASS | 全15ページでexactly 8 |
| group headings | PASS | 全15ページで0 |
| active destination | PASS | 全15ページでexactly 1 |
| horizontal overflow | PASS | 全15ページで0 |
| sidebar computed base | PASS | `rgb(24, 33, 36)` / `#182124` |
| page computed background | PASS | `rgb(244, 247, 250)` / `#F4F7FA` |
| ordinary `#E1001F` usage | PASS | 全15ページで0 |
| active left strip | PASS | 全15ページでexactly 1 |
| local sidebar icons | PASS | 全15ページで8 |
| inline script | PASS | 全15ページで0 |
| browser console warning/error | PASS | 0 |

Flat destinations:

1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計
6. 面談と資料の関連
7. プルダウンの管理
8. 管理者ページ

## Primary interaction probes

- `記録を追加`: `面談`から`資料`へのinternal tab navigationを確認した。
- `過去の記録`: `面談`から`資料`へのinternal tab navigationを確認した。
- sidebarから`面談実績の集計`へ遷移できることを確認した。
- `確認済み` checkboxがon / offへ切り替わることを確認した。保存persistenceはdesign-onlyのため未検証。

## Deterministic validator

`python docs/design/0028/selected-light-family/validate-final-light.py`

Result: `PASS: 15 pages, 8 flat destinations, merged analytics contract references verified`

Static HTMLのため、keyboard / focus / contrast / screen reader / Apps Script runtime / persistenceのPASSは主張しない。
