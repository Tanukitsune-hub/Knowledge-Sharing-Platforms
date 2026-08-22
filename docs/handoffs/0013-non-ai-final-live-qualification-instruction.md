# Work 0013 — Final non-AI DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded authenticated DEV verification with user-assisted browser actions where native interaction is required`.

Recommended Codex model: `Luna Max`.

Rationale: the application design, implementation, limits, and prior defect repairs are settled. The remaining safely executable Work 0013 scope is deterministic runtime qualification of the post-hardening private administrator path and the Gemini-independent Knowledge Export path. No open-ended architecture or root-cause reasoning is authorized.

Parent ref: `dbd72cb2284e12708061db7a789779ade85460c9`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

Dedicated report: `docs/handoffs/0013-non-ai-final-live-qualification-report.md`.

## Accepted completed evidence — do not rerun

The following are accepted and must not be reopened without new contradictory evidence:

- Pitchbook Date normalization repair: PASS.
- Pitchbook status-parser repair: PASS.
- Current-Batch Matrix A `Active -> Inactive -> Active`: live PASS.
- Matrix B malformed retry case: `NOT APPLICABLE TO NORMAL UI / deterministic evidence retained`.
- Matrix C practical normal-browser upload-size qualification: PASS at every attempted size `1 / 5 / 10 / 15 / 20 / 25 MiB`.
- Largest stable supported upload: `25 MiB / 26,214,400 bytes`.
- Parser-repair local suite: `158/158 PASS`.
- Work 0010 pre-hardening live setup / validation / status / setup-idempotency: PASS in the synthetic DEV environment.
- Work 0011 Knowledge Export deterministic implementation/tests: PASS, with live Docs/PDF/clipboard deferred.
- Work 0012 public-surface hardening: PASS deterministically; setup/status/validation/manual sync/diagnostics/trigger-only handlers are private trailing-underscore functions.

Do not rerun Matrix A/B/C, browser upload sizing, parser diagnosis, or prior defect exploration.

## Outcome

Complete all remaining safely executable non-AI Work 0013 qualification in one run:

1. prove that the post-Work-0012 private administrator execution path remains operational without reopening the normal-user Web App surface; and
2. prove the Gemini-independent Knowledge Export path against real synthetic DEV Google Workspace artifacts and normal browser interaction.

If both are complete with no implementation blocker, classify Work 0013 as:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

The only residual categories intended to remain after this run are:

- Shared Drive-specific permission/runtime behavior when an authorized disposable Shared Drive exists; and
- billing-enabled Gemini / File Search live qualification when an approved DEV credential is available.

Do not claim `PRODUCTION READY` in this run.

## Hard scope boundary

Allowed:

- use the existing approved synthetic DEV Apps Script project and current DEV Web App deployment;
- use existing authenticated private/admin execution mechanisms that do not expose a normal-user public function;
- ask the user for narrowly scoped Apps Script editor execution or normal Web App clicks when native/user interaction is required;
- create derived synthetic Knowledge Export artifacts in the existing DEV `Knowledge Exports` folder;
- verify Backend / Audit / Drive / Docs/PDF state through existing approved authenticated paths;
- update Work 0013 reports and PR evidence.

Not allowed:

- source, tests, product limits, architecture, manifest, deployment, public facade, or product behavior changes;
- temporary public wrappers, debug endpoints, or public qualification functions;
- temporary API deployment solely to bypass the private-function boundary;
- blind Windows mouse/keyboard automation or inferred browser URLs;
- enabling Gemini/File Search or configuring credentials;
- creating a Shared Drive solely for this run;
- production or confidential data;
- repeated retry loops or open-ended diagnosis.

If an observed application defect requires source repair, stop that affected matrix and return the smallest safe evidence to ChatGPT. Do not investigate a second hypothesis.

## Applicable repository instructions and subagents

Before starting:

1. read all applicable `AGENTS.md` / `AGENTS.override.md` files;
2. identify and follow the repository-specific subagent-use policy;
3. use subagents actively and proportionately.

Subagent use is mandatory. Use independent perspectives for:

- private/admin path and public-surface boundary verification;
- Knowledge Export Drive/Docs/PDF/Audit evidence cross-check;
- final report/status consistency review.

Do not use subagents for competing root-cause exploration or duplicate user interaction.

# Matrix D — Post-hardening private administrator path

## Purpose

Work 0010 proved live setup / validation / status before Work 0012 hardened these functions to the private trailing-underscore surface. Work 0012 proved the public-surface boundary deterministically. Matrix D verifies that an administrator still has a usable private execution path after hardening.

Relevant private entrypoints include:

