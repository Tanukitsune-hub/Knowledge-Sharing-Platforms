# Apps Script-first Implementation Plan

Work ID: 0003 (historical planning origin; current Work status is tracked by active handoffs and pull requests)

Initial date: 2026-08-16

Current policy date: 2026-08-26

Status: Active implementation plan under `docs/decisions/target-runtime-first-development.md`

The former feature-complete → final DEV qualification sequence is superseded. Historical Works 0004–0014 and their evidence remain valid records and are not rewritten.

## 1. Goal

Knowledge Sharing Platformsを、Google Apps Script / Google Workspace / Shared Drive / Gemini File Searchを最終runtimeとする単一のproduction-shaped applicationとして完成させる。

今後は別DEV runtimeの完成を中間ゴールにせず、最短のend-to-end sliceをactual target runtimeで早期に実行する。logic testsは維持しつつ、test harnessだけに存在するhelper、data shape、permission、API、browser behaviorをproduction readinessと誤認しない。

本番利用者 / 管理者にNode.js、clasp、外部server等を要求せず、通常導入はApps Script / Google Workspaceで完結させる。

## 2. Current delivery principle

標準フロー:

```text
bounded preflight
   ↓
shortest coherent vertical slice in production source path
   ↓
actual target runtime + isolated test data/resources
   ↓
focused LOGIC_VALIDATION
   ↓
bounded TARGET_RUNTIME_QUALIFICATION
   ↓
fix observed incompatibility before expanding scope
   ↓
separately authorize production data / users / billing / triggers / destructive effects
```

原則:

- 実装開始前の調査は、target runtime、既決仕様、write boundary、最初のsliceを確定するのに必要な範囲に限定する。
- feature-completeまでApps Script / Workspace / browser evidenceを後ろ倒ししない。
- target runtimeを使うこととproduction/confidential dataやreal usersを使うことを混同しない。
- 別DEV/Staging runtimeは、対象runtime内のresource isolationやguardでは得られないmaterial safety / regulatory / blast-radius / rollback / concurrency / scale / cost / platform evidenceがある場合のみ採用する。
- CI、mock、fixture、simulator、test loader、alternate runtimeのPASSだけでruntime-dependent WorkをREADYにしない。

Detailed decision: `docs/decisions/target-runtime-first-development.md`

## 3. Target runtime

```text
Authorized users
      |
      v
Apps Script HTML Service Web App
  ├─ Meeting: New / Past
  ├─ Pitchbook: New / Past
  ├─ Knowledge Search
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ Master Management
      |
      v
Google Apps Script V8
      |
 +----+------------------------------+
 |                                   |
 v                                   v
Backend Spreadsheet             Shared Drive sources
5 sheets                        Meeting Records / Pitchbooks
                                     |
                                     v
                              Gemini File Search
                                     |
                                     v
                              Gemini Flash
                                     |
                                     v
                       grounded output + citations

Separate restricted Audit Spreadsheet
```

Actual Apps Script, Web App deployment shape, Drive / Sheets / Docs behavior, browser behavior, Gemini API behavior, and Shared Drive behavior are target-runtime concerns. A local JavaScript harness may verify pure logic but cannot substitute for them.

## 4. Runtime, data, and side-effect boundary

### TARGET_RUNTIME

- organization-controlled standalone Apps Script project
- final Apps Script V8 source and manifest
- final Web App execution/deployment shape
- Google Workspace APIs and Shared Drive semantics
- supported browser UI behavior
- company-approved Gemini / File Search environment when that capability is in scope

### ISOLATED_TEST_DATA

- synthetic or appropriately anonymized data only
- clearly identifiable test folders, Spreadsheets, Documents, records, IDs, metadata, account, or namespace
- exact resource IDs read back before mutation; do not select by guess or ambiguous name
- no real folder IDs, Drive IDs, deployment IDs, private URLs, account identifiers, or credentials in GitHub
- no test records mixed into authoritative production records

### SIDE_EFFECT_STATE

The following remain separately disabled, guarded, test-only, or explicitly authorized:

