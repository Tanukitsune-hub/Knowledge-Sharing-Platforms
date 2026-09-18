# Product Vision

Current as of: 2026-09-18

Status: Active

## Purpose

プライベートアセット領域のMeeting recordsとPitchbook / source materialsを、利用者の入力負荷を抑えながら継続的に蓄積し、後から検索・修正・整理・要約・比較できる状態を作る。

Google Workspaceを正本・運用基盤とし、その上にOpenAI/Gemini File Searchを独立した再生成可能な検索レイヤーとして載せる。APIを使わない全文出力も同じ対象資料・指示・構造を使い、コピー、Google Docs、PDFへ安全に持ち出せる、シンプルで監査可能な業務ツールを目指す。

## Core user experience

通常利用者は、組織管理下の1つのApps Script HTML Service Web Appを共通URLから利用する。

主要surface:

1. `面談記録` — 新規登録 / 過去記録 / edit / lifecycle
2. `Pitchbook` — 新規登録 / 過去資料 / edit / lifecycle
3. `面談先サマリー`
4. `Activity Analytics`
5. `Relationship Explorer`
6. `ナレッジ検索`
7. `マスター管理`

通常利用者はBackend Sheets、Restricted Audit Spreadsheet、Provider Store、credentialsを直接操作しない。

## Meeting records

Required fields:

```text
Date
Counterparty
Asset Class
```

Counterparty Types:

```text
GP / 運用会社
LP / Asset Owner
日本生命
グループ会社
Consultant / Gatekeeper
その他
```

The user selects one Entity from `Counterparty_Master`. The option label makes its type understandable without a required type-first step.

- all organizations/departments use `Counterparty_Master` and generic `CP-*` IDs;
- GP is one `Counterparty_Type`, not a separate master/entity class;
- `Option_Master` is not a normal Counterparty catalog source;
- Existing free-text `Counterparty` remains `面談相手（氏名・役職）`.
- schema7 legacy fields remain migration compatibility only; normal create/edit/search does not depend on `GP_ID` or `Related_GP_IDs`.
- Existing Meetings remain valid without changing stable IDs/Docs/files.

Accepted optional fields include Time, Location, Equity/Debt, Team, Fund/Strategy, Meeting Type, Related Pitchbooks, follow-up/note, person/role, internal participants, and Meeting body.

Meeting body is authoritative in Google Docs and is not duplicated into `Meeting_Index`.

Fixed Meeting ID example:

```text
MTG-000123
```

Filename:

```text
YYYY-MM-DD_Counterparty_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Legacy filenames are not bulk-renamed.

## Pitchbooks / source materials

Pitchbook/source material uses the same Counterparty identity as Meeting.

Required:

- file
- Date
- Counterparty
- Asset Class

Optional:

- Equity / Debt
- Fund / Strategy

Features:

- drag & drop / multiple files;
- stable Document ID / Batch ID;
- generated filename;
- persistent destination-context sequence starting at `_01`;
- 25MB/file;
- 10 files/selection;
- 100MB total/selection;
- file-granular partial success and idempotent retry.

```text
YYYY-MM-DD_Counterparty_AssetClass_Equity-or-Debt_Sequence.ext
```

Parent-bound material inherits the parent Meeting `Counterparty_ID`; standalone material selects one Counterparty directly.

## Registration context and drafts

Meeting and Pitchbook share browser state for:

- Date
- Counterparty
- Asset Class
- Equity / Debt
- Fund / Strategy

Counterparty Type is a master attribute. It may be shown as secondary text or used as a filter, but is not a required first selection.

Registration success keeps shared values and clears page-specific values only. Text/selection draft persists for 24h in the same browser. File handles need not survive reload/tab close.

## Past records and corrections

Meeting/Pitchbook filters remain optional and stable-ID based.

Meeting filters include or evolve to include:

- Date From / To
- Counterparty Type
- Counterparty
- Asset Class
- Equity / Debt
- Team
- Fund / Strategy
- Meeting Type
- 要フォロー
- Status

Fixed Meeting ID / Document ID / Drive File ID are preserved through maintenance. Normal lifecycle is Active / Inactive / Reactivate rather than physical deletion.

## Masters

### Counterparty Master

- immutable generic `CP-*` ID;
- mutable display name;
- immutable entity type for a created master row;
- Active / Inactive;
- name-based display with type context;
- normalized duplicate check / quick-add.

### Option Master

Immutable Option ID, mutable display name, Sort Order, and Active / Inactive.

Types include Location, Asset Class, Capital Type, and Team. Historical `COUNTERPARTY_*` rows may remain as migration provenance but are not normal catalog input.

Real department/entity names are not guessed as seeds.

## Authoritative storage

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

Keep source folders flat.

Backend remains exactly five sheets:

1. `Counterparty_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

Schema evolution is append-only where practical. Audit remains a separate Restricted admin-only Spreadsheet.

## Workspaces, relationships, and analytics

### 面談先サマリー

One Counterparty-centered summary provides the timeline, linked materials, strategy drill-down, and print brief for every type. There is no parallel GP-only primary workspace.

### Activity Analytics

Monthly/quarterly/yearly/fiscal/custom/cumulative views by Counterparty, Counterparty Type, Asset Class, Team, and Meeting Type, plus a narrow monthly administrative check.

