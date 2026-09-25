# Work 0069 — Source-aware knowledge expansion implementation plan

WORK_ID: 0069
DISPATCH_ID: N/A
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
VALIDATION_TIER: TIER_1_LOW
ROUTE: A

Current as of: 2026-09-25

## Primary Outcome

2026-09-25までのユーザーとの設計対話と現在のGitHub正本を突き合わせ、Alternative Assets Intelligenceへ名称変更した上で、以下4つのKnowledge Sourceへ拡張するための実装順序・境界・Acceptance Evidenceを、取りこぼしなく実装可能な計画として固定する。

利用者向けsource:

~~~text
面談メモ
保存資料
ニュース
評価（ICメモ、社内整理等）
~~~

canonical source:

~~~text
Meeting
Pitchbook
News
Internal Assessment
~~~

本Workはplanningのみ。production source、schema、deployment、provider Store、会社データは変更しない。

## Acceptance Evidence

- 現行GitHub implementation / architectureと設計対話の決定事項を照合済み。
- API credentialがなくても進められるrecord/storage workと、credential / data-policy承認が必要なAI workを分離。
- current 5-sheet/schema8、Meeting/Pitchbook AI contract、24h draft、upload format、Knowledge Search / Full Outputの現状差分を明示。
- source ID、record tabs、shared input state、upload contract、News/Internal Assessment input routes、multi-Entity relation、Knowledge Search source scope、provenance outputを計画に含む。
- migration / validation / distribution / company update pathを含む。
- unresolved事項はimplementation blockerとoptional follow-upに分離。

## Evidence Hierarchy

1. ユーザーのこの会話での明示決定
2. docs/product/source-aware-knowledge-expansion.md
3. current main production source
4. docs/product/vision.md / docs/architecture/target-architecture.md
5. historical planning / accepted evidence

## Fastest Safe Decisive Action

AI providerを待たず、まずauthoritative Workspace record layerを完成させる。その後、approved API credentialとsource-type別AI利用許可が揃った時点でprovider-neutral AI layerを拡張する。

## Current Baseline Confirmed

### Runtime / storage

Current product:

- release: 0.1.2
- schema: 8
- authoritative Backend: exactly 5 sheets
  - Counterparty_Master
  - Option_Master
  - Meeting_Index
  - Pitchbook_Index
  - Settings
- authoritative Drive source folders:
  - Meeting Records
  - Pitchbooks
- Restricted Auditは別Spreadsheet。

### Current IDs

- Meeting: MTG-xxxxxx
- Pitchbook: DOC-xxxxxx
- Counterparty: CP-xxxxxx

News / Internal Assessmentにはまだauthoritative source type / ID / indexは存在しない。

### Current browser registration state

Current clientには:

~~~text
KSP_SHARED_DRAFT_KEY
KSP_MEETING_DRAFT_KEY
KSP_DRAFT_TTL_MS = 24h
~~~

があり、bootstrapでMeeting / shared draftをlocalStorageからsilent restoreする。

一方、以下は単なるdraftではなく、重複防止・partial failure recoveryに使う安全機構である。

- Meeting retry context
- unknown outcome latch
- Pitchbook slot / retry state

将来UXで廃止するのは「過去sessionの入力を24時間自動復元するdraft behavior」であり、in-flight operation recovery / idempotency stateまで削除しない。

### Current shared registration fields

Current clientのshared fields:

~~~text
date
assetClassId
capitalTypeId
fundStrategy
~~~

capitalTypeIdはnormal user surfaceでは現在hidden。将来のpage-level shared stateは、意味・cardinalityが各tabで一致するfieldだけを共有する。

CounterpartyはMeeting/Pitchbookではsingle、News/Internal Assessmentではmulti-Entityを許容するため、全tab共通fieldにはしない。

### Current upload formats

Client allowlist / File Search format registryは以下を実質サポート済み。

~~~text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
~~~

ただしclient KSP_ALLOWED_EXTENSIONS とserver KSP_AI_FORMAT_REGISTRY が別定義なので、将来はshared contractへ収束させる。

### Current AI retrieval

Canonical AI Source Typeは現在:

~~~text
Meeting
Pitchbook
~~~

PitchbookはDrive原本を読み込み、formatに応じてbinaryまたはnormalized textでOpenAI Vector Store / Gemini File Search Storeへindexする実装が存在する。

Knowledge SearchはFile Searchを使い、provider citationsをauthoritative Meeting / Pitchbook sourceへ戻す。

Current Knowledge Search filterはsingle sourceTypeを前提としている。

Current Full OutputはMeeting本文を中心にmaterializeし、Pitchbookはauthoritative file identityを確認したうえでreference-onlyとして扱うpathがある。これは将来仕様として維持する境界ではなく、明示的に解消するproduct gapとする。保存資料を選択した場合は本文/contentを無視せず、他sourceと同じsource-scope contractでFull Outputへ含める。

## Closed Product Decisions

### 1. Source Typeは4つ

利用者向け分類:

~~~text
面談メモ
保存資料
ニュース
評価（ICメモ、社内整理等）
~~~

canonical:

~~~text
Meeting
Pitchbook
News
Internal Assessment
~~~

