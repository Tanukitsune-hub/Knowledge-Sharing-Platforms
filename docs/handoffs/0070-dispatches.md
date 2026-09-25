# Work 0070 dispatch control

WORK_ID: 0070
ACTIVE_DISPATCH_ID: 0070-CODEX-03
BALL: USER
STATUS: ACTION_REQUIRED
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH
PHASE: TARGET_RUNTIME_QUALIFICATION

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
| 0070-CODEX-03 | isolated target-runtime migration / persistence / browser / concurrency qualification | QUALIFICATION | USER | ACTION_REQUIRED | `docs/handoffs/0070-CODEX-03-target-runtime-qualification-instruction.md` | `docs/handoffs/0070-CODEX-03-target-runtime-qualification-report.md`（中間checkpoint） / Draft PR #103 | — |

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

## CODEX-03 native action checkpoint

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

