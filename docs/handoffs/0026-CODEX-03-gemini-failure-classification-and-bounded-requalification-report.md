# Work 0026 — CODEX-03 Gemini failure classification and bounded requalification report

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

Awaiting execution.

Authoritative instruction:

`docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-instruction.md`

Primary sequence:

```text
repair safe failure classification
-> deterministic validation
-> one source delivery/readback
-> version 70 / same Web App update once
-> shell smoke
-> read-only exact provider/source preflight
-> one required 3.8 Interactions call
-> at most one mutually exclusive diagnostic/fallback call
-> exact evidence-supported terminal outcome
```

The terminal outcome must be `QUALIFIED`, an exact `DISABLED_EXTERNAL_LIMITATION`, or `BLOCKED_PRODUCT_DEFECT`. A generic qualification failure is not sufficient evidence for an external classification.
