# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-12`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION -> QUALIFICATION`, with one evidence-gated repair only

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-12-pitchbook-query-outcome-and-final-qualification-instruction.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini is the personal-DEV live provider. OpenAI remains deliberately disabled/uncalled. File Search scope is Meeting + Pitchbook/source. FULL_OUTPUT remains accepted from CODEX-03 and must not be rerun.

## Accepted evidence — closed absent material contradiction

- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical package parity PASS;
- no automatic provider failover; OpenAI disabled/uncalled;
- one isolated Gemini Store;
- direct Blob upload transport and sourceType bounded sync contracts accepted;
- authenticated private Web App administrator SYNC route proven;
- CODEX-11 reconciliation repair deterministic PASS: focused `49/49`, repository `290/290`;
- both uncertain CODEX-10 Meetings reconciled to Indexed through exact existing Gemini Document list/get without uncertain-row upload/delete;
- one Meeting query produced successful authoritative Audit with three citations;
- one synthetic TXT Pitchbook indexed successfully with provider document identity/content hash;
- CODEX-11 restored `AI_SYNC_BATCH_SIZE` to numeric `10`; `AI_SYNC_ENABLED=false`; OpenAI remained disabled/uncalled.

## Current blocker

The single CODEX-11 Pitchbook query was submitted once. During the bounded ~1-minute observation, the browser remained loading and no Pitchbook `AI_QUERY` Audit outcome existed. No retry occurred. Therefore the Pitchbook query gate and all dependent metadata/lifecycle/final-integrity gates remain incomplete.

The browser loading state alone is not accepted defect evidence: the CODEX-11 Meeting query also remained visually loading even though authoritative Audit later proved server-side success.

Current Google documentation states that standard Interactions requests can be interrupted by connection timeouts for long-running tasks and provides background execution (`background: true` plus Interaction polling). Apps Script currently limits normal script executions to 6 minutes. These are relevant possibilities, not yet proven as the CODEX-11 cause.

## CODEX-12 one active hypothesis

> The CODEX-11 Pitchbook query was not a File Search correctness failure. It outlived the initial browser observation and its definitive outcome is now available in existing Audit/Apps Script execution history. If that execution instead terminated while waiting on the synchronous Interactions call, background Interactions is the provider-supported minimal repair.

## Fastest safe decisive action

Read-only first. Do not submit another query or change source/deployment/provider state until the existing CODEX-11 Pitchbook query is classified.

Required first evidence:

1. late Pitchbook `AI_QUERY` Audit success/failure, if any;
2. matching Apps Script Web App execution status/duration/safe failure class;
3. no second Pitchbook query;
4. existing Indexed Pitchbook and reconciled Meetings unchanged.

If late success contains an authoritative Pitchbook citation, accept the query gate without retry and proceed directly to remaining lifecycle/final integrity.

If the existing execution proves synchronous connection/runtime termination, CODEX-12 may reproduce exactly that failure deterministically and make only the one Gemini background-Interaction repair described in its handoff, followed by one final bounded Pitchbook query.

Any different failure class requires STOP and Strategy Reset; do not patch a second hypothesis.

## Remaining acceptance gates

After Pitchbook query PASS:

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
-> execute one bounded SYNC
-> restore numeric 10 afterward
```

## Boundaries

- no OpenAI live call;
- no FULL_OUTPUT rerun;
- no broad sync or confidential data;
- no new Store/Web App/Library/public debug endpoint;
- no unrelated current-main integration during this bounded diagnosis;
- GitHub-hosted CI is not assumed; report whether it actually ran.

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
