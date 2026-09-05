# Work 0028 — UI/UX and theme delivery plan

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: READY
MODE: INVESTIGATION
PHASE: A0 / planning complete; visual exploration not started
Current as of: 2026-09-05
Source baseline: `e90d6f31205249b6de7720896708cdef3e0ba212`

`READY` means ready for the next design-only activity, not ready for implementation or runtime use. This document records a planning decision, not approval of a visual design.

## 1. Work contract

| Item | Contract |
|---|---|
| Primary outcome | Make the existing Knowledge Share understandable and comfortable for daily private-assets knowledge work, without rebuilding its business system. |
| Current deliverable | A source-grounded design/implementation plan, explicit Light/Dark/System policy, comparison method and acceptance gates. |
| Active hypothesis | A workspace shell, search-forward question/result surface, and moderately dense record tables are the best low-risk starting combination. This remains a hypothesis until comparable mocks are reviewed. |
| Fastest safe decisive action | Inspect the current source and accepted contracts, select relevant primary UX/browser guidance, and update planning documents only. |
| Acceptance evidence, in order | Explicit user constraints; accepted repository contracts and pinned source; comparable rendered mocks when produced; scenario-based expert review. Actual target-browser evidence is required later for runtime claims. |
| Authorized now | Read source and public guidance; update this plan, governing decision, instruction, dispatch register and work registry. |
| Not authorized now | Production source edits, prototype execution, Codex dispatch, bundle generation, runtime calls, live-data changes, deployment, provider enablement. |
| Non-goals | New business features, new frontend framework, account synchronization, backend redesign, administrator-authorization redesign, provider recovery, migration and company rollout. |
| Bounds | One coherent docs-only update and one final review. At most one conflict-resolution retry; never force-push. Future mock review: one comparable set and one targeted correction round before selection. |
| Reset conditions | A candidate needs new backend behavior; current source contradicts its assumed capability; repeated review churn; or scope/mode changes. Preserve accepted evidence, adjust the candidate, and route unrelated findings to follow-up. |
| Completion latch | This planning task stops after verified GitHub publication. Phase A and Work 0028 remain open; no mock, usability or runtime result is marked PASS in this planning task. |

The source-preservation boundary in `../decisions/ui-surface-language-and-backend-preservation.md` remains controlling. Source code in the status fields means production `src/**`, not a future isolated design artifact.

## 2. Ownership and gates

ChatGPT owns the source inventory, research, design recommendation, comparison, terminology, risk classification and final review. The user does not need to select component libraries, invent navigation, or learn design terminology. The user reviews visible alternatives and chooses the overall direction. Codex receives only the remaining implementation/runtime work after authorization.

| Stage | Work to perform | Exit / authority |
|---|---|---|
| A0: planning | This plan and a bounded source preflight. Complete the full surface inventory before mocks. | Planning update only; no claim that the full UI audit is complete. |
| A1: Light alternatives | Produce A/B/C with identical capabilities, fixtures, route-policy states and wording. Review the same seven scenarios. | Present visual evidence plus one recommendation. Do not implement. |
| Gate 1 | User selects A, B, C or a bounded hybrid. | Selection freezes Light layout/navigation direction, not production execution permission. |
| A2: selected Dark design | Apply Dark tokens to the selected Light design; preserve structure and demonstrate critical interaction states and theme selector. | No three-way Dark redesign and no new information architecture. |
| Gate 2 | User approves the selected Light/Dark design and explicitly authorizes implementation. These approvals may be given together. | Only now issue a BUILD handoff and `0028-CODEX-01`, after checking dispatch history. |
| B: implementation and qualification | Implement the selected presentation against existing contracts, then perform bounded authorized validation. | ChatGPT reviews final diff, tests and target-runtime evidence. Deployment needs its own scoped permission. |

The present request authorizes planning and GitHub documentation, not A1 mock production or any production execution. No work continues automatically in the background. The user's delegation of specialist design decisions does not waive the previously explicit visual-selection gate.

## 3. Source preflight and required complete inventory

