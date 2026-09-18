# CODEX-02 supplement — selected layout candidate / desktop shape lock

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## User-selected candidate

ユーザーがLayout Labで作成した現時点の本命candidateを保存する。

Canonical candidate JSON:
`docs/handoffs/0033-user-layout-candidate-v1.json`

これはproductionへ即時反映する指示ではなく、Layout Lab direct-manipulation v2とresponsive preview/handoffが保持すべきreference layoutである。ユーザーは今後さらに微調整できる。

## Required row topology

Wide 2560でのcandidateは、visible fieldについて次のrow topologyを意図している。

```text
Row 1:
  date [1..3]
  time [4..5]
  location [6..8]
  team [9..11]
  asset class [12..14]

Row 2:
  Meeting Type [1..24]

Row 3:
  Counterparty [1..12]
  Fund / Strategy [13..20]

Row 4:
  Meeting counterparty people [1..12]

Row 5:
  Internal participants [1..12]

Row 6:
  Attachment [1..24]

Row 7:
  Notes [1..24]
```

`meeting-capitalTypeId` is hidden and must not reserve visible grid space.

Order values are serialization/semantic order. Explicit placement (`colStart`, `colSpan`, `breakBefore`) determines the visual topology. Rendering must not accidentally move a field to another row merely because DOM/source order differs from horizontal column order.

## Responsive requirement — preserve shape

User explicitly wants the same shape at Laptop 1440 as at Wide 2560.

Therefore:

- Wide 2560: canonical 24-column placement exactly as candidate.
- Laptop 1440: SAME row topology and SAME colStart/colSpan proportions.
- Compact 1280: SAME row topology and SAME colStart/colSpan proportions where usable.
- Mobile <=720: one-column stack; desktop spec remains untouched.

Do NOT create a different laptop layout and do NOT auto-reorder/reflow fields between 721px and desktop sizes.

### Container behavior

The exported candidate says `widthPercent: 77` with `maxWidthPx: 1680`. At Wide 2560 this resolves to the intended approximately 1680px visual width.

At Laptop/Compact, preserving the geometry is more important than preserving literal 77%. Use a fluid-to-max interpretation:

```text
desktop/wide effective container:
  width: min(100% of available app content, 1680px)
  align: left

candidate 77% is a wide-screen design hint, not a requirement to squeeze the 1440 layout to 77% of an already smaller content area.
```

In Layout Lab preview this may be represented as a responsive preview override while keeping canonical candidate JSON unchanged, or as an optional v2 responsive policy in exported/handoff metadata.

Preferred optional metadata if implemented:

```json
{
  "responsive": {
    "preserveDesktopPlacement": true,
    "desktopMinWidthPx": 721,
    "fluidToMaxWidth": true,
    "mobileBreakpointPx": 720,
    "mobileMode": "single-column"
  }
}
```

Do not bump beyond specVersion2 solely for this optional metadata.

## Acceptance in Layout Lab

Using the saved candidate:

1. Wide 2560 preview matches the candidate topology.
2. Switching to Laptop 1440 does not mutate canonical field placement.
3. Laptop 1440 preserves the same seven visible rows and horizontal relationships.
4. Switching to Compact 1280 preserves the same topology unless the editor explicitly warns that available width is too small; it must not silently reorder.
5. Switching among Wide/Laptop/Compact and back yields identical exported placement JSON.
6. Mobile 390 shows one-column while exported desktop placement remains identical.
7. Hidden Capital Type remains hidden and consumes no visual slot.

## Handoff generation

`Codexに渡す` should explicitly say:

```text
Wide/Laptop/Compactではcanonical grid placementを維持する。
available content widthが1680px未満ならcontainerをavailable widthまで広げ、
fieldのrow/col topologyを変えずに縮尺を吸収する。
720px以下のみ1-columnへreflowする。
```

## Boundary

No production source changes in Work0033. This requirement is about Layout Lab preview/spec/handoff fidelity only.