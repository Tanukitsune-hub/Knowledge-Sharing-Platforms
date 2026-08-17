# Work 0013 — Consolidated DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Codex authenticated DEV qualification, observed-defect remediation, and executable validation`.

Recommended Codex model: `Luna Max`.

Rationale: product architecture, public facade, feature scope, limits, and acceptance contracts are settled through Work 0012. The residual work is primarily authenticated execution, browser/Workspace/File Search validation, bounded failure injection, and repair of defects actually observed. Escalate to `Sol High` only if a material cross-cutting root-cause or architecture decision remains unresolved after focused diagnosis.

Merged code baseline: `f3505c29641bce87a3cdf28cfcd6f8ed3313db9d` (`main`, Work 0012 merged).

Pre-handoff Work 0013 authorization ref: `28c939e1363edfaace6e8bd6699437db77cadcf8`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Execution ref: use the exact branch HEAD supplied by ChatGPT together with this instruction. Do not start from an older local branch.

## Why Codex is needed

ChatGPT has completed the product decisions, adversarial review, security hardening review, GitHub integration through Work 0012, and this qualification plan. The remaining evidence depends on the user's local authenticated Google session, Apps Script runtime, browser-native file selection/clipboard, Google Drive/Docs/Shared Drive behavior, and Gemini/File Search execution. Those are executable/runtime tasks that GitHub-only work cannot prove.

## Sources of truth

Read before execution:

- root `AGENTS.md` and every applicable nested `AGENTS.md` / `AGENTS.override.md`;
- `docs/handoffs/0010-report.md` — already observed live evidence and deferred browser/Gemini items;
- `docs/handoffs/0011-report.md` — Knowledge Export implementation and deferred real Docs/PDF/clipboard checks;
- `docs/handoffs/0012-report.md` — public-surface hardening and deferred deployed-browser/trigger/Docs/PDF checks;
- `docs/reviews/0012-adversarial-review.md` — threat/risk context;
- current `README.md`, architecture, runtime, security, upload-limit, and AI/File Search documents when relevant.

GitHub is canonical. Do not treat stale local state, an old deployment, or an earlier report as newer than the branch HEAD.

## ChatGPT-completed work

- Works 0004–0012 are integrated into `main` through `f3505c29641bce87a3cdf28cfcd6f8ed3313db9d`.
- Work 0012 sealed the Apps Script public surface, hardened Knowledge Export, safe errors, link integrity, throttling/idempotency, and deterministic regression tests.
- Work 0013 branch is created from that merged `main`.
- `src/AGENTS.md` explicitly authorizes authenticated synthetic/anonymized DEV Apps Script / Workspace / Gemini calls for this Work only.
- Existing PASS evidence from Works 0010–0012 remains valid unless this run observes contradictory evidence.

## Outcome

Close the remaining environment/user-dependent qualification gaps from Works 0010–0012 in one consolidated DEV cycle, while preserving the current architecture and avoiding feature expansion.

The run should answer, with observed evidence:

1. Does the Work 0012 hardened source operate end to end in a deployed DEV Web App?
2. Are private/admin/destructive functions actually unavailable through the browser while editor/trigger execution still works?
3. Do the previously deferred Pitchbook browser flows work, and what is the practical safe upload limit?
4. Do real Knowledge Export Google Docs/PDF, hyperlinks, folder placement, clipboard, Audit, and non-indexing behavior work?
5. Where an authorized disposable Shared Drive is available, do Shared Drive-specific permissions and file operations behave correctly?
6. With an approved billing-enabled DEV Gemini credential, do File Search, six formats, five modes, citations, lifecycle, trigger, retry, and outage isolation work against synthetic sources?
7. After any observed-defect repair, do the canonical local tests and affected live matrices still pass?

No new feature should be added. Fix only defects actually observed during qualification.

## User-interaction rule

The user plans to start this Work only while physically at the PC and can complete necessary interactive steps.

When user action is required:

