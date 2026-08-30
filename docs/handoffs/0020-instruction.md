# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-20`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `QUALIFICATION`

Returned instruction:
`docs/handoffs/0020-CODEX-20-main-reconciliation-and-final-merge-readiness-instruction.md`

Final report:
`docs/handoffs/0020-CODEX-20-main-reconciliation-and-final-merge-readiness-report.md`

Runtime locator:
`docs/operations/runtime-artifact-locator.md`

## Outcome

Work 0020 is functionally and GitHub-integration ready. CODEX-19 target-runtime evidence remains latched. CODEX-20 normally merged the latest fetched main, retained Work 0023/0025 governance, resolved the AI decision semantics, passed all deterministic checks and left PR #26 mergeable and ready for final ChatGPT review.

```text
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
OPENAI_DIRECT/File_SEARCH/CITATION/SOURCE_NORMALIZATION: PASS
OPENAI_EXACT_SOURCE_SYNC: PASS
OPENAI_NATIVE_MEETING/PITCHBOOK_QUERY_LIFECYCLE: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
MAIN_RECONCILIATION: PASS
LOGIC_VALIDATION: PASS — 325/325
PR_MERGEABLE: YES
PR_READY_FOR_REVIEW: YES
GITHUB_CI_ACTUALLY_RAN: NO
RUNTIME_DEPLOYMENT_CHANGED: NO
READY_FOR_CHATGPT_FINAL_MERGE: YES
BLOCKER: NONE
```

## Preserved boundaries

- File Search may use Meeting and Pitchbook/source materials;
- FULL_EXPORT body uses authoritative Meeting Google Docs text only;
- Pitchbooks are bounded reference metadata/links only in FULL_EXPORT;
- model/thinking choices are administrator-enabled, accessible and qualified;
- administrators may hide Sol, retain older approved models and control thinking per model;
- new/latest models are never auto-enabled;
- Work 0023 installer/bundle decisions and all Work 0025 policy files remain present;
- no provider/runtime/deployment operation occurred in CODEX-20;
- PR #26 remains unmerged.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-20`
BALL: `CHATGPT`
STATUS: `RETURNED`
