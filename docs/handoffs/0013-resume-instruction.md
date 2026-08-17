# Work 0013 — Residual DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Codex residual authenticated DEV qualification and observed-defect remediation`.

Recommended Codex model: `Luna Max`.

Rationale: Work 0013 has already established the current hardened DEV Web App deployment, normal bootstrap/master loading, and the unchanged deterministic baseline. The remaining work is a bounded set of interactive/browser/Workspace/Gemini qualification checks. Escalate to `Sol High` only if the private administrator execution path or another runtime issue requires a material cross-cutting design decision.

Current residual starting ref: `aa805a26544ce6b3bc9bdd2f18bd7f9828379b2f`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary current report: `docs/handoffs/0013-report.md`.

## Purpose

Continue the same Work 0013 objective. Do not create a new Work ID and do not rerun the completed qualification from scratch.

The prior run confirmed:

- the Work 0012 hardened source was pushed to the synthetic DEV Apps Script project;
- a current DEV Web App was created through the official Apps Script deployment UI and loads successfully;
- the current Pitchbook page, Master options, upload contract, failed-slot restoration, and retry UI render without browser errors;
- normal bootstrap/facade smoke works without exposing resource IDs or private diagnostic objects;
- `npm run check` and `npm run test` remained `154/154 PASS`, and `git diff --check` passed;
- no current-source defect was reproduced, so no speculative source change was made.

Treat those observations as prior PASS evidence unless the residual run observes contradictory evidence.

## Residual qualification only

Complete the following items that remain `DEFERRED` in `docs/handoffs/0013-report.md`.

### 1. Current Pitchbook browser flow

Use the existing current DEV Web App and synthetic local files.

- Re-select the exact synthetic file bodies required by the currently restored Failed slots.
- Retry the Failed slots from the current deployment.
- Confirm success through browser response and authoritative Drive / Backend Index readback.
- Confirm the same Batch ID / Document ID / reserved sequence is retained and no duplicate Drive file or Index row is created.
- Confirm Pitchbook search after retry.
- Perform one metadata update and confirm stable Document ID / File ID.
- Perform Active → Inactive → Active and confirm identity, filename, Date cell, AI state, and Audit remain coherent.
- Complete a current-deployment multi-file partial-failure/retry case if it can be injected through the existing public contract without qualification-only production code.

If native file selection is required, tell the user exactly which local synthetic file(s) to select and stop only at that interaction checkpoint. Resume immediately after the user completes the selection.

### 2. Practical browser upload limit

Do not assume the displayed 25 MB limit is practical.

- Use synthetic supported files only.
- Progress from small files toward 25 MB in a small number of representative steps.
- Stop increasing after a reproducible transport/runtime failure.
- Retest around the boundary once to distinguish transient failure from a stable limit.
- Record the largest stable observed file size and the first reproducible failure, if any.
- If 25 MB is not reliably stable, lower the simple product limit with operating margin and update server/client constants, UI text, docs, and tests together.
- Do not add chunking, Cloud Run, multipart infrastructure, or another upload architecture.

### 3. Real Knowledge Export

Using synthetic Active Meeting/Pitchbook sources in DEV:

- preview the intended filters and verify counts;
- create one real Google Docs export;
- create one real PDF export;
- inspect that both are under the configured `Knowledge Exports` sibling folder;
- verify Meeting sections preserve complete authoritative text and are oldest-to-newest;
- verify Pitchbooks contribute metadata plus authoritative Drive links only;
- verify explicit source hyperlinks in the Google Doc and useful link representation in the PDF;
- verify the generated artifact link identifies the generated artifact;
- verify Meeting/Pitchbook Index rows and source AI state are unchanged by export;
- verify the export artifact itself is not treated as a source;
- inspect Audit and prove source body, prompt, answer, chunks, embeddings, bytes, secrets, and raw API payload are absent;
- repeat an identical create request and verify intended short-window idempotency;
- execute the actual browser clipboard path and verify Prompt-copy Audit is recorded only after successful copy.

### 4. Private administrator / trigger execution path

Do not simply carry this item forward indefinitely.

The current source correctly uses trailing-underscore functions so they are invisible to `google.script.run`. The prior run also observed that the private setup functions were not available in the normal editor function selector, and the current project was not configured for Apps Script API execution.

Determine the smallest safe operational path that allows an authorized administrator to perform setup/validation/status and preserve private Web App exposure.

Required outcome:

- `setupKnowledgePlatform_`, `validateInstallation_`, `getInstallationStatus_`, retention cleanup, and manual/private AI sync must remain unavailable to normal Web App users;
- there must be a practical, documented administrator execution path for setup/repair and trigger creation/migration;
- `runAiSyncWorker_` must remain a valid intended trigger handler;
- no permanent public admin wrapper or credential-based browser backdoor may be added.

First test existing supported paths before changing architecture:

1. whether Apps Script trigger UI or `ScriptApp.newTrigger(functionName)` can target the private handler in this project;
2. whether an already-supported editor/private execution mechanism exists in the authenticated DEV project;
3. whether Apps Script API execution can be safely enabled with the current DEV Cloud-project configuration without creating a parallel architecture.

Google's documented contract confirms that trailing-underscore functions are private to `google.script.run`, while `ScriptApp.newTrigger(functionName)` accepts a named handler and Apps Script API `scripts.run` can execute project functions when its deployment/Cloud-project requirements are met. Verify actual behavior in the DEV project rather than assuming it.

If no safe existing operational path works and a repository change is required, treat this as an observed production-operability defect. Make the smallest coherent correction that preserves the normal-user public-surface allowlist, add deterministic regression coverage, document the administrator procedure, and rerun the affected DEV case. Escalate to `Sol High` only if choosing the safe admin execution architecture materially changes the current boundary.

### 5. Shared Drive qualification

Run only if the user has an explicitly authorized disposable/test Shared Drive location.

If unavailable, keep this as an explicit external production-qualification gap and do not infer Shared Drive semantics from My Drive.

If available, verify setup/resource lookup, Meeting Doc, Pitchbook, Knowledge Export, control-folder separation, Audit restriction, and Export permission equivalence.

### 6. Gemini / File Search qualification

Run when an approved billing-enabled DEV credential is available.

- initiate the supported Google AI Studio / approved Google Cloud flow when necessary;
- never ask the user to paste an API key, OAuth token, password, cookie, or private resource ID into chat;
- configure the DEV credential directly through the approved server-side property path without printing it;
- create/reuse only the intended DEV File Search Store;
- qualify PDF / PPTX / XLSX / DOCX / TXT / EML using small synthetic sources;
- qualify all five modes and authoritative citations/Drive links;
- qualify Active/Inactive/Reactivate index lifecycle;
- qualify worker, retry/backoff, disabled-sync no-op, and AI-outage isolation;
- confirm AI failure never damages the authoritative source.

If approved billing/credential access is unavailable, record this precisely as an external production-qualification gap after all other residual checks are complete.

## User interaction rules

The user is expected to be physically at the PC for this residual run.

- Initiate supported sign-in/consent/billing flows instead of merely telling the user to configure them later.
- For native file selection, name the exact synthetic file(s) and ask for only that selection action.
- Never use blind Windows mouse/keyboard automation or infer an unknown Chrome URL.
- Never ask the user to paste secrets or private Google identifiers into chat.
- Do not abandon independent remaining checks because one interactive checkpoint is waiting.

## Defect handling

Fix only defects actually observed in this residual live qualification.

For each observed implementation defect:

1. reduce to the smallest synthetic reproducer;
2. fix the root cause without feature expansion;
3. add focused deterministic regression coverage;
4. rerun the exact live failing case;
5. run the dependent regression case;
6. continue the matrix.

Do not modify source merely to turn an external limitation into a PASS.

## Final validation and report

After the residual run:

- run `npm run check`;
- run `npm run test`;
- run `git diff --check`;
- update `docs/handoffs/0013-report.md` rather than creating a new Work report;
- retain exact `PASS / FAIL / DEFERRED / NOT APPLICABLE` classifications;
- explicitly distinguish `DEV QUALIFIED` from `PRODUCTION READY`;
- do not claim hosted CI PASS without an actual workflow run;
- remove any qualification-only local/deployment artifacts that are no longer required;
- commit and push all scoped report/source/test/doc changes to the same branch;
- update Draft PR #11;
- do not merge.

## Completion judgment

Work 0013 can be considered complete with external production gaps only when all capabilities available in the authorized DEV environment have actually been exercised. User-native Pitchbook selection/retry and real DEV Knowledge Export/clipboard are not organization-only infrastructure and should not remain deferred merely because the previous run ended before the interaction was completed.

Shared Drive and billing-enabled Gemini may remain explicit external production gaps when the organization/test infrastructure is genuinely unavailable.

Production readiness additionally requires those production-release-critical gaps to be observed and passed.

## Completion response

Return only:

- Work ID;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line blocker summary when applicable;
- remaining user/external qualification gaps, if any, in one concise line.
