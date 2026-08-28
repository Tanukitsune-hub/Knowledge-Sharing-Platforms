# Gemini File Search Retrieval Design — superseded

Current as of: 2026-08-28

Status: Superseded by the accepted provider-neutral AI design.

The former Gemini-only design is retained in Git history. The active sources of truth are:

- `docs/decisions/ai-provider-selection-and-full-output.md`;
- `docs/ai/provider-neutral-file-search.md`;
- `docs/planning/work0020-personal-pc-gemini-core-qualification.md`;
- `docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`.

Current user-facing generation choices are exactly:

```text
ChatGPT
Gemini
全文出力
```

ChatGPT and Gemini use independent File Search provider adapters. `全文出力` calls no AI API and produces one canonical Knowledge Package for Copy, Google Docs, and PDF.

No automatic cross-provider failover is permitted. Google Workspace remains authoritative; all provider indexes and exports remain derived/rebuildable.

## Target runtime, test data, and side effects

This superseded design remains subject to the current target-runtime boundary:

- Target runtime uses the private authenticated Apps Script Web App and isolated synthetic or anonymized test data/resources.
- Logic validation and target-runtime qualification are reported separately.
- `LOGIC_VALIDATION`, `TARGET_RUNTIME_QUALIFICATION`, and `SIDE_EFFECT_STATE` remain distinct evidence fields.
- Current policy redacts the question/additional-instruction text from Audit and other durable outputs.
