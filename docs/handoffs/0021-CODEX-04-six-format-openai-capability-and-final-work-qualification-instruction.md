# Work 0021 — CODEX-04 six-format OpenAI capability matrix and final Work qualification

WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-04
MODE: BUILD / QUALIFICATION -> FINAL WORK READINESS
BALL: CODEX
STATUS: READY

## Primary outcome

Complete the final planned Work 0021 slice by proving the current Knowledge Share Pitchbook path across the six accepted source formats:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

For the currently enabled OpenAI route, establish an explicit per-format capability matrix from authoritative registration through exact provider sync, grounded retrieval and normalized citation. Preserve FULL_OUTPUT's API-independent source boundary and record the disabled Gemini route without calling Gemini.

This is the last planned Work 0021 dispatch. If the matrix and required final gates pass, return PR #34 for ChatGPT final review/merge. Do not create another general hardening dispatch.

## Reviewed baseline

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- branch: `agent/0021-structured-search-core`
- reviewed CODEX-03 final head before ChatGPT tracking commits: `fbec2c1348781a20e58672b60753a4dea1801a10`
- PR: #34, Draft / Open / unmerged / mergeable
- latest main at ChatGPT review: `a5edd1aabed1bfa34609b42807a615f43d2cd19a`
- current private Web App: version 63
- current OpenAI tuple: `openai-current-default / gpt-5.6-terra / provider-default`
- CODEX-03 canonical validation: `368/368` PASS
- CODEX-03 Apps Script readback: `80/80` PASS
- accepted OpenAI provider baseline: 16 completed documents before any CODEX-04 fixture work
- Gemini: disabled/deferred; no live recovery in this dispatch

Fetch remote refs before editing. If `origin/main` advances, inspect and integrate normally only if needed to keep PR #34 current. Do not rebase, force-push, reset shared history or merge the PR.

## Existing product support to preserve

The application already declares all six Pitchbook extensions in `KSP_PITCHBOOK_ALLOWED_EXTENSIONS` and in the AI format registry.

Existing format strategies include:

- PDF / PPTX / XLSX / DOCX: direct binary source payload;
- TXT: text payload;
- EML: normalized text payload.

The EML path already normalizes email headers/body and excludes embedded attachments from automatic indexing.

The provider-neutral OpenAI exact-sync path already consumes `kspBuildFeatureFreezeAiSource_`, so this dispatch should connect/fix the smallest missing format path only where real deterministic/live evidence proves a defect. Do not rebuild the format subsystem.

## Existing fixture inventory

ChatGPT read the current DEV `Pitchbook_Index` before this dispatch.

- existing Active Pitchbooks are effectively TXT sources;
- `DOC-000017` is the designated small current TXT qualification source;
- old Matrix-C size fixtures are TXT only;
- `DOC-000012` through `DOC-000016`, `DOC-000018`, and other old 5–25 MiB timeout fixtures are prohibited targets;
- no current small authoritative PDF/PPTX/XLSX/DOCX/EML Pitchbook exists for this matrix.

Therefore CODEX-04 may create a bounded small synthetic format batch when needed.

## Fixture contract

Prefer one normal Pitchbook registration batch containing one small valid synthetic file per format. Reuse `DOC-000017` for TXT only if doing so keeps the matrix clear; otherwise one fresh six-file batch is allowed.

Maximum newly created CODEX-04 sources: **6**.

Requirements:

- DEV/non-confidential only;
- each file valid for its extension, not a renamed TXT file;
- each file should be very small (target <= 256 KiB; never intentionally approach the 25 MiB product limit);
- use the existing normal Pitchbook registration flow, not direct row insertion;
- use one stable GP/Asset Class/Capital Type and an obvious synthetic Fund / Strategy such as `CODEX-04 Six Format Matrix`;
- give every format one unique known evidence token, for example:

```text
KSP-CODEX04-PDF
KSP-CODEX04-PPTX
KSP-CODEX04-XLSX
KSP-CODEX04-DOCX
KSP-CODEX04-TXT
KSP-CODEX04-EML-BODY
```

- PDF token must be real visible/searchable PDF text;
- PPTX token must be real slide text;
- XLSX token must be a real cell value;
- DOCX token must be real document text;
- TXT token must be normal UTF-8 text;
- EML token must be in the normalized message body and useful Subject/From/To/Cc/Date values must also exist.

For EML, include at most one harmless synthetic attachment only if useful to prove the attachment boundary. Give its body a distinct marker such as `KSP-CODEX04-EML-ATTACHMENT-NOT-INDEXED`. Deterministically prove the normalized indexed payload does not contain that attachment marker. Do not auto-register or auto-index the attachment.

Do not create more fixtures merely to increase coverage once one valid source per format exists.

## Per-format product contract

For each of the six formats, record one of:

```text
SUPPORTED_AND_QUALIFIED
EXPLICIT_PROVIDER_UNSUPPORTED
FAIL
```

### SUPPORTED_AND_QUALIFIED

Requires all of:

1. normal Pitchbook registration completed and authoritative row is Active;
2. source descriptor/MIME/size validation passed;
3. exact OpenAI-only sync for that source completed safely;
4. exactly one current OpenAI provider document exists for the stable Pitchbook/source identity;
5. provider attributes/readback preserve stable source metadata;
6. one exact-source or equivalently bounded File Search query retrieves the known format token;
7. answer is grounded and not an insufficient-evidence false positive;
8. normalized citation resolves to exactly the authoritative Pitchbook row and Drive URL;
9. no provider Store/File identity is exposed to the user.

### EXPLICIT_PROVIDER_UNSUPPORTED

This is acceptable only when current provider capability is genuinely unsupported, not when Knowledge Share has a repairable implementation defect.

Before using this status, prove:

- the source is a valid product-supported file;
- the application reaches the correct provider operation/request shape;
- the current provider explicitly rejects or cannot support the format/representation;
- safe error classification is stable and user-visible without raw provider payloads;
- partial uploaded resources are cleaned up;
- the authoritative Drive/Pitchbook row remains valid;
- FULL_OUTPUT continues to include that Pitchbook as reference metadata/link only.

If current OpenAI supports the format but our application path fails, that is a Work 0021 blocker: fix the smallest actual defect rather than labeling the provider unsupported.

Do not convert provider timeouts, malformed fixtures, MIME errors, source-builder defects or citation mapping defects into `EXPLICIT_PROVIDER_UNSUPPORTED`.

## OpenAI format strategy

Start with the existing direct/native strategy.

If current OpenAI cannot accept one native binary format but the existing product design permits a safe canonical normalized representation, implement the smallest deterministic representation needed while preserving:

- original Drive source as authority;
- original source ID and extension;
- exact metadata/citation identity;
- no full source-body leakage to Audit;
- no replacement of File Search with full-context prompt submission.

Do not build a general document-conversion service in this dispatch.

## EML requirements

Qualify the existing EML design, not an attachment ingestion system.

Required:

- preserve original `.eml` Pitchbook in Drive;
- indexed payload contains normalized Subject / From / To / Cc / Date / Body where present;
- encoded-word, quoted-printable/base64 and multipart handling remains bounded by existing deterministic tests;
- embedded attachment contents are not automatically indexed;
- provider citation still maps to the authoritative original EML Pitchbook source;
- `.msg` remains out of scope.

## FULL_OUTPUT format parity

FULL_OUTPUT remains API-independent.

Pitchbook bodies are never included in FULL_OUTPUT merely because a format became searchable by OpenAI.

For the format matrix, prove that the selected Pitchbook sources can appear as reference metadata + authoritative Drive links while:

- Meeting Google Docs bodies remain the only authoritative full-text bodies;
- PDF/PPTX/XLSX/DOCX/TXT/EML Pitchbook body tokens do not leak into FULL_OUTPUT body extraction;
- no OpenAI or Gemini API call occurs for FULL_OUTPUT.

One bounded preview/package is enough if it proves all relevant reference entries and the existing source boundary.

## Gemini boundary

Do not call Gemini.

Record:

```text
GEMINI_SEARCH_MATRIX: DISABLED_BY_CONFIG / DEFERRED
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
```

Do not reopen historical Gemini indexing/query troubleshooting. Gemini live recovery remains a separate near-completion Work after the OpenAI product path and installer are complete.

## Required deterministic validation

Cover the current six-format contract and any actual repair. At minimum require:

1. allowed Pitchbook extensions are exactly the intended six formats;
2. extension/MIME validation rejects mismatches and unsupported extensions;
3. PDF/PPTX/XLSX/DOCX preserve binary bytes and correct upload MIME;
4. TXT remains deterministic UTF-8 text;
5. EML normalized output contains allowed headers/body and excludes attachments;
6. source hash is based on the actual provider payload used for indexing;
7. all six source builders preserve canonical `source_type`, `source_id`, date, GP, entity, asset class, capital type, fund strategy and Drive identity;
8. exact sync does not broad-select unrelated rows;
9. metadata-only reconciliation from CODEX-02 still works;
10. upload/index failure cleanup from Work 0020 still prevents orphan provider resources;
11. citation normalization maps each format back to the authoritative Pitchbook source;
12. FULL_OUTPUT remains Pitchbook-reference-only and API-independent;
13. Work 0025 model/thinking policy and CODEX-03 multi-Entity/advanced filters remain deterministic PASS;
14. disabled Gemini cannot trigger fallback.

Run focused tests first, then:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken existing assertions to pass.

## Bounded target-runtime campaign

Only after deterministic PASS:

### A. Exact source delivery

If Apps Script source changed:

1. push/read back the exact tested source once to the existing standalone Apps Script project;
2. require exact file parity;
3. create at most one immutable version, expected version 64;
4. update the same existing private Web App once.

If no Apps Script source changes are necessary, keep version 63 and do not create a no-op version solely for ceremony.

Never create another Web App, Library, Vector Store, endpoint or trigger.

### B. Register the bounded format fixtures

Using the normal product Pitchbook registration path, create only the missing small CODEX-04 fixtures authorized above.

Record their final stable `DOC-*` IDs and extensions in the report, but do not expose provider Store/File IDs.

