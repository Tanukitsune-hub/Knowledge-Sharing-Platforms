# Knowledge Share Runtime / Artifact Locator

LAST_RUNTIME_EVIDENCE_AT: 2026-09-05 JST
LAST_RUNTIME_EVIDENCE_BY: Codex, CODEX-03
LATEST_CONTROLLER_ACTION: CODEX-03 returned after its one diagnostic ended before citation output
STATUS: version 72 remains deployed; citation blocker retained; new authorization required

## Source and current ball

SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
DEFAULT_BRANCH: `main`
MAIN_AT_REVIEW: `8c9be2392a1247ff81efc6a153fc0be449b1318b`
ACTIVE_BRANCH: `agent/0027-gemini-file-search-resilience`
REVIEWED_IMPLEMENTATION: `acd3aa08a3ecc01a7b0852afef8f58202934af82`
REVIEWED_CODEX_02_FINAL_REF: `0032a9cdb69cc1431566dee82f7e2c2196ddee50`
CODEX_03_START_REF: `11865c49b17c578713c3c1b4bc5c2307434d50e9`
PR: `#37 / Draft / Open / unmerged`
CURRENT_ACTIVE_WORK: `0027`
CURRENT_ACTIVE_DISPATCH: `0027-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`

Current ball is authoritative in `docs/handoffs/0027-dispatches.md`. Local workspace paths, private URLs/IDs, provider resource names, credentials and signed URLs must not appear here.

## Observed application runtime

```text
TARGET_RUNTIME: Google Apps Script V8 / private Web App
ENVIRONMENT: isolated personal DEV / qualification
DEPLOYMENT_VERSION: 72
ROOT_AND_KNOWLEDGE_BOOTSTRAP: PASS in CODEX-02
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_CONSOLE_ERRORS: 0
SOURCE_READBACK: PASS / 82 of 82 in CODEX-02
VERSION_67: unused / never deploy
VERSION_68: superseded / modular shell failed
VERSION_69: superseded / shell repaired
VERSION_70: superseded / Work 0026 shell PASS
VERSION_71: superseded / CODEX-01 shell PASS
VERSION_72: current / CODEX-02 shell PASS
VERSION_73_PLUS_CREATED_IN_CODEX_02: NO
```

CODEX-03 created no immutable version and did not update the Web App. Its version-73 and deployment budgets expired on return. Version 74+ remains unauthorized and version 67 remains prohibited. Any future version or deployment requires a new controller dispatch.

## Accepted merges and provider boundary

- Work 0020: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- Work 0025: `121f2a1c4655ece46c7e07163b0d12866600923e`
- Work 0021: `533c849bd1229827ec77cd5ad6506312ea286940`
- Work 0023: `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`
- Work 0026: `40bb7d40506c0839c35742ee0000d89650ff7ad6`

OpenAI and API-independent FULL_OUTPUT are accepted reference paths in personal DEV, not company-environment qualification. No OpenAI/FULL_OUTPUT live calls are authorized for CODEX-03. Installer/bundle owner, attestation, source parity and duplicate-prevention evidence remain closed.

Work 0026's old `HTTP_OR_CREDENTIAL_FAILURE` is historical only. Prior exact DOC-000017/MTG-000005 evidence remains one document each with no duplicates; these existing resources were not changed in CODEX-01/02 and must not be changed in CODEX-03.

Independent company-GAS evidence and its limits remain in `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`.

## Latest Gemini runtime evidence

```text
CODEX_01_3_8: HTTP 500 / api_error after successful upload/index/readback
CODEX_02_3_7_SHORT: HTTP 200 / 1470ms
CODEX_02_3_7_FILE_SEARCH: HTTP 200 / expected token / 1 file_citation
CODEX_02_QUERY_ATTEMPTS_RETRIES: 2 / 1
CODEX_02_QUERY_LATENCY_MS: 34992
AUTHORITATIVE_CITATION_IDENTITY_MATCH: FAIL
GEMINI_3_6_CALLED_IN_CODEX_02: NO
CODEX_03_DIAGNOSTIC_HTTP: 429 / too_many_requests
CODEX_03_DIAGNOSTIC_ATTEMPTS_RETRIES: 2 / 1
CODEX_03_DIAGNOSTIC_CUMULATIVE_SLEEP_MS: 514
CODEX_03_DIAGNOSTIC_LATENCY_MS: 21825
CODEX_03_MODEL_OUTPUT_AND_CITATIONS: 0 / 0
CODEX_03_TEMP_RESOURCE_CLEANUP: PASS / deletion confirmed
CODEX_03_MUTABLE_SOURCE_RESTORATION: PASS / 82 of 82
CODEX_03_VERSION_OR_DEPLOYMENT: NONE / version 72 unchanged
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
EXISTING_SOURCE_OR_STORE_MUTATION: 0
OPENAI_FULL_OUTPUT_LIVE_CALLS: 0
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

CODEX-03 did not observe a citation shape because its one diagnostic stopped at HTTP 429. No implementation or final confirmation was run. The unresolved CODEX-02 citation blocker remains authoritative; the new transient observation is not a replacement root cause. See `docs/handoffs/0027-CODEX-03-citation-identity-repair-report.md`.

## Next phases

After personal-DEV citation qualification: representative large files, historical-material migration and separately approved company Shared Drive/domain-user/provider qualification. No confidential indexing, billing changes or rollout is enabled by this locator.
