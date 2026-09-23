# Work 0052 — missing source graceful failure plan

WORK_ID: 0052
STATUS: ACTIVE
MODE: BUILD
BASELINE: Work0051 version33
ACTIVE_DISPATCH: 0052-CODEX-02
BALL: CODEX

## Primary Outcome

Deleted/inaccessible Meeting Docs or Pitchbooks must not silently support a displayed search answer. Fail closed with a page-inline error and no automatic corrective action.

## Fastest Safe Decisive Action

1. preserve existing Full Output source read/metadata checks.
2. add bounded registered source-existence validation for mapped AI citations.
3. return one safe missing-source error contract.
4. reuse existing inline Knowledge Search status rendering.
5. test stale provider citation with missing Drive source.
6. confirm healthy search path unchanged.

## Routing

Route C planned.

Recommended model:
- GPT-5.6 Sol High

Reason:
provider response/citation mappingとDrive上の登録原本の存在確認を安全に追加する必要がある。

## Safety

```text
POPUP_ERROR: 0
AUTO_RECREATE_SOURCE: 0
AUTO_DEACTIVATE_RECORD: 0
AUTO_DELETE_BACKEND_ROW: 0
AUTO_DELETE_PROVIDER_INDEX: 0
BACKEND_MUTATION_ON_MISSING_SOURCE: 0
SCHEMA_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```
