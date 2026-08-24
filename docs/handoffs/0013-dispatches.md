# Work 0013 dispatch control

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

This file is the current ball/source-of-truth for explicit Codex dispatches under Work 0013.

## Active dispatch

- Dispatch ID: `0013-CODEX-02`
- Mode: `BUILD — bounded observed PDF defect repair verification`
- Instruction: `docs/handoffs/0013-CODEX-02-pdf-export-transport-fix-verification-instruction.md`
- BALL: `CODEX`
- STATUS: `READY`
- Recommended model: `Luna Max`.
- ChatGPT root-cause diagnosis: complete.
- ChatGPT source/test repair: committed on this branch.
- Remaining Codex scope: deterministic validation, exact DEV sync, update the existing versioned Web App deployment once, one post-fix PDF verification, clipboard, final integrity, reporting.

### Single active hypothesis

The live PDF failure was caused by the Apps Script Advanced Drive Service byte-content call `Drive.Files.export()` in `src/157_KnowledgeExportLiveEnvironment.gs`. Apps Script does not reliably return export byte content through that Advanced Drive call. The repair uses the Drive v3 REST export endpoint through `UrlFetchApp.fetch()` with `ScriptApp.getOAuthToken()` and reads `response.getBlob()`.

If the one post-fix live PDF attempt still fails, STOP and return to ChatGPT. Do not investigate or patch a second hypothesis in this dispatch.

## Previous dispatch — closed

- Dispatch ID: `0013-CODEX-01`
- Result: `RETURNED — PDF APPLICATION DEFECT FOUND`
- Knowledge Export installation-state repair: PASS.
- Matrix E Preview: PASS.
- Google Docs export: PASS.
- PDF export: FAIL — `KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED`.
- Clipboard/final integrity: not run because the dispatch stopped at the first PDF defect.

## Accepted closed conclusions

- Web App recovery: PASS.
- Versioned `/exec`: PASS.
- Integrated navigation: PASS by direct user live confirmation.
- Matrix A/B/C and upload sizing: accepted.
- Matrix D: `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`; closed and non-blocking.
- Knowledge Export installation-state repair: PASS.
- Matrix E Preview: PASS.
- Google Docs export: PASS.
- Shared Drive-specific qualification: deferred external gap.
- Billing-enabled Gemini/File Search qualification: deferred external gap.

PR #11 must remain Draft / Open / unmerged.

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
