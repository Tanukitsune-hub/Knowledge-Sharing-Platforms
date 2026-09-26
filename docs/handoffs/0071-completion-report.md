# Work 0071 completion report

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-04
BALL: NONE
STATUS: ACCEPTED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Primary Outcome

Alternative Assets Intelligenceの主要非同期UXを、保存・upload・検索・集計等の状態変化があっても「押す場所・読む場所・focus位置を探し直さなくてよい」interaction modelへ収束させた。

Google Web UX KBは一律適用せず、Work0071で選択したCLS / form / focus / responsive / QAルールを、実アプリの症状とDecision-Impactに合わせて採用した。

## Integrated Releases

### Phase A

```text
PR: #104
MERGE: e9c759c569660331a1eb447cd44787ab1051c427
RELEASE: 0.2.1
SCHEMA: 9
```

主要成果:

- Add 4 sourceのprimary action / status geometryを安定化。
- standalone資料保存のstale no-file errorを修正。
- shared file queueへ状態非依存の朱色file identity markerを追加。
- original filenameをprimary identityとして維持。
- Add News / Assessmentのfield-level validation、first-invalid focus、aria-invalid / aria-describedbyを追加。
- Work0049 busy feedbackとWork0070 retry / unknown-outcome / concurrency contractを維持。

### Phase B

```text
PR: #105
MERGE: e72d299af7ebf361efce491679d35b7a754d683e
RELEASE: 0.2.2
SCHEMA: 9
```

主要成果:

- Activity Analytics admin-checkの成功・error reload・record missingでfocus continuityを維持。
- Master reorderの既存arrow focus挙動を保持し、reset/save後のfocus lossを修正。
- Past News / Assessment editのrequired validationをfield-level actionable errorへ改善。
- Past Meeting / Pitchbook lifecycleのlist rerender後にsame / nearest / stable fallbackへfocus復元。
- Knowledge Search / Full Output / Entity Workspace / 管理者ページ / modalはPhase B auditでmaterial issueを立証しなかったため、変更していない。

## Accepted Evidence

### Phase A

- before geometry measurement。
- 1440 / 390 runtime geometryでprimary action/status movement <= 1 CSS px。
- local production-HTML browserで320px、200% zoom、reduced-motion PASS。
- Meeting / News / Assessment representative actual Web App save evidence。
- native upload pathはWork0070 / CODEX-01 accepted evidenceを再利用。
- exact valid-file transition on 0.2.1 candidateはbrowser harness制約で直接未観測のまま保存:
  `NOT_OBSERVED_AUTOMATION_LIMITATION`。
- `npm run check` 717/717 PASS。
- `git diff --check` PASS。

### Phase B

Current mainで4 findingをproduction HTML/client browserで再現後、`REPRODUCED_MATERIAL`のみ修正。

- changed browser surfaces 1440 / 390 / 320 PASS。
- keyboard focus readback PASS。
- invalid edit RPC 0。
- detached-node focus 0。
- row disappearance時のsame/nearest/fallback focus PASS。
- root horizontal overflow 0。
- existing Work0039 / Work0068 / Phase A browser regressions PASS。
- `python tools/validate_agent_foundation.py` PASS。
- `npm run check` 717/717 PASS。
- bundle validator 67 server / 24 HTML PASS。
- company 7-file package parity PASS。
- `git diff --check` PASS。

## Target Runtime / Strategy Reset

CODEX-04は既存isolated Apps Script targetのcurrent project / host / deployment identityを独立確認できなかったため、安全側に停止し、Apps Script sync / version / deployment updateを0回とした。

ChatGPT final reviewでexact diffを再評価した結果、Phase Bの変更はbrowser/client-side DOM focus / validationに限定され、以下は変更されていないことを確認した。

- server API
- schema / migration
- permission / access
- lifecycle semantics
- provider
- persistence contract

したがって、Phase BについてApps Script hostへ0.2.2を再deployすることは、changed behaviorのacceptance判断を実質的に変えるunique evidenceではないとDecision-Impact Gateで判断した。

Final classification:

```text
TARGET_BROWSER_CHANGED_SURFACE: PASS
APPS_SCRIPT_EXACT_0_2_2_DEPLOYMENT: NOT RUN
TARGET_IDENTITY_UNCONFIRMED: NON_BLOCKING_ENVIRONMENT_LIMITATION
USER_NATIVE_ACTION_REQUIRED: NO
```

これは0.2.2をisolated Apps Script targetへdeploy済みと主張するものではない。Work0071のPrimary Outcomeはsource/browser interaction qualityであり、company production rolloutは別scope。

## Release / Distribution Integrity

Final release:

```text
RELEASE: 0.2.2
SCHEMA: 9
SOURCE_FREEZE: 55bac220d4ea25d2c9f965fd0e8d504f0a0128f6
BUNDLE_FILE_SHA256: 02758480684b5e985182270fc73705b75b29592bef990ebfb4821beee79cc406
BUNDLE_PAYLOAD_SHA256: 082d25b097ad1bbc9a6071040e58d2cfc4fac9abcf649630a8d810a92b309415
```

Company 7-file packageのindependent BASIS pinを維持し、release manifestを任意値として信用する方式へは変更していない。

## User-Presence-Independent Development

Work0071の途中で、development / qualificationをPC前のuser presence前提にしない方針を恒久化した。

```text
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO
USER_NATIVE_ACTION_BUDGET: 0
```

OS picker等をCodex harnessが操作できないだけの場合は`AUTOMATION_LIMITATION`として扱い、application defectや本人操作要求へ自動昇格しない。詳細は`docs/decisions/target-runtime-first-development.md`を正本とする。

## Side-Effect Boundary

```text
COMPANY_DATA_MUTATION_COUNT: 0
PROVIDER_CALL_COUNT: 0
INDEXING_CALL_COUNT: 0
PERMISSION_BROADENING: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PHYSICAL_DELETE_COUNT: 0
USER_NATIVE_ACTION_COUNT: 0 in final Phase B
```

Phase Aで使用したisolated owner-only target evidenceは履歴として保持する。Work0071によるcompany production rolloutは行っていない。

## Residuals

FOLLOW_UP:

- company productionへの0.2.2 rollout / migrationは別の明示認可が必要。
- Phase Bでmaterial issueを立証しなかったKnowledge Search / Full Output / Entity Workspace / 管理者ページ / modalは、具体的な将来症状が出た場合だけ再評価する。
- Phase A valid-file exact-candidate stateは`NOT_OBSERVED_AUTOMATION_LIMITATION`のまま履歴保持し、picker/upload transportにmaterial changeがない限り再要求しない。

BLOCKER: NONE。

## Completion

```text
PHASE_A: ACCEPTED
PHASE_B: ACCEPTED
LOGIC_VALIDATION: PASS
TARGET_BROWSER_CHANGED_SURFACE: PASS
APPS_SCRIPT_EXACT_0_2_2_DEPLOYMENT: NOT RUN
SIDE_EFFECT_STATE: TEST_ONLY / NONE
READY: YES
BLOCKER: NONE
PR_PHASE_A: #104
PR_PHASE_B: #105
FINAL_MERGE: e72d299af7ebf361efce491679d35b7a754d683e
RELEASE: 0.2.2
SCHEMA: 9
COMPLETION_LATCH: APPLIED
```

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-04
BALL: NONE
STATUS: ACCEPTED
