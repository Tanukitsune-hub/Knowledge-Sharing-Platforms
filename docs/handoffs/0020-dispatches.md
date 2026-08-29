# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-10`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`

## Active dispatch

### 0020-CODEX-10 — RETURNED / BLOCKER

- mode: `QUALIFICATION` with one bounded UI repair fallback;
- route: `C`;
- purpose: invoke the existing administrator `SYNC` through the authenticated private Web App runtime, then finish the one-Meeting / one-Pitchbook Gemini qualification and lifecycle/integrity gates;
- active hypothesis: CODEX-09 proved only that Apps Script Execution API routes are permission-blocked. The already deployed Web App browser/server bridge should execute the existing `mutateAiProviderSettings` facade under the working Web App/session boundary;
- fastest safe decisive action: version `48`, zero source/deployment change first; temporarily set batch size to numeric `1`, then call the existing Web App server bridge with `{ action: 'SYNC', sourceType: 'Meeting' }`;
- if page-context custom invocation is impossible before any provider sync executes, one fallback is allowed: add a minimal administrator-only `All / Meeting / Pitchbook` sync-scope control to the existing AI Provider Settings page, with no new public/debug function, then one tested source delivery/version/Web App update maximum;
- recommended model: `Sol High`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-10-webapp-admin-sync-and-gemini-final-qualification-instruction.md`;
- exact execution ref: use the final branch head supplied in the ChatGPT dispatch prompt;
- preserve CODEX-03 through CODEX-09 accepted evidence; do not rerun FULL_OUTPUT or live-call OpenAI;
- no Apps Script Execution API retry loop, unrestricted broad sync, source-order mutation, fake provider failures, new Store, new deployment, Library mutation, public/debug endpoint, or confidential data;
- stop on the first new provider/runtime failure after an actual application execution begins.
- result: the authorized minimal UI fallback was delivered as source readback `78/78`,
  immutable version `49`, and an in-place update of the same private Web App;
- the version-49 page rendered, `Meeting` was selected, and the existing admin
  sync was clicked once. The batch size was read back as numeric `10`, so two
  eligible Meetings were attempted instead of the required one;
- both attempted Meetings ended in safe permanent `AI_DOCUMENT_READBACK_FAILED`
  state with no accepted Gemini Document; no Pitchbook state changed;
- dependent queries, Pitchbook lifecycle, and final qualification were not run;
  no retry, state reset, OpenAI call, FULL_OUTPUT rerun, second deployment, or
  Library mutation occurred;
- report: `docs/handoffs/0020-CODEX-10-webapp-admin-sync-and-gemini-final-qualification-report.md`;

## Returned dispatches

### 0020-CODEX-09 — RETURNED / BLOCKER

Accepted evidence:
- optional administrator `sourceType` selector/admin forwarding contract deterministic PASS;
- focused `45/45 PASS`, repository `286/286 PASS`, temporal/public-surface/diff PASS; public facade `30`;
- exact tested source synchronized/read back `78/78`; existing private Web App updated in place to immutable version `48`;
- batch value temporarily numeric `1`, restored/read back numeric `10`;
- `/exec` rendered and administrator surface was visible;
- both Apps Script Execution API routes rejected the exact server-function invocation before function execution with a platform permission error;
- no Gemini request, query, source/data/Audit mutation, Store/deployment/Library change, OpenAI call, or FULL_OUTPUT rerun occurred.

Interpretation:
- execution-surface/automation limitation only;
- not evidence of an application or Gemini provider defect;
- Web App `google.script.run` / existing `serverCall` custom SYNC path was not observed and remains the next decisive route.

Report:
`docs/handoffs/0020-CODEX-09-source-type-bounded-sync-and-gemini-final-qualification-report.md`

### 0020-CODEX-08 — RETURNED / ACCEPTED EXCEPT BLOCKER

- focused Gemini/provider `39/39 PASS`;
- repository `280/280 PASS`;
- temporal/public-surface/diff PASS; public facade `30`;
- direct Blob path logic validated;
- unrestricted batch-size-1 combined queue correctly selected an older Pitchbook ahead of two eligible Pending Meetings;
- batch restored to `10`;
- no source delivery/deployment/Gemini call occurred.

Report:
`docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-report.md`

## Earlier accepted evidence

### 0020-CODEX-07
- transport `17/17`, focused AI/provider `41/41`, repository `282/282` PASS; version `47`; no accepted Gemini Meeting Document.

### 0020-CODEX-06
- caller final-upload `Content-Length` removed; transport `12/12`, AI-focused `78/78`, repository `277/277` PASS; version `46`.

### 0020-CODEX-05
- transport/provider `68/68`, repository `274/274` PASS; safe stage/error preservation + bounded transient retry; version `45`.

### 0020-CODEX-04
- one isolated Gemini Store; future zero-code OpenAI activation deterministic PASS; OpenAI disabled/uncalled.

### 0020-CODEX-03 — ACCEPTED / COMPLETE
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical package parity PASS;
- disabled-provider safe errors/no-failover and final integrity PASS;
- version `42`, triggers `0`, same private Web App.

## Closed source scopes

```text
Gemini File Search -> Meeting + Pitchbook/source materials
ChatGPT/OpenAI -> visible but deliberately disabled in personal DEV
全文出力 -> Meeting Google Docs full text + optional Pitchbook references/links
```

## GitHub review note

At CODEX-09 head `26188b8e97ec9600ee08fb8e8518d630c2f1714d`, GitHub had no Actions workflow run and no commit status checks. The reported deterministic test results are repository/report evidence, not GitHub-hosted CI evidence. Do not claim GitHub CI PASS unless a real run exists.

Only one active Codex dispatch may exist.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-10`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`
