# Work 0017 — CODEX-02 Counterparty Type filter finalization

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-02`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0017-meeting-activity-analytics`

Draft PR: `#23`

ChatGPT-fixed source baseline: `737f9888be6468eb9f30ef582d25caf33b882775`

Recommended model: `Luna Max`.

## Why this dispatch exists

CODEX-01 delivered and qualified the Activity Analytics vertical slice, but its own runtime report recorded one user-facing defect: the deployed Counterparty Type filter showed only `未選択`.

GitHub review established the exact root cause:

- server response key: `filterOptions.counterpartyTypes`;
- client expected key: `counterpartyType`.

ChatGPT already applied the minimal source repair and regression on the branch:

- `src/ClientActivityAnalytics.html`: use `counterpartyTypes`;
- `tests/activity-analytics-ui.test.cjs`: assert all client option keys match the server response contract.

Do not redesign or reimplement Activity Analytics.

## Accepted evidence — do not reopen

Retain CODEX-01 evidence unless directly contradicted:

- analytics aggregation/periods/dimensions/server filters: PASS;
- monthly 4 Meetings and FY2026 aggregation: PASS;
- Counterparty Type -> Team breakdown switch: PASS;
- exact one-Meeting drill: PASS;
- admin check true/reload/false with exactly two metadata-only Audit events: PASS;
- no Meeting Version/Updated/Doc/follow-up/AI mutation from admin check: PASS;
- schema 5, exactly five Backend sheets: PASS;
- public facade 26;
- Web App version 36 was the CODEX-01 deployment;
- no Gemini/File Search call, trigger, new Web App deployment, or Library mutation.

## Remaining scope only

1. Read applicable `AGENTS.md` / `AGENTS.override.md` and this instruction.
2. Verify the ChatGPT patch is present and the source/server key contract is now consistent.
3. Run the focused Activity Analytics UI/server suites, `npm run check`, `git diff --check`, and public-surface validation.
4. If deterministic validation passes, synchronize the exact tested deployable source once.
5. Read back the exact source.
6. Create exactly one immutable Apps Script version and update the same positively identified private Web App in place.
7. In the actual Web App, open Activity Analytics and prove the Counterparty Type filter contains the expected current values, including at least `GP` and `LP_ASSET_OWNER` for the existing synthetic data.
8. Select one Counterparty Type filter value and prove the headline/drill results narrow consistently; then clear it.
9. Reconfirm the existing Counterparty Type -> Team dimension switch still works.
10. Perform final read-only integrity: five sheets, schema 5, same rows/files/settings/counters/admin baseline, no unexpected Audit/data/AI/trigger/permission/Library mutation.
11. Create the CODEX-02 report, update canonical Work/dispatch/report and PR #23, commit/push everything, and keep PR #23 Draft/Open/unmerged.

## Prohibitions

Do not:

- create new Meeting/Entity/Pitchbook records;
- toggle the monthly admin check again unless a direct regression forces it;
- change schema or public facade;
- create another Web App deployment;
- touch Library deployments;
- call Gemini/File Search;
- enable triggers;
- use confidential data;
- implement Work 0018 or other enhancements.

## Stop rule

If the repaired client still does not show the server-provided Counterparty Type values after one correct source sync/deployment, stop and return direct evidence rather than broadening the implementation.

## Completion

On full PASS classify:

```text
DEV QUALIFIED — WORK 0017 MEETING ACTIVITY ANALYTICS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```

Create:

`docs/handoffs/0017-CODEX-02-counterparty-type-filter-finalization-report.md`
