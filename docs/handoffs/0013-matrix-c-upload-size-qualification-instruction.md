# Work 0013 — Matrix C practical browser upload-size qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — user-assisted native file selection + Luna Max authoritative verification`.

Recommended Codex model: `Luna Max`.

Rationale: Matrix A is now live-verified PASS and the remaining Matrix C procedure is fully specified. The residual work is deterministic local test-file preparation, user-assisted browser upload, and Backend/Drive/Audit verification. No architecture, open-ended diagnosis, or source implementation is required.

Parent ref: `93c57bf5d1ce9a8c50d4a4b603d281e93c5d614e`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

Dedicated report: `docs/handoffs/0013-matrix-c-upload-size-qualification-report.md`.

## ChatGPT-completed judgment

The Pitchbook status-parser defect is repaired and live Matrix A has passed `Active -> Inactive -> Active` with stable File ID/File URL, one Drive source file, and successful Audit entries.

Matrix B remains `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`; do not manufacture a malformed request.

The product file-size limit is defined by production source as:

`KSP_PITCHBOOK_LIMITS.FILE_BYTES = 25 * 1024 * 1024`.

Therefore the exact upper-bound test file is `26,214,400 bytes`.

## Outcome

Establish the practical normal-browser upload behavior of the current DEV deployment across the accepted file-size range, using only supported normal UI operations and synthetic `.txt` files.

Required result:

- Matrix C PASS through the exact 25 MiB boundary, or
- the first safely observed application/upload-path failure with authoritative evidence and no speculative diagnosis.

Record:

- largest stable upload size;
- first reproducible failing size if actually established;
- if only one failure is observed before mandatory stop, record that as `first observed failing size` and leave `first reproducible failing size = not established`.

## Accepted prior results — do not rerun

- Matrix A: `PASS`.
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- parser defect diagnosis/repair/regressions: `PASS`.

Do not re-run status lifecycle, parser diagnosis, malformed-size retry, or earlier automated filechooser attempts.

## Hard scope boundary

Allowed:

- create temporary synthetic local `.txt` files for the size matrix;
- ask the user to perform native browser file selection and the normal Pitchbook registration action;
- inspect authoritative synthetic DEV Backend / Drive / Audit evidence through existing approved authenticated paths;
- update Work 0013 report evidence and the dedicated Matrix C report.

Not allowed:

- source, test, UI, architecture, manifest, product-limit, or deployment changes;
- browser automation, filechooser APIs, Playwright-like native-picker control, blind Windows mouse/keyboard automation, or target inference;
- public debug/qualification wrappers;
- malformed request manufacture;
- repeated retry loops;
- production or confidential data;
- Gemini/File Search, Shared Drive qualification, Knowledge Export, clipboard, Docs/PDF qualification, or administrator-path qualification in this run.

If any source change or a second hypothesis would be needed, stop and return evidence to ChatGPT.

## Applicable repository instructions and subagents

Before starting, read all applicable `AGENTS.md` files and identify the repository-specific subagent-use policy.

Subagent use is mandatory and must be active but proportionate. Use subagents for independent preflight/evidence verification and final report/result cross-checking. Do not use subagents to explore competing root causes or duplicate the same browser/user interaction.

## Preflight

1. Confirm current branch is `agent/0013-consolidated-dev-live-qualification` and HEAD contains parent ref `93c57bf5d1ce9a8c50d4a4b603d281e93c5d614e` plus this instruction commit/ref supplied in chat.
2. Confirm working tree is safe and preserve unrelated work.
3. Confirm the same synthetic DEV Web App deployment used for the successful Matrix A is available.
4. Do not redeploy unless the existing approved DEV deployment is demonstrably not on the already-validated parser-fix version; if deployment ambiguity exists, stop rather than changing deployment in this run.
5. Confirm the normal Pitchbook registration page loads. Do not operate it through browser automation.

## Synthetic files

Prepare temporary ASCII `.txt` files with exact byte sizes:

| Display label | Exact bytes |
|---|---:|
| 1 MiB | 1,048,576 |
| 5 MiB | 5,242,880 |
| 10 MiB | 10,485,760 |
| 15 MiB | 15,728,640 |
| 20 MiB | 20,971,520 |
| 25 MiB | 26,214,400 |

Use deterministic synthetic content only. Verify each local file's exact byte size before presenting it to the user.

