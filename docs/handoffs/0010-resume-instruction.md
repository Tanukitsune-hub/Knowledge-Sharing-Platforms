# Work 0010 — Remaining DEV qualification after partial live PASS

WORK_ID: `0010`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Codex executable qualification`, limited to the remaining live matrices and defects actually observed from them.

Recommended Codex model: `Luna Max` — the architecture and feature scope are frozen; the residual work is bounded Apps Script / Workspace execution, Gemini credential setup, live qualification, and observed-defect repair. Escalate to `Sol High` only if a material cross-cutting runtime diagnosis is required.

Resume ref: `e81248f6d7a378d29d7b116a2c35be9784dc6a65`

Target branch: `agent/0010-dev-live-qualification`

Draft PR: `#8`

Before starting:

1. Read every applicable `AGENTS.md` / `AGENTS.override.md` and follow the repository-specific policy.
2. Actively and proportionately use subagents. Subagent use is mandatory. Use independent perspectives for the remaining Workspace/Pitchbook matrix, Gemini File Search, security/Audit evidence, and final cross-check. Avoid overlapping writes.
3. Never place credentials, API keys, Google resource IDs, private URLs, account identifiers, or source material in GitHub, reports, logs, or chat.
4. Use synthetic or anonymized DEV data only. Do not touch production data or production deployment.

## GitHub-verified current state

ChatGPT reviewed the repository, branch, commit, PR, report, diff, local-test record, reviews, and CI state after the latest Codex report.

Verified:

- branch head: `e81248f6d7a378d29d7b116a2c35be9784dc6a65`;
- Draft PR `#8`: open, Draft, mergeable, and unmerged;
- report: `docs/handoffs/0010-report.md`;
- no submitted PR reviews or unresolved review threads;
- no GitHub Actions workflow runs or commit status checks exist for the head;
- branch is eight commits ahead of `main` and not behind.

The latest run reports and commits the following local evidence:

- Apps Script validator: 43 Apps Script files, 11 HTML files, and manifest PASS;
- `npm run check`: 132/132 PASS;
- `npm run test`: 132/132 PASS;
- `git diff --check`: PASS.

The latest live run completed:

- interactive Google authentication and standalone DEV Apps Script project;
- `setupKnowledgePlatform()`, `validateInstallation()`, and `getInstallationStatus()`;
- idempotent setup rerun;
- separate owner-only Backend and Audit Spreadsheets in the authorized My Drive DEV fallback;
- baseline five-sheet backend and settings checks;
- minimal and full-field Meeting registration;
- authoritative Meeting Google Doc verification;
- Past Meeting search, update, version conflict, Master mutations, Actor observation, and Audit redaction.

One live defect was observed and repaired:

- Sheets Date / Time cells were returned as JavaScript `Date` objects and were incorrectly filtered/rendered;
- `src/100_MaintenanceCore.gs` now normalizes date, time, and timestamp cells;
- `tests/maintenance-core.test.cjs` contains focused regression coverage;
- the repaired Past Meeting filters were re-qualified live.

Do not repeat completed setup or Meeting qualification merely for volume. Re-run only a targeted smoke check when needed to prove the environment remains usable.

## Completion judgment before this resume

Work 0010 is not complete.

The Gemini credential is a genuine external BLOCKER for the AI matrices. Separately, several non-AI Phase 1 acceptance checks remain `SKIPPED` because the browser execution surface became unavailable after a deployment refresh. Those non-AI checks do not depend on Gemini and must be completed before the Work can close.

## Residual scope A — complete non-AI live checks first

These checks must proceed even when no Gemini credential is available.

### 1. Restore and diagnose the DEV browser execution surface

- Reopen the existing DEV deployment using the current deployment/test URL and authenticated account.
- If the surface is unavailable, identify the exact cause: stale deployment version, access setting, authorization state, URL mismatch, or an implementation/runtime defect.
- Prefer updating or redeploying the existing DEV project; do not create a parallel product implementation or unrelated deployment structure.
- Record the observed cause and resolution in `docs/handoffs/0010-report.md`.
- Add code/tests only when an implementation defect is actually observed.

### 2. Remaining Meeting maintenance checks

- Run live Inactive and Reactivate on a synthetic Meeting.
- Verify the stable Meeting ID and authoritative Doc remain intact.
- Verify status, Version/Updated fields, and Audit events.
- Exercise the Meeting retry path only if a safe bounded failure injection is available. If not, keep it `SKIPPED` with the precise limitation; do not corrupt DEV data merely to force a failure.

### 3. Pitchbook live matrix

Using small synthetic files first:

- one-file registration;
- past Pitchbook search/detail;
- metadata update and deterministic rename;
- Inactive and Reactivate;
- mixed multi-file processing with observable per-file outcomes;
- failed-file retry with the same Batch ID, Document ID, reserved sequence, and no duplicate Drive file or Index row;
- corresponding Audit metadata and redaction.

Use only formats already accepted by the product. Do not add a new upload architecture.

### 4. Practical upload-limit observation

- Test incrementally with synthetic files; do not begin at 25MB.
- Establish the highest simple reliably observed size within the existing Apps Script path.
- If 25MB is unreliable, lower the product limit to a conservative observed-safe value and update client/server constants, tests, and documentation.
- Do not introduce chunking, Cloud transport, or another runtime in this Work.
- Record exact tested sizes and outcomes without committing the files.

