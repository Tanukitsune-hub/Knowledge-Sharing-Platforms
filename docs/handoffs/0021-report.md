# Work 0021 report

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Executive conclusion

Work 0021 remains accepted through CODEX-03: canonical structured filters, five modes, explicit 2–5 Entity comparison, per-Entity citation attribution, exact Related GP / Meeting Type filters, and FULL_OUTPUT parity remain qualified.

CODEX-04 successfully used the normal product flow to register one tiny synthetic PDF/PPTX/XLSX/DOCX/TXT/EML Pitchbook. The authoritative rows are Active and bounded to `DOC-000019` through `DOC-000024`. The Chrome automation chooser issue is now only `FIX SOON / external tooling` because human native selection worked.

PDF and PPTX exact OpenAI sync passed. Native XLSX exposed a real provider-format incompatibility, and the permitted smallest cell-text normalization was implemented. The first normalized implementation was delivered as private Web App version 64, but its exact XLSX retry failed before provider upload due to the Apps Script ZIP Blob representation. The final correction is committed and deterministic PASS `373/373`, but is not deployed because the one-version/one-update dispatch budget is exhausted.

```text
FORMAT_PDF: SYNC PASS / retrieval NOT RUN
FORMAT_PPTX: SYNC PASS / retrieval NOT RUN
FORMAT_XLSX: FAIL — final correction not deployed
FORMAT_DOCX: NOT RUN after STOP
FORMAT_TXT: NOT RUN after STOP
FORMAT_EML: NOT RUN after STOP
LOGIC_VALIDATION: PASS — 373/373
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PARTIAL
PRIVATE_WEB_APP_VERSION: 64
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: VERSION_64_RUNTIME_FINDING_REQUIRES_ONE_ADDITIONAL_BOUNDED_DEPLOYMENT
```

Detailed evidence and safe continuation:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

## Preserved accepted evidence

```text
CODEX_02_TARGET_RUNTIME_QUALIFICATION: PASS / version 62
CODEX_03_TARGET_RUNTIME_QUALIFICATION: PASS / version 63
WORK_0020_OPENAI_AND_CITATION_EVIDENCE: PRESERVED
WORK_0025_MODEL_THINKING_POLICY_EVIDENCE: PRESERVED
DOC_000018_MUTATION: NO
OLD_LARGE_FIXTURE_MUTATION: NO
BROAD_SYNC: NO
CONFIDENTIAL_DATA: NONE
```

Do not create CODEX-05. Resume the same CODEX-04 only with explicit authorization for one additional bounded Apps Script version and same-Web-App update. Do not repeat registration or successful PDF/PPTX sync.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
