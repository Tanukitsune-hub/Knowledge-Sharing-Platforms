# CODEX-11 — 全体整合性を修復する単一記録Lightデザイン

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.15 / INTEGRITY-RECONCILED LIGHT CORRECTION / DESIGN ONLY

## Work Contract

- Primary Outcome: 利用者が単一の記録登録・過去記録detailで面談内容と資料を扱い、一般Counterparty検索と独立した全文出力を迷わず利用できるLight案を、欠落機能とfuture契約の整合を伴って返す。
- Active Hypothesis: PR #48の利用可能な変更を保持し、不要分岐と欠落・矛盾だけを修復すれば、既存Light方針を作り直さずに一貫した導線にできる。
- Fastest Safe Decisive Action: 最新mainからprepared branchを確認し、PR #48のdesign treeだけを選択的に取り込み、下記差分を反映して主要導線をbrowserで操作する。
- Routing: ChatGPTが判断とGitHub契約を固定済み。Codexは残るdesign実装・local実行検証・範囲内修正を担当する。
- 推奨モデル: Sol High（`gpt-5.6-sol` / reasoning high）。画面横断の既存機能保持と部分失敗stateの整合確認を含むため。モデル/環境設定そのものの変更は不要。
- Scope: `docs/design/0028/selected-light-family/**`、本dispatchのreport、必要なWork 0028管理文書。静的HTML/CSSとsynthetic local state demo。新frameworkやruntime依存を入れない。
- Non-Goals: production `src/**` / `dist/**`、production tests/依存更新、Apps Script実行、deploy、provider API、Drive/Sheets実データ、migration、新schema、Dark/System、テーマ切替、backend再設計。
- 試行上限: visual/interaction修正と再比較は最大2round。同じ失敗の反復、契約の重大反証、production変更が必要になった場合はStrategy Resetし、完了可能な成果を先に返す。
- Completion Latch: 下記Acceptance Evidence充足→最終diff整合確認1回→Draft PR/reportを返して停止。Lightのaccept、本番BUILD許可、mergeはChatGPT/ユーザーのgate。

## 開始点・優先順位

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Prepared branch: `codex/0028-codex11-integrity-light-design`
Review source main: `f2d965c39ed2a1259d07aaff7aca8d60e6b68a8e`。本instructionを含む最新mainをfetchし、実際のBASE_MAIN_SHAをreportへ記録する。

1. ユーザー明示条件、本instruction、`0028-CODEX-11-consistency-review.md`。
2. 最新mainの`0028-dispatches.md`および更新済みの2つのCODEX-10 decision文書。
3. 最寄りのAGENTS.md/override、確定済みLight visual language。
4. PR #48 `108a6e9002270ed0d4264991dd8971cff7cc663f`は再利用する実装候補。全体accept済みではない。
5. PR #46 `400f2f0e77acf81deb32e363d79a3962dfd2f017`は従来機能・visual比較の基準。PR #47 `d2efeff4d04d4c13dba6d0d72a707eacb9aabbe4`は検索修正の参考履歴。

CODEX-10はPR #47/#48で使用済み。再利用しない。旧PRのdispatch/registryをmainへ上書きしない。PR #48のmerge conflictを解消する目的のrebase/merge/force pushは不要。既存PRをclose/mergeしない。prepared branchに予期しない作業があれば破棄せず確認する。

## 必須の限定修正

### A. 記録を追加

- 1つの通常フォームだけにする。`面談 / 資料`タブ、`記録種別`selector、`データ受領`専用form/分岐、`資料だけ追加`を設けない。
- 基本情報の確定済み配置、面談3属性のcheckbox/既存code、本文、参加者、Team、Fund / Strategy、関連GP、フォローメモを維持。低頻度情報は既存の詳細領域でよい。
- 関連資料は同一form内で任意追加。初期画面でファイル選択できても、実登録は親成功後という区別をdemoする。画面上の主buttonは`登録`。技術説明の大きな「親記録」「ID確定」「登録順序」cardを通常form上部へ並べない。
- parent-firstは内部処理として、登録中の短い進捗とファイル別結果で示す。親失敗ならfile registration=0、親成功後の部分失敗なら成功済みを保持する。
- GPに限らず全6区分のCounterpartyを選択可能なsynthetic例を用意する。GP必須欄を別途要求しない。
- 既存資料の関連付け機能は独立資料画面ではなく同じ資料領域の補助操作として保持し、既存Document_IDを再利用する。これを新規uploadと混同しない。

### B. 過去の記録・編集

- 単一の一覧。record-type列/filterおよび資料subtabを削除。期間・相手先・分類・状態等の既存filterは保持する。
- detailには記録本文、業務属性、面談原本を開く導線、編集、記録の削除/復元、関連資料を揃える。資料一覧だけをdetailと呼ばない。
- 過去の記録から`資料を追加`。同じMeeting_IDを使い新規Meetingを作らない。
- 資料行のbuttonは`削除`。補足/確認文で「この記録との関連付けを解除。原本と他の記録の関連は保持」と説明する。
- unlink、資料全体のInactive、親記録のInactiveを別のsynthetic stateとして扱う。リンク解除の取消をPitchbook Reactivateとしてdemoしない。
- 資料の分類編集等、削除した専用画面にあった既存操作はparent detailの補助操作へ移設し、対応表を残す。ファイル差替えは追加しない。
- タブを消した結果、旧リンクが存在しない画面へ遷移しないよう、manifest/index/edit/back導線を揃える。過去PRの不変画像を最新画像として流用しない。

### C. ナレッジ検索・全文出力

