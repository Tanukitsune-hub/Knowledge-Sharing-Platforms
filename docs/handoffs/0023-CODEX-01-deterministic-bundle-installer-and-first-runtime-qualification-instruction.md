# Work 0023 — CODEX-01 deterministic bundle, installer core, and first runtime qualification

WORK_ID: `0023`
DISPATCH_ID: `0023-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`

## 1. Primary outcome

Preserve the modular GitHub `src/` architecture while delivering a reproducible generated Apps Script release kit that lets a non-specialist install Knowledge Share with one code paste, one installer run, and only unavoidable Google platform steps.

This Dispatch should implement the shortest coherent vertical slice and, if the target runtime remains available, continue through the first fresh-install qualification rather than stopping after code generation alone.

## 2. Authoritative baseline

GitHub is the source of truth.

Accepted Work 0021 baseline:

```text
WORK_0021: ACCEPTED
PR_34_MERGE: 533c849bd1229827ec77cd5ad6506312ea286940
ACCEPTED_PRIVATE_WEB_APP_VERSION: 66
WORK_0021_LOGIC: 376/376 PASS
OPENAI_SIX_FORMAT_MATRIX: PASS — 6/6
FULL_OUTPUT_SIX_FORMAT_REFERENCE_PARITY: PASS
BLOCKER: NONE
```

Do not reopen or mutate the accepted Work 0021 runtime. Existing version 67 is an unused/not-deployed operational residual and is out of scope.

Read before implementation:

- nearest `AGENTS.md` files;
- `docs/decisions/modular-source-single-bundle-distribution.md`;
- `docs/decisions/bundle-integrity-and-installer-security.md`;
- `docs/planning/work0023-bundle-installer-distribution.md`;
- `docs/standards/apps-script-bundle-installer-standard.md`;
- `docs/operations/company-bundle-installation.md`;
- `docs/operations/runtime-artifact-locator.md`.

## 3. Fixed product boundaries

- `src/` remains authoritative, modular, and human-maintained.
- `dist/KnowledgeShare.bundle.gs` is generated only; never hand-edit it.
- All HTML resources required by the Web App must be embedded inertly in bundle mode.
- Source mode and bundle mode use one resource-loader abstraction.
- Business behavior from accepted Works 0020/0021/0025 must remain unchanged.
- `installKnowledgeShare()` and `checkKnowledgeShareReadiness()` are the intended editor-visible installer/readiness wrappers.
- Installer reuses the existing setup/validation engine rather than reimplementing resource creation logic.
- AI providers and recurring AI synchronization are disabled by default in a fresh install.
- Do not add Gmail labels or Gmail scopes.
- The normal company install must not depend on personal Drive templates, Git, Node.js, terminal, `clasp`, raw resource IDs, or many manual Apps Script files.
- The ordinary script runtime cannot create its first Web App deployment; represent this honestly as an explicit readiness/manual platform step unless a currently supported managed route is already available and proven.

## 4. Required implementation

### 4.1 Deterministic build pipeline

Implement the equivalent responsibilities of:

```text
scripts/build-apps-script-bundle.cjs
scripts/validate-apps-script-bundle.cjs
scripts/bundle-source-order.json
```

The exact file names may vary only if repository conventions clearly require it.

The build must:

1. use an explicit reviewed source-order manifest, never raw filesystem ordering;
2. require every authoritative server `.gs` source exactly once;
3. require every authoritative `.html` resource exactly once;
4. fail on missing, duplicate, unknown, generated, local-only, test, or confidential inputs;
5. emit deterministic bytes from the same Git commit/profile;
6. include no timestamps, local paths, credentials, private runtime IDs, test fixture data, or secret-bearing URLs.

### 4.2 HTML resource embedding and loader parity

Implement one abstraction such as:

```text
kspCreateHtmlTemplate_(name)
kspReadHtmlResource_(name)
```

Requirements:

- modular mode continues reading Apps Script HTML files;
- bundle mode reads a generated inert `KSP_BUNDLED_HTML_RESOURCES` map or equivalent;
- `doGet()` / `include_()` / page composition use the abstraction;
- bundled client HTML/JS remains text until served by `HtmlService` and is never evaluated as server source during bundling;
- all top-level pages and includes resolve in both modes.

### 4.3 Release kit and hashes

Generate:

```text
dist/KnowledgeShare.bundle.gs
dist/appsscript.json
dist/INSTALL.md
dist/release-manifest.json
```

The release metadata contains only deterministic, non-secret values:

```text
product
release version
schema version
source Git commit
bundle profile
hash canonicalization version
bundle_payload_sha256
```

Use the accepted non-self-referential contract:

- `bundle_payload_sha256`: hash canonical bundle bytes with the payload-hash field replaced by a fixed versioned placeholder;
- `bundle_file_sha256`: hash final emitted `KnowledgeShare.bundle.gs` bytes and store it in `release-manifest.json`.

