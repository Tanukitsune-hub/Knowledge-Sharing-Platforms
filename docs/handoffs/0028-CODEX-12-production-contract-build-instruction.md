# CODEX-12 — 単一記録production contract BUILDとtarget-runtime検証

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-12
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.1 / PRODUCTION CONTRACT BUILD + TARGET RUNTIME QUALIFICATION

## Work Contract

Primary Outcomeは、PR #50で受け入れた単一記録Light UIの主要フローをproduction codeへ最小かつ一貫して実装し、synthetic isolated dataでApps Script / Workspaceの裏側contractがend-to-endで動くことを証明すること。

最優先の正本:

1. ユーザー明示条件
2. `docs/handoffs/0028-design-acceptance-and-build-reset.md`
3. 本instruction
4. `docs/design/0028/selected-light-family/integrity-light-review/contract-impact-map.md`
5. 最新mainの`docs/handoffs/0028-dispatches.md`
6. 最寄りの`AGENTS.md` / `AGENTS.override.md`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Prepared branch: `codex/0028-production-contract-build`

開始時に必ず最新mainをfetchし、実際のBASE_MAIN_SHAとPR #50 merge `98bd1f233a5a462c55a9a3f9e4bc0dda6c705067`をreportへ記録する。prepared branchがstaleならlatest mainを安全に取り込んでから作業する。shared historyのforce pushは禁止。

推奨モデル: GPT-5.6 Sol High。複数の既存contract、Apps Script runtime、File Search metadata、idempotent recoveryを横断するため。実装が単純化され確定した後の反復修正は必要に応じ低いeffortへ落としてよい。

## Must-build scope

### A. Parent-bound Pitchbook registration

新規資料のregistrationは、server側でauthoritativeに検証した保存済みActive `Meeting_ID`を必須parentとする。

- browserから渡されたMeeting_IDを盲信しない。
- parent不存在 / Inactive / stale/conflictではDrive file、Pitchbook row、relationshipのmutationを開始しない。
- 新規Meeting + optional filesではMeeting commitを先に完了し、そのID確定後だけPitchbook prepare/uploadを開始する。
- 既存Meetingへの後日追加では新しいMeetingを作らない。
- file upload成功とMeetingへのrelationship確定を別stateとして扱う。
- link確定だけ失敗した場合、同じDocument_ID / existing fileを再利用し、fileを再uploadしない。
- response不明時はauthoritative readback後に再試行し、duplicate file / row / relationshipを作らない。
- file-level partial failure semanticsを保持する。

### B. Non-GP source context

現行Pitchbookの`GP_ID required`前提を、親Meetingのauthoritative Counterparty contextへ置き換える。

対象は既存6区分:

- GP / 運用会社
- LP / Asset Owner
- 日本生命
- グループ会社
- Consultant / Gatekeeper
- その他

実装範囲はvalidationだけではない。filename / Index metadata / AI source metadata / provider attributes / authoritative citation source mapまで一貫してnon-GPを扱う。

- fake GPや名前一致推定は禁止。
- 既存GP source compatibilityは保持。
- 既存historical Pitchbook rowを破壊・一括変換しない。
- 既存資料を別Meetingへlinkしただけで元の資料contextを無断上書きしない。
- 必要なpersistent contract変更は既存5-sheet内のappend-only最小列を優先し、`KSP_SCHEMA_VERSION`とmigration testsを正しく更新する。新sheet/relationship tableは作らない。

### C. Relation-only mutation and lifecycle

`Meeting_Index.Related_Pitchbook_IDs`をactive relationship truthとして維持する案を第一候補とする。

- 新規Document link追加
- existing Document_ID link追加
- user-facing `削除` = current Meetingからunlink
- unlinkの取消/再link

これらをMeeting本文編集と分離した限定facade/serviceで実装する。

- Lock/CAS/optimistic concurrencyを保持。
- relation-only mutationでGoogle Docs本文・filename・Meeting business fieldsを再生成/上書きしない。
- Meeting Inactive、Pitchbook Inactive、unlink、physical deleteを分離する。
- Inactive parentからrelation mutationを拒否する。
- 元からInactiveなPitchbookをlink undoだけでReactivateしない。
- shared Documentの他Meeting linkを保持する。

### D. Search / File Search eligibility

新規parent-bound資料は、Pitchbook statusだけでなく有効なparent relationshipを考慮して通常retrieval eligibilityを決める。

- link未確定 / 最後の有効linkを解除した新規資料を通常AI検索・citation候補へ残さない。
- 他の有効なparent relationがあるshared Documentはそのcontextで保持する。
- parent Inactive時の扱いを明示し、physical fileをcascade deleteしない。
- metadata/hash/derived index更新とstrict citation validationを整合させる。
- provider auto-failoverは追加しない。
- Work 0027 Gemini qualified-disabled / normal-user hiddenを維持する。

### E. Knowledge Search and independent Full Output

PR #50で確定したproduction UI contractへ合わせる。

Knowledge Search:
- Row 1 `面談先 / 情報ソース / 開始日 / 終了日 / 全期間`
- Row 2 `検索モード / AIモデル`
- Row 3 wide `質問`
- `情報ソース`: `面談記録・資料 / 面談記録のみ / 資料のみ`
- entityKeyをprimary targetにし、GP-only UIへ戻さない。
- existing compare 2–5 Entity / meeting prep special validationを保持。
- Meeting-only filtersとPitchbook-onlyの未対応組合せを無言で広げない。

