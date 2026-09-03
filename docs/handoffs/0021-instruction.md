# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
MODE: `REVIEW_FIX -> FINAL WORK QUALIFICATION`

Primary instruction:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`

Current bounded authorization:

`docs/handoffs/0021-CODEX-04-google-editor-url-parser-fix-authorization.md`

Current report:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted state

Work 0021 is accepted through CODEX-03. CODEX-04 has completed normal six-file registration, exact OpenAI sync 6/6, grounded query/source-ID checks 6/6, and the EML attachment boundary. The same private Web App is version 65.

## Verified remaining defect

The final API-independent FULL_OUTPUT preview failed on `DOC-000022`. ChatGPT read-only checks confirm the row and raw PPTX file are valid and share the same File ID. The authoritative Drive `webViewLink` is a valid `https://docs.google.com/presentation/d/<id>/...` URL.

The adjacent XLSX uses the equally valid `https://docs.google.com/spreadsheets/d/<id>/...` form.

The current Knowledge Export URL parser recognizes `docs.google.com/document/d/...` but omits Presentation and Spreadsheets editor webViewLink forms. This is the isolated root cause; do not rewrite the Backend rows.

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
CURRENT_VERSION: 65
OPENAI_MATRIX: PASS — 6/6
FULL_OUTPUT_REFERENCE_PARITY: FAIL
```

Resume the same CODEX-04 under the committed authorization. Make the smallest strict parser/test repair, create at most version 66, run exactly one FULL_OUTPUT preview and final read-only integrity check, then stop.

No repeat registration or OpenAI sync/query, no Gemini, no large fixtures, no CODEX-05, no Work 0023, and no general hardening.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
