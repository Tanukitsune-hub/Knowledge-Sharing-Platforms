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

PDF and PPTX exact OpenAI-only sync had already passed. Native XLSX then failed with the safe item-level code `OPENAI_HTTP_400`. Current OpenAI File Search documentation lists PDF, PPTX, DOCX and TXT but not XLSX, so the application implemented the instruction-authorized smallest deterministic XLSX cell-text representation while retaining the original Drive XLSX, source ID, extension, metadata and citation identity.

The first normalized implementation passed deterministic checks, was delivered with exact `80/80` readback, and became private Web App version 64. Its one exact XLSX runtime retry failed before OpenAI with `AI_XLSX_MALFORMED`. The isolated cause was the Apps Script `Utilities.unzip` input contract: version 64 supplied an Excel-MIME unnamed Blob rather than a named ZIP Blob. The source fix supplies signed bytes as `application/zip` with a `.zip` name, matching the Apps Script ZIP contract.

Under the additional bounded authorization, the final fix passed focused and canonical validation, was delivered and read back exactly `80/80`, and became version 65 of the same existing private Web App. XLSX passed first, after which DOCX, TXT and EML each passed one exact sync. One bounded OpenAI query per format returned the expected format token and an authoritative normalized citation for its expected stable source ID. The EML answer contained the body token and did not contain the attachment-only marker.

The final API-independent FULL_OUTPUT preview then stopped safely with `Pitchbookの権威あるDriveリンクを確認できません。 対象ID: DOC-000022。` The preview produced no package or artifact. This is a material authoritative-source integrity blocker for the PPTX row and prevents final format-reference parity and final Work readiness. No version 66, additional deployment, repair, registration, sync or query was attempted after the STOP condition.

```text
TARGET_RUNTIME_QUALIFICATION: FAIL / PARTIAL — six-format OpenAI retrieval passed; FULL_OUTPUT stopped on DOC-000022 Drive-link integrity
PRIVATE_WEB_APP_VERSION: 65
DEPLOYED_SOURCE_STATE: final named ZIP-Blob correction deployed and qualified for XLSX indexing/retrieval
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: FULL_OUTPUT_AUTHORITATIVE_DRIVE_LINK_UNAVAILABLE_DOC_000022
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
ADDITIONAL_APPS_SCRIPT_PUSH_COUNT: 1
ADDITIONAL_APPS_SCRIPT_READBACK: PASS — 80/80
ADDITIONAL_IMMUTABLE_VERSION_CREATED: 65 only
ADDITIONAL_EXISTING_PRIVATE_WEB_APP_UPDATE_COUNT: 1
VERSION_ABOVE_65_CREATED: NO
```

## Bounded runtime campaign

| Step | Result |
|---|---|
| PDF `DOC-000021` exact OpenAI sync | PASS — selected 1, indexed 1, failed 0 |
| PPTX `DOC-000022` exact OpenAI sync | PASS — selected 1, indexed 1, failed 0 |
| XLSX `DOC-000024` native exact sync | safe item failure — `OPENAI_HTTP_400` |
| XLSX `DOC-000024` v64 normalized exact sync | safe pre-provider failure — `AI_XLSX_MALFORMED` |
| XLSX `DOC-000024` v65 normalized exact sync | PASS — selected 1, indexed 1, failed 0 |
| DOCX `DOC-000019` exact sync | PASS — selected 1, indexed 1, failed 0 |
| TXT `DOC-000023` exact sync | PASS — selected 1, indexed 1, failed 0 |
| EML `DOC-000020` exact sync | PASS — selected 1, indexed 1, failed 0 |
| DOCX `DOC-000019` grounded query/citation | PASS — expected token and authoritative normalized source present; UI returned a non-blocking citation warning |
| EML `DOC-000020` grounded query/citation | PASS — expected body token and authoritative normalized source present |
| PDF `DOC-000021` grounded query/citation | PASS — expected token and authoritative normalized source present |
| PPTX `DOC-000022` grounded query/citation | PASS for retrieval/source ID; final Drive-link integrity failed in FULL_OUTPUT |
| TXT `DOC-000023` grounded query/citation | PASS — expected token and authoritative normalized source present |
| XLSX `DOC-000024` grounded query/citation | PASS — expected token and authoritative normalized source present |
| EML runtime attachment boundary | PASS — body token present; attachment-only marker absent |
| FULL_OUTPUT runtime preview | FAIL SAFE — authoritative Drive link unavailable for `DOC-000022`; no package/artifact |
| Final provider/source integrity | FAIL / incomplete after required STOP |

