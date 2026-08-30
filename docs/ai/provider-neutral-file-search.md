# Provider-neutral File Search and full-output architecture

Current as of: 2026-08-28

Status: Accepted design; personal-PC qualification planned in Works 0020–0021

Detailed provider-selection decision:

`docs/decisions/ai-provider-selection-and-full-output.md`

Google Workspace remains authoritative. OpenAI File Search and Gemini File Search are independent derived/rebuildable retrieval indexes. Full output is an API-independent derived package of Meeting Google Docs text.

## 1. User-facing routes

Knowledge Search exposes exactly:

```text
ChatGPT | Gemini | 全文出力
```

- `ChatGPT` -> OpenAI API + File Search over Meeting + Pitchbook/source materials;
- `Gemini` -> Gemini API + File Search over Meeting + Pitchbook/source materials;
- `全文出力` -> canonical Meeting Google Docs full-text package, no AI API.

No automatic provider failover is allowed.

## 2. Architecture

```text
Google Workspace authoritative sources
  ├─ Meeting Google Docs
  └─ Pitchbooks / source files
          |
          v
Canonical source identity and metadata
          |
          +----------------------------------+
          |                                  |
          v                                  v
Canonical AI Source                  FULL_EXPORT Meeting scope
(Meeting + Pitchbook)                        |
          |                                  v
   +------+-------+                 Canonical Meeting Knowledge Package
   |              |                         |
   v              v                  +------+------+ 
OpenAI adapter  Gemini adapter        |      |      |
   |              |                   v      v      v
   v              v                  Copy   Docs   PDF
OpenAI File     Gemini File
Search Store    Search Store
   |              |
   v              v
Grounded answer + normalized citations + Drive links
```

Pitchbooks are first-class AI retrieval sources but are not manually copied into FULL_EXPORT body text.

## 3. Shared provider-neutral contracts

### Canonical AI Source

Per authoritative source:

```text
source_type
source_id
date_key
entity_key
counterparty_type
counterparty_id
counterparty_name
related_gp_ids
gp_id
asset_class_id
capital_type_id
team_id
fund_strategy
meeting_type_codes
follow_up_required
drive_url
saved_filename
content_hash
text or provider-ready file reference
```

This contract applies to both Meeting and Pitchbook/source materials for File Search. Source identity and metadata are produced once. Provider adapters transform only what the target API requires.

### Canonical Knowledge Request

```text
route: OPENAI | GEMINI | FULL_EXPORT
mode: 自由質問 | 要約 | 時系列 | 比較 | 面談準備
question_or_instruction
structured filters
selected entities
source scope
request fingerprint
```

For FULL_EXPORT, source filters may identify both Meetings and Pitchbooks, but the body-building contract deliberately includes only matching Meeting Google Docs text. Matching Pitchbooks may be reported as references.

### Canonical Meeting Knowledge Package

The API-independent full-output package contains:

- mode-specific instruction;
- selected filters/scope;
- Meeting full-text source count and character count;
- optional matching Pitchbook reference count;
- deterministic Meeting order;
- stable Meeting IDs and authoritative links;
- Meeting metadata;
- authoritative Meeting Google Docs body text;
- optional bounded Pitchbook reference metadata/Drive links;
- a package fingerprint.

Pitchbook file body text is intentionally excluded from this package. Copy, Google Docs, and PDF must consume the identical package.

### Normalized citation model

Provider-specific responses normalize to:

```text
provider
source_type
source_id
display_name
drive_url
quoted_or_supporting_location where available
```

Both Meeting and Pitchbook citations map to stable source identity and authoritative Drive links.

## 4. Provider adapters

Both provider adapters expose equivalent private capabilities:

```text
read capability/configuration
create/read isolated Store
upsert current Meeting or Pitchbook source
remove current source
query with structured filters
normalize answer/citations
observe operation status
cleanup/rebuild by exact stable source identity
classify retryable/permanent errors
```

Provider-specific APIs, models, filters, Store/document identifiers, polling, and error codes stay inside adapters.

Normal-user source-selection, filters, modes, output presentation, Audit redaction, and source authority remain shared.

## 5. Provider configuration

Normal users do not select model names.

Server-side settings distinguish at least:

```text
OPENAI_ENABLED
OPENAI_VECTOR_STORE_ID
OPENAI_DEFAULT_MODEL
GEMINI_ENABLED
GEMINI_FILE_SEARCH_STORE_NAME
GEMINI_DEFAULT_MODEL
AI_SYNC_ENABLED
```

Exact key names are finalized in Work 0020 after repository and current-API inventory.

Credentials are stored in an approved server-side secret/property route and never in GitHub, browser responses, Audit, exports, or user-visible Sheets.

## 6. Independent provider index state

Each authoritative Meeting/Pitchbook needs independent derived state for OpenAI and Gemini:

```text
document/store reference
NotIndexed / Pending / Indexed / Failed
indexed_at
content_hash
safe last error
```

A source may be Indexed in one provider and Failed/Disabled in the other.

