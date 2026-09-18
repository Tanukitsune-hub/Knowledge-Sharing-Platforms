# CODEX-02 — Direct manipulation / fine placement enhancement

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Context

CODEX-01 completed the first usable Layout Lab and returned with USER-confirmed manual qualification.

Accepted CODEX-01 baseline:
- Draft PR #55 remains open/unmerged
- branch: `codex/0033-ui-layout-lab`
- returned head: `405cf7f4579b7413df3de36dab4f2675176ceafa`
- initial 12-column drag/reorder + limited resize works
- four presets, hide/show, undo/redo, local variants, JSON roundtrip, Codex handoff, local reference overlay all passed user manual qualification
- production src changes0 / Apps Script deployment0 / network/provider calls0

After that qualification, the user explicitly requested a more direct and flexible editing experience. This is a new instruction after RETURNED, so use Dispatch `0033-CODEX-02`.

## Read first

- latest `origin/main`
- root / nearest `AGENTS.md`
- `docs/decisions/ui-layout-lab.md`
- `docs/planning/work0033-ui-layout-lab.md`
- `docs/handoffs/0033-CODEX-01-ui-layout-lab-report.md` from PR branch
- `docs/handoffs/0033-CODEX-01-direct-manipulation-supplement.md` from main
- `docs/handoffs/0033-dispatches.md`

Treat CODEX-01 functionality as accepted baseline. Do not regress it.

## Primary Outcome

Upgrade Layout Lab from `reorder + limited edge resize` into a direct-manipulation visual editor where the user can drag fields to precise row/column positions and resize fields directly in both axes with mouse/pointer gestures.

Keep it a local-only static sandbox. Do not touch production `src/` or deploy Apps Script.

## Required direct manipulation

### 1. Eight-direction resize handles

When a field is selected, show clear handles on:
- N / S / E / W
- NE / NW / SE / SW

Behavior:
- E/W changes horizontal size
- N/S changes vertical size
- corner handles change both at once
- W/N should preserve the opposite edge as naturally as possible
- pointer capture + live preview
- pointerup commits exactly one history entry
- pointercancel restores safely

Show a small live badge during resize with width/start/height values.

### 2. All fields can resize vertically

Not only notes/attachment.

Allow safe vertical sizing for ordinary input/select/group fields too.

Use sensible field-class constraints:
- compact standard field minimum around normal input usability
- participant/group fields moderate range
- notes/attachment large range

Direct canvas resize is primary. Inspector remains precision fallback.

### 3. Flexible direct placement

Dragging a field should use pointer position as placement intent, not only swap/reorder with another card.

On drag/drop, determine:
- target order/row insertion
- start column
- whether a new row/break is intended

Allow intentional horizontal gaps.

During drag show:
- drop ghost
- row insertion marker
- target start column/span preview
- current grid/alignment guides

Do not silently overlap fields.

Collision policy may be either:
- block invalid drop with clear preview/warning, or
- deterministic push/reflow

Choose one consistent UX and test it.

## Placement model / spec v2

Canonical field placement must support at least:
- `order`
- `colStart`
- `colSpan`
- `breakBefore`
- `topGapPx`
- optional `heightPx`

Container must support:
- `gridColumns`
- existing width/maxWidth/alignment/gap properties

Promote canonical spec to version2.

Example:

```json
{
  "specVersion": 2,
  "screen": "meeting-create",
  "baseline": "work0032-version8",
  "container": {
    "gridColumns": 24,
    "widthPercent": 68,
    "maxWidthPx": 1680,
    "align": "left",
    "columnGapPx": 16,
    "rowGapPx": 16,
    "showGrid": true
  },
  "fields": [
    {
      "id": "meeting-counterparty",
      "order": 8,
      "visible": true,
      "colStart": 2,
      "colSpan": 11,
      "breakBefore": true,
      "topGapPx": 8,
      "heightPx": 92,
      "role": "participant"
    }
  ]
}
```

## Backward compatibility

Existing user artifacts from CODEX-01 must remain usable.

- specVersion1 JSON imports successfully
- v1 -> v2 migration deterministic
- saved localStorage v1 variants migrate on load without deletion
- Current v8 and all presets produce valid v2 state after load/migration
- exported JSON is deterministic

Do not make user manually recreate existing variants.

## Precision modes

Add visible precision selector:
- Standard = 12 columns
- Fine = 24 columns

