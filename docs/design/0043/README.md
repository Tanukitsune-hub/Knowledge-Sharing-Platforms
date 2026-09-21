# Work 0043 — approved theme reference

Work0042でacceptedになったlayout / component hierarchy / behaviorは変更しない。
このdirectoryは、ユーザー承認済みの配色だけを再現するためのreference。

## Approved theme

Right pane:
- cool gray-blue
- understated institutional / financial-professional tone
- no warm ivory/champagne cast
- no bright consumer SaaS blue

Sidebar:
- dark navy background
- existing gold typography / icons / ornament remains
- active navigation item uses restrained deep red
- desktop sidebar height must match browser viewport

## Files

- `theme-reference.css`: exact palette tokens and mapping target
- `theme-reference.html`: static palette fixture

## Critical boundary

Production implementation should be CSS-only whenever possible.

Allowed production source:
- `src/Styles.html`

Generated distribution / tests / evidence may change as required.

Do NOT change:
- page DOM structure
- page layout/grid geometry
- navigation IA
- JS behavior
- Apps Script services
- schemas / data semantics
- tabs / drag reorder / delete-restore / terminology established by Work0042

If implementing the approved theme requires non-CSS production changes, STOP and return to ChatGPT instead of broadening scope.
