# Work 0015 dispatch control

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

## Current active dispatch

- Dispatch: `0015-CODEX-01`;
- Mode: `BUILD`;
- Purpose: implement and target-runtime qualify the read-only GP Workspace / one-page print summary;
- Instruction: `docs/handoffs/0015-CODEX-01-gp-workspace-implementation-instruction.md`;
- Parent instruction: `docs/handoffs/0015-instruction.md`;
- Design: `docs/planning/work0015-gp-workspace-one-page-summary.md`;
- Deployment guardrails: `docs/operations/apps-script-web-app-deployment.md`.

## Closed evidence inherited from Work 0014

- schema 3 and five-sheet backend accepted;
- Team, Fund / Strategy, Meeting types, Meeting↔Pitchbook relationships, and follow-up fields accepted;
- legacy compatibility accepted;
- authenticated Web App target and existing `/exec` accepted;
- configured-timezone Date handling and Pitchbook partial writes accepted;
- final Work 0014 authoritative integrity accepted;
- production Shared Drive/Gemini qualification remains outside this Work.

## Work 0015 boundaries

- read-only presentation/aggregation only;
- exactly one new normal-user public facade: `getGpWorkspaceData`;
- expected public facade count: `24`;
- no new persistent schema, backend sheet, database, GP profile fields, Audit writes, Drive artifacts, AI calls, or source-data mutations;
- browser-native print / Save as PDF only;
- one existing synthetic GP should be reused for native qualification.

Only one active Codex dispatch is authorized.

PR remains Draft / Open / unmerged until ChatGPT final review.

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
