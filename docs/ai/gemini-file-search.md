# Gemini File Search Retrieval Design

Current as of: 2026-08-27

Status: Accepted design; personal-PC runtime qualification planned in Works 0020–0021

Shared Drive remains authoritative. Gemini File Search is derived/rebuildable. Billing-enabled runtime use and confidential-source indexing remain separately authorized.

## 1. Goal

Allow authorized users to ask questions, summarize, organize chronologically, compare entities, and prepare for meetings across accumulated Meeting records and Pitchbook/source materials, with grounded outputs, citations, and authoritative Drive links.

## 2. Core architecture

```text
Google Workspace authoritative sources
  ├─ Meeting Records
  └─ Pitchbooks / source materials
          |
          | bounded derived sync
          v
Gemini File Search Store
  ├─ managed chunks
  ├─ managed embeddings
  └─ Custom Metadata
          |
          v
Configured Gemini Flash
          |
          v
Apps Script Knowledge Search
  ├─ 自由質問
  ├─ 要約
  ├─ 時系列
  ├─ 比較
  └─ 面談準備
          |
          v
Grounded output + citations + Drive links
```

## 3. Principles

1. Google Workspace is the source of truth.
2. Start with one isolated Store.
3. File Search manages chunks and embeddings.
4. Stable metadata handles exact filters.
5. No custom Vector DB, embedding pipeline, taxonomy, Knowledge Graph, Agent framework, or model router initially.
6. Only Active sources are normally retrievable.
7. Authorized Web App users initially share one Active-source access boundary.
8. Every output traces to stable source IDs and Drive links.
9. AI failure never rolls back authoritative save.
10. Use one approved/configured Flash model, no user model selector/Deep mode.
11. Real confidential data requires final approved production environment.
12. Actual Store/model/filter/citation behavior must be observed; mocks do not prove it.

## 4. Target runtime, test data, and side effects

### Target runtime

- actual Apps Script production source path;
- current supported Gemini/File Search API;
- selected Store/model/credential route;
- actual index/query/citation/update/delete behavior;
- final Web App/browser response.

### Test data

Works 0020–0021 use synthetic or non-confidential Meeting/Pitchbook sources and an isolated personal-PC Store. Company production sources are excluded.

### Side effects

```text
SIDE_EFFECT_STATE: TEST_ONLY
```

Billing-enabled calls are bounded and explicitly authorized per Work. Confidential indexing, scheduled sync triggers, broad user access, and production Store migration remain disabled.

A separate AI staging environment is used only if it provides material unique safety/evidence.

## 5. Source indexing

### Meeting

The authoritative Google Doc is read through Apps Script and uploaded as a derived representation. Entity and structured Meeting metadata accompany it.

### Pitchbook/source

Accepted initial formats:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Unsupported formats remain valid Drive records with an explicit non-indexed/failed status.

Product upload limits remain:

```text
25MB/file
10 files/selection
100MB total/selection
```

If actual behavior requires a lower safe limit, lower it before adding transport architecture.

### EML

- original `.eml` remains authoritative;
- index normalized Subject/From/To/Cc/Date/Body;
- HTML becomes readable text;
- embedded attachments are not auto-indexed;
- material attachments are registered separately;
- `.msg` remains out of scope.

## 6. Entity-centered metadata

### Stable entity identity

Meeting entities use:

```text
entity_key = Counterparty_Type + ":" + Counterparty_ID
counterparty_type
counterparty_id
counterparty_name
related_gp_ids
```

Pitchbooks remain GP-owned and derive:

```text
entity_key = GP:<GP_ID>
counterparty_type = GP
counterparty_id = GP_ID
counterparty_name = GP display name
```

### Metadata baseline

Expected single-valued metadata includes:

```text
source_type
source_id
date_key
entity_key
counterparty_type
counterparty_id
counterparty_name
gp_id
gp_name
asset_class_id
asset_class_name
capital_type_id
capital_type_name
team_id
team_name
fund_strategy
follow_up_required
drive_url
saved_filename
content_hash
```

Meeting Type and Related GP can be multi-valued. Their exact metadata encoding/filter strategy is fixed only after actual API behavior is observed in Work 0020/0021. A comma-separated substring comparison is not treated as exact filtering.

Missing optional fields are omitted/null. UI-only `未選択` is never persisted.

## 7. Access model

- authorized Web App users only;
- common Active-source access boundary initially;
- no per-user/per-entity/per-file retrieval ACL initially;
- internet-public access is not assumed;
- differentiated source permissions require a new architecture/security decision.

Actual deployer/access/Store ownership/source permissions are final production evidence.

## 8. Knowledge Search UI

Modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

All modes share one Store/retrieval/citation layer. Presets alter prompt/output structure only.

Planned structured filters:

```text
Date From / To
Counterparty Type
Counterparty Entity
Related GP where exact behavior permits
Asset Class
Equity / Debt
Team
Fund / Strategy
Meeting Type
要フォロー
Source Type
```

`未選択` means no filter and is omitted.

## 9. Mode contracts

### 自由質問

Direct grounded answer, support, uncertainty/insufficient-evidence note, citations.

### 要約

Cross-source synthesis, themes, material facts/viewpoints, changes/contradictions, concise takeaways, citations. Do not concatenate document summaries mechanically.

