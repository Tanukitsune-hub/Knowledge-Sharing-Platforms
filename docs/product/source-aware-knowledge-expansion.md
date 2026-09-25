# Source-aware knowledge expansion

Current as of: 2026-09-25

Status: Directional design note  
Implementation contract: No  
Work ID: Not assigned

## Purpose

Alternative Assets Intelligenceを、MeetingとPitchbookを検索する仕組みから、Entityを軸に性質の異なる知識を蓄積・検索・比較できるPrivate Assets intelligence基盤へ拡張する方向性を記録する。

この文書は将来方向の正本であり、現在の実装済みarchitectureやschemaを直ちに変更するものではない。実装時は別Workでscope、storage/schema、security、migration、target-runtime evidenceを確定する。

## Product name

Current future-facing product title:

`Alternative Assets Intelligence`

The implementation plan must replace the normal user-visible `Private Assets Intelligence` title with `Alternative Assets Intelligence`.

This is a visible brand/title change only. Internal `KSP_*` / `ksp...` namespaces, APIs, schema, stable IDs, filenames, installer entrypoints, runtime resource names used as contracts, and historical evidence are not renamed merely for branding.

## Direction

将来のKnowledge Sourceは、少なくとも以下を明確に区別する。

| Source Type | 主な意味 | 典型的な入力 |
|---|---|---|
| Meeting / Memo | 自社が直接得た一次情報 | GP/LP面談、社内打合せ、面談メモ |
| Pitchbook | 相手方提供資料 | Fund deck、DD資料、マーケティング資料 |
| 内部評価 (Internal Assessment) | 自社の分析・評価・意思決定材料 | ICメモ、GP/Fund評価、ネガティブニュース・不祥事レビュー、CV見送り理由等 |
| News | 外部第三者情報 | ニュース記事、業界メディア記事 |

重要なのは、すべてを一つの「資料」として平坦化しないこと。入口・保存時の意味・AI retrieval metadata・出力provenanceをsource typeごとに保持する。

## Product UX principle

### 入口は分ける

Meeting / Memo、Pitchbook、内部評価、Newsは、それぞれ専用の登録・アップロード入口を持つ。

理由:

- 必須項目が異なる。
- authoritative sourceの形式が異なる。
- provenanceが異なる。
- confidentiality / AI利用可否が異なり得る。
- 利用者自身が登録時点で情報の性質を明示できる。

「何でもファイルアップロード」の単一画面へ統合しない。

### 記録画面のタブ構成と入力state

左サイドバーの `記録を追加` と `過去の記録` は対になるmain surfaceとして維持するが、両ページのselected tab stateは連動させない。

#### 記録を追加

```text
面談メモ | 資料保存 | ニュース | 内部評価
```

- 初回表示はclear stateとし、以前の入力を自動で復元して埋めない。既存の24時間draft自動復元は、この将来UXでは廃止する方向とする。
- semanticに共通する入力項目はpage-level shared stateとして扱い、tabを切り替えても保持する。
- shared stateは利用者が `クリア` を実行するまで維持する。
- `クリア` は4tabすべての未保存入力・選択済みファイルに適用する。安全なretry / partial-operation stateが残る場合はclearを拒否して回復を優先する。
- source固有項目は各tab固有stateとして扱う。
- exact common-field setとclear時のsource-specific state範囲はimplementation Workで確定する。
- source共通・固有の入力stateは、利用中の画面stateとして保持する。過去sessionのdraftをlocal storage等からsilent restoreする機能は持たない。

#### 過去の記録

```text
面談メモ | 保存資料 | ニュース | 内部評価
```

- `記録を追加` で選択中のtabとは独立して動作する。
- 初回tab、各page内でのtab保持方法はimplementation Workで確定する。
- 登録したSource Typeと同じ分類で検索・閲覧・編集できる構造を保つ。

#### 資料保存と面談メモ内アップロード

利用者向けのstandalone Pitchbook入口は `資料保存` と表示する。canonical Source Type / stable ID / storage contractは既存Pitchbookを継承する。

