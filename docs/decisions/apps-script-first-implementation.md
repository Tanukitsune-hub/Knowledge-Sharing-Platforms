# Apps Script-first Implementation Delivery Decision

Work ID: 0003

Date: 2026-08-15

Status: Accepted

## Decision

Knowledge Sharing Platformsの実装は、Google Apps Scriptを本番runtimeとするApps Script-first方式で進める。

開発全体はChatGPTが所有し、GitHub上の設計、scope、Work ID、handoff、review、completionを管理する。Codexは、非自明なApps Script実装、ローカルtest、clasp等を使うdevelopment同期、実機検証、runtime debugging等、ChatGPTだけでは安全に完了できない残作業に限定して使用する。

## Setup decision

通常の導入時に、利用者または管理者が以下を手作業で作らない構成とする。

- `Private Assets Knowledge / Meeting Records / Pitchbooks`
- backend Spreadsheet
- Audit Spreadsheet
- `GP_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settings`
- Master seed
- schema version / Settings
- required installable triggers

管理者はApps Scriptの初期化関数を実行し、上記資源を作成または再利用する。

初期化関数はidempotentとし、再実行をrepair手段として利用できるようにする。重複候補や権限不整合がある場合は推測で継続せず、明示的に停止して報告する。

## Manual boundary

以下は組織権限・OAuth・deployment上の明示操作として手動に残す。

- organization-controlled Apps Script projectの作成または指定
- standard Google Cloud projectの紐付け
- Drive advanced service / Drive APIの有効化
- Gemini利用時の会社承認済みAPI / Cloud環境の有効化
- Shared Drive parent / admin-only control folderの用意と権限付与
- initial OAuth consent
- Web App deployment
- actual-user attributionを確認した上でのexecute-as設定
- production credentialの組織承認済み保管設定

アプリ自身がShared Drive、Cloud project、組織承認、credential発行、OAuth consent、Web App deploymentを暗黙に作成・変更する設計にはしない。

## Runtime and tooling boundary

- Runtime sourceはApps Script V8 compatible plain JavaScriptとする。
- Apps Script editorへ配置できる`.gs / .html / appsscript.json`を正本sourceとして管理する。
- TypeScript、bundler、external web server、Node.js、claspをproduction runtimeまたは通常管理者のsetup必須条件にしない。
- claspとlocal test toolingはdeveloper / Codex用に使用できる。
- Apps Script service依存を薄いadapterへ分離し、pure logicを軽量なlocal testで検証できるようにする。

## Environment decision

DEVとPRODは別のApps Script project、deployment、Shared Drive resources、backend / audit Spreadsheetを使用する。

DEVは匿名化または合成データだけを使用し、PRODへ実データを投入する前にphase qualificationを完了する。

## Delivery sequence

実装は以下の順で進める。

1. Apps Script scaffoldとidempotent setup
2. Meeting end-to-end
3. Pitchbook end-to-end
4. Past Records / Masters / concurrency / auditとPhase 1 qualification
5. Gemini File Search thin sliceと自由質問
6. 15分sync、6形式、EML、100MB path
7. 要約 / 時系列 / 比較 / 面談準備とproduction qualification

詳細なscope、acceptance、routing、validationは`docs/planning/apps-script-implementation-plan.md`を正本とする。

## Rationale

- 現行設計はGoogle Workspaceを正本・運用基盤としており、Apps Script中心の実装が最短で一貫する。
- setup automationにより、環境ごとの手作業差異、schema drift、trigger漏れ、Master seed不整合を抑えられる。
- idempotent setupにより、初回導入だけでなくrepair、DEV再構築、migrationにも同じ経路を使える。
- ChatGPTが設計とGitHub ownershipを維持し、Codexをimplementation / runtime residualに限定することで、重複調査と長時間のopen-ended実装を減らせる。
- production runtimeをApps Scriptへ限定しつつ、developer toolingを任意利用できるため、利用者側の導入負荷と開発時の検証可能性を両立できる。

## Non-goals

- setupのためだけの外部Web application
- production必須のNode.js / local server
- Apps Script以外の並行runtime
- per-user Spreadsheet / Web App copy
- generic production reset / destructive teardown
- credentialやorganization-specific IDsのGitHub保存
- current product designの再検討

Work ID: 0003
