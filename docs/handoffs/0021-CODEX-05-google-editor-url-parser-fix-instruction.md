# Work 0021 — CODEX-05 Google editor Drive-URL parser fix

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-05`
BALL: `CODEX`
STATUS: `READY`

## Purpose

This is a new Codex execution request created after CODEX-04 returned. Per `docs/agent-governance/dispatch-control.md`, it therefore uses the next Dispatch ID rather than extending CODEX-04.

CODEX-04 remains the completed/returned six-format qualification dispatch. This CODEX-05 is limited to the isolated FULL_OUTPUT Drive-URL parser defect found at the end of CODEX-04.

## Verified root cause

`DOC-000022` is a valid Active PPTX row. Its authoritative File ID matches the actual Drive file and the URL ID. Google Drive returns a valid editor webViewLink:

`https://docs.google.com/presentation/d/<id>/...`

The adjacent XLSX `DOC-000024` likewise uses:

`https://docs.google.com/spreadsheets/d/<id>/...`

The current `kspKnowledgeExportUrlFileId_` parser accepts `docs.google.com/document/d/<id>` and existing `drive.google.com` forms, but omits the valid Presentation and Spreadsheets editor forms.

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
DATA_REPAIR_REQUIRED: NO
PROVIDER_REPAIR_REQUIRED: NO
CURRENT_PRIVATE_WEB_APP_VERSION: 65
```

## Required source change

Make only the smallest strict parser/test repair:

1. accept exact HTTPS URLs on `docs.google.com` for:
   - `/document/d/<id>`;
   - `/presentation/d/<id>`;
   - `/spreadsheets/d/<id>`;
2. retain current accepted `drive.google.com` forms;
3. extract only the stable File ID;
4. retain exact equality checks against the authoritative row and Drive metadata;
5. reject look-alike hosts, malformed paths, missing IDs, mismatched IDs, HTTP URLs, and unrelated Google paths;
6. do not rewrite Backend rows merely to fit the old parser.

The canonical exported Pitchbook reference may remain `https://drive.google.com/open?id=<id>`.

## Deterministic validation

Add focused coverage for:

- document / presentation / spreadsheets editor URLs;
- existing Drive file/open/uc forms;
- actual-style query parameters;
- PPTX/XLSX ID mismatch rejection;
- look-alike host rejection;
- HTTP and malformed path rejection;
- FULL_OUTPUT remaining Pitchbook-reference-only and API-independent;
- existing Meeting URL behavior.

Then run:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken source-integrity checks.

## Bounded runtime authorization

Exactly one additional immutable Apps Script version and one update of the same existing private Web App are authorized for this Dispatch.

```text
ADDITIONAL_APPS_SCRIPT_VERSIONS: 1
ADDITIONAL_EXISTING_WEB_APP_UPDATES: 1
EXPECTED_NEXT_VERSION: 66
VERSION_67_OR_LATER: NOT AUTHORIZED
OPENAI_SYNC_OR_QUERY_RERUNS: 0
GEMINI_CALLS: 0
```

Before mutation:

1. verify current remote/PR head and accepted version-65 state;
2. rerun focused/canonical validation;
3. deliver and read back the exact tested Apps Script source once.

Then:

1. create one immutable version, expected version 66;
2. update the same existing private Web App once;
3. do not repeat registration, OpenAI sync, or the six format queries;
4. run exactly one API-independent FULL_OUTPUT preview covering `DOC-000019` through `DOC-000024`;
5. require all six Pitchbooks to resolve as authoritative reference metadata/links only;
6. require Meeting bodies to remain the only full-text bodies;
7. require zero OpenAI/Gemini API calls during this resume;
8. complete final read-only provider/source integrity using the accepted CODEX-04 6/6 OpenAI evidence;
9. update the CODEX-05 report, Work tracking, runtime locator, and PR #34.

If the preview passes, return PR #34 ready for ChatGPT final merge review.

If it fails, stop with the exact evidence. Do not create version 67 or another repair automatically.

## Prohibited actions

- no Backend row rewrite;
- no repeat registration;
- no repeat OpenAI exact sync or format query;
- no broad sync/reindex;
- no Gemini call or provider fallback;
- no `DOC-000018` or old large-fixture mutation;
- no chooser repair;
- no Work 0023 implementation;
- no new Web App, Vector Store, endpoint, trigger, or Library;
- no rebase, force-push, history rewrite, or PR merge.

## Required delivery

Create/update:

`docs/handoffs/0021-CODEX-05-google-editor-url-parser-fix-report.md`

Keep PR #34 Draft/Open/unmerged and return it for ChatGPT final review.

## Completion latch

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
GOOGLE_DOCUMENT_URL: PASS | FAIL
GOOGLE_PRESENTATION_URL: PASS | FAIL
GOOGLE_SPREADSHEETS_URL: PASS | FAIL
LOOKALIKE_AND_MISMATCH_REJECTION: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
SOURCE_READBACK: PASS | FAIL
RUNTIME_DEPLOYMENT_VERSION: 66 | <actual>
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS | FAIL
FINAL_PROVIDER_INTEGRITY: PASS | FAIL
OPENAI_API_CALLED_IN_DISPATCH: NO
GEMINI_API_CALLED: NO
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

The final Codex response must begin and end with:

```text
WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
```