The planning preflight inspected the actual pinned source across all 14 priority files: `Index.html`, `Styles.html`, `ClientCore.html`, `MaintenancePages.html`, `ClientMaintenance.html`, `ClientMaintenanceEnhancements.html`, `KnowledgeSearchPage.html`, `ClientKnowledgeSearch.html`, `EntityWorkspacePage.html`, `ClientEntityWorkspace.html`, `ActivityAnalyticsPage.html`, `ClientActivityAnalytics.html`, `RelationshipExplorerPage.html` and `ClientRelationshipExplorer.html`. Some large files, notably client/editor fragments, were read in bounded ranges. This is not a complete rendered UI audit, and no deployed screen was inspected in this task.

The docs-only update at `bec1af7001e6756ff7a36dfbeee0f078de1a0d44` was reconciled before this refinement. Its comparison against the pinned baseline changed five Markdown documents and no production source. Work 0028 is already registered for this outcome; do not allocate or rename a Work because the user was unsure of the number.

Source-backed observations (paths below are under `src/` at the pinned source baseline):

| Observation | Evidence / design consequence |
|---|---|
| The shell has 11 navigation buttons at the same visual level; the initial active page is Meeting registration. | `Index.html`, `ClientCore.html::pages/showPage`. Group existing destinations without dropping one or changing its handler. A search-forward landing is a candidate, not an already approved default change. |
| Colors are directly specified across common controls, statuses, tables, SVG analytics and print rules. | Inspected sections of `Styles.html`. Add semantic tokens before theme rollout; changing only the body background is insufficient. |
| Drafts already use guarded localStorage helpers and a 24-hour envelope. | `ClientCore.html::safeGet/safeSet/safeRemove/readEnvelope`. Theme preferences require a separate key without the draft TTL. Do not change draft behavior. |
| Record actions actually say `無効化` and `再有効化`; record status badges expose internal values. | `ClientMaintenance.html::renderMeetingResults/renderPitchbookResults/changeMeetingRecordStatus`. Rename presentation, not target status, IDs, version checks or eligibility. |
| Some status options have no explicit `value` attribute. | `MaintenancePages.html`. Replacing visible `Inactive` with `削除済み` without first preserving `value="Inactive"` would change the request. Verify DOM-to-payload parity. |
| The Meeting list's `GP` column can display a non-GP counterparty. | `MaintenancePages.html` and `ClientMaintenance.html::renderMeetingResults`. Prefer the header `面談先`; do not change the counterparty or Related GP data. |
| The question is below a large filter block; modes and model/thinking controls are already present. | `KnowledgeSearchPage.html`, `ClientKnowledgeSearch.html::kApplyMode/kPayload/kApplyModelPolicy`. Move or disclose controls, but retain values, policy validation and comparison requirements. |
| Gemini availability is policy-dependent; Work 0027 records it disabled and hidden for normal users. | `ClientKnowledgeSearch.html::kApplyRouteSurface` and `docs/handoffs/0027-dispatches.md`. Preserve effective profile/route visibility; do not show an enabled Gemini choice as the current baseline. |
| Results render plain answer text and separate authoritative citation records with source identity and optional page number. | `ClientKnowledgeSearch.html::kRenderResult/kRenderCitations`. Improve reading order and links, but do not invent sentence-level attribution or document highlights. |
| Long-running queries have bounded polling and a `結果を再確認` action. | `ClientKnowledgeSearch.html` pending-query functions. A visual spinner is not permission to restart queries, alter polling, add cancel semantics or fail over providers. |
| The current full-output surface describes Meeting Google Docs full text plus Pitchbook reference links, not Pitchbook body extraction. | `KnowledgeSearchPage.html`, `ClientKnowledgeSearch.html::kRenderExportPreview/kCreateExport`. Preserve scope, preview eligibility and package fingerprints; validate actual facade/test evidence before claiming runtime parity. Do not promise universal full-document extraction. |
| Meeting-specific advanced filters can select Meeting as the source type. | `ClientKnowledgeSearch.html` change listeners for Team, follow-up, Related GP and Meeting Type. Show the effective scope even when the filter group is collapsed; do not change this existing behavior. |
| Maintenance enhancements override shared behavior after other fragments load. | `ClientMaintenanceEnhancements.html::bootstrapMaintenance/applyMaintenanceMasterData`. Inspect effective load order, not only the first function definition. |
| Activity Analytics aggregates Meeting metadata rather than a combined Meeting/Pitchbook dataset. | `ActivityAnalyticsPage.html`, `ClientActivityAnalytics.html::activityMetricCards/activityPayload`. Label this destination `面談活動の集計`; preserve its existing periods, counts, dimensions and conditional monthly-management controls. |
| Entity Workspace distinguishes direct and related activity, and retains inactive/unresolved links. | `EntityWorkspacePage.html`, inspected `ClientEntityWorkspace.html` renderers. Preserve these distinctions; do not apply a global hide-deleted rule to relationship/history views. |
| Relationship Explorer is a bidirectional table/detail surface over explicit links, not an inferred network graph. | `RelationshipExplorerPage.html`, `ClientRelationshipExplorer.html::relationshipRenderForward/relationshipRenderReverse`. Improve the existing tables; do not invent graph data or relationships. |
| The relationship detail's `既存の面談保守で開く` handler currently only switches to the past-Meeting page. | `ClientRelationshipExplorer.html`, click handler on `relationship-forward-detail`. Use `面談一覧へ` for unchanged behavior. Selecting/opening a particular record would be a separate, explicitly listed client-navigation adjustment, not evidence of current behavior. |

