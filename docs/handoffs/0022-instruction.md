# Work 0022 — Temporal data contract hardening

WORK_ID: `0022`
Dispatch ID: `0022-CODEX-01`
BALL: `CODEX`
STATUS: `COMPLETE`

Mode: `BUILD / QUALIFICATION`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0022-temporal-data-contract-hardening`

Primary decision:

`docs/decisions/temporal-data-contract.md`

Primary plan:

`docs/planning/work0022-temporal-data-contract-hardening.md`

Active execution instruction:

`docs/handoffs/0022-CODEX-01-temporal-contract-hardening-instruction.md`

## Activation evidence

Work 0016 is accepted and merged:

- PR #21 merged/closed;
- merge commit `d77f4c8919b6aeb7e6bea1be76f4e5bd558df5b1`;
- Work 0016 LOGIC_VALIDATION PASS `215/215`;
- TARGET_RUNTIME_QUALIFICATION PASS;
- Apps Script private Web App version `34`;
- BLOCKER NO;
- Completion Latch applied.

This Work branch was created from the post-acceptance main roadmap where Work 0022 was current and the temporal decision was accepted. The bounded
CODEX-01 execution is complete; the contract below remains the authoritative
scope and evidence boundary for the delivered change.

## Primary outcome

Create one repository-wide temporal contract that makes equivalent Google Sheets `Date` objects, canonical Business Date/Time strings, and strict ISO timestamps behave identically across:

- registration/retry/fingerprints;
- maintenance/search/edit/status;
- Audit and changed-field detection;
- Knowledge Export;
- deterministic AI/File Search metadata;
- GP/Entity workspace and relationship views;
- diagnostics/readback;
- the period inputs that Work 0017 analytics will consume.

## Acceptance evidence — strongest first

1. actual private Apps Script Web App proves unchanged Date/Time semantics across edit, Audit, exact search, Export Preview, and deterministic AI metadata;
2. one generic production helper family owns Business Date, Business Time, and Instant normalization;
3. full-tree audit confirms feature-specific algorithms are removed or thin delegates;
4. a canonical static validator fails raw/duplicate temporal patterns;
5. deterministic mixed-representation matrix passes;
6. no historical Date/Time rewrite, schema expansion, duplicate record, trigger, permission, or AI-store mutation;
7. focused tests, `npm run check`, `git diff --check`, public facade, exact source readback, and final integrity pass.

Logic-only evidence cannot replace target-runtime evidence.

## Required scope

Follow the decision and plan. At minimum:

- add generic private temporal helpers;
- distinguish Business Date, Business Time, Instant, and Duration;
- run a complete full-tree temporal inventory before implementation;
- route all confirmed temporal callsites through the generic contract;
- normalize Meeting/Pitchbook Audit snapshots;
- canonicalize Search/Sort, Knowledge Export revision tokens, core/feature-freeze AI `date_key`, and display/read models;
- audit Time handling as carefully as Date handling;
- add a full-tree static temporal validator to `npm run check`;
- replace string-only test assumptions with mixed Sheets-like values;
- run one bounded target-runtime campaign on existing synthetic data.

## Closed conclusions

- accepted timezone remains `KSP_DEFAULTS.TIMEZONE = Asia/Tokyo` and must agree with the Apps Script manifest;
- physical Sheets cells may remain mixed string/Date representations;
- historical Date/Time cells and historical Audit rows are not bulk-rewritten;
- no new Backend sheet or schema version solely for helper refactoring;
- no analytics implementation in this Work;
- no Gemini/File Search billing/index/query call;
- no production rollout;
- no user-selectable timezone.

## Current confirmed hotspots

Minimum known scope includes:

- `src/62_PitchbookIdentity.gs` feature-named canonical Date helper;
- `src/30_MeetingCore.gs` Meeting Date wrapper;
- `src/100_MaintenanceCore.gs` Date/Time/ISO cell conversion and Audit snapshot;
- `src/140_AiSourceModels.gs` raw source `dateKey` serialization;
- `src/155_KnowledgeExportContracts.gs` temporal revision-token/read-model boundaries;
- `src/181_FeatureFreezeSync.gs` raw Pitchbook `dateKey` serialization;
- search/sort/workspace/relationship/diagnostic callsites discovered by the implementation inventory;
- temporal test loaders and fixtures.

This list is a minimum. CODEX-01 must run a repository-wide inventory before changing source.

## Side-effect boundary

After deterministic PASS only, CODEX-01 may:

- synchronize exact tested source once;
- create one immutable version;
- update the same positively identified private Web App in place;
- use one existing synthetic Meeting for one harmless non-identity edit if needed.

It may not:

- create another Web App deployment;
- touch Library deployments;
- rewrite historical temporal cells/Audit rows;
- create new production or confidential records;
- change schema solely for this contract;
- enable triggers;
- call Gemini/File Search;
- perform production rollout.

## Completion latch

Complete only when:

- temporal inventory is recorded;
- generic helpers and static enforcement are in place;
- mixed-representation deterministic matrix passes;
- actual target-runtime Audit/Search/Export/AI/date-time evidence passes;
- no BLOCKER remains;
- report/status/PR are updated;
- ChatGPT reviews and merges the final PR.

## CODEX-01 completion status

The expected classification was achieved:

`DEV QUALIFIED — WORK 0022 TEMPORAL DATA CONTRACT HARDENING`

Production readiness is not claimed.
