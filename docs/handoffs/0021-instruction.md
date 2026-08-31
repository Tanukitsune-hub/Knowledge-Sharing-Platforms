# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION -> FINAL WORK READINESS`

Active instruction:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`

Accepted reports:

- `docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`;
- `docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`;
- `docs/handoffs/0021-CODEX-03-multi-entity-comparison-and-advanced-exact-filters-report.md`.

Dispatch register:

`docs/handoffs/0021-dispatches.md`

Canonical delivery order:

`docs/planning/work-registry.md`

Detailed Work plan:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted dependencies and Work 0021 state

Work 0020 and Work 0025 are accepted/merged and are not reopened.

Work 0021 is accepted through CODEX-03:

- canonical structured filters and five modes;
- OpenAI/FULL_OUTPUT shared request contract;
- exact provider metadata reconciliation;
- explicit 2–5 Entity comparison;
- per-Entity citation/evidence attribution;
- exact Related GP / Meeting Type filters;
- FULL_OUTPUT multi-Entity parity;
- private Web App version 63;
- canonical `368/368` PASS and Apps Script readback `80/80` PASS.

No contradictory evidence exists for those accepted gates.

## CODEX-04 outcome

Complete only the bounded six-format/provider-capability matrix for:

```text
pdf / pptx / xlsx / docx / txt / eml
```

The source adapters/format registry already exist. Connect/fix only proven defects, qualify the enabled OpenAI route with authoritative citations, preserve EML attachment exclusion, verify FULL_OUTPUT reference-only parity, and record Gemini as disabled/deferred without an API call.

Current DEV Pitchbook inventory does not contain a small complete six-format matrix. CODEX-04 may create at most six tiny non-confidential synthetic Pitchbooks through the normal registration flow. Never use `DOC-000018` or the old 5–25 MiB fixtures.

This is the final planned Work 0021 dispatch. If required gates pass, stop and return PR #34 for ChatGPT final review/merge. Do not create CODEX-05 for non-blocking refinements.

Keep PR #34 Draft/Open/unmerged. Do not merge it.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