### 時系列

Dated chronology, supported changes/continuity, gaps, citations by period. Do not infer change solely from topic differences.

### 比較

Select 2–5 entities across categories. Compare common dimensions, supported similarities/differences, changes, risks/opportunities where evidenced, gaps, and citations attributable to each entity.

This replaces a separate static GP-comparison dashboard.

### 面談準備

Recent sources, updates, changes, unresolved topics, reconfirmation points, next questions, citations. Prompt for an entity scope when needed.

## 10. Multi-entity retrieval strategy

Use the simplest method proven by actual API behavior:

1. one grouped/OR metadata filter over stable `entity_key`; or
2. bounded separate retrieval per entity followed by one grounded synthesis.

Correctness and citation attribution outrank one-call elegance. Do not silently weaken exact filters.

## 11. Synchronization lifecycle

### Registration

1. save authoritative source/Index;
2. set AI state Pending;
3. return authoritative success independently;
4. bounded worker/direct handler indexes;
5. success -> Indexed;
6. failure -> Failed without rollback.

### Update

Preserve stable source ID/Drive file, remove/supersede prior derived document, index current content/metadata, and avoid duplicate active AI documents.

### Inactivation / Reactivation

Inactive source is excluded/removed from normal retrieval. Reactivation indexes current authoritative source.

### Rebuild

Derived Store documents may be deleted/rebuilt by exact ID without altering authoritative Drive sources.

## 12. Backend state and settings

Meeting/Pitchbook AI fields:

```text
AI_Document_Name
AI_Index_Status
AI_Indexed_At
AI_Content_Hash
AI_Last_Error
```

States:

```text
NotIndexed / Pending / Indexed / Failed
```

Settings:

```text
GEMINI_FILE_SEARCH_STORE_NAME
AI_DEFAULT_MODEL
AI_SYNC_ENABLED
AI_SYNC_INTERVAL_MINUTES
```

Credentials never appear in browser responses, GitHub, source documents, user-facing Sheets, Knowledge Exports, or Audit.

## 13. Retry, cost, and operational controls

- bounded batches;
- retry retryable failures only;
- bounded exponential backoff;
- no indefinite permanent-error retries;
- stable AI references and content hash;
- no duplicate active derived document per current source;
- observe latency, polling, rate limits, practical batch size, costs, and retention before production;
- direct/private handler first; schedule only under separate authorization.

## 14. Audit and redaction

Every Knowledge Search execution writes bounded metadata to the Restricted Audit Spreadsheet.

Allowed:

```text
Timestamp
Actor
Search mode
Structured filter IDs
Configured model
Result
Cited source IDs
Safe error code/message
```

Current policy redacts the question/additional-instruction text.

Do not store answers, retrieved chunks, source bodies, embeddings, uploaded bytes, credentials, raw provider payloads, or private runtime identifiers.

## 15. Work 0020 — personal-PC core

Detailed plan:

`docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Before code/runtime changes, verify current official API, model, embedding model, metadata filter syntax, price, and retention terms.

Shortest slice:

1. isolated Store/credential readback;
2. one Meeting index;
3. one grounded query/citation;
4. one Pitchbook index;
5. one exact filter;
6. update/inactivate/reactivate;
7. delete/rebuild;
8. integrity and cost summary.

## 16. Work 0021 — filters, five modes, comparison

Detailed plan:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Expand from the actual Work 0020 API contract:

- entity and structured filters;
- 2–5 entity comparison;
- per-entity citations;
- all five modes;
- accepted six-format bounded matrix;
- final Store/Index/Audit/source integrity.

## 17. Validation

### LOGIC_VALIDATION

- current request/response mapping;
- metadata/filter determinism and escaping;
- entity identity;
- state transitions/retry/idempotency/content hash;
- format/EML normalization;
- citation mapping;
- safe errors/redaction;
- one retrieval/citation layer across modes;
- no secret/question/answer/body duplication into Audit.

### TARGET_RUNTIME_QUALIFICATION

Directly observe:

- actual Store/model/credential/billing path;
- source indexing and formats;
- metadata filters;
- grounded query and citations;
- update/re-index without duplicates;
- Inactive/Reactivate behavior;
- cleanup/rebuild;
- bounded worker/direct handler;
- AI failure isolation;
- Audit redaction;
- Web App/browser result.

Mocks/fixtures/CI do not substitute.

### Reporting

```text
LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
READY: YES | NO
```

## 18. Production release boundary

Production AI readiness is only part of final company-environment qualification and requires:

- company-approved credentials/billing;
- confidential-source authorization;
- Shared Drive/source permissions;
- intended user access;
- citation correctness;
- inactive/update/cleanup behavior;
- Restricted Audit permissions;
- exact project/deployment/Store identity;
- rollback/retention/cost controls;
- scheduled triggers where authorized.

Personal-PC success is not company production readiness.

## 19. Non-goals

- custom Vector DB/embedding service;
- Knowledge Graph/manual taxonomy;
- per-user AI ACL initially;
- model selector/Deep mode;
- public-web enrichment in the same request;
- autonomous investment decisions;
- automatic rewriting of official Meeting records;
- `.msg` parsing;
- automatic EML attachment indexing.
