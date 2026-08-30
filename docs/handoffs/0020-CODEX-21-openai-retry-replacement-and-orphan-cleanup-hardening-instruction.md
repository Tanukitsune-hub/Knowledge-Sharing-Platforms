# Work 0020 — CODEX-21 OpenAI retry, replacement, and orphan-cleanup hardening

WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-21
MODE: REVIEW_FIX -> QUALIFICATION
BALL: CODEX
STATUS: READY

## Primary outcome

Resolve the three substantive unresolved review findings on PR #26, preserve the already-qualified Work 0020 OpenAI behavior, requalify only the affected bounded paths, and return PR #26 clean and ready for ChatGPT's final merge.

This is the same Work 0020 outcome. Do not allocate a new Work ID.

## Why CODEX-21 is required

After CODEX-20 returned merge-ready, final ChatGPT review found three unresolved inline threads on the exact PR head `4176c98344bcbe495b1f062001e2e26e0860479b`:

1. P1 — preserved stale Indexed entries can carry retryable error metadata that normal eligibility ignores unless another legacy revision signal remains present;
2. P2 — replacement currently uploads, deletes prior documents, and only then persists replacement state, so a deletion/state-write failure can leave state pointing to a deleted document or an uploaded replacement unrecorded;
3. P2 — after `/files` upload succeeds, vector-store attachment or indexing failure has no guaranteed cleanup path and can accumulate orphaned provider File objects.

Review comment IDs:

- `3890736051` — retry eligibility;
- `3890736053` — recoverable replacement ordering;
- `3890736055` — post-upload cleanup.

ChatGPT has replied to all three threads and accepted them as pre-merge blockers. Do not resolve a thread until the fix, tests, and pushed evidence exist.

## Accepted evidence that remains latched

Do not reopen these conclusions unless the fix creates contradictory evidence:

```text
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_EXACT_SOURCE_SYNC: PASS
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS — DOC-000017
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS — MTG-000005
OPENAI_METADATA_FILTER: PASS
OPENAI_LIFECYCLE: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
MAIN_RECONCILIATION: PASS
CODEX_20_LOGIC_VALIDATION: PASS — 325/325
```

The deployed target before CODEX-21 is the existing standalone private Web App version 57, sourced from CODEX-19 commit `d61dc166c835d65e8bbabd17dc2894b4aef69cd8`. CODEX-20 changed GitHub documents/governance only and made no deployment.

## Exact execution baseline

