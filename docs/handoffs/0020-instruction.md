# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-05`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`
MODE: `INVESTIGATION / BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:

`docs/handoffs/0020-CODEX-05-gemini-indexing-transport-repair-and-final-qualification-instruction.md`

## Primary outcome

Deliver one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

The user selected Gemini for the personal-DEV File Search qualification. OpenAI is deliberately deferred and remains disabled.

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

- CODEX-03 schema `6`, five Backend sheets, FULL_OUTPUT runtime PASS, canonical Preview/Copy/Docs/PDF package parity, safe disabled-provider/no-failover behavior, and final integrity;
- CODEX-04 focused `17/17 PASS`, repository `265/265 PASS`, public facade `30`, one isolated Gemini Store, and future OpenAI administrator activation path.

Do not rerun FULL_OUTPUT or live-call OpenAI.

## Active blocker and corrected diagnosis

CODEX-04 reported the first Meeting search as a retrieval failure. Authoritative post-return readback materially narrows the problem:

- Audit contains two `AI_HTTP_500` query failures 39 seconds apart;
- the synthetic Meeting Gemini provider states are `Failed` with no indexed document identity;
- multiple synthetic TXT Pitchbooks are also `Failed` with no indexed document identity;
- therefore no accepted evidence proves that retrieval was attempted against indexed Meeting/Pitchbook sources.

Active hypothesis:

> Gemini upload/indexing and error preservation are the primary defect. Retrieval must not be retried until one Meeting is proven indexed. The direct REST client also requires bounded retry for transient 5xx/429/408 responses.

## Completion boundary

CODEX-05 must:

1. preserve exact safe indexing failure stages/codes instead of generic `AI_SYNC_FAILED`;
2. align Gemini resumable upload and operation polling to the current official REST contract;
3. implement bounded exponential backoff + jitter for transient idempotent Gemini REST calls;
4. prove one Meeting indexed before one Meeting query;
5. prove one Pitchbook indexed before one Pitchbook query;
6. prove exact metadata filter and update/Inactive/Reactivate/delete-rebuild lifecycle without duplicate active documents;
7. reconcile the two Audit failure rows and prove one browser submit produces one final Audit outcome despite internal retries;
8. keep OpenAI disabled/uncalled, `AI_SYNC_ENABLED=false`, triggers `0`, and final integrity PASS.

## Current CODEX-05 status

The CODEX-05 deterministic repair and one authorized source/deployment update completed, but the first post-repair one-Meeting indexing gate stopped at `AI_UPLOAD_FINALIZE_FAILED` / `UPLOAD_FINALIZE`. No query or Pitchbook qualification was run after that failure. See:

`docs/handoffs/0020-CODEX-05-gemini-indexing-transport-repair-and-final-qualification-report.md`

Further Gemini live execution requires a Strategy Reset; do not infer a second production hypothesis from this return.

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
