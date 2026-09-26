# Work 0072 CODEX-02 — Source-scope limit separation repair

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
USER_NATIVE_ACTION_BUDGET: 0
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO

## Goal

Draft PR #106の4-source implementationを保持したまま、ChatGPT final reviewで確認した1件のscope-limit regressionを修正する。

Root issue:

`kspRestrictKnowledgeEligibleSources_()` が、

1. authoritative eligibility/source resolution
2. provider source-ID allowlist construction
3. `KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX = 40` cap

を一つに結合し、Full Outputも同helperを通るようになった。

その結果、provider filterの40-ID上限がprovider-independent Full Outputへ漏れ、既存のFull Output limit contractを上書きしている。

## Confirmed regression

Before PR #106, existing accepted test behavior:

```text
51 Meeting records
-> preview: ok=true
-> preview.hardStop=true
-> body reads=0
-> creation: KNOWLEDGE_EXPORT_LIMIT_EXCEEDED
```

PR #106 currently changes this to:

```text
51 Meeting records
-> preview: AI_ADVANCED_FILTER_TOO_BROAD
```

This is not accepted.

Existing Full Output limits remain authoritative:

```text
WARNING_MEETINGS: 30
HARD_STOP_MEETINGS: 50
HARD_STOP_PITCHBOOKS: 200
HARD_STOP_MEETING_CHARACTERS: 250000
```

Do not replace these with the provider filter limit.

## Required design separation

Separate these concepts cleanly.

### A. Authoritative eligibility resolution

A provider-independent authoritative resolver may enumerate matching Active sources needed for:

- Full Output
- citation scope
- membership-aware source filtering
- parent-bound Pitchbook eligibility

It must preserve:

- selected `sourceTypes[]`
- Active-only
- multi-Counterparty membership
- date/entity/asset/fund scope
- parent-bound Pitchbook eligibility
- source uniqueness
- prior resolved-source intersection when explicitly supplied

This stage must NOT automatically apply the provider 40-ID cap.

### B. Provider source-ID filter cap

`KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX = 40` is a provider/query-filter bound, not a universal authoritative-source bound.

Apply it only when the provider request actually requires an explicit `source_id` allowlist.

Examples where an explicit authoritative source-ID list may be required:

- News / Assessment Entity membership that cannot be represented correctly by one provider metadata equality
- multi-Entity membership resolution
- legacy advanced filters requiring authoritative pre-resolution
- parent-bound Pitchbook eligibility if no equivalent safe provider metadata filter exists

When a provider query truly needs >40 source IDs, fail closed with `AI_ADVANCED_FILTER_TOO_BROAD`.

Do not weaken parent-bound Pitchbook safety just to avoid the cap.

### C. Broad provider search

A broad search that can be represented safely by existing provider metadata must not enumerate every matching source solely because 4-source support exists.

At minimum verify:

- Meeting-only broad search with >40 Active Meetings does not fail only because total source count exceeds 40.
- News-only / Assessment-only / mixed source-type selection with no membership filter uses `source_type` / other safe provider metadata when sufficient, rather than an unnecessary global source-ID list.
- if Pitchbook parent-bound eligibility makes explicit IDs necessary, preserve the accepted safety restriction and document that specific reason.

Do not invent source duplication.

### D. Full Output

Full Output is provider-independent.

It may share canonical `sourceTypes[]` and authoritative matching semantics with Knowledge Search, but it must not inherit provider source-ID filter limits.

Required behavior:

- 41 Meeting: preview is not `AI_ADVANCED_FILTER_TOO_BROAD`.
- 50 Meeting: preview may succeed subject to existing character limit; count alone is not a hard stop.
- 51 Meeting: preview `ok=true`, `hardStop=true`, no body read.
- creation after a 51 Meeting hard-stop: `KNOWLEDGE_EXPORT_LIMIT_EXCEEDED`.
- 200 Pitchbook: count alone is not hard stop.
- 201 Pitchbook: preview hard-stop using the existing export limit, not provider 40-ID error.
- hard-stop path reads no source bodies and creates no artifacts.

Preserve the new 4-source Full Output behavior for News / Assessment and unsupported-format hard-stop.

## Tests

Do not change an old test expectation merely to match the new implementation.

Restore the historical Full Output threshold contract.

Add focused regression tests that distinguish:

```text
AUTHORITATIVE_SOURCE_SCOPE_LIMIT
PROVIDER_SOURCE_ID_FILTER_LIMIT
FULL_OUTPUT_LIMIT
```

Minimum:

1. Full Output 41/50/51 Meetings.
2. Full Output 200/201 Pitchbooks, with no source body reads on count hard-stop.
3. Provider broad Meeting-only scope >40 does not receive the provider-ID error when source-ID enumeration is unnecessary.
4. Provider source-ID-required scenario at 41 IDs fails closed with `AI_ADVANCED_FILTER_TOO_BROAD`.
5. 4-source Entity membership still resolves multi-Counterparty News/Assessment once.
6. Parent-bound Pitchbook safety regression remains PASS.
7. unsupported PDF/PPTX/DOCX Full Output still hard-stops before byte reads/artifact creation.

## Preserve CODEX-01 accepted evidence

Do not reopen absent contradiction:

- canonical four source types and labels
- `sourceTypes[]` normalization
- scalar `sourceType` compatibility
- checkbox UI / Meeting-only fresh-load default
- 0-source invalid
- multi-Counterparty source stored/resolved once
- Active-only retrieval
- citation/provenance mapping
- source from unselected type excluded
- Assessment marked as internal assessment
- TXT / EML / XLSX Full Output materialization
- PDF / PPTX / DOCX unsupported hard-stop
- 1440 / 390 / 320 browser evidence
- Work0071 regressions
- schema9 / seven Backend sheets
- provider calls 0
- company data mutation 0

## Release / distribution

Keep target release:

```text
0.2.3 / schema9
```

This is a repair before integration, not a new release.

Because source changes after the CODEX-01 freeze, freeze the repaired production source again and regenerate:

- canonical bundle
- release manifest
- exact source commit
- bundle file hash
- payload hash
- independent company package BASIS
- seven-file raw parity

Do not retain stale CODEX-01 hashes.

## Validation

Focused repair tests first.

Then:

```text
python tools/validate_agent_foundation.py
npm run check
git diff --check
```

Run the Work0072 browser and Work0071 directly coupled regressions only if source touched by this repair can affect them. Do not repeat unrelated UI matrices by habit.

## Runtime / side-effect boundary

No runtime or provider mutation in this Dispatch.

```text
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
APPS_SCRIPT_SOURCE_SYNC: 0
IMMUTABLE_VERSION_CREATE: 0
DEPLOYMENT_UPDATE: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_BUDGET: 0
```

## Strategy Reset

STOP and return if:

- preserving Full Output limits requires weakening provider fail-closed behavior
- parent-bound Pitchbook eligibility cannot be preserved without a global 40-source cap
- repair requires schema/persistence change
- provider metadata limitations imply a new indexing architecture
- live provider call appears necessary

Do not broaden to binary materializer work.

## Delivery

Continue existing branch:

`work/0072-four-source-knowledge-search`

Continue Draft PR #106. Do not open a second PR.

Update:

`docs/handoffs/0072-CODEX-01-four-source-knowledge-core-report.md`

Create:

`docs/handoffs/0072-CODEX-02-source-scope-limit-repair-report.md`

Update:

`docs/handoffs/0072-dispatches.md`

Do not mark Work0072 ACCEPTED or apply Completion Latch.

## Mandatory final identity

```text
WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-02
BALL: CODEX
STATUS: READY
