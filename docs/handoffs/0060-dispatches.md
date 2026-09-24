# Work 0060 dispatch control

WORK_ID: 0060
DISPATCH_ID: 0060-CODEX-01
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: COMPLETE

## Primary Outcome

過去の記録の面談編集で、未保存入力の意図しない破棄と編集対象の取り違えを防ぐ。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0060-unsaved-edit-protection-requirements.md`
- accepted main

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従い、本handoffへ再掲しない。

production source変更はこのWork範囲内で可。runtime resource / provider / deployment / schema変更は不可。

## Required Validation

TIER_2_STANDARD。

- focused dirty-state / destructive-transition tests
- relevant browser: 過去の記録 desktop + 390px
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- 他画面・過去Work全件・target runtime deployはDecision-Impact理由がない限り不要

## Delivery

branch: `work/0060-unsaved-edit-protection`
Draft PRを使用。
report: `docs/handoffs/0060-CODEX-01-unsaved-edit-protection-report.md`

CODEX-01は実装・local validation結果を`0060-CODEX-01-unsaved-edit-protection-report.md`に記録して返却した。ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0060-CODEX-02
WORK_0060_COMPLETE: YES
COMPLETION_LATCH: APPLIED
```

WORK_ID: 0060
DISPATCH_ID: 0060-CODEX-01
BALL: CHATGPT
STATUS: RETURNED

## ChatGPT final review

- PR #92 implementation diff / report / focused evidenceをreview: PASS。
- dirty判定はuser-editable meeting edit fields・MTG種別・follow-up stateの初期snapshot比較に限定されている。
- confirmは実際に編集stateを破棄する操作へ限定され、page navigationおよび同一recordのdirty editor再表示では発火しない。
- cancel時は入力・edit identity・detail selectionを維持し、confirm後のみreset / record switchを行う。
- 保存成功後にserver返却versionを採用し、現在formを新snapshotとして更新するため、保存直後の不要confirmを防ぐ。
- Meeting ID / 面談先 / 日付 / 更新番号を編集contextとして表示。
- existing expectedVersion / related-material contractを維持。
- focused 13/13、1440/390 synthetic browser、bundle 30/30、canonical 674/674を受入れ。
- 初回canonicalのstale bundle停止はgenerated bundle再生成で解消済み。追加の再検証理由なし。
- TIER_2_STANDARDとしてtarget runtime deployは不要。Work0065へ集約する。
- BLOCKER: NONE。

Completion: `docs/handoffs/0060-completion-report.md`

WORK_ID: 0060
DISPATCH_ID: 0060-CODEX-01
BALL: NONE
STATUS: ACCEPTED
