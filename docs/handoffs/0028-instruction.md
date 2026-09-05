# Work 0028 — UI/UX surface refinement and terminology simplification

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1 / DESIGN ONLY

## Current authority and scope

The user has adopted the controller's approach and requested Codex + Product Design execution after Work 0029 closed. Current execution contract:

`docs/handoffs/0028-CODEX-03-product-design-light-mocks-instruction.md`

Current ball and identifier history:

`docs/handoffs/0028-dispatches.md`

This now authorizes isolated design artifacts, not production implementation. It supersedes earlier A0 statements saying mock creation and all Codex dispatch were not authorized. The old detailed plan remains research/inventory material, not current permission or dispatch numbering. Historical 0028-CODEX-01/02 on superseded PR #38 must not be recycled. 0028-CODEX-03 is the next valid UI/UX execution instruction.

The primary outcome is a more intuitive existing Knowledge Share: design, navigation, information hierarchy, terminology, state/confirmation displays and readable AI answers/citations. This is not new business-feature development or backend redesign. ChatGPT owns scope, recommendation acceptance and final review; Codex performs bounded local/plugin execution. The user selects visible directions, not implementation frameworks or technical architecture.

## Baseline and preservation

Reviewed main before dispatch: `a0a646d5b5d8715f1d1e7e8402357e160b2a25a7`.
Preserve accepted Work 0027 and Work 0029, not just the older pre-admin baseline. PR #39 is merged and 0029 is closed. Its shared-password unlock, opaque sessionStorage token, server validation, explicit logout and password-rotation behavior remain unchanged. No temporary-password rotation, timed expiry or authorization redesign is part of this Work.

The governing preservation decision remains `docs/decisions/ui-surface-language-and-backend-preservation.md`.
The detailed initial inventory, UX research and future validation matrix remain `docs/planning/work0028-ui-ux-and-theme-plan.md`.

Preserve five-sheet storage; stable IDs/metadata; Meeting/Pitchbook capture/edit/locking; Active/Inactive/Reactivate lifecycle and eligibility; facade/API contracts; five Knowledge Search modes, filters, 2–5-Entity comparison and authoritative citations; explicit ChatGPT/Gemini/full-output semantics and no failover; model/thinking policy; provider states/adapters; installer/bundle architecture; security boundaries. No new sheet/database/API/provider/index/relation/migration/background workflow or investment KPI for a mock. Adjust the design instead of inventing backend behavior.

## Source grounding before visuals

Read latest main, applicable AGENTS, work registry, this brief/current dispatch, governing decision, detailed plan, product vision and 0027/0029 dispatch registers. Pin the exact source SHA.

Inspect these current source files:

```text
src/Index.html
src/Styles.html
src/ClientCore.html
src/MaintenancePages.html
src/ClientMaintenance.html
src/ClientMaintenanceEnhancements.html
src/KnowledgeSearchPage.html
src/ClientKnowledgeSearch.html
src/EntityWorkspacePage.html
src/ClientEntityWorkspace.html
src/ActivityAnalyticsPage.html
src/ClientActivityAnalytics.html
src/RelationshipExplorerPage.html
src/ClientRelationshipExplorer.html
```

Also inspect reachable GP Workspace, AI Provider Settings, bootstrap/shared fragments and effective overrides. Read server/test code only to resolve existing UI semantics. Source inspection is not live rendering or target-runtime qualification. The earlier 14-file bounded preflight is useful, but not a finished full inventory.

Produce an inventory linking page/action/actual label, DOM/handler, request/response contract, state/visibility, source location and proposed presentation. Preserve all current destinations, including both GP and Entity Workspace. Verify current routing and conditional controls after Work 0029 rather than drawing the previous shell from memory.

## Adopted approach and three-way Light comparison

Start from B workspace + A search clarity + C moderate table density. This is the adopted design approach, not an approved unseen visual target. Produce three genuinely distinct and fairly compared Light directions:

| Direction | Difference |
|---|---|
| A. Minimal / Search-forward | Lightweight question entry, obvious primary action, organized secondary controls. |
| B. Workspace / Notion-like | Calm workspace, visible page location/navigation, purposeful sections/tables/cards. |
| C. Investment Dashboard | Professional private-assets workbench density; existing information only, no new portfolio dataset. |

Use identical synthetic records, dates, question, answer, citations/source identity, wording, filters, states and provider-policy fixtures. View at comparable desktop/laptop dimensions. The baseline hides Gemini; a hypothetical already-qualified enabled-Gemini state must be separately labelled and applied equally across directions. Do not enable a provider to make a screenshot.

