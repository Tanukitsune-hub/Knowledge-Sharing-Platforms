# Work 0009 — Six source formats, five Knowledge Search modes, and feature freeze

WORK_ID: `0009`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: ChatGPT-owned implementation with local executable verification for the residual Apps Script and fixture work.

Recommended Codex model if residual local/runtime work is delegated: `Luna Max` — the source-format policy, five modes, shared retrieval architecture, audit model, upload limits, and validation policy are already decided; the remaining work is bounded implementation and test execution.

Starting ref: `92140b5aecbe970723f51021d782eb249fe7a681`

Target branch: `agent/0009-six-formats-five-modes-feature-freeze`

Before starting any delegated implementation, read every applicable `AGENTS.md`, identify the repository-specific subagent policy, and follow it. Use subagents actively and proportionately for source-format review, EML/parser review, mode/prompt review, security/audit review, and test review.

## Outcome

Reach the feature-freeze candidate for the accepted product scope before live qualification.

The codebase must support the complete initial source set:

- `.pdf`
- `.pptx`
- `.xlsx`
- `.docx`
- `.txt`
- `.eml`

and the complete accepted Knowledge Search mode set:

- `自由質問`
- `要約`
- `時系列`
- `比較`
- `面談準備`

All five modes must use the same File Search Store, metadata-filter builder, Gemini interaction boundary, citation parser, authoritative backend citation mapping, Actor fallback, and restricted Audit Spreadsheet path. Modes differ only through validation, prompt/output contracts, and presentation labels.

The implementation remains local/static/fixture validated. Do not deploy Apps Script or call Gemini/Google Workspace live in this Work.

## Already-decided design

- Shared Drive remains authoritative; File Search is derived and rebuildable.
- One File Search Store is used across all Asset Classes and source types.
- Initial per-file product limit remains 25MB. Do not add 100MB/file transport or a Cloud fallback.
- PDF, PPTX, XLSX, and DOCX should be uploaded as their authoritative binary bytes with explicit supported MIME types.
- TXT may be uploaded as authoritative UTF-8 text/binary with `text/plain`.
- EML original bytes remain authoritative in Shared Drive, but File Search receives normalized UTF-8 text containing available `Subject / From / To / Cc / Date / Body`.
- Embedded EML attachments are not automatically indexed.
- `.msg` remains out of scope.
- File bytes, normalized EML body, Meeting notes, retrieved chunks, answer text, and embeddings are never copied to Sheets, Audit logs, Script Properties, reports, or committed fixtures containing confidential data.
- `未選択` is UI-only and omitted from metadata filters.
- `面談準備` requires a GP selection; it must not silently create an over-broad firm brief.
- Comparison multi-select is not required. Comparison works over the current filtered scope and optional additional instruction.
- One configured Gemini Flash model is used; no user model selector or Deep mode.
- Citation links are resolved through stable backend source IDs to authoritative HTTPS Drive URLs. External annotation URLs are not trusted.
- AI failure never rolls back authoritative Meeting/Pitchbook data.
- Live qualification remains Work 0010.

## Authoritative technical basis

- Current Gemini File Search accepts direct resumable upload and supports `application/pdf`, PPTX, XLSX, DOCX, and `text/plain` MIME types.
- Raw RFC 822 email is not an accepted initial direct-index contract; EML is normalized to text before upload.
- Apps Script Drive/Advanced Drive remains the source-byte boundary; no browser file upload is repeated for AI indexing.

## Required scope

### 1. Format registry and source models

Add one centralized source-format registry defining, at minimum:

- extension;
- accepted authoritative MIME type(s);
- File Search upload MIME type;
- source-read strategy (`MEETING_TEXT`, `DIRECT_BINARY`, `TEXT`, `EML_NORMALIZED_TEXT`);
- support status and deterministic error code.

Generalize the Work 0008 AI source model so an upload source can carry either:

- text content; or
- binary bytes / Blob-compatible payload.

Content hashing must be deterministic for both text and binary revisions.

### 2. Drive source-byte adapters

Add a bounded source-read adapter for authoritative Pitchbook files that:

- reads the existing Drive file by File ID;
- returns bytes and detected/declared MIME type;
- verifies the accepted extension/MIME mapping;
- enforces the current 25MB file limit before Gemini transport;
- does not persist bytes outside the request execution;
- does not use public URLs.

### 3. Direct binary File Search upload

Generalize the resumable upload path so it uploads the actual source bytes and explicit MIME type rather than always creating a text Blob.

The start request and final upload must use the exact byte count. Keep external calls outside common locks. Preserve Work 0008 operation polling, error classification, source claims, duplicate reconciliation, and authoritative-state isolation.

### 4. EML normalization

Implement deterministic EML normalization suitable for representative Outlook-saved `.eml` files.

At minimum:

- unfold continued headers;
- decode common RFC 2047 encoded words (`B` and `Q` forms);
- read `Subject`, `From`, `To`, `Cc`, and `Date` when present;
- parse multipart boundaries recursively to a bounded depth;
- prefer non-attachment `text/plain` body;
- otherwise use non-attachment `text/html`, convert it to readable plain text, and remove script/style markup;
- decode common `base64` and `quoted-printable` transfer encodings;
- handle UTF-8/ASCII and common Western charsets with a safe fallback;
- exclude MIME parts identified as attachments or with attachment filenames;
- return a compact UTF-8 text representation;
- fail deterministically on malformed or empty EML rather than indexing raw binary noise.

Do not extract or index embedded attachments.

### 5. Sync lifecycle across all six formats

Replace the Work 0008 non-TXT permanent deferral with complete format dispatch.

For all six accepted formats:

- build current source revision;
- calculate content hash;
- reuse matching current File Search Document;
- delete duplicates;
- replace stale derived Document;
- update `Indexed` state;
- clean up on `Inactive`;
- use bounded retry/backoff for retryable failures;
- leave unsupported/corrupt files in explicit `Failed` or `NotIndexed` state without authoritative rollback.

A valid unchanged `AI_Content_Hash + AI_Document_Name` shortcut must not hide an externally missing derived Document. Reconciliation must be able to repair that condition.

### 6. Five-mode Knowledge Search contracts

Generalize normalization/validation/prompt building to all five modes.

Common input:

- mode;
- question or additional instruction;
- Date From/To;
- GP;
- Asset Class;
- Equity/Debt;
- Source Type.

Mode requirements:

- `自由質問`: question required.
- `要約`: additional instruction optional; synthesize across sources, not per-file concatenation.
- `時系列`: additional instruction optional; distinguish observed change, continuity, and evidence gaps; do not infer change only from differing topic coverage.
- `比較`: additional instruction optional; compare the filtered scope on common supported dimensions and identify agreements/disagreements; no invented dimensions or unsupported ranking.
- `面談準備`: GP required; additional instruction optional; produce recent context, changes, unresolved items, reconfirmation points, and suggested questions.

All prompts must require Japanese output, grounded-only statements, explicit uncertainty, and citations.

### 7. Shared query service and audit

Use one generic search service and one Interactions request path for all modes.

Audit must capture:

- mode;
- question/additional instruction;
- filters;
- model ID;
- success/failure;
- cited source IDs;
- short error.

Do not store generated output or retrieved/source content in Audit.

### 8. Web App UI

Extend the existing Knowledge Search page with:

- visible mode selector for all five modes;
- default `自由質問`;
- dynamic label/placeholder for `質問` versus `追加指示`;
- required-state messaging by mode;
- GP-required validation for `面談準備`;
- shared filters;
- answer rendering with preserved line breaks;
- insufficient-evidence display;
- authoritative citation links.

Do not expose model selection.

### 9. Feature-freeze diagnostics and documentation

Add a non-secret, non-destructive feature-freeze diagnostics model reporting:

- six format handlers present;
- five modes present;
- one shared retrieval path;
- AI sync handler available;
- live qualification still false;
- concrete model/credential may remain unconfigured.

Prepare operator/deployment documentation draft for Work 0010, including configuration keys and the live test matrix, without inserting secrets or organization IDs.

### 10. Local validation

Add fixtures and tests covering at minimum:

- exact six-format registry and MIME mapping;
- binary source hashing and byte-preserving upload contract;
- 25MB enforcement;
- direct PDF/PPTX/XLSX/DOCX/TXT source dispatch;
- EML plain-text body;
- EML HTML fallback;
- encoded headers;
- base64/quoted-printable body;
- multipart attachment exclusion;
- malformed/empty EML failure;
- sync/reconciliation for every format;
- unchanged-row repair when derived Document is missing;
- five mode validation and prompts;
- `面談準備` GP requirement;
- one shared interaction/citation/audit path;
- UI/static tokens;
- feature-freeze diagnostics;
- no answer/chunk/source-body leakage to Audit.

## Non-goals

- Live Gemini, Apps Script, Shared Drive, browser, OAuth, or trigger execution.
- Production credential approval or final credential storage choice.
- Concrete production Flash model selection.
- `.msg` support.
- Automatic EML attachment extraction.
- OCR or custom Office document parsing when File Search supports direct binary upload.
- Custom Vector DB, embedding pipeline, taxonomy, knowledge graph, or agent framework.
- Per-user AI ACLs.
- Multi-select comparison UI.
- Public-web enrichment.
- Production deployment.

## Acceptance criteria

- All six accepted source formats have deterministic code paths and passing fixtures.
- Office/PDF formats upload authoritative binary bytes with explicit MIME types.
- EML uploads normalized text and excludes attachments.
- One sync engine preserves Work 0008 idempotency and authoritative isolation for all formats.
- All five modes are selectable and use one query/citation/audit service.
- Grounding and insufficient-evidence rules are encoded for every mode.
- Citation links come only from authoritative backend records.
- Audit never contains answer text, chunks, Meeting body, EML body, or file bytes.
- Feature-freeze diagnostics report all target capabilities implemented while live qualification remains pending.
- Local static/fixture tests pass.
- No live Google/Gemini calls occur.
- No secrets or real confidential data are committed.
- No BLOCKER remains before Work 0010 live qualification.

## Validation evidence required

- Exact local commands executed.
- Test counts and observed results.
- Apps Script and client-script syntax results.
- Representative EML normalization output using synthetic fixtures.
- Binary upload contract evidence showing byte count/MIME preservation.
- Five-mode request evidence proving a shared File Search tool path.
- Audit redaction evidence.
- Confirmation of zero live calls.

## Delivery

- Work only on `agent/0009-six-formats-five-modes-feature-freeze`.
- Keep commits scoped and intentional.
- Create `docs/handoffs/0009-report.md` and commit it with the implementation.
- Open a Draft PR against `main`.
- Link instruction and report in the PR body.
- Do not merge or deploy during implementation.

## Escalation conditions

Escalate only if:

- authoritative official evidence shows one accepted source type cannot be indexed through the planned direct/normalized path;
- the accepted six-format scope requires a material architecture addition rather than a bounded adapter;
- EML attachment exclusion cannot be made safe without dropping EML indexing;
- one shared retrieval path cannot support the accepted modes;
- implementation would require secrets, confidential data, destructive operations, or Work 0010 live access.

Do not escalate merely because live API behavior, the production credential provider, or concrete model ID remains deferred to Work 0010.
