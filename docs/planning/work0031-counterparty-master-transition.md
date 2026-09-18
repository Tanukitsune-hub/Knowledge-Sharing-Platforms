# Work 0031 — Counterparty Master transition

WORK_ID: 0031
STATUS: PLANNED
MODE: BUILD

## Primary Outcome

会社PC移行前に、Knowledge Sharing Platformsのbusiness entity modelからGP専用概念を除去し、すべての面談先・資料主体を1つのCounterparty Masterへ統合する。GPはCounterparty Typeの1値としてのみ残す。

## Why now

Work 0028 version5のUIはnon-GP meetingを受け入れるが、backend/master/search contractsには依然として GP_Master, GP_ID, Related_GP_IDs, GP-specific catalog/filter/summaryが残っている。現在のproduct conceptとdata modelを一致させるため、会社PC rollout前に移行する。

Decision: `docs/decisions/counterparty-master-unification.md`

## Acceptance Evidence

### Data model
- Backend exactly5 sheetsを維持。
- GP_MasterはCounterparty_Masterへ置換。
- generic Counterparty_ID = CP-*。
- Counterparty Typeはmaster attribute。
- schema7 -> schema8 migration idempotent / duplicate0。
- existing Meeting_ID / Document_ID / File ID保持。

### Meeting
- create/editのprimary selectorは単一「面談先」。
- required 2-step 面談先区分 -> 面談先を廃止。
- user-facing 関連GPなし。
- new Meeting rowはgeneric Counterparty_IDをauthoritative referenceとして保存。
- GP/non-GP双方を同一flowで登録/readback。

### Materials
- standalone/parent-bound material classificationもCounterparty_ID中心。
- GP-only naming/filter assumptionsなし。
- parent-bound materialはparent Meeting counterparty contextを継承。

### Search / export / analytics
- normal user filters/entitiesはCounterparty中心。
- GP-specific primary filter / Related GP filterなし。
- Meeting-only Full OutputにRelated GP business lineを出さない。
- GPサマリーは面談先サマリーへ統合。
- GP/non-GPを同一Counterparty dimensionで検索/集計。

### Master/admin
- Master UIは「面談先マスター」。
- name + typeで追加。
- existing GP seedsとnon-GP optionsがmigration後に同じmasterに存在。
- quick addも同masterを使用。

### Runtime / safety
- actual owner-only Web AppでGP type / non-GP typeを各1件synthetic登録・検索・資料関連付け。
- accepted date/time and relation semantics regression PASS。
- provider calls0。
- AI sync disabled。
- confidential data0。
- physical delete0。
- BLOCKER NONE。

## Fastest Safe Decisive Action

実装開始時にsource-wide GP dependency inventoryを作り、business-model dependency / legacy migration compatibility / runtime-inactive history / naming-onlyに分類する。その後schema8 vertical sliceをexisting isolated targetでmigrationしてend-to-endに実装する。

## Required Scope

- core schema/constants
- installer/setup migration
- master maintenance
- Meeting create/edit/search/detail
- Pitchbook/material prepare/upload/index
- parent relation metadata
- knowledge search/filter/export metadata
- entity summary/analytics
- bundle/install docs/tests
- actual target migration + runtime qualification

## Non-Goals

- multiple counterparties per Meeting
- contacts/person master
- broad rollout
- real/confidential data
- Azure/provider migration
- Dark/System theme

## Closed Conclusions

Work 0028 version5 behavior remains accepted baseline. Reopen only components directly affected by Counterparty migration. Date/time readback, file unlink/relink, parent-first flow, non-AI Full Output, deployment security remain closed unless contradictory runtime evidence appears.

## Completion Latch

Done when schema8 Counterparty-centered model is end-to-end operational, legacy schema7 migration is safe/idempotent, GP-specific normal product concepts are gone, actual runtime matrix passes, and BLOCKER NONE.