At handoff preparation:

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`;
- branch: `agent/0020-ai-provider-core`;
- reviewed PR head before handoff commits: `4176c98344bcbe495b1f062001e2e26e0860479b`;
- base/main already integrated: `0d9238293b1f5612956e206d22e4e75cfc767694`;
- PR: #26, Open, ready-for-review, unmerged;
- GitHub Actions/status checks: absent;
- unresolved review threads: 3.

Fetch and verify current remote refs before editing. If `origin/main` has advanced, integrate it normally after the scoped fix and rerun all checks. Never rebase or force-push.

## Required repair A — retry eligibility for a preserved usable index

Current behavior can store:

```text
status = Indexed
last known-good document identity retained
lastError = retryable + nextAttemptAt
```

but normal retry timing is evaluated only for `Failed` entries after the legacy Pending branch.

Required contract:

- an Active provider entry that remains `Indexed` only to preserve the last known-good searchable document must still be eligible for scheduled retry when its recorded retryable error is due;
- it must not be eligible before `nextAttemptAt`;
- permanent, non-retryable, or exhausted errors must not loop;
- a genuinely newer authoritative source revision must remain eligible even if an earlier error was permanent;
- a current clean Indexed entry with no retry metadata must remain ineligible;
- successful retry/cleanup clears the retry error;
- exact administrator sync remains available but is not the only recovery path.

Add focused regression tests for due, not-due, permanent/exhausted, clean-current, and newer-revision cases.

## Required repair B — recoverable replacement transaction

Current unsafe order in `src/164_AiProviderCore.gs` is effectively:

```text
upload/index replacement
-> delete previous provider documents
-> persist replacement provider state
```

Required contract:

1. Complete upload/index of the replacement before any destructive prior-document cleanup.
2. Persist the new authoritative provider state before deleting stale prior documents.
3. If persisting the new state fails:
   - keep prior documents and prior state intact;
   - clean up the newly uploaded replacement;
   - do not leave an unrecorded replacement;
   - preserve the primary state-write error while recording any cleanup failure safely.
4. If stale-document cleanup fails after new state persistence:
   - never revert state to the prior/deleted document;
   - keep the new document as the current Indexed source;
   - record a retryable cleanup error and partial item result;
   - make normal scheduled retry eligible through repair A;
   - on retry, reconcile the one state-owned current document and remove stale documents without re-uploading current content.
5. Cleanup/retry must be idempotent.
6. Multiple current-identity matches, a missing state-owned current document, or unknown/unowned identity remains fail closed.
7. Do not expose provider IDs in UI, Audit, report, or safe error messages.

Add failure-injection tests for at least:

- upload/index fails before state transition: prior state/document preserved;
- replacement state write fails after upload: uploaded replacement cleanup attempted, prior state/document retained;
- first stale-document deletion fails after state commit: new state retained and retry metadata recorded;
- next due retry removes stale documents without another upload;
- successful replacement clears error and leaves exactly one current identity;
- multiple current identities fail closed.

## Required repair C — cleanup after OpenAI upload succeeds

In `src/163_OpenAiRestClient.gs`, once `/files` upload returns an ID, any later failure during vector-store attachment or indexing wait must not silently orphan that File object.

Required contract:

- if attachment fails, attempt deletion of the uploaded File object;
- if attachment succeeds but indexing/wait fails, attempt vector-store attachment cleanup and uploaded File deletion;
- attempt File deletion even if attachment cleanup itself fails;
- preserve the original attach/index failure as the primary error;
- record cleanup failure using only a stable safe code/diagnostic, without credentials, provider payloads, or IDs;
- normal successful upload behavior remains unchanged;
- already-absent cleanup should be safely idempotent where the provider response permits;
- normal document deletion should attempt both derived attachment and File cleanup rather than skipping the second solely because the first failed.

Add focused tests proving cleanup calls and primary-error preservation for:

- attach failure;
- indexing timeout/failure after attach;
- attachment cleanup failure while File cleanup still runs;
- File cleanup failure is surfaced safely;
- success path performs no cleanup.

## Deterministic validation

Run the relevant focused tests, then all canonical checks:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken existing assertions, delete accepted tests, or change product limits merely to pass.

## Target-runtime qualification

Only after deterministic PASS:

1. deliver/read back the exact tested source once to the existing standalone Apps Script project;
2. create at most one immutable Apps Script version, expected version 58;
3. update the same existing private Web App deployment once;
4. preserve the stored OpenAI key without reading, printing, logging, or replacing it;
5. do not intentionally induce provider failure in the live environment;
6. run exact OpenAI sync for `DOC-000017` only and require current/unchanged or one safe Indexed result, zero duplicate current identity, and no broad source selection;
7. run one bounded Pitchbook query for `DOC-000017` and one bounded Meeting query for `MTG-000005`, each with one authoritative normalized source;
8. perform read-only final integrity checks for designated rows, provider readiness, current document uniqueness, deployment identity/version, and no unintended mutation of `DOC-000018` or old large fixtures.

If normal exact sync or query regresses, stop and report the specific blocker. Do not broaden scope or retry large files.

## GitHub review closure

After fixes, validation, target-runtime qualification, and push:

- reply to each of the three review threads with the exact fixing commit and test evidence;
- resolve each thread only when its exact concern is closed;
- recheck there are no unresolved, non-outdated review threads;
- recheck latest `main`, PR mergeability, branch/remote/PR-head equality, and clean working tree;
- mark PR ready for review only at the end if it was converted to draft;
- do not merge PR #26; ChatGPT owns final merge.

## Safety boundary

- designated synthetic `DOC-000017` and `MTG-000005` only for native qualification;
- no broad Meeting/Pitchbook sync;
- no old 5–25 MiB fixture retry/mutation;
- no confidential data;
- no Gemini call or provider fallback;
- no FULL_OUTPUT rerun;
- no new Vector Store, Web App, Library, public/debug endpoint, or credential;
- no rebase, force-push, reset, history rewrite, or PR merge.

## Delivery

Create:

`docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-report.md`

Update:

- `docs/handoffs/0020-dispatches.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-report.md`;
- `docs/operations/runtime-artifact-locator.md`;
- PR #26 body and review threads.

Commit and push all scoped changes.

## Completion latch

```text
REVIEW_P1_INDEXED_RETRY_ELIGIBILITY: PASS | FAIL
REVIEW_P2_REPLACEMENT_TRANSACTION: PASS | FAIL
REVIEW_P2_UPLOAD_ORPHAN_CLEANUP: PASS | FAIL
FOCUSED_VALIDATION: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL
RUNTIME_DEPLOYMENT_VERSION: <version | unchanged>
UNRESOLVED_REVIEW_THREADS: 0 | <count>
PR_MERGEABLE: YES | NO
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
```

## Mandatory final chat response

The final response must begin and end with:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-21
BALL: CHATGPT
STATUS: RETURNED
```
