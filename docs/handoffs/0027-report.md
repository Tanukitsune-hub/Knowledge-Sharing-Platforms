# Work 0027 report

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD

## Final outcome

Work 0027 is accepted and merged. The personal-DEV Gemini File Search baseline is proven end to end on `gemini-3.7-flash / explicit low / 2048 / Interactions + File Search` with a grounded answer, authoritative current citation, shared normal-mapper parity, and confirmed cleanup.

```text
IMPLEMENTATION_COMMIT: 40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7
FINAL_BRANCH_HEAD: 497ecff400624330f1d5041de166f6c6e3485220
MERGE_COMMIT: 9cd5d2984d0d584ed05c447ed09d2ddf0e1e2366
PR: #37 / MERGED
PRIVATE_WEB_APP_VERSION: 73
TERMINAL_OUTCOME: QUALIFIED_DISABLED
LOGIC_VALIDATION: PASS / 448 of 448
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
TEMP_RESOURCE_CLEANUP: PASS
WORK_ACCEPTANCE: MET
BLOCKER: NONE
```

## Accepted repair

The prior citation mismatch was caused by treating content-valued Gemini `source` as provider Document identity. The accepted resolver now:

- treats `source` as content rather than provider identity;
- requires `document_uri` to match the trusted configured/request Store;
- requires exact `source_type`, `source_id`, and `content_hash`;
- resolves those values to exactly one current Active authoritative source with its current Gemini hash;
- independently verifies exactly one current provider document in the Store;
- rejects missing, conflicting, stale, inactive, ambiguous, foreign-Store, filename-only, token-only, singleton-Store, excerpt-hash, and OpenAI-only evidence;
- validates annotations before equivalent-citation deduplication;
- uses the same strict resolver for qualification and normal immediate/POLL completion.

OpenAI and FULL_OUTPUT accepted paths remain unchanged.

## Runtime evidence

The same private Apps Script Web App was updated once from version 72 to 73. Root and Knowledge Search bootstrapped successfully. One temporary Store and one tiny synthetic TXT were indexed and independently read back, one bounded File Search query returned the expected token and real citation, the strict resolver produced exactly one authoritative citation, and cleanup/deletion confirmation passed. Existing Gemini Stores and business sources were not mutated.

Gemini remains `QUALIFIED_DISABLED`: qualified as a personal-DEV candidate, but disabled and hidden from normal users. No automatic model/provider fallback was introduced.

## Non-blocking residuals

- `FIX_SOON`: persist allowlisted qualification evidence when Audit is configured; the successful run did not leave the optional sanitized Audit row.
- `FOLLOW_UP`: representative large-file qualification, migration, company credentials/quota/permissions, rollout, and future-model qualification.
- GitHub Actions did not run for this Work; repository-local canonical checks and target-runtime evidence are the accepted evidence here.

## Completion latch

Acceptance evidence is closed. Reopen only for material contradictory evidence; otherwise use a new Work for later outcomes.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: NONE
STATUS: ACCEPTED