面談メモtabには、現在の関連資料アップロード機能を残す。

両経路は同じ保存資料機能を使う。

- 面談メモからアップロードした資料: 通常のPitchbook sourceとして保存し、同時に当該Meetingとのrelationshipを作る。
- `資料保存` tabから保存した資料: 同じPitchbook sourceとして保存するが、Meeting parentを必須にしない。
- file format、size limit、validation、stable `DOC-` identity、Drive保存、Index、AI sync / File Search等の基盤は共通化する。
- entry routeの違いだけで別種の資料recordを作らない。
- `過去の記録 > 保存資料` では、面談経由とstandalone経由の両方を同じ保存資料として扱い、必要に応じてMeeting relationshipを表示する。

この構造により、面談時はその場で関連資料も保存でき、面談と無関係に蓄積したい資料は `資料保存` から登録できる。

### 共通アップロード形式

利用者向けのすべてのファイルアップローダーは、対応拡張子を共通仕様にする。

対象:

- 面談メモ内の関連資料アップロード
- `資料保存`
- `ニュース`
- `内部評価`
- 将来追加される同種のKnowledge Source uploader

共通の初期allowlist:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

原則:

- extension allowlistとMIME/format validationは一つのshared contract / shared constantを正本にし、各画面で個別定義しない。
- uploaderごとの表示文言も同じformat contractから生成・同期できる設計を優先する。
- ある拡張子を追加・削除する場合は、原則として全upload surfaceへ同時に反映する。
- file size、file count、total size等のlimitまで必ず同一にするとは現時点で決めない。共通化できる場合は共通化するが、source-specificな制約が必要ならimplementation Workで明示する。
- provider側で特定formatに制約がある場合でもauthoritative Workspace保存とAI index可否は分け、unsupported provider statusを明示する。

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

## Team usage principle

Alternative Assets Intelligenceは、複数名が同時に異なる記録を入力・保存・検索・編集するteam-use業務システムとして設計する。

- 各browser tabの未保存入力は独立し、他user / 他tabと共有しない。
- shared authoritative stateのmutationだけをatomic / idempotentに保護する。
- 異なるrecordのcreateは並行利用を許容する。
- 同じrecordの同時編集はclaim + optimistic concurrencyでstale writeを拒否する。
- global lockは採番・Index commit等の短いcritical sectionに限定し、file upload / AI / Digest / Full Output materialization中は保持しない。
- authoritative source保存とderived processingを分離し、AI/Digest failureで利用者の保存済み記録をrollbackしない。
- derived processingはsource ID + revision/content hashでdeduplicate / rebuild可能にする。
- read-only search / Full Outputは原則lock-freeとし、revision token等でsource更新との整合を確認する。
- current shared-access modelではauthorized Web App usersは同じActive corpusを参照する。user-level ACLは初期scope外。
- team rollout前にmulti-session target-runtime concurrency qualificationを必須とする。

## Knowledge root folder name

Google Drive上のauthoritative source rootはproduct brandから切り離し、用途が分かる名称とする。

~~~text
記録・資料
├─ 面談記録
├─ 保存資料
├─ ニュース
└─ 内部評価（ICメモ、社内整理等）
~~~

- root直下をsource typeごとの4 folderに分ける。
- `面談記録`: Meeting Google Docs。
- `保存資料`: Pitchbook / standalone保存資料の原本。
- `ニュース`: News direct-input Docs / uploaded originals。
- `内部評価（ICメモ、社内整理等）`: Internal Assessment direct-input Docs / uploaded originals。
- new installationはこのlayoutで作成する。
- legacy exact `Private Assets Knowledge` はstored root folder IDを維持したまま `記録・資料` へin-place renameする。
- legacy `Meeting Records` / `Pitchbooks` はstored child folder IDsを維持したまま `面談記録` / `保存資料` へin-place renameする。
- custom manual renameは強制的に上書きしない。
- product titleの将来変更に連動してfolder名を再変更しない。
- Knowledge Exports等のderived artifact folderはauthoritative source root外のcurrent contractを維持する。

