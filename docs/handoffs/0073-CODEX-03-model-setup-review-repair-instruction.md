# Work 0073 CODEX-03 — model setup review repair

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-03
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH
BASE_PR: #109
SUPERSEDES_EXECUTION: 0073-CODEX-02 RETURNED
USER_NATIVE_ACTION_BUDGET: 0

## Goal

PR #109のChatGPT final reviewで見つかった2つのBLOCKERだけを修正し、Work0073の既存実装・Acceptance Evidenceを保持したままDraft PRを再びreview可能な状態へ戻す。

新しい設計を始めない。既存のcredential safety、1フォームの「確認して保存」、4-source sync、model policy、generated distributionを維持する。

## Read First

1. nearest `AGENTS.md`
2. `docs/planning/work0073-provider-credential-onboarding.md`
3. `docs/decisions/provider-credential-management.md`
4. `docs/handoffs/0073-CODEX-02-simple-model-setup-report.md`
5. `docs/handoffs/0073-dispatches.md`
6. this instruction
7. directly affected production source/tests

## Closed Evidence

Do not reopen without contradictory evidence:

- candidate-test-promote / Credential Operator design
- credential mutation separate from routine model change
- model candidate list is advisory; direct Model ID fallback remains
- exact tuple qualification
- failed rotation preserves active state
- no browser secret persistence
- four-source sync/reset contract
- 1440/390 synthetic browser baseline outside the repaired states
- CODEX-02 deterministic checks other than what these blockers invalidate

## BLOCKER 1 — Gemini model ID returned by models.list is not canonical for Interactions

Current live adapter in `src/160_AiEnvironment.gs` maps Gemini `models.list` entries using `item.name`.

Google's Models API defines that resource name as:

```text
models/{model}
```

and exposes `baseModelId` as the base model identifier for generation. The Interactions API examples/contract use the bare model ID, e.g.:

```text
gemini-3.8-flash
```

not:

```text
models/gemini-3.8-flash
```

Current CODEX-02 fake tests accept prefixed `models/gemini-...` IDs, so they do not prove the actual live contract.

### Required repair

Define one canonical Gemini model-ID normalization boundary for Work0073 model administration.

Required behavior:

- provider candidate discovery returns/stores the canonical request Model ID, preferably `baseModelId` when present;
- otherwise strip exactly one leading `models/` from Gemini resource names;
- direct user input `models/<id>` is accepted and normalized to `<id>` rather than persisted as a second identity;
- OpenAI IDs are unchanged;
- do not create duplicate profiles for `models/gemini-x` and `gemini-x`;
- the canonical stored/default/effective Model ID passed to Gemini Interactions is the bare ID;
- displayName may remain provider-provided human-readable text;
- do not introduce a static allowlist of current Gemini model names.

### Required focused evidence

Add a deterministic test using an official-shaped Gemini list fixture:

```json
{
  "name": "models/gemini-synthetic",
  "baseModelId": "gemini-synthetic",
  "displayName": "Gemini Synthetic"
}
```

Prove:

1. candidate returned to UI has `modelId = gemini-synthetic`;
2. direct input `models/gemini-synthetic` normalizes to the same canonical model;
3. saved policy contains the bare ID;
4. qualification/request builder receives the bare ID;
5. prefixed and bare forms cannot create duplicate canonical profiles.

Do not live-call Gemini in this Dispatch.

## BLOCKER 2 — fresh install still fabricates a current OpenAI default model in admin status

Current `kspGetAiProviderAdminData_` falls back to `kspBuildMigratedOpenAiModelPolicy_` whenever `MODEL_POLICY_JSON` is absent.

That migration helper falls back to `KSP_AI_DEFAULTS.OPENAI_DEFAULT_MODEL` even when no OpenAI model is actually configured.

Result: on a fresh/unconfigured environment, the new UI can receive a synthetic OpenAI default profile and render a `現在のモデル` even though the user has never selected/saved one. The model-change button is also currently enabled without a configured credential, although model-only save cannot succeed without an active credential.

This contradicts the accepted Work0073 requirement that first setup works from an actually empty model state.

### Required repair

For AI admin/setup status:

- when no persisted model policy and no saved scalar OpenAI model exist, return an empty model policy; do not fabricate `OPENAI_DEFAULT_MODEL` as current state;
- preserve the legacy migration behavior only when an actual legacy saved model/configuration exists and migration is needed;
- fresh UI must render `現在のモデル: 未設定`;
- normal `モデルを変更` action must be disabled until that provider has a configured credential;
- Credential Operator can still start the APIキー + model setup path;
- do not change normal Knowledge Search legacy compatibility outside what is needed for admin/setup state.

Prefer reusing `kspAiSetupPolicy_` or a narrowly shared equivalent rather than duplicating policy rules.

### Required focused evidence

Fresh-state test with:

```text
MODEL_POLICY_JSON = empty
OPENAI_DEFAULT_MODEL = empty
GEMINI_DEFAULT_MODEL = empty
OPENAI credential = absent
GEMINI credential = absent
```

Prove:

1. admin model policy has zero profiles;
2. OpenAI/Gemini current model renders `未設定`;
3. model-change buttons are disabled without the provider credential;
4. API-key setup remains available only to Credential Operator;
5. after a credential+model save, the current model appears normally;
6. existing legacy saved OpenAI model still migrates/presents correctly.

## Scope

Allowed:

- smallest production-source changes for the two blockers
- directly coupled tests
- Work0073 synthetic browser update for fresh-state and Gemini canonical ID
- regenerated distribution/package because production source changes
- report + dispatch register + PR updates

Not allowed:

- live provider/API calls
- real credentials
- Apps Script / Workspace / deployment mutation
- Secret Manager / Azure
- unrelated model-catalog filtering/recommendation redesign
- general refactor of legacy model policy
- company rollout
- merge

## Validation

Focused first:

- Gemini canonical model-ID tests
- fresh/unconfigured admin policy and UI tests
- directly coupled Work0073 setup tests
- synthetic browser changed states

Then, because production source changes:

```text
npm run check
git diff --check
python tools/validate_agent_foundation.py
```

Regenerate and verify bundle/company package using repository-standard flow.

Do not repeat unrelated provider/runtime/viewports. R1/R2 remain NOT_RUN.

## Strategy Reset

Return BLOCKED rather than broadening scope if either repair requires:

- changing the external provider architecture;
- a new model registry/database;
- a static model allowlist;
- live provider evidence to establish deterministic correctness;
- changing accepted Work0025 exact-tuple semantics.

Same failure class speculative repair budget: 2.

## Delivery

Continue on:

`work/0073-provider-credential-onboarding`

Keep Draft PR #109.

Create:

`docs/handoffs/0073-CODEX-03-model-setup-review-repair-report.md`

Update:

`docs/handoffs/0073-dispatches.md`

Do not mark Work0073 ACCEPTED or apply Completion Latch.

## Mandatory final identity

Begin and end final chat/report with:

```text
WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
```

If repair cannot be completed inside the above boundary, use STATUS: BLOCKED and return accepted evidence + blocker + cheapest next action.

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-03
BALL: CODEX
STATUS: READY
