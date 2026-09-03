# Work 0021 — CODEX-03 multi-Entity comparison and advanced exact filters report

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Outcome

CODEX-03 completed the explicit 2–5 Entity comparison and advanced exact Meeting-filter slice on the same private Web App at version 63. The accepted CODEX-01/CODEX-02 core, Work 0020 OpenAI/citation behavior, and Work 0025 effective model/thinking policy remain intact.

The implementation:

- accepts 2–5 unique exact stable Entity keys only in `比較` mode and fails closed on duplicates, unknown/stale identities, invalid counts, or ambiguous single/multi selection;
- resolves OpenAI comparison retrieval as an exact bounded OR over selected `entity_key` values, while preserving the canonical filter contract;
- maps every normalized citation to one selected Entity through authoritative source metadata, excludes unselected evidence, deduplicates repeated source results, and returns an explicit per-Entity evidence state;
- resolves `Related GP` and `Meeting Type` by exact token membership against Active authoritative Meeting rows, with logical AND and a bounded exact source-ID set;
- returns normal no-evidence output without provider transport when advanced pre-resolution is empty;
- applies the same Entity ordering and advanced-filter semantics to FULL_OUTPUT while preserving Meeting authoritative bodies and Pitchbook reference-only output;
- keeps Audit output metadata-only and excludes questions, answers, chunks, provider IDs, credentials, and private URLs.

No filename-only identity, fuzzy matching, provider fallback, or second citation identity system was introduced.

## Logic validation

Focused tests cover 2/5 Entity acceptance, 1/6 Entity rejection, duplicate and stale identity rejection, ambiguous scope rejection, exact OR request shape, per-Entity attribution, unselected-citation exclusion, evidence gaps, Related GP and Meeting Type token membership, AND pre-resolution, empty pre-resolution, Pitchbook incompatibility, bounded source IDs, FULL_OUTPUT parity, UI behavior, and safe Audit metadata.

```text
FOCUSED_INITIAL: PASS — 48/48
FOCUSED_EXPANDED: PASS — 84/84
npm run check: PASS — 368/368
python tools/validate_agent_foundation.py: PASS
Apps Script source validation: PASS — 57 gs / 22 html
temporal validation: PASS — 3 helpers / 173 regression lines / Asia-Tokyo
public-surface validation: PASS — 30 public / 651 private top-level functions
git diff --check: PASS
```

No existing assertion was weakened.

## Exact delivery and deployment

Implementation commit `d5af191ad83b990f6023e3e41b53f194db629e4b` was pushed once to the existing standalone Apps Script project. Isolated pull-back parity passed `80/80`, with zero name or content mismatches.

Exactly one immutable version, version `63`, was created. The same existing private Web App deployment was updated exactly once and read back as:

```text
ENTRYPOINT: WEB_APP / exec
EXECUTE_AS: USER_DEPLOYING
ACCESS: MYSELF
VERSION: 63
```

The stored OpenAI API key was preserved and was not read, printed, replaced, logged, or committed. No new Web App, Library, Vector Store, endpoint, trigger, or public exposure was created.

## Runtime gate A — OpenAI 2-Entity comparison

The private Web App used exactly:

```text
Entity A: GP:GP-000031
Entity B: LP_ASSET_OWNER:OPT-CPLP-001
Mode: 比較
Route: ChatGPT / OpenAI
Model profile: openai-current-default / gpt-5.6-terra
Thinking profile: provider-default
Date: 2026-08-01 through 2026-08-31
```

The query completed with a substantive grounded comparison that represented both selected Entities, comparison and temporal dimensions, and no recommendation/ranking language. Citation normalization produced eleven authoritative source citations:

```text
Entity A citations: 10
Entity B citations: 1
Unselected Entity citations: 0
Normalization parse failures: 0
Authoritative Drive links valid: 11/11
Expected Entity A evidence present: DOC-000017 and MTG-000005
Expected Entity B evidence present: MTG-000004
```

The UI showed an explicit per-Entity evidence summary. Both selected Entities had evidence, so no evidence-gap warning was required in this runtime result; deterministic tests cover the zero-evidence branch.

## Runtime gate B — advanced exact Meeting filter

One bounded OpenAI query used:

```text
Date: 2026-08-27 through 2026-08-27
Source Type: Meeting
Entity: LP_ASSET_OWNER:OPT-CPLP-001
Related GP: GP-000031
Meeting Type: ANNUAL_REVIEW
```

It returned exactly one authoritative normalized citation, `Meeting / MTG-000004`, attributable to the selected Entity. The answer contained the known authoritative synthetic body fact `CODEX02 synthetic meeting body 20260827`; the Drive link was valid. Exact-token and substring-negative behavior is covered deterministically.

## Runtime gate C — FULL_OUTPUT multi-Entity preview

One API-independent preview used the same two Entities and bounded August 2026 scope. It completed with:

```text
Meeting sources: 5
Authoritative Meeting text: 1419 characters
Pitchbook references: 12
Hard stop: none
Artifact created: none
AI submission invoked for preview: none
```

Both Entities were grouped in the package. `MTG-000004` and `MTG-000005` were present with authoritative Meeting text, including the known Meeting token. `DOC-000017` was present as reference metadata, while the known Pitchbook body token was absent. Pitchbook output was explicitly labeled as reference metadata and authoritative links only.

## Final integrity and side effects

CODEX-03 invoked only two read-only OpenAI Responses/File Search queries and one API-independent FULL_OUTPUT preview. It invoked no sync, upload, attachment, indexing, update, replacement, cleanup, lifecycle, or delete path. Therefore the accepted 16-completed-document provider baseline could not grow or duplicate through this dispatch; the existing authoritative citation identities remained reusable and normalized.

```text
OPENAI_PROVIDER_DOCUMENTS_BASELINE: 16 completed
OPENAI_PROVIDER_MUTATION_PATH_INVOKED: NO
DOC_000017_DUPLICATE_UPLOAD: NO
DOC_000018_MUTATION: NO
OLD_LARGE_FIXTURE_MUTATION_OR_RETRY: NO
BROAD_SYNC_OR_REINDEX: NO
GEMINI_API_CALL: NO
PROVIDER_FALLBACK: NO
CONFIDENTIAL_DATA: NONE
FULL_OUTPUT_ARTIFACT: NONE
NEW_PROVIDER_OR_GOOGLE_RESOURCE: NONE
PRIVATE_WEB_APP_IDENTITY: unchanged / version advanced once to 63
```

## Completion latch

```text
MULTI_ENTITY_REQUEST_VALIDATION: PASS
MULTI_ENTITY_COMPARISON: PASS
PER_ENTITY_CITATION_ATTRIBUTION: PASS
EVIDENCE_GAP_HANDLING: PASS
RELATED_GP_EXACT_FILTER: PASS
MEETING_TYPE_EXACT_FILTER: PASS
FULL_OUTPUT_MULTI_ENTITY_PARITY: PASS
OPENAI_RUNTIME_MULTI_ENTITY: PASS
OPENAI_RUNTIME_ADVANCED_FILTER: PASS
LOGIC_VALIDATION: PASS — canonical 368/368
TARGET_RUNTIME_QUALIFICATION: PASS
APPS_SCRIPT_READBACK: PASS — 80/80
RUNTIME_DEPLOYMENT_VERSION: 63
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CODEX_04: YES
BLOCKER: NONE
FINAL_COMMIT: reported from the final pushed PR head
```

CODEX-04 remains the bounded six-format/provider-capability dispatch. Gemini recovery, broad corpus operations, large-file recovery, Work 0023, historical migration, company rollout, and general hardening remain outside CODEX-03.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`