- `setupKnowledgePlatform_()`;
- `validateInstallation_()`;
- `getInstallationStatus_()`;
- `runAiSyncWorker_()`.

Do not expose or rename them.

## Preflight

- confirm the current DEV project is the same synthetic DEV environment used for the successful Matrix A/C runs;
- confirm current source includes the accepted parser fix and Work 0012 private-function boundary;
- confirm AI sync remains disabled in the current DEV configuration/settings before invoking `runAiSyncWorker_()`;
- preserve all existing source records and IDs privately for comparison; do not record private IDs in GitHub.

## Execution path rule

Use the strongest already-approved private execution path that can invoke the function and observe its non-secret result without source/deployment changes.

If a return-capable private execution path is available, use it directly.

If administrator execution requires a user action in the Apps Script editor, ask only for the exact function to select/run and wait for confirmation. Do not ask the user to paste IDs, credentials, URLs, tokens, or raw logs containing private data.

If no safe path can observe the returned report without changing source/deployment/public exposure, classify the specific post-hardening return-value check as `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`, retain the accepted Work 0010 live behavior plus Work 0012 deterministic hardening evidence, and continue to Matrix E. This alone is not an implementation blocker.

## Checks

When safely executable, perform once in this order:

1. `getInstallationStatus_()`
   - `ok = true`;
   - `installed = true`;
   - environment is DEV;
   - no required resource key is missing.

2. `validateInstallation_()`
   - report `ok = true`;
   - resources, parent boundaries, schemas, and required seeds validate;
   - no unexpected trigger requirement exists while AI sync is disabled.

3. `setupKnowledgePlatform_()` once
   - report `ok = true`;
   - existing resources are reused;
   - no duplicate baseline folders, Backend/Audit spreadsheets, sheets, seeds, or source rows are created;
   - operational counters and existing future AI configuration values are preserved;
   - normal source data remains unchanged.

4. Re-read `getInstallationStatus_()` and `validateInstallation_()` once after setup
   - both remain healthy;
   - resource identity remains stable;
   - no duplicate resource or trigger appears.

5. `runAiSyncWorker_()` once only while AI sync is disabled
   - must complete as a disabled/no-op path;
   - must not require a Gemini credential or Store;
   - must not change Meeting/Pitchbook authoritative data;
   - must not create an AI document or scheduled trigger;
   - do not enable AI sync to test trigger creation in this run.

Scheduled AI trigger creation/execution remains part of the later Gemini/File Search qualification, not Matrix D.

## Matrix D PASS / DEFERRED classification

`PASS` requires successful observable private execution of the checks above with stable authoritative state.

`DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION` is allowed only when the private functions cannot be safely invoked with observable return values without changing source/deployment/public exposure. Record precisely what was and was not observable; continue Matrix E.

Any actual setup/validation/status/no-op mutation defect is a blocker and must stop Matrix D for ChatGPT diagnosis.

# Matrix E — Real Knowledge Export / clipboard qualification

## Purpose

Validate the existing Gemini-independent Knowledge Export implementation in the current synthetic DEV environment using real Google Workspace artifacts and normal Web App interaction.

This matrix does not test Gemini, semantic retrieval, File Search, or Shared Drive semantics.

## Synthetic source set

Use existing synthetic Active Meeting/Pitchbook records when sufficient. Creating a small additional synthetic Meeting/Pitchbook through the already-qualified normal UI is allowed only if required to obtain a meaningful mixed-source export set.

Prefer a compact source set containing at least:

- two Active Meetings with different dates and non-empty authoritative Doc text; and
- one or more Active Pitchbooks with valid authoritative Drive links.

Do not create large threshold populations merely to retest deterministic warning/hard-stop contracts. Work 0011/0012 deterministic threshold tests remain accepted.

## E1 — Preview

Using the deployed normal Web App, ask the user to navigate to Knowledge Search / Export and perform the minimum native actions needed to preview a mixed Active source set.

Verify authoritatively:

- preview succeeds without Gemini credentials;
- Meeting count and Pitchbook count match the Backend Active filter result;
- ordered source set is oldest-to-newest, then stable source ID;
- exact Meeting character count is consistent with the authoritative Meeting Docs;
- no export artifact is created by preview;
- preview Audit is metadata-only and does not contain Meeting body, Pitchbook content, prompt text, Gemini answer, chunk, embedding, or bytes.

## E2 — Google Docs export

From the valid preview, ask the user to create one Google Docs export through the normal UI.

Verify:

