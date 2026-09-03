# Work 0023 dispatch control

WORK_ID: `0023`
ACTIVE_DISPATCH_ID: `0023-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0023-CODEX-01 — READY / deterministic bundle + installer core + first runtime qualification

Work 0021 is accepted and merged. Work 0023 is now the active implementation Work.

Instruction:

`docs/handoffs/0023-CODEX-01-deterministic-bundle-installer-and-first-runtime-qualification-instruction.md`

GitHub transport:

```text
BRANCH: agent/0023-bundle-installer-distribution
PR: #35 / Draft / Open / unmerged
```

Primary outcome:

- deterministic generated single-file Apps Script bundle;
- embedded HTML resource map and modular/bundle loader parity;
- reproducible payload/file hashes and release manifest;
- guarded `installKnowledgeShare()` / `checkKnowledgeShareReadiness()` wrappers using the existing setup/validation engine;
- idempotent fresh install and rerun behavior;
- exact one-paste save/parse/select/execute qualification;
- first isolated company-like target-runtime installation slice where safely available.

Accepted baseline:

```text
WORK_0021: ACCEPTED
WORK_0021_MERGE: 533c849bd1229827ec77cd5ad6506312ea286940
WORK_0021_WEB_APP_VERSION: 66
WORK_0021_RUNTIME_MUTATION_IN_0023: PROHIBITED
OPENAI/GEMINI_LIVE_CALLS_IN_0023_CODEX_01: PROHIBITED
```

If a native user action is required during the same active execution, retain `0023-CODEX-01` and hand the ball to USER. A new Codex run after RETURNED must use the next Dispatch ID.

## Governing sources

- `docs/decisions/modular-source-single-bundle-distribution.md`
- `docs/decisions/bundle-integrity-and-installer-security.md`
- `docs/planning/work0023-bundle-installer-distribution.md`
- `docs/operations/company-bundle-installation.md`
- `docs/standards/apps-script-bundle-installer-standard.md`

Only one active Codex dispatch may exist for Work 0023.

WORK_ID: `0023`
ACTIVE_DISPATCH_ID: `0023-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
