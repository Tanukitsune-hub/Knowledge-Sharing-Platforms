# Work 0073 — Provider credential onboarding and secret-handling redesign

WORK_ID: 0073
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: ACTIVE
MODE: INVESTIGATION
VALIDATION_TIER: TIER_2_STANDARD
ROUTE: A
DEPENDENCY: Work0072 live-provider qualification blocked on NO_AUTHORIZED_PROVIDER_CREDENTIAL

## Primary Outcome

API credential setupを「キー文字列をどこに貼るか」ではなく、environment-bound credential onboardingとして再設計し、利用者が次の状態と次の行動を迷わず理解できるようにする。

```text
credential provision
-> connection verification
-> synthetic qualification
-> enable
-> source sync
-> rotation / disable
```

を分離し、secret safetyとprovider UXを同時に改善する。

## Current-state inventory

### Current UI

`src/AiProviderSettingsPage.html` currently:

- shows OpenAI and Gemini in the same AI settings tab;
- displays a permanent password input for each API key;
- combines `APIキーを保存して接続確認`;
- exposes source sync controls next to credential setup;
- exposes model-policy fields in the same page;
- OpenAI manual sync selector remains Meeting/Pitchbook only;
- Gemini exact-sync controls remain Meeting/Pitchbook terminology.

### Current server behavior

`src/165_AiProviderAdmin.gs` currently:

- stores OpenAI / Gemini raw API keys in Apps Script Script Properties;
- persists a newly supplied key before the complete connection test succeeds;
- OpenAI connection may create/replace Vector Store as part of credential connect;
- Gemini connect expects a Store and reads it as part of credential connect;
- provider readiness state machines differ;
- OpenAI inaccessible-Store reset helper still covers Meeting/Pitchbook only and must be reviewed against Work0072 four-source state.

### Current access model

Work0054 intentionally removed an app-level admin role. The management page is available to authorized Web App users.

This is acceptable for routine configuration under the accepted product decision, but secret mutation is now classified as a distinct credential/deployment-security operator boundary rather than ordinary role-based administration.

## Research inputs

- current repository source / Work0020-0029/0054/0072 decisions and runtime behavior;
- project `web_ux_knowledge_v1_20260925.md`;
- current OpenAI API-key/project/service-account guidance;
- Google Apps Script PropertiesService and Cloud project guidance;
- Google Secret Manager best practices;
- Google API-key / Gemini-key security guidance;
- public Apps Script developer practices (PropertiesService vs Secret Manager / separate handler patterns).

## Findings

1. Script Properties are valid app-wide configuration storage and useful for private development, but not a dedicated secret vault with IAM/version/audit semantics.
2. Secret Manager is a stronger managed-secret model, but Apps Script adoption changes Cloud-project/IAM/OAuth-scope architecture and must not be smuggled in as a simple UI refactor.
3. The largest immediate usability/safety problem is not storage technology: it is the coupling of raw credential replacement, connection testing, Store mutation, enablement, sync and model policy.
4. Candidate credentials should be tested before replacing a known-good active credential.
5. Shared server apps should use environment-specific provider credentials rather than generic developer keys.
6. The app needs explicit non-secret credential provenance/environment metadata so qualification automation can distinguish a dedicated test credential from an ambiguous local key.
7. Work0072 makes the two-source admin sync controls stale.

## Proposed architecture

Canonical decision: `docs/decisions/provider-credential-management.md`.

Fastest safe implementation is Phase A using current Script Properties as a backend behind a new credential abstraction, because it avoids introducing Cloud/IAM/OAuth changes while fixing the unsafe/confusing lifecycle.

Secret Manager is a Phase B decision gate for managed company environments.

## Acceptance Evidence for redesign

Design acceptance:

- one provider-neutral onboarding state machine;
- separate credential / connection / qualification / enable / sync concepts;
- no raw credential in ordinary status response;
- candidate-test-promote preserves existing key on failed rotation;
- raw input clears after terminal operation;
- no localStorage/sessionStorage secret persistence;
- routine Web App users cannot invoke raw secret create/replace/delete unless they satisfy the separate Credential Operator boundary;
- status-only provider view remains available under current roleless app model;
- 4-source operational terminology;
- no hidden provider/store creation during credential save;
- exact side-effect preview before qualification;
- keyboard/focus/error states follow selected Web UX rules.

## Decision questions before BUILD

1. Confirm which existing installer/deployment-security authorization primitive should gate Credential Operator actions.
2. Confirm whether the current Apps Script project uses a default or standard Google Cloud project.
3. Confirm whether company deployment is willing/able to grant Secret Manager access and add the required explicit OAuth scope; if not, keep Script Properties for this app with strict editor/operator boundaries.
4. Decide the final OpenAI company route only within Work0030; do not let Work0073 silently enable Direct OpenAI in company production.

## Non-goals

- running provider qualification before the credential flow is safe/clear;
- company data;
- historical migration;
- Azure implementation;
- general user-role administration;
- unrelated admin/theme/deleted-record redesign.

## Work0072 relationship

Work0072 core release 0.2.3 remains integrated.

`0072-CODEX-03` returned safely with:

```text
BLOCKER: NO_AUTHORIZED_PROVIDER_CREDENTIAL
PROVIDER_CALL_COUNT: 0
AI_INDEX_MUTATION_COUNT: 0
APPS_SCRIPT_UPDATE_COUNT: 0
USER_NATIVE_ACTION_COUNT: 0
```

Do not work around this by using an ambiguous generic key.

After Work0073 Phase A is accepted, resume Work0072 under a new Dispatch using a dedicated qualification credential created for that environment.
