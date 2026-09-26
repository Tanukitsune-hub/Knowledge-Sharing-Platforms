# Work 0072 CODEX-02 — Source-scope limit repair report

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PR: #106（Draft）

## Outcome

ChatGPT reviewで指摘された`PROVIDER_SOURCE_ID_LIMIT_LEAKS_INTO_FULL_OUTPUT`を修復した。`kspRestrictKnowledgeEligibleSources_()`は4-sourceのActive原本をauthoritativeに解決し、40件では打ち切らない。provider requestが明示`source_id` allowlistを必要とするときだけ`KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX=40`を適用する。Full Outputは既存のMeeting 50件、Pitchbook 200件、Meeting本文250,000文字の独立した閾値を使用する。

CODEX-01でChatGPTが受け入れた4-source `sourceTypes[]`、checkbox UI、multi-Counterparty membership、citation/provenance、Active-only、既存materializerと未対応binaryのhard-stop、Work0071 UX evidenceは維持した。Work0072は未ACCEPTEDであり、Completion Latchは適用していない。

## Repaired contract

| Boundary | Result |
|---|---|
| AUTHORITATIVE_SOURCE_SCOPE_LIMIT | providerの40-ID制限を外した。選択source・Active状態・日付/Entity/Asset Class/Fund条件、News/Assessment membership、parent-bound Pitchbook適格性、明示されたprior IDとのintersectionを保持。 |
| PROVIDER_SOURCE_ID_FILTER_LIMIT | parent-bound Pitchbook、News/Assessment membership、legacy Meeting advanced filters、Geminiでmetadataに表現できない複数Entityと`followUp=NOT_REQUIRED`にのみ明示ID allowlistを要求。必要なscopeが41件なら`AI_ADVANCED_FILTER_TOO_BROAD`でtransport前に停止。 |
| BROAD_PROVIDER_SEARCH | Meeting-only 41件、およびNews/Assessment混合42件の広域scopeは`source_type`等のmetadata filterで構築し、全IDをprovider filterへ列挙しない。canonical resolved IDsはcitation scope検証に残す。 |
| PARENT_BOUND_PITCHBOOK | provider metadataだけでは親Meetingとの現在のlinkを証明できないため、Pitchbook選択時はauthoritative ID allowlistを維持。orphan / Inactiveを除外。 |
| MULTI_COUNTERPARTY | News / AssessmentはCounterparty membershipで照合し、1 sourceを1件として返す。Entity指定時はauthoritative ID allowlistを使う。 |
| FULL_OUTPUT_LIMIT | 41/50 Meetingは短い本文ならpreview成功。51 Meetingは`ok=true / hardStop=true / body read 0`、同じfingerprintでのcreationは`KNOWLEDGE_EXPORT_LIMIT_EXCEEDED`。200 Pitchbookは件数だけでは停止せず、201件はFull Output自身のindex hard-stopとなりmetadata/byte readとartifact作成は0。 |
| UNSUPPORTED_MATERIALIZATION | PDF / PPTX / DOCXの選択原本は既存どおり`KNOWLEDGE_EXPORT_UNSUPPORTED_MATERIALIZATION`でbyte read・artifact作成前に停止。 |

Geminiの`followUp=NOT_REQUIRED`は現在のindexed metadataに`false`が保存されないため、source-ID allowlistで厳密に解決する。OpenAIには`false` metadataがあるため、同条件の広域Meeting検索はmetadata filterを使用できる。provider Storeやindexには変更していない。

## Validation and evidence

証拠階層はcurrent production sourceとhistorical Full Output contract、focused deterministic/fake-provider tests、生成物parityの順。local testsはApps Scriptやlive providerのruntime qualificationではない。

- 修復focused tests: 59/59 PASS。Meeting 41/50/51、Pitchbook 200/201、provider広域41/42、membership 41 fail-closed、parent-bound Pitchbook、multi-Counterparty、unsupported binaryを含む。
- fake provider query path: Meeting-only 41件は1回STARTし`source_id` filterなし。News membership 41件はSTART 0、`AI_ADVANCED_FILTER_TOO_BROAD`。live provider call 0。
- company package focused: 4/4 PASS、7 `.gs` raw連結とbundle byte parity、`.txt` transport、独立pinを確認。
- `python tools/validate_agent_foundation.py`: PASS。
- `npm run check`: 734/734 PASS。bundle validatorは67 server sources / 24 HTML resources。
- `git diff --check`: PASS。
- browser再実行: NOT RUN。今回の変更はserver側のsource scope/provider filter/Full Output閾値であり、CODEX-01で受け入れた1440/390/320とWork0071 browser evidenceを再度開くmaterialなUI変更はない。

## Exact distribution

```text
TARGET_RELEASE: 0.2.3
TARGET_SCHEMA: 9
BACKEND_SHEETS: exactly 7
SOURCE_COMMIT: de0128791e4f29739ed6979989d466086bbf7a30
BUNDLE_FILE_SHA256: ef4fa15273d16d6dfd19fe567f4fdfe75f5dfea1b19e5778bd9dc6df44377a66
BUNDLE_PAYLOAD_SHA256: 7e403bf2fd48701dc0eab6c8c5fd81230ee97d7821d1413016d55ba34f9ace57
COMPANY_PACKAGE_GS_FILES: 7
COMPANY_PACKAGE_MAX_FILE_BYTES: 426734
```

`scripts/build-company-multifile-package.cjs`の独立BASIS、`dist/release-manifest.json`、生成bundle、7-file packageを上記source commitとhashに更新した。CODEX-01時点の配布hashはこのcandidateでは無効である。新sheet、schema migration、trigger、permission変更はない。

## Runtime and side effects

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: NOT RUN
SIDE_EFFECT_STATE: DISABLED
PROVIDER_CALL_COUNT: 0
AI_INDEX_MUTATION_COUNT: 0
APPS_SCRIPT_SOURCE_SYNC: 0
IMMUTABLE_VERSION_CREATE: 0
DEPLOYMENT_UPDATE: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_COUNT: 0
BLOCKER: NONE_IN_CODEX_02_CANDIDATE; CHATGPT_FINAL_REVIEW_PENDING
READY: FOR_CHATGPT_REVIEW_ONLY
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
