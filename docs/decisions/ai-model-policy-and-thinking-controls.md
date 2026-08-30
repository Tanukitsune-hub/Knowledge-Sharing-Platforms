# AI model policy and thinking controls

Current as of: 2026-08-30

Status: Accepted planning decision

## Purpose

Knowledge Share must allow normal users to choose an AI model and thinking/reasoning level without editing source code, while allowing administrators to centrally control which combinations are actually available in the company environment.

The design must remain usable when:

- model names change over time;
- older models remain approved while newer models are blocked or not yet available to the company API key;
- different models support different thinking/reasoning levels;
- API-key/project permissions differ between environments;
- a model is discoverable but fails File Search or Knowledge Share qualification;
- administrators want to prohibit a model even though the API key can technically use it.

## Core decision

Model IDs and thinking levels are configuration/policy data, not hard-coded product behavior.

The effective user-visible choices are the intersection of four independent gates:

```text
Provider capability / model existence
∩ API key or project access
∩ Knowledge Share qualification
∩ Administrator policy
= choices shown to the user
```

No one gate is sufficient by itself.

## User experience

The Knowledge Search screen should expose, for each enabled AI provider:

```text
Model
[ administrator-approved model choices ]

Thinking / Reasoning
[ administrator-approved levels compatible with that model ]
```

Examples may include Luna / Terra / Sol families or older approved models, but the UI must be data-driven rather than hard-coded to a specific generation.

A user must never see a model or thinking level that the administrator has disabled, that the current API credential cannot use, or that has not passed the required Knowledge Share qualification for the active route.

If only one model or one thinking level remains valid, the control may be rendered read-only or hidden according to UX preference, but the effective selection must still be recorded.

## Administrator policy

The private administrator screen must manage a model policy catalog. Each entry should support at least:

- provider code;
- exact provider model ID;
- administrator display name;
- optional family/tier label such as Luna / Terra / Sol;
- enabled for normal users: true/false;
- administrator default: true/false;
- allowed thinking/reasoning levels;
- default thinking/reasoning level;
- File Search required/allowed flag;
- optional output-token ceiling;
- optional notes/reason for restriction;
- qualification state;
- API-access state;
- last capability check timestamp;
- last Knowledge Share qualification timestamp.

Administrators must be able to express policies such as:

```text
Sol: disabled for normal users
Terra: enabled, low/medium/high allowed
Luna: enabled, none/low/medium allowed
OlderModel-X: enabled because company key supports it
NewestModel-Y: hidden because company key does not support it yet
```

The policy must support older model IDs as first-class entries. Do not assume that the newest provider model is permitted by the company project.

## Capability discovery and manual catalog

Provider model-list APIs may be used as discovery input, but they are not authoritative product policy.

For OpenAI, model discovery may use the Models API under the configured project key. Discovery answers only whether a model is visible to that credential at that time; it does not prove File Search compatibility, reasoning-level compatibility, latency suitability, or administrator approval.

The administrator must also be able to add or retain a model ID manually, including historical models, because company projects may expose a different catalog from personal DEV environments and model-list behavior may change.

No automatic switch to a newly discovered/latest model is allowed merely because it exists.

## Qualification state machine

Each provider/model profile should have an explicit state such as:

```text
DISCOVERED
ACCESSIBLE
QUALIFIED
BLOCKED
DEPRECATED
```

A normal user may select only `QUALIFIED` profiles that are also administrator-enabled.

Qualification for a Knowledge Search model must test the capabilities actually required by the product, not just a text-only completion. At minimum where applicable:

- base model request;
- File Search / retrieval;
- exact metadata filter;
- normalized source/citation contract;
- configured thinking/reasoning level;
- bounded output setting;
- acceptable latency/error behavior.

## Thinking/reasoning flexibility

Thinking/reasoning support must be modeled per model, not globally.

Do not assume that all providers, model generations, or historical models accept the same values.

Represent the provider-facing raw value separately from the normal-user display label. Example:

```text
User label: 高速
Provider value: low

User label: 標準
Provider value: medium

User label: 深掘り
Provider value: high
```

But the administrator must be able to expose raw/provider-specific levels directly if necessary and to configure different allowed sets for different models.

If a model does not support a requested thinking level, that combination must be absent from the user UI and rejected server-side as defense in depth.

## Effective-policy resolver

The server must resolve every query against current effective policy before making a provider request.

Conceptually:

```text
requested provider/model/thinking
-> validate administrator allowlist
-> validate model qualification state
-> validate credential/project accessibility
-> validate model-thinking compatibility
-> validate route/tool compatibility
-> execute provider request
```

Client-side dropdown restrictions alone are not authorization.

If an administrator disables a model after a user loaded the page, the server-side resolver must reject a stale selection safely.

## Defaults and resilience

There must be one administrator-defined default model profile per enabled provider.

If the default later becomes inaccessible or unqualified:

- do not silently move the user to a more expensive or stronger model;
- choose another model only if an explicit administrator fallback policy exists;
- otherwise return a clear unavailable/configuration error.

No automatic OpenAI/Gemini cross-provider failover is introduced by this decision.

## Audit and observability

For successful or failed AI requests, safe Audit/telemetry may record:

- provider;
- effective model ID or stable internal model-profile ID;
- effective thinking/reasoning level;
- qualification/policy profile version;
- latency/usage fields already allowed by the Audit contract;
- result/safe error code.

Do not log API keys, source bodies, raw provider payloads, or hidden provider resource IDs.

## Configuration storage

The implementation should use a structured server-side model-policy registry rather than scattered constants.

The registry may initially live in the existing Settings/config architecture if that can preserve validation and administrator-only mutation. Do not introduce a new database or sheet solely for this feature unless the existing configuration structure cannot represent the required catalog safely.

## Relationship to Work 0020

Work 0020 should continue to qualify one stable OpenAI profile and finish the provider/search lifecycle. Do not add this model-policy feature to CODEX-18 or otherwise delay provider qualification.

The model/thinking selection system is a separate follow-on Work after the OpenAI primary path is stable.

## Non-goals

- automatically enabling every model returned by a provider API;
- automatically switching to the newest model;
- silently upgrading users to a more expensive model;
- allowing users to bypass administrator policy by supplying a raw model ID;
- assuming a global thinking-level enum works for all models/providers;
- automatic cross-provider failover.
