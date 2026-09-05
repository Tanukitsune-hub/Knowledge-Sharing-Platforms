# Work 0028 instruction

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Primary outcome

Replace routine AI Provider Settings mutation authorization with a shared administrator password that is independent of the current user's Google account/email. Keep the management page safely readable to all authorized Web App users. Do not add time-based admin-session expiry.

Current detailed instruction:

`docs/handoffs/0028-CODEX-02-shared-admin-password-bootstrap-instruction.md`

Current ball:

`docs/handoffs/0028-dispatches.md`

Current result:

`docs/handoffs/0028-report.md`

## Closed design choices

- one shared administrator password;
- no Google account/email dependency for normal AI Provider Settings mutations after migration;
- no 30-minute or other timed expiry;
- browser unlock stored only as an opaque token in `sessionStorage`;
- explicit logout clears browser unlock;
- password change is included in the management UI;
- password change invalidates previous tokens and the new credential works;
- password plaintext is never persisted;
- existing account/email admin remains only as the one-time bootstrap gate when no shared credential exists;
- installer/setup/deployment/readiness operator authorization is outside this Work and must not be weakened;
- current personal-DEV bootstrap uses a temporary disclosed password supplied in the CODEX-02 prompt so Codex can perform bootstrap/unlock without USER handoff; it is not a product default and will be changed later by the user.

`0028-CODEX-01` is SUPERSEDED before execution. Do not resume it.

Work 0027 is ACCEPTED. Preserve Gemini 3.7 as qualified-disabled/hidden and preserve accepted OpenAI/FULL_OUTPUT behavior.

Read root/nearest AGENTS, the Work 0028 decision/plan, and the Apps Script deployment guardrails before implementation.

## CODEX-02 return

Implementation, deterministic validation, exact source delivery/readback, one version-74 update of the same private Web App, and the normal-UI personal-DEV qualification passed. The runtime shared credential is configured and explicitly logged out. Google account identity alone no longer authorizes AI Provider Settings mutation after bootstrap.

```text
IMPLEMENTATION_COMMIT: af96c145e999ac7bed9d7aa4862e41b87ad17c82
PRIVATE_WEB_APP_VERSION: 74
LOGIC_VALIDATION: PASS / 456 of 456
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
WORK_ACCEPTANCE: NOT_MET / GitHub reconciliation pending
FUNCTIONAL_ACCEPTANCE: MET
GITHUB_DELIVERY: BLOCKED
READY: NO
BLOCKER: GITHUB_WORK_ID_COLLISION
```

The temporary DEV password remains in place for the user to change later through the implemented normal management UI. No plaintext credential is recorded here. Provider calls and provider/model/data mutations were zero.

A final GitHub-source-of-truth check found that latest `origin/main` registered a separate UI/UX design outcome under Work 0028 after this dispatch started. PR #38 is conflicting in Work control/tracking files. No semantic merge or Work renumbering was attempted; ChatGPT controller reconciliation is required.
