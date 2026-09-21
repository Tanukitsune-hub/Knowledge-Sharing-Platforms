# Work 0046 — UI cleanup and staged master reorder plan

WORK_ID: 0046
STATUS: ACCEPTED
MODE: BUILD
DEPENDENCY: Work0045 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

User-facing surfaceを簡潔化し、内部ID / Follow-upノイズを除去。Entity summaryとAnalyticsを読みやすく整理し、Master reorderをdraft + explicit Save方式へ変更する。

## Workstreams

### 1. Surface cleanup
- Counterparty internal ID visible text除去
- Follow-up visible UI全面除去
- Meeting ID / Document ID維持

### 2. Entity summary
- 3 summary cards
- Japanese labels
- equal-height layout
- follow-up / relationship presentation removal

### 3. Activity Analytics
- title日本語化
- グラフ / 面談一覧 tabs
- graph panel = breakdown + summary
- list panel = matching Meetings
- Follow-up presentation removal

### 4. Master reorder
- drag = local draft only
- per-tab draft
- explicit Save
- batch persist
- dirty state / reset
- one save = one RPC

## Fastest Safe Decisive Action

Work0045 Completion Latch後:
1. latest mainからvisible-surface inventoryを固定
2. Follow-up / Counterparty-ID表示点のtestsを先に追加
3. Entity + Analytics presentationを限定変更
4. staged reorder state machineをclientに実装
5. batch reorder server contractを最小追加
6. deterministic tests
7. browser qualification
8. same owner-only runtime qualification
9. ChatGPT final review / merge

## Strategy boundary

このWorkはUI simplification + reorder UXのみ。

Do not:
- delete historical follow-up data
- migrate schema
- change Meeting/Document identity
- change provider/theme architecture
- broaden permissions

## Routing

Route C。Work0045 accepted baselineからCODEX-01を発行済み。

Recommended model:
- GPT-5.6 Sol High

Reason:
visible-surface横断cleanupとmaster reorder transaction semanticsが複数client/server領域に跨るため、実装前の影響確認が必要。
