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

主要画面は面談記録、Pitchbook登録、マスター管理を中心とする。Google SheetsはGP Master、Option Master、Meeting Index、Pitchbook Index等を保持するバックエンドとして扱う。

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

## 2026-08-15 — Use one shared Web App for multiple users

Status: Accepted

利用者ごとにSpreadsheetやWeb Appのコピーを作らず、組織管理下の1つのApps Script HTML Service Web Appを共通URLから複数人で利用する。

- GP Master、Option Master、Meeting Index、Pitchbook Index、Shared Drive上の正本は全利用者で共有する。
- 各利用者のブラウザ上の入力状態は独立し、複数人が同時に別々の登録作業を行える前提とする。
- 共通バックエンドへの書込みで競合すると困る部分だけ、Apps ScriptのLockServiceで排他制御する。
- ロック対象にはマスター追加・更新、一意ID採番、Pitchbook連番確定、整合性が必要なIndex更新等を含める。
- ファイルアップロードやDocs生成等を含む処理全体を長時間ロックしない。
- 同一面談記録を複数人が編集する場合は、Meeting IndexのUpdated AtまたはVersionを利用した楽観的ロックで競合を検知する。
- 編集開始後に他利用者が更新していた場合は無条件に上書きせず、保存を止めて最新内容の再読込を求める。

Web Appを「デプロイしたユーザーとして実行」するか「アクセスしているユーザーとして実行」するかは、権限、監査、利用者識別の要件を実機で確認した上で実装時に確定する。恒久運用を個人アカウントに依存させない。

## 2026-08-15 — Fix the meeting input fields and compact Docs mirror format

Status: Accepted

面談登録画面の基本入力項目を以下とする。

1. 日付 — 手入力とカレンダー選択の両方に対応
2. 時間 — 入力
3. 面談場所 — 選択肢
4. GP — 選択肢
5. Asset Class — 選択肢
6. エクイティ / デット — 選択肢
7. 面談相手 — 自由入力
8. 当社側 — 自由入力
9. 面談内容 — 自由記載

面談場所、Asset Class、エクイティ / デットは共通Option Masterで管理し、追加、名称変更、無効化、再有効化を可能にする。GPは独立したGP Masterを使用する。

面談内容入力欄は十分な高さを持ち、長文は欄内で縦スクロールする。横スクロールは使わず、文字を自動折り返しする。改行は保持する。

生成するGoogle Docsは表や装飾を避けた軽量・プレーンな形式とし、`日付: 2026-08-15`、`時間: 10:30` のように各項目を1行でコンパクトにミラーする。面談内容も入力本文をそのまま反映する。

## 2026-08-15 — Share registration context between Meeting and Pitchbook pages

Status: Accepted

面談登録とPitchbook登録で、以下の4項目を共通コンテキストとして扱う。

- 日付
- GP
- Asset Class
- エクイティ / デット

時間は面談ページ固有の項目とし、Pitchbookの保存名や共通コンテキストには使用しない。

- 一方の画面で入力または変更した値は、もう一方にも反映する。
- サイドバーで画面を切り替えても値を保持する。
- 面談またはPitchbookの登録が完了しても共通4項目は保持する。
- 登録完了時には、そのページ固有の入力だけをクリアする。
- サイドバーで別画面へ移動しただけでは、各ページの未登録の書きかけ内容や選択済みファイルを消さない。
- 共通コンテキストと各ページの下書き状態は利用者ブラウザ内で保持し、別利用者には共有しない。

目的は、同じ面談に関する面談記録とPitchbook登録を、順序を問わず二重入力なしで連続実行できるようにすることである。

## 2026-08-15 — Use four shared fields in Pitchbook filenames

Status: Accepted

Pitchbookの保存ファイル名には、画面で確定した以下の4項目を使用する。

- 日付
- GP
- Asset Class
- エクイティ / デット

利用者に保存ファイル名を自由入力させない。基本形は以下とする。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

複数ファイルには連番を付与し、元の拡張子を維持する。ファイル名として不適切な文字の安全化、連番桁数、後日追加時の採番ルールは実装時に確定する。
