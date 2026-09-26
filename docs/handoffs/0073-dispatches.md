# Work 0073 Dispatch Register

WORK_ID: 0073
ACTIVE_DISPATCH: NONE
BALL: CHATGPT
STATUS: READY

## Current state

Planning and durable decisions are complete.

Primary plan:

`docs/planning/work0073-provider-credential-onboarding.md`

Canonical decision:

`docs/decisions/provider-credential-management.md`

## Next action

Implementation is not started.

When authorized, create the first implementation instruction as:

`0073-CODEX-01`

Use Route C and keep the same Work ID through implementation, validation, repair and PR stabilization.

Do not reserve or reuse a Dispatch ID before an actual Codex instruction is created.

## Scope latch

Current implementation scope ends after:

```text
credential operator boundary
-> candidate-test-promote
-> provider-neutral setup UX
-> advanced model/sync progressive disclosure
-> four-source admin/provider alignment
```

Secret Manager, company rollout, Azure OpenAI and Work0072 live-provider qualification are outside the current Work0073 implementation scope.
