# Documentation

本ディレクトリはKnowledge Sharing Platformsの現行方針を記録します。

2026-08-14に旧計画を破棄し、Google Workspace中心のシンプルな蓄積基盤から再設計しました。2026-08-15にはGemini API / File Searchによる検索・要約レイヤーと、Knowledge Searchの5モードTarget UXを採用しました。

旧アーキテクチャや旧MVPを前提に今後の設計・実装を進めないでください。また、会社環境やAPI挙動の実機確認が未実施であることと、プロダクト仕様が未決定であることを混同しないでください。

## Current sources of truth

- `product/vision.md`: 現在のプロダクト目的、利用者体験、採用済みTarget UX
- `architecture/target-architecture.md`: 現在採用している全体アーキテクチャと責任境界
- `planning/mvp-and-roadmap.md`: 採用済み設計、実装順序、実機検証事項、本当に未決定の実装選択肢
- `operations/runtime-policy.md`: 下書き、アップロード上限、部分失敗retry、実行主体、Master権限、15分AI同期、監査ログ等の確定運用ルール
- `ai/gemini-file-search.md`: File Search Store、Embedding、Metadata Filter、5モードKnowledge Search、Citation、AI同期、対応形式等のAI retrieval正本
- `governance/security.md`: 情報管理、共通AIアクセス境界、credential、監査、AI release blocker
- `decisions/decision-log.md`: 現在も有効な主要判断を統合したDecision Log
- `decisions/gemini-file-search-retrieval.md`: Gemini File Search採用とKnowledge Search UIに関する詳細Decision

## Authority / conflict handling

同じ論点が複数文書に現れる場合は、以下のルールで読む。

1. ユーザーの最新の明示的な決定を最優先する。
2. domain-specificな正本を優先する。
   - Runtime / audit / permissions: `operations/runtime-policy.md`
   - Gemini retrieval / Knowledge Search: `ai/gemini-file-search.md`
   - Security: `governance/security.md`
3. `architecture/target-architecture.md`は全体の責任境界、`product/vision.md`はUX / product intentを示す。
4. `planning/mvp-and-roadmap.md`は、確定済み設計そのものではなく、実装順序・検証事項・残る実装選択肢を明確に区別して管理する。
5. Historical wordingが現行のdomain-specific正本と矛盾する場合、現行正本を優先し、矛盾する古い記述は修正する。

## Accepted high-level baseline

- 1つの組織管理下Apps Script HTML Service Web Appを複数人で利用
- Shared Driveを正本、Google Sheetsを小さなbackend DB / Indexとして利用
- Meeting / Pitchbookの登録・過去検索・編集・無効化・再有効化
- GP Master / Option Master
- 24時間browser draft retention
- 100MB / file、10 files / batch、500MB / batch
- 全利用者がMaster変更可能
- 5年監査ログ、管理者のみ閲覧
- Gemini File Searchを1 Storeの派生semantic retrieval indexとして使用
- Web App利用者全員が全Active indexed sourceをAI検索可能
- Gemini Flash 1モデル、利用者向けmodel selectorなし
- 15分おきAI sync
- AI queryも監査対象
- Initial AI-searchable formats: `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- Knowledge Search Target UX: `自由質問 / 要約 / 時系列 / 比較 / 面談準備`

## Operating documents

- `repository-initialization.md`: Repository初期化・再プロファイルガイド
- `handoff-template.md`: 構造化handoff template
- `handoffs/`: 個別作業のhandoff
- `core-rules-changelog.md`: Core Repository Rulesの変更履歴

Operating documentsはproject product specificationではない。汎用template / procedureの文言を、現行プロダクト仕様より優先しない。
