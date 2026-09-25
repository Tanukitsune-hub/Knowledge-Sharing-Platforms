# Work 0070 dispatch control

WORK_ID: 0070
ACTIVE_DISPATCH_ID: 0070-CODEX-03
BALL: CHATGPT
STATUS: REVIEW
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH
PHASE: FINAL_REVIEW

## Primary Outcome

API providerなしで、`面談メモ / 保存資料 / ニュース / 評価（ICメモ、社内整理等）` の4-source authoritative record layerをschema9 / 7-sheet / team-use前提で完成させる。

## Closed Conclusions

- Work0069 planningはACCEPTED。Closed Decisionsを重大な反証なく再設計しない。
- Work0070はcurrent 5-sheet AGENTS baselineをschema9 / 7-sheetへsupersedeするtask-specific exceptionを持つ。
- product titleは `Alternative Assets Intelligence`。
- authoritative Drive rootは `記録・資料`、direct childrenは `面談記録 / 保存資料 / ニュース / 評価（ICメモ、社内整理等）`。
- News ID = `NEWS-`、Assessment ID = `ASMT-`。
- News / AssessmentはDIRECT_TEXTまたはUPLOAD_FILEのexactly one authoritative content route。
- multi-Entityはcanonical `Counterparty_IDs` listで保持し、sourceをEntityごとに複製しない。
- 24h silent draft restoreは廃止するが、retry / unknown-outcome / partial-upload safety stateは維持する。
- Work0070はprovider / Full Output / Digestを実装しない。

## Dispatch Table

| Dispatch ID | Purpose | Mode | Ball | Status | Instruction | Report | Supersedes |
|---|---|---|---|---|---|---|---|
| 0070-CODEX-01 | production source実装 + deterministic validation | BUILD | CHATGPT | RETURNED | `docs/handoffs/0070-CODEX-01-record-source-expansion-instruction.md` | `docs/handoffs/0070-CODEX-01-record-source-expansion-report.md` / Draft PR #103 | — |
| 0070-CODEX-02 | ChatGPT source review findingsの限定修正 | BUILD | CHATGPT | RETURNED | `docs/handoffs/0070-CODEX-02-source-review-repair-instruction.md` | `docs/handoffs/0070-CODEX-02-source-review-repair-report.md` / Draft PR #103 | — |
| 0070-CODEX-03 | isolated target-runtime migration / persistence / browser / concurrency qualification | QUALIFICATION | CHATGPT | RETURNED | `docs/handoffs/0070-CODEX-03-target-runtime-qualification-instruction.md` | `docs/handoffs/0070-CODEX-03-target-runtime-qualification-report.md` / Draft PR #103 | — |

## CODEX-01 ChatGPT review

Draft PR #103をreview。実装の大枠・schema9/4-source構造・concurrency primitivesは次段階へ進められるが、runtime qualification前に修正すべきdeterministic defectを確認した。

BLOCKER_FOR_RUNTIME:

- real server upload-format bootstrapが拡張子をdotなしで返す一方、client accept生成はその値を直接使用し、actual browser acceptが不正になる。synthetic fixtureがdot付き値を返して欠陥をmaskしていた。
- standalone 保存資料でserver-required Asset ClassがUI/client validationでrequiredになっておらず、synthetic fixtureがmissing Asset Classでもsuccessを返してfalse-positiveになっていた。
- News / AssessmentのTitle、News PublisherでUI maxlengthとserver max 255が不一致。
- explicit SOURCE_REQUEST_EXPIREDをunknown outcome扱いし、同じexpired requestIdを保持してretry/global clearを永久blockし得る。
- Work0070で追加したactionable source error codeのsafe public mappingが不足し、normal validation failureがgeneric maintenance errorへ退化する。

CODEX-02で限定修正し、ChatGPT再review後にtarget-runtime qualificationへ進む。

## CODEX-02 Boundary

- PR #103 / same branchを修正する。
- repository source/test/docs/generated artifacts only。
- deployment/runtime/company data/provider mutation = 0。
- target runtimeはまだ実行しない。

## CODEX-02 ChatGPT review

Draft PR #103の5件のsource review repairを再確認し、deterministic sourceとして受入れ。

ACCEPTED_REPAIR_EVIDENCE:

- actual server bootstrapのdotなしextensionからbrowser acceptをdot付き生成し、fixtureもproduction server functionを利用。
- standalone 保存資料はAsset Class required + prepare RPC前validationへ整合。
- News / Assessment Title、News Publisher、Fund / Strategyのclient/server boundaryを整合。
- explicit SOURCE_REQUEST_EXPIREDはknown safe rejectionとしてfresh requestへ回復し、true unknown outcomeはfail-closedを維持。
- new source validation/retry/reference/file errorにsafe public messageを追加。
- focused + synthetic browser + bundle/package + canonical 716/716 PASSを受入れ。