- exactly one retained Google Doc export is created for the operation;
- it is stored in the configured `Knowledge Exports` folder, outside the authoritative `Private Assets Knowledge` root;
- each exported Meeting section contains the complete authoritative Google Doc text without rewriting/truncation;
- Meeting ordering matches the preview order;
- authoritative source links are explicit functional hyperlinks;
- Pitchbooks are represented by required metadata and authoritative links only, without copied binary/body content;
- returned artifact link resolves to the created Doc;
- no new `Meeting_Index` or `Pitchbook_Index` source row is created because of the export;
- existing source AI fields are unchanged by export creation;
- no derived export is inserted into File Search / AI source state;
- Audit event is metadata-only and content-redacted.

Do not paste source bodies or private URLs into chat/report.

## E3 — PDF export

Using a fresh valid preview if required by the stale-preview contract, ask the user to create one PDF export.

Verify:

- one non-empty PDF is created in `Knowledge Exports`;
- returned artifact link resolves to the PDF;
- PDF corresponds to the same qualified source set and expected order/content structure;
- if a temporary Google Doc is used internally, it is cleaned up/trashed after successful PDF creation when expected by the implementation;
- no extra authoritative source Index or AI source state is created;
- Audit is metadata-only and content-redacted.

If PDF success is reported but no valid PDF artifact exists, treat as an application defect and stop Matrix E.

## E4 — Prompt clipboard

Use one valid mode/question combination. Prompt generation must work with Gemini unconfigured.

Ask the user to press the normal `AI用プロンプトをコピー` action once.

For actual clipboard confirmation, ask the user to paste into an empty local temporary text area/file and reply only `貼り付けられた` or `貼り付けられない`. Do not ask them to paste the prompt contents into chat.

PASS requires:

- the clipboard contains the generated prompt according to user confirmation;
- the UI reports success coherently;
- one successful prompt-copy Audit event exists only after confirmed copy;
- Audit does not contain the prompt text;
- no Gemini call is required;
- no source or AI state changes occur.

If native clipboard permission prevents copying but the documented fallback succeeds, classify PASS and note fallback. If both native and fallback fail while deterministic client tests remain green, record the exact browser/environment limitation and classify only clipboard as DEFERRED; do not invalidate successful Docs/PDF export qualification.

## E5 — Integrity/readback

At the end of Matrix E, compare authoritative state against preflight:

- source Meeting/Pitchbook row counts changed only if explicitly created as synthetic setup for this matrix;
- export operations themselves created no source rows;
- original source files/Docs remain intact;
- no export artifact is treated as authoritative source or AI-index candidate;
- Audit contains only expected metadata events;
- no duplicate export artifact was created by a single action.

## Matrix E stop conditions

Stop the affected path and return evidence to ChatGPT when:

- visible UI success conflicts with Drive/Backend/Audit readback;
- a source-integrity error occurs on a source that should be valid;
- Docs or PDF creation reports success without a valid artifact;
- export creates or mutates an authoritative source row or AI source state unexpectedly;
- source content appears in Audit;
- duplicate artifacts arise from one normal action;
- source/deployment/product code changes would be required.

Do not diagnose a second hypothesis in this run.

# Shared Drive and Gemini residual classification

Do not execute these categories in this run.

After Matrix D/E, record:

- Shared Drive-specific behavior: `DEFERRED — authorized disposable Shared Drive not exercised in this run` unless already proven by separate accepted evidence;
- Gemini / File Search live qualification: `DEFERRED — requires approved billing-enabled DEV credential and dedicated qualification` unless already proven by separate accepted evidence.

These are external qualification gaps, not implementation failures, unless existing evidence shows otherwise.

# Validation and delivery

No source/tests should change in this qualification-only run.

- Do not rerun the full suite solely because reports changed; retain the accepted `158/158` parser-repair evidence.
- If tracked source/tests change unexpectedly, stop.
- Run `git diff --check` before committing report/doc updates.
- Update `docs/handoffs/0013-report.md` so the current summary clearly supersedes historical Matrix A/C failures while retaining those failures only as historical evidence.
- Create/update `docs/handoffs/0013-non-ai-final-live-qualification-report.md`.
- Update `docs/handoffs/0013-instruction.md` to reflect the final Work 0013 state.
- Update Draft PR #11 with the current qualification summary.
- Commit and push report/documentation changes only.
- Do not merge; ChatGPT performs final merge review.

If Matrix D is deferred solely for the private execution-surface limitation but Matrix E passes and no implementation defect is observed, `BLOCKER: NO` is allowed and Work 0013 may still be classified `DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`, provided the limitation is stated explicitly.

# Completion response

Return only:

- Work ID;
- Matrix D result;
- Matrix E result;
- Docs export result;
- PDF export result;
- clipboard result;
- Shared Drive residual status;
- Gemini/File Search residual status;
- overall Work 0013 classification;
- report path;
- primary report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any FAIL/DEFERRED item.
