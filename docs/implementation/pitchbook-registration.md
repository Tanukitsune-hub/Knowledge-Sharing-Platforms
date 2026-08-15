# Pitchbook / source-material registration vertical slice

Work ID: `0006`

## Runtime surface

The Pitchbook workflow extends the existing Apps Script HTML Service Web App with a second page alongside Meeting registration.

Runtime components:

- `src/60_PitchbookCore.gs`: upload limits, validation, IDs, naming, reservation, Index, and audit payload contracts
- `src/70_PitchbookService.gs`: batch preparation and file-granular upload/retry orchestration
- `src/80_PitchbookLiveEnvironment.gs`: thin Apps Script adapters for counters, Index rows, Script Properties reservations, Drive files, and audit writes
- `src/90_WebApp.gs`: server entry points
- `src/Index.html`: Meeting/Pitchbook navigation, shared context, drag/drop, file selection, upload results, and retry UI

## Accepted limits and formats

```text
25MB / file
10 files / selection
100MB / selection total
```

Initial accepted extensions:

```text
.pdf .pptx .xlsx .docx .txt .eml
```

The same limits are enforced on the client and server. A practical lower limit may be selected during final live qualification rather than adding a complex upload runtime.

## Persistent identity and naming

Each prepared selection receives one immutable Batch ID. Every file receives an immutable Document ID and reserved sequence number.

```text
BAT-000001
DOC-000001
```

Saved filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

Equity / Debt is omitted when not selected. Sequence starts at `01`, continues after the maximum existing sequence in the same naming context, includes Pending/Failed reservations, and never closes historical gaps.

## Prepare and upload lifecycl

1. Validate metadata and file descriptors.
2. Under a short Script Lock, allocate Batch/Document IDs and sequence numbers, append one Pending `Pitchbook_Index` row per file, and save a small batch reservation in Script Properties.
3. Upload files one by one outside the lock.
4. Identify a Drive file idempotently with stable app properties for Document ID and Batch ID.
5. Update the existing Index row to Active and write a metadata-only audit event.
6. Preserve successful files when another file fails.
7. Mark failed slots Failed and retry with the same Batch ID, Document ID, sequence number, and Index row.

File bytes/base64 are transient request data. They are not written to `Pitchbook_Index`, the Audit Spreadsheet, or Script Properties.

## Retry and recovery

A short-lived upload claim prevents overlapping processing of the same slot without holding a lock across the binary upload. If Drive file creation succeeds but Index update fails, retry discovers the existing Drive file through stable app properties and completes the same Index row without creating a duplicate.

Completed batches remove their Script Properties reservation after every row is Active. Replaying an already Active slot remains idempotent from the Index row even after reservation cleanup.

## Browser state

Date, GP, Asset Class, and Equity / Debt are shared with the Meeting page and retained for 24 hours. Pitchbook slot metadata and failed-slot state may also be restored. Browser reload is allowed to require file reselection because File objects are not persisted.

## Local validation

Developer/Codex validation only:

```bash
npm run check
```

The Work 0006 isolated suite validates Apps Script/HTML syntax and fake-service behavior without connecting to Google Workspace or Gemini. Final Apps Script, Shared Drive, browser, and upload-size qualification remains deferred.
