# Decision Log

本ファイルには現在も有効な重要判断だけを記録する。

## 2026-08-14 — Project direction reset

Status: Accepted

従来のKnowledge Sharing Platforms計画を破棄し、シンプルな蓄積基盤から全面的に再設計する。

### Accepted baseline

- 面談記録はGoogle Sheetsの入力画面から登録する。
- 面談内容は自由記載を基本とし、共通入力項目は少数に絞る。
- Apps Scriptで一貫した形式・命名規則のGoogle Docsを生成する。
- 生成Docsを組織管理下のShared Driveへ保存する。
- Google Sheetsには最低限の索引とDocsへのリンクを保持する。
- Pitchbook等の原資料もShared Driveへ蓄積する。
- 将来、面談記録と原資料を横断して必要な情報を取り出せる状態を目指す。

### Withdrawn

2026-08-14以前に記録されていたUI、AppSheet、検索、RAG、Vector DB、AI処理、MVP、ロードマップ、詳細アーキテクチャ等の個別判断は、現行方針としてすべて撤回する。

必要な要素は今後の詳細検討で改めて判断する。旧計画を根拠に自動的に復活させない。
