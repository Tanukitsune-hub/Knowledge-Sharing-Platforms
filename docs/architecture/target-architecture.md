# Minimal Target Architecture

## Status

本書は2026-08-15時点で確定した最小構成だけを示す。旧アーキテクチャは破棄済みであり、AppSheet、外部Web基盤、Gemini API、Vertex AI、RAG、Vector DB等を既定の構成要素として扱わない。

## Confirmed baseline

```text
Multiple users
  A / B / C ...
        |
        | same shared URL
        v
Apps Script HTML Service Web App
  ├─ Meeting Registration
  ├─ Pitchbook Registration
  └─ Master Management
            |
            v
Google Apps Script
  ├─ shared client-side registration context
  ├─ validation / registration logic
  ├─ Google Docs generation
  ├─ Pitchbook rename / numbering / save
  ├─ master maintenance
  └─ concurrency control
            |
      +-----+--------------------+
      |                          |
      v                          v
Google Sheets                Google Shared Drive
  ├─ GP Master                 ├─ Meeting Records
  ├─ Option Master             └─ Pitchbooks / Source Materials
  ├─ Meeting Index
  └─ Pitchbook Index

              ↓ 将来追加

Search / Retrieval / AI layer
  方式は未決定
```

## Apps Script HTML Service Web App

通常利用者の入口とする。Google Sheetsを直接操作させない。

主要画面は以下を中心とする。

1. 面談記録
2. Pitchbook登録
3. マスター管理

Web Appは利用者ごとにコピーしない。組織管理下の1つの共通デプロイとURLを複数人で利用し、各利用者のブラウザ上の入力状態は独立させる。

サイドバーで画面を切り替える単一のWeb Appとし、画面切替だけでは各画面の未登録の入力状態を消さない。

## Shared registration context

面談記録とPitchbook登録で以下の4項目を共通コンテキストとして扱う。

- 日付
- GP
- Asset Class
- エクイティ / デット

一方の画面で入力・変更した値はもう一方にも反映する。サイドバーで画面を切り替えても保持する。

面談またはPitchbookの登録が完了しても共通4項目は維持し、続けてもう一方を登録できるようにする。登録完了時には、そのページ固有の入力だけをクリアする。面談の時間は共通コンテキストに含めず、面談ページ固有の入力として扱う。

共通コンテキストは利用者のブラウザ内の状態として扱い、別利用者の入力状態とは共有しない。単純なページ切替のためにSheetsへ下書きを書き込む設計にはしない。

## Meeting registration

面談入力項目は以下とする。

- 日付: 手入力とカレンダー選択の両方に対応
- 時間: 入力
- 面談場所: Option Masterの選択肢
- GP: GP Masterの選択肢。存在しない場合は追加可能
- Asset Class: Option Masterの選択肢
- エクイティ / デット: Option Masterの選択肢
- 面談相手: 自由入力
- 当社側: 自由入力
- 面談内容: 自由記載

面談内容欄は十分な高さを持つ固定領域とし、長文は入力欄内で縦スクロールする。横スクロールは使用せず、文字は自動折り返しする。入力した改行は保持する。

サイドバーでPitchbook画面へ移動しても、未登録の時間、面談内容等は保持し、戻った際に続きから編集できるようにする。

Apps ScriptがGoogle Docsを生成する。Docsは軽量なプレーンテキスト中心とし、装飾、表、余計な空行を避ける。入力内容を以下のようにコンパクトにミラーする。

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

生成DocsをShared Driveへ保存し、Meeting Indexへ参照を記録する。

## Pitchbook registration

- ドラッグ＆ドロップまたはファイル選択で登録する。
- 複数ファイルを一度に選択できる。
- 入力項目は共有コンテキストの日付、GP、Asset Class、エクイティ / デットの4項目とする。
- 複数ファイルには同じ4項目を共通適用する。
- 保存ファイル名を利用者に自由入力させない。
- Apps Scriptが4項目を使用して規則的な保存名を生成する。
- 同一条件の複数ファイルを連番で識別する。
- 元の拡張子を維持する。
- サイドバーで別画面へ移動しただけでは選択済みファイルを消さない。
- 登録成功後は選択ファイルのみクリアし、共通4項目は保持する。
- 保存後、Pitchbook Indexへ最低限の参照情報を記録する。

