# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-04 — READY / FINAL BOUNDED DEPLOYMENT AND SIX-FORMAT COMPLETION

Human-assisted normal registration succeeded for all six tiny synthetic fixtures. Chrome chooser automation is `FIX SOON / external tooling`, not a product blocker.

Current evidence:

```text
LOGIC_VALIDATION: PASS — 373/373
PRIVATE_WEB_APP_VERSION: 64
NORMAL_REGISTRATION: PASS — 6/6
FORMAT_PDF: exact sync PASS / retrieval pending
FORMAT_PPTX: exact sync PASS / retrieval pending
FORMAT_XLSX: final ZIP-Blob correction committed but not deployed
FORMAT_DOCX: exact sync pending
FORMAT_TXT: exact sync pending
FORMAT_EML: exact sync pending
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PARTIAL
PR_34: Draft / Open / unmerged
```

Authorization:

`docs/handoffs/0021-CODEX-04-additional-bounded-deployment-authorization.md`

Exactly one additional immutable Apps Script version and one update of the same existing private Web App are authorized, expected version 65. This remains the same Dispatch; do not create CODEX-05.

Continue from the current branch head containing:

`55190ae567bca37aaa5dabff3a2ac881bf43c427`

Required bounded sequence:

1. rerun focused/canonical validation and exact source readback;
2. deploy once to the same private Web App;
3. exact-sync XLSX `DOC-000024` first;
4. on XLSX PASS, exact-sync only DOCX `DOC-000019`, TXT `DOC-000023`, EML `DOC-000020`;
5. do not repeat PDF/PPTX sync;
6. run one grounded authoritative-citation query per all six formats;
7. prove EML attachment exclusion and one FULL_OUTPUT reference-only preview;
8. finish final provider/source integrity and report.

If XLSX or another material runtime gate still fails after this single deployment, stop and return the exact blocker. Do not authorize or create another deployment automatically.

## Accepted prior dispatches

- CODEX-01: core structured filters and five modes implemented.
- CODEX-02: metadata reconciliation, all five modes, FULL_OUTPUT parity, Gemini-disabled no-failover qualified.
- CODEX-03: 2–5 Entity comparison, per-Entity citation attribution, Related GP / Meeting Type exact filters and FULL_OUTPUT parity qualified.

## Prohibited actions

No repeat registration, broad sync/reindex, Gemini call, provider fallback, `DOC-000018`, old large fixtures, chooser repair, Work 0023, new Web App/Vector Store/endpoint, rebase, force-push, or PR merge.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