Work 0020 uses append-only migration and keeps the Backend at five sheets. Existing legacy Gemini-oriented AI fields are preserved for compatibility/evidence; new provider-neutral state becomes authoritative after migration.

## 7. Full-output UX

No popup/modal is used for long output.

Order:

```text
route and scope summary
Meeting full-text count / Meeting character count
optional reference Pitchbook count
[ コピー ] [ Google Docs ] [ PDF ]
status/error
Meeting full-text preview at bottom
optional reference Pitchbook list
```

The preview has a fixed/bounded height and internal scrolling. Users may export immediately without reading the body.

The Meeting output body is generated once. Copy, Docs, and PDF share its exact text and fingerprint. FULL_EXPORT must not read Pitchbook bytes or extract Pitchbook text.

UI helper text should make the boundary explicit, e.g. `Meeting記録のGoogle Docs全文を出力します。Pitchbook本文は含まず、該当資料は参照リンクとして表示します。`

## 8. Search modes and filters

All three routes share the accepted condition/mode model:

```text
自由質問
要約
時系列
比較
面談準備
```

Planned filters:

```text
Date From / To
Counterparty Type
Counterparty Entity
Related GP where exact capability permits
Asset Class
Equity / Debt
Team
Fund / Strategy
Meeting Type
要フォロー
Source Type
```

For ChatGPT/Gemini, filters apply to both Meeting and Pitchbook/source indexes according to compatible metadata. For FULL_EXPORT, the same conditions identify the Meeting body scope and optional Pitchbook reference list.

No filter may silently weaken from exact stable-ID semantics to substring matching.

## 9. Synchronization lifecycle

For each enabled provider independently, both Meeting and Pitchbook/source materials follow the derived-index lifecycle.

### Registration

1. authoritative source save succeeds first;
2. provider state becomes Pending;
3. bounded direct/private sync indexes current content/file;
4. success -> Indexed;
5. failure -> Failed without rolling back source capture.

### Update

Content hash controls re-index. The current provider document is replaced/superseded without duplicate active documents.

### Inactivation / Reactivation

Inactive sources leave normal retrieval for that provider. Reactivation indexes the current authoritative source.

### Rebuild

Derived provider documents/Stores may be deleted and rebuilt by exact ID without changing Drive sources.

## 10. Audit and redaction

Allowed bounded Audit metadata includes:

```text
Timestamp
Actor
route/provider
search mode
structured filter IDs
configured model alias
result
cited stable source IDs
safe error code/message
```

Do not store question/instruction text under the current policy, generated answers, retrieved chunks, source bodies, embeddings, uploaded bytes, credentials, raw provider payloads, or private Store/deployment identifiers.

## 11. Work 0020 — provider core

Work 0020 implements and qualifies:

- the three-choice UI;
- provider-neutral request/source/citation contracts;
- Meeting-only canonical full-output package;
- independent provider configuration/state;
- OpenAI and Gemini adapters;
- File Search indexing/query/citation for one Meeting and one Pitchbook/source on every enabled provider;
- disabled-provider safe errors and no failover;
- full-output Copy/Docs/PDF parity and bottom internal-scroll preview using Meeting Google Docs text;
- optional Pitchbook reference-list behavior without body extraction;
- update/inactivate/reactivate/delete/rebuild;
- bounded cost/latency/retry/retention evidence.

## 12. Work 0021 — intended search product

Work 0021 expands the qualified core to:

- all structured filters;
- five modes;
- 2–5 entity comparison;
- per-entity citation attribution;
- enabled-provider parity checks;
- FULL_EXPORT parity for the same Meeting filters/modes;
- bounded File Search format matrix for `.pdf / .pptx / .xlsx / .docx / .txt / .eml` Pitchbook/source materials.

The six-format matrix is for provider File Search. It does not expand manual FULL_EXPORT into Pitchbook body extraction.

## 13. Qualification and production boundary

### Personal-PC

- synthetic/non-confidential sources only;
- isolated Stores;
- bounded billing-enabled calls;
- no recurring trigger;
- each enabled provider directly observed using Meeting + Pitchbook/source;
- disabled route proves safe error;
- FULL_EXPORT proves Meeting Docs package and outputs;
- personal-PC success is not production readiness.

### Final company production

Every provider enabled by company policy must separately pass approved credentials/billing, Store ownership and exact identity, Shared Drive/source permissions, Meeting/Pitchbook indexing/query/filter/citation behavior, update/inactivate/cleanup/retention, intended users/Web App access, Audit boundaries, and cost/rollback/trigger controls.

The company may enable OpenAI, Gemini, both, or neither. `全文出力` remains the API-independent Meeting-record handoff path when source access and output permissions are valid.

## 14. Non-goals

- automatic provider routing/failover;
- user-facing model selector;
- custom Vector DB/embedding service;
- Knowledge Graph/manual taxonomy;
- public-web enrichment in the same request;
- autonomous investment decisions;
- confidential historical indexing before final authorization;
- full-context API submission as a substitute for File Search;
- Pitchbook body extraction for FULL_EXPORT.
