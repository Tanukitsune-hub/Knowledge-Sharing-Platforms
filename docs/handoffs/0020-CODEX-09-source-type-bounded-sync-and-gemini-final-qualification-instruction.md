# Work 0020 — CODEX-09 source-type bounded sync and Gemini final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-09`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`
Exact execution ref: supplied by ChatGPT after control-document commits are complete.

## Primary outcome

Complete Work 0020 by adding the smallest durable administrator-side source-type constraint to the existing provider-neutral sync, then use that constraint to live-qualify one Gemini Meeting and one Gemini Pitchbook without changing normal production sync ordering.

Do not redesign the queue, do not introduce a test-only public wrapper, and do not prioritize Meetings globally.

## Accepted evidence — closed absent material contradiction

### CODEX-03
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime PASS;
- Preview / Copy / Google Docs / PDF canonical package parity PASS;
- disabled-provider safe errors/no-failover PASS;
- final integrity PASS.

### CODEX-04
- one isolated Gemini File Search Store;
- future zero-code OpenAI administrator activation path implemented and deterministically validated;
- OpenAI remains deliberately disabled/uncalled in personal DEV.

### CODEX-05 through CODEX-07
- safe transport-stage errors and bounded transient retry hardening;
- caller-supplied `Content-Length` removed;
- direct Blob finalize implementation is logic validated;
- production `getRequest()` hard gate removed;
- Apps Script versions `45`–`47` and same private Web App updates were bounded and read back;
- no accepted Gemini Meeting Document yet.

### CODEX-08
- focused Gemini/provider tests `39/39 PASS`;
- repository `280/280 PASS`;
- temporal/public-surface/diff checks PASS; public facade `30`;
- no Apps Script source delivery, deployment, or Gemini call occurred;
- Gate 0 showed the real selector with batch size `1` selected a Pitchbook, not a Meeting;
- two eligible Pending Meetings nevertheless exist;
- batch size restored to `10`.

Do not rerun FULL_OUTPUT and do not live-call OpenAI.

## Strategy Reset

### Closed conclusions

1. The normal provider-neutral selector is behaving as designed: Meeting and Pitchbook items share one queue, Inactive cleanup comes first, then oldest `Updated_At/Created_At`, then stable source key.
2. Older eligible Pitchbooks can therefore legitimately precede eligible Meetings when `syncBatchSize=1`.
3. Changing normal production ordering to `Meeting first` merely to qualify a Meeting would be a product regression and could starve Pitchbooks.
4. CODEX-08 therefore failed because the qualification harness used the unrestricted production queue, not because the selector is defective.
5. The existing administrator mutation path already calls `kspRunProviderNeutralAiSync_(environment, { force: true })` and is the correct durable boundary for a bounded manual sync.
6. The provider-neutral sync function already accepts an `options` object. Extend that existing contract; do not add a new public/debug entry point.
7. The direct Blob transport implementation remains the active live path; CODEX-08 did not exercise it.

### Active hypothesis — exactly one

> Adding an optional validated `sourceType` constraint to the existing administrator `SYNC` operation, applied before queue sorting/slicing, will allow one eligible Meeting to be selected without changing default production ordering. The already logic-validated direct Blob path can then be exercised exactly once for Meeting and, after success, exactly once for Pitchbook.

## Fastest Safe Decisive Action

Implement an optional source-type filter on the existing sync contract:

```text
normal UI/admin sync with no sourceType
  -> unchanged existing all-source queue/order

admin sync with sourceType=Meeting
  -> only eligible Meeting items participate, then existing sort/batch applies

admin sync with sourceType=Pitchbook
  -> only eligible Pitchbook items participate, then existing sort/batch applies
```

No stable source ID needs to be exposed to the browser. No new public function is required.

## Required implementation

### 1. Selector contract

Extend `kspSelectProviderAiWorkItems_` with an optional selection constraint, for example:

```javascript
kspSelectProviderAiWorkItems_(meetingRows, pitchbookRows, nowIso, settings, provider, selection)
```

`selection.sourceType` may be blank, `Meeting`, or `Pitchbook` using the existing canonical source-type constants.

