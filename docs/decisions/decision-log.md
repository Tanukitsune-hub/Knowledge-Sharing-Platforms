# Decision Log

本ファイルには現在も有効な重要判断だけを記録する。

## 2026-08-14 — Project direction reset

Status: Accepted

従来のKnowledge Sharing Platforms計画を破棄し、シンプルな蓄積基盤から全面的に再設計する。

### Accepted baseline

- 面談記録とPitchbook等の原資料を、少ない入力負荷で継続的に蓄積する。
- Apps Scriptで一貫した形式・命名規則のGoogle Docsや保存ファイルを生成する。
- 面談記録とPitchbook等の正本は組織管理下のShared Driveへ保存する。
- Google Sheetsにはマスターと最低限の索引・参照情報を保持する。
- 将来、面談記録と原資料を横断して必要な情報を取り出せる状態を目指す。

### Withdrawn

2026-08-14以前に記録されていたUI、AppSheet、検索、RAG、Vector DB、AI処理、MVP、ロードマップ、詳細アーキテクチャ等の個別判断は、現行方針としてすべて撤回する。

必要な要素は今後の詳細検討で改めて判断する。旧計画を根拠に自動的に復活させない。

## 2026-08-14 — Use Apps Script HTML Service as the registration UI

Status: Accepted

通常利用者にはGoogle Sheetsを直接操作させず、Google Apps Script HTML Serviceによる独立したWeb Appを入口とする。

初期の主要画面は以下とする。

1. 面談記録登録
2. Pitchbook登録
3. GPマスター管理

Google SheetsはGPマスター、Meeting Index、Pitchbook Index等を保持するバックエンドとして扱う。

AppSheetや別の外部Web基盤は現時点では導入しない。

## 2026-08-14 — Share one GP master across meeting and Pitchbook workflows

Status: Accepted

面談記録とPitchbook登録は同じGPマスターを参照する。

- 各GPに変更しない固定GP IDを付与する。
- GP Nameは表示名として変更可能とする。
- StatusとしてActive / Inactiveを持たせる。
- ActiveなGPだけを新規登録画面の選択肢に表示する。
- 選択肢に存在しないGPは新規追加できる。
- 管理画面で新規追加、名称変更、無効化、再有効化を可能にする。
- 過去データはGP IDで紐付け、名称変更や無効化で参照関係を壊さない。
- 参照済みGPの物理削除は初期機能に含めない。
- GP統合は将来必要性が確認された場合に検討する。

## 2026-08-14 — Keep Pitchbook registration minimal

Status: Accepted

Pitchbook登録は利用者の入力負荷を最小化する。

- ドラッグ＆ドロップまたはファイル選択を利用できるようにする。
- 複数ファイルの一括登録に対応する。
- 利用者入力は原則として日付、GP、アセットクラスの3項目だけとする。
- 複数ファイルには同じ3項目を共通適用する。
- 保存ファイル名は自由入力させず、Apps Scriptが自動生成する。
- 同一条件の複数ファイルは連番で識別し、元の拡張子を維持する。

命名形式の細部、連番桁数、後日追加時の採番ルールは今後の実装設計で確定する。

## 2026-08-15 — Use one shared Web App for multiple users

Status: Accepted

利用者ごとにSpreadsheetやWeb Appのコピーを作らず、組織管理下の1つのApps Script HTML Service Web Appを共通URLから複数人で利用する。

- GP Master、Meeting Index、Pitchbook Index、Shared Drive上の正本は全利用者で共有する。
- 各利用者のブラウザ上の入力状態は独立し、複数人が同時に別々の登録作業を行える前提とする。
- 共通バックエンドへの書込みで競合すると困る部分だけ、Apps ScriptのLockServiceで排他制御する。
- ロック対象にはGP追加・更新、一意ID採番、Pitchbook連番確定、整合性が必要なIndex更新等を含める。
- ファイルアップロードやDocs生成等を含む処理全体を長時間ロックしない。
- 同一面談記録を複数人が編集する場合は、Meeting IndexのUpdated AtまたはVersionを利用した楽観的ロックで競合を検知する。
- 編集開始後に他利用者が更新していた場合は無条件に上書きせず、保存を止めて最新内容の再読込を求める。

Web Appを「デプロイしたユーザーとして実行」するか「アクセスしているユーザーとして実行」するかは、権限、監査、利用者識別の要件を実機で確認した上で実装時に確定する。恒久運用を個人アカウントに依存させない。
