# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-04 — READY / FINAL FULL_OUTPUT URL-PARSER FIX

Human-assisted normal registration and the six-format OpenAI matrix are complete.

```text
LOGIC_VALIDATION: PASS — 373/373
PRIVATE_WEB_APP_VERSION: 65
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: FAIL — DOC-000022
PR_34: Draft / Open / unmerged
```

ChatGPT independently verified that `DOC-000022` is not missing or corrupt:

- the authoritative row is Active;
- row `File_ID` and `File_URL` carry the same ID;
- Drive metadata confirms a non-trashed raw PPTX with the same ID and a valid `docs.google.com/presentation/d/<id>/...` webViewLink.

The adjacent valid XLSX uses `docs.google.com/spreadsheets/d/<id>/...`.

The current FULL_OUTPUT parser accepts only `docs.google.com/document/d/...` plus existing `drive.google.com` forms. It omits valid Presentation and Spreadsheets webViewLink shapes.

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
```

Authorization and exact continuation:

`docs/handoffs/0021-CODEX-04-google-editor-url-parser-fix-authorization.md`

Exactly one additional Apps Script version and same-Web-App update are authorized, expected version 66. The resume must make the smallest strict parser/test change, run one API-independent FULL_OUTPUT preview, and stop.

Do not create CODEX-05. Do not rewrite Backend rows, repeat registration, repeat OpenAI sync/query, call Gemini, touch large fixtures, or implement Work 0023.

## Accepted prior dispatches

- CODEX-01: core structured filters and five modes implemented.
- CODEX-02: metadata reconciliation, five-mode runtime, FULL_OUTPUT parity, Gemini-disabled no-failover qualified.
- CODEX-03: 2–5 Entity comparison, per-Entity citation attribution, Related GP / Meeting Type exact filters and FULL_OUTPUT parity qualified.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
