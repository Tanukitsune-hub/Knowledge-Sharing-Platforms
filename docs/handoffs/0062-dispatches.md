# Work 0062 dispatch control

WORK_ID: 0062
DISPATCH_ID: 0062-CODEX-01
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: COMPLETE

## Primary Outcome

面談登録・面談編集のrequired field errorを、利用者が修正箇所を即座に理解できるfield-level validationへ改善する。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0062-field-validation-requirements.md`
- accepted main including Work0060 / Work0061

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従う。

registration / editのclient validation presentationのみ。required policy、server validation、schema、API、deploymentは変更しない。

## Required Validation

TIER_2_STANDARD。

- focused field-validation tests
- relevant browser: registration + past-record edit、desktop + 390px
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- provider call / target-runtime deployment不要

## Delivery

branch: `work/0062-field-validation`
Draft PRを使用。
report: `docs/handoffs/0062-CODEX-01-field-validation-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0062-CODEX-02
WORK_0062_COMPLETE: YES
COMPLETION_LATCH: APPLIED
```

WORK_ID: 0062
DISPATCH_ID: 0062-CODEX-01
BALL: CHATGPT
STATUS: RETURNED

CODEX-01は実装・local validation結果を`0062-CODEX-01-field-validation-report.md`に記録して返却した。ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

## ChatGPT final review

- PR #94 implementation diff / report / focused browser evidenceをreview: PASS。
- registration / editの現行required 3項目だけを対象に、field-level error、`aria-invalid`、`aria-describedby`、first-invalid focusを追加。
- invalid submitではserver RPCへ進まず、入力値とWork0060 dirty snapshotを維持する。
- field修正時は当該errorのみ解除し、全required error解消時は短いsummaryを消す。
- Quick Addで面談先を選択した場合もfield errorを解除する。
- server-side validation、payload contract、`expectedVersion`、save後snapshot更新を維持。
- 既存testの変更は、旧一括error文言の期待値更新と新helper読込のharness追随に限定され、assertionの弱体化ではない。
- focused 17/17、registration/edit 1440/390 synthetic browser、bundle 30/30、canonical最終684/684を受入れ。
- canonicalは計3回だが、前2回は新しい意図的UI contractへ旧test/harnessが追随していないことを特定して修正したもの。最終pass後に追加反復する理由なし。
- provider call / deployment / business-data mutation 0。TIER_2_STANDARDとしてtarget runtime deployは不要。Work0065へ集約する。
- BLOCKER: NONE。

Completion: `docs/handoffs/0062-completion-report.md`

WORK_ID: 0062
DISPATCH_ID: 0062-CODEX-01
BALL: NONE
STATUS: ACCEPTED
