# Work 0013 — CODEX-02 PDF export transport fix verification

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD — bounded observed-defect repair and DEV verification`.

Route: `B — ChatGPT applied the minimal source/test repair; Codex performs deterministic validation, exact DEV synchronization, one deployment-version update, and bounded live verification`.

Recommended Codex model: `Luna Max`.

Rationale: ChatGPT has completed root-cause analysis for the single observed PDF defect. The remaining work is deterministic verification and one bounded live confirmation. No open-ended architecture or second-hypothesis investigation is authorized.

Target branch: `agent/0013-consolidated-dev-live-qualification`.
Draft PR: `#11`.

Before execution, read all applicable `AGENTS.md` / `AGENTS.override.md` files and follow the repository-specific subagent policy. Use subagents actively and proportionately only for independent hypothesis verification and patch/regression review; do not run competing root-cause explorations.

## Primary Outcome

Restore the already-qualified Knowledge Export PDF path in the existing synthetic DEV Web App, then complete the remaining clipboard and final-integrity checks so Work 0013 can converge.

## Acceptance Evidence — priority order

1. Focused PDF transport regression tests PASS.
2. Existing Knowledge Export deterministic tests PASS.
3. `npm run check` PASS with no public-surface regression.
4. Exact tested source is synchronized to the already identity-confirmed synthetic DEV Apps Script project.
5. The existing recovered versioned DEV Web App deployment is updated to exactly one new immutable version; no second Web App deployment is created.
6. One fresh Preview followed by one PDF export succeeds and creates one non-empty PDF artifact in the configured `Knowledge Exports` folder.
7. The temporary Google Doc used for PDF conversion is cleaned up/trashed as expected, or any cleanup warning is recorded without invalidating a valid PDF.
8. Clipboard qualification completes.
9. Final integrity readback confirms no authoritative source-row/source-file/AI-state mutation and no duplicate artifact from one action.

## Accepted / Closed Conclusions — do not reopen

- Web App recovery: PASS.
- Versioned `/exec`: PASS.
- Integrated navigation: `PASS — USER-ASSISTED LIVE CONFIRMATION`.
- Matrix A/B/C and upload sizing through 25 MiB: accepted.
- Matrix D: `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`; CLOSED and non-blocking.
- Knowledge Export installation-state repair: PASS.
- Matrix E Preview: PASS.
- Google Docs export: PASS.
- Shared Drive-specific qualification: deferred external gap.
- Billing-enabled Gemini/File Search qualification: deferred external gap.

Do not rerun project/deployment recovery, `/dev`, integrated navigation, Matrix A/B/C/D, Google Docs export, installation-state migration, or historical navigation diagnosis.

## Single Active Hypothesis

The observed live PDF failure was caused by the Apps Script Advanced Drive Service byte-content export call in `src/157_KnowledgeExportLiveEnvironment.gs`:

`Drive.Files.export(temporaryDocumentId, 'application/pdf')`

For Apps Script, Advanced Drive `Files.export` does not reliably return exported byte content as a usable Blob and can throw despite the underlying export succeeding. Google’s current Apps Script guidance uses the Drive v3 REST export endpoint via `UrlFetchApp.fetch()` with `ScriptApp.getOAuthToken()`, then reads `response.getBlob()`.

This hypothesis explains the exact observed boundary:

- Preview PASS;
- Google Docs creation PASS;
- PDF conversion FAIL before a PDF artifact exists.

If evidence falsifies this hypothesis, STOP and return to ChatGPT. Do not investigate or repair a second cause in this dispatch.

## ChatGPT-applied minimal repair

Exact changed source:

- `src/157_KnowledgeExportLiveEnvironment.gs`

New private helper:

- `kspExportKnowledgeDocumentPdf_()`

Repair:

- remove direct Advanced Drive `Drive.Files.export()` byte retrieval;
- call `https://www.googleapis.com/drive/v3/files/{id}/export?mimeType=application/pdf` through `UrlFetchApp.fetch()`;
- authenticate with `ScriptApp.getOAuthToken()`;
- require a 2xx response;
- return `response.getBlob()` only when non-empty;
- expose no raw API response body or private identifiers in public errors.

No manifest change is required: the existing manifest already includes Drive and `script.external_request` scopes.

Exact added regression file:

- `tests/knowledge-export-live-environment.test.cjs`

The pre-fix source at `7cee7df4cd3be05b43ea5fecccb75165534333b7` would fail the regression asserting the live adapter no longer uses `Drive.Files.export()` and does not provide the new REST/OAuth helper behavior.

## Required deterministic validation

Run in this order:

1. `node --test tests/knowledge-export-live-environment.test.cjs`
2. `node --test tests/knowledge-export.test.cjs tests/knowledge-export-ui.test.cjs`
3. `npm run check`
4. `git diff --check`

Also confirm:

