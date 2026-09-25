# Work 0070 CODEX-02 — Source review repair

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH

## Goal

Draft PR #103 の ChatGPT source reviewで確認した deterministic contract defectを、同じWork / 同じPRで限定修正する。

このDispatchはCODEX-01のsource implementationを再設計しない。以下のreview findingsだけを修正し、focused validationとcanonical deterministic validationを再度通してChatGPTへ返す。

target-runtime qualificationはまだ行わない。修正受入れ後の別Dispatch 0070-CODEX-03 で実施する。

## Read First

- nearest AGENTS.md
- docs/planning/work0070-record-source-expansion.md
- docs/planning/work0069-source-aware-knowledge-expansion-plan.md
- docs/handoffs/0070-dispatches.md
- Draft PR #103 current diff
- CODEX-01 report

恒久ルールはAGENTS.md等に従い、このinstructionへ再掲しない。

## ChatGPT Review Findings

### 1. Browser upload accept contract is inconsistent with the real server bootstrap

Current server kspGetSourceUploadFormats_() returns extension values without a leading dot:

~~~text
pdf
pptx
xlsx
docx
txt
eml
~~~

Current client builds the browser accept string with sourceUploadFormats.map(item => item.extension).join(',').

Therefore the real bootstrap produces:

~~~text
pdf,pptx,xlsx,docx,txt,eml
~~~

instead of file-extension accept tokens:

~~~text
.pdf,.pptx,.xlsx,.docx,.txt,.eml
~~~

The CODEX-01 synthetic browser fixture incorrectly supplied dotted extensions and therefore masked this contract defect.

Required repair:

- define/retain one canonical extension representation and explicitly render browser accept tokens with a leading dot.
- Meeting attachment / standalone Pitchbook / News / Assessment must show the same six formats.
- help text should be human-readable and consistent.
- update the browser fixture to use the actual server contract shape rather than a more convenient dotted variant.
- add a focused test that crosses the real kspGetSourceUploadFormats_() output into client accept generation so this mismatch cannot recur.
- do not duplicate the format registry.

### 2. Standalone 保存資料 allows submit without required Asset Class

Server kspValidatePitchbookBatchInput_() requires date, counterparty, assetClassId, and file, but the standalone form does not mark Asset Class required and its submit handler checks date/counterparty/files only.

The synthetic browser fixture then returns a successful preparePitchbookBatch even though no Asset Class was selected, creating a false-positive acceptance result.

Required repair:

- standalone 資料保存 Asset Class is required, matching the canonical Pitchbook contract.
- mark the control/label required in UI and perform client-side required validation before prepare.
- focused browser test must prove missing Asset Class does not call preparePitchbookBatch.
- successful standalone browser path must explicitly select Asset Class.
- keep current parent-bound Meeting attachment behavior unchanged.

### 3. News / Assessment text-length UI contract disagrees with server validation

Current server contract:

- source Title: max 255
- News Publisher: max 255
- Fund / Strategy: max 500

Current Add UI allows maxlength=500 for News publisher and News/Assessment title. Past edit controls do not carry the corresponding limits.

A normal user can therefore enter content the browser accepts but the server rejects.

Required repair:

- align Add and Past-edit controls with the authoritative server limits.
- prefer the smallest coherent change: keep server Title/Publisher at 255 and set matching client limits/help/validation.
- add boundary tests for 255 accepted / 256 rejected or prevented as appropriate.
- do not change unrelated field limits.

### 4. Explicit SOURCE_REQUEST_EXPIRED is incorrectly trapped as unknown outcome

Current client stores a source operation in sessionStorage before RPC. When the server returns explicit SOURCE_REQUEST_EXPIRED, the client treats SOURCE_REQUEST_* errors as unresolved/unknown and retains the same expired request ID.

The next submit reuses that expired ID and fails again; global クリア remains blocked. The synthetic browser test currently codifies this stuck state.

But reserveSourceId() rejects SOURCE_REQUEST_EXPIRED before source ID allocation/counter mutation, so this is a known safe rejection, not an unknown outcome.

Required repair:

- classify explicit, known pre-allocation/admission rejection separately from transport/unknown-outcome state.
- at minimum SOURCE_REQUEST_EXPIRED must clear/retire the stale operation so the user can retry with a fresh request ID.
- no counter/source row/file may be duplicated by the recovery.
- server-provided retry continues to preserve the returned stable ID/fingerprint.
- true transport failure / no response / genuinely unknown result remains fail-closed.
- update browser test: explicit expiry is recoverable and a subsequent attempt uses a new request ID; it must not permanently block global clear.
- do not weaken retry/unknown-outcome safety to achieve this.

