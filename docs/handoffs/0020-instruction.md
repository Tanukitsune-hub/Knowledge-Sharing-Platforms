# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-06`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION / BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:

`docs/handoffs/0020-CODEX-06-apps-script-content-length-finalize-repair-and-completion-instruction.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

The user selected Gemini for personal-DEV File Search qualification. OpenAI is deliberately deferred and remains disabled.

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

- CODEX-03: schema `6`, five Backend sheets, FULL_OUTPUT runtime PASS, canonical Preview/Copy/Docs/PDF package parity, safe disabled-provider/no-failover behavior, and final integrity;
- CODEX-04: focused `17/17 PASS`, repository `265/265 PASS`, public facade `30`, one isolated Gemini Store, and future OpenAI administrator activation path;
- CODEX-05: focused `68/68 PASS`, repository `274/274 PASS`, exact source readback, immutable version `45`, same private Web App update, bounded retry/error-stage hardening, and one safely stopped Meeting indexing attempt.

Do not rerun FULL_OUTPUT or live-call OpenAI.

## Active blocker and Strategy Reset

CODEX-05 proved the first post-repair failure occurs at:

```text
code: AI_UPLOAD_FINALIZE_FAILED
stage: UPLOAD_FINALIZE
provider HTTP status/body: not observed
provider document identity: absent
```

The final upload request currently supplies `Content-Length` manually. The absence of a provider response and Apps Script transport behavior make a local request-construction failure the strongest current explanation.

Active hypothesis:

> Remove manual `Content-Length`, let `UrlFetchApp` derive length from exact payload bytes/Blob, preflight the request safely, and one Meeting upload will pass finalization.

This remains a hypothesis until one bounded live Gate-A result proves or disproves it.

## CODEX-06 completion boundary

CODEX-06 must:

1. remove the manual final-upload `Content-Length` header while preserving exact MIME type, bytes, offset, and `upload, finalize` command;
2. add a safe deterministic `UrlFetchApp.getRequest` or equivalent preflight;
3. distinguish local request-construction errors from actual provider HTTP failures;
4. preserve all CODEX-05 bounded retry/error-stage hardening;
5. run deterministic validation before live execution;
6. prove one Meeting indexed before one Meeting query;
7. prove one small TXT Pitchbook indexed before one Pitchbook query;
8. prove exact metadata filter and update/Inactive/Reactivate/delete-rebuild lifecycle without duplicate active documents;
9. keep OpenAI disabled/uncalled, `AI_SYNC_ENABLED=false`, triggers `0`, and final integrity PASS.

If the corrected finalize produces a genuine provider HTTP/operation error, stop with that exact safe evidence. Do not mix in the Files API/import architecture without another Strategy Reset.

## Closed contracts

- Backend remains exactly five sheets/schema `6`;
- legacy `AI_*` fields remain;
- OpenAI/Gemini derived states remain independent;
- stable IDs resolve citations to authoritative Backend/Drive;
- no automatic provider failover;
- Pitchbook bodies are File Search inputs but never manual FULL_EXPORT body text;
- no recurring trigger, confidential production data, production rollout, second Web App, or Library mutation.

## Expected final classification

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
