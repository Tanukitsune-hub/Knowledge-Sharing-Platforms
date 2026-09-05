# Work 0028 — UI/UX surface refinement and terminology simplification

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: READY
MODE: INVESTIGATION
PHASE: A / DESIGN ONLY

`READY` is design-task readiness, not runtime or implementation readiness. The previous `MODE: DESIGN` notation is normalized to INVESTIGATION; the design-only boundary is unchanged. BUILD requires a later explicit gate and Strategy Reset.

## Primary outcome and current authority

Knowledge Shareの既存機能を大きく作り直さず、画面デザイン、操作性、情報配置、visual hierarchy、navigation、状態表示、confirmation copy、button/label terminologyを改善する。

2026-09-05の追加指示に基づき、ChatGPTがデザイン・導線を調査し、推奨案と実装計画を主導する。ユーザーに専門的な設計判断や部品選択を求めない。今回は計画文書の更新までで、モック制作・production source変更・Codex実装dispatch・Web App deploymentはまだ開始しない。

Detailed plan and research record:

`docs/planning/work0028-ui-ux-and-theme-plan.md`

Governing decision:

`docs/decisions/ui-surface-language-and-backend-preservation.md`

Current-ball source of truth:

`docs/handoffs/0028-dispatches.md`

## Hard constraints

Work 0027までのaccepted baselineを保護する。今回の作業でWork 0027の証跡を再評価・再実行しない。実装へ進んだ後も、原則として次を維持する。

- five-sheet Backend; stable IDs and metadata contracts;
- Meeting/Pitchbook registration and edit semantics;
- Active / Inactive / Reactivate lifecycle, eligibility and optimistic locking;
- server facade/function contracts;
- Knowledge Search modes, filters, citation/source identity and source-format boundaries;
- OpenAI/Gemini provider adapters and configured/qualified/enabled state;
- explicit ChatGPT / Gemini / 全文出力 routes and no cross-provider failover;
- administrator model/thinking policy and server validation;
- installer/bundle/distribution architecture;
- authorization/security boundaries.

UI案の都合で新しいsheet、database、API、provider、index、relation model、migration、background workflow、投資KPI等を追加しない。backend redesignが必要な案は、システムではなく案側を調整する。

Light/Dark/Systemは明示的に合意したfrontend表示機能であり、アカウント同期用のbackend保存を追加する許可ではない。

## Required source review before mocks

Read current `main`, root/nearest AGENTS files, the work registry, governing decision, product vision and Work 0027 dispatch register. Pin the source commit used for the design.

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

Also inspect reachable GP Workspace, AI provider-settings, bootstrap and shared fragments, because the shell contains these destinations. Read server code only to understand existing calls and actual returned data. The planning preflight is partial, not a completed audit.

First produce a Current Surface Inventory: page/action/label, actual handler and DOM identifier, data contract, state/conditional visibility, source location, observed friction and proposed presentation. Do not design an imagined Knowledge Share. Source inspection alone does not prove deployed rendering.

## Phase A1 — three comparable Light visual directions

When design execution resumes, produce exactly three distinct visual directions with the same current capabilities.

| Direction | Intent |
|---|---|
| A. Minimal / Search-forward | Clear primary action, lightweight question entry, reduced visual noise, clearly disclosed secondary controls; enterprise-search clarity without copying a product. |
| B. Workspace / Notion-like | Calm workspace, visible location/navigation, purposeful hierarchy, suitable tables/cards/sections; no invented recent-feed or backend feature. |
| C. Investment Dashboard | Professional investment-workbench density and clear access to existing Meeting, Pitchbook, GP/Entity, Search, Analytics and Relationship functions; no new investment data or KPIs. |

Use identical synthetic records, question, answer, citation/source set, filters, states and proposed wording. Compare at the same desktop viewport, including a laptop-sized check. Do not improve one option by removing controls or changing available providers.

All options must show:

1. Application shell/navigation/landing state.
2. Past Meeting/Pitchbook list and maintenance.
3. Edit, delete confirmation, deleted state and eligible restore.
4. Knowledge Search question, mode, filters, existing route and permitted model/thinking controls, execution.
5. Answer, citations/source links, loading/long-running, empty, insufficient evidence and safe error states. Include current full-output preview/output controls.

Use visual mocks close to desktop-browser screens, not prose wireframes alone. Group representative screens into boards as useful; do not mass-produce every page. Isolate future design artifacts under `docs/design/0028/`, with no runtime/backend connections. Production `src/**`, `dist/**`, installer and deployment remain untouched.

The accepted current state hides Gemini from normal users. A mock of existing enabled-Gemini capability must be labelled as a separate policy fixture and applied equally to all options. Do not enable Gemini, alter policy, or imply availability from a mock.

## Surface language