Rules:
- blank -> exact current behavior;
- Meeting -> only Meeting candidates enter eligibility/sort/slice;
- Pitchbook -> only Pitchbook candidates enter eligibility/sort/slice;
- filter before `items.sort()` and before `slice(0, syncBatchSize)`;
- do not change existing eligibility rules;
- do not change Inactive/oldest-first/stable-key ordering inside the selected type;
- do not add Meeting-first global priority.

### 2. Provider-neutral sync options

Extend `kspRunProviderNeutralAiSync_(environment, options)` to normalize and validate optional `options.sourceType` and pass it into the selector.

Requirements:
- absent/blank sourceType preserves exact behavior;
- invalid sourceType fails closed with a safe internal code such as `AI_SYNC_SOURCE_TYPE_INVALID`;
- sourceType must not select a different provider;
- `force` semantics stay unchanged;
- safe report may include only the normalized source type and counts; do not expose internal stable IDs in the browser/admin response.

### 3. Existing administrator `SYNC` action

Extend the existing `kspMutateAiProviderSettings_` `SYNC` action to accept optional `input.sourceType` and invoke:

```javascript
kspRunProviderNeutralAiSync_(environment, {
  force: true,
  sourceType: validatedSourceType
})
```

Do not add another public function or debug endpoint.

Security:
- existing administrator authorization remains mandatory server-side;
- normal users cannot invoke mutation merely by forging UI input;
- no API key, Store ID, provider document ID, source ID, raw provider payload, or source body returned to the browser;
- `kspAiProviderAdminSafeSyncSummary_` remains the external response boundary.

UI:
- no new normal-user UI is required for this Work;
- existing 「今すぐ同期」 without sourceType continues to sync the normal combined queue;
- this sourceType option may remain a server/admin maintenance capability unless a minimal existing admin UI control is genuinely simpler and does not expand scope.

### 4. Preserve direct Blob transport

Do not reopen CODEX-08 direct Blob design absent contradictory evidence.

Live Gemini finalization path must retain:
- one exact Apps Script Blob built from canonical bytes/MIME;
- no production `UrlFetchApp.getRequest()` prerequisite;
- no caller-supplied `Content-Length`;
- `X-Goog-Upload-Offset: 0`;
- `X-Goog-Upload-Command: upload, finalize`;
- provider-issued upload URL treated as opaque; `escaping:false` if already required by the tested implementation;
- safe local-vs-provider error classification;
- no Byte[] live fallback.

## Deterministic validation before live calls

Add/adjust tests proving at minimum:

1. default selector order is unchanged when sourceType is absent;
2. `sourceType=Meeting` filters before sorting/slicing and returns one eligible Meeting with batch size 1 even when older eligible Pitchbooks exist;
3. `sourceType=Pitchbook` returns one eligible Pitchbook under the same state;
4. invalid sourceType fails closed;
5. permanent-failed Meeting remains excluded even when Meeting filter is requested;
6. Pending/NotIndexed Meeting remains eligible;
7. administrator SYNC forwards normalized sourceType;
8. non-admin mutation remains rejected;
9. safe admin summary does not expose source IDs/provider document IDs/Store IDs;
10. no sourceType means ordinary 「今すぐ同期」 behavior remains unchanged;
11. direct Blob transport tests remain green, including no `getRequest()` live prerequisite and one finalize fetch on success;
12. OpenAI activation/disable tests remain green;
13. no Gemini-to-OpenAI failover;
14. public facade count remains expected (`30` unless an unrelated accepted source already changed it; do not add a function merely for this change).

Run:
- focused selector/admin/provider tests;
- focused Gemini transport tests;
- `npm run check`;
- temporal validator;
- public-surface validator;
- `git diff --check`;
- final relevant-diff review for secrets/private IDs/unrelated changes.

No live provider call until deterministic PASS.

## Corrected source delivery

Only if source changed and deterministic validation passes:
- verify branch ancestry against the exact authorized ref;
- sync exact tested Apps Script source once;
- exact source readback;
- create exactly one immutable Apps Script version;
- update the same positively identified private Web App in place;
- preserve Web App type, deploying-user execution, `Only myself`, `/exec`, deployment count, and Library separation;
- no new Store or deployment.

## Target-runtime qualification

### Gate 0A — Meeting bounded selection

Snapshot current redacted provider states and Settings.

