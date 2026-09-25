# Interaction Stability and Layout-Shift UX

Status: Accepted future product direction  
Decision date: 2026-09-25  
Planned implementation: Work 0071

## Purpose

Alternative Assets Intelligenceは、保存・アップロード・検索・集計等の非同期処理中でも、利用者が「今まで見ていた場所」「押そうとしていたボタン」を見失わないUIを基本とする。

機能追加に伴う表示量よりも、日常操作での位置安定性・予測可能性・回復しやすさを優先する。

## Core UX Principle

通常の非同期状態変化によって主要操作位置を不意に移動させない。

特に以下を避ける。

- 「保存しています」「処理中」「保存しました」等のstatus block追加により、buttonやinputが上下へ押し出される。
- upload後に保存用filename等が追加され、file rowが大きく伸びて周囲の操作位置が移動する。
- loading / success / warning / errorごとにaction areaのDOM位置・高さが大きく変わる。
- 利用者が操作しようとしている瞬間にprimary actionが別位置へ移動する。
- transient feedbackのためにpage全体がjump / scroll / reflowする。

必要な内容展開（詳細を開く、検索結果が増える等）は禁止しない。防止対象は「操作の結果として予測できない形でcontrol positionが動く」ことである。

## Action Placement

### Primary actions

長いformや動的contentを持つsurfaceでは、主要actionを伸縮するcontentから分離する。

候補:

- section上部のaction bar
- page / card内sticky action bar
- headingと同一rowのaction group
- contentと独立した固定height action region

対象例:

- 記録を追加の保存 / 登録
- 保存資料 upload / retry
- News / 評価の保存
- 過去の記録の編集保存
- Knowledge Search実行
- Full Output操作
- Activity Analytics集計
- 管理者操作

primary actionを上部へ置くこと自体を目的にせず、長い本文・file list・result表示の伸縮からpositionを切り離すことを目的とする。

### Secondary actions

クリア、キャンセル、再試行、補助操作はprimary actionと視覚的に区別し、状態変化によってprimary actionの位置と入れ替わらない。

## Status and Progress Feedback

### Stable status channel

busy / success / warning / errorは、原則として新しいlayout rowを挿入するのではなく、事前に定義されたstatus region内で内容を差し替える。

推奨:

- compact reserved-height status slot
- action bar内のstatus area
- relevant content region内のoverlay / anchored status
- row-level status cell / badge update

避ける:

- status表示のたびにform下へ新しい段を追加する
- success/error messageの長さでbuttonの位置を大きく変える
- normal mutationにfullscreen overlayを使う

長いerror説明が必要な場合は、短いsummary + explicit detail expansionを優先する。重要なerrorやretry stateを自動消去してはならない。

### Progress semantics

実際に測定できる進捗だけを表示する。

- 3/5 files等、確定したprogressは表示可。
- 実進捗が不明な処理にfake percentageを表示しない。
- busy spinner / state textは可。

## File Upload Area

file uploadはinteraction stabilityの重点surfaceとする。

### File row

- original filenameをprimary identityとして安定表示する。
- saved/generated filenameはsecondary metadataまたはdetailとして扱い、追加表示でrow heightを不必要に増やさない。
- long filenameはclamp / ellipsis + explicit detail accessを検討する。
- statusは同じrow内で `Selected -> Saving -> Saved / Retry required` のように更新する。
- file list自体は必要に応じてbounded height + internal scrollを使用し、page actionを押し下げ続けない。

### Overlay

全体upload statusを表示する場合は、file list / upload workspace上のanchored overlayを第一候補とする。

ただし:

- focus中controlを隠さない。
- overlay表示中に禁止すべき操作は実際にdisabledにする。
- unrelated page actionまで無条件にblockしない。
- error / partial success / retry routeはoverlay消滅後も確認可能にする。

## Accessibility / Focus

interaction stability改善によってaccessibilityを悪化させない。

- status changeは `aria-live` 等で通知可能にする。
- busy stateは `aria-busy` 等の既存semanticを維持する。
- sticky / overlayはkeyboard focus targetを覆わない。
- status表示でfocusを勝手に移動しない。
- unexpected scrollを発生させない。
- error時は対象fieldへのexplicit focusが有用な場合のみ移動する。

## App-wide Scope

Work0071では少なくとも以下を横断監査する。

- 記録を追加: 面談メモ / 資料保存 / ニュース / 評価
- 過去の記録: search / detail / edit / lifecycle
- file upload / retry / partial success
- Knowledge Search
- Full Output
- Activity Analytics
- Entity Workspace / Relationship Explorerでのasync refresh
- Master / 管理者ページ
- modal / dialog内mutation

画面ごとに別のbusy UXを増やすのではなく、shared primitives / CSS contractを優先する。

## Acceptance Direction

見た目の印象だけではなく、interaction前後のgeometryを検証する。

代表flowで以下を比較する。

1. idle
2. file selected / input ready
3. request start
4. busy
5. success
6. validation error
7. server error
8. partial success / retry required

Primary actionについて、normal async status transitionだけによるbounding box movementは原則0 CSS pxを目標とし、rendering roundingを考慮する場合でも1 CSS px以内をacceptance候補とする。

併せて確認する。

- button width / heightの予期しない変化 0
- unexpected page scroll 0
- focus loss 0
- normal status表示起因のmaterial layout jump 0
- mobile viewportでoverlay / stickyがcontentを隠さない
- long filename / 1 file / max file countでprimary action positionが安定
- partial failure時にもretry targetが明確
- screen reader向けstatus semanticsを維持

Web Vitals CLSだけでは、user interaction直後のlayout movementを十分に捕捉できない場合があるため、button / action regionのbounding rectを直接検証する。

## Non-Goals

- cosmetic redesignだけを目的とする全面刷新
- animation追加そのもの
- business workflow変更
- backend/schema/provider変更
- status情報の削減による見かけ上の安定化
- error / retry safety stateの非表示化
- normal mutationを常時fullscreen modalへ変更

## Implementation Timing

Work0070の4-source record layerを完了・mergeした後に開始する。

まず「記録を追加」のsave/upload flowでshared interaction patternを確立し、その後directly coupled async surfacesへ展開する。

Work0070のqualificationやmergeをこのfuture UX Workのために再開・延期しない。
