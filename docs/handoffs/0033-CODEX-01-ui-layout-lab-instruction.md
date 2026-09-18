# CODEX-01 — Build UI Layout Lab

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Goal

Build the first usable version of the Knowledge Sharing Platforms UI Layout Lab as a completely separate local/static design sandbox.

Read latest `origin/main`, root/nearest AGENTS, then:
- `docs/decisions/ui-layout-lab.md`
- `docs/planning/work0033-ui-layout-lab.md`
- `docs/handoffs/0032-CODEX-01-ui-polish-report.md`
- current production UI source only as visual/reference evidence

## Critical boundary

Do NOT modify production `src/` application behavior or deploy a new Apps Script version in this Work.

Layout Lab lives under:
`tools/ui-layout-lab/`

It must work offline/local-only with no external dependencies or network.

## Deliverable

Implement a polished static tool that can be opened by double-click on Windows.

Recommended:
- `tools/ui-layout-lab/index.html`
- `tools/ui-layout-lab/layout-lab.css`
- `tools/ui-layout-lab/layout-lab.js`
- `tools/ui-layout-lab/presets.js`
- `tools/ui-layout-lab/README.md`
- `tools/ui-layout-lab/open-layout-lab.bat`

Classic script files are preferred over ES modules if that improves `file://` compatibility.

## Baseline mock

Mirror the visible Work0032/version8 `記録を追加` surface closely enough for layout decisions, using stable production DOM IDs as field IDs.

Visible field set:
- meeting-date
- meeting-time
- meeting-locationId
- meeting-counterpartyId
- meeting-assetClassId
- meeting-capitalTypeId
- meeting-teamId
- meeting-fundStrategy
- meeting-types pseudo/group field
- meeting-counterparty (面談相手)
- meeting-internalParticipants
- meeting-notes
- attachment-section pseudo/full-width block

Do not include hidden backend-only controls in the normal canvas by default. A developer/debug toggle may show them only if it helps spec completeness, but user editing should focus on visible UI.

## Editing model

Use a 12-column responsive grid, not arbitrary absolute coordinates.

### Drag
Fields can be dragged to reorder. Dropping should produce a deterministic order.

### Resize
Provide visible resize handles.
- horizontal pointer drag changes `colSpan` snapped 1–12
- notes/large blocks allow vertical height resize
- selected field side panel also permits numeric span/height adjustment for precision

### Hide/show
Left or right palette lists fields with eye/checkbox controls.

### Canvas controls
- container width percent
- optional maxWidthPx
- left / center alignment
- horizontal/vertical gap
- editing grid toggle

### Viewports
At minimum:
- Wide desktop 2560
- Laptop 1440
- Compact 1280
- Mobile 390

Mobile preview should automatically normalize field spans to one column visually without destroying desktop spec.

## Presets

Implement these presets with clearly visible cards/buttons and short Japanese descriptions.

0. Current v8
Reproduce the Work0032 baseline as closely as possible.

A. Compact Institutional
- width ~65%
- left aligned
- gap ~14
- high information density
- short eye travel
- participants wide
- notes full width ~380–420px

B. Balanced Professional
- width ~72%
- left aligned
- gap ~18
- moderate whitespace
- balanced field widths
- notes ~420px

C. Memo First
- width ~68%
- left aligned
- core identity compact
- notes moves earlier in order
- notes ~500px
- secondary metadata follows

Preset application must create normal editable state, not special hardcoded rendering.

## Auto tidy / design lint

Implement deterministic `整える` action.

It should normalize toward sane professional form layout:
- clamp width/colSpan to valid values
- avoid row overflow
- common fields to consistent spans
- participants sufficiently wide
- notes full-width and >= 320px
- desktop container excessive width reduction
- gap normalization

Add a `気になる点` panel with warnings/suggestions, not a numeric design score.

Examples:
- wide desktop container >80%
- too many controls on one row
- participant fields too narrow
- notes too short
- inconsistent spacing
- potential mobile overflow

## State / variants

Implement:
- undo
- redo
- reset
- save named variant to localStorage
- load/delete local variant
- unsaved-change indicator

Keep a bounded history (e.g. 50 states) to avoid unbounded memory.

## Export / import

Canonical JSON spec version 1.

Include:
- specVersion
- screen
- baseline
- presetOrigin
- container properties
- ordered fields: id, visible, colSpan, optional heightPx, optional role
- relevant viewport metadata

JSON export should be deterministic (stable field order/key structure).

Support:
- copy JSON
- download JSON
- import JSON text/file
- validate before applying
- exact export->import roundtrip

## Codex handoff

Implement a `Codexに渡す` action that produces a concise Japanese implementation brief containing:
- baseline/version
- container settings
- ordered field list
- widths/heights/visibility
- responsive intent
- preset origin
- exported JSON
- explicit instruction: visual/layout only unless separately authorized

Allow copy and `.md` download.

## Reference screenshot

Allow optional local image upload to display as a reference panel or background overlay with opacity slider.

Do not upload/transmit/store image externally. Do not auto-commit image bytes.

## Visual quality

The Lab itself should feel polished and calm, using the same broad light/business visual family as Knowledge Share but clearly labeled `UI Layout Lab`.

Suggested shell:
- left sidebar: presets + field visibility
- center: canvas
- right inspector: selected field + container controls + lint
- top toolbar: viewport / undo redo / reset / save / export

On narrow browser widths, tool panels may stack/collapse.

## Tests

Use Node standard library only.

Add tests under `tests/` covering at least:
- all presets valid
- unique stable field IDs
- colSpan bounds
- current-v8 baseline contract
- auto tidy output validity/idempotency
- JSON serialize/parse roundtrip
- invalid import fail-closed
- hidden field state preserved
- no URL/network dependency strings in runtime source unless harmless local anchors

Manual/browser validation:
- open through `.bat` or direct `index.html`
- apply each preset
- drag at least 3 fields
- resize at least 2 fields
- resize notes vertically
- hide/show one field
- undo/redo
- save/load named variant
- export/import JSON roundtrip
- generate Codex handoff
- desktop/mobile preview
- reference image local overlay
- console material error/warn 0

## Git

Create branch from latest main:
`codex/0033-ui-layout-lab`

Open one Draft PR. Do not merge.

Report:
`docs/handoffs/0033-CODEX-01-ui-layout-lab-report.md`

## Autonomous completion

Own implementation/debug/browser validation in this single Dispatch.

Up to 3 coherent repair cycles. Do not return for ordinary HTML/CSS/JS/test failures.

Return early only if architecture boundary must change, external dependency/network becomes necessary, or production source modification is required.

## Done when

```text
LAYOUT_LAB: USABLE
PRESETS: 4_PASS
DRAG_RESIZE: PASS
HIDE_SHOW: PASS
VIEWPORT_PREVIEW: PASS
AUTO_TIDY_LINT: PASS
UNDO_REDO: PASS
LOCAL_VARIANTS: PASS
JSON_ROUNDTRIP: PASS
CODEX_HANDOFF: PASS
REFERENCE_IMAGE_LOCAL_ONLY: PASS
NETWORK_CALLS: 0
PRODUCTION_SOURCE_CHANGES: 0
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

Final response:
WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: CHATGPT
STATUS: RETURNED