- initiate the supported Google/Apps Script/Google AI Studio authentication or consent flow rather than stopping immediately;
- open or surface the exact sign-in/consent/billing page or URL using a supported mechanism;
- state the single minimal action the user must perform, then continue automatically after it is completed;
- for native file selection, prepare clearly named synthetic files in a dedicated local DEV folder and tell the user exactly which file(s) to select;
- never ask the user to paste an API key, OAuth token, password, cookie, private Google resource ID, or other credential into chat;
- never print or log credential values;
- do not use blind Windows mouse/keyboard automation or attempt to infer an unknown Chrome URL. If a native browser surface cannot be controlled safely, use an explicit user interaction checkpoint instead.

User interaction is an expected part of Work 0013, not a reason to abandon all remaining independent checks.

## Mandatory subagent rule

Before starting, read all applicable `AGENTS.md` files and identify the repository-specific subagent policy. Use subagents actively and proportionately; subagent use is mandatory.

Use independent perspectives for at least:

- deployed Apps Script public/private surface and trigger/setup behavior;
- Pitchbook browser upload/retry/limit evidence;
- Knowledge Export Docs/PDF/clipboard/Audit/non-indexing evidence;
- Gemini/File Search/six-format/five-mode/lifecycle evidence;
- final security, cleanup, test, and Git/report cross-check.

Avoid overlapping write ownership. The parent agent retains responsibility for scope, defect triage, integration, and final evidence.

## Safety boundary

- DEV only. No production deployment.
- Synthetic or anonymized data only. Never upload real Meeting notes, Pitchbooks, confidential investment material, personal information, or production files.
- Prefer the existing clearly identified DEV Apps Script project/resource set when it can be safely reconnected. Do not silently create a parallel architecture.
- If the prior DEV project is unavailable, a new clearly named disposable DEV resource set may be created only after confirming it cannot affect production.
- An existing user-owned My Drive synthetic DEV fallback may continue for functional checks. Do not infer Shared Drive behavior from My Drive.
- Use a Shared Drive only if the user has an explicitly authorized disposable/test location. Never repoint or modify a production knowledge folder merely to obtain qualification evidence.
- Do not create temporary public Apps Script wrappers to invoke private functions. Private setup/status/retention/sync/diagnostic functions must stay private to `google.script.run`.
- Do not store secrets, account identifiers, Google resource IDs, private URLs, source content, or local paths in GitHub, PR text, or the final report.
- No physical deletion or destructive action against production resources.

## Execution strategy

This is a convergence/qualification Work, not a fresh implementation pass.

- Reuse prior PASS evidence where the relevant code/contract did not change.
- Because Work 0012 renamed the Apps Script function surface broadly, run representative end-to-end smoke tests after deploying the hardened source, but do not unnecessarily repeat every old synthetic combination.
- Focus live effort on items that were `DEFERRED`, `SKIPPED`, or materially changed by Work 0012.
- If a live defect is found, reproduce it minimally, fix the root cause in scope, add a focused deterministic regression test, rerun the affected live case, then continue the matrix.
- Do not perform broad refactors or speculative hardening.

## Phase 0 — Local and DEV reconnection preflight

1. Confirm the local checkout can be reconciled safely to the exact Work 0013 execution ref. Do not reset or discard unrelated user work.
2. Read the applicable instructions and prior reports.
3. Run one baseline `npm run check` before authenticated work. If it fails because of the implementation, fix before live qualification; if infrastructure/tooling fails, classify accurately and continue safe work where possible.
4. Restore the minimum local DEV tooling/configuration needed to push/run the Apps Script project. Local clasp/auth configuration must remain untracked.
5. Reconnect to the existing synthetic DEV Apps Script project if safely identifiable from the user's local authenticated environment. Do not place its ID in GitHub or chat.
6. Push the current hardened `src` to DEV and confirm no qualification-only source or public wrapper is included.

## Phase 1 — Hardened Apps Script deployment and public/private boundary

Using the deployed DEV Web App and editor/trigger execution paths:

