# Work 0033 — UI Layout Lab

WORK_ID: 0033
STATUS: ACTIVE
MODE: BUILD

## Primary Outcome

Knowledge Sharing Platforms専用のlocal-only visual layout sandboxを作り、今後のUI調整をchat-only指示からdrag/resize + exported spec中心へ移行する。

Decision:
`docs/decisions/ui-layout-lab.md`

## Required deliverable

`tools/ui-layout-lab/` 配下にbrowserで直接起動できるstatic toolを実装する。

Recommended files:
- `index.html`
- `layout-lab.css`
- `layout-lab.js`
- `presets.js`
- `README.md`
- Windows向け`open-layout-lab.bat`

External CDN/dependencyなし。Node/build stepなしでも使えること。

## Core features

1. production version8 Meeting create mock
2. 12-column drag reorder
3. mouse/pointer resize -> colSpan snap
4. textarea vertical resize
5. field hide/show palette
6. canvas width slider / max width / left-center alignment
7. spacing controls
8. Desktop / Laptop / Mobile preview
9. Current v8 / Compact Institutional / Balanced Professional / Memo First presets
10. deterministic `整える` action
11. lightweight design lint warnings
12. undo/redo
13. save named local variants
14. reset
15. JSON import/export
16. Codex handoff generation/copy/download
17. optional reference screenshot local overlay + opacity

## UX principles

- 操作説明を読まなくても触れる。
- productionに似たvisual tone。
- field cardを掴めることが明確。
- active selected fieldにwidth/height/orderの数字も表示。
- grid linesはediting時のみ控えめに表示。
- preset適用は1 click。
- unsaved changesをわかりやすくする。
- export specはstable / deterministic。

## Preset intent

`Current v8`: production baseline exact-ish reproduction。

`Compact Institutional`: dense / left / short eye travel。

`Balanced Professional`: moderate whitespace / balanced grouping。

`Memo First`: notes-centric。

Preset値はinitial proposalであり、userが編集して保存することが前提。

## Acceptance Evidence

### Functional
- double-click/open batch -> browser launch
- all presets render
- drag reorder works
- resize changes grid span
- notes height resize works
- hide/show works
- viewport switching works
- undo/redo works
- named variant save/load works
- JSON export -> import roundtrip exact
- Codex handoff includes all necessary layout properties
- screenshot overlay is local-only

### Safety
- network requests0
- Google/API/provider calls0
- secret/private runtime identifiers0
- production source mutation0
- existing Apps Script bundle unaffected

### Browser
- desktop Chrome actual interaction
- narrow/mobile preview within lab
- console material error/warn0

## Validation

Add deterministic Node standard-library tests for:
- preset schema
- spec validation
- export/import roundtrip
- auto tidy normalization
- undo/redo state transitions where practical
- no production source import/dependency

Run:
- focused tests
- `npm run check` only if repository canonical check naturally includes tool/tests and remains appropriate
- `git diff --check`

Do not regenerate/deploy Apps Script bundle because Layout Lab is not production runtime.

## Scope boundary

Do not modify `src/` production UI in Work0033.

Do not deploy Web App version9 merely for Layout Lab.

Do not start Work0030.

## Completion

Done when user can run the lab locally and produce a stable layout spec / Codex handoff from presets + manual edits.