# Work 0011 planning — Knowledge export and external-AI handoff

Status: Accepted product design; implementation must not start until Work 0010 temporary qualification code is removed and its final integration ref is confirmed.

Work ID: `0011`

## Outcome

Add a non-Gemini export path on top of the existing Knowledge Search filters so users can:

1. resolve every Active authoritative source matching the structured filters;
2. export all matching Meeting records into one Google Doc or one PDF;
3. receive a metadata-and-Drive-link list for all matching Pitchbooks;
4. copy a neutral, mode-aware prompt for use with any organization-approved AI.

The platform owns source discovery and packaging. The user may choose a separate approved AI for subsequent analysis.

## Core design decisions

### Source set

- Use the same structured filters as Knowledge Search:
  - Date From / To;
  - GP;
  - Asset Class;
  - Equity / Debt;
  - Source Type.
- Resolve sources directly from the authoritative Backend Indexes.
- Include every matching `Active` source.
- Do not use Gemini citations, semantic top-k results, answer text, or retrieved chunks to decide the export set.
- The free question or preset additional instruction affects only the copied external-AI prompt; it does not narrow the exported source set.
- Do not add item-by-item selection in the initial version.

### Preview before creation

Before enabling export, show:

- matching Meeting count;
- total Meeting body character count;
- matching Pitchbook count;
- whether the request is below warning and hard-stop limits.

The preview and final creation must use the same normalized filter and Active-source resolution contract.

### Ordering

- Meeting records: oldest date to newest date.
- Pitchbooks: oldest date to newest date.
- Use stable source ID as the deterministic tie-breaker.

Chronological order is the default because the export is primarily an analysis package for change-over-time, comparison, and meeting-preparation use.

### Meeting export content

For each matching Meeting, include:

- Meeting ID;
- Date;
- Time when present;
- GP;
- Asset Class;
- Equity / Debt when present;
- Location when present;
- Counterparty when present;
- Internal Participants when present;
- authoritative Google Drive / Docs link;
- the complete authoritative Meeting body text without summarization or rewriting.

Insert a page break between Meeting records.

The generated export is a derived artifact, not a new authoritative Meeting record. Do not add it to `Meeting_Index` or the Gemini File Search Store.

### Pitchbook section

Do not merge, convert, download, or reproduce Pitchbook file bodies.

For each matching Pitchbook, include:

- Document ID;
- Date;
- GP;
- Asset Class;
- Equity / Debt when present;
- saved filename;
- file extension;
- authoritative Drive link.

Users download or open the original Pitchbook themselves when needed.

### Output formats

- User-selectable output: Google Docs or PDF.
- Google Docs output is retained as the selected derived artifact.
- PDF may use a temporary Google Doc internally; no duplicate permanent user-visible Doc is required for a PDF-only request.
- Return the created artifact link to the user.
- PDF export failure must not be reported as success.

### Export storage

- Create or reuse a dedicated `Knowledge Exports` derived-artifact folder.
- Keep it separate from the authoritative `Private Assets Knowledge/Meeting Records` and `Private Assets Knowledge/Pitchbooks` folders.
- Prefer `Knowledge Exports` as a sibling under the configured knowledge parent so the authoritative root retains only its two accepted source folders.
- Setup and validation must create/reuse and diagnose the export folder idempotently.
- Initial version has no automatic deletion schedule.

Suggested filename pattern:

```text
Knowledge_Export_<primary filters>_<date range>_<generated timestamp>
```

Sanitize and shorten names rather than forcing every filter into the filename.

## Safety limits

### Warning threshold

Show a non-blocking warning when either is exceeded:

- more than `30` Meeting records; or
- more than `150,000` Meeting body characters.

### Hard-stop threshold

Do not create a partial export when any limit is exceeded:

- more than `50` Meeting records; or
- more than `250,000` Meeting body characters; or
- more than `200` Pitchbooks.

Return the exact counts and instruct the user to narrow the filters.

Do not silently export the first N records. Do not add chunking, multi-document splitting, background jobs, Cloud runtime, or another export architecture in the initial version.

The limits may only be lowered when live Apps Script / Docs / PDF evidence shows a lower simple bound is required.

## External-AI prompt copy

Provide a one-click clipboard action for a neutral prompt based on the current mode:

- 自由質問;
- 要約;
- 時系列;
- 比較;
- 面談準備.

The generated prompt must:

- work without naming or depending on a particular AI provider;
- instruct the AI to use only the attached/exported materials;
- include the normalized structured filters;
- include the current question or additional instruction;
- preserve each mode's current grounded-output intent;
- request source-title references where possible;
- prohibit unsupported inference and invented facts;
- explain that the Meeting export contains full original text and the Pitchbook section contains links rather than Pitchbook contents;
- remind the user to attach the export and separately upload any Pitchbooks they choose to analyze.