- run `setupKnowledgePlatform_()` from an editor/approved private execution path;
- run `validateInstallation_()` and inspect status privately;
- confirm setup remains idempotent and does not duplicate resources/seeds or reset counters/config;
- verify the legacy `runAiSyncWorker` trigger, if present, migrates to `runAiSyncWorker_` without duplicates;
- verify the private handler remains executable through its intended editor/trigger path;
- verify representative normal facade calls operate from the Web App;
- from the deployed browser surface, prove representative private functions cannot be invoked through `google.script.run`, including at minimum:
  - `setupKnowledgePlatform_`;
  - `getInstallationStatus_`;
  - `runAuditRetentionCleanup_`;
  - `runAiSyncWorker_`;
  - `kspWriteKnowledgeExportDocument_`;
  - `kspTrashKnowledgeExportFile_`;
- do not expose resource IDs or raw diagnostic objects to the normal browser surface.

Record the actual browser/server behavior, not merely the source naming convention.

## Phase 2 — Representative Phase 1 smoke after Work 0012

Use fresh synthetic records where practical.

### Meeting / Master

Confirm a concise representative flow:

- register a Meeting through the browser;
- inspect the authoritative Google Doc and filename;
- search it;
- update it;
- perform Active → Inactive → Active;
- verify stable Meeting ID / Doc ID, native Date/Time preservation, Version behavior, AI state transitions, and metadata-only Audit;
- exercise one representative Master mutation/quick-add path to prove the renamed private internals did not break the public facade.

Do not rerun every Work 0010 Meeting case unless new evidence requires it.

### Pitchbook — close the previously deferred browser matrix

Confirm:

- native browser selection and upload of one supported synthetic file;
- authoritative Drive file, saved filename, one Index row, stable Batch/Document/sequence;
- search and metadata update;
- Active → Inactive → Active while preserving the same stable file/Document identity;
- multi-file selection with at least three small supported synthetic files;
- success files remain committed if one reserved slot is made to fail through a safe DEV-only input/fingerprint/size mismatch or equivalent controlled public-call failure;
- retry of only the failed slot uses the same Batch ID / Document ID / reserved sequence and creates no duplicate Drive file or Index row.

Do not add qualification-only production code merely to inject a failure. If browser-native partial-failure injection cannot be done safely, use the existing public upload contract against a synthetic reserved slot and clearly distinguish the browser-native and server-side evidence.

## Phase 3 — Practical upload-limit qualification

The accepted policy is currently 25 MB/file, 10 files/selection, 100 MB total/selection, with an explicit requirement to lower the simple limits if Apps Script transport proves impractical.

Qualification method:

1. Generate synthetic supported files locally; no real content.
2. Confirm 10-file selection using small files.
3. Exercise single-file browser transport at increasing representative sizes, starting small and progressing toward 25 MB. Stop escalating after a reproducible transport/runtime failure.
4. Retest around the observed boundary to distinguish a transient failure from a stable limit.
5. Do not upload 100 MB merely to prove arithmetic if the batch transport is file-granular. Validate the total-selection contract and representative multi-file sequential behavior; perform a full 100 MB aggregate browser upload only if it materially exercises a different transport risk.
6. If 25 MB/file is not stable, adopt a conservative lower product limit with operating margin. Update the server/client constants, docs, tests, and displayed UI together. Do not introduce chunking, Cloud Run, multipart infrastructure, or another upload architecture.
7. Record the largest stable tested file, first reproducible failure (if any), and adopted safe limit. Never claim an untested size works.

## Phase 4 — Knowledge Export live qualification

Using synthetic Active Meeting/Pitchbook sources:

- preview exact structured filters and confirm counts;
- confirm Meeting sections are oldest-to-newest and preserve the complete authoritative Doc text;
- confirm Pitchbooks contribute metadata + authoritative Drive link only;
- create a real Google Docs export;
- create a real PDF export;
- confirm both are created under the configured `Knowledge Exports` sibling folder, not under authoritative Meeting/Pitchbook folders;
- inspect explicit Meeting/Pitchbook source hyperlinks in the Google Doc and useful source-link representation in the PDF;
- confirm artifact links identify the generated artifact;
- confirm export does not add Meeting/Pitchbook Index rows, does not change source AI state, and is not itself picked up as an AI source;
- confirm successful Audit entries contain only metadata/counts/IDs and no Meeting body, Prompt, answer, chunk, embedding, bytes, secret, or raw API payload;
- confirm a repeated identical create request is idempotent within the intended short window;
- exercise the actual browser clipboard path for all relevant fallback behavior once and confirm Prompt-copy Audit occurs only after successful copy;
- confirm the copied Prompt uses human-readable Master names plus stable IDs and remains provider-neutral.