情報の性質を平坦化しない。

- Meeting: 相手との直接コミュニケーション
- Pitchbook: 相手方提供資料
- News: 外部第三者情報
- Internal Assessment: 時点付きの社内見解・分析・判断

### 2. Sourceごとに独立stable ID

既存 MTG- / DOC- は維持。

News / Internal Assessmentは独立namespaceを持つ。具体的prefixはrecord-layer implementation開始時に固定する。

ID原則:

- immutable
- filename / Entity name / date / row / sort orderから独立
- multi-Entityでもsource IDは1つ
- relationはID参照で持ち、source複製で表現しない

### 3. Record navigation

Top-level sidebarは引き続き:

~~~text
記録を追加
過去の記録
~~~

を維持。

記録を追加 tabs:

~~~text
面談メモ | 資料保存 | ニュース | 評価（ICメモ、社内整理等）
~~~

過去の記録 tabs:

~~~text
面談メモ | 保存資料 | ニュース | 評価（ICメモ、社内整理等）
~~~

両pageのselected tab stateは連動させない。両方とも初期tabは面談メモを実装defaultとする。

### 4. Shared input state

記録を追加 page内で、semanticに共通するfieldはtabを切り替えても保持する。

初期実装のshared state:

~~~text
date
assetClassId
fundStrategy
~~~

existing hidden capitalTypeId は既存値保持のためinternal stateとして扱えるが、normal-user共通入力として再露出しない。

Rules:

- app/pageの初回表示はclear state。
- 過去sessionの24h draftは自動復元しない。
- tab switchではshared stateを保持。
- record保存後もshared stateは保持。
- explicit クリアでshared stateを消す。
- source-specific fieldsは各tab独立。
- browser reload / new sessionを跨いでshared stateをsilent restoreしない。
- in-flight retry / unknown-outcome / partial-upload recovery stateは安全機構として残す。

クリア は4tabすべてに適用する。shared fieldsに加え、面談メモ・資料保存・ニュース・評価（ICメモ、社内整理等）の未保存source-specific入力、選択済みファイル、通常の一時UI stateをまとめてclearする。in-flight retry / unknown-outcome / partial-upload recovery等の安全stateが残る場合は、既存と同様にclearを拒否して先に回復を要求し、重複・orphanを生まない。

### 5. Meeting内uploadとstandalone資料保存

Meeting tabの既存Pitchbook uploadは残す。

同時に 資料保存 tabをstandalone Pitchbook入口として提供する。

両者は同じcanonical Pitchbook / DOC- / Drive / Pitchbook_Index / AI source contractを使う。

Difference only:

- Meeting経由: Pitchbook保存 + Meeting relation
- 資料保存経由: Pitchbook保存、Meeting parent不要

entry routeだけで別record typeを作らない。

### 6. Upload extension contractは全surface共通

対象:

- Meeting内関連資料
- 資料保存
- News upload
- Internal Assessment upload
- future equivalent uploaders

allowlist:

~~~text
.pdf / .pptx / .xlsx / .docx / .txt / .eml
~~~

server-side shared format registryを正本とし、browser accept / validation / help copyを同じcontractから供給する。

file count / total sizeまで必ず同一にすることは未決。extension contractだけは全surface共通。

### 7. News

Newsはhuman-curated。

Input routes:

- direct input
- file upload

Direct input:

- 公開日
- 媒体
- title
- URL（任意）
- 1〜複数Entity
- Asset Class（任意）
- Fund / Strategy（任意）
- article body

保存時にGoogle Docs等をauthoritative sourceとして作る。

Upload:

- PDF化記事、DOCX、TXT等をcommon upload contractで登録。
- uploaded originalがauthoritative。

Both routes normalize to one News source / stable ID / lifecycle。

Automatic crawl / RSS / News API ingestionはinitial Non-Goal。

### 8. Internal Assessment

User-facing labelは各surfaceで統一する。

~~~text
評価（ICメモ、社内整理等）
~~~

canonical Source Typeは Internal Assessment のまま維持する。

対象はformal ICだけに限定しない。

Examples:

- IC memo / investment decision
- GP / Fund assessment
- negative news review
- misconduct / compliance incident review
- Continuation Vehicle等の見送り理由
- other internal assessment / 社内整理

Input routes:

- direct input
- file upload

Uploadはcommon format contractを使う。Direct inputはGoogle Docs等をauthoritative sourceとして作る。

Internal Assessmentは現在の客観的事実ではなく「その時点の社内評価」としてprovenanceを保持する。

assessment typeの初期候補:

~~~text
IC / 投資判断
ネガティブニュース・不祥事
CV / 案件見送り
GP / Fund評価
その他社内整理
~~~

enum / codeはimplementation時に英語固定codeを確定する。

### 9. Multi-Entity

News / Internal Assessmentは1〜複数Counterparty Entityへ紐付け可能。

authoritative Indexではstable CP IDsのbounded listを持つ。

Provider Store側で同じsourceをEntityごとに複製しない。

Entity filter時はauthoritative Indexでmatching source IDsをresolveし、その source_id setをprovider filterへ渡す方式を優先する。これによりOpenAI metadata attribute ceilingやarray equality limitationを避ける。

