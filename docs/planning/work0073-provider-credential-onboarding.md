# Work 0073 — Provider credential onboarding and four-source alignment

WORK_ID: 0073
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
ROUTE: C for implementation / Route A planning complete
DEPENDENCY: Work0072 core integrated; live-provider qualification remains blocked on `NO_AUTHORIZED_PROVIDER_CREDENTIAL`
DECISION: `docs/decisions/provider-credential-management.md`

## Primary Outcome

`管理者ページ > AI設定` を、APIキー・接続確認・利用開始・資料同期・モデル設定が混在する画面から、利用者が現在状態と次の操作を理解できる provider-neutral setup flow へ再構成する。

今回の実装範囲は次までとする。

```text
credential operator boundary
-> candidate credential validation
-> candidate-test-promote
-> provider-neutral status
-> 3-step setup UX
-> advanced model/sync progressive disclosure
-> Meeting / Pitchbook / News / Internal Assessment alignment
```

Google Secret Manager導入、company rollout、Work0072のlive-provider qualificationそのものは今回の実装範囲に含めない。

## Work Contract

### Fastest Safe Decisive Action

最初にserver-side credential boundaryとcandidate-test-promoteを実装し、既存の有効なcredentialを壊さない契約を固定する。その後にUIを新しい状態モデルへ接続し、最後に4-sourceのsync/reset/select契約を揃える。

UIから先に作り、現在の「保存してから確認する」server behaviorを温存しない。

### Required Scope

1. Credential Operator authorization
2. Script Properties credential backend abstraction
3. candidate-test-promote
4. provider-neutral status/readiness model
5. first-run / rotation / disable / removal UX
6. 3-step setup flow
7. model-policy and manual-sync progressive disclosure
8. four-source source selection / sync / reset-rebuild alignment
9. focused tests, browser behavior checks, bundle parity
10. exact-source documentation updates needed by this Work

### Non-Goals

- Google Secret Manager implementation
- Azure OpenAI / Work0030 implementation
- company production rollout
- confidential/company source data
- historical migration
- general app-wide user/admin role system
- automatic provider failover
- unrelated theme / deleted-record / analytics redesign
- provider-project migration that silently replaces an inaccessible operational Store
- a ChatGPT subscription vs OpenAI API billing explanatory notice in the UI

## Closed Conclusions

- Work ID remains `0073`; this is the same credential-onboarding outcome.
- Existing `管理者ページ` and `AI設定` entry point remain.
- Routine AI status remains visible under the accepted roleless app model.
- Raw credential create / replace / remove has a stronger server-side Credential Operator boundary.
- No shared password or new app-wide admin-role system is introduced.
- Current implementation uses Script Properties behind a credential abstraction.
- Candidate credentials are not persisted before validation succeeds.
- Failed rotation preserves the active credential and active provider state.
- Credential registration does not silently create or replace an operational provider Store.
- Model-policy editing and manual exact-source sync move behind `詳細設定` / `同期・診断`.
- Canonical source types are:
  - `Meeting` / 面談メモ
  - `Pitchbook` / 保存資料
  - `News` / ニュース
  - `Internal Assessment` / 評価（ICメモ、社内整理等）
- State-load failure is not rendered as `未設定`.
- Google Secret Manager is a later decision gate, not a hidden dependency of this Work.

## Current-State Problems to Remove

### Credential lifecycle

Current server behavior persists a supplied OpenAI/Gemini key before the complete validation flow succeeds. OpenAI connect can also create or replace a Vector Store while credential setup is still in progress.

This creates two unacceptable couplings:

```text
candidate credential -> active credential mutation before proof
credential setup -> operational search-resource mutation
```

Both must be removed.

### UI information architecture

Current `src/AiProviderSettingsPage.html` exposes, on one surface:

- permanent OpenAI/Gemini password inputs;
- connect/enable/disable actions;
- source-sync controls;
- exact internal-ID inputs;
- model-profile fields;
- thinking-profile raw text;
- provider state.

The redesign must make the primary task obvious without deleting advanced capabilities.

### Four-source drift

Work0072 expanded AI contracts to four source types, while the admin UI and some provider-admin paths still retain Meeting/Pitchbook-only selection or reset assumptions.

Work0073 closes this drift.

## Target UX

### Landing state

Each provider card shows only redacted operational state and the next useful action.

Minimum visible fields:

```text
資格情報
接続確認
4-source検索確認
検索データ
利用状態
最終確認
次の操作
```

Do not show raw key fragments, provider private resource IDs, secret references, provider account identifiers, or raw Store IDs.

If status loading fails, retain the provider card and show `状態を取得できませんでした` with retry. Do not fall back to `未設定`.

### Three-step setup flow

```text
Step 1  利用環境と接続先を確認
Step 2  APIキーを登録・確認
        -> connection verification
        -> synthetic four-source qualification
Step 3  利用開始
```

