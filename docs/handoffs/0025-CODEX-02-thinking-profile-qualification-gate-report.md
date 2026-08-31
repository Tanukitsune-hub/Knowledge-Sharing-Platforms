# Work 0025 — CODEX-02 thinking-profile qualification gate report

WORK_ID: 0025
DISPATCH_ID: 0025-CODEX-02
MODE: REVIEW_FIX -> QUALIFICATION
BALL: CHATGPT
STATUS: RETURNED

## Outcome

The Work 0025 qualification mismatch is closed. Qualification state is now persisted for each thinking profile, and a user-visible tuple is qualified using its exact provider, model ID, thinking profile ID, provider-default omission or exact raw value, bounded output ceiling and OpenAI File Search request shape.

Normal-user choices include only individually `QUALIFIED` thinking profiles. The server resolver independently rejects stale, disabled, unqualified and failed thinking choices. Changing the model ID, thinking contract, enabled tuple set, configured default or output ceiling invalidates the affected model qualification fail closed.

The administrator qualification action uploads one temporary synthetic source, runs one bounded query per enabled thinking tuple through the normal request builder, persists per-thinking results, retains passing tuples on a partial failure, and cleans the temporary source once. The compact administrator UI now shows per-thinking qualification state.

## Deterministic evidence

- focused model-policy/admin tests: 32/32 PASS;
- focused OpenAI provider/sync/recovery/FULL_OUTPUT regression: 101/101 PASS;
- canonical `npm run check`: 345/345 PASS;
- Apps Script source validation: 56 `.gs` and 22 HTML files PASS;
- temporal validation: PASS;
- public-surface validation: PASS — 30 public and 633 private top-level functions;
- `python tools/validate_agent_foundation.py`: PASS;
- `git diff --check`: PASS.

Coverage includes the migrated provider-default omission, new explicit tuple `UNQUALIFIED` state, exact reasoning and output-ceiling request shaping, provider-default omission, partial tuple failure, unavailable default behavior, model/thinking/output invalidation, crafted-request rejection, citation normalization, OpenAI retry/replacement cleanup and API-independent FULL_OUTPUT.

## Target-runtime qualification

The exact tested source at implementation commit `2fee55970aa0542197c3a97d64b67aeaa50df714` was delivered once to the existing standalone Apps Script project and read back with exact 79/79-file parity after newline normalization. Exactly one immutable version, version 60, was created. The same existing private Web App deployment was updated once and read back as `WEB_APP`, `/exec`, `MYSELF`, `USER_DEPLOYING`, version 60. No new deployment, Web App, Library, Vector Store or public endpoint was created.

The stored OpenAI key was preserved without reading, printing, logging or replacing it. The current `openai-current-default` / `gpt-5.6-terra` / provider-default tuple was qualified once through the existing private administrator action. Runtime readback returned API access `AVAILABLE`, model/File Search `QUALIFIED`, and provider-default thinking `QUALIFIED`.

The hidden synthetic profile remained disabled, hidden, `UNKNOWN / UNQUALIFIED`, and absent from the normal-user model/thinking choices. The production resolver's deterministic crafted-request test rejects that combination before provider invocation. A supplemental read-only attempt to observe the same rejection through the pre-existing Execution API was denied by that deployment's caller permission before application execution; it performed no provider call or state mutation. No new observer endpoint was added.

One bounded Pitchbook query returned the expected `CODEX18_SYNTH_PITCHBOOK_20260830` facts and an authoritative normalized `Pitchbook / DOC-000017` source. Source-type-only retrieval also displayed older synthetic Pitchbook citations and a citation warning; those sources were read only and were not synced, retried or mutated. One bounded Meeting query returned the expected `CODEX18_SYNTH_MEETING_20260830` facts and an authoritative normalized `Meeting / MTG-000005` source.

No Gemini call, broad or exact source sync, large-fixture retry/mutation, lifecycle action, confidential data use, FULL_OUTPUT runtime call or provider fallback occurred. `DOC-000018` and the old 5–25 MiB fixtures were not mutated.

## Completion latch

```text
THINKING_PROFILE_QUALIFICATION_STATE: PASS
EXACT_MODEL_THINKING_OUTPUT_QUALIFICATION: PASS
UNQUALIFIED_THINKING_HIDDEN: PASS
SERVER_SIDE_THINKING_QUALIFICATION_GATE: PASS
CURRENT_DEFAULT_MIGRATION: PASS
ADMIN_MODEL/THINKING_CONTROL: PASS
OPENAI_REGRESSION: PASS
LOGIC_VALIDATION: PASS — focused 101/101; canonical 345/345; temporal, public-surface, agent-foundation and diff hygiene PASS
TARGET_RUNTIME_QUALIFICATION: PASS — exact source readback and same private Web App version 60
RUNTIME_DEPLOYMENT_VERSION: 60
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: YES
BLOCKER: NONE
FINAL_COMMIT: implementation/source 2fee55970aa0542197c3a97d64b67aeaa50df714; final tracking commit is the completion PR head reported in chat
```

WORK_ID: 0025
DISPATCH_ID: 0025-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