Count-hard-stop, stale-preview, secret-redaction, and no-partial-output logic already has deterministic coverage; live smoke is sufficient unless the live environment contradicts it.

## Phase 5 — Shared Drive-specific qualification

If and only if the user has an explicitly authorized disposable/test Shared Drive location:

- validate `supportsAllDrives` behavior for setup/resource lookup, Meeting Doc creation, Pitchbook upload/update, and Knowledge Export;
- confirm the authoritative root contains only `Meeting Records` and `Pitchbooks` and that `Knowledge Exports` is the intended sibling under the configured parent;
- confirm Backend and Audit remain under the restricted control boundary;
- inspect actual sharing/permission behavior and confirm Audit is not directly accessible to ordinary users;
- confirm Knowledge Exports permissions are no broader than the intended source/Web App access boundary.

Do not use a production Shared Drive merely to close this matrix. If no disposable Shared Drive is available, record this phase as an external production-qualification gap and continue all other phases.

## Phase 6 — Gemini / File Search live qualification

This phase requires an approved billing-enabled DEV credential.

### Credential setup

- If the credential is not already securely configured, initiate the official Google AI Studio / approved Google Cloud flow and surface the minimal browser action to the user.
- Do not ask for the key value in chat.
- Configure it directly in the approved server-side DEV Script Property path (`KSP_GEMINI_API_KEY` under the existing DEV contract) without printing it.
- Do not commit or return credential state/details.
- Use the current repository-configured Flash/File Search contract. If an observed API contract has changed, verify against official Google documentation before changing source behavior.

### File Search and source formats

Using small synthetic files with known, distinguishable assertions:

- create/reuse exactly the intended DEV File Search Store;
- confirm the configured embedding/model path works;
- index and retrieve all six formats:
  - PDF;
  - PPTX;
  - XLSX;
  - DOCX;
  - TXT;
  - EML;
- for EML, confirm normalized Subject / From / To / Cc / Date / Body behavior and that attachments are not automatically indexed;
- confirm exact metadata fields/filtering map to the authoritative source;
- confirm source content/indexing failures never roll back or corrupt the authoritative Meeting/Pitchbook record.

### Five Knowledge Search modes

For `自由質問 / 要約 / 時系列 / 比較 / 面談準備`:

- execute each mode against synthetic evidence designed so the expected facts can be checked;
- confirm structured Date/GP/Asset Class/Equity-Debt/Source Type filters;
- confirm answer/citation behavior is grounded in the indexed synthetic sources;
- follow representative citations and prove they map back to the correct authoritative Drive file;
- confirm insufficient-evidence behavior does not invent unsupported facts;
- confirm query Audit is metadata-only and does not store the generated answer, retrieved chunks, embeddings, or full source bodies.

### Lifecycle / worker / failure behavior

- confirm Active source indexing and `Indexed` state;
- Inactivate a synthetic source and confirm it is removed from normal retrieval without deleting the Drive/Docs authority;
- Reactivate and confirm the current authoritative source is re-indexed;
- confirm the private `runAiSyncWorker_` handler can execute through the intended private path;
- confirm a 15-minute installable trigger exists without duplicate legacy handler;
- observe an actual scheduled firing if practical and directly observable in the current run; otherwise record trigger configuration + direct handler execution separately and do not claim the scheduled firing was observed;
- exercise a safe reversible DEV-only retryable failure when possible, restore the setting/state afterward, and confirm retry/backoff/idempotency;
- confirm disabled-sync is a no-op;
- confirm an AI/API failure leaves the authoritative source intact and usable.

Do not weaken the credential/public-surface boundary to make live qualification easier.

## Phase 7 — Audit, permissions, cleanup, and final regression

Before delivery:

- verify Backend and Audit remain separate resources;
- verify direct Audit sharing is restricted in the available DEV environment;
- scan tracked changes/report for secrets, private resource IDs, private URLs, source text, local paths, tokens, or account identifiers;
- remove local synthetic upload files that are no longer needed;
- remove untracked qualification-only local config when no longer needed, except secure user-approved DEV authentication/credential state that should persist locally;
- remove temporary deployments or temporary server-side qualification hooks, if any;
- do not delete or rotate the user's approved DEV credential unless the user explicitly requests it;
- leave clearly named synthetic DEV resource records only when they are useful for continued qualification and harmless; document their existence generically without IDs;
- ensure no public qualification wrapper or debug endpoint remains.

Run final validation once after the last code change:

```bash
npm run check
npm run test
git diff --check
```

If no source change was needed during live qualification, still run the canonical final check once and record the exact result.

Hosted CI absence is not a blocker. Never claim GitHub-hosted CI PASS unless an actual workflow run exists.

## Defect handling

When a live failure is observed:

1. distinguish product defect from browser/auth/quota/provider/environment limitation;
2. reduce it to the smallest reproducible synthetic case;
3. fix only the root cause required by the accepted contract;
4. add a focused deterministic regression test;
5. run the focused test first;
6. rerun the exact live failing case;
7. run the representative dependent regression case;
8. continue the remaining matrix.

Do not use a broad rewrite to solve a narrow live defect.

## Acceptance criteria

Work 0013 is complete when, to the extent the authorized DEV environment supports the relevant capability:

- current Work 0012 hardened source is deployed to DEV without temporary public helpers;
- representative public Web App workflows work end to end;
- representative private/admin/destructive names are proven unavailable through `google.script.run` while editor/trigger execution remains functional;
- Pitchbook native browser upload/update/status and multi-file retry behavior are observed;
- a practical safe upload limit is observed and, if necessary, the simple product limit is lowered consistently;
- real Knowledge Export Docs/PDF, hyperlinks, folder boundary, clipboard, Audit, and non-indexing are observed;
- Shared Drive-specific behavior is observed when an authorized disposable Shared Drive exists, otherwise explicitly remains an external production-qualification gap;
- Gemini/File Search six-format/five-mode/citation/lifecycle/worker behavior is observed when an approved billing-enabled DEV credential is available, otherwise explicitly remains an external production-qualification gap;
- no observed AI failure corrupts authoritative sources;
- all observed implementation defects are repaired in scope with focused regression evidence;
- final canonical checks pass;
- no implementation BLOCKER remains;
- every unobserved item is named precisely and is never represented as PASS.

Do not declare `PRODUCTION READY` unless all production-release-critical Shared Drive, permission, upload, browser, Knowledge Export, and Gemini matrices have actually been observed and passed. A successful Work 0013 may still conclude `DEV QUALIFIED WITH EXTERNAL PRODUCTION GAPS` when organization-only infrastructure is unavailable.

## Stop / escalation conditions

Do not stop the entire Work merely because one user-dependent phase is waiting on browser selection, billing, a disposable Shared Drive, or another external capability. Complete every independent phase first.

Report `BLOCKER` only when:

- a primary DEV workflow fails after focused repair attempts;
- the hardened private/public boundary cannot coexist with required Web App functionality;
- source/index/file integrity cannot be preserved;
- safe continuation would require production data, credential disclosure, destructive production action, or architecture expansion;
- a required environment cannot be accessed and no remaining independent qualification can be completed.

Escalate to `Sol High` only for a material cross-cutting root-cause, security/architecture ambiguity, or complex provider/runtime diagnosis. Otherwise remain on Luna Max.

## Git / report requirements

Work only on:

`agent/0013-consolidated-dev-live-qualification`

Write:

`docs/handoffs/0013-report.md`

The report must include a compact matrix with `PASS / FAIL / DEFERRED / NOT APPLICABLE`, exact observed evidence without private IDs/content, any adopted lower upload limit, every defect/fix/test, and a final distinction between `DEV QUALIFIED` and `PRODUCTION READY`.

Commit and push all scoped source/tests/docs/report changes. Update the Work 0013 Draft PR. Do not merge; ChatGPT will review GitHub evidence and decide completion/integration.

## Completion response

Return only:

- Work ID;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line blocker summary when applicable;
- user/external qualification gaps, if any, in one concise line.
