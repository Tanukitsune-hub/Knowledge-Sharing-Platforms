# Product Vision

Current as of: 2026-08-27

Status: Active

## Purpose

プライベートアセット領域のMeeting recordsとPitchbook / source materialsを、利用者の入力負荷を抑えながら継続的に蓄積し、後から検索・修正・整理・要約・比較できる状態を作る。

Google Workspaceを正本・運用基盤とし、その上にGemini File Searchを再生成可能な検索レイヤーとして載せる、シンプルで監査可能な業務ツールを目指す。

## Current product state

Works 0004–0014はmainへ統合済みで、Meeting/Pitchbook登録・maintenance、Masters、Audit、Knowledge Export、構造化Meeting context等が実装・qualifiedされている。Work 0015はGP Workspace / one-page summaryを扱う。

これらはpersonal/synthetic target-runtime evidenceであり、会社Shared Drive、本番権限、real users、confidential data、production Gemini billing、scheduled triggersを含む本番ready宣言ではない。

## Core user experience

通常利用者は、組織管理下の1つのApps Script HTML Service Web Appを共通URLから利用する。

主要surface:

1. `面談記録` — 新規登録 / 過去記録 / edit / lifecycle
2. `Pitchbook` — 新規登録 / 過去資料 / edit / lifecycle
3. `GP / Entity Workspace`
4. `Activity Analytics`
5. `Relationship Explorer`
6. `ナレッジ検索`
7. `マスター管理`

Surfaceは実装順に追加する。通常利用者はbackend Sheets、Restricted Audit Spreadsheet、File Search Storeを直接操作しない。

## Meeting records

### Current accepted record fields

Required baseline before Work 0016:

- Date
- GP
- Asset Class

Accepted optional structured fields include:

- Time
- Location
- Equity / Debt
- Team
- Fund / Strategy
- Meeting Type
- Related Pitchbooks
- 要フォロー / note
- 面談相手
- 当社側
- Meeting body

### Prospective counterparty contract

Work 0016 replaces the global GP requirement with:

```text
Date
Counterparty Type
Counterparty Entity
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

The user first selects a category and then an entity in that category.

- GP entities use existing `GP_Master`.
- Non-GP entities use category-specific types in existing `Option_Master`.
- No new Entity/Counterparty sheet is added.
- Existing free-text `Counterparty` remains a person/role field and is relabeled `面談相手（氏名・役職）`.
- `Related_GP_IDs` allows non-GP Meetings to retain relevant manager context.
- Existing legacy GP Meetings are migrated without changing Meeting ID, Doc File ID, or source file.

Detailed decision:

`docs/decisions/counterparty-entity-classification.md`

### Authoritative Meeting representation

The Meeting body is authoritative in Google Docs and is not duplicated into `Meeting_Index`.

Fixed Meeting ID example:

```text
MTG-000123
```

Prospective filename:

```text
YYYY-MM-DD_Counterparty_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Time is excluded. Optional segments are omitted. Legacy GP-based filenames remain valid and are not bulk-renamed by migration.

## Pitchbooks / source materials

Pitchbook remains manager/source-material oriented in the current roadmap.

Required:

- file
- Date
- GP
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
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

Work 0016 does not generalize Pitchbook ownership to non-GP entities. That is reconsidered only if actual use demonstrates a material need.

## Registration context and drafts

Meeting and Pitchbook always share browser state for:

- Date
- Asset Class
- Equity / Debt
- Fund / Strategy

GP is shared only when Meeting Counterparty Type is `GP`. A non-GP Meeting does not automatically assign a Related GP to the Pitchbook form.

Registration success keeps shared values and clears page-specific values only. Text/selection draft persists for 24h in the same browser. File handles need not survive reload/tab close.

## Past records and corrections

Meeting/Pitchbook filters remain optional and stable-ID based where applicable.

Meeting filters evolve to include:

- Date From / To
- Counterparty Type
- Counterparty Entity
- Related GP
- Asset Class
- Equity / Debt
- Team
- Fund / Strategy
- Meeting Type
- 要フォロー
- Status

Fixed Meeting ID / Document ID / Drive File ID are preserved through maintenance. Normal lifecycle is Active / Inactive / Reactivate rather than physical deletion.

## Masters

### GP Master

- immutable GP ID;
- mutable display name;
- Active / Inactive;
- alphabetical display;
- normalized duplicate check / quick-add.

### Option Master

Existing and planned types use immutable Option ID, mutable display name, Sort Order, and Active / Inactive.

Current types:

```text
Location
Asset Class
Capital Type
Team
```

Work 0016 adds category-specific non-GP counterparty types:

```text
LP / Asset Owner
日本生命部署
グループ会社
Consultant / Gatekeeper
その他
```

Users may maintain allowed Masters through the existing audit/confirmation rules. Real department/entity names are not guessed as seeds.

