# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
ACTIVE_DISPATCH_ID: NONE
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
PHASE: COMPLETION_LATCH

## Final outcome

PR #50のLight designとPR #51のproduction implementation/runtime qualificationを統合し、Work 0028をend-to-endで受入完了した。

Final merge:

```text
PR: #51
MERGE: 89a2e94c9fc845157744c011333e16d9a32ffd34
FINAL_SERVED_VERSION: 4
R1_R8: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
LOGIC_VALIDATION: 524/524 PASS
BUNDLE_VALIDATION: 30/30 PASS
BLOCKER: NONE
```

## Accepted evidence / Closed Conclusions

反証がない限り以下を再び開かない。

- Light-only single-record UI direction。
- parent-first Meeting before file registration。
- GP / non-GP parent flow。
- stable Meeting_ID / Document_ID、partial-failure recovery。
- follow-up file add to existing Meeting。
- visible delete = unlink only、physical delete 0。
- unlink/relinkでsame Document_ID / File_ID保持。
- relation-only mutation前後でMeeting Docs body/tab content exact equality。
- original Date/Time cells and unrelated business fields preserved。
- Business Date/Time readbackはfinal version4でinput/authoritative valueとsearch/detail表示が一致。
- dedicated Meeting-only non-AI Full Output。
- Backend exactly 5 sheets / schema7。
- installer idempotency / duplicate0。
- single restricted WEB_APP / USER_DEPLOYING / MYSELF。
- versioned deployment-security confirmation READY/NONE + authoritative attestation MATCH。
- AI sync disabled / provider calls0 / trigger0。
- confidential data0 / physical delete0。
- historical version75 strategy SUPERSEDED。
- Work 0030 DEFERRED_BY_USER。

Final runtime report:
`docs/handoffs/0028-CODEX-23-temporal-recovery-autonomous-completion-report.md`

## Temporal repair conclusion

Google SheetsのBusiness Date/Timeは「瞬間」ではなく壁時計値として扱う。実Apps Script観測ではnative `Date` とtimezone getterの組合せだけではセル表示値を安全に復元できなかったため、final adapterはDate/Time列に限ってsupported `getDisplayValues()` を厳格にcanonical化する。

- Date: `yyyy-mm-dd`
- Time: `h:mm` / `HH:mm`
- locale依存の曖昧形式、AM/PM、不正日付はfail-closed。
- Instant列やその他列はraw型を保持。
- 元セルやSpreadsheet timezoneを書き換えない。

API間timezone getter差の内部要因は未確定だが、required user outcomeとdata integrityを変えないためFOLLOW_UPでありBLOCKERではない。

## Residual / Follow-up

- mobile / other-browserの見た目は今回のcompletion gate外。desktop actual runtimeはPASS。
- arbitrary locale Date/Time display supportは未実装。supported format外はfail-closed。
- real/confidential data rollout、provider migration、historical migration、Dark/Systemは別Work。

## User hands-on verification

次は開発を停止し、同じowner-only version4でユーザー実機確認へ移る。

1. 「過去の記録」でsynthetic2件の日付2026-09-17、時刻10:30 / 11:15を確認。
2. non-GP詳細で元本文と関連資料2件を確認。編集・削除は不要。
3. 「ナレッジ検索」でsynthetic面談先 / 面談記録のみ / 全期間を選び「全文出力」。質問・AIモデル不要で本文を確認。

実データ投入、AI sync有効化、provider設定/呼出しは行わない。

## Completion Latch

```text
WORK_0028_COMPLETE: YES
COMPLETION_LATCH: APPLIED
ACTIVE_BLOCKER: NONE
ACTIVE_DISPATCH: NONE
BALL: NONE
STATUS: ACCEPTED
NEXT_UNUSED_DISPATCH: 0028-CODEX-24
WORK_0030: DEFERRED_BY_USER
```

新しい反証、ユーザー実機でのrequired-flow failure、または明示的なscope変更がない限りWork 0028を再開しない。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
BALL: NONE
STATUS: ACCEPTED