The release manifest also records ordered source inventory, relevant source/manifest hashes, bundle byte/character/line counts, server source count, and embedded HTML count.

### 4.4 Guarded installer/readiness wrappers

Implement:

```javascript
function installKnowledgeShare() {}
function checkKnowledgeShareReadiness() {}
```

Treat both as externally invocable top-level functions.

Before any installer mutation:

1. require Spreadsheet-bound context;
2. require non-empty active-user identity;
3. first install requires an unambiguous active/effective-user identity boundary and persists the active user as initial installer/admin;
4. after installation state exists, require the active user in the authoritative admin allowlist;
5. fail closed before setup mutation if identity/authorization is ambiguous;
6. never authorize merely because the Web App executes as deploying user.

No normal product page should reference these wrappers.

The installer must infer safe defaults from the bound Spreadsheet and parent, construct the existing setup config in memory, call the existing setup engine, then call existing validation/readiness logic.

Default install profile:

```text
environment: PROD
AI providers: disabled
AI recurring sync: disabled
timezone: Asia/Tokyo
admin: verified installing active user
knowledge/control parent: host Spreadsheet parent by default
```

It must create/update a human-readable `KnowledgeShare_Installation` sheet with bounded states:

```text
INSTALLING
READY_FOR_DEPLOYMENT
READY
ACTION_REQUIRED
FAILED
```

Show human-readable state/next action/release/schema/profile/hash and safe resource summary. Do not require raw JSON or expose private IDs unnecessarily.

### 4.5 Idempotency

A second authorized installer run must not duplicate:

- folders;
- Backend/Audit Spreadsheets;
- sheets;
- seeds/options;
- triggers;
- configuration rows;
- deployments or provider resources.

Reuse exact stored authoritative IDs and existing setup/migration logic. Ambiguous duplicates fail closed rather than guessing.

Interrupted/partial install must safely resume through the same existing repair/migration path.

## 5. Deterministic validation

Add focused tests for at least:

### Build integrity

- complete `.gs`/`.html` coverage exactly once;
- deterministic repeated build byte identity;
- payload hash recomputation;
- final-file checksum recomputation;
- manifest/source inventory hashes;
- no secret/private-ID/local-path/test-data leakage;
- combined bundle parses;
- embedded client scripts parse;
- no duplicate top-level function or unjustified mutable-global collision;
- no dangerous top-level Google service/network/trigger/provider/installer execution;
- all template/include names resolve.

### Source/bundle parity

Run representative accepted behavior in bundle-loaded mode, including at least:

- Web App top-level render contract;
- Meeting path;
- Pitchbook path;
- maintenance/workspace/analytics/relationship surface;
- Knowledge Search and FULL_OUTPUT facade;
- accepted AI/model-policy facades without live provider calls.

Normal-user facade parity must hold; installer wrappers are separately classified guarded admin entry points.

### Installer security and behavior

Prove:

- forged/normal browser call cannot mutate installer state;
- blank active identity is rejected;
- first-run active/effective identity ambiguity is rejected;
- authorized first install proceeds;
- authorized rerun creates no duplicates;
- interrupted install can resume;
- ambiguous duplicates stop safely;
- optional disabled providers do not block core readiness;
- stored release/schema/source/profile/payload hash matches the exact bundle.

Run at minimum:

```text
npm run check
npm run check:bundle   # add this or an equivalent canonical bundle gate
python tools/validate_agent_foundation.py
git diff --check
```

## 6. Exact one-paste feasibility gate

This is a product gate, not a documentation assumption.

Record exact generated bundle:

```text
byte count
character count
line count
server source count
embedded HTML resource count
```

Using the exact generated artifact, prove in a fresh isolated Apps Script project that it can be:

1. pasted as one source file;
2. saved successfully;
3. parsed successfully;
4. expose `installKnowledgeShare` and `checkKnowledgeShareReadiness` in the editor function list;
5. execute the readiness/installer wrapper after required authorization.

If the exact single-file artifact cannot be pasted, saved, parsed, selected, or executed because of a current Apps Script/editor/runtime limit, STOP with:

```text
BLOCKER: ONE_PASTE_APPS_SCRIPT_PLATFORM_LIMIT
STRATEGY_RESET_REQUIRED: YES
```

Do not silently convert the normal operator flow back to many manual source files.

## 7. Bounded target-runtime qualification

Do not mutate the accepted Work 0021 runtime.

Create at most one fresh isolated Work-0023 qualification installation set, clearly named/prefixed as synthetic DEV qualification. Prefer an available test Shared Drive or equivalent company-like Shared Drive surface. If no safe Shared Drive target is available, use an isolated personal DEV Spreadsheet only for the first one-paste/installer slice and report the missing Shared-Drive qualification explicitly; do not mislabel it as complete company qualification.

Allowed fresh-install side effects are limited to the resources the installer itself normally creates inside that isolated installation boundary.

Prohibited in this Dispatch:

