# Work 0020 — CODEX-11 Gemini document reconciliation and final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-11`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION -> BUILD / QUALIFICATION`
ROUTE: `C`

## Primary outcome

Repair the observed Gemini File Search post-upload document reconciliation defect without creating duplicate provider documents, then complete the remaining bounded Gemini Meeting/Pitchbook qualification and final integrity gates for Work 0020.

Preserve all accepted CODEX-03 through CODEX-10 evidence unless materially contradicted.

## Exact baseline

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`;
- branch: `agent/0020-ai-provider-core`;
- CODEX-10 implementation head before ChatGPT handoff updates: `e8e022baf7d608b81f8a3bb164636781b46a0011`;
- PR `#26`: Draft / Open / unmerged;
- deployed private Web App: version `49`;
- CODEX-10 affected exactly two eligible synthetic Meetings because the intended batch-size `1` guard was not in effect and authoritative readback remained numeric `10`;
- both rows ended `FAILED` with safe code `AI_DOCUMENT_READBACK_FAILED`, `attempt=1`, `retryable=false`, `permanent=true`, and no accepted local Gemini document identity;
- no Pitchbook state changed; no query/lifecycle gate ran; OpenAI remained disabled/uncalled; FULL_OUTPUT remained accepted and was not rerun.

Use the final branch head supplied with the ChatGPT dispatch as the exact execution ref.

## Closed facts

1. The authenticated private Web App administrator execution path works.
2. The source-type selector works and its blank/default behavior is unchanged.
3. The direct Blob resumable upload path reached Gemini provider execution in CODEX-10.
4. The failure occurred only after provider operation execution, at document readback/reconciliation.
5. Current transport test success fixture assumes a completed upload Operation contains `response.fileSearchDocument`.
6. Current production code attempts `kspExtractDocumentFromOperation_()` after the Operation is done and converts failure to permanent `AI_DOCUMENT_READBACK_FAILED`.
7. Google’s current File Search examples poll the upload Operation only until `done`; they do not require an embedded FileSearchDocument result. The current API reference defines Operation `response` as a generic object and notes that some services may not provide a result. File Search Documents have separate list/get APIs.
8. Current sync already lists provider documents by source before upload, but a failed provider state is permanently excluded and the failure patch clears local `contentHash`, so the two CODEX-10 rows cannot currently reconcile themselves even if Gemini created the documents.

Official reference at dispatch preparation time:
- `https://ai.google.dev/gemini-api/docs/file-search`
- `https://ai.google.dev/api/file-search/file-search-stores`

Revalidate only if the current official contract materially changed before implementation.

## One active hypothesis

> The CODEX-10 uploads reached successful Gemini File Search ingestion, but the application incorrectly requires the completed upload Operation to embed a FileSearchDocument resource. When that generic Operation response does not contain a document-shaped object, the application records a permanent `AI_DOCUMENT_READBACK_FAILED` even though the created document may already be discoverable through the File Search Documents list/get API. The subsequent failure-state rules then prevent safe self-reconciliation.

Do not investigate a second provider hypothesis in this dispatch. If this hypothesis is not reproduced deterministically, or if the first live reconciliation finds zero/ambiguous matching provider documents in a way that contradicts it, stop and return for Strategy Reset.

## Expected pre-fix failing evidence

Before changing production code, add a deterministic regression using the existing Gemini live-fake harness:

1. upload session/finalize returns a valid Operation;
2. polling returns `done=true` with no embedded FileSearchDocument resource, for example a generic/empty successful response;
3. File Search Documents list/get returns exactly one ACTIVE document whose `source_type`, `source_id`, and `content_hash` equal the uploaded canonical source;
4. current baseline must fail with `AI_DOCUMENT_READBACK_FAILED`.

Also add a provider-core regression showing the CODEX-10 state shape:

- source is Active;
- provider entry is `FAILED` with lastError code `AI_DOCUMENT_READBACK_FAILED`, permanent=true, no local document name/content hash;
- provider listing already contains exactly one ACTIVE document matching the current canonical source metadata/hash;
- baseline does not reconcile it to `Indexed`.

If either pre-fix failure does not reproduce, do not patch production code.

## One minimal repair

Limit production changes to the smallest coherent reconciliation path, expected in:

- `src/161_GeminiRestClient.gs`;
- `src/164_AiProviderCore.gs`;
- tests directly covering those paths.

Use `src/160_AiEnvironment.gs` only if a narrow source-type-aware document finder signature is genuinely required. Do not refactor provider architecture.

Repair contract:

1. After a Gemini upload Operation is done without provider error, keep the existing embedded-document path when a valid document resource is actually present.
2. If the Operation does not provide a valid embedded document, perform bounded File Search Documents reconciliation in the configured Store using exact canonical identity:
   - `source_type`;
   - `source_id`;
   - `content_hash`.
3. Require exactly one matching ACTIVE document. Never accept a metadata/hash mismatch. Ambiguous multiple exact matches fail closed rather than selecting arbitrarily.
4. Bounded list/readback polling may cover provider visibility delay; no unbounded loop.
5. A local `FAILED / AI_DOCUMENT_READBACK_FAILED` source must be eligible for reconciliation-only processing. When exactly one current matching provider document already exists, restore local provider state to `Indexed`, clear the safe error, and perform no upload/delete.
6. For that reconciliation-only failed state, zero or ambiguous matching documents must stop safely without a new upload or destructive provider mutation. This prevents CODEX-10’s two uncertain uploads from being duplicated or destroyed before their provider state is known.
7. Normal new Pending/NotIndexed sources may continue through the existing upload path, now using the repaired post-operation reconciliation.
8. Preserve safe redaction: no raw provider response, Store ID, provider document ID, source body, private URL, or credential in browser/Audit/report/GitHub.
9. Preserve provider-neutral behavior and OpenAI behavior. No cross-provider failover.

