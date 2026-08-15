# Knowledge Sharing Platforms

プライベートアセット領域の面談記録とPitchbook等の資料を、できるだけ少ない運用負荷で蓄積し、将来必要な情報を取り出せるようにするためのナレッジ基盤プロジェクトです。

## Status

現在は再設計後の計画フェーズです。実装・試験・デプロイ・本番運用はいずれも未開始です。

2026-08-14に従来のプロダクト構想、UI方針、アーキテクチャ、MVP計画を破棄し、より単純な構成を新しい出発点として採用しました。旧計画は本リポジトリの現行方針として扱いません。

## Current baseline

利用者向けの入口は、Google Apps Script HTML Serviceで作る独立したWeb Appとします。Google Sheetsはマスターや索引を保持するバックエンドとして使い、通常利用者が直接編集する前提にしません。

利用者ごとにSpreadsheetやWeb Appをコピーせず、組織管理下の1つの共通Web Appを複数人で同時利用します。各利用者のブラウザ内の入力状態は独立させます。

### Shared registration context

面談記録とPitchbook登録では、以下の4項目を共通コンテキストとして扱います。

- 日付
- GP
- Asset Class
- エクイティ / デット

サイドバーで面談記録とPitchbook登録を切り替えても、これら4項目の入力値は保持します。どちらかの画面で変更した値は、もう一方の画面にも反映します。

登録完了後も共通4項目は保持し、同じ面談・資料登録を連続して行えるようにします。一方、時間、面談本文や参加者、Pitchbookの選択ファイル等のページ固有データは、そのページの登録完了時にクリアします。

サイドバーによる画面切替だけでは、登録前の書きかけ内容や選択済みファイルを消さない設計とします。

### Meeting records

面談登録画面の入力項目は以下を基本とします。

- 日付: 手入力またはカレンダー選択
- 時間: 入力
- 面談場所: マスターから選択
- GP: 共通GPマスターから選択。存在しない場合は追加可能
- Asset Class: マスターから選択
- エクイティ / デット: マスターから選択
- 面談相手: 自由入力
- 当社側: 自由入力
- 面談内容: 大きな自由記載欄

面談内容欄は固定した十分な高さを持ち、内容が長くなった場合は入力欄内で縦スクロールします。横スクロールは使用せず、文字は自動折り返しします。入力した改行は保持します。

登録するとApps ScriptがプレーンなGoogle Docsを生成します。装飾や表を多用せず、入力内容をコンパクトにミラーします。

例:

```text
日付: 2026-08-15
時間: 10:30
面談場所: 東京
GP: KKR
Asset Class: Infrastructure
エクイティ/デット: Equity
面談相手: John Smith, Jane Doe
当社側: 近藤、○○

面談内容:
入力した本文をそのまま反映する。
```

生成Docsは組織管理下のShared Driveへ保存し、Google Sheetsには検索・管理に必要な最小限の索引情報とDocsへの参照を残します。

### Pitchbooks and other source materials

- HTML ServiceのPitchbook登録画面からファイルを登録する。
- ドラッグ＆ドロップと複数ファイルの一括登録に対応する。
- 利用者が入力する項目は、面談記録と共有する日付、GP、Asset Class、エクイティ / デットの4項目とする。
- Apps Scriptが4項目を保存ファイル名に使用し、利用者に保存ファイル名を自由入力させない。
- 同一条件の複数ファイルは連番で識別し、元の拡張子を維持する。
- 原資料はShared Driveへ保存し、Google Sheetsには最低限の索引とDrive上のファイルへの参照を残す。

基本形は以下とします。表記の安全化や連番桁数等の細部は実装時に確定します。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_連番.ext
```

例:

```text
2026-08-15_KKR_Infrastructure_Equity_01.pdf
```

### Masters

GPは独立したGP Masterとして管理します。各GPには固定GP ID、表示名、Active / Inactiveを持たせます。名称変更、追加、無効化、再有効化をWeb Appから行えます。

面談場所、Asset Class、エクイティ / デットは共通のOption Masterで管理し、カテゴリごとに追加、名称変更、無効化、再有効化を行えるようにします。

無効化した選択肢は新規登録画面から外しますが、過去データとの紐付けは維持します。

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
4. 面談とPitchbookで共通する入力は1回入力すれば再利用できるようにする。
5. 入力と保存の仕組みを先に完成させ、検索・AIはその上に後から載せる。
6. 面談本文は自由記載を維持し、Docsは軽量・プレーンに保つ。
7. GPや選択肢の表記揺れは共有マスターで抑え、人の自由入力に依存しない。
8. 原資料を正本として保持し、将来の検索結果やAI回答から原資料へ戻れる設計にする。
9. 技術選定は必要になった時点で行い、RAG、Vector DB、外部Web基盤等を先回りして導入しない。
10. 実際の機密情報、面談記録、Pitchbook、認証情報をGitHubへ保存しない。

## Not decided yet

以下は今後の検討事項です。

- 面談Docsのファイル命名規則
- Pitchbook連番桁数、後日追加時の採番ルール、ファイル名に不適切な文字の安全化ルール
- Shared Driveのフォルダ構成
- GP Master / Option Master / 各Indexの最終カラム構成
- 過去面談記録の検索条件と編集画面の細部
- 大容量Pitchbookの実用上の上限とアップロード方式
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