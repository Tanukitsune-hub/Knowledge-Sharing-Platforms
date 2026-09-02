# Work 0021 — CODEX-04 six-format OpenAI capability and final Work qualification report

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Outcome

Human-assisted selection through the ordinary private Web App succeeded. One valid tiny synthetic file per accepted format was registered through the normal Pitchbook flow, producing six Active authoritative rows:

| Format | Authoritative source |
|---|---|
| DOCX | `DOC-000019` |
| EML | `DOC-000020` |
| PDF | `DOC-000021` |
| PPTX | `DOC-000022` |
| TXT | `DOC-000023` |
| XLSX | `DOC-000024` |

The Chrome automation chooser defect is now `FIX SOON / external tooling`: the same normal chooser and registration flow worked when the user selected the files manually.

PDF and PPTX exact OpenAI-only sync passed. Native XLSX then failed with the safe item-level code `OPENAI_HTTP_400`. Current OpenAI File Search documentation lists PDF, PPTX, DOCX and TXT but not XLSX, so the application implemented the instruction-authorized smallest deterministic XLSX cell-text representation while retaining the original Drive XLSX, source ID, extension, metadata and citation identity.

The first normalized implementation passed deterministic checks, was delivered with exact `80/80` readback, and became private Web App version 64. Its one exact XLSX runtime retry failed before OpenAI with `AI_XLSX_MALFORMED`. The isolated cause was the Apps Script `Utilities.unzip` input contract: version 64 supplied an Excel-MIME unnamed Blob rather than a named ZIP Blob. The source fix now supplies signed bytes as `application/zip` with a `.zip` name, matching the Apps Script ZIP contract, and deterministic validation passes `373/373`.

That final fix is committed and pushed but is not deployed. CODEX-04 already consumed its hard limit of one immutable version and one update. A second version/update was not created. Per the first-defect STOP rule, DOCX/TXT/EML sync, six retrieval queries, FULL_OUTPUT runtime preview and final provider integrity were not continued.

```text
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PARTIAL
PRIVATE_WEB_APP_VERSION: 64
DEPLOYED_SOURCE_STATE: first XLSX normalizer; final ZIP-Blob correction not deployed
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: VERSION_64_RUNTIME_FINDING_REQUIRES_ONE_ADDITIONAL_BOUNDED_DEPLOYMENT
```

## Authoritative capability evidence

- OpenAI File Search supported-file list: <https://developers.openai.com/api/docs/guides/tools-file-search>
- Apps Script `Utilities.unzip` contract and named component paths: <https://developers.google.com/apps-script/reference/utilities/utilities#unzipblob>
- Apps Script ZIP MIME type: <https://developers.google.com/apps-script/reference/base/mime-type>

No provider limitation was used to hide an application defect. XLSX remains `FAIL` until the committed normalized representation passes the target runtime.

## Human-assisted registration evidence

```text
STAGED_FIXTURES: 6
LOCAL_COPY_INTEGRITY: PASS
NORMAL_NATIVE_CHOOSER: PASS — human selection
NORMAL_WEB_APP_REGISTRATION: PASS — 6/6
REGISTRATION_DATE: 2026-09-01
GP: KSP DEV GP 0010 Renamed
ASSET_CLASS: Infrastructure
CAPITAL_TYPE: Equity
FUND_STRATEGY: CODEX-04 Six Format Matrix
AUTHORITATIVE_ROWS_ACTIVE: 6/6
CHROME_AUTOMATION_CHOOSER: FIX SOON / external tooling
```

The fixtures remain small, synthetic and non-confidential. `DOC-000018` and the old 5–25 MiB fixtures were not selected or mutated.

## Deterministic repair

The bounded XLSX normalizer:

- keeps the original XLSX as the authoritative Drive source;
- unzips only the workbook, workbook relationships, shared strings and worksheet XML parts;
- extracts sheet names plus non-empty cell references and values;
- handles inline strings, shared strings, numbers and booleans;
- hashes the exact normalized provider payload;
- preserves canonical Pitchbook metadata and authoritative Drive citation identity;
- bounds package parts and normalized output;
- fails closed on malformed archives, duplicate/unsafe package paths, missing workbook/worksheet relationships, invalid shared-string references and empty content;
- does not submit the full workbook in a prompt and does not expose provider identities.

