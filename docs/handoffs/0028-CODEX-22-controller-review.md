# CODEX-22 controller review — 日時readback再発 / Strategy Reset

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-22
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD

受理対象は停止判断・観測事実・保存済み証拠であり、version3の修正またはWork全体の受入ではない。Work 0028は未完了。

## 確認した正本

- PR #51 / `codex/0028-production-contract-build`
- 返却HEAD: `7c18e6dc5184209882c807db08365bd12007f0bc`
- 同HEADの `docs/handoffs/0028-CODEX-22-autonomous-completion-report.md`
- 修正commit: `6b1f180b68f70527fad42a37b774f198531c473c`
- 生成物commit: `6363c6c27aeee55bcee701732b16cc507b44fdb5`
- `src/20_LiveEnvironment.gs` の修正diff、`tests/temporal-contract.test.cjs` の関連範囲
- `AGENTS.md`、`docs/agent-governance/work-control.md`、dispatch正本、Work Registry

## 受理する証拠と未達項目

| 項目 | 判定・証拠の適用範囲 |
|---|---|
| installer / I2 / schema7 / Backend 5 sheets | 既存の受入証拠を維持 |
| versioned confirmation / 独立attestation MATCH | CODEX-21の証拠を維持。editor-context STALEを再びproduction gateにしない |
| R1 / R2 / R3 initial attachment | version2でPASS。GP/non-GP親2件と初回tiny fileは再作成しない |
| R6 | 初回relation追加でDocs body/tab content・business fields不変。unlink/relink分は未実行 |
| 日時readback修正 | 実機不合格。523/523・bundle30/30はlogic evidenceのみ |
| 現在のserved version3 | 同一owner-only deployment、既知日時不具合あり・未認定 |
| R4 / R5 / R7、R6 / R8残項目 | NOT_RUN。R1-R8全体は未完了 |
| データ保全 | 停止後のbounded readbackで元Date/Time・business fields・Docs body/tab contentは不変 |
| 外部副作用 | provider0、AI disabled、機密データ0、物理削除0。既存targetとsynthetic作成物を保持 |

reportに記録された再現結果:

| synthetic記録 | 入力 / authoritative formatted cells | version2 UI | version3 UI |
|---|---|---|---|
| GP | 2026-09-17 10:30 | 2026-09-17 19:30 | 2026-09-16 02:30 |
| non-GP | 2026-09-17 11:15 | 2026-09-17 20:15 | 2026-09-16 03:15 |

これらはsynthetic fixtureの値であり、実在面談情報ではない。

## 原因の評価

元セルを変更していないのにUI値が異なることは直接証拠。正確にどの境界で変わるかは未確定。

CODEX-22の修正は、Date/Time列のDate objectをworkbook timezoneでformatするものだった。追加testは想定したDate objectを入力し、`Utilities.formatDate`をNode `Intl.DateTimeFormat`で代替している。これはその想定上の変換を検証するが、実際のSheets readback値・Apps Script formatter・後続変換の一致を証明しない。

したがって「workbook timezoneでformatすれば解消する」は採用済み解決策ではない。UTC/JSTの固定offset補正、Spreadsheet timezoneの変更、全列のdisplay string化等を次の処方箋として指定しない。

## Strategy Reset

Primary Outcomeは不変: accepted Light UI + production contractを既存isolated container-bound targetでprovider-independentにend-to-end成立させ、ユーザー実機確認へ渡せる状態にする。

次Dispatchは `0028-CODEX-23`、Modeは `BUILD`。最安の次の決定的行動は、既存の同じsynthetic 2件について保存値からUIまでの値・型・変換境界を実測し、最初の不一致を特定すること。変更手法・調査順序・実装はCodexへ委譲する。日時修復だけで返さず、残りR1-R8も続行する。

CODEX-22の停止規則では初回観測＋1回の修正後再発を2回と数え、3cycle枠のうち1cycleで返却した。停止自体は旧契約に適合する。CODEX-23では、同じ症状を見た回数と、修正案の実機検証に失敗した回数を区別する。初回観測はrepair cycleに数えず、1回の修正後再発では影響matrixを停止して同run内でStrategy Resetする。新しい直接証拠を得てから次cycleへ進む。上限・返却条件はCODEX-23 instructionを正本とする。旧規則を遡及変更しない。

## BLOCKER / FOLLOW_UP / OPTIONAL

- BLOCKER: 再発した日時readback不整合、および残りの必須R1-R8実機証拠。
- FOLLOW_UP: 修復成功後のtemporal runtime知見の共有。失敗した修正を成功patternにしない。
- OPTIONAL: 表示の装飾、広範なtimezone/browser網羅、独立したリファクタリング。

version3は本番導入・ユーザー受入済みにしない。version2も日時症状があるため、version2へのrollbackだけで完了とはしない。元データ・Docs・証拠の改変による辻褄合わせは禁止。

## 委譲と完了

ChatGPTはGitHub上の判断・受入条件を固定し、Codexは同一PR / target / single deployment内で診断・最小修正・検証を自律実行する。安全境界外の操作、実行予算枯渇、解決不能な実行環境制約だけを返却する。Work 0030はDEFERRED_BY_USER。

最終diff・logic tests・source/version対応・runtime matrixが揃いBLOCKERなしとなった場合のみ、ChatGPTがPR #51を収束・mergeしCompletion Latchを適用する。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-22
BALL: NONE
STATUS: ACCEPTED