### 5. New source errors need actionable safe public messages

The new SOURCE_*, NEWS_*, ASSESSMENT_* validation/admission errors are not represented in KSP_SAFE_ERROR_MESSAGES; many server failures collapse to generic 管理処理を完了できませんでした。.

Required repair:

- add safe, non-sensitive user-facing mappings for the actionable errors introduced by Work0070 that can reach normal source-registration/edit/lifecycle flows.
- specifically cover the errors used in findings 1–4 and common source validation/reference errors.
- do not expose raw internal errors, IDs, file paths, Drive query text, stack traces, or provider details.

## Scope / Boundaries

Fix only the review findings above and direct test/document/generated-artifact consequences.

Do not:

- start Full Output Work
- add Knowledge Search source checkboxes
- add provider sync / AI calls / Digest
- change schema9 layout unless a finding proves it necessary
- alter Work0069 Closed Decisions
- deploy Apps Script
- mutate Workspace / company Drive / Sheets
- change permissions/triggers/provider configuration
- merge PR #103

## Required Validation

Run focused tests first.

Required evidence:

- real server upload-format bootstrap -> browser accept integration PASS
- all 4 upload surfaces expose .pdf,.pptx,.xlsx,.docx,.txt,.eml
- standalone missing Asset Class blocks before prepare RPC
- standalone valid path with Asset Class saves through existing Pitchbook flow
- parent-bound Pitchbook regression PASS
- source Title/Publisher 255-boundary consistency PASS for Add and edit
- explicit SOURCE_REQUEST_EXPIRED is recoverable with a new request ID
- true unknown outcome remains fail-closed
- server-provided retry still reuses stable source ID/fingerprint
- safe public source-error mappings PASS
- changed 1440px / 390px synthetic browser checks PASS
- generated bundle validation PASS
- dist/company-multifile parity PASS
- npm run check PASS once after focused checks
- git diff --check PASS

Explicitly report:

~~~text
UPLOAD_FORMAT_BOOTSTRAP_ACCEPT
UPLOAD_FORMAT_REAL_SHAPE_FIXTURE
STANDALONE_ASSET_CLASS_REQUIRED
STANDALONE_VALID_PATH
PITCHBOOK_PARENT_BOUND_REGRESSION
SOURCE_TEXT_LIMITS
SOURCE_REQUEST_EXPIRED_RECOVERY
SOURCE_UNKNOWN_OUTCOME_FAIL_CLOSED
SOURCE_RETRY_IDEMPOTENCY
SOURCE_SAFE_ERROR_MESSAGES
BROWSER_1440
BROWSER_390
BUNDLE_VALIDATION
MULTIFILE_PACKAGE_PARITY
CANONICAL_CHECK
DIFF_CHECK
TARGET_RUNTIME_QUALIFICATION
DEPLOYMENT_MUTATION_COUNT
PROVIDER_CALL_COUNT
COMPANY_DATA_MUTATION_COUNT
BLOCKER
~~~

For this Dispatch:

TARGET_RUNTIME_QUALIFICATION: NOT RUN (planned CODEX-03)

must not be reported as PASS.

## Execution Budget / Strategy Reset

- one repair strategy
- max 2 distinct repair attempts per same failure class
- live/runtime/deployment mutation: 0
- canonical full check once after focused tests; rerun only if material source changes follow

Strategy Reset and return if:

- fixing any finding requires a product/schema redesign beyond Work0069 decisions
- recovery semantics cannot distinguish known rejection from unknown outcome without weakening idempotency
- standalone Pitchbook fix requires a parallel upload architecture
- same failure class remains after 2 distinct fixes

## Delivery

Continue on PR #103 / branch:

work/0070-source-record-layer

Do not open a second PR.

Create report:

docs/handoffs/0070-CODEX-02-source-review-repair-report.md

Update branch copy of:

docs/handoffs/0070-dispatches.md

Return to ChatGPT for source review. Do not mark Work0070 ACCEPTED and do not apply Completion Latch.

## Mandatory final chat identity

Begin and end the final response with:

~~~text
WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
~~~

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-02
BALL: CODEX
STATUS: READY
