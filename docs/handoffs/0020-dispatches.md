# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-09`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-09 — READY

- mode: `BUILD / QUALIFICATION`;
- route: `C`;
- purpose: add an optional administrator-only `sourceType` constraint to the existing provider-neutral sync, then live-qualify one Gemini Meeting and one Gemini Pitchbook without changing normal queue ordering;
- active hypothesis: CODEX-08 stopped only because unrestricted batch-size-1 selection correctly chose an older Pitchbook. Filtering candidates by requested source type before existing sort/slice will select one eligible Meeting while preserving ordinary all-source behavior;
- recommended model: `Sol High`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-09-source-type-bounded-sync-and-gemini-final-qualification-instruction.md`;
- exact execution ref: use the final branch head supplied in the ChatGPT dispatch prompt;
- no new public/debug entry point; reuse existing administrator `SYNC` action and existing `options` contract;
- normal sync with blank sourceType must remain byte-for-byte semantic equivalent: combined Meeting+Pitchbook queue, existing Inactive/oldest-first/stable-key ordering;
- bounded qualification sync may request `Meeting` or `Pitchbook`, filtering before sort/slice;
- direct Blob finalize implementation from CODEX-08 remains the live transport path;
- OpenAI deliberately deferred/disabled and not to be live-called;
- FULL_OUTPUT accepted PASS from CODEX-03; do not rerun absent contradiction;
- one corrected source delivery maximum, then Meeting Gate A first; Pitchbook only after Meeting index/query PASS;
- no unrestricted broad sync, no source-order mutation, no fake provider failures to force selection, no new Store/deployment/Library mutation.

## Returned dispatch

### 0020-CODEX-08 — RETURNED / ACCEPTED EXCEPT BLOCKER

Accepted evidence:
- focused Gemini/provider `39/39 PASS`;
- repository `280/280 PASS`;
- temporal/public-surface/diff checks PASS; public facade `30`;
- direct Blob path logic validated: no production `getRequest()` prerequisite, no caller `Content-Length`, one Blob finalize on success;
- Gate 0 read real provider-neutral selection with guarded batch size `1`;
- two eligible Pending Meetings existed, but older eligible Pitchbooks also existed;
- selector returned exactly one Pitchbook and zero Meetings, consistent with normal oldest-first combined queue;
- batch size restored to `10`;
- no Apps Script sync/version/deployment, Gemini call, query, lifecycle, OpenAI call, or FULL_OUTPUT rerun occurred.

CODEX-08 report:
`docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-report.md`

## Earlier accepted evidence

### 0020-CODEX-07 — RETURNED / ACCEPTED EXCEPT BLOCKER
- transport `17/17`, focused AI/provider `41/41`, repository `282/282` PASS;
- exact source readback, version `47`, same private Web App update;
- no accepted Gemini Meeting Document/Indexed state.

### 0020-CODEX-06
- caller final-upload `Content-Length` removed;
- transport `12/12`, AI-focused `78/78`, repository `277/277` PASS; version `46`.

### 0020-CODEX-05
- transport/provider `68/68`, repository `274/274` PASS;
- safe stage/error preservation + bounded transient retry; version `45`.

### 0020-CODEX-04
- one isolated Gemini Store;
- future zero-code OpenAI activation implemented/deterministically validated;
- OpenAI disabled/uncalled.

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

Only one active Codex dispatch may exist.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-09`
BALL: `CODEX`
STATUS: `READY`
