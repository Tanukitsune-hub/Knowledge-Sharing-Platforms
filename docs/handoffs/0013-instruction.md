# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-led diagnosis; Codex authenticated DEV execution and bounded verification`.

Recommended Codex model: `Luna Max`.

## Current operating rule

Product architecture and feature scope are settled through Work 0012. Luna Max is not authorized to perform open-ended root-cause discovery.

For known qualification matrices, Luna Max may execute the specified steps. When a live defect appears, Luna Max must stop with the smallest safe evidence and wait for a new ChatGPT-authored bounded handoff.

## Current state and next execution

The Pitchbook Date representation defect and the Pitchbook status-parser defect are repaired, regression-tested, and live-verified.

Current-Batch Matrix A is complete:

`Active -> Inactive -> Active = PASS`.

Matrix B remains:

`NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.

The active next execution is Matrix C practical browser upload-size qualification only.

Use:

`docs/handoffs/0013-matrix-c-upload-size-qualification-instruction.md`

Do not rerun Matrix A, Matrix B malformed-request work, the parser diagnosis, or the earlier automated-browser filechooser package.

## Current policy

`docs/handoffs/0013-resume-instruction.md`

Completed Pitchbook Date diagnosis record:

`docs/handoffs/0013-pitchbook-date-normalization-instruction.md`

Completed Pitchbook status-parser repair record:

`docs/handoffs/0013-pitchbook-status-parser-defect-report.md`

Primary report:

`docs/handoffs/0013-report.md`

## Remaining qualification scope

- user-assisted practical browser upload-size boundary;
- safe private administrator setup / validation / status / trigger execution path;
- real Knowledge Export Docs / PDF / hyperlinks / Audit / non-indexing / clipboard;
- disposable Shared Drive behavior when authorized test infrastructure exists;
- billing-enabled Gemini / File Search when an approved DEV credential exists.

Normal-UI retry/duplicate-protection remains accepted as `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained` unless a natural Failed/Pending slot is encountered in a separately authorized run. Do not manufacture one.

## Safety

- DEV only;
- synthetic/anonymized data only;
- no production deployment or destructive production action;
- no credentials, private IDs/URLs, source content, or user-specific local paths in GitHub/report/chat;
- no temporary public admin/debug wrapper;
- no blind Windows UI automation;
- no feature addition or broad refactor.

## Delivery

Continue using Work ID `0013`, the existing branch, report, and Draft PR #11. Do not merge. ChatGPT reviews each bounded result and prepares the next exact instruction only when required.