Internal implementation names do not determine user-facing labels. Create an actual-current-display → recommended-user-display → administrator/internal-display → reason/source inventory. The plan contains a source-backed starting set, not a completed exhaustive inventory.

For records, `無効化` may become `削除`, `再有効化` may become `復元`, and `Inactive` may become `削除済み`. Preserve literal status values, CSS/data attributes and request contracts. In particular, add explicit unchanged option values before translating options whose text currently supplies their value.

Use context-sensitive wording for Masters and provider-index states; do not treat every `Inactive` as deletion of a knowledge record. Preserve Pending/Failed cases and restore eligibility.

Delete confirmation explains that normal lists/search stop showing the record, source data is retained and eligible records can be restored. It must not imply permanent erasure, revoked Drive access or deletion of historical relationship links.

ChatGPT/Gemini/全文出力 must remain truthful choices, not one silently auto-routed AI action. Full output is non-AI output, with its actual source/package limits preserved. Do not invent fine-grained citation mappings or previews absent from the response contract.

## Light first, selected Dark second

Compare A/B/C in Light first. User selection is Gate 1. Then produce the selected design's Dark visual mock with unchanged layout, wording and functions. A hybrid may only combine already reviewed A/B/C elements, not introduce a fourth navigation or feature model.

Plan tokens from the beginning: backgrounds/surfaces, text, inputs, borders, action/link, hover/selected/focus/disabled, success/warning/error, citations and existing chart colors.

Agreed theme behavior:

- `システム設定に合わせる / ライト / ダーク`;
- initial system preference via `prefers-color-scheme`, with Light fallback;
- explicit choice wins; system changes apply only in system mode;
- a dedicated browser-local preference, isolated from the 24-hour draft envelope;
- guarded storage failures, current-page fallback, no application failure;
- no UserProperties, account synchronization, backend persistence or identity collection;
- no reload, lost draft, query restart, extra API request or provider change on theme switch;
- existing print remains light; canonical Copy/Docs/PDF content is not themed.

Native browser confirmation is not application-CSS-themeable. Any selected custom confirmation requires a small accessible client implementation with the same existing mutation semantics, not a backend change. Actual GAS iframe/storage behavior is qualified only later with permission.

## Scenario-based heuristic review

No external user-test recruitment is required. Walk all three mocks through the same seven tasks:

1. 初回利用者が過去Meetingを探す。
2. 過去Meetingを編集する。
3. recordを削除して通常画面から消す。
4. 削除済みrecordを復元する。
5. Knowledge Searchで質問する。
6. AI回答からcitation/source documentを確認する。
7. ChatGPT / Gemini / 全文出力の違いを理解して選ぶ。

Evaluate first-action clarity; clicks and decisions separately; terminology; visual density; navigation/context; citation readability; loading/error/status; daily desktop usability; GAS HTML implementation complexity; and backend-change risk. State assumptions, starting state and uncertainty. Do not report usability success rates or timings from static images.

Compare using the rubric in the detailed plan, with contract/security/evidence/accessibility gates overriding aesthetics. Recommend one direction or a bounded hybrid; do not merely return three unexplained choices.

## Deliverables and explicit implementation gate

Phase A deliverables:

1. Current Surface Inventory and source-based terminology inventory.
2. Three comparable Light visual mocks.
3. Comparison table and observations for all seven scenarios.
4. Implementation complexity and risk classification.
5. One recommendation, not self-approval.
6. List of any element that is not presentation-only.
7. After Gate 1, selected Dark mock, theme specification and state/accessibility review.

Do not allocate a Codex Dispatch ID or edit production source merely because one option appears best. Gate 2 requires approval of the selected Light/Dark design and explicit implementation authorization. Deployment remains separately scoped. Before a future BUILD dispatch, freeze selected references, terminology, allowed files, unchanged contracts, minimum checks, evidence hierarchy and retry budget.

## Phase A completion record

All unperformed checks remain NOT_STARTED or NOT_RUN; the planning update does not close Phase A.

```text
CURRENT_SURFACE_INVENTORY: PENDING
THREE_DISTINCT_LIGHT_MOCKS: NOT_STARTED
SAME_FUNCTIONAL_SCOPE_AND_FIXTURES: NOT_RUN
TERMINOLOGY_INVENTORY: PRELIMINARY
SEVEN_SCENARIO_REVIEW: NOT_RUN
IMPLEMENTATION_RISK_COMPARISON: PLANNED
USER_DIRECTION_SELECTED: NO
SELECTED_DARK_MOCK: NOT_STARTED
THEME_BEHAVIOR_SPECIFIED: YES
IMPLEMENTATION_AUTHORIZED: NO
CODEX_DISPATCH_ISSUED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_BUILD: NO
```

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: READY
