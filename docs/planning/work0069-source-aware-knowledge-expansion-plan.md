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

2026-09-25までのユーザーとの設計対話と現在のGitHub正本を突き合わせ、Private Assets Intelligenceを以下4つのKnowledge Sourceへ拡張するための実装順序・境界・Acceptance Evidenceを、取りこぼしなく実装可能な計画として固定する。

利用者向けsource:

~~~text
面談メモ
保存資料
ニュース
評価（IC、社内整理）
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

Current Full Outputはcurrent code上Meeting source中心で、Pitchbook rowsをdeliberately ignoreするpathがある。将来の4-source UXではここも同じsource-scope contractへ揃える必要がある。

## Closed Product Decisions

### 1. Source Typeは4つ

利用者向け分類:

~~~text
面談メモ
保存資料
ニュース
評価（IC、社内整理）
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
面談メモ | 資料保存 | ニュース | 内部評価
~~~

過去の記録 tabs:

~~~text
面談メモ | 保存資料 | ニュース | 内部評価
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

クリア のexact scope（active tab固有fieldだけか、全tab固有fieldも含むか）はUI implementation開始時に1点だけ最終固定する。shared fieldsを消すことは確定。

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

User-facing:

内部評価（Knowledge Search checkboxでは 評価（IC、社内整理））

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
☐ 評価（IC、社内整理）
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
評価（IC、社内整理）
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

### 12. Workspace保存とAI indexは分離

Authoritative source captureはprovider availabilityに依存させない。

API keyが無くてもMeeting / Pitchbook / News / Internal Assessmentを継続蓄積できる。

AI index開始条件:

1. approved provider API credential
2. provider/store ownership/configuration
3. source-type別の外部AI利用許可
4. required billing / security / copyright policy confirmation

API key aloneでInternal Assessmentやlicensed News全文を自動indexしない。

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
Private Assets Knowledge
├─ Meeting Records
├─ Pitchbooks
├─ News
├─ Internal Assessments
└─ Knowledge Exports
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
   - 内部評価

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

10. distribution
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
- Add/Past selected tabs independent
- all upload surfaces advertise/enforce same extensions
- provider calls = 0
- AI sync remains disabled/unchanged
- no confidential/production data
- target-runtime Apps Script + Workspace evidence on isolated test resources
- canonical check / bundle parity / company package parity

### Future implementation Work B — Source-aware Knowledge Search, credential-gated

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

### Future implementation Work C — Internal Assessment Digest

Start after Work B provider path is stable and Internal Assessment AI use is authorized.

Mode: BUILD  
Validation: TIER_3_HIGH for confidential Internal Assessment provider path.

Primary Outcome:

長文Internal Assessmentを原本にgroundしたstructured digestとしてderived/rebuildable化し、Knowledge Searchで全体像と原本根拠の両方を使える。

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

Rules:

- authoritative source remains original file/Doc
- no invented conclusions
- page/section grounded where possible
- digest has source content hash/version
- source update invalidates/rebuilds digest
- digest cannot silently replace original evidence
- direct short assessments may skip digest when no benefit

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
- Work B/C remain deferred, not blockers for Work A

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

- at least one provider is approved/configured
- source-type AI use policy is known
- Work A source schema is accepted

### Work C can start when

- Work B retrieval/citation is stable
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
AI_PROVIDER_GATE: DEFERRED_UNTIL_APPROVED
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
~~~

WORK_ID: 0069
DISPATCH_ID: N/A
BALL: NONE
STATUS: ACCEPTED
