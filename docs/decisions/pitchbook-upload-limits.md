# Pitchbook / Source Upload Limits Decision

Work ID: 0003

Date: 2026-08-15

Status: Accepted

## Decision

Pitchbook / source-material upload limitsを、初期実装の単純性とApps Script上の余裕を優先して以下へ変更する。

- 1ファイル: 25MBまで
- 1回の選択: 最大10ファイル
- 1回の合計: 100MBまで

この判断は、従来の`100MB / file、10 files / batch、500MB / batch`を置き換える。既存文書に旧上限が残っている場合も、本Decisionとユーザーの最新判断を優先する。

## Rationale

- 100MBは業務上の必須要件ではなく、初期計画上の便宜的な値だった。
- 実際のPitchbookは通常そこまで大きくないため、100MB対応のためだけにchunk upload、resumable transport、Cloud fallback等を初期実装へ持ち込む価値が低い。
- 25MB/fileならApps Script中心の単純なupload経路を優先しやすく、初期リリースの実装・検証・運用負荷を下げられる。
- 10ファイル選択は維持しつつ、合計100MBで1回の処理量を抑える。

## Implementation consequence

- 初期実装では100MB専用のchunk upload / fallback runtimeをAcceptance Criteriaに含めない。
- client-sideとserver-sideの両方で25MB/file、10 files、100MB/batchを検証する。
- 複数ファイルはファイル単位で処理し、1つの巨大なrequestへまとめることを前提にしない。
- 25MB以内でも実機上のApps Script制約が確認された場合は、観測した上限へさらに下げることを優先し、architectureを複雑化して上限を維持しない。
- 将来、実利用で25MB超の資料が頻繁に発生した場合のみ、上限引上げとresumable transportを別Workとして検討する。

## Non-goals

- 初期リリースで100MBファイルを必ず扱うこと
- upload上限のためだけにGoogle Cloud runtimeを追加すること
- upload上限のためだけに複雑なchunk managerを実装すること

Work ID: 0003