### 10. Knowledge Search source checkboxes

UI:

~~~text
☑ 面談メモ
☐ 保存資料
☐ ニュース
☐ 評価（ICメモ、社内整理等）
~~~

defaultは毎回Meeting only。

Rules:

- multi-select
- checked Source TypesのOR
- 0 selectedではsearch不可
- past session selectionをsilent restoreしない
- Date / Entity / Asset Class等とは独立filter axis
- provider-neutral semantics
- legacy scalar sourceType はcompatibility layerで受けつつcanonical requestは sourceTypes[] へ移行する

### 11. Source-separated answer / provenance

AI outputはdifferent provenanceを一つの事実として混ぜない。

Default answer structure:

~~~text
面談メモ
保存資料
ニュース
評価（ICメモ、社内整理等）
横断整理
  - 一致
  - 相違 / 食い違い
  - 追加確認事項
  - 次回面談論点
~~~

selected sourceが1種類なら不要section / 横断整理は省略可能。

Citationはsource labelを明示する。

Examples:

~~~text
[面談メモ | date | Entity]
[保存資料 | title/fund | date]
[ニュース | publisher | date]
[評価 | assessment type | date]
~~~

Internal Assessmentは「当時の社内評価」として表現する。

### 12. Full Output source parity

`全文出力` はAI provider APIとは独立したsource-reading routeとして、選択されたSource Typeのcontentを無視しない。

Closed rules:

- Knowledge Searchのsource checkboxと同じsource scopeを使う。
- `保存資料` を選択した場合、Pitchbook本文/contentをreference-onlyで省略しない。
- News / Internal Assessmentが追加された後は、それらも選択時に本文/contentを含める。
- sourceごとにsection/provenanceを分け、異なるsourceを一つの事実として平坦化しない。
- Copy / Google Docs / PDFは同じcanonical package / fingerprintを使う。
- API credentialが無くてもFull Outputは成立するため、provider File Searchだけに依存したmaterializationにしない。
- current binary formatの `.pdf` / `.pptx` / `.docx` はAI indexingではDIRECT_BINARYだが、現行Full Outputにはprovider-independent本文抽出がない。この差分は実装上のdependencyであり、本文を省略してAcceptanceする理由にはしない。
- implementationではWorkspace-native conversion/extractionまたはbounded parser等のdeterministicなprovider-independent materializerを採用し、unsupportedな場合は明示的にblock/limitationとして扱う。

### 13. Workspace保存とAI indexは分離

Authoritative source captureはprovider availabilityに依存させない。

API keyが無くてもMeeting / Pitchbook / News / Internal Assessmentを継続蓄積できる。

AI index開始条件:

1. approved provider API credential
2. provider/store ownership/configuration
3. source-type別の外部AI利用許可
4. required billing / security / copyright policy confirmation

API key aloneでInternal Assessmentやlicensed News全文を自動indexしない。

## Team-first operating model

本製品は個人用入力ツールではなく、複数名が同一のauthoritative Backend / Shared Driveを同時利用する業務システムとして設計・最適化する。

Closed principles:

- normal user input stateはbrowser tab / session localとし、他user・他tabへ漏らさない。
- serverは利用者の長寿命UI stateを保持せず、各mutationをrequest-scoped / idempotentに扱う。
- stable ID採番、Index commit、relation mutation、lifecycle change等の共有状態変更だけを短いcritical sectionで保護する。
- file upload、document materialization、AI call、Digest generation等の長時間処理中にglobal ScriptLockを保持しない。
- createは異なるrecordなら並行利用を許容し、同一record editだけoptimistic concurrency / claimで競合制御する。
- last-write-winsを採らず、stale writerをfail closedする。
- user-facing save完了はauthoritative Workspace保存を基準にし、Audit / AI index / Digest等のderived処理失敗で正本保存をrollbackしない。
- background / derived workはsource ID + content hash / revision tokenでdeduplicateし、複数user操作から同じ派生処理が重複しても最終状態を一意に収束させる。
- read-only search / Full Outputは原則lock-freeとし、preview fingerprint / revision tokenでsnapshot driftを検知する。
- Shared master更新後、他userのopen pageがstale optionを持つ可能性を前提に、commit時はserver-side current masterを再検証する。必要時のみ再読込を促す。
- duplicate-looking new recordsは自動mergeしない。semantic duplicate detectionを入れる場合もwarningに留め、authoritative mergeは別操作とする。
- all authorized Web App usersが同じActive source corpusへアクセスするcurrent shared-access modelを前提とする。user-level source ACLは具体的要件が出るまで導入しない。
- Audit actorは取得可能なemailを優先し、取得不能時はtemporary active-user key等の既存fallbackを維持する。team rolloutではactor traceabilityを実機確認する。

Performance / contention design:

- global locksは採番・CAS・Index row reservation等の最短区間だけ。
- per-record claim / tokenをglobal lockより優先できる箇所では採用する。
- UIは他userの処理待ちを常時表示する共同編集型にはしない。通常は独立操作し、保存時にのみ競合を解決する。
- AI sync / Digestはsave requestの同期critical pathに入れない。
- 大量Full Output / materializationはrecord create/edit lockと分離する。
- concurrency protectionはsource typeごとに別実装を乱立させず、共通mutation primitivesへ寄せる。

