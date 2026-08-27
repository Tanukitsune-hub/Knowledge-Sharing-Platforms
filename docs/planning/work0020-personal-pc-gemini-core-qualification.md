# Work 0020 — Personal-PC Gemini / File Search core qualification

WORK_ID: `0020`

Status: Planned after Work 0019

Mode: `QUALIFICATION` with bounded repair allowed

## Primary outcome

Prove the actual Gemini File Search end-to-end path in the current private/personal-PC environment using synthetic or non-confidential data before historical migration or company production rollout.

The core path is:

```text
Authoritative Meeting/Pitchbook
  -> Apps Script source adapter
  -> isolated File Search Store
  -> indexed document + custom metadata
  -> Gemini query
  -> grounded answer
  -> citation
  -> authoritative Drive source
```

## Why this precedes migration

Historical migration must not load significant volumes before the actual index, metadata, filter, citation, update, and deletion contracts are observed. Work 0020 establishes those contracts first.

## Current-API preflight

Gemini/File Search APIs, supported models, embedding models, metadata-filter syntax, costs, and retention behavior are time-sensitive.

At Work start:

1. verify current official Google AI documentation;
2. select one supported Flash model and embedding model;
3. confirm the current Interactions/generate-content/File Search request shape;
4. confirm Custom Metadata and filter syntax in the actual API;
5. record current pricing/retention constraints without committing credentials.

Existing repository request contracts are evidence, not assumed current truth.

## Target/runtime boundary

- existing private Apps Script Web App/source path;
- personal Google environment only;
- synthetic/non-confidential Meeting and Pitchbook sources;
- dedicated isolated File Search Store;
- credential/API key stored server-side outside GitHub and browser;
- billing-enabled calls only after explicit scoped authorization;
- no company Shared Drive, production users, confidential data, or production Store.

## Core qualification slice

### Store and credentials

- create or select exactly one isolated test Store;
- read back Store identity;
- keep secret credentials out of Sheets exposed to users, Audit, browser responses, logs, and GitHub;
- establish bounded cleanup/retirement route.

### Sources

Use at minimum:

- one synthetic Meeting Google Doc;
- one synthetic Pitchbook/source file in an actually supported format, preferably PDF or TXT for the first slice.

Do not attempt all formats before the first two-source path passes.

### Indexing

Prove:

- Pending -> Indexed state;
- source ID and content hash binding;
- custom metadata including `entity_key`, source type, date, Asset Class, and stable source ID;
- no duplicate active AI document for one current source;
- authoritative save remains successful if AI indexing fails.

### Query and citation

Prove:

- one unfiltered grounded question;
- one exact metadata-filtered question;
- answer is non-empty and source-grounded;
- citation maps to the correct stable source ID and Drive URL;
- inactive or deleted test source is excluded as designed;
- insufficient evidence is surfaced rather than invented.

### Update / delete / rebuild

Prove on the synthetic source:

- content update triggers re-index without duplicate active document;
- inactivation removes normal retrieval;
- reactivation restores retrieval;
- derived Store document can be deleted/rebuilt without changing authoritative Drive source;
- cleanup is bounded and exact-ID based.

## Operational guardrails

Observe and document:

- request latency;
- indexing operation polling behavior;
- retryable/permanent errors;
- rate limit response;
- practical batch size;
- initial cost estimate;
- File/Search Store retention behavior;
- direct-handler versus scheduled trigger decision.

Do not enable a recurring trigger in the core slice. Use a bounded private/direct handler first.

## Shortest evidence order

1. credentials and Store readback;
2. one Meeting index;
3. one query + citation;
4. one Pitchbook index;
5. one metadata filter;
6. one update/inactivate/reactivate cycle;
7. one cleanup/rebuild check;
8. final source/Index/Store/Audit integrity.

## Logic validation

- current request/response mapping;
- metadata construction/filter escaping;
- state transitions;
- retry/idempotency/content hash;
- safe errors/redaction;
- citation mapping;
- no secret/source-body duplication into Audit;
- `npm run check` and `git diff --check`.

## Target-runtime qualification

Must directly observe the actual API/Store/model/billing path. Mock/fixture/CI evidence is insufficient.

## Non-goals

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
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: TEST_ONLY / bounded billing-enabled calls
READY: YES for personal-PC Gemini core
BLOCKER: NO
```
