# Phase 1 maintenance, Master management, and audit retention

Work ID: `0007`

## Scope

This Work completes the non-AI maintenance layer in code on top of the setup, Meeting registration, and Pitchbook registration foundations.

Implemented user surfaces:

- Meeting past-record search and editing;
- Pitchbook/source-material past-record search and metadata editing;
- Active / Inactive / Reactivate actions;
- GP Master and Option Master management.

Implemented server contracts:

```text
getPhase1MaintenanceBootstrapData()
searchMeetingRecords(input)
getMeetingMaintenanceRecord(meetingId)
updateMeetingMaintenance(input)
changeMeetingStatus(input)
searchPitchbookRecords(input)
getPitchbookMaintenanceRecord(documentId)
updatePitchbookMaintenance(input)
changePitchbookStatus(input)
mutateMaster(input)
quickAddGp(name)
```

Editor/trigger-only operations are private and are not callable through the
normal Web App surface:

```text
runAuditRetentionCleanup_()
getPhase1Diagnostics_()
```

## Record maintenance

Meeting updates keep the immutable Meeting ID and Google Doc File ID. The authoritative Doc text and filename are updated together with `Meeting_Index`. `Version` is the optimistic-concurrency token; stale writes fail explicitly.

Pitchbook metadata updates keep the immutable Document ID and Drive File ID. A move to another Date / GP / Asset Class / Equity-Debt context receives the destination context's next sequence. Historical gaps and the source context are not renumbered. `Updated_At` is the stale-write token.

A short-lived Script Property claim protects each slow record edit. The global Script Lock is used only to acquire, validate, reserve, commit, or release the claim. Document and Drive operations run outside the global lock.

## Master management

GP operations:

- add;
- rename;
- deactivate;
- reactivate;
- quick-add through the same service.

Option operations:

- add;
- rename;
- reorder within the same Option Type;
- deactivate;
- reactivate.

Duplicate matching normalizes Unicode width, whitespace, and case. Inactive values remain visible when rendering historical records, while ordinary registration selectors continue to show Active values only.

## Audit behavior

Maintenance and Master events are appended to the separate Audit Spreadsheet. Payloads contain metadata only. Meeting notes, source bytes, and base64 payloads are not copied into audit rows.

Option reorder audit records the complete affected ordering before and after the mutation, not only the moved row.

Actor and audit-write failures remain non-blocking after an authoritative operation succeeds.

`runAuditRetentionCleanup_()` removes Audit rows whose `Event_Timestamp` is older than the five-year UTC cutoff and then records the cleanup event. Scheduling the live cleanup trigger remains part of final setup/qualification.

## Phase 1 diagnostics

`getPhase1Diagnostics_()` performs read-only checks for backend/Audit resource separation, required sheet headers, Actor fallback classification, and currently implemented capabilities. It does not return resource IDs or the Actor value, and it is editor-only rather than a normal-user Web App endpoint.

## Local validation

The Work 0007 implementation includes local suites:

```bash
node scripts/validate-apps-script.cjs
node --test tests/maintenance-adapters.test.cjs tests/maintenance-core.test.cjs tests/maintenance-service.test.cjs
```

The tests use fake Apps Script/Workspace adapters and do not contact Google Workspace or Gemini. Full live qualification remains deferred under the implementation-first policy.