## Stable source identity

各Knowledge Sourceは独立したstable ID namespaceで管理する方向とする。

- Meeting / Memo: 既存の `MTG-` identityを維持する。
- Pitchbook: 既存の `DOC-` identityを維持する。
- News: 独立したNews ID namespaceを新設する。
- 内部評価: 独立したInternal Assessment ID namespaceを新設する。
- Newsや内部評価の具体的なID prefixは実装Workで確定する。

原則:

- IDは内容、filename、Entity名、日付、表示順から独立したimmutable identityとする。
- 1つのsourceが複数Entityへ紐付いてもsource IDは1つだけとする。
- source間relationはstable ID参照で表現し、source自体を複製しない。


## Entity relationship

EntityをKnowledgeの主要な横断軸とする。

- Meeting / Pitchbook / 内部評価 / NewsはいずれもCounterparty Entityへ紐付けられる。
- Newsは1件の記事を1〜複数Entityへ紐付けられることを前提とする。
- 将来のCanonical Knowledge Sourceは単一 `entity_key` 前提だけでなく、必要なsourceでは複数 `entity_keys` を扱える設計へ拡張する。
- 同一sourceをEntityごとに複製して保存する方式は採らない。

## News direction

Newsは自動ニュース収集を初期目的にしない。利用者が「残す価値がある」と判断した記事をhuman-curatedで登録する。

Newsは2つの登録経路を持つ方向とする。

1. **直接入力**
   - タイトル、公開日、媒体、URL等を入力する。
   - 記事本文を直接貼り付ける。
   - 保存時にGoogle Docs等のauthoritative sourceを作成する方向とする。

2. **ファイルアップロード**
   - PDF化された記事、Word、text file等をそのまま登録できる。
   - 対応拡張子は全upload surface共通のformat contractに従う。
   - authoritative sourceはアップロードした原本ファイルとする。
   - Drive保存・format handling・AI indexの基盤は既存の共通upload/indexing機構を最大限再利用する。

どちらの経路でも同じNews Source Type・stable ID・metadata contractへ正規化する。

共通metadataの候補:

```text
published_date
publisher
title
url
entity_keys
asset_class
fund_strategy
authoritative_file_id
```

登録後は1〜複数Entity、必要に応じAsset Class / Fund / Strategyへ紐付ける。AI利用が許可されたsourceだけderived File Searchへindexする。

Newsは `EXTERNAL_NEWS` provenanceを持ち、Meetingや内部評価の内容と混同しない。

自動crawl、RSS/API ingestion、汎用ニュース収集システム化は初期方向のNon-Goalとする。

## 内部評価 (Internal Assessment) direction

内部評価はPitchbookとは別Source Typeとする。IC Memoは内部評価の代表的な一形態であり、対象をformalなIC資料だけに限定しない。

蓄積対象の例:

- ICメモ / 投資判断資料
- GP / Fundに対する定期・随時の社内評価
- ネガティブニュース発生時の影響評価
- 不祥事・コンプライアンス事案に対する社内整理
- Continuation Vehicle等の案件を見送った理由・評価
- その他、将来のモニタリングや投資判断で参照価値のある社内見解

内部評価は現在の客観的事実としてではなく、「その時点での社内見解・評価」としてprovenanceを保持する。

### Input routes

内部評価は2つの登録経路を持つ方向とする。

1. **ファイルアップロード**
   - 全upload surface共通のformat contractに従う。
   - PDFだけでなくWord、PowerPoint、Excel、text、EML等を受け付ける。
   - authoritative sourceは原本ファイル。
   - Drive保存・format handling・File Search indexingは既存の共通upload/indexing基盤を最大限再利用する。

2. **直接入力**
   - 専用フォームに本文を直接入力して保存できる。
   - 保存時にGoogle Docs等のauthoritative sourceを作成する方向とする。
   - 短いGP/Fund評価、ニュース影響レビュー、見送り理由等をファイル作成なしで蓄積できるようにする。

