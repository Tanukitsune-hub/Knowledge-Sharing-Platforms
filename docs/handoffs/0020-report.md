# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-13`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
WORK_READY: `NO`
BLOCKER: `YES`

## Current classification

```text
PITCHBOOK_EXISTING_QUERY_OUTCOME: TIMEOUT
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred/disabled; uncalled
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: BLOCKED — no authoritative Pitchbook citation yet
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence; not rerun
FINAL_INTEGRITY: PARTIAL
READY: NO
BLOCKER: YES
```

## ChatGPT review of CODEX-12

GitHub source of truth confirms:

- branch `agent/0020-ai-provider-core`;
- CODEX-12 final commit `6373ec1bb70f341eb6878ede51b17eb0cfc4286a`;
- PR `#26` Draft / Open / unmerged / mergeable;
- CODEX-12 delta is one commit touching the CODEX-12 report/tracking docs, Gemini query constants/environment/client transport/provider core, and direct transport tests;
- focused `43/43 PASS` and `npm run check 294/294 PASS` are repository/Codex evidence;
- GitHub Actions runs `0` and commit status checks `0`, so no GitHub CI PASS claim is allowed.

Target-runtime evidence:

- original synchronous Pitchbook query terminated at Apps Script maximum execution after `360.804s` with no normal Pitchbook `AI_QUERY` Audit outcome;
- CODEX-12 then implemented `background=true` plus status polling;
- exact source readback `78/78`, immutable Apps Script version `51`, same private Web App updated in place, deployment inventory `9` unchanged;
- exactly one post-repair Pitchbook query returned safe application `AI_QUERY_TIMEOUT` after `134.96s`;
- Audit recorded one Pitchbook `AI_QUERY` Failure with `Error_Code=AI_QUERY_TIMEOUT` and zero citations;
- no provider terminal `failed/cancelled/requires_action/incomplete` result was established;
- no lifecycle mutation followed; settings remained safe and OpenAI/FULL_OUTPUT were untouched.

Detailed report:
`docs/handoffs/0020-CODEX-12-pitchbook-query-outcome-and-final-qualification-report.md`

## New decisive finding

CODEX-12 changed the provider request to a background Interaction, but the application still waits inside the same Apps Script execution for up to `24 * 5s` and then generates its own timeout. The background Interaction identity is not preserved as a resumable cross-request application state when that local deadline is reached.

Google's current Interactions contract defines background execution specifically so a client can retain the Interaction ID and poll/reconnect later. The documented status enum also includes terminal `incomplete`; current CODEX-12 code does not classify `incomplete` as terminal.

Therefore the observed `AI_QUERY_TIMEOUT` is not evidence that the Indexed Pitchbook or Gemini File Search failed. It is evidence that the application background lifecycle remains incomplete.

## Strategy Reset — CODEX-13

One active hypothesis:

> Make Gemini background search resumable across short Web App calls rather than holding one Apps Script call open. Complete the documented terminal-status state machine, preserve provider identity server-side behind a safe opaque token, and write only one terminal Audit outcome.

Active instruction:
`docs/handoffs/0020-CODEX-13-resumable-gemini-query-lifecycle-and-final-qualification-instruction.md`

## Findings

### BLOCKER

1. No grounded Pitchbook query with authoritative citation has passed.
2. Current background query lifecycle converts a still-nonterminal Interaction at the local ~120-second poll deadline into `AI_QUERY_TIMEOUT` and loses resumability.
3. Documented terminal Interaction status `incomplete` is not currently terminalized.
4. Exact metadata-filter and lifecycle/final-integrity gates remain dependent on Pitchbook query PASS.

### FOLLOW_UP

- GitHub-hosted CI/check evidence remains absent.
- Work branch is behind newer `main`; integrate current main after the runtime blocker closes and before final Work merge.

### OPTIONAL

None added. Do not expand Work 0020 beyond the provider-core completion boundary.

## Accepted evidence preserved

- CODEX-03 through CODEX-11 accepted schema/FULL_OUTPUT/provider/upload/reconciliation/Meeting-query evidence remains closed.
- Synthetic Pitchbook indexing is accepted and must not be repeated merely to diagnose query lifecycle.

## Target final matrix

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-13`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
WORK_READY: `NO`
BLOCKER: `YES`
