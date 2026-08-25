# Apps Script-first Implementation Delivery Decision

Work ID: 0003

Date: 2026-08-16

Status: Accepted, environment/delivery method updated 2026-08-26

Current environment and qualification policy: `docs/decisions/target-runtime-first-development.md`

## Decision

Knowledge Sharing PlatformsはGoogle Apps Scriptを本番runtimeとするApps Script-first方式で実装する。

ChatGPTが全体設計、GitHub、scope、Work ID、handoff、review、completionを所有し、Codexは非自明なApps Script実装、logic validation、target-runtime synchronization、native smoke、runtime debugging等の残作業へ限定する。

## Setup decision

通常導入時に利用者 / 管理者が以下を手作業で組み立てない。

- `Private Assets Knowledge / Meeting Records / Pitchbooks`
- backend Spreadsheet
- separate Audit Spreadsheet
- `GP_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settings`
- Master seeds
- schema / Settings
- required installable triggers

管理者がApps Script初期化関数を実行し、create / reuse / migrate / validateする。

Setup is idempotent and also serves as repair / migration path.

## Manual boundary

Manual administrator actions are limited to organization / OAuth / deployment boundaries:

- organization-controlled Apps Script project create / select
- standard Google Cloud project link
- Advanced Drive Service / Drive API enablement
- company-approved Gemini / Cloud environment enablement
- Shared Drive knowledge parent folder preparation
- Restricted admin-only control folder preparation
- initial OAuth consent
- Web App deployment to authorized users
- approved production credential configuration

Initial execution preference is Web App running as organization-controlled deployer so backend permissions are centralized.

Persistent actual-user identification is not required. Audit Actor is best-effort per `docs/decisions/audit-access-and-user-attribution.md`.

The application does not silently create Shared Drives, Cloud projects, organization approvals, credentials, OAuth consent, or Web App deployments.

## Runtime / tooling boundary

- Apps Script V8 compatible plain JavaScript
- `.gs / .html / appsscript.json` managed in GitHub
- no production requirement for TypeScript, bundler, external server, Node.js, or clasp
- clasp / local tests may be used by developer / Codex
- isolate Apps Script service dependencies behind thin adapters where practical
- production source path and actual Apps Script / Workspace behavior are the target-runtime source of truth
- local mocks, fixtures, and test loaders may prove logic but may not supply production behavior absent from the target source/runtime

## Audit boundary

Audit is stored in a separate Google Spreadsheet under a Restricted admin-only control folder.

- no normal-user direct access
- no mandatory Web App Audit Viewer initially
- no custom password auth required
- Drive sharing permissions are the access boundary
- Actor: email → temporary active user key → `UNIDENTIFIED`
- missing persistent identity is not a release blocker

## Upload boundary

Initial limits:

```text
25MB / file
10 files / selection
100MB / selection total
```

100MB/file and 500MB/batch are withdrawn.

Do not add chunk upload / complex resumable transport / Cloud fallback merely to preserve a larger arbitrary limit. If 25MB is impractical in Apps Script, lower the limit first.

## Environment decision — updated 2026-08-26

別DEV projectを先に完成させてからPRODへ移植する方式は、今後の標準ではない。

- actual target Apps Script / Workspace / Web App shapeを最初から使用する
- synthetic / anonymized test dataと隔離されたtest resourcesを使用する
- production/confidential data、real users、Gemini billing、installable triggers、destructive operations、public exposure等は別にguardする
- `LOGIC_VALIDATION`と`TARGET_RUNTIME_QUALIFICATION`を別々に記録する
- 別DEV/Staging runtimeは、対象runtime内のresource isolationやguardでは安全性・証拠を得られないmaterial reasonがある場合のみ採用する

Target runtimeを使うことはproduction dataまたはproduction side effectsを使うことではない。

進行中のWork 0014は既存のevidence boundaryで完了または停止し、その後の新規Workから本判断を適用する。

## Prospective delivery sequence

新規Workの標準:

1. bounded preflight
2. shortest coherent vertical slice in production source path / target runtime
3. isolated test data / resources and guarded side effects
4. focused local/static/unit/contract validation
5. bounded Apps Script / Workspace / browser native smoke and persisted readback
6. observed runtime defect repair before feature expansion
7. separately authorized production data, users, billing, trigger, and destructive effects

Historical Works 0004–0014 and their DEV evidence remain valid historical records. They do not require renaming or retrospective reclassification.

Detailed current execution source: `docs/decisions/target-runtime-first-development.md` and `docs/planning/apps-script-implementation-plan.md`.

## Rationale

- Google Workspace is already the authoritative operating environment.
- Apps Script-first minimizes production prerequisites.
- idempotent setup reduces manual drift and simplifies repair / migration.
- separate Restricted Audit Spreadsheet removes the need for Web App audit-access UI.
- best-effort Actor removes unnecessary coupling between user identity and backend access.
- lower upload limits avoid architecture that has no demonstrated business value.
- target-runtime-first vertical slices expose Apps Script / Workspace incompatibilities before broad feature expansion.
- logic validation remains fast while no longer being treated as proof of native runtime behavior.

## Non-goals

- setup-only external Web application
- production-required Node.js / local server
- parallel runtime outside Apps Script without demonstrated need
- per-user Spreadsheet / Web App copy
- strict persistent user identity
- custom audit password system
- Web App Audit Viewer initially
- generic production reset / destructive teardown
- 100MB/file support in initial release
- storing credentials / organization-specific IDs in GitHub
- production/confidential data-first development
- removing logic/unit/contract tests

Work ID: 0003
