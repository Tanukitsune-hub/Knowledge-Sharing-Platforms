# Work 0043 — palette refinement plan

WORK_ID: 0043
STATUS: ACCEPTED
MODE: BUILD
PHASE: COMPLETE
BALL: NONE
ACTIVE_DISPATCH: NONE

## Primary Outcome

Work0042 version23のlayout / behaviorを完全にfreezeし、CSS paletteとdesktop sidebar viewport-heightだけを変更する。

## Fastest Safe Decisive Action

1. latest main / Work0042 accepted baselineを確認。
2. `docs/design/0043/theme-reference.css`のtokensをproduction Work0042 right-pane tokensへmapping。
3. sidebar backgroundをdark navyへ変更し、gold content/ornamentをpreserve。
4. active navだけred accentへ変更。
5. desktop sidebar heightのcomputed mismatchだけをCSSで修正。
6. CSS diff scopeをreviewし、layout property drift 0を確認。
7. focused visual/static tests + full checks。
8. same existing owner-only Web Appへ1回だけdeploy。
9. 7 pages / dynamic representative states / 4 viewportをqualification。

## Production change boundary

Expected production source:
- `src/Styles.html`

Other production source modificationは禁止。

## Visual reference

- `docs/design/0043/theme-reference.css`
- `docs/design/0043/theme-reference.html`
- `docs/design/0043/README.md`

## Evidence hierarchy

1. actual owner-only runtime screenshots / computed styles
2. CSS diff scope review
3. browser layout geometry regression
4. deterministic tests

## Completion Gate

- blue-gray right pane PASS
- dark navy + gold sidebar PASS
- red active nav PASS
- sidebar viewport-height PASS
- Work0042 layout/function regression 0
- full tests / bundle PASS
- BLOCKER NONE
