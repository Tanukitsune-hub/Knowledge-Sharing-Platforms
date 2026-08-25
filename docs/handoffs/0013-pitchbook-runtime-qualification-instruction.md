# Work 0013 — Bounded Pitchbook runtime qualification

WORK_ID: `0013`

Status: `ACTIVE NEXT EXECUTION`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Luna Max execution-only DEV qualification`.

Recommended Codex model: `Luna Max`.

Rationale: the Date normalization defect is already diagnosed, fixed, and live-verified. The next package contains only predetermined Pitchbook runtime checks. Luna Max must execute the matrix and collect evidence; it is not authorized to diagnose or modify source in this run.

Parent ref: `c189a7211328ccf4b7e2c410424882f23577dc86`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report to update: `docs/handoffs/0013-report.md`.

## Hard scope boundary

This run is qualification-only.

- Do not change production source, tests, architecture, limits, or documentation except the Work 0013 report and PR evidence.
- Do not investigate root cause if any step fails.
- At the first unexplained failure, capture the required non-secret evidence, stop the affected matrix, complete only independent checks that cannot contaminate the evidence, and return control to ChatGPT.
- A source fix requires a new ChatGPT-authored bounded diagnosis handoff.

## Applicable instructions

Before starting:

1. read every applicable `AGENTS.md` / `AGENTS.override.md`;
2. read `docs/handoffs/0013-resume-instruction.md`;
3. read the completed Date diagnosis record;
4. confirm the checkout is on the exact branch HEAD supplied by ChatGPT;
5. do not discard unrelated local work;
6. use synthetic DEV files only.

Subagents remain mandatory but are limited to:

- one independent evidence verifier for Drive/Index/Audit results;
- one final report/Git consistency reviewer.

Do not use subagents for competing root-cause exploration.

## Matrix A — Current-Batch status lifecycle

Use one of the current synthetic `04 / 05 / 06` Active Pitchbook rows created after the Date fix.

Before mutation, record privately and compare after each step:

- Document ID;
- stable File ID;
- Batch ID;
- Sequence No;
- saved filename;
- Date value / rendered date;
- Status;
- Updated At;
- AI index state;
- count of Index rows for the Document ID;
- count of Drive files carrying the Document ID appProperty.

Execute through the current DEV Web App:

1. Active → Inactive.
2. Search/read back the row and Drive file.
3. Inactive → Active.
4. Search/read back again.

PASS requires:

- the same Document ID and File ID throughout;
- exactly one Index row and one authoritative Drive file;
- Batch ID and Sequence No unchanged;
- saved filename unchanged;
- Date remains the same calendar date and is usable in the edit form;
- Status becomes Inactive then Active;
- Updated At advances;
- AI state follows the accepted Pending/re-index contract;
- Audit contains metadata only and no file bytes/source content/raw API payload.

### Stop condition A

On any mismatch or UI/server error:

- do not edit source;
- capture the safe error code/message, before/after non-secret fields, row/file counts, and exact step;
- stop Matrix A and return the evidence to ChatGPT.

## Matrix B — Public-contract retry and duplicate protection

Use one fresh small synthetic TXT file with a unique filename and harmless known text.

The user may perform one native file-selection action when requested. Do not ask the user to paste IDs or file contents into chat.

Execute through the existing normal public facade, without a qualification wrapper:

1. Prepare one fresh Pitchbook batch/slot using the selected file descriptor.
2. Preserve the returned Batch ID, Document ID, reserved Sequence No, slot fingerprint, filename, size, MIME type, and selected File object only inside the active DEV/browser session.
3. Make one controlled first upload call through `uploadPitchbookFile` with the same reserved slot but an intentionally incorrect `sizeBytes` value of actual size + 1. Do not alter the file or reservation.
4. Expect a safe size-mismatch rejection before Drive creation.
5. Read back the slot and verify there is still no authoritative Drive file and no duplicate Index row.
6. Retry the same slot using the exact correct size, MIME type, fingerprint, filename, and base64 bytes.
7. Verify the same Batch ID / Document ID / reserved Sequence No becomes Active with exactly one File ID/File URL and exactly one Drive file.
8. Repeat the exact correct upload request once more against the now-Active slot.
9. Verify idempotent replay/reuse and no second Drive file or Index row.

PASS requires:

- first controlled call rejected with the expected safe size-mismatch code;
- no Drive file created by the rejected call;
- correct retry activates the same reserved slot;
- exactly one Index row and one Drive file exist afterward;
- repeated correct call is idempotent and creates no duplicate;
- Audit remains metadata-only.

### Stop condition B

If the first rejection uses a different error code, the correct retry does not become Active, or duplication occurs:

- do not test another hypothesis;
- do not modify source;
- preserve the exact safe error code, slot status, row/file counts, and request stage;
- stop Matrix B and return the evidence to ChatGPT.

## Matrix C — Practical browser upload boundary

This matrix measures transport behavior only. It does not authorize a product-limit change.

Prepare supported synthetic TXT or PDF files containing non-confidential filler bytes. Use at most three rounds:

### Round 1

- 1 MB
- 5 MB
- 10 MB

### Round 2 — only when Round 1 fully passes

- 15 MB
- 20 MB

### Round 3 — only when Round 2 fully passes

- 25 MB exact policy boundary

Use one file per batch unless a multi-file batch is necessary to prove a distinct behavior. Confirm each success through browser response and Drive/Index readback.

For every size record:

- nominal file size;
- whether FileReader/base64 completed;
- whether the Apps Script call returned;
- safe result/error code;
- elapsed time rounded to a non-sensitive useful measure;
- final row Status;
- whether File ID/File URL appeared;
- whether exactly one Drive file/Index row exists.

Rules:

- Stop escalating at the first reproducible failure.
- Retry the failed size once using a fresh batch and the same-size newly generated synthetic file.
- Do not keep retrying after the confirmation attempt.
- Do not lower constants or change UI/docs in this run.
- Do not add chunking or another upload architecture.

PASS for retaining the current 25 MB policy requires two successful 25 MB browser uploads in separate fresh batches. Anything less is evidence only, not proof that 25 MB is reliable.

### Stop condition C

At the first reproducible size failure:

- stop the size escalation;
- do not diagnose or modify source/limits;
- return the largest stable size, first reproducible failing size, safe error/timeout stage, and final row/file state to ChatGPT.

## User interaction

- Ask the user only for the exact file-selection or confirmation action needed at that moment.
- Name the synthetic files to select.
- After selection, continue automatically.
- Never use blind Windows mouse/keyboard automation or infer an unknown browser URL.
- Never ask the user to paste credentials, IDs, URLs, cookies, or tokens into chat.

## Final checks and report

After all completed matrices:

- do not run a broad test suite unless source changed unexpectedly; source change is not authorized;
- run `npm run check`, `npm run test`, and `git diff --check` once as final consistency checks;
- update `docs/handoffs/0013-report.md` with exact `PASS / FAIL / DEFERRED` results;
- include the upload-size table without private IDs/URLs;
- state clearly that no source change was made;
- commit/push the report only;
- update Draft PR #11;
- do not merge.

## Completion response

Return only:

- Work ID;
- report path;
- final commit;
- branch;
- Draft PR;
- Matrix A result;
- Matrix B result;
- largest stable upload size;
- first reproducible failing size, if any;
- `BLOCKER: YES / NO`;
- one-line safe evidence for ChatGPT when any matrix stops.