## Multi-user concurrency contract

将来の通常運用では、複数のauthorized usersが同じWeb Appを同時に開き、それぞれ別のsourceを入力・登録できることを必須要件とする。

### Current implementation assessment

Current pilot deploymentは `execute as self / access self only` であり、実際の複数利用者アクセスはまだproduction-qualifiedされていない。multi-user behaviorを「実機で確認済み」とは扱わない。

一方、authoritative write pathには既にconcurrency protectionがある。

- Meeting ID allocation: `LockService.getScriptLock()` 下で `NEXT_MEETING_ID` を採番。
- Meeting Google Doc create/reuse: ScriptLockで同名作成raceを防止。
- Meeting Index append: ScriptLock + unique `Meeting_ID` check。
- Pitchbook batch / `DOC-` reservation: ScriptLock下でbatch/document countersとIndex reservationを更新。
- Pitchbook upload: per-reservation claim + ScriptLockでclaim/updateを保護。
- Meeting/Pitchbook maintenance edit: edit claim + Version / `Updated_At` compare-and-swap。stale writerはfail closed。
- ScriptLock取得に失敗した場合はtimeout errorとし、silent overwriteしない。

したがって、異なるrecordを同時登録する場合、各利用者の入力sessionは独立し、server側の短いcritical writeだけが直列化される設計である。

### Browser state isolation

Current 24h draftはbrowser `localStorage` を使うため、別device / 別browser profileでは独立するが、同じbrowser profile / originの複数tabでは共有され得る。

Work Aでは24h silent draft restoreを廃止し、通常の未保存入力stateはtab-localなin-memory stateへ移す。

Closed rules:

- user Aのtab入力がuser Bの画面へ現れない。
- 同一browser profileで複数tabを開いても通常input stateを共有しない。
- `クリア` はそのtabの4-source Add stateだけに作用し、他user / 他tabのinput stateを変更しない。
- retry / unknown-outcome / partial-upload recovery tokenはrecord-operation単位の安全stateとして保持し、通常input stateと分離する。

### Same-record conflict

異なるrecordの同時createは許容する。

同じ既存recordを複数利用者が同時編集する場合はlast-write-winsにしない。

- edit claimを優先。
- commit時にVersion / `Updated_At` を再確認。
- stale editorは保存を拒否し、「他の利用者が先に更新しています。最新情報を読み直してください。」相当でfail closed。
- source update / lifecycle / relationship updateでも同等のCAS原則を維持する。

### Duplicate semantic submissions

同じ内容を別利用者が意図的または誤って新規登録した場合、content equalityだけで自動mergeしない。それぞれ別stable IDを持つnew recordとして扱う。

### Work A concurrency acceptance

Record-layer WorkのAcceptanceへ以下を追加する。

- 2つ以上の独立browser sessionsから異なるMeetingをnear-simultaneous createし、unique IDs / distinct Docs / distinct Index rowsを確認。
- standalone Pitchbook / News / Internal Assessmentについてもnear-simultaneous createでstable ID collision / lost row / cross-user field bleed = 0。
- concurrent different-source createでshared counters / resource stateが破損しない。
- same-record concurrent editは1件がacceptedされた後、stale commitがfail closed。
- one user's `クリア` が別sessionへ影響しない。
- lock timeout / interrupted requestでsilent overwriteせず、safe error / retry pathへ入る。
- Auditのactor / target IDが可能な範囲で各operationに対応し、authoritative record successをaudit failureがrollbackしない既存policyを維持する。

このmatrixはmulti-user accessを実際に許可したcompany rollout時にもtarget-runtimeで再qualificationする。

### 14. Product title rename

利用者向けproduct titleを次へ変更する。

~~~text
Private Assets Intelligence
-> Alternative Assets Intelligence
~~~

Scope:

- Web Appのbrowser `<title>`
- main header / brand title
- current user-facing generated artifact / print header等でproduct titleを表示している箇所
- current operator-facing docsで、現行product名として表示している安全な箇所

Preserve:

- `KSP_*` / `ksp...` internal namespace
- function / API / property key
- sheet tab names
- stable IDs / prefixes
- bundle filename / installer entrypoint
- existing Drive resource names等、名前参照がruntime contractになっているresource
- historical Work / completion evidence

旧Work0058のvisible-brand方針を継承し、表示名変更のためだけにschema migration、resource rename、data migrationを行わない。

Acceptance:

- normal Web App header = `Alternative Assets Intelligence`
- browser title = `Alternative Assets Intelligence`
- current user-visible product titleに `Private Assets Intelligence` が残らない
- internal contract rename = 0
- historical evidence rewrite = 0

### 15. Knowledge root folder name

Google Drive上のauthoritative source root folderはproduct titleから切り離し、用途が分かる名称へ変更する。

Accepted default:

~~~text
記録・資料
~~~

このroot folderにはauthoritative sourceをsource type別の4つの直下folderへ分けて格納する。

