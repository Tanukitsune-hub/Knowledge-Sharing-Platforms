# Work 0023 — generated Apps Script bundle and low-friction installer

WORK_ID: `0023`

Status: `PLANNED`

Mode: `BUILD / QUALIFICATION`

Recommended sequence: after Work 0021 feature/search completion and before historical-material migration and final company-environment qualification.

Authoritative decision:

`docs/decisions/modular-source-single-bundle-distribution.md`

Reusable standard:

`docs/standards/apps-script-bundle-installer-standard.md`

## Primary outcome

Deliver a reproducible release path that preserves the modular GitHub source while allowing a non-specialist to install Knowledge Sharing Platforms into a fresh company Google Workspace environment with one Apps Script code paste, one installer run, and only the platform steps that cannot safely be automated.

The normal operator must not create dozens of `.gs`/`.html` files, edit bootstrap JSON, handle raw resource IDs, run Node.js/Git/`clasp`, or understand the internal architecture.

## Acceptance evidence — ranked

1. Fresh company-like Shared Drive target-runtime install from the generated bundle.
2. Existing modular-source application behavior remains unchanged.
3. Bundle-mode Web App renders all pages and supports representative end-to-end flows.
4. `installKnowledgeShare()` is idempotent and creates no duplicates on rerun.
5. Bundle/source/manifest hashes and file coverage are reproducible from one Git commit.
6. Existing deterministic tests pass in source mode and bundle mode.
7. Installer/readiness messages are usable by a non-specialist.

## Fastest safe decisive action

Implement the build pipeline and HTML-resource loader abstraction first, without changing business logic or resource architecture. Prove one page renders from the generated single-file bundle in an isolated fresh Spreadsheet before expanding installer automation.

## Current-state assessment

The current repository is a good development architecture and should remain intact:

- server logic is split by responsibility across many `.gs` files;
- the Web App is split across multiple `.html` pages and partials;
- `kspRunSetup_()` already owns create/reuse/migration/repair;
- `kspRunValidation_()` already owns most structural readiness checks;
- the manifest declares V8, explicit scopes, Advanced Drive v3, and Web App defaults;
- `setupKnowledgePlatform_()` is private and requires bootstrap configuration before first setup;
- deterministic validation parses individual source and client scripts.

The two main distribution gaps are:

1. file-based HTML loading prevents a naive `.gs` concatenation from being self-contained;
2. a pasted `.gs` cannot configure the manifest, enable Advanced Drive, or create the first Web App deployment.

These gaps are addressed directly rather than by replacing the modular source.

## Scope

### In scope

- deterministic bundle generator;
- embedded HTML resource map;
- modular/bundle template loader abstraction;
- generated release manifest and install guide;
- public editor-only installer/readiness entry points;
- automatic default config from the container Spreadsheet and its parent;
- reuse of existing setup/validation engine;
- idempotent resource/trigger/config handling;
- release/version/hash recording;
- source-mode and bundle-mode tests;
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
- automatically creating the first Web App deployment from the script runtime;
- using a personal Drive template as the company install source;
- introducing an external database, package runtime, or app framework;
- forcing a risky Drive-adapter rewrite solely to remove one service-enable click.

## Proposed repository changes

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

Exact file names may change after implementation inventory, but the architectural boundaries above are fixed.

## Build design

### 1. Source order

Use an explicit reviewed source-order manifest. Every authoritative server `.gs` file must appear exactly once. The build fails on:

- missing source;
- duplicate source;
- unknown source not covered by the order contract;
- distribution/test/local file included accidentally.

Do not depend on raw lexicographic ordering because numeric prefixes such as `10_` and `100_` are not a sufficient universal ordering contract.

### 2. HTML embedding

Generate one inert resource map, conceptually:

```javascript
var KSP_BUNDLED_HTML_RESOURCES = Object.freeze({
  Index: "...",
  Styles: "...",
  ClientCore: "..."
});
```

Use JSON-safe string generation; never hand-escape HTML.

Development source uses the existing files. Bundle mode uses the map through:

```text
kspCreateHtmlTemplate_(name)
kspReadHtmlResource_(name)
```

`doGet()` and `include_()` use these functions. No client code is executed as server code during bundling.

