# Work 0028 / CODEX-10 candidate — Record-centric information architecture

WORK_ID: 0028
STATUS: CLOSED USER DIRECTION FOR NEXT DISPATCH
MODE: INVESTIGATION
SCOPE: DESIGN ONLY / FUTURE BUILD REQUIREMENTS RECORDED

## Primary outcome

UI上で`面談`と`資料`を独立した2つの世界として扱う構成をやめ、`面談記録`を唯一の親contextとして、その記録に紐付く資料を管理するシンプルな導線へ統合する。

Production backendではMeeting / Pitchbookの既存責務分離を可能な限り保持するが、Pitchbookの新規登録は必ず既存の`Meeting_ID`を親contextとして開始する。GPであることは登録要件にしない。

## Closed user decisions

### 1. `過去の記録 / 資料`タブを廃止

`過去の記録`は独立した資料一覧を持たず、面談記録一覧を主画面とする。

各面談記録のdetail / expansionから関連資料を確認・追加できる。

関連資料で必要な利用者操作:

- 原資料を開く
- 新しい資料をアップロード
- 表面上の`削除`

`削除`の内部意味はhard deleteではなく、従来どおり当該面談記録との紐付け解除とする。物理ファイルやPitchbook rowを即時破棄しない。

資料から関連Meetingを逆引きする専用surfaceは不要。

### 2. `記録を追加 / 資料`タブを廃止

`記録を追加`は面談記録の作成surfaceだけにする。

- `面談 / 資料`subtabは置かない。
- `記録種別`selectorも置かない。
- `データ受領`等の別record typeは作らない。
- standalone `資料だけ追加` actionも作らない。

新しい資料は、必ず新規または既存の面談記録に紐付く形でのみ追加する。

特定の面談記録に紐付かない資料は、新規登録対象にしない。将来必要性が確認された場合のみ別Workで再検討する。

### 3. 新規登録順序

資料uploadを伴う新規面談記録は必ず次の順序とする。

1. 面談記録を先に登録する
2. `Meeting_ID`を確定する
3. 確定済み`Meeting_ID`をparent contextとして資料登録を開始する
4. 各Pitchbook / fileの登録成功後、その`Document_ID`を当該Meetingへ関連付ける

面談記録の作成が失敗した場合はPitchbook登録を開始しない。

Pitchbook側で先に仮の資料を作り、後からMeetingへ紐付ける順序は禁止する。

資料uploadの部分失敗時は、親Meetingを保持し、成功済み資料も保持し、失敗した資料だけ既存のfile-level retry semanticsを使って再試行できる構成を優先する。

### 4. PitchbookのGP必須要件を廃止

現行productionのPitchbook batch validationでは`GP_ID`が必須だが、これはユーザー意図と異なる既存設計制約として扱う。

今後の資料登録可否は`GPであること`ではなく、`有効な親Meeting_IDが存在すること`で決める。

親MeetingのCounterpartyは既存Meeting contractどおり以下を許容する。

- GP / 運用会社
- LP / Asset Owner
- 日本生命
- グループ会社
- Consultant / Gatekeeper
- その他

資料登録は親Meetingのcounterparty typeに関係なく可能とする。

Future BUILDではPitchbookの検索・File Search metadataもGP専用前提を外し、親Meetingのauthoritative counterparty contextを正しく表現できるようにする。GP名から関係を推測しない。

### 5. Meeting_IDを唯一の親anchorとする

新しい資料登録はすべて`Meeting_ID`を親anchorとする。

新しい`Record_Type`、`DATA_RECEIPT`、`Record_Index`等は作らない。

既存`Meeting_Index` / stable `Meeting_ID` / Meeting Google Docs原本 / audit semanticsを維持する。

### 6. 関係の正本とunlink semantics

現行の`Meeting_Index.Related_Pitchbook_IDs`をactive relationshipの正本として維持する案を優先する。

資料upload API / future registration flowにはparent `Meeting_ID`を必須inputとして渡し、親Meetingをauthoritativeにvalidateしてから資料登録する。

登録成功後に`Document_ID`を親Meetingの`Related_Pitchbook_IDs`へ追加する。

これにより利用者の`削除`は当該`Document_ID`を現在のMeetingから外すunlinkとして実現できる。

新しい関係tableやnetwork graphは作らない。

### 7. Follow-up資料

既存Meeting後のfollow-upで受領した資料は、新しい独立資料recordを作らず、`過去の記録`から該当Meetingを開いて`資料を追加`する。

これにより、面談時資料と後日follow-up資料を同じMeeting contextで扱える。

## Final user flow

```text
記録を追加
└─ 面談記録
   ├─ 面談情報
   ├─ 面談内容 / follow-up
   └─ 関連資料（任意upload）

過去の記録
└─ 面談記録一覧
   └─ Meeting detail
      ├─ 面談本文 / metadata / 原資料
      ├─ 編集 / 削除 / 復元
      └─ 関連資料
         ├─ 原資料を開く
         ├─ 資料を追加
         └─ 削除（内部はunlink）
```

`面談 / 資料`のsubtabは両画面から無くす。

## Existing historical Pitchbook boundary

Future BUILDでは既存Pitchbookデータを破壊しない。

既存の親Meetingを持たないPitchbookを自動推定でMeetingへ紐付けない。新規registration ruleだけをparent-Meeting必須へ変更し、historical orphan handling / migrationは必要なら別途限定的に設計する。

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
- parent Meeting作成失敗時はfile registration 0件
- GP必須validationを廃止
- non-GP parentでもPitchbook登録可能
- File Search metadata / citation identityでnon-GP parent contextを失わない
- Meeting creationとfile registrationを巨大transactionへまとめず、parent-first + file-level retryで可逆性を保つ
- unlinkとphysical delete / Inactiveを混同しない
- migrationでexisting Meeting / Pitchbookを破壊しない
- historical orphan PitchbookをGP名等から自動推定でparent化しない

## Acceptance evidence for CODEX-10 design correction

- `記録を追加`に`面談 / 資料`subtabがない
- `記録種別`selectorや`データ受領`surfaceがない
- 面談registration内からoptional資料uploadができる
- standalone `資料だけ追加`actionがない
- `過去の記録`に`面談 / 資料`subtabがない
- Meeting detail内に関連資料list + add + delete(unlink)がある
- 独立資料一覧 / 資料→関連Meeting surfaceがない
- design copyがparent Meeting_ID firstを明示
- production `src/**` / `dist/**` changes NONE

次にこのdesign correctionを実行する場合はfresh Dispatch ID `0028-CODEX-10`を使用し、CODEX-09は再利用しない。
