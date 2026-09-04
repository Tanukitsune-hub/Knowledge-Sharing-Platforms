# Work 0026 — CODEX-02 repaired runtime deployment and Gemini qualification

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
MODE: `DEPLOY TESTED RUNTIME REPAIR -> SMOKE -> RESUME BOUNDED GEMINI QUALIFICATION`

## 1. Primary outcome

Deploy the already-implemented modular HTML template repair once, prove the normal private Web App shell works again, then resume the still-unrun bounded Gemini provider qualification from CODEX-01.

This remains Work 0026 because the deliverable has not changed. CODEX-01 returned only because its one-version/one-deployment budget was consumed before the runtime regression could be repaired.

Do not reopen accepted Work 0020/0021/0023 functionality or redesign the Gemini architecture unless new target-runtime evidence proves a material defect.

## 2. Authoritative starting state

Repository:

`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch:

`agent/0026-gemini-current-api-requalification`

PR:

`#36 / Draft / Open / unmerged`

Returned CODEX-01 head:

`7656fca566626438bb2ef1ecb77a0867d18818f7`

The code repair that must be present is:

`681768824f298eff24439b2ee69c9ce159af1e0e — fix: preserve modular HTML template evaluation`

CODEX-01 runtime state:

```text
PRIVATE_WEB_APP_CURRENT_VERSION: 68
VERSION_67: unused / never deploy
VERSION_68_SOURCE: e8885da8b85f286dcfbb3bf8c5b538852cef71a8
VERSION_68_STATUS: BLOCKED / modular include directives rendered literally
REPAIR_DEPLOYED: NO
GEMINI_API_CALLED: NO
OPENAI_API_CALLED: NO
LOGIC_VALIDATION: PASS / 410 of 410
BUNDLE_BYTES: 971044
BUNDLE_SHA256: c234c849ad86571140622ca5a4913dbf04122d9dc81642a4710a3ebabf3f5c75
```

Read first:

- nearest `AGENTS.md` files;
- `docs/handoffs/0026-dispatches.md`;
- `docs/handoffs/0026-CODEX-01-current-gemini-flash-file-search-requalification-report.md`;
- `docs/handoffs/0026-CODEX-01-current-gemini-flash-file-search-requalification-instruction.md`;
- `docs/planning/work0026-gemini-current-api-requalification.md`;
- `docs/operations/runtime-artifact-locator.md`.

GitHub is source of truth. Do not trust the pasted return over the current branch/report.

## 3. Independent pre-deployment verification

Before any runtime mutation:

1. verify local branch/remote/PR head alignment and clean working tree;
2. verify `src/01_DistributionResources.gs` has the repaired split behavior:
   - bundle mode -> `HtmlService.createTemplate(kspReadHtmlResource_(...))`;
   - modular mode -> `HtmlService.createTemplateFromFile(...)`;
3. verify `src/90_WebApp.gs` still routes `doGet()` through `kspCreateHtmlTemplate_()` and `include_()` through `kspReadHtmlResource_()`;
4. verify the focused modular-template regression test passes;
5. rerun `npm run check:bundle`, `npm run check`, agent-foundation validation and `git diff --check`;
6. regenerate `dist/` only if source differs from the recorded generated artifact; two clean builds must remain byte-identical;
7. verify no source change after CODEX-01 repair accidentally reintroduced fixed Gemini model/thinking/output values into the normal request path.

If these deterministic gates fail, fix only the directly related Work 0026 defect and do not create an Apps Script version until all gates pass.

## 4. Runtime mutation budget

This Dispatch authorizes exactly:

```text
APPS_SCRIPT_SOURCE_DELIVERY: max 1
NEW_IMMUTABLE_VERSION: max 1 / expected version 69
SAME_PRIVATE_WEB_APP_UPDATE: max 1 / expected 68 -> 69
DEPLOY_VERSION_67: prohibited
CREATE_VERSION_70_OR_HIGHER: prohibited
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

Use the same positively identified private Web App target. Do not create another Web App or Apps Script project.

The source delivered to Apps Script must include the tested repair and all current Work 0026 implementation code. Perform exact source readback before versioning.

## 5. Mandatory shell smoke immediately after version 69 update

Before any Gemini call, prove the modular Web App is healthy.

Required checks on both normal and cache-bypassed reload where practical:

```text
ROOT_PAGE_HTTP/RENDER: PASS
KNOWLEDGE_PAGE_HTTP/RENDER: PASS
LITERAL_<?!=_DIRECTIVE_PRESENT: NO
LITERAL_INCLUDE_(...)_DIRECTIVE_PRESENT: NO
EXPECTED_INCLUDED_STYLES_PRESENT: YES
EXPECTED_INCLUDED_CLIENT_BOOTSTRAP_PRESENT: YES
KNOWLEDGE_SEARCH_CONTROLS_RENDERED: YES
BLOCKING_BROWSER_CONSOLE_ERROR: 0
```

Also call at least one accepted non-AI read-only facade needed by the shell/bootstrap and confirm the Web App can execute server-side code normally.

Do not call OpenAI merely to prove the shell.

### Stop rule

If any include directive remains literal, required included scripts/styles are missing, or the root/Knowledge Search page cannot complete its normal bootstrap:

- stop immediately;
- do not call Gemini or OpenAI;
- do not create version 70;
- do not perform another Web App update;
- return the exact new blocker.

## 6. Current Gemini official baseline

Reconfirm current official Google docs at execution time. As of the ChatGPT pre-review on 2026-09-04:

```text
PRIMARY_MODEL: gemini-3.8-flash
STAGE: stable
FILE_SEARCH: supported
THINKING_LEVELS: low / medium / high
MINIMAL: unsupported for 3.8
INTERACTIONS_ENDPOINT: POST /v1beta/interactions
GENERATION_CONFIG: thinking_level / max_output_tokens
FILE_SEARCH_TOOL: file_search_store_names
FILTER: metadata_filter
CITATION: file_citation
```

The May-2026 Interactions migration opt-in header is historical; do not restore a stale `Api-Revision` header unless the current official reference explicitly requires it at execution time.

Primary references:

- `https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash`
- `https://ai.google.dev/gemini-api/docs/file-search`
- `https://ai.google.dev/api/interactions-api-v1`
- `https://ai.google.dev/gemini-api/docs/interactions-breaking-changes-may-2026`

## 7. Resume bounded Gemini campaign only after shell PASS

### 7.1 Read-only provider inventory

Record safe state only:

- Gemini API key presence boolean; never read/print/log the value;
- configured Store accessibility;
- current Gemini enabled/readiness settings;
- current model-policy Gemini profiles and qualification states;
- current Store document count without exposing resource names;
- exact document presence/duplicate count for `DOC-000017` and `MTG-000005`;
- source content-hash/metadata match without source body output.

If the key is absent/invalid or requires a user-owned credential action, stop with one exact `BALL: USER / ACTION_REQUIRED` instruction. Do not copy credentials into local files, GitHub, Sheets, Audit, or chat.

### 7.2 Store/source reconciliation

Preferred path: reuse the existing accessible Gemini Store.

Only if no valid configured Store exists may this Dispatch create at most one normal-product Gemini File Search Store, consistent with the Work 0026 plan. Do not create a second replacement Store after that.

Reconcile only:

```text
Pitchbook: DOC-000017
Meeting: MTG-000005
```

Rules:

- exact source sync only;
- no broad sync;
- no `DOC-000018`;
- no six-format fixtures;
- no large-file fixtures;
- no embedding-model/chunking changes;
- exactly one current Gemini document per accepted source;
- duplicate or ambiguous provider identity is a product/source-integrity blocker, not an external limitation.

## 8. Exact model/thinking qualification

Candidate order remains bounded:

```text
1. gemini-3.8-flash / explicit low / max_output_tokens 2048
2. gemini-3.7-flash / explicit low / 2048 ONLY after explicit model-access or model-unsupported evidence for 3.8
```

Do not use a moving `latest` alias. Do not use `minimal`. Do not try Pro/Lite/preview/Flex/Priority variants.

Use the normal administrator model-policy flow and the same validated request builder used by Knowledge Search.

