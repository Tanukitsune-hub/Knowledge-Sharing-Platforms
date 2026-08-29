# Work 0020 — CODEX-10 Web App administrator SYNC and Gemini final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-10`
BALL: `CODEX`
STATUS: `READY`
MODE: `QUALIFICATION` with one bounded UI repair fallback
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`
Exact execution ref: use the final branch head supplied by ChatGPT after control-document updates.

## Primary outcome

Complete Work 0020 by using the already deployed private Web App as the administrator execution surface for the existing `mutateAiProviderSettings` SYNC action, then live-qualify exactly one bounded Gemini Meeting and one bounded Gemini Pitchbook and finish the required lifecycle/integrity evidence.

Do not use Apps Script Execution API as the primary invocation route in this dispatch. CODEX-09 already proved that those execution routes are permission-blocked before function execution; that is an automation-surface limitation, not application/provider failure.

## Accepted evidence — closed absent material contradiction

- CODEX-03: schema `6`, exactly five Backend sheets, FULL_OUTPUT runtime/canonical package parity PASS, disabled-provider/no-failover PASS, final integrity PASS.
- CODEX-04: one isolated Gemini Store; future OpenAI activation path deterministically validated; OpenAI remains deliberately disabled/uncalled.
- CODEX-05 through CODEX-07: transport diagnostics/retry hardening, caller `Content-Length` removal, direct Blob finalize implementation, versions `45`–`47`.
- CODEX-08: direct Blob path deterministic PASS; unrestricted batch-1 selector correctly chose an older Pitchbook, proving normal combined oldest-first ordering.
- CODEX-09: optional administrator `sourceType` contract deterministic PASS; focused `45/45`, repository `286/286`, temporal/public/diff PASS; exact source readback `78/78`; existing private Web App updated in place to version `48`; batch restored to numeric `10`; no Gemini call/data mutation after execution-surface failure.

Do not rerun FULL_OUTPUT. Do not live-call OpenAI. Do not redesign the selector or transport.

## Strategy Reset after CODEX-09

### Closed conclusions

1. `sourceType` logic is implemented and reviewed: blank preserves the combined queue; `Meeting`/`Pitchbook` filter before the existing sort/slice; invalid values fail closed.
2. Server-side administrator authorization remains enforced inside `kspMutateAiProviderSettings_`.
3. The deployed `/exec` rendered and exposed the existing administrator settings page.
4. The current browser client already invokes the public facade `mutateAiProviderSettings` through the Web App for the normal administrator SYNC action.
5. CODEX-09 failed only when trying to invoke the server function through Apps Script Execution API routes. No Web App `google.script.run` / existing `serverCall` SYNC result was observed.
6. No new public/debug endpoint is justified.

### Active hypothesis — exactly one

> Invoking the existing `mutateAiProviderSettings` facade from the authenticated private Web App page context with `{ action: 'SYNC', sourceType: 'Meeting' }` will execute under the working Web App/session boundary and avoid the separate Apps Script Execution API permission restriction.

## Fastest Safe Decisive Action

Attempt the already-deployed version `48` first with zero source/deployment change.

1. Re-read redacted DEV state and verify the same private Web App/version/security boundary.
2. Preserve the original `AI_SYNC_BATCH_SIZE` value and type; temporarily set it to numeric `1` using the accepted guarded mechanism.
3. Open the authenticated existing `/exec` and confirm `canMutate=true` on the AI provider admin surface.
4. From the Web App page context, invoke the existing browser/server bridge equivalent to:

```javascript
serverCall('mutateAiProviderSettings', {
  action: 'SYNC',
  sourceType: 'Meeting'
})
```

Use the existing application client/runtime path. Do not create a new endpoint, test wrapper, URL parameter, or Apps Script API execution shim.

Because CODEX-09 already deterministically proved filtering-before-slice and the live preflight found eligible Meetings, batch size `1` + `sourceType=Meeting` is the accepted safety bound. Do not add new instrumentation merely to observe the internal selected ID before upload.

## Gate A — bounded Meeting sync/index

The Web App mutation above is the single allowed Meeting sync attempt.

PASS requires all of the following:
- server mutation returns a safe successful SYNC result with `sourceType=Meeting`;
- Gemini is the only enabled live provider; OpenAI remains disabled and uncalled;
- exactly one Meeting is newly indexed/reused/unchanged as appropriate and no Pitchbook provider state changes in this operation;
- if upload is required, the direct Blob final-upload path is actually invoked and provider operation completes successfully;
- one ACTIVE Gemini File Search Meeting Document exists with canonical Meeting metadata verified internally;
- Backend Gemini provider state is `Indexed` and there is no duplicate active Gemini document for that Meeting;
- no confidential/private identifier is copied into GitHub/report/chat.

If the Web App call reaches application/provider execution and fails, STOP. Do not retry through another execution route in this dispatch.

## Gate B — Meeting grounded query

Only after Gate A PASS, submit exactly one Meeting-filtered query through the normal Web App.

PASS requires a grounded answer and a citation that resolves through stable source identity to the authoritative Meeting/Drive source, with one bounded safe Audit outcome and no provider failover.

## Gate C — bounded Pitchbook sync/index/query

Only after Gate B PASS:

1. Invoke the same existing Web App administrator SYNC with `sourceType=Pitchbook`, still at batch size `1`.
2. Use the selected source only if it is synthetic/non-confidential and safe for qualification. Otherwise STOP; do not manipulate queue priority or fake failure states.
3. Require one ACTIVE Pitchbook Gemini document, Backend `Indexed`, no duplicate, and one Pitchbook-filtered grounded query with authoritative citation.

Exactly one Pitchbook SYNC attempt and one Pitchbook query are allowed.

## Gate D — metadata/lifecycle

Using only the already-bounded synthetic/non-confidential sources, prove the remaining original Work 0020 acceptance evidence:
- exact stable metadata filter;
- update -> reindex without duplicate active document;
- Inactive removal/exclusion;
- Reactivate restoration;
- exact delete/rebuild of derived provider document;
- authoritative Drive source remains intact.

Use the same source-type-bounded Web App admin SYNC path where needed. Keep mutations minimal and restore source lifecycle state at the end.

## Gate E — final integrity

Require:
- exactly five Backend sheets / schema `6`;
- `AI_SYNC_ENABLED=false`;
- `AI_SYNC_BATCH_SIZE` restored exactly to its original value and type;
- `GEMINI_ENABLED=true` and one isolated Gemini Store only;
- `OPENAI_ENABLED=false`; zero OpenAI live calls;
- FULL_OUTPUT accepted evidence unchanged and not rerun;
- triggers `0`;
- no new Store, Web App deployment, Library, permission, or confidential-data mutation;
- safe Audit only, with no question/answer/chunk/source body/raw provider payload/credential/Store ID/upload URL leakage;
- authoritative Meeting/Pitchbook business content intact except restored synthetic lifecycle transitions.

## Bounded UI fallback — only if browser page-context invocation is impossible before any provider sync executes

If the authenticated `/exec` can be operated but the available browser harness cannot invoke the existing `serverCall` with a custom payload, make the smallest durable administrator UI repair instead of retrying Apps Script Execution API:

- add an administrator-only sync scope control on the existing AI Provider Settings page with values `All`, `Meeting`, `Pitchbook`;
- `All` sends blank `sourceType` and remains the default/current behavior;
- `Meeting` and `Pitchbook` pass the existing validated values to the existing `mutateAiProviderSettings` facade;
- keep the existing server-side administrator authorization authoritative;
- do not expose source IDs, Store IDs, provider document IDs, credentials, raw provider payloads, or source bodies;
- do not add any public function or debug/test endpoint;
- keep normal Knowledge Search UI unchanged.

If this fallback changes source:
1. add focused client/admin regression tests;
2. run the affected tests and full `npm run check`, temporal/public-surface validation, and `git diff --check`;
3. synchronize exact tested source once and read it back exactly;
4. create at most one new immutable Apps Script version and update the same private Web App in place once;
5. then perform Gate A by using the visible admin control.

No UI/source/deployment change is allowed if direct page-context invocation succeeds.

## Test / CI evidence handling

GitHub currently has no Actions workflow run or commit status check for CODEX-09 head. Do not claim GitHub CI PASS unless a real run exists. Local/deterministic validation remains valid evidence for logic, but report it separately from GitHub CI.

## Attempt limits and stop rules

- one Web App Meeting SYNC execution attempt;
- one Meeting grounded query only after Meeting index PASS;
- one Web App Pitchbook SYNC execution attempt only after Meeting query PASS;
- one Pitchbook grounded query only after Pitchbook index PASS;
- one optional UI repair/source delivery/version/Web App update maximum, and only if page-context custom invocation is impossible before provider execution;
- no Apps Script Execution API retry loop;
- no unrestricted broad sync for qualification;
- no Meeting-first global priority change;
- no queue manipulation/fake failures to force a source;
- no new Store/deployment/Library/public endpoint;
- no OpenAI live call;
- no FULL_OUTPUT rerun absent material contradiction;
- stop at the first new provider/runtime failure after actual application execution begins.

## Delivery

Create:
`docs/handoffs/0020-CODEX-10-webapp-admin-sync-and-gemini-final-qualification-report.md`

Update:
- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR `#26` body.

Commit and push all scoped changes. Keep PR #26 Draft / Open / unmerged for ChatGPT final review.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```
