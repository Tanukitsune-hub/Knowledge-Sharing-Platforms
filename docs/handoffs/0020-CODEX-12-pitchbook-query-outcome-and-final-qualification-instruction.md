# Work 0020 — CODEX-12 Pitchbook query outcome and final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-12`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION -> QUALIFICATION`, with one evidence-gated repair only
ROUTE: `C`

## Primary outcome

Classify the single CODEX-11 Pitchbook query without submitting a duplicate query first. If the existing query ultimately succeeded, accept that evidence and finish the remaining Work 0020 Gemini lifecycle/final-integrity gates. If it conclusively failed because the synchronous Gemini Interactions request exceeded the connection/runtime boundary, reproduce that exact failure deterministically and apply only the smallest provider-supported query transport repair before one final bounded Pitchbook query.

## Accepted evidence — keep closed

Do not reopen absent material contradiction:

- CODEX-03 FULL_OUTPUT runtime/canonical parity, schema 6/five Backend sheets, disabled-provider no-failover;
- CODEX-04 one isolated Gemini Store and OpenAI disabled/uncalled path;
- CODEX-05 through CODEX-10 accepted transport, sourceType, direct Blob, Web App administrator execution, and safe settings evidence;
- CODEX-11 deterministic reconciliation repair: focused `49/49 PASS`, repository `290/290 PASS`;
- CODEX-11 Gemini document reconciliation: both uncertain Meetings restored to Indexed through exact existing Document list/get, with no uncertain-row upload/delete;
- CODEX-11 Meeting query: successful authoritative `AI_QUERY` Audit with three citation references;
- CODEX-11 synthetic TXT Pitchbook indexing: one source Indexed with provider document identity/content hash;
- `AI_SYNC_BATCH_SIZE` restored to numeric `10`, `AI_SYNC_ENABLED=false`, OpenAI disabled/uncalled, FULL_OUTPUT not rerun.

## Current blocker

Exactly one Pitchbook query was submitted in CODEX-11. After about one minute the browser remained loading and there was no new Pitchbook `AI_QUERY` Audit row. No retry occurred. The application source writes success/failure Audit only after entering the normal query path; a hard execution/connection termination can therefore leave no Audit outcome.

Current Google evidence:

- the File Search query path uses `POST /v1beta/interactions`;
- Google documents standard Interactions HTTP requests as susceptible to connection timeouts around 60 seconds for long-running tasks;
- the Interactions API provides `background: true` plus `GET /interactions/{id}` polling for long-running work;
- Apps Script currently has a 6-minute per-execution runtime limit.

These facts do not yet prove that CODEX-11 hit either timeout.

## One active hypothesis

> The CODEX-11 Pitchbook query was not a File Search correctness failure. It remained inside the synchronous Gemini Interactions request beyond the approximately one-minute browser observation, and its eventual execution outcome can now be classified from existing Audit/execution evidence. If the server execution terminated because the synchronous request exceeded a connection/runtime boundary, background Interactions is the provider-supported minimal repair.

Do not open another provider/query hypothesis in this dispatch.

## Fastest safe decisive action — read only first

Before changing source, deployment, provider data, Settings, or submitting another query:

1. identify the exact CODEX-11 Pitchbook query time/window from existing report/browser evidence;
2. re-read the Restricted Audit for any later `AI_QUERY` row with `Source_Type_Filter=Pitchbook` from that one invocation;
3. inspect Apps Script execution history for the same Web App server execution and record only safe status, duration, completion/failure class, and safe error category; do not copy private request/response bodies or IDs into GitHub/chat;
4. confirm the indexed synthetic Pitchbook and the two reconciled Meetings remain unchanged;
5. confirm no second Pitchbook query occurred.

### Outcome A — late success

If the existing query has a successful Pitchbook `AI_QUERY` Audit outcome with at least one authoritative Pitchbook citation:

- classify the Pitchbook query gate PASS;
- do not submit another Pitchbook query;
- proceed directly to the remaining exact metadata-filter and lifecycle/final-integrity gates below.

### Outcome B — explicit application/provider failure

If a safe failure Audit exists, or execution history shows a normal caught application/provider error:

- record its existing safe error code/classification;
- STOP this dispatch unless it exactly matches the synchronous timeout hypothesis below;
- do not patch a different failure class.

### Outcome C — synchronous timeout/connection termination

Only if the existing execution evidence shows the query was terminated while waiting on the synchronous Gemini Interactions request, or timed out before success/failure Audit could be written:

