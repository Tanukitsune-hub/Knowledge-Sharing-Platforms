# Work 0025 — CODEX-02 thinking-profile qualification gate

WORK_ID: 0025
DISPATCH_ID: 0025-CODEX-02
MODE: REVIEW_FIX -> QUALIFICATION
BALL: CODEX
STATUS: READY

## Primary outcome

Close one material gap in the Work 0025 model/thinking foundation, preserve all accepted CODEX-01 behavior, and return PR #32 ready for final ChatGPT review and merge.

This is not a general hardening pass. Fix only the qualification/enforcement mismatch described below, run the bounded checks, and stop.

## Reviewed baseline

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- branch: `agent/0025-model-thinking-policy`
- reviewed PR head: `d434d4ba0ae8023862842614d2ac0db4f7c23653`
- implementation source commit: `200898cc0632c6ddf075409369c8b8548d43c330`
- PR: #32, Draft / Open / unmerged / mergeable
- current deployed private Web App: version 59
- GitHub CI/status checks: absent

Fetch current refs before editing. If `origin/main` has advanced, integrate it normally after the scoped fix and rerun checks. Do not rebase or force-push.

## Accepted CODEX-01 evidence to preserve

```text
MODEL_POLICY_REGISTRY: PASS
ADMIN_MODEL_CONTROL: PASS
USER_MODEL_SELECTOR: PASS
SERVER_SIDE_RAW_MODEL_REJECTION: PASS
CURRENT_DEFAULT_MIGRATION: PASS
HISTORICAL_MODEL_REGISTRATION: PASS
NO_AUTO_LATEST_SWITCH: PASS
NO_COST_ESCALATION/CROSS_PROVIDER_FALLBACK: PASS
OPENAI DOC-000017 / MTG-000005 REGRESSION: PASS
LOGIC_VALIDATION: focused 74/74; canonical 341/341
TARGET_RUNTIME: same private Web App version 59
```

Do not reopen Work 0020 provider architecture, citations, lifecycle, retry/replacement cleanup, FULL_OUTPUT, Gemini, large files, Work 0021, or Work 0023.

## Material finding

The current qualification action does not qualify the actual thinking choices it later exposes.

Current behavior:

1. `QUALIFY_MODEL_PROFILE` calls `kspRunOpenAiSyntheticConnectionTest_(environment, vectorStoreId, modelId)`.
2. That helper tests the model/File Search path using only `modelId`; it does not send the profile's selected thinking raw value or `maxOutputTokens`.
3. A successful call marks the whole model profile `QUALIFIED` and `fileSearch = true`.
4. `kspGetEffectiveAiModelChoices_` then exposes every enabled thinking profile under that model.
5. Therefore an administrator-configured thinking value that the model/API does not accept can become user-selectable even though that exact combination was never qualified.

This conflicts directly with the accepted requirement that thinking support is model-specific and unknown until qualified. It can make the normal user path fail after an apparently successful administrator qualification.

## Required contract

### 1. Qualification identity

A user-selectable combination must be qualified as the exact tuple:

```text
provider
+ exact model ID
+ thinking profile ID
+ exact provider-facing thinking value or intentional omission
+ bounded output limit
+ required File Search route
```

Do not treat a model-only synthetic call as proof for every configured thinking value.

### 2. Thinking-profile qualification state

Represent qualification for each thinking profile, using the smallest validated extension of the existing Settings-backed registry. Do not add a new sheet/database.

At minimum each thinking profile must distinguish:

```text
QUALIFIED
UNQUALIFIED
FAILED
```

The migrated current OpenAI provider-default/no-override thinking profile may become qualified from the exact current-default synthetic test. New or changed thinking profiles must start unqualified.

Changing a model ID, thinking raw value/provider-default flag, or output limit must invalidate affected qualification before the combination can be selected. Invalidating the whole model profile on such a material contract change is acceptable if it is simpler and safe.

### 3. Effective choices and server enforcement

- Normal-user choices include only enabled thinking profiles that are individually `QUALIFIED` for an otherwise effective model profile.
- The server resolver must reject unqualified/failed thinking profiles even if a stale or crafted browser request supplies their IDs.
- The model's configured default thinking profile must also be individually qualified before it can resolve as the normal default.
- Provider-default thinking must omit the reasoning override.
- An explicit thinking profile must pass its exact raw value.
- A configured output ceiling must be sent in the qualification request and normal request.
- No raw model or raw thinking bypass.

### 4. Bounded administrator qualification

