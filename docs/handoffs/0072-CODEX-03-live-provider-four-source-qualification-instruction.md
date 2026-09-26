# Work 0072 CODEX-03 — Live provider four-source qualification

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-03
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH
USER_NATIVE_ACTION_BUDGET: 0
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO

## Authorization

User explicitly authorized bounded live provider qualification on 2026-09-26.

This authorization is limited to isolated synthetic / non-confidential qualification.

Allowed:

- live provider API calls for qualification
- isolated synthetic provider File Search / Vector Store resource creation
- exactly bounded synthetic source indexing
- exact-ID cleanup of resources created by this Dispatch
- existing isolated owner-only Apps Script target source sync/version/deployment update only after exact target identity is independently confirmed
- isolated synthetic Workspace records/files if required for the end-to-end path

Not authorized:

- company/confidential source content
- company production backend or Shared Drive
- historical migration
- company rollout / user exposure
- Work0030 Azure OpenAI transition
- Azure OpenAI calls/resources
- permission broadening
- public deployment
- trigger enablement
- bulk indexing
- existing real provider-store mutation
- secret creation / rotation / copy into GitHub/chat
- physical deletion of authoritative application records
- user-native action

## Primary Outcome

Prove, with bounded live provider evidence, that release 0.2.3 can execute the new four-source path end-to-end for synthetic data:

```text
authoritative source
-> provider indexing
-> source-scoped Knowledge Search
-> provider citation
-> authoritative source identity / Drive provenance
```

for:

```text
Meeting
Pitchbook
News
Internal Assessment
```

At least one currently configured non-Azure provider must complete this end-to-end path for Work0072 provider-runtime acceptance.

If more than one existing non-Azure provider is already configured and safely usable in the isolated qualification environment, qualify each independently within the budgets below. Do not create credentials merely to add another provider.

## Baseline / Closed Conclusions

Do not reopen without material contradiction:

```text
PR #106: merged
MERGE: 309040b2f834c1964283c52740f4ea84a2d6442a
RELEASE: 0.2.3
SCHEMA: 9
FOUR_SOURCE_CORE: INTEGRATED
LOGIC_VALIDATION: PASS
NPM_RUN_CHECK: 734/734 PASS
BUNDLE_SOURCE_COMMIT: de0128791e4f29739ed6979989d466086bbf7a30
BUNDLE_FILE_SHA256: ef4fa15273d16d6dfd19fe567f4fdfe75f5dfea1b19e5778bd9dc6df44377a66
BUNDLE_PAYLOAD_SHA256: 7e403bf2fd48701dc0eab6c8c5fd81230ee97d7821d1413016d55ba34f9ace57
```

Accepted core:

- canonical `sourceTypes[]`
- scalar compatibility
- 4 checkbox UI
- default Meeting only
- Active-only retrieval
- multi-Counterparty News/Assessment membership without duplication
- four-source citation/provenance
- provider-required 40-ID fail-closed boundary
- Full Output limits separated from provider limit
- deterministic Full Output materialization and unsupported binary hard-stop
- Work0071 interaction stability

This Dispatch is qualification, not feature development.

## Read First

- nearest `AGENTS.md`
- `docs/handoffs/0072-dispatches.md`
- `docs/planning/work0072-four-source-knowledge-search.md`
- `docs/handoffs/0072-CODEX-01-four-source-knowledge-core-report.md`
- `docs/handoffs/0072-CODEX-02-source-scope-limit-repair-report.md`
- `docs/operations/runtime-policy.md`
- `docs/decisions/target-runtime-first-development.md`
- provider implementation / admin / diagnostics source
- existing provider qualification evidence and current official provider API documentation only as needed to interpret runtime failures

Do not change transport/model/API merely because documentation has evolved. First observe the existing configured path. If current provider contract is rejected by the real API, record exact safe error shape and stop that provider matrix before repair.

## Provider selection

### Excluded

`AZURE_OPENAI` / Work0030 remains `DEFERRED_BY_USER`.

Do not call or configure Azure.

### Eligible

Only currently configured isolated/test credentials for:

- Direct OpenAI, if already configured for this non-company qualification environment
- Gemini, if already configured for this non-company qualification environment

Never print or record secret values.

Read only redacted readiness/state:

```text
configured: yes/no
enabled: yes/no
model/profile label or safe model ID
store configured: yes/no
credentialConfigured: yes/no
```

If neither eligible provider has an existing credential, return:

```text
BLOCKER: NO_AUTHORIZED_PROVIDER_CREDENTIAL
```

Do not ask the user to paste a key into chat.

If exactly one provider is configured, qualifying that provider is sufficient for this Work's live-provider gate; record the other as `NOT_CONFIGURED_NOT_BLOCKING`.

If both are configured, qualify both within the declared budgets.

## Target identity gate

Prefer the existing isolated owner-only Apps Script qualification target already used by prior Works.

Before any Apps Script mutation, independently prove:

- exact project identity
- exact deployment identity
- owner-only / non-public access
- isolated backend/resource parentage
- no company/confidential source content in the qualification dataset
- current provider credentials belong to the intended isolated/test boundary
- source to be deployed is release 0.2.3 production source

Never infer target identity from a stale local path, old screenshot, deployment URL fragment, or remembered ID alone.

### If target identity is confirmed

Allowed maximum:

```text
APPS_SCRIPT_SOURCE_SYNC: 1
IMMUTABLE_VERSION_CREATE: 1
EXISTING_DEPLOYMENT_UPDATE: 1
NEW_DEPLOYMENT: 0
NEW_APPS_SCRIPT_PROJECT: 0
```

Use the same existing owner-only deployment.

### If target identity cannot be confirmed

Do not create a new target.

If an existing provider-native qualification path can still exercise the exact production adapter/source code safely without weakening credential/security boundaries, it may establish `LIVE_PROVIDER_NATIVE_QUALIFICATION`, but it does not establish `APPS_SCRIPT_PROVIDER_E2E`.

Return the missing Apps Script runtime evidence separately. Do not misreport it as PASS.

## Synthetic dataset

Use only obvious synthetic/anonymized content. Never copy real business text.

Preferred four-source qualification set:

### Meeting

One synthetic Meeting with a unique sentinel such as:

`KSP0072-MEETING-SENTINEL`

### Pitchbook

One synthetic TXT Pitchbook with:

`KSP0072-PITCHBOOK-SENTINEL`

Use TXT to avoid reopening binary materialization scope.

### News

One synthetic direct-text News source with:

`KSP0072-NEWS-SENTINEL`

Prefer two synthetic Counterparty memberships so the live path exercises multi-Counterparty membership.

### Internal Assessment

One synthetic direct-text Assessment with:

`KSP0072-ASSESSMENT-SENTINEL`

Its body must explicitly be fictional/internal synthetic assessment content.

Use existing clearly synthetic master records where independently verified. If no safe synthetic master records exist, create the smallest isolated synthetic master/data set allowed by the confirmed target. Do not modify company or ambiguous records.

Application record cleanup uses normal lifecycle only. Do not physically delete authoritative app records.

## Provider resource isolation

Do not use or contaminate an existing non-test provider store containing unrelated data.

Preferred:

```text
one isolated temporary qualification store/vector store per provider
owned by this Dispatch
contains only four synthetic qualification sources
```

Safe display name may include:

`KSP-0072-CODEX-03-SYNTHETIC`

Do not put private IDs or user information in display names.

If provider resource creation returns an unknown outcome, resolve exact outcome before retry. No blind duplicate create.

## Mutation and cost budgets

Per configured provider:

```text
PROVIDER_STORE_CREATE_MAX: 1
PROVIDER_SOURCE_INDEX_MAX: 4
PROVIDER_QUERY_START_MAX: 3
PROVIDER_REINDEX_MAX: 1 source only, only if needed for lifecycle/hash proof
PROVIDER_DOCUMENT_DELETE_MAX: exact resources created by this Dispatch
PROVIDER_STORE_DELETE_MAX: 1 exact store created by this Dispatch
```

Across the Dispatch:

