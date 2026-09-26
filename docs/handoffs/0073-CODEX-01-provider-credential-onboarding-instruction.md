# Work 0073 CODEX-01 — Provider credential onboarding and four-source alignment

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
USER_NATIVE_ACTION_BUDGET: 0
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO

## Goal

Work0073の確定済み計画をproduction sourceへ実装し、`管理者ページ > AI設定` を次の一貫したprovider-neutral flowへ変更する。

```text
credential operator boundary
-> candidate credential validation
-> candidate-test-promote
-> provider-neutral status
-> 3-step setup UX
-> advanced model/sync progressive disclosure
-> Meeting / Pitchbook / News / Internal Assessment alignment
```

今回のDispatchでは実装とdeterministic/browser validationまでを完了する。

live OpenAI/Gemini qualification、company rollout、Google Secret Manager、Azure OpenAIは実施しない。

## Read First

1. nearest `AGENTS.md`
2. `docs/planning/work0073-provider-credential-onboarding.md`
3. `docs/decisions/provider-credential-management.md`
4. `docs/handoffs/0073-dispatches.md`
5. `docs/handoffs/0072-CODEX-01-four-source-knowledge-core-report.md`
6. `docs/handoffs/0072-CODEX-02-source-scope-limit-repair-report.md`
7. `docs/decisions/target-runtime-first-development.md`
8. current provider/admin/environment/UI source and directly coupled tests

恒久ルールは`AGENTS.md`等に従い、このinstructionへコピーし直さない。

## Baseline / Closed Conclusions

Do not reopen without material contradiction:

```text
WORK0070_RECORD_LAYER: ACCEPTED
WORK0071_UX: ACCEPTED
WORK0072_CORE: INTEGRATED
BASE_RELEASE: 0.2.3
SCHEMA: 9
BACKEND_SHEETS: exactly 7
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
APPS_SCRIPT_DEPLOYMENT_MUTATION_BUDGET: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_BUDGET: 0
SECRET_MANAGER_CHANGE: 0
```

Preserve:

- existing `管理者ページ` and `AI設定` entry point
- roleless routine admin/status model
- no shared-password gate
- schema9 / exactly seven Backend sheets
- Meeting / Pitchbook / News / Internal Assessment canonical source contracts from Work0072
- Work0071 async layout/focus/recovery behavior
- no provider failover
- no company production route change
- Work0030 remains separate

## Required Scope

### A. Credential Operator boundary

Raw API credential create / replace / remove must have a stronger server-side authorization boundary than routine provider status.

Implement a dedicated authorization helper that reuses the accepted installer/deployment-security identity model without accidentally creating installer owner/bootstrap/deployment state as a side effect.

The exact helper name may differ, but the contract is:

```text
status read: allowed under existing authorized Web App surface
secret mutation: fail closed unless Credential Operator authorization passes
```

Do not create a new app-wide admin-role system.

Do not reintroduce a shared admin password.

### B. Separate secret mutation from routine provider mutation

Current `mutateAiProviderSettings` accepts API keys. Remove that coupling.

After this Work:

- routine enable/disable/sync/model actions may remain on provider-settings mutation path;
- raw credential register/rotate/remove uses a dedicated browser-callable facade;
- routine mutation rejects raw credential fields;
- browser controls alone are never treated as authorization.

Suggested facade:

`mutateAiProviderCredential(input)`

Use a closed action vocabulary such as:

```text
REGISTER_OR_ROTATE
REMOVE
```

### C. Script Properties credential backend abstraction

Keep Script Properties as Work0073 Phase A backend, but put it behind one server-side credential interface.

Required capabilities, exact names flexible:

```text
getActive(provider)
isConfigured(provider)
promote(provider, candidate, expectedGeneration)
remove(provider, expectedGeneration)
```

Use a serialized/CAS-style generation guard or equivalent so a stale concurrent rotation cannot overwrite a newer accepted credential.

No raw credential, fragment, prefix, provider private project ID, secret reference or Store ID may be returned in normal status, browser payloads, logs, Audit or GitHub.

### D. candidate-test-promote

Do not persist a candidate key before validation succeeds.

Required invariant:

```text
receive candidate
-> keep candidate call-local
-> run bounded candidate-bound verification/qualification
-> success: promote once
-> failure: active credential and operational state remain unchanged
```

Implement a candidate-bound provider environment/client path so verification uses the candidate without replacing the active Script Property.

