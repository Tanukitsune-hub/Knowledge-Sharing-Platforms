# Knowledge Sharing Platforms

プライベートアセット領域の面談記録とPitchbook等の資料を、できるだけ少ない運用負荷で蓄積し、将来必要な情報を取り出せるようにするためのナレッジ基盤プロジェクトです。

## Status

現在は再設計後の計画フェーズです。実装・試験・デプロイ・本番運用はいずれも未開始です。

2026-08-14に従来のプロダクト構想、UI方針、アーキテクチャ、MVP計画を破棄し、より単純な構成を新しい出発点として採用しました。旧計画は本リポジトリの現行方針として扱いません。

## Current baseline

利用者向けの入口は、Google Apps Script HTML Serviceで作る独立したWeb Appとします。Google SheetsはGPマスターや索引を保持するバックエンドとして使い、通常利用者が直接編集する前提にしません。

利用者ごとにSpreadsheetやWeb Appをコピーせず、組織管理下の1つの共通Web Appを複数人で同時利用します。GP Master、各Index、Shared Drive上の正本は全利用者で共有します。

### Meeting records

- HTML Serviceの面談登録画面から登録する。
- 面談記録は、日付、GP、面談場所、チーム、アセットクラス等の少数の共通項目と、自由記載の面談内容で構成する。
- GPは共通GPマスターから選択し、選択肢にない場合は新規GPを追加できる。
- 登録操作をApps Scriptで処理し、一貫したテンプレートのGoogle Docsを生成する。
- Google Docsのファイル名は一貫した命名規則にする。具体的な命名規則は今後決める。
- 生成したGoogle Docsは組織管理下のShared Driveへ保存する。
- Google Sheetsには検索・管理に必要な最小限の索引情報とGoogle Docsへのリンクを残す。

### Pitchbooks and other source materials

- HTML ServiceのPitchbook登録画面からファイルを登録する。
- ドラッグ＆ドロップと複数ファイルの一括登録に対応する。
- 利用者が入力する共通項目は原則として、日付、GP、アセットクラスの3項目だけとする。
- GPは面談登録と同じ共通GPマスターから選択し、選択肢にない場合は新規GPを追加できる。
- Apps Scriptがファイル名を自動生成し、同一条件の複数ファイルは連番で識別する。利用者に保存ファイル名を自由入力させない。
- 原資料はShared Driveへ保存し、Google Sheetsには最低限の索引とDrive上のファイルへの参照を残す。
- 面談記録と原資料を将来同じ検索・参照体験から利用できることを目標とする。

### Shared GP master

- 面談記録とPitchbook登録で同じGPマスターを使用する。
- 各GPには名称とは別に固定のGP IDを付与し、過去データとの紐付けを名称変更から切り離す。
- GPマスター管理画面から、新規追加、名称変更、無効化、再有効化を行えるようにする。
- 無効化したGPは新規登録の選択肢から外すが、過去データとの紐付けは維持する。
- 参照済みGPの物理削除はMVPでは行わない。GP統合等は必要になった時点で検討する。

### Multi-user operation

- 全員が同じWeb App URLを利用し、利用者ごとのコピーは作らない。
- 各利用者の画面上の入力状態は独立させ、複数人が同時に別々の登録作業をできるようにする。
- GP追加、一意ID採番、Pitchbook連番、整合性が必要なIndex更新等の短い共有書込みだけをLockServiceで排他制御する。
- アップロードやDocs生成等を含む処理全体を長時間ロックしない。
- 同じ面談記録を複数人が編集する場合はUpdated AtまたはVersionで競合を検知し、古い画面からの無条件上書きを防ぐ。
- Web Appの実行主体設定は、組織の権限・監査要件を確認して実装時に確定する。恒久運用を個人アカウントに依存させない。

## Design principles

1. 最初から複雑なプラットフォームを作らない。
2. 利用者にはシンプルなHTML画面だけを見せ、管理用Sheetsを通常操作から切り離す。
3. 1つの共通Web Appと共有バックエンドを複数人で利用し、利用者ごとのコピーを増やさない。
4. 入力と保存の仕組みを先に完成させ、検索・AIはその上に後から載せる。
5. 普段の運用はGoogle Workspace内で完結できる構成を優先する。
6. 面談記録の本文は自由記載を維持し、必須入力項目を増やしすぎない。
7. GP等の表記揺れは共有マスターで抑え、人の自由入力に依存しない。
8. 原資料を正本として保持し、将来の検索結果やAI回答から原資料へ戻れる設計にする。
9. 技術選定は必要になった時点で行い、RAG、Vector DB、外部Web基盤等を先回りして導入しない。
10. 実際の機密情報、面談記録、Pitchbook、認証情報をGitHubへ保存しない。

## Not decided yet

以下は今後の検討事項であり、現時点では正本化しません。

- 面談記録の最終入力項目
- Google Docsのテンプレート詳細
- 面談記録のファイル命名規則
- Pitchbookの自動命名規則の細部と連番桁数
- Shared Driveのフォルダ構成
- 各Indexの最終カラム構成
- Web Appの実行主体設定と利用者識別・監査ログの詳細
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
