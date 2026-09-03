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
| 2 | 0021 | Structured Knowledge Search, five modes, multi-Entity comparison, format matrix | READY FOR FINAL REVIEW | 0025 accepted | Version 66 passed final six-format FULL_OUTPUT reference parity and read-only integrity; ChatGPT owns final PR #34 review/merge |
| 3 | 0023 | Generated single-file bundle and idempotent installer | READY | 0021 feature surface stable | Build and fresh-install-qualify the distribution path |
| 4 | Unassigned future Work | Gemini provider recovery against the completed OpenAI reference path | DEFERRED | 0021/0023 substantially complete; current Gemini APIs rechecked | Allocate the next unused Work ID when the recovery campaign starts |
| 5 | Unassigned future Work | Representative large-file indexing qualification/recovery | DEFERRED | Representative production-size corpus selected | Allocate a separate Work ID; do not mix with general provider recovery unless the outcome is genuinely the same |
| 6 | Unassigned future Work | Historical-material migration | PLANNED | Product and installer stable | Choose manual/hybrid/selective automation from the actual corpus |
| 7 | Unassigned future Work | Final company-environment qualification and rollout | PLANNED | Installation, migration approach, company credentials/permissions ready | Qualify actual company Workspace and enabled providers |

## Work 0025 accepted boundary

Work 0025 delivered:

- model/thinking policy registry;
- administrator enable/disable/default control;
- historical model support;
- credential-access and exact tuple qualification gates;
- normal-user model/thinking controls;
- server-side effective-policy enforcement;
- preservation of the current qualified OpenAI default behavior.

It does not own Work 0021 structured filters/comparison, Work 0023 bundle generation, Gemini recovery, exhaustive model benchmarking, or company rollout.

## Work 0021 dispatch plan

Keep one Work ID because the primary outcome is one intended Knowledge Search product. Use bounded Dispatch IDs:

```text
0021-CODEX-01
  unified core structured filters + five modes on OpenAI/FULL_OUTPUT;
  deterministic PASS; target-runtime compound-filter blocker returned

0021-CODEX-02
  exact provider-attribute reconciliation + completion of core runtime gates;
  PASS at private Web App version 62

0021-CODEX-03
  2–5 Entity comparison + advanced exact filters/citation attribution;
  PASS at private Web App version 63

0021-CODEX-04
  bounded six-format matrix + explicit provider-capability/parity evidence;
  human-assisted normal registration PASS for six tiny synthetic Pitchbooks;
  final XLSX ZIP-Blob correction deployed to the same private Web App as version 65 after exact 80/80 readback;
  exact OpenAI sync and one grounded token/source-ID query PASS for all six formats; EML attachment boundary PASS;
  final API-independent FULL_OUTPUT preview FAIL SAFE because DOC-000022 had no confirmable authoritative Drive link;
  deployment budget exhausted; no version 66, repeated registration/sync/query, or automatic CODEX-05

0021-CODEX-06
  reconciled only the strict Google editor URL parser and deterministic tests onto current GitHub state;
  25/25 focused and 376/376 canonical PASS; tested source, Apps Script HEAD, version 66 and version 67 matched 80/80;
  same private Web App updated once to existing version 66; no new version created and version 67 remains unused;
  one API-independent FULL_OUTPUT preview resolved DOC-000019 through DOC-000024 as six authoritative references with no Pitchbook body;
  final read-only integrity PASS; ready for ChatGPT final PR #34 review
```

Gemini live recovery remains a separately deferred near-completion Work. CODEX-04 records only the capabilities of providers then intentionally enabled; it must not reopen historical Gemini troubleshooting as a hidden blocker.

Create another dispatch only when required to complete the same outcome. Create a new Work only if the deliverable materially changes.

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
