# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD / QUALIFICATION -> FINAL WORK READINESS`

Primary instruction:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`

Additional bounded deployment authorization:

`docs/handoffs/0021-CODEX-04-additional-bounded-deployment-authorization.md`

Current report:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted state

Work 0021 remains accepted through CODEX-03. CODEX-04 has additionally completed normal registration for six tiny PDF/PPTX/XLSX/DOCX/TXT/EML Pitchbooks. PDF and PPTX exact OpenAI sync passed.

Native XLSX was rejected by the current OpenAI path. A bounded deterministic cell-text representation was implemented. Version 64 exposed an Apps Script ZIP-Blob representation defect before provider upload. The final named ZIP-Blob correction at `55190ae567bca37aaa5dabff3a2ac881bf43c427` passes `373/373`, was read back `80/80`, and is deployed to the same private Web App as version 65.

## Returned result

The additional deployment authorization was used exactly once. XLSX passed first; DOCX, TXT and EML then passed one exact sync each. PDF/PPTX were not resynced. One bounded grounded query per all six formats returned the expected token and normalized authoritative source ID. The EML attachment-only marker was absent.

The one API-independent FULL_OUTPUT preview failed closed because the authoritative Drive link for `DOC-000022` could not be confirmed. No package or artifact was created.

```text
RUNTIME_DEPLOYMENT_VERSION: 65
OPENAI_SEARCH_MATRIX: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: FAIL
TARGET_RUNTIME_QUALIFICATION: FAIL / PARTIAL
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: FULL_OUTPUT_AUTHORITATIVE_DRIVE_LINK_UNAVAILABLE_DOC_000022
```

The deployment budget is exhausted. Do not create version 66, automatically create CODEX-05, or repeat registration/sync/query. ChatGPT owns the next bounded decision.

Gemini, broad sync/reindex, `DOC-000018`, old large fixtures, Work 0023, chooser automation repair, new infrastructure, and general hardening remain out of scope.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