The exact tuple qualification must prove:

- exact pinned model ID;
- explicit provider-facing `low` thinking;
- output ceiling 2048;
- current Store identity binding;
- current request-profile version binding;
- File Search use;
- grounded answer from `DOC-000017`;
- exactly one normalized authoritative Pitchbook citation.

The existing implementation may use its synchronous Interactions qualification call as the decisive direct Interactions control; do not add a redundant provider call just to satisfy two labels.

### Failure classification

3.8 -> 3.7 fallback is allowed only for explicit model-access/model-unsupported evidence.

For a non-model-access Interactions failure:

- first determine whether it is an application request/citation/state defect or a provider/external condition;
- if it is a small application defect, fix it in source and deterministic tests, but do not create another runtime version in this Dispatch; return a product blocker for the next authorized Dispatch;
- if current deterministic request shape is correct and evidence points to provider queue/quota/API behavior, one GenerateContent + File Search diagnostic control is allowed solely to isolate Interactions-specific versus general File Search limitation.

Do not start another model/transport/store experiment loop.

## 9. Normal-product START/POLL qualification

Only after exact tuple qualification PASS and Gemini is explicitly enabled by the administrator:

1. run one normal-product Pitchbook query scoped to `DOC-000017`;
2. run one normal-product Meeting query scoped to `MTG-000005`;
3. require at least one normalized authoritative citation for each;
4. verify one exact metadata-filter positive check and one negative check;
5. verify normal-user Gemini route appears only after provider readiness + exact tuple qualification + administrator enablement;
6. verify unqualified/stale tuple requests remain server-rejected;
7. verify no OpenAI fallback and no automatic Gemini model fallback;
8. verify pending lifecycle is responsive and resumable:
   - START creates at most one provider job;
   - duplicate START reuses current job;
   - each POLL performs at most one provider read;
   - POLL never creates a new job;
   - raw provider IDs never reach the client.

Product qualification bounds for the small synthetic corpus:

```text
START_SERVER_CALL: <= 15 seconds preferred
INDIVIDUAL_POLL: <= 10 seconds preferred
TERMINAL_GROUNDED_RESULT: <= 120 seconds target
HARD_PROVIDER_OBSERVATION_STOP: 180 seconds per job
```

A provider job still pending at the hard stop is not a product timeout. Leave Gemini disabled/hidden if required and classify `DISABLED_EXTERNAL_LIMITATION` only after the current external layer is established.

## 10. Accepted-path and integrity gates

Before return:

- OpenAI API called: NO;
- accepted OpenAI model policy and source/index state unchanged;
- FULL_OUTPUT remains API-independent by deterministic regression evidence; do not rerun it live;
- Work 0021 authoritative source rows/files unchanged except exact Gemini provider-state fields required by authorized reconciliation;
- no provider raw resource IDs in GitHub/docs/UI/Audit;
- no key values in output;
- no broad sync;
- no duplicate Gemini document for the two accepted sources;
- generated bundle remains deterministic and source/bundle parity passes;
- installer defaults still keep both AI providers disabled on fresh install;
- PR #36 remains Draft/Open/unmerged;
- GitHub CI absence remains non-blocking if local/runtime evidence passes.

## 11. Terminal outcomes

### A. `QUALIFIED`

Use only when:

```text
WEB_APP_SHELL: PASS
EXACT_GEMINI_TUPLE: PASS
PITCHBOOK_GROUNDED_CITATION: PASS
MEETING_GROUNDED_CITATION: PASS
METADATA_FILTER: PASS
NORMAL_USER_ROUTE: PASS
NO_FALLBACK: PASS
FINAL_INTEGRITY: PASS
```

### B. `DISABLED_EXTERNAL_LIMITATION`

Use only when:

- Web App shell repair is proven;
- deterministic product/API contracts pass;
- no application/source-integrity defect explains the failure;
- bounded provider evidence identifies the current external/provider/account/queue/quota/citation limitation;
- Gemini remains disabled and hidden;
- OpenAI/FULL_OUTPUT accepted behavior remains preserved.

### C. Product blocker