On candidate failure preserve:

- active credential
- provider enabled/disabled state
- operational Store identity
- source sync/provider metadata
- existing model/readiness state unless the failure proves the active state itself invalid

Do not leak candidate values into returned errors.

### E. Credential lifecycle vs operational Store lifecycle

Credential registration/rotation must not silently create or replace an operational Vector Store / File Search Store.

Connection verification must be non-destructive to the operational Store.

Synthetic qualification may use bounded temporary resources through the existing provider abstractions, but CODEX-01 exercises this with deterministic fakes only.

Operational Store creation/reuse belongs to explicit `利用開始`.

If a replacement candidate cannot access an existing operational Store under the required provider contract:

- do not promote the candidate;
- preserve current key/state;
- return a safe actionable readiness/error state;
- do not auto-create a replacement Store in credential rotation.

### F. Provider-neutral state model

Normalize user-facing readiness around:

```text
UNCONFIGURED
CREDENTIAL_PRESENT
CONNECTION_VERIFIED
FOUR_SOURCE_QUALIFIED
ENABLED
REVERIFY_REQUIRED
ERROR
```

For status fetch failure use a client/UI-only state:

`STATUS_UNKNOWN`

Do not persist `STATUS_UNKNOWN` as provider readiness.

Do not render a status-fetch failure as `未設定`.

Keep credential readiness separate from source-sync state.

### G. Three-step primary setup UX

Replace the current permanent key fields / mixed controls with:

```text
Step 1  利用環境と接続先を確認
Step 2  APIキーを登録・確認
        -> connection verification
        -> synthetic four-source qualification
Step 3  利用開始
```

Internal checks may have sub-status, but do not force the user through provider-specific six-step flows.

Normal provider card should show redacted state plus the next useful action.

Minimum state information:

```text
資格情報
接続確認
4-source検索確認
検索データ
利用状態
最終確認
次の操作
```

Remove permanently visible empty API-key fields from normal provider cards.

For rotation, expose `APIキーを更新` only when needed.

Do not add an explanatory notice about ChatGPT subscription billing versus OpenAI API billing.

### H. Disable / remove / rotation UX

Keep these concepts distinct:

- `プロバイダを無効化`
- `APIキーを更新`
- `資格情報を削除`

Disable preserves credential and operational resources.

Credential removal:

- requires Credential Operator;
- requires provider disabled state;
- removes only this app's configured credential;
- does not revoke/delete the provider-side key automatically.

Failed rotation must say, in user-facing terms, that the current connection was not changed.

Clear raw candidate input after terminal success/failure.

Do not persist raw key in `localStorage` or `sessionStorage`.

### I. Progressive disclosure

Move model-policy editing behind `詳細設定`.

The primary onboarding path must not require editing:

- Profile ID
- family
- raw thinking profile syntax
- output ceiling
- internal qualification state

Move manual exact-source sync behind `同期・診断`.

Do not remove current expert capabilities unless they conflict with the new safe lifecycle.

### J. Four-source admin/provider alignment

Canonical source types remain exactly:

```text
Meeting
Pitchbook
News
Internal Assessment
```

Labels:

```text
Meeting              -> 面談メモ
Pitchbook            -> 保存資料
News                 -> ニュース
Internal Assessment  -> 評価（ICメモ、社内整理等）
```

Repair admin/provider paths that still assume Meeting/Pitchbook only.

At minimum:

- manual source selection supports all four;
- exact-source resolution accepts all four canonical identities;
- reset/rebuild behavior covers all four source types;
- provider-neutral sync summary remains partial-safe;
- News/Assessment provider-derived state cannot remain attached to an obsolete Store while Meeting/Pitchbook are reset.

Do not create duplicate provider documents per Counterparty.

### K. Human-readable exact source selection

Do not require the user to memorize `Meeting ID / Document ID`.

Exact sync selection must expose human-readable context sufficient to identify the record, using existing authoritative data such as:

- source type
- date
- counterparty/title
- stable source ID as secondary diagnostic identity

Keep the stable source ID in the server contract.

## UX Rules

Use the project `GOOGLE-WEB-UX-KB` only for rules that affect this Work.

Required applicable rules:

- `UX-FORM-003`
- `UX-FORM-004`
- `UX-FORM-005`
- `UX-FORM-007`
- `UX-CLS-002`
- `UX-CLS-005`
- `UX-NAV-005`
- `UX-A11Y-002`
- `UX-A11Y-003`
- `UX-QA-002`
- `UX-QA-005`
- `UX-QA-006`

