# Work 0025 — CODEX-01 model policy foundation and user selection

WORK_ID: 0025
DISPATCH_ID: 0025-CODEX-01
MODE: BUILD -> QUALIFICATION
BALL: CHATGPT
STATUS: RETURNED

## Primary outcome

Implement the shortest coherent model/thinking policy vertical slice before Work 0021 expands the Knowledge Search product.

Normal users must be able to select an administrator-approved model and thinking/reasoning profile from the Knowledge Search screen. Administrators must control which models and thinking values are visible, allowed, defaulted, accessible, and qualified without editing source code.

This Work is foundational UI/request-policy work, not an exhaustive provider/model benchmark. Preserve the accepted Work 0020 OpenAI File Search path and move the overall product forward.

## Why Work 0025 is next

Work 0020 is accepted and merged. The existing private Web App version 58 has a qualified OpenAI path for Meeting/Pitchbook File Search, exact filters, normalized sources/citations, exact sync, lifecycle, retry/replacement recovery, and bounded target-runtime qualification.

The accepted product decision now requires model/thinking selection to exist in the normal-user search UI under administrator control. Implementing this before Work 0021 avoids rebuilding the same request contract and screen after structured filters, five modes, and multi-Entity comparison are added.

Current planning contains stale wording in Work 0021 that treats a user-facing model selector as a non-goal. Reconcile that wording in this PR so Work 0021 consumes the Work 0025 effective-policy resolver rather than introducing a competing model-selection design.

## Source and runtime baseline

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- required base: latest `origin/main`; at preparation the exact main SHA is recorded in the dispatch prompt
- current deployed runtime: standalone private Apps Script `KSP Work 0010 DEV Qualification`
- current deployed Web App version: 58
- current tested OpenAI source baseline: Work 0020 / CODEX-21
- Backend remains the existing five-sheet `Knowledge Platform Backend`
- Audit remains the separate `Knowledge Platform Audit`
- runtime locator: `docs/operations/runtime-artifact-locator.md`

Create a new branch from the exact current main. Do not continue the closed Work 0020 branch.

## Planning reconciliation required in this PR

Update the roadmap and affected Work plans so the active sequence is coherent:

```text
0020 OpenAI provider/search core [ACCEPTED / MERGED]
-> 0025 model/thinking policy and user selection [CURRENT]
-> 0021 structured filters, five modes, multi-Entity comparison
-> 0023 generated bundle / installer
-> near-completion Gemini provider recovery and representative large-file qualification
-> historical migration
-> final company-environment qualification / rollout
```

Required planning corrections:

1. Work 0020 status is accepted/merged, not merely functionally complete.
2. Work 0025 is the next active implementation Work.
3. Work 0021 must use the Work 0025 model/thinking resolver and must not call the selector a non-goal.
4. Gemini remains disabled/deferred and must not block Work 0025 or the initial Work 0021 OpenAI path.
5. Work 0021 should be delivered through bounded dispatches rather than one monolithic campaign:
   - core unified filters + five modes on OpenAI/FULL_OUTPUT;
   - multi-Entity comparison + advanced exact filters;
   - format/provider-parity qualification.
6. Gemini recovery is performed near product completion against the completed OpenAI reference path and then-current APIs.

Do not implement Work 0021 or Work 0023 in this dispatch.

## Required architecture

### 1. Structured model-policy registry

Use the existing Settings/config architecture. Do not add a new sheet or database solely for this feature.

The validated registry must support at least:

- stable internal profile ID;
- provider;
- exact provider model ID;
- administrator display label;
- optional family/tier label;
- administrator enabled/user-visible state;
- one default profile per enabled provider;
- allowed thinking/reasoning profiles per model;
- default thinking profile per model;
- API access state;
- Knowledge Share qualification state;
- required File Search/tool capability;
- optional output-token ceiling;
- last access/qualification timestamps;
- optional safe administrator note/restriction reason;
- policy/schema version.

Older/historical model IDs are first-class entries. Do not assume that the newest provider model is accessible to a company key.

### 2. Flexible thinking profiles

Thinking/reasoning values are model-specific policy data, not a fixed global enum.

Store separately:

- stable internal thinking profile ID;
- normal-user display label such as `高速`, `標準`, `深掘り`, or administrator-defined text;
- exact provider-facing raw value;
- enabled/default state;
- qualification state.

Support an explicit provider-default/no-override profile so the current qualified OpenAI behavior can be preserved without inventing a raw thinking value.

Do not allow normal users to submit arbitrary raw values.

### 3. Backward-compatible migration

Seed one default OpenAI model profile from the currently configured and qualified Work 0020 OpenAI model.

- Existing requests without explicit model/thinking selections resolve to that administrator default.
- Introducing the policy registry must not silently change the effective model, output limit, File Search behavior, source/citation normalization, or current Web App behavior.
- A stale browser selection must be rejected or safely resolved only according to explicit administrator fallback policy.
- Never silently move to a stronger or more expensive model.
- No cross-provider fallback.

### 4. Administrator UI

Extend the existing private AI-provider administrator surface with model-policy management.

At minimum provide:

- current profiles and states;
- manual add/retain of exact model IDs, including historical models;
- enable/disable for users;
- display/family labels;
- model-specific thinking choices and defaults;
- provider default profile selection;
- safe access/qualification status and last-check timestamps;
- bounded `check access / qualify profile` action;
- safe validation preventing duplicate profile/default identities.

Provider model discovery may list models visible to the current credential, but discovery must never auto-enable, auto-default, or auto-qualify a model. Discovery alone does not prove File Search or thinking compatibility.

Do not expose API keys, Vector Store IDs, provider File IDs, raw provider payloads, or confidential data.

### 5. Normal-user UI

Add model and thinking/reasoning controls to Knowledge Search for enabled AI routes.

- Show only effective profiles that are administrator-enabled, accessible, qualified, and route-compatible.
- Thinking choices update when model changes.
- If only one choice is effective, a read-only/hidden control is acceptable, but the effective selection must remain explicit in the request/result/Audit contract.
- FULL_OUTPUT does not show AI model/thinking controls.
- Gemini may remain disabled and must retain its existing safe error/no-failover behavior.

### 6. Server-side effective-policy resolver

Every AI request must resolve and validate:

```text
provider
+ requested/default model profile
+ requested/default thinking profile
+ administrator policy
+ current access state
+ qualification state
+ route/File Search compatibility
```

Client dropdown contents are not authorization.

Reject:

- raw model-ID injection;
- hidden/disabled profile;
- inaccessible/unqualified profile;
- unsupported thinking value;
- stale selection after policy changes;
- multiple/no default where a default is required;
- profile/provider mismatch.

Provider adapters receive only the validated exact model ID, exact thinking value/omission, and bounded output setting.

### 7. Qualification

Implement small synthetic per-profile qualification for the capabilities Knowledge Share actually needs:

```text
API_ACCESS
BASE_RESPONSE
FILE_SEARCH
EXACT_FILTER
SOURCE_NORMALIZATION
THINKING_VALUE_ACCEPTED_OR_PROVIDER_DEFAULT
OUTPUT_LIMIT_ACCEPTED
LATENCY_SANITY
CLEANUP
```

Qualification must use temporary synthetic resources or the existing isolated connection-test mechanism and clean them up.

Do not run a large corpus campaign for every model. For CODEX-01:

- the currently qualified OpenAI default profile is the only mandatory live profile;
- at most one additional administrator-configured profile may be live-qualified if it is already accessible and doing so is needed to prove selector switching;
- unavailable newest models and historical models may be represented/tested deterministically without repeated live calls;
- no Gemini live calls;
- no broad Meeting/Pitchbook sync;
- no large-fixture retry.

### 8. Audit and response contract

Record only safe effective selection metadata already permitted by policy:

- provider;
- stable model profile ID and/or effective model ID;
- stable thinking profile ID and effective raw level/omission;
- policy version;
- result/safe error;
- existing safe latency/usage fields.

Do not record questions, answers, chunks, source bodies, credentials, raw provider payloads, or hidden provider resource IDs.