```text
PROVIDER_QUERY_START_TOTAL_MAX: 6
SOURCE_RECORD_CREATE_MAX: 4
SYNTHETIC_COUNTERPARTY_CREATE_MAX: 2 only if required
APPS_SCRIPT_SOURCE_SYNC_MAX: 1
IMMUTABLE_VERSION_MAX: 1
DEPLOYMENT_UPDATE_MAX: 1
USER_NATIVE_ACTION_BUDGET: 0
```

Keep prompts/output small. Use the currently configured approved model/profile; do not upgrade model tier for qualification unless the existing configured model is unsupported by File Search and the change is independently authorized by current repo policy.

Do not run broad performance benchmarks.

## Qualification matrix

Run matrices independently per provider.

A failure in one provider does not contaminate the other unless they share the failed application layer.

### Q1 — Four-source index identity

Index exactly the four synthetic sources.

For each source, verify provider readback where the provider exposes it:

- provider document exists
- source_type
- source_id
- content_hash
- current store identity
- source is Active
- no duplicate provider document for one authoritative source

For News with two Counterparties, verify there is still one provider source/document, not one per Counterparty.

### Q2 — All-four retrieval

Query with:

```text
sourceTypes = [Meeting, Pitchbook, News, Internal Assessment]
```

Prompt should request the four unique sentinel tokens and require evidence from each category.

Acceptance:

- query reaches provider
- grounded response returns
- citations include authoritative identity for each source actually used
- application maps citation back to correct stable source ID and Drive URL
- no citation from outside selected scope
- Assessment citation carries internal-assessment provenance

Do not require exact prose wording from the model.

### Q3 — News multi-Counterparty membership

Run one source-scoped query using one of the News record's synthetic Counterparties.

Acceptance:

- exactly the intended News source is in authoritative resolved scope
- provider request uses safe metadata or bounded source-ID allowlist according to implemented contract
- News sentinel can be retrieved
- citation maps to the single `NEWS-*` record
- no provider/source duplication by Counterparty

### Q4 — Assessment provenance

Run one Assessment-only query.

Acceptance:

- Assessment sentinel retrieved
- citation maps to exact `ASMT-*`
- UI/server citation metadata identifies `評価（ICメモ、社内整理等）`
- provenance states internal assessment / historical internal view
- no source outside Assessment selected scope is accepted

### Optional Q5 — one bounded reindex

Only if provider lifecycle correctness is otherwise unproven and the extra evidence can change acceptance.

Change only one synthetic source body/sentinel using the normal authoritative edit path, then exact-source reindex.

Acceptance:

- same stable source ID
- one current provider document identity according to provider contract
- content hash updates
- stale citation/document is not accepted
- no duplicate authoritative record

Do not run this optional matrix merely for reassurance.

## Citation integrity

For every accepted live citation, require application-level mapping:

```text
provider citation
-> source_type
-> source_id
-> current provider content identity/hash where applicable
-> authoritative Active source
-> exact Drive/source URL
```

Provider response text alone is not sufficient evidence.

A citation with incomplete/ambiguous identity is not PASS even if the answer text contains the sentinel.

## Apps Script / browser evidence

If exact isolated Apps Script target is confirmed and 0.2.3 is deployed, use automated browser/runtime execution.

Minimum browser/runtime evidence:

- Knowledge Search loads
- source selector default Meeting only
- select all four
- run live provider query
- answer renders
- citation list renders four-source labels/provenance as returned
- no material console error/warn caused by the flow
- no user-native action

Do not repeat 1440/390/320 responsive matrices; CODEX-01 already closed those. One representative desktop viewport is sufficient unless runtime behavior contradicts prior browser evidence.

## Cleanup / final state

Capture evidence before cleanup.

For provider resources created by this Dispatch:

- delete exact synthetic provider documents/files when required by provider API
- delete exact temporary qualification store/vector store
- verify deletion/not-found state where API supports readback
- never delete by display name alone
- never delete any pre-existing store/resource

For application records:

- prefer normal Inactive lifecycle after qualification if cleanup is needed
- do not physically delete
- preserve Audit evidence

If provider cleanup fails after successful qualification:

- do not invalidate already captured qualification evidence automatically
- report `CLEANUP_FOLLOW_UP` with exact bounded resource type, not secret/private IDs in GitHub
- stop further mutation

## Security / data evidence

Must report:

```text
CONFIDENTIAL_DATA_USED: NO
COMPANY_DATA_USED: NO
COMPANY_PROVIDER_RESOURCE_USED: NO
PUBLIC_EXPOSURE_CHANGE: 0
PERMISSION_CHANGE: 0
TRIGGER_CHANGE: 0
SECRET_VALUE_LOGGED: 0
USER_NATIVE_ACTION_COUNT: 0
```

## Stop rules

Stop the affected provider matrix immediately if:

- credential resolves to company/production boundary
- target/store identity is ambiguous
- real business source appears in selected store/dataset
- provider resource from another Work/user would be mutated
- unexpected billing/cost behavior exceeds bounded qualification intent
- API returns a contract shape requiring a material source patch
- citation identity cannot be made authoritative without weakening validation
- source index mutation produces duplicates
- cleanup target cannot be identified exactly
- auth requires user to paste/share a secret

Do not repair production source inside this QUALIFICATION Dispatch.

If a source defect is found, preserve evidence and return to ChatGPT for the next Dispatch.

## Evidence hierarchy

1. live provider resource/readback + authoritative Apps Script/Workspace source identity
2. actual provider query/citation + exact application mapping
3. isolated Apps Script/browser result when target identity is confirmed
4. provider-native live API result using exact production adapter contract
5. accepted CODEX-01/02 deterministic and browser evidence
6. static inference

## Acceptance

Provider-level result fields:

```text
OPENAI_CONFIGURED: YES | NO
OPENAI_LIVE_QUALIFICATION: PASS | FAIL | NOT_RUN
GEMINI_CONFIGURED: YES | NO
GEMINI_LIVE_QUALIFICATION: PASS | FAIL | NOT_RUN
FOUR_SOURCE_LIVE_INDEX: PASS | FAIL | NOT_RUN
ALL_FOUR_QUERY: PASS | FAIL | NOT_RUN
NEWS_MULTI_COUNTERPARTY_LIVE: PASS | FAIL | NOT_RUN
ASSESSMENT_PROVENANCE_LIVE: PASS | FAIL | NOT_RUN
CITATION_AUTHORITATIVE_MAPPING: PASS | FAIL | NOT_RUN
APPS_SCRIPT_PROVIDER_E2E: PASS | FAIL | NOT_RUN
LIVE_PROVIDER_NATIVE_QUALIFICATION: PASS | FAIL | NOT_RUN
PROVIDER_RESOURCE_CLEANUP: PASS | PARTIAL | NOT_RUN
```

Work0072 provider-runtime gate is satisfied when:

- at least one eligible currently configured non-Azure provider passes the full four-source live matrix;
- citation authoritative mapping passes;
- no company/confidential data is used;
- no BLOCKER remains;
- exact side-effect state is recorded.

A second unconfigured provider is not a blocker.

## No source release bump by default

This Dispatch is qualification only.

Do not change production source or release 0.2.3.

If a material source bug is discovered:

- stop the affected matrix
- do not patch in this Dispatch
- return `BALL: CHATGPT / STATUS: RETURNED`
- report exact failing layer and minimum repair

## Delivery

Create report:

`docs/handoffs/0072-CODEX-03-live-provider-four-source-qualification-report.md`

Update branch/main-safe dispatch state through a Draft PR only if documentation changes need review.

Preferred qualification-doc branch:

`work/0072-live-provider-qualification`

Do not modify production source.

Do not mark Work0072 ACCEPTED or apply Completion Latch. ChatGPT owns final acceptance.

## Mandatory final identity

```text
WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
```

If user/secret interaction becomes unavoidable:

```text
WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-03
BALL: CHATGPT
STATUS: BLOCKED
BLOCKER: AUTH_REQUIRES_USER_NATIVE_OR_SECRET_INPUT
```

Do not ask the user directly from Codex; return to ChatGPT.

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-03
BALL: CODEX
STATUS: READY
