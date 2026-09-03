# Work 0021 report

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-05`
BALL: `CODEX`
STATUS: `READY`

## Executive conclusion

Work 0021 remains accepted through CODEX-03. CODEX-04 completed the six-format normal registration/OpenAI qualification campaign:

```text
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
LOGIC_VALIDATION: PASS — 373/373
CURRENT_PRIVATE_WEB_APP_VERSION: 65
```

CODEX-04 then returned after the final API-independent FULL_OUTPUT preview failed closed on `DOC-000022`.

ChatGPT independently verified that the authoritative PPTX row and Drive file are valid. The defect is the FULL_OUTPUT URL parser, which accepts the Google Docs editor path but omits valid Google Slides and Google Sheets webViewLink paths.

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
DATA_REPAIR_REQUIRED: NO
PROVIDER_REPAIR_REQUIRED: NO
```

Because CODEX-04 had already returned, the parser repair is a distinct Codex execution request and is now `0021-CODEX-05`.

Active instruction:

`docs/handoffs/0021-CODEX-05-google-editor-url-parser-fix-instruction.md`

CODEX-05 is authorized for exactly one additional Apps Script version and one update of the same private Web App, expected version 66. Its scope is only the strict editor-URL parser/test repair, one FULL_OUTPUT preview, and final read-only integrity.

No Backend rewrite, repeat registration/OpenAI sync/query, Gemini, broad sync, `DOC-000018`, old large fixtures, chooser repair, Work 0023, version 67, or general hardening.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-05`
BALL: `CODEX`
STATUS: `READY`
