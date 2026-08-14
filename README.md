# Knowledge Sharing Platforms

プライベートアセット領域の面談記録とPitchbook等の資料を、できるだけ少ない運用負荷で蓄積し、将来必要な情報を取り出せるようにするためのナレッジ基盤プロジェクトです。

## Status

現在は再設計直後の計画フェーズです。実装・試験・デプロイ・本番運用はいずれも未開始です。

2026-08-14に従来のプロダクト構想、UI方針、アーキテクチャ、MVP計画を破棄し、より単純な構成を新しい出発点として採用しました。旧計画は本リポジトリの現行方針として扱いません。

## Current baseline

現時点で確定しているのは、知識を蓄積するための最小構成だけです。

### Meeting records

- Google Sheetsに入力用画面を用意する。
- 面談記録は、日付、面談先、面談場所、チーム、アセットクラス等の少数の共通項目と、自由記載の面談内容で構成する。
- 登録操作をApps Scriptで処理し、一貫したテンプレートのGoogle Docsを生成する。
- Google Docsのファイル名は一貫した命名規則にする。具体的な命名規則は今後決める。
- 生成したGoogle Docsは組織管理下のShared Driveへ保存する。
- Google Sheetsには検索・管理に必要な最小限の索引情報とGoogle Docsへのリンクを残す。

### Pitchbooks and other source materials

- Pitchbook等の原資料はShared Driveへ蓄積する。
- 面談記録と原資料を将来同じ検索・参照体験から利用できることを目標とする。
- 具体的なフォルダ構成、メタデータ、自動分類、検索方式、AI利用方式は未決定とする。

## Design principles

1. 最初から複雑なプラットフォームを作らない。
2. 入力と保存の仕組みを先に完成させ、検索・AIはその上に後から載せる。
3. 普段の運用はGoogle Workspace内で完結できる構成を優先する。
4. 面談記録の本文は自由記載を維持し、必須入力項目を増やしすぎない。
5. 原資料を正本として保持し、将来の検索結果やAI回答から原資料へ戻れる設計にする。
6. 技術選定は必要になった時点で行い、RAG、Vector DB、独自Web UI等を先回りして導入しない。
7. 実際の機密情報、面談記録、Pitchbook、認証情報をGitHubへ保存しない。

## Not decided yet

以下は今後の検討事項であり、現時点では正本化しません。

- 面談記録の最終入力項目
- Google Docsのテンプレート詳細
- ファイル命名規則
- Shared Driveのフォルダ構成
- Pitchbookの索引・メタデータ方式
- 全文検索、意味検索、AI Q&Aの実装方式
- 検索UI
- Gemini、Vertex AIその他AI機能の利用範囲
- RAG / Vector DBの要否
- 詳細なMVP、ロードマップ、実装順序

## Documentation

- [文書索引](docs/README.md)
- [プロダクト方針](docs/product/vision.md)
- [最小アーキテクチャ](docs/architecture/target-architecture.md)
- [現時点の計画](docs/planning/mvp-and-roadmap.md)
- [情報管理の最低条件](docs/governance/security.md)
- [意思決定記録](docs/decisions/decision-log.md)

## Repository data policy

この公開GitHubリポジトリには、設計書、将来のソースコード、匿名化または合成したテストデータのみを保存します。実際の面談記録、Pitchbook、個人情報、未公開ファンド・ディール情報、APIキー、認証情報、組織内ID、private URLは保存しません。
