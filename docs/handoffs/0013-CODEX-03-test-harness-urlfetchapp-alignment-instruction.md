# Work 0013 — Dispatch 0013-CODEX-03 — align PDF test harness and resume qualification

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `B — bounded test-harness correction by Codex, then executable DEV verification`.

Recommended model: `Luna Max`.

Rationale: the PDF production repair is already decided and its dedicated regression suite passes `4/4`. The only observed blocker is a stale deterministic adapter test that still models the removed `Drive.Files.export()` path and does not provide `UrlFetchApp` / `ScriptApp` in its VM. This is a narrow test-harness alignment plus execution verification; no architecture or second root-cause exploration is needed.

Use the exact execution ref supplied in the Codex request.

Target branch: `agent/0013-consolidated-dev-live-qualification`.
Draft PR: `#11`.

## Primary outcome

Align the existing Knowledge Export integration test with the already-approved authenticated Drive v3 REST PDF transport, restore the deterministic gate, then resume the single post-fix DEV PDF / clipboard / integrity qualification.

## Accepted evidence — do not reopen

- PDF live adapter repair in `src/157_KnowledgeExportLiveEnvironment.gs` is the accepted implementation.
- Dedicated PDF transport regression: `PASS — 4/4`.
- Existing Knowledge Export/UI suite: `17/18 PASS`; the sole failure is `ReferenceError: UrlFetchApp is not defined` in the PDF live-adapter-path test.
- Preview: PASS.
- Google Docs export: PASS.
- Web App recovery / versioned `/exec` / integrated navigation: PASS.
- Matrix A/B/C and upload sizing: accepted.
- Matrix D: `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`; closed and non-blocking.
- Knowledge Export installation-state migration: PASS.
- No DEV synchronization or deployment mutation occurred after the deterministic failure.

## Falsifiable hypothesis

The sole `17/18` deterministic failure is a stale test harness, not a production-code regression:

- `tests/knowledge-export.test.cjs` loads Apps Script sources into a VM without `UrlFetchApp` or `ScriptApp`;
- its test `Docs and PDF live adapter paths write the model, validate the folder, and clean temporary PDF Docs` still stubs `Drive.Files.export()` and asserts that obsolete path;
- the production code now correctly calls the private `kspExportKnowledgeDocumentPdf_()` helper, which uses `UrlFetchApp.fetch()` and `ScriptApp.getOAuthToken()`.

The hypothesis is confirmed if updating only the deterministic test harness to model that REST transport makes the existing suite pass without any application-source change.

## Allowed change boundary

Application source is frozen in this dispatch.

Allowed tracked implementation change:

- `tests/knowledge-export.test.cjs` only, unless a strictly smaller already-existing shared test helper can be reused without changing production behavior.

Also allowed:

- Work 0013 dispatch/report/status documentation after validation/runtime evidence.

Not allowed:

- any `.gs` / `.html` / manifest / schema / UI / navigation / public-facade / setup / Knowledge Export business-rule / AI change;
- reverting or adding a fallback to `Drive.Files.export()`;
- weakening assertions merely to obtain green tests;
- a second PDF production hypothesis;
- another Web App deployment.

## Required test-harness correction

Update the existing PDF live-adapter-path test so it exercises the new real adapter contract.

The deterministic harness must:

- provide a synthetic `ScriptApp.getOAuthToken()` value;
- provide a synthetic `UrlFetchApp.fetch(url, options)` response;
- return HTTP 2xx and a non-empty Blob for the success case;
- capture the fetch invocation so the test can prove authenticated Drive v3 export was used;
- no longer stub or assert `Drive.Files.export()`;
- retain the existing Drive folder/create/trash and DocumentApp behavior checks;
- preserve cleanup/restoration of any globals modified for the test so no later test is polluted;
- use only synthetic IDs/tokens/content.

Keep meaningful assertions, including that the PDF path:

- obtains one exported PDF Blob through the REST transport;
- creates the PDF artifact in the expected synthetic export folder;
- trashes the temporary Google Doc;
- preserves model/body/link behavior already covered by the test.

Do not duplicate all four dedicated transport tests; this integration test only needs enough mocking to exercise the full adapter path coherently.

## Deterministic validation

After the test-harness correction, run in this order:

1. `node --test tests/knowledge-export.test.cjs tests/knowledge-export-ui.test.cjs`
2. `node --test tests/knowledge-export-live-environment.test.cjs`
3. `npm run check`
4. `git diff --check`

PASS requires all four commands to pass.

If the Knowledge Export/UI suite still fails for a reason other than the corrected stale harness, stop and return the smallest evidence to ChatGPT. Do not alter production code in this dispatch.

## DEV synchronization and runtime continuation

Only after deterministic PASS:

1. verify the application `src` tree is unchanged from the accepted PDF production repair;
2. synchronize that exact tested `src` tree once to the already identity-confirmed synthetic DEV Apps Script project;
3. create one new immutable Apps Script version;
4. update the existing recovered Web App deployment to that version while preserving:
   - type: Web app;
   - execute as: deploying user;
   - access: Only myself;
5. do not create another deployment.

Use the existing versioned `/exec`.

A fresh Preview is allowed only if required for a current preview fingerprint.

Run PDF export exactly once.

If PDF PASS:

- verify exactly one non-empty PDF exists for the action;
- verify returned link resolves to that artifact;
- verify temporary Google Doc cleanup (or only the already-documented cleanup warning if cleanup alone fails);
- continue clipboard qualification;
- complete final authoritative integrity readback.

If the first post-fix PDF attempt fails, stop immediately. No retry or second production hypothesis is authorized.

## Clipboard and final integrity

After PDF PASS, execute the already-defined Matrix E clipboard check once. User confirmation `貼り付けられた` / `貼り付けられない` is valid direct evidence; never paste prompt contents into chat/report.

Final integrity must confirm:

- export operations created no Meeting/Pitchbook source rows;
- original source Docs/files remain intact;
- no export artifact became an authoritative or AI-indexed source;
- Audit remains metadata-only/content-redacted;
- no duplicate artifact was created by one action;
- no unexpected Script Property, trigger, deployment, source, or AI-state mutation occurred beyond the authorized source version/deployment update.

## Completion

If PDF and final integrity pass, and clipboard is PASS or only a documented browser-environment limitation, classify:

`DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS`

`BLOCKER: NO`.

Shared Drive-specific and billing-enabled Gemini/File Search live qualification remain deferred external gaps. Do not claim production readiness.

Keep PR #11 Draft / Open / unmerged for ChatGPT final review.

## Completion response

Return only:

- Work ID;
- Dispatch ID;
- stale-harness correction result;
- Knowledge Export/UI suite result;
- dedicated PDF transport suite result;
- `npm run check` result;
- `git diff --check` result;
- DEV sync/version/deployment result;
- PDF result;
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

Never return raw IDs, full URLs, credentials, OAuth tokens, or private source content.
