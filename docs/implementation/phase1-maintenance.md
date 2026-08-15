# Phase 1 maintenance and Master management

Work ID: `0007`

## User surfaces

Meeting and Pitchbook each expose two views:

- new registration;
- past records/source materials.

A separate `マスター管理` page supports GP and Option administration.

Past-record filters are optional Date From/To, GP, Asset Class, Equity/Debt, and Status. Results are capped at 200 and sorted by Date/Updated At descending.

## Meeting maintenance

- Detail retrieval reads notes from the authoritative Google Doc.
- Metadata remains in `Meeting_Index`; notes are not copied into the Index or Audit Spreadsheet.
- Update retains Meeting ID and Doc File ID, replaces the same Doc content, synchronizes the filename, increments `Version`, and marks AI state Pending.
- The caller sends `expectedVersion`; stale saves are rejected.
- Active/Inactive/Reactivate uses the same Version guard.
- A short-lived per-record mutation claim prevents overlapping long-running Doc mutations without holding a common Script Lock across the Doc operation.

## Pitchbook maintenance

- Metadata update retains Document ID and Drive File ID.
- `expectedUpdatedAt` protects against stale saves.
- If Date/GP/Asset Class/Equity-Debt changes, the record receives the next sequence in the destination naming context. The old context is never renumbered and gaps are never closed.
- The same Drive file is renamed; file content is not replaced.
- Active/Inactive/Reactivate is logical. Reactivation requires an authoritative File ID.

## Master management

GP:

- immutable GP ID;
- add, rename, Active/Inactive/Reactivate;
- normalized duplicate-name rejection;
- alphabetical display;
- no manual Sort Order.

Option Master:

- `ASSET_CLASS / CAPITAL_TYPE / LOCATION`;
- immutable Option ID;
- add, rename, reorder, Active/Inactive/Reactivate;
- normalized duplicate-name rejection within the same Type;
- Sort Order controls display.

Master mutations use short Script Lock sections and metadata-only Audit events.

## Audit and Actor

Audit continues to use the separate Restricted Audit Spreadsheet. Before/after metadata and changed fields are recorded. Meeting notes and Pitchbook binary/base64 content are not recorded.

Actor resolution remains best-effort. Actor or Audit write failure does not roll back a successful authoritative mutation.

## Local validation

Work 0007 local validation:

```bash
node --test tests/maintenance.test.cjs
```

This validates pure/service behavior with fake adapters and performs syntax checks for the Work 0007 Apps Script and client files. It does not contact Google Workspace or Gemini.

The merged Work 0006 branch retains its previously observed `52/52 PASS` combined setup/Meeting/Pitchbook evidence. Full combined repository and live qualification remain deferred under the implementation-first policy.
