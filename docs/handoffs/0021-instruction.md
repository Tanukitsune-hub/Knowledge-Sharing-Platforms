# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD / QUALIFICATION -> FINAL WORK READINESS`

Active instruction:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`

Current report:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

## Current state

Work 0021 remains accepted through CODEX-03. CODEX-04 human-assisted normal registration succeeded for six tiny PDF/PPTX/XLSX/DOCX/TXT/EML Pitchbooks. PDF and PPTX exact OpenAI sync passed.

Native XLSX was rejected by OpenAI, consistent with the current supported-file list. A bounded deterministic XLSX cell-text representation was implemented. The first implementation became private Web App version 64 but failed in Apps Script before provider upload because `Utilities.unzip` received the wrong Blob representation. The final source fix now supplies a named ZIP Blob and passes `373/373`, but it is not deployed because CODEX-04's one-version/one-update budget is exhausted.

```text
LOGIC_VALIDATION: PASS — 373/373
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PARTIAL
PRIVATE_WEB_APP_VERSION: 64
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: VERSION_64_RUNTIME_FINDING_REQUIRES_ONE_ADDITIONAL_BOUNDED_DEPLOYMENT
```

## Resume boundary

Do not create CODEX-05. If ChatGPT authorizes one additional bounded version/update, resume this same CODEX-04 at commit `55190ae` or later. Do not repeat registration or the successful PDF/PPTX exact sync.

Remaining work is only:

- deploy the final ZIP-Blob fix once to the same private Web App;
- exact-sync XLSX/DOCX/TXT/EML only;
- run one grounded authoritative-citation query per format;
- prove EML attachment exclusion;
- run one API-independent FULL_OUTPUT preview;
- complete final provider/source integrity and Work reporting.

Gemini, broad sync/reindex, `DOC-000018`, old large fixtures, Work 0023 and chooser automation repair remain out of scope.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
