# Gemini File Search Retrieval Design

## Status

Status: Accepted

This document defines the retrieval and AI-answering layer to be added on top of the existing accumulation platform. The existing Google Docs, Pitchbooks, Shared Drive, and backend Sheets remain the authoritative source-of-truth layer. Gemini File Search is a derived retrieval index and may be rebuilt from the source records.

Official references:

- https://ai.google.dev/gemini-api/docs/file-search
- https://ai.google.dev/api/file-search/file-search-stores
- https://ai.google.dev/api/file-search/documents

## Goal

Allow users to ask questions across accumulated meeting records and Pitchbooks/source materials and receive organized answers grounded in the stored source materials, with citations and links back to the original Shared Drive files.

The initial design deliberately avoids a separately managed vector database, custom embedding pipeline, keyword-tag taxonomy, or knowledge graph.

## Architecture

```text
Google Shared Drive (authoritative records)
  ├─ Meeting Records (Google Docs)
  └─ Pitchbooks / source materials
          |
          | scheduled index/sync
          v
Gemini File Search Store
  ├─ Document chunks
  ├─ managed embeddings
  └─ custom metadata
          |
          | semantic retrieval + metadata filter
          v
Gemini Flash model
          |
          v
Apps Script Web App / Knowledge Search
  ├─ answer / summary / comparison
  ├─ citations
  └─ open original Drive source
```

## Core principles

1. Shared Drive remains the authoritative record. File Search is never the system of record.
2. Start with one File Search Store named logically as `Private Assets Knowledge`.
3. Let Gemini File Search manage chunking, embeddings, and semantic retrieval. Do not create an app-managed vector database in the initial design.
4. Use exact human-controlled metadata for filtering and embeddings for semantic relevance.
5. Do not generate and maintain an automatic keyword/tag taxonomy in the initial design.
6. Only Active records are available to normal AI retrieval.
7. Every authenticated Web App user may search all Active records indexed into the shared File Search Store. The initial release does not implement per-record or per-user retrieval ACL filtering.
8. Every answer must preserve traceability to the original source.
9. AI-indexing failure must not invalidate an otherwise successful Meeting or Pitchbook registration.
10. Use a single configured Gemini Flash model in the initial release. Do not expose model selection to users.
11. Keep the concrete Flash model identifier configurable in `Settings` rather than hard-coding it into business logic.

## File Search Store

Use one File Search Store initially for Meetings and Pitchbooks/source materials across all Asset Classes.

Do not create a Store per GP, year, or Asset Class. Use custom metadata to filter the shared Store instead.

Split the Store only if observed capacity or retrieval-latency evidence later justifies it. Current Gemini documentation recommends keeping an individual Store under 20GB for retrieval latency, while project-level limits depend on the API tier.

## Source indexing

### Meeting records

Google Docs remain the authoritative meeting record.

For File Search indexing, Apps Script reads the compact Docs text and uploads an equivalent text representation to the File Search Store. The File Search copy is derived and may be deleted/recreated without affecting the authoritative Google Doc.

### Pitchbooks and source materials

Initial supported source extensions are:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

PDF, PowerPoint, Excel, Word, and text files are indexed as supported source documents when the validated Gemini File Search path accepts the format.

For Outlook saved email, support `.eml` in the initial release. Keep the original `.eml` in Shared Drive as the authoritative file, but index a normalized UTF-8 text representation containing, when available:

```text
Subject
From
To
Cc
Date
Body
```

Convert HTML body content to readable text for indexing. Do not treat email attachments embedded in the `.eml` as automatically indexed source materials in the initial release; important attachments should be registered separately. Outlook `.msg` is not an initial supported format.

The application upload limit remains 100MB per file. File Search also currently limits a Document to 100MB. Large File Search uploads must use a resumable/chunked upload implementation rather than assuming one Apps Script URL Fetch POST can carry the full payload.

