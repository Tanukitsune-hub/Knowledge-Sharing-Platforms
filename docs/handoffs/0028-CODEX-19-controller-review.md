# CODEX-19 controller review — attestation binding context

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: CHATGPT
STATUS: REVIEW
MODE: QUALIFICATION

## Review conclusion

CODEX-19の停止判断をacceptedとする。

確定したaccepted evidence:

- installer stage repair: PASS
- installer rerun / I2: `READY_FOR_DEPLOYMENT` / duplicate0
- Backend: exactly 5 sheets / schema7
- AI sync: FALSE / trigger0
- owner-only versioned WEB_APP: exactly 1 / version1 / `USER_DEPLOYING` / `MYSELF`
- authoritative deployment metadata: WEB_APP + versioned `/exec` confirmed
- pre-attestation readiness: expected `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`
- deterministic validation: 518/518 PASS
- bundle validation: 30/30 PASS
- provider calls: 0

CODEX-19で保存されたattestation hashとauthoritative versioned `/exec` identity hashがMISMATCHだったため、post-readinessとR1-R8へ進まなかった判断は正しい。

## Controller diagnosis

Current production confirmation pathは `ScriptApp.getService().getUrl()` からdeployment identityを取得する。

Google Apps Script公式仕様では、`Service.getUrl()` はweb app URLを返すが、development mode web app実行時はdevelopment mode URLを返す。またHEAD deploymentとversioned deploymentは別物で、web app test URL `/dev` はdevelopment/test用surfaceである。

CODEX-19のconfirmationはnative editorから実行された。一方、独立比較対象はauthoritative versioned `/exec` identityだった。したがって、MISMATCHはまず「confirmationをversioned web app runtime contextではなくeditor/head contextで実行したため、context-sensitive service URLが別identityを返した」可能性を最優先で切り分けるべきである。

これはsource defectの確定ではない。CODEX-19ではprivate hash比較によりbinding failureだけを直接確認しており、保存hashがどのURL種別に由来したかはprivate値を取得・報告していない。

## Next decisive action

新しいsource repairやsecond deploymentを作る前に、existing owner-only version1 `/exec` をそのまま使用し、同じ guarded `confirmKnowledgeShareDeploymentSecurity()` をversioned web app browser runtime contextから1回だけ呼ぶ。

具体的には、owner-only `/exec` を開いたbrowser execution contextで `google.script.run` を用いてguarded confirmationを1回だけ実行する。通常UIへbuttonを追加せず、source/manifest/deploymentを変更しない。

その後、保存attestation hashとauthoritative versioned `/exec` identity hashをprivateに再照合する。

- MATCHなら、active hypothesis supported。`checkKnowledgeShareReadiness()` を同じversioned `/exec` contextで確認し、READYならR1-R8へ進む。
- MISMATCHなら、`ScriptApp.getService().getUrl()` によるversioned identity binding自体が不十分と判断しSTOPする。source修正は別Dispatchで設計する。
- browser harnessからguarded server functionをversioned runtime contextで安全に呼べない場合もSTOPし、tool limitationとして返す。ユーザーへdeveloper console操作を要求しない。

## Active hypothesis

```text
editor/head-context confirmation
-> context-sensitive ScriptApp.getService().getUrl() returns non-versioned identity
-> attestation hash mismatches authoritative versioned /exec

versioned /exec-context confirmation
-> getUrl() binds to actual versioned web app identity
-> attestation hash MATCH
```

## Safety boundary

CODEX-20ではsource変更0、source sync0、新version0、新deployment0、deployment update0、新target0とする。

許可するmutationは既存version1 owner-only Web App contextからのsecurity confirmation 1回と、その後のR1-R8 synthetic business-flow mutationのみ。provider calls 0、AI sync disabled、real/confidential data 0、physical delete 0を維持する。

Work 0030はDEFERRED_BY_USERのまま。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: CHATGPT
STATUS: REVIEW