PR #103はcontroller-side main commitsとの履歴divergenceにより現時点でmergeable=false。CODEX-03の最初にnormal mergeでorigin/mainをreconcileし、production source conflictがあればruntime mutation前にSTOPする。

## CODEX-03 Boundary

- MODE: QUALIFICATION。
- exact reconciled PR candidateのみをactual Apps Script / Workspace / Web Appでisolated synthetic qualification。
- company production migration / real users / confidential data / provider call / broad access / physical delete = 0。
- application defectを観測した場合はsource patchせずmatrixを停止し、次Dispatchへ返す。

## CODEX-03 OAuth checkpoint（履歴）

- PR #103はlatest mainとのnormal merge後にmergeable PASS。
- isolated targetへschema8 baseline sourceを1回syncし、remote source identityを確認済み。
- Apps Script実行履歴0、trigger0、versioned deployment0。
- baseline installerはGoogle OAuthの「未確認アプリ」承認画面で実行前に停止。
- schema8 persisted installation、schema9 migration、4-source runtime matrixはまだNOT RUN。
- application defectではなく、本人のnative OAuth承認待ち。
- 承認前に権限scopeを確認し、想定外の権限があれば承認しない。
- 承認後は同じ0070-CODEX-03を再開し、read-only preflightから続行する。

## Completion Gate

CODEX-03 target-runtime evidenceをChatGPTがreviewするまでWork0070はACCEPTEDにしない。

## CODEX-03 baseline実行後のcheckpoint（履歴）

- ユーザーのGoogle OAuth承認後、同じ隔離targetのread-only preflightをPASS。
- schema8 baseline installerは1回実行し`READY_FOR_DEPLOYMENT`。Backend 5シート、schema8、AI sync falseをpersisted readback。
- baseline immutable version 1を作成し、owner-only / execute-as-ownerのWeb App deployment 1件を作成。
- synthetic Counterparty 2件、Meeting 1件を通常Web App flowで作成。Meeting Index / Doc本文 / Auditをreadback。
- 移行前に必要な親付きPitchbookのTXT選択でChrome browser automationのfile chooser取得がtimeout。application defectは観測していない。
- native file selection待ちのため、candidate source sync、schema9 migration、4-source matrixはNOT RUN。
- 0070-CODEX-03は引き続き`BALL: USER / STATUS: ACTION_REQUIRED`。隔離Web Appの保存済みMeeting添付欄で`synthetic-pitchbook.txt`を選択するだけでよく、保存操作はCodexが続行する。
- 最初の選択返信後、隔離`Pitchbook_Index`はrow 0。残っていたWeb Appタブが別deploymentだったため、そのタブは操作せず、owner-only deploymentから正しい隔離タブを開き直した。現在は`過去の記録`の`MTG-000001`詳細で`親記録: MTG-000001`の資料追加欄が待機中。正しいタブでのnative選択を待つ。

## CODEX-03 migration後のcheckpoint（履歴）

