# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-05`
BALL: `CODEX`
STATUS: `READY`

## Current classification

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: BLOCKED — no accepted indexed Meeting/Pitchbook source yet
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PENDING after CODEX-04 stop
READY: NO
BLOCKER: YES
```

## Accepted evidence

CODEX-03 remains accepted:

- focused `52/52 PASS`, repository `256/256 PASS`;
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT Preview/Copy/Docs/PDF contract PASS;
- disabled-provider/no-failover behavior PASS;
- final integrity PASS;
- Apps Script version `42`, triggers `0`, same private Web App, no Library/permission mutation.

CODEX-04 deterministic and delivery evidence remains accepted:

- focused provider/admin/public-surface tests `17/17 PASS`;
- repository validation `265/265 PASS`;
- temporal/diff validation PASS;
- public facade `30`;
- exact source synchronization/readback and one in-place private Web App update;
- one isolated Gemini Store created;
- future OpenAI administrator activation path implemented and deterministically validated;
- OpenAI remained disabled/unconfigured and was not called.

Detailed reports:

- `docs/handoffs/0020-CODEX-03-schema6-alignment-and-runtime-qualification-report.md`
- `docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-report.md`

## Authoritative correction to CODEX-04 diagnosis

Connected authoritative readback after CODEX-04 found:

- two `AI_QUERY / Failure / AI_HTTP_500` Audit rows 39 seconds apart, although the report described one submitted search and no retry;
- both synthetic Meeting Gemini provider states are `Failed` and have no document name, provider document ID, indexed time, content hash, or Store association;
- multiple synthetic TXT Pitchbooks have the same failed/no-document state;
- no accepted evidence shows that either source type reached `Indexed` before the search calls.

Accordingly, the remaining problem is not classified as a proven Gemini retrieval outage. The primary blocker is the upload/index path and loss of actionable transport-stage error codes. A separate bounded retry gap exists for transient HTTP 408/429/5xx responses in the direct REST client.

## Active strategy reset

`0020-CODEX-05` must establish evidence in this order:

```text
one Meeting indexes successfully
-> one Meeting grounded search
-> one small TXT Pitchbook indexes successfully
-> one Pitchbook grounded search
-> exact metadata filter
-> update / Inactive / Reactivate / delete-rebuild
-> final integrity
```

No new user-facing search is authorized before Store document readback and Backend `Indexed` state pass for the target source.

Active instruction:

`docs/handoffs/0020-CODEX-05-gemini-indexing-transport-repair-and-final-qualification-instruction.md`

## Expected final matrix

```text
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```
