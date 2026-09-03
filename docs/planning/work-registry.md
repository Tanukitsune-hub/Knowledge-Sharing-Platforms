# Work Registry and Delivery Order

Current as of: 2026-09-03

Status: Active planning source of truth

## Purpose

This registry separates stable Work identity from execution priority.

A `WORK_ID` is an immutable reference to one outcome/theme. It is not a promise that Works will execute in numeric order. Priority and dependency changes are represented through `DELIVERY_ORDER`, `STATUS`, and `NEXT_ACTION`, not by renumbering historical or planned Works.

This file is the canonical portfolio-level view. Work-specific dispatch state remains authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

## Identity rules

1. Never renumber, reuse, or recycle an issued Work ID.
2. Never rename historical handoff/report files solely to make numbering look sequential.
3. Keep the same Work ID through implementation, qualification, repair, review, and PR stabilization while the primary outcome remains unchanged.
4. Use a new Dispatch ID for another Codex execution within the same outcome.
5. Create a new Work ID only when the primary outcome/deliverable materially changes.
6. New Work IDs use the next number after the highest already issued ID. Do not fill old numeric gaps retroactively.
7. Numeric Work order does not override the delivery sequence below.
8. Only one Work should normally be `ACTIVE` for implementation. Planning work may be `READY` without competing for the active execution slot.

## Status vocabulary

```text
ACCEPTED   — merged/closed outcome; retained as evidence
ACTIVE     — current implementation Work
READY      — fully planned and next in queue
PLANNED    — accepted future outcome, not yet ready to execute
DEFERRED   — intentionally postponed until a stated dependency/phase
BLOCKED    — cannot proceed because of a material external or technical blocker
SUPERSEDED — outcome replaced by another explicit decision/Work
```

## Current delivery sequence

| Delivery order | Work ID | Outcome | Status | Dependency | Next action |
|---:|---|---|---|---|---|
| 0 | 0020 | AI provider core, OpenAI File Search, citations, lifecycle, full output | ACCEPTED | — | Preserve version-58/runtime evidence; do not reopen absent contradictory evidence |
| 1 | 0025 | Administrator-governed model and thinking/reasoning selection | ACCEPTED | 0020 | Preserve version-60 exact tuple qualification/runtime evidence; route non-blocking refinements separately |
| 2 | 0021 | Structured Knowledge Search, five modes, multi-Entity comparison, format matrix | ACCEPTED | 0025 accepted | Preserve PR #34 / merge `533c849b` and version-66 runtime evidence |
| 3 | 0023 | Generated single-file bundle and idempotent installer | ACTIVE | 0021 accepted | Execute `0023-CODEX-01`: deterministic bundle + loader + guarded installer core and first one-paste/runtime slice |
| 4 | Unassigned future Work | Gemini provider recovery against the completed OpenAI reference path | DEFERRED | 0021/0023 substantially complete; current Gemini APIs rechecked | Allocate the next unused Work ID when the recovery campaign starts |
| 5 | Unassigned future Work | Representative large-file indexing qualification/recovery | DEFERRED | Representative production-size corpus selected | Allocate a separate Work ID; do not mix with general provider recovery unless the outcome is genuinely the same |
| 6 | Unassigned future Work | Historical-material migration | PLANNED | Product and installer stable | Choose manual/hybrid/selective automation from the actual corpus |
| 7 | Unassigned future Work | Final company-environment qualification and rollout | PLANNED | Installation, migration approach, company credentials/permissions ready | Qualify actual company Workspace and enabled providers |

## Work 0021 accepted boundary

Work 0021 is complete and merged through PR #34.

```text
MERGE_COMMIT: 533c849bd1229827ec77cd5ad6506312ea286940
PRIVATE_WEB_APP_VERSION: 66
CORE_FILTERS_AND_FIVE_MODES: PASS
MULTI_ENTITY_AND_ADVANCED_FILTERS: PASS
OPENAI_SIX_FORMAT_MATRIX: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
FULL_OUTPUT_SIX_FORMAT_REFERENCE_PARITY: PASS
LOGIC_VALIDATION: PASS — 376/376
BLOCKER: NONE
```

Version 67 is an unused/not-deployed immutable Apps Script version whose source matched version 66 at final qualification. It is an operational residual only.

Gemini live recovery remains a separately deferred near-completion Work. Large-file indexing remains separate as well.

## Work 0023 active boundary

Primary outcome: preserve modular `src/` development while delivering a deterministic generated single-file Apps Script distribution and an idempotent, authorized installer suitable for a fresh company Google Workspace environment.

First implementation dispatch is `0023-CODEX-01` and should prioritize the shortest decisive path:

```text
1. deterministic source-order + HTML embedding build;
2. modular/bundle resource-loader abstraction;
3. reproducible payload/file hashes and release manifest;
4. guarded installKnowledgeShare() / checkKnowledgeShareReadiness() wrappers using existing setup/validation;
5. source-mode + bundle-mode tests, hostile-call rejection, idempotency gates;
6. exact bundle-size / one-paste feasibility;
7. first fresh company-like target-runtime installation slice.
```

If the exact generated bundle cannot be pasted, saved, parsed, selected, and executed as one Apps Script file, stop for a Strategy Reset rather than silently reverting to many manual source files.

## Scope and review discipline

A current Work is extended only for a blocker that materially affects:

- normal primary-path completion;
- data/source identity or integrity;
- authorization, credentials, or confidential-data safety;
- authoritative citation correctness;
- irreversible or material provider/runtime side effects;
- deterministic or required target-runtime qualification.

Cosmetic UX, exhaustive edge-case hardening, broad benchmarking, and non-blocking operational improvements move to `FIX SOON` or `BACKLOG` rather than extending the active Work indefinitely.

## Update rule

Update this registry when:

- a Work becomes active, accepted, blocked, deferred, or superseded;
- the delivery order changes materially;
- a new Work ID is allocated;
- an outcome is split because its deliverables become materially independent.

Do not update it for routine progress ticks inside one active Dispatch.
