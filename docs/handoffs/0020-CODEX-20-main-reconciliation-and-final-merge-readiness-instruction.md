# Work 0020 — CODEX-20 main reconciliation and final merge readiness

WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-20
MODE: QUALIFICATION
BALL: CODEX
STATUS: READY

## Primary outcome

Preserve the completed and target-runtime-qualified Work 0020 OpenAI path, integrate the latest `main` history into `agent/0020-ai-provider-core`, resolve the remaining documentation/governance conflicts correctly, run the full deterministic validation, and leave PR #26 current, mergeable, and ready for ChatGPT's final review and merge.

This dispatch is integration-only. It must not reopen or repeat provider/runtime qualification that already passed.

## Acceptance evidence and hierarchy

Strongest accepted evidence, already latched:

1. Existing private Apps Script Web App version 57 passed native exact-source OpenAI qualification for `DOC-000017` and `MTG-000005`.
2. Native grounded answers returned exactly one authoritative normalized source for each designated source.
3. Exact sync, metadata filtering, update/reindex, Inactive, Reactivate, delete/rebuild, disable/re-enable, no-duplicate reuse, and final integrity passed.
4. CODEX-19 logic validation passed: focused 47/47 and canonical 325/325, plus temporal, public-surface, agent-foundation, and diff hygiene.
5. GitHub branch head at dispatch preparation contained final CODEX-19 commit `d61dc166c835d65e8bbabd17dc2894b4aef69cd8`.

Do not rerun a weaker or riskier live test merely to reconfirm these accepted conclusions.

## Runtime / artifact locator

- `RUNTIME_LOCATOR_PATH`: `docs/operations/runtime-artifact-locator.md`
- `RUNTIME_LOCATOR_VERIFIED`: YES for the CODEX-19 runtime qualification
- `SOURCE_REPOSITORY`: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- `WORK_BRANCH`: `agent/0020-ai-provider-core`
- `DEPLOYED_SOURCE_COMMIT`: `d61dc166c835d65e8bbabd17dc2894b4aef69cd8`
- `TARGET_RUNTIME`: standalone private Google Apps Script Web App `KSP Work 0010 DEV Qualification`
- `DEPLOYMENT_VERSION`: 57
- `PRIMARY_DATA_ARTIFACT`: `Knowledge Platform Backend`
- `AUDIT_ARTIFACT`: `Knowledge Platform Audit`
- `SIDE_EFFECT_STATE`: no target-runtime or provider mutations authorized in CODEX-20

The integration commit will not itself be a deployment. Keep the deployed-source baseline explicit in the locator.

## Current GitHub state at preparation

- PR: #26, Draft / Open / unmerged
- Work branch head before this handoff series: `d61dc166c835d65e8bbabd17dc2894b4aef69cd8`
- Observed `main`: `0d9238293b1f5612956e206d22e4e75cfc767694`
- Merge base: `bc7c6efda63b13e8a998e32d97028ee3a3557e3b`
- Work branch: 124 commits ahead and 16 commits behind observed `main`
- PR is currently non-mergeable because the histories diverged
- GitHub Actions/status checks are absent

Verify remote refs at execution start. If `origin/main` has advanced, integrate the latest current `origin/main` and record the actual SHA used.

## Required scope

### 1. Merge current main into the Work branch

Use a normal merge commit. Do not rebase, force-push, squash, rewrite shared history, or reset accepted Work 0020 commits.

Preserve every main-only Work 0023/0025 governance, planning, installer, and model-policy file. Preserve every Work 0020 implementation, test, report, and runtime-locator file.

### 2. Resolve semantic documentation conflicts

At minimum, inspect and reconcile the following rather than accepting either side wholesale.

#### `docs/decisions/ai-provider-selection-and-full-output.md`

The merged document must preserve both accepted decisions:

- OpenAI/Gemini File Search may use Meeting records and Pitchbook/source materials.
- `FULL_EXPORT` body remains authoritative Meeting Google Docs text only; Pitchbook bodies are not extracted and matching Pitchbooks may appear only as bounded reference metadata/Drive links.
- Normal users may select model and thinking/reasoning only from combinations that are available to the current credential/project, qualified for the required capabilities, and enabled by administrator policy.
- Administrators can hide or prohibit models such as Sol, retain approved older models, and control model-specific thinking choices.
- New/latest models are never auto-enabled merely because a provider lists them.
- No silent cross-provider or stronger/more-expensive model fallback.

Remove or supersede stale wording that says a user-facing model selector is categorically a non-goal.

#### `docs/decisions/decision-log.md`

The merged log must preserve:

- Work 0020's provider-neutral OpenAI/Gemini/File Search and Meeting-only `FULL_EXPORT` boundary;
- the completed OpenAI qualification outcome and deferred Gemini recovery;
- Work 0023 generated bundle/installer decisions and roadmap placement;
- Work 0025 administrator-governed model/thinking selection decision;
- the latest coherent implementation sequence.

Do not lose main-only accepted decisions or branch-only runtime conclusions.

#### Other conflicts

For AGENTS, roadmap, architecture, operations, and source-subtree instruction conflicts, preserve the stricter compatible rule set and all current source-of-truth links. Do not alter production Apps Script behavior merely to resolve a documentation merge.

### 3. Final Work tracking and PR state

After merge and validation:

- update `docs/handoffs/0020-dispatches.md` to record CODEX-20 returned and no active dispatch;
- update `docs/handoffs/0020-instruction.md` and `docs/handoffs/0020-report.md` to distinguish:
  - functional/runtime Work 0020 completion: PASS;
  - main reconciliation: PASS;
  - PR merge readiness: PASS;
  - GitHub CI: absent/not run;
- update `docs/operations/runtime-artifact-locator.md` with:
  - exact deployed source commit `d61dc166c835d65e8bbabd17dc2894b4aef69cd8`;
  - exact final integration commit/branch head;
  - statement that CODEX-20 made no runtime deployment and version 57 remains deployed;
- update PR #26 body to the final verified state;
- mark PR ready for review only after it is mergeable and all required local checks pass;
- do not merge PR #26. ChatGPT owns the final merge decision.

## Required validation

Run after resolving the latest-main merge:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Also verify:

- branch contains the actual latest `origin/main` commit used;
- working tree is clean;
- local branch, remote branch, and PR head match;
- PR is no longer conflicted/non-mergeable;
- no Apps Script source or runtime artifact changed unexpectedly through conflict resolution;
- no GitHub Actions/status check is reported as PASS unless one actually ran.

If a deterministic test fails because the merged main introduced a genuine incompatibility, fix only that integration defect, rerun the checks, and report it. Do not weaken assertions or delete accepted tests.

## Prohibited actions

- no Gemini or OpenAI API call;
- no Web App, Apps Script version, deployment, Vector Store, source-row, Drive-file, or Audit mutation;
- no FULL_OUTPUT rerun;
- no confidential data access;
- no broad Pitchbook retry;
- no old large-fixture mutation;
- no rebase, force-push, history rewrite, branch deletion, or PR merge;
- no new product feature or Work 0023/0025 implementation beyond integrating their existing accepted main content.

## Delivery

Create:

`docs/handoffs/0020-CODEX-20-main-reconciliation-and-final-merge-readiness-report.md`

Update the Work tracking files, runtime locator, and PR #26. Commit and push the merge/integration result.

## Completion latch

```text
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS — accepted CODEX-19 evidence
MAIN_RECONCILIATION: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
PR_MERGEABLE: YES | NO
PR_READY_FOR_REVIEW: YES | NO
GITHUB_CI_ACTUALLY_RAN: YES | NO
RUNTIME_DEPLOYMENT_CHANGED: NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
```

### Mandatory final chat response

The final response must begin and end with:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-20
BALL: CHATGPT
STATUS: RETURNED
```
