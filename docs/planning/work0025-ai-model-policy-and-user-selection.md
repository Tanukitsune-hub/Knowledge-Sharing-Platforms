# Work 0025 — AI model policy and user selection

WORK_ID: 0025
STATUS: IMPLEMENTED / LOGIC PASS / TARGET-RUNTIME QUALIFICATION PENDING
DEPENDENCY: Work 0020 OpenAI primary path stable

Authoritative decision:
`docs/decisions/ai-model-policy-and-thinking-controls.md`

## Goal

Make model and thinking/reasoning selection a normal user feature while keeping final availability under administrator control and current API-key/project capability constraints.

A normal user should be able to choose only approved combinations, for example:

```text
Model: Luna / Terra / Sol / approved historical model
Thinking: 高速 / 標準 / 深掘り or provider-specific equivalent
```

An administrator must be able to hide or prohibit any model or thinking level regardless of whether the provider technically exposes it.

## Required behavior

### User screen

- model selector on AI Knowledge Search;
- thinking/reasoning selector dynamically dependent on selected model;
- only currently effective/qualified administrator-approved combinations shown;
- administrator default preselected;
- disabled/unavailable selections never sent to provider;
- no source-code editing required when model policy changes.

### Administrator screen

Provide a private model-policy management section that can:

- discover models visible to the configured credential/project;
- add/retain historical model IDs manually;
- enable/disable each model for normal users;
- set display labels and family labels;
- configure allowed thinking levels per model;
- configure default thinking per model;
- choose one default profile per provider;
- record/access qualification state;
- re-run bounded synthetic qualification for a selected profile;
- show last access/qualification result without exposing API credentials;
- prevent a newly discovered model from becoming active without explicit approval.

## Policy resolution

Effective availability must equal:

```text
provider model exists/is reachable
AND credential/project can access it
AND required Knowledge Share capabilities qualify
AND administrator enables it
AND selected thinking level is supported/allowed
```

The server must validate this on every request. Browser dropdown contents are not sufficient authorization.

## Company-key compatibility

The design must not assume the company key has access to the newest model family.

The catalog must support older models and mixed generations. A model can remain visible to administrators but hidden from users because:

- key/project access is unavailable;
- File Search is unavailable;
- thinking compatibility is unknown;
- qualification failed;
- company policy disables it;
- cost policy disables it.

## Suggested internal model profile

Illustrative only; exact schema should follow existing Settings architecture:

```json
{
  "profile_id": "OPENAI:gpt-x:default",
  "provider": "OPENAI",
  "model_id": "provider-exact-id",
  "display_name": "Terra",
  "family": "Terra",
  "admin_enabled": true,
  "user_visible": true,
  "api_access": "ACCESSIBLE",
  "qualification": "QUALIFIED",
  "allowed_thinking": ["low", "medium", "high"],
  "default_thinking": "low",
  "requires_file_search": true,
  "max_output_tokens": 2048,
  "is_default": true
}
```

Do not hard-code this exact physical shape if the existing Settings/config model has a simpler validated representation.

## Qualification matrix

Each selectable model-thinking combination should be checked for the actual route capabilities required by Knowledge Share.

At minimum:

```text
API_ACCESS
BASE_RESPONSE
FILE_SEARCH
EXACT_FILTER
SOURCE_NORMALIZATION
THINKING_VALUE_ACCEPTED
OUTPUT_LIMIT_ACCEPTED
LATENCY_SANITY
```

Do not run a large full corpus qualification for every dropdown change. Use a small synthetic self-test for capability qualification and keep representative latency benchmarking as a separate operational measurement.

## Migration/default behavior

When this Work is introduced:

- preserve the then-current qualified OpenAI model/thinking pair as the administrator default;
- do not change existing search results merely because model selection becomes configurable;
- user-specific selection may initially be session/local preference; persistent per-user preference can be added if it fits existing user settings cleanly;
- stale selections must fall back only according to explicit administrator policy, never silently to a higher-cost model.

## Tests

Required deterministic tests include:

- administrator can disable Sol and normal user cannot see/use it;
- historical model can be configured and shown if qualified/access-allowed;
- inaccessible newest model remains unavailable even if administrator entry exists;
- thinking choices change when model changes;
- unsupported model-thinking combination is rejected server-side;
- stale browser selection is rejected after administrator policy changes;
- exactly one default profile per provider;
- model discovery never auto-enables a model;
- raw custom model IDs cannot bypass policy;
- Audit records effective model/thinking but no secret/provider resource identity.

## Completion criteria

```text
MODEL_POLICY_REGISTRY: PASS
ADMIN_MODEL_CONTROL: PASS
ADMIN_THINKING_CONTROL: PASS
USER_MODEL_SELECTOR: PASS
USER_THINKING_SELECTOR: PASS
API_ACCESS_GATE: PASS
QUALIFICATION_GATE: PASS
HISTORICAL_MODEL_SUPPORT: PASS
SERVER_SIDE_POLICY_ENFORCEMENT: PASS
NO_AUTO_LATEST_SWITCH: PASS
NO_COST_ESCALATION_FALLBACK: PASS
AUDIT_MODEL_THINKING: PASS
FINAL_INTEGRITY: PASS
```

## Sequence

Do not start implementation while Work 0020 provider qualification is still being repaired. After Work 0020 closes:

1. inventory current Settings/admin/user search UI;
2. implement validated policy registry;
3. retain exact administrator-entered model IDs; defer optional provider discovery unless it adds decision-relevant value;
4. implement admin policy UI;
5. implement user model/thinking selectors;
6. implement server-side effective-policy resolver;
7. add synthetic profile qualification;
8. run deterministic/full tests;
9. perform bounded live qualification with approved non-confidential data;
10. update deployment/readiness documentation.