Prefer a generic non-personal temporary location such as `C:\Temp\KSP0013\` when writable. Do not commit test files. Do not record user-specific local paths in GitHub reports or PR text. Remove temporary files after the run only if doing so is safe and does not affect evidence.

## User interaction protocol

For each attempted size, ask only for the one native action needed and wait for the user's confirmation before performing authoritative verification.

Never ask for credentials, tokens, cookies, private Google resource IDs, or confidential content.

The user performs file selection and normal UI registration manually. Luna Max does not click or control the browser.

Use a synthetic DEV Pitchbook context only. Reuse an already approved synthetic GP / Asset Class context if convenient; do not create or modify Masters solely for this matrix.

## Matrix C execution

Run sizes strictly in ascending order and one file per registration.

### Round 1

Test:

1. 1 MiB;
2. 5 MiB only if 1 MiB passes;
3. 10 MiB only if 5 MiB passes.

For each size, tell the user which temporary filename to select and ask them to register that one file through the normal Pitchbook UI. Ask them to return only the visible success/failure wording or a short `成功した` confirmation.

After each user action, verify before proceeding:

- actual upload path was reached;
- Apps Script normal operation returned success/failure as observable;
- exactly one corresponding Index row exists for that attempted registration;
- on success, final Status = `Active`;
- on success, File_ID and File_URL are present, without recording their values;
- exactly one matching Drive source file exists;
- Batch ID / Document ID / reserved sequence are internally coherent;
- Audit event is coherent and metadata-only when accessible;
- no duplicate row or duplicate Drive file was created.

If 1, 5, or 10 MiB fails after the real application/upload path begins, stop Matrix C immediately after authoritative readback. Do not diagnose or retry the same size in this run.

### Round 2

Only if 10 MiB passes, test sequentially:

4. 15 MiB;
5. 20 MiB only if 15 MiB passes.

Use the same one-file manual process and the same authoritative checks.

Stop immediately on the first application/upload-path failure or contradictory Backend/Drive/Audit result.

### Round 3

Only if 20 MiB passes, test:

6. exact 25 MiB = `26,214,400 bytes` once.

PASS requires authoritative completion to one Active Index row and one matching Drive source file, with File_ID/File_URL populated and no duplication.

Do not test above 25 MiB in this qualification run. The purpose is to qualify the accepted product boundary, not probe unsupported sizes.

## Classification rules

For every attempted size record:

- native file selection: completed / not completed;
- upload/application path: reached / not reached;
- result: PASS / FAIL / STOPPED;
- final row Status;
- File_ID/File_URL: present / absent only, never values;
- Index row count for the attempt;
- matching Drive file count;
- qualitative behavior only: `normal`, `slow but completed`, or `timeout`.

Do not report elapsed execution time.

`largest stable upload size` = largest tested exact byte size with successful authoritative Backend + Drive completion.

`first reproducible failing size` may only be populated when reproducibility is actually established by prior accepted evidence or a separately authorized repeat. A single new failure in this run does not establish reproducibility because the mandatory rule is to stop at first failure.

If all sizes through exact 25 MiB pass:

- Matrix C = `PASS`;
- largest stable upload size = `25 MiB / 26,214,400 bytes`;
- first reproducible failing size = `not established within supported range`.

A native-picker/user-action failure before the actual upload call is not a size failure. Classify it separately and stop without inferring a capacity boundary.

## Mandatory stop conditions

Stop and return evidence to ChatGPT when any of the following occurs:

- user-performed file selection or normal UI action does not reach the expected application state;
- an application safe error appears;
- the actual upload path begins and the attempt fails;
- visible UI result conflicts with Backend/Drive/Audit readback;
- duplicate Index row or Drive file appears;
- identity drift or unexpected mutation is observed;
- current DEV deployment cannot be confidently identified as the already-validated version;
- source/test/deployment/limit change appears necessary;
- a second hypothesis or open-ended investigation would be required.

Do not investigate root cause in this run.

## Validation and delivery

No source/tests should change. Therefore:

- `npm run check` / `npm run test` do not need to be rerun solely for report-only evidence, because the parser repair's `158/158` PASS remains accepted;
- if any tracked file other than reports/instruction metadata changes unexpectedly, stop and explain;
- run `git diff --check` before committing report changes;
- update `docs/handoffs/0013-report.md` with Matrix C result and retain Matrix A/B accepted classifications;
- create/update `docs/handoffs/0013-matrix-c-upload-size-qualification-report.md` with concise evidence;
- commit and push report-only changes;
- update Draft PR #11;
- do not merge.

## Git / PR requirements

- stay on `agent/0013-consolidated-dev-live-qualification`;
- no force push or history rewrite;
- preserve unrelated work;
- Draft PR #11 remains Draft / Open / unmerged;
- report exact final commit and paths.

## Completion response

Return only:

- Work ID;
- Matrix C result;
- largest stable upload size;
- first observed failing size, if any;
- first reproducible failing size;
- attempted size results in one compact line;
- report path;
- primary report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence if stopped.
