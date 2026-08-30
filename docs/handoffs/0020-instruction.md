# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Current boundary

CODEX-18 returned successfully for the repair/build portion.

The private administrator has completed APIキーを保存して接続確認 in the existing Web App; the UI now displays an active OpenAI status, and one synthetic Meeting has been registered. The remaining target-runtime qualification is the explicit OpenAI-only source sync, synthetic Meeting/Pitchbook citation proof, lifecycle, and final integrity. Pitchbook upload is currently blocked by the connected Chrome extension file-access setting. The Codex local key was not copied to Script Properties. Until the bounded source and lifecycle checks are observed, READY: NO and BLOCKER: ACTION_REQUIRED.

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

The remaining Work 0020 qualification is native private-Web-App acceptance only. The connection flow is active; synthetic source sync/query and lifecycle evidence remain pending because the Chrome extension file chooser is not currently available.

Required authorized-user sequence:

```text
APIキーを保存して接続確認
-> synthetic self-test
-> READY_FOR_SYNC
-> 資料を同期して利用開始
-> bounded native Meeting/Pitchbook query + source proof
-> metadata/lifecycle qualification
-> final native integrity
```

The Codex-local OPENAI_API_KEY was intentionally not copied to Script Properties.

Do not create a new Dispatch merely to perform the user-authorized UI actions. Keep `0020-CODEX-18` until the native outcome is returned. After the user action, ChatGPT will inspect the runtime evidence and either close Work 0020 or create the next Codex dispatch only for any actual residual defect.

## Safety boundary

- use the existing private Web App version 56;
- preserve the completed private-admin connection and do not expose the key;
- do not paste the key into ChatGPT/Codex/GitHub/logs;
- `APIキーを保存して接続確認` must run only the isolated synthetic self-test and must not read/sync Meeting/Pitchbook bodies;
- only after `READY_FOR_SYNC`, run `資料を同期して利用開始`;
- keep sync bounded and follow the UI/runtime safeguards already implemented;
- no Gemini live call, provider fallback, FULL_OUTPUT rerun, new Web App/Library/public debug endpoint, or current-main integration during this native acceptance.

## Work status

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RUNTIME: PARTIAL — connection active; source sync/query pending
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS
SCHEMA_ALIGNMENT: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES — CHROME_FILE_UPLOAD_PERMISSION_REQUIRED
```

Report:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md`

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
