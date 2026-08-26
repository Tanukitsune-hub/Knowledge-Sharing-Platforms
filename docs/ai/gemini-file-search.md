# Gemini File Search Retrieval Design

Current as of: 2026-08-26

Status: Accepted

This document defines the AI retrieval/answering layer on top of the authoritative Google Workspace source layer.

Shared Drive remains authoritative. Gemini File Search is derived/rebuildable. Billing-enabled runtime use and confidential-source indexing remain separately authorized under `docs/decisions/target-runtime-first-development.md` and `docs/governance/security.md`.

## 1. Goal

Allow authorized users to ask questions, summarize, organize chronologically, compare, and prepare for meetings across accumulated Meeting records and Pitchbook/source materials, with grounded outputs, citations, and authoritative Drive links.

## 2. Core architecture

```text
Google Shared Drive authoritative sources
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

## 3. Core principles

1. Shared Drive is the source of truth.
2. Start with one File Search Store across accepted Asset Classes.
3. Let File Search manage chunking, embeddings, and semantic retrieval.
4. Use stable human-controlled metadata for exact filters.
5. Do not add a custom Vector DB, embedding pipeline, keyword taxonomy, Knowledge Graph, Agent framework, or model router initially.
6. Only Active sources are normally retrievable.
7. Authorized Web App users share the accepted common Active-source boundary initially.
8. Every output preserves traceability to the original Drive source.
9. AI indexing/query failure never invalidates authoritative registration or maintenance.
10. Use one approved/configured Gemini Flash model with no user model selector/Deep mode.
11. Real confidential data is indexed only through an approved environment and explicit authorization.
12. A mock/fixture/test loader proves only request/response logic; actual Store, billing, permissions, formats, filters, citations, and retention require target-runtime evidence.

## 4. Target runtime, test data, and side effects

### Target runtime

AI capability must ultimately work through:

- the actual Apps Script/Workspace production source path;
- the approved Gemini/File Search API environment;
- the configured Store/model/credential path;
- actual source upload/index/query/citation behavior;
- the final Web App/browser result path.

### Isolated qualification data

Use synthetic or appropriately anonymized Meeting/Pitchbook sources and clearly segregated test Drive resources, Store documents, stable IDs, metadata, and records.

### Guarded side effects

Keep these separately disabled/guarded until authorized:

- billing-enabled Gemini/File Search calls;
- confidential source upload/indexing;
- scheduled/installable sync triggers;
- broad user exposure;
- derived-document deletion/retention operations;
- production Store migration or replacement.

A separate AI DEV/Staging environment is optional only when it provides unique material safety or evidence not achievable through isolated resources and bounded calls in the approved target environment.

## 5. Source indexing

### Meeting

The Google Doc remains authoritative. Apps Script reads the compact authoritative text and uploads a derived representation to File Search. The derived AI copy can be deleted/rebuilt without affecting the Doc.

### Pitchbook/source materials

Initial supported extensions:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Initial product limits:

```text
25MB / file
10 files / selection
100MB total / selection
```

The AI path only needs to support the accepted product path. If <=25MB is impractical in actual Apps Script/File Search behavior, lower the product limit before adding dedicated transport architecture.

Unsupported source formats may remain valid Shared Drive records with `NotIndexed`.

### Outlook EML

- keep original `.eml` in Shared Drive;
- index normalized UTF-8 text containing available Subject/From/To/Cc/Date/Body;
- convert HTML body to readable text;
- do not automatically index embedded attachments;
- register material attachments separately;
- `.msg` remains initially out of scope.

## 6. Custom Metadata

Initial metadata:

```text
source_type
source_id
date_key
gp_id
gp_name
asset_class_id
asset_class_name
capital_type_id
capital_type_name
drive_url
saved_filename
```

Use stable IDs for exact filtering. Display names are presentation metadata. Missing optional fields are absent/null. UI-only `未選択` is never persisted.

Later accepted structured fields are added append-only and use stable IDs.

## 7. Access model

- only authorized Web App users may use Knowledge Search;
- all such users share the accepted common Active-source access boundary initially;
- no per-user/per-GP/per-file retrieval ACL initially;
- internet-public access is not assumed;
- differentiated source permissions require a new explicit architecture/security decision.

The actual Web App access setting, executing identity, Store/credential ownership, and source permissions are target-runtime release evidence.

## 8. Knowledge Search UI

Modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問` is default. All modes share one Store, metadata-filter builder, semantic retrieval path, configured Flash model, and citation mapping. Presets change prompt/output structure only.

Shared filters include accepted Date, GP, Asset Class, Capital Type, Source Type, and later structured fields. `未選択` means no filter and is omitted from persisted/query metadata.

Instruction behavior:

- 自由質問: a natural-language question is required;
- preset modes: the same area becomes optional `追加指示`;
- presets work without additional instruction when the selected metadata scope is sufficient.

## 9. Mode contracts

### 自由質問

- direct grounded answer;
- supporting points;
- uncertainty/insufficient evidence note;
- citations and Drive links.

### 要約

- cross-source synthesis;
- main themes/findings;
- material facts/viewpoints;
- supported changes/contradictions;
- concise takeaways;
- citations.

Do not merely concatenate per-document summaries.

### 時系列

- dated/period chronology;
- change versus prior periods;
- continuity;
- evidence gaps;
- citations per material period/change.