Do not weaken validation simply to accept the runtime response.

## Deterministic acceptance before delivery

At minimum prove:

- completed Operation with embedded valid document still PASS;
- completed Operation without embedded document + exactly one matching listed ACTIVE document PASS;
- zero matching document after bounded reconciliation fails safely;
- multiple exact matches fail closed;
- wrong source type/source ID/content hash fails closed;
- CODEX-10-style permanent readback-failed row + one exact existing document reconciles to Indexed without upload/delete;
- CODEX-10-style row + zero/ambiguous matches performs no upload/delete;
- normal Pending new source still uploads exactly once;
- sourceType default/Meeting/Pitchbook behavior unchanged;
- administrator authorization and safe summary unchanged;
- OpenAI disabled/no-failover behavior unchanged;
- public facade unchanged unless an already-approved existing facade is merely exercised.

Run focused tests first, then:

```text
npm run check
node scripts/validate-temporal-contract.cjs
node scripts/validate-public-surface.cjs
git diff --check
```

Do not claim GitHub-hosted CI unless a real Actions/status check exists.

## Delivery budget

If and only if the hypothesis reproduces and deterministic validation passes:

- one source synchronization/readback;
- one immutable Apps Script version;
- one in-place update of the same existing private Web App;
- no new Web App deployment, Store, Library, public/debug endpoint, permission widening, or recurring trigger.

## Live qualification order

### Gate 0 — hard safety precondition

Before any provider-mutating sync:

- verify exact deployed source/version/Store boundary;
- set `AI_SYNC_BATCH_SIZE` to numeric `1`;
- read it back as numeric `1` immediately before each mutating sync;
- if authoritative readback is not numeric `1`, STOP. Do not click sync.

This precondition failed operationally in CODEX-10 and is mandatory now.

### Gate A0 — repair the two uncertain CODEX-10 Meetings first

Use `sourceType=Meeting`, batch `1`.

The first two Meeting passes are reconciliation-only for the two CODEX-10 readback-failed rows:

- list/read provider state;
- require exactly one ACTIVE current document matching exact source metadata/hash;
- restore Backend provider state to `Indexed`;
- prove no new upload and no provider delete occurred;
- prove no duplicate exact documents.

Process at most one affected Meeting per pass. If either has zero or ambiguous exact matches, STOP before any new upload and return with evidence. Do not reset or manufacture failure state to force progress.

Use one successfully reconciled Meeting for the grounded Meeting query and authoritative citation gate.

### Gate B — one bounded Pitchbook

Only after Meeting reconciliation/query PASS:

- choose one small synthetic/non-confidential TXT Pitchbook;
- read back batch numeric `1`;
- `sourceType=Pitchbook`;
- exactly one upload/index operation;
- require ACTIVE document + Backend Indexed + no duplicate;
- one grounded query with authoritative citation.

The repaired Operation/document reconciliation path must be exercised if the provider returns a generic Operation result.

### Gate C — remaining lifecycle/integrity

Only after Gate B PASS:

- exact metadata filter;
- update/reindex without duplicate;
- Inactive removal/exclusion;
- Reactivate restoration;
- exact delete/rebuild;
- restore synthetic source lifecycle;
- restore `AI_SYNC_BATCH_SIZE` to numeric `10` and read back numeric `10`;
- `AI_SYNC_ENABLED=false`;
- OpenAI disabled/uncalled;
- no recurring triggers;
- final Store/source/Backend/Audit/deployment/Library integrity PASS.

Do not rerun FULL_OUTPUT absent material contradiction.

## Stop rules

Stop immediately and return if any occurs:

- pre-fix regression does not reproduce;
- repair requires a second provider hypothesis;
- focused/canonical validation fails after the one repair attempt;
- batch-size readback is not numeric `1` before a live mutating sync;
- either CODEX-10 Meeting lacks exactly one current matching provider document during reconciliation-only recovery;
- a duplicate/ambiguous provider document set is observed;
- a new provider/runtime failure appears after the repaired path begins;
- evidence would require confidential content, credential exposure, public/debug endpoint, second Store/Web App, Library mutation, or broad deployment/permission changes.

No provider retry loop. No unrestricted broad sync. No OpenAI live call. No new hypothesis in the same dispatch.

## Required report/delivery

Create:

`docs/handoffs/0020-CODEX-11-gemini-document-reconciliation-and-final-qualification-report.md`

Update:

- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR `#26`.

Commit and push scoped changes. Report:

```text
LOGIC_VALIDATION
GEMINI_DOCUMENT_RECONCILIATION
GEMINI_RUNTIME
FULL_OUTPUT_RUNTIME
FINAL_INTEGRITY
READY
BLOCKER
FINAL_COMMIT
GITHUB_CI_ACTUALLY_RAN
```

Keep PR `#26` Draft / Open / unmerged for ChatGPT final review unless every Work 0020 completion gate passes and ChatGPT later accepts it.