## Required tests

At minimum cover:

- current Work 0020 default behavior survives migration;
- administrator can hide/prohibit a model such as Sol and users cannot see/use it;
- historical model entry can remain configured and become selectable only when accessible and qualified;
- newest inaccessible model remains hidden/unusable;
- discovery never auto-enables/defaults/qualifies;
- model change updates thinking choices;
- provider-default thinking omission works;
- arbitrary/provider-unsupported thinking is rejected server-side;
- stale browser selection is rejected after policy change;
- raw model ID cannot bypass policy;
- exactly one default per enabled provider;
- disabled Gemini/no-failover remains intact;
- Audit records effective safe profile metadata only;
- existing OpenAI File Search, exact filter, normalized source/citation, and FULL_OUTPUT tests do not regress;
- public surface and administrator authorization remain valid.

Run:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

## Target-runtime qualification

Only after deterministic PASS:

1. deliver/read back the exact tested source once to the existing standalone Apps Script project;
2. create at most one immutable Apps Script version and update the same existing private Web App once;
3. preserve the stored OpenAI API key without reading, logging, replacing, or exposing it;
4. confirm the migrated current default profile resolves to the same qualified OpenAI model behavior;
5. confirm administrator policy can hide one synthetic/disabled profile;
6. confirm the normal-user model/thinking controls expose only effective choices;
7. run one bounded `DOC-000017` query and one bounded `MTG-000005` query through the selected/default profile and require one authoritative normalized source each;
8. verify FULL_OUTPUT remains API-independent;
9. verify no mutation of `DOC-000018` or old large fixtures;
10. update the runtime locator with exact source commit and deployment version.

## Scope discipline / completion rule

This Work is complete when the policy registry, administrator control, user selectors, server enforcement, current-profile qualification, and non-regression gates pass.

Merge blockers are limited to:

- policy bypass or unauthorized model/thinking execution;
- API key/secret or confidential-data exposure;
- current OpenAI File Search/citation regression;
- data/state corruption or duplicate provider resources;
- normal administrator/user flow not completing;
- deterministic or bounded target-runtime qualification failure.

Do not extend Work 0025 for cosmetic UX, exhaustive provider catalogs, exhaustive latency benchmarking, unavailable company models, Gemini recovery, or optional persistence of per-user preferences. Route those to FIX SOON/BACKLOG and move to Work 0021.

## GitHub delivery

Create a new branch from the exact current main, suggested name:

`agent/0025-model-thinking-policy`

Create/update:

- `docs/handoffs/0025-dispatches.md`;
- `docs/handoffs/0025-instruction.md`;
- `docs/handoffs/0025-report.md`;
- `docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md`;
- affected decisions/plans/roadmap;
- `docs/operations/runtime-artifact-locator.md`;
- one Draft PR targeting `main`.

Commit and push all scoped changes. Do not merge the PR.

## Completion latch

```text
MODEL_POLICY_REGISTRY: PASS | FAIL
ADMIN_MODEL_CONTROL: PASS | FAIL
ADMIN_THINKING_CONTROL: PASS | FAIL
USER_MODEL_SELECTOR: PASS | FAIL
USER_THINKING_SELECTOR: PASS | FAIL
SERVER_SIDE_POLICY_ENFORCEMENT: PASS | FAIL
CURRENT_DEFAULT_MIGRATION: PASS | FAIL
API_ACCESS_GATE: PASS | FAIL
PROFILE_QUALIFICATION_GATE: PASS | FAIL
HISTORICAL_MODEL_SUPPORT: PASS | FAIL
NO_AUTO_LATEST_SWITCH: PASS | FAIL
NO_COST_ESCALATION_FALLBACK: PASS | FAIL
OPENAI_REGRESSION: PASS | FAIL
FULL_OUTPUT_REGRESSION: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL
RUNTIME_DEPLOYMENT_VERSION: <version | unchanged>
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

## Mandatory final chat response

The final response must begin and end with:

```text
WORK_ID: 0025
DISPATCH_ID: 0025-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```
