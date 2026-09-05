# Work 0028 — UI/UX surface refinement and terminology simplification

WORK_ID: 0028
MODE: DESIGN -> BUILD only after user selection
BALL: CHATGPT
STATUS: ACTIVE

## Primary outcome

Knowledge Shareの既存機能を大きく作り直さず、画面デザイン、操作性、情報配置、visual hierarchy、navigation、状態表示、confirmation copy、button/label terminologyを改善する。

このWorkの第一目的は、新機能を増やすことではない。

既に組み上がっているGoogle Apps Script Web Appの機能を同じまま、通常利用者がより直感的に操作できるsurfaceへ改善する。

## Hard constraint

既存システムの大幅改修は避ける。

Work 0027までのaccepted baselineを保護する。

DESIGN phaseではproduction sourceを変更しない。

BUILD phaseへ進んだ後も、原則として以下は変更しない。

- five-sheet Backend;
- stable IDs and metadata contracts;
- Meeting/Pitchbook registration semantics;
- Active / Inactive / Reactivate lifecycle semantics;
- current server facade/function contracts;
- Knowledge Search request/filter/mode/citation contracts;
- OpenAI/Gemini provider adapters and provider state;
- explicit ChatGPT / Gemini / 全文出力 route semantics;
- no cross-provider failover;
- installer/distribution architecture;
- security/authorization boundaries.

新しいsheet/database/API/provider/index/relation model/migration/background workflowをUI改善のためだけに追加しない。

Governing decision:

`docs/decisions/ui-surface-language-and-backend-preservation.md`

## Existing source to inspect before proposing mocks

Do not invent the current UI from memory. Inspect the actual current source on `main`.

Priority files:

```text
src/Index.html
src/Styles.html
src/ClientCore.html
src/MaintenancePages.html
src/ClientMaintenance.html
src/ClientMaintenanceEnhancements.html
src/KnowledgeSearchPage.html
src/ClientKnowledgeSearch.html
src/EntityWorkspacePage.html
src/ClientEntityWorkspace.html
src/ActivityAnalyticsPage.html
src/ClientActivityAnalytics.html
src/RelationshipExplorerPage.html
src/ClientRelationshipExplorer.html
```

Server-side files may be read only to understand what the existing UI already calls. Do not redesign backend behavior to make a mock easier.

Also read:

```text
docs/product/vision.md
docs/planning/work-registry.md
docs/handoffs/0027-dispatches.md
docs/decisions/ui-surface-language-and-backend-preservation.md
```

## Phase A — create comparable mocks before implementation

Produce exactly three deliberately distinct visual directions that represent the same current functional capabilities.

### Direction A — Minimal / Search-forward

Characteristics:

- very clean application shell;
- few competing visual elements;
- primary action is visually obvious;
- search/question surfaces feel lightweight;
- secondary filters/actions are progressively disclosed where possible without changing functionality.

This is inspired by modern enterprise search products, but do not copy a specific product or introduce new AI behavior.

### Direction B — Workspace / Notion-like

Characteristics:

- calm workspace feel;
- clear page hierarchy and sections;
- useful recent/contextual information where it already exists in the current product;
- cards/tables/sections optimized for scanning;
- navigation and context are visible without feeling like an admin console.

Do not invent data feeds or recent-item backend features that do not currently exist. Use representative/static mock content if needed to demonstrate layout only, and clearly mark it as mock content.

### Direction C — Investment Dashboard

Characteristics:

- professional private-assets research/workbench feel;
- navigation emphasizes Meeting, Pitchbook, Entity/GP, Knowledge Search, analytics and relationships;
- stronger information density than A/B, but still easy to scan;
- suitable for repeated daily use by investment professionals.

Do not turn this into a new portfolio database or add unimplemented investment metrics.

## Representative screens for all three directions

All three directions must show the same representative functional areas so the comparison is fair.

At minimum:

1. Application shell / navigation / landing state
2. Past Meeting/Pitchbook records or maintenance list
3. Record actions: edit / delete / deleted state / restore
4. Knowledge Search input/filter area
5. Knowledge Search result with answer + citations/source links

Optional additional screens may be shown only when they materially help compare the design system.

Do not create dozens of screens before choosing a direction.

## Surface language review

Perform a terminology pass separately from visual styling.

Principle:

`internal implementation term != required user-facing label`

The normal-user UI should use task-oriented language.

Candidate mappings to evaluate:

| Current/internal concept | Candidate surface wording |
|---|---|
| Inactivate / Deactivate | 削除 |
| Reactivate | 復元 |
| Inactive | 削除済み |
| Active | 表示中 / 使用中 / omit when obvious |
| Index | 検索対象に追加 / 検索準備 |
| File Search | ナレッジ検索 / 資料を検索 |
| Processing | 処理中 / 読み込み中 |

Do not mechanically apply this table. First inventory the actual current labels from source, then propose a coherent final wording set.

### Delete wording rule

The underlying lifecycle remains soft-delete style `Inactive`.

