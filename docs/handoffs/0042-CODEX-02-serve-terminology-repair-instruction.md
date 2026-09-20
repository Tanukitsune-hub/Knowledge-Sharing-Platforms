# Work 0042 CODEX-02 — serve repaired terminology and close runtime qualification

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Trigger / Strategy Reset

CODEX-01 served version22 and completed the exhaustive right-pane/state-walk qualification, but actual Full Output exposed one presentation defect:
user-facing generated metadata / prompt still contained `Asset Class / Team / Meeting Type`.

The defect is already repaired on branch `codex/0042-right-pane-design-unification`.

Reviewed state:
- CODEX-01 served application commit: `420b871bbe60315092517421350da5b871ed1f2e`
- repaired application commit: `811c60858edf61147355c7a8d4a36116a1582be9`
- CODEX-01 return HEAD: `04dba794690082be16cf567a7b63e391e33b1fed`
- repaired application -> return HEAD is docs/dispatch only
- deterministic gates on repaired branch: 597/597 PASS, bundle 30/30 PASS
- Draft PR: #64
- BLOCKER: `REPAIRED_TERMINOLOGY_NOT_SERVED`

The previous deployment budget is intentionally reset once because actual runtime found a material presentation defect after the only allowed version/deployment update.

## Primary Outcome

Do not redesign or broaden Work0042.

Serve the already-reviewed repaired application to the SAME existing owner-only Web App, then directly prove that the repaired user-facing terminology is actually served.

Close the only remaining blocker if evidence passes.

## Authoritative sources

- `docs/handoffs/0042-CODEX-01-right-pane-design-unification-report.md`
- `docs/handoffs/0042-CODEX-01-right-pane-design-unification-instruction.md`
- `docs/handoffs/0042-right-pane-design-unification-requirements.md`
- `docs/design/0042/right-pane-reference.css`
- Draft PR #64
- branch `codex/0042-right-pane-design-unification`

## Closed Conclusions

Do not reopen unless contradicted by runtime evidence:

- right-pane visual convergence on served version22: PASS
- 7 normal pages / 4 viewports: PASS
- reachable dynamic state walk: PASS
- master drag reorder + authoritative persistence/restore: PASS
- admin tabs: PASS
- sidebar visual unchanged: PASS
- console material error/warn: 0
- provider calls: 0
- physical delete: 0
- schema / migration / storage / security changes: 0

Only unclosed acceptance item:
- repaired generated terminology must be served and directly qualified.

## Required preflight

Before mutation, confirm:

- current branch contains repaired application commit `811c60858edf61147355c7a8d4a36116a1582be9` or a descendant with no additional unreviewed production-scope change
- current served version = 22
- same existing Apps Script target
- same single owner-only WEB_APP
- execute as USER_DEPLOYING / access MYSELF
- no second deployment
- saved source / served immutable source state classified before write

If production code has materially changed beyond the reviewed terminology repair, STOP and return to ChatGPT before deployment.

## Allowed execution budget for CODEX-02

This Strategy Reset authorizes exactly:

```text
ADDITIONAL_SOURCE_SYNCS: <= 1
ADDITIONAL_IMMUTABLE_VERSION_CREATES: <= 1
ADDITIONAL_SAME_DEPLOYMENT_UPDATES: <= 1
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
```

Expected served version after successful deployment: version23.

Do not create version24 or retry a deployment mutation after failure without returning to ChatGPT.

## Runtime acceptance

### A. Exact source/version parity

After deployment, prove:

- same deployment serves version23
- saved source == immutable version23 == repaired application source
- no unrelated production change was introduced during CODEX-02

### B. Full Output terminology — direct runtime evidence

Use provider-independent Full Output with isolated synthetic data.

Directly verify served output contains:

- `アセットクラス:`
- `チーム:`
- `MTG種別:`

and does NOT contain these old user-facing metadata labels:

- `Asset Class:`
- `Team:`
- `Meeting Type:`

Also verify the generated/copyable AI prompt uses:

- `アセットクラス:`
- `チーム:`
- `MTG種別:`

and not the old labels above.

Do not treat canonical historical Google Docs body keys as a failure. Existing Docs content is authoritative business content and is intentionally not rewritten.

### C. Safe-message terminology smoke

Without provider calls and without real business mutation, exercise or directly read back representative user-facing validation/error strings sufficient to prove repaired source is served, including at least:

- missing/invalid アセットクラス wording
- チーム wording
- MTG種別 wording

Do not fabricate failures that would mutate real data.

### D. Regression smoke

Because CODEX-02 changes no CSS/layout behavior, do not repeat the entire CODEX-01 exhaustive state walk unless evidence contradicts prior conclusions.

Still verify on version23:

- all 7 normal nav pages nonblank
- 管理者ページ tabs render
- マスター管理 renders
- one representative Past Meeting detail state renders
- console material error/warn 0
- sidebar visual contract remains unchanged
- provider calls 0

### E. Terminology residual classification

Repeat a final source/runtime residual scan.

Classify remaining English occurrences into:

1. internal identifier / schema / enum / API
2. canonical historical Google Docs key/content
3. provider-specific/internal admin term where user-requested replacement does not apply
4. user-facing defect

Category 4 must be zero for `Team / Asset Class / Meeting Type` in the Work0042 scope.

## Validation

Re-run at least:

- repaired focused terminology/export tests
- `npm run check`
- `npm run check:bundle`
- `git diff --check`

If no production code changes are needed during CODEX-02, do not regenerate/edit unrelated files beyond what the canonical deploy/readback workflow requires.

## Safety

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
NEW_STORAGE: 0
PHYSICAL_DELETE: 0
PROVIDER_CALLS: 0
AI_SYNC_CHANGE: 0
CONFIDENTIAL_DATA: 0
REAL_BUSINESS_RECORD_MUTATION: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
WORK_0030: DEFERRED_BY_USER
```

## Return artifacts

Continue the SAME branch and Draft PR #64.

Create:
- `docs/handoffs/0042-CODEX-02-serve-terminology-repair-report.md`

Update:
- `docs/handoffs/0042-dispatches.md`

Report must include:

- exact preflight branch/head
- exact application source served
- final served version
- source sync / immutable version / deployment update counts
- Full Output actual text evidence summary
- prompt actual text evidence summary
- safe-message smoke
- residual terminology classification
- 7-page regression smoke
- console material error/warn
- provider calls / side effects
- BLOCKER
- READY_FOR_CHATGPT_FINAL_REVIEW

Do not merge PR #64.

PASS state:

```text
TARGET_RUNTIME_QUALIFICATION: PASS
REPAIRED_TERMINOLOGY_SERVED: PASS
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
BALL: CHATGPT
STATUS: RETURNED
```

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-02
BALL: CODEX
STATUS: READY
