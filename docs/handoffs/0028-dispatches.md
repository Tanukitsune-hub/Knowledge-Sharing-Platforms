# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
ACTIVE_DISPATCH_ID: 0028-CODEX-23
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B2 / EVIDENCE-LED TEMPORAL RECOVERY / AUTONOMOUS COMPLETION

## 現在地

PR #50のLight designはaccepted/merged。PR #51はDraft/未merge。

```text
CODEX22_RETURN_HEAD: 7c18e6dc5184209882c807db08365bd12007f0bc
BRANCH: codex/0028-production-contract-build
CURRENT_SERVED_VERSION: 3
CURRENT_VERSION_QUALIFICATION: KNOWN_DEFECT / NOT_QUALIFIED
R1: PASS_VERSION2
R2: PASS_VERSION2 / GP_AND_NON_GP_PARENT_FIRST
R3: PASS_VERSION2 / INITIAL_ATTACHMENT
R4_R5_R7: NOT_RUN
R6: PARTIAL / INITIAL_RELATION_ADD_PRESERVATION_PASS
R8: PARTIAL / RESTRICTED_METADATA_CONFIRMED
TEMPORAL_READBACK: FAIL / RECURRED_AFTER_ONE_REPAIR
CANONICAL: 523/523 PASS / LOGIC_ONLY
BUNDLE: 30/30 PASS / LOGIC_ONLY
ORIGINAL_DATE_TIME_AND_DOCS: UNCHANGED_AT_CODEX22_STOP
PROVIDER_CALLS: 0
AI_SYNC: DISABLED
READY: NO
```

CODEX-22は旧契約のsame failure class連続2回で停止。初回観測と1回の修正後再発を数えた結果、使用cycleは1/3。停止判断と実機証拠は受理するが、日時修正やversion3は受入しない。

Controller review / Strategy Reset:
`docs/handoffs/0028-CODEX-22-controller-review.md`

## Accepted Evidence / Closed Conclusions

反証がない限り維持する。

- Light-onlyのaccepted UI方向、provider-independent production contract。
- installer identity scope、安全なoutcome log、pre/post-deployment stage分離。
- installer/I2 PASS・duplicate0、schema7・Backend exactly5。
- single restricted WEB_APP / USER_DEPLOYING / MYSELF。
- CODEX-21のversioned UI confirmation READY/NONEと独立attestation MATCH。editor-context STALEをproduction readinessの証拠に混ぜない。
- CODEX-22のversion2上で作成したGP/non-GP親各1件、initial tiny fileとparent relation。
- 初回relation追加前後のDocs body/tab content・Date/Time・無関係business fields不変。
- AI disabled、provider0、historical75 scope外、Work0030 deferred。

部分PASSにはversion/refを付けて保持する。final candidateで変更影響のあるreadbackは再検証する。既存親や初回添付を重複作成して全試験を始め直さない。

## Primary Outcome / Active Hypothesis

accepted Light UI + production contractを既存isolated targetでend-to-end成立させ、ユーザー実機確認へ渡せる状態にする。

Active Hypothesisは保存値→adapter→canonical/mapping→browser表示の経路でBusiness Date/Timeが誤解釈されていること。原因箇所は未確定。workbook timezoneだけの変換修正は実機で解消しなかった。

最初に実際のfixture値・型と変換前後を調べ、最初の不一致を特定する。固定offset補正や元データ/timezoneの変更は指示しない。診断方法・最小修正・検証順序はCodexへ委譲する。

## Active instruction / Autonomous authority

`docs/handoffs/0028-CODEX-23-temporal-recovery-autonomous-completion-instruction.md`

同一PR / 同一target / 同一single deployment内で、日時修復から残りR1-R8まで自律継続する。通常のbug/test failure/runtime mismatchごとに返却しない。

