# Work 0022 dispatch control

WORK_ID: `0022`
Dispatch ID: `N/A`
BALL: `CHATGPT`
STATUS: `PREPARING`

## Current state

Work 0022 planning is complete, but no Codex dispatch is active.

Reserved next dispatch:

- `0022-CODEX-01`;
- purpose: repository-wide temporal contract implementation and target-runtime qualification;
- prepared instruction: `docs/handoffs/0022-CODEX-01-temporal-contract-hardening-instruction.md`;
- recommended model: `Sol High`;
- implementation branch / Draft PR / exact ref: assigned only after Work 0016 is accepted and merged.

## Activation gate

Do not activate while Work 0016 has an active Codex dispatch.

ChatGPT will activate `0022-CODEX-01` only after:

1. CODEX-04 result for Work 0016 is independently reviewed;
2. Work 0016 has no BLOCKER and PR #21 is merged;
3. `main` contains final Work 0016 source plus the Work 0022 decision/plan;
4. a fresh implementation branch and Draft PR are created from the exact accepted main SHA;
5. the reserved instruction is updated from PREPARING to READY.

## Prepared scope

- generic Business Date / Business Time / Instant helpers;
- full-tree temporal inventory;
- migration of Audit/Search/Export/AI/workspace callsites;
- static temporal validator in `npm run check`;
- mixed Sheets Date/string/ISO regression matrix;
- bounded private Web App qualification;
- no historical rewrite, schema expansion, Gemini call, trigger, or production rollout.

Only one active Codex dispatch is permitted after activation.

WORK_ID: `0022`
Dispatch ID: `N/A`
BALL: `CHATGPT`
STATUS: `PREPARING`
