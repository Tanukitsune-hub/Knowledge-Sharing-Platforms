# Work 0021 — CODEX-04 additional bounded deployment authorization

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Decision

Authorize exactly one additional immutable Apps Script version and exactly one update of the same existing private Web App so CODEX-04 can deploy the already committed XLSX ZIP-Blob correction and complete the six-format runtime matrix.

This remains the same Dispatch. Do not create `0021-CODEX-05`.

## Basis

Accepted current state:

```text
CURRENT_PRIVATE_WEB_APP_VERSION: 64
NORMAL_SIX_FILE_REGISTRATION: PASS — DOC-000019 through DOC-000024 are Active
PDF_EXACT_OPENAI_SYNC: PASS — DOC-000021
PPTX_EXACT_OPENAI_SYNC: PASS — DOC-000022
XLSX_NATIVE_OPENAI_SYNC: OPENAI_HTTP_400
XLSX_VERSION_64_RETRY: AI_XLSX_MALFORMED before provider upload
FINAL_ZIP_BLOB_FIX: committed at 55190ae567bca37aaa5dabff3a2ac881bf43c427
LOGIC_VALIDATION: PASS — 373/373
GITHUB_CI_ACTUALLY_RAN: NO
```

The final fix is narrow: it presents the existing XLSX bytes to `Utilities.unzip` as a named XLSX/ZIP-compatible Blob and adds deterministic MIME/name assertions. It does not alter the other format paths or the accepted Work 0021 search surface.

## Authorized mutation budget

```text
ADDITIONAL_APPS_SCRIPT_VERSIONS: 1
ADDITIONAL_EXISTING_WEB_APP_UPDATES: 1
EXPECTED_NEXT_VERSION: 65
NEW_WEB_APP: 0
NEW_VECTOR_STORE: 0
BROAD_SYNC: 0
GEMINI_CALLS: 0
```

The authorization expires after the first additional version/update attempt. Do not create version 66 or another deployment without a new explicit decision from ChatGPT.

## Exact continuation sequence

Before mutation:

1. fetch and verify the current branch/PR head;
2. verify it contains `55190ae567bca37aaa5dabff3a2ac881bf43c427`;
3. rerun the focused XLSX/format tests and canonical checks;
4. deliver and read back the exact tested Apps Script source once.

Then:

1. create one immutable Apps Script version, expected version 65;
2. update the same existing private Web App once;
3. exact-sync only XLSX `DOC-000024` first;
4. if XLSX passes, exact-sync only DOCX `DOC-000019`, TXT `DOC-000023`, and EML `DOC-000020`;
5. do not repeat PDF/PPTX sync;
6. run exactly one grounded retrieval/citation check for each matrix source:
   - DOCX `DOC-000019`
   - EML `DOC-000020`
   - PDF `DOC-000021`
   - PPTX `DOC-000022`
   - TXT `DOC-000023`
   - XLSX `DOC-000024`;
7. prove EML attachment exclusion;
8. run one API-independent FULL_OUTPUT preview proving all Pitchbooks remain reference-only;
9. complete final provider/source integrity and Work reporting.

## Stop rules

Stop immediately and return the exact observed blocker if:

- source readback differs;
- the additional deployment cannot be completed safely;
- XLSX still fails after version 65;
- any format produces wrong authoritative source identity or citation;
- duplicate provider documents or unexpected source/provider mutations appear.

Do not automatically repair and deploy again after this bounded attempt.

## Prohibited actions

- no repeat registration;
- no repeat PDF/PPTX sync;
- no broad/source-type-wide sync or reindex;
- no Gemini call or provider fallback;
- no `DOC-000018` or old Matrix-C large-fixture mutation;
- no chooser-automation repair;
- no Work 0023 implementation;
- no new Web App, Vector Store, endpoint, trigger, or Library;
- no confidential data;
- no rebase, force-push, history rewrite, or PR merge.

## Required delivery

Update the existing CODEX-04 report, Work tracking, runtime locator, and PR #34. Commit and push all scoped changes. Keep PR #34 Draft/Open/unmerged and return it for ChatGPT final review.

## Completion latch

```text
ADDITIONAL_DEPLOYMENT_USED: YES | NO
RUNTIME_DEPLOYMENT_VERSION: 65 | <actual>
FORMAT_PDF: SUPPORTED_AND_QUALIFIED | FAIL
FORMAT_PPTX: SUPPORTED_AND_QUALIFIED | FAIL
FORMAT_XLSX: SUPPORTED_AND_QUALIFIED | FAIL
FORMAT_DOCX: SUPPORTED_AND_QUALIFIED | FAIL
FORMAT_TXT: SUPPORTED_AND_QUALIFIED | FAIL
FORMAT_EML: SUPPORTED_AND_QUALIFIED | FAIL
EML_ATTACHMENT_BOUNDARY: PASS | FAIL
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS | FAIL
FINAL_PROVIDER_INTEGRITY: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

The final Codex response must begin and end with:

```text
WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
```
