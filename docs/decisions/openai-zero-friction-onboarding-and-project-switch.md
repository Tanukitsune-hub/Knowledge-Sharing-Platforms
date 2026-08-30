# OpenAI zero-friction onboarding and project-switch contract

Current as of: 2026-08-29
Status: ACCEPTED / ACTIVE FOR WORK 0020 RECOVERY

## Decision

Work 0020 will stop spending the active completion path on Gemini provider diagnosis and will qualify OpenAI File Search as the primary usable Knowledge Search provider in personal DEV.

Gemini evidence remains preserved, but Gemini is not a prerequisite for Work 0020 completion if OpenAI satisfies the same end-to-end user outcome. There is no automatic cross-provider failover.

Normal OpenAI stack:

```text
Responses API
+ File Search
+ one project-scoped Vector Store
+ gpt-5.6-terra
+ server-side API key
+ metadata/attribute filters
+ authoritative file citations
```

OpenAI current official models support File Search through the Responses API. `gpt-5.6-terra` is the product-owned cost-balanced default for this Work. Later user-facing reasoning selection is a separate follow-up.

## Operator experience

OpenAI activation must be operable by a non-specialist from the existing private administrator Web App.

Normal administrator steps are limited to:

```text
1. Paste an OpenAI project API key
2. Press 「APIキーを保存して接続確認」
3. Press 「資料を同期して利用開始」
```

The normal path must not require Project ID, Vector Store ID, model ID, File ID, API endpoint, Settings-sheet editing, Script Properties editing, or code changes.

## Credential contract

The private administrator page may accept the key once in a password field and send it only to an administrator-authorized server mutation.

The server stores it only in Script Properties. The key is never returned, displayed, logged, audited, exported, stored in Sheets, or committed. The browser clears the field after submit and subsequently shows only `設定済み / 未設定`.

## Connection before data

Saving a key does not enable real-source indexing.

`APIキーを保存して接続確認` performs an isolated synthetic test:

```text
credential/model validation
-> create or safely reuse one Vector Store
-> upload one tiny synthetic text file
-> wait for indexing
-> Responses API File Search with exact attributes filter
-> require grounded answer + citation
-> remove synthetic attachment and uploaded File
-> mark READY_FOR_SYNC
```

The connection test reads no Meeting/Pitchbook body and calls no other provider.

Real-source synchronization begins only after explicit `資料を同期して利用開始`.

## Provider resources

OpenAI Files and Vector Stores are project-scoped. Personal DEV and company production use separate approved Projects/keys and therefore separate derived OpenAI resources.

A configured Store is reused only when the current key can read it. If a replacement/different-project key cannot access it, OpenAI stays disabled, one new Store is created, the synthetic test must pass, only OpenAI-derived local source state is reset, and authoritative/Gemini state is preserved.

## Query contract

Use the Responses API with `store=false` and the built-in `file_search` tool. The request must use the current configured Vector Store and safe attribute filters derived from existing source metadata.

Default model: `gpt-5.6-terra`.

Default reasoning: low-latency grounded retrieval profile. Do not silently switch to a materially more expensive model tier. Future `自動 / 高速 / 標準 / 深掘り` reasoning selection is a later Work.

## Readiness

Connection readiness and user-route enablement are separate:

```text
UNCONFIGURED
TESTING
READY_FOR_SYNC
ACTIVE
DISABLED
ERROR
RECONNECT_REQUIRED
```

A stored key alone never sets `OPENAI_ENABLED=true`.

Synthetic self-test PASS yields `READY_FOR_SYNC`. The provider-neutral bounded source sync is then started explicitly. OpenAI becomes available to users only after safe source indexing and one grounded Meeting + one grounded Pitchbook query pass.

## Acceptance evidence

Before Work 0020 closes on the OpenAI path, prove:

- direct provider synthetic base-model and File Search controls PASS outside Apps Script;
- admin authorization around credential/provider mutation;
- no key/private provider-ID exposure;
- invalid key fails closed before Store/source mutation;
- one Store is created when absent and reused on repeat;
- synthetic upload/index/exact-filter query/citation/cleanup PASS;
- synthetic test reads no Meeting/Pitchbook body;
- one bounded non-confidential/synthetic Meeting and Pitchbook index/query/citation PASS;
- exact metadata filters PASS;
- update/reindex without duplicate PASS;
- Inactive removal/exclusion PASS;
- Reactivate restoration PASS;
- delete/rebuild PASS;
- no Gemini fallback or OpenAI->Gemini failover;
- disabling/re-enabling is reversible;
- final Backend/provider/Audit/settings/trigger/deployment integrity PASS.

## Gemini disposition

The existing Gemini work is preserved as accepted diagnostic and application-lifecycle evidence, but current Google AI Studio/API instability and the unresolved File Search provider path are moved out of the active Work 0020 completion path once OpenAI qualifies.

Do not delete the Gemini implementation or Store merely to complete this Work. Keep Gemini disabled/not user-ready until a later provider-recovery Work requalifies it.

## Non-goals

- creating OpenAI Projects from the Web App;
- exposing stored API keys;
- automatic provider fallback;
- recurring synchronization triggers;
- migrating or deleting inaccessible old-provider resources;
- merging the currently unqualified Gemini Generate Content transport as a user-ready default.
