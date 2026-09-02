# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Active dispatch

### 0021-CODEX-04 — RETURNED / BOUNDED DEPLOYMENT FOLLOW-UP REQUIRED

Human-assisted normal registration succeeded for all six tiny synthetic fixtures. Chrome chooser automation is `FIX SOON / external tooling`, not a product blocker.

Authoritative result:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

```text
LOGIC_VALIDATION: PASS — 373/373
PRIVATE_WEB_APP_VERSION: 64
NORMAL_REGISTRATION: PASS — 6/6
FORMAT_PDF: exact sync PASS / retrieval NOT RUN
FORMAT_PPTX: exact sync PASS / retrieval NOT RUN
FORMAT_XLSX: FAIL — final ZIP-Blob correction committed but not deployed
FORMAT_DOCX: NOT RUN after STOP
FORMAT_TXT: NOT RUN after STOP
FORMAT_EML: NOT RUN after STOP
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PARTIAL
PR_34: Draft / Open / unmerged
BLOCKER: VERSION_64_RUNTIME_FINDING_REQUIRES_ONE_ADDITIONAL_BOUNDED_DEPLOYMENT
```

## Safe continuation

Do not create CODEX-05. Resume the same CODEX-04 only after explicit authorization for one additional immutable Apps Script version and one update of the same existing private Web App.

Continue from the committed final XLSX ZIP-Blob fix at or after `55190ae`:

1. deploy once;
2. exact-sync XLSX `DOC-000024` once;
3. exact-sync only DOCX `DOC-000019`, TXT `DOC-000023`, EML `DOC-000020`;
4. run one grounded query/citation per format;
5. prove EML attachment exclusion and FULL_OUTPUT reference-only parity;
6. finish provider/source integrity and final report.

Do not repeat registration, PDF/PPTX sync, Gemini, broad sync, old large fixtures, chooser repair or Work 0023.

## Accepted baseline

Work 0021 CODEX-01 through CODEX-03 remain accepted at version 63. Work 0020 and Work 0025 evidence remains closed and preserved. No current CODEX-04 finding contradicts those accepted gates.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
