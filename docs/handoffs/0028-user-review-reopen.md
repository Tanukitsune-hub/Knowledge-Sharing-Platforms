# Work 0028 — ユーザー実機確認による再オープン

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: REVIEW
MODE: BUILD

## Reopen reason

Work 0028はPR #51 / version4でCompletion Latch済みだったが、会社PC移行前のユーザー実機確認でrequired-flow contradictionと明示的UI polish scopeが確認されたため再オープンする。

ユーザー観測:

1. 日付入力セルを選択した際にカレンダーを明示的に開ける操作感が必要。
2. From / Toを使うdate-range filterは、From=3年前の応当日、To=今日を初期値にする。
3. 「記録を追加」画面で選択操作ができない実機不具合がある。
4. wide desktopでinput/selectが不自然に横へ伸びる。短いcontrolは概ね半角30文字程度を上限の目安にし、自然な幅へする。
5. 「過去の記録」でuser-facingな「関連GP」分離をやめ、面談先概念を中心に表示・filterする。GP/non-GP双方を同じcounterparty conceptで扱う。

添付スクリーンショットはwide desktopでDate/Time/面談先等のcontrolが2-column grid幅いっぱいへ伸びており、ユーザー指摘と整合する。

## Scope interpretation

### 1. Date picker

HTMLの `type=date` は既に存在するが、ユーザー実機で期待するpicker interactionを満たしていない。supported browserではinput本体のclick/focusからnative pickerを開けることをacceptanceとする。browser非対応時は標準date inputとして安全にfallbackする。

対象は少なくともuser-facingなMeeting create/editとdate-range filters。既存date value semanticsは変更しない。

### 2. Date-range presets

Knowledge Searchには既に3年前応当日→今日のdefault helperが存在するため、その仕様を正本として再利用・共通化する。From/To pairを持つuser-facing filter（過去の記録等）にも同じdefaultを適用する。

うるう日では3年前に同日がない場合、現在のKnowledge Search同様に2/28へ安全に丸める。

### 3. 記録を追加の操作不能

actual owner-only Web Appで再現・診断し、root causeを修正する。UIが見えているだけではPASSにしない。

Acceptance:
- bootstrap完了後、required select/inputが実際に操作可能。
- 面談先区分→面談先、Asset Class等が選択できる。
- synthetic Meetingを通常UIから1件保存できる。
- Date/Time、Docs、relation semanticsを壊さない。

### 4. Control width / layout

wide viewportでshort input/selectをviewport/gridいっぱいまで伸ばさない。

Design intent:
- compact controlの基準上限は概ね `30ch` 前後。
- Date/Timeは内容に応じてさらに短くてよい。
- long textarea、record body、file area等のfull-widthが自然なsurfaceは対象外。
- label/optionsが長い場合は切断せず、control内でbrowser標準表示を維持する。
- responsive/narrow viewportでは100%まで縮み、横overflowを発生させない。
- Meeting createだけの局所patchではなく、同種のuser-facing input/selectへ一貫したlayout ruleを適用する。ただしtable、admin special layout等を不必要に崩さない。

### 5. 過去の記録の面談先統合

user-facing Past MeetingsではGPを特別扱いしない。

- 「関連GP」filterをuser-facing surfaceから外す。
- 一覧の主列を「GP」ではなく「面談先」とし、GP/non-GPのcounterpartyEntityNameを同じ優先順位で表示。
- 一覧でrelated GPを面談先の補助表示として常時付記しない。
- 面談先区分 + 面談先というcounterparty選択は維持してよい（GP固有ではなく全counterparty typeを扱うため）。
- backendのRelated_GP_IDs、relation logic、retrieval metadataは削除しない。内部データモデルの意味は維持する。
- GP recordとnon-GP recordの双方を検索・表示できることを実機確認する。

## Closed evidence preserved

以下は今回の修正が反証しない限り維持する。

- installer/idempotency、schema7 / Backend exactly5。
- parent-first Meeting/file relation architecture。
- stable Meeting_ID / Document_ID、unlink/relink semantics。
- final version4で確立したBusiness Date/Time readback contract。
- Meeting Docs preservation。
- Meeting-only non-AI Full Output。
- single restricted owner-only deployment-security evidence。
- provider calls0 / AI sync disabled。
- Work 0030 DEFERRED_BY_USER。

## Routing

Route C。actual browser interaction bugとresponsive UI修正を含むため、Codexがimplementation + runtime verificationを所有する。

次Dispatch:
`0028-CODEX-24`

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: REVIEW
