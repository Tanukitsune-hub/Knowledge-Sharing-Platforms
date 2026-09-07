# CODEX-12 / PR #51 — Controller review

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-12
BALL: CHATGPT
STATUS: REVIEW
MODE: BUILD

## 結論

PR #51のproduction source、schema、主要tests、generated bundle/reportをレビューした。CODEX-12の主要実装は、受入れ済み単一Meeting中心UIとparent/file/link/citation/full-output契約を概ね一貫して実装している。

ただし、merge前に解消すべきBLOCKERが2件ある。

1. `PITCHBOOK_PREPARE`のrequest intentが成功後も無期限で残り、global 32件到達後に新規batch allocationを恒久的に拒否する。通常運用が有限回数で停止するためproduction BLOCKERとする。
2. Apps Script target-runtime qualificationが未実施。停止原因は既存WEB_APPが複数存在すること自体ではなく、local preflightが全WEB_APP件数=1を要求したAUTOMATION_LIMITATIONである。正しいtarget continuityを固定した上でsynthetic runtime acceptanceが必要。

CONTROLLER_SOURCE_REVIEW: PASS_WITH_BLOCKERS
MERGE_READY: NO
READY_FOR_PRODUCTION_BUILD: NO

## Review対象

- PR: #51
- branch: `codex/0028-production-contract-build`
- returned head: `2916cc7946626ec95ab46c2a70ffada9fc85f497`
- frozen production source: `f1c5cb7ae0e98c7ab68b78d5ddf9384caf0f09f7`
- base main: `eff99680b59adc5b3ab72c8007e648f61d76dded`
- schema: 7
- deterministic evidence reported by Codex: `npm run check` 512/512、bundle 27/27、focused 485/485

ChatGPTはGitHub上のdiff/source/tests/reportをレビューした。これらのtestをChatGPTが再実行したとは扱わない。Apps Script実機動作は未観測。

## Accepted implementation evidence

### Schema / compatibility

`Pitchbook_Index`末尾に以下4列だけをappendし、schema 6 -> 7。

- `Parent_Meeting_ID`
- `Counterparty_Type`
- `Counterparty_ID`
- `Related_GP_IDs`

5-sheet backendは維持し、legacy Pitchbook rowを自動parent化しない。setup testは既存row/native値の保全とmigration idempotencyを追加している。

### Parent-first / partial failure

- prepare/uploadでauthoritative Active parent Meeting + Versionをserver-side確認。
- new Pitchbook rowにparent/counterparty contextを固定。
- file保存とMeeting link確定を別stateとして扱い、linkだけ失敗した場合は同じDocument_IDのlink-only retry。
- upload response不明時はreadbackしてから再upload可否を判定。
- upload完了直前にもparent edit claim / TTL / Versionをlock内で再検証。

### Relation-only mutation

`updateMeetingRelations`を限定public facadeとして追加。relation updateは`Related_Pitchbook_IDs`とversion/AI derived statusのみを更新し、Meeting Docs本文の再生成経路を通さない。unlink/relinkとPitchbook-wide Inactive/Reactivateを分離している。

### non-GP / retrieval / citation

parent-bound Pitchbookは親のCounterparty Type/IDをfilename・Index・canonical AI sourceへ伝播。全6区分をtestsで扱う。新しいparent-bound sourceは、Active Pitchbookかつ少なくとも1件のActive Meetingから明示linkされている場合のみnormal retrieval eligibleとする。citation mappingでもcurrent authoritative contextとeligibilityを再確認する。

Legacy `Parent_Meeting_ID`空欄rowは既存GP互換経路を維持する。

### Full Output

専用Full OutputはMeeting-only / non-AIへ分離。質問、AI model、compare/prep contextを要求せず、共通Meeting filterだけを使う。Pitchbook body/reference sectionを含めず、Meeting Docs全文 + business attributesをpackage化する。

### Production UI

standalone Pitchbook pageをvisible navigationから外し、7-sidebar、Meeting registration/detail内の資料操作、Knowledge Search 3-row contract、dedicated Full Outputへproduction HTML/clientを更新している。

## BLOCKER 1 — prepare request retention / capacity

`src/81_PitchbookReservationAdapters.gs`は`REQUEST_` propertiesを全件列挙し、新requestに対して件数 `< 32` を要求する。一方、成功済み`COMPLETE` request recordを自動retire/compactしない。

