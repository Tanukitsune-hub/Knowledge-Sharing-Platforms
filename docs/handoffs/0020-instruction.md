# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-19`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `INCIDENT_RECOVERY -> QUALIFICATION`

Returned instruction:
`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-instruction.md`

Completion report:
`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-report.md`

Runtime locator:
`docs/operations/runtime-artifact-locator.md`

## Outcome

Work 0020 is ready on the OpenAI completion path. CODEX-17 direct provider qualification and CODEX-18 citation/source normalization remain accepted. CODEX-19 repaired exact native sync scoping, provider-current eligibility, partial item-failure readiness and safe private-admin diagnostics, then completed native Pitchbook/Meeting grounded citation, metadata, lifecycle and final-integrity gates.

## Accepted evidence

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_CONNECTION_SELF_TEST: PASS native
OPENAI_EXACT_SOURCE_SYNC: PASS native
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS native — DOC-000017
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS native — MTG-000005
OPENAI_METADATA_FILTER: PASS native
OPENAI_LIFECYCLE: PASS native
LOGIC_VALIDATION: PASS — focused 47/47; canonical 325/325
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun in CODEX-19
SOURCE_READBACK: PASS
WEB_APP_DELIVERY: PASS — same existing private Web App, version 57
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NONE
```

## Residual routing

- Old 5–25 MiB size-matrix Pitchbooks with item-level `OPENAI_INDEX_TIMEOUT` remain a separate bounded follow-up. They were not broad-retried, deleted or mutated.
- Gemini provider recovery remains deferred and no automatic provider fallback exists.
- GitHub-hosted CI status is reported from the exact pushed CODEX-19 head.

## Safety boundary preserved

- designated synthetic sources only;
- stored OpenAI key preserved without reading, printing or logging it;
- no Gemini call, provider fallback, confidential data or FULL_OUTPUT rerun;
- no new Vector Store, Web App, Library or public/debug endpoint;
- PR #26 remains Draft/Open/unmerged;
- no current-main merge or rebase.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-19`
BALL: `CHATGPT`
STATUS: `RETURNED`
