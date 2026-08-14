# Minimal Target Architecture

## Status

本書は2026-08-14時点の最小構成だけを示す。旧アーキテクチャは破棄済みであり、AppSheet、独自Web UI、Gemini API、Vertex AI、RAG、Vector DB等を既定の構成要素として扱わない。

## Confirmed baseline

```text
Google Sheets
  面談記録の入力画面
  + 最小限の索引
        |
        | 登録
        v
Google Apps Script
        |
        | Google Docs生成
        v
Google Shared Drive
  ├─ Meeting Records (Google Docs)
  └─ Pitchbooks / Source Materials

        ↓ 将来追加

Search / Retrieval / AI layer
  方式は未決定
```

## Component responsibilities

### Google Sheets

- 面談記録の入力画面を提供する。
- 少数の共通項目と自由記載本文を受け取る。
- 登録済み面談の最低限の索引と生成Docsへのリンクを保持する。
- 詳細なスキーマは未決定。

### Google Apps Script

- 登録操作を処理する。
- 入力値を検証する。
- 一貫したテンプレートのGoogle Docsを生成する。
- 一貫した命名規則でファイル名を付ける。
- Shared Driveへ保存する。
- Sheetの索引を更新する。

具体的なテンプレート、命名規則、エラー処理は今後決める。

### Google Shared Drive

- 面談記録のGoogle Docsを保管する正本領域。
- Pitchbook等の原資料を保管する正本領域。
- 組織管理下の所有・権限を前提とする。
- フォルダ構成は未決定。

### Future retrieval layer

面談記録と原資料を横断して情報を呼び出す層を将来追加する。

現時点では以下を決定しない。

- 通常検索と意味検索の具体的な組み合わせ
- Gemini / Vertex AI等の利用方法
- RAG構成
- Vector DB
- 専用検索UI
- 自動要約・自動タグ付け

## Architectural rule

保存・蓄積の仕組みは、将来の検索方式を変更しても作り直さなくてよいように、Google Docsと原資料を正本として単純に保つ。
