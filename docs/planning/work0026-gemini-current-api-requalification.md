# Work 0026 — current Gemini Flash / File Search requalification

Current as of: 2026-09-04

Status: TERMINAL / `DISABLED_EXTERNAL_LIMITATION` / ready for ChatGPT final review

## Purpose

Re-evaluate and, where the current Gemini API and configured personal-DEV credential permit, complete the optional Gemini provider path against the already accepted OpenAI/FULL_OUTPUT reference implementation.

This Work exists because the prior Gemini qualification was performed against earlier model/API behavior and ended in provider-long-running or no-citation outcomes. Since then:

- Google released stable `gemini-3.8-flash` on 2026-09-02;
- the current model supports File Search and thinking levels `low`, `medium`, and `high`; `minimal` is not supported;
- the current official File Search examples use the Interactions API, persistent File Search Stores, `file_citation` annotations, and `metadata_filter`;
- the repository still contains fixed Gemini query defaults and an OpenAI-only administrator qualification path.

Official primary references:

- `https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash`
- `https://ai.google.dev/gemini-api/docs/file-search`
- `https://ai.google.dev/api/interactions-api-v1`
- `https://ai.google.dev/gemini-api/docs/deprecations`

## Accepted baseline to preserve

```text
WORK_0020: ACCEPTED — OpenAI provider core / citations / lifecycle / FULL_OUTPUT
WORK_0025: ACCEPTED — administrator model/thinking policy and exact tuple qualification
WORK_0021: ACCEPTED — structured search / five modes / multi-Entity / six formats
WORK_0023: ACCEPTED — deterministic single-file bundle / installer / security gates
MAIN_BASE: 8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f
ACCEPTED_PRIVATE_WEB_APP_VERSION: 66
UNUSED_APPS_SCRIPT_VERSION: 67 / never deploy
GITHUB_CI: absent
```

No accepted OpenAI, FULL_OUTPUT, structured-search, installer, bundle, source-identity, or company-install behavior may regress.

## Prior Gemini evidence

The prior bounded Gemini campaign established:

```text
GEMINI_MODEL_THEN_TESTED: gemini-3.7-flash
INTERACTIONS_BACKGROUND_PATH: provider remained in_progress at the bounded limit; no authoritative citation observed
GENERATE_CONTENT_FILE_SEARCH_PATH: approximately 83 seconds, then safe failure / no authoritative citation
SOURCE_RECONCILIATION: accepted small Meeting/Pitchbook synthetic sources existed
OPENAI/FULL_OUTPUT: remained operational
```

The new Work must not assume the old outcome is still current, but it must not repeat the old 15-dispatch loop either.

## Repository gaps addressed by Work 0026

1. The normal Gemini path now uses current Interactions + File Search and the server-resolved model/thinking/output tuple.
2. The Settings-backed administrator flow can save and qualify a Gemini profile through the same policy gate used by normal-user selection.
3. Gemini credential and Store readiness are presented through the redacted private-admin surface.
4. Gemini remains hidden unless provider readiness and an exact tuple both qualify.
5. CODEX-02 obtained a current bounded provider result: the 3.8 exact tuple did not produce the required grounded answer and authoritative citation, so the provider remains disabled.

## Product outcome

A normal administrator must be able to:

```text
save a Gemini API key securely
-> verify the configured File Search Store path
-> register/enable only approved Gemini model profiles
-> qualify an exact model + thinking + output + File Search tuple
-> expose only qualified Gemini choices to users
-> keep unqualified or unavailable choices hidden and fail-closed
```

A normal user selecting Gemini must receive either:

- a grounded answer with normalized authoritative source citations; or
- a safe, provider-specific unavailable/pending/error state with no OpenAI fallback.

## Candidate model policy

Live qualification candidate order is intentionally bounded:

1. `gemini-3.8-flash` + `low` thinking + bounded output;
2. only if the configured key does not have access to 3.8 or the model rejects the exact request, one fallback candidate: `gemini-3.7-flash` + `low`.

Rules:

- use exact pinned model IDs, never `*-latest`;
- do not use `minimal` for 3.8 or 3.7;
- do not benchmark 3.6, 3.5, Pro, Lite, preview, Flex, or Priority variants;
- no automatic runtime model fallback: any fallback is an explicit administrator-qualified profile;
- `medium` and `high` may be registered as administrator-controlled choices but remain hidden until individually qualified;
- historical models remain manageable through Work 0025 policy rather than being deleted.

## Transport and UX decision rule

Use one bounded evidence sequence:

1. test the current official Interactions + File Search request shape first;
2. preserve responsive START/POLL behavior: START performs one bounded create call, POLL performs one bounded read, and no server sleep loop blocks the user request;
3. if Interactions remains provider-nonterminal at the hard bound, run exactly one GenerateContent + File Search control using the same model/store/filter solely to identify whether the blocker is the background interaction lifecycle or File Search/model execution generally;
4. select a production transport only when it returns an authoritative normalized citation within the qualification bound;
5. if neither current transport qualifies, leave Gemini disabled and record the exact external/provider limitation instead of cycling through models, stores, chunk sizes, retries, or deployments.

