# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-04
ACTIVE_DISPATCH_ID: 0028-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.6 / CROSS-PAGE LIGHT FAMILY / DESIGN ONLY

## Current ball and authorization

CODEX-03 returned PARTIAL on Draft PR #40 after producing A/B/C Light directions. The user then selected and refined one direction in ChatGPT. Those visual-language decisions are now closed for cross-page design exploration.

CODEX-04 is authorized to apply that one selected Light design system across the real current page family and review page-specific information/input placement. It is not authorized to modify production source/runtime or to proceed to Dark/build/deployment.

Instruction: `docs/handoffs/0028-CODEX-04-cross-page-light-family-instruction.md`.
Expected report: `docs/handoffs/0028-CODEX-04-cross-page-light-family-report.md`.

Reviewed main before dispatch publication: `b72cbaa1cdc9321bed2a477e8d2f8eb71d806223`; the execution must record its actual current source SHA.

## Closed selected Light direction

- persistent left sidebar; desktop-first for wide screens;
- shell/navigation: B-like workspace;
- Knowledge Search: A-like linear clarity;
- record/maintenance: C-like moderate table density;
- Light main surface: bright warm white/off-white;
- sidebar base token: `#182124`;
- restrained gold accents;
- clean geometric gold `紗綾形` concentrated lower-left, fading toward upper-right;
- active sidebar menu only: thin left strip `#E1001F` plus non-red selected-state cue;
- no other `#E1001F` usage;
- no additional visual motif;
- later Dark charts remain `CHART_SURFACE_THEME: LIGHT_FIXED`.

The generated ChatGPT/Codex images are visual references only. Actual source contracts override malformed geometry, invented copy, missing controls and other ImageGen artifacts.

## Primary design question

Visual style is no longer open-ended. CODEX-04 should determine how the fixed style works across all major existing pages, with special focus on input/form placement, grouping, width, order, density, advanced-control disclosure and wide-screen/laptop usability.

Reordering/grouping presentation is allowed in design artifacts. Function/payload/eligibility/backend semantics are not.

## Dispatch history

| Dispatch ID | Disposition |
|---|---|
| N/A | Route A planning/reconciliation. |
| 0028-CODEX-01 | Historical tombstone from superseded shared-admin line; never reuse. |
| 0028-CODEX-02 | Historical tombstone from superseded shared-admin PR #38; never reuse. |
| 0028-CODEX-03 | Product Design A/B/C Light comparison; RETURNED PARTIAL on Draft PR #40. |
| 0028-CODEX-04 | Cross-page selected-Light design family / input-layout review; RETURNED / BALL CHATGPT. |

## Gates

CODEX-04 returns the selected Light visual family and input-layout review to ChatGPT.

Next gate after review: user accepts/corrects the selected Light cross-page design.
Then: create only the selected Dark visual family.
Then: explicit user authorization before production BUILD.
Deployment remains separately scoped.

## Evidence state

```text
USER_DIRECTION_SELECTED: YES
SELECTED_LIGHT_VISUAL_LANGUAGE: FIXED
SIDEBAR_BASE_COLOR: #182124
SAYAGATA_MOTIF: SELECTED / CLEAN GEOMETRY REQUIRED
ACTIVE_MENU_ACCENT: #E1001F / THIN LEFT STRIP ONLY
OTHER_E1001F_USAGE: PROHIBITED
CROSS_PAGE_LIGHT_FAMILY: PASS
INPUT_LAYOUT_REVIEW: PASS
SELECTED_DARK_MOCK: NOT_STARTED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-04
ACTIVE_DISPATCH_ID: 0028-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
