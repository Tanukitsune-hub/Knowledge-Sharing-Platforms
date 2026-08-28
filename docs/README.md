# Documentation

Current as of: 2026-08-28

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
- `planning/post0015-spec-impact-and-implementation-sequence.md` — cross-cutting source/schema/UI/search/AI impact matrix

### Durable decisions

- `decisions/counterparty-entity-classification.md` — GP/non-GP Meeting classification
- `decisions/temporal-data-contract.md` — Business Date/Time, Instant, Duration
- `decisions/ai-provider-selection-and-full-output.md` — ChatGPT/Gemini/full-output routes, no failover, output UX
- `decisions/target-runtime-first-development.md` — target runtime, isolated data, effects, staging, readiness
- `decisions/shared-drive-production-root.md` — production Shared Drive root
- `decisions/pitchbook-upload-limits.md` — 25MB/file, 10 files, 100MB total
- `decisions/audit-access-and-user-attribution.md` — best-effort Actor and Restricted Audit
- `decisions/decision-log.md` — consolidated durable decisions

### Work plans

- `planning/work0016-counterparty-entity-foundation.md`
- `planning/work0022-temporal-data-contract-hardening.md`
- `planning/work0017-meeting-activity-analytics.md`
- `planning/work0018-relationship-explorer.md`
- `planning/work0019-entity-workspace-strategy-drilldown.md`
- `planning/work0020-personal-pc-gemini-core-qualification.md` — AI Provider Core / dual File Search / full output
- `planning/work0021-knowledge-search-filters-multi-entity-comparison.md` — filters / five modes / comparison / provider parity

### Runtime, AI, and security

- `operations/runtime-policy.md` — runtime identity/access/retry/Audit/rollout
- `ai/provider-neutral-file-search.md` — OpenAI/Gemini File Search adapters and canonical full output
- `ai/gemini-file-search.md` — superseded Gemini-only compatibility pointer
- `governance/security.md` — information/credential/access handling

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
- Counterparty Type -> Entity classification;
- Team, Fund/Strategy, Meeting Type, Related Pitchbooks, and follow-up metadata;
- GP/Entity Workspaces;
- Activity Analytics and narrow monthly administrative check;
- Relationship Explorer;
- provider-neutral Knowledge Export and canonical full-text package;
- planned OpenAI and Gemini File Search adapters;
- exactly three user-facing generation choices: `ChatGPT / Gemini / 全文出力`;
- five Knowledge Search modes;
- explicit normal-user public facade and private setup/diagnostic/trigger helpers.

## AI route baseline

```text
ChatGPT
→ OpenAI File Search
→ grounded answer + citations

Gemini
→ Gemini File Search
→ grounded answer + citations

全文出力
→ canonical Knowledge Package
→ コピー / Google Docs / PDF
```

There is no automatic provider failover. A disabled/unconfigured API returns a safe provider-specific error.

The full-output buttons appear above the body. The full-text preview is at the bottom, fixed-height, and internally scrollable so users can output without reading or page-scrolling through it.

## Temporal contract

```text
Business Date -> YYYY-MM-DD / configured timezone
Business Time -> HH:mm / configured timezone
Instant       -> UTC ISO-8601
Duration      -> integer / named unit
```

Equivalent Sheets `Date`, canonical string, and strict ISO representations behave identically in Audit, Search, Export, deterministic AI metadata, and workspaces. Historical Date/Time cells are not bulk-rewritten.

## Current development sequence

```text
0015 GP Workspace [ACCEPTED]
→ 0016 Counterparty entity foundation [ACCEPTED]
→ 0022 temporal data contract hardening [ACCEPTED]
→ 0017 analytics / monthly checks [ACCEPTED]
→ 0018 Relationship Explorer [ACCEPTED]
→ 0019 Entity Workspace / Fund-Strategy drill-down [CURRENT]
→ 0020 AI provider core / OpenAI + Gemini File Search / full output
→ 0021 structured filters / five modes / multi-Entity / provider parity
→ historical migration (manual / hybrid / selective automation)
→ final production qualification
```

Advanced follow-up task workflow and a separate static GP-comparison dashboard are not planned. Follow-up remains informational; numeric comparison belongs to analytics and qualitative comparison to Knowledge Search.

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

AI Works additionally report OpenAI, Gemini, and full-output matrices separately.

A mock, CI run, simulator, alternate runtime, or test loader proves only what it exercised.

## Repository data policy

GitHub stores design, source code, and synthetic/anonymized tests only. Do not commit real Meeting records, Pitchbooks, personal information, non-public deal information, credentials, organization-specific resource IDs, private URLs, deployment IDs, provider Store IDs, or local machine mappings.
