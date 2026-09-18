# Company Azure OpenAI provider decision

Current as of: 2026-09-07
Status: ACCEPTED USER DIRECTION / PLANNED IMPLEMENTATION

## Decision

会社環境で利用するOpenAI系providerは、Direct OpenAI APIではなく会社提供のAzure OpenAIを正とする。

この変更は、既存のprovider-neutralなKnowledge Search / File Search / citation / model-policy / FULL_EXPORT契約を可能な限り維持し、provider transport・credential・resource identityだけをAzure OpenAIへ置き換える。

現在実行中のWork 0028 / `0028-CODEX-12`には割り込まない。CODEX-12のproduction-contract成果をreviewしてprovider-neutral部分を固定した後、別Work 0030でAzure OpenAI化を実装・認定する。

## Company production provider

会社productionのOpenAI系経路:

```text
Azure OpenAI
  -> Azure OpenAI v1 Responses API
  -> Azure Files / Vector Stores
  -> Responses file_search
```

Direct OpenAIは会社productionのfallbackにしない。Azure OpenAIが未設定・到達不能・未認定の場合はsafe errorとし、Direct OpenAIやGeminiへ自動切替しない。

過去のDirect OpenAI personal-DEV資格化の証拠は、その時点のprovider behaviorを示す履歴として保持する。既存のDirect OpenAI provider resource ID / File ID / Vector Store IDをAzure resourceとして再利用・推定しない。

## API contract

2026-09-07時点のMicrosoft公式v1契約を前提とする。

- base endpoint: `{AZURE_ENDPOINT}/openai/v1`
- Responses: `POST .../responses`
- Files: `.../files`
- Vector Stores: `.../vector_stores`
- File Search: Responsesの`tools[].type = file_search` + `vector_store_ids`
- API key authenticationは`api-key` headerを使用可能
- request `model`にはAzure上のmodel deployment nameを渡す
- v1を標準とし、古いdate-based preview APIを新規設計の前提にしない

実際のcompany resource region / deployment / capabilityは設定値から推測せず、target-runtime synthetic qualificationで確認する。

## Provider identity and state

Azure OpenAIのderived stateはDirect OpenAIと混同しない。

第一候補:

```text
provider code: AZURE_OPENAI
AI_Provider_State_JSON:
  OPENAI: historical Direct OpenAI state
  AZURE_OPENAI: company Azure OpenAI state
  GEMINI: existing Gemini state
```

新しいprovider-state sheet/databaseは作らない。既存five-sheet backendと`AI_Provider_State_JSON`のappend-only modelを優先する。

Direct OpenAIの古いStore/File/document identifiersをAzure OpenAI stateへcopyしない。Azure側はsynthetic self-test後に新しいderived indexを作成する。

## Configuration and admin UX

通常利用者にはprovider transportを増やさない。既存の`AIモデル`selectorを維持する。

管理者ページではOpenAI系設定をAzure OpenAIとして明示し、最低限以下をserver-sideで扱う。

```text
Azure OpenAI endpoint
Azure OpenAI API key
model deployment / approved model profile mapping
Azure Vector Store identity (internal / auto-managed)
enabled / readiness state
```

- API keyはScript Properties等のserver-side secret routeのみ。browserへ返さない、Audit/Sheets/GitHub/exportへ残さない。
- endpoint/deployment/provider resource IDsはnormal-userに見せない。
- raw deployment nameをnormal-user model labelと同一視しない。既存model-profile policyで表示名・thinking/reasoning許可範囲を管理する。
- Microsoft Entra IDは公式推奨だが、今回の最小company routeは会社提供API keyを対象とする。会社policyがAPI keyを禁止する場合のみ別途Entra認証へStrategy Resetする。

## Qualification before real source indexing

Azure OpenAIはcredential保存だけで有効化しない。

最初にsynthetic/non-confidentialな資格化を行う。

```text
1. GAS -> Azure Responses のtiny sentinel request
2. isolated Vector Storeをcreate/reuse
3. tiny synthetic fileをFiles APIへupload
4. Vector Storeへattachしindex completionを確認
5. exact metadata/attribute filter付きfile_search
6. grounded answer + citation/source identityを検証
7. uploaded synthetic fileをcleanup
8. READY_FOR_SYNCへ進む
```

このgateでMeeting/Pitchbook実データを読まない。

その後、synthetic/anonymized Meeting + Pitchbookでbounded lifecycleを確認してから実source syncへ進む。

## Required parity

Work 0030ではAzure OpenAIで少なくとも以下を認定する。

- Responses API basic response
- one Vector Store create/reuse
- Files upload / attach / processing / cleanup
- Meeting + Pitchbook File Search
- exact source_type / source_id / content_hash / entity metadata filter
- non-GP counterparty metadata
- normalized citation -> stable source ID -> authoritative Drive link
- update/reindex without duplicate
- Inactive / Reactivate / unlink eligibility
- provider disable/re-enable
- no Direct OpenAI/Gemini fallback
- model/deployment policy enforcement
- source/bundle parity
- Apps Script target-runtime synthetic E2E

## Preserved product contracts

- Google Workspace / Shared Drive remains authoritative.
- Azure File Search index is derived/rebuildable.
- normal-user source options remain `面談記録・資料 / 面談記録のみ / 資料のみ`.
- five search modes / admin-managed preset design remain.
- FULL_EXPORT remains non-AI and independent of Azure availability.
- Work 0027 Gemini qualified-disabled / normal-user hidden remains until separately requalified.
- Work 0029 shared-admin security remains unchanged.
- no cross-provider automatic failover.

## Non-goals

- Azure AI Search / custom vector DB introduction merely because provider changes
- Azure Function / API Management relay unless direct GAS -> Azure is proven impossible under company network policy
- Direct OpenAI automatic fallback
- Gemini enablement
- real confidential indexing before Azure synthetic qualification
- historical provider resource migration by ID inference
- provider-specific duplicate Knowledge Search UI

## Follow-up Work

Implementation and qualification are allocated to Work 0030:

`docs/planning/work0030-azure-openai-provider-transition.md`

Work 0030 starts only after active Work 0028 / CODEX-12 returns and ChatGPT fixes the accepted source baseline.