どちらの経路でも同じ内部評価Source Type・stable ID・metadata contractへ正規化する。

source固有metadataの候補:

```text
assessment_type
assessment_date
entity_keys
asset_class
fund_strategy
title
decision_or_action
authoritative_file_id
```

`assessment_type` の具体的なenumは実装Workで確定する。

### Assessment target scope

内部評価は単一GPだけに固定しない。Counterparty / GP、Fund / Strategy、必要に応じ特定Vehicle・案件・事象を対象にできる方向とする。

1件の内部評価は1〜複数Entityへ紐付けられ、必要に応じ関連News、Meeting、Pitchbookをstable IDで参照できるようにする。

### Automatic Structured Internal Assessment Digest

Internal Assessment Digestはnormal userが意識・操作する機能にはしない。systemが要否判定、生成、staleness管理、検索時利用まで自動処理するderived/rebuildable layerとする。

要否のinitial default:

~~~text
materialized text < 4,000 chars
  -> NOT_REQUIRED

materialized text >= 12,000 chars
  -> REQUIRED

4,000 <= materialized text < 12,000 chars
  -> REQUIRED if:
     - IC / investment-decision class, or
     - meaningful headings / sections >= 4
  -> otherwise NOT_REQUIRED
~~~

画像主体等でmaterialization品質が低い場合は文字数だけで不要判定せず、defer / fail-closedする。

Digest候補項目:

~~~text
investment thesis / assessment purpose
manager / fund strengths
key risks
mitigants
track-record issues
terms / alignment
portfolio role
due-diligence concerns
event / issue impact
open items
conditions
decision / action（原文にある場合のみ）
supporting page / section references
~~~

内部state:

~~~text
NOT_REQUIRED
PENDING
CURRENT
STALE
DEFERRED
FAILED
~~~

検索時:

- broad overview / synthesis / 時系列変化ではCURRENT Digestをoverview / retrieval aidとして自動利用する。
- precise factual / numeric / clause-specific queryでは原本検索をprimaryとする。
- final answerはDigestだけを根拠にせず、原本へ戻ってgroundする。
- final citationはauthoritative sourceへ解決する。
- stale / failed / unavailable Digestは使わず、原本検索へtransparent fallbackする。
- Digest利用のtoggle、manual generation button、normal-user badgeは設けない。

Integrity:

- アップロード型は原本ファイル、直接入力型は保存されたGoogle Doc等がauthoritative。
- Digestは独立Knowledge Sourceではなく、独立source IDを持たない。
- 原文にない判断を生成しない。
- source content hash/versionを保持し、原本変更時は即STALE。
- Digest生成失敗やprovider未利用はsource保存・通常検索をblockしない。
- approved providerが利用可能になればeligibleな未生成/stale Digestをbackground処理で自動回収する。

## Retrieval and File Search

現在の実装は `Meeting` と `Pitchbook` をAI Source Typeとして扱う。

Pitchbookについては、対応formatをDriveから読み込み、OpenAI Vector Store / Gemini File Search Storeへderived sourceとしてindexし、Knowledge Search時にFile Searchで関連箇所を取得して回答する。

今後は同じprovider-neutral retrieval contractを内部評価 / Newsへ拡張する。

方向性:

- Storeをsource typeごとに必ず分割することは前提にしない。
- 共通Storeでも `source_type` / Entity / provenance等のmetadataで区別できる設計を基本とする。
- ただしconfidentialityやprovider policyにより、内部評価等を別Storeまたはprovider別scopeへ分離できる余地を残す。

## Output principle: evidence first, synthesis second

AI回答で異なるprovenanceを混ぜて一つの事実のように出力しない。

Default direction:

1. Source TypeごとのEvidence
2. Cross-source Synthesis

例:

```text
1. Meeting / Memo
2. Pitchbook
3. 内部評価
4. News
5. 横断整理
   - 一致している点
   - 食い違っている点
   - 新たに確認すべき点
   - 次回面談で聞くべき事項
```

質問やmodeに応じて不要なsectionは省略できるが、provenanceは保持する。