- installable triggers
- billing-enabled Gemini / File Search operations
- confidential source indexing
- external recipients
- broad Web App access or public exposure
- physical delete / bulk update / retention purge
- production data migration
- irreversible permission changes

Use existing idempotency, exact-ID checks, bounded counts, allowlists, inactive deployment, test recipient, dry-run, and rollback routes where practical.

## 5. Responsibility model

### ChatGPT

- user outcome / scope / accepted design / completion
- GitHub source of truth
- Work ID / Dispatch ID / handoff / PR coordination
- target runtime, test-data, side-effect, and authorization boundary
- ambiguity resolution before external execution
- Codex result review
- BLOCKER / FOLLOW_UP / OPTIONAL classification
- final readiness judgment

### Codex

Use only for work that benefits from repository/runtime access, including:

- non-trivial Apps Script / HTML implementation
- multi-file edits
- focused deterministic tests
- exact-source Apps Script synchronization
- bounded target-runtime smoke/readback
- runtime defect diagnosis and repair
- final diff and regression validation

Do not make implementation wait for a separate environment unless the handoff records a material staging justification.

## 6. Setup and manual prerequisites

Manual administrator work is limited to organization / OAuth / deployment boundaries:

1. create or select the organization-controlled target Apps Script project;
2. link the approved Google Cloud project;
3. enable Advanced Drive Service / Drive API;
4. prepare the Shared Drive knowledge parent folder;
5. prepare a restricted control folder for backend / Audit resources;
6. complete initial OAuth consent;
7. create or update the authorized Web App deployment;
8. configure approved Gemini / Google Cloud credentials only when AI qualification is authorized.

The application does not silently create Shared Drives, Cloud projects, organization approvals, credentials, OAuth consent, or Web App deployments.

Organization-specific IDs and credentials remain outside source control. Initial setup uses approved runtime configuration / Script Properties.

## 7. Setup entry points and safety

Editor-only/private entry points:

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Normal users cannot call them through `google.script.run`.

`setupKnowledgePlatform_()` creates / reuses / migrates / repairs:

- `Private Assets Knowledge / Meeting Records / Pitchbooks`
- Backend Spreadsheet
- separate Audit Spreadsheet
- `GP_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settings`
- Master seeds
- schema version / settings
- required installable triggers only when the side-effect boundary authorizes them

Safety rules:

- stored resource ID first;
- exact-name search only when no stored ID exists;
- ambiguous duplicate candidates fail rather than guess;
- forward migration by `SCHEMA_VERSION`;
- stable-ID seed upsert;
- trigger deduplication by handler + type;
- no generic production reset or destructive teardown;
- exact target/resource readback before mutation.

## 8. Runtime source strategy

- Apps Script V8 compatible plain JavaScript
- `.gs / .html / appsscript.json` managed in GitHub
- no production-required TypeScript / bundler / framework / external server
- clasp is optional developer/Codex tooling
- Apps Script service dependencies remain behind thin adapters where practical
- pure logic remains locally testable
- external services use mocks / fixtures / contract tests for deterministic coverage
- production business helpers must live in production source; test loaders may not inject missing production behavior
- native `Date`, Blob, Drive object, permission, browser, and service behavior must be represented by target-runtime evidence where material

## 9. Prospective Work slicing

Each new feature or repair should identify the smallest coherent slice that can be persisted and read back in the target runtime.

Typical slice order:

1. schema / contract change;
2. production service path;
3. one UI or editor entry path;
4. one create/update operation using isolated data;
5. persisted readback / reopen / search;
6. focused regression;
7. broader surfaces only after the slice passes.

Examples:

- Meeting field: schema + create + reopen + search before export/AI expansion
- Pitchbook field: prepare/upload or maintenance + persisted readback before broad batch cases
- AI metadata: one synthetic source index/query/citation path before all formats/modes
- trigger behavior: private handler logic first; actual trigger enablement remains separately authorized
- file/permission behavior: one isolated source and exact-ID readback before batch expansion

Do not define “test environment completion” as a user outcome.