- Row 1: `面談先 / 情報ソース / 開始日 / 終了日 / 全期間`。
- Row 2: `検索モード / AIモデル`。Row 3: 大きい質問欄。情報ソース3択、直近3年、全期間ON/OFFと日付復元は保持。
- 面談先はCounterparty Entityの1つの状態から管理。詳細条件に重複した面談先を置かない。比較の2〜5対象と単一相手先を同時送信しない設計を示し、面談準備でも対象の二重入力を避ける。
- AIモデルselectorに全文出力を戻さない。action順は`検索 / 全文出力 / 条件をクリア`。
- 全文出力は共通filterに一致するActiveなMeetingのDocs全文+業務属性。AIなし・資料本文なし・Pitchbook参照リンクsectionなしを明記。
- 空質問・AI未設定・不完全な比較/面談準備条件でも、共通filterが有効なら専用出力actionは使用可能。無効な日付だけは拒否する。質問やAI selectorの値を変更しない。
- 出力previewで実際の対象条件/件数と全文を表示する。0件・上限超過・原本読出し失敗もstateとして説明し、切捨て成功を表現しない。既存copy/Google Docs/PDF導線はdesign例として再利用できるが、実ファイル生成はしない。
- non-GP + `資料のみ`の適格な架空資料例を用意する。実際に照合したように装わず、future metadata契約を示す。

### D. 横断整合

- 7 sidebar destinations、初期ナレッジ検索、#182124、active左stripのみ#E1001F、gold icons/separator、紗綾形、Light-onlyは固定。再発案しない。
- 面談実績の集計は承認済み構成と9列を保持。○/—は複数該当可能、確認済みは右端。新資料の追加だけで面談件数や面談日が増減するdemoにしない。
- 面談先サマリーはGP/Entityの別read契約を維持し、通常資料操作は親記録へつなぐ。文脈付き資料参照を禁止したという意味ではない。
- 管理者preset設計、自由質問の保護、gray readonly、draft復元、Work 0027 hidden、Work 0029 auth/session/logout/rotationを保持する。
- 受領のみ記録の業務扱いはconsistency-review記載のBUILD前確認事項。今回、専用分岐を復活させたり、受領自体を禁止する仕様を新設しない。受領を面談件数へ自動計上する例も作らない。

## 必要な契約対応表

`docs/design/0028/selected-light-family/integrity-light-review/contract-impact-map.md`に、現在のsource根拠・今回のUI対応・future BUILD delta・必要なruntime evidenceを簡潔に対応付ける。

最低限: 親ID検証、upload/link partial failureと同一ID再試行、non-GP validation/filename/source metadata、unlink/検索eligibility/復元、関係だけの変更によるDocs原文保全、独立export validatorと出力項目、legacy orphan保持、受領のみ記録と面談集計。

小さなschema/限定facade変更が後続で必要になり得ることは認めるが、このdispatchでは実装しない。既存sourceにない機能を「既存契約のままで完成」と報告しない。5-sheet backend、stable IDs、no physical delete、provider route/securityの不変条件は保持する。

## Acceptance Evidence Matrix

| ID | 必須証拠 |
|---|---|
| E1 | 単一登録form。不要tab/type分岐なし。既存controlの残置/移設/明示廃止inventory。GPとnon-GPの両例 |
| E2 | local state demoで親成功→資料成功→関連確定。親失敗では資料0件。ファイル失敗/関連付け失敗は別state、同じIDで再試行 |
| E3 | 過去記録の本文/属性/原本/編集/記録削除・復元と、既存親への資料追加が到達可能 |
| E4 | 資料unlinkと取消、共有資料の他リンク保持、元からInactiveな資料との違いをdemo/検証 |
| E5 | 面談先の一貫した選択、情報ソース3択、自由/固定質問/日付復元、non-GP資料の表示例 |
| E6 | 専用全文出力が空質問/AIなしで動作するdemo。日付逆転は拒否、適用scope/原文/属性を表示。modeや質問を勝手に書換えない |
| E7 | 最新manifest全画面の1366×768 render、pageと主要tableの横overflowなし、sidebar 7/active 1、console warn/errorを記録 |
| E8 | PR #46/#48との同viewport比較で意図した差分だけ。新しい主要画面/stateのscreenshots、review index、Product Design QA |
| E9 | canonical `npm run check`、design assertions、demo JS syntax、git diff --check。未実行はNOT RUN。CIの実行有無をlocal結果と分離 |
| E10 | 契約対応表とfinal diffでproduction src/dist/test/依存変更NONE。暗黙のmigration/外部通信/保存なし |

証拠階層: 最新ユーザー条件/本handoff→確認済みsource→実際のlocal browser操作/画像→static assertions。static mockの挙動をApps Script runtime proofに読み替えない。Browser/IABを優先し、代替harnessが必要なら理由を記録する。unsupportedな試験をPASSにしない。

## Return package

- 新しいDraft PRをprepared branchからmainへ作成。PR #48はcurrent repair baselineとして記録し、旧PRは変更しない。
- `docs/design/0028/selected-light-family/integrity-light-review/`にREADME、screenshots、validation、design QA、contract-impact-map、control coverage。
- report: `docs/handoffs/0028-CODEX-11-meeting-centric-design-report.md`。
- branch側dispatch/registryをRETURNEDへ整合更新。mainへの変更・mergeはしない。
- report/PR/返却でWork/Dispatch/BALL/STATUSを一致させ、BASE_MAIN_SHA、DONOR_SHA、FINAL_COMMIT、PR URL、実行test、NOT RUN、BLOCKER/FOLLOW_UPを記録。
- source/runtime/deploy変更はNO、READY_FOR_PRODUCTION_BUILDはNO。返却時BALL=CHATGPT / STATUS=RETURNED。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CODEX
STATUS: READY
