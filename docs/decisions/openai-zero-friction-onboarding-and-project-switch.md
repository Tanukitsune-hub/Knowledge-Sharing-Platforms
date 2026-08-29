# OpenAI zero-friction onboarding and project-switch contract

Current as of: 2026-08-29

Status: Accepted for Work 0020 implementation after the active Gemini dispatch returns

## Decision

OpenAI activation must be operable by a non-specialist from the existing private Web App.

Normal administrator steps are limited to:

```text
1. Paste an OpenAI project API key
2. Press 「APIキーを保存して接続確認」
3. Press 「資料を同期して利用開始」
```

The normal path must not require the operator to know or enter a Project ID, Vector Store ID, model ID, File ID, API endpoint, metadata field, Apps Script property name, or Backend setting.

## Key entry

The private administrator page may accept the API key in a password field and send it once to a server-side administrator-authorized mutation.

The server writes it only to Script Properties. The key is never returned, displayed, logged, audited, exported, stored in Sheets, or committed to GitHub. The browser clears the field after submit and subsequently shows only `設定済み / 未設定`.

Direct Script Properties entry remains a fallback only when a company security policy explicitly prohibits credential entry through the Web App.

## Connection before data

Saving a key must not immediately index Meeting or Pitchbook data.

`APIキーを保存して接続確認` performs an isolated synthetic test:

```text
credential/model validation
-> create or reuse one Vector Store
-> upload one tiny in-memory synthetic text file
-> wait for indexing
-> query with Responses API File Search and an exact synthetic filter
-> require a citation
-> remove the synthetic vector-store attachment and uploaded File
-> mark connection ready
```

The test reads no Drive source body and calls no other provider.

Real-source indexing begins only after `資料を同期して利用開始`.

## Provider resource ownership

OpenAI files and vector stores are Project-scoped and cannot be moved between Projects. Personal development and company production therefore use separate OpenAI Projects/keys and separate Vector Stores.

The operator never manages those Store IDs manually.

When the current key can access the configured Store, reuse it. When the Store is inaccessible under a replaced/different-Project key, the application must:

1. keep OpenAI disabled during transition;
2. create one Store with the current key;
3. run the synthetic self-test;
4. switch the local Store reference only after PASS;
5. reset only OpenAI-derived source state to `NotIndexed`;
6. preserve Gemini state and authoritative Meeting/Pitchbook data;
7. show `OpenAIの接続先が変わりました。資料を再同期してください。`.

Do not claim deletion of an old Store that the current key cannot access.

## Model selection

No user-facing model selector.

The product owns an ordered allowlist of approved File Search-capable models and applies a cost policy. Preserve a valid configured model; otherwise select the current approved cost-balanced default. Never silently move to a materially more expensive tier outside policy.

## Readiness state

Connection readiness and user-route enablement are separate.

```text
UNCONFIGURED
TESTING
READY_FOR_SYNC
ACTIVE
DISABLED
ERROR
RECONNECT_REQUIRED
```

A stored API key alone never sets `OPENAI_ENABLED=true`.

Synthetic test PASS produces `READY_FOR_SYNC`. The bounded provider-neutral source sync is then started explicitly. OpenAI becomes available to normal users only after the first safe source batch succeeds.

## Synchronization UX

The administrator sees safe counts and one action, not provider internals:

```text
Meeting: 同期済み / 対象
Pitchbook: 同期済み / 対象
失敗: 件数

[ 資料を同期して利用開始 ]
```

If more bounded batches remain, the same button becomes `同期を続ける`. No retry counter, source ID, document ID, or Backend editing is presented to the operator.

## Disable and replacement

`無効化` stops future OpenAI query/index calls without changing authoritative sources and preserves the current Store by default.

Replacing a key reruns the full isolated connection test. A failed replacement leaves OpenAI disabled and does not begin real-source synchronization.

Advanced destructive cleanup is hidden, explicitly confirmed, and limited to provider-derived resources accessible through the current key.

## Personal DEV and company sequence

Work 0020 will first live-qualify OpenAI with a dedicated personal development Project/key and synthetic/non-confidential Meeting/Pitchbook sources.

Company deployment then uses the same code and same two-button flow with a company-approved Project/key. No new coding is required merely to change from personal to company credentials.

Company production qualification remains separately required for Shared Drive permissions, intended users, approved data scope, billing/project controls, and the production Web App; those checks must be presented as an operator checklist rather than provider-infrastructure work.

## Acceptance evidence

Before Work 0020 closes, prove:

- server-side administrator authorization for every credential/provider mutation;
- no credential/private provider ID exposure;
- invalid key fails closed before Store or source sync;
- one Store is created when absent and reused on repetition;
- a different-Project/inaccessible Store causes safe replacement and OpenAI-only state reset;
- synthetic upload/index/exact-filter query/citation/cleanup PASS;
- synthetic test reads no Meeting/Pitchbook body;
- real Meeting and Pitchbook File Search lifecycle PASS in personal DEV;
- no Gemini fallback;
- disabling/re-enabling is reversible;
- company-key replacement path is deterministically covered;
- final integrity PASS.

## Non-goals

- creating an OpenAI Project or API key from the Web App;
- displaying or retrieving a stored key;
- moving Files or Vector Stores across OpenAI Projects;
- user-facing model/Store selection;
- automatic cross-provider fallback;
- recurring synchronization triggers in Work 0020;
- bypassing company approval, budget, or data-governance controls.

Detailed implementation plan:

`docs/planning/work0020-openai-zero-friction-onboarding.md`
