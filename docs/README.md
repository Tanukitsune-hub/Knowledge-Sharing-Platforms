# Documentation

Current as of: 2026-08-27

This directory records the active product, architecture, runtime, security, roadmap, and delivery contracts for Knowledge Sharing Platforms.

Historical Work/qualification files remain evidence of what they observed. They do not override newer accepted decisions.

## Authority order

1. latest explicit user decision;
2. closest current domain-specific source;
3. current architecture/planning/runtime document;
4. historical Work/handoff wording.

## Current sources of truth

### Product and architecture

- `product/vision.md` — current product purpose and UX
- `architecture/target-architecture.md` — end-to-end architecture and boundaries
- `planning/mvp-and-roadmap.md` — active Work sequence and rollout order
- `planning/apps-script-implementation-plan.md` — target-runtime-first implementation/validation plan

### Counterparty/entity decision and Work plans

- `decisions/counterparty-entity-classification.md` — GP/non-GP Meeting classification architecture
- `planning/work0016-counterparty-entity-foundation.md`
- `planning/work0017-meeting-activity-analytics.md`
- `planning/work0018-relationship-explorer.md`
- `planning/work0019-entity-workspace-strategy-drilldown.md`
- `planning/work0020-personal-pc-gemini-core-qualification.md`
- `planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

### Runtime, AI, and security

- `operations/runtime-policy.md` — runtime identity/access/retry/Audit/rollout
- `ai/gemini-file-search.md` — File Search metadata, five modes, comparison, citations
- `governance/security.md` — information/credential/access handling
- `decisions/target-runtime-first-development.md` — target runtime, isolated data, effects, staging, readiness
- `decisions/shared-drive-production-root.md` — production Shared Drive root decision
- `decisions/pitchbook-upload-limits.md` — 25MB/file, 10 files, 100MB total
- `decisions/audit-access-and-user-attribution.md` — best-effort Actor and Restricted Audit
- `decisions/decision-log.md` — consolidated durable decisions

### Agent execution

- `agent-governance/work-control.md`
- `agent-governance/dispatch-control.md`
- `handoff-template.md`
- `handoffs/`
- `core-rules-changelog.md`

## Current product baseline

- one organization-controlled Apps Script Web App;
- Shared Drive authoritative Meeting/Pitchbook sources;
- five-sheet Backend with append-only evolution;
- separate Restricted Audit Spreadsheet;
- stable Meeting/Document/Batch/Master IDs;
- Meeting/Pitchbook registration and maintenance;
- Team, Fund/Strategy, Meeting Type, Related Pitchbooks, and follow-up metadata;
- GP Workspace under Work 0015;
- Knowledge Export;
- Gemini/File Search source/query foundation;
- five Knowledge Search modes;
- explicit normal-user public facade and private setup/diagnostic/trigger helpers.

## Prospective Meeting entity model

Work 0016 replaces the global Meeting GP requirement with:

```text
Counterparty Type
  -> Counterparty Entity
```

Categories:

```text
GP / 運用会社
LP / Asset Owner
日本生命
グループ会社
Consultant / Gatekeeper
その他
```

GP entities continue to use `GP_Master`; non-GP entities use category-specific `Option_Master` Types. The Backend remains five sheets.

## Current development sequence

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0017 analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 personal-PC Gemini/File Search core
→ 0021 structured filters / multi-entity comparison
→ historical migration (manual / hybrid / selective automation)
→ final production qualification
```

Advanced follow-up task workflow and a separate static GP-comparison dashboard are not planned. Follow-up remains informational; qualitative comparison belongs to Gemini.

## Development and validation policy

```text
bounded preflight
→ shortest coherent production-source vertical slice
→ actual Apps Script / Workspace / Web App target runtime
→ isolated synthetic/anonymized data/resources
→ guarded side effects
→ focused LOGIC_VALIDATION
→ bounded TARGET_RUNTIME_QUALIFICATION
→ expand after native readback
→ separately authorize production data/users/billing/triggers/destructive effects
```

Report:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

A mock, CI run, simulator, alternate runtime, or test loader proves only what it exercised.

## Historical Work map

- 0004: scaffold/setup
- 0005: Meeting vertical slice
- 0006: Pitchbook vertical slice
- 0007: maintenance/concurrency/Masters
- 0008–0009: Gemini source/query foundation, formats, five modes
- 0010: consolidated synthetic qualification
- 0011: Knowledge Export
- 0012: public-surface/reliability hardening
- 0013: qualification/recovery history
- 0014: structured Meeting/Pitchbook context
- 0015: GP Workspace (active until accepted/merged)

## Repository data policy

GitHub stores design, source code, and synthetic/anonymized tests only. Do not commit real Meeting records, Pitchbooks, personal information, non-public deal information, credentials, organization-specific resource IDs, private URLs, deployment IDs, or local machine mappings.
