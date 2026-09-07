# CODEX-11 / PR #50 — Controller reviewと限定修正

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
CONTROLLER_ROUTE: A / NO_NEW_CODEX_DISPATCH

## 結論

PR #50のGitHub差分、返却report、現行design JS、生成元、契約対応表を確認した。本番コードの巻戻し・旧作業混入は見つからない。一方、返却済み操作デモにはsource選択・削除済み親の変更・反復追加等の齟齬があり、ユーザーの限定修正許可に基づきChatGPTがPR #50の同じbranchへ修正した。

CONTROLLER_TECHNICAL_REVIEW: PASS_WITH_SCOPED_EVIDENCE
USER_LIGHT_ACCEPTANCE: PENDING
FULL_VISUAL_RECHECK_AFTER_PATCH: NOT RUN
READY_FOR_PRODUCTION_BUILD: NO

これはコード照合と限定回帰検証の判定であり、全コード無欠陥、全画面再認定、Apps Scriptの本番稼働を保証するものではない。

## 検証対象と来歴

- 確認時main: `40d1f2759cd3d4c9e01a1fb04607293c420cb85c`
- Codex返却HEAD: `7564865badc88e01ca930faba27e4edf0c29b174`
- Codexが全体検証したdesign artifact: `39aaba1a5e8ae13b4015468b2d3255a9d4992f28`
- PR #50 branch: `codex/0028-codex11-integrity-light-design`
- Controllerの4ファイル修正完了commit: `841fa291676bee5de0490814dbc51a10fd11d3dc`
- 回帰script追加commit: `317817a38a782d2a88f2606d2d6b649ac2b3b6e2`
- 回帰結果保存commit: `b1a7f376c8d04735b01ffd6f9b9dcbfe63c1a82e`

PR #50は最新mainから3commit aheadとして返却され、PR #48を主donor、PR #49の単一記録部分を補助donor、PR #46をvisual基準としたことがreportに記録されている。PR #49 `bf52bc7642503aa4f0baba445a0269818efd9286`はCODEX-10名義の別design返却として確認した。旧PRの存在と本番コード混入は区別する。旧PRのmerge/close/履歴改変は行っていない。チャット自動開始の原因や利用者ローカルworktreeまではGitHubから判定しない。

## 本番ツリーの整合

確認時mainとPR #50返却HEADの以下のGit tree/blob SHAが完全一致した。差分一覧も150pathすべてdesign/docs/report/controlに限定されていた。

| 対象 | 両refで同一のSHA |
|---|---|
| src | fc24c22e7043694d98f5dad6e1637076be75016c |
| dist | c89d320addf0c1a8eee27fc6531fcb9fd7951449 |
| tests | 60027fcca181d1ae1eb9c1d5adefb416fd553431 |
| package.json | 2e84f1ed128f6b3ab5ed1a8b2e58ef8e8afaa5bb |
| scripts | 128cdb87dd386d1f769afe657b7155b5202306bd |
| tools | 1c2be4ae275c1b602e9c313a780c86e1dee8c91d |

Controllerも上記には書込みを行っていない。既存の本番機能が新designへ実装済みになったという意味ではなく、変更されていないことの証拠である。

## 検出・修正したdesignの齟齬

| 区分 | 修正前の問題 | 限定修正 |
|---|---|---|
| 情報ソース | 面談記録のみでもPitchbook例を表示。両方を選んでもMeeting例なし | Meeting/Pitchbook/両方の結果例を選択に一致させた |
| 検索条件 | 関連GP+資料のみ、Team+混在sourceを未対応とせず成功表示。条件変更後の旧結果が残る | 現行Meeting専用filterの正規化/拒否境界を反映し、条件変更・検証失敗時に旧結果を非表示 |
| 親状態 | Inactive親でもunlink・分類更新ができた | 保存済み親の変更可否をdemo actionで統一。読み取りと復元は別扱い |
| 追加・再試行 | 成功後の2回目追加を拒否。結果全件をretry更新。連続追加IDの区別がない | 未完了batchだけを先にretry。新batchは同じ親で新DOC番号、retryは未完了分を同じIDで確定 |
| 入力・初期化 | 不正/空ファイルを外したまま成功表示。resetで親状態と関連が不一致。分類対象未選択で特定資料を更新 | 不正選択を明示拒否。resetを一貫化。分類対象と日付を確認 |
| 対象引継ぎ | EntityサマリーからGP detailへ遷移。新規formのLP queryで存在しない戻りlinkへアクセス | LP queryを維持。生成元と生成HTMLを同時更新し、存在しないlinkをguard |

修正ファイルは`record-demo.js`、`search-demo.js`、`integrity_render.py`、`10-workspace-entity.html`。Light visual tokens/CSS、backend、provider、認証、schemaは変更していない。

## 証拠の区別

1. Codex返却証拠: 456 tests、12画面、22操作、1366×768 overflow/console0。元artifactに対する報告として保持する。Controllerが再実行した結果には読み替えない。
2. Controller直接証拠: originalとpatch JSのGit blob一致を確認し、実Chromiumの最小DOMに実JSを読み込み、18の対象回帰を実行。修正前6/18、修正後18/18 PASS、console/page error0。12のfailed assertionは独立した不具合12件という意味ではない。
3. `node --check`で両JS、Python compileで生成元と実行harnessを確認。生成元のsummary-link処理だけを実行し、LP HTMLとのbyte一致とGPリンク不変を確認。4ファイルの差分にwhitespace診断なし。
4. Repository clone/全画面取得・localhost閲覧に環境上の制約があったため、分離DOM検証を使用した。全generator・元22case・全12画面・画像比較・npm checkはController側NOT RUN。元画像は原artifactの証拠であり、patch後の新規画像とは扱わない。
5. Apps Script保存、Drive/Docs実原本、File Search実行、server認証/CAS、実モバイル、実出力はNOT RUN。今回の18caseはそれらを模したdesign JSに限定される。

PR #50 branch内の再現scriptと結果:

- `docs/design/0028/selected-light-family/integrity-light-review/verify-controller-regressions.py`
- `docs/design/0028/selected-light-family/integrity-light-review/controller-review-results.json`

元の`validation.md`/`browser-results.json`/画像は履歴証拠として変更しない。patch後の判定は本reviewとcontroller結果を併読する。

## BUILD前の必須事項（今回の実装対象外）

`integrity-light-review/contract-impact-map.md`の以下は未実装であり、引き続きBUILD前に閉じる。

- saved parent binding、prepare/upload/linkの競合・部分成功・不明応答の安全な回復。
- non-GPをvalidationだけでなく命名、属性、index、検索・引用まで伝播させる。
- unlink/最終有効link/Inactive/復元と検索eligibility、共有資料、legacy orphan保持の整合。
- 関係のみの変更でGoogle Docs本文を再生成・上書きしない。
- 全文出力をAI modeのvalidatorから独立させ、原本/fingerprint/件数・文字数・時間上限を維持。
- 受領だけの記録の業務扱いと面談集計。専用tab/typeを再導入せず、3属性の未選択から受領を推測しない。

現在確認したdesign-code不具合は修正済み。Lightの視覚的受け入れと本番BUILDは未承認。次にCodexへ新指示を出す場合は`0028-CODEX-12`。本reviewは新dispatchを発行しない。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: REVIEW
