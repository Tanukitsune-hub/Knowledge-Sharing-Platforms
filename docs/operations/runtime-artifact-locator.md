# Knowledge Share Runtime / Artifact Locator

LAST_RUNTIME_EVIDENCE_AT: 2026-09-04 JST
LAST_RUNTIME_EVIDENCE_BY: Codex, CODEX-02
LATEST_CONTROLLER_ACTION: CODEX-02 GitHub review and CODEX-03 preparation; no new runtime execution
STATUS: version 72 remains deployed; citation repair dispatched but not yet executed

## Source and current ball

SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
DEFAULT_BRANCH: `main`
MAIN_AT_REVIEW: `8c9be2392a1247ff81efc6a153fc0be449b1318b`
ACTIVE_BRANCH: `agent/0027-gemini-file-search-resilience`
REVIEWED_IMPLEMENTATION: `acd3aa08a3ecc01a7b0852afef8f58202934af82`
REVIEWED_CODEX_02_FINAL_REF: `0032a9cdb69cc1431566dee82f7e2c2196ddee50`
PR: `#37 / Draft / Open / unmerged`
CURRENT_ACTIVE_WORK: `0027`
CURRENT_ACTIVE_DISPATCH: `0027-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

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

Future authorization is not observed deployment. CODEX-03 may create at most version 73 after an evidence-led repair and deterministic PASS; it may update this same private deployment once. Version 74+ is not authorized. An optional private editor diagnostic does not update the deployed Web App.

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
TEMP_RESOURCE_CLEANUP: PASS / deletion confirmed
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
EXISTING_SOURCE_OR_STORE_MUTATION: 0
OPENAI_FULL_OUTPUT_LIVE_CALLS: 0
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

CODEX-03 fixes only the observed citation identity boundary on 3.7. Its implementation/runtime evidence is NOT_RUN. At most one optional diagnostic and one final confirmation use separate sequential temporary Stores with cleanup between them; no existing Store/record is repurposed. See `docs/handoffs/0027-CODEX-03-citation-identity-repair-instruction.md` for authoritative budgets.

## Next phases

After personal-DEV citation qualification: representative large files, historical-material migration and separately approved company Shared Drive/domain-user/provider qualification. No confidential indexing, billing changes or rollout is enabled by this locator.
