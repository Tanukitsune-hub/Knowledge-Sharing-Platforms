# Work 0061 dispatch control

WORK_ID: 0061
DISPATCH_ID: 0061-CODEX-01
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: COMPLETE

## Primary Outcome

Knowledge SearchとEntity Workspaceで、current input / selected entityと表示resultのidentityを一致させ、古いresponseをcurrent resultとして見せない。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0061-result-freshness-requirements.md`
- accepted main including Work0060

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従う。

client-side request identity / stale-result presentationのみ。provider logic / schema / API / deployment変更なし。

## Required Validation

TIER_2_STANDARD。

- focused async / stale / race tests
- relevant browser: Knowledge Search + Entity Workspace desktop + 390px
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- provider call / target-runtime deployment不要

## Delivery

branch: `work/0061-result-freshness`
Draft PRを使用。
report: `docs/handoffs/0061-CODEX-01-result-freshness-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0061-CODEX-02
WORK_0061_COMPLETE: YES
COMPLETION_LATCH: APPLIED
```

WORK_ID: 0061
DISPATCH_ID: 0061-CODEX-01
BALL: CHATGPT
STATUS: RETURNED

CODEX-01は実装・local validation結果を`0061-CODEX-01-result-freshness-report.md`に記録して返却した。ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

## ChatGPT final review

- PR #93 implementation diff / report / focused async-race evidenceをreview: PASS。
- Knowledge Searchのquery identityへ質問本文を含むhash fingerprintを追加し、raw question textはsessionStorageへ保存しない設計を受入れ。
- request sequence + current payload fingerprintでstart response / poll responseを照合し、条件変更後の遅延responseをcurrent resultとして描画しない。
- query-defining input変更時はpending stateと旧resultを無効化し、resumeもcurrent fingerprint一致時のみ継続する。
- Entity Workspaceはentity切替開始時に旧content / printをhideし、request sequence + selected entity keyでresponse identityを確認する。
- Fund / Strategy切替でも旧drillを消し、遅延responseの上書きを防止する。
- provider server logic / prompt / retrieval / schema / API contractは未変更。
- focused 20/20、Knowledge Search + Entity Workspace 1440/390 synthetic browser、bundle 30/30、canonical 681/681を受入れ。
- provider call / deployment / business-data mutation 0。TIER_2_STANDARDとしてtarget runtime deployは不要。Work0065へ集約する。
- BLOCKER: NONE。

Completion: `docs/handoffs/0061-completion-report.md`

WORK_ID: 0061
DISPATCH_ID: 0061-CODEX-01
BALL: NONE
STATUS: ACCEPTED
