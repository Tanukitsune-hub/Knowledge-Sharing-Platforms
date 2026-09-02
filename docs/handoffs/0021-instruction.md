# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
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

Native XLSX was rejected by the current OpenAI path. A bounded deterministic cell-text representation was implemented. Version 64 exposed an Apps Script ZIP-Blob representation defect before provider upload. The final named ZIP-Blob correction is committed at `55190ae567bca37aaa5dabff3a2ac881bf43c427` and passes `373/373`, but is not yet deployed.

## Authorized continuation

Exactly one additional immutable Apps Script version and one update of the same existing private Web App are authorized, expected version 65.

Do not create CODEX-05. Do not repeat registration or the successful PDF/PPTX sync.

Remaining work only:

- rerun focused/canonical checks and exact source readback;
- deploy the final ZIP-Blob fix once;
- exact-sync XLSX `DOC-000024` first;
- if XLSX passes, exact-sync DOCX `DOC-000019`, TXT `DOC-000023`, EML `DOC-000020` only;
- run one grounded authoritative-citation check per all six formats;
- prove EML attachment exclusion;
- run one API-independent FULL_OUTPUT reference-only preview;
- complete final provider/source integrity and Work reporting.

If the bounded version-65 attempt still fails, stop and return the exact blocker. Do not create another deployment automatically.

Gemini, broad sync/reindex, `DOC-000018`, old large fixtures, Work 0023, chooser automation repair, new infrastructure, and general hardening remain out of scope.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
