# Work 0029 instruction

WORK_ID: 0029
DISPATCH_ID: 0029-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary outcome

Preserve the already-proven shared administrator password feature while correcting its GitHub Work identity and integrating it cleanly on top of the authoritative UI/UX Work 0028.

The product contract is unchanged: safe management status is readable while locked; shared-password unlock is account-independent; no timed expiry; opaque token in `sessionStorage`; server-side token validation on every AI Provider Settings mutation; password rotation invalidates old tokens.

## Collision resolution

Current `main` owns Work 0028 for UI/UX surface refinement. The branch-only shared-admin Work 0028 lineage and PR #38 are superseded for GitHub delivery and must not be merged.

Work 0029 is the canonical shared-admin Work. Preserve the validated implementation/runtime evidence from the superseded branch, but do not copy its Work 0028 control documents into this branch.

## Preserved evidence

- Shared-admin implementation commit: `af96c145e999ac7bed9d7aa4862e41b87ad17c82`.
- Superseded final branch head: `c058dc7c5498555dc303bbb60d43725755353874`.
- Version 74 personal-DEV qualification: focused 59/59, logic 456/456, bundle 27/27, source readback 82/82, locked/bootstrap/unlock/reload/logout PASS, provider/API-key/Store/business mutations 0.
- Current runtime final state: shared credential configured and locked; temporary DEV password remains `password` for later user rotation.
- Work 0027 Gemini state remains qualified-disabled/hidden.

Detailed execution contract: `docs/handoffs/0029-CODEX-01-shared-admin-reconciliation-instruction.md`.
Current ball: `docs/handoffs/0029-dispatches.md`.
