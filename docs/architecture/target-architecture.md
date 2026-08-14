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
  └─ GP Master Management
            |
            v
Google Apps Script
  ├─ validation / registration logic
  ├─ Google Docs generation
  ├─ Pitchbook rename / numbering / save
  ├─ GP master maintenance
  └─ concurrency control
            |
      +-----+--------------------+
      |                          |
      v                          v
Google Sheets                Google Shared Drive
  ├─ GP Master                 ├─ Meeting Records
  ├─ Meeting Index             └─ Pitchbooks / Source Materials
  └─ Pitchbook Index

              ↓ 将来追加

Search / Retrieval / AI layer
  方式は未決定
```

## Component responsibilities

### Apps Script HTML Service Web App

通常利用者の入口とする。Google Sheetsを直接操作させない。

初期画面は以下の3機能を中心とする。

1. 面談記録登録
2. Pitchbook登録
3. GPマスター管理

Web Appは利用者ごとにコピーしない。組織管理下の1つの共通デプロイとURLを複数人で利用し、GP Master、各Index、Shared Drive上の正本を共有する。

各利用者のブラウザ上の入力状態は独立させ、同時に複数人が別々の登録作業を行える前提とする。

Web Appを「デプロイしたユーザーとして実行」するか「アクセスしているユーザーとして実行」するかは、組織の権限設計、監査要件、利用者識別の必要性を実機確認してから決定する。個人アカウント依存の恒久運用にはしない。

### Meeting registration

- 少数の共通項目と自由記載本文を受け取る。
- GPは共通GPマスターのActiveなGPから選択する。
- GPが存在しない場合は新規GP追加を可能にする。
- Apps Scriptが一貫したテンプレートのGoogle Docsを生成する。
- 生成DocsをShared Driveへ保存し、Meeting Indexへ参照を記録する。

面談項目とDocs命名規則の最終形は未決定。

### Pitchbook registration

- ドラッグ＆ドロップまたはファイル選択で登録する。
- 複数ファイルを一度に選択できる。
- 利用者入力は原則として日付、GP、アセットクラスの3項目だけとする。
- 複数ファイルには同じ3項目を共通適用する。
- 保存ファイル名を利用者に自由入力させない。
- Apps Scriptが規則的な保存名を生成し、同一条件の複数ファイルを連番で識別する。
- 元の拡張子を維持する。
- 保存後、Pitchbook Indexへ最低限の参照情報を記録する。

命名形式の細部、連番桁数、後日追加時の採番ルール等は実装設計時に確定する。

### GP Master

Google Sheets上に共通のGPマスターを持ち、面談登録とPitchbook登録の両方から参照する。

最低限の論理項目は以下。

- GP ID: 作成後に変えない内部識別子
- GP Name: 利用者に表示する名称
- Status: Active / Inactive

Web AppのGPマスター管理画面から、新規追加、名称変更、無効化、再有効化を行う。

過去データはGP名ではなくGP IDで紐付ける。名称変更で参照関係を壊さない。無効化したGPは新規入力の選択肢から外すが、既存データは維持する。参照済みGPの物理削除は初期機能に含めない。

### Google Sheets

バックエンドの構造化データと索引を保持する。通常利用者が直接編集する前提にしない。

初期構成は以下を想定する。

- GP Master
- Meeting Index
- Pitchbook Index

各Indexの最終カラム構成は未決定。ただし、同一面談の同時編集を検知するため、Meeting Indexには更新時刻または同等のVersion情報を保持する。

### Google Apps Script

- HTML画面のサーバー側処理を担当する。
- 入力値を検証する。
- GP Masterを読み書きする。
- 面談登録時にGoogle Docsを生成・保存する。
- Pitchbook登録時にファイル名を生成・連番付与し、Shared Driveへ保存する。
- 各Indexを更新する。
- 複数ユーザーの同時実行による競合を防ぐ。

具体的なエラー処理、アップロード上限、大容量ファイル対応等は実装設計時に確定する。

## Multi-user concurrency rules

複数人が同じWeb Appを同時利用することを通常ケースとして扱う。

### Shared writes

以下のような共有状態を変更する短い処理ではApps ScriptのLockServiceを用いて排他制御する。

- GPの新規追加やマスター更新
- Meeting ID等の一意ID採番
- Pitchbook連番の取得・確定
- 同一処理内で整合性が必要なIndex更新

ファイルアップロードやDocs本文生成など処理全体を長時間ロックせず、重複や競合を防ぐために必要なクリティカルセクションだけをロックする。

### Concurrent editing of one meeting

同じ面談記録を複数人が同時に開く可能性には、楽観的ロックで対応する。

1. 編集画面を開く際に、Meeting IndexのUpdated AtまたはVersionを読み込む。
2. 更新時に現在のUpdated At / Versionと比較する。
3. 開いた後に別利用者が更新していた場合は保存を中止する。
4. 利用者に最新内容を再読込して確認するよう案内する。

後から保存した利用者の内容で無条件に上書きする実装にはしない。

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

保存・蓄積の仕組みは、将来の検索方式を変更しても作り直さなくてよいように、Google Docsと原資料を正本として単純に保つ。利用者向けUIはHTML Serviceに閉じ、Google Sheetsはマスターと索引のバックエンドとして扱う。複数人利用のために利用者ごとのコピーを作らず、共通Web Appと共有バックエンドの整合性を必要最小限の競合制御で守る。