Before A1, complete the inventory over all 14 priority files in `../handoffs/0028-instruction.md`, plus the GP Workspace, provider-settings, bootstrap and shared fragments reached through `Index.html`. Read server code only as necessary to trace existing calls. Record page, visible label, DOM/handler, request/response contract, conditional visibility, source location and proposed presentation.

Preserve all 11 existing destinations, including both GP Workspace and Entity Workspace. Their apparent overlap does not authorize deleting either. Read the current provider-settings implementation rather than importing unrelated administrator redesign plans. Record hard limits such as the existing 100-record maintenance display and Pitchbook status/eligibility cases; a mock must not imply new pagination, bulk actions or file replacement. Trace the existing blank/default status-filter behavior before drawing normal/deleted-list defaults; do not infer it from option labels alone.

## 4. Recommended design hypothesis and comparable alternatives

The recommendation is a B-based workspace, A-like Knowledge Search, and C-like readable tables. It is a starting hypothesis, not a finding from tests that have not happened.

| Direction | Deliberate difference | Main risk to evaluate |
|---|---|---|
| A: Minimal / Search-forward | Question/primary action dominate; quieter secondary controls; compact shell. | Existing registration, maintenance and exploration destinations could become harder to discover. |
| B: Workspace / Notion-like | Persistent page location, restrained sidebar, clear section/table/card roles. | Excessive nesting or generous whitespace could increase clicks and scrolling. |
| C: Investment Dashboard | Denser existing activity, record and exploration surfaces; professional workbench tone. | Visual competition and unimplemented portfolio/KPI expectations. |

Proposed navigation groups, using existing pages only:

- 探す: ナレッジ検索, 過去の面談記録, 過去の資料.
- 登録する: 面談記録を登録, 資料を登録.
- 振り返る: GPの情報, 面談先の情報, 面談活動の集計, 面談と資料の関連.
- 設定する: マスター管理, AI設定. Theme is a personal display control, not an administrator setting.

These are presentation groups, not new routes or data models. Prefer flat, visible destinations over nested menus. A common header exposes `表示テーマ` and the current page. Keep the current element IDs and effective event bindings where feasible. Do not alter authorization because a link is moved into a settings group.

Search proposal: place mode and question near the primary action; show the selected execution method and essential scope. Put less-used filters and permitted model/thinking options in clearly labelled disclosure areas, with active conditions still visible. Do not hide required comparison entities or Meeting-preparation targets. Never silently clear a collapsed filter.

