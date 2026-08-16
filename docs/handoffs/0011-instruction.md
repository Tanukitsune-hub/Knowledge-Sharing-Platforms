# Work 0011 — Knowledge export and external-AI handoff

WORK_ID: `0011`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Codex implementation and targeted validation`, with ChatGPT retaining ownership of product scope, accepted design, GitHub review, integration, and completion.

Recommended Codex model: `Luna Max` — the outcome, source-of-truth design, limits, UI behavior, storage boundary, and acceptance checks are settled. The residual task is a coherent Apps Script implementation, deterministic tests, and targeted synthetic DEV validation. Use `Sol High` only if an observed cross-cutting Apps Script / Docs / Drive failure requires material architecture-level diagnosis.

Starting ref: `2141e606e6fde688905b9662b10608660d792ec7`

Target branch: `agent/0011-knowledge-export-external-ai-handoff`

Draft PR target: `main`

Before starting:

1. Read every applicable `AGENTS.md` and `AGENTS.override.md` file.
2. Identify and follow the repository-specific subagent-use policy.
3. Use subagents actively and proportionately. Subagent use is mandatory. Use independent perspectives for:
   - existing filter / Index / setup architecture and implementation planning;
   - export document / PDF / Drive adapter implementation review;
   - UI, clipboard, limits, and accessibility review;
   - security, Audit redaction, regression, and final diff review.
4. Avoid overlapping write ownership and synthesize all subagent findings before completion.
5. Never commit or report credentials, Google resource IDs, private URLs, account identifiers, source content, or local paths.

## Outcome

Add a Gemini-independent export path to the existing Knowledge Search surface so users can:

1. resolve every matching `Active` authoritative source using the existing structured filters;
2. preview matching Meeting count, exact exported Meeting character count, and Pitchbook count;
3. export all matching Meetings, oldest to newest, into one Google Doc or one PDF without summarization or rewriting;
4. include a metadata-and-authoritative-Drive-link list for every matching Pitchbook, without combining or reproducing Pitchbook bodies;
5. copy a neutral, mode-aware prompt for use with any organization-approved AI.

The platform owns source discovery and packaging. Gemini citations, semantic top-k results, answers, and retrieved chunks must not determine the export source set.

## Source of truth and accepted design

Primary design source:

- `docs/planning/work0011-knowledge-export-and-external-ai-handoff.md`

Preserve all merged Work 0010 fixes and explicit deferred qualification limitations. Work 0011 does not require a Gemini credential and must not reopen or block on the deferred Work 0010 Gemini/browser matrices.

## Required scope

### 1. Shared filter and source-resolution contract

Reuse the existing Knowledge Search structured filters:

- Date From / To;
- GP;
- Asset Class;
- Equity / Debt;
- Source Type.

Requirements:

- resolve directly from authoritative `Meeting_Index` and `Pitchbook_Index` rows;
- include all and only matching `Active` sources;
- do not call Gemini during preview, export, or prompt generation;
- do not use Gemini citations or semantic retrieval to narrow the export set;
- question / additional instruction affects only the copied prompt;
- Source Type `Meeting` excludes Pitchbooks; Source Type `Pitchbook` excludes Meetings; blank includes both;
- stable order is oldest date to newest date, then stable source ID;
- no item-by-item selection in the initial version.

Do not silently omit a matching Active source. If a matching Meeting cannot be read from its authoritative Doc, or a matching Pitchbook lacks an authoritative Drive link, return an explicit source-integrity error identifying the source ID and do not create a partial artifact.

### 2. Preview and stale-preview safety

Add a server-side preview operation that returns:

- normalized filters;
- Meeting count;
- total character count of the exact Meeting text that would be exported;
- Pitchbook count;
- warning state;
- hard-stop state and exact reason;
- ordered source IDs;
- a deterministic preview fingerprint derived from the ordered source identities and relevant current revision/update tokens.

The preview and creation paths must share the same pure source-resolution contract.

Creation must re-resolve server-side and reject a stale preview when the ordered source set or relevant revision token changed. Return a clear `preview stale; run preview again` response rather than exporting a different set than the user reviewed.

Zero matching sources disables artifact creation and returns a clear no-results state. Prompt copy may remain available when the mode input is valid, but the UI must state that no matching materials were found.

### 3. Limits

Warning when either is exceeded:

- more than `30` Meetings;
- more than `150,000` exported Meeting characters.

Hard stop before artifact creation when any is exceeded:

- more than `50` Meetings;
- more than `250,000` exported Meeting characters;
- more than `200` Pitchbooks.

Requirements:

- no partial export;
- never silently export only the first N records;
- return exact observed counts and instruct the user to narrow filters;
- do not add chunking, multi-document splitting, background jobs, Cloud runtime, or another export architecture;
- lower these limits only if targeted live Apps Script / Docs / PDF evidence proves a lower simple bound is necessary.

### 4. Meeting export content

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
- authoritative Docs / Drive link;
- the complete authoritative Google Doc text exactly as read, without AI summarization, rewriting, truncation, or inferred content.

Use a clear section heading and page break between Meetings.

Count the exact exported authoritative Meeting text for preview and hard-stop purposes.

The generated export is derived. Do not add it to `Meeting_Index`, `Pitchbook_Index`, or Gemini File Search, and do not mark it as an authoritative source.

### 5. Pitchbook section

Do not merge, convert, download, or reproduce Pitchbook bodies.

For each matching Pitchbook, include:

- Document ID;
- Date;
- GP;
- Asset Class;
- Equity / Debt when present;
- saved filename;
- file extension;
- authoritative Drive link.

List Pitchbooks oldest to newest, then Document ID.

### 6. Output formats and storage

Support user-selected output:

- Google Docs;
- PDF.

Create or reuse a dedicated `Knowledge Exports` folder as a sibling under the configured knowledge parent, not inside the authoritative `Private Assets Knowledge` root. The authoritative root must continue to contain only `Meeting Records` and `Pitchbooks`.

Update setup / installation state / validation idempotently for the export folder. Follow existing forward-only migration rules and increment the persistent schema version only if required by the repository contract.

Google Docs output:

- create one retained Google Doc in `Knowledge Exports`;
- return its authoritative Drive URL.

PDF output:

- one PDF in `Knowledge Exports`;
- a temporary Google Doc may be used internally;
- do not require a duplicate permanent user-visible Google Doc for a PDF-only request;
- clean up or trash the temporary Doc after successful PDF creation when safe;
- never report PDF success unless the PDF file exists and a valid Drive URL is available;
- if cleanup fails after PDF success, return success with a clear non-secret warning and record the condition in Audit metadata.

Rely on the existing folder / Shared Drive access boundary. Do not add per-user sharing or a new ACL system.

Suggested filename pattern:

```text
Knowledge_Export_<primary filters>_<date range>_<generated timestamp>
```

Sanitize and shorten names rather than forcing every filter into the filename.

Initial version has no automatic deletion schedule.

### 7. External-AI prompt copy

Provide a neutral prompt for each existing mode:

- 自由質問;
- 要約;
- 時系列;
- 比較;
- 面談準備.

The prompt must:

- work without naming or depending on a particular AI provider;
- instruct the AI to use only the attached/exported materials;
- include normalized structured filters;
- include the current question or additional instruction;
- preserve the current mode's grounded-output intent;
- request source-title references where possible;
- prohibit unsupported inference and invented facts;
- explain that Meeting content is full original text and the Pitchbook section contains links, not Pitchbook contents;
- remind the user to attach the export and separately upload any Pitchbooks selected for analysis.

The prompt generation and copy action must work when Gemini is unconfigured or unavailable.

Do not write the copied prompt text to Audit.

Display this policy notice:

> 機密資料を別のAIへ投入する場合は、所属組織の利用ルールと許可されたサービスに従ってください。

### 8. UI

Add an export section to the existing Knowledge Search page as a sibling of Gemini search.

Flow:

```text
structured filters + mode + question/additional instruction
  -> 対象資料を確認
  -> Meeting count / characters / Pitchbook count / warnings
  -> Google Docsに書き出す | PDFに書き出す | AI用プロンプトをコピー
