# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-13`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION -> BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-13-resumable-gemini-query-lifecycle-and-final-qualification-instruction.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini is the personal-DEV live provider. OpenAI remains deliberately disabled/uncalled. FULL_OUTPUT remains accepted and must not be rerun.

## Accepted evidence — closed absent material contradiction

- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS;
- no automatic provider failover; OpenAI disabled/uncalled;
- one isolated Gemini Store;
- direct Blob upload and sourceType bounded-sync contracts accepted;
- authenticated private Web App administrator SYNC route proven;
- Gemini Document reconciliation PASS for both CODEX-10 affected Meetings without uncertain-row upload/delete;
- one grounded Meeting query PASS with authoritative Audit and three citations;
- one synthetic TXT Pitchbook remains Gemini Indexed with provider document identity/content hash;
- CODEX-12 deterministic validation PASS: focused `43/43`, repository `294/294`, temporal/public/diff PASS, public facade `30`;
- CODEX-12 exact source readback `78/78`, immutable Apps Script version `51`, same private Web App updated in place;
- original synchronous Pitchbook query hit Apps Script max execution at `360.804s`;
- post-repair Pitchbook query returned application `AI_QUERY_TIMEOUT` after `134.96s`, zero citations, with no provider terminal failure observed;
- no lifecycle mutation, OpenAI call, FULL_OUTPUT rerun, broad sync, new Store/deployment/Library followed.

Detailed CODEX-12 report:
`docs/handoffs/0020-CODEX-12-pitchbook-query-outcome-and-final-qualification-report.md`

## Strategy Reset for CODEX-13

Current CODEX-12 background query code still polls within one Apps Script execution:

```text
POST interaction background=true
-> keep same Apps Script call open
-> GET every 5 seconds
-> 24 polls (~120 seconds)
-> local AI_QUERY_TIMEOUT
```

This does not use the provider-supported background lifecycle as a resumable cross-request flow. It also fails to terminalize the documented Gemini Interaction status `incomplete`.

One active hypothesis:

> The remaining Pitchbook blocker is an incomplete application background-Interaction state machine: the application still waits synchronously inside one Apps Script call, discards resumability at its local polling deadline, and does not recognize every documented terminal provider status. A secure cross-request START/POLL lifecycle should remove the Apps Script timeout dependency without changing File Search content or provider routing.

## Fastest safe decisive action

Reproduce the two lifecycle gaps deterministically. If they reproduce, implement one minimal coherent cross-request START/POLL flow through the existing `searchKnowledge` facade where practical. Do not lengthen a single Apps Script invocation toward the platform maximum.

## Remaining completion gates

After a grounded Pitchbook query with authoritative citation passes:

1. exact metadata filter;
2. update -> reindex without duplicate;
3. Inactive removal/exclusion;
4. Reactivate restoration;
5. exact delete/rebuild of derived provider document;
6. restore intended synthetic lifecycle;
7. final Backend/provider/Audit/settings/trigger/deployment integrity.

Before every provider-mutating lifecycle SYNC:

```text
AI_SYNC_BATCH_SIZE = numeric 1
-> authoritative numeric 1 readback
-> execute one bounded mutation
-> restore numeric 10 afterward
```

## Boundaries

- no OpenAI live call;
- no FULL_OUTPUT rerun;
- no broad sync or confidential data;
- no new Store/Web App/Library/public debug endpoint;
- no raw provider Interaction ID as a client authorization token;
- no repeated new Pitchbook query;
- no current-main merge/rebase during the bounded runtime repair;
- GitHub-hosted CI is not assumed; report whether it actually ran.

Current `main` has advanced independently to include Work 0024 return-identity governance. Integrate latest main only after the Work 0020 runtime blocker closes and before final PR merge.

## Target final classification

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

Completion Latch applies only after ChatGPT final review, current-main integration, and merge.