Results proposal: readable answer, truthful provider/scope/evidence status, followed by clearly labelled source cards or an adjacent source panel when space permits. Show document title, date/type and available page number; retain stable identifiers in a secondary details area. An authoritative source link should be directly actionable without a tooltip-only dependency. At narrower widths, put sources below the answer rather than crushing both columns.

Record proposal: scan-friendly tables, clear `編集` and `原資料を開く`, separated `削除`, an obvious existing-status filter for `削除済み`, and an eligible-record `復元` action. Preserve Pending/Failed cases and current restoration restrictions. Do not introduce a combined-status backend filter or hide failed registrations merely to simplify a screenshot.

Do not create a fourth large design through the hybrid. Reuse already reviewed A/B/C components; at most one selected composite reference is needed.

## 5. Mock contract and artifact boundary

Only after design work is resumed, place mock images, inert HTML/CSS, synthetic fixtures and comparison evidence under `docs/design/0028/`. Do not place prototypes in `src/`, `dist/`, installer paths or runtime deployments. A design prototype must not call `google.script.run`, external AI, Drive, a real backend or analytics. No new CDN, tracking, font service or frontend framework is needed.

Use the same synthetic Meeting/Pitchbook records, record states, dates, question, answer, citations, filters, policy fixtures and error text in A/B/C. Use the same revised terminology in every option; otherwise the comparison confounds wording with layout. No confidential examples, real organization identifiers or private document URLs.

Reference viewport: 1440 x 900 CSS pixels at 100% zoom. Also inspect a 1366 x 768 laptop viewport. Do not select a design based only on a large monitor. Preserve current small-width accessibility; a new mobile product is not in scope.

Each option must include the following representative surfaces, which may be grouped into coherent boards:

1. Shell/navigation/landing state, with all existing destinations accessible.
2. Past Meeting and Pitchbook list/maintenance surface.
3. Edit, delete confirmation, deleted state and eligible restore.
4. Knowledge Search question/mode/filters/execution choice and permitted model/thinking controls.
5. Answer, citations/source links, no results, insufficient evidence, loading/long-running and safe error. Include the existing full-output preview/output controls in a representative state.

Use two explicitly labelled policy fixtures where necessary: the current accepted state with Gemini hidden, and a hypothetical already-authorized/qualified enabled-Gemini state solely to compare how existing choices are explained. Apply the same fixture to all three options. This does not qualify or enable Gemini.

A1 deliverables: current surface inventory, terminology inventory, three visual mocks, scenario comparison, implementation-risk classification, and one recommendation. A2 adds only the selected Dark mock and its critical states/theme specification. Static images and expert walkthroughs do not prove interaction or runtime correctness.

## 6. Terminology inventory — source-backed starting set

This is a preliminary inventory of observed strings, not a claim to have completed the full terminology pass. Extend it during A0 with exact source locations and effective runtime overrides. Do not mechanically translate every occurrence.

