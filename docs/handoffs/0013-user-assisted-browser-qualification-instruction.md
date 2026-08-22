# Work 0013 — User-assisted browser qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — user-assisted browser actions + Luna Max evidence verification only`.

Recommended Codex model: `Luna Max`.

Rationale: the application has no reproduced source defect in the latest runtime run. Matrix A and C stopped before application mutation or upload because the browser automation surface became unreliable. The shortest safe path is for the user to perform the native browser actions manually while Luna Max observes and verifies authoritative Drive / Index / Audit results. Luna Max is not authorized to investigate source or operate the browser UI in this run.

Parent ref: `8698472653a9fe2ebc58082a8803b54a3169c85c`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

## Accepted diagnosis

The latest Matrix A/C evidence is most consistent with a browser-automation/session failure rather than an application failure:

- Matrix A: the current Active Pitchbook row rendered correctly, Drive link was visible, browser error log was empty, one Edit action left the card hidden, and no application safe error or mutation occurred;
- Matrix C: the stop happened before file selection, FileReader, Apps Script call, Drive write, or Index write; the automation filechooser timed out and the browser target then closed;
- these two failures occurred in unrelated UI paths but share the same automated browser-control surface;
- the same current DEV deployment previously completed a synthetic three-file Pitchbook batch to Active with Drive links.

This run does not attempt to prove or repair a source defect. It bypasses the unstable automation layer by using explicit user actions.

## Hard scope boundary

- Do not modify source, tests, limits, architecture, UI, or product documentation.
- Do not use browser automation, filechooser APIs, Playwright-like click control, blind Windows automation, or target inference.
- Do not investigate root cause if a manual action fails.
- Do not create a temporary public wrapper or debug endpoint.
- Update only the Work 0013 report and PR evidence.

## User interaction protocol

At each checkpoint, instruct the user in one short sentence and wait for confirmation before continuing.

The user performs the browser action manually. Luna Max performs only post-action verification through the strongest available non-browser evidence.

Never ask the user to paste credentials, private IDs, URLs, tokens, cookies, or confidential content.

## Matrix A — Manual current-Batch lifecycle

Use one current synthetic Active Pitchbook row from the `04 / 05 / 06` batch.

### Checkpoint A1 — open edit card

Tell the user:

`過去資料画面で、04〜06のうち1件の「編集」を手動でクリックしてください。編集カードが表示されたら「表示された」とだけ返信してください。`

After confirmation:

- verify no new unexpected Drive/Index change occurred merely from opening edit;
- if possible, read the existing backend row through the connected Google data path and preserve Document ID / File ID / Batch ID / Sequence / Status / Updated At privately for comparison;
- do not require the browser edit card itself for further automation.

If the user says the card did not appear, stop Matrix A immediately and report `MANUAL_UI_FAILURE`; do not investigate source.

### Checkpoint A2 — Inactivate

Tell the user:

`同じ行の「無効化」を手動で押し、確認ダイアログで確定してください。完了したら「無効化した」とだけ返信してください。`

After confirmation, verify through authoritative Backend/Drive evidence:

- Status = Inactive;
- same Document ID;
- same File ID;
- same Batch ID;
- same Sequence No;
- same saved filename;
- source file still exists;
- Updated At changed appropriately;
- AI state is coherent with the accepted lifecycle contract;
- one expected metadata-only Audit event if accessible.

### Checkpoint A3 — Reactivate

Tell the user:

`同じ行の「再有効化」を手動で押して確定してください。完了したら「再有効化した」とだけ返信してください。`

Verify:

- Status returns to Active;
- stable identities and source file remain unchanged;
- no duplicate Index row or Drive file;
- Audit/AI state remains coherent.

Matrix A passes only on authoritative readback, not merely on the visible badge.

## Matrix B — Retry / duplicate protection

Do not manufacture a malformed `sizeBytes` request in this run.

The current public UI has no supported user operation for that malformed request, and deterministic/server-side retry/idempotency evidence already exists.

Classify the synthetic malformed-request live case as `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained` unless a naturally failed current slot already exists.

If a naturally Failed/Pending current slot exists and the exact matching synthetic local file is available, the user may manually re-select that file and click retry once. Then verify:

- same Batch ID / Document ID / reserved sequence;
- one Index row;
- one Drive file;
- Active after success;
- no duplicate file/row on one repeated normal retry action if the UI still presents it.

Do not create a new failure merely to satisfy Matrix B.

## Matrix C — Manual upload-size qualification

The user will perform native file selection manually. Luna Max prepares synthetic files and verifies results.

Maximum three rounds:

### Round 1

Prepare supported synthetic TXT files of approximately:

- 1 MB;
- 5 MB;
- 10 MB.

Tell the user exactly where the files are located locally without putting the path in GitHub/report, and ask:

`Pitchbook登録画面で、指定した1MBファイルだけを手動で選択して登録してください。画面に成功/失敗が出たら、その文言だけ教えてください。`

After user confirmation, verify authoritative Backend/Drive result.

If 1 MB fails at application/upload level, stop Matrix C and return evidence to ChatGPT. Do not diagnose.

If 1 MB passes, repeat manually for 5 MB, then 10 MB in the same round unless the prior size fails.

### Round 2

Only if 10 MB passes, prepare/test 15 MB and 20 MB one at a time by the same user-assisted process.

### Round 3

Only if 20 MB passes, test exactly 25 MB once.

For every size record:

- whether file selection completed;
- whether Apps Script returned success/failure;
- final row Status;
- File_ID/File_URL presence without recording values;
- one Drive file / one Index row;
- elapsed behavior only qualitatively (`normal`, `slow but completed`, `timeout`)—do not report internal effort timing.

Largest stable upload size = largest size with successful authoritative Drive/Index completion.
First reproducible failing size = first size that reaches the application/upload path and fails reproducibly. A browser-control failure before manual selection is not a size failure.

Do not lower the product limit in this qualification-only run. If a stable boundary below 25 MB is established, stop and return evidence to ChatGPT for a separate bounded limit-change handoff.

## Stop conditions

Stop the affected matrix and return to ChatGPT when:

- a user-performed browser action fails to produce the expected UI state;
- an application safe error appears;
- Backend/Drive/Audit readback contradicts the visible result;
- a size fails after the actual upload call begins;
- duplicate row/file or identity drift is observed;
- any source change would be required.

Do not investigate, retry repeatedly, change code, or switch hypotheses.

## Validation / report

After completing the available manual matrices:

- update `docs/handoffs/0013-report.md` with exact PASS / FAIL / DEFERRED / NOT APPLICABLE results;
- distinguish manual browser evidence from Backend/Drive/Audit verification;
- do not claim CI PASS; no source change means rerunning the full local suite is optional unless the working tree changed unexpectedly;
- if a report-only commit is made, run `git diff --check`;
- commit/push report-only changes;
- update Draft PR #11;
- do not merge.

## Completion response

Return only:

- Work ID;
- Matrix A result;
- Matrix B result;
- Matrix C result;
- largest stable upload size;
- first reproducible failing size;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for ChatGPT when a matrix stops.