- no unexpected public top-level function was introduced;
- `kspExportKnowledgeDocumentPdf_()` remains private by trailing underscore;
- `src/appsscript.json` is unchanged;
- the tracked diff contains no IDs, URLs, OAuth material, tokens, credentials, or local clasp files.

If any required deterministic check fails, STOP. Codex may make only a narrow correction within the exact source/test files above when it is clearly necessary to make the already-decided repair executable; otherwise return to ChatGPT. Do not broaden scope.

## Exact DEV synchronization

Only after deterministic PASS:

- use the already identity-confirmed synthetic DEV Apps Script project;
- verify local mapping privately and confirm the same project identity;
- push the exact tested `src` tree to that project once;
- verify the remote saved source contains the new helper and no unexpected divergence.

Do not pull over the repository worktree.
Do not touch production.

## Existing Web App deployment update

The current normal DEV entrypoint is the already recovered versioned Web App deployment with description `KSP Work 0013 DEV Web App restored`.

After source synchronization:

- create one new immutable Apps Script version from the exact tested saved source;
- update that existing Web App deployment to the new version;
- keep deployment type `Web app`;
- keep execute-as `deploying user`;
- keep access `Only myself`;
- do NOT create a second Web App deployment;
- do NOT modify/delete Library deployments;
- do NOT expose or record the deployment ID or full `/exec` URL.

If the existing deployment cannot be safely updated to the new version without changing its type/access/execute-as boundary, STOP.

## Bounded live verification

Use the existing recovered `/exec` in the same approved synthetic DEV account context.

Do not ask the user to re-prove navigation.

Because the old Preview fingerprint may be stale after the deployment update, one fresh Preview of the already-qualified compact source set is authorized solely to obtain a current fingerprint.

Then:

1. PDF export — execute exactly once.
   - PASS only if one non-empty PDF artifact is created in `Knowledge Exports` and resolves normally.
   - verify source set/order/content structure is consistent with the already-qualified Preview/Docs evidence.
   - verify no duplicate PDF is created from the single action.
   - verify temporary Google Doc cleanup/trashed state as designed; a cleanup warning may be non-blocking if the PDF itself is valid.

2. Clipboard — only after PDF PASS.
   - use the normal `AI用プロンプトをコピー` action once;
   - user may confirm only `貼り付けられた` / `貼り付けられない`; never paste prompt contents into chat/report;
   - PASS requires successful copy or documented client fallback, metadata-only Audit, and no Gemini call.
   - if browser clipboard permission blocks native and fallback, classify clipboard only as environment-limited/deferred; do not invalidate PDF PASS.

3. Final integrity readback.
   - Meeting/Pitchbook source row counts unchanged by export operations;
   - original source Docs/files intact;
   - no export artifact treated as authoritative source or AI-index candidate;
   - no AI state changed;
   - Audit contains only expected metadata events and no source body/prompt content;
   - exactly the expected retained Docs export from the prior accepted run plus one new PDF from this dispatch; no duplicate artifact from one action;
   - no setup/private admin/trigger mutation.

## Stop Conditions / Strategy Reset

STOP immediately and return to ChatGPT if:

- the focused regression does not validate the single hypothesis;
- deterministic checks fail outside the exact repair boundary;
- source synchronization reveals unexpected divergence;
- deployment update would require a second Web App deployment or access-boundary change;
- the first post-fix PDF attempt still fails;
- the PDF succeeds but Drive/Audit/source readback contradicts the UI result;
- source content appears in Audit;
- source/AI state mutates unexpectedly;
- a second root-cause hypothesis would be required.

Do not retry the PDF after a post-fix live failure in this dispatch.

## Reporting / Delivery

Create/update:

- `docs/handoffs/0013-CODEX-02-pdf-export-transport-fix-verification-report.md`;
- `docs/handoffs/0013-report.md`;
- `docs/handoffs/0013-non-ai-final-live-qualification-report.md`;
- `docs/handoffs/0013-dispatches.md`;
- Draft PR #11 body.

Keep PR #11 Draft / Open / unmerged. Do not merge.

If PDF and final integrity pass, and clipboard is PASS or only a documented browser-environment limitation, Matrix D remains only the allowed non-blocking deferral, and no implementation blocker remains, classify:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

`BLOCKER: NO`.

Do not claim `PRODUCTION READY` while Shared Drive-specific and billing-enabled Gemini/File Search qualification remain deferred.

## Completion Response

Return only:

- Work ID;
- Dispatch ID;
- deterministic focused/full validation;
- DEV source synchronization result;
- Web App deployment version-update result;
- PDF export result;
- clipboard result;
- final integrity result;
- Matrix D status;
- Shared Drive residual;
- Gemini/File Search residual;
- overall Work 0013 classification;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any FAIL/DEFERRED item.

Never return raw IDs or full private URLs.

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