### 3. Release metadata

The generated bundle begins with a non-secret deterministic header containing:

```text
product
release version
schema version
source Git commit
bundle profile
bundle SHA-256
```

The same source commit/profile must produce identical bytes. Do not inject wall-clock timestamps unless they derive deterministically from the source commit.

### 4. Release publication

Preferred release path:

- CI builds and validates the distribution kit;
- accepted release tags publish the four `dist/` files as GitHub Release assets;
- the large bundle does not need to pollute every normal source diff;
- a local `npm run build:bundle` path remains available without Google credentials.

If release automation is deferred, a generated `dist/` commit is acceptable only when freshness and hash checks are enforced.

## Installer design

### Public functions

```javascript
function installKnowledgeShare() {}
function checkKnowledgeShareReadiness() {}
```

These functions are deliberately visible in the Apps Script editor function selector. They must not be exposed through `google.script.run` in normal pages.

### Default install profile

The release bundle uses safe production defaults:

```text
environment: PROD
AI providers: disabled
AI recurring sync: disabled
installable triggers: only mandatory enabled registry entries
knowledge/control parent: host Spreadsheet parent by default
timezone: Asia/Tokyo
admin: installing user where identity is available
```

No API key is included in the bundle.

### Installation transaction

`installKnowledgeShare()` should:

1. verify a Spreadsheet-bound project;
2. acquire the existing setup lock;
3. verify required authorization and Advanced Drive availability;
4. infer the host Spreadsheet and parent folder;
5. construct the existing bootstrap config in memory;
6. call the existing setup engine;
7. call the existing validation engine;
8. verify version/schema/resource parentage and duplicate absence;
9. inspect Web App deployment state;
10. write/update a human-readable `KnowledgeShare_Installation` sheet;
11. record release version, schema version, source commit, and bundle hash in installation state/Settings;
12. return one bounded status object.

Do not create a second resource orchestration implementation.

### Human-readable status

The installation sheet and return object should show:

```text
状態
次に行うこと
保存先
作成・再利用した主な項目
アプリ版
スキーマ版
Web App URL（存在する場合）
```

Primary statuses:

```text
INSTALLING
READY_FOR_DEPLOYMENT
READY
ACTION_REQUIRED
FAILED
```

Do not require the operator to inspect execution logs or raw JSON for normal recovery.

### Advanced configuration

Normal installation uses the host Spreadsheet parent. A collapsed/optional advanced path may accept folder URLs for:

- knowledge parent;
- restricted control parent.

The UI converts URLs to IDs internally. Raw IDs are never required in the normal guide.

### Idempotency

Rerunning the installer must:

- reuse stored authoritative resource IDs;
- reuse exact-name resources when safe;
- avoid duplicate folders/Spreadsheets/rows/triggers;
- migrate append-only schema changes;
- preserve existing non-secret config unless a deliberate supported change is requested;
- return the same ready state when no repair is needed;
- fail safely on ambiguous duplicate resources rather than guessing.

## Manifest and Advanced Drive decision gate

Current source requires Advanced Drive v3. Work 0023 must inventory all advanced-service calls.

Decision order:

1. keep the current Advanced Drive path if it remains the lowest-risk Shared Drive implementation;
2. normal manual install then includes one simple `Drive API` service-add step;
3. generate `dist/appsscript.json` for technical/clasp installation;
4. only remove Advanced Drive if a small adapter change can preserve every required Shared Drive behavior and pass the full target-runtime matrix.

A one-click service step is preferable to a broad data-access refactor.

## Web App deployment boundary

The installer cannot create the first Web App deployment through the normal script runtime. The guide therefore contains one manual step with the approved production settings.

Before deployment:

```text
READY_FOR_DEPLOYMENT
```

After deployment and successful readback:

```text
READY
```

The default company setting should be organization/domain-only access, subject to final production authorization. The installer/readiness check must not broaden access automatically.

## Gmail labels and optional resources

No Gmail label is required by the current product. Do not add Gmail scopes or labels.

The reusable installer framework may define a declarative resource registry for other projects, but Knowledge Share registers only its actual folders, Spreadsheets, schemas, Settings, optional provider resources, and explicitly enabled triggers.

