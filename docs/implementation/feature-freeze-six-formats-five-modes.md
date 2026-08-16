# Feature-freeze candidate: six formats and five Knowledge Search modes

Work ID: `0009`

## Outcome

Work 0009 completes the accepted pre-live product scope for the AI layer.

Supported authoritative Pitchbook/source formats:

- `.pdf`
- `.pptx`
- `.xlsx`
- `.docx`
- `.txt`
- `.eml`

Supported Knowledge Search modes:

- 自由質問
- 要約
- 時系列
- 比較
- 面談準備

All modes use one File Search Store, one metadata-filter builder, one Gemini interaction boundary, one citation parser, one authoritative Drive-link resolver, and one Audit path.

## Format handling

### Direct binary formats

PDF, PPTX, XLSX, DOCX, and TXT use the authoritative Drive file bytes. The AI worker:

1. reads the existing Drive file by File ID;
2. verifies extension, MIME type, non-empty bytes, and the current 25MB product limit;
3. hashes the exact bytes;
4. sends the same bytes to the resumable File Search upload session with the explicit upload MIME type;
5. reconciles the returned File Search Document with the stable source ID and content hash.

The binary bytes remain transient. They are not written to Sheets, Audit, Script Properties, reports, or test logs.

### EML

The original `.eml` file remains authoritative in Shared Drive. The AI copy is normalized UTF-8 text containing available:

- Subject
- From
- To
- Cc
- Date
- Body

The normalizer unfolds headers, decodes common RFC 2047 encoded words, supports base64 and quoted-printable transfer encodings, recursively reads bounded multipart messages, prefers non-attachment text/plain, falls back to sanitized text/html, and excludes attachment parts and attachment filenames.

Malformed, empty, excessive-depth, excessive-part-count, or attachment-only messages fail deterministically. Embedded attachments are not indexed automatically.

## Synchronization behavior

The Work 0008 lifecycle is retained for all six formats:

- Pending / eligible NotIndexed / retryable Failed sources are selected in bounded batches;
- source-level claims prevent overlapping work;
- current content hash and stable source ID prevent duplicate active derived Documents;
- matching derived Documents are reused;
- duplicates and stale revisions are deleted;
- an Indexed row with a missing external Document is repaired rather than silently skipped;
- Inactive sources are removed from derived retrieval;
- retryable errors use bounded backoff;
- authoritative registration or maintenance is never rolled back by AI failure.

## Knowledge Search

Mode contracts:

- 自由質問: question required; direct answer followed by supporting points.
- 要約: optional additional instruction; cross-source synthesis rather than per-file concatenation.
- 時系列: optional additional instruction; separates observed change, continuity, and evidence gaps.
- 比較: optional additional instruction; uses supported common dimensions and avoids invented rankings.
- 面談準備: GP required; creates recent context, changes, unresolved issues, reconfirmation items, and suggested questions.

All modes require Japanese grounded output, explicit uncertainty, and citations. Citation annotation URLs are not trusted directly. Stable source IDs are resolved through the backend Index to Active authoritative HTTPS Drive URLs.

## Audit and security

AI Audit rows contain mode, question/additional instruction, filters, configured model ID, success/failure, cited source IDs, and short error data.

They do not contain:

- generated answer text;
- retrieved chunks;
- embeddings;
- Meeting notes;
- normalized EML body;
- Pitchbook file bytes or contents.

Credentials remain server-side and are not committed. The concrete production Flash model and approved credential provider remain Work 0010 configuration items.

## Local validation

Work 0009 validation command:

```bash
node --test \
  tests/ai-contracts.test.cjs \
  tests/ai-sync.test.cjs \
  tests/ai-query-ui.test.cjs \
  tests/ai-feature-freeze.test.cjs
```

This validates contracts, sync behavior, all six format paths, representative synthetic EML cases, all five modes, authoritative citation mapping, audit redaction, UI tokens, and feature-freeze diagnostics without external calls.

## Deferred live evidence

Work 0010 remains responsible for live Apps Script, Shared Drive, File Search, Gemini Flash, trigger, OAuth, browser, and practical payload qualification.