Target experience for the small synthetic corpus:

```text
START server call: <= 15 seconds preferred
individual POLL call: <= 10 seconds preferred
terminal grounded result: <= 120 seconds qualification bound
provider observation hard stop: <= 180 seconds
```

These are product qualification bounds, not claims about all production corpus sizes.

## Bounded runtime data

Use only the accepted small synthetic authoritative sources unless readback proves their IDs changed:

```text
Pitchbook: DOC-000017
Meeting: MTG-000005
```

First inventory the current Gemini Store/documents read-only. Reconcile or re-upload only those exact sources if missing/stale. Do not broad-sync, rebuild all documents, touch `DOC-000018`, or use the six-format/large fixtures.

Required runtime proof when the provider permits:

- one grounded Pitchbook query with at least one normalized authoritative citation;
- one grounded Meeting query with at least one normalized authoritative citation;
- one exact metadata-filter positive/negative check;
- no duplicate active Gemini document for either source;
- normal-user Gemini route visible only after provider + exact tuple qualification;
- no OpenAI call and no cross-provider fallback.

## Completion semantics

Work 0026 has two acceptable terminal outcomes:

### `QUALIFIED`

Current Gemini provider works through the product path, required citations pass, and the exact tested model/thinking tuple becomes selectable.

### `DISABLED_EXTERNAL_LIMITATION`

The repository is updated to the current safe API/model-policy contract and deterministic tests pass, but the bounded direct/runtime provider campaign still shows an account/model-access, provider queue, terminal-response, citation, quota, or external API limitation. Gemini remains disabled and hidden. The exact layer and evidence are recorded. OpenAI and FULL_OUTPUT remain the production-capable paths.

`DISABLED_EXTERNAL_LIMITATION` is not permission to claim Gemini works, but it is a valid end to this re-evaluation Work and prevents another indefinite repair loop.

A product-code security, source-integrity, cross-provider fallback, or accepted-path regression remains a true blocker.

## Scope exclusions

Do not broaden Work 0026 into:

- company Shared Drive/domain credential qualification;
- large-file qualification;
- historical-material migration;
- Gemini Store architecture redesign or sharding;
- chunking/embedding benchmark campaigns;
- exhaustive model/thinking/latency comparisons;
- OpenAI requalification;
- FULL_OUTPUT runtime reruns;
- GitHub CI implementation;
- installer/bundle UX redesign.

Any source change must regenerate and validate the deterministic bundle so Work 0023 remains true.

## Delivery

Implementation/runtime dispatches:

`0026-CODEX-01 — current Gemini Flash / File Search requalification`

`0026-CODEX-02 — repaired runtime deployment and bounded Gemini qualification`

## CODEX-01 returned evidence

The current Gemini implementation, policy integration, generated bundle and deterministic tests pass. Version 68 was created and updated onto the same private Web App within the one-version/one-update budget, but the modular runtime displayed server include directives literally. No Gemini or OpenAI API call occurred.

The branch repair preserves the embedded-resource string template in bundle mode and restores Apps Script file-template evaluation in modular mode. It passes the focused regression and all canonical checks but remains undeployed because CODEX-01 had no remaining version or deployment authorization.

```text
RUNTIME_DEPLOYMENT_VERSION: 68 / blocked
REPAIR_COMMIT: 681768824f298eff24439b2ee69c9ce159af1e0e
LOGIC_VALIDATION: PASS / 410 of 410
GEMINI_PROVIDER_QUALIFICATION: NOT_RUN
NEXT_ACTION_AT_CODEX_01_RETURN: completed by CODEX-02
```

## CODEX-02 terminal evidence

CODEX-02 delivered and read back the exact repaired source once, created version `69`, and updated the same private Web App once. Both normal and cache-bypassed root/Knowledge Search loads passed with zero literal include directives and zero blocking console errors.

The configured Gemini key and Store were accessible. Exact synchronization of only `DOC-000017` and `MTG-000005` returned `selected 1 / indexed 1 / failed 0` for each and established one active exact-metadata document per source. The administrator then registered the exact primary profile and ran the synchronous Interactions + File Search qualification once.

```text
PRIMARY_TUPLE: gemini-3.8-flash / explicit low / max output 2048
DIRECT_INTERACTIONS_CONTROL: FAIL / safe final result after approximately 79 seconds
EXPLICIT_MODEL_ACCESS_OR_UNSUPPORTED: NO
GEMINI_3_7_FALLBACK: NOT_USED
PRODUCT_START_POLL_AND_MEETING_QUERY: NOT_RUN / exact tuple stop gate
GEMINI_FINAL_STATE: DISABLED_EXTERNAL_LIMITATION / hidden from normal users
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
FINAL_INTEGRITY: PASS
NEXT_ACTION: ChatGPT final review of PR #36; do not restart the provider loop without materially new evidence
```

This is an acceptable Work 0026 terminal outcome, not a claim that Gemini File Search is qualified.