## Authoritative storage

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

Keep source folders flat.

Backend remains exactly five sheets:

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

Schema evolution is append-only where practical. Audit remains a separate Restricted admin-only Spreadsheet.

## Workspaces, relationships, and analytics

### GP Workspace

Work 0015 provides a GP-centric snapshot, recent records, Fund / Strategy context, follow-ups, relationships, and browser-native one-page print/PDF brief.

### Activity Analytics

After counterparty classification is authoritative, Work 0017 provides monthly/quarterly/yearly/fiscal/custom/cumulative activity views by Counterparty, Related GP, Asset Class, Team, and Meeting Type, plus a narrow monthly administrative check.

### Relationship Explorer

Work 0018 provides bidirectional Meeting ↔ Pitchbook traversal using `Meeting_Index.Related_Pitchbook_IDs` as the only canonical relationship. Inactive/unresolved links remain visible. No relation sheet and no inferred links.

### Entity Workspace / Fund Strategy

Work 0019 generalizes GP Workspace to all Counterparty Types and adds exact-text Fund / Strategy aggregation/drill-down. Similar free-text variants are not silently fuzzy-merged.

### Follow-up boundary

The application retains `要フォロー + note` so search and Meeting preparation can recall unresolved matters. Owner/deadline/completion/reminder workflow is not implemented because task execution is managed elsewhere.

## Knowledge retrieval with Gemini

```text
Shared Drive = authoritative source
Sheets       = exact metadata / index
File Search  = rebuildable semantic retrieval index
Gemini Flash = grounded synthesis / summary / comparison
```

Accepted baseline:

- one File Search Store initially;
- stable Custom Metadata for exact filtering;
- managed embeddings/chunking;
- only Active records normally retrievable;
- one approved/configured Flash model;
- AI failure never rolls back authoritative capture;
- citations map to stable source records and Drive links;
- no custom Vector DB / embedding pipeline / Knowledge Graph / model router initially.

Initial formats:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

EML original remains in Drive; normalized headers/body are indexed. Embedded attachments are not auto-indexed. `.msg` remains out of scope.

## Knowledge Search target UX

Modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

Structured filters evolve to include Date, Counterparty Type/Entity, Related GP where exact API behavior permits, Asset Class, Equity/Debt, Team, Fund / Strategy, Meeting Type, follow-up, and Source Type.

Comparison mode, after personal-PC Gemini core qualification, accepts 2–5 selected entities across categories. This replaces a separate static GP comparison dashboard.

All modes share one retrieval/citation layer, show sources, distinguish grounded fact from synthesis, and surface insufficient evidence rather than inventing content.

## Knowledge Export / external-AI handoff

Knowledge Export is independent from Gemini credentials.

- only Active Backend rows are eligible;
- Meeting includes authoritative Google Doc text;
- Pitchbook body is not duplicated; metadata and authoritative Drive link are exported;
- count/character limits stop oversized exports before unnecessary reads;
- Google Docs/PDF artifacts are derived copies under Knowledge Exports;
- prompts support the five modes;
- source bodies, prompts, answers, chunks, embeddings, and bytes are excluded from Audit.

Counterparty/Entity and Related GP metadata are propagated when present.

## Personal-PC Gemini qualification

Work 0020 first proves one isolated Store, one Meeting, one Pitchbook, indexing/query/citation/update/inactivate/reactivate/delete/rebuild, and operational cost/rate-limit/retention guardrails using synthetic/non-confidential data.

Work 0021 then expands to structured filters, five modes, accepted formats, and AI multi-entity comparison.

This precedes significant historical migration so index/metadata contracts are proven before loading volume.

## Historical-material migration

Historical materials are highly heterogeneous. The default may be normal manual entry.

After personal-PC Gemini qualification, choose among:

```text
manual
hybrid/manual-assisted
selective automation for repeatable subsets
```

A universal converter is not a required product outcome.

## Final production qualification

Final production readiness is assessed only after product features, personal-PC Gemini/File Search, and the selected historical migration approach are ready.

It includes company Shared Drive parentage/permissions, organization-controlled Apps Script Web App, Backend/Audit boundaries, production credentials/billing/index/query/citations, real users, cleanup/rollback, retention, and authorized trigger behavior.

## Governing sequence

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0017 analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 personal-PC Gemini/File Search core
→ 0021 structured filters / multi-entity comparison
→ historical migration
→ final production qualification
```

## Principles

- simplicity first;
- authoritative source and AI index are separate;
- use shared Masters only where normalization matters;
- keep Drive flat; classify through metadata;
- use stable IDs for exact filters and relationships;
- every AI output traces to source;
- AI failure does not block source capture;
- no architecture merely to preserve arbitrary limits or speculative future needs;
- target-runtime evidence is obtained through the shortest coherent isolated slice.