## Deterministic validation matrix

### Build integrity

- every `.gs` source included once;
- every `.html` source embedded once;
- deterministic order;
- source boundary map complete;
- repeated build byte-identical;
- bundle and manifest SHA-256 recorded;
- no secrets/private IDs/local paths.

### Syntax and collision safety

- each modular `.gs` parses;
- combined bundle parses;
- embedded client scripts parse;
- duplicate top-level function names rejected;
- duplicate top-level mutable global names rejected or explicitly justified;
- template/include references resolve;
- no dangerous top-level Google service call, network call, trigger creation, mutation, or installer execution.

Safe static constant initialization such as `Object.freeze(...)` may be allowlisted; service/API side effects may not.

### Behavior parity

- public facade list identical in modular and bundle modes;
- representative setup/Meeting/Pitchbook/maintenance/workspace/analytics/relationship/AI/full-output tests run against the bundle-loaded environment;
- existing `npm run check` remains green;
- new `npm run check:bundle` remains green;
- bundle loader renders `Index` and `KnowledgeSearch` templates;
- no source-only HTML dependency remains in bundle mode.

### Installer behavior

- fresh installation creates/reuses the expected structure;
- rerun produces no duplicate resource;
- interrupted install can resume;
- ambiguous duplicates stop safely;
- optional features disabled do not block core readiness;
- enabled-but-unconfigured optional provider reports route-specific action, not false global readiness;
- stored version/hash matches the installed bundle;
- release upgrade uses the same installer repair/migration path.

### Target-runtime qualification

Use a fresh isolated Spreadsheet in a test Shared Drive or equivalent company-like environment:

1. paste only the bundle code;
2. add Advanced Drive service if required;
3. run installer once;
4. authorize;
5. confirm resource hierarchy and schema;
6. rerun installer and prove idempotency;
7. manually deploy one private/domain-restricted Web App;
8. confirm readiness `READY`;
9. render all top-level pages;
10. run one synthetic Meeting and one synthetic Pitchbook end-to-end;
11. verify no personal Drive template/cross-account dependency;
12. verify rollback/reinstall instructions.

## Planned company installation guide

```text
1. 共有ドライブの導入先フォルダで新しいGoogleスプレッドシートを作る
2. 拡張機能 → Apps Scriptを開く
3. 必要な場合だけ、サービス「Drive API」を1回追加する
4. Code.gsの既存内容を削除し、KnowledgeShare.bundle.gsを1回貼り付ける
5. 関数一覧から installKnowledgeShare を選び、実行する
6. Google権限を承認する
7. スプレッドシートの「KnowledgeShare_Installation」で READY_FOR_DEPLOYMENT を確認する
8. デプロイ → 新しいデプロイ → ウェブアプリを1回設定する
9. checkKnowledgeShareReadiness を実行し、READYを確認する
10. Web App URLを社内利用者へ共有する
```

The final guide includes screenshots only if they materially reduce mistakes; the authoritative textual steps and exact release hash remain sufficient.

## Work sequence

```text
0020 AI provider core and easy OpenAI setup
-> 0021 structured Knowledge Search / provider parity / six-format matrix
-> 0023 generated bundle + installer + fresh-install qualification
-> historical-material migration decision/execution
-> final company Shared Drive/users/providers/permissions qualification
```

The bundle framework may be implemented earlier if it does not slow current feature completion, but the production release bundle is cut only after the intended feature surface is frozen.

## Completion latch

Work 0023 is complete only when:

```text
SOURCE_ARCHITECTURE: MODULAR / PRESERVED
BUNDLE_BUILD: PASS / REPRODUCIBLE
BUNDLE_TEST_PARITY: PASS
INSTALLER_IDEMPOTENCY: PASS
FRESH_SHARED_DRIVE_INSTALL: PASS
WEB_APP_RENDER_FROM_BUNDLE: PASS
COMPANY_INSTALL_GUIDE: PASS
NORMAL_OPERATOR_MANUAL_SOURCE_FILES: 1
BLOCKER: NO
```

Residual manual platform actions must be listed accurately. A one-file code paste is not misrepresented as a zero-click deployment.