- 親付きbaseline Pitchbookを通常Web Appで保存し、Index/File/Meeting relationをreadback。続いて受入れ済みcandidate sourceを同じ隔離Apps Scriptへ1回sync、immutable version 2を作成し、同じowner-only Web App deploymentを1回更新。saved source/version/deployment parityとaccess boundaryをreadback。
- schema8→9 migrationを1回実行。exact 7 Backend sheets、同一IDでのroot/Meeting/Pitchbook folder rename、新News/評価folder、既存Meeting/Pitchbook保持、AI sync falseを確認。
- idempotency setup 1回とcustom-name preservation setup 1回を実施し、resource/record/counterの安定性を確認。custom folder名は同じIDでtest-only復元。
- News/評価のDIRECT_TEXTを通常Web Appで各1件作成。multi-Entity、Past/detail、原本、edit、Inactive→Reactivate、Auditを確認。Version progressionとsource/File ID維持をreadback。
- Add/Pastの4 tab、product title、実際のupload accept、shared/source-specific input分離をbrowserで確認。
- Chrome file chooser automationにより元タブの接続が失われた。standalone TXTは元タブで選択されたが読み取れず、保存操作は未実行。新しい同一隔離Web Appタブでstandaloneフォームの日付とsynthetic面談先を準備し、本人のnative file selectionを待つ。application defectは未観測。
- standalone、News/評価のUPLOAD_FILE、390px、distinct concurrent create、same-record stale edit、残るbrowser state、trigger readbackはNOT RUN。詳細は`0070-CODEX-03-target-runtime-qualification-report.md`。
- `BALL: USER / STATUS: ACTION_REQUIRED`を維持。同じDispatchで再開し、source sync/version/deployment/setupは再実行しない。
- 現在のDraft PR #103は、後着のmain側OAuth checkpoint commitと`0070-dispatches.md`だけでcontent conflict。production source/tests/generated artifactsのconflictは0。normal merge上限1/1を使用済みのため追加mergeは行わず、ChatGPTにreconcile判断を返す。
- 新しい同一隔離Web App tabでstandalone TXT 61 Bを選択。Asset Class未選択ではfield error/focus、Index不変、prepare前returnを確認。PE指定後にActiveのparentなしDOCを1件保存し、synthetic面談先B、実File/保存資料folder、Meeting Version不変、Audit Successをreadback。
- 現在はNews UPLOAD_FILEのsynthetic項目を入力済みで`synthetic-news-upload.txt`のnative選択待ち。続いて評価UPLOAD_FILEを別tabで準備し、この2 createをconcurrency pairとして使用する。source record countは現時点5。
- News UPLOAD_FILEの`synthetic-news-upload.txt`選択名を確認し未保存。独立tabの評価UPLOAD_FILEにsynthetic項目を入力済みで、`synthetic-assessment-upload.txt`のnative選択待ち。2件を同時開始予定。現時点のNews/評価Index各1行、NEXT ID各2、cross-tab input bleedなし。

## CODEX-03 qualification完了とChatGPTへの返却

- ユーザーがNews/評価のsynthetic TXTをそれぞれnative選択。2独立tabから近接同時に1回ずつ保存し、`NEWS-000002`と`ASMT-000002`のActive/UPLOAD_FILE rows、各実File、正しいfolder、Past/detail、各counterの進行をreadback。重複・lost rowなし。source record総数7。
- 同一News Version 4を2独立tabで編集し、Aの更新はVersion 5、Bのstale saveは安全な競合messageで拒否。Index/DocはAのみ、File ID不変。
- 新規session/reloadでは通常draftのsilent restoreなし。4 Add tabの未保存値はglobal `クリア`確認後に全て消去。390px actual viewportでAdd/Past各4 tabのmaterial horizontal overflowなし。material browser console error/warning 0。
- Restricted Auditは代表mutation計17 rows、target対応、Actor分類EMAIL、本文複製なし。AI_SYNC_ENABLED=false、provider/AI indexing call 0。triggerはtest-only daily backup 1件、AI sync 0。
- Isolated target-runtime qualificationはPASS。会社production/secret/provider/billing/physical deleteの変更0。source patchなし、CODEX-02 deterministic 716/716を再実行していない。Work0070は未ACCEPTED、Completion Latch未適用。
- Draft PR #103は後着main commitにより`docs/handoffs/0070-dispatches.md`のみcontent conflict。production source/tests/generated artifactsのconflict 0。normal merge budget 1/1のため追加mergeはせず、ChatGPTのfinal reviewでdocs reconcileとmerge判断を行う。
- `BALL: CHATGPT / STATUS: RETURNED`。詳細は`0070-CODEX-03-target-runtime-qualification-report.md`。



## ChatGPT final review

- CODEX-02 deterministic evidence 716/716 PASSを受入れ済み。
- CODEX-03 isolated target-runtime qualification reportをreviewし、schema8→9 migration、exactly 7 Backend sheets、same-ID folder rename、既存Meeting/Pitchbook保持、standalone保存資料、News/評価のDIRECT_TEXT / UPLOAD_FILE、multi-Entity、edit/lifecycle、actual 390px、concurrent distinct create、stale edit rejection、AuditをPASSとして受入れ。
- qualified production sourceは `06f55ebe7a72a206ac3ea4d171822deef81a6abc` から不変。qualification後のbranch変更はhandoff/report等のdocs-only。
- latest main reconciliation後もproduction source/tests/generated artifact差分に追加変更なし。
- provider call / AI indexing / company production data / confidential data / physical delete / broad access changeは0。
- isolated targetのdaily backup trigger 1件はTEST_ONLY。AI sync triggerは0、`AI_SYNC_ENABLED=false`。
- Work0071のinteraction-stability方針は別Workとして記録済みで、Work0070のAcceptanceを追加・再開しない。
- BLOCKER: NONE。
- PR #103 merge後にCompletion Latchを適用し、registry / completion reportをmainで確定する。

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: TEST_ONLY
READY_FOR_MERGE: YES
BLOCKER: NONE
```
