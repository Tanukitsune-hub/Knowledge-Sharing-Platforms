# Target Architecture

Current as of: 2026-09-25

Status: Active

This document defines the accepted end-to-end architecture and responsibility boundaries. Delivery/qualification policy is governed by `docs/decisions/target-runtime-first-development.md`.

Google Workspace is authoritative. OpenAI/Gemini File Search indexes and Knowledge Export artifacts are derived/rebuildable. Production source paths are exercised in the actual target runtime with isolated data/resources and guarded effects.

AI routing and full-output decisions:

- `docs/decisions/ai-provider-selection-and-full-output.md`;
- `docs/ai/provider-neutral-file-search.md`.

## 1. Architecture overview

```text
Authorized users
        |
        v
Apps Script HTML Service Web App
  ├─ 記録を追加: 面談メモ / 資料保存 / ニュース / 評価（ICメモ、社内整理等）
  ├─ 過去の記録: 同じ4 sourceの検索 / 詳細 / 編集 / lifecycle
  ├─ Counterparty Summary
  ├─ Activity Analytics
  ├─ Relationship Explorer
  ├─ Knowledge Search
  │    ├─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  │    └─ ChatGPT / Gemini / 全文出力
  └─ Master Management
        |
        v
Google Apps Script V8
  ├─ validation / drafts / safe facade
  ├─ Docs generation and update
  ├─ source upload / rename / numbering
  ├─ Masters / Index maintenance
  ├─ concurrency / retry / schema migration
  ├─ Audit metadata
  ├─ canonical AI Source / Knowledge Request / Knowledge Package
  ├─ provider adapters
  │    ├─ OpenAI File Search
  │    └─ Gemini File Search
  └─ Copy / Google Docs / PDF full-output adapters
        |
   +----+--------------------------+--------------------------+
   |                               |                          |
   v                               v                          v
Backend Spreadsheet            Shared Drive              Derived AI/Export layer
  ├─ Counterparty_Master         ├─ 記録・資料                ├─ OpenAI Vector Store
  ├─ Option_Master               │  ├─ 面談記録              ├─ Gemini File Search Store
  ├─ Meeting_Index               │  ├─ 保存資料              └─ Knowledge Export artifacts
  ├─ Pitchbook_Index             │  ├─ ニュース
  ├─ News_Index                  │  └─ 評価（ICメモ、社内整理等）
  ├─ Internal_Assessment_Index   └─ Knowledge Exports（source root外）
  └─ Settings

Separate Restricted Audit Spreadsheet
```

## 2. Runtime, data, and exposure boundary

### Target runtime

The delivered system must work through:

- organization-controlled Apps Script V8 project/runtime;
- intended Web App execution/deployment shape;
- Google Drive / Shared Drive / Sheets / Docs semantics;
- supported browser behavior;
- every AI provider enabled by the target environment when AI is in scope.

Mocks, CI, test loaders, alternate Apps Script projects, or My Drive substitutes do not prove capabilities they did not execute.

### Isolated test data/resources

Qualification uses synthetic or appropriately anonymized test folders, Sheets, Docs, files, records, IDs, accounts, provider Stores/documents, and namespaces. Test records do not mix with authoritative company production records.

### Guarded side effects

Production/confidential data, real users, broad access, billing, triggers, physical delete, bulk migration, retention purge, and irreversible permission changes remain separately disabled/guarded until authorized.

A separate DEV/Staging runtime is optional, not the default. It requires a material safety, regulatory, segregation, blast-radius, rollback, concurrency, scale, cost, or platform reason that cannot be addressed through isolation and guards.

## 3. Responsibility boundaries

### Web App

The Web App is the normal-user interface. Only the explicit allowlisted facade is browser-callable. Setup, validation, installation status, diagnostics, triggers, raw adapters, retention, credentials, provider Store administration, and destructive helpers remain private/editor-only.

Production business helpers must exist in production source. A test loader may not supply missing production behavior.

### Shared Drive

```text
記録・資料
├─ 面談記録
├─ 保存資料
├─ ニュース
└─ 評価（ICメモ、社内整理等）
```