```text
MODE: BUILD
ADDITIONAL_REPAIR_RUNTIME_CYCLES: MAX_3
SOURCE_SYNCS: MAX_4 / INCLUDES_OPTIONAL_DIAGNOSTIC_SYNC_1
NEW_IMMUTABLE_VERSIONS: MAX_3
SAME_DEPLOYMENT_VERSION_UPDATES: MAX_3
NEW_TARGETS: 0
SECOND_PARALLEL_DEPLOYMENTS: 0
```

初回観測はrepair失敗回数に含めない。修正後再発時は影響matrixを停止し、同run内でStrategy Resetする。新たな直接証拠を得て次cycleへ進む。同一問題への修正後実機検証が2cycles連続不合格、または3cyclesで未達なら返却する。これはCODEX-23からの規則であり過去の停止を変更しない。

データ破損/証拠汚染、target identity不明、安全な実行手段不在、scope・権限・費用・architecture変更が必要なら返却。ユーザーnative操作が必要なら同DispatchでUSER/ACTION_REQUIRED。tool policyを迂回しない。

## 変更・データ境界

元の2件のDate/Time・business fields・Docs baselineを保持。source修復は通常commitでレビュー可能にし、失敗修正の置換/局所revertも根拠があれば許可する。git reset/force push、main merge/rebase、control docs上書きは禁止。

```text
REAL_CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
DESTRUCTIVE_MIGRATION: 0
BROAD_OR_COMPANY_ROLLOUT: 0
HISTORICAL_VERSION75_MUTATION: 0
DIRECT_OPENAI_CALLS: 0
GEMINI_CALLS: 0
AZURE_OPENAI_CALLS: 0
AI_SYNC: DISABLED
WORK_0030: DEFERRED_BY_USER
```

private URL/ID/account/hash値・秘密はGitHub/chatへ保存しない。既存synthetic証拠を保持し、新しいfixtureは残matrixに必要な最小限にする。

## Dispatch history

| Dispatch | Disposition |
|---|---|
| 0028-CODEX-01 / 02 | historical tombstone; never reuse |
| 0028-CODEX-03..09 | Light design iterations |
| 0028-CODEX-10 | PR #47/#48/#49 consumed history |
| 0028-CODEX-11 | PR #50 accepted/merged Light baseline |
| 0028-CODEX-12 | PR #51 production BUILD / deterministic PASS / runtime incomplete |
| 0028-CODEX-13 | prepare lifecycle blocker CLOSED / Execution API 403 |
| 0028-CODEX-14 | saved source parity / standalone mismatch |
| 0028-CODEX-15 | historical standalone strategy superseded |
| 0028-CODEX-16 | interrupted / no durable return |
| 0028-CODEX-17 | recovery + fresh target + initial identity-gate failure / stop accepted |
| 0028-CODEX-18 | identity scope repair + resources established / accepted evidence |
| 0028-CODEX-19 | stage repair + I2 PASS + version1 / editor-context mismatch |
| 0028-CODEX-20 | browser tooling limitation / stop accepted |
| 0028-CODEX-21 | operator surface + versioned attestation MATCH / accepted evidence |
| 0028-CODEX-22 | version2 R1/R2/R3 PASS / temporal修正後version3で再発 / stop accepted・修正未受入 |
| 0028-CODEX-23 | 実測優先の日時修復と残R1-R8自律完了 / READY |

## Completion gate

日時の実機一致、データ保全、最終source/versionに紐づく必要十分なR1-R8証拠、logic tests、BLOCKER NONEが必要。source非影響の受入証拠は根拠付きで継承し、未実行をPASSにしない。

Codexはreportとユーザー実機確認の導線を準備してPR #51をDraft/未mergeで返す。ChatGPTが最終diff/evidence確認、PR収束・merge、Completion Latchを行う。受入後は開発を停止しユーザー実機確認へ。Work0030は自動開始しない。

```text
ACTIVE_BLOCKER: REPEATED_TEMPORAL_READBACK_MISMATCH_AND_REMAINING_R1_R8
NEXT_UNUSED_DISPATCH: 0028-CODEX-24
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
BALL: CODEX
STATUS: READY