| Current visible text / context | Proposed normal-user text | Internal / administrator treatment | Reason |
|---|---|---|---|
| 面談記録 (registration navigation) | 面談記録を登録 | Keep `meeting` destination | Distinguish creating from finding. |
| Pitchbook (registration navigation) | 資料を登録 | Explain Pitchbook in page subtitle; preserve scope | Task is clearer than the object name alone. |
| 過去面談 | 過去の面談記録 | `meeting-past` unchanged | Consistent object name. |
| 過去資料 | 過去の資料 | `pitchbook-past` unchanged | Consistent and brief. |
| GP Workspace | GPの情報 | Keep GP-specific destination | Describe the content. |
| Entity Workspace | 面談先の情報 | Preserve all Counterparty Types | Do not imply every entity is a GP. |
| Activity Analytics | 面談活動の集計 | Preserve existing Meeting metadata, periods and dimensions | Do not imply Pitchbook analytics or investment returns. |
| Relationship Explorer | 面談と資料の関連 | Preserve canonical linked records | Do not imply inferred network relationships. |
| 既存の面談保守で開く (relationship detail) | 面談一覧へ | Existing handler switches page only | Do not promise that the selected record is already opened for editing. |
| GP (past-Meeting column) | 面談先 | Existing counterparty and Related GP fields unchanged | The displayed counterparty can be a non-GP entity. |
| AIプロバイダ設定 | AI設定 | Provider/qualification terms may remain inside | Short entry label; technical controls stay truthful. |
| 無効化 (record) | 削除 | `targetStatus: Inactive` | Visible removal, not physical deletion. |
| 再有効化 (eligible record) | 復元 | `targetStatus: Active` | Familiar reversible action. |
| Inactive (record badge/filter) | 削除済み | Explicit `value="Inactive"`; internal CSS/state unchanged | Translation must not change payload. |
| Active (record status) | 表示中, or omit redundant badge | Explicit `value="Active"` | Reduce internal vocabulary without concealing material state. |
| Pending / Failed (registration state) | 登録処理中 / 登録失敗, subject to state trace | Do not reuse these words for independent provider-index state | Avoid conflating registration and AI search readiness. |
| 無効化 / Inactive (Master) | 選択肢から外す / 選択肢から除外 | Active/Inactive may remain in admin details | Master removal is not deletion of historical records. Verify each action before relabelling. |
| Doc | 原資料を開く | Existing safe Docs URL | Explain destination. |
| 資料Metadataを修正 | 資料の分類情報を編集 | File replacement remains unavailable | Describe the actual editable fields. |
| Status / Version | 表示状態 / 更新版 (details) | Keep locking values unchanged | Separate useful information from implementation mechanics. |
| Date From / Date To | 開始日 / 終了日 | Existing date fields | Japanese task vocabulary. |
| Asset Class | アセットクラス | Master values unchanged | Established business vocabulary. |
| Equity / Debt | エクイティ / デット | Master values unchanged | Consistency, not a data-model change. |
| Team / Fund / Strategy / Meeting Type | 担当チーム / ファンド・戦略 / 面談の種類 | Existing keys/codes unchanged | Readability. |
| Counterparty Type / Counterparty Entity / Related GP | 面談先区分 / 面談先 / 関連GP | IDs and entity keys unchanged | Match existing registration language. |
| Source Type | 資料の種類 | `Meeting` / `Pitchbook` values unchanged | Explain filtering rather than storage type. |
| 実行ルート | 回答・出力方法 | Keep ChatGPT / Gemini / 全文出力 and existing visibility | Full output is not an AI provider. |
| 検索モード | 何をしたいですか (candidate label) | Five existing mode values unchanged | Explain task choice; compare against concise `目的`. |
| Thinking | 回答の検討設定 (candidate) | Preserve actual approved profile labels; no promise of guaranteed quality or speed | Explain a control without inventing semantics. |
| authoritative citation / 原資料Citation | 原資料の出典 / 確認できる出典 | Preserve strict authoritative resolver | Do not imply unsupported fine-grained evidence. |
| 該当なし | 条件に一致する記録がありません | Offer the existing condition-edit path | Give a next step. |
| 検索を開始中… / 検索結果を確認中… / 結果を再確認 | Keep or refine by actual phase | Do not change polling/retry semantics | Status already conveys distinct stages. |

`Index`, `File Search` and `Processing` are not globally replaced merely because they appeared in the original brief. Inventory actual user-facing occurrences first; indexing, upload, source status and provider state must remain distinct.

Delete confirmation must identify the record and explain: it leaves normal lists/search, source data is retained, eligible records can be restored, and this is not permanent erasure. It must not promise erasure of already-open Google Docs/Drive files or disappearance of preserved historical relationship links. When the user chose an all/deleted-status view, the resulting row may remain there with its new status.

## 7. Light / Dark / System specification

The user prefers Dark, but that preference is not imposed on colleagues. The agreed control is `システム設定に合わせる / ライト / ダーク`, available without administrator rights.

