# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `NONE`
BALL: `NONE`
STATUS: `ACCEPTED`
MODE: `COMPLETE`

## Final outcome

Work 0020 is complete and merged to `main` through PR #26.

```text
PR_26: MERGED
MERGE_COMMIT: 185fd197cd531bf74e77af33b32e82706bebe0b5
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_EXACT_SOURCE_SYNC: PASS
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS — DOC-000017
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS — MTG-000005
OPENAI_METADATA_FILTER: PASS
OPENAI_LIFECYCLE: PASS
RETRY_REPLACEMENT_ORPHAN_CLEANUP_HARDENING: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
MAIN_RECONCILIATION: PASS
LOGIC_VALIDATION: PASS — focused 35/35; canonical 330/330
TARGET_RUNTIME_QUALIFICATION: PASS — same private Web App version 58
UNRESOLVED_REVIEW_THREADS: 0
GITHUB_CI_ACTUALLY_RAN: NO
BLOCKER: NONE
```

Final CODEX-21 report:
`docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-report.md`

Runtime locator:
`docs/operations/runtime-artifact-locator.md`

## Closed boundary

Do not reopen Work 0020 for ordinary polish or rare-edge-case hardening. New findings stay in a later Work unless they demonstrate one of the following against the accepted implementation:

- data loss/corruption/duplicate authoritative records;
- credential or confidential-data exposure;
- incorrect authoritative citation/source identity;
- failure of a normal primary user flow;
- material irreversible resource leakage.

## Follow-up routing

- Gemini: defer provider recovery until the product is near completion, then re-test current Gemini API/File Search/Apps Script behavior from first principles against the completed OpenAI reference path.
- large OpenAI files: separate bounded indexing/async-progress Work if real operating files require it.
- Work 0021: next large product slice — structured Knowledge Search filters, five-mode experience and multi-Entity comparison.
- Work 0025: administrator-governed model/thinking selection after the broader search flow is in place.
- Work 0023: generated bundle/installer after the intended feature surface is stable.

WORK_ID: `0020`
DISPATCH_ID: `NONE`
BALL: `NONE`
STATUS: `ACCEPTED`
