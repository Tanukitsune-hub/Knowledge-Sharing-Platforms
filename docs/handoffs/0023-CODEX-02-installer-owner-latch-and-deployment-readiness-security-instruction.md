# Work 0023 — CODEX-02 installer ownership latch and deployment-readiness security

WORK_ID: `0023`
DISPATCH_ID: `0023-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
MODE: `REVIEW_FIX -> FINAL PERSONAL-DEV QUALIFICATION`

## Primary outcome

Preserve all accepted CODEX-01 bundle/build/runtime evidence and close three exact release-contract gaps before PR #35 can merge:

1. prevent another editor from taking over an interrupted first installation;
2. prevent `READY` / “shareable” status from being inferred merely from the existence of any Web App URL;
3. complete the promised bundle collision gate for mutable global declarations.

This is not a general hardening pass. Make the smallest coherent changes, regenerate the deterministic release kit, complete the bounded personal-DEV qualification, and stop.

## Reviewed baseline

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- branch: `agent/0023-bundle-installer-distribution`
- PR: `#35` / Draft / Open / unmerged
- reviewed head: `a1112c6db48498be3e769b513be9bb89f9567fb3`
- CODEX-01 implementation commit: `363842e94182284c80001b19a4641e2a622f5ad1`
- exact generated bundle: `935,143` bytes / `902,369` characters / `15,496` lines
- isolated personal-DEV install location: `マイドライブ/Chat GPT-Codex-Only/KSP Work 0023 Qualification`
- isolated bundle runtime: one immutable version and one restricted Web App deployment
- accepted Work 0021 runtime/version 66 must not be changed
- GitHub CI/status checks: absent

Fetch current refs before editing. Start from the actual current remote branch. Do not rebase, force-push, rewrite history, or merge PR #35.

## Accepted CODEX-01 evidence to preserve

```text
SOURCE_ARCHITECTURE: MODULAR_PRESERVED
BUNDLE_BUILD: PASS / reproducible
SOURCE_ORDER_AND_COVERAGE: PASS
HTML_EMBED_AND_LOADER_PARITY: PASS
BUNDLE_PAYLOAD_HASH: PASS
BUNDLE_FILE_CHECKSUM: PASS
RELEASE_MANIFEST: PASS
BUNDLE_PARSE: PASS
BUNDLE_TEST_PARITY: PASS
ONE_PASTE_SAVE_AND_EXECUTE: PASS
INSTALLER_IDEMPOTENCY: PASS / duplicates 0
INSTALLER_PARTIAL_RESUME: PASS for the original operator
WEB_APP_RENDER_FROM_BUNDLE: PASS / 11 pages
NORMAL_OPERATOR_MANUAL_SOURCE_FILES: 1
LOGIC_VALIDATION: PASS — 390/390
WORK_0021_RUNTIME_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
STRATEGY_RESET_REQUIRED: NO
```

Shared Drive/domain-user qualification remains a later company-environment gate. Do not make it a CODEX-02 blocker and do not use company/confidential data.

## Material finding A — interrupted first-install takeover

### Current defect

At the reviewed head, installer authorization treats the installation as “not installed” whenever `state.config` is absent. The first run writes `BOOTSTRAP_CONFIG_JSON`, then calls setup. If setup fails before persisted installation state contains `config`, a later run by a different editor whose active and effective identities match can enter the first-install path and overwrite the bootstrap administrator with themselves.

The existing partial-resume test uses the same identity and does not prove cross-user takeover rejection.

### Required contract

The first verified installer identity must become an atomic, persistent ownership latch before setup/resource mutation begins.

Use the smallest safe integration with the existing bootstrap/property/setup architecture. Reusing the existing bootstrap administrator as the latch is preferred when it can be made atomic and unambiguous; a dedicated non-secret property is acceptable when simpler and safer.

Required behavior:

1. acquire an installer/script lock before inspecting or claiming first-install ownership;
2. on the first valid run, require non-empty active identity and active == effective;
3. persist exactly one normalized initial installer/administrator identity before setup mutation;
4. never overwrite an existing valid owner/bootstrap merely because `state.config` is still absent;
5. on an interrupted install, allow only the same latched identity to resume;
6. reject a different identity before any property/resource/status mutation;
7. fail closed when latch, bootstrap admin and completed installation config disagree or are malformed/ambiguous;
8. after successful setup, require the latched owner to remain in the authoritative administrator list;
9. for the existing personal-DEV pre-latch qualification install only, allow a one-time migration/backfill by a currently authorized administrator under the same lock; do not generalize this into arbitrary ownership replacement;
10. do not return or display the owner email in normal user-visible readiness output.

