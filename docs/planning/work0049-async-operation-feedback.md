# Work 0049 — async operation feedback standardization plan

WORK_ID: 0049
STATUS: ACCEPTED
MODE: BUILD
BASELINE: Work0048 version30
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

全mutation / long-running user actionで、操作直後からcompletionまで一貫したprocessing feedbackを提供する。

## Design direction

Three-layer feedback:
1. action button: spinner + action-specific `...中…` + disabled
2. status area: existing `info busy` spinner
3. affected region: `aria-busy` + conflicting controls disable

通常操作でfull-screen overlayは使用しない。

## Current accepted building blocks

Already present:
- `.status.busy::before` spinner
- `@keyframes ksp-status-spin`
- `prefers-reduced-motion` handling
- several local busy booleans
- Theme settings / Meeting maintenance / deleted restore等のpartial examples

Work0049はこれを置換せず標準化・拡張する。

## Fastest Safe Decisive Action

Work0048 accepted後:
1. client-side async mutation inventoryをtest fixtureとして固定。
2. shared button busy helper + CSSを追加。
3. Master Option Addを最初のreference implementationにする。
4. mutation surfacesへ順次適用。
5. existing busy implementationsを必要最小限だけshared standardへ寄せる。
6. duplicate request / finally recovery tests。
7. browser visual / accessibility qualification。
8. same owner-only runtimeへbounded deploy。
9. ChatGPT final review。

## Routing

Route C予定。

Recommended model:
- GPT-5.6 Sol High

Reason:
複数client moduleを横断し、既存のoperation-specific locking / retry semanticsを壊さず共通UXを適用する必要がある。

## Safety

```text
BUSINESS_LOGIC_CHANGE: 0 expected
BACKEND_API_CHANGE: 0 expected
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_POLICY_CHANGE: 0
PERMISSION_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```


## Accepted Outcome

Work0049 completed in PR #71 / version31.
Completion Latch applied. No further Work0049 action is required unless a material regression is found.