Migration rule:

- new installation: root `記録・資料` を作成し、その直下に `面談記録` / `保存資料` / `ニュース` / `評価（ICメモ、社内整理等）` を作成する。
- existing installation: stored `knowledgeRootFolderId` と各child folder IDをauthoritative identityとして使う。
- existing rootのnameがlegacy exact `Private Assets Knowledge` の場合だけ、同じfolder IDをin-placeで `記録・資料` へrenameする。
- existing `Meeting Records` は同じfolder IDのまま `面談記録` へrenameする。
- existing `Pitchbooks` は同じfolder IDのまま `保存資料` へrenameする。
- `ニュース` / `評価（ICメモ、社内整理等）` はnew source folderとしてroot直下へ追加する。
- already target nameならno-op。
- 利用者がrootまたはexisting childを別名へ手動rename済みなら、そのcustom nameを強制上書きしない。stored IDを維持し、必要ならwarningのみ。
- renameのためにfolderを新規作成、移動、copy、source file再配置しない。
- child folder IDs / source file IDs / Settingsのstored resource IDsを変更しない。

Reason:

- folder名だけで「面談メモや資料等を保存する場所」と理解できる。
- product title `Alternative Assets Intelligence` とcoupleしないため、将来product renameがあってもDrive structureを再renameする必要がない。
- current setupはstored resource IDをauthoritativeに扱うため、identity-preserving renameと整合する。

Acceptance:

- fresh install root folder = `記録・資料`
- legacy exact-name rootはsame folder IDのままrename
- child/source IDs unchanged
- custom renamed rootはpreserved
- duplicate root folder creation = 0

## Proposed Record-layer Architecture

### Backend

次のnon-AI implementation Workでは、existing 5 sheetsへ無理にNews / Internal Assessmentを押し込まず、source-specific Indexを追加する案をdefaultとする。

~~~text
Counterparty_Master
Option_Master
Meeting_Index
Pitchbook_Index
News_Index
Internal_Assessment_Index
Settings
~~~

→ Backend 7 sheets。

Reason:

- source-specific validation / lifecycle / metadataが明確。
- Pitchbook semanticを汚さない。
- generic mega-tableのsparse schemaを避ける。
- existing Meeting / Pitchbook migrationを最小化できる。

Target schemaは 9 をdefault proposalとする。1 schema migrationで2 sheetsを同時追加する。

Current 5-sheet architectureはimplementation開始まではcurrent truthとして維持し、schema9 WorkのAcceptance時にtarget architectureを更新する。

### Drive

default proposal:

~~~text
記録・資料
├─ 面談記録
├─ 保存資料
├─ ニュース
└─ 評価（ICメモ、社内整理等）

※ Knowledge Exportsはcurrent contractどおりauthoritative root外
~~~

News / Internal Assessments folderはsetupでexact-name + stored-ID idempotent作成。

### Direct-input authoritative source

- Meeting: existing Google Doc
- News direct: Google Doc
- Internal Assessment direct: Google Doc

### Upload authoritative source

- Pitchbook: original file
- News upload: original file
- Internal Assessment upload: original file

Initial News / Internal Assessment recordは1 authoritative source file / Docを基本とする。multi-file bundle / attachmentsはFOLLOW_UP unless a concrete use case requires it.

### Lifecycle

New source typesもexisting patternを継承:

~~~text
Active -> Inactive -> Reactivate
~~~

physical deleteをnormal user flowにしない。

Past-record UI:

- search
- detail
- authoritative source link
- metadata edit
- direct-input body edit
- Inactive lifecycle action
- restoreはcurrent admin deleted-record patternとの整合を取る

uploaded original fileはinitial implementationではreplace/editしない。metadata editのみ。

## Implementation Roadmap

### Next implementation Work A — Record-source expansion, API-independent

Work ID: implementation開始時に新規採番。

Mode: BUILD  
Validation: TIER_3_HIGH（schema migration / authoritative Workspace persistenceを含む）  

Primary Outcome:

API provider無しでも、利用者が4 source typesを 記録を追加 / 過去の記録 から登録・保存・検索・閲覧できる。

Scope:

1. schema9 migration
   - rename legacy root folder `Private Assets Knowledge` -> `記録・資料` in-place by stored ID
   - rename legacy child folders `Meeting Records` -> `面談記録`, `Pitchbooks` -> `保存資料` in-place by stored IDs
   - create `ニュース` / `評価（ICメモ、社内整理等）` under the same root
   - add News_Index
   - add Internal_Assessment_Index
   - add Drive folders
   - preserve all existing rows/IDs/relationships
   - idempotent setup / migration

2. stable ID services
   - News independent ID
   - Internal Assessment independent ID
   - collision-safe sequence
   - immutable identity

3. shared source/upload registry
   - source definitions
   - common upload extension contract
   - browser accept/help derived from same policy

4. 記録を追加 4 tabs
   - 面談メモ
   - 資料保存
   - ニュース
   - 評価（ICメモ、社内整理等）

5. registration state
   - initial clear
   - no 24h silent draft restore
   - shared fields retained across tabs and successful records until clear
   - source-specific state independent
   - safety/retry state preserved

