# Provider credential management

Current as of: 2026-09-26

Status: ACCEPTED FOR WORK0073

Implementation boundary confirmed: 2026-09-26

- Work0073 implements Phase A through four-source operational alignment.
- Google Secret Manager remains a follow-up Phase B decision and is not part of the current implementation scope.
- The AI setup UI does not need a notice explaining the difference between a ChatGPT subscription and OpenAI API billing.

## Problem

Current `管理者ページ > AI設定` combines several different concerns:

- credential entry
- secret persistence
- connection test
- provider Store creation/readback
- provider enable/disable
- manual source sync
- exact-source sync
- model policy editing
- model / thinking qualification

OpenAI and Gemini also expose different sequences.

Current source stores `KSP_OPENAI_API_KEY` and `KSP_GEMINI_API_KEY` in Apps Script Script Properties. The Web App accepts raw credentials in password inputs and the server persists the supplied value before the full connection check succeeds.

This creates three problems:

1. a failed rotation can replace a previously usable credential before the candidate is proven;
2. credential provisioning is mixed into routine provider operations, making environment ownership and next action unclear;
3. the normal Web App management surface is intentionally roleless for ordinary administration, while secret provisioning is a materially stronger security boundary than theme/deleted-record operations.

Work0072 also expanded provider/index contracts to four sources, while the current manual AI-settings sync controls still present Meeting/Pitchbook-only terminology and exact-ID affordances.

## External evidence

### Google / Apps Script

Apps Script `PropertiesService` is an app-wide key/value configuration store. Script properties are shared at script scope. It is practical for developer configuration, but it is not a dedicated secret-management service.

Google Secret Manager provides IAM, versions, access audit, rotation patterns and a dedicated API for secrets. Google recommends least privilege, environment separation, direct Secret Manager access rather than copying secrets to additional datastores, and disabling old versions before destructive deletion.

Apps Script can call Google APIs that are not built in by using `ScriptApp.getOAuthToken()` with explicit scopes. Using Secret Manager therefore requires deliberate Cloud-project / OAuth-scope / IAM design rather than being treated as a drop-in UI change.

For complex applications that need manual control of Cloud APIs and IAM, Google recommends an Apps Script standard Cloud project rather than relying indefinitely on the default project.

### OpenAI

OpenAI recommends unique API keys rather than shared personal keys, project-scoped organization of usage, expiration/rotation, and secure server-side storage. OpenAI Projects can scope usage, members/service accounts, budgets and API-key permissions.

A shared server application should not depend on an individual developer's generic personal key when a dedicated project/service-account or dedicated project key is available.

### Gemini / Google API keys

Google recommends keeping API keys out of client code and repositories, isolating keys per application/environment, restricting APIs, rotating keys and monitoring usage. Gemini API keys can be restricted specifically to Gemini API.

### Community patterns

Apps Script developers commonly use Script Properties for simple/private projects, but community discussions repeatedly note that it is not a strong security boundary against script editors. For stronger organizational controls, developers use Google Secret Manager or a separate credential-handling service/library.

Community Secret Manager wrappers demonstrate feasibility, but Alternative Assets Intelligence should not take a third-party secret library dependency merely for convenience. If Secret Manager is adopted, prefer a small first-party repository adapter against the official API.

## Decision direction

### 1. Separate credential provisioning from provider operations

Normal provider state and provider operation UI may remain visible to authorized Web App users.

Raw credential create/replace/delete is a separate `Credential Operator` boundary.

This is NOT a return to a general app-wide admin role.

Credential Operator should reuse or align with the existing installer/deployment-security operator boundary because secret mutation can change billing/data-exfiltration capability.

Normal users may see only redacted state:

```text
未設定
設定済み
接続確認済み
4-source資格化済み
有効
要再確認
エラー
```

Raw key value, provider private resource IDs, secret refs and provider account identifiers are not returned to the browser.

### 2. Do not save a replacement key before it passes validation

Credential rotation uses candidate -> validate -> promote.