## 10. Validation strategy

### LOGIC_VALIDATION

Use focused deterministic checks for:

- syntax / static validation
- schema / migration / idempotent setup
- public-surface allowlist
- ID / sequence / filename normalization
- validation / filtering / shared draft state
- retry / partial failure / optimistic locking
- audit payload / redaction / safe errors
- Actor fallback
- EML parsing / normalization
- Gemini request / response / metadata mapping
- Knowledge Export limits / link integrity / prompt generation
- representative regression tests

Run the canonical repository check after targeted checks when change risk justifies it:

```text
npm run check
git diff --check
```

### TARGET_RUNTIME_QUALIFICATION

Run the smallest native evidence required for the changed slice, such as:

- exact tested source synchronized to the intended Apps Script project;
- one immutable version/deployment update where deployment is in scope;
- create / persist / reopen / edit / search / link readback;
- actual Sheets `Date` / Drive file / Docs link / browser state behavior;
- actual Shared Drive parentage or permission behavior when material;
- Gemini index/query/citation behavior only when billing and credentials are authorized;
- final count / ID / duplicate / audit integrity readback.

Do not repeat every deterministic test in Apps Script. Native evidence should settle runtime-dependent decisions that local tests cannot.

### Reporting

```text
LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
READY: YES | NO
```

Record application defect, target-runtime capability gap, automation limitation, infrastructure failure, and deferred side effect separately.

## 11. Historical implementation map

The following Works remain historical implementation/evidence routes, not the current delivery sequence:

- 0004: Apps Script scaffold + idempotent setup
- 0005: Meeting vertical slice
- 0006: Pitchbook vertical slice
- 0007: maintenance / concurrency / Masters
- 0008: Gemini File Search foundation + free question
- 0009: six formats / EML / five modes
- 0010: consolidated synthetic DEV qualification
- 0011: Gemini-independent Knowledge Export / external-AI handoff
- 0012: Apps Script public-surface and reliability hardening
- 0013: DEV qualification / recovery history
- 0014: structured Meeting/Pitchbook context foundation and current bounded repair

Work 0014 finishes or safely stops under its existing PR #17 evidence boundary. New Work applies this plan prospectively.

## 12. Remaining genuine choices

Only decisions that materially affect the outcome remain open, including:

- concrete approved Gemini model / credential / billing route when AI live qualification begins;
- retry batch size / backoff / rate-limit / cost guardrails based on observed runtime behavior;
- safe practical upload limit if actual Apps Script behavior requires a lower value;
- specific rollout / permission / cleanup route when production data and users are introduced;
- whether a future high-risk migration or concurrency campaign uniquely requires a separate staging runtime.

Already accepted product contracts are not reopened merely because target-runtime qualification is pending.

## 13. Stop and strategy-reset conditions

Stop or reset when:

- target identity / authorization cannot be established safely;
- continuation would require confidential/production data, broad exposure, billing, trigger enablement, destructive cleanup, or permission change outside authorization;
- the same failure class persists after bounded materially different attempts;
- a test helper / mock / alternate runtime is supplying behavior absent from production source or target runtime;
- the required change materially contradicts Shared Drive / Index / security contracts;
- evidence-sensitive qualification would be contaminated by retry;
- the next proposed action does not change acceptance, next action, safety, cost, integrity, or reversibility.

Do not stop merely because user email is unavailable, a temporary Actor key rotates, hosted CI is unavailable, an optional feature remains, or a lower safe upload limit is observed.

## 14. Completion condition

A runtime-dependent Work is complete when:

- the usable outcome exists in production source paths;
- required logic validation passes;
- required target-runtime smoke/readback passes using isolated data/resources;
- side-effect state is explicit;
- no unresolved BLOCKER remains;
- non-blocking residuals are routed without expanding current scope.

Production rollout additionally requires the authorization, data/access boundary, credential, permission, rollback, and side-effect evidence applicable to that rollout. A Work may be complete with production data/users/triggers/billing still disabled when rollout is not the primary outcome.

Work ID: 0003