The copy action must work even when Gemini API configuration is absent.

Display a concise policy notice:

> 機密資料を別のAIへ投入する場合は、所属組織の利用ルールと許可されたサービスに従ってください。

## UI

Add an export section to the existing Knowledge Search surface as a sibling of Gemini search, not as a replacement.

Recommended flow:

```text
structured filters + mode + question/additional instruction
  -> 対象資料を確認
  -> Meeting count / characters / Pitchbook count
  -> Google Docsに書き出す | PDFに書き出す | AI用プロンプトをコピー
```

- Do not require a Gemini query before preview or export.
- Do not show Gemini citation counts as export counts.
- Disable creation when hard-stop limits are exceeded.
- Clearly show when Source Type means only Meeting or only Pitchbook sources are included.

## Audit

Use the separate restricted Audit Spreadsheet and record metadata-only events for:

- export preview;
- Google Docs export creation;
- PDF export creation;
- external-AI prompt copy.

Record the Actor, timestamp, filters, mode, result, source IDs or counts, output type, and created artifact ID/link where appropriate.

Do not copy Meeting body text, Pitchbook content, generated export body, copied prompt text, Gemini answer text, retrieved chunks, embeddings, or file bytes into Audit.

Audit write failure remains non-blocking after a successful artifact creation, consistent with existing authoritative/derived-operation policy.

## Architecture constraints

- Apps Script V8 plain JavaScript remains the production runtime.
- Reuse existing filter normalization, Backend Index access, Master maps, Actor fallback, Audit adapter, Drive/Docs adapters, and setup/migration patterns.
- Export source resolution must not call Gemini.
- Do not add a new database, Vector DB, model router, AI provider integration, per-user ACL system, background worker, or parallel application.
- Do not change the existing Gemini File Search and five-mode behavior except to share pure filter/prompt contracts where that reduces duplication safely.
- Preserve all Work 0010 fixes and cleanup.

## Implementation and validation approach

Implement the complete feature first with deterministic local tests, then perform targeted DEV live qualification using synthetic data.

Required local coverage includes:

- Active-only filter resolution;
- Gemini citations not affecting the export set;
- oldest-to-newest deterministic ordering;
- preview counts and character totals;
- warning thresholds;
- each hard-stop threshold;
- no partial export;
- exact full Meeting body preservation;
- Pitchbook metadata/link-only output;
- Source Type behavior;
- five prompt modes;
- Gemini-unconfigured operation;
- Audit redaction;
- setup idempotency for `Knowledge Exports`.

Required targeted live evidence includes:

- export preview against synthetic DEV sources;
- multi-Meeting Google Doc creation and ordering;
- PDF creation and link;
- Pitchbook link list;
- hard-stop behavior without partial output;
- prompt clipboard behavior in the deployed Web App;
- derived artifact saved outside authoritative source folders;
- no new Meeting/Pitchbook Index or File Search source created from the export.

## Acceptance criteria

- The same structured filters resolve all and only matching Active authoritative sources.
- Export selection is independent of Gemini citations and works without Gemini credentials.
- Users see counts before creation.
- Meeting content is complete, unmodified, chronological, and separated clearly.
- Pitchbooks are represented by complete metadata and authoritative Drive links only.
- Google Docs and PDF outputs work in DEV.
- Warning and hard-stop limits behave exactly as specified; no partial export is produced.
- Five mode-aware neutral prompts copy successfully.
- Export artifacts remain derived and separate from authoritative source storage and AI indexing.
- Audit is metadata-only and content-redacted.
- Canonical local checks and targeted DEV checks pass with no implementation blocker.

## Non-goals / backlog

- Item-by-item source selection;
- combining Pitchbook binaries;
- ZIP packaging;
- automatic Pitchbook download;
- multiple output documents for oversized requests;
- automatic export deletion;
- automatic upload to third-party AI;
- provider-specific prompts;
- new access-control model;
- Gemini-based source selection.

## Execution gate

Do not start Work 0011 implementation until all of the following are true:

1. Work 0010 temporary qualification code has been removed.
2. The final Work 0010 report and commit are pushed to PR #8.
3. ChatGPT has reviewed the final Work 0010 diff and confirmed the integration ref.
4. Work 0011 receives a separate `docs/handoffs/0011-instruction.md` with the exact starting ref and branch.

Work 0010 user-dependent Gemini validation may be recorded as an explicit deferred operational check if the user accepts that deferral, but temporary code cleanup and non-user residual work must be complete before Work 0011 begins.
