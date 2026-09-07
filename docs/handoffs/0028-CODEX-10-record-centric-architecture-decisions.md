# Work 0028 — 単一記録・資料統合の設計判断

WORK_ID: 0028
MODE: INVESTIGATION
SCOPE: DESIGN ONLY / FUTURE BUILD REQUIREMENTS

このfilenameはCODEX-10準備時から維持する。CODEX-10はPR #47/#48で使用済み。次の実行は`0028-CODEX-11-meeting-centric-design-instruction.md`と`0028-CODEX-11-consistency-review.md`を正本とする。本版は2026-09-07の全体整合性レビューを反映した。

## 確定しているUI方針

- `記録を追加`は単一の通常登録フォーム。面談/資料subtab、記録種別selector、データ受領専用tab/form、資料だけ追加の独立経路を作らない。
- `過去の記録`は単一の一覧。detail内で本文・属性・面談原本・編集・記録の削除/復元・関連資料を扱う。
- 新規資料は必ず保存済みの親Meeting_IDから登録する。新規記録の保存失敗時は資料登録を開始しない。過去記録からの追加では既存親を使う。
- 資料登録はGPに限定しない。GP/LP/日本生命/グループ会社/Consultant/その他の全Counterpartyを対象にする。
- 資料行の表示は`削除`、意味は当該記録からのunlink。物理削除やPitchbook全体のInactive化と同一にしない。
- 独立資料管理画面や資料→面談の逆引きsurfaceは不要。既存資料の明示関連付け・資料分類編集は同じ親detailの補助操作へ移せる。

## 前版の解釈訂正

「データ受領タブ不要」を「面談を伴わない受領は一切登録不可」と読み替えた文は、ユーザー未確認の解釈として撤回する。受領の専用分岐を復活させる許可でもない。

今回のdesignでは新しいRecord_Type/Record_Index/DATA_RECEIPT schema、受領専用UI、禁止メッセージをいずれも追加しない。受領のみの記録の扱いと面談集計との区別はBUILD前確認事項とし、通常の面談3属性から推定しない。

## 親と資料の処理

利用者は1つのformから`登録`する。内部順序は、親保存成功→ID確定→ファイル別登録→関連確定とする。事前のファイル選択は可、親成功前のDrive/Index登録は不可。

親・ファイル・関連の3段階で成功/失敗を分ける。資料upload成功後に関連確定だけ失敗した場合は、同じDocument_IDで関連付けだけ再試行する。成功済みの親やファイルを再作成しない。親IDはprepare/upload/retryを通じてserverが確認する。

現行Pitchbookには親ID必須契約がなく、GP専用のvalidation/filename/source属性がある。これは後続BUILDでの明示的な変更対象であり、UIのlabel変更だけでは完成しない。

## 関係・削除・検索

- `Meeting_Index.Related_Pitchbook_IDs`を有効な関係の正本として維持する案を優先。新relationship tableは作らない。
- 新規登録元の親contextの追跡と、現在有効な関係は区別する。必要な最小field/予約bindingの具体schemaは後続BUILDで確定する。
- 資料`削除`は当該リンクのみ解除。取消/復元もリンクを対象にする。もともとInactiveの資料を無条件で有効化しない。
- 新規親必須資料の通常検索は有効な親関係も含めて判定する方針とし、最後の関連解除、親Inactive、関連未完了の資料が意図せず検索へ残らないようにする。他記録への有効リンクがある場合は保持する。
- 資料だけの操作でMeeting本文を古いformから再生成しない。Docs原文と他の属性を保全し、競合を検出する。
- non-GP資料の検索・引用・summaryも親の実際のCounterparty contextと整合させる。仮GP、名称一致、自動推測を使わない。

## 歴史データ・既存機能

既存のMeeting/Pitchbook/ID/ファイル/共有関連を破壊しない。親のない歴史資料を新規upload途中の未関連資料と同一扱いせず、自動削除・一括Inactive化・GP名による親推定は行わない。限定移行が必要かは実データ確認後に判断する。

GP/Entityサマリーの文脈付き資料参照は維持できる。独立資料管理tabの廃止は、これらの参照やmetadata編集契約を黙って消す意味ではない。最新UIでの残置/移設をcontrol coverageに記録する。

## 保持する境界

Light-only/7 sidebar/gold/紗綾形、既存Meeting3属性、別Meeting/Pitchbook dataset、stable IDs、既存5-sheet構造、provider経路とstrict citations、Work 0027 hidden、Work 0029認証は維持する。production実装・schema変更・migration・deployは本design dispatchでは未許可。