Unsupported formats remain valid Shared Drive records but are not AI-searchable and should be marked `NotIndexed`. Supported files that encounter an indexing error use `Failed`.

## Custom metadata

Copy authoritative classification metadata from the backend Index into the File Search Document.

Initial metadata fields:

```text
source_type        meeting | pitchbook
source_id          MTG-XXXXXX | DOC-XXXXXX
date_key           YYYYMMDD as numeric metadata
gp_id              stable GP ID
gp_name            current GP display name
asset_class_id      stable Option ID
asset_class_name    current display name
capital_type_id     stable Option ID when selected
capital_type_name   current display name when selected
drive_url           original source URL
saved_filename      current source filename
```

Do not store `未選択` as metadata. Missing optional metadata remains absent/null.

Keep metadata within Gemini File Search's supported custom-metadata limits.

## Search access model

The initial knowledge base uses one shared access boundary.

- Every authenticated user who is allowed to use the Web App may use Knowledge Search.
- All such users may retrieve across all Active Meeting and Pitchbook/source-material records in the File Search Store.
- Do not implement per-GP, per-file, per-user, or per-source retrieval ACL filtering in the initial release.
- Administration of audit logs remains admin-only and is separate from ordinary AI-search permissions.

If the organization later requires materially different source permissions by user, treat that as a new security/architecture requirement rather than silently adding ad-hoc filters.

## Knowledge Search UI

Add a `ナレッジ検索` page to the existing Apps Script Web App sidebar.

### Mode selector

The Knowledge Search page uses one shared retrieval surface with five user-facing modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問` is the initial/default mode.

The five modes do not use separate search systems. They all use the same File Search Store, custom metadata filters, semantic retrieval, Gemini Flash model, citation handling, and Drive-source links. A preset mode changes the prompt/output template only.

### Shared filters

The following filters are shared across modes where relevant:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

All dropdown filters must show `未選択` as the initial UI-only option.

`未選択` means the filter is not applied. It is not a GP/Option Master record and is never persisted as source metadata.

### Instruction field

- In `自由質問`, the natural-language question field is the primary required input.
- In preset modes, the same area may be shown as an optional `追加指示` field so the user can refine the preset without creating another search workflow.
- Preset modes must still work from the selected metadata scope even when no additional instruction is supplied.

Example free question:

```text
質問: KKRは最近データセンター投資のボトルネックについて何と言っていたか
期間: 2024-01-01 ～ 2026-08-15
GP: KKR
Asset Class: Infrastructure
Equity / Debt: 未選択
Source Type: 未選択
```

The selected exact filters are converted into File Search metadata filters. The natural-language question or preset instruction is handled through semantic retrieval over the matching subset.

## Five search/output modes

### 1. 自由質問

Purpose: answer an arbitrary user question from the accumulated knowledge base.

Expected output:

- direct grounded answer;
- important supporting points;
- uncertainty / insufficient-evidence note when applicable;
- cited source records with Drive links.

### 2. 要約

Purpose: summarize the important information contained in the selected scope.

Default output structure should favor:

- main themes / key findings;
- material facts and viewpoints;
- notable changes or contradictions when supported;
- concise takeaways;
- cited source list.

Do not simply concatenate per-document summaries; synthesize across the retrieved sources.

### 3. 時系列

Purpose: organize statements, developments, or changes in view over time.

Default output structure should favor:

- dated or period-based chronology;
- what changed versus prior periods;
- points that remained consistent;
- gaps where no relevant evidence is available;
- cited sources for each material period or change.

Do not infer a change in view merely because different documents mention different topics.

### 4. 比較

Purpose: compare GPs, source materials, periods, strategies, or other user-specified subjects using common dimensions.

Default output structure should favor a compact comparison table or clearly aligned sections such as:

- investment view / market outlook;
- opportunities;
- risks / constraints;
- valuation / returns where supported;
- areas of agreement and disagreement;
- cited sources for each comparison target.

Comparison targets may be specified through the selected filters and/or the optional additional instruction. If implementation later benefits from multi-select controls, they may be added without changing the retrieval architecture.

### 5. 面談準備

Purpose: turn the accumulated history for a GP or selected scope into a practical next-meeting brief.

Default output structure should favor:

- recent meetings and source materials;
- recent key statements / updates;
- changes since prior discussions;
- previously discussed or unresolved topics;
- items worth reconfirming;
- suggested questions for the upcoming meeting;
- cited sources and Drive links.

When a specific GP is needed to produce a useful meeting brief, the UI should require or clearly prompt for a GP selection rather than silently producing a broad generic brief.

## Retrieval flow

```text
Mode + user question/additional instruction
   |
   +--> UI filters -> metadata filter
   |
   v
