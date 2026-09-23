# Work 0058 / CODEX-01 — visible brand inventory report

WORK_ID: 0058
DISPATCH_ID: 0058-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
VALIDATION_TIER: TIER_1_LOW

## Work Contract / evidence boundary

| 項目 | このDispatchの扱い |
|---|---|
| Outcome | current source / operator surfaceの旧名称を分類し、表面的なbrand BUILDの安全範囲を確定 |
| Evidence hierarchy | 現行`origin/main`のproduction source・call graph → tests / builder / operator文書 → accepted Work0053の記録。実runtimeのresource名は未確認として扱う |
| Fastest safe action | 旧名称のliteral検索と、名称→作成・検索・保存ID・検証・配布のcall graph読解 |
| Scope | inventory決定文書、本report、dispatch registerのみ |
| Non-goals / authorization | rename、production source変更、既存resource操作、provider call、deployment、BUILD、ACCEPTED、Completion Latchは実施しない |
| Reset condition | 現行sourceに未調査の名称依存が見つかれば安全候補を撤回してcall graphを再評価 |

## Baseline

- `origin/main`: `df807e2833bca5c61b14ec582c2feff88bc63d0f`。Work0056 / PR #88を含む取得時点の最新main。
- 作業先: 既存Draft PR #89、`work/0058-visible-brand-inventory`。開始時headは`124a446a7ac559a9d727c68740ce46d72b6525b4`で、merge baseは上記main。
- `AGENTS.md`、Work0058 plan/dispatch、Work0053 brand decisionとcompletion、現行source/tests/builder/operator文書を確認。開始時の未追跡`tmp-work...`は保持した。

## Outcome

分類・根拠・次BUILDの最小候補は[`docs/decisions/visible-brand-migration-inventory.md`](../decisions/visible-brand-migration-inventory.md)に記録した。

- `USER_VISIBLE`: Main/standaloneのbrandとbrowser titleは既に`Private Assets Intelligence`。現行HTMLの旧product表示literalは0。印刷・Full Outputにも旧brand由来の表題は検出されなかった。
- `OPERATOR_VISIBLE_SAFE`: README / 現行operator文書の説明、将来の新規host推奨名、npm description、local-only UI Layout Labの表示・handoff見出し。Gemini/OpenAIの**新規store display defaultのみ**はID参照上の候補だが、provider lifecycleのsourceとfixtureを伴うため文書変更とは分ける。
- `OPERATOR_VISIBLE_CONTRACT`: `Private Assets Knowledge`、`Meeting Records`、`Pitchbooks`、`Knowledge Exports`、`Knowledge Platform Backups`、`Knowledge Platform Backend`、`Knowledge Platform Audit`、`Knowledge Platform Backend Backup YYYY-MM-DD`、`KnowledgeShare_Installation`、3つのeditor-visible installer entrypoint。単純renameしない。
- `INTERNAL_CONTRACT`: `KnowledgeShare.bundle.gs`、`KSP_*` / `ksp...`、API/RPC/property/Settings/schema keys、sheet tabs、repository/package識別子、provider connection-test fixture。
- `HISTORICAL_DOC`: 過去Work、design reference、日付付きruntime snapshot、accepted判断の当時文言。一括書換えしない。

### 決め手となるcall graph

1. `installKnowledgeShare` → `kspRunInstaller_` → `kspRunSetup_` → `kspResolveAllResources_` → `kspResolveResource_`（`src/99_EntryPoints.gs:46-58`; `src/15_Installer.gs:293-305`; `src/10_Setup.gs:1-12,118-236`）。保存IDがある時の名称違いは警告だが、IDがない時は親・名称完全一致・MIMEでDrive検索し、見つからなければ旧default名で作る（`src/20_LiveEnvironment.gs:55-76`）。通常経路がID参照でも、resource名の一括変更は回復経路を壊し得る。
2. Backup snapshot名は`kspBackendBackupOwned_`の完全一致判定に含まれ、同日再利用・retentionの候補を決める（`src/21_BackendBackup.gs:2-16,50-86`）。
3. `KnowledgeShare_Installation`は`getSheetByName`で検索し、不在なら同名tabを作る（`src/15_Installer.gs:1`; `src/20_LiveEnvironment.gs:390-410`）。
4. bundle名とeditor entrypointはbuilder / validator / public-surface allowlist / installer guide / RPCに固定（`scripts/build-apps-script-bundle.cjs:139-149`; `scripts/validate-apps-script-bundle.cjs:45-53`; `scripts/public-surface.cjs:39-43`; `src/DeploymentSecurityOperator.html:53`）。
5. `Knowledge Share Control`はguideの推奨host名のみ。installerはbound SpreadsheetのID・親を使い、`spreadsheetName`を後続判定に使わない（`src/20_LiveEnvironment.gs:347-359`; `src/15_Installer.gs:121,154`）。文書上の**将来の推奨名**だけ変更候補とした。

## Validation / side effects

| 項目 | 結果 |
|---|---|
| Current source / call graph inventory | PASS。`src/*.html`、`src/*.gs`、operator文書、builder、関連testsを対象に名称と参照経路を確認 |
| Rename safety classification | PASS。安全候補と復旧・検証・配布contractを分離 |
| Relevant current docs consistency | PASS。`docs/design/product-brand.md`、`docs/handoffs/0053-completion-report.md`と照合。現行guideの古い運用記述はbrand変更と別の鮮度課題として明記 |
| `git diff --check` | PASS（delivery前に実施） |
| `npm run check` / browser / target-runtime qualification | NOT_RUN_TIER_1_LOW。文書のみのINVESTIGATIONでdecision-impactがない |
| Production source / generated bundle changes | 0 |
| Runtime resource / Drive / Spreadsheet / deployment mutation | 0 |
| Provider calls / real business-data mutation / permission changes | 0 |

`LOGIC_VALIDATION: PASS_STATIC_INVENTORY`
`TARGET_RUNTIME_QUALIFICATION: NOT_RUN_SCOPE`
`SIDE_EFFECT_STATE: DOCS_ONLY`
`BLOCKER: NONE`
`READY_FOR_CHATGPT_FINAL_REVIEW: YES`

## Shared Knowledge

`KNOWLEDGE_RETRIEVAL: NONE`
`KNOWLEDGE_APPLIED: NONE`
`NEW_KNOWLEDGE_CANDIDATE: YES` — 保存済みIDがあってもID欠落時の名称検索に依存するresourceは、安全な表示rename候補にはならない。

このDispatchは調査で終了する。ChatGPT final reviewまでBUILD・rename、`ACCEPTED`、Completion Latchへ進まない。

WORK_ID: 0058
DISPATCH_ID: 0058-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
