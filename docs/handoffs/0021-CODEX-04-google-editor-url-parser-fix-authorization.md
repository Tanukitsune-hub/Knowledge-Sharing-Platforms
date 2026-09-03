# Work 0021 — CODEX-04 Google editor Drive-URL parser fix authorization

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Decision

Authorize the same CODEX-04 Dispatch to fix the now-verified FULL_OUTPUT Drive-link parser defect, create exactly one further immutable Apps Script version, update the same existing private Web App once, and run the single remaining FULL_OUTPUT/final-integrity gate.

Do not create `0021-CODEX-05`.

## ChatGPT read-only diagnosis

The runtime data and Drive file are valid. This is not a missing-file or bad-row problem.

### `DOC-000022` authoritative row

```text
Document_ID: DOC-000022
File_ID: 1ZcgJwGY4W3FbQTv_oZzKA9-oabTgbQC5
File_URL: https://docs.google.com/presentation/d/1ZcgJwGY4W3FbQTv_oZzKA9-oabTgbQC5/edit?...
Original_Filename: KSP-CODEX04-PPTX.pptx
Status: Active
OpenAI status: Indexed
```

Google Drive metadata independently confirms:

```text
id: 1ZcgJwGY4W3FbQTv_oZzKA9-oabTgbQC5
mimeType: application/vnd.openxmlformats-officedocument.presentationml.presentation
size: 45493
trashed: false
webViewLink: https://docs.google.com/presentation/d/1ZcgJwGY4W3FbQTv_oZzKA9-oabTgbQC5/edit?...
```

The row URL and Drive metadata URL carry the exact authoritative File ID.

### Adjacent `DOC-000024` evidence

The valid raw XLSX row/file uses the same Google editor web-view pattern:

```text
File_URL: https://docs.google.com/spreadsheets/d/1HzmRoxQ0-XBIeENZoJ1vY_CfV8n7xSph/edit?...
mimeType: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Therefore fixing only the observed PPTX instance would leave the same latent failure for XLSX.

### Verified code defect

At the reviewed PR head, `kspKnowledgeExportUrlFileId_` accepts:

- `https://docs.google.com/document/d/<id>/...`;
- `https://drive.google.com/file/d/<id>/...`;
- `https://drive.google.com/open?id=<id>` / `uc?id=<id>`.

It does not accept the valid Drive `webViewLink` shapes:

- `https://docs.google.com/presentation/d/<id>/...`;
- `https://docs.google.com/spreadsheets/d/<id>/...`.

Consequently `DOC-000022` is rejected as URL-missing before the existing File-ID equality and Drive metadata checks can complete. `DOC-000024` would be the next affected row after PPTX.

Root cause:

```text
FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
```

## Required source fix

Make the smallest strict change in the existing Knowledge Export URL parser:

1. accept exact HTTPS URLs on `docs.google.com` for:
   - `/document/d/<id>`;
   - `/presentation/d/<id>`;
   - `/spreadsheets/d/<id>`;
2. retain the current accepted `drive.google.com` shapes;
3. return only the extracted stable File ID;
4. retain exact File-ID equality checks against the authoritative row and Drive metadata;
5. reject look-alike hosts, malformed paths, missing IDs, mismatched IDs, non-HTTPS schemes, and unrelated Google paths;
6. do not broaden the parser to arbitrary domains or arbitrary `docs.google.com` paths;
7. do not rewrite the authoritative Backend rows merely to fit the old parser.

The canonical exported Pitchbook reference may continue to use the existing stable `https://drive.google.com/open?id=<id>` form.

## Required deterministic tests

Add focused coverage proving:

1. valid document, presentation, spreadsheets, Drive file, Drive open, and Drive uc URL forms extract the exact File ID;
2. the actual-style PPTX URL with query parameters passes source integrity when its File ID and Drive metadata ID match;
3. the actual-style XLSX URL with query parameters also passes;
4. PPTX/XLSX mismatch between URL ID, row File ID, or Drive metadata ID fails closed;
5. look-alike hosts such as `docs.google.com.example.com`, unsupported editor paths, HTTP, empty IDs, and malformed URLs remain rejected;
6. FULL_OUTPUT still reads no Pitchbook body bytes and remains API-independent;
7. existing Meeting document URL behavior and all accepted Work 0021 tests remain PASS.

Run focused tests, then:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken existing source-integrity assertions.

## Explicit bounded runtime authorization

```text
ADDITIONAL_APPS_SCRIPT_VERSIONS: 1
ADDITIONAL_EXISTING_WEB_APP_UPDATES: 1
EXPECTED_NEXT_VERSION: 66
VERSION_67_OR_LATER: NOT AUTHORIZED
OPENAI_SYNC_OR_QUERY_RERUNS: 0
GEMINI_CALLS: 0
```

Before deployment:

1. verify current remote/PR head and the accepted version-65 state;
2. rerun focused and canonical validation;
3. deliver/read back the exact tested source once.

Then:

1. create one immutable Apps Script version, expected version 66;
2. update the same existing private Web App once;
3. do not repeat file registration, OpenAI sync, or the six grounded queries;
4. run exactly one API-independent FULL_OUTPUT preview covering `DOC-000019` through `DOC-000024`;
5. require all six Pitchbooks to resolve as authoritative reference metadata/links only;
6. require Meeting bodies to remain the only full-text bodies;
7. require zero OpenAI/Gemini API calls and no package/artifact creation for preview;
8. complete read-only final provider/source integrity using the already accepted 6/6 OpenAI evidence;
9. update the final CODEX-04 report, Work tracking, runtime locator, and PR #34.

If the preview passes, mark all six formats `SUPPORTED_AND_QUALIFIED` and return PR #34 ready for ChatGPT final merge.

If the version-66 preview still fails, stop with the exact evidence. Do not create version 67, another Dispatch, or another repair/deployment automatically.

## Prohibited actions

- no Backend row rewrite to hide the parser defect;
- no repeat registration;
- no repeat OpenAI exact sync or format query;
- no broad sync/reindex;
- no Gemini call or provider fallback;
- no `DOC-000018` or old large-fixture mutation;
- no chooser-automation repair;
- no Work 0023 implementation;
- no new Web App, Vector Store, endpoint, trigger, or Library;
- no confidential data;
- no rebase, force-push, history rewrite, or PR merge.

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
OPENAI_API_CALLED_IN_RESUME: NO
GEMINI_API_CALLED: NO
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

The final Codex response must begin and end with:

```text
WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
```
