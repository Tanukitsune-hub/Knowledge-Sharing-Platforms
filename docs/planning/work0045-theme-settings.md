# Work 0045 — shared runtime theme settings plan

WORK_ID: 0045
STATUS: ACTIVE
MODE: BUILD
PHASE: READY_FOR_CODEX
BALL: CODEX
ACTIVE_DISPATCH: 0045-CODEX-01

## Primary Outcome

Work0044 accepted paletteをdefaultとして固定し、管理者が16色をlive preview / shared save / discard / resetできるtheme settings機能を追加する。

## Fastest Safe Decisive Action

1. latest main / Work0044 completionをbaseline確認。
2. theme-palette registryの16 basic tokensをsource constants化。
3. current Work0044 CSSをsemantic custom propertiesへrefactorし、default computed value不変をtest。
4. Script Properties shared storage moduleを追加。
5. server-side initial theme injectionをIndex / standalone Knowledge routeへ追加。
6. 管理者3rd tab + 16 fields + preview/save/discard/reset + contrast warningを追加。
7. unit/integration/browser tests。
8. canonical bundle regenerate。
9. same owner-only targetへ1回deploy。
10. exact-default save→fresh reload→reset→fresh reloadでshared persistence qualification。
11. final property absent / version25 appearance retainedを確認。

## Expected implementation areas

Likely production files:
- `src/166_ThemeSettings.gs` (new)
- `src/90_WebApp.gs`
- `src/Styles.html`
- `src/AiProviderSettingsPage.html`
- `src/ClientAiProviderSettings.html`
- `src/ClientThemeSettings.html` (new)
- `src/Index.html`
- `src/KnowledgeSearch.html` or equivalent standalone route template
- distribution manifest/order only if repository convention requires

Do not treat this list as permission to refactor unrelated code.

## Evidence hierarchy

1. actual version26 owner-only runtime
2. Script Properties save/read/reset evidence
3. initial-render computed theme evidence
4. deterministic browser tests
5. unit/static tests

## Deployment budget

```text
SOURCE_SYNC: <=1
IMMUTABLE_VERSION: <=1
EXISTING_DEPLOYMENT_UPDATE: <=1
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
EXPECTED_FINAL_SERVED_VERSION: 26
ACCESS_CHANGE: 0
```

## Strategy Reset

Reset / return to ChatGPT if:
- exact Work0044 default cannot be preserved
- theme requires arbitrary CSS persistence
- a new Sheet/schema becomes necessary
- multi-user permission broadening becomes necessary
- existing admin/AI provider behavior must be materially redesigned
- deployment budget is exhausted without decisive evidence
