# CODEX-10 validation

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10

## Static validation

- `python docs/design/0028/selected-light-family/render-design.py`: PASS; 15 pages generated.
- `python docs/design/0028/selected-light-family/validate-user-corrections.py`: PASS.
- `python docs/design/0028/selected-light-family/validate-light-only-polish.py`: PASS; 15 pages, 7 destinations, relationship views integrated.
- `node --check docs/design/0028/selected-light-family/search-demo.js`: PASS.
- CODEX-10 assertions confirm `entityKey` counterparty selector, all six counterparty categories, no `FULL_EXPORT` model option, dedicated `全文出力`, Meeting-only / AIなし preview, Meeting attributes, Google Docs body, and no Pitchbook body/link section.

## Browser-rendered validation

Target flow: `01-search.html` loads → choose a non-GP `面談先` → click `全文出力` → Meeting-only / AIなし preview appears; normal `検索` remains a separate answer/citation state.

- Desktop: 1366×768 CSS viewport, screenshot width 1366, horizontal overflow 0, console warning/error 0.
- Mobile: 390×844 CSS viewport, screenshot width 390, document `scrollWidth` 375 (no horizontal overflow), console warning/error 0.
- Counterparty interaction: `LP:A` selected successfully.
- Full Output interaction: `export-answer` became visible, `search-answer` stayed hidden, status became `全文出力プレビュー：面談記録のみ / AIなし`.
- AI model selector contained only `GPT-5.6 Luna` in the synthetic approved-profile fixture.
- Normal Search interaction: `search-answer` became visible while `export-answer` stayed hidden.
- Same-viewport comparison: `screenshots/06-comparison-1366x768.png` loaded the CODEX-09 baseline, CODEX-10 initial state, and Full Output state without missing image assets.

All browser checks use synthetic design data and an inert local static server. They do not qualify Apps Script, Google Docs persistence, authentication, provider calls, or production runtime behavior.