Do not infer change merely because different documents mention different topics.

### 比較

- common-dimension comparison across selected targets/periods;
- compact table where useful;
- supported opportunities/risks/outlook/valuation/returns;
- agreements/disagreements;
- citations per target.

Multi-select UI remains an optional refinement, not an architecture requirement.

### 面談準備

- recent meetings/sources;
- key statements/updates;
- changes since prior discussions;
- unresolved topics;
- reconfirmation points;
- suggested next questions;
- citations/Drive links.

When a specific GP is required, prompt for selection rather than produce an over-broad brief.

## 10. Retrieval and answer flow

```text
Mode + question/additional instruction
   |
   +--> exact metadata filters
   |
   v
File Search semantic retrieval
   |
   v
Relevant grounded chunks
   |
   v
Configured Gemini Flash
   |
   v
Mode-specific output template
   |
   v
Grounded output + citations + Drive links
```

All modes:

- use retrieved knowledge-base sources only;
- distinguish grounded fact from synthesis/inference;
- surface uncertainty/insufficient evidence;
- identify source records used;
- link to authoritative Drive sources;
- do not expose model routing/deep-analysis controls initially.

## 11. Synchronization lifecycle

### Registration

1. save authoritative source and Backend Index;
2. set AI state `Pending`;
3. return registration success independently of AI;
4. bounded worker/direct handler indexes the source;
5. success → `Indexed`;
6. failure → `Failed` without authoritative rollback.

### Update

- preserve stable Meeting ID/Document ID/Drive source;
- mark synchronization state;
- remove/supersede previous AI Document;
- index current source/metadata;
- prevent duplicate active AI Documents.

### Inactivation

Remove the corresponding File Search Document from normal retrieval.

### Reactivation

Re-index the current authoritative source.

## 12. Backend AI fields and settings

Meeting/Pitchbook indexes:

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

Initial intended sync interval is 15 minutes, but actual trigger enablement is a separately authorized side effect. Direct/private handler execution may be used for bounded qualification before installing a schedule.

Credentials never appear in user-facing Sheets, source files, generated exports, Audit, browser responses, or GitHub.

## 13. Retry and cost controls

- process bounded batches;
- retry only retryable failures;
- use bounded exponential backoff;
- do not retry permanent/unsupported failures indefinitely;
- store stable AI references and content hash for idempotency;
- do not create duplicate active AI Documents for one current source revision;
- define observed batch size/rate-limit/cost guardrails before production rollout;
- do not enable broad triggers or billing merely to prove pure request-mapping logic.

## 14. Audit

Every Knowledge Search execution writes bounded metadata to the separate Restricted Audit Spreadsheet.

Actor: email → `TEMP_USER:<key>` → `UNIDENTIFIED`.

Allowed AI query metadata:

```text
Timestamp
Actor
Search mode
Date From / To
GP / Asset Class / Capital Type / Source Type filters
Configured model ID
Result
Cited source IDs when available
Safe error code/message when applicable
```

Current policy redacts the question/additional-instruction text. Do not store generated answers, retrieved chunks, embeddings, full source content, raw provider payloads, credentials, or private runtime identifiers.

Persistent user identity is not required for normal operation.

## 15. Security and release boundary

Before production AI release establish the applicable items:

- company-approved Gemini/Google Cloud environment;
- server-side credential ownership/storage/rotation;
- intended users may access the accepted Active-source universe;
- derived data retention/deletion handling;
- citation/Drive-link correctness;
- Inactive exclusion and Reactivate behavior;
- Restricted Audit access;
- AI outage isolation from authoritative operations;
- exact Apps Script/deployment/Store/resource identity;
- production data/users/billing/triggers explicitly authorized;
- rollback/safe-stop and bounded cleanup routes.

## 16. Validation

### Logic validation

- request/response mapping;
- metadata-filter determinism;
- `未選択` omission;
- state transitions;
- retry/idempotency/content hash;
- EML normalization;
- citation/source-ID mapping;
- safe errors/redaction;
- no answer/chunk/question/source duplication into Audit;
- shared retrieval path across five modes.

### Target-runtime qualification

Use isolated synthetic/anonymized sources to observe, when in scope:

- actual Store/model/credential path;
- Meeting indexing/retrieval;
- each supported format and EML behavior;
- accepted practical file-size path;
- actual metadata filtering;
- citation → correct authoritative Drive source;
- update/re-index without duplicate active AI Document;
- Inactive exclusion/Reactivate restoration;
- bounded worker/direct-handler behavior;
- trigger behavior only when authorized;
- AI failure isolation;
- Audit metadata/redaction;
- Web App/browser output behavior;
- derived-data deletion/retention and access boundary.

Report separately:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

A fixture/mock/test loader/CI pass is not evidence of an API, permission, file parser, Store behavior, citation, billing path, trigger, or deletion result that the actual target did not execute.

## 17. Non-goals

- custom Vector DB or embedding service;
- manual keyword taxonomy or Knowledge Graph;
- per-user/per-source AI ACL initially;
- multiple user-selectable models;
- Deep mode/model routing;
- strict persistent identity;
- Web App Audit Viewer;
- 100MB/file support;
- `.msg` parsing;
- automatic EML attachment indexing;
- autonomous investment decisions;
- automatic rewriting of official Meeting records;
- public-web enrichment inside the same retrieval request.
