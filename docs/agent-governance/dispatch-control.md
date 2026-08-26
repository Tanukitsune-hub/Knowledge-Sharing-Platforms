# Dispatch Identity and Ball Control

Use this protocol to preserve the outcome-level Work ID while making every ChatGPT-to-Codex handoff and the current owner immediately visible.

## 1. Two levels of identity

- `WORK_ID` is the stable zero-padded 4-digit outcome/theme ID. Keep it through implementation, validation, repair, review, and PR stabilization while the primary outcome is unchanged.
- `DISPATCH_ID` identifies one distinct Codex execution request inside that Work.
- Format: `<WORK_ID>-CODEX-<NN>`, where `NN` starts at `01`, is zero-padded to at least two digits, and is never reused within the Work.
- A new committed instruction, changed execution contract/ref, or new Codex rerun after return gets a new Dispatch ID.
- Questions, user-assisted actions, or continuation inside the same still-active Codex run retain the same Dispatch ID.
- Route A / ChatGPT-only work uses `DISPATCH_ID: N/A`.
- Existing historical handoffs do not need renaming. When adopting this protocol mid-Work, begin a prospective sequence and state that earlier dispatches were not backfilled.

Default to one active Codex Dispatch per Work. Parallel Dispatches are exceptional; if outcomes are independently separable, prefer separate Work IDs.

## 2. Human-readable filenames

Use:

- `docs/handoffs/<WORK_ID>-CODEX-<NN>-<short-slug>-instruction.md`
- `docs/handoffs/<WORK_ID>-CODEX-<NN>-<short-slug>-report.md`
- `docs/handoffs/<WORK_ID>-dispatches.md` for the Work-level register

The slug explains the purpose; the Dispatch ID supplies the stable join key.

## 3. Ball and status

Every active instruction, report, dispatch register, PR status block, and material repository-status message shows:

```text
WORK_ID: 0014
DISPATCH_ID: 0014-CODEX-04
BALL: CODEX
STATUS: READY
```

Allowed `BALL` values:

- `CHATGPT` — planning, GitHub preparation, review, or next-dispatch decision
- `CODEX` — execution is ready or in progress
- `USER` — native action, evidence, authorization, or decision is required
- `NONE` — accepted, closed, or superseded

Allowed `STATUS` values:

- `PREPARING`
- `READY`
- `IN_PROGRESS`
- `ACTION_REQUIRED`
- `RETURNED`
- `REVIEW`
- `ACCEPTED`
- `BLOCKED`
- `SUPERSEDED`

## 4. Required transitions

1. ChatGPT prepares: `BALL: CHATGPT`, `STATUS: PREPARING`.
2. Committed instruction is handed off: `BALL: CODEX`, `STATUS: READY`.
3. Codex may show `BALL: CODEX`, `STATUS: IN_PROGRESS` in chat.
4. A native user action uses `BALL: USER`, `STATUS: ACTION_REQUIRED`; the same Dispatch ID remains.
5. Codex report uses `BALL: CHATGPT`, `STATUS: RETURNED`.
6. ChatGPT review uses `BALL: CHATGPT`, `STATUS: REVIEW`.
7. Accepted Dispatch uses `BALL: NONE`, `STATUS: ACCEPTED`.
8. A new Codex request receives the next Dispatch ID rather than silently extending the old one.

A report that returns a blocker hands the ball to the party able to act. Do not leave `BALL: CODEX` after Codex has stopped.

## 5. Work dispatch register

Create `docs/handoffs/<WORK_ID>-dispatches.md` when Route B/C is first used. It is the canonical current-ball record.

Recommended header and table:

```text
WORK_ID: 0014
ACTIVE_DISPATCH_ID: 0014-CODEX-04
BALL: CODEX
STATUS: READY
```

| Dispatch ID | Purpose | Mode | Ball | Status | Instruction | Report | Supersedes |
|---|---|---|---|---|---|---|---|

Update only at durable transitions: instruction committed, user action required, Codex returned, ChatGPT accepted, blocked, or superseded. Do not create commits for routine progress ticks.

The PR body mirrors `ACTIVE_DISPATCH_ID`, `BALL`, and `STATUS`; the register is authoritative if a mirror becomes stale.

## 6. Guardrails

- Never change the Work ID merely because a new Dispatch is created.
- Never reuse or renumber a Dispatch ID.
- Never let instruction and report use different Dispatch IDs.
- Do not backfill or rename historical files solely for this protocol.
- Do not let ball tracking create extra hypotheses, reports, or commits.
- Target-runtime smoke or a user-assisted step remains inside the same Dispatch when it is part of the same execution contract.
