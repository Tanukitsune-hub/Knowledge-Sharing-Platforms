# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
ACTIVE_DISPATCH_ID: 0028-CODEX-03
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
PHASE: A1.5 / SELECTED LIGHT REFINEMENT

## Current ball and authorization

CODEX-03 returned on Draft PR #40 with Product Design Light A/B/C artifacts, source/terminology inventory and seven-scenario review. Production source/runtime were unchanged. The visual package is PARTIAL because generated images contain documented wording/control omissions; PR #40 remains design-only and unmerged.

The user has now selected the overall Light direction based on the visible mocks: a persistent left sidebar is preferred because normal users work primarily on wide desktop screens. This is Gate 1 direction selection, not approval of any erroneous image pixel-for-pixel and not production-implementation authorization.

Selected direction:

- base shell/navigation: B Workspace / persistent left sidebar;
- Knowledge Search hierarchy: A-like linear question/search/result clarity;
- record and maintenance surfaces: C-like moderately dense, scan-friendly tables;
- preserve clear interactive boundaries, existing functions/contracts and the Japanese task-oriented terminology policy;
- desktop-first composition should use wide horizontal workspace efficiently while retaining the planned laptop/smaller-width fallback;
- CHART_SURFACE_THEME remains LIGHT_FIXED for the later Dark design.

## Selected Light visual language — user decision 2026-09-05

The user has further selected the visual language after direct ChatGPT mock exploration. Treat the following as closed visual-direction decisions for the corrected selected-Light reference and later implementation planning:

- main application surface: Light / warm white-to-off-white background; keep the primary work area visually bright and readable;
- persistent sidebar: deep navy base with restrained gold line/icon/text accents;
- decorative motif: `紗綾形` (sayagata) only, based on a clean geometric reference rather than copying distortions from generated mock images;
- sayagata placement: concentrated at the lower-left of the sidebar and fading/attenuating toward the upper-right so it does not interfere with navigation labels or controls;
- sayagata color: subdued gold linework; decorative only, never an interaction affordance;
- general ornament: premium and restrained; no mountain, mineral, Tokyo Station, chrysanthemum, sakura, or Nippon Life logo motif is selected;
- Nippon Life corporate accent: `#E1001F` is used only as a thin vertical strip on the left edge of the currently active sidebar menu item;
- do not use `#E1001F` for buttons, icons, headings, borders, dividers, warning states, links, badges, charts, decorative motif, or any other ordinary UI element;
- active-menu red strip is an identity accent layered on top of the existing selected-state treatment, not the sole selected-state cue. Keep the selected background/border/text treatment understandable without relying on red alone.

The generated style images are direction references only. Their malformed geometry, wording errors, missing controls, invented copy, or other ImageGen artifacts are not implementation specifications. The final corrected selected-Light reference must preserve actual source contracts and exact UI behavior.

Because PR #40's generated images did not meet strict visual-contract parity, do not treat `b-search.png` or another single PNG as the final implementation target. Before Dark design, produce one corrected selected-Light composite/reference that removes the documented PR #40 errata while preserving only already-reviewed A/B/C elements and the selected visual language above. This is a refinement of the selected hybrid, not a fourth design direction.

## Evidence

Draft PR #40: `docs(0028): Product Design light A/B/C — partial design-only return`.
Returned head: `a4ec3eeee70848d443ea3b152c10327f447ef6ed`.
CODEX-03 reported `VISUAL_CONTRACT_PARITY_NOT_MET`, `SOURCE_CODE_CHANGED: NO`, `RUNTIME_CHANGED: NO`, and recommended the same B-base + A-search + C-density hybrid conditionally.

User decisions after viewing the images:

- prefer the type with a left-side sidebar; users primarily operate on wide screens;
- prefer the premium navy/gold Light visual direction with a bright main content area;
- select sayagata as the only sidebar decorative motif;
- select Nippon Life red `#E1001F` only as the thin left-edge accent of the active sidebar item; no other red accent use.

## Dispatch history and next action

| Dispatch ID | Disposition |
|---|---|
| N/A | Route A UI/UX planning and source-based reconciliation. |
| 0028-CODEX-01 | Historical tombstone from superseded shared-admin line; never reuse. |
| 0028-CODEX-02 | Historical tombstone from superseded shared-admin PR #38; never reuse. |
| 0028-CODEX-03 | Product Design Light A/B/C; RETURNED PARTIAL on Draft PR #40. |

Next safe action: issue a fresh `0028-CODEX-04` only when proceeding with the corrected selected-Light composite/reference. That dispatch should use Product Design, fix the known visual-contract errors, apply the closed selected visual language above, and stop for review before producing the selected Dark design unless explicitly scoped otherwise.

Production implementation remains gated behind approval of the corrected selected Light and the later selected Dark design plus explicit implementation authorization. Deployment remains separately scoped.

## Evidence and completion latch

```text
PLANNING_UPDATE: COMPLETE
CODEX_03_RETURNED: YES / PARTIAL
DRAFT_PR_40: OPEN / DESIGN ONLY / UNMERGED
USER_DIRECTION_SELECTED: YES
SELECTED_LIGHT_DIRECTION: B-BASED HYBRID / LEFT SIDEBAR + A SEARCH + C TABLE DENSITY
SELECTED_LIGHT_VISUAL_LANGUAGE: LIGHT MAIN + DEEP NAVY SIDEBAR + RESTRAINED GOLD + SAYAGATA
ACTIVE_MENU_CORPORATE_ACCENT: #E1001F / THIN LEFT STRIP ONLY
OTHER_E1001F_USAGE: PROHIBITED BY CURRENT DESIGN DECISION
SELECTED_LIGHT_PIXEL_TARGET_APPROVED: NO
SELECTED_LIGHT_REFINEMENT: PENDING
SELECTED_DARK_MOCK: NOT_STARTED
CHART_SURFACE_THEME: LIGHT_FIXED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
WORK_0029_REOPENED: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
ACTIVE_DISPATCH_ID: 0028-CODEX-03
BALL: CHATGPT
STATUS: REVIEW
