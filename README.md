# Knowledge Sharing Platforms

部内に散在する面談記録、面談資料、人物情報、ファンド情報、疑問点、フォローアップ事項を、利用者の追加負担を最小限に抑えながら再利用可能なナレッジへ変換するための共有基盤プロジェクトです。

## Status

現在は構想・要件整理のみで、実装・試験・デプロイ・本番運用はいずれも未開始です。

`docs/architecture/target-architecture.md`や`docs/planning/mvp-and-roadmap.md`に記載された構成は目標設計であり、実装済み・利用可能・社内承認済みであることを意味しません。実装開始前に、Google Workspace、Shared Drive、AppSheet、Apps Script、Gemini APIまたはVertex AI等の組織上の利用可否と必要なセキュリティ条件を確認します。

## Product goal

利用者は普段どおりGoogle Docsで記録を作成し、必要な資料をGoogle Driveへ保存します。将来のシステムは、それらを共有ドライブ上で整理し、検索、面談準備、過去履歴確認、AIによる要約・論点抽出に利用できる形へ変換することを目指します。

重視するのは入力項目を増やすことではなく、既に作成されている記録を少ない操作で共有資産へ変えることです。

## Current target architecture

現時点の設計候補は以下です。いずれも未実装です。

- 利用者向けUI: AppSheetを第一候補、利用不可の場合はApps Script Web App
- 面談記録: Google Docs
- 面談資料: Google Drive
- 正式な保管場所: Google Workspace Shared Drive
- 構造化データと索引: Google Sheets
- ファイル連携と自動処理: Google Apps Script
- AI処理: 会社承認済みのGemini APIまたはVertex AI
- 設計・ソースコード管理: GitHub

## Design principles

1. 利用者の手入力を最小限にする。
2. Spreadsheetを一般利用者に直接編集させない。
3. Docsの書式を過度に固定せず、AI出力側を共通化する。
4. AIの回答から必ず原資料へ戻れるようにする。
5. 個人アカウント、個人Drive、個人APIキーに依存しない。
6. 機密データ、認証情報、実際の面談記録をGitHubへ保存しない。
7. 通常検索から開始し、必要性が確認された後に高度なRAGを導入する。
8. AI出力を自動的に正式記録や投資判断へ昇格させない。

## Repository structure

```text
.github/
  pull_request_template.md
AGENTS.md
README.md
.gitignore
docs/
  README.md
  core-rules-changelog.md
  repository-initialization.md
  handoff-template.md
  product/
    vision.md
  architecture/
    target-architecture.md
  planning/
    mvp-and-roadmap.md
  governance/
    security.md
  decisions/
    decision-log.md
  handoffs/
    AGENTS.md
```

実装用の`src/`、`tests/`、設定ファイル、CI workflow等は、技術スタックと実行契約が実際に決まった時点で追加します。未確定の構成を先に作って正本化しません。

## Documentation

- [文書索引](docs/README.md)
- [プロダクト構想](docs/product/vision.md)
- [目標アーキテクチャ](docs/architecture/target-architecture.md)
- [MVPと開発ロードマップ](docs/planning/mvp-and-roadmap.md)
- [ガバナンスと情報管理](docs/governance/security.md)
- [意思決定記録](docs/decisions/decision-log.md)
- [Repository初期化・再プロファイルガイド](docs/repository-initialization.md)
- [構造化handoff template](docs/handoff-template.md)

## Initial non-goals

- Gmail全体の自動読込
- Shared Drive全体への無制限なAIアクセス
- AIによる正式記録の自動確定
- 高度なベクトル検索基盤の先行導入
- 投資判断資料の自動作成・自動承認
- 組織承認前のlive integrationやdeployment

## Repository data policy

このリポジトリには設計書、将来のソースコード、テスト用の匿名化・合成データのみを保存します。実際の面談記録、面談資料、個人情報、未公開ファンド・ディール情報、APIキー、認証情報、組織内ID、private URLは保存しません。
