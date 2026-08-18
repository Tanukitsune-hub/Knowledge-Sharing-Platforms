# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT-led diagnosis; Codex authenticated DEV execution and bounded verification`.

Recommended Codex model: `Luna Max`.

## Current operating rule

Product architecture and feature scope are settled through Work 0012. Luna Max is not authorized to perform open-ended root-cause discovery.

For known qualification matrices, Luna Max may execute the specified steps. When a live defect appears, Luna Max must stop with the smallest safe evidence and wait for a new ChatGPT-authored bounded handoff.

## Current state and next execution

Completed and accepted:

- Pitchbook Date representation repair: PASS;
- Pitchbook status-parser repair: PASS;
- Matrix A `Active -> Inactive -> Active`: live PASS;
- Matrix B: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`;
- Matrix C normal-browser upload-size qualification: PASS at `1 / 5 / 10 / 15 / 20 / 25 MiB`;
- largest stable supported upload: `25 MiB / 26,214,400 bytes`;
- first observed failing size: none;
- first reproducible failing size: not established within the supported range.

The active next execution is the final safely executable non-AI DEV qualification:

`docs/handoffs/0013-non-ai-final-live-qualification-instruction.md`

This run covers:

1. post-hardening private administrator setup / validation / status / disabled-sync execution path; and
2. real Gemini-independent Knowledge Export Docs / PDF / hyperlinks / Audit / non-indexing / clipboard.

Do not rerun Matrix A/B/C, upload sizing, parser diagnosis, or prior defect work.

## Current policy

`docs/handoffs/0013-resume-instruction.md`

Completed records:

- `docs/handoffs/0013-pitchbook-date-normalization-instruction.md`;
- `docs/handoffs/0013-pitchbook-status-parser-defect-report.md`;
- `docs/handoffs/0013-matrix-c-upload-size-qualification-report.md`.

Primary report:

`docs/handoffs/0013-report.md`

## Remaining qualification scope

Safely executable now:

- private administrator execution path after Work 0012 hardening;
- real Knowledge Export Docs / PDF / hyperlinks / Audit / non-indexing / clipboard.

External residual categories to be separated after the final non-AI run:

- disposable Shared Drive-specific behavior when authorized test infrastructure exists;
- billing-enabled Gemini / File Search live qualification when an approved DEV credential exists.

Normal-UI retry/duplicate-protection remains accepted as `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained` unless a natural Failed/Pending slot is encountered in a separately authorized run. Do not manufacture one.

If the final non-AI run completes without an implementation blocker, Work 0013 may be classified:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`.

Do not claim `PRODUCTION READY` without Shared Drive-specific and Gemini/File Search live evidence.

## Safety

- DEV only;
- synthetic/anonymized data only;
- no production deployment or destructive production action;
- no credentials, private IDs/URLs, source content, or user-specific local paths in GitHub/report/chat;
- no temporary public admin/debug wrapper;
- no blind Windows UI automation;
- no feature addition or broad refactor.

## Delivery

Continue using Work ID `0013`, the existing branch, report, and Draft PR #11. Do not merge. ChatGPT performs the final merge review after the non-AI qualification result.
