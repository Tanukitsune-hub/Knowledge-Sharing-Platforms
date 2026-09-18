# CODEX-02 supplement — revised selected layout candidate

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Supersedes previous candidate

The previously saved 24-column / width 77% candidate is superseded by the user's revised preferred candidate.

Authoritative current candidate:
`docs/handoffs/0033-user-layout-candidate-current.json`

Key changes:
- gridColumns: `12`
- container widthPercent: `100`
- maxWidthPx: `1680`
- desktop row topology revised

Do not use the earlier 77%/24-column candidate as the preferred layout.

## Responsive intent

Preserve the SAME canonical 12-column placement across:
- Wide 2560
- Laptop 1440
- Compact 1280 where usable

Only `<=720px` becomes single-column.

Container behavior:

```text
width: 100% of available application content area
max-width: 1680px
align: left
```

This is now literal design intent. Do not reinterpret `100%` as `77%` on wide screens.

At 1440/1280, use 100% of the available content area up to the same max-width. Preserve colStart/colSpan/breakBefore and do not auto-reorder desktop fields.

## Canonical visible topology

```text
Row 1
  meeting-date            start 1 span 2
  meeting-time            start 3 span 1
  meeting-locationId      start 4 span 2
  meeting-teamId          start 6 span 2
  meeting-assetClassId    start 8 span 2
  columns 10-12 intentionally unused

Row 2
  meeting-types           start 1 span 12

Row 3
  meeting-counterpartyId  start 1 span 6
  meeting-fundStrategy    start 7 span 4
  columns 11-12 intentionally unused

Row 4
  meeting-counterparty    start 1 span 6

Row 5
  meeting-internalParticipants start 1 span 6

Row 6
  attachment-section      start 1 span 12

Row 7
  meeting-notes           start 1 span 12
```

`meeting-capitalTypeId` is hidden and consumes no visible slot.

## Ordering semantics

Serialization `order` is not sufficient to derive visual order within a row.

Explicit placement is authoritative:
- `breakBefore` defines row boundary intent
- `colStart` defines horizontal position
- `colSpan` defines width

Renderer must respect explicit coordinates even when JSON array order differs from left-to-right visual order.

For example, Row 1 JSON order contains Asset Class before Team/Location/Time, but visual placement must still be:
`Date -> Time -> Location -> Team -> Asset Class`

Do not let DOM order cause auto-placement to reorder the intended coordinates.

## Viewport switching invariant

Switching:
`Wide -> Laptop -> Compact -> Wide`

must NOT mutate:
- gridColumns
- colStart
- colSpan
- breakBefore
- order
- topGapPx
- heightPx

Exported canonical placement JSON must remain identical before/after viewport preview switching.

Mobile 390 may render a one-column visual projection, but must not mutate the desktop canonical spec.

## Handoff text requirement

`Codexに渡す` should state:

```text
Desktop (Wide/Laptop/Compact)では12-column canonical placementを維持する。
containerはavailable application content areaの100%を使用し、max-width 1680px。
desktop viewport変更ではfield placementをreflow/reorderしない。
720px以下のみ1-column visual projectionとし、desktop specは保持する。
```

## Work boundary

This supplement updates Layout Lab preview/spec/handoff fidelity only.
Do not modify production src or deploy Apps Script in Work0033.