| Concern | Planned behavior |
|---|---|
| Default | `system`. Resolve using the browser-exposed `prefers-color-scheme: dark`; otherwise use Light. This reads a theme preference, not general computer settings. |
| Priority | Explicit Light/Dark choice overrides the reported system preference. Persist the choice `system/light/dark`, not just its current resolved color. |
| System changes | Follow media-query changes only while `system` is selected. Do not change an explicit override. |
| Persistence | A dedicated, namespaced browser-local key, proposed `ksp.ui.theme.v1`. No account, email, credential, record content, backend sheet or UserProperties entry. |
| Isolation | Do not use the 24-hour draft envelope; do not call `localStorage.clear()`; do not modify registration drafts or pending-query session storage. |
| Scope | Preference is local to the relevant browser profile/origin/storage context, not a guaranteed setting per Google account, device or deployment URL. Shared profiles share this preference. |
| Storage failure | Guard reads and writes. Keep a user choice in memory for the current page; on a later visit fall back to system. A storage exception must not stop registration or search. Do not claim that a failed save persisted. |
| Initial paint | Apply the resolved theme early and without a server round-trip; validate against visible Light-to-Dark flash in actual GAS embedding. No claim that local prototype behavior proves this. |
| Rendering | Use semantic CSS variables and a root theme attribute; align `color-scheme` for browser-native controls. Do not invert the entire page or recolor source documents/images. |
| In-flight work | Theme switching changes presentation only: no reload, DOM reconstruction, lost focus/input, repeated registration, query restart, extra API request or provider change. |
| Print/export | Existing Workspace print views remain white-background/dark-text. Full-output package, Copy/Docs/PDF content and fingerprints stay independent of screen theme. |
| Dependencies | Native HTML/CSS/JavaScript within the existing GAS HTML Service. No framework or component-library adoption solely for this feature. |

Token roles cover page background, surface layers, inputs, primary/secondary text, borders, action/link, hover/selected, focus, disabled, success/warning/error, overlay, citation and existing chart series/labels. Define Light tokens from the beginning; approve actual Dark values only after the Light direction is selected. Dark is not a palette inversion: use differentiated dark surfaces and independently verify text, input outlines, links and status colors. Preserve series meaning across themes.

Source basis: MDN theme/storage documentation [R5/R6], Google iframe restrictions [R7], and Carbon's role-based theme/layer model [R4]. These document mechanisms and design patterns; they do not qualify this company's browser environment. Embedded-frame preferences can depend on the embedding context; do not promise a direct, universal read of the OS setting in GAS before target-browser evidence exists.

## 8. Heuristic comparison and evidence rules

No external participants or formal usability study are assumed. Conduct an expert walkthrough, clearly labelled as such, using the same starting page, data, filter state and task in each option.

| Scenario | Inspect / count |
|---|---|
| 1. Find a past Meeting on first use | First plausible action, visible destination, fields needed, clicks to filtered list. |
| 2. Edit a past Meeting | How the user finds edit, recognizes the record, saves, and understands a conflict/error. |
| 3. Delete a record | Distinction from edit, confirmation meaning, post-action state and retained-data explanation. |
| 4. Restore a deleted record | Discoverability of deleted-state filter, eligibility and visible completion. |
| 5. Ask Knowledge Search | Question/mode, active filters, required targets, route choice and execution. |
| 6. Check an answer against its source | Evidence warning, citation grouping, readable document identity and direct source link. |
| 7. Choose ChatGPT / Gemini / full output | AI versus non-AI meaning, current availability, explicit choice and no hidden failover. |

Count clicks and meaningful decisions separately. State start/end points; exclude typing keystrokes, but record required field choices. Include necessary disclosure/menu/confirmation actions. Do not claim task durations or success rates from static mocks. Do not sacrifice clear choices or safety confirmations just to reduce clicks.

Proposed comparative rubric (a design decision, not a research-derived metric): first-action/terminology 20%, click/decision burden 15%, navigation/context 15%, source/citation readability 15%, density/readability 10%, loading/error/state clarity 10%, implementation simplicity 15%. Use scores only after visual review; record observations and uncertainty beside them. Do not prefill scores for the current hypothesis.

