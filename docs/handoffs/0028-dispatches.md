# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: N/A
ACTIVE_DISPATCH_ID: NONE
BALL: CHATGPT
STATUS: READY
MODE: INVESTIGATION
PHASE: A / DESIGN ONLY

## Current ball and authorization

ChatGPT owns the design/research/planning work. No Codex dispatch exists. `READY` means the plan is ready for the next design-only activity, not that an implementation or runtime is ready.

The 2026-09-05 user request authorized refining the implementation plan and updating GitHub, including Light/Dark/System behavior. It did not authorize starting mocks, editing production source, running Codex, calling the runtime or deploying. The planning task is complete; there is no ongoing background run.

## Outcome and sources of truth

Improve existing Knowledge Share design, navigation, information hierarchy, user-facing language and state/result/source presentation without major backend changes.

- Decision: `docs/decisions/ui-surface-language-and-backend-preservation.md`
- Design instruction: `docs/handoffs/0028-instruction.md`
- Detailed plan, research and initial terminology inventory: `docs/planning/work0028-ui-ux-and-theme-plan.md`
- Accepted dependency: `docs/handoffs/0027-dispatches.md`

Planning source baseline: `e90d6f31205249b6de7720896708cdef3e0ba212`.

Work 0027 is ACCEPTED, with the recorded qualified-disabled Gemini state. Do not reopen it or display Gemini as currently enabled merely for a design comparison.

## Closed conclusions

- Preserve five-sheet/data/ID/lifecycle/facade/search/provider/installer/security contracts.
- Internal names may differ from user-facing labels; record deletion remains reversible Inactive behavior with accurate explanation.
- Existing ChatGPT/Gemini/full-output semantics and model/thinking policies remain truthful and explicit; no new auto-routing or failover.
- Compare A/B/C with identical capabilities, synthetic content, proposed terminology and provider-policy fixtures.
- Light alternatives first; user-selected direction next; selected Dark design afterward.
- Theme control is System/Light/Dark, explicit selection wins, browser-local storage only, no account synchronization or backend persistence.
- ChatGPT performs the specialist research and recommendation. User chooses a visible direction, not the technical design machinery.

## Next design activity and gates

When the user resumes design work, complete the source/terminology inventory and produce three Light mocks:

A. Minimal / Search-forward.
B. Workspace / Notion-like.
C. Investment Dashboard.

All must cover shell/landing, Meeting/Pitchbook maintenance, edit/delete/deleted/restore, Knowledge Search input/choices, answer/citations/source and relevant states. Evaluate the same seven scenarios from the instruction.

Gate 1: user selects a direction or bounded hybrid.

Then create that design's Dark mock with unchanged structure and the agreed theme controls.

Gate 2: user approves selected Light/Dark design and explicitly authorizes implementation. Only then reset to BUILD, check current history, and allocate the first actual dispatch. Light selection alone is not an automatic implementation trigger. Deployment needs explicit scoped authorization.

## Dispatch history

No Codex dispatch has been issued for Work 0028. Do not reserve or create an instruction/report file for `0028-CODEX-01` before the gate.

Route A planning update: Dispatch ID N/A; ChatGPT-only; GitHub Markdown changes only.

## Evidence and completion latch

```text
PLANNING_UPDATE: COMPLETE
SOURCE_PREFLIGHT: PARTIAL / NOT A RENDERED AUDIT
FULL_SURFACE_INVENTORY: PENDING
THREE_LIGHT_MOCKS: NOT_STARTED
HEURISTIC_REVIEW: NOT_RUN
USER_DIRECTION_SELECTED: NO
SELECTED_DARK_MOCK: NOT_STARTED
THEME_PLAN: DEFINED
IMPLEMENTATION_AUTHORIZED: NO
CODEX_DISPATCH_ISSUED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
LOGIC_VALIDATION: NOT_RUN / DOCS-ONLY CHANGE
TARGET_RUNTIME_QUALIFICATION: NOT_RUN
SIDE_EFFECT_STATE: GITHUB_DOCUMENTATION_ONLY
READY_FOR_BUILD: NO
WORK_0028_COMPLETE: NO
```

Stop after the planning update. The remaining visual/design gates are planned work, not blockers to publication of the plan and not completed evidence.

WORK_ID: 0028
DISPATCH_ID: N/A
ACTIVE_DISPATCH_ID: NONE
BALL: CHATGPT
STATUS: READY
