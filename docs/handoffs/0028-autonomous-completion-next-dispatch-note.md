# Work 0028 — next dispatch autonomy note

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: ACCEPTED

CODEX-21は現在進行中のため契約変更しない。

CODEX-21がWork 0028 completion gate未達でRETURNEDした場合、次Dispatchは `docs/handoffs/0028-autonomous-completion-strategy-reset.md` を実行原則とする。

局所failureごとのSTOP/RETURNを既定にしない。Codexが同一PR・同一isolated target・固定security/provider boundary内で最大3 repair/qualification cyclesを自律実行し、Goal達成まで診断・修正・検証を継続する。

ChatGPTへ途中RETURNする条件は、USER native action、権限/公開範囲拡大、real/confidential data、destructive action、new target/second parallel deployment、accepted architecture変更、same failure class 2回連続、3 cycles消費、evidence contamination、provider/Work0030必要時に限定する。

WORK_ID: 0028
DISPATCH_ID: N/A
BALL: CHATGPT
STATUS: ACCEPTED