- Meeting Google Doc is authoritative for body text.
- 保存資料の原本ファイルを正本とする。standaloneの保存資料には親Meetingを設けない。
- NewsとInternal AssessmentはGoogle Docへの直接入力、またはupload原本1件のどちらか一方を正本とする。
- schema9 setupでは旧既定名に完全一致するfolderだけを保存済みIDで改名し、custom名は保持する。命名変更でfileの移動・複製をしない。
- Knowledge Exportsは正本source rootの外側に置く。
- AI indexes and Knowledge Export are derived and rebuildable.
- Source folders remain flat unless a concrete operating requirement changes the decision.

### Seven-sheet Backend (schema9)

1. `Counterparty_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `News_Index`
6. `Internal_Assessment_Index`
7. `Settings`

永続identityはrow番号・file名・URL・表示順ではなくstable IDとする。schema変更は可能な範囲でappend-onlyにする。Newsは`NEWS-`、Internal Assessmentは`ASMT-`を使い、各sourceのCounterparty IDをsort・deduplicateしたうえで1行のIndexに保持する。明示的な新決定なくrelation/entity/analytics/provider-state用の8枚目を追加しない。

### Restricted Audit

Audit is a separate Spreadsheet under a restricted control folder.

- no direct ordinary-user access;
- Drive permissions form the boundary;
- bounded metadata only;
- no Meeting body, Follow-up note, question, answer, source body, full-output body, chunks, embeddings, uploaded bytes, credentials, raw provider payloads, or private runtime IDs.

## 4. Setup and project identity

Private editor entry points:

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Setupはsource folder、Backend 7 sheet、Audit Spreadsheet、Masters、schema、Settings、許可済みtriggerを作成・再利用・移行・修復する。

Rules:

- stored exact resource ID first;
- exact-name lookup only without stored ID;
- fail on ambiguity;
- read back project/deployment/resource identity before mutation;
- preserve stable IDs and user-mutated durable data;
- no generic destructive reset;
- no private IDs, URLs, credentials, or local mappings in GitHub.

## 5. Counterparty entity architecture

Detailed decision:

`docs/decisions/counterparty-entity-classification.md`

Authoritative Counterparty identity:

```text
Counterparty_ID
```

Fixed category codes:

```text
GP
LP_ASSET_OWNER
NISSAY_INTERNAL
GROUP_COMPANY
CONSULTANT_GATEKEEPER
OTHER
```

Storage is the single `Counterparty_Master`. IDs are generic `CP-000001` values and type is a master attribute. GP is only the `GP` type. `Option_Master` counterparty rows and schema7 `GP_Master` are migration sources, not normal catalogs.

Meeting schema includes:

```text
Counterparty_Type
Counterparty_ID
```

Existing `GP_ID`, `Related_GP_IDs`, and row-level `Counterparty_Type` may remain for lossless migration compatibility, but normal behavior resolves name/type from `Counterparty_Master` and writes no GP relationship fields.

- existing `Counterparty` free text remains personal-name/role information.
- schema7 references are rewritten deterministically to generic CP IDs while stable Meeting/Doc/File identities are preserved.

Prospective required fields:

```text
Date
Counterparty
Asset Class
```

Optional fields include Time, Location, Equity/Debt, Team, Fund/Strategy, Meeting Types, Related Pitchbooks, Follow-up, person/role text, internal participants, and body notes.

Filename:

```text
YYYY-MM-DD_Counterparty_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Migration does not bulk-rename or rewrite existing Docs/files.

## 6. Pitchbook architecture

Pitchbook/material identity is Counterparty-centered.

Required:

```text
file
Date
Counterparty
Asset Class
```

Optional: Equity/Debt and Fund/Strategy.

Stable Document ID, Batch ID, File ID, persistent sequence, partial success, retry, and filename rules remain accepted.

Parent-bound material inherits the parent Meeting Counterparty; standalone material selects one Counterparty.

## 7. Relationship architecture

Canonical relationship:

```text
Meeting_Index.Related_Pitchbook_IDs
```

Related Pitchbook choices use matching Counterparty, matching Asset Class, and Active status for new selection.

Existing Inactive, unresolved, or now-out-of-scope links remain visible and preserved.

Work 0018 provides forward/reverse traversal by scanning/indexing this field. No relation sheet and no relationship inference by name/date/text.

## 8. Masters and maintenance

### Counterparty Master

Immutable generic CP ID, mutable display name, Counterparty Type, Active/Inactive, type-scoped normalized duplicate check, quick-add.