Return a blocker for any new application runtime/security/source-integrity defect. Do not label it as an external Gemini limitation.

Do not create `0026-CODEX-03` yourself.

## 12. GitHub delivery

Create/update:

- `docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-report.md`;
- `docs/handoffs/0026-dispatches.md`;
- `docs/handoffs/0026-report.md`;
- `docs/planning/work0026-gemini-current-api-requalification.md` only if the current evidence changes the plan;
- `docs/operations/runtime-artifact-locator.md`;
- current Gemini decision docs only if provider evidence changes an accepted decision;
- deterministic `dist/` artifacts if source changes;
- PR #36 body.

Keep PR #36 Draft/Open/unmerged. Commit and push all scoped changes. Do not merge.

## 13. Completion latch

```text
MODULAR_TEMPLATE_REPAIR_PRESENT: PASS | FAIL
PREDEPLOY_LOGIC_VALIDATION: PASS | FAIL
SOURCE_DELIVERY_READBACK: PASS | FAIL | NOT_RUN
RUNTIME_DEPLOYMENT_VERSION: 69 | unchanged | other_without_new_version
WEB_APP_ROOT_RENDER: PASS | FAIL | NOT_RUN
WEB_APP_KNOWLEDGE_RENDER: PASS | FAIL | NOT_RUN
LITERAL_INCLUDE_DIRECTIVES: 0 | <number> | NOT_RUN
BLOCKING_BROWSER_CONSOLE_ERRORS: 0 | <number> | NOT_RUN
GEMINI_KEY_PRESENT: YES | NO | INVALID
GEMINI_STORE_RECONCILIATION: PASS | FAIL | NOT_RUN
PRIMARY_MODEL_CANDIDATE: gemini-3.8-flash
FALLBACK_MODEL_CANDIDATE: gemini-3.7-flash | NOT_USED
SELECTED_GEMINI_MODEL: <exact ID | NONE>
SELECTED_THINKING_LEVEL: low | NONE
SELECTED_OUTPUT_CEILING: 2048 | NONE
GEMINI_EXACT_TUPLE_QUALIFICATION: PASS | FAIL | NOT_RUN
DIRECT_INTERACTIONS_CONTROL: PASS | FAIL | NOT_RUN
DIRECT_GENERATE_CONTENT_CONTROL: PASS | FAIL | NOT_RUN
PRODUCT_START_POLL_LIFECYCLE: PASS | FAIL | NOT_RUN
GEMINI_PITCHBOOK_QUERY_CITATION: PASS | FAIL | NOT_RUN
GEMINI_MEETING_QUERY_CITATION: PASS | FAIL | NOT_RUN
GEMINI_METADATA_FILTER: PASS | FAIL | NOT_RUN
GEMINI_DOCUMENT_DUPLICATES: 0 | <number> | NOT_RUN
GEMINI_OPTIONAL_PROVIDER_STATUS: QUALIFIED | DISABLED_EXTERNAL_LIMITATION | BLOCKED_BEFORE_PROVIDER_QUALIFICATION | FAIL
NORMAL_USER_GEMINI_ROUTE_VISIBLE: YES | NO
NO_CROSS_PROVIDER_FALLBACK: PASS | FAIL
OPENAI_ACCEPTED_PATH_PRESERVED: PASS | FAIL
FULL_OUTPUT_API_INDEPENDENCE: PASS | FAIL
BUNDLE_BUILD_AND_PARITY: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
FINAL_PROVIDER_AND_SOURCE_INTEGRITY: PASS | FAIL | NOT_RUN
WORK_0021_RUNTIME_MUTATED_OUTSIDE_AUTHORIZATION: NO
OPENAI_API_CALLED: NO
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_REVIEW: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
PR: #36 / <state>
```

## 14. Mandatory return identity

Final response must begin and end with:

```text
WORK_ID: 0026
DISPATCH_ID: 0026-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```

If exactly one unavoidable user credential/action is required while this Dispatch is still running, retain the same Dispatch ID and use:

```text
WORK_ID: 0026
DISPATCH_ID: 0026-CODEX-02
BALL: USER
STATUS: ACTION_REQUIRED
```