The user prefers clearly distinguishable interactive areas and visible boundaries, not controls that blend into the background. Use restrained but sufficient borders and focus/selection differentiation. Do not blindly apply a plugin's borderless aesthetic default.

Every direction covers shell/navigation/landing, past Meeting/Pitchbook maintenance, edit/delete/deleted/restore, Knowledge Search input/mode/filters/route/approved controls, result/evidence/citations/source links, loading/long-running/recheck, empty/insufficient-evidence/error, and representative full-output controls. Use readable visual screens and necessary state panels, not prose-only wireframes or unreadable miniature contact sheets. Do not mass-produce every page.

Artifacts stay in `docs/design/0028/` without real backend connections. The Product Design plugin's image ideation is explicitly requested; no image-to-code, new application scaffold, deployment or public sharing is authorized in CODEX-03. Record exact generated asset identities and actual display order.

## Terminology and truthful behavior

Use an actual-display → recommended-user-display → unchanged internal/admin term → reason/source inventory. Prefer Japanese task vocabulary. Candidate record terms are 削除 / 削除済み / 復元 for the existing reversible lifecycle; maintain eligibility and literal option values. Do not confuse Master exclusion with record deletion or upload state with provider indexing.

Confirmation must explain retained/restorable data, normal-list/search visibility, and preserve historical related links and original Drive access semantics. Do not promise permanent erasure. Keep existing route/filter/model/thinking behavior visible and truthful; do not hide active filters or required comparison/preparation targets. Full output is not an AI provider and retains actual source/package constraints. Do not fabricate fine-grained attribution, document previews, progress or cancel/retry behavior.

Known source-based corrections: Activity Analytics means 面談活動の集計; the Meeting list's counterparty column can include non-GP entities; relationship history retains inactive/unresolved links; an existing navigation-only action must not be depicted as opening a specific record for edit.

## Theme policy, including the adopted chart simplification

Light A/B/C first. After explicit user selection, create only the selected Dark version. Then obtain selected Light/Dark approval and explicit production-implementation authorization. No automatic transition from approach approval to implementation.

Future theme choice: システム設定に合わせる / ライト / ダーク. Initial browser system preference, explicit choice wins, guarded browser-local storage only, separate from 24-hour drafts/admin session tokens. No account synchronization, backend persistence, reload, input loss or query restart. Existing print stays Light; canonical Copy/Docs/PDF content stays independent of screen theme.

CHART_SURFACE_THEME: LIGHT_FIXED

In Dark, keep each chart's complete interior identical to its selected Light design: background, series, axes/grid, labels, in-chart legends and any existing tooltip/empty state. Protect these local Light colors from global Dark inheritance. Only the surrounding shell/card/boundary adapts. No separate Dark chart palette, duplicate renderer or new chart library. Review the Light island's brightness/size and border in the selected Dark mock; no need to design a second chart version by default. This exception applies to charts, not all tables/forms/AI answer panels.

This dispatch and theme section are the latest scoped amendment to any older requirement to design Dark chart colors. Other design tokens remain theme-aware. No theme code or Dark mock is implemented in CODEX-03.

## Review, outputs and gates

Use the same seven scenarios for all three directions: find a past Meeting; edit; delete; find/restore; ask Knowledge Search; check citations/source; choose ChatGPT/Gemini/full output truthfully. Compare first action, predicted clicks/decisions, terminology, density, navigation, evidence readability, statuses, daily desktop use, current GAS implementation difficulty and backend risk. Label this expert heuristic review, not external user testing. Static counts are predictions, not measured task times/success rates.

Required outputs: source/functional inventory; terminology map; three visible, saved visual directions; comparison and scenario observations; implementation/risk classification; one practical recommendation; explicit non-presentation-only elements. No preset aesthetic scores or self-approval of B. Prefer a bounded hybrid of shown components over a fourth new information architecture.

CODEX-03 returns its design package to ChatGPT for review, then stops before user selection. Light selection → selected Dark design → explicit implementation gate are later activities. A returned dispatch uses a new number for any follow-up, allocated by ChatGPT. Never reopen 0029 or use its residual password rotation as a reason to block this design task.

The current execution contract defines allowed paths, tool/iteration bounds, report format and draft-PR delivery. All unperformed checks remain NOT_RUN/NOT_STARTED; no production/runtime PASS is inferred from images.

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
BALL: CODEX
STATUS: READY
