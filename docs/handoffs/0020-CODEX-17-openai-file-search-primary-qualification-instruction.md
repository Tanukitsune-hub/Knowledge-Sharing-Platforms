# Work 0020 CODEX-17 — OpenAI File Search primary qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-17`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
MODE: `INVESTIGATION -> BUILD / QUALIFICATION`
ROUTE: `C`

## Supersession

`0020-CODEX-16` was prepared to continue Gemini direct-provider diagnosis but was not executed. The user explicitly chose to try OpenAI API after Google AI Studio also showed repeated errors. CODEX-16 is therefore `SUPERSEDED / NOT EXECUTED`.

Keep Work ID `0020`: the outcome remains a usable provider-neutral Knowledge Search core. This dispatch changes the active provider completion strategy, so it receives the next Dispatch ID.

## Primary outcome

Qualify OpenAI Responses API + File Search as the primary usable Knowledge Search provider in personal DEV, using the existing provider-neutral architecture, then complete the remaining source lifecycle and final-integrity gates if the provider path passes.

Gemini evidence remains preserved but Gemini is no longer a prerequisite for Work 0020 completion if OpenAI satisfies the same end-to-end user outcome. No automatic provider failover is permitted.

Authoritative decision:
`docs/decisions/openai-zero-friction-onboarding-and-project-switch.md`

## Current official OpenAI contract

Use current OpenAI Platform behavior as of 2026-08-29:

- Responses API is the standard response primitive;
- built-in `file_search` uses project-scoped Vector Stores;
- Vector Store files support attributes that can be filtered in File Search;
- current GPT-5.6 models support File Search;
- default Work model is pinned `gpt-5.6-terra` as the cost-balanced retrieval model;
- Responses requests should use `store=false` in this product;
- server-side `OPENAI_API_KEY` / Script Property only; never expose the key to the browser.

## Accepted evidence — closed

Preserve all accepted prior Work evidence:

- schema `6`; exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS; do not rerun;
- provider-neutral routing/no automatic fallback contracts;
- Gemini upload/reconciliation PASS;
- one prior grounded Meeting query with three citations;
- CODEX-14 responsive START/POLL/dedupe/reload-resume UX evidence;
- Gemini provider-path failures remain documented but are not to be retried in this dispatch;
- current PR `#26` remains Draft / Open / unmerged;
- current pushed source contains an unqualified Gemini Generate Content default from CODEX-15, so no Work merge is allowed until a later accepted implementation selects a safe user route/default.

Existing OpenAI source already includes:

- Responses API request client;
- File upload;
- Vector Store create/get/list;
- Vector Store file attach/index/readback;
- source attributes;
- File Search query with filters;
- delete/cleanup;
- provider-neutral sync hooks;
- admin enable/disable skeleton.

Do not rebuild these from scratch. Review and repair only gaps required by the active acceptance contract.

## User prerequisite

An OpenAI project API key must be available securely to the local Codex process as:

```text
OPENAI_API_KEY
```

The key must never be pasted into ChatGPT, Codex prompt text, GitHub, reports, screenshots, repository files, or logs.

If the prerequisite is not available, STOP with:

```text
BALL: USER
STATUS: ACTION_REQUIRED
```

Do not print or partially reveal the key when checking its presence.

## Fastest safe decisive action

### Gate A — direct provider control outside Apps Script

Before changing application source or deployment, use the official OpenAI SDK/client from the local environment with `OPENAI_API_KEY`.

Use only temporary synthetic content.

Run exactly:

1. base Responses API text-only call with `gpt-5.6-terra`;
2. create one temporary Vector Store;
3. upload one tiny synthetic TXT file;
4. attach it with exact safe attributes including at least `source_type`, `source_id`, and `content_hash`;
5. wait for indexing to `completed`;
6. one Responses API File Search query with an exact attribute filter;
7. require grounded answer plus at least one file citation/reference that can be normalized to the source identity;
8. delete the temporary Vector Store file/attachment and uploaded File; delete the temporary Store if supported/owned by the test;
9. verify cleanup.

Record only safe status/latency/token/enum evidence. Never record the key, raw provider IDs in GitHub, synthetic content body, or raw provider payload.

### Gate A stop rule

If base model or synthetic File Search fails, STOP. Do not implement the Web App path. Return the provider/project/key failure class and cheapest next action.

## Gate B — application safety/onboarding repair

Only after direct provider File Search PASS:

Implement the accepted zero-friction activation contract in the existing private admin Web App:

```text
APIキーを保存して接続確認
-> administrator-authorized server mutation
-> store key only in Script Properties
-> isolated synthetic self-test
-> no Meeting/Pitchbook body read
-> READY_FOR_SYNC only after PASS

資料を同期して利用開始
-> explicit bounded provider-neutral OpenAI sync
```

Current `ENABLE_OPENAI` behavior must not immediately sync real sources merely because a key exists. Separate credential/self-test readiness from real-source activation.

Required security:

- password-style input;
- browser clears key immediately after submit;
- server never returns key;
- no key in Audit/Sheets/logs/export;
- invalid key fails before real-source sync;
- existing inaccessible Vector Store under a different project is treated as `RECONNECT_REQUIRED`; do not claim deletion if inaccessible.

