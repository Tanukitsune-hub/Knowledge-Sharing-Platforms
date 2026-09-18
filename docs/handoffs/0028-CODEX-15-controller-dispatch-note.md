# CODEX-15 dispatch note

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-15
BALL: CODEX
STATUS: READY

CODEX-14の`INSTALLER_BOUND_SPREADSHEET_REQUIRED`は、fresh company install用container-bound installerをhistorical standalone targetへ使ったことによるexpected preconditionと判定した。

次はinstallerを変更せず、既存standalone projectのprivate editor entrypointsを使う。

```text
getInstallationStatus_()
validateInstallation_()
setupKnowledgePlatform_() only if safe append-only migration is required
validateInstallation_()
```

その後、immutable version 1件作成 -> positive proof済みexisting WEB_APP 1回更新 -> verified `/exec`でprovider-independent R1–R8を実行する。

sourceはCODEX-14で既に1回push済み、remote parity 83/83 PASSのため再pushしない。Direct OpenAI / Gemini / Azure OpenAI callsは0。Azure provider runtimeはWork 0030へDEFERする。

Authoritative instruction:
`docs/handoffs/0028-CODEX-15-standalone-runtime-qualification-instruction.md`
