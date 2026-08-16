# Work 0010 — Residual DEV live qualification resume

WORK_ID: `0010`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Codex executable qualification`, limited to the remaining authenticated runtime work and defects observed from it.

Recommended Codex model: `Luna Max` — architecture and product scope remain feature-frozen, and the remaining work is bounded authenticated execution, evidence capture, and observed-defect repair. Escalate to `Sol High` only when an observed cross-cutting Apps Script / Workspace / Gemini failure requires material architecture-level diagnosis.

Resume ref: `04494fd250d5ce22d70048895be593c54a8bfed8`

Target branch: `agent/0010-dev-live-qualification`

Draft PR: `#8`

Before starting:

1. Read every applicable `AGENTS.md` / `AGENTS.override.md` file and follow the repository-specific policy.
2. Actively and proportionately use subagents. Subagent use is mandatory. Use independent perspectives for Apps Script / Workspace execution, Gemini File Search execution, security / Audit evidence, and final result review. Avoid overlapping write ownership.
3. Never place credentials, API keys, Google resource IDs, private URLs, account identifiers, or source material in GitHub, reports, logs, or chat.

## ChatGPT review of the prior Work 0010 run

GitHub was checked as the source of truth after the Codex report.

Verified state:

- branch: `agent/0010-dev-live-qualification`;
- reviewed Codex head: `04494fd250d5ce22d70048895be593c54a8bfed8`;
- implementation commit: `ec4e79a6f2310b9a1342caceb6f3b00aba703e03`;
- Draft PR: `#8`, open, mergeable, and unmerged;
- report: `docs/handoffs/0010-report.md`;
- no unresolved PR review threads or submitted reviews;
- no GitHub Actions workflow or hosted status checks exist for this commit.

The prior run completed and documented the locally executable scope:

- restored the missing closing brace in `src/83_PitchbookDriveAdapters.gs`;
- repaired the Meeting UI contract test;
- corrected File Search Document listing from `pageSize=100` to the official maximum `20` and added a regression test;
- made credential-bearing Gemini transport helpers Apps Script-private by trailing underscore;
- added Drive / Docs URL allowlisting and status-link sanitization with focused tests;
- reported `npm run check` and `npm run test` at `131/131 PASS`, plus Apps Script / manifest validation and `git diff --check` PASS.

Those test results are local Codex evidence, not GitHub-hosted CI evidence. Do not repeat the full code review or redesign the same contracts unless the current checkout fails a check or live evidence contradicts them.

## Remaining outcome

Complete only the live DEV qualification that was skipped because the previous runtime lacked authenticated Apps Script / Workspace access and a billing-enabled DEV Gemini credential.

Use synthetic or anonymized DEV data only.

The remaining qualified path is:

```text
DEV Apps Script setup and idempotency
  -> Meeting / Pitchbook / maintenance / Master live workflows
  -> separate restricted Audit Spreadsheet
  -> six-format File Search synchronization
  -> five-mode Knowledge Search
  -> authoritative citations / Drive links
  -> trigger / retry / outage isolation
```

## Secure runtime prerequisites

Proceed only when the execution environment has all of the following through an approved secure channel:

- authenticated checkout access to this repository;
- an authenticated standalone DEV Apps Script project / Google account;
- Drive / Sheets / Docs permissions for a disposable DEV resource set;
- a billing-enabled DEV Gemini API credential;
- ability to set Script Properties without printing their values.

The temporary `KSP_GEMINI_API_KEY` Script Property may be used only for DEV qualification. It is not the production credential architecture.

A disposable Shared Drive is preferred. If unavailable, synthetic functional qualification may continue in clearly named DEV-only My Drive folders, but Shared Drive-specific behavior must be marked `SKIPPED / UNOBSERVED` rather than inferred.

## Residual required scope

### 1. Checkout preflight

- Checkout this branch at the exact resume ref or a direct descendant containing only this reviewed handoff.
- Run `npm run check` once and record the exact observed result.
- Do not redo completed local investigation if the check passes.
- If it fails, repair only the demonstrated defect and add focused regression coverage.

### 2. DEV setup and idempotency

- Create or use a standalone DEV Apps Script project tied to a standard Google Cloud project.
- Enable Advanced Drive Service and the underlying Drive API.
- Configure distinct DEV knowledge and restricted-control parent folders securely.
- Set `BOOTSTRAP_CONFIG_JSON` with `aiSyncEnabled: false` without exposing IDs in GitHub or the report.
- Run:

```text
setupKnowledgePlatform()
validateInstallation()
getInstallationStatus()
```