Conversion:
- 12 -> 24 preserves visual proportions exactly by doubling start/span
- 24 -> 12 normalizes to nearest safe placement
- if fidelity is lost, show a preview/warning before commit or make loss clear

Mobile preview must remain one-column visually while preserving desktop placement spec.

## Inspector precision controls

For selected field expose at least:
- Start column
- Width / span
- Top gap px
- Height px
- Row break

All inspector changes and mouse gestures must stay synchronized.

## Fine nudge

When canvas has focus and a field is selected:
- Arrow Left/Right: move start column by 1 grid unit
- Arrow Up/Down: move order/row intent by 1 step
- Shift+Arrow: larger step

Do not hijack arrow keys while a real form control/inspector input has focus.

Add small top-gap controls if helpful, preferably 4px increments.

## Alignment aids

During placement/resize show subtle guides:
- grid lines
- nearby left/right edge alignments
- container left/center guide
- out-of-bounds/collision state

Guides are editor-only and must not pollute exported spec.

## Auto tidy / design lint updates

Keep existing deterministic tidy/lint and extend it for v2.

Warnings should cover at least:
- collision
- out of grid bounds
- excessive intentional horizontal/vertical gap
- ordinary field unusually tall
- too-narrow participant field
- notes too short
- 24-column placement that loses fidelity if converted to 12

No numeric design score.

## UX quality

The editor should feel direct:
- selected field border/handles obvious but not noisy
- mouse cursor changes by handle direction
- resizing/dragging should not accidentally initiate native browser drag where pointer interaction is intended
- one gesture = one undo step
- no jarring full rerender during live pointer move if avoidable

## Preserve all CODEX-01 features

Still required:
- 4 presets
- hide/show
- viewport previews
- tidy/lint
- undo/redo
- reset
- named local variants
- JSON copy/download/import
- Codex handoff copy/download
- local screenshot overlay
- Windows launcher

## Tests

Use Node standard library only.

Add/expand tests for:
- spec v1 -> v2 migration
- v2 validation / stable serialization
- `gridColumns` 12/24
- `colStart` bounds
- `colSpan` bounds
- `breakBefore` / `topGapPx` normalization
- 12->24 exact conversion
- 24->12 safe conversion
- collision/bounds policy
- direct placement model update
- east/west/north/south/corner resize math
- ordinary field vertical constraints
- notes/attachment vertical constraints
- one-gesture history semantics where model-testable
- v2 exact JSON roundtrip
- existing preset and hidden-field behavior

Run:
- focused tests
- `npm run check`
- `git diff --check`

Do not regenerate Apps Script bundle.

## Manual qualification

Chrome automation file:// limitation from CODEX-01 is already classified and accepted as tooling limitation.

After enhancement is complete, return to USER with one concise revised checklist only.

Checklist must cover:
1. drag a field to another row and non-default horizontal start
2. E and W horizontal resize
3. N and S vertical resize
4. a corner resize in both axes
5. make notes substantially taller by mouse
6. make a normal field taller/shorter safely
7. Standard 12 <-> Fine 24 switching
8. inspector values track mouse result
9. arrow nudge works without breaking inputs
10. undo/redo treats each gesture as one change
11. v1 import migration and v2 JSON roundtrip
12. preset/variant/hide-show/handoff/reference overlay still work
13. console material error/warn0

Do not ask user to share private JSON or images.

## Fixed boundaries

```text
PRODUCTION_SRC_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
NETWORK_CALLS: 0
GOOGLE_CALLS: 0
PROVIDER_CALLS: 0
REAL_CONFIDENTIAL_DATA: 0
WORK_0030: DEFERRED_BY_USER
```

## Git / delivery

Continue on existing:
- Draft PR #55
- branch `codex/0033-ui-layout-lab`

Do not create a second PR.
Do not merge.

Report:
`docs/handoffs/0033-CODEX-02-direct-manipulation-report.md`

Update PR body to current Dispatch identity.

## Autonomous completion

Own implementation/debug/local deterministic validation in this Dispatch.

Up to 3 coherent repair cycles. Do not return after ordinary HTML/CSS/JS/test failures.

Return early only if:
- production source modification becomes necessary
- external runtime/network dependency becomes necessary
- accepted local-only architecture must materially change
- 3 coherent cycles are exhausted

## Return contract

When implementation/tests are ready for user manual verification:

```text
WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
BALL: USER
STATUS: ACTION_REQUIRED
```

Do not return `BALL: CHATGPT / RETURNED` until the revised USER manual checklist has been completed.