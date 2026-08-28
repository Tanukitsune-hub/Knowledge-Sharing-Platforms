# Work 0020 — AI Provider / File Search core qualification

WORK_ID: `0020`

Status: Planned after Work 0019

Mode: `QUALIFICATION` with bounded repair allowed

## Primary outcome

Prove the actual provider-neutral AI path in the current private/personal-PC environment using synthetic or non-confidential data before historical migration or company production rollout.

User-facing generation choices are fixed to exactly three simple options:

```text
ChatGPT
Gemini
全文出力
```

Internal provider naming may use `OPENAI` / `GEMINI`, but the UI label is `ChatGPT` for the OpenAI-backed route.

`ChatGPT` and `Gemini` both use File Search / retrieval as the required default core path. `全文出力` does not call an AI API; it builds one canonical full-text Knowledge Package for copy / Google Docs / PDF delivery.

The provider-neutral core is:

```text
Authoritative Meeting/Pitchbook
  -> Canonical AI Source / metadata
  -> provider adapter
       -> OpenAI File Search
       -> Gemini File Search
  -> grounded answer
  -> citation
  -> authoritative Drive source
```

The manual full-output path is:

```text
Authoritative Meeting/Pitchbook
  -> canonical Knowledge Package
  -> on-page full-text output
       -> Copy
       -> Google Docs
       -> PDF
```

Do not duplicate source-selection or body-building logic between the three routes.

## Provider selection contract

The user explicitly chooses one of:

- `ChatGPT`;
- `Gemini`;
- `全文出力`.

There is no automatic cross-provider failover in this Work.

If the chosen API/provider is disabled, missing credentials, unavailable, or not qualified, return a clear error and do not silently send data to another provider.

Provider-specific model names remain an internal/admin setting rather than a normal-user selector.

## Full-output UX contract

Do not use a popup/modal for long full-text output.

When `全文出力` is selected:

1. show an output summary first, including source count and approximate character count;
2. place the three action buttons **above** the full-text preview:
   - `コピー`;
   - `Google Docs`;
   - `PDF`;
3. place the full-text preview at the **bottom of the page/section**;
4. the preview uses a fixed/bounded height with internal scrolling so the whole page does not become extremely long;
5. users can execute Copy / Docs / PDF immediately without scrolling through or reading the body;
6. all three outputs consume the exact same canonical Knowledge Package;
7. no hidden alternate body generation may cause Copy / Docs / PDF content to diverge.

Illustrative layout:

```text
全文出力
12資料 / 84,320文字
[ コピー ] [ Google Docs ] [ PDF ]

--------------------------------
全文プレビュー
(fixed height / internal scroll)
--------------------------------
```

The preview is for optional inspection, not a prerequisite for export actions.

## Why this precedes migration

Historical migration must not load significant volumes before the actual index, metadata, filter, citation, update, deletion, provider, and export contracts are observed. Work 0020 establishes those contracts first.

## Current-API preflight

OpenAI and Gemini File Search APIs, supported models, metadata-filter syntax, costs, and retention behavior are time-sensitive.

At Work start:

1. verify current official OpenAI and Google AI documentation;
2. select one currently supported qualified model for each provider;
3. confirm current File Search / vector-store or store request shapes;
4. confirm metadata/filter syntax in each actual API;
5. confirm citation/source mapping behavior;
6. record current pricing/retention constraints without committing credentials.

Existing repository request contracts are evidence, not assumed current truth.

## Target/runtime boundary

- existing private Apps Script Web App/source path;
- personal Google environment only;
- synthetic/non-confidential Meeting and Pitchbook sources;
- dedicated isolated test File Search store/vector store per provider as required;
- credentials/API keys stored server-side outside GitHub and browser;
- billing-enabled calls only after explicit scoped authorization;
- no company Shared Drive, production users, confidential data, or production Store/vector store.

## Shared source contract

Reuse the existing provider-neutral source preparation as far as safely possible:

- stable source ID;
- entity key / Counterparty identity;
- Related GP metadata;
- source type;
- Business Date;
- Asset Class;
- Fund / Strategy;
- authoritative Drive link;
- normalized text/content hash.

Provider adapters translate this canonical source into provider-specific indexing contracts. Do not make Gemini or OpenAI the source-of-truth model.

## Core qualification slice

### Credentials and stores

For each enabled provider:

