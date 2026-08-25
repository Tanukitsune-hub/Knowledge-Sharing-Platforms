# Planning Baseline and Roadmap

Current as of: 2026-08-26

Status: Active product/roadmap baseline

The former feature-complete → final DEV qualification delivery sequence is historical. Current delivery follows `docs/decisions/target-runtime-first-development.md` and `docs/planning/apps-script-implementation-plan.md`.

Accepted product design is not reopened merely because a target-runtime check remains pending. Conversely, implementation or logic-test completion is not reported as native readiness without the required Apps Script / Workspace / browser / Gemini evidence.

## 1. Product baseline

Knowledge Sharing Platforms provides:

- Meeting registration, search, edit, Active/Inactive/Reactivate, and structured context;
- Pitchbook/source registration, search, metadata maintenance, file-granular retry, and stable links;
- GP / Option Masters and accepted append-only structured fields;
- separate Restricted Audit Spreadsheet and best-effort Actor;
- Shared Drive as authoritative source;
- Gemini File Search as a derived/rebuildable retrieval index;
- five Knowledge Search modes: `自由質問 / 要約 / 時系列 / 比較 / 面談準備`;
- Gemini-independent Knowledge Export / external-AI handoff;
- one organization-controlled Apps Script HTML Service Web App.

The application release version and Work IDs are separate concepts. Historical Works remain trace/evidence routes rather than the current delivery sequence.

## 2. Phase 1 — Authoritative accumulation and maintenance

Status: Production source implemented; future changes use target-runtime-first slices.

Accepted contracts:

- Meeting required baseline: Date, GP, Asset Class;
- Meeting Google Doc body is authoritative and is not duplicated into `Meeting_Index`;
- Pitchbook required baseline: file, Date, GP, Asset Class;
- stable Meeting ID / Document ID / Batch ID;
- deterministic filenames and persistent destination-context sequence;
- five-sheet baseline backend;
- Shared Drive authoritative source folders;
- separate Restricted Audit Spreadsheet;
- 24h same-browser text/selection draft retention;
- 25MB/file, 10 files/selection, 100MB total initial upload limit;
- file-granular partial success and idempotent retry;
- optimistic locking for same-Meeting edits;
- short LockService critical sections;
- Active / Inactive / Reactivate rather than normal-user physical deletion;
- all authorized users may maintain allowed Masters;
- Actor fallback: email → `TEMP_USER:<key>` → `UNIDENTIFIED`;
- missing persistent identity does not block normal operations.

Future Phase 1 changes should prove one isolated create/persist/reopen/search path in the actual target runtime before broader UI, batch, export, or AI expansion.

## 3. Phase 2 — Gemini knowledge retrieval

Status: Production source foundation implemented; billing/credential/confidential-source rollout remains separately authorized.

```text
Shared Drive authoritative records
        |
        v
Gemini File Search Store
        |
        | metadata filter + semantic retrieval
        v
Configured Gemini Flash
        |
        v
Knowledge Search
        |
        v
grounded output + citations + Drive links
```

Accepted principles:

- Shared Drive remains authoritative;
- File Search is a derived/rebuildable index;
- start with one Store;
- File Search manages chunking/embedding/semantic retrieval;
- Custom Metadata handles exact filters;
- no custom Vector DB, embedding pipeline, tag taxonomy, Knowledge Graph, Agent framework, or model router initially;
- only Active sources are normally retrievable;
- authorized Web App users share the accepted common source-access boundary;
- one configured Gemini Flash model when approved;
- bounded Apps Script sync worker;
- AI index/query failure never rolls back authoritative registration;
- grounded outputs surface citations and Drive links;
- Audit stores bounded metadata, not prompts/answers/source bodies/chunks/embeddings/bytes.

Initial formats:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

`.eml` original remains in Drive; normalized Subject / From / To / Cc / Date / Body is indexed. Embedded attachments are not auto-indexed. `.msg` is initially out of scope.

## 4. Knowledge Search target UX

Accepted modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

- `自由質問` is default;
- all modes share one retrieval/filter/citation layer;
- presets change prompt/output template only;
- shared filters use accepted stable IDs and include Date, GP, Asset Class, Capital Type, Source Type, and later accepted structured fields;
- UI-only `未選択` means no filter and is never persisted;
- insufficient evidence is stated rather than invented.

Mode contracts:

- 自由質問: grounded direct Q&A;
- 要約: cross-source synthesis;
- 時系列: chronology plus change/continuity;
- 比較: common-dimension comparison;
- 面談準備: recent sources, changes, unresolved items, reconfirmation points, and next questions.