Do not broaden this into a general performance/accessibility refactor.

## Expected Source Areas

Likely, not mandatory:

- `src/160_AiEnvironment.gs`
- `src/161_GeminiRestClient.gs`
- `src/163_OpenAiRestClient.gs`
- `src/164_AiProviderCore.gs`
- `src/165_AiProviderAdmin.gs`
- `src/170_AiEntryPoints.gs`
- `src/AiProviderSettingsPage.html`
- `src/ClientAiProviderSettings.html`
- `src/Styles.html`
- focused tests
- generated distribution

Keep `src/` authoritative.

Do not hand-edit `dist/KnowledgeShare.bundle.gs`.

Do not refactor unrelated provider/search code merely to match this file list.

## Authorization / Side Effects

Allowed in CODEX-01:

- repository source/tests/docs
- local/synthetic test doubles
- fake provider adapters/responses
- local browser harness
- deterministic bundle/package generation
- branch / Draft PR / report

Not authorized in CODEX-01:

- live OpenAI/Gemini calls
- real provider index/store mutation
- API key creation/rotation against a real provider
- asking the user to paste a key into Codex
- company/confidential data
- company Apps Script/Drive/Sheets mutation
- Apps Script source sync/version/deployment update
- permission/access changes
- Google Secret Manager changes
- Azure OpenAI work
- provider-side key revocation/deletion
- historical migration
- company rollout
- schema change
- user-native action

```text
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
APPS_SCRIPT_DEPLOYMENT_MUTATION_BUDGET: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_BUDGET: 0
```

If live provider evidence or a secret becomes necessary, stop and return to ChatGPT. Do not ask the user directly from Codex.

## Execution Strategy

Before editing, read the required sources and create a compact implementation map in working notes only.

Implement in this order unless repository evidence requires a justified adjustment:

1. Credential Operator authorization contract
2. credential backend + generation/CAS contract
3. candidate-bound provider verification path
4. candidate-test-promote / remove server facade
5. provider-neutral readiness/status response
6. 3-step primary UI + rotation/disable/removal
7. model/sync progressive disclosure
8. four-source selection/reset/sync alignment
9. focused tests/browser checks
10. generated distribution
11. canonical Tier 2 validation
12. final diff review and report

Do not start a second architecture path in parallel.

## Required Validation

Focused first.

### Credential safety tests

At minimum:

1. invalid candidate -> active key unchanged;
2. candidate qualification failure -> active key unchanged;
3. successful candidate -> promoted exactly once;
4. stale/concurrent promotion -> older candidate cannot overwrite newer accepted state;
5. routine provider mutation with raw key -> rejected;
6. unauthorized credential mutation -> rejected server-side;
7. status response contains no raw key/private secret material;
8. remove requires disabled provider + Credential Operator;
9. disable preserves active credential/resource;
10. raw candidate is cleared from UI after terminal operation.

### Provider/resource lifecycle tests

- candidate connect path does not create/replace operational Store;
- inaccessible existing Store during candidate validation does not auto-replace Store;
- enablement owns operational Store create/reuse;
- failed rotation does not change source provider state.

### State/UI tests

- `UNCONFIGURED` -> setup start;
- status fetch failure -> `STATUS_UNKNOWN`, not unconfigured;
- invalid candidate -> correction/retry;
- valid candidate fake qualification -> ready;
- ready -> enable;
- enabled -> disable -> re-enable;
- enabled -> failed rotation preserves old state;
- advanced sections open/close;
- no permanent empty key field on normal provider cards;
- no billing-difference notice described above;
- no raw key persisted in localStorage/sessionStorage;
- busy/error/success regions preserve action location/focus contract.

### Four-source tests

All four:

- Meeting
- Pitchbook
- News
- Internal Assessment

Validate:

- source selector support;
- exact resolution;
- provider-neutral sync routing;
- reset/rebuild coverage;
- News/Assessment are not omitted;
- partial sync summary is not reported as complete;
- one source stays one source under multi-Counterparty membership.

### Browser

Changed surface at minimum:

- representative desktop
- 390px
- keyboard-only setup flow
- focus visibility/return
- advanced disclosure
- error/retry
- status unknown
- four-source source selector
- horizontal overflow 0
- material console/page errors 0

