# Work 0023 — generated Apps Script bundle and low-friction installer

WORK_ID: `0023`

Status: `PLANNED / READY_FOR_IMPLEMENTATION`

Mode: `BUILD / QUALIFICATION`

Recommended sequence: after Work 0021 feature/search completion and before historical-material migration and final company-environment qualification.

Authoritative decisions:

- `docs/decisions/modular-source-single-bundle-distribution.md`
- `docs/decisions/bundle-integrity-and-installer-security.md`

Reusable standard:

`docs/standards/apps-script-bundle-installer-standard.md`

## 1. Primary outcome

Deliver a reproducible release path that preserves the modular GitHub source while allowing a non-specialist to install Knowledge Sharing Platforms into a fresh company Google Workspace environment with one Apps Script code paste, one installer run, and only the platform steps that cannot safely be automated.

The normal operator must not create dozens of `.gs`/`.html` files, edit bootstrap JSON, handle raw resource IDs, run Node.js/Git/`clasp`, use a personal Drive template, or understand the internal architecture.

## 2. Acceptance evidence — ranked

1. Fresh company-like Shared Drive target-runtime install from the exact generated bundle.
2. Exact one-paste save, function selection, and execution in the target Apps Script editor/runtime.
3. Existing modular-source application behavior remains unchanged.
4. Bundle-mode Web App renders all pages and supports representative end-to-end flows.
5. `installKnowledgeShare()` is authorized, fail-closed, idempotent, and creates no duplicates on rerun.
6. Bundle/source/manifest coverage and hashes are reproducible from one Git commit/profile.
7. Actual OAuth scopes and Advanced Service behavior match the approved product contract.
8. Existing deterministic tests pass in source mode and bundle mode.
9. Installer/readiness messages are usable by a non-specialist.

## 3. Fastest safe decisive action

Implement the deterministic build pipeline and HTML-resource loader abstraction first, without changing business logic or resource architecture. Generate the smallest complete bundle and prove that one top-level page renders from the exact single-file artifact in an isolated fresh Spreadsheet before expanding installer automation.

If the exact generated file cannot be pasted, saved, parsed, or executed as one Apps Script source file, stop and perform a Strategy Reset. Do not silently convert the normal operator flow back into many manual files.

## 4. Current-state assessment

The existing development architecture is good and remains authoritative:

- server logic is split by responsibility across many `.gs` files;
- the Web App is split across multiple `.html` pages and partials;
- `kspRunSetup_()` already owns create/reuse/migration/repair;
- `kspRunValidation_()` already owns most structural readiness checks;
- setup already uses a lock, exact stored IDs, exact-name reuse, ambiguity failure, schema repair, seed upsert, trigger de-duplication, and persisted installation state;
- the manifest declares V8, explicit OAuth scopes, Advanced Drive v3, and Web App defaults;
- `setupKnowledgePlatform_()` and existing validation/status entry points are private;
- deterministic validation parses individual source and client scripts.

The distribution gaps are:

1. file-based HTML loading prevents a naive `.gs` concatenation from being self-contained;
2. a pasted `.gs` cannot configure the manifest, enable Advanced Drive, or create the first Web App deployment;
3. editor-visible installer wrappers are technically callable by name from HTML Service and therefore require server-side authorization;
4. the exact one-file artifact must be proven to fit the current Apps Script editor/runtime;
5. final-file checksums need a non-self-referential design.

## 5. Scope

### In scope

- deterministic bundle generator;
- explicit source-order and coverage contract;
- embedded inert HTML resource map;
- modular/bundle template loader abstraction;
- generated release manifest and install guide;
- guarded editor-visible installer/readiness entry points;
- automatic default config from the container Spreadsheet and its parent;
- reuse of the existing setup/validation engine;
- idempotent resource/trigger/config handling;
- release/schema/source/payload-hash recording;
- canonical payload hash plus final-file checksum;
- source-mode and bundle-mode tests;
- manifest/OAuth/Advanced Service parity checks;
- bundle size metrics and exact one-paste qualification;
- fresh target-runtime installation and rerun qualification;
- one-time company installation instructions;
- optional generated manifest/technical deployment route;
- reusable cross-project distribution standard.

### Non-goals

