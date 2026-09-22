# Work 0050 CODEX-01 — Theme Color Tool / stacked batch entry

WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

管理者ページ > テーマ設定に、色を視覚的に探し、HEX / RGBを確認・コピーし、選択したTheme tokenへ適用してexisting live preview/save flowへつなげるColor Toolを追加する。

## This run may continue through Work0053

Work0050 acceptance evidenceをrepository-levelで満たしたら、同じCodex run内で以下へ順番に進んでよい。

- Work0051 / Dispatch 0051-CODEX-01
- Work0052 / Dispatch 0052-CODEX-01
- Work0053 / Dispatch 0053-CODEX-01

Authoritative batch plan:
- `docs/planning/work0050-0053-overnight-stack.md`

各Work IDは独立維持し、各Stageで別branch / 別Draft PR / 別report / 別dispatches.mdを作る。
一つのWorkへ統合しない。

## Read first

Work0050:
- `docs/handoffs/0050-theme-color-tool-requirements.md`
- `docs/planning/work0050-theme-color-tool.md`
- `docs/handoffs/0049-completion-report.md`

Batch:
- `docs/planning/work0050-0053-overnight-stack.md`

Later stages:
- Work0051 / 0052 / 0053固有requirements / plans
- `docs/design/ui-japanese-copy-guidelines.md`
- `docs/design/product-brand.md`

## Recommended model

GPT-5.6 Sol High。

理由:
Work0050はcolor conversion / pointer UI / accessibility / existing Theme draft state integration、Work0051はDrive + trigger safety、Work0052はcitation integrity、Work0053は横断copy reviewを含むため。

## Work0050 required behavior

- large saturation/value picker
- horizontal hue slider
- current swatch
- HEX direct input / display
- RGB display
- HEX copy
- 16 Theme token target select
- `この色を適用`
- existing Theme draft / live previewへ反映
- direct 16-row editingとの双方向同期
- Saveまでserver persist 0
- Discard / Resetとの同期
- optional Eyedropper progressive enhancement
- no heavy third-party dependency
- keyboard / 1440 / 390 accessibility

## Hard safety boundary for the combined run

The stacked Work0050–0053 run is implementation + deterministic verification only.

Do NOT:
- merge any PR
- mark any Work ACCEPTED
- apply Completion Latch
- Apps Script source sync
- create immutable version
- update/create deployment
- create real Backup folder/file
- create real trigger
- trash real backup/file
- call AI provider
- mutate real Meeting/Pitchbook/Master business data
- change permissions/access

```text
MERGE: 0
LIVE_DEPLOY: 0
REAL_DRIVE_BACKUP_MUTATION: 0
REAL_TRIGGER_MUTATION: 0
PROVIDER_CALLS: 0
REAL_BUSINESS_DATA_MUTATION: 0
PERMISSION_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```

## Stage gate

After each Work:
- focused tests PASS
- npm run check PASS
- bundle regeneration
- npm run check:bundle PASS
- git diff --check PASS
- required deterministic browser tests PASS
- scope boundary PASS

Only then proceed to the next Work.

On first material blocker:
- stop
- preserve completed earlier Draft PRs
- do not start later Work
- return BLOCKED to CHATGPT with cheapest decisive next action

## Stacked branch / PR model

```text
main (Work0049 accepted)
  <- codex/0050-theme-color-tool
       <- codex/0051-backend-daily-backup
            <- codex/0052-missing-source-graceful-failure
                 <- codex/0053-japanese-copy-brand
```

PR bases must match the stack.

Final return must list for each Work:
- Work ID / Dispatch ID
- branch
- Draft PR
- head SHA
- changed production files
- tests
- bundle
- deterministic browser evidence
- side effects
- live mutation count
- blocker
- READY_FOR_CHATGPT_FINAL_REVIEW

Final BALL: CHATGPT.

WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-01
BALL: CODEX
STATUS: READY
