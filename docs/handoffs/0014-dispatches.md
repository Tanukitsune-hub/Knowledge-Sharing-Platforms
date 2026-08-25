# Work 0014 dispatch control

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

Current active dispatch:

- `0014-CODEX-02`
- Mode: `QUALIFICATION`
- Purpose: complete the bounded synthetic DEV schema 3 installation-state alignment and live smoke after ChatGPT applied/read back the exact append-only data-plane migration.
- Instruction: `docs/handoffs/0014-CODEX-02-dev-schema3-smoke-qualification-instruction.md`.
- Parent/canonical instruction: `docs/handoffs/0014-instruction.md`.
- Inherited production storage decision: `docs/decisions/shared-drive-production-root.md` — preserve Shared Drive-only production storage and do not introduce any production My Drive fallback/staging path.

Accepted closed evidence from `0014-CODEX-01`:

- implementation and deterministic validation: `PASS — 176/176`;
- public facade: 23 functions, unchanged;
- append-only schema 3 migration behavior: deterministic PASS;
- Meeting/Pitchbook/relationship/legacy deterministic behavior: PASS;
- exact synthetic DEV source sync and existing Web App deployment update to immutable version 26: PASS;
- no second Web App deployment.

ChatGPT-completed synthetic DEV migration:

- Meeting_Index six Work 0014 columns appended;
- Pitchbook_Index Fund_Strategy appended;
- Option_Master canonical header confirmed and PD/AE TEAM seeds inserted;
- Settings SCHEMA_VERSION set to 3;
- existing rows, IDs, counters, AI/Gemini settings, source files, and LAST_SETUP_AT preserved;
- readback PASS.

The previous `PRIVATE ADMIN EXECUTION SURFACE LIMITATION` is not reopened as an application-source defect. CODEX-02 must not call or expose private admin functions. It may only align the existing installation-state schema metadata through Project Settings when needed, then run the bounded normal-UI synthetic DEV smoke.

Only one active Codex dispatch is authorized. PR #17 remains Draft / Open / unmerged pending ChatGPT final review.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