6. standalone 資料保存
   - reuse current Pitchbook prepare/upload/finalize
   - no parent Meeting required
   - current Meeting attachment path unchanged

7. News end-to-end
   - direct input
   - upload
   - multi-Entity
   - Docs/original file
   - Index write
   - lifecycle

8. Internal Assessment end-to-end
   - direct input
   - upload
   - assessment type
   - multi-Entity
   - Docs/original file
   - Index write
   - lifecycle

9. 過去の記録 4 tabs
   - source-specific search/detail/edit
   - saved material merges Meeting-linked + standalone Pitchbooks
   - selected tab independent from Add page

10. product title
   - user-visible title: `Alternative Assets Intelligence`
   - browser title / main header / user-facing output branding
   - preserve internal KSP / API / schema / resource contracts

11. distribution
   - generated bundle
   - company 7-file package
   - migration/install instructions
   - likely release bump to 0.2.0 because schema + product-surface change

Non-Goals:

- provider Store mutation
- AI search of News / Internal Assessment
- structured Internal Assessment Digest
- automatic News ingestion
- historical bulk migration
- production company data mutation during Codex validation

Acceptance Evidence:

- schema8 -> schema9 isolated migration preserves old data and creates exactly the intended resources once
- legacy `Private Assets Knowledge` root is renamed in-place with the same folder ID; no duplicate root
- legacy `Meeting Records` / `Pitchbooks` child folders are renamed in-place with the same folder IDs
- root direct children are `面談記録` / `保存資料` / `ニュース` / `評価（ICメモ、社内整理等）` for fresh/default installs
- second setup run = idempotent
- existing Meeting create/edit/past/attachment path PASS
- existing Pitchbook stable IDs / Meeting relation PASS
- standalone 資料保存 PASS
- News direct/upload/past/edit/lifecycle PASS
- Internal Assessment direct/upload/past/edit/lifecycle PASS
- multi-Entity persistence/readback PASS
- first Add open clear
- no 24h draft restore
- shared fields survive tab switches and successful record flow until clear
- clear removes unsaved input/file selections across all 4 Add tabs; safety recovery state is preserved or blocks clear until resolved
- Add/Past selected tabs independent
- all upload surfaces advertise/enforce same extensions
- provider calls = 0
- AI sync remains disabled/unchanged
- no confidential/production data
- target-runtime Apps Script + Workspace evidence on isolated test resources
- canonical check / bundle parity / company package parity
- visible product title is Alternative Assets Intelligence with no internal-contract rename
- multi-session concurrent create / same-record stale-write matrix PASS
- global lock is held only for bounded shared-state critical sections; long file/AI/materialization operations run outside it
- concurrent create across different source types causes no lost rows, ID collisions, cross-session state bleed, or derived-job duplication
- server-side validation detects stale master/reference state without overwriting newer authoritative data

### Future implementation Work B — Source-aware Full Output parity, API-independent

Start after Work A source schema / storage is accepted. API credential is not required.

Mode: BUILD  
Validation: TIER_2_STANDARD（source materialization / browser / export artifact behavior）  

Primary Outcome:

Knowledge Searchの4-source checkboxをprovider-independent source scopeとして先に導入し、`全文出力` が選択された面談メモ・保存資料・ニュース・内部評価のcontentを省略せず、source-separated canonical packageとしてCopy / Google Docs / PDFへ出力できる。

Scope:

1. source checkbox UI
   - 面談メモ / 保存資料 / ニュース / 評価（ICメモ、社内整理等）
   - initial Meeting only
   - multi-select / zero-selection blocked
   - no silent restore

2. canonical request / export scope
   - scalar `sourceType` compatibility
   - canonical `sourceTypes[]`
   - same structured filters where semantically valid

3. 4-source authoritative resolver
   - Meeting / Pitchbook / News / Internal Assessment
   - multi-Entity source resolution
   - Active-only normal behavior

4. provider-independent content materialization
   - Meeting / direct-input News / direct-input Assessment Google Docs
   - TXT / XLSX / EML using deterministic text normalization
   - PDF / PPTX / DOCX using a deterministic Workspace-native or bounded local conversion/extraction path
   - no File Search/API dependency

5. canonical package
   - source-separated sections
   - provenance label / stable ID / authoritative link
   - selected-source ordering
   - package fingerprint reflects source identity/content revision

6. output parity
   - preview
   - copy
   - Google Docs
   - PDF
   - AI用prompt copy, if retained, uses the same package

7. remove current product limitation
   - remove UI copy that says 保存資料本文は含まない
   - remove/reference-only Pitchbook materialization behavior as the normal accepted path

Acceptance Evidence:

- initial source checkbox state = Meeting only
- 0 selected blocked
- each single source scope exports only that source type
- multi-source scope exports all and only selected source types
- Pitchbook selected -> content is present, not reference-only
- News/Internal Assessment direct and upload paths -> content present
- all supported upload extensions have deterministic materialization behavior or explicit blocking error; silent omission = 0
- source sections/provenance/stable IDs/Drive links are correct
- Copy / Docs / PDF package parity
- provider calls = 0
- no API credential required
- target-runtime browser/export smoke with isolated sources
- existing Meeting-only Full Output remains compatible

