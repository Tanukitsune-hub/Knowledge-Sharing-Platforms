# Work 0021 report

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Executive conclusion

Work 0021 remains accepted through CODEX-03: canonical structured filters, five modes, explicit 2–5 Entity comparison, per-Entity citation attribution, exact Related GP / Meeting Type filters, and FULL_OUTPUT parity remain qualified.

CODEX-04 successfully used the normal product flow to register six tiny synthetic PDF/PPTX/XLSX/DOCX/TXT/EML Pitchbooks, `DOC-000019` through `DOC-000024`. Human file selection proved the Chrome automation chooser defect is external tooling only.

PDF and PPTX exact OpenAI sync passed. Native XLSX returned `OPENAI_HTTP_400`; the permitted bounded cell-text normalization was implemented. Version 64 then exposed an Apps Script ZIP-Blob representation defect before provider upload. The final named ZIP-Blob correction at `55190ae567bca37aaa5dabff3a2ac881bf43c427` passes `373/373`.

The one additionally authorized deployment was used. Exact source readback passed `80/80`, and the same private Web App is now version 65. XLSX, DOCX, TXT and EML each passed one exact sync. All six formats passed one bounded grounded retrieval with their expected token and normalized authoritative source ID; the EML attachment-only marker remained absent.

The final API-independent FULL_OUTPUT preview then failed closed because the authoritative Drive link for `DOC-000022` could not be confirmed. No package or artifact was created. Version 66 and all further runtime mutation are prohibited by the exhausted authorization budget.

Authorization:

`docs/handoffs/0021-CODEX-04-additional-bounded-deployment-authorization.md`

## Current completion state

```text
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6 matrix sources
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
FORMAT_PDF: SUPPORTED_AND_QUALIFIED
FORMAT_PPTX: FAIL — authoritative Drive link unavailable in FULL_OUTPUT
FORMAT_XLSX: SUPPORTED_AND_QUALIFIED
FORMAT_DOCX: SUPPORTED_AND_QUALIFIED
FORMAT_TXT: SUPPORTED_AND_QUALIFIED
FORMAT_EML: SUPPORTED_AND_QUALIFIED
EML_ATTACHMENT_BOUNDARY: PASS
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: FAIL
LOGIC_VALIDATION: PASS — 373/373
CURRENT_PRIVATE_WEB_APP_VERSION: 65
ADDITIONAL_DEPLOYMENT_USED: YES — authorization exhausted
TARGET_RUNTIME_QUALIFICATION: FAIL / PARTIAL
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: FULL_OUTPUT_AUTHORITATIVE_DRIVE_LINK_UNAVAILABLE_DOC_000022
```

## Stop boundary

The remaining blocker is the authoritative Drive-link integrity of `DOC-000022` in FULL_OUTPUT. ChatGPT review must decide the next bounded action. Do not create version 66, create CODEX-05 automatically, or repeat registration/sync/query merely to obtain a pass.

## Preserved boundaries

No repeat registration, broad sync, Gemini, provider fallback, `DOC-000018`, old large fixtures, confidential data, new provider/Google infrastructure, chooser repair, Work 0023, rebase, force-push, or PR merge.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
