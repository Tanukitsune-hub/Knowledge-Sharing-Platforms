# Work 0022 dispatch control

WORK_ID: `0022`
Dispatch ID: `0022-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

## Current state

Work 0016 is accepted/merged and the temporal contract decision is active. Work 0022 now owns the ball.

Active dispatch:

- `0022-CODEX-01`;
- purpose: repository-wide temporal contract implementation and target-runtime qualification;
- instruction: `docs/handoffs/0022-CODEX-01-temporal-contract-hardening-instruction.md`;
- recommended model: `Sol High`;
- branch: `agent/0022-temporal-data-contract-hardening`;
- Draft PR: created from this branch and kept open/unmerged for ChatGPT final review.

## Accepted predecessor evidence

Work 0016:

- PR #21 merged/closed;
- merge commit `d77f4c8919b6aeb7e6bea1be76f4e5bd558df5b1`;
- schema 4 / five Backend sheets PASS;
- legacy GP and Counterparty Entity flows PASS;
- non-GP create/reopen/edit/search PASS;
- Audit canonicalization and final integrity PASS;
- private Web App version `34`;
- BLOCKER NO;
- Completion Latch applied.

Do not reopen Work 0016 except for a material contradiction. Work 0022 may refactor temporal handling only within its accepted cross-cutting contract.

## Active scope

- full-tree temporal inventory;
- generic Business Date / Business Time / Instant helpers;
- migration of Audit/Search/Export/AI/workspace/relationship/diagnostic temporal boundaries;
- static temporal validator in `npm run check`;
- mixed Sheets Date/string/ISO regression matrix;
- bounded private Web App qualification;
- no historical rewrite, schema expansion, Gemini call, trigger, or production rollout.

Only one active Codex dispatch is permitted.

WORK_ID: `0022`
Dispatch ID: `0022-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