### 5. Phase 1 closeout

After the above, confirm:

- authoritative Drive files and Index rows agree;
- no duplicate stable IDs/sequences were created;
- Backend and Audit remain separate;
- Audit remains metadata-only and owner-restricted in this DEV environment;
- no source body/base64/file bytes were copied into Audit or reports.

Do not leave a non-AI acceptance item marked `SKIPPED` merely because Gemini remains unavailable.

## Residual scope B — securely obtain or configure the DEV Gemini credential

The current official choices remain:

- answer model: `gemini-3.6-flash`;
- File Search Store embedding model: `models/gemini-embedding-2`.

If a billing-enabled DEV Gemini credential is not already available:

1. Initiate or surface the interactive Google AI Studio / Google Cloud flow for the authenticated user.
2. Allow the user to import or select the DEV Cloud project and complete billing/account approval in the browser when required.
3. Create a current Gemini authorization API key through AI Studio. Do not use or create an unrestricted legacy Standard key.
4. Never request that the user paste the key into Codex chat.
5. Configure the value directly through the secure local / Apps Script Script Property path as `KSP_GEMINI_API_KEY` without printing it.
6. Do not write the key to `.env` files that may be committed, GitHub, PR text, logs, shell history captured in the report, or source code.

If user-side billing approval is required, state the exact minimal browser action and continue automatically after it is completed.

If a billing-enabled credential still cannot be obtained, finish all non-AI residual scope, update the report, and retain only the precise external AI credential BLOCKER. Do not invent additional coding work.

## Residual scope C — Gemini File Search and AI matrices

Once the credential is securely configured:

### 1. Configuration

- set `AI_DEFAULT_MODEL = gemini-3.6-flash`;
- set `AI_EMBEDDING_MODEL = models/gemini-embedding-2`;
- create or reuse one File Search Store and persist its name through the existing Settings path;
- run `getFeatureFreezeDiagnostics()`;
- enable AI sync and rerun setup to create/reuse the 15-minute trigger.

### 2. Six-format indexing

Run live indexing for:

- Meeting Google Doc text;
- PDF;
- PPTX;
- XLSX;
- DOCX;
- TXT;
- EML plain body;
- EML HTML fallback;
- EML with attachment exclusion;
- malformed or attachment-only EML.

Verify:

- supported sources reach `Indexed`;
- custom metadata and stable source IDs are correct;
- current revisions replace old derived revisions without duplicate active Documents;
- Inactive removes retrieval availability;
- Reactivate restores current content;
- malformed EML does not index attachment/script/style noise;
- AI failure never rolls back or corrupts authoritative source capture.

### 3. Five-mode Knowledge Search

Run through the same Store/filter/citation path:

- `自由質問`;
- `要約`;
- `時系列`;
- `比較`;
- `面談準備` with required GP.

Verify grounded output, insufficient-evidence behavior, mode-specific structure, metadata filtering, source IDs, authoritative Drive links, and metadata-only Audit rows. Confirm answers, chunks, normalized EML bodies, embeddings, and source bodies are absent from Audit.

### 4. Trigger, retry, and outage isolation

- observe one actual scheduled 15-minute worker execution when practical;
- otherwise verify trigger creation and directly invoke the same handler, recording the limitation;
- simulate a retryable Gemini failure safely;
- verify bounded retry/backoff, source-claim duplicate prevention, disabled-sync no-op, and authoritative-record isolation;
- confirm or document the separate Audit-retention trigger path.

## Defect handling

- Fix only defects observed during the remaining live matrix.
- Make the smallest safe repair.
- Add focused regression coverage for each repair.
- Run the affected live check plus one representative regression.
- Run `npm run check` before final delivery.
- Do not expand product scope.

Non-goals remain: new features, custom Vector DB, model selector/router, per-user AI ACL, `.msg`, automatic EML attachment indexing, production deployment, company production data, or new upload architecture.

## Acceptance criteria

- `npm run check` passes with the exact count recorded.
- The existing DEV setup remains valid and idempotent.
- Meeting Inactive/Reactivate and the primary Pitchbook workflows operate end to end.
- The practical upload limit is observed and documented.
- Backend and Audit remain separate and appropriately restricted in the DEV environment.
- Six accepted source formats have live indexing evidence, or a concrete isolated format-specific blocker is demonstrated.
- Five modes execute through one shared retrieval path.
- Citations open the correct authoritative sources.
- Audit remains metadata-only and content-redacted.
- AI outage cannot corrupt authoritative records.
- No credential, private ID, private URL, or source content is committed or logged.
- `docs/handoffs/0010-report.md` clearly distinguishes `PASS / FAIL / SKIPPED / BLOCKER` and supersedes stale evidence.
- No implementation BLOCKER remains for the completed live scope.

## Git / PR requirements

- Continue on `agent/0010-dev-live-qualification`.
- Commit and push all scoped repairs, tests, and report updates.
- Update Draft PR `#8` with the latest verified status.
- Keep the PR Draft and do not merge until ChatGPT reviews the final evidence.

## Completion response

Return only:

- Work ID;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line blocker summary when applicable.