### Option Master

Normal Types include Location, Asset Class, Capital Type, and Team. Historical `COUNTERPARTY_*` rows may remain as lossless migration provenance only.

## 9. Workspaces and analytics

- Counterparty Summary absorbs the historical GP Workspace and Entity Workspace into one primary experience.
- Work 0017: activity analytics and narrow monthly administrative check.
- Work 0018: bidirectional Relationship Explorer.
- Work 0019 supplied the unified timeline and exact Fund/Strategy drill-down now used by Counterparty Summary.

Analytics reads `Meeting_Index`, not Meeting Doc bodies. Follow-up stays an informational flag/note; task owners/deadlines/completion/reminders are outside this platform.

## 10. Browser state and maintenance

4つのsource tabで共有する通常のAdd入力:

```text
Date
Asset Class
Fund / Strategy
```

既存のEquity / Debt fieldは内部値として保持する。Counterpartyの選択はsourceごとに独立させ、親Meetingに紐付く資料は親のCounterpartyを継承する。

通常の未保存入力は現在のbrowser tab内に保持し、reload後に自動復元しない。tab切替では共有fieldと各source固有の入力を保持し、保存成功時は保存したsource固有の入力だけを消す。global clearは4 tabを対象とするが、retry・unknown-outcome・partial-uploadの回復が未解決なら停止する。安全回復stateの期限付き保存は維持する。通常のlifecycleはActive/Inactive/Reactivateとし、stable IDとoptimistic lockingを維持する。

## 11. Provider-neutral AI source and request architecture

### User choices

Exactly:

```text
ChatGPT
Gemini
全文出力
```

Internal routes:

```text
OPENAI
GEMINI
FULL_EXPORT
```

No automatic cross-provider failover. A disabled/unconfigured provider returns a safe provider-specific error.

### Canonical AI Source

Meeting and Pitchbook metadata include:

```text
entity_key
counterparty_type
counterparty_id
counterparty_name
```

Canonical identity is:

```text
counterparty_id = CP-xxxxxx
counterparty_type = value resolved from Counterparty_Master
entity_key = COUNTERPARTY:<Counterparty_ID>
```

Existing metadata—source ID/type, date, Counterparty, Asset Class, Capital Type, Team, Fund/Strategy, Meeting Type, Follow-up, Drive URL, filename, and content hash—remains.

### Canonical Knowledge Request

One request model owns:

- selected route;
- mode;
- question/additional instruction;
- structured filters;
- selected Entities;
- source scope;
- request fingerprint.

### Canonical Knowledge Package

Full output resolves authoritative sources and builds one deterministic package. Copy, Google Docs, and PDF consume the same package and fingerprint.

The full-text preview is at the bottom of the section/page, fixed-height, and internally scrollable. `コピー / Google Docs / PDF` buttons appear above the body so users can output without reading or page-scrolling through it.

## 12. Provider adapters and Stores

### OpenAI

- user label: `ChatGPT`;
- OpenAI API and File Search/Vector Store;
- provider-native indexing/query/filter/citation/polling/cleanup inside the adapter.

### Gemini

- user label: `Gemini`;
- Gemini API and File Search Store;
- provider-native indexing/query/filter/citation/polling/cleanup inside the adapter.

Both normalize to one answer/citation model with stable source IDs and authoritative Drive links.

File Search is the required default source-reading path for both providers. Full-context API submission is not a substitute for this architecture.

## 13. Independent provider index state

OpenAI and Gemini derived state is independent. A single ambiguous `AI_Index_Status` cannot represent both providers.

Work0020のprovider-state移行はBackendが5 sheetだった時点の履歴である。schema9では既存Meeting/PitchbookのID・行・provider stateを維持し、`News_Index`と`Internal_Assessment_Index`を追加する。新sourceのprovider indexing/retrievalはWork0070 CODEX-01の対象外とする。各sourceが後にprovider対象となる場合も、`OPENAI`と`GEMINI`をkeyとする検証済みversion付きprovider-state objectを正本とする。

Per provider:

```text
document/store reference
NotIndexed / Pending / Indexed / Failed
indexed_at
content_hash
safe last error
```

Legacy fields remain preserved for compatibility/evidence; they are not destructively removed.