A concurrent first-run claim must not result in last-writer-wins ownership.

### Required deterministic tests

At minimum prove:

- first installer is latched before setup mutation;
- original installer can resume after an injected partial failure;
- a different active/effective user cannot resume or replace the owner;
- rejection occurs before property/resource/status mutation;
- concurrent/second claim cannot overwrite the first;
- malformed or conflicting latch/bootstrap/config fails closed;
- completed pre-latch install can be migrated only by an existing authoritative administrator;
- normal rerun remains idempotent and creates zero duplicates.

## Material finding B — false Web App readiness

### Current defect

`hasWebAppDeployment()` currently reduces to `Boolean(ScriptApp.getService().getUrl())`. The installer then returns `READY` and says the Web App can be shared whenever any URL exists.

The normal company contract requires the administrator to deploy with the approved restricted access and execution identity. URL existence alone does not prove those settings. Therefore an incorrectly broad deployment could be reported as ready/shareable.

### Required low-friction contract

Do not add the Apps Script API, a new Advanced Service, a new OAuth scope, or a remote management dependency merely to inspect deployment configuration.

Implement an explicit guarded administrator attestation for deployment security, preferably an editor-visible no-argument wrapper named:

`confirmKnowledgeShareDeploymentSecurity()`

Equivalent naming is acceptable only if the operator flow is equally clear.

Required behavior:

1. normal pages must not reference the confirmation wrapper;
2. it must be treated as externally callable and enforce active-user administrator authorization server-side before mutation;
3. it must require an existing versioned Web App URL;
4. running it is an explicit administrator attestation that the administrator manually verified:
   - execute as the deploying/owner account;
   - access restricted to the approved company/domain audience;
5. persist only safe attestation metadata, bound at least to the current Web App URL/deployment identity and confirmation timestamp; never store credentials;
6. before attestation, a detected Web App URL must produce `ACTION_REQUIRED` (or another clearly non-ready state), never `READY` and never “shareable” wording;
7. after valid attestation, `checkKnowledgeShareReadiness()` may return `READY` and state that deployment settings were administrator-confirmed;
8. if the Web App URL/deployment identity changes, invalidate the prior attestation;
9. documentation must state that any later manual deployment-setting change requires re-attestation, because the ordinary runtime cannot independently inspect both access and execute-as settings;
10. forged/normal-user invocation must fail before attestation or status mutation.

Do not pretend that manual attestation is an API-level verification. The status and guide must describe it accurately.

### Required deterministic tests

At minimum prove:

- no Web App URL -> `READY_FOR_DEPLOYMENT`;
- URL exists but no matching admin attestation -> not READY / `ACTION_REQUIRED`;
- normal user or blank identity cannot attest;
- authorized administrator can attest and then receive `READY`;
- attestation is bound to the observed URL/deployment identity;
- changed URL invalidates attestation;
- normal HTML/client code cannot call or expose the wrapper;
- public-surface validation classifies it as a guarded operator entry point;
- no new OAuth scope, Advanced Service, or Gmail dependency is introduced.

## Material finding C — mutable global collision gate

### Current gap

The bundle validator rejects duplicate top-level function declarations, but it does not currently detect duplicate top-level mutable global declarations. The accepted distribution design requires both function-name and global-definition collision checks because Apps Script/JavaScript `var` redeclarations can parse successfully while silently replacing state.

### Required contract

Add a deterministic top-level global-declaration inventory for bundle source:

- detect `var`, `let`, and `const` declarations at top level without being confused by comments, strings, regex literals, templates, or nested scopes;
- fail on duplicate mutable global names;
- fail on function/global name collisions;
- allow an exception only through a tiny explicit reviewed allowlist with a code comment explaining why the duplicate is semantically identical and safe;
- add negative synthetic tests proving the gate catches duplicates/collisions;
- keep the existing real bundle green without weakening source coverage or parse checks.

Do not introduce a large parser dependency solely for this check unless the existing lightweight scanner cannot be made trustworthy.

## Source and release requirements

After scoped changes:

1. regenerate the release kit from modular `src/`;
2. update `dist/KnowledgeShare.bundle.gs`, `dist/appsscript.json`, `dist/INSTALL.md`, and `dist/release-manifest.json` deterministically;
3. update payload hash, final-file checksum, source inventory and size metrics;
4. verify two clean builds are byte-identical;
5. preserve the one-file operator flow;
6. preserve AI providers and recurring AI sync disabled by default;
7. preserve no Gmail scope;
8. preserve Work 0021 behavior and do not call OpenAI/Gemini.