```

Requirements:

- Gemini search is not required before preview or export;
- do not display Citation counts as export counts;
- disable artifact creation on no results, stale preview, or hard-stop;
- prevent duplicate submission while a creation request is active;
- clearly show Source Type behavior;
- use `navigator.clipboard.writeText` when available, with a safe fallback compatible with the existing Web App;
- record prompt-copy Audit only after the client reports a successful copy;
- preserve keyboard usability and existing visual conventions.

### 9. Audit

Use the separate restricted Audit Spreadsheet for metadata-only events:

- export preview;
- Google Docs export creation;
- PDF export creation;
- external-AI prompt copy.

Record as appropriate:

- Actor;
- timestamp;
- normalized filters;
- mode;
- result;
- Meeting / Pitchbook counts;
- source IDs or a bounded deterministic source-ID representation;
- output type;
- created artifact ID and Drive URL for successful creation;
- warning / error code without source body.

Do not copy any of the following into Audit:

- Meeting body;
- Pitchbook content;
- generated export body;
- copied prompt text;
- Gemini answer;
- retrieved chunk;
- normalized EML body;
- embedding;
- file bytes.

Audit failure remains non-blocking after successful artifact creation, consistent with existing policy. Return a warning rather than rolling back a valid derived artifact.

### 10. Architecture and implementation constraints

- Apps Script V8 plain JavaScript remains the production runtime.
- Reuse existing filter normalization, Backend Index access, Master maps, Actor fallback, Audit adapter, Drive / Docs adapters, setup migration, and client patterns.
- Keep external Google service calls inside thin adapters and pure contracts testable with fakes.
- Do not add a database, Vector DB, AI-provider integration, model router, per-user ACL system, background worker, ZIP packaging, Pitchbook binary combination, or parallel application.
- Preserve existing Gemini File Search and five-mode behavior.
- Do not reintroduce any Work 0010 temporary qualification code or local configuration.

## Validation

### Local deterministic validation

Run the canonical command:

```bash
npm run check
```

Add focused coverage for at least:

- Active-only filter resolution;
- Source Type behavior;
- Gemini citations not affecting the export set;
- oldest-to-newest deterministic order;
- preview counts and exact character totals;
- preview fingerprint and stale-preview rejection;
- source-integrity failures without partial output;
- warning thresholds;
- all three hard-stop thresholds;
- no partial export;
- exact full Meeting text preservation;
- Pitchbook metadata/link-only output;
- Google Docs and PDF adapter contracts;
- five prompt modes;
- Gemini-unconfigured operation;
- successful-copy-only Audit behavior;
- Audit redaction;
- setup idempotency and migration for `Knowledge Exports`;
- export artifacts not entering source Indexes or AI state.

### Targeted DEV validation

Use synthetic data only. Do not use production or confidential data.

When the existing authenticated DEV Apps Script environment is available, validate:

- export folder create/reuse and location outside the authoritative root;
- preview with multiple Meetings and Pitchbooks;
- oldest-to-newest Google Doc output;
- PDF creation and returned link;
- Pitchbook metadata/link list;
- warning display;
- hard-stop without partial artifact;
- stale preview response;
- prompt clipboard behavior in the deployed Web App;
- metadata-only Audit rows;
- no new source Index or File Search entry from an export.

Do not use Windows UI automation or infer a browser URL. If browser-native clipboard validation requires user action or a browser surface is unavailable, complete all code, local validation, server-side DEV checks, and report that single check as deferred rather than blocking the rest of Work 0011.

GitHub Actions absence or quota is not a blocker. Never claim CI PASS when only local validation ran.

## Acceptance criteria

- The same structured filters resolve all and only matching Active authoritative sources.
- Export selection is independent of Gemini and works without Gemini credentials.
- Users see exact counts before creation.
- Stale preview cannot silently create a different export set.
- Meeting content is complete, unmodified, chronological, and clearly separated.
- Pitchbooks are represented by complete metadata and authoritative links only.
- Google Docs and PDF outputs work in targeted DEV, or a concrete environment-only check is explicitly deferred after all safely executable validation is complete.
- Warning and hard-stop limits behave exactly as specified with no partial output.
- Five neutral prompts are generated and copy through the client path.
- Export artifacts remain derived and outside authoritative source storage / Index / AI indexing.
- Audit remains metadata-only and content-redacted.
- `npm run check` passes with exact observed counts recorded.
- No implementation blocker remains in the safely executable scope.

## Non-goals / backlog

- Item-by-item source selection;
- combining Pitchbook binaries;
- ZIP packaging;
- automatic Pitchbook download;
- multiple output documents for oversized requests;
- automatic export deletion;
- export history / management UI;
- scheduled exports;
- external AI API integration;
- production rollout or completion of the deferred Work 0010 Gemini qualification.

## Git / PR requirements

- Work only on `agent/0011-knowledge-export-external-ai-handoff`.
- Keep commits scoped and intentional.
- Update root repository guidance only where necessary to reflect the active Work 0011 phase and durable accepted export contract; do not duplicate the full handoff into `AGENTS.md`.
- Write `docs/handoffs/0011-report.md`.
- Commit and push all implementation, tests, documentation, and the report.
- Open or update a Draft PR against `main`.
- Link both `docs/handoffs/0011-instruction.md` and `docs/handoffs/0011-report.md` in the PR.
- Do not merge; ChatGPT will review the final diff and evidence.

## Stop / escalation conditions

Stop and report `BLOCKER` only if safe implementation cannot continue, including:

- the authoritative Index / Doc contracts cannot support complete source resolution without a material architecture change;
- Google Docs or PDF creation cannot satisfy the accepted hard limits within Apps Script and no simple lower bound is viable;
- a data-integrity or security defect cannot be repaired within the accepted scope;
- continuing would require credentials, production data, destructive production action, or a new architecture.

Do not stop solely because:

- Gemini is unconfigured;
- browser clipboard validation is user-dependent;
- Shared Drive is unavailable while synthetic My Drive DEV can continue;
- hosted CI is absent;
- an optional polish item remains.

## Completion response

Return only:

- Work ID;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line blocker summary when applicable.
