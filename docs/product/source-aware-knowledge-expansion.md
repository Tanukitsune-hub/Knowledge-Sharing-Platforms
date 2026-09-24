# Source-aware knowledge expansion

Current as of: 2026-09-25

Status: Directional design note  
Implementation contract: No  
Work ID: Not assigned

## Purpose

Private Assets Intelligenceを、MeetingとPitchbookを検索する仕組みから、Entityを軸に性質の異なる知識を蓄積・検索・比較できるPrivate Assets intelligence基盤へ拡張する方向性を記録する。

この文書は将来方向の正本であり、現在の実装済みarchitectureやschemaを直ちに変更するものではない。実装時は別Workでscope、storage/schema、security、migration、target-runtime evidenceを確定する。

## Direction

将来のKnowledge Sourceは、少なくとも以下を明確に区別する。

| Source Type | 主な意味 | 典型的な入力 |
|---|---|---|
| Meeting / Memo | 自社が直接得た一次情報 | GP/LP面談、社内打合せ、面談メモ |
| Pitchbook | 相手方提供資料 | Fund deck、DD資料、マーケティング資料 |
| IC Memo | 自社の分析・評価・意思決定材料 | ICメモ、投資判断資料 |
| News | 外部第三者情報 | ニュース記事、業界メディア記事 |

重要なのは、すべてを一つの「資料」として平坦化しないこと。入口・保存時の意味・AI retrieval metadata・出力provenanceをsource typeごとに保持する。

## Product UX principle

### 入口は分ける

Meeting / Memo、Pitchbook、IC Memo、Newsは、それぞれ専用の登録・アップロード入口を持つ。

理由:

- 必須項目が異なる。
- authoritative sourceの形式が異なる。
- provenanceが異なる。
- confidentiality / AI利用可否が異なり得る。
- 利用者自身が登録時点で情報の性質を明示できる。

「何でもファイルアップロード」の単一画面へ統合しない。

### 検索基盤は共通化する

UIと保存contractはsource typeごとに分ける一方、AI retrievalはprovider-neutralなCanonical Knowledge Sourceへ正規化する。

方向性として共通metadataに以下を持たせる。

```text
source_type
source_id
date
entity_keys
asset_class
fund_strategy
provenance
confidentiality
ai_index_policy
authoritative_file_id
content_hash
```

source固有の項目は各sourceのcontractに残す。

## Entity relationship

EntityをKnowledgeの主要な横断軸とする。

- Meeting / Pitchbook / IC Memo / NewsはいずれもCounterparty Entityへ紐付けられる。
- Newsは1件の記事を1〜複数Entityへ紐付けられることを前提とする。
- 将来のCanonical Knowledge Sourceは単一 `entity_key` 前提だけでなく、必要なsourceでは複数 `entity_keys` を扱える設計へ拡張する。
- 同一sourceをEntityごとに複製して保存する方式は採らない。

## News direction

Newsは自動ニュース収集を初期目的にしない。

初期方向:

1. 利用者が「残す価値がある」と判断したニュースを選ぶ。
2. タイトル、公開日、媒体、URL等を入力する。
3. 本文を貼り付ける。
4. 1〜複数Entity、必要に応じAsset Class / Fund / Strategyへ紐付ける。
5. authoritative contentをGoogle Workspaceに保存する。
6. AI利用が許可されたsourceだけderived File Searchへindexする。

Newsは `EXTERNAL_NEWS` provenanceを持ち、MeetingやIC Memoの内容と混同しない。

自動crawl、RSS/API ingestion、汎用ニュース収集システム化は初期方向のNon-Goalとする。

## IC Memo direction

IC MemoはPitchbookとは別Source Typeとする。

理由:

- Pitchbookは相手方提供資料。
- IC Memoは自社の内部分析・評価・意思決定材料。
- AI出力時の意味と扱いが異なる。

入力の方向:

- PDF uploadを中心とする。
- authoritative sourceは原本PDF。
- UI、metadata、lifecycleはIC Memo専用とする。
- PDF保存・Drive handling・File Search indexing等の技術基盤はPitchbookの既存機構を最大限再利用してよい。

### Structured IC Memo Digest

IC Memoは原本PDFのFile Searchだけに依存せず、derived structured digestを持たせる方向を優先する。

候補項目:

```text
investment thesis
manager / fund strengths
key risks
mitigants
track-record issues
terms / alignment
portfolio role
due-diligence concerns
open items
IC conditions
recommendation / decision（原文にある場合のみ）
supporting page references
```

原則:

- 原本PDFがauthoritative。
- Digestはderived/rebuildable。
- 原文にない判断を生成しない。
- 可能な限りpage-groundedにする。
- Digestは原本を置き換えない。
- Knowledge SearchはDigestで全体像をつかみ、必要に応じ原本File Searchの根拠へ戻れることを目指す。

## Retrieval and File Search

現在の実装は `Meeting` と `Pitchbook` をAI Source Typeとして扱う。