Each v65 exact sync selected exactly one stable source and returned `Failed 0`. The exact-sync contract reconciles the stable source before upload, requires one current document when current state exists, persists replacement state before stale cleanup, and fails closed on non-unique identity. The OpenAI connection remained enabled. No broad sync/reindex was run.

## Side-effect state

```text
NEW_AUTHORITATIVE_SYNTHETIC_PITCHBOOKS: 6 / remain as explicit DEV regression fixtures
OPENAI_SUCCESSFUL_MATRIX_SOURCES: DOCX / EML / PDF / PPTX / TXT / XLSX
OPENAI_FORMAT_QUERY_COUNT: 6 — exactly one per matrix source
FULL_OUTPUT_PREVIEW_COUNT: 1 — failed safe before package/artifact creation
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
BROAD_SYNC_OR_REINDEX: NO
DOC_000018_MUTATION: NO
OLD_LARGE_FIXTURE_MUTATION: NO
NEW_VECTOR_STORE_OR_WEB_APP: NO
CONFIDENTIAL_DATA: NONE
PRIVATE_PROVIDER_ID_EXPOSURE: NONE in UI/report
```

## Stop boundary

The additional deployment budget is exhausted. The next action belongs to ChatGPT review of the isolated authoritative Drive-link defect for `DOC-000022`. Do not create version 66, repeat registration, repeat matrix sync/query, or bypass the normal source row. The accepted Work 0020/0025 and Work 0021 CODEX-01 through CODEX-03 evidence remains closed.

## Completion latch

```text
SIX_FORMAT_REGISTRY: PASS — deterministic
ADDITIONAL_DEPLOYMENT_USED: YES
FORMAT_PDF: SUPPORTED_AND_QUALIFIED
FORMAT_PPTX: FAIL — authoritative Drive link unavailable in final FULL_OUTPUT gate
FORMAT_XLSX: SUPPORTED_AND_QUALIFIED
FORMAT_DOCX: SUPPORTED_AND_QUALIFIED
FORMAT_TXT: SUPPORTED_AND_QUALIFIED
FORMAT_EML: SUPPORTED_AND_QUALIFIED
EML_NORMALIZATION: PASS — deterministic
EML_ATTACHMENT_BOUNDARY: PASS — deterministic and runtime
AUTHORITATIVE_SOURCE_IDENTITY: PASS — registration and deterministic mapping
NORMALIZED_CITATION_MATRIX: PASS — six bounded runtime queries returned expected stable source IDs
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: FAIL — DOC-000022 authoritative Drive link unavailable
OPENAI_SEARCH_MATRIX: PASS — six of six retrieval/token/source-ID checks
GEMINI_SEARCH_MATRIX: DISABLED_BY_CONFIG / DEFERRED
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
LOGIC_VALIDATION: PASS — 373/373
TARGET_RUNTIME_QUALIFICATION: FAIL / PARTIAL
FINAL_PROVIDER_INTEGRITY: FAIL — final source-integrity gate stopped on DOC-000022
RUNTIME_DEPLOYMENT_VERSION: 65
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
BLOCKER: FULL_OUTPUT_AUTHORITATIVE_DRIVE_LINK_UNAVAILABLE_DOC_000022
FINAL_COMMIT: final report/tracking commit recorded as PR #34 head
```

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CHATGPT`
STATUS: `RETURNED`
