# Work 0015 — CODEX-02 final read-only qualification and GitHub delivery

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-02`
MODE: `QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — preserve the already-tested local implementation, complete one read-only integrity comparison, and deliver the existing scoped changes to GitHub`.

Recommended model: `Luna Max`.

## Primary Outcome

Close Work 0015 without reopening implementation or native printing:

1. preserve the already-tested GP Workspace source/tests;
2. accept the already-observed browser print-surface invocation;
3. complete final read-only authoritative integrity;
4. create the missing reports;
5. commit, push, and update Draft PR #20.

## Accepted Evidence — Do Not Reopen

The CODEX-01 run already established:

- `LOGIC_VALIDATION: PASS — 203/203`;
- public facade: exactly `24`;
- exact tested source synchronized to the confirmed Apps Script target;
- immutable Apps Script version `31` created;
- existing verified private Web App updated in place;
- GP Workspace page/render: PASS;
- selected synthetic GP snapshot/read model: PASS;
- relationship and follow-up views: PASS;
- print-only brief DOM/CSS: PASS;
- print button invocation: PASS — the browser's native print surface opened;
- no Drive-generated report artifact was requested or created.

The Work 0015 design and CODEX-01 handoff explicitly state that native print-dialog internals are not a product acceptance requirement when the `window.print()` invocation and print-only DOM/CSS are directly observed. Computer Use being unable to safely inspect or close the Windows print dialog is an automation/harness limitation, not an application defect.

Therefore:

`PRINT / PDF BRIEF: PASS — NATIVE PRINT SURFACE REACHED`

Do not reopen the print dialog, save a PDF, test a printer, or require OS-dialog URL observation in CODEX-02.

## Current Delivery Gap

CODEX-01 stopped before:

- final authoritative integrity;
- report creation;
- commit;
- push;
- PR update.

The reported GitHub head remained the original Work 0015 preparation ref, so the GP Workspace source/tests are expected to still be uncommitted in the same local checkout.

## Local Worktree Preflight

Start in the same local Work 0015 checkout.

1. Read all applicable `AGENTS.md` / `AGENTS.override.md` files.
2. Inspect branch, HEAD, and `git status --short`.
3. Preserve all expected uncommitted Work 0015 source/test changes.
4. Do not run `reset`, `clean`, `checkout --`, force operations, or otherwise discard the existing implementation.
5. Confirm the worktree contains the expected GP Workspace production source, UI, public facade update, and tests that produced `203/203 PASS`.
6. Confirm there are no unrelated user changes.

If the expected implementation/test changes are absent, stop with:

`BLOCKED — EXPECTED CODEX-01 LOCAL WORKTREE CHANGES NOT FOUND`

Do not reconstruct speculative code from memory and do not pull over the repository worktree.

## Logic Validation

Without changing product behavior, run once against the exact local tree to be committed:

- focused GP Workspace tests if available;
- `npm run check`;
- `git diff --check`.

Expected full result: `203/203 PASS`, public facade `24`.

If validation fails, repair only a concrete defect in the already-accepted GP Workspace design. Do not introduce a second architecture or broaden scope.

After PASS, freeze application source/tests for the remainder of this dispatch.

## Deployment Boundary

Do not synchronize source, create a version, create a deployment, or update any deployment in CODEX-02.

Accepted runtime identity:

- Apps Script immutable version: `31`;
- existing private Web App updated in place;
- execute as deploying user;
- access `Only myself`;
- normal `/exec` rendered.

Do not touch Library deployments.

## Final Read-Only Integrity

Do not use the native print flow again.

Perform one self-contained read-only comparison using the already-updated `/exec` and the same synthetic GP:

1. capture a fresh authoritative `before` snapshot;
2. open/select the GP Workspace once, or invoke its normal read endpoint through the Web App once;
3. capture an authoritative `after` snapshot;
4. compare and prove no application-data or control-state mutation.

The comparison must cover, at minimum:

- all five Backend sheets still exist with unchanged schema;
- Meeting/Pitchbook row counts and row contents unchanged;
- GP/Option Master row counts and contents unchanged;
- Audit row count and content unchanged;
- authoritative Meeting/Pitchbook Drive file counts and names unchanged;
- Settings, counters, AI/store fields, and `LAST_SETUP_AT` unchanged;
- Script Properties unchanged;
- trigger count/state unchanged;
- deployment identity/version remains the accepted version `31`;
- no Gemini/File Search call;
- no report artifact in Drive.

The GP Workspace endpoint itself may be called once for this comparison. It must remain read-only.

If any authoritative mutation is observed, stop and report the exact smallest difference. Do not repair data or retry.

## Reporting

Create both reports so the dispatch history is complete:

1. `docs/handoffs/0015-CODEX-01-gp-workspace-implementation-report.md`
   - record implementation, `203/203 PASS`, version `31`, GP Workspace/relationship/follow-up PASS, and native print-surface PASS;
   - record that CODEX-01 stopped only because of an automation limitation before final readback/delivery;
   - do not classify that print-dialog limitation as an application blocker.

2. `docs/handoffs/0015-CODEX-02-finalize-readonly-qualification-and-delivery-report.md`
   - record local-tree preservation, final validation, read-only integrity, and GitHub delivery.

Update:

- `docs/handoffs/0015-report.md`;
- `docs/handoffs/0015-instruction.md`;
- `docs/handoffs/0015-dispatches.md`;
- Draft PR #20 body.

## Completion Latch

If the local implementation is present, deterministic validation passes, and final read-only integrity passes, classify:

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS`;
- `SIDE_EFFECT_STATE: DISABLED` for application data and unauthorized effects;
- `READY: YES`;
- `BLOCKER: NO`;
- `DEV QUALIFIED — WORK 0015 GP WORKSPACE / ONE-PAGE SUMMARY`.

Browser-native PDF file creation is not required. The accepted product capability is the bounded print-only brief plus successful invocation of the normal print surface.

## Delivery

Commit and push all scoped Work 0015 source, tests, and docs to:

`agent/0015-gp-workspace-one-page-summary`

Update Draft PR #20. Keep it Draft / Open / unmerged for ChatGPT final review.

Do not commit runtime IDs, private URLs, account identifiers, Script Property values, credentials, or synthetic free-text content beyond existing safe fixtures.

Return only:

- Work ID;
- Dispatch ID;
- LOGIC_VALIDATION;
- TARGET_RUNTIME_QUALIFICATION;
- SIDE_EFFECT_STATE;
- print-surface classification;
- final integrity;
- report paths;
- final commit;
- branch;
- Draft PR;
- BLOCKER YES / NO;
- one-line evidence for any FAIL / DEFERRED item.

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