基本命名形は以下とする。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

例:

```text
2026-08-15_KKR_Infrastructure_Equity_01.pdf
```

日付、GP、Asset Class、エクイティ / デットには画面で確定した表示値を使用する。ファイル名として不適切な文字の安全化、連番桁数、後日追加時の採番ルールは実装設計時に確定する。

## Masters

### GP Master

面談登録とPitchbook登録の両方から参照する。

最低限の論理項目は以下。

- GP ID: 作成後に変えない内部識別子
- GP Name: 利用者に表示する名称
- Status: Active / Inactive

Web Appのマスター管理画面から、新規追加、名称変更、無効化、再有効化を行う。

過去データはGP名ではなくGP IDで紐付ける。名称変更で参照関係を壊さない。無効化したGPは新規入力の選択肢から外すが、既存データは維持する。参照済みGPの物理削除は初期機能に含めない。

### Option Master

以下の選択肢を1つの共通Option Masterで管理する。

- 面談場所
- Asset Class
- エクイティ / デット

カテゴリごとに固定Option ID、表示名、Active / Inactiveを持たせ、Web Appから追加、名称変更、無効化、再有効化を行う。

## Google Sheets

バックエンドの構造化データと索引を保持する。通常利用者が直接編集する前提にしない。

初期構成は以下を想定する。

- GP Master
- Option Master
- Meeting Index
- Pitchbook Index

各Indexの最終カラム構成は未決定。ただし、Meeting Indexは面談の時間を保持し、同一面談の同時編集を検知するため更新時刻または同等のVersion情報も保持する。

## Google Apps Script

- HTML画面のサーバー側処理を担当する。
- 入力値を検証する。
- GP Master / Option Masterを読み書きする。
- 面談登録時にGoogle Docsを生成・保存する。
- Pitchbook登録時にファイル名を生成・連番付与し、Shared Driveへ保存する。
- 各Indexを更新する。
- 複数ユーザーの同時実行による競合を防ぐ。

具体的なエラー処理、アップロード上限、大容量ファイル対応等は実装設計時に確定する。

## Multi-user concurrency rules

複数人が同じWeb Appを同時利用することを通常ケースとして扱う。

以下のような共有状態を変更する短い処理ではApps ScriptのLockServiceを用いて排他制御する。

- GP / Optionの新規追加やマスター更新
- Meeting ID等の一意ID採番
- Pitchbook連番の取得・確定
- 同一処理内で整合性が必要なIndex更新

ファイルアップロードやDocs本文生成など処理全体を長時間ロックせず、重複や競合を防ぐために必要なクリティカルセクションだけをロックする。

同じ面談記録を複数人が同時編集する場合は、Meeting IndexのUpdated AtまたはVersionを利用した楽観的ロックで競合を検知する。開いた後に別利用者が更新していた場合は保存を中止し、最新内容の再読込を求める。

Web Appを「デプロイしたユーザーとして実行」するか「アクセスしているユーザーとして実行」するかは、組織の権限設計、監査要件、利用者識別の必要性を実機確認してから決定する。個人アカウント依存の恒久運用にはしない。

## Google Shared Drive

- 面談記録のGoogle Docsを保管する正本領域。
- Pitchbook等の原資料を保管する正本領域。
- 組織管理下の所有・権限を前提とする。
- フォルダ構成は未決定。

## Future retrieval layer

面談記録と原資料を横断して情報を呼び出す層を将来追加する。

現時点では以下を決定しない。

- 通常検索と意味検索の具体的な組み合わせ
- Gemini / Vertex AI等の利用方法
- RAG構成
- Vector DB
- 検索UI
- 自動要約・自動タグ付け

## Architectural rule

保存・蓄積の仕組みは、将来の検索方式を変更しても作り直さなくてよいように、Google Docsと原資料を正本として単純に保つ。利用者向けUIはHTML Serviceに閉じ、Google Sheetsはマスターと索引のバックエンドとして扱う。面談とPitchbookの共通入力はブラウザ内で再利用し、利用者の二重入力を避ける。