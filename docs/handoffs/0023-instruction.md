# Work 0023 — generated Apps Script bundle and low-friction installer

WORK_ID: `0023`
DISPATCH_ID: `0023-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`

## Primary outcome

Preserve the modular GitHub development architecture while delivering a generated single-file Apps Script distribution and an idempotent installer that a non-specialist can use in a fresh company Google Workspace environment.

Active detailed instruction:

`docs/handoffs/0023-CODEX-01-deterministic-bundle-installer-and-first-runtime-qualification-instruction.md`

## Accepted baseline

```text
WORK_0021: ACCEPTED / MERGED
WORK_0021_MERGE_COMMIT: 533c849bd1229827ec77cd5ad6506312ea286940
ACCEPTED_PRIVATE_WEB_APP_VERSION: 66
WORK_0021_RUNTIME_MUTATION: PROHIBITED
```

## Fixed product boundaries

- `src/` remains authoritative and modular;
- `dist/KnowledgeShare.bundle.gs` is generated and never hand-edited;
- all required HTML resources are embedded in bundle mode;
- modular and bundle modes share one resource-loader abstraction;
- installer reuses the existing setup/validation engine;
- `installKnowledgeShare()` and `checkKnowledgeShareReadiness()` are guarded editor-visible wrappers;
- AI providers and recurring AI sync are disabled by default;
- no Gmail labels/scopes are added;
- normal company install does not require personal Drive templates, Git, Node.js, terminal, `clasp`, raw resource IDs, or many manual Apps Script files;
- exact one-paste save/parse/select/execute feasibility is a release gate, not an assumption.

## Current target

CODEX-01 should implement the deterministic bundle/build path, HTML embedding/loader parity, release hashes/manifest, guarded installer/readiness core, source/bundle parity tests, and the first bounded fresh-install runtime slice if the environment permits.

If the exact bundle cannot be pasted, saved, parsed, selected, or executed as a single Apps Script source file, stop for a Strategy Reset rather than weakening the one-paste product requirement.

WORK_ID: `0023`
DISPATCH_ID: `0023-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
