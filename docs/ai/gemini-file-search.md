# Gemini File Search Retrieval Design

## Status

Status: Accepted

This document defines the AI retrieval / answering layer on top of the authoritative Google Workspace source layer.

Shared Drive remains authoritative. Gemini File Search is derived and rebuildable.

## Goal

Allow users to ask questions, summarize, organize chronologically, compare, and prepare for meetings across accumulated Meeting records and Pitchbook/source materials, with grounded outputs, citations, and Drive links.

## Core architecture

```text
Google Shared Drive authoritative sources
  ├─ Meeting Records
  └─ Pitchbooks / source materials
          |
          | 15-minute derived sync
          v
Gemini File Search Store
  ├─ managed chunks
  ├─ managed embeddings
  └─ custom metadata
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

## Core principles

1. Shared Drive is the system of record.
2. Start with one File Search Store across all Asset Classes.
3. Let File Search manage chunking / embeddings / semantic retrieval.
4. Use exact human-controlled metadata for filters.
5. Do not add custom Vector DB, embedding pipeline, keyword taxonomy, Knowledge Graph, or Agent framework initially.
6. Only Active sources are available to normal retrieval.
7. All authorized Web App users share access to all Active indexed sources initially.
8. Every output must preserve traceability to original Drive source.
9. AI indexing failure never invalidates authoritative registration.
10. Use one configured Gemini Flash model with no user model selector / Deep mode.

## Source indexing

### Meeting

Google Docs remain authoritative.

Apps Script reads compact Meeting text and uploads a derived text representation to File Search. The AI copy can be deleted / rebuilt without affecting source Doc.

### Pitchbook / source materials

Initial supported extensions:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Initial product upload limit:

```text
25MB / file
10 files / selection
100MB total / selection
```

The AI indexing path only needs to qualify the accepted <=25MB/file product path. 100MB/file transport is not an initial requirement.

If <=25MB still proves impractical in Apps Script, lower the product limit before adding dedicated upload architecture.

### Outlook EML

- keep original `.eml` in Shared Drive
- index normalized UTF-8 text containing available Subject / From / To / Cc / Date / Body
- convert HTML body to readable text
- do not auto-index embedded attachments
- register important attachments separately
- `.msg` is initially out of scope

Unsupported source formats may remain valid Shared Drive records but use `NotIndexed`.

## Custom metadata

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

Use stable IDs for exact filtering. Display names are presentation metadata.

Do not store `未選択`. Missing optional metadata is absent / null.

## Access model

Initial retrieval access is intentionally simple.

- authorized Web App users may use Knowledge Search
- all such users may retrieve across all Active indexed sources
- no per-user / per-GP / per-file retrieval ACL initially
- internet-public access is not assumed
- if differentiated source permissions become necessary, treat that as a new architecture requirement

## Knowledge Search UI

### Modes

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問` is default.

All modes use the same Store / metadata filters / semantic retrieval / configured Flash / citation mapping. Presets change prompt / output template only.

### Shared filters

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

Dropdowns show UI-only `未選択` initially. `未選択` means no filter and is never persisted.

### Instruction field

- 自由質問: natural-language question is required
- preset modes: same area becomes optional `追加指示`
- presets must work without additional instruction when metadata scope is sufficient

## Mode contracts

### 自由質問

- direct grounded answer
- supporting points
- uncertainty / insufficient evidence note when applicable
- citations + Drive links

### 要約

- main themes / findings
- material facts / viewpoints
- supported changes / contradictions
- concise takeaways
- citations

Synthesize across sources; do not simply concatenate per-document summaries.

### 時系列

- dated / period chronology
- change vs prior periods
- continuity
- evidence gaps
- citations per material period / change

Do not infer a change merely because different documents mention different topics.

### 比較

- compare GP / source / period / strategy on common dimensions
- compact comparison table when useful
- opportunities / risks / outlook / valuation / returns where supported
- agreements / disagreements
- citations per target

Multi-select UI is optional future refinement, not an architecture requirement.

### 面談準備

- recent meetings / sources
- key statements / updates
- changes since prior discussions
- unresolved topics
- items to reconfirm
- suggested next questions
- citations / Drive links

