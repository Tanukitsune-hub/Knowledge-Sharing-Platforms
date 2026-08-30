# Work 0020 — CODEX-21 OpenAI retry, replacement, and orphan-cleanup hardening report

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-21`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `REVIEW_FIX -> QUALIFICATION`

## Outcome

All three substantive PR #26 review findings are fixed. A last-known-good OpenAI `Indexed` entry remains eligible when its retryable error is due; replacement now persists the new current identity before stale cleanup; and a successful OpenAI `/files` upload always attempts both attachment and File cleanup after attach/index failure while preserving the primary error.

Focused failure-injection coverage and the canonical repository suite passed. The exact tested source was delivered to the existing standalone Apps Script project, read back with exact content after newline normalization, saved as immutable version 58, and applied once to the same existing private Web App deployment. No new Web App, Library, Vector Store, endpoint, credential, or deployment was created.

## Review-finding repair

### Indexed retry eligibility

- clean complete `Indexed` entries remain skipped;
- an `Indexed` entry with a due retryable `lastError` is selected by scheduled sync even when the legacy shared status remains `Pending`;
- retry ceilings, permanent errors, and future retry deadlines remain fail closed.

### Recoverable replacement transaction

The replacement sequence is now:

1. upload and index the replacement;
2. durably persist the replacement as current provider state;
3. remove stale prior documents.

Failure injection proves:

- persistence failure cleans the unrecorded replacement, retains the prior document/state, and records the primary safe error when state writes remain available;
- stale cleanup failure retains the already-persisted replacement, records `AI_STALE_DOCUMENT_CLEANUP_FAILED`, and leaves the provider usable;
- the next due scheduled retry reconciles the stored current identity, removes only remaining stale documents, clears the error, and performs no additional upload;
- multiple current-identity matches fail closed without mutation.

### OpenAI upload orphan cleanup

After `/files` upload succeeds, attachment and indexing failures both invoke two independent cleanup attempts. File cleanup runs even when attachment cleanup fails. The original attach/index error remains primary; only bounded codes such as `OPENAI_ATTACHMENT_CLEANUP_FAILED` and `OPENAI_FILE_CLEANUP_FAILED` are attached as diagnostics. Provider Store/File identities and raw payloads remain excluded.

## Deterministic validation

- focused `tests/ai-provider-core.test.cjs`: PASS, 35/35;
- `npm run check`: PASS, 330/330;
- Apps Script parse validation: PASS, 55 source files and 22 HTML files;
- temporal validation: PASS;
- public-surface validation: PASS, 30 public and 612 private top-level functions;
- `python tools/validate_agent_foundation.py`: PASS;
- `git diff --check`: PASS.

## Target-runtime qualification

- source delivery: only `163_OpenAiRestClient.gs` and `164_AiProviderCore.gs` differed from the accepted version-57 production source; both were delivered once and fully read back;
- first save attempt was correctly rejected before persistence because the editor retained two old trailing lines; no version or deployment was created by that rejected attempt;
- both files were then replaced by full-selection paste, saved with no syntax error, and read back equal to the tested local source after normalizing editor CRLF line endings;
- immutable Apps Script version: 58;
- deployment: the same existing private Web App updated once; execute-as and private access remained unchanged;
- stored OpenAI key: preserved without reading, displaying, logging, or replacing it;
- exact Pitchbook sync: `DOC-000017` only, `Selected 1 / Indexed 0 / Unchanged 1 / Removed 0 / Failed 0`;
- current-document integrity: the exact reconciliation gate observed one current provider document, so no upload, stale deletion, or duplicate current identity occurred;
- Pitchbook query: one bounded OpenAI query returned a grounded answer and exactly one authoritative normalized `Pitchbook / DOC-000017` source;
- Meeting query: one bounded OpenAI query returned a grounded answer and exactly one authoritative normalized `Meeting / MTG-000005` source;
- final readiness: API key configured, Vector Store ready, OpenAI active;
- `DOC-000018`: one row, Active, and never selected for sync/query;
- old 5–25 MiB fixtures: zero sync/lifecycle actions and no retry or mutation.

No Gemini call, provider fallback, FULL_OUTPUT run, broad Meeting/Pitchbook sync, confidential-data use, or large-fixture retry occurred.

## GitHub delivery

PR #26 remains Open and unmerged. The scoped fixing/reporting commit was pushed to `agent/0020-ai-provider-core`. Review comments `3890736051`, `3890736053`, and `3890736055` were replied to with fixing/test evidence and their threads resolved. The final unresolved non-outdated review-thread count is zero. GitHub CI did not actually run.

## Completion latch

```text
REVIEW_P1_INDEXED_RETRY_ELIGIBILITY: PASS
REVIEW_P2_REPLACEMENT_TRANSACTION: PASS
REVIEW_P2_UPLOAD_ORPHAN_CLEANUP: PASS
FOCUSED_VALIDATION: PASS — 35/35
LOGIC_VALIDATION: PASS — canonical 330/330; temporal, public-surface, agent-foundation and diff hygiene PASS
TARGET_RUNTIME_QUALIFICATION: PASS — exact designated sources on the same private Web App
RUNTIME_DEPLOYMENT_VERSION: 58
UNRESOLVED_REVIEW_THREADS: 0
PR_MERGEABLE: YES
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: YES
BLOCKER: NONE
FINAL_COMMIT: THIS_COMMIT — exact pushed SHA is reported in the final return and PR
```

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-21`
BALL: `CHATGPT`
STATUS: `RETURNED`