The UI may show internal subcheck progress, but provider-specific implementation details must not become six separate user decisions.

Step 2 must state only operationally useful effects such as external provider calls or temporary test-resource creation. Do not add a notice explaining ChatGPT subscription billing versus OpenAI API billing.

Step 3 enables the provider only after the accepted credential satisfies readiness. Production-source sync remains separate.

### Rotation

Normal provider cards use `APIキーを更新`; they do not keep an empty password field permanently visible.

Rotation contract:

```text
receive candidate
-> validate candidate in call-local scope
-> verify required readiness
-> compare-and-promote active credential
-> clear candidate input
```

On failure:

```text
active credential: unchanged
provider enabled state: unchanged
operational Store reference: unchanged
source sync metadata: unchanged
candidate persistence: none
```

### Disable and removal

`プロバイダを無効化` and `資格情報を削除` remain distinct.

- disable: stop provider use, preserve credential and operational resources;
- remove: allowed only through Credential Operator authorization and after provider is disabled;
- provider-side key revocation/deletion is not performed automatically.

## Server-Side Design

### 1. Credential Operator boundary

Add a dedicated authorization helper for secret mutation.

Expected contract:

```text
kspAuthorizeCredentialOperator_(environment)
```

It should reuse the existing installer/deployment-security identity model, but must not call an authorization helper that creates owner latches, bootstrap state, or other installation mutations as a side effect.

For an installed environment, authorization should fail closed unless the active identity is recognized by the existing authoritative installer/admin identity contract.

Routine provider status reads do not require this secret-mutation authorization.

### 2. Split routine provider actions from secret actions

Current `mutateAiProviderSettings` accepts raw API keys. After this Work:

- routine enable/disable/sync/model operations may remain on the provider-settings mutation path;
- raw credential register/rotate/remove moves to a dedicated server facade;
- routine mutation code rejects raw credential fields rather than silently accepting them.

Suggested public facade:

```text
mutateAiProviderCredential(input)
```

Allowed actions should be a closed vocabulary, for example:

```text
REGISTER_OR_ROTATE
REMOVE
```

Server authorization is mandatory even if the browser hides or disables controls.

### 3. Credential backend abstraction

Application/provider clients must obtain the active key through a server-side credential interface rather than reaching directly into Script Properties throughout the codebase.

Phase A backend:

```text
SCRIPT_PROPERTIES
```

Required capabilities:

```text
getActive(provider)
isConfigured(provider)
promote(provider, candidate, expectedGeneration)
remove(provider, expectedGeneration)
```

Use a generation/CAS-style guard or equivalent serialized contract so two concurrent rotations cannot cause an older request to overwrite a newer accepted key.

Do not put raw credential values, prefixes, private provider IDs, or secret references into Backend Settings, Audit, browser responses, logs, GitHub, localStorage, or sessionStorage.

### 4. Candidate credential scope

Candidate credentials stay call-local until validation succeeds.

Implement a candidate-bound provider environment/client mechanism so OpenAI/Gemini test calls can use the candidate without replacing the active Script Property.

The implementation may use a closure-bound environment wrapper or explicit credential override parameter. The invariant matters more than the exact helper name:

```text
candidate never becomes the default active credential during validation
```

No raw candidate value may be attached to returned error objects.

### 5. Connection verification vs qualification

Keep these concepts separate.

Connection verification checks that the credential can authenticate and reach the required provider capability without mutating the operational Store.

Synthetic four-source qualification verifies provider retrieval/citation behavior using bounded temporary resources and four synthetic records corresponding to the canonical source types.

Required source coverage:

```text
Meeting
Pitchbook
News
Internal Assessment
```

Temporary qualification resources must be cleaned up on success and bounded failure paths.

A qualification failure does not promote the candidate.

### 6. Existing operational Store during rotation

If an active provider already has an operational Store, a candidate rotation must not silently replace that Store.

Before promotion, verify the candidate satisfies the existing operational-resource access contract where required.

If the candidate cannot access the existing operational Store:

- do not promote it;
- preserve the current key and provider state;
- return a safe actionable state such as `REVERIFY_REQUIRED` / Store access mismatch;
- do not auto-create a replacement operational Store inside credential rotation.

Any future cross-project/store migration is a separate explicit workflow.

### 7. Provider enablement

Operational Store creation or reuse belongs to the explicit `利用開始` action after credential validation and synthetic qualification.

Enablement may create a missing operational Store if that is the existing provider architecture, but this effect must be explicit to the operation and not happen during raw credential save.

## Provider-Neutral State Model

Canonical main states:

```text
UNCONFIGURED
CREDENTIAL_PRESENT
CONNECTION_VERIFIED
FOUR_SOURCE_QUALIFIED
ENABLED
REVERIFY_REQUIRED
ERROR
```

