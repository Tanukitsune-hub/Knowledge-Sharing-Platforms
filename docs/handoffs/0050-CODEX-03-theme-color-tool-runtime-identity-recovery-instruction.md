# Work 0050 CODEX-03 — target Apps Script identity recovery + bounded runtime qualification

WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-03
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION

## Primary Outcome

Work0050 CODEX-02で停止した`TARGET_PROJECT_AND_WEB_APP_IDENTITY_UNVERIFIED`を、Drive上のcontainer-bound host Spreadsheetから決定的に解消し、identity chainが成立した場合だけversion32 deployとTheme Color Toolのtarget-runtime qualificationを実行する。

## New decisive evidence from ChatGPT

Google Drive read-only確認で以下を特定済み。

- Spreadsheet title: `KSP Work 0028 Synthetic Host`
- current `Knowledge Platform Backend` と `Knowledge Platform Audit` と同じ親領域に存在
- owner-only file
- sheet `KnowledgeShare_Installation` が存在
- `状態 = READY_FOR_DEPLOYMENT`
- `スキーマ版 = 8`
- `配布profile = company-single-file-v1`

Private Drive IDs / URLs / account identifiersはGitHubやreportへ記録しない。

このhost Spreadsheetから `拡張機能 > Apps Script` を開く経路を、project identityのauthoritative entry pathとして使う。

Apps Scriptのproject一覧やローカルrepositoryの既存 `.clasp.json` から候補を推測しない。

## Read first

- `docs/handoffs/0050-CODEX-02-theme-color-tool-runtime-report.md`
- `docs/handoffs/0050-CODEX-02-theme-color-tool-runtime-instruction.md`
- `docs/handoffs/0050-theme-color-tool-requirements.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/handoffs/0049-completion-report.md`

## Phase A — read-only identity recovery

1. Google Driveでtitle exact match `KSP Work 0028 Synthetic Host` を開く。
2. `KnowledgeShare_Installation` sheetをread-onlyで確認し、上記state/schema/profileと一致することを確認。
3. Spreadsheet UIから `拡張機能 > Apps Script` を開く。
   - このnavigationでcontainer-bound Apps Script project identityを確定する。
4. Apps Script editorでsaved project source / project settingsをread-only inventory。
5. `デプロイ > デプロイを管理` を開き、候補ごとに以下を別々に確認:
   - entrypoint type = Web app
   - immutable version = 31
   - execute-as = deploying user / owner
   - access = owner-only
   - generated endpoint = `/exec`
6. Browserで現在開いているaccepted baseline `/exec` とManage deploymentsのWeb App endpointが同一であることをローカル比較する。
   - private URL / deployment IDはreportへ書かない。
   - 必要ならhashだけを一時的に比較してよい。
7. version31を配信するWeb Appが一意に証明できない場合は、外部変更0で停止しBLOCKEDを返す。

## Phase B — disposable clasp mapping

Phase A PASS時のみ。

1. container-bound Apps Script editorから正しいScript IDをローカルで取得。
2. repository worktreeを汚さず、disposable directoryにtemporary `.clasp.json` を作る。
3. authenticated claspが同projectをreadできることを確認。
4. current remote saved sourceをpull/readして、accepted version31 source familyと整合することを確認。
5. repository rootの既存/stale `.clasp.json` は使用しない・変更しない。
6. Script ID / private IDsはreport/GitHubへ記録しない。

Phase Aでprojectが確定しても、clasp authが別account等でproject accessを証明できない場合はSTOP。editor copy/paste等への迂回deployはしない。

## Phase C — bounded deployment

Phase A/B PASS時のみ。

Source:
- latest `main`
- Work0050 PR #72 mergeを含むこと
- Work0050 production source以外のunreviewed sourceを含めない

Allowed mutations:
- source sync: exactly 1 max
- independent saved-source readback
- immutable version create: exactly 1 max, expected version32
- existing proven WEB_APP deployment update: exactly 1 max

Forbidden:
- new deployment
- Library/API executable/add-on deployment mutation
- second deploy attempt
- URL change
- execute-as change
- access change
- permission broadening
- provider call
- Theme Save / Reset
- business data mutation

If any post-sync identity mismatch or deployment metadata mismatch occurs:
- stop immediately
- do not create/update a second deployment
- return BLOCKED with accepted evidence preserved

## Phase D — target runtime qualification

Version32 `/exec` only.

Theme Color Tool:
- Theme tab opens
- Color Tool visible
- selected token exact current color load
- 2D saturation/value interaction updates swatch/HEX/RGB
- hue slider updates color
- valid HEX sync
- invalid HEX => validation + Apply disabled
- token target switching exact
- Apply => draft/live preview only
- Apply before Save => server theme mutation 0
- direct 16-row edit <-> Color Tool sync
- Discard => exact persisted palette / preview / Color Tool restoration
- copy success or safe fallback
- EyeDropper supported/unsupported progressive path
- keyboard operation
- 16 Theme fields preserved
- 1440 / 390 no material overflow

Regression:
- Work0049 busy feedback remains
- Work0048 manual deleted-record search remains
- all 7 normal pages nonblank
- console material error/warn 0
- provider calls 0

State safety:
- do not use Theme Save/Reset for qualification
- persisted Theme value before/after unchanged
- Backend / business data drift 0
- provider state drift 0

## Evidence hierarchy

Strongest:
1. Drive host -> Extensions > Apps Script bound-project path
2. Apps Script Manage deployments metadata
3. remote saved-source readback via disposable clasp mapping
4. actual version32 /exec runtime
5. repository tests

Historical report or project title alone is insufficient.

## Tests before mutation

- focused Work0050 / Work0045 / Work0049
- `npm run check`
- `npm run check:bundle`
- `git diff --check`

## Delivery

Update:
- `docs/handoffs/0050-dispatches.md`

Create:
- `docs/handoffs/0050-CODEX-03-theme-color-tool-runtime-report.md`

Do not mark Work0050 ACCEPTED.
Do not apply Completion Latch.

If PASS:
```text
WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
TARGET_RUNTIME_QUALIFICATION: PASS
FINAL_SERVED_VERSION: 32
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

If identity still cannot be proven:
```text
WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-03
BALL: USER or CHATGPT
STATUS: ACTION_REQUIRED or BLOCKED
BLOCKER: <exact remaining identity gap>
```

WORK_0030 remains DEFERRED_BY_USER.