- rewriting the application as one hand-maintained file;
- changing Meeting/Pitchbook/AI business behavior;
- moving authoritative data away from Shared Drive;
- replacing the five-sheet Backend or separate Audit architecture;
- making Gmail labels a Knowledge Share dependency;
- enabling AI providers or recurring sync by default;
- automatically creating the first Web App deployment from the ordinary script runtime;
- introducing an external database, package runtime, or app framework;
- forcing a risky Drive-adapter rewrite solely to remove one service-enable click;
- weakening public-surface or administrator authorization to make installation appear simpler.

## 6. Proposed repository changes

```text
scripts/build-apps-script-bundle.cjs
scripts/validate-apps-script-bundle.cjs
scripts/bundle-source-order.json

tests/bundle-generation.test.cjs
tests/bundle-runtime-parity.test.cjs
tests/installer.test.cjs

dist/                         generated locally / CI / release
  KnowledgeShare.bundle.gs
  appsscript.json
  INSTALL.md
  release-manifest.json

src/00_DistributionResources.gs or equivalent
  modular/bundle HTML loader contract

src/90_WebApp.gs
  use loader abstraction rather than direct file-only calls

src/99_EntryPoints.gs or dedicated installer entry file
  installKnowledgeShare()
  checkKnowledgeShareReadiness()
```

Exact names may change after implementation inventory, but these responsibility boundaries are fixed.

## 7. Build design

### 7.1 Source order and coverage

Use an explicit reviewed source-order manifest. Every authoritative server `.gs` file and HTML resource must appear exactly once. The build fails on:

- missing source;
- duplicate source;
- unknown source not covered by the contract;
- accidental inclusion of distribution, test, local, evidence, or confidential files.

Do not rely on filesystem or raw lexicographic ordering.

### 7.2 HTML embedding

Generate one inert resource map using JSON-safe string generation, conceptually:

```javascript
var KSP_BUNDLED_HTML_RESOURCES = Object.freeze({
  Index: "...",
  Styles: "...",
  ClientCore: "..."
});
```

Use one loader contract:

```text
kspCreateHtmlTemplate_(name)
kspReadHtmlResource_(name)
```

- modular mode reads Apps Script HTML files;
- bundle mode reads the generated resource map;
- `doGet()` and `include_()` use the same abstraction;
- client code remains HTML text until served through `HtmlService` and is never evaluated as server code during bundling.

### 7.3 Release metadata and hashes

The generated bundle header contains only deterministic, non-secret metadata:

```text
product
release version
schema version
source Git commit
bundle profile
hash-canonicalization version
bundle_payload_sha256
```

Do not embed an ordinary SHA-256 of the final file inside the same final bytes.

Use:

```text
bundle_payload_sha256
  hash over canonical bundle bytes with the payload-hash field replaced by a fixed versioned placeholder

bundle_file_sha256
  hash over the final emitted KnowledgeShare.bundle.gs bytes
```

`dist/release-manifest.json` records both hashes plus the ordered source inventory and source/manifest hashes. The installer records release version, schema version, source commit, profile, and payload hash. No wall-clock timestamp enters deterministic output.

### 7.4 Size and one-paste feasibility

The release manifest records at least:

```text
bundle byte count
bundle character count
bundle line count
server source count
embedded HTML resource count
```

Release qualification must use the then-current platform constraints and prove the exact artifact can be pasted once, saved, parsed, selected in the function list, and executed. An assumed or historical Apps Script limit is not sufficient evidence.

### 7.5 Release publication

Preferred path:

- CI builds and validates the kit;
- accepted release tags publish the four `dist/` files as GitHub Release assets;
- a local `npm run build:bundle` path requires no Google credentials;
- large generated bundles do not need to pollute every source diff.

If release automation is deferred, a generated `dist/` commit is acceptable only with freshness and hash gates.

## 8. Installer design

### 8.1 Editor-visible wrappers and security

```javascript
function installKnowledgeShare() {}
function checkKnowledgeShareReadiness() {}
```

These names are visible in the editor function selector and are not referenced by normal HTML pages. However, any top-level function without a trailing underscore is treated as externally invocable.

Before any mutation, the installer wrapper must:

- require a container-bound Spreadsheet;
- require a non-empty active-user identity;
- on first install, require unambiguous active/effective-user identity and persist the active user as initial installer/administrator;
- after installation state exists, require the active user in the authoritative administrator allowlist;
- never authorize merely because the Web App executes as the deploying user;
- fail closed before `kspRunSetup_()` when identity or authorization is ambiguous;
- return a safe status/action without private IDs.

All setup, validation, migration, trigger, provider, and Drive helpers remain private. Tests must prove forged normal-user browser calls and unidentified callers cannot mutate state.