When a specific GP is required, UI should prompt for GP selection rather than produce an over-broad brief.

## Retrieval flow

```text
Mode + question / additional instruction
   |
   +--> metadata filters
   |
   v
Gemini File Search semantic retrieval
   |
   v
Relevant chunks
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

## Answer behavior

All modes must:

- use retrieved knowledge-base sources only
- distinguish grounded facts from synthesis / inference
- surface uncertainty / insufficient evidence
- show source records used
- link to authoritative Drive source

Do not expose model selection or deep-analysis routing initially.

## Synchronization lifecycle

### New registration

1. save authoritative source + backend Index
2. set AI status `Pending`
3. return registration success immediately
4. scheduled worker indexes source
5. success → `Indexed`
6. failure → `Failed`, no authoritative rollback

### Update

- keep stable Meeting ID / Document ID / Drive source
- set AI synchronization state
- remove / supersede previous AI Document
- index latest source + metadata
- avoid duplicate active AI Documents

### Inactivation

Remove corresponding File Search Document from normal retrieval.

### Reactivation

Re-index current authoritative source.

## Backend AI fields

Add to `Meeting_Index` and `Pitchbook_Index`:

```text
AI_Document_Name
AI_Index_Status
AI_Indexed_At
AI_Content_Hash
AI_Last_Error
```

States:

```text
NotIndexed
Pending
Indexed
Failed
```

## Settings

```text
GEMINI_FILE_SEARCH_STORE_NAME
AI_DEFAULT_MODEL
AI_SYNC_ENABLED
AI_SYNC_INTERVAL_MINUTES
```

Initial sync interval: 15 minutes.

Credentials are never stored in user-facing Sheets, source files, or GitHub.

## Sync execution

- Apps Script time-driven worker every 15 minutes
- process Pending / retryable Failed
- stable source IDs + stored AI references make retry idempotent
- permanent / unsupported failures are not retried indefinitely
- do not create duplicate AI Documents for same current source revision
- UI may indicate up to ~15 minutes until new / updated source becomes searchable

Retry batch size / backoff / cost guardrail values are implementation-time choices.

## Audit

Every Knowledge Search execution is written to the separate restricted Audit Spreadsheet.

Actor attribution is best-effort:

1. email if available
2. otherwise `TEMP_USER:<temporary key>` if available
3. otherwise `UNIDENTIFIED`

AI query audit includes:

```text
Timestamp
Actor
Search mode
Question / additional instruction
Date From / To
GP filter
Asset Class filter
Equity / Debt filter
Source Type filter
Configured model ID
Result
Cited source IDs when available
Short error when applicable
```

Do not store generated answer text, retrieved chunk text, embeddings, or full source contents in Audit Spreadsheet.

Persistent actual-user identity is not required for initial production operation.

## Security

- use only company-approved Gemini / Google Cloud environment for real confidential data
- credentials are server-side only
- Web App access is common initial retrieval boundary
- File Search derived data follows retention / deletion requirements
- Inactive / deletion workflows explicitly remove derived AI Documents where required
- Audit Spreadsheet is directly accessible only to admins through Google Drive permissions

## Validation before release

At minimum validate:

- Meeting indexing / retrieval
- `.pdf / .pptx / .xlsx / .docx / .txt / .eml` paths
- EML normalization and no auto-indexing of attachments
- <=25MB practical product path
- 15-minute worker / retry
- metadata filtering
- `未選択` omits filter
- common Active-source access for authorized users
- citation → correct source / Drive URL
- update → re-index without duplicate active AI Document
- Inactive exclusion / Reactivate restoration
- AI failure does not rollback authoritative registration
- retry idempotency
- audit fields are written without answer / chunk duplication
- configured Flash model used with no user model selector
- no confidential content / credentials leak to GitHub or inappropriate logs

## Non-goals

- custom Vector DB
- custom embedding service
- manual keyword taxonomy
- Knowledge Graph
- per-user / per-source AI ACL
- multiple user-selectable models
- Deep mode / model routing
- strict persistent user identity
- Web App Audit Viewer
- 100MB/file upload support
- `.msg` parsing
- automatic EML attachment indexing
- autonomous investment decisions
- automatic rewriting of official Meeting records
- public-web enrichment inside same retrieval request
