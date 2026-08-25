WORK_ID: <!-- zero-padded 4-digit ID or Not assigned -->
ACTIVE_DISPATCH_ID: <!-- <WORK_ID>-CODEX-<NN> or N/A -->
BALL: <!-- CHATGPT / CODEX / USER / NONE -->
STATUS: <!-- PREPARING / READY / IN_PROGRESS / ACTION_REQUIRED / RETURNED / REVIEW / ACCEPTED / BLOCKED / SUPERSEDED -->
MODE: <!-- BUILD / INCIDENT_RECOVERY / INVESTIGATION / QUALIFICATION -->

## Outcome

<!-- What usable outcome does this PR deliver? -->

## Scope and Non-Goals

<!-- Material areas changed, explicit exclusions, and follow-ups routed out of scope. -->

## Runtime and Data Boundary

- Target runtime / native surface:
- Isolated test data / resources:
- Side-effect state: <!-- DISABLED / GUARDED / TEST_ONLY / ENABLED / NOT APPLICABLE -->
- Separate staging decision: <!-- Not required, or material justification and unique evidence -->

## Acceptance Evidence

<!-- Strongest evidence first. Record only checks or observations actually obtained. -->

- LOGIC_VALIDATION: <!-- PASS / FAIL / NOT RUN / NOT APPLICABLE -->
- TARGET_RUNTIME_QUALIFICATION: <!-- PASS / FAIL / NOT RUN / NOT APPLICABLE -->
- READY: <!-- YES / NO -->

CI, mocks, simulators, alternate runtimes, synthetic harnesses, and test-loader helpers do not establish Apps Script / Workspace / browser / Gemini readiness unless the actual target was exercised.

## Work Control

- Fastest decisive path used:
- Strategy reset or budget exhaustion:
- Closed conclusions not reopened:
- User-assisted evidence:
- Dispatch register: <!-- docs/handoffs/<WORK_ID>-dispatches.md or N/A -->

## Validation and Target Identity

- Targeted checks:
- Canonical `npm run check`:
- `git diff --check`:
- Exact target/source/deployment/resource readback:
- Application defect vs automation/infrastructure limitation:

## Handoff and Report

- Instruction:
- Completion report:

## Risks and Residuals

- BLOCKER:
- FOLLOW_UP:
- OPTIONAL:
