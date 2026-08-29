# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-17`
BALL: `USER`
DISPATCH_STATUS: `ACTION_REQUIRED`
WORK_READY: `NO`
BLOCKER: `YES`

## Current classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_DIRECT_BASE_MODEL: NOT RUN
OPENAI_DIRECT_FILE_SEARCH: NOT RUN
OPENAI_SYNTHETIC_SELF_TEST: NOT RUN
OPENAI_MEETING_INDEX_QUERY: NOT RUN
OPENAI_PITCHBOOK_INDEX_QUERY: NOT RUN
OPENAI_METADATA_FILTER: NOT RUN
OPENAI_LIFECYCLE: NOT RUN
OPENAI_RUNTIME: NOT YET LIVE-QUALIFIED
GEMINI_RUNTIME: BLOCKED / PROVIDER RECOVERY DEFERRED
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
SCHEMA_ALIGNMENT: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

## Why the strategy changed

The Gemini application-side lifecycle was substantially repaired and qualified, but the provider path remained unusable:

```text
Interactions + File Search
-> provider pending >=600000ms

Generate Content + File Search
-> safe failure after 83364ms
-> zero citations
```

The user also reports repeated errors in Google AI Studio. Continuing Gemini-only diagnosis is therefore no longer the fastest safe path to the user outcome.

The user explicitly chose to try OpenAI API.

## OpenAI path viability

The repository already contains an OpenAI provider client and provider-neutral hooks for:

- Responses API;
- file upload/delete;
- Vector Store creation/readback;
- Vector Store file attachment/indexing;
- source attributes;
- filtered File Search;
- derived-provider cleanup;
- administrator enable/disable skeleton.

This makes OpenAI a bounded provider qualification, not a new architecture.

Current official OpenAI Platform support also aligns with the product design: Responses API supports built-in File Search, Vector Store files support attributes/filters, and current GPT-5.6 models support File Search.

## Accepted OpenAI activation decision

Decision:
`docs/decisions/openai-zero-friction-onboarding-and-project-switch.md`

Normal admin flow must be:

```text
APIキーを保存して接続確認
-> isolated synthetic OpenAI File Search self-test
-> READY_FOR_SYNC

資料を同期して利用開始
-> explicit bounded OpenAI source sync
-> ACTIVE only after safe source qualification
```

A key existing in Script Properties must not automatically trigger real-source sync.

## Current source warning

The current pushed Gemini source from CODEX-15 still contains an unqualified Generate Content default. PR #26 remains Draft / Open / unmerged. CODEX-17 must ensure the final user-ready provider selection does not treat that failed diagnostic Gemini path as qualified.

## CODEX-16 disposition

CODEX-16 was prepared but not executed. It is superseded because the user chose OpenAI as the active completion path after Google AI Studio also showed repeated failures.

Its Gemini diagnostic matrix remains useful for a later provider-recovery Work but is not active now.

## Active CODEX-17

Instruction:
`docs/handoffs/0020-CODEX-17-openai-file-search-primary-qualification-instruction.md`

Sequence:

```text
secure OPENAI_API_KEY prerequisite
-> direct text-only OpenAI control
-> temporary synthetic Vector Store/File Search/filter/citation control
-> cleanup
-> only if PASS, repair private-admin synthetic onboarding gate
-> deterministic tests
-> one bounded Apps Script delivery
-> synthetic/non-confidential Meeting + Pitchbook index/query/citation
-> metadata/lifecycle gates
-> final integrity
```

No OpenAI<->Gemini automatic fallback is permitted.

## User action required

An OpenAI project API key must be made available securely to the local Codex process as `OPENAI_API_KEY`.

Do not paste or expose the key in ChatGPT, prompt text, GitHub, reports, screenshots, repository files, or logs.

A secure OpenAI Platform API-key setup flow has been opened in ChatGPT for this purpose.

## Preserved accepted evidence

- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT PASS;
- provider-neutral no-auto-failover architecture;
- Gemini document reconciliation PASS;
- one earlier grounded Meeting query with three citations;
- CODEX-14 request/lifecycle/dedupe/reload UX evidence;
- CODEX-15 provider-path failure evidence;
- GitHub-hosted CI remains absent; local/repository tests are not CI evidence.

## Problem classification

### BLOCKER

1. No provider currently satisfies the full Meeting + Pitchbook grounded search outcome.
2. OpenAI direct provider and application qualification have not yet run.
3. Metadata/lifecycle/final-integrity gates remain incomplete.
4. PR #26 cannot merge while the user-ready provider route is unqualified.

### FOLLOW_UP

- Gemini provider recovery after Work 0020 completes on OpenAI, if OpenAI qualifies.
- durable long-running-state storage only if a future provider path needs resumable jobs.
- user-selectable reasoning level and representative latency benchmark in later Works.
- current-main integration after provider blocker closes and before final merge.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-17`
BALL: `USER`
DISPATCH_STATUS: `ACTION_REQUIRED`
WORK_READY: `NO`
BLOCKER: `YES`
