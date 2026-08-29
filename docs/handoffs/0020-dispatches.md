# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-11`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-11 — READY

- mode: `INVESTIGATION -> BUILD / QUALIFICATION`;
- route: `C`;
- purpose: repair the observed Gemini post-upload document reconciliation defect without creating duplicate provider documents, then complete the remaining bounded Gemini qualification;
- one active hypothesis: CODEX-10 uploads may have succeeded in Gemini, but production code incorrectly requires the completed upload Operation to embed a FileSearchDocument; generic/empty successful Operation response therefore becomes permanent `AI_DOCUMENT_READBACK_FAILED`, and the failure state then prevents self-reconciliation;
- expected pre-fix proof: a completed Operation with no embedded document plus exactly one matching ACTIVE document available from the Documents list must fail on the current baseline;
- minimal repair: retain the embedded-document fast path, add bounded exact `source_type + source_id + content_hash` list/get reconciliation, and allow CODEX-10-style readback-failed rows to reconcile an already-existing document without upload/delete;
- first live actions after one validated delivery are reconciliation-only for the two uncertain CODEX-10 Meeting rows;
- mandatory safety precondition: `AI_SYNC_BATCH_SIZE` must be set and authoritatively read back as numeric `1` immediately before every provider-mutating sync; otherwise STOP;
- recommended model: `Sol High` because the runtime/API response contract is now the unresolved part;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-11-gemini-document-reconciliation-and-final-qualification-instruction.md`;
- exact execution ref: use the final branch head supplied in the ChatGPT dispatch prompt;
- preserve CODEX-03 through CODEX-10 accepted evidence; do not rerun FULL_OUTPUT or live-call OpenAI;
- one hypothesis, one minimal repair, one tested source delivery/version/Web App update maximum;
- no broad sync, uncertain-row re-upload, new Store/Web App/Library/public debug route, confidential data, or provider retry loop.

## Returned dispatches

### 0020-CODEX-10 — RETURNED / BLOCKER

Accepted evidence:
- focused provider/core/admin/transport/sync tests `45/45 PASS`;
- repository `286/286 PASS`; temporal/public-surface/diff PASS; public facade `30`;
- authorized minimal `All / Meeting / Pitchbook` admin UI fallback added;
- exact source readback `78/78`, immutable Apps Script version `49`, same private Web App updated in place;
- version-49 page rendered and authenticated Web App admin SYNC executed once.

Observed blocker:
- required temporary batch size `1` was not in effect; authoritative post-run readback remained numeric `10`;
- two eligible synthetic Meetings were therefore attempted;
- both ended safe permanent `AI_DOCUMENT_READBACK_FAILED` with no accepted local Gemini document identity;
- no Pitchbook changed, no query/lifecycle/final-integrity gate ran;
- no retry/state reset/OpenAI call/FULL_OUTPUT rerun/second deployment/Library mutation occurred.

Interpretation after ChatGPT GitHub/API review:
- current transport test success fixture assumes `operation.response.fileSearchDocument`;
- current production code converts failure to extract a document from the completed Operation into permanent `AI_DOCUMENT_READBACK_FAILED`;
- current Google File Search examples only poll the long-running Operation to `done`, while the API reference defines generic Operation responses and separate File Search Document list/get APIs;
- the Work remains blocked pending CODEX-11 deterministic reproduction and bounded reconciliation repair.

Report:
`docs/handoffs/0020-CODEX-10-webapp-admin-sync-and-gemini-final-qualification-report.md`

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
- not evidence of an application or Gemini provider defect.

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

For CODEX-10 head `e8e022baf7d608b81f8a3bb164636781b46a0011`, GitHub had zero Actions workflow runs and zero commit status checks. The recorded local deterministic results are repository/Codex execution evidence, not GitHub-hosted CI evidence. Do not claim GitHub CI PASS unless a real run exists.

Current `main` has advanced independently and the Work branch is behind it; do not merge/rebase unrelated main changes during the bounded runtime diagnosis unless required by a material dependency. Integrate current main before final Work merge after the blocker is resolved.

Only one active Codex dispatch may exist.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-11`
BALL: `CODEX`
STATUS: `READY`