Normal users may see the action as `削除` because their intended result is to remove the item from normal lists/search.

Where permanent deletion could be reasonably inferred, use explanatory confirmation copy such as:

```text
このナレッジを削除しますか？
削除後は通常の一覧・検索結果に表示されなくなります。データは保持され、必要に応じて復元できます。
```

Do not implement physical deletion merely to make the label technically literal.

## Existing functional choices remain visible/truthful

Visual simplification must not silently alter product behavior.

In particular, ChatGPT / Gemini / 全文出力 currently represent real route semantics. You may improve their presentation, grouping, explanation, labels or visual emphasis, but do not replace them with hidden automatic routing as part of this Work unless a separate explicit product decision is made.

The same applies to model/thinking controls and administrator policy: simplify presentation where possible, but do not bypass existing policy semantics.

## No external user-testing dependency

The user does not expect to recruit other users for formal usability testing.

Instead, perform a scenario-based heuristic review of each mock.

Use the same scenarios for all directions:

1. 初回利用者が過去Meetingを探す;
2. 過去recordを開いて編集する;
3. recordを削除して通常画面から消す;
4. 削除済みrecordを復元する;
5. Knowledge Searchで質問する;
6. answerからcitation/source documentを確認する;
7. ChatGPT / Gemini / 全文出力の違いを理解して選ぶ.

For each direction assess:

- first-action clarity;
- number of visible decisions/clicks;
- terminology clarity;
- information density;
- source/citation readability;
- error/status clarity;
- desktop practicality;
- implementation complexity against current GAS HTML architecture;
- risk of requiring backend changes.

## Deliverables for Phase A

Return:

1. Three visual mocks, clearly labelled A/B/C
2. One comparison table
3. Actual-current-label -> proposed-user-label terminology inventory
4. Specific observations from scenario review
5. One recommended direction or recommended hybrid
6. Explicit list of any mock element that would require more than presentation/client-side work

Do not treat the recommendation as final approval. The user selects the direction.

## Design quality goals

Prefer:

- professional and calm rather than flashy;
- clear visual hierarchy;
- fewer technical terms on normal-user surfaces;
- compact but not cramped controls;
- consistent action hierarchy;
- obvious primary action;
- destructive-looking actions visually separated from ordinary edits;
- readable tables/cards;
- citations that are clearly connected to the AI answer;
- loading/empty/error states that explain what is happening;
- reusable design tokens/components that can be applied across existing pages.

Avoid:

- decorative redesign that adds no usability value;
- large hero areas that waste working space;
- multiple competing primary buttons;
- unnecessary gradients/animation;
- hiding existing important controls just to make screenshots cleaner;
- a new frontend framework solely for aesthetics;
- designs that only work if the backend is rewritten.

## Implementation preference after user selection

Only after explicit user selection should the Work move to BUILD.

Then prefer changes in:

```text
src/Styles.html
src/Index.html
page HTML fragments
client-side HTML/JavaScript
user-facing strings
```

Reuse existing server calls and contracts.

If a desired UI element truly requires backend changes, classify it before coding as:

- `PRESENTATION_ONLY` — safe for Work 0028;
- `SMALL_ADAPTER` — minimal compatible client/server glue, justify explicitly;
- `BACKEND_REDESIGN` — out of scope for Work 0028 unless separately approved.

Default outcome for `BACKEND_REDESIGN` is to alter the mock, not alter the system.

## Build/qualification gate after design selection

A future Codex dispatch should require at minimum:

- exact selected design reference;
- terminology map;
- unchanged server/API/data contracts unless explicitly listed;
- deterministic checks;
- UI regression review across existing pages;
- normal Meeting/Pitchbook maintenance flow;
- delete/inactive/restore behavior unchanged internally;
- Knowledge Search route/filter/result/citation behavior unchanged;
- bundle generation parity;
- one bounded target-runtime visual/interaction qualification only after deterministic pass.

Do not deploy anything during Phase A.

## Phase A completion latch

```text
CURRENT_UI_SOURCE_REVIEWED: PASS | FAIL
THREE_DISTINCT_MOCK_DIRECTIONS: PASS | FAIL
SAME_FUNCTIONAL_SCOPE_ACROSS_MOCKS: PASS | FAIL
TERMINOLOGY_INVENTORY: PASS | FAIL
DELETE_RESTORE_LANGUAGE: PASS | FAIL
KNOWLEDGE_SEARCH_RESULT/CITATION_MOCK: PASS | FAIL
SCENARIO_REVIEW: PASS | FAIL
IMPLEMENTATION_RISK_CLASSIFICATION: PASS | FAIL
BACKEND_REDESIGN_REQUIRED_FOR_RECOMMENDED_DIRECTION: NO | YES
USER_DIRECTION_SELECTED: YES | NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_BUILD: YES | NO
```

## Phase A stop condition

Stop after presenting the three comparable directions, terminology recommendations, scenario review and recommendation.

Do not proceed into source implementation simply because one option appears best. User selection is the explicit gate.
