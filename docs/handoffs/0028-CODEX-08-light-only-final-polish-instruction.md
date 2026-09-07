# Work 0028 / CODEX-08 — Light-only final polish instruction

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.10 / LIGHT-ONLY FINAL POLISH / DESIGN ONLY

## Primary Outcome

PR #44をreview historyとして保持しつつ、ユーザーが確定したLight-only最終修正を反映した新しいdesign-only Light familyを作成し、ユーザーが最終visual acceptanceできる状態まで仕上げる。

Production実装、runtime変更、deployは行わない。

## Authoritative sources

開始時に最新`main`と最寄り`AGENTS.md`を再確認すること。以下を正本として従う。

1. `docs/handoffs/0028-CODEX-08-light-only-final-polish-instruction.md`
2. `docs/handoffs/0028-light-final-correction-decisions.md`
3. `docs/handoffs/0028-dispatches.md`
4. `docs/planning/work-registry.md`
5. PR #44 / `docs/design/0028/selected-light-family/**` はvisual baseline / review history

Work 0027 / 0029のaccepted contractは再開しない。

## Fastest Safe Decisive Action

最新`main`をbaseに、既に準備済みのbranch `codex/0028-light-only-final-polish` を使用してbounded design correctionを行う。PR #44のdirty状態を解消するためにPR #44へ追記・rebaseするのではなく、新しいDraft PRを作成する。

## Required design changes

### 1. Start surface

- `Light navigation`はproduction pageではない。
- Web Appの初期画面は`ナレッジ検索`。
- navigation overview artifactはreview用として残してよいが、product surface / screenshot acceptance targetとして扱わない。

### 2. Sidebarを7 destinationsへ

通常業務:
1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計

system/tool:
6. プルダウンの管理
7. 管理者ページ

- `面談と資料の関連`は独立destinationから削除。
- text group headingは追加しない。
- `面談実績の集計`と`プルダウンの管理`の間に約1行の余白＋gold decorative separator。
- separatorは両端が尖り、中央がわずかに膨らむ細身の形状。local SVG/CSSのみ。

### 3. Relationship ExplorerをPast Recordsへ統合

relationship truthは引き続き`Meeting_Index.Related_Pitchbook_IDs`の明示Document IDのみ。GP名一致から推定しない。

- `過去の記録 / 資料`: 各資料に`関連面談 n件`を表示し、明示的に参照するMeetingをinline / row detailで展開。
- `過去の記録 / 面談`: 各Meetingに`関連資料 n件`を表示し、resolved / Inactive / unresolvedを既存semanticsのまま展開。
- source URLがある場合は`原資料を開く`。
- relationの追加・削除は既存Meeting registration/edit contractのまま。Past Recordsに新しいmutation workflowを作らない。
- new DB / sheet / relation model / endpoint不要。

### 4. Gold treatment

現在の薄いflat goldを、控えめなchampagne〜antique metallic goldへ改善する。

優先対象:
- `Knowledge Share` brand
- sidebar thin-line icons
- decorative separator
- small gold rules / accents

許容:
- subtle highlight / shade / gradient

禁止:
- strong glow
- animation
- mirror-like shine
- loud 3D treatment
- nav label本文への過度なmetallic treatment

### 5. Theme scope

Light only。Dark / System / theme selector / `prefers-color-scheme` / theme persistenceは作らない。

## Preserve

- sidebar base `#182124`
- active item: thin left strip `#E1001F` + non-red active cue
- ordinary UIでの`#E1001F`使用なし
- cool Light slate / white cards / cool borders
- persistent sidebar / desktop-first wide workspace
- local thin-line SVG icon family
- dense sayagata lower-left fade
- Knowledge Search one visible model/profile selector、normal-user Thinking hidden
- Gemini qualified-disabled / normal-user hidden
- Meeting / Pitchbook dataset・handler・validation・lifecycle分離
- GP / non-GP separate read facade mapping
- Activity Analyticsの承認済み統合構成
- Work 0029 shared-admin behavior

## Non-Goals

- production `src/**` / `dist/**`変更
- backend redesign
- new provider / sheet / DB / relation model
- migration
- deployment
- Dark/System variants
- Work 0027 / 0029再検討

## Acceptance Evidence

最低限、以下を確認してreportへ記録する。

- design pagesのrender PASS
- 1366×768 horizontal overflow 0
- active sidebar destination exactly 1
- sidebar destination exactly 7
- text group heading 0
- standalone relationship destination 0
- `過去の記録 / 面談`と`資料`に双方向relationship viewあり
- ordinary `#E1001F` usage 0 / active strip only
- separator shape / gold treatmentをscreenshotsで確認可能
- browser console warning/error 0 in static harness
- `git diff --check` PASS
- production `src/**` / `dist/**` changes NONE
- Product Design QAでactionable P0/P1/P2なし、または残件を明示

Static artifactからkeyboard/focus/contrast/screen-reader/runtime/persistence PASSを主張しない。

## Deliverables

- corrected Light design artifacts
- final review screenshots
- validation evidence
- `docs/handoffs/0028-CODEX-08-light-only-final-polish-report.md`
- `docs/handoffs/0028-dispatches.md`更新
- `docs/planning/work-registry.md`更新
- 新しいDraft PR（PR #44をsupersedeするcurrent Light visual review target）

完了時はBALLをCHATGPT、STATUSをRETURNEDとして、PR URL、branch、head SHA、report path、validation要約を返す。
