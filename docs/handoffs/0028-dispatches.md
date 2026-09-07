# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
ACTIVE_DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
PHASE: A1.15 / INTEGRITY-RECONCILED LIGHT CORRECTION / DESIGN ONLY

## 現在の正本

CODEX-11はDraft PR #50でRETURNED。ChatGPTが差分・契約対応・操作デモをレビューし、ユーザー許可の範囲で同じPR branchへ限定修正した。新しいCodex dispatchは発行していない。

- 現行レビュー対象: PR #50 / `codex/0028-codex11-integrity-light-design`
- Codex返却HEAD: `7564865badc88e01ca930faba27e4edf0c29b174`
- 元の検証済みartifact: `39aaba1a5e8ae13b4015468b2d3255a9d4992f28`
- Controllerコード修正完了: `841fa291676bee5de0490814dbc51a10fd11d3dc`
- Controller結果保存: `b1a7f376c8d04735b01ffd6f9b9dcbfe63c1a82e`
- 現在のreview: `docs/handoffs/0028-CODEX-11-controller-review.md`
- 元のreportはPR branchの`docs/handoffs/0028-CODEX-11-meeting-centric-design-report.md`。

PR #46は以前のvisual基準、PR #47/#48/#49はCODEX-10の履歴/選択継承元。古いcontrolを復活させない。どの返却が同一runかは推定せずIDを改番しない。PR #50より古い案を最新案と扱わない。

## Controller判定と証拠

CONTROLLER_TECHNICAL_REVIEW: PASS_WITH_SCOPED_EVIDENCE
USER_LIGHT_ACCEPTANCE: PENDING

確認時mainと返却HEADのsrc/dist/tests/package/scripts/toolsはGitの内容SHAが一致。本番コードの旧作業混入・巻戻しは見つからない。

Codexの456 tests / 12画面 / 22操作PASSは元artifactの証拠として保持。Controllerは実JSを使う分離DOM/Chromiumの18回帰を実行し18/18 PASS、JS/Python syntaxおよび生成元の対象リンク処理を確認した。全12画面再描画・元22case・全generator・npm再実行・画像の独立比較はNOT RUN。変更後の全visual認定とは扱わない。

修正済み: source選択に一致する結果、Meeting専用filterの境界、古い結果の無効化、Inactive親の変更抑止、不正ファイルの成功誤表示、連続追加/同一ID retry、reset整合、LP詳細への対象引継ぎ。

証拠はPR branchの`integrity-light-review/controller-review-results.json`。元画像をpatch後の新規証拠と表示しない。

## Closed Conclusions

- 単一の通常登録form/過去記録一覧。面談/資料tab、記録種別selector、受領専用form、独立した資料だけ追加routeなし。
- 新規は親記録の保存成功後だけ資料登録。既存親への後日追加可。親・file・link確定の失敗と同一ID再試行を分離。
- 全6区分のCounterpartyを扱う。GP依存validation/filename/search/citationの撤廃は後続BUILDで必要。
- 関連資料の`削除`は当該unlink。親Inactive、資料全体Inactive、physical deleteと混同しない。
- 本文、原本、属性、関連GP、編集、記録削除/復元、既存資料関連付け/分類編集を保持する。
- 検索targetは`面談先`/entityKey。情報ソース3択、直近3年、検索mode/preset、広い質問欄を維持。
- `全文出力`は独立button。空質問・AI未設定でも共通Meeting条件でDocs全文/業務属性を出し、Pitchbook本文/参照link sectionは出さない。
- sidebar 7、Light-only、#182124、active左stripのみ#E1001F、metallic gold、紗綾形、面談集計9列を維持。
- Work 0027のGemini hidden/qualified-disabled、Work 0029のshared-adminは維持。
- 受領のみrecordを禁止する拡張解釈はしない。受領の業務扱い/集計はBUILD前確認事項。専用分岐もschemaも今作らない。

## 権限・未実装境界

許可はdesign/docs/検証のみ。本番src/dist、production tests/依存、Drive/Sheets実データ、provider API、deploy、schema/migrationは未許可。

parent binding、non-GP source、unlink eligibility、原文保全、独立export validator、legacy orphan保持、受領と集計は契約対応表にある後続BUILD必須事項。デモPASSで本番完成と扱わない。

実行instruction: `docs/handoffs/0028-CODEX-11-meeting-centric-design-instruction.md`
事前review: `docs/handoffs/0028-CODEX-11-consistency-review.md`
確定済みUI詳細: `0028-CODEX-10-record-centric-architecture-decisions.md` / `0028-CODEX-10-knowledge-search-action-corrections.md`

## Dispatch履歴

| Dispatch | Disposition |
|---|---|
| 0028-CODEX-01 / 02 | Historical tombstone。再利用不可 |
| 0028-CODEX-03 | PR #40 / RETURNED PARTIAL |
| 0028-CODEX-04 | PR #41 / RETURNED |
| 0028-CODEX-05 | PR #42 / RETURNED |
| 0028-CODEX-06 | PR #43 / RETURNED |
| 0028-CODEX-07 | PR #44 / RETURNED |
| 0028-CODEX-08 | PR #45 / RETURNED / controller review PASS |
| 0028-CODEX-09 | PR #46 / RETURNED / controller review PASS |
| 0028-CODEX-10 | PR #47/#48/#49名義の返却。使用済み、履歴保持 |
| 0028-CODEX-11 | PR #50 / RETURNED。ChatGPT限定修正・18回帰PASS、現在REVIEW |

## Next gate

PR #50修正後Lightのvisual review。ユーザーacceptは未実施。Completion Latchは本controllerの限定修正・回帰検証部分だけとし、Light phase/Work全体には適用しない。

次のCodex新指示は`0028-CODEX-12`。本番BUILDはLight acceptanceと明示許可、Strategy Resetを要する。旧PRのmerge/closeやdeployは行わない。

```text
THEME_SCOPE: LIGHT_ONLY
CURRENT_REVIEW_PR: 50
CODEX_11: RETURNED
CONTROLLER_TECHNICAL_REVIEW: PASS_WITH_SCOPED_EVIDENCE
CONTROLLER_FOCUSED_REGRESSIONS: 18/18 PASS
FULL_VISUAL_RECHECK_AFTER_PATCH: NOT RUN
USER_LIGHT_ACCEPTANCE: PENDING
NEXT_UNUSED_DISPATCH: 0028-CODEX-12
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: REVIEW