### Full Outputも同じsource scopeを使う

`全文出力` はKnowledge Searchのsource selectionと同じ4-source scopeを使用する。

- 面談メモだけでなく、保存資料を選択した場合はPitchbook本文/contentを出力対象に含める。
- News / 内部評価も選択時は本文/contentを含める。
- current implementationのPitchbook reference-only / 本文省略は将来仕様として維持しない。
- Copy / Google Docs / PDFは同じcanonical packageを使う。
- provider APIが利用できなくても成立するrouteとし、File Searchだけに依存して本文を取得しない。
- supported upload formatで本文をmaterializeできない場合はsilent omissionせず、明示的なlimitation / blockとして扱う。

## Citation / provenance UX

Citationはsource typeを利用者が即座に判別できる形にする。

表示例:

```text
[Meeting | 2026-06-11 | KKR]
[Pitchbook | KKR Asia Fund V | 2026-05]
[内部評価 | 2026-07-02 | IC Memo]
[News | Bloomberg | 2026-09-20]
```

UIでは `MEETING` / `PITCHBOOK` / `INTERNAL ASSESSMENT` / `NEWS` badge等による識別も候補とする。

AIはprovenanceを明示する。

- Meeting: 「面談では相手方が〜と説明」
- Pitchbook: 「提供資料では〜と記載」
- 内部評価: 「当時の社内評価では〜と評価」
- News: 「外部報道では〜と報道」

特に内部評価は、現在の客観的事実としてではなく、時点付きの社内見解として扱う。必要に応じてIC Memo、ニュース影響レビュー、見送り評価等のassessment typeも表示する。

## Source scope in Knowledge Search

Knowledge Searchでは、検索対象の情報ソースをcheckboxで明示選択できるようにする。

利用者向けlabel:

```text
☑ 面談メモ
☐ 保存資料
☐ ニュース
☐ 評価（IC、社内整理）
```

default stateは `面談メモ` のみcheckedとする。

対応するcanonical Source Type:

```text
面談メモ                 -> Meeting
保存資料                 -> Pitchbook
ニュース                 -> News
評価（IC、社内整理）     -> Internal Assessment
```

原則:

- checkboxは複数選択可能とする。
- 検索対象はcheckedされたSource TypeのOR条件とする。
- 少なくとも1つのSource Typeを選択した状態で検索する。すべてuncheckedのまま検索は実行しない。
- 初回表示時は毎回 `面談メモ` のみcheckedとし、過去sessionのsource scopeをsilent restoreしない。
- Source Type selectionは他のstructured filtersとは独立したfilter axisとして扱う。
- 回答では選択されたsourceを混ぜて一つの事実のように扱わず、source別Evidenceとprovenanceを維持する。
- `保存資料` は利用者向けlabelであり、canonical Source Type / stable ID / AI metadataは既存Pitchbook contractを継承する。
- `評価（IC、社内整理）` は利用者向けlabelであり、canonical Source TypeはInternal Assessmentとする。

用途例:

- default検索: 面談メモのみ
- 面談準備: 面談メモ + 保存資料 + ニュース + 評価
- 資料確認: 保存資料のみ
- 外部動向確認: ニュースのみ
- 内部判断の振り返り: 評価のみ

Source Type checkboxは、将来のOpenAI / Gemini provider-neutral filter contractへ組み込み、providerごとに意味が変わらないことを前提とする。

## Security and AI indexing policy

Authoritative保存と外部AI providerへのindex可否は別contractとする。

sourceごとに将来的に少なくとも以下を区別できることを目指す。

```text
workspace_storage = allowed
ai_index_policy = none | approved_providers | provider_specific
confidentiality = source-specific classification
```

特に:

- 内部評価はPitchbook以上に高いconfidentialityを想定する。
- News全文は媒体契約・著作権・社内AI policyとの整合確認が必要。
- 「保存可能」と「外部AIへindex可能」は同義にしない。

## Current architecture boundary

現行architectureは以下を前提としている。

