# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-led diagnosis; Codex authenticated DEV execution and bounded verification`.

Recommended Codex model: `Luna Max`.

## Current operating rule

Product architecture and feature scope are settled through Work 0012. Luna Max is not authorized to perform open-ended root-cause discovery.

For known qualification matrices, Luna Max may execute the specified steps. When a live defect appears, Luna Max must stop with the smallest safe evidence and wait for a new ChatGPT-authored bounded handoff.

A bounded debugging handoff must specify one falsifiable hypothesis, exact code targets, a pre-fix failing test, one minimal repair, focused validation, one live confirmation, and mandatory stop conditions.

Current policy:

`docs/handoffs/0013-resume-instruction.md`

Completed Pitchbook Date diagnosis record:

`docs/handoffs/0013-pitchbook-date-normalization-instruction.md`

Primary report:

`docs/handoffs/0013-report.md`

## Remaining qualification scope

- separate native Pitchbook retry and duplicate-protection confirmation;
- practical browser upload-size boundary;
- current-Batch Active / Inactive / Reactivate;
- safe private administrator setup / validation / status / trigger execution path;
- real Knowledge Export Docs / PDF / hyperlinks / Audit / non-indexing / clipboard;
- disposable Shared Drive behavior when authorized test infrastructure exists;
- billing-enabled Gemini / File Search when an approved DEV credential exists.

## Safety

- DEV only;
- synthetic/anonymized data only;
- no production deployment or destructive production action;
- no credentials, private IDs/URLs, source content, or local paths in GitHub/report/chat;
- no temporary public admin/debug wrapper;
- no blind Windows UI automation;
- no feature addition or broad refactor.

## Delivery

Continue using Work ID `0013`, the existing branch, report, and Draft PR #11. Do not merge. ChatGPT reviews each bounded result and prepares the next exact instruction only when required.