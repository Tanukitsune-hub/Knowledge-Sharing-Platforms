# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION / BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:

`docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-instruction.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini remains the personal-DEV live qualification provider. OpenAI is deliberately deferred and remains disabled.

Source boundaries remain fixed:

```text
Gemini File Search
  -> Meeting + Pitchbook/source materials

ChatGPT / OpenAI
  -> visible but disabled in personal DEV
  -> future zero-code administrator activation is implemented

全文出力
  -> authoritative Meeting Google Docs full text
  -> optional Pitchbook reference metadata + Drive links
```

## Accepted evidence

Closed absent material contradiction:

- CODEX-03: schema `6`, five Backend sheets, FULL_OUTPUT runtime PASS, Preview/Copy/Docs/PDF canonical parity, disabled-provider/no-failover PASS, final integrity PASS;
- CODEX-04: focused `17/17`, repository `265/265` PASS, public facade `30`, one isolated Gemini Store, future zero-code OpenAI administrator activation;
- CODEX-05: focused `68/68`, repository `274/274` PASS, safe transport-stage errors, bounded transient retry, version `45`;
- CODEX-06: caller `Content-Length` removed, transport `12/12`, AI-focused `78/78`, repository `277/277` PASS, version `46`;
- CODEX-07: Byte[]/Blob candidate logic, transport `17/17`, focused AI/provider `41/41`, repository `282/282` PASS, exact source readback, version `47`.

Do not rerun FULL_OUTPUT or live-call OpenAI.

## Strategy Reset after CODEX-07

CODEX-07 again stopped before an accepted provider result:

```text
code: AI_UPLOAD_FINALIZE_REQUEST_INVALID
classification: UPLOAD_FINALIZE_CLIENT
provider HTTP status/body: absent
provider document identity: absent
```

The repeated evidence establishes that continuing to refine `UrlFetchApp.getRequest()` as a production precondition has no remaining decision value.

Closed conclusions:

- Apps Script `UrlFetchApp.fetch` officially accepts byte-array and Blob payloads;
- `getRequest()` is optional inspection, not a provider requirement;
- direct Gemini File Search resumable upload remains supported;
- the alternative Gemini Files API + `importFile` does not bypass this blocker because the initial Files API upload uses the same resumable `upload, finalize` transport;
- the remaining decisive evidence is the result of one actual direct Blob finalize request with no hard `getRequest()` gate.

Active hypothesis:

> The production inspection/candidate gate is the remaining blocker. One exact Blob passed directly to `UrlFetchApp.fetch()` will either index the Meeting or finally produce a genuine local/provider transport result that changes the architecture decision.

## CODEX-08 completion boundary

CODEX-08 must:

1. remove `UrlFetchApp.getRequest()` from the live indexing prerequisite path;
2. validate canonical bytes/MIME directly and build one exact Blob;
3. preserve offset `0`, `upload, finalize`, no caller `Content-Length`, and opaque provider upload URL (`escaping:false` if required);
4. run deterministic validation;
5. deliver exact tested source once and update the same private Web App once;
6. issue exactly one real Meeting final-upload attempt;
7. if Meeting indexing PASS, prove one Meeting grounded query;
8. prove one small TXT Pitchbook index/query;
9. prove exact metadata filter and update/Inactive/Reactivate/delete-rebuild lifecycle without duplicate active documents;
10. keep OpenAI disabled/uncalled, `AI_SYNC_ENABLED=false`, triggers `0`, and final integrity PASS.

If the direct Blob `fetch()` itself throws locally before a provider response, stop and classify Apps Script direct resumable transport as incompatible for this path; do not start another header/preflight iteration. If a genuine provider HTTP/operation error appears, stop with that exact safe evidence.

## Closed contracts

- Backend remains exactly five sheets/schema `6`;
- legacy `AI_*` fields remain;
- OpenAI/Gemini derived states remain independent;
- stable IDs resolve citations to authoritative Backend/Drive;
- no automatic provider failover;
- Pitchbook bodies are File Search inputs but never FULL_EXPORT body text;
- no recurring trigger, confidential production data, second Web App, new Store, or Library mutation.

## Target final classification

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```

Completion Latch applies only after ChatGPT final review and merge.