結果として、同一Apps Script projectで成功batchが累積32件に達すると、以後の正常な新規資料登録が`PITCHBOOK_PREPARE_CAPACITY_EXCEEDED`で停止する。

これはrare recovery caseではなく、通常利用回数に比例して必ず到達する有限寿命であるためFOLLOW_UPではなくBLOCKER。

修正条件:

- unresolved / uncertain `INTENT`を安全性のため無断削除しない。
- recent replay window内では同じrequestIdが同じBatch/Document IDsへidempotentにreadbackできる。
- 正常に完了したrequestの履歴はboundedにretire/compactでき、32回を超える継続運用が可能。
- retire後の古いrequestId再送でduplicate allocationを黙って作らない。compact tombstone / bounded retired-token guard等、再送fail-closedまたはexact-safeな方式を選ぶ。
- Script Propertiesを無制限増加させない。
- 32件を超える連続成功、recent replay、unresolved intent保持、retired replay、bounded storageをdeterministic testで証明する。

実装方式はCodexに委ねるが、安全性を弱めるために単純削除してduplicate allocationを許容する修正は禁止する。

## BLOCKER 2 — target runtime incomplete

CODEX-12 preflightはprincipal/project/deployment inventoryのreadには成功したが、HEAD / version27 / version75の3 WEB_APPが存在するためlocal checkerが停止した。

これは「targetが3つに曖昧」と確定した証拠ではない。report上、version75 candidateは既取得metadataでは一意のversioned WEB_APP + `/exec`かつ期待されたexecute-as/accessを持つ。

次のrunでは、全WEB_APP件数=1という誤ったselection conditionを使わず、以下を独立に固定する。

```text
Git source
-> Apps Script project
-> remote saved source
-> immutable version
-> intended WEB_APP deployment + /exec
-> execute-as / access
-> browser account
-> observed current execution
```

identity chainのread-only確認が完了するまでsource/deployment mutationを行わない。

## Azure OpenAIによるruntime acceptance変更

ユーザーは会社のOpenAI-family providerがDirect OpenAIではなくAzure OpenAIであることを確定した。Azure provider移行・live File Search/citation qualificationは別Work 0030の正本へ分離済み。

したがってWork 0028の残るtarget-runtime qualificationでは、Direct OpenAI/Gemini provider callを行わない。

Work 0028で実機確認するprovider-independent範囲:

- schema 7 append-only setup/readback
- GP/non-GP parent Meeting creation
- parent-first tiny synthetic file registration
- existing Meetingへのfollow-up file追加
- relation unlink/relink + stable IDs / no physical delete
- relation-only mutation前後のauthoritative Google Docs本文一致
- Pitchbook rowのparent/counterparty metadata readback
- independent Full Output preview/readback
- existing Work 0027 Gemini disabled state / Work 0029 security stateの非破壊確認

Azure/Direct OpenAI/Geminiのprovider document upload/search/citation live callはWork 0028では0件とし、actual Azure File Search E2EはWork 0030へ移す。provider-neutral mapping/citation logicのdeterministic testsはPR #51 evidenceとして維持する。

## FOLLOW_UP

- 初回Meeting registration応答が完全に失われMeeting_IDがclientに届かない場合、現在は重複防止のため自動再登録せずoperator readbackを要求する。これは安全にfail-closedしておりdata corruptionを起こさないため、今回のmerge BLOCKERにはしない。運用回復の改善候補。
- admin-editable search mode presetのproduction persistence/server-authoritative resolverはWork 0028 designで将来要件として残っており、今回のcore runtime qualificationには含めない。
- 受領のみ記録、large-file qualification、細部polishは別gate。

## 次工程

fresh Dispatch `0028-CODEX-13`でPR #51を収束させる。

1. prepare-retention BLOCKER修正。
2. focused + canonical + bundle再検証。
3. runtime identity chainを正しいselectionで固定。
4. provider callなしのsynthetic primary-flow qualification。
5. source/bundle/remote readbackとside-effect integrityをreport。

PR #51は同一Work/outcomeの収束PRとして継続し、新しいPRへ分散しない。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-12
BALL: CHATGPT
STATUS: REVIEW