Hard gates override the score: functional parity; authoritative citation identity; truthful route/policy state; existing security boundary; feasible implementation without backend redesign; keyboard usability; essential contrast in both themes. An attractive but contract-breaking option is rejected rather than compensated with aesthetic points.

## 9. Future implementation slices and acceptance matrix

This is a plan, not an active dispatch. Stay with the same Work ID. Before BUILD, freeze selected references, the completed inventory, source baseline, exact allowed files and accepted outcomes. Choose Route C for nontrivial integrated UI implementation/runtime work; ChatGPT first completes the decision and documentation. The default future recommendation is Luna Max for a fully specified implementation. Use Sol High only for a genuinely unresolved cross-page issue or important independent review; reconfirm available model names at dispatch time. No model is launched now.

| Slice | Scope | Required evidence |
|---|---|---|
| 1. Tokens and shell | Common CSS, existing navigation, page location and responsive behavior | All 11 destinations remain reachable; existing page initialization and registration drafts survive navigation. |
| 2. Labels and maintenance | Current strings, explicit option values, table/edit/delete/restore presentation | Same IDs, expectedVersion/updatedAt, targetStatus, eligibility and server calls. Pending/Failed and preserved links still explained. |
| 3. Search and evidence | Question hierarchy, existing controls, result/source layout and truthful status | Same five modes, filters, 2–5-Entity comparison, approved model/thinking choices, availability, pending-token/recheck behavior and full-output parity. |
| 4. Complete themes | Selected Light/Dark tokens and browser-local selector across all existing pages | Theme matrix below; no partial unthemed admin/exploration/print surfaces. |

Do not enable automatic Dark while some shipped pages are unthemed. Slices describe reviewable code changes, not permission to create four deployments.

Minimum theme/interaction matrix, all initially NOT_RUN:

| Case | Acceptance |
|---|---|
| Fresh context, system Light / Dark | Matches reported preference; unavailable preference falls back safely. |
| Explicit Light on Dark OS; explicit Dark on Light OS | Manual choice wins, including after reload when persistence is available. |
| System changes during a session | System mode follows; manual modes do not. |
| Missing, invalid or blocked storage | Safe fallback; current-page choice works; no uncaught error or misleading saved state. |
| Registration draft and pending AI query | Values, focus and query token survive theme switch; no duplicate mutation/request. |
| Normal, hover, selected, focus and disabled states | Distinguishable by more than color alone where material; native form controls remain readable. |
| Text and essential controls | WCAG 2.2 AA contrast targets: normal text 4.5:1, large text 3:1, essential non-text component/state boundaries 3:1 where applicable. Measure real combinations; no blanket conformance claim. |
| Keyboard and zoom | Visible focus, logical order, accessible disclosure/confirmation, meaningful status announcements; inspect 200% zoom and laptop viewport. Wide data tables may have local scrolling. |
| Empty, insufficient evidence, pending and errors | Distinct, truthful messages and available next action; no fabricated progress percentage or provider rerouting. |
| Citations and existing analytics | Source identity/links and chart series/labels remain readable in both themes. |
| Workspace print and full output | Print stays light; canonical export content/fingerprint remains unchanged. |
| Actual GAS HTML Service | Verify theme initialization and persistence in the authorized browser/iframe context; local static preview is not runtime proof. |

After implementation, run targeted existing checks, `npm run check`, `git diff --check` and the established bundle-integrity/parity checks. Generate the bundle through the existing pipeline only. Do not hand-edit the bundle or revise installer architecture.

Runtime qualification occurs only with explicit scope/target permission and isolated data. Budget one planned qualification pass plus one narrow repair/retest cycle; reset strategy on repeated failure. This is not authority for a second deployment: any future deployment handoff must apply `docs/handoffs/AGENTS.md` and `docs/operations/apps-script-web-app-deployment.md`, including its one-mutation boundary and stop conditions. Static, mocked or CI tests are LOGIC_VALIDATION, not TARGET_RUNTIME_QUALIFICATION. Preserve Work 0027's accepted evidence; a cosmetic review does not authorize requalification or provider enablement.

## 10. Presentation-only limits and residuals