Pitchbookについては、対応formatをDriveから読み込み、OpenAI Vector Store / Gemini File Search Storeへderived sourceとしてindexし、Knowledge Search時にFile Searchで関連箇所を取得して回答する。

今後は同じprovider-neutral retrieval contractをIC Memo / Newsへ拡張する。

方向性:

- Storeをsource typeごとに必ず分割することは前提にしない。
- 共通Storeでも `source_type` / Entity / provenance等のmetadataで区別できる設計を基本とする。
- ただしconfidentialityやprovider policyにより、IC Memo等を別Storeまたはprovider別scopeへ分離できる余地を残す。

## Output principle: evidence first, synthesis second

AI回答で異なるprovenanceを混ぜて一つの事実のように出力しない。

Default direction:

1. Source TypeごとのEvidence
2. Cross-source Synthesis

例:

```text
1. Meeting / Memo
2. Pitchbook
3. IC Memo
4. News
5. 横断整理
   - 一致している点
   - 食い違っている点
   - 新たに確認すべき点
   - 次回面談で聞くべき事項
```

質問やmodeに応じて不要なsectionは省略できるが、provenanceは保持する。

## Citation / provenance UX

Citationはsource typeを利用者が即座に判別できる形にする。

表示例:

```text
[Meeting | 2026-06-11 | KKR]
[Pitchbook | KKR Asia Fund V | 2026-05]
[IC Memo | 2026-07-02]
[News | Bloomberg | 2026-09-20]
```

UIでは `MEETING` / `PITCHBOOK` / `IC` / `NEWS` badge等による識別も候補とする。

AIはprovenanceを明示する。

- Meeting: 「面談では相手方が〜と説明」
- Pitchbook: 「提供資料では〜と記載」
- IC Memo: 「当時の社内ICでは〜と評価」
- News: 「外部報道では〜と報道」

特にIC Memoは、現在の客観的事実としてではなく、時点付きの内部評価として扱う。

## Source scope in Knowledge Search

Knowledge Searchでは将来的にsource scopeを選択できる方向とする。

例:

```text
☑ Meeting / Memo
☑ Pitchbook
☑ IC Memo
☑ News
```

用途例:

- 面談準備: 全source
- IC review: Meeting + Pitchbook + IC Memo
- 外部動向確認: News
- 内部判断の振り返り: IC Memo

default scopeは実装WorkでUXと検索costを踏まえて決める。

## Security and AI indexing policy

Authoritative保存と外部AI providerへのindex可否は別contractとする。

sourceごとに将来的に少なくとも以下を区別できることを目指す。

```text
workspace_storage = allowed
ai_index_policy = none | approved_providers | provider_specific
confidentiality = source-specific classification
```

特に:

- IC MemoはPitchbook以上に高いconfidentialityを想定する。
- News全文は媒体契約・著作権・社内AI policyとの整合確認が必要。
- 「保存可能」と「外部AIへindex可能」は同義にしない。

## Current architecture boundary

現行architectureは以下を前提としている。

- authoritative Backend baseline: 5 sheets
- AI Source Type: Meeting / Pitchbook
- Shared Drive authoritative folders: Meeting Records / Pitchbooks
- Canonical AI Sourceは基本的に単一Entity metadataを持つ

したがって、IC Memo / Newsの実装時には以下を別Workで明示判断する。

- physical storage / folder structure
- Index sheetを追加するか、共通Source Indexを設計するか
- 5-sheet baselineを変更するか
- multiple Entity relationのpersistent representation
- source-specific lifecycle
- provider index policy / Store separation
- IC Memo Digest生成・更新contract
- migration / retention / permissions

IC MemoやNewsを既存 `Pitchbook_Index` へ意味だけ変えて押し込むことは避ける。

## Closed directional conclusions

- 入口はsource typeごとに分ける。
- AI retrieval基盤はprovider-neutralに共通化する。
- provenanceを保存から出力まで失わない。
- AI回答はEvidence by Sourceを先に示し、その後にSynthesisする。
- IC Memoは独立Source Typeとする。
- IC Memo原本PDFはauthoritative、structured digestはderivedとする。
- Newsは初期段階ではhuman-curated/manual ingestionを基本とする。
- Newsは1〜複数Entityへ紐付けられる。
- Authoritative保存可否とAI index可否は分ける。
- 既存Pitchbookのstorage/index contractへIC Memo / Newsを無理に流用しない。

## Open implementation questions

以下は方向性として未確定であり、実装Workで決める。

- IC Memo / News用のphysical Index schema
- Backend sheet追加 vs common Source Index
- Shared Drive folder hierarchy
- multi-Entity relationshipのexact persistence model
- default Knowledge Search source scope
- IC Memo Digestのexact schema / generation timing / refresh rule
- source-specific confidentiality taxonomy
- provider-specific index policy UX
- IC Memo / NewsをEntity Summary timelineへどの粒度で表示するか
- Newsの保存可能範囲・契約上の扱い

## Non-Goals of this note

- Work IDの発番
- implementation scheduling
- schema migration
- UI implementation
- source folder creation
- provider Store mutation
- company environment changes
- historical data migration