## Gate C — OpenAI provider qualification

After deterministic tests and one bounded delivery/version/same-Web-App update:

1. run the synthetic connection self-test through the normal private Web App;
2. require Store create/reuse, upload, exact filter, answer, citation, and cleanup PASS;
3. do not enable real-source sync automatically;
4. explicitly start bounded sync with `AI_SYNC_BATCH_SIZE=1` read back numerically before each provider-mutating batch;
5. use only synthetic/non-confidential DEV Meeting and Pitchbook sources for this Work qualification;
6. require one Meeting and one Pitchbook to reach OpenAI Indexed state;
7. require one grounded Meeting query with authoritative citation;
8. require one grounded Pitchbook query with authoritative citation;
9. require practical query latency; record actual latency separately from Apps Script overhead;
10. OpenAI is the only provider called in these gates. Gemini remains uncalled.

Default model:

```text
gpt-5.6-terra
```

Use a low-latency retrieval profile. Do not silently switch to Sol or another more expensive tier.

## Gate D — lifecycle/final integrity

Only after grounded Meeting and Pitchbook queries pass:

- exact metadata/attribute filter PASS;
- update -> reindex without duplicate PASS;
- Inactive -> removal/exclusion PASS;
- Reactivate -> restoration PASS;
- exact delete/rebuild PASS;
- disable/re-enable reversibility PASS;
- restore intended synthetic source state;
- final five-sheet/schema/provider/Audit/settings/trigger/deployment integrity PASS;
- `AI_SYNC_BATCH_SIZE=10` restored;
- no recurring triggers;
- no Gemini call/fallback;
- no FULL_OUTPUT rerun.

## Required deterministic validation

At minimum test:

- OpenAI direct response normalization;
- Vector Store create/reuse and inaccessible-store replacement logic;
- file attributes and exact filter conversion;
- upload/index timeout/failure safety;
- File Search response/citation normalization;
- synthetic connection test reads no Meeting/Pitchbook body;
- credential write authorization/redaction;
- invalid key fails before source sync;
- storing a key alone does not set `OPENAI_ENABLED=true`;
- READY_FOR_SYNC vs ACTIVE states;
- bounded sync uses sourceType and batch safeguards;
- no OpenAI->Gemini or Gemini->OpenAI fallback;
- OpenAI disable/re-enable is reversible;
- public facade remains stable unless an already-approved private admin mutation contract requires a narrow change;
- focused tests PASS;
- `npm run check` PASS;
- temporal validation PASS;
- public-surface validation PASS;
- `git diff --check` PASS.

## Delivery budget

Only after direct provider controls and deterministic gates PASS:

- one source synchronization/readback;
- at most one immutable Apps Script version;
- update the same existing owner-only private Web App in place once;
- one OpenAI Vector Store maximum for the DEV application path;
- no second Web App/Library/public debug endpoint;
- no real confidential data;
- no current-main integration during the bounded provider qualification.

## Gemini disposition

Do not delete Gemini code or resources in CODEX-17.

Gemini remains disabled/not user-ready. The current unqualified `QUERY_TRANSPORT=GENERATE_CONTENT` must not be allowed to become the merged/default user-ready Gemini route. If necessary for final route safety, restore Gemini to disabled/non-operational state without further live Gemini calls.

## Stop rules

Stop immediately if:

- OPENAI_API_KEY prerequisite is unavailable;
- direct base model or synthetic File Search control fails;
- provider requires a materially different architecture than the existing Responses API + Vector Store design;
- credential handling cannot satisfy the private admin/security contract;
- one validated Web App delivery produces a materially new provider/runtime failure;
- a live query requires confidential data;
- a second Vector Store/Web App/Library/public debug endpoint would be needed;
- automatic provider failover would be required.

Do not open a second hypothesis inside this dispatch.

## Required report

Create:
`docs/handoffs/0020-CODEX-17-openai-file-search-primary-qualification-report.md`

Update:
- `docs/handoffs/0020-report.md`
- `docs/handoffs/0020-instruction.md`
- `docs/handoffs/0020-dispatches.md`
- PR `#26`

Commit and push scoped changes.

Report at minimum:

```text
OPENAI_DIRECT_BASE_MODEL
OPENAI_DIRECT_FILE_SEARCH
OPENAI_SYNTHETIC_SELF_TEST
OPENAI_MEETING_INDEX_QUERY
OPENAI_PITCHBOOK_INDEX_QUERY
OPENAI_METADATA_FILTER
OPENAI_LIFECYCLE
OPENAI_QUERY_LATENCY_MS
OPENAI_RUNTIME
GEMINI_RUNTIME
FULL_OUTPUT_RUNTIME
FINAL_INTEGRITY
READY
BLOCKER
FINAL_COMMIT
GITHUB_CI_ACTUALLY_RAN
```

## Final chat contract

The final Codex response must begin before any other text with:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-17
BALL: CHATGPT
STATUS: RETURNED
```

Repeat the same four lines at the very end. If the only blocker is the missing secret prerequisite, use `BALL: USER / STATUS: ACTION_REQUIRED` instead.
