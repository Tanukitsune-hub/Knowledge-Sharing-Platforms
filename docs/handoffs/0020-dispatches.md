# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Active dispatch

### 0020-CODEX-18 — RETURNED / USER NATIVE ACCEPTANCE REQUIRED

Accepted CODEX-18 evidence:

- deterministic no-annotation failure reproduced;
- OpenAI INLINE_CITATION and exact fail-closed RETRIEVED_SOURCE normalization PASS;
- direct synthetic File Search/filter/source normalization PASS;
- focused tests `48/48`, UI tests `10/10`, canonical `315/315` PASS;
- temporal/public-surface/diff checks PASS;
- source readback `78/78` PASS;
- existing private Web App updated in place to version `55`;
- no Gemini live call, fallback, confidential DEV data, FULL_OUTPUT rerun, or new deployment;
- GitHub Actions/status checks remain absent.

Remaining action is not a new Codex implementation dispatch. An authorized private-admin user must use the existing Web App:

```text
APIキーを保存して接続確認
-> require synthetic self-test PASS / READY_FOR_SYNC
-> 資料を同期して利用開始
-> observe native bounded Meeting/Pitchbook source/query evidence
-> complete native metadata/lifecycle/final-integrity qualification
```

Keep Dispatch ID `0020-CODEX-18` while this user action is pending. Create `0020-CODEX-19` only if the native result exposes a real residual implementation defect requiring Codex.

## Returned history

### 0020-CODEX-17 — RETURNED / NARROW BLOCKER

Direct OpenAI provider reachability, Vector Store, synthetic upload, exact filter, grounded answer and cleanup passed. Citation normalization was the only blocker and is closed by CODEX-18.

### 0020-CODEX-16 — SUPERSEDED / NOT EXECUTED

Prepared for additional Gemini diagnosis, then superseded when OpenAI became the active completion provider.

## Accepted Gemini evidence retained

Gemini implementation/reconciliation evidence remains preserved, but provider recovery is deferred and is not required for Work 0020 if OpenAI passes native qualification. No automatic failover is permitted.

## Current classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_NATIVE_RUNTIME: ACTION_REQUIRED
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: NOT RUN native Web App
READY: NO
BLOCKER: ACTION_REQUIRED
```

Only one active dispatch may exist.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-18`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