### Future implementation Work C — Source-aware Knowledge Search, credential-gated

Start only when approved API credential and source-indexing policy are available.

Mode: BUILD  
Validation: TIER_3_HIGH（provider / billing / confidential-source boundary）  

Primary Outcome:

4 source typesをprovider-neutral File Searchで選択・取得し、source provenanceを維持した回答・citation・Full Outputを生成する。

Scope:

1. extend canonical source registry to News / Internal Assessment
2. extend provider sync lifecycle / provider state to new Index sheets
3. evolve canonical request from scalar sourceType to sourceTypes[]
4. Knowledge Search source checkbox UI
5. authoritative multi-Entity -> resolved source IDs
6. OpenAI / Gemini source-type OR filters
7. citation mapping / Drive source validation for 4 source types
8. source-separated Evidence -> Cross-source Synthesis prompt contract
9. Full Output uses same source scope and includes selected sources
10. provider-independent safe errors / no failover remain
11. source-type AI authorization gate

Acceptance Evidence:

- initial checkbox state = Meeting only
- zero-selection blocked
- each single source type search can retrieve only that type
- multi-source OR returns permitted types only
- Entity filter returns multi-Entity News/Internal sources without duplicating authoritative source
- citation maps to exact current Drive source / stable ID
- source sections / provenance labels PASS
- conflicting source statements remain attributed
- Full Output source set equals API search source scope semantics
- disabled / unauthorized source type is not indexed or retrieved
- enabled provider runtime qualification passes for every provider actually approved
- no provider qualification is claimed for unavailable providers

### Future implementation Work D — Automatic Internal Assessment Digest

Start after Work C provider path is stable and Internal Assessment AI use is authorized.

Mode: BUILD  
Validation: TIER_3_HIGH for confidential Internal Assessment provider path.

Primary Outcome:

利用者がDigestの存在・要否・利用方法を意識しなくても、systemがInternal AssessmentごとにDigest要否を自動判定し、必要な場合だけ原本にgroundしたstructured digestを生成・更新し、Knowledge Searchで自動利用する。

Digestはnormal user向けの独立Source Type、登録項目、checkbox、toggle、手動生成buttonにはしない。derived/rebuildableな内部最適化layerとする。

Candidate digest:

~~~text
assessment purpose
investment thesis
strengths
key risks
mitigants
track-record issues
terms / alignment
portfolio role
due-diligence concerns
event / issue impact
open items
conditions
decision / action
supporting page / section references
~~~

#### Automatic generation policy

原文をprovider-independentにmaterializeした後、次のdeterministic policyで要否を決める。thresholdはinitial production defaultであり、実データによる後続tuningは可能だが、user操作にはしない。

~~~text
materialized text < 4,000 chars
  -> NOT_REQUIRED

materialized text >= 12,000 chars
  -> REQUIRED

4,000 <= materialized text < 12,000 chars
  -> REQUIRED if either:
     - assessment_type is IC / investment-decision class, or
     - materialized structure has >= 4 meaningful sections/headings
  -> otherwise NOT_REQUIRED
~~~

追加原則:

- 画像主体等でtext extractionが不十分な場合は、文字数だけでNOT_REQUIREDに落とさず、materialization品質を判定してfail-closed / deferredにする。
- Digest生成はsource保存をblockしない。
- approved provider / source policyが利用不可なら自動生成をdeferし、原本検索だけで機能継続する。
- providerが利用可能になった後はeligibleな未生成/stale sourceをbackground sync対象として自動回収する。
- user-facing manual overrideは設けない。

Internal state:

~~~text
NOT_REQUIRED
PENDING
CURRENT
STALE
DEFERRED
FAILED
~~~

#### Automatic retrieval policy

DigestがCURRENTでも、回答をDigestだけから作らない。

- broad overview / synthesis / history / change-over-time question:
  - CURRENT Digestをoverview / retrieval aidとして自動利用する。
  - supporting source referencesを使って原本File Searchへ戻り、最終回答をgroundする。
- precise factual / numeric / clause / page-specific question:
  - 原本File Searchをprimaryにし、Digestは必要な場合だけ補助的に使う。
- multi-source synthesis:
  - Internal Assessment Digestは論点把握とsource prioritizationに使えるが、final citationは原本sourceへ解決する。
- DigestがNOT_REQUIRED / STALE / DEFERRED / FAILEDでも検索をblockせず、原本へtransparent fallbackする。
- Digestの利用有無をnormal user UIへ表示する必要はない。必要な運用診断はadministrator-only derived stateで確認可能にする。

#### Integrity / lifecycle

- authoritative source remains original file/Doc
- Digest is not a separate user Knowledge Source and does not receive an independent source ID
- no invented conclusions
- page/section grounded where possible
- digest records source_id + source content hash/version
- source update immediately marks Digest STALE
- stale Digest is never used as current evidence
- rebuild creates a new CURRENT derived state
- digest cannot silently replace original evidence
- final answer citations resolve to authoritative source, not the Digest artifact

## Migration / Company Update Strategy

