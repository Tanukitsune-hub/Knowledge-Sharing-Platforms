# Work 0035 — Multi-screen UI Studio

WORK_ID: 0035
STATUS: SUPERSEDED
MODE: BUILD

## Primary Outcome

Work0033のLayout Labを全7タブ対応UI Studioへ拡張し、production version10をbaselineとして各screenを一括でdesignできるようにする。記録を追加も含む。

Decision:
`docs/decisions/multi-screen-ui-studio.md`

## Baseline

- Production accepted baseline: Work0034 / owner-only Web App version10
- Existing Layout Lab: Work0033 / PR #55 accepted
- Meeting-create candidate: `docs/handoffs/0033-user-layout-candidate-current.json`

## Required screens

Canonical screen IDs:
- `knowledge` — ナレッジ検索
- `meeting-create` — 記録を追加
- `meeting-past` — 過去の記録
- `counterparty-summary` — 面談先サマリー
- `activity-analytics` — 面談実績の集計
- `masters` — プルダウンの管理
- `admin` — 管理者ページ

## Core deliverable

Extend `tools/ui-layout-lab/` rather than create a disconnected second tool.

Expected architecture may add:
- `screen-definitions.js`
- `project-model.js`
- `studio-state.js`

but exact filenames are implementation choice.

## Required features

1. 7-screen selector
2. Meeting-create included and existing candidate preserved
3. Current production v10 baselines for all screens
4. Shared shell editor
5. Per-screen block/field editor
6. Direct drag placement
7. 8-direction resize
8. 12 / 24 / 48-column macro precision
9. 8 / 4 / 2 / 1px micro snap
10. x/y micro offset and width adjustment
11. numeric inspector synchronized with mouse
12. alignment guides / collision state
13. viewport previews 2560 / 1440 / 1280 / 390
14. desktop spec non-mutation during viewport switch
15. per-screen undo/redo + project-safe history
16. shared-token undo/redo
17. per-screen hide/show
18. screen unsaved indicators
19. named project variants in localStorage
20. current-screen and whole-project JSON export/import
21. Meeting v1/v2 migration
22. Codex handoff current screen / all-screen summary
23. reference screenshot per screen
24. deterministic tidy/lint per screen
25. overview mode with 7 screen summaries/thumbnails

## Fine positioning

Default editing mode should be:
```text
macro grid: 24 columns
micro snap: 4px
```

User may switch to 48 columns + 1/2px micro snap for very fine adjustments.

Micro offsets should be bounded (implementation chooses sensible bound, e.g. ±32px) and linted when large.

## Screen definition quality

Do not merely put seven blank canvases.

Each screen must resemble current production version10 enough that user visual decisions transfer:
- current labels
- major controls
- major cards/sections
- table/chart placeholder geometry
- current shared shell/gold sidebar

Do not require live production data. Use deterministic synthetic labels/counts.

## Compatibility

Existing Layout Lab launch path remains usable:
`tools/ui-layout-lab/open-layout-lab.bat`

Existing v1/v2 Meeting JSON and local variants migrate without destructive reset.

## Non-goals

- production `src/` changes
- Apps Script deployment/version11
- business logic changes
- backend/schema changes
- provider changes
- automatic production apply/commit

## Acceptance Evidence

Logic:
- all 7 screen definitions valid
- no duplicate block IDs within screen
- project schema validation
- project JSON exact roundtrip
- screen switch state preservation
- v1/v2 Meeting migration
- 12/24/48 conversion
- micro offset normalization
- direct placement / resize math
- shared setting propagation
- per-screen override isolation
- project localStorage save/load
- handoff correctness
- no production source dependency mutation

Browser/manual:
- open via `.bat`
- switch all 7 screens
- manipulate Meeting-create and at least 3 other screens
- direct mouse drag / edge / corner resize
- 48-column + 1/2/4px micro adjustments
- shared sidebar/page setting propagates across screens
- screen-specific changes do not leak
- overview mode
- project variant save/load
- whole-project export/import
- current-screen handoff
- 2560/1440/1280 topology preview and mobile projection
- reference image per screen
- console material error/warn0

## Validation

Use Node standard library only for focused tests.

Run:
- focused UI Studio tests
- `npm run check`
- `git diff --check`

Do not regenerate Apps Script bundle.

## Completion

Done when one local UI Studio can edit all seven production tabs including Meeting-create, save one design project, and export stable specs/handoffs with fine positioning.
## Superseded

2026-09-19 user decision: Multi-screen Studioの追加開発は停止。今後のUI改善はproduction version10を基準に、口頭指示 + Codex implementationで直接行う。

Success conditionは未達のまま終了するが、これはBLOCKEDではなくintentional strategy change。Work0033 Layout Labのaccepted成果は保持する。