- authoritative Backend baseline: 5 sheets
- AI Source Type: Meeting / Pitchbook
- Shared Drive authoritative folders: Meeting Records / Pitchbooks
- Canonical AI Sourceは基本的に単一Entity metadataを持つ

したがって、内部評価 / Newsの実装時には以下を別Workで明示判断する。

- physical storage / folder structure
- Index sheetを追加するか、共通Source Indexを設計するか
- 5-sheet baselineを変更するか
- multiple Entity relationのpersistent representation
- source-specific lifecycle
- provider index policy / Store separation
- migration / retention / permissions

内部評価やNewsを既存 `Pitchbook_Index` へ意味だけ変えて押し込むことは避ける。

## Closed directional conclusions

- 入口はsource typeごとに分ける。
- AI retrieval基盤はprovider-neutralに共通化する。
- provenanceを保存から出力まで失わない。
- AI回答はEvidence by Sourceを先に示し、その後にSynthesisする。
- 内部評価は独立Source Typeとし、IC Memoはその代表的な形態として含める。
- 内部評価はファイルアップロードと直接入力の両方を許容し、authoritative sourceとstructured digestを分離する。
- Newsは初期段階ではhuman-curated/manual ingestionを基本とする。
- Newsは1〜複数Entityへ紐付けられる。
- Authoritative保存可否とAI index可否は分ける。
- 既存Pitchbookのstorage/index contractへ内部評価 / Newsを無理に流用しない。
- `記録を追加` の共通入力項目はtab間で保持し、初回表示はclear stateとする。
- 既存の24時間draft自動復元は廃止し、過去sessionの入力を初回表示時に自動復元しない。
- `記録を追加` と `過去の記録` のselected tab stateは連動させない。
- standalone Pitchbook入口は利用者向けに `資料保存` とし、面談メモ内の資料アップロードと同じPitchbook保存contractを使う。
- Newsは直接入力とファイルアップロードの両方を許容する。
- 全upload surfaceの対応拡張子はshared format contractで一元管理する。
- Knowledge Searchのsource scopeはcheckboxで複数選択可能とし、初期値は`面談メモ`のみとする。
- Knowledge Searchの利用者向けsource labelは `面談メモ / 保存資料 / ニュース / 評価（IC、社内整理）` とする。
- Internal Assessment Digestは利用者操作なしで要否判定・生成・利用・更新を自動化する。Digestはhidden derived layerで、final citationは原本へ解決する。
- 製品は個人利用ではなく複数名同時利用を前提とし、入力state分離・atomic mutation・stale-write拒否を設計原則とする。
- 長時間処理でglobal lockを保持せず、AI/Digest等のderived processingをauthoritative saveの同期critical pathから分離する。
- 利用者向けproduct titleは `Alternative Assets Intelligence` とする。internal contractの名称はbrandingだけを理由に変更しない。
- Google Driveのauthoritative source rootのdefault名は `記録・資料` とする。product brandとは独立させる。
- `記録・資料` の直下は `面談記録 / 保存資料 / ニュース / 内部評価（ICメモ、社内整理等）` の4 folderでsource type別に分離する。

## Open implementation questions

以下は方向性として未確定であり、実装Workで決める。

- 内部評価 / News用のphysical Index schema
- Backend sheet追加 vs common Source Index
- multi-Entity relationshipのexact persistence model
- default Knowledge Search source scope
- Internal Assessment Digestのexact schema / generation timing / refresh rule
- source-specific confidentiality taxonomy
- provider-specific index policy UX
- 内部評価 / NewsをEntity Summary timelineへどの粒度で表示するか
- Newsの保存可能範囲・契約上の扱い

## Implementation plan

The reviewed implementation roadmap is recorded in:

`docs/planning/work0069-source-aware-knowledge-expansion-plan.md`

Work 0069 is planning-only. Record-layer implementation and AI/provider implementation will receive separate future Work IDs when started.

## Non-Goals of this note

- Work IDの発番
- implementation scheduling
- schema migration
- UI implementation
- source folder creation
- provider Store mutation
- company environment changes
- historical data migration
