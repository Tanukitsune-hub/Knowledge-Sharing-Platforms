# Work 0021 report

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Executive conclusion

Work 0021 remains accepted through CODEX-03. CODEX-04 completed six-format normal registration, exact OpenAI sync 6/6, grounded query and stable source-ID checks 6/6, and the EML attachment boundary at private Web App version 65.

The final API-independent FULL_OUTPUT preview failed closed on `DOC-000022`, but ChatGPT has now isolated the cause without changing runtime data.

## Read-only evidence

`DOC-000022` is an Active authoritative PPTX row with:

```text
File_ID: 1ZcgJwGY4W3FbQTv_oZzKA9-oabTgbQC5
File_URL: https://docs.google.com/presentation/d/1ZcgJwGY4W3FbQTv_oZzKA9-oabTgbQC5/edit?...
```

Drive metadata confirms the same non-trashed File ID, raw PPTX MIME type, size 45,493 bytes, and the same valid Presentation webViewLink.

`DOC-000024` is a valid raw XLSX whose row and Drive metadata use `https://docs.google.com/spreadsheets/d/<id>/...`.

The current `kspKnowledgeExportUrlFileId_` parser accepts `docs.google.com/document/d/...` and existing `drive.google.com` forms, but not the valid Presentation or Spreadsheets webViewLink forms.

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
DATA_REPAIR_REQUIRED: NO
PROVIDER_REPAIR_REQUIRED: NO
```

## Current completion state

```text
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
FORMAT_PDF: SUPPORTED_AND_QUALIFIED
FORMAT_PPTX: OPENAI PASS / FULL_OUTPUT parser repair pending
FORMAT_XLSX: SUPPORTED_AND_QUALIFIED / FULL_OUTPUT parser latent repair pending
FORMAT_DOCX: SUPPORTED_AND_QUALIFIED
FORMAT_TXT: SUPPORTED_AND_QUALIFIED
FORMAT_EML: SUPPORTED_AND_QUALIFIED
EML_ATTACHMENT_BOUNDARY: PASS
LOGIC_VALIDATION_BEFORE_REPAIR: PASS — 373/373
CURRENT_PRIVATE_WEB_APP_VERSION: 65
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
```

## Authorized final continuation

`docs/handoffs/0021-CODEX-04-google-editor-url-parser-fix-authorization.md`

The same CODEX-04 may make the smallest strict URL-parser/test change, create exactly one further immutable version and same-Web-App update (expected version 66), run one FULL_OUTPUT preview covering the six rows, complete read-only final integrity, and return PR #34 for final review.

Do not rewrite Backend rows, repeat registration/OpenAI sync/query, call Gemini, touch large fixtures, create CODEX-05, or extend into general hardening.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
