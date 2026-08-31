# Work 0021 — CODEX-02 OpenAI filter metadata reconciliation and core runtime qualification report

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Outcome

CODEX-02 closed the version-61 compound-filter blocker and completed the bounded core runtime campaign on the same private Web App at version 62.

The verified cause was metadata-only provider drift, not the suspected Date range value type. The authoritative `Pitchbook / DOC-000017` content hash was current, but its one exact OpenAI vector-store file lacked `fund_strategy` and `counterparty_id`. Production Pitchbook sync source construction also omitted `Fund_Strategy`, so an unchanged-content exact sync could not repair that attribute.

The repair:

- derives `fundStrategy` from the authoritative Pitchbook row;
- compares the complete desired/current OpenAI attribute maps, including value types;
- updates the one exact existing vector-store file in place when content is unchanged but attributes drift;
- re-reads and requires exact attribute and provider-document identity agreement;
- fails closed on unavailable update support, identity drift, or readback mismatch;
- preserves the no-upload/no-duplicate path when only attributes change;
- reports only sanitized `metadataRefreshed` counts to the private-admin UI.

OpenAI's current File Search documentation permits vector-store file attributes and comparison filters, and the vector-store file update endpoint supports an in-place attribute update. The implementation uses that operation and then performs an independent readback: [OpenAI File Search guide](https://developers.openai.com/api/docs/guides/tools-file-search).

## Read-only reconciliation

Before any mutation, exactly one provider file matched stable identity `Pitchbook + DOC-000017`. Safe comparison found:

```text
CONTENT_HASH_MATCH: true
AUTHORITATIVE_CORE_VALUES_MATCH: true
DATE_KEY: string / 2026-08-30 / match
FUND_STRATEGY: missing / mismatch
COUNTERPARTY_ID: missing / mismatch
OTHER_CURRENT_ATTRIBUTES: source_type, source_id, gp_id, asset_class_id,
  capital_type_id, entity_key, counterparty_type, content_hash / match
```

The Backend row remained current: its OpenAI indexed timestamp was later than its authoritative update timestamp. No filename-based identity was used.

## Logic validation

Focused validation passed for authoritative Pitchbook source derivation, full typed-attribute drift detection, one-document in-place refresh, no-op behavior, exact readback, mismatch fail-closed behavior, safe admin counts, citation normalization, retry/replacement/orphan cleanup, Work 0025 model/thinking selection, and FULL_OUTPUT parity.

```text
FOCUSED_INITIAL: PASS — 124/124
FOCUSED_INCREMENTAL: PASS — 61/61
npm run check: PASS — 360/360
python tools/validate_agent_foundation.py: PASS
temporal validation: PASS
public-surface validation: PASS — 30 public / 647 private top-level functions
git diff --check: PASS
```

No numeric Date attribute was added. After exact metadata refresh, the existing string `date_key` `gte/lte` compound query passed in the real OpenAI runtime. Introducing a second Date representation would therefore have changed an unverified cause and violated the fix-only scope.

## Exact delivery and target runtime

Implementation commit `a16d835` was pushed once to the existing standalone Apps Script project. Isolated pull-back parity passed `80/80`. Exactly one immutable version, version `62`, was created, and the same existing private Web App deployment was updated exactly once.

The stored OpenAI key was preserved and was not read, printed, replaced, logged, or committed. No new Web App, Library, Vector Store, Store, endpoint, trigger, or public exposure was created.

The existing private-admin exact sync ran once for `Pitchbook / DOC-000017`:

```text
Selected: 1
Indexed: 0
Metadata refreshed: 1
Unchanged: 1
Removed: 0
Failed: 0
```

Direct safe readback then required and passed exact string values for `source_type`, `source_id`, `date_key`, `gp_id`, `asset_class_id`, `capital_type_id`, `fund_strategy`, `counterparty_type`, `counterparty_id`, and nonblank current `content_hash`. The provider document identity was unchanged and no duplicate upload occurred.

## Core runtime campaign

The formerly failing free-question scope was reproduced exactly:

```text
Date: 2026-08-30 through 2026-08-30
GP: KSP DEV GP 0010 Renamed
Asset Class: Infrastructure
Capital Type: Equity
Fund / Strategy: CODEX-19 Synthetic Exact Scope
Source Type: Pitchbook
Model: gpt-5.6-terra
Thinking: provider default
```

It returned a substantive grounded answer, no insufficient-evidence flag, and exactly one authoritative normalized `Pitchbook / DOC-000017` citation. The same bounded scope then passed `要約`, `時系列`, core single-scope `比較`, and exact-GP `面談準備`; each returned one authoritative `DOC-000017` citation.

One FULL_OUTPUT preview used canonical 2026-08-30 filters and `要約`. It contained Meeting authoritative body content plus Pitchbook reference metadata, preserved the same mode/date scope, and had no hard stop. No artifact was created and no AI API was called for FULL_OUTPUT.

The Gemini route exposed zero effective model/thinking choices. One safe selection-gate observation returned an error before provider transport, with no answer and no OpenAI fallback. No Gemini API call occurred.

## Final integrity and side effects

```text
OPENAI_PROVIDER_DOCUMENTS_BEFORE: 16
OPENAI_PROVIDER_DOCUMENTS_AFTER: 16
OPENAI_PROVIDER_DOCUMENTS_COMPLETED: 16
DOC_000017_CURRENT_PROVIDER_DOCUMENTS: 1
MTG_000005_CURRENT_PROVIDER_DOCUMENTS: 1
DOC_000018_PROVIDER_DOCUMENTS: 0
OPENAI_CONNECTION_FINAL: key configured / Store ready / active
OPENAI_UPLOAD_OR_DELETE: NONE
BROAD_SYNC: NONE
GEMINI_API_CALL: NONE
FULL_OUTPUT_ARTIFACT: NONE
DOC_000018_OR_LARGE_FIXTURE_MUTATION: NONE
CONFIDENTIAL_DATA: NONE
```

The five OpenAI mode queries produced only the existing metadata-only Audit contract; no question, answer, chunks, credential, or provider resource identity was persisted to Audit. Successful no-warning UI completion and deterministic Audit-redaction tests passed.

One local read-only diagnostic display included existing private runtime locator values before subsequent outputs were field-sanitized. It did not include the OpenAI API key, source body, or raw provider payload; it was not copied into repository files, the PR, or this report, and no third party received it.

## Completion latch

```text
EXACT_PROVIDER_ATTRIBUTE_READBACK: PASS
ROOT_CAUSE: METADATA_ONLY_PROVIDER_ATTRIBUTE_DRIFT_AND_PITCHBOOK_FUND_STRATEGY_SOURCE_OMISSION
NUMERIC_DATE_RANGE_FILTER: NOT_APPLICABLE — existing string range passed after metadata repair
METADATA_ONLY_RECONCILIATION: PASS
OPENAI_COMPOUND_FILTER_QUERY: PASS
FIVE_MODE_RUNTIME_CORE: PASS
FULL_OUTPUT_RUNTIME_PARITY: PASS
GEMINI_DISABLED_NO_FAILOVER: PASS — zero effective choices; rejected before transport
LOGIC_VALIDATION: PASS — canonical 360/360
TARGET_RUNTIME_QUALIFICATION: PASS
RUNTIME_DEPLOYMENT_VERSION: 62
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CODEX_03: YES
BLOCKER: NONE
FINAL_COMMIT: reported from the final pushed PR head
```

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