Required validation:

```text
npm run check:bundle
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken existing assertions merely to pass.

## Bounded target-runtime qualification

Use only the existing isolated personal-DEV Work 0023 qualification installation or one clearly isolated replacement if the existing artifact cannot safely be upgraded. Do not touch the accepted Work 0021 runtime.

Authorize at most:

```text
ISOLATED_APPS_SCRIPT_NEW_VERSIONS: 1
ISOLATED_EXISTING_WEB_APP_UPDATES: 1
NEW_WORK_0021_VERSIONS_OR_DEPLOYMENTS: 0
OPENAI_API_CALLS: 0
GEMINI_API_CALLS: 0
```

Required native campaign:

1. paste/deliver the exact regenerated bundle once and exact-readback it;
2. prove `installKnowledgeShare`, `checkKnowledgeShareReadiness`, and the deployment-security confirmation wrapper are selectable;
3. preserve the existing install resources or use one fresh isolated set, with no duplicate resources;
4. prove a Web App URL without attestation is not reported `READY`;
5. manually verify the restricted deployment settings used in this isolated environment, run the guarded admin attestation, then prove readiness becomes `READY`;
6. rerun installer/readiness and prove duplicates remain zero;
7. render representative top-level pages from the exact bundle, including `Index` and `KnowledgeSearch`; broad 11-page rerender is optional unless a regression appears;
8. prove no Work 0021, provider, company, or confidential resource mutation;
9. Trash any newly created isolated failed artifact; do not permanently delete it.

A different-user runtime test is not required when no safe second identity exists; deterministic hostile-call coverage is mandatory and must be reported distinctly from native evidence.

## Scope / stop rule

After the three exact gaps close and bounded validation passes, STOP.

Do not extend CODEX-02 into:

- Shared Drive/domain-user company qualification;
- separate knowledge/control permission redesign;
- Gemini recovery;
- large-file recovery;
- historical migration;
- CI implementation;
- Chrome chooser repair;
- cosmetic installer UI work;
- exhaustive browser/page testing.

Route those separately. Do not create CODEX-03 for non-blocking refinements.

## Required GitHub delivery

Create/update:

- `docs/handoffs/0023-CODEX-02-installer-owner-latch-and-deployment-readiness-security-report.md`;
- `docs/handoffs/0023-dispatches.md`;
- `docs/handoffs/0023-instruction.md`;
- `docs/handoffs/0023-report.md`;
- `docs/operations/company-bundle-installation.md`;
- `docs/operations/runtime-artifact-locator.md`;
- affected decisions/standards only where required for accurate attestation wording;
- PR #35 body.

Commit and push all scoped changes. Keep PR #35 Draft/Open/unmerged. Do not merge it.

## Completion latch

```text
FIRST_INSTALL_OWNER_LATCH: PASS | FAIL
PARTIAL_INSTALL_CROSS_USER_TAKEOVER_REJECTION: PASS | FAIL
ATOMIC_FIRST_OWNER_CLAIM: PASS | FAIL
WEB_APP_URL_ONLY_READY_REJECTION: PASS | FAIL
DEPLOYMENT_SECURITY_ADMIN_ATTESTATION: PASS | FAIL
ATTESTATION_URL_BINDING_AND_INVALIDATION: PASS | FAIL
NORMAL_USER_ATTESTATION_REJECTION: PASS | FAIL
MUTABLE_GLOBAL_COLLISION_GATE: PASS | FAIL
BUNDLE_BUILD_AND_HASHES: PASS | FAIL
BUNDLE_TEST_PARITY: PASS | FAIL
ONE_PASTE_SAVE_AND_EXECUTE: PASS | FAIL
INSTALLER_IDEMPOTENCY: PASS | FAIL
OAUTH_AND_SERVICE_PARITY: PASS | PARTIAL_ENVIRONMENT_LIMITATION | FAIL
FRESH_INSTALL_OR_UPGRADE: PASS | PARTIAL_ENVIRONMENT_LIMITATION | FAIL
FRESH_INSTALL_LOCATION: PERSONAL_DEV_ONLY
WEB_APP_RENDER_FROM_BUNDLE: PASS | FAIL
WORK_0021_RUNTIME_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
LOGIC_VALIDATION: PASS | FAIL
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_MERGE: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

## Mandatory final response

The final Codex response must begin and end with:

```text
WORK_ID: 0023
DISPATCH_ID: 0023-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```
