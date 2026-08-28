# Work 0020 — CODEX-02 Meeting full-output / File Search source-scope revision

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`
Exact execution ref: supplied in the ChatGPT dispatch prompt after final activation metadata commit.

## Why CODEX-01 is superseded

After CODEX-01 dispatch preparation, the user reconfirmed the original Knowledge Export product boundary:

```text
ChatGPT / Gemini File Search
  -> Meeting + Pitchbook/source materials

全文出力
  -> Meeting Google Docs full text only
  -> matching Pitchbooks may be references/Drive links only
```

CODEX-01 incorrectly required Pitchbook body extraction for FULL_EXPORT. Do not execute that superseded requirement.

No accepted Work 0019 evidence is reopened.

## Read first

Read every applicable `AGENTS.md` / `AGENTS.override.md`, then:

1. `docs/handoffs/0020-instruction.md`;
2. `docs/planning/work0020-personal-pc-gemini-core-qualification.md`;
3. `docs/decisions/ai-provider-selection-and-full-output.md`;
4. `docs/ai/provider-neutral-file-search.md`;
5. accepted Work 0019 report;
6. current AI/Search/Export source, especially `src/130_*` through `src/170_*`, `src/155_*` through `src/157_*`, Knowledge Search UI, setup/schema/settings, and public-surface tests.

## Primary outcome

Build and qualify one coherent provider-neutral core with exactly three normal-user routes:

```text
ChatGPT
Gemini
全文出力
```

Do not split the Work by provider or by export surface.

## 1. Provider-neutral foundation

Consolidate shared contracts:

```text
Canonical AI Source
Canonical Knowledge Request
Provider Index Projection
Canonical Meeting Knowledge Package
Normalized Citation
```

Provider adapters may translate provider APIs but may not redefine source identity, stable filters, mode semantics, Audit policy, or UI.

## 2. File Search scope — Meeting + Pitchbook

Both API routes must treat Meeting and Pitchbook/source materials as first-class retrievable sources.

### ChatGPT / OpenAI

- current OpenAI Responses API + `file_search` + Vector Store path;
- index one Meeting and one Pitchbook/source in the bounded core slice;
- directly prove a grounded query/citation from the Meeting;
- directly prove a grounded query/citation that requires the Pitchbook/source;
- citation maps by stable source ID to authoritative Backend/Drive;
- use compact stable-ID-first file attributes within the current 16-attribute limit.

### Gemini

- current Gemini File Search Store / interaction path;
- index one Meeting and one Pitchbook/source in the bounded core slice;
- directly prove citations from both source types;
- normalize citations to the same product result model.

Do not claim Pitchbook File Search support merely because upload/index succeeded; retrieval and citation must be observed.

## 3. FULL_EXPORT scope — Meeting Docs only

FULL_EXPORT intentionally does **not** duplicate Pitchbook body/file content.

When `全文出力` is selected:

- apply the same accepted filters/mode to authoritative records;
- build body text from matching Meeting Google Docs only;
- include stable Meeting IDs, metadata, links, and full authoritative Meeting bodies;
- optionally list matching Pitchbooks as bounded reference metadata with authoritative Drive links;
- do not read Pitchbook file bytes for FULL_EXPORT;
- do not extract PDF/TXT/DOCX/PPTX/XLSX/EML text for FULL_EXPORT;
- do not count reference Pitchbooks in Meeting full-text character count;
- clearly label Pitchbooks as references, not included full-text sources.

UI helper text should state that Meeting Google Docs are output in full and Pitchbook bodies are not included.

## 4. Full-output UX

No modal/popup.

Order:

```text
全文出力
Meeting count / Meeting character count
reference Pitchbook count when nonzero
[ コピー ] [ Google Docs ] [ PDF ]
status/error
Meeting full-text preview at bottom
optional Pitchbook reference list
```

Requirements:

- action buttons above body;
- preview at bottom;
- fixed/bounded height + internal scroll;
- no need to inspect body before output;
- Copy/Docs/PDF consume the exact same package/fingerprint;
- zero OpenAI/Gemini API call from FULL_EXPORT.

## 5. Schema/provider state

- Backend remains exactly five sheets;
- increment schema exactly once `5 -> 6`;
- append `AI_Provider_State_JSON` to Meeting_Index and Pitchbook_Index;
- preserve legacy `AI_*` fields;
- migrate compatible blank-new-state legacy Gemini values into `GEMINI` only;
- keep OPENAI and GEMINI status/document/content-hash/error state independent;
- migration append-only and idempotent.

## 6. Provider metadata

OpenAI current file-attribute budget is 16. Enforce a compact stable-ID-first projection, normally no more than:

```text
source_type
source_id
date_key
entity_key
counterparty_type
gp_id
asset_class_id
capital_type_id
team_id
fund_strategy
follow_up_required
```

Do not consume provider metadata slots for display names, filenames, Drive URLs, content hashes, or duplicate labels. Resolve display metadata from Backend after citation.

## 7. Route/config behavior

Exactly three UI choices. No Auto. No user model selector. No automatic failover.

- ChatGPT selected + OpenAI disabled/unconfigured -> safe ChatGPT-specific error; zero Gemini call;
- Gemini selected + Gemini disabled/unconfigured -> safe Gemini-specific error; zero OpenAI call;
- disabled provider is reported `DISABLED_BY_CONFIG`, never silently treated as PASS.

Credentials/private Store IDs remain server-side and out of GitHub, browser payloads, Audit, exports, and reports.

## 8. Deterministic validation before live calls

Prove:

- schema 5->6 + idempotency;
- provider-state parser/serializer and legacy Gemini migration;
- independent OPENAI/GEMINI state;
- OpenAI metadata <=16;
- provider selection/no-failover/safe errors;
- current OpenAI request/response mapping;
- current Gemini request/response mapping;
- Meeting citation normalization;
- Pitchbook/source citation normalization;
- content-hash/retry/idempotency/no duplicate provider document;
- FULL_EXPORT body contains Meeting text only;
- matching Pitchbook appears only as reference metadata/link;
- FULL_EXPORT does not call Pitchbook byte/text extraction adapter;
- Copy/Docs/PDF package/fingerprint parity;
- UI button order + bottom internal-scroll preview;
- zero provider call from FULL_EXPORT;
- Audit/secret/body redaction;
- public surface;
- temporal validator;
- `npm run check`;
- `git diff --check`.

No billing-enabled provider calls before deterministic PASS.

## 9. Target-runtime qualification

Use only existing/synthetic/non-confidential personal DEV resources.

First positively identify current Apps Script/private Web App version `40`.

Then:

1. sync exact tested source once;
2. exact source readback;
3. create exactly one immutable Apps Script version;
4. update the same existing private Web App in place;
5. no new deployment or Library mutation;
6. execute schema `5 -> 6` and confirm exactly five sheets/schema 6.

### FULL_OUTPUT runtime

- use at least one existing/synthetic Meeting;
- generate authoritative Meeting Google Docs full-text package;
- if matching Pitchbooks exist, show references/links only;
- prove Pitchbook body/file bytes were not read for FULL_EXPORT;
- summary uses Meeting count/Meeting character count and separate reference Pitchbook count;
- buttons above preview;
- bottom fixed-height internal-scroll preview;
- Copy once;
- create one Google Doc;
- create one PDF;
- prove identical package/fingerprint;
- prove zero AI provider call.

### Every enabled File Search provider

- capability/config/isolated Store readback;
- Meeting index + grounded citation;
- Pitchbook/source index + grounded citation;
- exact stable metadata filter;
- update/reindex without duplicate active document;
- Inactive exclusion;
- Reactivate restoration;
- exact delete/rebuild;
- record latency/polling/retry/rate-limit/cost/retention evidence.

### Every deliberately disabled provider

- select once;
- safe provider-specific error;
- zero cross-provider failover.

No recurring trigger.

## 10. Runtime reporting

```text
OPENAI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
GEMINI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
FULL_OUTPUT_RUNTIME: PASS | FAIL | NOT RUN
```

Overall PASS requires:

- FULL_OUTPUT_RUNTIME PASS;
- at least one File Search provider live PASS;
- every enabled provider PASS;
- every disabled provider safe-error/no-failover PASS;
- live File Search evidence includes both Meeting and Pitchbook/source;
- final integrity PASS.

## 11. Side effects

Allowed only:

- append-only schema/provider-state migration;
- isolated provider-derived Store/documents;
- bounded synthetic provider lifecycle;
- one test Docs export and one test PDF export;
- one in-place Web App version update.

Prohibited:

- confidential/company production data;
- production Store;
- broad/public users;
- recurring triggers;
- new Web App deployment;
- Library mutation;
- unauthorized authoritative source deletion;
- secrets/private IDs in GitHub/chat/report/logs;
- Pitchbook body extraction for FULL_EXPORT.

## 12. Delivery

Create:

`docs/handoffs/0020-CODEX-02-meeting-full-output-file-search-scope-report.md`

Update:

- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR #26 body.

Commit/push all scoped changes. Keep PR #26 Draft / Open / unmerged for ChatGPT final review.

On full PASS:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS under enabled-provider matrix
FULL_OUTPUT_RUNTIME: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```
