# CODEX-12 — production contract BUILD report

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-12
BALL: CHATGPT
STATUS: RETURNED

## Work Contract / 現在地

- MODE: BUILD。PR #50の受入れ済みLight UIをproductionへ移し、親記録・原本・関連・検索・全文出力を一貫させる。
- BASE_MAIN_SHA: `a29ae5ed9262bad9c245538e52ff859b42405d1f`
- DESIGN_MERGE_SHA: `98bd1f233a5a462c55a9a3f9e4bc0dda6c705067`（PR #50）
- BRANCH: `codex/0028-production-contract-build`
- SOURCE_COMMIT: `f1c5cb7ae0e98c7ab68b78d5ddf9384caf0f09f7`
- BUNDLE_COMMIT: `b31a0e8`。report/evidence追記はsourceを変更しない。
- 開始時working treeはclean。prepared branchを追跡し、無関係な変更の破棄・shared historyの書換えは行っていない。
- 正本: `0028-CODEX-12-production-contract-build-instruction.md`、`0028-design-acceptance-and-build-reset.md`。
- 最短の決定的工程: focused tests → canonical check → source/bundle parity → identity chain → synthetic Apps Script主要フロー。
- 検証階層: authoritative runtime readback、versioned `/exec`実ブラウザ、remote/source parity、deterministic tests、推論。local harnessはApps Script認定ではない。
- 範囲外: 実機密データ、broad rollout、destructive migration、Gemini enablement、Dark/System、新DB/sheet/relationship table。
- 境界: implementation/focused repairは最大2round。runtimeはidentity不明でsource freeze、deployment mutation最大1回、stop-on-first-failure。

## 実装と契約対応

| 契約 | production変更 | 証拠 |
|---|---|---|
| A 親記録 | serverでActive/Version/IDを確認。prepare時とupload時に再検証し、upload中は既存Meeting edit claimで保護 | `pitchbook.test.cjs` |
| A 部分失敗 | file保存とlink確定を別stateにし、保存済みfileは同じDocument_IDでlink-only retry。prepare requestIdはactor・内容・親を照合して同じbatchをreadback | `pitchbook.test.cjs`、`pitchbook-prepare-idempotency.test.cjs`、`meeting-centric-ui.test.cjs` |
| B non-GP | 既存6区分を親のauthoritative contextから継承。filename/Index/provider/citationへ反映。既存資料の関連追加で元contextを変えない | `pitchbook.test.cjs`、`maintenance-service.test.cjs`、`ai-parent-bound.test.cjs` |
| C relation-only | `updateMeetingRelations` facade。Lock/CASでRelated_Pitchbook_IDsと限定metadataだけを更新。Inactive資料のrelinkでReactivateしない | `maintenance-adapters.test.cjs` |
| D retrieval | 新規parent-bound資料はActiveな明示linkがある場合のみ対象。最後のlink解除・parent Inactiveを反映。同期CASと検索結果readbackで古いcontextを拒否 | `ai-parent-bound.test.cjs`、`ai-provider-parent-cas.test.cjs` |
| E 全文出力 | Meeting-only / non-AI。共通条件のみ使用し、質問・比較・model profileを要求しない。Docs全文・業務属性、上限・fingerprint・readbackを維持 | `knowledge-export.test.cjs`、`knowledge-export-independent-ui.test.cjs` |
| F production UI | Light sidebar 7、親Meeting中心の登録・詳細・関連資料操作、検索3行layout、独立全文出力。集計9列・GP/Entity・shared-adminを維持 | UI回帰tests、実ブラウザ証拠は下記 |

### Schema delta

`KSP_SCHEMA_VERSION: 6 → 7`。`Pitchbook_Index`末尾に`Parent_Meeting_ID`、`Counterparty_Type`、`Counterparty_ID`、`Related_GP_IDs`の4列だけをappend。
5-sheet構成は不変。historical rowに自動parent推定・一括変換を行わない。native Dateを含む既存値の保全とsetup冪等性を`setup.test.cjs`で検証。

### Authoritative integrity

- 関係だけの変更はDocs/Drive APIを呼ばず、本文、filename、Date/Time、業務項目を再生成しない。実adapterを外部API fakeで動かし、本文文字列・native Date/Time・他Meeting link・Inactive資料の状態を照合。
- 新規資料contextは登録元のまま保持し、別Meetingへlinkしても上書きしない。
- File Searchは派生index。physical sourceのcascade deleteを実装していない。provider index cleanupとsource削除は別。
- 旧GP資料はParent_Meeting_ID空欄の互換経路を維持する。
- 独立レビューで長時間upload後のparent claim失効を検出し、最終Index書込みと同じLock内の親ID/Active/Version/claim token/TTL検証へ限定修正した。失敗時に古い処理からStatusを上書きせず、保存済みfileのreservationを保持する。`pitchbook-completion-cas.test.cjs`で回帰確認。

### 明示的な回復・容量境界

- file保存後のIndex確定失敗はPendingを保持できる。同じfileをreservationから再利用する。linkだけの失敗はLINK_ONLYで回復する。
- prepareの同一requestIdはfresh parent CASで再取得できる。actor fallbackの`UNIDENTIFIED`を理由に通常操作を止めない。
- prepare intentは最大32件保持、1件8,000 bytesまで。上限到達でfail-closedとし、自動GCをしない。**無制限のproduction運用を保証しない。** 恒久的なretention/運用回復はFOLLOW_UPであり、本dispatchでは履歴削除を実行しない。
- 最初のMeeting登録応答が完全に失われ、まだMeeting_IDを取得できていない場合、clientは自動再登録を停止する。管理者による保存結果の照合が必要。同じ親を盲目的に再作成しないが、このケースの自動回復は未実装。

