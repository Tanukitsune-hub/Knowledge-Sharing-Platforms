# Work 0025 — CODEX-01 model policy foundation and user selection report

WORK_ID: 0025
DISPATCH_ID: 0025-CODEX-01
MODE: BUILD -> QUALIFICATION
BALL: CHATGPT
STATUS: RETURNED

## Outcome

The administrator-governed model/thinking policy vertical slice is implemented and qualified. Knowledge Search now exposes only server-authorized model/thinking profile IDs, while the provider adapter receives only the validated exact model, optional validated reasoning value and optional bounded output limit.

The registry remains in the existing `Settings` architecture. It supports stable profile identities, exact provider model IDs, historical/manual entries, administrator visibility/default controls, per-model thinking choices, API-access and File Search qualification state, qualification timestamps and safe notes. It does not auto-enable provider-discovered or newest models.

The current OpenAI default remains `gpt-5.6-terra` with the explicit provider-default/no-override thinking profile. No stronger, newer, more expensive or cross-provider fallback was introduced.

## Deterministic evidence

- focused policy/admin/provider tests: 74/74 PASS;
- canonical `npm run check`: 341/341 PASS;
- Apps Script syntax/structure validation: 56 `.gs` and 22 HTML files PASS;
- temporal validation: PASS;
- public-surface validation: PASS (30 public, 633 private);
- `python tools/validate_agent_foundation.py`: PASS;
- `git diff --check`: PASS.

The tests cover migration compatibility, hidden/disabled profiles, historical models, inaccessible latest models, no automatic activation, per-model thinking, provider-default omission, raw/stale/cross-provider rejection, access/qualification gates, exactly one provider default, qualification invalidation, safe audit metadata, OpenAI request shaping, disabled Gemini/no-failover and FULL_OUTPUT non-regression.

## Target-runtime qualification

The exact source at implementation commit `200898cc0632c6ddf075409369c8b8548d43c330` was pushed to the existing standalone Apps Script project and read back with exact 79/79-file parity. Immutable version 59 was created and the same existing private Web App deployment was updated once. No new Web App, deployment, Library or provider Store was created.

The existing Script Properties OpenAI key was preserved. Its value was never read, printed, logged or replaced. The empty key input was used for the existing synthetic connection flow, which inserted the missing policy seed row and ran the one mandatory current-default qualification. The initial migration action before that seed existed failed closed without an OpenAI call or provider/source mutation. After the required synthetic qualification, policy migration and the later `ポリシー再確認` action both completed successfully.

Runtime evidence:

- current default: `openai-current-default` / `gpt-5.6-terra` / `provider-default`;
- access and File Search qualification: `AVAILABLE` and `QUALIFIED / File Search`;
- one hidden and disabled synthetic profile remained `UNKNOWN / UNQUALIFIED` and was absent from normal-user choices;
- normal-user choices contained exactly one effective model and one effective thinking profile;
- FULL_OUTPUT hid model/thinking controls and its submit path remained AI-independent;
- exact `DOC-000017` recovery sync: Selected 1 / Indexed 0 / Unchanged 1 / Removed 0 / Failed 0;
- bounded Pitchbook query: grounded synthetic facts and exactly one authoritative `Pitchbook / DOC-000017` source;
- bounded Meeting query: grounded synthetic facts and exactly one authoritative `Meeting / MTG-000005` source;
- final OpenAI state: key configured, Vector Store ready, active;
- `DOC-000017`, `DOC-000018` and `MTG-000005`: exactly one Active authoritative row each on final readback.

No Gemini call, broad Meeting/Pitchbook sync, old 5–25 MiB fixture retry/mutation, confidential-data use, FULL_OUTPUT runtime call or provider fallback occurred.

## Scope and follow-up

CODEX-02 later corrected one qualification-scope limitation in this report: CODEX-01's live action qualified the model/File Search path but did not independently qualify every configured thinking raw value and output ceiling. The accepted CODEX-01 policy/UI/OpenAI evidence remains valid; exact tuple qualification is established by `0025-CODEX-02-thinking-profile-qualification-gate-report.md` and private Web App version 60.

Optional provider model discovery was intentionally deferred. Manual exact model entry, access/qualification gates and no-auto-enable semantics satisfy this dispatch without expanding into provider catalog benchmarking. Work 0021 should consume the effective-policy resolver for its structured filters and modes. Work 0023, Gemini recovery and representative large-file recovery remain separate Works.

## Completion latch

```text
MODEL_POLICY_REGISTRY: PASS
ADMIN_MODEL_CONTROL: PASS
ADMIN_THINKING_CONTROL: PASS
USER_MODEL_SELECTOR: PASS
USER_THINKING_SELECTOR: PASS
SERVER_SIDE_POLICY_ENFORCEMENT: PASS
CURRENT_DEFAULT_MIGRATION: PASS
API_ACCESS_GATE: PASS
PROFILE_QUALIFICATION_GATE: PASS
HISTORICAL_MODEL_SUPPORT: PASS
NO_AUTO_LATEST_SWITCH: PASS
NO_COST_ESCALATION_FALLBACK: PASS
OPENAI_REGRESSION: PASS
FULL_OUTPUT_REGRESSION: PASS
LOGIC_VALIDATION: PASS — focused 74/74; canonical 341/341; temporal, public-surface, agent-foundation and diff hygiene PASS
TARGET_RUNTIME_QUALIFICATION: PASS — existing private Web App version 59; designated synthetic sources only
RUNTIME_DEPLOYMENT_VERSION: 59
GITHUB_CI_ACTUALLY_RAN: NO
READY: YES
BLOCKER: NONE
FINAL_COMMIT: implementation/source 200898cc0632c6ddf075409369c8b8548d43c330; final tracking commit is the completion PR head reported in chat
```

WORK_ID: 0025
DISPATCH_ID: 0025-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
