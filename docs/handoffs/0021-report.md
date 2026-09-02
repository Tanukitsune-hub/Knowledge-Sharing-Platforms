# Work 0021 report

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Executive conclusion

Work 0021 remains accepted through CODEX-03: canonical structured filters, five modes, explicit 2–5 Entity comparison, per-Entity citation attribution, exact Related GP / Meeting Type filters, and FULL_OUTPUT parity remain qualified.

CODEX-04 successfully used the normal product flow to register six tiny synthetic PDF/PPTX/XLSX/DOCX/TXT/EML Pitchbooks, `DOC-000019` through `DOC-000024`. Human file selection proved the Chrome automation chooser defect is external tooling only.

PDF and PPTX exact OpenAI sync passed. Native XLSX returned `OPENAI_HTTP_400`; the permitted bounded cell-text normalization was implemented. Version 64 then exposed an Apps Script ZIP-Blob representation defect before provider upload. The final named ZIP-Blob correction is committed at `55190ae567bca37aaa5dabff3a2ac881bf43c427` and deterministic validation passes `373/373`.

ChatGPT has authorized exactly one additional immutable Apps Script version and one update of the same existing private Web App, expected version 65, to deploy that correction and finish the matrix.

Authorization:

`docs/handoffs/0021-CODEX-04-additional-bounded-deployment-authorization.md`

## Current completion state

```text
NORMAL_REGISTRATION: PASS — 6/6
FORMAT_PDF: exact sync PASS / retrieval pending
FORMAT_PPTX: exact sync PASS / retrieval pending
FORMAT_XLSX: final correction committed / runtime pending
FORMAT_DOCX: runtime pending
FORMAT_TXT: runtime pending
FORMAT_EML: runtime pending
LOGIC_VALIDATION: PASS — 373/373
CURRENT_PRIVATE_WEB_APP_VERSION: 64
AUTHORIZED_NEXT_VERSION: 65 — one attempt only
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PARTIAL pending authorized attempt
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
```

## Bounded remaining work

- deploy the exact corrected source once to the same Web App;
- exact-sync XLSX `DOC-000024`, then DOCX `DOC-000019`, TXT `DOC-000023`, EML `DOC-000020` only if XLSX passes;
- do not repeat PDF/PPTX sync;
- run one grounded authoritative-citation query per all six formats;
- prove EML attachment exclusion and FULL_OUTPUT reference-only parity;
- complete final provider/source integrity and Work reporting.

If the additional attempt fails, return the exact blocker without another automatic deployment.

## Preserved boundaries

No repeat registration, broad sync, Gemini, provider fallback, `DOC-000018`, old large fixtures, confidential data, new provider/Google infrastructure, chooser repair, Work 0023, rebase, force-push, or PR merge.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