Gemini File Search
   |
   | relevant semantic chunks
   v
Configured Gemini Flash model
   |
   | mode-specific prompt/output template
   v
Grounded answer + file citations
   |
   v
Web App renders source labels and Drive links
```

Use stable IDs for filtering wherever possible. Display names are for user-facing labels and citation presentation.

## Answer behavior

All modes must:

- answer only from retrieved knowledge-base sources;
- clearly distinguish source-grounded facts from synthesis/inference;
- surface uncertainty or insufficient evidence rather than inventing an answer;
- show the source records used;
- allow the user to open the authoritative Drive source.

Citation annotations returned by Gemini File Search should be mapped to custom metadata such as `source_id`, `drive_url`, and `saved_filename`.

Do not expose model selection or a deep-analysis mode in the initial UI. Use the configured Flash model for all modes.

## Delivery sequence for modes

The five-mode UI is the accepted target UX.

Implementation may be staged to reduce first-release risk:

1. complete `自由質問` with filters, retrieval, citations, and Drive links;
2. validate the common retrieval layer;
3. add `要約`, `時系列`, `比較`, and `面談準備` as prompt/output presets on the same page.

Staging the presets does not change the accepted five-mode product design and must not create parallel retrieval implementations.

## Synchronization lifecycle

AI indexing is decoupled from the authoritative registration transaction.

### New registration

1. Complete the normal Meeting/Pitchbook save to Shared Drive and backend Index.
2. Mark AI index status `Pending`.
3. Return registration success without waiting for Gemini indexing.
4. The scheduled AI sync worker indexes the source into File Search.
5. On success, mark `Indexed` and store the File Search Document resource name and indexed timestamp.
6. On failure, mark `Failed` and retain a short error. Do not roll back the authoritative record.

### Update

When source content or retrieval-relevant metadata changes:

1. keep the same Meeting ID / Document ID and Drive source;
2. mark the AI state for synchronization;
3. remove or supersede the previous File Search Document;
4. re-index the latest source and metadata;
5. update AI index state.

### Inactivation

When a Meeting or Pitchbook becomes Inactive, schedule removal of its File Search Document so it is not returned by normal AI search.

### Reactivation

Schedule re-indexing of the current authoritative source and metadata.

## Backend Index extension

Add the following fields to both `Meeting_Index` and `Pitchbook_Index`:

```text
AI_Document_Name
AI_Index_Status
AI_Indexed_At
AI_Content_Hash
AI_Last_Error
```

Allowed application-level AI index states:

```text
NotIndexed
Pending
Indexed
Failed
```

`AI_Content_Hash` is used to detect whether authoritative content changed and requires re-indexing.

## Settings extension

Add configuration keys as needed, initially including:

```text
GEMINI_FILE_SEARCH_STORE_NAME
AI_DEFAULT_MODEL
AI_SYNC_ENABLED
AI_SYNC_INTERVAL_MINUTES
```

Initial policy:

```text
AI_SYNC_INTERVAL_MINUTES = 15
AI_DEFAULT_MODEL = configured Gemini Flash model
```

Do not store API keys or credentials in the user-facing Sheets, source repository, or source documents. Credential storage must use an organization-approved mechanism.

## Sync execution

Use an Apps Script time-driven synchronization worker every 15 minutes.

- Registration/update remains responsive and does not wait for Gemini indexing.
- The worker processes `Pending` work and retryable `Failed` work.
- Retries must be idempotent using the stable source ID and stored File Search Document reference.
- Permanent/unsupported failures must not be retried indefinitely; classify them as non-retryable and leave a clear `AI_Last_Error`/status for investigation.
- Do not create duplicate File Search Documents for the same current source revision.
- The UI may state that newly registered or updated sources can take approximately 15 minutes to become searchable.

For files over the Apps Script URL Fetch single-request payload limit, use Gemini File Search resumable upload in chunks. If the Apps Script runtime proves unreliable for 100MB indexing during implementation validation, escalate only the indexing transport to an organization-approved Google Cloud runtime while keeping the Web App, Shared Drive, and backend contracts unchanged.

## AI query audit

Every Knowledge Search execution in any of the five modes is part of the existing five-year audit policy.

For each AI query, record at least:

```text
Event timestamp
User identity
Action = AI_QUERY
Search mode
Question / additional instruction text
Date From / To
GP filter
Asset Class filter
Equity / Debt filter
Source Type filter
Configured model ID
Result = Success / Failure
Cited source IDs when available
Short error code/message when applicable
```

The audit log is admin-only, consistent with the existing audit policy.

Do not store the generated answer text, retrieved chunk text, embeddings, or full source contents in the audit log. The user question/additional instruction is retained for auditability, while source content remains in the authoritative/derived systems rather than being copied into the audit store.

## Security and governance

- Use only a company-approved Gemini API / Google Cloud project for real confidential data.
- The authenticated Web App user boundary is the initial retrieval access boundary; all Web App users may search all Active indexed sources.
- File Search data is a derived copy and must follow the organization's retention and deletion requirements.
- Gemini File Search embeddings/documents persist until deleted; inactivation/deletion workflows must therefore explicitly remove the corresponding File Search Document where required.
- Never expose API credentials to client-side HTML/JavaScript.
- Audit every AI query under the five-year admin-only audit policy.

## Validation before release

At minimum validate:

- Meeting indexing and retrieval;
- `.pdf`, `.pptx`, `.xlsx`, `.docx`, `.txt`, and `.eml` registration/indexing paths;
- EML header/body normalization and exclusion of embedded attachments from automatic indexing;
- rejection or `NotIndexed` handling for unsupported formats such as `.msg`;
- 100MB resumable upload path or documented validated fallback;
- 15-minute scheduled synchronization and retry behavior;
- metadata filtering by GP, Asset Class, Equity / Debt, source type, and date range;
- `未選択` correctly omits the corresponding filter;
- all authorized Web App users can query all Active indexed sources;
- citations map to the correct source and Drive URL;
- source update causes re-indexing without duplicate active documents;
- Inactive sources disappear from normal AI retrieval;
- reactivation restores retrieval;
- AI indexing failure does not roll back authoritative registration;
- retry is idempotent;
- AI query audit records search mode and required metadata but not answer/chunk text;
- the configured Flash model is used with no user model-selection control;
- all five modes reuse the same retrieval/citation layer;
- `自由質問` works as the default mode;
- preset outputs follow their intended summary / chronology / comparison / meeting-prep structures without fabricating unsupported information;
- no confidential content or API key is written to GitHub or inappropriate logs.

## Non-goals for the initial retrieval architecture

- custom vector database;
- custom embedding service;
- manual keyword/tag taxonomy;
- knowledge graph;
- per-user/per-source AI retrieval ACLs;
- multiple user-selectable Gemini models;
- deep-analysis model routing;
- separate retrieval engines for each preset mode;
- Outlook `.msg` parsing;
- automatic indexing of attachments embedded in `.eml`;
- autonomous investment decisions;
- automatic rewriting of official meeting records;
- automatic enrichment from the public web in the same retrieval request.
