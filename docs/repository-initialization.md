# Repository Initialization and Re-Profile Guide

Use this guide when a repository is first generated from the development template or when material changes make its existing Repository-Specific Rules unreliable.

The output is a concise, verified profile inside root `AGENTS.md`, not a completed copy of every section below. Delete or omit anything that does not materially improve agent execution.

## Operating rules

- Inspect the repository and explicit project requirements before writing rules.
- Use verified repository facts, executable configuration, observed behavior, or explicit user requirements.
- Do not invent architecture, commands, versions, constraints, or conventions to fill a field.
- Use `Not established` when a fact is genuinely unknown and not required for safe work.
- Prefer source-of-truth paths and routing over duplicated explanations.
- Keep detailed procedures in focused documentation or reusable Skills.
- When repository configuration and existing guidance disagree, investigate which is stale instead of blindly copying either.
- Do not mark the profile `ACTIVE` while placeholder tokens remain.

## 1. Purpose and boundaries

Determine:

- the outcome this repository exists to produce;
- the primary user or consumer;
- primary deliverables;
- owned responsibilities;
- important in-scope work;
- explicit non-goals and neighboring systems owned elsewhere.

A useful purpose statement lets an agent distinguish necessary implementation from scope expansion.

## 2. Sources of truth

Identify authoritative locations for:

- application or model behavior;
- configuration;
- schemas, contracts, and persisted formats;
- generated artifacts and their editable sources;
- user-facing documentation;
- external systems or documents explicitly designated as authoritative.

Distinguish authored source, generated output, cache, fixture, example, and external reference. If an output is generated, record what must be edited and how the output is regenerated.

## 3. Project map

List only paths needed for safe navigation:

| Path | Responsibility | Write Policy / Notes |
|---|---|---|
| `<path>` | `<responsibility>` | `<source / generated / restricted / other>` |

Include important entry points, core modules, schemas, tests, generators, and integration boundaries. Do not create a complete file inventory.

## 4. Architecture and responsibility boundaries

Record:

- major components and their ownership;
- dependency or data-flow direction;
- where orchestration ends and domain logic begins;
- which component is the sole source of truth for each important concern;
- boundaries whose violation would create duplication, inconsistent behavior, or architectural drift.

Prefer a link to maintained architecture documentation when the explanation no longer fits concisely in `AGENTS.md`.

## 5. Architecture and domain invariants

Write only durable truths that can be tested or inspected, for example:

- financial identities or model relationships;
- valid state transitions;
- dependency direction;
- schema compatibility;
- ordering and idempotency guarantees;
- public API or file-format contracts;
- authored-versus-generated ownership;
- separation between runtime and deployment concerns.

Do not record preferences, aspirations, or temporary implementation choices as invariants.

## 6. Runtime, toolchain, and environment

Record:

- language and runtime;
- supported versions when material;
- package or dependency manager;
- primary platform assumptions;
- required local applications;
- external services;
- environment restrictions;
- environment-variable names and purpose, never secret values.

Use a small table for external services or settings only when it improves clarity.

## 7. Exact commands

Derive canonical commands from executable repository configuration such as a task runner, `Makefile`, package scripts, project files, or CI.

Record as applicable:

- setup;
- build;
- targeted tests;
- full test suite;
- lint and formatting;
- type or static checks;
- runtime or smoke tests;
- native-application or manual validation;
- generation or synchronization commands.

Do not invent conventional commands. State when each command applies and whether it is safe to run concurrently.

## 8. Validation matrix

Define risk-based expectations:

| Change Type | Required Validation | Expected Evidence |
|---|---|---|
| Small isolated logic change | `<validation>` | `<evidence>` |
| Cross-component change | `<validation>` | `<evidence>` |
| Schema or contract change | `<validation>` | `<evidence>` |
| Generated artifact change | `<validation>` | `<evidence>` |
| Release or final integration | `<validation>` | `<evidence>` |

Adapt rows to the repository. Do not require every possible check for every change.

## 9. Generated files and derived artifacts

For each material artifact, record:

| Artifact / Path | Generated From | Regeneration Method | Manual Editing |
|---|---|---|---|
| `<artifact>` | `<source>` | `<command or procedure>` | `<allowed / prohibited>` |