Current company installation is schema8/release0.1.2-based.

Record-layer implementation must support in-place upgrade rather than reinstall.

Expected operator path after acceptance:

~~~text
update Apps Script code/package
-> run authorized installer/setup migration once
-> read back schema/resources
-> create/update Web App version only if required by the delivered release
~~~

Migration rules:

- no replacement of existing Meeting/Pitchbook IDs
- no bulk rewrite of existing Docs/files
- no existing source move/rename unless required and separately authorized
- new folders/sheets additive
- rollback strategy is code rollback + new-resource preservation; never destroy newly captured user data

Company production migration is not part of Codex isolated qualification unless explicitly authorized by user.

## Validation / Routing Strategy

### Planning Work 0069

- Route A
- TIER_1_LOW
- documentation only
- target runtime: NOT APPLICABLE
- provider calls: 0
- deployment mutation: 0

### Record-layer Work

- Route C
- Codex implements local/source changes + isolated target-runtime migration/persistence tests
- ChatGPT owns architecture, schema contract, GitHub, final review
- one active Dispatch at a time
- use lowest sufficient model available for deterministic implementation; escalate only for unresolved cross-cutting schema/runtime diagnosis

### AI Work

- Route C
- starts only after credential/policy gate
- explicit mutation/billing budget
- synthetic/anonymized sources first
- provider Store changes bounded and reversible
- qualify enabled providers only

## Risks and Predeclared Mitigations

### Schema expansion

Risk: current code/docs/tests assume exactly 5 Backend sheets.

Mitigation:

- schema9 migration explicitly changes invariant to 7 sheets
- search and update all exact-five assertions/setup diagnostics/backups before acceptance
- isolated schema8 upgrade rehearsal
- no production migration as proof artifact

### Draft removal vs recovery safety

Risk: deleting all localStorage logic could remove idempotency/retry protection.

Mitigation:

- remove only long-lived draft restore state
- preserve retry/outcome-unknown/Pitchbook partial-upload state
- regression test interrupted save/upload recovery

### Multi-Entity provider filters

Risk: provider metadata does not naturally model arbitrary arrays and OpenAI has bounded attributes.

Mitigation:

- authoritative relation in Index
- resolve Entity -> source IDs before provider query
- source IDs OR filter
- no provider document duplication per Entity

### Source provenance collapse

Risk: AI synthesis turns internal opinion, manager statement and external report into one assertion.

Mitigation:

- source-specific prompt sections
- normalized source-type citation labels
- cross-source synthesis after evidence sections
- Internal Assessment language explicitly time-bound and internal

### API / policy delay

Risk: provider access is unavailable for months.

Mitigation:

- Work A delivers full Workspace record value without provider
- derived AI indexing can be rebuilt later from authoritative sources
- Work C/D remain deferred by provider policy and are not blockers for Work A/B

### News rights / Internal Assessment confidentiality

Risk: Workspace storage permission does not imply external AI transmission permission.

Mitigation:

- separate source capture from provider index
- source-type authorization gate before Work B
- no automatic News crawling
- no Internal Assessment external indexing without explicit approval

## Completion / Dependency Gates

### Work A can complete when

- all 4 source types are usable in Workspace record flows
- schema9 migration is proven
- existing Meeting/Pitchbook paths remain intact
- provider calls remain zero

API credentials are NOT a blocker.

### Work B can start when

- Work A source schema / record flows are accepted
- provider-independent materialization strategy for the common upload formats is fixed

API credential is NOT required.

### Work C can start when

- at least one provider is approved/configured
- source-type AI use policy is known
- Work A source schema is accepted
- Work B source scope / Full Output contract is accepted

### Work D can start when

- Work C retrieval/citation is stable
- Internal Assessment indexing is authorized
- digest adds decision value beyond raw File Search

## Non-Goals of This Plan Work

- source code implementation
- Work A/B/C ID reservation
- deployment
- schema mutation
- company data mutation
- API key configuration
- provider Store creation
- News automation
- historical migration

## Completion

~~~text
PLAN_REVIEWED_AGAINST_CHAT: YES
PLAN_REVIEWED_AGAINST_CURRENT_MAIN: YES
NEXT_IMPLEMENTATION_WORK: UNASSIGNED
FULL_OUTPUT_PITCHBOOK_OMISSION: MUST_FIX
CLEAR_SCOPE: ALL_4_ADD_TABS
AI_PROVIDER_GATE: DEFERRED_UNTIL_APPROVED
DIGEST_POLICY: AUTOMATIC_HIDDEN_DERIVED_LAYER
TEAM_OPERATING_MODEL: MULTI_USER_FIRST
PRODUCT_TITLE: Alternative Assets Intelligence
KNOWLEDGE_ROOT_DEFAULT_NAME: 記録・資料
SOURCE_FOLDER_LAYOUT: 面談記録 / 保存資料 / ニュース / 評価（ICメモ、社内整理等）
USER_FACING_ASSESSMENT_LABEL: 評価（ICメモ、社内整理等）
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
~~~

WORK_ID: 0069
DISPATCH_ID: N/A
BALL: NONE
STATUS: ACCEPTED