UI-only fetch state:

```text
STATUS_UNKNOWN
```

Do not persist `STATUS_UNKNOWN` as provider readiness. It represents failure to load the current status.

Keep source-sync state separate from credential readiness, for example:

```text
EMPTY
PARTIAL
READY
SYNC_ERROR
```

This prevents `APIキー設定済み` from being treated as synonymous with `資料検索準備完了`.

## Advanced Configuration

### Model policy

Move raw model-profile fields behind `詳細設定`.

Primary setup uses the approved provider default profile.

Normal first-run flow must not require the user to understand or edit:

- Profile ID
- family
- raw thinking values
- output ceiling
- internal qualification fields

Existing expert controls may remain when needed, but they are not part of the primary onboarding path.

### Manual source sync

Move manual exact-source operations to `同期・診断`.

The user should select a source by human-readable context; the stable internal ID may be shown secondarily for diagnosis but should not be the only input affordance.

The selector must support all four canonical categories and resolve to the stable source identity expected by provider-neutral sync.

## Four-Source Alignment

### Source selection

All admin/provider selection helpers must accept the canonical source types from `KSP_AI_SOURCE_TYPES`.

Review and repair any path that passes only `meetingRows` and `pitchbookRows` when the provider-neutral contract expects four-source context.

### Reset/rebuild

Any helper that clears provider-derived source state because a Store/resource changes must cover all four source types.

No derived provider state for News or Internal Assessment may remain attached to an obsolete Store while Meeting/Pitchbook are reset.

### Sync summary

The advanced sync UI must report selected/indexed/unchanged/metadata-refreshed/removed/failed counts using the provider-neutral result, and must not imply full completion when a batch is partial.

### Human-readable exact selection

For an exact sync, expose enough context to distinguish records, such as source type, date, counterparty/title, and stable ID. Do not require the user to memorize `Meeting ID / Document ID` syntax.

## UX Knowledge Applied

Project Source: `GOOGLE-WEB-UX-KB` v1.0, verified 2026-09-25.

Selected rules:

- `UX-FORM-003`: meaningful-time validation + server-side validation
- `UX-FORM-004`: field/reason/correction-path errors
- `UX-FORM-005`: explicit pending/success/error state
- `UX-FORM-007`: do not persist secrets casually in browser state
- `UX-CLS-002` / `UX-CLS-005`: stable async/error regions
- `UX-NAV-005`: distinguish stale/unknown/error state
- `UX-A11Y-002` / `UX-A11Y-003`: keyboard/focus stability
- `UX-QA-002`: test the full user flow, not only first render
- `UX-QA-005`: separate implementation from executed evidence
- `UX-QA-006`: status/source counts must remain semantically correct

Apply the selected rules only where they change this Work's outcome. Do not broaden Work0073 into a general accessibility/performance rewrite.

## Expected Production Files

Likely production-source impact:

- `src/160_AiEnvironment.gs`
- `src/161_GeminiRestClient.gs`
- `src/163_OpenAiRestClient.gs`
- `src/164_AiProviderCore.gs` only if required by candidate credential injection / four-source provider contracts
- `src/165_AiProviderAdmin.gs`
- `src/170_AiEntryPoints.gs`
- `src/AiProviderSettingsPage.html`
- `src/ClientAiProviderSettings.html`
- `src/Styles.html` only for scoped setup/advanced-panel states
- generated `dist/KnowledgeShare.bundle.gs`

Do not hand-edit the generated bundle.

The exact diff may be smaller if existing abstractions can be reused.

## Test Plan

### Focused logic tests

Extend existing tests rather than duplicating provider contracts.

Primary targets:

- `tests/ai-provider-admin.test.cjs`
- `tests/ai-provider-core.test.cjs`
- `tests/ai-model-policy.test.cjs` only if advanced-model behavior changes
- `tests/ai-sync.test.cjs`
- `tests/work0072-ai-core.test.cjs` for four-source regression coverage

Add a Work0073-specific browser/UI test if the existing harness cannot express the new flow cleanly.

Required logic evidence:

1. invalid candidate -> active key unchanged;
2. failed synthetic qualification -> active key unchanged;
3. successful candidate -> promoted once;
4. concurrent/stale promote -> older candidate cannot overwrite newer accepted state;
5. routine provider mutation with raw key -> rejected;
6. unauthorized credential mutation -> rejected server-side;
7. status response -> no raw key/private secret data;
8. status load failure -> UI shows unknown/error, not unconfigured;
9. no localStorage/sessionStorage credential persistence;
10. model/manual-sync advanced controls are hidden from the primary setup path;
11. all four source types are selectable and routed to provider-neutral sync;
12. Store reset/rebuild helper covers all four source types;
13. partial sync summary does not render as complete;
14. provider disable preserves credential/resource;
15. credential remove requires disabled provider + Credential Operator;
16. primary UI contains no ChatGPT-subscription-vs-OpenAI-API-billing explanatory notice.

