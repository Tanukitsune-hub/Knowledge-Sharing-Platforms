# Work 0028 / CODEX-10 report — Knowledge Search and record-centric Light correction

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.14 / RECORD-CENTRIC IA AND KNOWLEDGE SEARCH / DESIGN ONLY

## Outcome

最新`origin/main`のclosed decisionsを正本として、CODEX-10のLight design correctionを完了した。Knowledge Searchの`面談先`・独立`全文出力`に加え、`記録を追加`と`過去の記録`をrecord-centric IAへ統合した。

## Changed design surface

- Knowledge Search Row 1を`面談先 / 情報ソース / 開始日 / 終了日 / 全期間`へ更新。
- `面談先`は既存Counterparty Entity / `entityKey`のsynthetic optionを表示し、GP-only semanticsにしない。
- `AIモデル`から`FULL_EXPORT`を除去し、`検索 / 全文出力 / 条件をクリア`を独立actionとして表示。
- Full Output previewはMeeting-only / AIなし、Google Docs本文と保存済みMeeting属性のみ。Pitchbook本文・Pitchbook参照リンクsectionは含めない。
- `記録を追加`から`面談 / 資料`subtabを廃止し、`記録種別 = 面談 / データ受領`の単一surfaceへ統合。
- 面談は親recordを先に登録し、stable `Meeting_ID`を発行してから任意の関連資料を開始する流れを表示。
- データ受領は受領元・分類・背景memo・必須ファイルを持つrecordとして表示し、面談-only fieldを表示しない。
- `過去の記録`を一つのrecord listへ統合し、record detail内へ関連資料・資料追加・原資料・`削除（紐付け解除）`を集約。
- standalone Pitchbook add/list/edit、独立資料一覧、資料からの逆向き一覧は作成しない。
- `Meeting_Index.Related_Pitchbook_IDs`、Document_ID、Active/Inactive、file-level retryの境界を保持。

## Provenance and branch reconciliation

- Canonical base: `origin/main` `27bdf999d4716ee321ba8ba31a134745e220fa41`
- Donor: PR #46 / CODEX-09 `400f2f0e77acf81deb32e363d79a3962dfd2f017`
- Branch: `codex/0028-codex10-record-centric-design`
- Production source reference: `9fa668619a0b91fb60ed53f696363d3954cf709e`

旧のCODEX-09 branch/PRをmergeまたはrebaseせず、review済みLight design treeを最新mainへ選択的にmaterializeした。その後、最新mainでclosedになったrecord-centric decisionsをdesign artifactへ反映した。

## LOGIC_VALIDATION

- `python docs/design/0028/selected-light-family/render-design.py`: PASS / 12 current pages generated.
- `python docs/design/0028/selected-light-family/validate-light-only-polish.py`: PASS / 12 pages, 7 destinations, Light-only and record-centric boundaries.
- `python docs/design/0028/selected-light-family/validate-user-corrections.py`: PASS / Knowledge Search, Full Output, record-centric IA, analytics fixture, protected preset, no-network boundaries.
- `node --check docs/design/0028/selected-light-family/search-demo.js`: PASS.
- `npm run check`: PASS / 456 of 456 on this fresh latest-main branch; no production source/test path changed.
- `git diff --check`: PASS after staging the intended design/handoff tree.

## TARGET_RUNTIME_QUALIFICATION

Static inert HTML was served through the local browser only.

- 1366×768 desktop `記録を追加`: `scrollWidth` 1351, no horizontal overflow, console warning/error 0.
- 1366×768 desktop `過去の記録`: `scrollWidth` 1351, no horizontal overflow, `.subtabs` count 0, console warning/error 0.
- Record creation exposes `MEETING` / `DATA_RECEIPT`, parent-first sequence, optional Meeting files, and required Data Receipt files.
- Past Records exposes one record list with Meeting/Data Receipt examples and related-file add/unlink actions.
- Same-viewport comparison loaded prior Light screenshots and current record-centric captures.

This is design/browser evidence only. It does not qualify Apps Script HTML Service, parent persistence, `Meeting_ID` issuance, file registration, unlink mutation, authentication, provider execution, or deployment.

## SIDE_EFFECT_STATE

- Production `src/**`: unchanged.
- Production `dist/**`: unchanged.
- Apps Script/runtime/deploy/provider/data/auth: unchanged and not executed.
- Theme scope remains Light-only per latest canonical main; no System/Light/Dark selector was created.
- Past Records reverse relation surface remains removed from the design; no production behavior was changed.
- No confidential data, credentials, private URLs, or organization-specific runtime IDs added.

## READY

`READY_FOR_CHATGPT_REVIEW / USER_LIGHT_ACCEPTANCE_PENDING`

No technical BLOCKER remains for this design-only dispatch. Production BUILD remains unauthorized and requires a separate Strategy Reset plus explicit user authorization after Light acceptance.

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0003
KNOWLEDGE_APPLIED: PAT-0003 — latest-main起点でreview済みLight treeを選択的にmaterializeし、stale PR control/historyを再生しなかった。
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-10
BALL: CHATGPT
STATUS: RETURNED
