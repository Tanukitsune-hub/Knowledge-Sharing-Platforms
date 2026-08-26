# Repository Initialization and Re-Profile Guide

Use this guide when material change makes the current Repository-Specific Rules unreliable. The output is a concise verified profile in root `AGENTS.md`, not a copy of this questionnaire.

## Operating rules

- Inspect the repository and explicit requirements before writing instructions.
- Use verified facts, executable configuration, observed behavior, or explicit user requirements.
- Use `Not established` when an unknown is not required for safe work.
- Prefer source paths and routes over duplicated explanations.
- Do not activate a profile with unresolved placeholders.
- Keep active Work state and incident chronology outside root `AGENTS.md`.
- Default BUILD work to the actual target runtime with isolated test data/resources and guarded side effects.
- Do not create a separate DEV/Staging runtime without a material justification under `docs/decisions/target-runtime-first-development.md`.

## 1. Outcome and work control

Identify:

- the repository's user-visible purpose and primary deliverables;
- material scope and non-goals;
- likely work modes;
- strongest acceptable evidence for UI, Apps Script, Workspace, browser, Gemini, security, and data-integrity behavior;
- the shortest coherent target-runtime slice that can prove the architecture early;
- external-action authorization boundaries;
- incident mitigations and rollback paths.

Route task-level execution to `docs/agent-governance/work-control.md`; do not encode temporary attempt budgets, active Work status, or hypotheses in the root profile.

## 2. Sources of truth and project map

Identify authoritative locations for application behavior, configuration, schemas, generated artifacts, documentation, and explicitly designated external systems.

List only paths needed for safe navigation:

| Path | Responsibility | Write policy |
|---|---|---|
| `<path>` | `<responsibility>` | `<source / generated / restricted / other>` |

Distinguish production source, generated output, cache, fixture, example, isolated test resource, historical evidence, and external reference.

For this repository, verify current routes at minimum for product, architecture, implementation plan, runtime policy, target-runtime decision, security, decision log, handoffs, and validation.

## 3. Architecture, boundaries, and invariants

Record major components, dependency direction, responsibility boundaries, and durable testable invariants. Link maintained architecture documents when the explanation no longer fits concisely.

Include separation between:

- production source and test-only helpers;
- target runtime and local/simulated harnesses;
- isolated test data/resources and authoritative production data;
- deployment state and user/public exposure;
- guarded side effects and enabled side effects;
- Shared Drive authoritative sources and Gemini-derived/rebuildable index;
- normal-user public facade and private/editor-only Apps Script functions.

## 4. Target runtime, data, and exact commands

Derive commands from executable configuration rather than convention.

Record:

- actual Apps Script project/runtime, Workspace APIs, Web App deployment shape, browser behavior, and approved Gemini/File Search path;
- supported runtime/toolchain versions when material;
- isolated test-data namespace, folder, Spreadsheet, Doc, account, resource, stable ID, or record prefix;
- side-effect controls such as dry-run, inactive deployment, test recipients, disabled triggers, allowlists, bounded counts, exact-ID checks, or cleanup route;
- setup and synchronization;
- targeted and full logic tests;
- lint/static/diff checks;
- target-runtime smoke/native/manual qualification;
- safety and concurrency constraints.

Do not label a local simulator, mock, test loader, CI runner, alternate Apps Script project, My Drive substitute, or alternate office suite as the target runtime unless the delivered capability will actually operate there.

## 5. Separate staging decision

The default is `Not required`. A separate DEV/Staging runtime needs a recorded material reason, such as:

- unacceptable irreversible data blast radius despite isolated data and guarded effects;
- legal, regulatory, security, tenant, or segregation requirements;
- migration, concurrency, scale, public routing, or rollback that cannot be exercised safely in the target runtime;
- material Gemini billing, rate-limit, availability, or operator disruption;
- a platform that cannot safely isolate test resources or feature exposure;
- an explicit user requirement.

State the unique evidence the extra environment provides, its differences from the target, synchronization method, and retirement condition. Do not maintain a second environment that cannot faithfully reproduce required functions, APIs, permissions, Workspace object shapes, persistence, rendering, or deployment behavior.

## 6. Risk-based validation

Define the evidence needed by change type:

| Change type | Logic validation | Target-runtime qualification | Side-effect boundary |
|---|---|---|---|
| Small isolated pure logic | targeted deterministic test | `N/A` or focused smoke when runtime coupling exists | explicit state |
| Meeting/Pitchbook cross-component | schema/validation/ID/retry regression | isolated create, persist, reopen, search/readback | production data/users guarded |
| Schema or durable contract | migration/idempotency/invariants | exact resource migration/readback | destructive migration disabled unless authorized |
| Drive/Docs/browser integration | mapping/link/state tests | actual parent/link/object/browser evidence | broad exposure/cleanup guarded |
| Gemini/File Search | request/filter/citation contract | authorized synthetic index/query/citation | billing/confidential indexing guarded |
| Trigger/worker | handler/idempotency tests | authorized trigger or direct-handler runtime evidence | trigger disabled until authorized |
| Production rollout | full relevant logic suite | exact target, permissions, data/access, rollback evidence | explicitly enabled effects only |

Do not require every possible check for every change. Do not infer target-runtime readiness from logic-only evidence.

## 7. Generated artifacts and durable contracts

For each material artifact, state its editable source, regeneration method, commit policy, and whether native rendering/readback is required.

Record compatibility obligations only for actually released or supported Apps Script facade functions, schemas, files, configuration, persisted state, export formats, and links.

## 8. Traps and restricted operations

Capture mistakes a competent agent could still make:

| Trap or symptom | Cause or risk | Correct handling |
|---|---|---|
| Test loader passes while Apps Script fails | helper/shape exists only in harness | require production-source helper and target-runtime smoke/readback |
| Source appears correct but wrong remote project is mutated | project identity not independently proven | read back exact Script/resource/deployment identity before write |
| My Drive check is treated as Shared Drive evidence | runtime semantics differ | record Shared Drive behavior as unobserved unless actually exercised |
| Trigger/setup is enabled during a feature smoke | side effect is coupled to implementation | keep effect disabled/guarded and authorize separately |
| Name-only cleanup selects wrong resource | ambiguous identity | use exact IDs, parent, count, allowlist, and bounded cleanup |

Identify production deployment, destructive scripts, migrations, authentication/authorization, billing, triggers, secrets, confidential data, permissions, and other high-risk areas.

Do not use this section as a bug backlog or incident diary.

## 9. Workflow and instruction routing

Record focused routes for architecture, decisions, validation, handoffs, Skills, generated docs, and nested instructions.

Use:

- `docs/agent-governance/work-control.md` for modes and evidence;
- `docs/agent-governance/dispatch-control.md` for Work/Dispatch ownership;
- `docs/decisions/target-runtime-first-development.md` for environment/data/side-effect policy;
- nested `AGENTS.md` for durable subtree rules;
- `AGENTS.override.md` only for intentional same-directory replacement;
- the canonical shared knowledge hook instead of copying cross-repository lessons;
- GitHub issues or follow-up lists for tangential work.

## 10. Repository-specific completion and review

Add only requirements not already covered by Core Rules, such as:

- exact Apps Script/source/target identity;
- Workspace persist/readback;
- Shared Drive parentage/permission behavior;
- public-facade privacy boundary;
- schema/setup idempotency;
- Audit redaction/access;
- Gemini citation/source traceability;
- side-effect state and rollout authorization.

Behavior-oriented code-review rules belong near affected code. Leave mechanical formatting and lint checks to automation.

## Activation checklist

Set `REPOSITORY_RULES_STATUS: ACTIVE` only when:

- [ ] purpose, primary user, deliverables, scope, and non-goals are clear;
- [ ] sources of truth and project map are verified;
- [ ] architecture boundaries and invariants are recorded or routed;
- [ ] actual target runtime and deployment shape are named;
- [ ] isolated test-data/resources and side-effect controls are defined;
- [ ] separate staging is rejected by default or materially justified;
- [ ] exact commands and environment assumptions are verified;
- [ ] logic validation and target-runtime qualification are distinguished;
- [ ] generated artifacts and durable contracts are addressed;
- [ ] high-risk operations, rollback routes, and known traps are reviewed;
- [ ] documentation, knowledge, handoff, dispatch, and local-instruction routes exist;
- [ ] no placeholder tokens remain in the active profile;
- [ ] the README is project-specific;
- [ ] `python tools/validate_agent_foundation.py` passes;
- [ ] a fresh agent run confirms the intended instruction chain.
