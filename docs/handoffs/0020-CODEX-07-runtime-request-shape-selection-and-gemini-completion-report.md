# Work 0020 — CODEX-07 runtime request-shape selection and Gemini completion report

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-07`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`

## Classification

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS — schema 6 / exactly five Backend sheets
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user; not called
GEMINI_RUNTIME: BLOCKED — Gate A did not produce an indexed Meeting
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence; not rerun
FINAL_INTEGRITY: PARTIAL — bounded Gate-A readback complete; dependent gates not run
READY: NO
BLOCKER: YES
```

## Deterministic validation

- Gemini transport tests: `17/17 PASS`.
- Focused AI/provider tests: `41/41 PASS`.
- `npm run check`: `282/282 PASS`.
- Temporal validator: PASS.
- Public-surface validator: PASS; public facade remains `30`.
- `git diff --check`: PASS.
- Relevant diff review: only the bounded Gemini request-shape selection repair and its synthetic tests; no credentials, private IDs, private URLs, source bodies, or unrelated changes.

The repair validates source bytes and MIME directly, evaluates a Byte[] candidate and a Blob candidate with non-mutating `UrlFetchApp.getRequest()`, ignores projected payload representation, preserves the resumable upload headers, and supplies no caller `Content-Length`. The selected candidate is the only candidate eligible for a live finalize request. Synthetic regressions cover representation drift, Blob byte/MIME integrity, both-candidate rejection, original-byte rejection, bounded finalization, and safe error classification.

## Source delivery

- The saved remote source was verified unchanged immediately before delivery.
- The exact tested source was synchronized once; `78/78` files read back as an exact match.
- Exactly one immutable Apps Script version was created: version `47`.
- The positively identified existing private Web App was updated in place to version `47`.
- Web App type, deploying-user execution, `Only myself` access, `/exec`, deployment count, and Library separation were preserved.
- No second deployment, Library mutation, Script Property mutation, source-body exposure, or OpenAI call was made.

## Gate A — one Meeting indexing attempt

Before the attempt, the existing synthetic DEV installation remained the accepted target. `AI_SYNC_ENABLED=false`, `GEMINI_ENABLED=true`, `OPENAI_ENABLED=false`, one isolated Gemini Store remained configured, and the temporary batch size was read as `1`.

The existing Web App AI provider settings surface was used once for the authorized provider-neutral manual sync. The Apps Script execution completed at the platform level, but the authoritative post-run readback did not produce an accepted active Gemini File Search Document or Backend `Indexed` state for a Meeting:

```text
Gate A: FAIL
Backend Gemini state: no accepted Indexed document
indexed timestamp/content hash: absent for the target state
provider document identity: absent
provider HTTP status/body: not observed
live finalize acceptance: not proven
```

The safe transport diagnostic available in the target state remained:

```text
code: AI_UPLOAD_FINALIZE_REQUEST_INVALID
classification: UPLOAD_FINALIZE_CLIENT
provider HTTP status/body: absent
```

No unchanged request was retried. No second Meeting attempt was made. The temporary batch-size setting was restored to its original numeric value `10` and read back. The Apps Script execution history showed the single `mutateAiProviderSettings` invocation as completed, but no additional provider response or accepted index state was observable.

## Dependent gates — not run

The handoff requires an accepted Meeting index before any dependent provider operation. Therefore the following were not run:

- Meeting grounded query;
- TXT Pitchbook indexing or query;
- exact metadata filter;
- update / Inactive / Reactivate / delete-rebuild lifecycle;
- browser query Audit qualification.

## Integrity readback after the bounded attempt

- Backend remains exactly five sheets with schema `6`.
- Existing Meeting/Pitchbook counts remain `4/16`; no authoritative source row or file mutation was observed.
- `AI_SYNC_ENABLED=false`, `OPENAI_ENABLED=false`, `GEMINI_ENABLED=true`; batch size restored to `10`.
- Audit remained at `71` rows; no query, Pitchbook qualification, or FULL_OUTPUT rerun occurred.
- OpenAI was disabled and uncalled; no Gemini fallback was used.
- No new Store, Web App deployment, Library, permission, trigger, or confidential-data mutation occurred. Trigger state remained `0` from the accepted baseline.
- No raw API key, upload URL, Store ID, source body, or provider payload was persisted in the diagnostic/report path.

## Stop decision

CODEX-07 stops at the first Gate-A qualification failure under the one-attempt handoff budget. Deterministic candidate selection passed, but target-runtime indexing was not accepted. A later Strategy Reset is required before another Gemini live attempt or any dependent qualification; this dispatch does not implement the Files API/import fallback.
