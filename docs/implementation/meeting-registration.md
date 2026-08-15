# Meeting registration vertical slice

Work ID: `0005`

## Runtime surface

The first Web App surface is implemented with:

- `src/90_WebApp.gs`: HTML Service and server entry points
- `src/Index.html`: Meeting form, browser validation, submit/retry flow, and 24-hour draft handling

Server-side Meeting behavior is split into:

- `src/30_MeetingCore.gs`: pure validation, ID, request fingerprint, filename, Doc text, Index row, and audit payload logic
- `src/40_MeetingService.gs`: initial-state lookup and end-to-end Meeting orchestration
- `src/50_MeetingLiveEnvironment.gs`: thin Apps Script adapters for Sheets, Docs, Drive, Session, Lock, and Audit writes

## Registration contract

Required fields: Date, GP, and Asset Class.

Optional fields: Time, Location, Equity / Debt, Counterparty, Internal Participants, and Meeting notes.

Meeting notes are written only to the authoritative Google Doc. They are not copied into `Meeting_Index` or the Audit Spreadsheet.

## Retry behavior

If a failure occurs after a Meeting ID is allocated, the structured result returns the Meeting ID and a request fingerprint. The browser retains the draft and retry context. A retry with unchanged fields reuses the same Meeting ID and existing Google Doc, appends at most one `Meeting_Index` row, and returns the existing Meeting if replayed after completion. Changing a form field clears retry context.

## Browser state

Date, GP, Asset Class, and Equity / Debt remain after successful registration. Meeting-specific fields clear after success. Form and retry state are stored in the same browser for 24 hours and may be explicitly cleared.

## Actor and audit behavior

Actor resolution is best-effort. Email is used when available, otherwise a temporary user key, otherwise `UNIDENTIFIED`. Actor lookup or Audit Spreadsheet write failure does not roll back a committed Meeting.

## Local validation

```bash
npm run check
```

The local suite performs syntax/manifest checks and fake-service tests. It does not connect to Google Workspace or Gemini. Live qualification remains deferred to the final qualification Work.