Server-side settings distinguish provider enablement, Store identity, and model alias. Credentials never enter GitHub, browser responses, Audit, exports, source files, or ordinary-user Sheets.

## 14. AI synchronization lifecycle

For each enabled provider independently:

### Registration

1. save authoritative source/Index;
2. mark provider state Pending;
3. return authoritative success independently;
4. bounded direct/private worker indexes;
5. success -> Indexed;
6. failure -> Failed without rollback.

### Update

Preserve stable source ID/Drive file, replace/supersede prior provider document, index current content/metadata, and avoid duplicate active documents.

### Inactivation / Reactivation

Inactive source exits normal retrieval. Reactivation indexes the current authoritative source.

### Rebuild

Derived Store documents may be deleted/rebuilt by exact provider/source identity without altering Drive sources.

A recurring sync trigger is not enabled in the personal-PC core. Schedule only under separate authorization.

## 15. Knowledge Search modes and filters

Modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

Planned filters:

```text
Date From / To
Counterparty Type
Counterparty
Asset Class
Equity / Debt
Team
Fund / Strategy
Meeting Type
要フォロー
Source Type
```

The canonical filter model is provider-neutral. Each adapter translates exact semantics or returns an explicit limitation. Comma substring matching is not treated as exact.

Comparison selects 2–5 Entities across categories. Numeric comparison remains in analytics; qualitative source-grounded comparison belongs to Knowledge Search.

## 16. Audit and redaction

Allowed bounded metadata:

```text
Timestamp
Actor
provider route
search mode
structured filter IDs
configured model alias
result
cited stable source IDs
safe error/limitation code
```

Current policy redacts question/additional-instruction text.

Do not store answers, retrieved chunks, source/full-output bodies, embeddings, uploaded bytes, credentials, raw provider payloads, or private Store identifiers.

## 17. Work 0020 and 0021

### Work 0020 — provider core

Qualifies:

- three-choice UI;
- provider-neutral contracts;
- independent provider state;
- OpenAI/Gemini File Search adapters;
- enabled-provider index/query/citation lifecycle;
- disabled-provider safe errors/no failover;
- full-output Copy/Docs/PDF parity and internal-scroll layout;
- update/inactivate/reactivate/delete/rebuild;
- cost/retry/rate-limit/retention evidence.

### Work 0021 — intended search product

Expands to:

- structured filters;
- five modes;
- 2–5 Entity comparison;
- per-Entity citations;
- enabled-provider parity matrices;
- full-output parity for the same filters/modes;
- accepted six-format bounded matrix.

## 18. Historical migration and production

Historical migration is manual-first. Selective automation is used only for repeatable subsets with clear benefit.

Final company production qualification occurs last and includes Shared Drive parentage/permissions, company Web App, Backend/Audit boundaries, real users, full-output artifacts/retention, and every AI provider enabled by company policy:

- approved credentials/billing;
- Store ownership/identity;
- indexing/query/filter/citation;
- update/inactivate/cleanup/retention;
- safe errors/no failover;
- scheduled triggers where authorized.

The company may enable OpenAI, Gemini, both, or neither. Personal-PC success is not company production readiness.

## 19. Validation architecture

Report separately:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

AI Works additionally report:

```text
OPENAI_RUNTIME / OPENAI_SEARCH_MATRIX
GEMINI_RUNTIME / GEMINI_SEARCH_MATRIX
FULL_OUTPUT_RUNTIME / FULL_OUTPUT_MATRIX
```

Logic validation covers schemas, transformations, identities, filenames, filters, relationships, retry, concurrency, redaction, provider contracts, and package parity.

Target-runtime qualification covers actual Apps Script, Workspace object shapes, persistence, Shared Drive parentage/permissions, Docs links, browser behavior, enabled-provider Stores/indexing/query/citations, full-output artifacts, and authorized trigger behavior.

## 20. Work sequence

Work 0014 remains the historical structured Meeting foundation. The sequence below is historical delivery order; Work 0031 supersedes its GP-specific normal-product assumptions with the Counterparty Master architecture above.

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0022 temporal data contract hardening
→ 0017 analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 AI provider core / OpenAI + Gemini File Search / full output
→ 0021 structured filters / five modes / multi-Entity / provider parity
→ historical migration
→ final production qualification
```
