# Work 0030 — Azure OpenAI provider transition and qualification

WORK_ID: 0030
STATUS: PLANNED
MODE: BUILD (when activated)
DEPENDENCY: Work 0028 / CODEX-12 return + ChatGPT source-baseline review

## Primary Outcome

会社production向けOpenAI系providerをDirect OpenAIから会社提供Azure OpenAIへ移行し、既存Knowledge Shareのprovider-neutral File Search / citation / model-policy / security契約を維持したまま、Google Apps Script target runtimeでsynthetic end-to-endを認定する。

## Why separate Work

現在のWork 0028 / CODEX-12は、単一Meeting parent、資料link/unlink、non-GP metadata、Docs原文保全、FULL_EXPORT等のproduct/backend contractを実装中である。

Azure OpenAI化を同runへ追加すると、provider-neutralな不具合とAzure transport固有の不具合が混ざり、証拠とscopeを汚す。そのためCODEX-12には割り込まず、返却・review後のaccepted sourceをWork 0030のbaseにする。

## Closed architecture direction

- company OpenAI-family provider = Azure OpenAI
- provider codeは`AZURE_OPENAI`を第一候補とし、Direct `OPENAI` stateとresource identityを混同しない
- company routeからDirect OpenAIへのfallbackなし
- Gemini fallbackなし
- FULL_EXPORTはAzure非依存のまま
- one Azure Vector Storeを基本とする
- Files / Vector Stores / Responses file_searchをAzure v1 APIで使う
- API key authを今回の最小routeとする
- raw deployment nameはinternal provider identifier。normal-user表示はexisting model profile alias/policyを使う
- new provider-state sheet/databaseなし

Authoritative decision:
`docs/decisions/company-azure-openai-provider.md`

## Work Contract at activation

### Primary evidence hierarchy

1. Azure/OpenAI target endpointのauthoritative HTTP response + cleanup readback
2. Apps Script target runtimeでのsynthetic provider lifecycle
3. exact provider document / source identity / citation readback
4. source/bundle parity
5. deterministic tests
6. inference

### Fastest Safe Decisive Action

実アプリ改修前に、GASから会社Azure OpenAIへsynthetic one-request + File Search lifecycleが成立するかを限定資格化する。

このgateがFAILなら、application sourceへAzure統合を広げず、原因を`auth / network / endpoint / deployment / API capability`のどこにあるか分類する。

## Phase A — Azure transport qualification

Synthetic only。Meeting/Pitchbook bodyを読まない。

### A1 Responses

- configured endpointから`/openai/v1/responses`
- `api-key` header
- `model` = configured deployment name
- deterministic sentinel input
- HTTP 2xx + expected text extraction
- raw provider payloadをlog/auditへ保存しない

### A2 Files / Vector Store / File Search

- isolated Vector Store create/reuse
- tiny text file upload
- Vector Store attach / processing completion
- source attributesにsynthetic stable tupleを設定
- Responses `file_search` with exact attributes filter
- answerだけでなくretrieved/citation identityをrequire
- cleanupでfile/vector-store test residueを除去または明示的にisolated reuse

### Stop conditions

- 401/403、network deny、endpoint mismatch、deployment unavailable等でA1がFAIL -> source統合を開始しない
- basic response PASS / File Search FAIL -> File Search capabilityだけをBLOCKERとして分類し、full-context送信等で代替しない
- company policyがAPI keyを認めない -> Entra authenticationを別Strategyとして再設計し、同runで無理に追加しない

## Phase B — provider adapter implementation

AがPASSした場合のみ実装する。

### B1 Configuration

Server-side settings/property contract:

- Azure endpoint
- API key configured flag + secret property
- deployment/profile mapping
- Vector Store ID internal state
- readiness / enabled

API key / provider IDs / private endpointはbrowser、Audit、export、GitHubへ出さない。

### B2 Adapter

既存provider-neutral contractを再利用し、Azure-specific logicをadapter境界へ限定する。

必要なprovider-native責務:

- base URL / headers
- response text extraction
- Files upload
- Vector Store lifecycle
- file attach / status poll
- Responses file_search query
- Azure response/citation normalization
- retry/error classification
- cleanup/rebuild

Direct OpenAI adapterの有用なOpenAI-compatible pure helpersは再利用してよいが、Azure resource IDをDirect OpenAI stateへ保存しない。

### B3 Provider state

`AI_Provider_State_JSON`のappend-only extensionで`AZURE_OPENAI`を追加する案を優先。

Historical `OPENAI` stateは保持するがcompany query/syncでは使わない。

## Phase C — model/admin integration

Admin page:

- `Azure OpenAI`としてproviderを表示
- endpoint / API key / deployment profileをadminだけが設定
- keyはpassword input + server mutation、保存後はconfigured/unconfiguredだけ表示
- synthetic connection testとreal-source syncを分離

Normal user:

- provider設定項目は表示しない
- existing `AIモデル`selectorのみ
- user-facing model profileはadmin policyで許可されたAzure deployment mappingだけ
- raw deployment nameをuser inputとして送らせない

## Phase D — Knowledge Share lifecycle qualification

Synthetic/anonymized isolated data only。

最低限のmatrix:

1. Meeting source index -> query -> citation
2. Pitchbook source index -> query -> citation
3. non-GP Meeting + related Pitchbook metadata
4. `情報ソース`3択
5. exact Entity / date / Asset Class等のsupported filter
6. update -> reindex without duplicate
7. unlink / final eligible parent relation removal -> retrieval exclusion
8. relink/reactivate -> current source restore
9. source Inactive -> exclusion
10. provider disable -> safe error
11. Direct OpenAI / Geminiへfallbackしない
12. admin model/deployment policy bypass rejection

Citation acceptanceはfilename一致だけでは不可。provider document/file identityと`source_type / source_id / content_hash`等のauthoritative tupleからstable sourceへ一意に解決する。

## Phase E — distribution and target runtime

- focused tests
- canonical `npm run check`
- source/bundle public-surface parity
- deterministic bundle regenerate
- secret/provider-ID scan
- Apps Script exact-source readback
- synthetic Azure call from target runtime
- no unauthorized source/data/provider mutation

deploymentが必要な場合は`docs/operations/apps-script-web-app-deployment.md`に従い、identity chainを先に確定する。

## Acceptance Evidence

Work 0030 completeには少なくとも以下が必要。

```text
AZURE_RESPONSES_BASIC: PASS
AZURE_FILE_UPLOAD: PASS
AZURE_VECTOR_STORE: PASS
AZURE_FILE_SEARCH_FILTER: PASS
AZURE_CITATION_NORMALIZATION: PASS
MEETING_QUERY: PASS
PITCHBOOK_QUERY: PASS
NON_GP_CONTEXT: PASS
UPDATE_REINDEX_NO_DUPLICATE: PASS
INACTIVE_UNLINK_RELINK: PASS
MODEL_POLICY: PASS
NO_DIRECT_OPENAI_FALLBACK: PASS
NO_GEMINI_FALLBACK: PASS
SECRET_EXPOSURE: NONE
SOURCE_BUNDLE_PARITY: PASS
TARGET_RUNTIME_SYNTHETIC: PASS
REAL_CONFIDENTIAL_INDEXING: NONE
```

## Non-Goals

- real confidential corpus indexing
- historical provider resource migration
- broad user rollout
- Azure AI Search/custom Vector DB
- Azure Function/APIM relay unless direct GAS route is demonstrably blocked
- Entra auth unless company policy requires it
- Gemini recovery
- Direct OpenAI fallback
- provider-specific duplicate UI
- unrelated Work 0028 polish/refactor

## Activation gate

Work 0030は現在PLANNEDで、active dispatchを持たない。

Work 0028 / CODEX-12の返却後にChatGPTがfinal diff/runtime evidenceをreviewし、採用するprovider-neutral source baselineを固定してから`0030-CODEX-01`を発行する。
