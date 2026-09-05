# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
ACTIVE_DISPATCH_ID: 0028-CODEX-03
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1 / DESIGN ONLY

## Current ball and authorization

The user has requested the next Codex prompt using Product Design after Work 0029 closed and adopted the controller's design approach. ChatGPT has fixed the brief and issued a bounded design-only dispatch. READY means the instruction is ready to be started by the user in Codex; no Codex run has been observed or launched by ChatGPT.

Instruction: `docs/handoffs/0028-CODEX-03-product-design-light-mocks-instruction.md`.
Expected report: `docs/handoffs/0028-CODEX-03-product-design-light-mocks-report.md` (not created yet).

The former A0 no-mock/no-Codex permission boundary is now superseded only for source-grounded design-artifact generation and review. Production source changes, application-runtime access, bundle generation, deployment, credential changes and provider enablement remain prohibited. Approach approval is not selection of an unseen visual mock.

## Outcome and authoritative sources

Improve existing Knowledge Share design, navigation, information hierarchy, user language and state/result/source presentation without rebuilding its business system.

- Current execution contract: the CODEX-03 instruction above.
- Work brief: `docs/handoffs/0028-instruction.md`.
- Preservation policy: `docs/decisions/ui-surface-language-and-backend-preservation.md`.
- Earlier detailed inventory/research/validation plan: `docs/planning/work0028-ui-ux-and-theme-plan.md`.
- Accepted dependencies: `docs/handoffs/0027-dispatches.md`, `docs/handoffs/0029-dispatches.md`.

Reviewed main before dispatch publication: `a0a646d5b5d8715f1d1e7e8402357e160b2a25a7`. Design execution records its exact current source SHA. Preserve accepted Work 0027 behavior and Work 0029 shared-administrator-password semantics (PR #39 merge `872dbec83d17e6dfe1f33d8260006c2124d38a6c`; recorded version 75). No requalification or reopening is authorized.

## Strategy update and closed conclusions

A0 source-based planning is retained: `bec1af7001e6756ff7a36dfbeee0f078de1a0d44`, refinement `65bb2a5280a0bd232f25b0014e84da8c95af44c3`, reconciliation `fc6fa481a70f301d4afc94da7fe3bbd0781e7a57`. Its partial inventory is not a rendered audit. The current strategy advances to local/plugin A1 execution; MODE remains INVESTIGATION with the fixed B-led design hypothesis. No accepted backend/runtime conclusion is reopened.

- Preserve five-sheet/data/ID/lifecycle/facade/search/provider/installer/security contracts, plus accepted Work 0029 authorization/session/logout/password-change behavior.
- The controller's adopted starting preference is B workspace + A search clarity + C readable table density; produce fair A/B/C visuals, not preassigned scores.
- Prefer clearly visible boundaries between interactive controls and surrounding content, not faint/blended controls.
- Use actual-source terminology; records may say 削除 / 削除済み / 復元 while internal values/eligibility remain unchanged. Master exclusion and search-index states stay distinct.
- Preserve explicit ChatGPT/Gemini/full-output semantics, model/thinking policies, authoritative citations and current disabled/hidden Gemini state.
- Compare identical synthetic data, wording, capabilities, policy fixtures and representative scenarios.
- Theme choice is System/Light/Dark, explicit choice wins, browser-local only, without touching drafts/admin tokens or adding backend synchronization.
- CHART_SURFACE_THEME: LIGHT_FIXED. Keep the whole chart interior in its selected Light appearance in both themes; only the outer Dark shell/boundary adapts. No separate Dark chart palette or duplicate renderer. Do not impose white surfaces on all non-chart content.

The current dispatch and Work brief supersede outdated A0 permission/status/dispatch-number fields and separate-Dark-chart assumptions in the older detailed plan. Other preservation constraints and useful research remain in force.

## Dispatch history and ID collision tombstones

| Dispatch ID | Identity / disposition |
|---|---|
| N/A | Route A UI/UX planning and source-based reconciliation, documentation only. |
| 0028-CODEX-01 | Historically issued on the misidentified shared-admin line and superseded before execution. Never reuse. |
| 0028-CODEX-02 | Historically used for shared-admin implementation on PR #38; invalid Work identity for that outcome. PR #38 is closed/unmerged/SUPERSEDED; canonical product outcome completed under 0029-CODEX-01. Never reuse or resume this ID. |
| 0028-CODEX-03 | Current canonical UI/UX design-only Product Design Light mock dispatch. READY / BALL CODEX; execution not yet observed. |

The historical tombstones are verified against PR #38 and its register at `c058dc7c5498555dc303bbb60d43725755353874`; they are not imports of the conflicting branch and do not reopen it. The earlier main statement that no UI/UX dispatch had run was accurate for this outcome, but must not be used to recycle identifiers already present in history.

## Gates and return

CODEX-03 produces three comparable Light directions, actual visual artifacts, inventories, seven-scenario expert review, implementation risks and one recommendation. Artifacts remain isolated under `docs/design/0028/`. It returns to ChatGPT with STATUS RETURNED on its design branch/report/draft PR. No main merge is authorized to Codex.

Gate 1: after controller review, the user selects a visible Light direction or bounded hybrid.
Gate 2: create and review only the selected Dark design, with LIGHT_FIXED charts.
Production implementation: selected Light/Dark approval plus explicit implementation authorization are required. Issue a fresh, never-used dispatch after checking history. Deployment needs separate scoped permission.

Do not continue automatically in the background or infer selection/implementation permission from the adopted design approach.

## Evidence and completion latch

```text
PLANNING_UPDATE: COMPLETE
DESIGN_ONLY_DISPATCH_ISSUED: YES / 0028-CODEX-03
CODEX_RUN_OBSERVED: NO
SOURCE_PREFLIGHT: PARTIAL SOURCE-BASED / NOT A FULL RENDERED AUDIT
FULL_SURFACE_INVENTORY: PENDING
THREE_LIGHT_MOCKS: NOT_STARTED
HEURISTIC_REVIEW: NOT_RUN
USER_DIRECTION_SELECTED: NO
SELECTED_DARK_MOCK: NOT_STARTED
CHART_SURFACE_THEME: LIGHT_FIXED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
TARGET_RUNTIME_QUALIFICATION: NOT_RUN / OUT_OF_SCOPE
SIDE_EFFECT_STATE: GITHUB_DOCUMENTATION_ONLY
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
WORK_0029_REOPENED: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-03
ACTIVE_DISPATCH_ID: 0028-CODEX-03
BALL: CODEX
STATUS: READY
