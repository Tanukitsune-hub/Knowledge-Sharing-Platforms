# Work 0013 — Bounded Pitchbook date-normalization verification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `B — ChatGPT diagnosis, Codex bounded verification / minimal repair`.

Recommended Codex model: `Luna Max`.

Rationale: ChatGPT has already narrowed the observed Pitchbook failure to one falsifiable root-cause hypothesis. Luna Max is used only to reproduce that hypothesis, make one bounded repair when reproduced, run focused regression tests, and perform one live confirmation. Open-ended diagnosis is not authorized.

Parent GitHub ref: `3b780deaa13693eab1325bfd0367cb0a502ca5c7`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report to update: `docs/handoffs/0013-report.md`.

## Mandatory diagnosis boundary

Do not conduct an open-ended root-cause investigation.

The accepted hypothesis for this run is:

> Google Sheets returns `Pitchbook_Index.Date` as a JavaScript `Date` object after persistence, while the browser/reservation input uses a `YYYY-MM-DD` string. Pitchbook sequence-context comparison and slot-fingerprint construction currently stringify these representations without canonical date normalization. This can simultaneously cause a repeated sequence starting at `01` and `PITCHBOOK_SLOT_FINGERPRINT_CONFLICT` before Drive file creation.

Observed evidence supporting the hypothesis:

- current affected rows remain `Pending` with empty `File_ID` and `File_URL`, so the path likely stops before Drive creation;
- two batches for the same date / GP / Asset Class were assigned `01 / 02 / 03` again rather than continuing from the prior maximum;
- the code compares `String(row.Date || '') === input.date` when finding the existing context maximum;
- the slot fingerprint includes the persisted row date without explicit `YYYY-MM-DD` canonicalization;
- an earlier live Meeting defect had the same Sheets `Date` object versus string class of failure.

This hypothesis is not yet proven. Prove or reject it with focused tests before changing production source.

## Allowed scope

Primary source targets:

- `src/62_PitchbookIdentity.gs`
- `src/81_PitchbookReservationAdapters.gs`

Use an existing canonical date helper when suitable, including `kspMaintenanceCellText_(value, 'date')`, instead of adding a parallel date system.

Focused tests may be added to the existing Pitchbook/setup test files. Touch another source file only when strictly required to reuse the existing canonical helper or preserve the accepted contract.

Do not modify unrelated Meeting, Maintenance, Knowledge Export, AI, UI, schema, or architecture behavior.

## Execution sequence

### 1. Stop and preserve current evidence

Before making changes:

- inspect the current working tree;
- preserve any existing scoped evidence;
- do not discard unrelated user or agent work;
- run only the smallest existing Pitchbook test subset needed for a baseline.

### 2. Create the pre-fix reproducer

Add focused deterministic tests covering both representations of the same date:

1. `kspBuildPitchbookSlotFingerprint_` must produce the same fingerprint when the row date is:
   - the string `2026-08-17`; and
   - a JavaScript `Date` representing the same calendar date.
2. Pitchbook context sequence discovery must treat existing rows with a Sheets-style `Date` object as the same context as input date `2026-08-17`, so a prior maximum sequence of `3` yields the next sequence `4`, not `1`.

The tests must demonstrate the current defect before the source fix.

### Mandatory stop condition A

If the focused tests do not reproduce either fingerprint divergence or sequence reset, stop immediately.

Do not investigate another hypothesis, scan the repository broadly, refactor code, or make a speculative source change.

Update the report with:

- the exact test arrangement;
- actual values observed;
- why the accepted hypothesis was rejected or not reproduced;
- the smallest additional evidence ChatGPT would need for the next diagnosis.

Commit/push only durable diagnostic tests or report changes that are valid without weakening the suite.

### 3. Make one minimal repair when reproduced

Only after reproduction:

- canonicalize persisted/input dates to one `YYYY-MM-DD` date key before Pitchbook context comparison;
- canonicalize the date contribution to the slot fingerprint in the same way;
- preserve native Google Sheets Date cells and do not rewrite untouched date metadata merely to obtain matching strings;
- preserve Batch ID, Document ID, reserved sequence, retry, and existing fingerprint contracts outside this normalization defect.

Do not add a migration, new schema, new upload mechanism, compatibility branch, or broad date abstraction.

### 4. Focused deterministic verification

Run:

- the two new regression tests;
- the existing Pitchbook identity / reservation / upload / retry tests;
- one representative Meeting date-preservation regression;
- `npm run check`;
- `npm run test`;
- `git diff --check`.

Record exact observed counts. Do not claim hosted CI PASS unless an actual workflow exists.

### Mandatory stop condition B

If the minimal repair does not make the focused tests pass, stop after that one repair attempt.

Do not pursue alternative causes. Report the exact failed assertion and current diff to ChatGPT.

### 5. One current-DEV live confirmation

After deterministic PASS:

- push only the scoped repaired source to the existing synthetic DEV Apps Script project;
- create one fresh synthetic Pitchbook batch in the same date / GP / Asset Class context as existing rows;
- use small supported synthetic files;
- confirm the new sequences continue from the existing maximum instead of restarting at `01`;
- complete one browser upload/retry;
- verify the successful row becomes `Active` with non-empty `File_ID` and `File_URL`;
- verify exactly one authoritative Drive file and one Index row exist for the Document ID;
- verify the Batch ID / Document ID / reserved sequence remain stable;
- verify no duplicate Drive file or Index row was created.

### Mandatory stop condition C

If the focused tests pass but the live row still remains `Pending`/`Failed`, or `File_ID`/`File_URL` remain empty, stop immediately after capturing the safe exact error code and relevant non-secret row state.

Do not continue root-cause investigation, try a second speculative source fix, inspect unrelated systems, or broaden scope. Return the evidence to ChatGPT for the next diagnosis.

## Subagent use

Read all applicable `AGENTS.md` files first and follow the repository-specific subagent policy.

Subagents remain mandatory, but their roles are bounded:

- one independent verifier confirms whether the specified Date normalization hypothesis is reproduced;
- one independent reviewer checks the minimal patch and regression coverage.

Do not use multiple subagents to explore competing root causes.

## Safety

- synthetic DEV data only;
- no production deployment or production resources;
- no credentials, private Google IDs/URLs, source content, or local paths in GitHub/report/chat;
- no blind Windows UI automation;
- no temporary public admin/debug wrapper;
- no feature addition or broad refactor.

## Delivery

Update the existing:

`docs/handoffs/0013-report.md`

The report must state one of:

- `HYPOTHESIS CONFIRMED — FIXED AND LIVE VERIFIED`;
- `HYPOTHESIS REJECTED — STOPPED FOR CHATGPT DIAGNOSIS`;
- `DETERMINISTIC FIX PASSED — LIVE FAILURE REMAINS, STOPPED FOR CHATGPT DIAGNOSIS`.

Commit and push only scoped source/tests/report changes to the existing branch and update Draft PR #11. Do not merge.

## Completion response

Return only:

- Work ID;
- hypothesis result;
- report path;
- final commit;
- branch;
- Draft PR;
- focused test result;
- live verification result;
- `BLOCKER: YES / NO`;
- one-line evidence needed from ChatGPT when stopped.