### 8.2 Default install profile

```text
environment: PROD
AI providers: disabled
AI recurring sync: disabled
installable triggers: only mandatory enabled registry entries
knowledge/control parent: host Spreadsheet parent by default
timezone: Asia/Tokyo
admin: verified installing active user
```

No credential, API key, Store ID, deployment ID, or private URL is included in the bundle.

### 8.3 Installation transaction

`installKnowledgeShare()` should:

1. acquire the installer lock, verify Spreadsheet-bound context and authorization, and atomically latch the first installer identity;
2. verify required services and dependency state;
3. infer the host Spreadsheet and parent folder;
4. construct the existing bootstrap config in memory;
5. call the existing setup engine, using its lock and idempotent resource logic rather than duplicating it;
6. call the existing validation engine;
7. verify version/schema/resource parentage and duplicate absence;
8. require a guarded administrator security attestation bound to the current versioned Web App identity without broadening access;
9. write/update a human-readable `KnowledgeShare_Installation` sheet;
10. record release/schema/source/profile/payload-hash metadata;
11. return one bounded readiness object.

### 8.4 Human-readable state

The sheet and return object show:

```text
状態
次に行うこと
保存先
作成・再利用した主な項目
アプリ版
スキーマ版
配布元commit/profile/payload hash
Web App URL（存在する場合）
```

States:

```text
INSTALLING
READY_FOR_DEPLOYMENT
READY
ACTION_REQUIRED
FAILED
```

Normal recovery must not require execution logs or raw JSON.

### 8.5 Idempotency

Rerunning the installer must:

- reuse stored authoritative resource IDs;
- reuse exact-name resources when safe;
- avoid duplicate folders, Spreadsheets, sheets, seed rows, labels, triggers, and deployments;
- migrate append-only schema changes;
- preserve existing non-secret user configuration;
- return the same ready state when no repair is needed;
- resume safely after partial failure;
- fail on ambiguous duplicate resources rather than guessing.

## 9. Manifest, OAuth, and Advanced Drive gate

Current source requires Advanced Drive v3. Inventory every advanced-service call before considering removal.

Decision order:

1. keep Advanced Drive if it remains the lowest-risk Shared Drive implementation;
2. normal install then contains one clear `Drive API` service-add step;
3. generate `dist/appsscript.json` for technical/managed installation;
4. remove Advanced Drive only if a small adapter change preserves every required Shared Drive behavior and passes full target-runtime qualification.

Fresh-install qualification must prove:

- Advanced Drive availability where required;
- V8 and `Asia/Tokyo` behavior;
- actual requested/granted scopes remain within the approved product contract;
- no unintended Gmail scope;
- Drive, Docs, Sheets, trigger-management, and external-request functions operate after authorization;
- generated manifest semantic parity for the selected profile.

A JavaScript parse pass is not manifest/OAuth/service readiness.

## 10. Web App deployment boundary

The ordinary installed script cannot create its first Web App deployment. The normal guide therefore retains one manual deployment with the approved company access setting.

Before deployment:

```text
READY_FOR_DEPLOYMENT
```

After manual verification of execute-as/company access settings, guarded administrator attestation, and successful readback/render:

```text
READY
```

The installer/readiness check never broadens access automatically. A Web App URL without matching attestation is `ACTION_REQUIRED`, not `READY`. A changed URL invalidates the prior attestation, and later manual deployment-setting changes require re-attestation even when the URL is unchanged.

## 11. Optional resources

Knowledge Share does not currently require Gmail labels. Do not add Gmail scopes or labels.

A reusable registry may support labels or other resources for later projects, but Knowledge Share registers only its actual folders, Spreadsheets, schemas, Settings, optional provider resources, and explicitly enabled triggers. Zero recurring AI triggers is a valid core-ready state.

## 12. Deterministic validation matrix

### Build integrity

- every authoritative `.gs` included once;
- every authoritative `.html` embedded once;
- deterministic reviewed order;
- complete source boundary map;
- repeated build byte-identical;
- canonical payload hash recomputes;
- final-file checksum recomputes;
- manifest/source hashes complete;
- byte/character/line/resource counts recorded;
- no secrets, private IDs, local paths, or test data.

### Syntax and collision safety

- each modular `.gs` parses;
- combined bundle parses;
- embedded client scripts parse;
- duplicate top-level functions rejected;
- duplicate mutable globals rejected or specifically justified;
- every template/include resolves;
- no dangerous top-level Google service, network, trigger, mutation, provider, or installer execution;
- only deterministic pure initialization may be allowlisted.