## Validation

LOGIC_VALIDATION: PASS
BUNDLE_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: BLOCKED / BUSINESS_FLOWS_NOT_RUN
READY: NO

| Gate | 結果 | 範囲 |
|---|---|---|
| focused + source回帰 | 485/485 PASS | bundle/installerを除くsource tests。新規契約と既存Work 0027/0029を含む |
| `npm run check` | 512/512 PASS / exit 0 | agent foundation、syntax、temporal、public facade、bundle整合、全test |
| `npm run check:bundle` | 27/27 PASS / exit 0 | canonical check後に実行。source/bundle facade・挙動・installer・hash parity |
| diff hygiene | PASS | `git diff --check` |
| local browser | PASS / SYNTHETIC_RENDER_ONLY | production HTML/clientをChromeで操作。1366×900・390×844、page/console error 0 |

生成bundleは60 server source / 22 embedded HTML、schema 7、1,159,310 bytes。
`bundle_file_sha256`: `26dd8ed431f393ca93c0c9fa21a729c55f44976f7a1269fbd69f2c63d9219c3e`。
manifestのsource commitと凍結sourceは一致する。generated distの手編集なし。

### 操作デモ・screenshots

[操作手順・検証範囲](0028-CODEX-12-ui-evidence/README.md)、[機械可読証跡](0028-CODEX-12-ui-evidence/validation.json)。

`node tests/production-ui-browser.cjs`でproduction includeを展開し、通信境界だけにsynthetic fixtureを渡す。non-GP登録→親確定後の資料RPC、過去記録→詳細→分類編集、質問空欄/model未設定→独立全文出力、7 navigationを操作した。frontend-testing-debugging skillに従いrendered UIとconsoleを確認した。Apps Script／Drive／Docsの実機証明ではない。

- [登録](0028-CODEX-12-ui-evidence/01-registration.png)
- [過去記録・詳細・分類](0028-CODEX-12-ui-evidence/02-past-detail-classification.png)
- [独立全文出力](0028-CODEX-12-ui-evidence/03-independent-full-output.png)
- [390px](0028-CODEX-12-ui-evidence/04-narrow-390.png)

初回local renderはfixture facade名不一致で停止し、fixtureだけを修正して再実行。最終画像とvalidationは上記凍結production sourceから取得し、親agentも画像を目視確認した。local修正をApps Scriptのlive retryとして数えていない。

## Runtime / side effects

SIDE_EFFECT_STATE: remote source push 0、version作成0、deployment mutation 0/1、runtime business write 0、provider call 0、秘密情報変更0。

deterministicとbundle gateを通過後、既存認証でread-only preflightを1回実行した。principal/project/deployment inventoryのAPI読取は成功し、private snapshotをGit管理外に保持した。

| Identity要素 | 観測 |
|---|---|
| Git → tested local source | PASS / 上記exact commit |
| project mapping → authenticated creator | PASS / API metadataの一致。ID・accountは非掲載 |
| current deployment inventory | READ PASS。WEB_APPが3件（HEAD、version 27、version 75） |
| version 75 entrypoint | 保存済metadataで一意のWEB_APP + `/exec`、`MYSELF` / `USER_DEPLOYING`を確認 |
| remote saved source / immutable source parity | NOT RUN |
| browser account / observed execution | NOT RUN |

**停止原因はApps Scriptの不具合ではなく、local preflightの選択条件が「全WEB_APPが1件」を要求したこと（AUTOMATION_LIMITATION）。** HEADと旧versionを含めて3件だったため`WEB_APP_TARGET_AMBIGUOUS`で停止した。既取得metadataのread-only再確認ではversion 75の候補は一意だったので、実targetそのものが曖昧と断定しない。ただし指定のstop-on-first-failureを適用し、同dispatchでのremote再試行・source同期・version/deployment操作へ進んでいない。

GP/non-GP Meeting+file、既存Meetingへの追加、unlink/relink、実Docs本文before/after、実source/citation、実全文出力preview/readbackは全てNOT RUN。local PASSからruntime PASSへ昇格しない。Geminiは有効化せず、既存OpenAI設定を読み出して検証を開始する段階にも到達していない。

## 残件

BLOCKER: RUNTIME_IDENTITY_CHAIN_INCOMPLETE / AUTOMATION_LIMITATION。必須のtarget-runtime acceptanceが未実施。Work 0028は未完了、Draft PRはmerge/rollout可能との宣言ではない。
FOLLOW_UP: prepare intent容量/retentionとMeeting初回応答不明時の運用回復、accepted Lightの細部polish、過去記録一覧のGP列見出し等の用語整合、受領のみ記録の業務扱い、代表的大容量資料、company rollout。
OPTIONAL: NONE

### ChatGPTへの次工程

1. Draft PRのsource/証拠をreviewする。sourceは凍結し、既存のschema/data/secret/provider policyは変えない。
2. 次のbounded dispatchでは既取得inventoryと最新metadataを照合し、HEAD・旧版を候補外とする正しい選択条件でversion 75のtarget continuityを固定する。version/descriptionだけを独立identity証明の代わりにしない。
3. remote saved source・immutable source・browser account・既存実行を照合して残りのidentity chainを完了する。
4. 必要なsource同期・append-only setup・version/deploymentを明示的な1回budgetで行い、synthetic primary flowを実行する。既存WEB_APP + `/exec`のpositive proofなしに更新せず、最初の失敗で止める。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: NONE

local論理検証とtarget-runtime qualification、target identityとsource parityを別gateとして適用した。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-12
BALL: CHATGPT
STATUS: RETURNED
