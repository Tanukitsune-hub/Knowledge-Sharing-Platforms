# Work 0021 — CODEX-06 runtime-version reconciliation and final FULL_OUTPUT gate

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-06`
BALL: `CODEX`
STATUS: `READY`

## Why this Dispatch exists

`0021-CODEX-04` returned after a stale/concurrent run created Apps Script versions 66 and 67 but did not update the existing private Web App. Its scoped parser change exists only in local commit `516a323d4ee00b3134e79719303ddf81d52d5b4b`; that push was rejected because the remote branch had already advanced and switched to CODEX-05.

`0021-CODEX-05` is therefore superseded before execution because its contract assumed version 66 had not yet been created. Do not execute CODEX-05.

This CODEX-06 is the only active execution request.

## Current authoritative state

GitHub remote/PR is source of truth for repository state. Runtime evidence from the returned CODEX-04 PR comment is accepted only as runtime evidence:

```text
PRIVATE_WEB_APP_DEPLOYED_VERSION: 65
APPS_SCRIPT_VERSION_66: CREATED / NOT DEPLOYED
APPS_SCRIPT_VERSION_67: CREATED ACCIDENTALLY / NOT DEPLOYED
FULL_OUTPUT_PREVIEW_AFTER_PARSER_FIX: NOT RUN
OPENAI_OR_GEMINI_CALLS_IN_STALE_RESUME: NONE
LOCAL_SCOPED_FIX_COMMIT: 516a323d4ee00b3134e79719303ddf81d52d5b4b
```

Accepted CODEX-04 product evidence remains:

```text
NORMAL_SIX_FORMAT_REGISTRATION: PASS
OPENAI_EXACT_SYNC: PASS — 6/6
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
PRIVATE_WEB_APP_VERSION: 65
```

Verified root cause remains:

```text
FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
```

## Required repository reconciliation

Start from the current remote branch head. Do not rebase or force-push.

1. Inspect local commit `516a323d4ee00b3134e79719303ddf81d52d5b4b` if still available.
2. Extract only the scoped URL-parser and deterministic-test changes from that commit.
3. Do not import stale CODEX-04 tracking/dispatch/report state from that local branch.
4. Apply the smallest equivalent parser/test change on top of the current remote branch.
5. The parser must accept only exact HTTPS Google editor URLs for:
   - `docs.google.com/document/d/<id>`
   - `docs.google.com/presentation/d/<id>`
   - `docs.google.com/spreadsheets/d/<id>`
   while retaining existing valid `drive.google.com` forms and rejecting look-alike hosts, HTTP, malformed paths, missing IDs, unrelated Google paths, and File-ID mismatches.
6. Backend rows must not be rewritten.

Run focused tests, then:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

## Runtime reconciliation — NO NEW VERSION

Creating any additional immutable Apps Script version is prohibited in this Dispatch.

```text
NEW_APPS_SCRIPT_VERSIONS_AUTHORIZED: 0
VERSION_68_OR_LATER: NOT AUTHORIZED
EXISTING_WEB_APP_UPDATES_AUTHORIZED: 1
TARGET_EXISTING_VERSION: 66
```

Before updating the Web App:

1. verify versions 66 and 67 exist;
2. verify the stale CODEX-04 sequence shows exact source readback `80/80` immediately before version 66 creation and no source mutation between version 66 and accidental version 67 creation;
3. reconcile the current remote parser/test source with the exact tested source that produced version 66;
4. deliver/read back the current tested source and require it to match the intended parser fix;
5. if version 66 cannot be trusted as the exact intended parser-fix source, STOP. Do not deploy version 67 and do not create another version without ChatGPT authorization.

If the evidence is coherent, update the same existing private Web App exactly once to existing immutable version 66.

Version 67 is an unused accidental immutable version. Do not deploy it and do not delete it in this Dispatch. Record it as an operational residual only.

## Final qualification

After the Web App is on version 66:

1. run exactly one API-independent FULL_OUTPUT preview covering `DOC-000019` through `DOC-000024`;
2. require all six Pitchbooks to resolve to authoritative reference metadata/links only;
3. require Pitchbook bodies to remain excluded;
4. require Meeting Google Docs text to remain the only FULL_OUTPUT body content;
5. require zero OpenAI/Gemini calls during this Dispatch;
6. perform final read-only source/provider integrity using already accepted CODEX-04 evidence;
7. update the CODEX-06 report, Work tracking, runtime locator, and PR #34.

If the preview passes, return PR #34 ready for ChatGPT final merge review.

If any material gate fails, STOP with the exact blocker. Do not create CODEX-07 automatically.

## Prohibited actions

- no new Apps Script version;
- no deployment to version 67;
- no deletion of version 67;
- no Backend row rewrite;
- no repeat registration;
- no repeat OpenAI sync/query;
- no broad sync/reindex;
- no Gemini call or provider fallback;
- no `DOC-000018` or old large-fixture mutation;
- no chooser repair;
- no Work 0023 implementation;
- no new Web App, Vector Store, endpoint, trigger, or Library;
- no rebase, force-push, history rewrite, or PR merge.

## Completion latch

```text
REPOSITORY_RECONCILIATION: PASS | FAIL
GOOGLE_EDITOR_URL_PARSER: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
SOURCE_READBACK: PASS | FAIL
APPS_SCRIPT_VERSION_66_VERIFIED: PASS | FAIL
APPS_SCRIPT_VERSION_67_STATE: UNUSED_NOT_DEPLOYED
NEW_VERSION_CREATED_IN_CODEX_06: NO
RUNTIME_DEPLOYMENT_VERSION: 66 | 65
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS | FAIL
FINAL_PROVIDER_INTEGRITY: PASS | FAIL
OPENAI_API_CALLED_IN_DISPATCH: NO
GEMINI_API_CALLED: NO
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

The final Codex response must begin and end with:

```text
WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-06
BALL: CHATGPT
STATUS: RETURNED
```
