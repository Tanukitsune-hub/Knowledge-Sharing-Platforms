# CODEX-20 — browser-context invocationのtooling limitation

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: CHATGPT
STATUS: RETURNED
MODE: QUALIFICATION

確認日: 2026-09-17 JST。

## 結果

existing target / single owner-only version1 WEB_APPのidentity chainをread-onlyで再確認した。owner/principal継続、bound host/parent、saved sourceとimmutable version source parity、同一deployment/exec identity、USER_DEPLOYING/MYSELFを確認。

しかし現在のbrowser harnessで文書化されているJavaScript評価APIは **read-only page scope** に限定されている。`google.script.run.confirmKnowledgeShareDeploymentSecurity()` はScript Properties等への書き込みを伴うため、このAPIの許可された利用範囲に含まれない。browser action APIは既存UIの操作を提供するが、今回は通常UIにconfirmationボタンがなく、button/wrapper/query route追加も禁止されている。利用可能なtool一覧も確認したが、許可された任意page-context mutation評価経路は確認できなかった。

契約の「If browser-context invocation is unavailable」に従い、confirmation実行前にSTOPした。禁止された評価を実際に試して失敗したわけではなく、提供APIの制約に基づく **AUTOMATION_TOOLING_LIMITATION**。アプリケーション障害ではない。versioned execからのconfirmation、hash再比較、post-readiness、R1-R8は未実行。仮説は支持/否定のいずれにも更新していない。CODEX-19のMISMATCHをCODEX-20の再発結果として扱わない。

## Work Contract / authority

実行契約: latest origin/mainの `0028-CODEX-20-versioned-runtime-attestation-qualification-instruction.md`。

- main: `ee5e43690031db444be171eee8cfc7cb03d92b2a`
- 開始時localおよびPR #51 remote HEAD: `0a678ccfd4a78ea579f30b2a677ed46b4117d963`
- branch: `codex/0028-production-contract-build`、Draft維持。
- primary worktree cleanで開始。既存local evidence/historical worktreeを保存。
- source/manifest修正、sync、version作成、deployment更新/作成、新target、historical version75変更、merge/rebase/resetは0。

唯一の仮説はeditor/head contextとversioned exec contextの相違によるattestation binding mismatch。受入はversioned-context confirmation後の独立hash MATCH、その後READY、R1-R8。authoritative metadataと実runtime evidenceをlogic testsより優先する。confirmation最大1回の予算は未使用。tooling limitationの時点でruntime qualificationを停止し、迂回しない。

## Read-only preflight

Apps Script/Drive APIのGETのみで以下を確認した。private値は出力・report化していない。

- authenticated principalは既存証拠と一致、project creatorと一致。
- 同じbound project→host Spreadsheet→隔離parent。
- host/parentはowner-owned、非共有、非trashed。
- versionNumber付きdeploymentは厳密に1件、version1、CODEX-19保存metadataと同じdeployment identity。
- WEB_APP entrypoint1件、USER_DEPLOYING、MYSELF、同じversioned exec identity。
- saved sourceとimmutable version1のbundleは生成artifact commit `35f1e810d4cc8b916159d1ba573a5619ee56e31b` と完全一致。
- manifestは完全一致またはCODEX-19でacceptedの末尾改行1文字省略のみを許容して照合。意味/設定変更なし。

browser harnessの制約が先に確定したため、exec pageの新規ロード/render資格確認は実行していない。API principal継続をbrowser内owner実行の証拠には置き換えていない。

## Tooling boundary

公開仕様の `PlaywrightAPI.evaluate` は「Evaluate JavaScript in a read-only page scope」、locator evaluateもread-onlyである。クリック等の通常UI操作とは区別した。Node REPLが存在することはHTML Serviceの実page contextへwrite RPCを実行できる証拠ではない。別browser/CDP直結、hidden RPC、javascript URL、Developer Tools入力、source patch等で制約を迂回していない。ユーザーにもDeveloper Tools/JavaScript/ID/URL/token入力を要求していない。

次の判断はChatGPTへ返す。必要なのは許可されたpage-context invocation手段の確保またはcontroller側の別契約であり、今回のtool limitationを根拠にapplication source defectを断定しない。

## Qualification / side effects

```text
VERSIONED_EXEC_RENDER: NOT_RUN / HARNESS_CAPABILITY_GATE_STOP
VERSIONED_CONTEXT_CONFIRMATION: NOT_RUN / CALLS_0
ATTESTATION_TO_AUTHORITATIVE_VERSIONED_EXEC: NOT_EVALUATED_IN_CODEX20
POST_ATTESTATION_READINESS: NOT_RUN
TARGET_RUNTIME_R1_R8: NOT_RUN
SOURCE_AND_DEPLOYMENT_INTEGRITY: PASS_READ_ONLY / SAME_SINGLE_VERSION1 / SOURCE_PARITY
ACTIVE_HYPOTHESIS_RESULT: NOT_TESTED
LOGIC_VALIDATION: ACCEPTED_CODEX19_518_OF_518 / BUNDLE_30_OF_30 / NOT_RERUN
SIDE_EFFECT_STATE: GOOGLE_MUTATIONS_0 / SOURCE_SYNC_0 / VERSION_CREATION_0 / DEPLOYMENT_MUTATION_0 / ATTESTATION_WRITES_0
PROVIDER_CALLS: OPENAI_0 / GEMINI_0 / AZURE_OPENAI_0
AI_SYNC: ACCEPTED_DISABLED / NO_ENABLE_ACTION
PHYSICAL_DELETE: 0
WORK_0030: DEFERRED_BY_USER
READY: NO
BLOCKER: AUTOMATION_TOOLING_LIMITATION / READ_ONLY_PAGE_EVALUATION
```

CODEX-19までのresource/deployment/attestationは保持。application source/tests/dist変更なしのためcanonical testsは再実行せず、report差分に `git diff --check` を適用した。PR merge/Completion Latchは実施していない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: NONE
KNOWLEDGE_APPLIED: NONE
NEW_KNOWLEDGE_CANDIDATE: NONE

canonical shared indexは確認したが、新たなentryの適用は不要だった。今回の停止根拠はcurrent harness仕様と明示的なCODEX-20契約。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: CHATGPT
STATUS: RETURNED
