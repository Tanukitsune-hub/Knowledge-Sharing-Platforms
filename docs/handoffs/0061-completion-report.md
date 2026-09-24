# Work 0061 completion report

WORK_ID: 0061
DISPATCH_ID: 0061-CODEX-01
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Primary Outcome

Knowledge SearchとEntity Workspaceで、現在の入力・選択対象と表示resultのidentityを一致させ、古いrequest / responseをcurrent resultとして見せないようにした。

## Accepted Behavior

### Knowledge Search

- query fingerprintに`questionOrInstruction`を含める。
- fingerprintはhash化し、sessionStorageへ質問本文そのものを保存しない。
- question / mode / filter / entity / model / thinking等のquery-defining input変更時、旧resultとpending stateをcurrentから外す。
- start response / poll responseはrequest sequenceとcurrent payload fingerprintの双方が一致する場合だけ描画する。
- pending query resumeは保存fingerprintとcurrent payload identityが一致する場合だけ継続する。
- unchanged current queryは従来どおり表示する。

### Entity Workspace

- Entity A表示後にBを選択した時点でA content / printをcurrent viewから外す。
- loading / error statusへ現在対象を表示する。
- request sequenceとselected entity keyを照合し、古いresponseの上書きを防ぐ。
- Fund / Strategy切替では旧drillを消し、選択中fundとresponseの一致を確認する。

## Accepted Evidence

```text
IMPLEMENTATION_PR: #93
FOCUSED_TESTS: 20/20 PASS
BROWSER_KNOWLEDGE_ENTITY_1440_390: PASS_SYNTHETIC
HORIZONTAL_OVERFLOW: 0
BROWSER_CONSOLE_MATERIAL_ERROR_WARN: 0
NPM_RUN_CHECK: 681/681 PASS
BUNDLE_VALIDATION: 30/30 PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: NOT_RUN_TIER_2
PROVIDER_CALLS: 0
DEPLOYMENT_UPDATE: 0
BUSINESS_DATA_MUTATION: 0
BLOCKER: NONE
```

## Review Conclusion

変更はclient-side request identity / stale-result presentationへ限定され、provider server logic、prompt、retrieval、billing、schema、API、navigation IAを変更していない。TIER_2_STANDARDの必要十分な証拠を満たした。

Target-runtime反映・確認はroadmapどおりWork0065へ集約する。

## Completion

```text
WORK_0061_COMPLETE: YES
COMPLETION_LATCH: APPLIED
ACTIVE_DISPATCH: NONE
BALL: NONE
STATUS: ACCEPTED
```
