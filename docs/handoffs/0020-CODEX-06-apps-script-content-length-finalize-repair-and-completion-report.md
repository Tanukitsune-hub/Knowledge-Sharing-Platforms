# Work 0020 — CODEX-06 Apps Script upload-finalize transport repair and completion report

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-06`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`

## Classification

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS — accepted schema 6 / five Backend sheets
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user; not called
GEMINI_RUNTIME: BLOCKED — local upload-finalize request construction error
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence, not rerun
FINAL_INTEGRITY: PARTIAL — bounded post-attempt readback complete; dependent lifecycle gates not run
READY: NO
BLOCKER: YES
```

## Deterministic validation

- Focused Gemini transport regression suite: `12/12 PASS`.
- All AI/provider-focused tests: `78/78 PASS`.
- `npm run check`: `277/277 PASS`.
- Temporal validator: PASS.
- Public-surface validator: `30` public facade functions.
- `git diff --check`: PASS.
- Relevant diff review: only the bounded Gemini transport repair and its tests; no credentials, private IDs, private URLs, source bodies, or unrelated changes.

The final upload request no longer supplies a manual `Content-Length` header. The exact payload bytes, source MIME type, `X-Goog-Upload-Offset: 0`, and `X-Goog-Upload-Command: upload, finalize` were preserved. A safe `UrlFetchApp.getRequest()` preflight and separate local/provider error classification were added and covered by synthetic tests. A computed projection header is allowed; only a manually supplied restricted header is rejected.

The exact tested source was synchronized once as `78` Apps Script files and read back as an exact match. One immutable Apps Script version, `46`, was created and the positively identified existing private Web App was updated in place. Web App type, deploying-user execution, `Only myself` access, and `/exec` rendering were read back. No new deployment or Library mutation was performed.

## Target-runtime qualification

### Gate A — one Meeting indexing attempt

The provider-neutral sync was bounded to one existing synthetic Meeting with a temporary batch size of one. The original batch-size value and numeric type were restored exactly to `10` after the attempt.

The single bounded sync action did not reach a Gemini provider HTTP response. The selected Meeting's safe AI state readback was:

```text
status: Failed
code: AI_UPLOAD_FINALIZE_REQUEST_INVALID
classification: UPLOAD_FINALIZE_CLIENT
http status: absent / 0
provider document identity: absent
indexed timestamp/content hash: absent
```

This is a local Apps Script request-construction/preflight failure, not an observed Gemini HTTP or operation error. No unchanged request retry was made, no second live Meeting attempt was made, and no provider document was created or accepted.

### Dependent gates — not run

- Meeting grounded query: `NOT RUN` because Store Document + Backend `Indexed` did not pass.
- TXT Pitchbook indexing/query: `NOT RUN`.
- exact metadata filter and update/Inactive/Reactivate/delete-rebuild lifecycle: `NOT RUN`.
- browser query Audit qualification: `NOT RUN`.

## Integrity readback after the bounded attempt

- Backend remains exactly five sheets; schema remains `6`.
- Meeting and Pitchbook row counts remained `4` and `16`; non-AI authoritative fields were unchanged.
- Settings readback remained `AI_SYNC_ENABLED=false`, `OPENAI_ENABLED=false`, `GEMINI_ENABLED=true`, and the temporary batch size was restored to `10`.
- Audit row count remained `71`; no query or export gate was run by this dispatch.
- OpenAI was not called; FULL_OUTPUT was not rerun; no broad sync, Files API fallback, second Store, second Web App deployment, or Library mutation occurred.
- No source-body, credential, upload URL, Store ID, or raw provider payload was persisted in the safe diagnostic state.

## Stop decision

CODEX-06 stops at the first post-repair Gate-A failure under the handoff stop rule. The corrected path proves that the live failure is currently a local request-construction/preflight defect, but the one-attempt budget is exhausted. A later Strategy Reset is required before another Gemini live attempt or any dependent qualification.
