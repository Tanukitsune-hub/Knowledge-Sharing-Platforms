# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-05`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-05 — READY / FINAL FULL_OUTPUT URL-PARSER FIX

CODEX-04 has returned and remains the six-format qualification dispatch. Its accepted evidence is:

```text
PRIVATE_WEB_APP_VERSION: 65
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
LOGIC_VALIDATION: PASS — 373/373
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: FAIL — DOC-000022
```

ChatGPT independently verified that `DOC-000022` is not missing or corrupt. The authoritative row and Drive file share the same File ID, and Drive returns the valid `docs.google.com/presentation/d/<id>/...` webViewLink. The adjacent XLSX uses the valid `docs.google.com/spreadsheets/d/<id>/...` form.

The current FULL_OUTPUT parser accepts `docs.google.com/document/d/...` plus existing `drive.google.com` forms but omits Presentation and Spreadsheets editor URL shapes.

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
```

Instruction:

`docs/handoffs/0021-CODEX-05-google-editor-url-parser-fix-instruction.md`

Exactly one additional Apps Script version and one same-Web-App update are authorized, expected version 66. CODEX-05 must make only the strict parser/test repair, run one API-independent FULL_OUTPUT preview, complete final read-only integrity, and stop.

No Backend rewrite, repeat registration, repeat OpenAI sync/query, Gemini, broad sync, large fixtures, chooser repair, Work 0023, version 67, rebase, force-push, or PR merge.

## Dispatch history

| Dispatch ID | Purpose | Status |
|---|---|---|
| `0021-CODEX-01` | Core structured filters + five modes | RETURNED / accepted slice |
| `0021-CODEX-02` | OpenAI metadata reconciliation + core runtime | RETURNED / accepted slice |
| `0021-CODEX-03` | Multi-Entity comparison + advanced exact filters | RETURNED / accepted slice |
| `0021-CODEX-04` | Six-format OpenAI qualification | RETURNED — final FULL_OUTPUT parser defect found |
| `0021-CODEX-05` | Google editor URL parser fix + final FULL_OUTPUT gate | READY |

The previously prepared `0021-CODEX-04-google-editor-url-parser-fix-authorization.md` is `SUPERSEDED` because it incorrectly reused a returned Dispatch ID.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-05`
BALL: `CODEX`
STATUS: `READY`