Also decide whether generated artifacts are committed, whether deterministic reproduction is expected, and whether native recalculation, rendering, signing, or comparison with checked-in references is required.

## 10. External and durable contracts

Record compatibility requirements for applicable surfaces:

- public APIs;
- CLI interfaces;
- spreadsheet, file, and database schemas;
- external payloads;
- user-visible configuration;
- persisted state;
- released behavior;
- integration contracts.

Be explicit about which compatibility boundary is released or supported. Do not create speculative compatibility obligations.

## 11. Known traps and failure modes

Capture repository-specific mistakes that a competent agent could still reasonably make:

| Trap / Symptom | Cause or Risk | Correct Handling |
|---|---|---|
| `<trap>` | `<cause>` | `<handling>` |

Good entries include misleading commands, generated files that look editable, hidden coupling, platform-specific behavior, unusual test setup, legacy failures, and tempting but incorrect fixes.

Do not use this as a general bug backlog.

## 12. Restricted or high-risk areas

Identify paths or operations needing extra care, such as:

- production deployment configuration;
- migrations or destructive scripts;
- authentication and authorization;
- financial calculation engines;
- signed or regulated artifacts;
- compatibility layers;
- secrets or private data;
- costly or irreversible external actions.

State the restriction and why it matters.

## 13. GitHub, branch, and CI rules

Record only repository-specific additions to Core Rules:

- default development branch when material;
- required checks;
- release workflow;
- workflows with special meaning;
- known infrastructure-only failures;
- branch, commit, or pull-request conventions.

Do not duplicate generic Git safety guidance.

## 14. Documentation and decision records

Identify documentation that must stay synchronized with implementation:

- architecture;
- decisions;
- product or model specifications;
- validation records;
- durable handoffs;
- user-facing documentation.

Create documentation only when it preserves knowledge that is not obvious from the code or executable configuration.

## 15. Workflow and Skill routing

Route repeatable work instead of copying the procedure into `AGENTS.md`:

| Situation | Skill / Documentation / Procedure |
|---|---|
| `<task type>` | `<skill or path>` |

Use routes only when they materially improve consistency. Verify referenced paths exist.

## 16. Nested instructions and overrides

Use:

- nested `AGENTS.md` for durable rules applying to a subtree;
- `AGENTS.override.md` when the regular instruction file in that same directory must be intentionally replaced.

Record each local instruction file and scope in the root profile. Keep critical root rules compact so the combined instruction chain stays within agent context limits.

After adding or changing instruction files, start a new Codex run and verify which sources are active.

## 17. Code review rules

Add rules only when they describe repository-specific behavior to flag, a safe path, or an accepted exception.

Good review rules are:

- concrete;
- attributable to a diff;
- focused on behavior, invariants, contracts, security, or reliability;
- located in the closest applicable instruction file.

Leave mechanical formatting and lint checks to automation.

## 18. Repository-specific completion and escalation

Add only requirements that materially affect whether work is safe and usable:

- native application validation;
- generated artifact regeneration;
- schema synchronization;
- compatibility evidence;
- manual runtime checks;
- required documentation updates.

Add repository-specific escalation conditions only when normal implementation cannot safely proceed.

## Activation checklist

Change `REPOSITORY_RULES_STATUS` to `ACTIVE` only when all applicable items pass:

- [ ] Project purpose, primary user, deliverables, scope, and material non-goals are clear.
- [ ] Sources of truth and editable-versus-generated ownership are verified.
- [ ] The project map covers important entry points, tests, generators, and integration boundaries.
- [ ] Material architecture boundaries and invariants are recorded or routed to maintained documentation.
- [ ] Runtime, environment, and exact commands are verified from executable configuration.
- [ ] Validation expectations are risk-based and evidence-oriented.
- [ ] Generated artifacts and durable contracts are addressed where applicable.
- [ ] Known traps and high-risk areas have been reviewed.
- [ ] Workflow, documentation, Skill, and local-instruction routes exist and are valid.
- [ ] Repository-specific code review, completion, and escalation rules are included only where necessary.
- [ ] No `<placeholder>` tokens remain in the Repository-Specific Rules section.
- [ ] The project README has replaced generic template boilerplate.
- [ ] A new agent run confirms the intended instruction sources are active.
