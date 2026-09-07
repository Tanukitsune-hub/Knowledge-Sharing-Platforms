# Work 0028 / CODEX-10 candidate — Record-centric information architecture

WORK_ID: 0028
STATUS: CLOSED USER DIRECTION FOR NEXT DISPATCH
MODE: INVESTIGATION
SCOPE: DESIGN ONLY / FUTURE BUILD REQUIREMENTS RECORDED

## Primary outcome

UI上で`面談`と`資料`を独立した2つの世界として扱う構成をやめ、1つの`記録`を中心に、その記録に紐付く資料を管理するシンプルな導線へ統合する。

Production backendではMeeting / Pitchbookの既存責務分離を可能な限り保持するが、Pitchbookの新規登録は必ず既存の`Meeting_ID`を親contextとして開始する。GPであることは登録要件にしない。

## Closed user decisions

### 1. `過去の記録 / 資料`タブを廃止

`過去の記録`は独立した資料一覧を持たず、記録一覧を主画面とする。

各記録のdetail / expansionから関連資料を確認・追加できる。

関連資料で必要な利用者操作:

- 原資料を開く
- 新しい資料をアップロード
- 表面上の`削除`

`削除`の内部意味はhard deleteではなく、従来どおり当該記録との紐付け解除とする。物理ファイルやPitchbook rowを即時破棄しない。

資料から関連Meetingを逆引きする専用surfaceは不要。

### 2. `記録を追加 / 資料`タブを廃止

`記録を追加`は1つのrecord creation surfaceへ統合する。

先頭で`記録種別`を選ぶ。

初期対象:

- `面談`
- `データ受領`

資料だけを独立登録する導線は作らない。

### 3. 新規登録順序

資料uploadを伴う新規記録は必ず次の順序とする。

1. 親となる記録を先に登録する
2. `Meeting_ID`を確定する
3. 確定済み`Meeting_ID`をparent contextとして資料登録を開始する
4. 各Pitchbook / fileの登録成功後、その`Document_ID`を当該記録へ関連付ける

親記録の作成が失敗した場合はPitchbook登録を開始しない。

Pitchbook側で先に仮の資料を作り、後からMeetingへ紐付ける順序は禁止する。

資料uploadの部分失敗時は、親記録は保持し、成功済み資料も保持し、失敗した資料だけ既存のfile-level retry semanticsを使って再試行できる構成を優先する。

### 4. PitchbookのGP必須要件を廃止

現行productionのPitchbook batch validationでは`GP_ID`が必須だが、これはユーザー意図と異なる既存設計制約として扱う。

今後の資料登録可否は`GPであること`ではなく、`有効な親Meeting_IDが存在すること`で決める。

親記録のCounterpartyは既存Meeting contractどおり以下を許容する。

- GP / 運用会社
- LP / Asset Owner
- 日本生命
- グループ会社
- Consultant / Gatekeeper
- その他

資料登録は親記録のcounterparty typeに関係なく可能とする。

Future BUILDではPitchbookの検索・File Search metadataもGP専用前提を外し、親記録のauthoritative counterparty contextを正しく表現できるようにする。GP名から関係を推測しない。

### 5. `データ受領`を新しい記録種別として扱う

面談を伴わず資料だけを受領した場合も、独立Pitchbook登録にはしない。

`記録を追加`で`データ受領`を選び、簡単な受領背景と必要な分類情報をrecordとして保存して`Meeting_ID`を発行する。その後で受領ファイルを当該IDへ紐付けて登録する。

利用者向け最小入力イメージ:

- 日付
- 受領元 / 相手先
- Asset Class
- 必要に応じ Equity / Debt、Team、Fund / Strategy
- 受領背景メモ
- 受領ファイル

`データ受領`では開始時間、面談場所、面談参加者、Meeting Type等のmeeting-only fieldは表示しない。

データ受領は資料登録のためのrecordなので、少なくとも1ファイルを要求するdesignを第一候補とする。

### 6. Meeting_ID / Meeting_Indexの互換性

