# Visual errata and correction record

## 添付referenceから採用しない要素

添付画像は配色・sidebar・金のaccent・Searchの線形構成だけをvisual sourceとして使いました。次はcurrent sourceに存在しない、または契約と異なるため採用していません。

| Referenceの表示 | 判定 / correction |
|---|---|
| `Knowledge Share GAS` | Brandは`Knowledge Share`。GASを製品名へ足さない |
| Home breadcrumb | 現行destinationではないため追加しない |
| bell、avatar、個人名、account menu | 現行機能なし。0029のshared-admin sessionとも別物 |
| `全文出力` toggle | 実行方法selectorの1 option。別toggleへしない |
| `許可済みの選択肢のみ` checkbox | 現行controlなし。model/thinking候補はpolicyで制約済み |
| 質問`0/500` | 現行maxlengthは5,000。自由質問でrequired |
| Geminiの常時表示 | current qualified-disabled baselineではnormal-user routeからhidden |
| AI回答の文単位mark | 現行citationはdocument-level。新しいmappingを作らない |
| 崩れた紗綾形 | CC0のline vectorへ置換。ImageGenのgeometryをtraceしない |

## Draft PR #40で再導入しないerrata

- optional controlへrequired markerを付けない;
- Pitchbookの`GP`をcounterpartyと呼ばない;
- MeetingのGP/運用会社を別radioへ分割しない;
- navigation destination、logout、password changeを落とさない;
- `Gemini disabled`の理由を推測しない;
- no-results/hard-stopでも独立して利用可能な`AI用プロンプトをコピー`を一律disabledにしない;
- Pending / Failed / Inactive、Master Inactive、provider stateを同じ削除状態へ統合しない。

## このdispatchの1回のtargeted correction

初回capture後、次だけを一括修正し、その後は再生成loopを行っていません。

1. 自作の格子状patternを破棄し、Wikimedia CommonsのCC0 sayagata line assetへ変更。
2. 資料upload行の存在しない`除外`actionを`選択済み`stateへ変更。
3. Analytics内訳の存在しない`詳細`actionを現行metric tableへ変更し、period/headline/drill/admin-check tableを補完。
4. 削除済みMeetingはserver eligibilityどおりeditを隠し、原資料ありPitchbookはcurrent serviceどおりeditを残す。
5. Meeting一覧へ更新版、Relationshipへsummary、Entityへmix/timelineとGP context visualを追加。
6. Pitchbook登録も1366×768でprimary actionを確認できるsticky action proposalへ変更。

## Remaining limits

- HTMLは設計参照であり、button/formは動作しない。実際のhandler・payload testではない。
- Native confirmのfocus trap、keyboard順序、focus-visible、contrast値、200% zoom、screen reader、Apps Script rendererは未検証。
- Browser security policyが`data:`上のside-by-side comparison pageを拒否したため、迂回せず、添付referenceと各captureを個別に目視した。pixel-perfect cloneを主張しない。
- Sourceの現行confirm/promptをstyled surfaceへ置換する場合、実装後にclient behaviorとaccessibilityを別途検証する。
- 右端の長い値は1366pxでoverflowなしを確認したが、実データ最大長の網羅試験ではない。
