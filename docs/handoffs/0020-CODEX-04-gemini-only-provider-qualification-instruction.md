# Work 0020 — CODEX-04 Gemini-only File Search qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`
ROUTE: `C`
RECOMMENDED_MODEL: `Luna Max`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`

## Primary outcome

Close Work 0020 by qualifying Gemini File Search end-to-end while deliberately leaving OpenAI disabled/unconfigured.

User decision:

```text
Gemini
  -> configure and live-qualify now

OpenAI / ChatGPT
  -> intentionally defer; keep disabled
```

Do not request, create, store, or configure an OpenAI API key in this dispatch.

## Accepted evidence — do not reopen

CODEX-03 is accepted evidence:

- focused validation `52/52 PASS`;
- repository validation `256/256 PASS`;
- temporal/public-surface/diff checks PASS;
- public facade `28`;
- Backend exactly five sheets/schema `6`;
- `AI_Provider_State_JSON` present exactly once on Meeting_Index and Pitchbook_Index;
- installation state schema `6` read back with existing fields preserved;
- FULL_OUTPUT runtime PASS;
- Preview/Docs/PDF package parity PASS;
- Pitchbooks remain reference-only in FULL_OUTPUT;
- both disabled-provider safe errors and zero failover PASS;
- Apps Script version `42` on the same private Web App;
- final integrity PASS;
- triggers `0`, deployment count `9`, Library and permissions unchanged.

OpenAI's safe-disabled/no-failover evidence remains accepted. It does not need a live PASS for Work 0020 because the user explicitly chose to defer that provider and Gemini will be the enabled live-qualified provider.

## Current official Gemini baseline

Use current official Gemini documentation at execution time.

Expected bounded configuration for this dispatch:

```text
GEMINI_ENABLED = true
GEMINI_DEFAULT_MODEL = gemini-3.7-flash
AI_EMBEDDING_MODEL = models/gemini-embedding-2
GEMINI_FILE_SEARCH_STORE_NAME = blank before first creation, then exact created Store name
OPENAI_ENABLED = false
OPENAI_VECTOR_STORE_ID = blank
OPENAI_DEFAULT_MODEL = blank
```

Do not expose API keys, Store resource names, private URLs, or account IDs in GitHub/chat/report text.

## User secret-entry boundary

The user owns the Gemini API key and will enter it directly into the Apps Script Project Settings / Script Properties surface.

Required property key:

```text
KSP_GEMINI_API_KEY
```

Codex must never ask the user to paste the secret into chat, a report, GitHub, a terminal command shown in transcript, or a normal Sheet cell.

When the implementation is ready for the credential, pause under the SAME Dispatch ID with:

```text
BALL: USER
STATUS: ACTION_REQUIRED
ACTION: add or replace Script Property KSP_GEMINI_API_KEY with the user's Gemini API key, save, then confirm only that the property was saved.
```

After the user confirms, resume the SAME `0020-CODEX-04` dispatch. Do not allocate CODEX-05 merely for this secret-entry pause/resume.

## 1. First-time Gemini Store creation repair

Before asking for the key, inspect and fix the current provider-neutral first-run path if still present.

Known review findings:

1. `kspProviderConfigurationError_()` currently rejects Gemini when `storeName` is blank even though `ensureFileSearchStore()` already supports creating the Store when blank. For Gemini only, a blank Store name must be allowed when the provider is enabled, the model is configured, and the credential is present.

2. `kspCreateProviderNeutralAiEnvironment_().ensureProviderStore()` currently risks passing the Gemini generation model as the File Search embedding model. The provider config must carry the configured embedding model separately and Store creation must use:

```text
models/gemini-embedding-2
```

not `gemini-3.7-flash`.

Required behavior:

- Gemini enabled + model + credential + blank Store -> create exactly one isolated File Search Store;
- persist only the created Store resource name in the existing `GEMINI_FILE_SEARCH_STORE_NAME` Settings row;
- a second evaluation reuses that same Store;
- no duplicate Store creation;
- OpenAI behavior unchanged and disabled;
- no new public facade, debug wrapper, API executable, deployment, or trigger.

Add focused regression coverage for both the blank-Store first-run path and the distinct generation-model vs embedding-model values.

## 2. Deterministic gate

Before any live Gemini call:

- implement only the bounded first-run repair if needed;
- run focused Gemini/provider-core tests;
- run `npm run check`;
- run temporal/public-surface validators;
- require public facade `28`;
- run `git diff --check`;
- inspect final relevant diff;
- confirm no secret/private ID entered GitHub.

If no source change is needed after inspection, record that and do not create a needless version.

If source changes are needed, after deterministic PASS synchronize exact corrected source once, exact-readback it, create exactly one immutable Apps Script version, and update the same private Web App in place. Do not create another deployment or touch Libraries.

## 3. Safe provider configuration

After deterministic PASS and after the user has saved `KSP_GEMINI_API_KEY`:

- privately verify credential presence only; never read it into report/chat;
- set `GEMINI_ENABLED = true`;
- set `GEMINI_DEFAULT_MODEL = gemini-3.7-flash`;
- verify `AI_EMBEDDING_MODEL = models/gemini-embedding-2`;
- keep `GEMINI_FILE_SEARCH_STORE_NAME` blank initially unless a valid isolated Work-0020 DEV Store already exists and can be positively identified;
- keep all OpenAI settings disabled/blank;
- do not enable a recurring trigger.

For the bounded manual provider lifecycle, `AI_SYNC_ENABLED` may be set `true` only as needed to execute the explicit qualification sync and must be restored to `false` at the end unless a separate accepted product decision says otherwise. Trigger count must remain `0`.

## 4. Gemini target-runtime qualification

Use only existing synthetic/non-confidential DEV source records.

Required direct evidence:

1. create or reuse exactly one isolated Gemini File Search Store;
2. Store creation uses `models/gemini-embedding-2`;
3. index at least one Meeting and one Pitchbook/source through the production Gemini adapter path;
4. prove both source types are retrievable and cited, not merely uploaded;
5. normalize each citation through stable `source_type + source_id` to authoritative Backend metadata and Drive link;
6. prove one exact metadata filter;
7. update one synthetic source and re-index without duplicate active document;
8. Inactive excludes/removes that source from normal retrieval;
9. Reactivate restores the latest authoritative content;
10. exact delete/rebuild works by derived identity without changing authoritative Drive identity;
11. provider state is recorded only under `GEMINI` in `AI_Provider_State_JSON`; `OPENAI` remains untouched/blank;
12. legacy Gemini mirror fields remain compatible as designed;
13. record bounded latency/polling/retry/rate-limit/cost/retention evidence without private IDs.

Do not index all historical sources merely to qualify the core. Use the minimum Meeting + Pitchbook slice plus only the bounded lifecycle mutations needed for evidence.

## 5. Search UI proof

Using the private Web App:

- Gemini route reports configured/available;
- one Meeting-grounded query returns an answer with authoritative Meeting citation;
- one Pitchbook-grounded query returns an answer with authoritative Pitchbook citation;
- citation links resolve to the expected authoritative Drive sources;
- ChatGPT route remains disabled and returns its already-accepted safe OpenAI-disabled error;
- zero automatic provider failover.

Do not rerun FULL_OUTPUT qualification unless a material contradiction appears; CODEX-03 FULL_OUTPUT evidence is accepted.

## 6. Final integrity

Prove:

- exactly five Backend sheets/schema `6`;
- authoritative Meeting/Pitchbook IDs/files/content unchanged except any explicitly bounded synthetic lifecycle content mutation that is restored before completion;
- Gemini provider state present only where expected;
- OpenAI settings remain disabled/blank and OpenAI provider state unchanged;
- only one isolated Gemini Store was created/reused;
- no duplicate active provider documents per source;
- `AI_SYNC_ENABLED` restored to `false` after bounded qualification;
- trigger count `0`;
- Audit contains only permitted metadata and no question, answer, chunks, source bodies, key, Store ID, or raw provider payload;
- no permission/Library/new-deployment mutation;
- expected version/deployment change only if CODEX-04 source repair required one.

## 7. Completion classification

Work 0020 may PASS with this provider matrix:

```text
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted from CODEX-03
```

OpenAI live qualification becomes a later optional/provider-enablement task, not a Work 0020 blocker.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```

Create:

`docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-report.md`

Update:

- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR #26 body.

Commit/push scoped changes and keep PR #26 Draft / Open / unmerged for ChatGPT final review.