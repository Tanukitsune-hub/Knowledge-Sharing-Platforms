# Work 0050 CODEX-02 — target-runtime qualification

WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-02
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION

## Context

PR #72 implementation has passed ChatGPT repository-level final review and was merged.

```text
MERGE: b518b98c9c1e7acedd2b08128662abc463291213
BASELINE_RUNTIME: Work0049 version31
TARGET_SOURCE: latest main
EXPECTED_FINAL_SERVED_VERSION: 32
```

Work0050 is NOT yet ACCEPTED. Completion Latch remains NOT_APPLIED until target-runtime evidence passes.

## Primary Outcome

Merged Work0050 Theme Color Toolをsame owner-only Web Appへ限定deployし、実target runtimeで新しいColor ToolとWork0045/0049 regressionを確認する。

## Read first

- `docs/handoffs/0050-theme-color-tool-requirements.md`
- `docs/handoffs/0050-CODEX-01-theme-color-tool-report.md`
- `docs/handoffs/0049-completion-report.md`
- `docs/operations/apps-script-web-app-deployment.md`

## Deployment boundary

Before mutation, re-establish the accepted identity chain:
Git ref -> saved source -> Apps Script project -> immutable version -> WEB_APP deployment -> owner-only URL/account.

Then:
- source sync exact latest main: at most 1
- create exactly one immutable version: version32 expected
- update existing verified WEB_APP deployment: at most 1
- new deployment: 0
- URL / execute-as / access unchanged
- owner-only access preserved
- no provider calls
- no business-data mutation

If target deployment identity is ambiguous, stop BLOCKED before mutation.

## Required runtime evidence

Theme Settings / Color Tool:
- Theme tab opens normally
- Color Tool visible
- current selected token loads exact current draft color
- 2D saturation/value interaction updates swatch / HEX / RGB
- hue slider updates HEX / RGB
- valid HEX direct input updates picker/swatch
- invalid HEX shows validation and Apply disabled
- target token change loads exact token color
- `この色を適用` changes only draft/live preview
- Apply before Save causes server mutation RPC 0
- direct 16-row edit and Color Tool remain synchronized
- Discard returns draft + Color Tool + live preview to persisted state
- Reset behavior remains available; do not execute if it would alter current persisted state unnecessarily
- copy success or safe fallback PASS
- EyeDropper: supported -> visible/usable; unsupported -> hidden with no error
- keyboard path PASS
- 16 Theme fields preserved
- 1440 and 390 no overflow / material layout issue

Regression:
- Theme Save button semantics from Work0045 preserved by deterministic source/tests; do not alter shared persisted theme solely for qualification
- Work0049 busy feedback on Theme Save/Reset preserved
- 7 normal pages nonblank
- console material error/warn 0
- Work0048 manual-search behavior unchanged
- provider calls 0

## Data / state safety

Preferred live qualification uses preview + discard and therefore persistence mutation 0.

Do NOT change the saved shared theme merely to prove the Color Tool.

Final:
- exact initial persisted theme state unchanged
- business data drift 0
- Script Properties theme value drift 0
- provider state drift 0

## Tests

Before deployment:
- latest main exact
- relevant focused tests PASS
- `npm run check` PASS
- `npm run check:bundle` PASS
- `git diff --check` PASS

After runtime:
- record screenshots / runtime measurements as appropriate
- record exact deployed version and deployment identity evidence without exposing private IDs/URLs

## If runtime defect is found

Do not silently broaden scope.

If source repair is needed:
- create branch `codex/0050-runtime-repair`
- make only Work0050-scoped repair
- focused/full/bundle tests
- Draft PR
- do not create a second deployment in the same bounded run
- return BALL CHATGPT / STATUS RETURNED with blocker/repair evidence

## Delivery if PASS

Create/update:
- `docs/handoffs/0050-CODEX-02-theme-color-tool-runtime-report.md`
- `docs/handoffs/0050-dispatches.md`

A docs-only Draft PR for the report is acceptable; do not mark Work ACCEPTED and do not apply Completion Latch yourself.

Return:
```text
WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
TARGET_RUNTIME_QUALIFICATION: PASS|FAIL
FINAL_SERVED_VERSION: <version>
BLOCKER: NONE|...
READY_FOR_CHATGPT_FINAL_REVIEW: YES|NO
```
