# Work 0013 — Matrix C upload-size qualification report

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Instruction ref: `99f8a2326af8b8afe43ccaa0836cdaf55ceeb921`

Branch: `agent/0013-consolidated-dev-live-qualification`

Draft PR: `#11`

Primary report: `docs/handoffs/0013-report.md`

## Result

`MATRIX C PASS`

The accepted normal-browser upload boundary was qualified through the exact 25 MiB limit using
synthetic ASCII `.txt` files and the existing approved DEV deployment. Matrix A and Matrix B were
not rerun. No source, test, limit, architecture, manifest, product-behavior, or deployment change
was made.

## Attempted sizes

Each attempt used one native file selection and one normal Pitchbook registration. After the visible
success, the result was checked against Backend `Pitchbook_Index`, Drive, and the restricted Audit
log before proceeding.

| Size | Exact bytes | Native selection | Upload path | Result | Index rows | Final Status | File_ID/File_URL | Drive files | Audit |
|---:|---:|---|---|---|---:|---|---|---:|---|
| 1 MiB | 1,048,576 | completed | reached | PASS | 1 | Active | present / present | 1 | 1 `PITCHBOOK_REGISTER / Success` |
| 5 MiB | 5,242,880 | completed | reached | PASS | 1 | Active | present / present | 1 | 1 `PITCHBOOK_REGISTER / Success` |
| 10 MiB | 10,485,760 | completed | reached | PASS | 1 | Active | present / present | 1 | 1 `PITCHBOOK_REGISTER / Success` |
| 15 MiB | 15,728,640 | completed | reached | PASS | 1 | Active | present / present | 1 | 1 `PITCHBOOK_REGISTER / Success` |
| 20 MiB | 20,971,520 | completed | reached | PASS | 1 | Active | present / present | 1 | 1 `PITCHBOOK_REGISTER / Success` |
| 25 MiB | 26,214,400 | completed | reached | PASS | 1 | Active | present / present | 1 | 1 `PITCHBOOK_REGISTER / Success` |

Synthetic filenames, in order, were:

- `KSP0013_MatrixC_01MiB.txt`
- `KSP0013_MatrixC_05MiB.txt`
- `KSP0013_MatrixC_10MiB.txt`
- `KSP0013_MatrixC_15MiB.txt`
- `KSP0013_MatrixC_20MiB.txt`
- `KSP0013_MatrixC_25MiB.txt`

The corresponding Drive files were `text/plain` and their observed byte sizes matched the exact
requested sizes. Every Backend row had one coherent batch/document/sequence allocation. No duplicate
Index row or Drive file was observed. Audit entries were metadata-only registration records with no
error code or error message.

## Classification

- Matrix C: `PASS`
- Largest stable upload size: `25 MiB / 26,214,400 bytes`
- First observed failing size: `not observed`
- First reproducible failing size: `not established within supported range`
- Behavior: normal completion; no timeout or safe error observed
- Above-boundary test: not performed

## Scope and safety

- The user performed all native file selections and normal registration actions.
- Only synthetic DEV data was used.
- No credentials, tokens, private resource IDs, private URLs, production data, or confidential data
  were recorded in this report.
- No source, tests, limits, architecture, manifest, product behavior, or deployment was changed.
- No malformed request was manufactured, no retry loop was used, and no second hypothesis was opened.

