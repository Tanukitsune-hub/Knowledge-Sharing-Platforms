# Work 0031 dispatch control

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-02
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
PHASE: COMPLETION_LATCH

## Final outcome

GP中心のbusiness modelを廃止し、すべての面談先・資料主体を`Counterparty_Master`へ統合した。GPは`Counterparty_Type = GP`の1値としてのみ残る。

Final merge:

```text
PR: #53
MERGE: ed47161bc6380c3289f1554d1d7419c575497f53
FINAL_SERVED_VERSION: 7
TARGET_SCHEMA: 8
BACKEND_SHEETS: EXACTLY_5
PRIMARY_MASTER: Counterparty_Master
GENERIC_ID: CP-*
R1_R10: PASS
LOGIC_VALIDATION: 520/520 PASS
BUNDLE_VALIDATION: 30/30 PASS
BLOCKER: NONE
```

## Accepted evidence / Closed Conclusions

- `GP_Master`はactive masterではなく、schema7 migration sourceに降格。
- `Counterparty_Master`が唯一の面談先master。
- GP / LP / 日本生命 / グループ会社 / Consultant / その他はCounterparty Typeで表現。
- Meeting create/editのprimary selectorは単一`面談先`。
- required `面談先区分 -> 面談先` 2-step UIなし。
- normal user-facing `関連GP`なし。
- `GP Master` / `GP Workspace` / `GPサマリー`のprimary UIなし。
- user-facing master headingは`面談先マスター`。
- 面談先サマリーがauthoritative summary surface。
- generic entity keyは`COUNTERPARTY:CP-*`。
- Material/PitchbookもCounterparty_ID中心。parent-bound materialはparent MeetingのCounterpartyを継承。
- schema7 -> schema8 migrationはGP30/30 + non-GP1/1、duplicate0、unresolved0。
- migration rerun idempotent。
- Meeting_ID / Document_ID / Drive File ID / Docsを保持。
- relation-only unlink/relink / Docs exact preservation / Date-Time contract維持。
- Meeting-only non-AI Full Outputをgeneric Counterpartyで確認。
- same single owner-only deployment / USER_DEPLOYING / MYSELF。
- provider calls0 / AI sync disabled / confidential0 / physical delete0。
- Work 0030 DEFERRED_BY_USER。

Final reports:
- `docs/handoffs/0031-CODEX-01-counterparty-master-transition-report.md`
- `docs/handoffs/0031-CODEX-02-user-facing-wording-convergence-report.md`

## R5 conclusion

accepted product architectureはrecord-centric。standalone file-only create UIは追加しない。actual parent-bound material path、deployed generic Counterparty catalog、production-source standalone classification mutation testを必要十分なevidenceとして受入。

## Residuals

BLOCKERなし。以下はfuture scopeのみ:
- multiple counterparties per Meeting
- people/contact master
- real/company rollout
- provider transition / Work0030
- historical migration beyond current schema7 synthetic qualification corpus
- Dark/System

## Completion Latch

```text
WORK_0031_COMPLETE: YES
COMPLETION_LATCH: APPLIED
ACTIVE_BLOCKER: NONE
ACTIVE_DISPATCH: NONE
BALL: NONE
STATUS: ACCEPTED
NEXT_UNUSED_DISPATCH: 0031-CODEX-03
WORK_0030: DEFERRED_BY_USER
```

新しいmaterial contradictory evidence、required-flow failure、または明示scope変更がない限りWork 0031を再開しない。

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-02
BALL: NONE
STATUS: ACCEPTED