### Browser behavior

Exercise at least:

```text
UNCONFIGURED -> setup start
candidate invalid -> correction -> retry
candidate valid -> qualification -> ready
ready -> enable
enabled -> disable -> re-enable
enabled -> rotate failure -> old state preserved
enabled -> rotate success
status fetch failure -> retry
advanced settings open/close
four-source manual sync selection
```

Check keyboard order, focus return, busy states, and stable action positions.

### Deterministic repository checks

Run the repository-selected Tier 2 checks, including:

```text
targeted Work0073 tests
npm run check
git diff --check
python tools/validate_agent_foundation.py
```

Do not add broader checks unless a concrete dependency or failure requires them.

## Target-Runtime Qualification

Runtime-dependent claims require Apps Script target-runtime evidence with isolated synthetic data.

Credential/provider calls are allowed only when a dedicated, explicitly authorized qualification credential exists for that environment.

Without such a credential:

- implement and merge only what the selected delivery policy permits;
- report live-provider qualification as not executed;
- do not substitute a generic personal/ambiguous key;
- do not mark provider live qualification PASS.

When a dedicated credential is available, use bounded provider calls and synthetic resources only. No company/confidential source data.

## Side-Effect Budget

During logic/browser validation:

```text
REAL_PROVIDER_CALLS: 0
CONFIDENTIAL_DATA: 0
PRODUCTION_SOURCE_SYNC: 0
PROVIDER_KEY_REVOCATION: 0
PERMISSION_BROADENING: 0
SECRET_MANAGER_CHANGE: 0
```

During an explicitly authorized target-runtime provider qualification:

- one candidate campaign per provider is the default budget;
- temporary resources must be named as synthetic/test resources;
- cleanup is part of the same campaign;
- do not repeat the same failure class without a Strategy Reset.

## Strategy Reset Conditions

Reset before continuing if any of the following occurs:

- candidate validation requires persisting the plaintext candidate between calls;
- the only available implementation would replace the operational Store during credential save;
- Credential Operator identity cannot be enforced server-side with the existing deployment/installer identity contract;
- four-source provider-neutral selection requires a material architecture change not captured by Work0072;
- two bounded provider attempts fail with the same external failure class;
- implementation would require Secret Manager / Cloud-project / OAuth-scope changes to satisfy Phase A.

On Reset, preserve accepted Work0072 evidence and this Work's Closed Conclusions; separate BLOCKER from follow-up.

## Acceptance Evidence

Work0073 implementation is acceptable when all of the following are true:

### Credential safety

- candidate-test-promote is proven;
- failed rotation preserves active credential/provider/store/source state;
- raw credentials never return to browser/status/log/Audit;
- routine users cannot invoke credential create/replace/remove without Credential Operator authorization;
- concurrent stale promotion is rejected or serialized safely.

### UX

- primary setup is the three-step flow;
- permanent empty API-key fields are removed from normal provider cards;
- status unknown/error/unconfigured are visibly distinct;
- exact next action is visible for each main state;
- model policy and manual sync are progressive-disclosure advanced operations;
- failed operations retain a correction/retry path;
- no ChatGPT-subscription-vs-OpenAI-API-billing explanatory notice is added.

### Four-source correctness

- Meeting/Pitchbook/News/Internal Assessment are all available in advanced source operations;
- exact selection resolves to the stable canonical source identity;
- reset/rebuild behavior covers all four source types;
- sync summary is provider-neutral and partial-safe;
- Work0072 four-source Knowledge Search contracts remain unchanged outside the required admin/provider integration points.

### Regression boundary

- existing record capture, search, full output, theme, deleted-record management and other unrelated admin functions remain unchanged;
- no schema9 sheet change;
- no historical migration;
- no provider failover added.

## Implementation Routing

Next implementation should use Route C because it crosses server authorization, secret lifecycle, provider clients, UI state, sync contracts and target-runtime behavior.

Recommended model: GPT-5.6 Sol High. Reason: security-sensitive cross-module refactor with provider-specific state machines and four-source regression risk.

When implementation is authorized, create `0073-CODEX-01`, update `docs/handoffs/0073-dispatches.md`, and give Codex only this Work-specific outcome/scope/evidence contract plus `AGENTS.mdを確認して従う`.

## Completion Latch

After the selected validation tier passes and the final diff is reviewed once:

- record any live-provider qualification that was not executed as a bounded limitation;
- route Secret Manager/company rollout to follow-up;
- resume Work0072 live-provider qualification under a new Work0072 Dispatch if a dedicated qualification credential is available;
- apply Completion Latch and do not reopen the credential UX without material contradictory evidence.