| Requested-looking element | Classification / decision |
|---|---|
| Rename labels; group existing destinations; restyle answer/source cards | PRESENTATION_ONLY, with preserved identifiers/contracts. |
| Theme selection/storage, filter disclosure, active-filter summaries, explicit option values | FRONTEND_BEHAVIOR within Work 0028; not CSS-only, but no backend change. |
| A custom-themed confirmation dialog | FRONTEND_BEHAVIOR. Current native `confirm()` is browser-owned and cannot be restyled by application CSS. Prefer retaining native confirmation unless a selected design justifies a small accessible client dialog. Preserve cancel/confirm and single-request behavior. |
| Per-account or cross-device theme synchronization | BACKEND_CHANGE / OUT_OF_SCOPE. Browser-local settings are the accepted scope. |
| Exact sentence-to-source highlights without returned mappings; embedded document previews requiring new retrieval | OUT_OF_SCOPE. Use existing authoritative citation fields and source links instead. |
| Global recent-feed, saved searches, favorites, bulk delete, new pagination or portfolio metrics absent from the source | OUT_OF_SCOPE. Do not draw these as implemented features. |
| Permanently deleting files, new restore lifecycle, enabling Gemini, automatic AI routing or new admin authorization | OUT_OF_SCOPE. Existing contracts remain fixed. |

FOLLOW_UP: complete the remaining page/conditional-copy inventory before A1; resolve any static-help-text versus actual-return-shape discrepancy by reading the existing facade/tests; check browser-local storage in the eventual target environment. These do not block this planning update. They must not be represented as already verified UI behavior.

## 11. Research record

Reviewed on 2026-09-05. These primary sources inform the design; they do not establish that one Knowledge Share variant is objectively optimal. Adopt principles, not their libraries or branded layouts.

| Ref | Source | Applied decision |
|---|---|---|
| R1 | Nielsen Norman Group, 10 Usability Heuristics — https://www.nngroup.com/articles/ten-usability-heuristics/ | User vocabulary, visible state, clear recovery and recognition rather than memory. |
| R2 | Nielsen Norman Group, Progressive Disclosure — https://www.nngroup.com/articles/progressive-disclosure/ | Disclose secondary controls without removing functionality or hiding active requirements. |
| R3 | IBM Carbon, UI shell / data table — https://carbondesignsystem.com/components/UI-shell-header/usage/ ; https://carbondesignsystem.com/components/data-table/usage/ | Consistent navigation, scan-friendly table hierarchy and separated actions. |
| R4 | IBM Carbon, Color — https://carbondesignsystem.com/elements/color/overview/ | Semantic tokens, role consistency and differentiated dark surfaces. |
| R5 | MDN, prefers-color-scheme — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme | Browser-exposed preference and explicit app-level override. |
| R6 | MDN, localStorage — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage | Origin/profile scope, persistence limitations and guarded failures. |
| R7 | Google, HTML Service restrictions — https://developers.google.com/apps-script/guides/html/restrictions | Actual iframe qualification; retain existing safe link targets/security. |
| R8 | W3C, WCAG 2.2 — https://www.w3.org/TR/WCAG22/ | Measurable contrast, keyboard/focus, zoom and status-message acceptance targets. |

## Planning receipt

```text
PLANNING_TASK: COMPLETE
SOURCE_PREFLIGHT: 14 PRIORITY FILES INSPECTED IN BOUNDED RANGES / NOT A FULL OR RENDERED AUDIT
THREE_LIGHT_MOCKS: NOT_STARTED
SELECTED_DARK_MOCK: NOT_STARTED
HEURISTIC_REVIEW: NOT_RUN
USER_DIRECTION_SELECTED: NO
IMPLEMENTATION_AUTHORIZED: NO
CODEX_DISPATCH_ISSUED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
LOGIC_VALIDATION: NOT_RUN / NO PRODUCTION CHANGE
TARGET_RUNTIME_QUALIFICATION: NOT_RUN
SIDE_EFFECT_STATE: GITHUB_DOCUMENTATION_ONLY
READY_FOR_BUILD: NO
```

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: READY