- create or select exactly one isolated test Store/vector store;
- read back store identity;
- keep secrets out of Sheets exposed to users, Audit, browser responses, logs, and GitHub;
- establish bounded cleanup/retirement route.

### Sources

Use at minimum:

- one synthetic Meeting Google Doc;
- one synthetic Pitchbook/source file in an actually supported format, preferably PDF or TXT for the first slice.

Do not attempt all formats before the first two-source path passes.

### Indexing

Prove for both `ChatGPT` and `Gemini` routes where enabled:

- Pending -> Indexed state or provider-equivalent lifecycle;
- source ID and content hash binding;
- metadata including `entity_key`, source type, date, Asset Class, Fund / Strategy, and stable source ID;
- no duplicate active AI document for one current source;
- authoritative save remains successful if AI indexing fails.

### Query and citation

For each provider:

- one unfiltered grounded question;
- one exact metadata-filtered question;
- answer is non-empty and source-grounded;
- citation maps to the correct stable source ID and Drive URL;
- inactive or deleted test source is excluded as designed;
- insufficient evidence is surfaced rather than invented.

### Full output

Prove one `全文出力` request using the same filters/question scope:

- canonical full-text Knowledge Package is built once;
- source-count and character-count summary is shown above the action controls;
- Copy / Google Docs / PDF buttons are above the preview;
- Copy works without scrolling the preview;
- Docs and PDF are produced from the same canonical package;
- preview is bottom-positioned, fixed/bounded height, internally scrollable;
- no popup/modal is used for the body;
- no AI API call occurs in the full-output route.

### Update / delete / rebuild

Prove on synthetic sources for each qualified File Search provider:

- content update triggers re-index without duplicate active document;
- inactivation removes normal retrieval;
- reactivation restores retrieval;
- derived Store/vector-store document can be deleted/rebuilt without changing authoritative Drive source;
- cleanup is bounded and exact-ID based.

## Operational guardrails

Observe and document separately for OpenAI and Gemini:

- request latency;
- indexing/polling behavior;
- retryable/permanent errors;
- rate limit response;
- practical batch size;
- initial cost estimate;
- retention behavior;
- direct-handler versus scheduled trigger decision.

Do not enable a recurring trigger in the core slice. Use a bounded private/direct handler first.

## Shortest evidence order

1. provider configuration/availability readback;
2. ChatGPT/OpenAI credentials + isolated store qualification;
3. one Meeting index + one query + citation;
4. Gemini credentials + isolated store qualification;
5. one Meeting/Pitchbook index + one query + citation;
6. exact metadata filter for each provider;
7. full-output package + Copy / Docs / PDF UX;
8. one update/inactivate/reactivate cycle;
9. cleanup/rebuild check;
10. final source/Index/Store/Audit integrity.

If one provider is explicitly unavailable/disabled in the environment, its user selection must fail clearly. Do not silently substitute the other provider. Full Work completion should record which provider paths were actually qualified versus intentionally unavailable.

## Logic validation

- provider-neutral source contract;
- provider selection and disabled-provider errors;
- OpenAI request/response mapping;
- Gemini request/response mapping;
- metadata construction/filter escaping;
- state transitions;
- retry/idempotency/content hash;
- safe errors/redaction;
- citation mapping;
- no secret/source-body duplication into Audit;
- one canonical Knowledge Package reused for Copy / Docs / PDF;
- full-output actions positioned before the fixed-height internally scrolling preview;
- no popup/modal long-text output;
- `npm run check` and `git diff --check`.

## Target-runtime qualification

Must directly observe each provider path claimed as qualified using the actual API/store/model/billing path. Mock/fixture/CI evidence is insufficient.

The `全文出力` path must also be directly observed in the actual Web App, including one-click Copy and browser-visible Docs/PDF actions above the preview.

## Non-goals

- automatic provider routing/failover;
- normal-user model-name selector;
- all six formats in the first slice;
- full five-mode UX acceptance;
- multi-entity comparison;
- broad scheduled sync trigger;
- company credentials/Shared Drive;
- confidential historical data;
- production readiness.

Those expand only after the core path passes.

## Completion latch

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS for every provider declared enabled/qualified
FULL_OUTPUT_RUNTIME: PASS
SIDE_EFFECT_STATE: TEST_ONLY / bounded billing-enabled calls
READY: YES for provider-neutral AI core
BLOCKER: NO
```