```text
FOCUSED_XLSX_TESTS: PASS — 27/27 feature-freeze tests
LOGIC_VALIDATION: PASS — 373/373
AGENT_FOUNDATION: PASS
TEMPORAL_VALIDATION: PASS
PUBLIC_SURFACE_VALIDATION: PASS
GIT_DIFF_CHECK: PASS
APPS_SCRIPT_PUSH_COUNT: 1
APPS_SCRIPT_READBACK: PASS — 80/80
IMMUTABLE_VERSION_CREATED: 64 only
EXISTING_PRIVATE_WEB_APP_UPDATE_COUNT: 1
```

## Bounded runtime campaign

| Step | Result |
|---|---|
| PDF `DOC-000021` exact OpenAI sync | PASS — selected 1, indexed 1, failed 0 |
| PPTX `DOC-000022` exact OpenAI sync | PASS — selected 1, indexed 1, failed 0 |
| XLSX `DOC-000024` native exact sync | safe item failure — `OPENAI_HTTP_400` |
| XLSX `DOC-000024` v64 normalized exact sync | safe pre-provider failure — `AI_XLSX_MALFORMED` |
| DOCX `DOC-000019` exact sync | NOT RUN after STOP |
| TXT `DOC-000023` exact sync | NOT RUN after STOP |
| EML `DOC-000020` exact sync | NOT RUN after STOP |
| Per-format grounded query/citation | NOT RUN |
| EML runtime attachment boundary | NOT RUN |
| FULL_OUTPUT runtime preview | NOT RUN |
| Final provider/source integrity | NOT RUN |

The v64 XLSX failure occurred during local source normalization before an OpenAI upload. The OpenAI connection remained enabled. No broad sync/reindex was run.

## Side-effect state

```text
NEW_AUTHORITATIVE_SYNTHETIC_PITCHBOOKS: 6 / remain as explicit DEV regression fixtures
OPENAI_SUCCESSFUL_NEW_SOURCES: PDF and PPTX only
OPENAI_XLSX_PROVIDER_MUTATION_ON_V64_RETRY: NONE — failed before provider upload
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
BROAD_SYNC_OR_REINDEX: NO
DOC_000018_MUTATION: NO
OLD_LARGE_FIXTURE_MUTATION: NO
NEW_VECTOR_STORE_OR_WEB_APP: NO
CONFIDENTIAL_DATA: NONE
PRIVATE_PROVIDER_ID_EXPOSURE: NONE in UI/report
```

## Safe continuation boundary

Do not create CODEX-05. Resume the same CODEX-04 only if ChatGPT explicitly authorizes one additional immutable Apps Script version and one update of the same existing private Web App. The committed source to qualify is the final ZIP-Blob correction at or after `55190ae`.

After that bounded deployment, continue in this order:

1. exact-sync XLSX `DOC-000024` once and require Indexed without duplicate;
2. exact-sync DOCX `DOC-000019`, TXT `DOC-000023` and EML `DOC-000020` once each;
3. run exactly one grounded query with authoritative citation per format;
4. prove the EML attachment marker is absent;
5. run one API-independent FULL_OUTPUT preview with all Pitchbooks reference-only;
6. complete safe provider/source integrity and final Work reporting.

Do not repeat PDF/PPTX sync, human registration, broad sync, Gemini, large fixtures or chooser repair.

## Completion latch

```text
SIX_FORMAT_REGISTRY: PASS — deterministic
FORMAT_PDF: SYNC PASS / retrieval NOT RUN
FORMAT_PPTX: SYNC PASS / retrieval NOT RUN
FORMAT_XLSX: FAIL — final deterministic fix not deployed
FORMAT_DOCX: NOT RUN
FORMAT_TXT: NOT RUN
FORMAT_EML: NOT RUN
EML_NORMALIZATION: PASS — deterministic
EML_ATTACHMENT_BOUNDARY: PASS deterministic / runtime NOT RUN
AUTHORITATIVE_SOURCE_IDENTITY: PASS — registration and deterministic mapping
NORMALIZED_CITATION_MATRIX: PASS deterministic / runtime NOT RUN
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS deterministic / runtime NOT RUN
OPENAI_SEARCH_MATRIX: FAIL / INCOMPLETE
GEMINI_SEARCH_MATRIX: DISABLED_BY_CONFIG / DEFERRED
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
LOGIC_VALIDATION: PASS — 373/373
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PARTIAL
FINAL_PROVIDER_INTEGRITY: NOT RUN
RUNTIME_DEPLOYMENT_VERSION: 64
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: VERSION_64_RUNTIME_FINDING_REQUIRES_ONE_ADDITIONAL_BOUNDED_DEPLOYMENT
FINAL_COMMIT: final report/tracking commit recorded as PR #34 head
```

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
