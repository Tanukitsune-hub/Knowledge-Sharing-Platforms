# CODEX-03 — Knowledge Search help-line consolidation report

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Outcome

Knowledge Searchの`AI検索 指示入力欄`直下にあったmode helpとTeam/source helpを、1つのinline help container内へ統合した。default `要約` modeのexact text、他modeへのdynamic切替、既存Row3 geometry、AI/non-AI behaviorを維持したまま、同じexisting target / 同じ単一owner-only Web Appをversion18へ更新し、deterministic validationとactual browser qualificationを完了した。

```text
OUTCOME: PASS
FINAL_SOURCE_REF: 84eae0bf15b0d5b2144c94b08a33aa4c5c035574
FINAL_BUNDLE_REF: 3999920de4d1288a16d6948abf31b24304b4e4ad
FINAL_SERVED_VERSION: 18
READY_FOR_CHATGPT_FINAL_REVIEW: YES
BLOCKER: NONE
```

## Implemented scope

- `#knowledge-mode-help`と`#knowledge-source-help`を、textarea直下の単一`#knowledge-help-line`内にinline spanとして配置した。
- 2文の間は通常の空白1文字だけとし、explicit line breakやblock-level second rowを除去した。
- source sentence `Teamは「面談記録のみ」で利用できます。`はexact textで1回だけ保持した。
- `kApplyMode()`が更新する`#knowledge-mode-help`のidentityは変更せず、default `要約`と`自由質問`のdynamic textをproduction source testで検証した。
- Knowledge Search Row3、Meeting-create CODEX-01/02、backend、provider、securityには変更を加えていない。

## Reproduction and logic validation

production sourceへ期待値を先行適用し、修正前の別container構造をfocused testで再現した。

```text
PRE_FIX_FOCUSED_TESTS: 11/12 PASS / 1 FAIL
FAILURE: MODE_HELP_AND_SOURCE_HELP_NOT_IN_ONE_INLINE_CONTAINER
```

修正後:

```text
FOCUSED_TESTS: 12/12 PASS
LOCAL_PRODUCTION_BROWSER_HARNESS: PASS / SYNTHETIC_RENDER_ONLY
NPM_RUN_CHECK: 574/574 PASS
CANONICAL_BUNDLE_REGENERATION: PASS
NPM_RUN_CHECK_BUNDLE: 30/30 PASS
GIT_DIFF_CHECK: PASS
```

local production browser harnessでは2560 / 1440 / 1280でhelp height 18px / line-height 18pxの1行、390でheight 36pxの自然wrap、全viewportでexact text、explicit break 0、horizontal overflow 0を確認した。これはtarget-runtime evidenceではなく、次節のactual Web App qualificationと分離している。

## Target runtime preflight and release

mutation前のread-only preflight:

```text
SAME_EXISTING_TARGET: PASS
SAME_SINGLE_DEPLOYMENT: PASS
BASELINE_VERSION: 17
BASELINE_SAVED_SOURCE_PARITY: PASS
BASELINE_IMMUTABLE_SOURCE_PARITY: PASS
DEPLOYMENT_TYPE: WEB_APP
EXECUTE_AS: USER_DEPLOYING
ACCESS: MYSELF
```

bounded releaseと最終readback:

```text
SOURCE_SYNCS: 1
IMMUTABLE_VERSION_CREATES: 1
SAME_DEPLOYMENT_UPDATES: 1
FINAL_SERVED_VERSION: 18
FINAL_SAVED_SOURCE_PARITY: PASS
FINAL_IMMUTABLE_SOURCE_PARITY: PASS
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
```

deployment update直後のreadbackは`DEPLOYMENT_UPDATE_PENDING`だった。updateは再送せず、read-only metadata照合でversion18への収束を確認し、その後final parityをPASSとした。private URL、deployment ID、Script ID、account等はGitHubへ記録していない。

## Actual browser qualification

deploying ownerとしてsame owner-only versioned Web App version18を通常browser UIでreloadし、default `要約` modeを確認した。

```text
EXACT_VISIBLE_TEXT: PASS
TEAM_SOURCE_SENTENCE_COUNT: 1
EXPLICIT_BREAKS: 0
VIEWPORT_2560: 18px / LINE_HEIGHT_18px / ONE_VISUAL_LINE / OVERFLOW_0
VIEWPORT_1440: 18px / LINE_HEIGHT_18px / ONE_VISUAL_LINE / OVERFLOW_0
VIEWPORT_1280: 18px / LINE_HEIGHT_18px / ONE_VISUAL_LINE / OVERFLOW_0
VIEWPORT_390: 36px / LINE_HEIGHT_18px / NATURAL_WRAP / OVERFLOW_0
NORMAL_NAVIGATION: 7/7 NONBLANK
CONSOLE_MATERIAL_ERROR_WARN: 0
```

desktopではmode spanとsource spanのtop座標が一致し、390pxのみ自然wrapした。font sizeの縮小やhorizontal scrollは発生していない。検証後はviewport overrideを解除し、Knowledge Searchへ戻した。

## Side-effect state

```text
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
RECORD_MUTATION: 0
FILE_MUTATION: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
SECURITY_MODEL_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
PR_MERGE: NOT PERFORMED
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: NO

## Return state

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: SAFE
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
WORK_0038_COMPLETE: NO / CHATGPT FINAL REVIEW PENDING
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