`QUALIFY_MODEL_PROFILE` must qualify the actual enabled thinking choices for the selected model profile, or use an equally safe bounded workflow that never exposes an untested choice.

Preferred simple behavior:

- use one temporary synthetic source where practical;
- run the minimum bounded File Search query/queries required to test each enabled thinking tuple;
- pass the exact model, thinking omission/raw value, and output limit through the same validated OpenAI request shape used by normal Knowledge Search;
- record per-thinking PASS/FAIL safely;
- clean all temporary resources;
- preserve the primary provider error and safe cleanup behavior;
- do not expose provider Store/File IDs or raw payloads.

A partial result may keep passing thinking choices qualified and failing choices unavailable, provided the administrator UI makes that clear and the default remains valid. If the configured default thinking fails, the model profile must not become effective until the administrator chooses a qualified default or requalifies successfully.

Do not run provider discovery or exhaustive model benchmarking.

### 5. Administrator UI

Show enough safe per-thinking qualification status for an administrator to know which choices are usable. A compact status beside/in the existing thinking editor is sufficient; do not redesign the page.

The normal-user UI remains unchanged except that unqualified/failed thinking choices are absent.

## Required deterministic tests

Add focused coverage for at least:

1. current migrated `provider-default` thinking remains qualified and preserves omission;
2. a newly added explicit thinking value begins unqualified and is absent from user choices;
3. successful qualification sends the exact reasoning value and output ceiling and makes only that tuple selectable;
4. provider-default qualification sends no reasoning override;
5. one failed thinking tuple remains unavailable and is rejected server-side;
6. an unqualified configured default prevents effective default resolution;
7. changing raw thinking/model/output contract invalidates prior qualification;
8. stale/crafted thinking profile IDs cannot bypass qualification;
9. current OpenAI File Search/citation and Work 0020 recovery tests remain PASS;
10. FULL_OUTPUT remains API-independent and Gemini remains disabled/no-failover.

Run focused tests, then:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken existing assertions.

## Target-runtime qualification

Only after deterministic PASS:

1. deliver/read back the exact tested source once to the existing standalone Apps Script project;
2. create at most one immutable version, expected version 60;
3. update the same existing private Web App once;
4. preserve the stored OpenAI API key without reading, printing, logging, or replacing it;
5. qualify only the current `gpt-5.6-terra` + provider-default thinking tuple live;
6. verify one hidden/unqualified synthetic thinking/profile combination remains absent and server-rejected without a provider call;
7. run one bounded `DOC-000017` query and one bounded `MTG-000005` query through the qualified default and require one authoritative normalized source each;
8. verify `DOC-000018`, old 5–25 MiB fixtures, Gemini, FULL_OUTPUT runtime, broad sync, and provider infrastructure remain untouched;
9. update the runtime locator with the exact deployed source and version.

Do not live-test every model or thinking value. The purpose is to prove the corrected gate and preserve the current qualified path.

## Scope / stop rule

After the exact finding is closed and the required deterministic/native checks pass, STOP.

Do not create another Work 0025 dispatch for cosmetic admin UX, provider discovery, exhaustive catalogs, per-user preference persistence, broad latency benchmarking, or unrelated edge cases. Record those as FIX SOON/BACKLOG and return PR #32 for final merge.

## GitHub delivery

Create:

`docs/handoffs/0025-CODEX-02-thinking-profile-qualification-gate-report.md`

Update:

- `docs/handoffs/0025-dispatches.md`;
- `docs/handoffs/0025-instruction.md`;
- `docs/handoffs/0025-report.md`;
- `docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md` only if needed to correct the prior qualification scope;
- `docs/planning/work-registry.md`;
- `docs/operations/runtime-artifact-locator.md`;
- PR #32 body.

Commit and push all scoped changes. Keep PR #32 Draft/Open/unmerged. Do not merge it.

## Completion latch

```text
THINKING_PROFILE_QUALIFICATION_STATE: PASS | FAIL
EXACT_MODEL_THINKING_OUTPUT_QUALIFICATION: PASS | FAIL
UNQUALIFIED_THINKING_HIDDEN: PASS | FAIL
SERVER_SIDE_THINKING_QUALIFICATION_GATE: PASS | FAIL
CURRENT_DEFAULT_MIGRATION: PASS | FAIL
ADMIN_MODEL/THINKING_CONTROL: PASS | FAIL
OPENAI_REGRESSION: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL
RUNTIME_DEPLOYMENT_VERSION: <version | unchanged>
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

## Mandatory final chat response

The final response must begin and end with:

```text
WORK_ID: 0025
DISPATCH_ID: 0025-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```
