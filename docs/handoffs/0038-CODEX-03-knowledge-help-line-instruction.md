# CODEX-03 — Knowledge Search help-line consolidation

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-03
BALL: CODEX
STATUS: READY
MODE: BUILD

## Context

CODEX-01/02 completed Work0038 geometry and Meeting header refinement on the same Draft PR #60. Before merge, one final Knowledge Search presentation refinement is required.

```text
PR: #60 / Draft / unmerged
CURRENT_BRANCH_HEAD_REPORTED: 3ffc672751497834d53427cbaf4df7a41bc9063e
CURRENT_SERVED_VERSION_REPORTED: 17
CODEX-02: RETURNED
```

Preserve all CODEX-01/02 accepted evidence within scope.

## Authoritative sources

Read latest `origin/main`, root/nearest `AGENTS.md`, then:
- `docs/handoffs/0038-ui-refinement-requirements.md`
- `docs/handoffs/0038-dispatches.md`
- `docs/planning/work0038-ui-refinement.md`

## Primary Outcome

Under `AI検索 指示入力欄`, render the mode help and Team/source help as one continuous inline help line on desktop.

## Exact change

Current DOM has:
- `#knowledge-mode-help` as a div inside `.knowledge-instruction-field`
- `#knowledge-source-help` as a separate paragraph below that field

This creates two visual rows.

Change the presentation so both messages share one inline help container immediately under the textarea.

For default `要約` mode, visible text must read continuously as:

`表示された質問は読み取り専用です。選択した条件の資料を横断して整理します。 Teamは「面談記録のみ」で利用できます。`

Rules:
- no explicit line break between the two messages
- no separate block-level second row on desktop
- preserve dynamic `knowledge-mode-help` text for other modes
- preserve exact source sentence `Teamは「面談記録のみ」で利用できます。`
- desktop >=721px: one visual line at 2560 / 1440 / 1280 where space permits
- mobile <=720px: natural wrapping allowed; no horizontal overflow
- do not shrink font below existing hint typography merely to force mobile one-line rendering

Implementation can use one parent flex/inline container with two spans/nodes, or equivalent. Avoid duplicated text.

## Preserve

- Knowledge Row3 mode/model/non-AI geometry
- default mode `要約`
- AI search behavior
- non-AI Full Output
- hidden filter behavior
- Meeting-create CODEX-01/02 changes
- all backend/provider/security behavior

## Validation

Focused tests:
- mode-help and source-help share one visual container / no block separation
- exact default two-sentence text
- dynamic mode help still changes
- source sentence remains present exactly once
- desktop 2560/1440/1280 one-line rendered help
- 390px safe wrap / overflow0

Run:
- focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

Target runtime: same existing owner-only Web App. Minimal qualification:
- Knowledge Search 2560 / 1440 / 1280 / 390
- default `要約` help text
- no explicit 2-row separation desktop
- all 7 pages nonblank smoke
- console material error/warn0

Provider calls 0. No record/file mutation.

## Git delivery

Continue SAME branch / SAME Draft PR #60.
Do not create a new PR. Do not merge.

Report:
`docs/handoffs/0038-CODEX-03-knowledge-help-line-report.md`

## Return

```text
WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
```