# AI provider selection and full-output contract

Current as of: 2026-08-28

Status: Accepted

## Decision

Knowledge Search exposes exactly three normal-user generation choices:

```text
ChatGPT
Gemini
全文出力
```

Internal provider codes are:

```text
OPENAI
GEMINI
FULL_EXPORT
```

`ChatGPT` is the user-facing label for the OpenAI API route.

## Route behavior

### ChatGPT

- uses the approved OpenAI API;
- File Search / retrieval is the required default source-reading path;
- **both Meeting records and Pitchbook/source materials are File Search sources** when the provider supports the relevant indexed representation;
- returns a grounded answer, citations, and authoritative Drive links;
- provider model and Store identifiers are administrator settings, not normal-user selectors.

### Gemini

- uses the approved Gemini API;
- File Search / retrieval is the required default source-reading path;
- **both Meeting records and Pitchbook/source materials are File Search sources** when the provider supports the relevant indexed representation;
- returns a grounded answer, citations, and authoritative Drive links;
- provider model and Store identifiers are administrator settings, not normal-user selectors.

### 全文出力

- calls no AI API;
- the full-text body consists of **authoritative Meeting Google Docs text only**;
- Pitchbook/source-file body text is **not** copied into the full-output package;
- Pitchbooks may be listed after the Meeting body as bounded reference metadata with stable source identity and authoritative Drive links;
- Pitchbook references are not counted as full-text sources and their file bytes/text are not extracted merely for FULL_EXPORT;
- builds one canonical Meeting full-text Knowledge Package;
- offers Copy, Google Docs, and PDF outputs from exactly that same package.

This is an intentional product boundary, not a temporary format limitation:

```text
ChatGPT / Gemini File Search
  -> Meeting + Pitchbook/source materials

全文出力
  -> Meeting Google Docs full text
  -> optional Pitchbook reference list + Drive links
```

Do not broaden FULL_EXPORT into Pitchbook text extraction without a later explicit product decision.

## No automatic provider failover

The selected route is authoritative for the request.

If ChatGPT or Gemini is disabled, unconfigured, unavailable, not qualified, or missing credentials, return a clear safe error. Do not silently send the request or source content to another provider.

Provider availability may be shown in the UI, but a disabled provider remains a distinct route rather than being replaced by another route.

## Shared contracts

The three routes reuse common provider-neutral contracts:

```text
Canonical AI Source
Canonical Knowledge Request
Canonical Meeting Knowledge Package
Citation / source identity model
Structured filters
Audit redaction policy
```

Provider adapters must not duplicate source authority, stable identity, metadata normalization, filter semantics, or prompt-mode definitions.

FULL_EXPORT intentionally uses only the Meeting-body branch of the authoritative source model. File Search provider adapters may index both Meeting and Pitchbook/source materials.

Provider adapters own only provider-specific Store, indexing, query, response, citation, retry, and cleanup behavior.

## Full-output UX

Long full-text output must not use a popup or modal.

When `全文出力` is selected:

1. show Meeting count, Meeting-body approximate character count, and active scope summary;
2. if matching Pitchbooks exist, show their count separately as reference materials rather than as full-text sources;
3. place the action buttons above the output body in this order:
   - `コピー`;
   - `Google Docs`;
   - `PDF`;
4. place the Meeting full-text preview at the bottom of the section/page;
5. use a fixed/bounded-height preview with internal scrolling;
6. allow output without requiring the user to scroll through or inspect the body;
7. ensure Copy, Docs, and PDF consume the identical canonical package and package fingerprint;
8. do not read Pitchbook file bytes or extract Pitchbook text for FULL_EXPORT.

Illustrative order:

```text
全文出力
Meeting 12件 / 84,320文字
参考Pitchbook 8件
[ コピー ] [ Google Docs ] [ PDF ]

全文プレビュー
┌──────────────────────────┐
│ Meeting Docs full text    │
│ fixed height / scroll     │
└──────────────────────────┘

参考Pitchbook
- source identity / metadata / Drive link
```

The reference Pitchbook list may render before or after the preview according to the final page layout, but it must not be represented as included full-text body content.

## Provider state

OpenAI and Gemini derived-index state must be independently observable. A single ambiguous AI status/document reference must not represent both providers.

Work 0020 will implement an append-only provider-state migration while preserving historical fields and the five-sheet Backend. No new provider-state sheet/database is introduced.

Preferred representation is one validated provider-state object per source, keyed by `OPENAI` and `GEMINI`, with migration from the existing legacy Gemini-oriented fields when the new state is blank. Exact physical columns and compatibility mirroring are finalized after the Work 0020 source inventory, but the semantic independence of both providers is closed.

## Security and exposure

- credentials stay server-side and outside GitHub, browser responses, Audit, exports, and user-visible Sheets;
- questions, answers, retrieved chunks, source bodies, raw provider payloads, and credentials are not stored in Audit;
- Audit may record provider code, mode, structured filter IDs, result, safe error code, and cited stable source IDs;
- FULL_EXPORT may create derived Meeting-text Docs/PDF artifacts under the accepted export boundary but never duplicates Pitchbook file bodies;
- no confidential/company source is indexed before final production authorization.

## Qualification boundary

Personal-PC qualification may enable one or both API providers.

- `FULL_EXPORT` must pass end-to-end using Meeting Google Docs text;
- every enabled provider must pass its own File Search/index/query/citation lifecycle using both a Meeting and a Pitchbook/source in the bounded core slice;
- a deliberately disabled provider must prove the expected safe-error path;
- no provider is considered company-production-ready until final company-environment qualification.

## Non-goals

- automatic provider routing or failover;
- user-facing model selector;
- custom vector database or embedding service;
- AI-generated investment decisions;
- provider-specific duplication of the product/search UI;
- full-context API submission as a substitute for the required File Search route;
- Pitchbook/source body extraction for the manual `全文出力` route.
