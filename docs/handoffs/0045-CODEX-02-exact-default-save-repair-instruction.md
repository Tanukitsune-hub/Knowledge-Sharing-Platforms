# Work 0045 CODEX-02 — exact-default first-save repair and persistence closure

WORK_ID: 0045
DISPATCH_ID: 0045-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
STRATEGY_RESET: YES

## Strategy Reset

CODEX-01でPrimary Outcomeの大部分はaccepted evidenceとして取得済み。

Preserve / do not reopen:
- Work0044 exact default fidelity
- admin 3-tab UI
- 16 theme fields
- picker ↔ HEX sync
- live preview
- discard
- invalid HEX protection
- contrast warning
- Script Properties storage implementation
- server-side initial theme injection
- no-flash path
- 7 pages x 4 viewport regression evidence
- console 0
- provider/schema/migration/permission/public exposure 0

Single blocker:
`EXACT_DEFAULT_FIRST_SAVE_DISABLED`

## Root cause confirmed by ChatGPT review

`src/ClientThemeSettings.html` currently treats palette equality as equivalent to “nothing worth saving”:

- `themeSettingsRefreshState()` disables Save when `!dirty`
- `themeSettingsSave()` returns early when draft equals current palette

When no runtime override exists:
- `themeSettingsState.persisted === false`
- draft equals Work0044 default
- storage state still differs: ABSENT → PERSISTED

Therefore exact-default first save must be allowed even when color values are unchanged.

Server-side SAVE already accepts and persists an exact 16-color palette. Do not redesign server storage.

## Primary Outcome

Allow one valid storage-state transition:

```text
persisted=false + draft==default
  -> Save enabled
  -> SAVE RPC
  -> persisted=true
```

After successful save:

```text
persisted=true + draft==saved palette
  -> Save disabled / no-op
```

Existing dirty palette behavior remains unchanged.

## Minimal repair

Expected production change:
- `src/ClientThemeSettings.html` only

Tests / generated bundle / reports may change as required.

Implement equivalent logic:

```text
saveAllowed =
  !busy
  && !invalid
  && (dirty || !themeSettingsState.persisted)
```

Save handler must likewise allow:
- `persisted === false`
- exact same palette

Do not add a fake dirty flag and do not modify palette values to manufacture a change.

Do not change visual design, labels, layout, 16-token definitions, storage schema, Script Property key, derived color math, server injection, access, or reset semantics.

## Focused deterministic evidence

Add focused tests for at least:

1. `persisted:false + exact default + valid` → Save enabled.
2. Same state + Save click → one `mutateThemeSettings({action:'SAVE', palette:<16>})` call.
3. Successful response `persisted:true` → Save disabled again when no color changes.
4. `persisted:true + draft==palette` → Save remains disabled / no duplicate SAVE.
5. invalid HEX still disables Save.
6. dirty preview behavior unchanged.

Then run:
- focused Work0045 tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Runtime qualification — decisive path only

Use same existing owner-only Web App. New bounded deployment budget:

```text
SOURCE_SYNC: <=1
IMMUTABLE_VERSION: <=1
EXISTING_DEPLOYMENT_UPDATE: <=1
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
EXPECTED_FINAL_SERVED_VERSION: 27
ACCESS_CHANGE: 0
```

Do not repeat broad visual exploration. Preserve CODEX-01 accepted visual/viewport evidence unless modified files materially affect it.

Required version27 runtime:

### A. Initial state
- `KSP_THEME_SETTINGS_V1: ABSENT`
- Work0044 exact visible theme
- Save enabled despite exact default values
- no unsaved-preview status merely because Save is enabled

### B. Exact-default shared save
Using normal Theme Settings UI:
- click Save without altering any color
- exactly one SAVE mutation
- resulting `persisted:true`
- property exists as valid schemaVersion1 complete 16-color JSON
- visible colors remain exact Work0044 default
- success status visible

### C. Fresh-load persistence
- fresh normal reload/page load
- initial server bootstrap reports `persisted:true`
- exact same palette is applied before body paint
- no post-paint theme jump
- Save disabled because persisted + unchanged

### D. Reset closure
Using normal UI:
- `既定の配色に戻す`
- property removed
- resulting `persisted:false`
- fresh reload
- exact Work0044 default remains visible

Final state MUST be:

```text
KSP_THEME_SETTINGS_V1: ABSENT
VISIBLE_THEME: WORK0044_DEFAULT
```

### E. Minimal runtime regression
Because production repair is client save-state logic only:
- normal navigation 7/7 nonblank at 1440
- Theme Settings at 1440 and 390
- preview/discard one bounded pass
- console material error/warn 0
- provider calls 0
- no record/file/config mutation except the authorized theme save/reset roundtrip

Do not spend budget repeating the full 4-viewport matrix already accepted in CODEX-01 unless an actual regression appears.

## Branch / PR

Continue existing:
- branch: `codex/0045-shared-theme-settings`
- Draft PR: #67

Do not create another PR.
Do not merge.

Fetch latest main and reconcile the new CODEX-02 instruction/dispatch docs into the existing branch without losing CODEX-01 evidence.

## Report

Create:
- `docs/handoffs/0045-CODEX-02-exact-default-save-repair-report.md`

Update:
- `docs/handoffs/0045-dispatches.md`

Report must include:
- exact client diff
- focused test evidence
- final served version
- initial ABSENT evidence
- first exact-default SAVE evidence
- fresh-load persisted=true evidence
- RESET evidence
- final ABSENT evidence
- no-flash evidence
- minimal runtime regression
- side effects
- BLOCKER / READY_FOR_CHATGPT_FINAL_REVIEW

## Safety

```text
THEME_DESIGN_CHANGE: 0
TOKEN_DEFINITION_CHANGE: 0
SERVER_STORAGE_REDESIGN: 0
NEW_SHEET: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
TRIGGER_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC_CHANGE: 0
RECORD_MUTATION: 0
FILE_MUTATION: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
```

PASS target:

```text
EXACT_DEFAULT_FIRST_SAVE: PASS
FRESH_LOAD_SHARED_PERSISTENCE: PASS
RESET_TO_DEFAULT: PASS
FINAL_THEME_OVERRIDE_STATE: ABSENT
VISIBLE_THEME: WORK0044_DEFAULT
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

WORK_ID: 0045
DISPATCH_ID: 0045-CODEX-02
BALL: CODEX
STATUS: READY
