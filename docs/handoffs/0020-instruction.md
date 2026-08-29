# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-07`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`
MODE: `INVESTIGATION / BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:

`docs/handoffs/0020-CODEX-07-runtime-request-shape-selection-and-gemini-completion-instruction.md`

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

- CODEX-03: schema `6`, five Backend sheets, FULL_OUTPUT runtime PASS, canonical Preview/Copy/Docs/PDF package parity, disabled-provider/no-failover PASS, final integrity PASS;
- CODEX-04: focused `17/17 PASS`, repository `265/265 PASS`, public facade `30`, one isolated Gemini Store, future zero-code OpenAI administrator activation;
- CODEX-05: focused `68/68 PASS`, repository `274/274 PASS`, safe transport-stage error preservation, bounded transient retry, version `45`, same Web App update;
- CODEX-06: manual final-upload `Content-Length` removed, focused transport `12/12 PASS`, AI-focused `78/78 PASS`, repository `277/277 PASS`, version `46`, same Web App update, bounded integrity readback.

Do not rerun FULL_OUTPUT or live-call OpenAI.

## Active blocker after CODEX-07

CODEX-07 removed the projected-payload byte-equality gate and passed the required deterministic candidate-selection checks. The one authorized target-runtime sync action still did not produce an accepted active Gemini Meeting Document or Backend `Indexed` state:

```text
code: AI_UPLOAD_FINALIZE_REQUEST_INVALID
classification: UPLOAD_FINALIZE_CLIENT
provider HTTP status/body: not observed
provider document identity: absent
```

The target runtime therefore did not supply sufficient evidence to qualify the direct Gemini indexing path. The one-attempt budget is exhausted; do not retry or adopt the Files API/import fallback in the returned dispatch. A later Strategy Reset is required.

## CODEX-07 authoritative return

The bounded CODEX-07 repair and deterministic validation passed, including the Byte[]/Blob candidate selection contract. The exact tested source was synchronized once, read back exactly, published as immutable version `47`, and the same private Web App was updated in place.

The single authorized provider-neutral sync action did not produce an accepted active Gemini Meeting Document or Backend `Indexed` state. The safe target-state diagnostic remained:

```text
code: AI_UPLOAD_FINALIZE_REQUEST_INVALID
classification: UPLOAD_FINALIZE_CLIENT
provider HTTP status/body: absent
provider document identity: absent
```

The temporary batch size was restored to `10`. Gate B Meeting query, Gate C TXT Pitchbook indexing/query, Gate D lifecycle, and Gate E final qualification were not run. OpenAI remained disabled and uncalled, FULL_OUTPUT was not rerun, and no second Store/deployment or Library mutation occurred.

Detailed report:
`docs/handoffs/0020-CODEX-07-runtime-request-shape-selection-and-gemini-completion-report.md`

CODEX-07 is returned with a blocker. A later Strategy Reset is required before another Gemini live attempt.

## CODEX-07 completion boundary

CODEX-07 must:

1. validate source bytes/MIME directly before projection;
2. remove projected-payload byte-equality as a hard gate;
3. evaluate Byte[] and Blob candidates locally with `getRequest()`;
4. select exactly one compatible candidate and send exactly one live Meeting finalize request;
5. preserve existing safe local-vs-provider transport error classification and bounded retry;
6. prove one Meeting indexed before one Meeting query;
7. prove one small TXT Pitchbook indexed before one Pitchbook query;
8. prove exact metadata filter and update/Inactive/Reactivate/delete-rebuild lifecycle without duplicate active documents;
9. keep OpenAI disabled/uncalled, `AI_SYNC_ENABLED=false`, triggers `0`, and final integrity PASS.

Do not implement the officially available Files API/import alternative in this dispatch. If both request shapes are locally unsupported or a stable direct-upload incompatibility is observed, return for another Strategy Reset.

## Closed contracts

- Backend remains exactly five sheets/schema `6`;
- legacy `AI_*` fields remain;
- OpenAI/Gemini derived states remain independent;
- stable IDs resolve citations to authoritative Backend/Drive;
- no automatic provider failover;
- Pitchbook bodies are File Search inputs but never manual FULL_EXPORT body text;
- no recurring trigger, confidential production data, production rollout, second Web App, or Library mutation.

## Target classification if a later Strategy Reset passes

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