For Script Properties backend:

```text
candidate key received by one server call
-> use only in call-local memory
-> bounded synthetic connection/qualification
-> success: atomically replace active key
-> failure: active key remains unchanged
-> candidate is not persisted
```

If a qualification cannot fit safely in one call, stop and redesign rather than persisting plaintext candidate state casually.

For Secret Manager backend:

```text
create candidate secret version
-> qualify exact version
-> promote app reference to exact version
-> keep prior version available for rollback
-> disable old version after successful cutover
-> destroy/delete only under separate retention policy
```

### 3. Introduce a credential backend abstraction

Application code consumes provider credentials through one server-side interface.

Initial backends:

- `SCRIPT_PROPERTIES` — permitted for isolated/personal development and bounded qualification when script-editor access is tightly controlled.
- `GOOGLE_SECRET_MANAGER` — preferred target for managed company/staging/production environments when the standard Cloud project, IAM and OAuth-scope boundary is approved.

Do not store a secret value in the Backend Settings sheet.

Non-secret runtime metadata may record:

- provider
- credential backend
- environment class
- purpose
- configured yes/no
- last validation timestamp
- last qualification state
- rotation required yes/no

Do not persist the raw key, key prefix/fragment, private provider project ID, secret resource name, or private store IDs in user-visible settings/Audit/GitHub.

### 4. Environment-specific policy

#### Isolated personal / qualification environment

Fast path:

- dedicated provider project/key for this app or qualification purpose;
- never use a generic key whose ownership/purpose cannot be established;
- Script Properties is acceptable as the minimum viable backend if editor access remains owner-controlled;
- temporary qualification key should use provider-supported expiry/rotation and bounded spend where available;
- provider resources use explicit synthetic/test names and bounded cleanup.

#### Company environment

Target policy:

- Direct OpenAI is not the company production OpenAI route; Work0030 Azure OpenAI remains separately governed.
- Any non-Azure provider credential enabled by company policy must use a company-approved secret backend.
- Prefer Google Secret Manager when its standard Cloud project / IAM / OAuth-scope implications are accepted.
- No raw key input on the ordinary roleless Web App surface.

### 5. Provider setup state machine

Use one provider-neutral state model.

```text
UNCONFIGURED
CREDENTIAL_PRESENT
CONNECTION_VERIFIED
FOUR_SOURCE_QUALIFIED
ENABLED
REVERIFY_REQUIRED
ERROR
```

Substates/errors may be provider-specific, but the main user journey is the same.

`enabled` is not inferred merely from presence of a key/store/model.

### 6. Provider resource lifecycle is separate from credential lifecycle

Credential registration must not silently create/replace a production provider Store.

A connection check may create a bounded temporary synthetic Store and clean it up.

Provider operational Store creation/reuse belongs to `利用開始` / provider enablement, after credential and synthetic qualification are successful.

Replacing an inaccessible Store must not leave News/Assessment derived state pointing to a stale Store. Four-source reset/rebuild behavior must cover all four canonical source types.

### 7. Model policy is advanced configuration and must tolerate model churn

First-time setup should not require the user to understand:

- Profile ID
- family
- raw thinking values
- output ceilings

Move model-policy editing behind `詳細設定`.

Model availability is not a static application constant. New models, aliases, reasoning options and deprecations can change independently of this repository.

The normal runtime path therefore uses this lifecycle:

```text
provider-discovered candidate or manually entered Model ID
-> registered profile
-> API/capability verification
-> File Search + thinking qualification
-> qualified profile
-> optional provider default / user-visible selection
```

Rules:

