# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Current boundary

CODEX-18 returned successfully for the repair/build portion.

The private administrator has completed APIキーを保存して接続確認 in the existing Web App; the UI displayed an active OpenAI status, and one synthetic Meeting plus one synthetic Pitchbook were registered. The explicit Meeting sync returned to an interactive state, but the explicit OpenAI-only Pitchbook sync ended in the generic UI state `エラー` after a bounded wait. CODEX-18 therefore stopped before native queries, lifecycle, and final integrity. The Codex local key was not copied to Script Properties. READY: NO and BLOCKER: OPENAI_SYNC_FAILED.

Full details: docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md.
MODE: `REPAIR -> BUILD / QUALIFICATION`

Active instruction:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-instruction.md`

Active decision:
`docs/decisions/openai-zero-friction-onboarding-and-project-switch.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:
## Accepted evidence

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
LOGIC_VALIDATION: PASS — 316/316; focused provider/admin/core regression PASS; UI 10/10
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
SOURCE_READBACK: PASS — 78/78 deployable files
WEB_APP_DELIVERY: PASS — existing deployment updated in place to version 56
```

The remaining Work 0020 qualification is native private-Web-App acceptance only. The connection flow and synthetic registrations are observed, but the native OpenAI-only Pitchbook source-sync gate failed; query, lifecycle, and final integrity evidence remain unavailable under the stop rule.

Observed authorized-user sequence and stop boundary:

```text
APIキーを保存して接続確認
-> synthetic self-test
-> READY_FOR_SYNC
-> 資料を同期して利用開始
-> bounded native Meeting/Pitchbook query + source proof
-> metadata/lifecycle qualification
-> final native integrity
```

The synthetic registrations were observed and the OpenAI-only Pitchbook sync then ended in the generic UI state `エラー`. Stop here for CODEX-18; do not retry or continue to native query, lifecycle, or final-integrity checks in this dispatch.

The Codex-local OPENAI_API_KEY was intentionally not copied to Script Properties.

Do not create another dispatch merely to retry this runtime failure. Keep `0020-CODEX-18` returned with the safe `OPENAI_SYNC_FAILED` blocker. A later dispatch requires a separately scoped diagnosis or repair decision.

## Safety boundary

- use the existing private Web App version 56;
- preserve the completed private-admin connection and do not expose the key;
- do not paste the key into ChatGPT/Codex/GitHub/logs;
- `APIキーを保存して接続確認` must run only the isolated synthetic self-test and must not read/sync Meeting/Pitchbook bodies;
- only after `READY_FOR_SYNC`, run `資料を同期して利用開始`;
- keep sync bounded and follow the UI/runtime safeguards already implemented; after a native sync failure, stop without retry;
- no Gemini live call, provider fallback, FULL_OUTPUT rerun, new Web App/Library/public debug endpoint, or current-main integration during this native acceptance.

## Work status

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RUNTIME: BLOCKED — native OpenAI-only Pitchbook sync failed
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS
SCHEMA_ALIGNMENT: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES — OPENAI_SYNC_FAILED (native Pitchbook sync ended in generic UI ERROR)
```

Report:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md`

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `CHATGPT`
STATUS: `RETURNED`
