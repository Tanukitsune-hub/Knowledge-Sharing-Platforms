# Work 0020 — CODEX-04 OpenAI File Search live qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
MODE: `QUALIFICATION / bounded BUILD only if execution adapter is missing`
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`

## Primary outcome

Close the sole remaining Work 0020 blocker by configuring and live-qualifying the ChatGPT / OpenAI File Search route in the existing synthetic DEV installation, while preserving all accepted CODEX-03 evidence.

Gemini remains disabled in this dispatch unless the user separately authorizes/configures it.

## User gate — do not start live provider work before this is satisfied

The user must create/obtain an OpenAI project API key through the secure OpenAI Platform setup flow. The raw key must never be pasted into ChatGPT, GitHub, reports, Audit, browser payloads, source files, or ordinary Settings rows.

Once the key is available to the user's trusted local/admin flow, Codex may proceed. If the key is not securely available, return `ACTION_REQUIRED — OPENAI_API_KEY` without changing provider configuration.

## Accepted evidence — do not reopen

CODEX-03 is accepted for:

- `LOGIC_VALIDATION: PASS` — focused `52/52`, repository `256/256`, temporal/public-surface/diff checks PASS;
- public facade `28`;
- Backend exactly five sheets/schema `6`;
- installation state schema `6` with unrelated fields preserved;
- private Web App version `42`, deployment count `9`, same Web App / deploying user / `Only myself`;
- `FULL_OUTPUT_RUNTIME: PASS`;
- Preview/Docs/PDF canonical package parity;
- Meeting-less FULL_EXPORT hard stop;
- reference Pitchbook metadata validation with zero Pitchbook body/byte read;
- ChatGPT disabled safe error and Gemini disabled safe error with zero failover;
- final integrity PASS, Audit `69`, triggers `0`, Library/permissions unchanged.

Do not repeat FULL_OUTPUT, schema migration, or Gemini disabled-route qualification.

## Current OpenAI contract to verify at execution time

Use current official OpenAI documentation at execution time. Current ChatGPT review baseline is:

- Responses API `POST /v1/responses`;
- `file_search` tool over Vector Stores;
- Vector Store file attributes support exact filters and are limited to at most `16` attributes;
- `file_citation` annotations are normalized back to stable `source_type + source_id`;
- `gpt-5.6-terra` supports Responses API File Search and is the initial DEV model because it balances intelligence and cost.

If current official documentation materially contradicts this, stop before provider mutation and report the contradiction.

## 1. Secure provider configuration

Use server-side/admin-only storage:

- Script Property `KSP_OPENAI_API_KEY` = the user's securely supplied project API key;
- Settings `OPENAI_ENABLED = true`;
- Settings `OPENAI_DEFAULT_MODEL = gpt-5.6-terra`;
- Settings `OPENAI_VECTOR_STORE_ID` = one isolated DEV Vector Store ID.

Do not put the API key in Settings.

If `OPENAI_VECTOR_STORE_ID` is blank:

1. add/use the smallest private OpenAI adapter path needed to create exactly one isolated DEV Vector Store;
2. give it a clearly synthetic DEV name such as `KnowledgeSharingPlatform-DEV-0020`;
3. persist only the resulting Store ID in the existing Settings row;
4. never record the Store ID in GitHub/chat/report/Audit/browser-visible output;
5. reuse that Store for Work 0021 rather than creating duplicates.

Configuration readback must expose only booleans such as enabled/configured, never secrets or private Store identity.

Gemini remains `GEMINI_ENABLED=false` and is not called.

## 2. OpenAI execution surface

Prefer an existing private/admin execution surface that runs the real production provider-neutral sync code.

If no safe private execution surface exists, one temporary non-deployed qualification wrapper is explicitly authorized as an execution harness only, provided all of the following hold:

- it contains zero business logic and only calls the existing private provider-neutral sync function;
- it is never committed to GitHub;
- it is never included in an immutable version or Web App deployment;
- it is used only for this bounded synthetic qualification;
- it is removed immediately after use;
- exact saved Apps Script source is restored/read back to the tested Git source before any final version/deployment action;
- no second permanent public/admin API is introduced.

A one-off harness may not weaken security, validation, provider state, source selection, or retry logic.

No recurring trigger is authorized. Final trigger count must remain `0`.

## 3. Provider sync control

If the real sync worker requires `AI_SYNC_ENABLED=true`, it may be set to `true` only for the bounded qualification window and must be restored to its accepted final value (`false`) before final integrity unless the user explicitly authorizes ongoing sync.

Use at most two bounded sync executions unless a directly observed asynchronous provider operation needs one additional poll-only continuation. Do not loop until success.

The first provider sync should use current existing synthetic DEV sources. It may index more than exactly two sources if the canonical worker batch naturally does so, but stop as soon as both Meeting and Pitchbook/source live evidence is sufficient. Do not manufacture extra authoritative data solely to satisfy ordering.

## 4. Required OpenAI live evidence

### Capability/config gate

Prove:

- OpenAI enabled/configured through safe readback;
- Gemini still disabled;
- isolated Vector Store is accessible;
- model is configured as `gpt-5.6-terra`;
- no secret/private Store ID appears in browser/Audit/report.

### Indexing

Through the real canonical source/provider path, prove at least:

- one Active Meeting is indexed;
- one Active Pitchbook/source is indexed;
- OpenAI file attributes stay within `16` and use stable-ID-first metadata;
- `AI_Provider_State_JSON.OPENAI` becomes independently `Indexed` for observed sources;
- legacy Gemini state is not overwritten by OpenAI state;
- no duplicate active OpenAI document exists for a source.

### Grounded query and citation

Using the version-42-or-later private Web App normal `ChatGPT` route:

1. ask one synthetic question that requires the indexed Meeting and obtain a grounded answer with an authoritative Meeting citation;
2. ask one synthetic question that requires an indexed Pitchbook/source and obtain a grounded answer with an authoritative Pitchbook citation;
3. each citation must map through stable `source_type + source_id` to the correct Backend row and safe Drive link;
4. prove one exact metadata filter (`source_id`, `entity_key`, or another already-supported exact filter) against the OpenAI route;
5. no Gemini call/fallback occurs.

Do not store question/answer text in Audit or report.

## 5. Lifecycle evidence

Use one safe synthetic source and bounded reversible operations to prove the provider lifecycle without damaging authoritative content:

- current source -> indexed;
- one content-changing update -> re-index to the new content hash with no duplicate active OpenAI document;
- Inactive -> excluded/removed from normal OpenAI retrieval;
- Reactivate -> latest authoritative content restored;
- exact provider-derived delete/rebuild -> source returns once with stable authoritative identity unchanged.

Prefer an already safe synthetic source. If an authoritative synthetic field/body must be changed for the update proof, make one harmless change through the normal application path and restore it once; record only metadata-level evidence. Do not use confidential data.

Stop on the first actual application/provider-integrity defect. Do not open a second implementation hypothesis in the same dispatch unless the failure is a clearly transient provider operation already covered by the retry contract.

## 6. Cost and call bounds

Keep this qualification small:

- one isolated DEV Vector Store;
- existing/synthetic records only;
- no bulk historical indexing;
- no more than 20 intentional OpenAI API requests excluding bounded status polling generated by the existing adapter;
- short answers;
- no web search/code interpreter/other OpenAI tools.

Record only aggregate call counts/latency/cost observations; do not record request bodies, source text, secret values, or private Store IDs.

## 7. Source changes and deployment

If no source change is required, do not create another immutable Apps Script version merely for provider configuration/runtime qualification.

If a source fix is genuinely required (for example, only the missing isolated Vector Store creation adapter):

1. make the smallest scoped production-source change;
2. add focused deterministic tests;
3. run focused tests, `npm run check`, temporal/public-surface validators, and `git diff --check`;
4. public facade should remain `28` unless a new permanent normal-user facade is explicitly justified — prefer no new facade;
5. synchronize exact tested source once;
6. exact source readback;
7. create exactly one immutable version;
8. update the same existing private Web App in place;
9. no new deployment/Library mutation.

Never deploy a temporary qualification wrapper.

## 8. Final integrity

Require:

- exactly five Backend sheets/schema `6`;
- existing source IDs/files/Masters/counters intact except explicitly bounded reversible synthetic lifecycle;
- OpenAI provider state independent and consistent with Store contents;
- no duplicate active OpenAI provider document per source;
- `OPENAI_ENABLED=true`, model configured, isolated Store configured;
- Gemini remains disabled/unconfigured unless separately authorized;
- `AI_SYNC_ENABLED` restored to false unless explicitly authorized otherwise;
- Audit contains only permitted metadata; no question, answer, source body, chunks, API key, raw provider payload, or Store ID;
- triggers `0`;
- permissions and Library deployments unchanged;
- temporary wrapper absent from saved/deployed source;
- FULL_OUTPUT accepted evidence remains unchanged and is not rerun.

## 9. Delivery

Create:

`docs/handoffs/0020-CODEX-04-openai-file-search-live-qualification-report.md`

Update:

- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR #26 body.

Commit/push only scoped source/test/report/status changes. Keep PR #26 Draft / Open / unmerged for ChatGPT final review.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: PASS
GEMINI_RUNTIME: DISABLED_BY_CONFIG / SAFE_DISABLED_ERROR
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```

If the API key cannot be securely provided/configured, return only:

```text
ACTION_REQUIRED — OPENAI_API_KEY
READY: NO
BLOCKER: YES
```
