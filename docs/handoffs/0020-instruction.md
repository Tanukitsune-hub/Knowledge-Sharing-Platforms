# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-17`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
MODE: `INVESTIGATION -> BUILD / QUALIFICATION`

Active instruction:
`docs/handoffs/0020-CODEX-17-openai-file-search-primary-qualification-instruction.md`

Active decision:
`docs/decisions/openai-zero-friction-onboarding-and-project-switch.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

For Work 0020 completion, OpenAI is now the active provider path. Gemini remains implemented but disabled/not user-ready until a later provider-recovery Work requalifies it. There is no automatic cross-provider failover.

## User decision / Strategy Reset

Google AI Studio is also showing repeated errors. The user chose to try OpenAI API instead of continuing active Gemini diagnosis.

Therefore:

- preserve all accepted Gemini evidence;
- supersede unexecuted CODEX-16;
- qualify OpenAI Responses API + File Search end to end;
- if OpenAI satisfies Meeting/Pitchbook indexing, grounded citation, filters, lifecycle, security, and final-integrity gates, Work 0020 may complete without Gemini runtime PASS;
- Gemini recovery becomes a later provider-specific Work rather than blocking Knowledge Search availability.

## Existing OpenAI foundation

Current source already includes:

- Responses API client;
- Files upload/delete;
- Vector Store create/get/list;
- Vector Store file attach/index/readback;
- provider attributes/custom metadata;
- File Search query with filters;
- provider document cleanup;
- provider-neutral sync hooks;
- administrator enable/disable skeleton.

The remaining work is qualification plus safe onboarding/activation separation, not a rebuild.

Default OpenAI model for this Work:

```text
gpt-5.6-terra
```

Use `store=false` for Responses and a low-latency grounded retrieval profile. Do not silently switch to a materially more expensive tier.

## Fastest safe decisive action

Before modifying Apps Script:

1. make an OpenAI project API key available only to local Codex as `OPENAI_API_KEY`;
2. run one direct text-only Responses API control;
3. run one temporary synthetic Vector Store + File Search + exact attributes filter + citation control;
4. clean up all temporary provider resources;
5. if direct File Search fails, STOP without Web App changes;
6. if direct File Search passes, implement the accepted synthetic self-test and zero-friction private-admin activation flow;
7. then run bounded synthetic/non-confidential Meeting + Pitchbook indexing/query/citation/lifecycle qualification.

## Credential/onboarding contract

Normal private-admin flow:

```text
APIキーを保存して接続確認
-> administrator authorization
-> key stored only in Script Properties
-> isolated synthetic self-test
-> no Meeting/Pitchbook source body read
-> READY_FOR_SYNC

資料を同期して利用開始
-> explicit bounded OpenAI sync
-> ACTIVE only after safe source indexing
```

A stored key alone must not enable OpenAI or trigger source synchronization.

The key must never be returned, displayed after save, logged, audited, stored in Sheets, exported, or committed.

## Completion gates

OpenAI path must prove:

```text
DIRECT_BASE_MODEL: PASS
DIRECT_FILE_SEARCH: PASS
SYNTHETIC_SELF_TEST: PASS
MEETING_INDEX_QUERY_CITATION: PASS
PITCHBOOK_INDEX_QUERY_CITATION: PASS
METADATA_FILTER: PASS
UPDATE_REINDEX_NO_DUPLICATE: PASS
INACTIVE_EXCLUSION: PASS
REACTIVATE_RESTORE: PASS
DELETE_REBUILD: PASS
DISABLE_REENABLE: PASS
NO_PROVIDER_FAILOVER: PASS
FINAL_INTEGRITY: PASS
```

FULL_OUTPUT remains accepted and must not be rerun.

## Current Work classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_RUNTIME: NOT YET LIVE-QUALIFIED
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS
SCHEMA_ALIGNMENT: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES — OpenAI qualification/key prerequisite
```

## Boundaries

- no automatic OpenAI/Gemini failover;
- no confidential data in DEV qualification;
- no Gemini live retry in CODEX-17;
- no FULL_OUTPUT rerun;
- no second Web App/Library/public debug endpoint;
- no current-main integration until provider qualification closes;
- keep PR #26 Draft/Open/unmerged until final review.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-17`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