- do not require a source-code release merely to add a new provider model ID;
- keep direct Model ID entry as a canonical fallback even when provider discovery is available;
- provider model discovery is server-side, credential/environment-specific and advisory;
- a model returned by a provider list endpoint is not automatically enabled or user-visible;
- qualification, not name matching, proves that the exact model/thinking tuple works with this application's required provider path;
- thinking/reasoning options belong to the model profile and must not be assumed identical across models;
- discovery failure must not delete or disable existing qualified profiles merely because the list could not be refreshed;
- a configured model that becomes unavailable moves to an unavailable/reverify state; do not silently switch to another model;
- no automatic model failover;
- no automatic upgrade from one stable model ID to a newer model;
- if a rolling/latest alias is supported and selected, label it as rolling behavior and require explicit administrator choice;
- provider-supplied lifecycle metadata such as shutdown/deprecation information may be surfaced when available, but absence of metadata is not proof of long-term availability.

Hard-coded model IDs may remain only where they are historical qualification fixtures or compatibility evidence. They must not be the exhaustive allowlist for normal model registration/selection.

The primary setup flow uses an approved qualified profile. Administrators can refresh/discover candidates or enter a new Model ID under `詳細設定`, qualify it, and then promote it to provider default without a code deployment.

### 8. Manual source sync is advanced operations

Credential setup must not ask for Meeting ID / Document ID.

Manual exact-source sync belongs under a separate `同期・診断` advanced section.

Any manual source selector must reflect all four source categories introduced by Work0072.

### 9. Recommended setup flow

Landing card:

```text
ChatGPT / OpenAI
資格情報       未設定
接続確認       未実施
4-source検索   未実施
検索データ     未作成
状態           利用開始前

[設定を開始]
```

User-facing setup flow:

```text
Step 1  利用環境と接続先を確認
Step 2  APIキーを登録・確認
        -> connection verification
        -> synthetic four-source qualification
Step 3  利用開始
```

The three visible steps may contain internal subchecks, but the user should not have to understand the provider-specific state machine.

Each step shows:

- what will happen;
- whether an external provider call or temporary resource creation occurs;
- whether the operation is reversible;
- the exact next action;
- no secret values after submission.

Do not merge credential save, provider enablement, and production-source sync into one button. Production-source sync remains a separate operational action after enablement.

### 10. Rotation flow

Normal provider card has `APIキーを更新`, not a permanently visible empty password field.

Rotation:

1. explain that current key remains active until validation passes;
2. accept new candidate;
3. validate candidate;
4. promote on success;
5. show `更新完了`;
6. keep provider enabled only if the new credential satisfies the existing readiness contract;
7. on failure, preserve old credential and show actionable error.

### 11. Removal / disable

`プロバイダを無効化` and `資格情報を削除` are distinct.

Disabling stops use but keeps the credential for reversible recovery.

Credential removal requires explicit confirmation and provider disabled state.

Secret Manager versions should be disabled before destructive deletion when adopted.

## UX rules applied

From the project Web UX knowledge:

- form validation appears at a meaningful point and is also enforced server-side;
- errors identify the field, reason and correction path;
- save/test flows have explicit idle/validating/pending/success/error states;
- secrets are not stored indefinitely in browser/local draft state;
- keyboard/focus order remains natural and visible;
- async state areas preserve action positions and do not redraw the whole card.

## Non-goals

- Work0030 Azure OpenAI implementation
- company rollout
- historical source migration
- new app-wide user/admin role system
- automatic provider failover
- storing provider credentials in Backend Sheets
- adopting a third-party Secret Manager library as a runtime dependency

## Follow-up implementation

Work0073 should implement the smallest safe slice:

Current Work0073 implementation scope:
- provider-neutral setup state machine;
- separate routine status from credential mutation;
- candidate-test-promote for Script Properties;
- first-run / rotation UX using the three-step user-facing flow;
- model and manual-sync progressive disclosure;
- four-source admin sync terminology and source selection;
- all four source reset/rebuild correctness;
- clear distinction between unknown/error/unconfigured states.

Follow-up after Work0073:
- evaluate / implement Google Secret Manager only after the actual Apps Script Cloud project type, IAM, OAuth scopes and company deployment boundary are confirmed.

Work0072 live-provider qualification resumes after Phase A can provision a clearly dedicated qualification credential without exposing it to normal Web App users or overwriting a known-good key before test.