- Rerun setup and prove no duplicate folders, Spreadsheets, sheets, seeds, or triggers.
- Confirm Backend and Audit are separate files and Audit access is restricted to the extent supported by the DEV environment.

### 3. Phase 1 live workflows

Using synthetic data, run the previously skipped matrix:

- minimal and full-field Meeting registration;
- authoritative Google Doc text and deterministic filename;
- retry and Version conflict;
- one-file and mixed multi-file Pitchbook registration;
- failed-file retry with the same Batch ID / Document ID / sequence;
- past-record search, update, Inactive, Reactivate;
- GP quick-add and GP / Option Master mutation flows;
- best-effort Actor behavior;
- Audit metadata and source-content redaction.

Test upload sizes incrementally. If 25MB is not reliable, lower the limit to a simple observed-safe value and update client/server constants, tests, and documentation. Do not add chunking or another runtime.

### 4. Gemini configuration and six-format indexing

- Set the approved DEV answer model and embedding model according to current official support at execution time; the reviewed plan currently uses `gemini-3.6-flash` and `models/gemini-embedding-2`.
- Configure or create one File Search Store and persist its name through the existing Settings path.
- Enable AI sync and rerun setup to create/reuse the 15-minute trigger.
- Run live indexing for:
  - Meeting Google Doc text;
  - PDF;
  - PPTX;
  - XLSX;
  - DOCX;
  - TXT;
  - EML plain body;
  - EML HTML fallback;
  - EML attachment exclusion;
  - malformed or attachment-only EML.

Verify current revision replacement, duplicate cleanup, Inactive removal, Reactivate restoration, and authoritative-source preservation during AI failure.

### 5. Five-mode query and citation matrix

Run through the same Store and filter path:

- `自由質問`;
- `要約`;
- `時系列`;
- `比較`;
- `面談準備` with required GP.

Verify grounded / insufficient-evidence behavior, mode-specific structure, correct source IDs, authoritative Drive links, and metadata-only Audit rows. Confirm answers, chunks, EML normalized bodies, embeddings, and source bodies are absent from Audit.

### 6. Trigger, retry, and outage isolation

- Observe one scheduled 15-minute execution when practical; otherwise verify trigger creation and directly invoke the same handler, recording the limitation.
- Simulate a retryable Gemini failure without exposing credentials.
- Verify bounded retry/backoff, source-claim duplicate prevention, disabled-sync no-op, and authoritative-record isolation.
- Confirm or document the separate Audit-retention trigger path.

## Non-goals

- No new product features.
- No custom Vector DB, model selector, model router, per-user AI ACL, `.msg`, or automatic EML attachment indexing.
- No production deployment.
- No company production data.
- No new upload architecture.
- No repetition of already-passed local analysis merely for additional volume.

## Acceptance criteria

- `npm run check` passes on the resume checkout with exact observed counts recorded.
- DEV setup runs and reruns idempotently.
- Primary Phase 1 workflows operate end to end in DEV.
- Backend and Audit are separate; Audit restriction is observed or explicitly environment-limited.
- A practical upload limit is observed and documented.
- Six accepted source formats have live evidence, or a concrete isolated format-specific blocker is demonstrated.
- Five modes execute through one shared retrieval path.
- Citations open the correct authoritative sources.
- Audit remains metadata-only and content-redacted.
- AI outage cannot corrupt authoritative records.
- No credential, private ID, private URL, or source content is committed or logged.
- `docs/handoffs/0010-report.md` is updated with explicit `PASS / FAIL / SKIPPED / BLOCKER` evidence.
- No implementation blocker remains for the qualified DEV scope.

## Git / PR requirements

- Continue on `agent/0010-dev-live-qualification`.
- Fix only defects observed during the residual live matrix.
- Add focused regression tests for every repair.
- Commit and push all scoped repairs and the updated `docs/handoffs/0010-report.md`.
- Update Draft PR `#8`; keep it Draft until ChatGPT reviews the final live evidence.
- Do not merge.

## Stop / escalation conditions

Report `BLOCKER` only when safe continuation is impossible, including lack of an authenticated DEV Apps Script environment, lack of a billing-enabled DEV Gemini credential, policy preventing every DEV path, a current official API contract invalidating the frozen architecture, or an unrepairable data-integrity/security defect.

Do not stop solely because persistent user identity is unavailable, a Shared Drive is unavailable while My Drive DEV can continue, 25MB must be reduced, hosted CI is absent, or optional polish remains.

## Completion response

Return only:

- Work ID;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line blocker summary when applicable.
