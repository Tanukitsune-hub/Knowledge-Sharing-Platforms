# Work 0015 dispatch control

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Current active dispatch

- Dispatch: `0015-CODEX-02`;
- Mode: `QUALIFICATION`;
- Purpose: accept the observed native print-surface invocation, complete final read-only integrity, and deliver the existing local GP Workspace implementation/tests/reports to GitHub;
- Instruction: `docs/handoffs/0015-CODEX-02-finalize-readonly-qualification-and-delivery-instruction.md`;
- Parent instruction: `docs/handoffs/0015-instruction.md`;
- Design: `docs/planning/work0015-gp-workspace-one-page-summary.md`;
- Deployment guardrails: `docs/operations/apps-script-web-app-deployment.md`.

## Accepted CODEX-01 evidence

- `LOGIC_VALIDATION: PASS — 203/203`;
- public facade: exactly `24`;
- exact tested source synchronized to the confirmed target;
- immutable Apps Script version `31`;
- existing verified private Web App updated in place;
- GP Workspace screen/read model: PASS;
- relationship/follow-up views: PASS;
- print-only DOM/CSS: PASS;
- `window.print()` reached the normal browser print surface: PASS.

The Windows print-dialog control/URL-observation limitation is an automation limitation, not a product defect. The CODEX-01 handoff explicitly required it to be classified separately when the invocation was directly observed. No PDF save, printer execution, or OS-dialog inspection is required.

## Remaining work

- preserve the expected uncommitted CODEX-01 source/tests in the same local checkout;
- run the exact-tree deterministic checks once;
- do not resync or redeploy version `31`;
- perform one fresh before/after read-only integrity comparison without invoking print again;
- create CODEX-01 and CODEX-02 reports;
- commit, push, and update Draft PR #20.

If the expected local implementation changes are absent, stop rather than reconstructing speculative code.

## Work boundaries

- read-only presentation/aggregation only;
- exactly one new normal-user public facade: `getGpWorkspaceData`;
- expected public facade count: `24`;
- no persistent schema, backend sheet, database, GP profile fields, Audit writes, Drive artifacts, AI calls, or source-data mutations;
- no further Apps Script version or deployment mutation in CODEX-02;
- no native print re-test.

Only one active Codex dispatch is authorized.

PR #20 remains Draft / Open / unmerged until ChatGPT final review.

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