### Behavior and facade parity

- modular and bundle normal-user facades match;
- guarded installer entry points are explicitly classified, not mistaken for ordinary facades;
- representative setup, Meeting, Pitchbook, maintenance, workspace, analytics, relationship, AI, and full-output tests run against bundle-loaded source;
- existing `npm run check` remains green;
- new `npm run check:bundle` remains green;
- `Index` and `KnowledgeSearch` render in bundle mode;
- no file-only HTML dependency remains in bundle mode.

### Installer security and behavior

- no normal HTML references installer wrappers;
- forged normal-user call rejected before mutation;
- blank active identity rejected;
- first-run identity mismatch rejected;
- authorized first install succeeds;
- authorized rerun creates no duplicate;
- interrupted install resumes;
- ambiguous duplicates stop safely;
- optional disabled features do not block core readiness;
- enabled-but-unconfigured optional provider gives a route-specific action;
- stored release/schema/source/profile/payload hash matches the installed artifact;
- upgrade uses the same repair/migration path.

### Target-runtime qualification

Use a fresh isolated Spreadsheet in a test Shared Drive or equivalent company-like environment:

1. inspect the exact release manifest and checksum;
2. paste only the exact bundle code once;
3. save and prove the installer functions are selectable;
4. add Advanced Drive service if required;
5. run installer once and authorize;
6. verify OAuth/service behavior and no unexpected Gmail scope;
7. confirm resource hierarchy and schema;
8. rerun installer and prove idempotency;
9. manually deploy one private/domain-restricted Web App;
10. confirm readiness `READY`;
11. render all top-level pages;
12. run one synthetic Meeting and one synthetic Pitchbook end to end;
13. verify forged normal-user installer invocation is rejected;
14. verify no personal Drive template or cross-account dependency;
15. verify rollback/reinstall instructions.

## 13. Planned company installation guide

```text
1. 共有ドライブの導入先フォルダで新しいGoogleスプレッドシートを作る
2. 拡張機能 → Apps Scriptを開く
3. 必要な場合だけ、サービス「Drive API」を1回追加する
4. Code.gsの既存内容を削除し、KnowledgeShare.bundle.gsを1回貼り付けて保存する
5. 関数一覧から installKnowledgeShare を選び、実行する
6. Google権限を承認する
7. 「KnowledgeShare_Installation」で READY_FOR_DEPLOYMENT を確認する
8. デプロイ → 新しいデプロイ → ウェブアプリを1回設定する
9. 実行ユーザーと会社限定アクセスを手動確認し、confirmKnowledgeShareDeploymentSecurity を実行する
10. checkKnowledgeShareReadiness を実行し、READYを確認する
11. Web App URLを社内利用者へ共有する
```

The guide may include screenshots only when they measurably reduce errors. It must identify the exact release and checksum without asking the operator to understand internal source files.

## 14. Work sequence and completion latch

```text
0020 AI provider core and easy OpenAI setup
-> 0021 structured Knowledge Search / provider parity / six-format matrix
-> 0023 generated bundle + guarded installer + fresh-install qualification
-> historical-material migration decision/execution
-> final company Shared Drive/users/providers/permissions qualification
```

The framework may be developed earlier if it does not slow the active feature Work, but the production release bundle is cut only after the intended feature surface is frozen.

Work 0023 is complete only when:

```text
SOURCE_ARCHITECTURE: MODULAR / PRESERVED
BUNDLE_BUILD: PASS / REPRODUCIBLE
BUNDLE_TEST_PARITY: PASS
INSTALLER_IDEMPOTENCY: PASS
INSTALLER_UNAUTHORIZED_CALL_REJECTION: PASS
INSTALLER_FIRST_RUN_IDENTITY_GATE: PASS
BUNDLE_HASH_CANONICALIZATION: PASS
BUNDLE_FILE_CHECKSUM: PASS
OAUTH_AND_SERVICE_PARITY: PASS
ONE_PASTE_SAVE_AND_EXECUTE: PASS
FRESH_SHARED_DRIVE_INSTALL: PASS
WEB_APP_RENDER_FROM_BUNDLE: PASS
COMPANY_INSTALL_GUIDE: PASS
NORMAL_OPERATOR_MANUAL_SOURCE_FILES: 1
BLOCKER: NO
```

Residual manual platform actions must be listed accurately. One-file code delivery must not be misrepresented as zero-click deployment.
