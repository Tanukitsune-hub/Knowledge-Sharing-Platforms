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

`WORK_ID` is an immutable reference, not a priority number or a guarantee of numeric execution order. Never renumber an issued Work merely because dependencies or priorities change. Track current priority and dependency order in `docs/planning/work-registry.md`.

Default to one active Codex Dispatch per Work. Parallel Dispatches are exceptional; if outcomes are independently separable, prefer separate Work IDs.

## 2. Human-readable filenames

Use:

- `docs/handoffs/<WORK_ID>-CODEX-<NN>-<short-slug>-instruction.md`
- `docs/handoffs/<WORK_ID>-CODEX-<NN>-<short-slug>-report.md`
- `docs/handoffs/<WORK_ID>-dispatches.md` for the Work-level register

The slug explains the purpose; the Dispatch ID supplies the stable join key.

## 3. Ball and status

Every active instruction, report, dispatch register, PR status block, and material repository-status message must show:

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

## 5. Codex final-return identity contract

A Codex final chat response is always a material repository-status message. It MUST begin with the exact four-line identity block below before any prose, bullets, validation matrix, or summary:

```text
WORK_ID: <same Work ID>
DISPATCH_ID: <same Dispatch ID>
BALL: CHATGPT
STATUS: RETURNED
```

If Codex stops specifically for a native user action, use `BALL: USER` and `STATUS: ACTION_REQUIRED` instead. If an external dependency leaves nobody able to act, use the status/ball required by the handoff and dispatch register.

The same four identity lines MUST be repeated at the end of the final chat response. Do not replace these lines with a table, prose sentence, abbreviated `ID`, branch name, commit SHA, PR number, or validation fields. Commit/PR/test details are additional evidence, not identity substitutes.

The committed report file MUST carry the same Work ID and Dispatch ID. A response that omits either identity block is a reporting-contract failure even when the implementation itself is correct.

## 6. Work dispatch register

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

## 7. User-facing display

At the start and end of material repository status or completion messages, show the identity block. Localized explanatory text may follow it, but the machine-readable `WORK_ID`, `DISPATCH_ID`, `BALL`, and `STATUS` lines remain mandatory.

Use `DISPATCH_ID: N/A` for ChatGPT-only work. This display is a concise mirror, not a replacement for the GitHub register.

## 8. Guardrails

- Never change the Work ID merely because a new Dispatch is created.
- Never renumber an issued Work to match a revised roadmap order.
- Never reuse or renumber a Dispatch ID.
- Never let instruction and report use different Dispatch IDs.
- Do not backfill or rename historical files solely for this protocol.
- Do not let ball tracking create extra hypotheses, reports, or commits.
- Target-runtime smoke or a user-assisted step remains inside the same Dispatch when it is part of the same execution contract.