Full Output:
- AI model selectorのoptionではなくdedicated `全文出力` action。
- common Meeting filtersだけを適用するMeeting-only / non-AI path。
- empty question / AI profile未設定でも実行可。
- Docs全文 + authoritative Meeting business attributesを出す。
- Pitchbook body / Pitchbook reference-link sectionは含めない。
- existing preview/readback/fingerprint、件数/文字数/時間上限、0件、read failureを保持。
- AI mode validatorからexport validatorを分離し、質問/mode/AI selectorを勝手に変更しない。

### F. Production UI wiring

PR #50のvisual/designをproduction HTML/clientへ反映する。backend contractの動作確認を優先し、accepted visual familyを再設計しない。

最低限の主要フロー:

1. `記録を追加`: Meeting form + optional new files + existing Document link
2. `過去の記録`: single Meeting list/detail + original + edit + record delete/reactivate + related files + add/unlink/relink + classification edit
3. `ナレッジ検索`: accepted filter/model/question/full-output layout

`面談実績の集計`のapproved 9 columns、`面談先サマリー`のGP/Entity separate read facade、admin preset/shared-adminは壊さない。不要な全面frontend refactorは禁止。

## Preserved / Non-goals

- 5-sheet backend baseline
- stable Meeting_ID / Document_ID
- Shared Drive authoritative / provider index rebuildable
- no physical delete
- no new standalone Pitchbook registration UI
- no Data Receipt tab / Record_Type selector / new Record_Index
- no historical orphan auto-parent inference or bulk migration
- no Dark/System/theme selector
- no Gemini enablement
- no broad deployment/real confidential data
- no unrelated refactor/dependency upgrade

受領のみ記録の業務扱い・面談集計算入はFOLLOW_UP。今回のPrimary Outcomeを止めない限り実装しない。

## Tests before live

Focused testsを先に追加/修正し、少なくとも次をdeterministicに証明する。

1. parent missing / inactive / stale -> file/index/link mutation 0
2. GP + 5 non-GP parentで資料registration成功
3. file success + link failure -> same Document_IDでlink-only retry / duplicate 0
4. relation add/unlink/relinkでMeeting Docs body byte-equivalent / business fields不変
5. shared Document unlinkで他link保持
6. originally Inactive PitchbookをrelinkしてもActiveへ変化しない
7. final active-link removal後のnew parent-bound source retrieval eligibility
8. non-GP metadata -> provider attributes -> authoritative citation mapの一致
9. normal search Meeting/Pitchbook/both + incompatible filter rejection
10. Full Output empty question/no AI works; reverse dates/limits/read failures fail closed
11. existing Work 0027/0029 tests and public-surface allowlist PASS
12. schema migrationがある場合はexisting row/data preservationとidempotent setup

Canonical `npm run check`は必須。`dist/KnowledgeShare.bundle.gs`はsource exact commitからregenerateし、source/bundle parityを確認する。hand edit禁止。

## Target-runtime qualification

Deterministic PASS後にのみ実施する。

`docs/operations/apps-script-web-app-deployment.md`に従い、まずidentity chainを固定する:

Git ref -> local tested source -> Apps Script project -> remote saved source -> immutable version -> WEB_APP deployment -> execute-as/access -> browser account -> observed execution

秘密/ID/URLをchat/GitHubへ保存しない。

Synthetic/anonymized isolated dataだけを使用する。少なくとも:

- one GP Meeting + attached file
- one non-GP Meeting + attached file
- one existing Meeting follow-up file add
- one unlink/relink
- relation-only mutation前後のDocs body readback
- one Knowledge Search source/citation readback where available under approved provider policy
- one Meeting-only Full Output preview/readback

providerがWork 0027 policyでdisabledの場合、GeminiをenableしてPASSを作らない。OpenAI pathがconfigured/eligibleなら既存policy内で確認し、未configuredならprovider-independent source/metadataまでをPASSしprovider executionをNOT RUNとして分離する。

### Deployment mutation budget

- existing deploymentを更新する前に`WEB_APP` + `/exec`をpositive proofする。
- ambiguous/Library deploymentへmutationしない。
- 本dispatchで許可するversion/deployment mutationは最大1回。
- stop-on-first-failure。二つ目のdeploymentを作らない。
- user exposure/access範囲を広げない。

## Acceptance Evidence

- final diff scoped to required src/tests/generated dist/docs only
- focused tests + `npm run check` PASS
- bundle/source readback parity PASS
- target-runtime synthetic primary flow PASS or a precisely classified BLOCKER
- no duplicate Meeting/Document/file/link under partial failure/retry
- authoritative Docs content preserved under relation-only mutations
- non-GP parent source/citation context preserved
- independent Full Output contract demonstrated
- Work 0027 / 0029 boundaries preserved
- no unauthorized production/live data/deploy exposure

## Bounds and stop conditions

Implementation/focused repairは最大2round。同じfailure classの反復、migration/architecture拡張が必要、identity chain不明、Apps Script targetがwrong deployment、authoritative data integrityが守れない場合は即Strategy Resetする。

BLOCKER以外はFOLLOW_UPへ分離する。主要acceptanceがPASSしたら最終整合確認を1回だけ行いCompletion Latchをかける。

## Return format

新規Draft PRを作成し、以下を返す。

- final branch / commit / PR
- implementation summary
- schema deltaの有無
- LOGIC_VALIDATION
- BUNDLE_VALIDATION
- TARGET_RUNTIME_QUALIFICATION
- authoritative integrity evidence
- SIDE_EFFECT_STATE
- BLOCKER / FOLLOW_UP / OPTIONAL
- report path `docs/handoffs/0028-CODEX-12-production-contract-build-report.md`

冒頭と末尾に:

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-12
BALL: CHATGPT
STATUS: RETURNED