### Relationship Explorer

Bidirectional Meeting ↔ Pitchbook traversal using `Meeting_Index.Related_Pitchbook_IDs` as the only canonical relationship. Inactive/unresolved links remain visible. No relation sheet and no inferred links.

### Fund / Strategy

Entity Workspace aggregates and drills exact trimmed Fund / Strategy values. Similar variants are not silently fuzzy-merged.

### Follow-up boundary

The application retains `要フォロー + note` so search and Meeting preparation can recall unresolved matters. Owner/deadline/completion/reminder workflow is managed elsewhere.

## Knowledge Search generation choices

The normal-user selector contains exactly:

```text
ChatGPT
Gemini
全文出力
```

### ChatGPT

- OpenAI API-backed route;
- File Search is the required default source-reading method;
- grounded answer, citations, and authoritative Drive links.

### Gemini

- Gemini API-backed route;
- File Search is the required default source-reading method;
- grounded answer, citations, and authoritative Drive links.

### 全文出力

- no AI API call;
- one canonical full-text Knowledge Package;
- Copy / Google Docs / PDF from exactly the same package.

There is no automatic provider failover. If the selected provider is disabled, unconfigured, unavailable, or unqualified, show a safe provider-specific error rather than sending data elsewhere.

Model names are administrator settings, not normal-user choices.

## Provider-neutral AI architecture

```text
Shared Drive authoritative sources
        ↓
Canonical AI Source / metadata
        ↓
   ┌────┴────┐
OpenAI     Gemini
File Search File Search
   ↓          ↓
grounded answer + normalized citations
```

```text
Authoritative sources
        ↓
Canonical Knowledge Package
        ↓
Copy / Google Docs / PDF
```

Provider-neutral shared layers own:

- source selection;
- stable source/entity metadata;
- mode and filter contracts;
- canonical request;
- citation/source identity;
- Audit redaction;
- full-output package.

Provider adapters own Store, indexing, provider-native filters, query, citation response mapping, retry, and cleanup.

OpenAI and Gemini derived index state is independent. A source may be Indexed in one provider and Disabled/Failed/Pending in the other.

Google Workspace remains authoritative. Provider failure never rolls back source capture.

## Knowledge Search target UX

Modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

Structured filters include Date, Counterparty, Counterparty Type, Asset Class, Equity/Debt, Team, Fund / Strategy, Meeting Type, follow-up, and Source Type.

Comparison mode accepts 2–5 selected Entities across categories. This replaces a separate static GP comparison dashboard.

The same form and filters apply to all three generation choices.

### API result

- selected provider label;
- grounded answer;
- evidence/insufficient-evidence note;
- citations with stable source identity and Drive links.

### Full output result

Order:

```text
scope/source/character summary
[ コピー ] [ Google Docs ] [ PDF ]
status
full-text preview at bottom
```

The preview has bounded height and internal scrolling. Users can output immediately without reading or page-scrolling through the full body.

Copy, Docs, and PDF use one exact package/fingerprint.

## Source formats

Initial bounded format matrix:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

EML original remains in Drive; normalized headers/body are indexed. Embedded attachments are not auto-indexed. `.msg` remains out of scope.

A provider-specific unsupported format remains a valid Drive record and returns explicit provider status; it does not invalidate the full-output route.

## Personal-PC AI qualification

Work 0020 proves the provider-neutral core:

- three-choice UI;
- independent OpenAI/Gemini configuration/state;
- enabled-provider Store/index/query/citation lifecycle;
- disabled-provider safe errors/no failover;
- one Meeting + one Pitchbook;
- update/inactivate/reactivate/delete/rebuild;
- full-output Copy/Docs/PDF parity and internal-scroll layout;
- cost/rate-limit/retry/retention guardrails.

Work 0021 expands to structured filters, all five modes, accepted formats, 2–5 Entity comparison, and enabled-provider parity matrices.

This precedes significant historical migration so index/metadata/search contracts are proven before loading volume.

## Historical-material migration

Historical materials are highly heterogeneous. The default may be normal manual entry.

After personal-PC AI qualification, choose among:

```text
manual
hybrid/manual-assisted
selective automation for repeatable subsets
```

A universal converter is not a required product outcome.

## Final production qualification

Final production readiness is assessed only after product features, personal-PC AI/File Search, and the selected historical migration approach are ready.

It includes company Shared Drive parentage/permissions, organization-controlled Apps Script Web App, Backend/Audit boundaries, full-output artifact permissions/retention, real users, and every provider enabled by company policy:

- approved credentials/billing;
- exact Store ownership/identity;
- indexing/query/filter/citations;
- update/inactivate/cleanup/retention;
- safe errors/no provider failover;
- cleanup/rollback and authorized trigger behavior.

The company may enable OpenAI, Gemini, both, or neither.

## Governing sequence

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

## Principles

- simplicity first;
- authoritative source and derived AI indexes are separate;
- explicit provider choice; no hidden failover;
- File Search for both API routes;
- one canonical full-output package;
- use shared Masters only where normalization matters;
- keep Drive flat; classify through metadata;
- use stable IDs for exact filters and relationships;
- every AI output traces to source;
- AI failure does not block source capture;
- no speculative architecture merely to preserve arbitrary limits;
- target-runtime evidence comes from the shortest coherent isolated slice.