1. reproduce this exact gap deterministically before production source change;
2. make one minimal Gemini-only query transport repair:
   - preserve the current synchronous parsing/citation model after a completed Interaction is obtained;
   - create the Gemini Interaction using provider-supported background execution;
   - capture only the Interaction identity/state needed internally;
   - poll `GET /interactions/{id}` with a bounded interval and bounded deadline comfortably inside Apps Script's execution limit;
   - treat `completed` as the existing normal parse/citation path;
   - treat provider `failed` as the existing safe provider/query error path;
   - treat poll deadline as a safe retryable query timeout/error, not an infinite loop;
   - preserve existing metadata filter, File Search Store, model, redaction, Audit, OpenAI behavior, no-failover, schema, and public surface;
   - use any currently required Interactions API revision/header exactly as the official contract requires.
3. add focused tests for immediate completion, background in-progress -> completed, failed, and bounded timeout; no raw provider text in public/Audit output;
4. run focused tests, `npm run check`, temporal/public-surface validation, and `git diff --check`.

If deterministic reproduction does not match the timeout hypothesis, do not patch.

## Delivery budget if a source repair is required

Only after deterministic PASS:

- one exact source delivery/readback;
- at most one new immutable Apps Script version;
- one in-place update of the same existing private Web App;
- no new Store, Web App, Library, permission, public/debug endpoint, provider credential, or recurring trigger.

If Outcome A requires no source repair, do not create a new Apps Script version/deployment.

## One final Pitchbook query budget

A fresh Pitchbook query is allowed only under Outcome C after the repair has deterministic PASS and the prior CODEX-11 execution is conclusively finished/not running.

- submit exactly one Pitchbook query with the same synthetic source scope;
- require authoritative success evidence and at least one Pitchbook citation;
- no query retry in this dispatch;
- if it fails or remains unresolved at the bounded deadline, STOP.

## Remaining lifecycle/final-integrity gates after Pitchbook query PASS

Use only the existing synthetic/non-confidential sources.

1. exact Gemini metadata filter proof for the intended source scope;
2. update -> reindex without duplicate active provider document;
3. Inactive -> provider removal/exclusion;
4. Reactivate -> current authoritative source restored/indexed;
5. exact delete/rebuild of derived provider document while authoritative Drive source remains intact;
6. restore the synthetic source lifecycle to the intended Active state;
7. verify exactly five Backend sheets/schema 6;
8. verify Gemini provider state/store identity/duplicates and bounded Audit integrity;
9. verify `AI_SYNC_BATCH_SIZE=10` numeric, `AI_SYNC_ENABLED=false`, `GEMINI_ENABLED=true`, `OPENAI_ENABLED=false`;
10. verify OpenAI zero live calls, FULL_OUTPUT not rerun, triggers/permissions/deployment inventory unchanged except one authorized Web App version update only if Outcome C repair required.

Before every provider-mutating SYNC in lifecycle qualification:

```text
set AI_SYNC_BATCH_SIZE = numeric 1
-> immediately read back numeric 1
-> only then execute one bounded SYNC
```

Restore numeric `10` after the bounded mutation.

## Stop rules

- no second query before classifying the existing CODEX-11 query;
- one active hypothesis only;
- no source patch unless existing runtime evidence and deterministic reproduction match the synchronous timeout hypothesis;
- one minimal query-transport repair maximum;
- one final Pitchbook query maximum if repair is required;
- stop on any different provider/application failure, ambiguous existing execution state, or new runtime blocker;
- no OpenAI live call, FULL_OUTPUT rerun, broad sync, new Store/Web App/Library, confidential data, public/debug endpoint, or unrelated main integration.

## GitHub integration boundary

Current `main` has advanced independently. Do not merge/rebase current main during this bounded runtime investigation. After Work 0020 runtime acceptance is complete, final ChatGPT review will integrate current main and resolve any documentation/AGENTS overlap before merge.

GitHub-hosted CI is currently absent on the Work branch. Report local/repository checks separately and state whether GitHub Actions/status checks actually ran.

## Required report

Create:

`docs/handoffs/0020-CODEX-12-pitchbook-query-outcome-and-final-qualification-report.md`

Update:

- `docs/handoffs/0020-report.md`
- `docs/handoffs/0020-instruction.md`
- `docs/handoffs/0020-dispatches.md`
- PR #26 body

Commit and push only scoped changes. Keep PR #26 Draft / Open / unmerged.

Report at minimum:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-12
PITCHBOOK_EXISTING_QUERY_OUTCOME: PASS | FAILURE | TIMEOUT | AUTOMATION_LIMITATION | UNRESOLVED
LOGIC_VALIDATION: PASS | FAIL | NOT RUN
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: PASS | BLOCKED
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS | PARTIAL
READY: YES | NO
BLOCKER: NO | YES
FINAL_COMMIT: <sha>
GITHUB_CI_ACTUALLY_RAN: YES | NO
```

Target completion if all gates pass:

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