Temporarily set `AI_SYNC_BATCH_SIZE=1` using the accepted guarded mechanism. Preserve original value/type and restore at the end or on failure.

Use the existing administrator SYNC mutation with:

```text
sourceType = Meeting
```

Before allowing upload/finalize, prove through run-local instrumentation/safe internal evidence that:
- normalized sourceType is Meeting;
- selected count is exactly 1;
- selected source type is Meeting;
- selected source is currently eligible under real provider logic;
- no Pitchbook is processed in this bounded Meeting operation.

Do not expose the stable source ID in GitHub/report/chat.

If Meeting selection is not exactly 1, STOP.

### Gate A — one Meeting indexing

For that exact selected Meeting, execute exactly one real Blob final-upload path.

PASS requires:
- final `UrlFetchApp.fetch()` actually invoked in this dispatch;
- provider HTTP success and successful operation completion;
- one ACTIVE Gemini File Search Document;
- exact canonical `source_type=Meeting`, stable `source_id`, and `content_hash` metadata verified internally;
- Backend Gemini provider state becomes `Indexed` with one document identity/indexed timestamp;
- no duplicate active Gemini document for the source.

If Gate A fails locally, by provider HTTP, operation, or document readback: STOP with safe stage/status. Do not continue.

### Gate B — Meeting grounded query

Only after Gate A PASS, submit one Meeting-filtered question through the normal Web App.

PASS requires:
- grounded answer;
- citation maps via stable source identity to the authoritative Meeting/Drive link;
- one application operation -> one final Audit outcome;
- no provider failover.

### Gate 0C / Gate C — one Pitchbook

Only after Meeting Gate B PASS:

Run the same existing administrator SYNC mutation with:

```text
sourceType = Pitchbook
```

with batch size still bounded to 1.

Prove exactly one eligible Pitchbook selected and no Meeting processed.

Then require:
- one ACTIVE Pitchbook File Search Document;
- exact canonical Pitchbook source metadata;
- Backend Gemini state Indexed;
- one Pitchbook-filtered grounded query;
- authoritative Pitchbook citation/Drive link;
- no duplicate active document.

### Gate D — lifecycle

Using only the already-bounded synthetic Meeting/Pitchbook sources, prove:
- exact metadata filter;
- update -> reindex without duplicate;
- Inactive removal/exclusion;
- Reactivate restoration;
- exact delete/rebuild;
- one active Gemini document per source.

Use source-type-bounded admin sync where it reduces accidental unrelated work. Do not mutate unrelated eligible queue items merely to reach the test source.

### Gate E — final integrity

Prove:
- exactly five Backend sheets/schema `6`;
- authoritative Meeting/Pitchbook content and business metadata intact except the explicitly restored lifecycle test transitions;
- provider-derived states accurate;
- `AI_SYNC_ENABLED=false`;
- `AI_SYNC_BATCH_SIZE` restored exactly to original value/type;
- `OPENAI_ENABLED=false`, OpenAI uncalled;
- FULL_OUTPUT accepted evidence unchanged and not rerun;
- triggers `0`;
- Audit has only bounded safe metadata, no questions/answers/chunks/source bodies/raw provider payloads/credentials/Store IDs/upload URLs;
- no new Gemini Store, Web App deployment, Library, permission, or confidential-data mutation.

## Attempt limits and stop rules

- one corrected Apps Script source sync/deployment maximum;
- one Meeting bounded admin sync/finalize attempt before Meeting query;
- one Meeting query only after Meeting indexing PASS;
- one Pitchbook bounded admin sync/finalize attempt only after Meeting query PASS;
- one Pitchbook query only after Pitchbook indexing PASS;
- no unrestricted broad sync for qualification;
- no source-order mutation to force selection;
- no setting of Pitchbooks to fake failures merely to reach a Meeting;
- no production Meeting-first queue change;
- no OpenAI live call;
- no FULL_OUTPUT rerun absent contradiction;
- stop immediately on first new Gate-A provider/runtime failure.

## Delivery

Create:
`docs/handoffs/0020-CODEX-09-source-type-bounded-sync-and-gemini-final-qualification-report.md`

Update:
- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR `#26` body.

Commit and push all scoped changes. Keep PR #26 Draft / Open / unmerged for ChatGPT final review.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```
