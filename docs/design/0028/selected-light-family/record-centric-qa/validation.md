# CODEX-10 record-centric validation

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10

## Static validation

- `python docs/design/0028/selected-light-family/render-design.py`: PASS; 12 current design pages generated.
- `python docs/design/0028/selected-light-family/validate-light-only-polish.py`: PASS; 12 pages, 7 destinations, Light-only tokens and record-centric boundaries verified.
- `python docs/design/0028/selected-light-family/validate-user-corrections.py`: PASS; Knowledge Search, Full Output, record-centric IA, analytics fixture, protected preset, and no-network boundaries verified.
- `node --check docs/design/0028/selected-light-family/search-demo.js`: PASS.

## Browser-rendered validation

Target flow: `03-record-add-meeting.html` shows one record creation surface with `面談` and `データ受領`; parent `Meeting_ID` precedes file registration. `05-past-records-meeting.html` shows one record list and related-file detail without subtabs.

- Desktop: 1366×768 CSS viewport; record-add `scrollWidth` 1351; past-records `scrollWidth` 1351; no horizontal overflow.
- Browser console warning/error: 0 for both inspected pages.
- Record creation page: `recordType` exposes `MEETING` / `DATA_RECEIPT`; optional Meeting files and required Data Receipt files are visible.
- Past Records page: `.subtabs` count is 0; one record list contains Meeting and Data Receipt examples; related-file add and unlink actions are visible.
- Baseline / implementation comparison loads the prior Light record screens and the new record-centric captures.

This is static design/browser evidence only. It does not qualify Apps Script HTML Service, parent persistence, Meeting_ID issuance, file registration, unlink mutation, authentication, provider execution, or deployment.
