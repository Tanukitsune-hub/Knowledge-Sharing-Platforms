# Work 0028 — Product Design Light mock execution

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1 / DESIGN ONLY
ROUTE: C / bounded local design-artifact execution

## 1. Outcome and authorization

Use the installed Product Design plugin in Codex to produce a source-grounded, comparable set of three Light visual directions for the existing Knowledge Share. Return visible artifacts, a terminology inventory, scenario review and one recommendation so the user can choose a design without doing specialist design work.

The user has approved the controller's approach and requested this Codex prompt after Work 0029 closed. This authorizes design-artifact generation and review, not production implementation, application-runtime access or deployment. ChatGPT retains ownership of product scope, constraints, recommendation acceptance and final review. Codex executes the remaining local/plugin work within this fixed brief.

This dispatch expressly supersedes the old A0 statements that no mocks or Codex dispatch were authorized. It does not waive the visual-selection or production-implementation gate. Approval of an approach is not selection of a not-yet-seen mock.

## 2. Exact baseline, identity and preflight

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`.
Reviewed main before this documentation dispatch: `a0a646d5b5d8715f1d1e7e8402357e160b2a25a7`.
Accepted Work 0029 merge: `872dbec83d17e6dfe1f33d8260006c2124d38a6c`, PR #39; recorded private runtime version 75. These are repository evidence, not permission to access the runtime.

Start a fresh Codex task from current authoritative main containing this instruction. Fetch main, inspect working-tree state, record the exact design source SHA, and preserve unrelated changes. Use a separate design branch, suggested `codex/0028-product-design-light-mocks`. Do not resume or merge the old `agent/0028-shared-admin-password` branch/PR #38. If main has material new product changes beyond the accepted boundary, report the narrow delta before designing from an unaccepted baseline.

Dispatch numbers 01 and 02 were already used on the superseded, misidentified shared-admin line. They remain historical tombstones and must not be reused. The canonical UI/UX Work remains 0028; the completed shared-admin Work remains 0029. This dispatch is 0028-CODEX-03, not a new Work and not a reopening of 0029.

Read first:

- root and nearest applicable AGENTS.md / AGENTS.override.md;
- `docs/planning/work-registry.md`;
- `docs/handoffs/0028-dispatches.md` and this instruction;
- `docs/handoffs/0028-instruction.md`;
- `docs/decisions/ui-surface-language-and-backend-preservation.md`;
- `docs/planning/work0028-ui-ux-and-theme-plan.md`;
- `docs/product/vision.md`;
- `docs/handoffs/0027-dispatches.md` and `docs/handoffs/0029-dispatches.md`.

The older detailed plan remains useful for its inventory, research and future validation matrix. Its A0 permission/status fields, first-dispatch numbering, pre-0029 baseline and any assumption of a separate Dark chart palette are superseded by this dispatch and the current Work brief. Do not use an old freeze statement to refuse this expressly authorized design task.

Inspect actual current UI source before generation, not an imagined product. Cover the 14 priority files listed in the Work brief, effective includes/overrides, GP Workspace, AI Provider Settings and bootstrap fragments. Read server functions/tests only where needed to understand an existing UI contract. Record source locations and distinguish code-based observations from rendered evidence. Do not repeat accepted provider qualification or root-cause investigations.

## 3. Product Design workflow

Explicitly load and use the installed Product Design plugin. Read its local index, user-context, get-context and relevant ideation guidance; use Browser guidance when a permitted local visual inspection needs it. Record the actual skills/tools used. Do not claim plugin use from a name in the prompt alone.

The brief is complete: existing GAS desktop Web App; private-assets investment professionals; improve navigation, visual hierarchy, terminology, states and evidence readability without changing business functionality. Do not ask the user to choose a framework, design system, palette mechanics or backend architecture. Briefly restate the target and proceed with the supplied defaults.

Use actual available reference screenshots where safe, inspected and relevant. Only synthetic/redacted source examples may enter image-generation tools. No confidential records, credentials, administrator passwords/tokens, private runtime URLs or organization-specific runtime IDs. No live Web App visit or admin login is authorized: its bootstrap may access real data. A local static reconstruction, if needed to inspect the current surface, must be isolated, non-networked and labelled as a reconstruction rather than a live screenshot. It must not execute `google.script.run` or other application calls.

Use the plugin's available image-generation capability for visual ideation, rather than substituting prose wireframes. Do not begin the selected-design image-to-code/build/share/deploy workflow in this dispatch. Do not create a React/Next/shadcn project or new product runtime for a GAS redesign. Existing local capabilities may be used without changing the repository's dependency/build configuration. Do not provision API keys, billing, external hosting or new services for the mock task.

If the plugin or required image-generation capability is genuinely inaccessible after one targeted availability check, deliver the usable source inventory/brief and report the precise capability blocker. Do not claim images were generated, switch silently to another workflow, or start application implementation as a workaround.

## 4. Fixed product and design decisions

Preserve the accepted Work 0027 plus Work 0029 baseline:

- five-sheet Backend, stable IDs, metadata and source identity;
- Meeting/Pitchbook registration/edit semantics, optimistic locking and eligibility;
- Active / Inactive / Reactivate internals, retained historical relationships;
- existing server/facade contracts, five search modes, filters and 2–5-Entity comparison;
- ChatGPT / Gemini / full-output routes, model/thinking policy, authoritative citations, no cross-provider failover;
- provider adapters and current configured/qualified/enabled state, including Gemini disabled/hidden;
- installer/bundle architecture and security/authorization boundaries;
- Work 0029 shared-password administrator unlock, opaque sessionStorage token, server-side validation, explicit logout and password-change semantics. Do not add an email gate, timed expiry or theme-based authorization. Do not rotate the temporary DEV password in this Work.

No new sheets, database, API, index, provider, relation model, migration, background workflow, investment KPI, inferred network graph, saved searches, favorites, pagination, bulk deletion or file-replacement feature. If a preferred design needs one, adjust the design rather than the system.

The adopted starting direction is a B-based calm workspace, A-like search/input/result clarity, and C-like moderately dense readable tables. Still produce fair A/B/C alternatives before user selection; do not preassign scores or label a mock selected merely because B is the starting preference.

Navigation may group existing destinations under 探す / 登録する / 振り返る / 設定する. Keep all current destinations accessible, including GP Workspace and Entity Workspace. Preserve page initialization and actual navigation behavior. Activity Analytics is 面談活動の集計, not investment performance or a new Pitchbook dataset.

The user prefers visible boundaries: distinguish interactive controls from non-interactive content using clear borders, grouping and focus/selected states. Avoid faint-border, blended surfaces. A restrained enterprise appearance must not make inputs/buttons hard to find; plugin defaults preferring borderless styling do not override this explicit preference.

Use Japanese task-oriented labels. For eligible knowledge records, 無効化 → 削除, 再有効化 → 復元, Inactive → 削除済み. Explain retained/restorable data and preserved historical links without promising physical erasure or revoked Drive access. Master exclusion and provider-index status require their own wording. Preserve internal option values, DOM/handler identities and transmitted status values; do not globally translate business enums.

Search must retain mode, filters, approved model/thinking choices and explicit execution method. Show effective conditions even when secondary controls are collapsed. Do not hide required comparison/preparation targets. Full output remains non-AI output with its actual source/package/preview limits, not universal document extraction. Do not fabricate sentence-level citations, snippets, document highlights, progress percentages, retry/cancel semantics or automatic provider changes.

## 5. A/B/C visual scope and fair comparison

Produce exactly three design directions:

A. Minimal / Search-forward — clear primary task, reduced noise, accessible secondary controls.
B. Workspace / Notion-like — calm workspace, visible location/navigation, purposeful sections/tables.
C. Investment Dashboard — professional daily workbench, moderately higher density, existing data only.

Use one shared synthetic fixture set for records, dates, question, answer, sources/citations, terminology, filters and statuses. No actual investment information is needed. Baseline provider fixture has Gemini hidden; a separately labelled hypothetical already-qualified enabled-Gemini fixture may explain the existing three-way choice, identically across A/B/C. It must not imply current enablement or qualify any provider.

Reference viewport: 1440 x 900 CSS-pixel desktop composition; include a 1366 x 768 laptop-fit assessment. Keep readable Japanese labels, realistic density and discoverable actions. Do not silently crop controls, shrink a whole workflow into an unreadable contact sheet or add an oversized decorative hero.

Each direction must cover the same representative surfaces:

1. Shell/navigation/landing state.
2. Past Meeting and Pitchbook maintenance/list views.
3. Editing, delete confirmation, deleted-state view and eligible restore.
4. Knowledge Search question/mode/filters/execution choice and permitted model/thinking controls.
5. Answer, evidence warning, citations and original-source links; loading/long-running/recheck, no results, insufficient evidence and safe error; representative full-output preview/output controls.

Prefer a small set of readable core screens per direction, with supplementary state/detail panels where needed, rather than every page or 15 full independent designs. The number of image assets may exceed three to cover these states, but the number of competing design directions remains three. Do not substitute an icon or caption for an actual required state. Keep A/B/C the same functional scope.

Create an asset manifest mapping each descriptive direction to exact generated files and visible output order. Never infer image selection from planned generation order. Show actual generated images in the Codex conversation as well as saving accessible artifacts; repository paths alone are not a visual presentation. If a tool cannot persist an output, state that limitation instead of inventing a file.

## 6. Themes and fixed Light chart canvas

This run produces the Light alternatives. Dark visuals follow only after the user selects the Light direction; do not generate three additional Dark alternatives or implement theme code now.

Future theme behavior is fixed: システム設定に合わせる / ライト / ダーク; initial system preference via prefers-color-scheme; explicit selection wins; browser-local preference only, isolated from registration drafts and admin session tokens; storage failure must not break the app; no account synchronization, backend persistence, reload, input loss or query restart.

CHART_SURFACE_THEME: LIGHT_FIXED

In the later Dark design, preserve the selected Light version's complete chart interior: background, axes, gridlines, series, labels, in-chart legend, and any existing in-chart tooltip/empty-state treatment. A white background alone with globally inherited Dark text would not satisfy this. Plan explicit local Light color roles for the chart so inherited Dark styles do not break contrast. Do not add a chart feature that does not currently exist.

Only the outer application/card shell, spacing and boundary adapt to Dark. Assess the size/brightness of the Light chart island and its boundary once in the selected Dark mock; keep it as the default unless a material readability issue is observed. This is one shared chart appearance, not two palettes and not two copies of chart logic. No separate Dark chart renderer/library is authorized. Other tables, forms, AI answer text and general UI remain theme-aware; fixed-Light charts do not automatically make all content panels white. Existing print and canonical Copy/Docs/PDF behavior remain unchanged; do not invent an analytics export function.

## 7. Deliverables and heuristic review

Store non-runtime design artifacts under `docs/design/0028/` only. Use one README/asset manifest, a source/functional inventory, a terminology inventory, one comparison/recommendation document, and the necessary visual assets; combine documents where clearer. Do not proliferate planning files or create a runnable replacement app.

Terminology columns: source location / current actual display / proposed user display / unchanged internal value or administrator display / reason.

Walk every direction through the same seven scenarios:

1. First-time user finds a past Meeting.
2. User edits that Meeting.
3. User deletes a record from the normal view.
4. User finds and restores an eligible deleted record.
5. User asks Knowledge Search with intended scope.
6. User follows answer evidence to an authoritative source document.
7. User understands and chooses ChatGPT / Gemini / full output subject to actual policy.

Compare first action, clicks and decisions separately, terminology, density, navigation/current location, citation/source readability, loading/error/status, daily desktop usability, implementation difficulty in current GAS HTML and backend-change risk. Declare start/end states and assumptions; do not invent user-test success rates or measured task times. For static mocks, click counts are predicted walkthrough counts, not measured interaction evidence. Apply the detailed plan's rubric only after viewing the artifacts; hard contract/security/accessibility gates override aesthetics.

Recommend one option or a bounded B-led hybrid using already shown elements. Explain practical tradeoffs in Japanese. Identify PRESENTATION_ONLY, FRONTEND_BEHAVIOR and OUT_OF_SCOPE/BACKEND_REDESIGN elements. A recommendation never self-approves the design.

## 8. Bounds, Git delivery and return

One initial comparable set plus at most one targeted correction round for clipping, missing required controls, unreadable labels or contract mismatch. No unbounded visual perfection loop. If a core assumption is false or the same failure repeats, preserve usable artifacts, separate BLOCKER/FOLLOW_UP/OPTIONAL and return the cheapest next decision. Missing live-browser evidence is not an application defect and does not authorize deployment.

Allowed edits: `docs/design/0028/**`, this dispatch's report, and `docs/handoffs/0028-dispatches.md` state/history on the design branch. Do not edit the instruction, accepted Work 0027/0029 files, AGENTS, production `src/**`, `dist/**`, application tests, installer/build configuration, lockfiles or CI. Any isolated source-display reconstruction is a design-only artifact, not copied production business logic or new backend behavior.

Commit the bounded artifacts/report to the design branch and open a design-only draft PR when normal repository access permits. Do not merge. Include Work ID, Dispatch ID, BALL and STATUS at the start/end of the report and PR. After completion, set the design-branch dispatch register to BALL: CHATGPT / STATUS: RETURNED; ChatGPT reviews before the user-selection gate. During execution use BALL: CODEX / STATUS: IN_PROGRESS. One active run only. A returned run's follow-up receives a fresh Dispatch ID from ChatGPT; do not allocate it yourself.

Validate one final diff for allowed paths and no production changes, run `git diff --check`, inspect the actual images for required coverage/readability, and record artifact/source identities. Use only checks that prove this design deliverable. Do not run application qualification, regenerate the bundle or claim the prior 0029 test counts were run by this dispatch.

Report path: `docs/handoffs/0028-CODEX-03-product-design-light-mocks-report.md`.

Required report fields, set truthfully with evidence:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
DESIGN_SOURCE_SHA: <observed commit>
PRODUCT_DESIGN_PLUGIN_USED: YES | NO
PLUGIN_SKILLS_AND_TOOLS: <actually used>
CURRENT_SURFACE_INVENTORY: PASS | PARTIAL | BLOCKED
THREE_DISTINCT_LIGHT_DIRECTIONS: PASS | PARTIAL | BLOCKED
VISUAL_ARTIFACTS_PRESENTED_AND_SAVED: PASS | PARTIAL | BLOCKED
SAME_FUNCTIONAL_SCOPE_AND_FIXTURES: PASS | FAIL | NOT_RUN
TERMINOLOGY_INVENTORY: PASS | PARTIAL
SEVEN_SCENARIO_REVIEW: PASS | PARTIAL | NOT_RUN
RECOMMENDATION: <option/hybrid with reasons>
CHART_SURFACE_THEME: LIGHT_FIXED
USER_DIRECTION_SELECTED: NO
DARK_MOCK: NOT_STARTED / AWAITING_LIGHT_SELECTION
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
TARGET_RUNTIME_QUALIFICATION: NOT_RUN / OUT_OF_SCOPE
READY_FOR_PRODUCTION_BUILD: NO
WORK_0029_REOPENED: NO
BLOCKER: <NONE or precise delivery blocker>
BRANCH: <actual>
DRAFT_PR: <actual or NOT_CREATED>
FINAL_COMMIT: <actual>
REPORT_PATH: docs/handoffs/0028-CODEX-03-product-design-light-mocks-report.md
```

SOURCE_CODE_CHANGED refers to production source, not isolated design assets; report both separately. Stop after returning the comparable Light design package. Do not advance to Dark design or production implementation in this run. User selection, selected Dark review and explicit implementation authorization are later gates; Work 0028 is not complete merely because this dispatch returned.

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
BALL: CODEX
STATUS: READY
