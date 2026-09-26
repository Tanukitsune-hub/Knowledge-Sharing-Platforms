# Work 0073 Dispatch Register

WORK_ID: 0073
ACTIVE_DISPATCH: 0073-CODEX-01
BALL: CODEX
STATUS: READY

## Active Dispatch

`0073-CODEX-01`

Instruction:

`docs/handoffs/0073-CODEX-01-provider-credential-onboarding-instruction.md`

Primary plan:

`docs/planning/work0073-provider-credential-onboarding.md`

Canonical decision:

`docs/decisions/provider-credential-management.md`

## Dispatch contract

CODEX-01 implements the accepted Work0073 scope through four-source admin/provider alignment.

```text
credential operator boundary
-> candidate-test-promote
-> provider-neutral setup UX
-> advanced model/sync progressive disclosure
-> four-source admin/provider alignment
```

CODEX-01 is repository BUILD with deterministic/browser validation.

Live provider calls, real credentials, Apps Script deployment mutation, company data, Secret Manager, Azure OpenAI and company rollout are not authorized.

Target runtime/provider qualification remains a separate follow-up after ChatGPT review and acceptance of CODEX-01.

## Return path

Codex must create:

`docs/handoffs/0073-CODEX-01-provider-credential-onboarding-report.md`

Codex updates this register on its branch to:

```text
WORK_ID: 0073
ACTIVE_DISPATCH: 0073-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

or `STATUS: BLOCKED` if Strategy Reset is triggered.

ChatGPT owns final diff/evidence review, merge decision and Work acceptance.

## Out-of-scope follow-up

- Google Secret Manager
- company rollout
- Azure OpenAI / Work0030
- Work0072 live-provider qualification
