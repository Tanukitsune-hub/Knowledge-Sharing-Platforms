# Gemini File Search Retrieval Design

## Status

Status: Accepted

This document defines the retrieval and AI-answering layer to be added on top of the existing accumulation platform. The existing Google Docs, Pitchbooks, Shared Drive, and backend Sheets remain the authoritative source-of-truth layer. Gemini File Search is a derived retrieval index and may be rebuilt from the source records.

Official references:

- https://ai.google.dev/gemini-api/docs/file-search
- https://ai.google.dev/api/file-search/file-search-stores
- https://ai.google.dev/api/file-search/documents

## Goal

Allow users to ask questions across accumulated meeting records and Pitchbooks and receive organized answers grounded in the stored source materials, with citations and links back to the original Shared Drive files.

The initial design deliberately avoids a separately managed vector database, custom embedding pipeline, keyword-tag taxonomy, or knowledge graph.

## Architecture

```text
Google Shared Drive (authoritative records)
  ├─ Meeting Records (Google Docs)
  └─ Pitchbooks
          |
          | index/sync
          v
Gemini File Search Store
  ├─ Document chunks
  ├─ managed embeddings
  └─ custom metadata
          |
          | semantic retrieval + metadata filter
          v
Gemini API
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
7. Every answer must preserve traceability to the original source.
8. AI-indexing failure must not invalidate an otherwise successful Meeting or Pitchbook registration.
9. Model and embedding model identifiers must be configurable rather than hard-coded into business logic.

## File Search Store

Use one File Search Store initially for Meetings and Pitchbooks across all Asset Classes.

Do not create a Store per GP, year, or Asset Class. Use custom metadata to filter the shared Store instead.

Split the Store only if observed capacity or retrieval-latency evidence later justifies it. Current Gemini documentation recommends keeping an individual Store under 20GB for retrieval latency, while project-level limits depend on the API tier.

## Source indexing

### Meeting records

Google Docs remain the authoritative meeting record.

For File Search indexing, Apps Script reads the compact Docs text and uploads an equivalent text representation to the File Search Store. The File Search copy is derived and may be deleted/recreated without affecting the authoritative Google Doc.

### Pitchbooks

Index the source file itself when its format is supported by Gemini File Search.

The application upload limit remains 100MB per file. File Search also currently limits a Document to 100MB. Large File Search uploads must use a resumable/chunked upload implementation rather than assuming one Apps Script URL Fetch POST can carry the full payload.

Unsupported or failed-to-index formats remain valid Shared Drive records but receive an AI index status showing that they are unavailable to AI retrieval.

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

## Search UI

Add a `ナレッジ検索` page to the existing Apps Script Web App sidebar.

Initial controls:

- Free-form question
- Date From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

All dropdown filters must show `未選択` as the initial UI-only option.

`未選択` means the filter is not applied. It is not a GP/Option Master record and is never persisted as source metadata.

Example:

```text
質問: KKRは最近データセンター投資のボトルネックについて何と言っていたか
期間: 2024-01-01 ～ 2026-08-15
GP: KKR
Asset Class: Infrastructure
Equity / Debt: 未選択
Source Type: 未選択
```

The selected exact filters are converted into File Search metadata filters. The natural-language question is handled through semantic retrieval over the matching subset.

## Retrieval flow

```text
User question
   |
   +--> UI filters -> metadata filter
   |
   v
Gemini File Search
   |
   | relevant semantic chunks
   v
Gemini model
   |
   v
Grounded answer + file citations
   |
   v
Web App renders source labels and Drive links
```

Use stable IDs for filtering wherever possible. Display names are for user-facing labels and citation presentation.

## Answer behavior

The normal answer must:

- answer only from retrieved knowledge-base sources;
- clearly distinguish source-grounded facts from synthesis/inference;
- surface uncertainty or insufficient evidence rather than inventing an answer;
- show the source records used;
- allow the user to open the authoritative Drive source.

Citation annotations returned by Gemini File Search should be mapped to custom metadata such as `source_id`, `drive_url`, and `saved_filename`.

## Initial output modes

The first usable release needs only free-form question answering with filters and citations.

The same architecture should support later preset modes without changing the storage/retrieval design:

- 要約
- 時系列整理
- GP / 資料比較
- 面談準備

Preset modes should be implemented as controlled prompt/output templates, not separate retrieval systems.

## Synchronization lifecycle

AI indexing is decoupled from the authoritative registration transaction.

### New registration

1. Complete the normal Meeting/Pitchbook save to Shared Drive and backend Index.
2. Mark AI index status `Pending`.
3. Index the source into File Search.
4. On success, mark `Indexed` and store the File Search Document resource name and indexed timestamp.
5. On failure, mark `Failed` and retain a short error for retry. Do not roll back the authoritative record.

### Update

When source content or retrieval-relevant metadata changes:

1. keep the same Meeting ID / Document ID and Drive source;
2. remove or supersede the previous File Search Document;
3. re-index the latest source and metadata;
4. update AI index state.

### Inactivation

When a Meeting or Pitchbook becomes Inactive, remove its File Search Document so it is not returned by normal AI search.

### Reactivation

Re-index the current authoritative source and metadata.

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
AI_DEEP_MODEL
AI_SYNC_ENABLED
AI_EMBEDDING_MODEL
```

Do not store API keys or credentials in the user-facing Sheets, source repository, or source documents. Credential storage must use an organization-approved mechanism.

## Sync execution

Registration should remain responsive and must not depend on immediate successful File Search indexing.

Use a small synchronization worker pattern:

- direct post-save indexing may be attempted when practical;
- `Pending` / `Failed` records can be retried by an Apps Script time-driven sync process;
- retries must be idempotent using the stable source ID and stored File Search Document reference;
- do not create duplicate File Search Documents for the same current source revision.

For files over the Apps Script URL Fetch single-request payload limit, use Gemini File Search resumable upload in chunks. If the Apps Script runtime proves unreliable for 100MB indexing during implementation validation, escalate only the indexing transport to an organization-approved Google Cloud runtime while keeping the Web App, Shared Drive, and backend contracts unchanged.

## Security and governance

- Use only a company-approved Gemini API / Google Cloud project for real confidential data.
- Keep Shared Drive permissions and the existing application access model as the authoritative access boundary.
- File Search data is a derived copy and must follow the organization's retention and deletion requirements.
- Gemini File Search embeddings/documents persist until deleted; inactivation/deletion workflows must therefore explicitly remove the corresponding File Search Document where required.
- Never expose API credentials to client-side HTML/JavaScript.
- Audit AI-query actions when needed for organizational governance, but do not duplicate source document content into audit logs.

## Validation before release

At minimum validate:

- Meeting indexing and retrieval;
- Pitchbook indexing and retrieval;
- 100MB resumable upload path or documented validated fallback;
- metadata filtering by GP, Asset Class, Equity / Debt, source type, and date range;
- `未選択` correctly omits the corresponding filter;
- citations map to the correct source and Drive URL;
- source update causes re-indexing without duplicate active documents;
- Inactive sources disappear from normal AI retrieval;
- reactivation restores retrieval;
- AI indexing failure does not roll back authoritative registration;
- retry is idempotent;
- no confidential content or API key is written to GitHub or inappropriate logs.

## Non-goals for the initial retrieval release

- custom vector database;
- custom embedding service;
- manual keyword/tag taxonomy;
- knowledge graph;
- autonomous investment decisions;
- automatic rewriting of official meeting records;
- automatic enrichment from the public web in the same retrieval request.
