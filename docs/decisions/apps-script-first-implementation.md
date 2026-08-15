# Apps Script-first Implementation Delivery Decision

Work ID: 0003

Date: 2026-08-16

Status: Accepted

## Decision

Knowledge Sharing PlatformsはGoogle Apps Scriptを本番runtimeとするApps Script-first方式で実装する。

ChatGPTが全体設計、GitHub、scope、Work ID、handoff、review、completionを所有し、Codexは非自明なApps Script実装、local test、development同期、実機検証、runtime debugging等の残作業へ限定する。

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

## Environment decision

DEV and PROD use separate Apps Script projects, deployments, Shared Drive resources, backend Spreadsheets, and Audit Spreadsheets.

DEV uses anonymous / synthetic data only. Production data is introduced only after phase qualification.

## Delivery sequence

1. Apps Script scaffold + idempotent setup
2. Meeting end-to-end
3. Pitchbook end-to-end
4. Past Records / Masters / concurrency / audit + Phase 1 qualification
5. Gemini File Search thin slice + 自由質問
6. 15-minute sync + six formats + EML
7. 要約 / 時系列 / 比較 / 面談準備 + production qualification

Detailed execution source: `docs/planning/apps-script-implementation-plan.md`.

## Rationale

- Google Workspace is already the authoritative operating environment.
- Apps Script-first minimizes production prerequisites.
- idempotent setup reduces manual drift and simplifies repair / migration.
- separate Restricted Audit Spreadsheet removes the need for Web App audit-access UI.
- best-effort Actor removes unnecessary coupling between user identity and backend access.
- lower upload limits avoid architecture that has no demonstrated business value.
- ChatGPT ownership + Codex residual execution avoids duplicated planning and open-ended implementation.

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

Work ID: 0003
