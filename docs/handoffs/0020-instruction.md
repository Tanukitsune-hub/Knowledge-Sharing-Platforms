# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Current boundary

CODEX-18 returned successfully for the repair/build portion.

Accepted evidence:

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
LOGIC_VALIDATION: PASS — 315/315; focused 48/48; UI 10/10
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
SOURCE_READBACK: PASS — 78/78 deployable files
WEB_APP_DELIVERY: PASS — existing deployment updated in place to version 55
```

The remaining Work 0020 qualification is native private-Web-App acceptance only.

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

- use the existing private Web App version 55;
- enter the OpenAI key only into the private-admin key field;
- do not paste the key into ChatGPT/Codex/GitHub/logs;
- `APIキーを保存して接続確認` must run only the isolated synthetic self-test and must not read/sync Meeting/Pitchbook bodies;
- only after `READY_FOR_SYNC`, run `資料を同期して利用開始`;
- keep sync bounded and follow the UI/runtime safeguards already implemented;
- no Gemini live call, provider fallback, FULL_OUTPUT rerun, new Web App/Library/public debug endpoint, or current-main integration during this native acceptance.

## Work status

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_PROVIDER_PATH: PASS direct
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_NATIVE_ONBOARDING: NOT RUN
OPENAI_NATIVE_MEETING/PITCHBOOK: NOT RUN
OPENAI_NATIVE_LIFECYCLE: NOT RUN
FINAL_INTEGRITY: NOT RUN native Web App
READY: NO
BLOCKER: ACTION_REQUIRED — authorized private-admin native qualification
```

Report:
`docs/handoffs/0020-CODEX-18-openai-citation-normalization-and-primary-qualification-report.md`

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
