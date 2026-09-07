# Work 0028 — Light受入れとBUILD移行

WORK_ID: 0028
MODE: BUILD
STATUS: ACCEPTED_DESIGN / BUILD_AUTHORIZED

## ユーザー受入れ

PR #50で確定した単一記録Light UI/UXを、細部は後続で詰める前提で現時点のproduction implementation baselineとして受け入れる。

- merged PR: #50
- merge commit: `98bd1f233a5a462c55a9a3f9e4bc0dda6c705067`
- Light-only / sidebar 7 / metallic gold / approved analytics tableを維持する。
- `記録を追加`は単一Meeting form。資料tab、記録種別selector、データ受領専用surface、standalone資料登録routeは置かない。
- `過去の記録`は単一Meeting list/detail。関連資料の閲覧・追加・既存資料の関連付け・分類編集を親Meeting contextで扱う。
- 関連資料の表示上の`削除`は当該Meetingからのunlink。physical delete / Pitchbook全体Inactive / Meeting Inactiveとは別。
- Knowledge Searchは`面談先 / 情報ソース / 開始日 / 終了日 / 全期間`、`検索モード / AIモデル`、大きい質問欄。
- `全文出力`はAIモデルselectorから分離したMeeting-only / non-AI action。

## Strategy Reset

設計検討のINVESTIGATIONを終了し、production codeへ反映してtarget runtimeで裏側の契約を検証するBUILDへ移行する。

### Primary Outcome

確定Light UIの主要フローが、既存データを破壊せず次のend-to-end契約で動くこと。

1. Meetingを保存してauthoritative `Meeting_ID`を得る。
2. 保存済みActive Meetingだけを親として新規資料を登録できる。
3. GP以外の既存Counterparty typeでも資料登録・検索・引用contextを失わない。
4. file保存とMeetingへのlink確定を区別し、部分失敗時に親/成功file/IDを重複作成せず回復できる。
5. 既存Meetingから後日資料を追加でき、関連資料の`削除`はunlinkとして安全に働く。
6. 関係だけの変更でauthoritative Google Docs本文を再生成・上書きしない。
7. Knowledge Searchの通常AI検索と独立全文出力が確定UI contractどおり動く。
8. Work 0027のGemini qualified-disabled / hiddenとWork 0029 shared-admin securityを壊さない。

### Evidence hierarchy

1. target Apps Script / Workspaceのauthoritative readbackと実行結果
2. versioned Web Appの実ブラウザ主要フロー
3. exact remote source / bundle parity
4. repository deterministic tests
5. inference

### Fastest Safe Decisive Action

現行5-sheet/stable-ID architectureを維持した最小のproduction deltaを実装し、synthetic isolated dataで主要contractをtarget runtimeへ通す。新DB/relationship table/Record_Indexは作らない。

### Required scope

- parent Meeting binding / file-level retry / link confirmation
- non-GP Pitchbook validation, naming, metadata, File Search/citation context
- relation-only add/unlink facade with Lock/CAS and Docs body preservation
- active relationshipを考慮した新規資料のretrieval eligibility
- independent Meeting-only Knowledge Export validation/action
- accepted Light production UI wiring needed for the above core flow
- deterministic tests, bundle parity, target-runtime evidence

### Non-goals

- historical orphan Pitchbookの一括migration/自動親推定
- physical delete
- provider auto-failover
- Gemini再有効化
- Dark/System/theme switching
- new database/sheet/relationship model
- broad company rollout or real confidential data
- 受領のみ記録の新しいrecord type/schema。業務扱いは必要になるまでFOLLOW_UP

### Authorization boundary

Production `src/**`, tests, generated `dist/**`の変更を許可する。Target runtime検証はsynthetic/anonymized isolated dataに限定する。実ユーザーへのrollout、real confidential data、destructive migration、秘密情報の変更、公開範囲拡大は未許可。

Apps Script version/deploymentが必要な場合は`docs/operations/apps-script-web-app-deployment.md`に従い、identity chainを先に固定する。既存deploymentのtypeが曖昧な状態で更新しない。新しいversioned Web App mutationは一回まで、stop-on-first-failureとする。

### Retry / Strategy Reset

- deterministic repair round: 最大2回
- target runtime deployment mutation: 最大1回/dispatch
- 同じ失敗の反復、sourceとruntime identityの不一致、中核contract否定、migration必要性の発覚でStrategy Reset

### Completion Latch

主要end-to-end contractと必要なtarget-runtime evidenceがPASSし、authoritative data integrityにBLOCKERがなく、final diffとbundle/readbackが一致した時点でBUILD acceptance候補とする。Deployment/rolloutは別gate。
