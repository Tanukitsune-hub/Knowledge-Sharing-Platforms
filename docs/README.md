# Documentation

本ディレクトリはKnowledge Sharing Platformsの現行方針を記録します。

2026-08-14に旧計画を破棄し、シンプルな蓄積基盤から再設計を開始しました。旧アーキテクチャや旧MVPを前提に今後の設計・実装を進めないでください。

## Current sources of truth

- `product/vision.md`: 何を解決するか、現時点のプロダクト方針
- `architecture/target-architecture.md`: 現時点で確定している全体アーキテクチャ
- `planning/mvp-and-roadmap.md`: 現在の計画状態と次に決めること
- `operations/runtime-policy.md`: 下書き、アップロード上限、部分失敗再試行、実行主体、マスター権限、監査ログ等の実運用ルール
- `ai/gemini-file-search.md`: Gemini File Search Store、Embedding、Metadata Filter、Citation、AI同期を使う検索・要約レイヤーの正本
- `governance/security.md`: 情報管理、アクセス、監査上の最低条件
- `decisions/decision-log.md`: 方針リセットを含む確定判断

## Operating documents

- `repository-initialization.md`: Repository初期化・再プロファイルガイド
- `handoff-template.md`: 構造化handoff template
- `handoffs/`: 個別作業のhandoff
- `core-rules-changelog.md`: Core Repository Rulesの変更履歴

未決定事項を推測で正本化せず、ユーザーとの検討後に各文書へ反映します。確定済みの実運用ルールは`operations/runtime-policy.md`、検索・AIレイヤーは`ai/gemini-file-search.md`を優先して参照します。
