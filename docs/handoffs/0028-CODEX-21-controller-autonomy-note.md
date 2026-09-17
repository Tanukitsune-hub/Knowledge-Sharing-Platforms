# Work 0028 — CODEX-21後のcontroller autonomy note

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-21
BALL: CODEX
STATUS: READY

CODEX-21のactive execution contractは途中変更しない。

ユーザー判断 2026-09-17:
局所failureごとにChatGPTへ返すmicro-dispatch運用は、現在のisolated target / owner-only deployment / provider-off boundaryでは遅延が大きいため終了する。

CODEX-21がWork 0028を完了できずRETURNEDした場合、次Dispatchは `docs/handoffs/0028-autonomous-completion-strategy-reset.md` を正として、Outcome-based autonomous completionへ移行する。

次Dispatchでは、Codexが同一PR・同一target・固定boundary内で最大3 repair/qualification cyclesを自己判断で実行し、通常のapplication defect、test failure、runtime mismatchでは途中RETURNしない。

STOPはUSER native action、高リスク/権限拡大、real/confidential data、destructive action、new target/second parallel deploymentの必要、accepted architecture変更、同一failure class連続2回、3 cycles消費、evidence contamination、provider/Work0030必要時に限定する。

GoalはWork 0028 completion gate到達。ChatGPTはOutcome/boundary/final reviewを所有し、局所手順はCodexへ委譲する。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-21
BALL: CODEX
STATUS: READY
