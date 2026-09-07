# Work 0028 / CODEX-10 report — Knowledge Search action corrections

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.14 / KNOWLEDGE SEARCH ACTION CORRECTIONS / DESIGN ONLY

## Outcome

CODEX-10の追加Light修正をdesign-onlyで完了した。CODEX-09のLight familyとPR #46をvisual baselineとして、Knowledge Searchの`GP`表記を汎用Counterparty Entityの`面談先`へ変更し、`全文出力`をAIモデルselectorから独立したMeeting-only / non-AI actionへ分離した。

## Changed design surface

- Row 1を`面談先 / 情報ソース / 開始日 / 終了日 / 全期間`へ更新。
- `面談先`は`data-contract="entityKey"`を持ち、GP / LP / Asset Owner / 日本生命 / グループ会社 / Consultant / Gatekeeper / その他のsynthetic optionを表示。
- `AIモデル`は許可済みprofileの`GPT-5.6 Luna`だけを表示し、`FULL_EXPORT` optionを除去。
- action orderを`検索 / 全文出力 / 条件をクリア`とし、Meeting-only / AIなしのscope badgeを表示。
- Full Output previewにMeeting ID、日時、面談先、関連GP、場所、Asset Class、Equity / Debt、Team、Fund / Strategy、Meeting Type、Related Pitchbook IDs、follow-up、参加者、Google Docs本文を表示。
- Full Output previewにはPitchbook本文・Pitchbook参照リンクsectionを含めない。`Related Pitchbook IDs`はMeeting rowに保存されたrelationship metadataの例としてのみ残した。
- normal AI Searchの回答・citation stateとFull Output stateを別々に確認可能にした。

未確定のPast Records reverse relation removalは変更していない。

## Provenance and branch reconciliation

- Canonical base: `origin/main` `de8563e287299be4477641822d72f5ebf2a65adf`
- Donor: PR #46 / CODEX-09 `400f2f0e77acf81deb32e363d79a3962dfd2f017`
- Branch: `codex/0028-knowledge-search-action-corrections`
- Production source SHA referenced by design renderer: `7ea55f55278bddfceb03e279f7e536e6b7590c16`

PR #46の古いcontrol/historyをmergeまたはrebaseせず、review済みdesign treeだけをcurrent `origin/main`へmaterializeした。PR #46自体は履歴・review evidenceとして変更していない。

## LOGIC_VALIDATION

- `python docs/design/0028/selected-light-family/render-design.py`: PASS / 15 pages generated.
- `python docs/design/0028/selected-light-family/validate-user-corrections.py`: PASS.
- `python docs/design/0028/selected-light-family/validate-light-only-polish.py`: PASS / 15 pages, 7 destinations, relationship views integrated.
- `node --check docs/design/0028/selected-light-family/search-demo.js`: PASS.
- `npm run check`: PASS / 456 of 456; CODEX-10 scope is design-only and no production source/test path changed.
- `git diff --check`: PASS after staging the intended tree.

## TARGET_RUNTIME_QUALIFICATION

Static inert HTML was served through the local browser only.

- 1366×768 desktop: initial, Full Output, and normal AI Search states rendered; overflow 0; console warning/error 0.
- 390×844 mobile: initial and Full Output states rendered; no horizontal overflow; console warning/error 0.
- `面談先` selection to synthetic `LP:A` succeeded.
- `全文出力` made `export-answer` visible and kept `search-answer` hidden.
- normal `検索` made `search-answer` visible and kept `export-answer` hidden.
- AI model options contained only `GPT-5.6 Luna` in the synthetic approved-profile fixture.
- same-viewport comparison loaded CODEX-09 baseline, CODEX-10 initial state, and Full Output state with all local images intact.

This is design/browser evidence only. It does not qualify Apps Script HTML Service, Google Docs readback, persistence, authentication, provider execution, or deployment.

## SIDE_EFFECT_STATE

- Production `src/**`: unchanged.
- Production `dist/**`: unchanged.
- Apps Script/runtime/deploy/provider/data/auth: unchanged and not executed.
- Dark/System/theme switching: not created.
- Past Records reverse relation behavior: unchanged because the decision remains open.
- No confidential data, credentials, private URLs, or organization-specific runtime IDs added.

## READY

`READY_FOR_CHATGPT_REVIEW / USER_LIGHT_ACCEPTANCE_PENDING`

No technical BLOCKER remains for this design-only dispatch. Production BUILD remains unauthorized and requires a separate Strategy Reset plus explicit user authorization after Light acceptance.

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0003
KNOWLEDGE_APPLIED: PAT-0003 — current-main起点でCODEX-09のdesign treeだけを選択的にmaterializeし、stale control/historyを再生しなかった。
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10
BALL: CHATGPT
STATUS: RETURNED
