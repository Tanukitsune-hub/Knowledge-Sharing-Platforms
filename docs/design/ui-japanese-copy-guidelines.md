# UI Japanese Copy Guidelines

Status: CURRENT
Applies to: user-facing UI text in Knowledge Share

## Goal

利用者が業務中に読んだとき、生成AIの直訳調や技術文書調を感じない、自然で短い日本語にする。

内部実装の正確さはcode / logs / developer docsで保持し、利用者向け画面では必要な意味だけを分かりやすく伝える。

## Core principles

### 1. 実装用語をそのまま表に出さない

Avoid in user-facing UI unless業務上必要:
- authoritative / 権威ある
- source / source material
- entity
- provider
- qualification
- fallback
- fail closed
- boundary
- contract
- materialize / materialization
- stale
- canonical

Natural alternatives:
- 原本
- 元のファイル
- 面談先
- AI設定
- 接続確認
- 既定値
- 安全のため結果を表示しない
- 保存先 / 対象範囲
- 読み込み

### 2. 「確認できません」を乱用しない

実際の失敗内容に合わせる。

Prefer:
- 読み込めませんでした
- 見つかりません
- 開くことができません
- 保存できませんでした
- 更新できませんでした
- 接続できませんでした

Avoid:
- 〜を確認できませんでした
when the system actually attempted a specific operation.

### 3. 結論を先に、技術説明は省く

Good:
`面談記録のGoogle Docs原本を読み込めません。Google Drive上のファイルを確認してください。`

Avoid:
`Meetingの権威あるGoogle Docを確認できないため、source materializationを継続できません。`

### 4. エラーは「何が起きたか + 必要なら次の行動」

Examples:
- `保存できませんでした。入力内容を確認して、もう一度お試しください。`
- `参照元のファイルが見つかりません。Google Drive上の原本を確認してください。`

内部error codeやraw errorはuser-facing textへ露出しない。

### 5. 英語は必要なものだけ残す

Keep where業務用語として自然:
- Meeting ID
- Document ID
- Fund / Strategy
- Status
- OpenAI
- Gemini
- API
- HEX / RGB

Translate ordinary UI words:
- Meetings -> 面談件数 / 面談記録
- Latest -> 最後の面談日
- Relationships -> 文脈に応じて日本語、または不要なら非表示
- Activity Analysis -> 面談実績の集計

### 6. 不要な留保・否定を増やさない

利用者が知る必要のない
- 〜ではありません
- 〜までは確認していません
- 〜を保証しません
を通常画面へ並べない。

安全上必要な注意だけ簡潔に表示する。

### 7. 同じ操作は同じ語彙で統一

- 追加
- 保存
- 更新
- 削除
- 復元
- 検索
- 読み込み
- 接続確認
- 同期

同じ意味で`登録` / `作成` / `追加`を無秩序に混在させない。
ただし業務上意味が違う場合は区別する。

## Review checklist

User-facing stringを変更するWorkでは:
- 日本語として声に出して自然か
- 直訳調ではないか
- 技術内部用語が漏れていないか
- 何が起きたかが一読で分かるか
- 次の操作が必要なら明確か
- 同じ概念の表記が他画面と揃っているか
を確認する。