### C. Exact OpenAI-only sync

For each matrix source:

- invoke exact `Pitchbook + sourceId` sync only;
- providers must be `OPENAI` only;
- never run broad/source-type-wide sync;
- require zero duplicate current documents for that exact source;
- preserve the accepted pre-existing provider documents.

### D. Exact format retrieval

For each format classified supported:

- query only that exact authoritative source or the smallest equivalent exact source filter;
- ask for its unique synthetic token/fact;
- require grounded answer + authoritative normalized citation to that exact `DOC-*` source;
- stop on the first unexplained application defect and diagnose/fix only that defect before continuing the matrix.

Do not run repeated quality benchmarks or multiple prompts per format after the decisive pass.

### E. EML boundary

Require a successful body/header retrieval/citation. Confirm the normalized indexed payload excludes any synthetic attachment marker before or during the exact sync qualification. No attachment provider document may be created automatically.

### F. FULL_OUTPUT

Run one bounded preview covering the format batch if practical. Require Pitchbooks as reference metadata/Drive links only and zero AI API calls.

### G. Final integrity

Capture safe before/after counts and require:

- no unexpected deletion of the accepted provider baseline;
- provider document count increase equals only intentionally successfully indexed new matrix sources;
- one current provider document per successfully indexed matrix source;
- no duplicate source identities;
- `DOC-000018` and old 5–25 MiB fixtures unchanged;
- no broad sync;
- Gemini untouched;
- no confidential data;
- no leaked API key or provider private IDs;
- Audit retains only accepted bounded metadata.

Small CODEX-04 synthetic Pitchbooks may remain in the personal DEV environment as explicit regression fixtures. Do not perform risky cleanup merely to make the environment look empty. Record exactly what remains.

## GitHub / final Work delivery

Create:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

Update:

- `docs/handoffs/0021-dispatches.md`;
- `docs/handoffs/0021-instruction.md`;
- `docs/handoffs/0021-report.md`;
- `docs/planning/work-registry.md`;
- `docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md` if final capability wording needs reconciliation;
- `docs/operations/runtime-artifact-locator.md`;
- PR #34 body.

Keep PR #34 Draft/Open/unmerged. Do not merge it.

If current main advances, reconcile it normally only after the matrix is stable enough to avoid mixing diagnosis with unrelated integration. Rerun deterministic checks after integration.

## Completion semantics

Work 0021 is ready for ChatGPT final merge when:

- all application-supported format paths are either `SUPPORTED_AND_QUALIFIED` or genuinely `EXPLICIT_PROVIDER_UNSUPPORTED` with safe product handling;
- no format is `FAIL` due an application defect;
- source identity and authoritative citation mapping remain correct;
- FULL_OUTPUT boundary remains correct;
- deterministic and required runtime gates pass;
- PR #34 is mergeable against current main;
- there is no blocker under the project blocker threshold.

GitHub CI absence remains an existing FIX SOON item, not a Work 0021 blocker if the committed deterministic/native evidence passes.

After these gates pass, STOP. Do not create CODEX-05 for cosmetic UX, extra format variants, benchmark repetitions, large-file behavior, Gemini recovery, or provider discovery.

## Completion latch

```text
SIX_FORMAT_REGISTRY: PASS | FAIL
FORMAT_PDF: SUPPORTED_AND_QUALIFIED | EXPLICIT_PROVIDER_UNSUPPORTED | FAIL
FORMAT_PPTX: SUPPORTED_AND_QUALIFIED | EXPLICIT_PROVIDER_UNSUPPORTED | FAIL
FORMAT_XLSX: SUPPORTED_AND_QUALIFIED | EXPLICIT_PROVIDER_UNSUPPORTED | FAIL
FORMAT_DOCX: SUPPORTED_AND_QUALIFIED | EXPLICIT_PROVIDER_UNSUPPORTED | FAIL
FORMAT_TXT: SUPPORTED_AND_QUALIFIED | EXPLICIT_PROVIDER_UNSUPPORTED | FAIL
FORMAT_EML: SUPPORTED_AND_QUALIFIED | EXPLICIT_PROVIDER_UNSUPPORTED | FAIL
EML_NORMALIZATION: PASS | FAIL
EML_ATTACHMENT_BOUNDARY: PASS | FAIL
AUTHORITATIVE_SOURCE_IDENTITY: PASS | FAIL
NORMALIZED_CITATION_MATRIX: PASS | FAIL
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS | FAIL
OPENAI_SEARCH_MATRIX: PASS | PARTIAL_EXPLICIT_PROVIDER_LIMITATION | FAIL
GEMINI_SEARCH_MATRIX: DISABLED_BY_CONFIG / DEFERRED
GEMINI_API_CALLED: NO
CROSS_PROVIDER_FALLBACK: NO
LOGIC_VALIDATION: PASS | FAIL
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL
FINAL_PROVIDER_INTEGRITY: PASS | FAIL
RUNTIME_DEPLOYMENT_VERSION: <63 | 64 | other justified single update>
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

## Mandatory final chat response

The final response must begin and end with exactly:

```text
WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
```