## 5. Knowledge Export / external-AI handoff

Accepted derived-copy boundary:

- only Active Backend Index rows are eligible;
- Meeting includes authoritative Google Doc text;
- Pitchbook includes metadata and stable-ID-bound authoritative Drive links, not duplicated body content;
- count/character hard stops occur before unnecessary Meeting Doc reads;
- Google Docs/PDF artifacts are generated under the configured Knowledge Exports folder;
- provider-neutral prompts support all five modes and use display names plus stable IDs;
- Audit stores export metadata only;
- permission equivalence, retention/deletion, and cleanup behavior require target-runtime evidence before production rollout.

Automatic expiry, a new export database, and export-management UI remain out of scope until a concrete requirement justifies them.

## 6. Current development path

New Work uses:

```text
bounded preflight
→ shortest coherent production-source vertical slice
→ actual target runtime
→ isolated synthetic/anonymized test data/resources
→ guarded side effects
→ focused LOGIC_VALIDATION
→ bounded TARGET_RUNTIME_QUALIFICATION
→ expand after native readback
→ separately authorize production data/users/billing/triggers/destructive effects
```

Do not define a separate test-environment completion milestone unless the staging decision gate passes.

Typical evidence by change:

| Change | Logic validation | Target-runtime evidence |
|---|---|---|
| Meeting/Pitchbook field | schema, validation, mapping, regression | isolated create, persist, reopen, search/readback |
| Master/state change | normalization, transitions, audit payload | isolated mutation and authoritative readback |
| File/link behavior | IDs, filename, retry, limits | actual Drive/Docs parent/link/readback |
| Browser behavior | state/helper tests where practical | actual supported-browser interaction |
| Gemini metadata/query | request/filter/citation contracts | one authorized synthetic index/query/citation path |
| Trigger/worker | handler logic/idempotency | separately authorized trigger or direct-handler evidence |
| Production rollout | full relevant logic suite | exact target identity, permissions, data/access boundary, rollback, enabled effects |

## 7. Validation and readiness

Report separately:

```text
LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
READY: YES | NO
```

Runtime-dependent validation includes, when material:

- exact Apps Script source/target identity;
- setup idempotency and resource readback;
- source/Index/Drive consistency;
- stable IDs/sequences and duplicate prevention;
- actual Sheets `Date` and Workspace object behavior;
- supported-browser behavior;
- actual Docs/PDF link/placement behavior;
- Shared Drive parentage/permission behavior;
- Gemini indexing/filter/query/citation behavior under approved credentials/billing;
- trigger behavior only when separately authorized;
- safe error/redaction and Restricted Audit access.

A local/CI/mock/simulator/test-loader pass proves only what it exercised. It does not establish a target function, API, permission, persistence rule, object shape, renderer, or service that was not observed in the actual target.

## 8. Historical Work map

- 0004: scaffold + setup engine;
- 0005: Meeting vertical slice;
- 0006: Pitchbook vertical slice;
- 0007: maintenance / concurrency / Masters;
- 0008: File Search client / sync / free question;
- 0009: six formats / EML / five modes;
- 0010: consolidated synthetic DEV qualification;
- 0011: Gemini-independent Knowledge Export / external-AI handoff;
- 0012: public-surface / reliability hardening;
- 0013: qualification / recovery history;
- 0014: structured Meeting/Pitchbook context foundation and bounded repair.

Work 0014 completes or safely stops under PR #17's existing evidence boundary. New Work applies the 2026-08-26 policy prospectively.

## 9. Genuine remaining choices

Only choices that materially affect a current outcome remain open, including:

- concrete approved Gemini model/credential/billing route;
- observed retry batch size, backoff, rate-limit, and cost guardrails;
- lower safe upload limit if actual Apps Script behavior requires it;
- production rollout/permission/cleanup route for real data/users;
- whether a specific high-risk migration or concurrency campaign uniquely requires separate staging;
- comparison multi-select UI only if demonstrated user value justifies it.

Do not reopen accepted Apps Script-first runtime, Shared Drive authority, separate Restricted Audit, best-effort Actor, five modes, six initial formats, one derived File Search Store, or source-traceability requirements without new material evidence.

## 10. Planning rule

Keep the authoritative layer simple and inspectable. Use the actual target runtime early, isolate test data/resources, and guard consequential effects. Do not add a second environment, database, ACL system, Agent framework, Knowledge Graph, model router, upload architecture, or automated lifecycle system unless it changes a material decision that the accepted design cannot safely settle.