既存のstable ID、既存Meeting data、既存検索・監査・関連機能への影響を最小化するため、`データ受領`でも当面`Meeting_ID`を発行する。

Future BUILDでは`Meeting_Index`をrecord anchorとして再利用し、記録種別を区別する小さなschema extension（例: `Record_Type = MEETING | DATA_RECEIPT`）を第一候補とする。

既存行はmigration時に`MEETING`として扱う。

table / ID名の全面renameや新しいRecord_Index新設は今回の優先解ではない。

### 7. 関係の正本とunlink semantics

現行の`Meeting_Index.Related_Pitchbook_IDs`をactive relationshipの正本として維持する案を優先する。

資料upload API / future registration flowにはparent `Meeting_ID`を必須inputとして渡し、親recordをauthoritativeにvalidateしてから資料登録する。

登録成功後に`Document_ID`を親recordの`Related_Pitchbook_IDs`へ追加する。

これにより利用者の`削除`は当該`Document_ID`を現在のrecordから外すunlinkとして実現できる。

新しい関係tableやnetwork graphは作らない。

### 8. Follow-up資料

既存Meeting後のfollow-upで受領した資料は、新しい独立資料recordを作らず、`過去の記録`から該当recordを開いて`資料を追加`する。

これにより、面談時資料と後日follow-up資料を同じrecord contextで扱える。

## Final user flow candidate

```text
記録を追加
└─ 記録種別
   ├─ 面談
   │  ├─ 面談情報
   │  ├─ 面談内容 / follow-up
   │  └─ 関連資料（任意upload）
   └─ データ受領
      ├─ 日付 / 受領元 / 分類
      ├─ 受領背景メモ
      └─ 受領資料（必須upload）

過去の記録
└─ 記録一覧
   └─ record detail
      ├─ record本文 / metadata / 原資料
      ├─ 編集 / 削除 / 復元
      └─ 関連資料
         ├─ 原資料を開く
         ├─ 資料を追加
         └─ 削除（内部はunlink）
```

`面談 / 資料`のsubtabは両画面から無くす。

## Preserve

- Pitchbook physical file lifecycle、Document_ID、File Search indexingは資料sourceとして維持
- Meeting Google Docs原本 / stable Meeting_ID / audit semantics
- user-facing deleteは可逆な内部semanticsを優先
- Work 0027 Gemini qualified-disabled / normal-user hidden
- Work 0029 shared-admin security behavior
- Knowledge SearchはMeeting / Pitchbook両sourceを引き続き検索可能
- CODEX-10のKnowledge Search correction: `GP`→`面談先`、`全文出力`をdedicated actionへ分離
- production `src/**` / `dist/**` / deployはまだ未許可

## Future BUILD design constraints

Production実装時は以下を満たす。

- Pitchbook batch / upload開始時にvalid parent `Meeting_ID`を必須検証
- parent作成失敗時はfile registration 0件
- GP必須validationを廃止
- non-GP parentでもPitchbook登録可能
- File Search metadata / citation identityでnon-GP contextを失わない
- record creationとfile registrationを巨大transactionへまとめず、parent-first + file-level retryで可逆性を保つ
- unlinkとphysical delete / Inactiveを混同しない
- migrationでexisting Meeting / Pitchbookを破壊しない

## Acceptance evidence for CODEX-10 design correction

- `記録を追加`に`面談 / 資料`subtabがない
- `記録種別 = 面談 / データ受領`が明確
- 面談registration内からoptional資料uploadができる
- データ受領registrationで背景memo + required資料uploadができる
- `過去の記録`に`面談 / 資料`subtabがない
- record detail内に関連資料list + add + delete(unlink)がある
- 独立資料一覧 / 資料→関連Meeting surfaceがない
- standalone `資料だけ追加`actionがない
- design copyがparent Meeting_ID firstを明示
- production `src/**` / `dist/**` changes NONE

次にこのdesign correctionを実行する場合はfresh Dispatch ID `0028-CODEX-10`を使用し、CODEX-09は再利用しない。