- confidential or production source material;
- OpenAI/Gemini live indexing or query calls;
- creation of provider Stores solely for installer testing;
- mutation of Work 0021 Backend/Audit/knowledge folders or deployment;
- personal Drive template dependency;
- broad cleanup outside the isolated Work-0023 qualification boundary.

Qualification sequence, as far as the environment allows:

1. create/select one fresh host Spreadsheet in the isolated target folder;
2. paste exact generated bundle once;
3. save and verify functions are selectable;
4. add Advanced Drive v3 only if still required by the accepted source contract;
5. run installer once and authorize;
6. verify OAuth/service behavior, including no unintended Gmail scope;
7. verify created/reused resource hierarchy and schema;
8. rerun installer and prove idempotency;
9. if feasible, perform the required one-time Web App deployment with restricted/private access;
10. run readiness and render representative top-level pages from the bundle;
11. prove forged normal-user installer invocation is rejected;
12. prove no personal Drive template/cross-account dependency.

If an unavoidable native user action is required, keep the same `0023-CODEX-01` and return:

```text
BALL: USER
STATUS: ACTION_REQUIRED
```

with one exact user action only. Do not create a new Dispatch for a user-assisted step inside the same active execution.

## 8. GitHub delivery

Use branch:

`agent/0023-bundle-installer-distribution`

Create/update:

- `docs/handoffs/0023-CODEX-01-deterministic-bundle-installer-and-first-runtime-qualification-report.md`;
- `docs/handoffs/0023-dispatches.md`;
- `docs/handoffs/0023-instruction.md`;
- `docs/handoffs/0023-report.md`;
- `docs/operations/runtime-artifact-locator.md` when material Work-0023 artifacts/runtime identities are created;
- `docs/operations/company-bundle-installation.md` if the actual tested install steps differ from planning;
- relevant planning/decision docs only when implementation evidence changes the accepted design.

Open or update one Draft PR to `main`. Do not merge it.

Do not broaden into Gemini recovery, large-file recovery, historical migration, or general UI hardening.

## 9. Stop / strategy reset rules

STOP rather than papering over the problem if:

- exact bundle cannot fit/paste/save/execute as one Apps Script source;
- source/bundle behavior materially diverges;
- installer authorization can be bypassed;
- installer rerun duplicates authoritative resources;
- release hashes/coverage are not reproducible;
- actual OAuth/scopes/services materially exceed the approved contract;
- the only apparent fix requires redesigning accepted business logic or data architecture.

Cosmetic installer UX, CI absence, optional screenshots, release automation, and specialist deployment tooling are not blockers if the normal install path is proven.

## 10. Completion latch

```text
SOURCE_ARCHITECTURE: MODULAR_PRESERVED | FAIL
BUNDLE_BUILD: PASS | FAIL
SOURCE_ORDER_AND_COVERAGE: PASS | FAIL
HTML_EMBED_AND_LOADER_PARITY: PASS | FAIL
BUNDLE_PAYLOAD_HASH: PASS | FAIL
BUNDLE_FILE_CHECKSUM: PASS | FAIL
RELEASE_MANIFEST: PASS | FAIL
BUNDLE_PARSE: PASS | FAIL
BUNDLE_TEST_PARITY: PASS | FAIL
INSTALLER_AUTHORIZATION: PASS | FAIL
INSTALLER_FIRST_RUN_IDENTITY_GATE: PASS | FAIL
INSTALLER_IDEMPOTENCY: PASS | FAIL
INSTALLER_PARTIAL_RESUME: PASS | FAIL
NORMAL_OPERATOR_MANUAL_SOURCE_FILES: 1 | FAIL
BUNDLE_BYTE_COUNT: <number>
BUNDLE_CHARACTER_COUNT: <number>
BUNDLE_LINE_COUNT: <number>
ONE_PASTE_SAVE_AND_EXECUTE: PASS | FAIL | NOT_RUN
OAUTH_AND_SERVICE_PARITY: PASS | PARTIAL_ENVIRONMENT_LIMITATION | FAIL
FRESH_INSTALL: PASS | PARTIAL_ENVIRONMENT_LIMITATION | FAIL | NOT_RUN
FRESH_INSTALL_LOCATION: SHARED_DRIVE_LIKE | PERSONAL_DEV_ONLY | NOT_RUN
WEB_APP_RENDER_FROM_BUNDLE: PASS | PARTIAL_ENVIRONMENT_LIMITATION | FAIL | NOT_RUN
RERUN_DUPLICATES_CREATED: 0 | <number>
WORK_0021_RUNTIME_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
LOGIC_VALIDATION: PASS | FAIL
GITHUB_CI_ACTUALLY_RAN: YES | NO
STRATEGY_RESET_REQUIRED: NO | YES
READY_FOR_CHATGPT_REVIEW: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
PR: <number/state>
```

The final Codex response must begin and end with:

```text
WORK_ID: 0023
DISPATCH_ID: 0023-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

If stopped for a native user action, use `BALL: USER` / `STATUS: ACTION_REQUIRED` instead.