Do not repeat unrelated 7-page viewport matrices without a concrete regression signal.

### Canonical Tier 2

After focused validation:

```text
npm run check
git diff --check
python tools/validate_agent_foundation.py
```

Run canonical checks once after material source completion; rerun only after a material subsequent fix.

Regenerate and validate bundle/package if production source changes.

## Target Runtime

CODEX-01 does not deploy merely to prove this logic.

Report:

`TARGET_RUNTIME_QUALIFICATION: NOT RUN (live credential/provider qualification remains gated)`

Do not report it as PASS.

Work0072 live-provider qualification may resume only after ChatGPT accepts this implementation and a dedicated qualification credential is available under the new safe flow.

## Execution Budget / Strategy Reset

- one coherent implementation strategy
- speculative repairs for same failure class: max 2
- provider calls: 0
- deployment mutations: 0
- user-native actions: 0
- canonical full check: once after focused checks
- no Secret Manager exploration beyond what is necessary to preserve the abstraction boundary

Strategy Reset and return if:

- candidate validation cannot be implemented without persisting plaintext candidate state between calls;
- secret mutation cannot be server-authorized with the accepted installer/deployment identity contract without introducing a new role system;
- credential rotation requires replacing the operational Store;
- four-source admin alignment requires a schema change or new persistence model;
- same material failure class remains after 2 distinct fixes;
- implementation would require Secret Manager / Cloud-project / OAuth-scope changes;
- provider calls or real credentials become necessary for logic correctness.

Do not silently broaden scope.

## Branch / PR / Delivery

Branch:

`work/0073-provider-credential-onboarding`

Open one Draft PR against `main`.

Create report:

`docs/handoffs/0073-CODEX-01-provider-credential-onboarding-report.md`

Update branch copy:

`docs/handoffs/0073-dispatches.md`

Do not mark Work0073 ACCEPTED and do not apply Completion Latch.

ChatGPT owns final diff/evidence review, merge decision, target-runtime follow-up and final acceptance.

## Required Report Fields

```text
CREDENTIAL_OPERATOR_AUTH
ROUTINE_SECRET_MUTATION_REJECTED
CREDENTIAL_BACKEND
CREDENTIAL_GENERATION_GUARD
CANDIDATE_CALL_LOCAL
CANDIDATE_TEST_PROMOTE
FAILED_ROTATION_PRESERVATION
CONCURRENT_ROTATION_GUARD
RAW_SECRET_BROWSER_RESPONSE
RAW_SECRET_LOG_AUDIT
OPERATIONAL_STORE_MUTATION_DURING_CREDENTIAL_SAVE
PROVIDER_NEUTRAL_STATE_MODEL
STATUS_UNKNOWN_HANDLING
PRIMARY_SETUP_FLOW
PERMANENT_KEY_FIELD_REMOVED
ROTATION_UX
DISABLE_VS_REMOVE
MODEL_ADVANCED_DISCLOSURE
SYNC_DIAGNOSTICS_DISCLOSURE
FOUR_SOURCE_SELECTION
FOUR_SOURCE_EXACT_RESOLUTION
FOUR_SOURCE_RESET_REBUILD
PARTIAL_SYNC_SUMMARY
BROWSER_DESKTOP
BROWSER_390
KEYBOARD_FOCUS
HORIZONTAL_OVERFLOW
CONSOLE_MATERIAL_ERROR_WARN
LOGIC_VALIDATION
BUNDLE_VALIDATION
MULTIFILE_PACKAGE_PARITY
CANONICAL_CHECK
DIFF_CHECK
AGENT_FOUNDATION_CHECK
TARGET_RUNTIME_QUALIFICATION
PROVIDER_CALL_COUNT
AI_INDEX_MUTATION_COUNT
APPS_SCRIPT_DEPLOYMENT_MUTATION_COUNT
COMPANY_DATA_MUTATION_COUNT
USER_NATIVE_ACTION_COUNT
BLOCKER
FOLLOW_UP
READY
```

## Mandatory final chat identity

Begin and end the Codex final response with:

```text
WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

If Strategy Reset is triggered:

```text
WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-01
BALL: CHATGPT
STATUS: BLOCKED
```

Report accepted evidence, blocker impact and the cheapest next decisive action.

If a real credential or user-native action becomes unavoidable, return to ChatGPT; do not request the secret directly from the user.

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-01
BALL: CODEX
STATUS: READY
