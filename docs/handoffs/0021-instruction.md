# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-05`
BALL: `CODEX`
STATUS: `READY`
MODE: `REVIEW_FIX -> FINAL WORK QUALIFICATION`

Active instruction:

`docs/handoffs/0021-CODEX-05-google-editor-url-parser-fix-instruction.md`

CODEX-04 report:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted state through CODEX-04

Work 0021 is accepted through CODEX-03. CODEX-04 returned after completing normal six-file registration, exact OpenAI sync 6/6, grounded query/source-ID checks 6/6, and the EML attachment boundary. The same private Web App is version 65.

CODEX-04's final API-independent FULL_OUTPUT preview failed on `DOC-000022`.

ChatGPT read-only checks confirm the row and raw PPTX file are valid and share the same File ID. The authoritative Drive `webViewLink` is a valid `https://docs.google.com/presentation/d/<id>/...` URL, while the adjacent XLSX uses `https://docs.google.com/spreadsheets/d/<id>/...`.

The current Knowledge Export URL parser recognizes `docs.google.com/document/d/...` but omits Presentation and Spreadsheets editor forms.

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
CURRENT_VERSION: 65
OPENAI_MATRIX: PASS — 6/6
FULL_OUTPUT_REFERENCE_PARITY: FAIL
```

Because CODEX-04 had already returned, the parser repair is a new Codex execution request and therefore uses `0021-CODEX-05` under the repository Dispatch governance.

CODEX-05 may make only the smallest strict parser/test repair, create at most version 66, run exactly one FULL_OUTPUT preview and final read-only integrity check, then stop.

No repeat registration or OpenAI sync/query, no Gemini, no large fixtures, no Work 0023, no general hardening, and no version 67.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-05`
BALL: `CODEX`
STATUS: `READY`
