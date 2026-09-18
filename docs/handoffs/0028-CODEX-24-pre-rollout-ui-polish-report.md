# CODEX-24 — Pre-rollout UI polish / actual runtime PASS

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-24
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## 結果

ユーザー実機確認で見つかった5つのUI/interaction課題を、latest `origin/main` から作成した新branchでまとめて修正した。既存のisolated targetとsingle owner-only Web Appだけを使用し、cycle 1でimmutable version5へ同一deploymentを更新した。通常UIからsynthetic Meetingを1件登録し、Past Meetingsの一覧・詳細で保存値をreadbackした。

```text
UI_POLISH_5: PASS
TARGET_RUNTIME_QUALIFICATION: PASS / VERSION5
LOGIC_VALIDATION: PASS / 529_OF_529
BUNDLE_VALIDATION: PASS / 30_OF_30
DIFF_HYGIENE: PASS
CYCLES_USED: 1_OF_3
PROVIDER_CALLS: DIRECT_OPENAI_0 / GEMINI_0 / AZURE_OPENAI_0
AI_SYNC: DISABLED
REAL_CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
BROAD_ROLLOUT: 0
NEW_TARGET: 0
SECOND_PARALLEL_DEPLOYMENT: 0
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
WORK_0030: DEFERRED_BY_USER / NOT_STARTED
```

Draft PR: #52（merge未実行）

## Work Contract / 正本

- authoritative instruction: latest `origin/main` の `docs/handoffs/0028-CODEX-24-pre-rollout-ui-polish-instruction.md`
- base: `origin/main` `70dabbeb92040f6d63b2b8818745488fbcc8364f`
- branch: `codex/0028-pre-rollout-ui-polish`
- accepted baseline: CODEX-23のR1-R8 PASS、同一target / owner-only single deployment、provider0、AI sync disabled
- evidence hierarchy: actual owner-only Chrome UI > authoritative deployment/source readback > deterministic bundle/logic tests
- runtime budget: 最大3 cycles。実績はsource sync 1、immutable version 1、same deployment update 1
- non-goals: schema変更、実データ、provider設定/呼出し、AI sync、物理削除、Work 0030、main/PR merge

## 修正前のactual runtime観測

accepted version4の「記録を追加」を通常navigationで開いた。前回保存済みparentがbrowser local stateから安全に復元され、Date/Time・面談場所・面談先区分・面談先・Asset Class等がすべてdisabledになっていた。これはoverlay、pointer capture、option bootstrap失敗、console例外ではなく、保存済みparentへの添付継続を守るfail-closed状態だった。

一方で、新規入力へ戻す操作は長いフォームの最下部にしかなく、navigationでもページ先頭へ戻らなかった。この組み合わせにより、先頭で見えるフォームが「何も選択できない」状態になっていた。修正前のwide viewportでは短いDate/Time/selectも長い列幅まで伸長していた。Past Meetingsはuser-facingの関連GP filter、`GP` heading、行内の関連GP補足を表示していた。

このbefore evidenceはprivate URL・account・deployment identityを保存せず、actual browser runで観測した。

## 実装

### A. Native calendar

- `src/ClientDateControls.html` を追加し、全user-facing `type=date`へ共通の安全なnative picker bindingを適用した。
- focus/click時に、対応browserでのみ `showPicker()` を呼ぶ。二重bindingを防ぎ、例外時は通常browser fallbackを維持する。
- create/edit/rangeの値形式は既存 `YYYY-MM-DD` contractのまま。

### B. From/To default period

- Knowledge Searchの既存ロジックをshared helperへ抽出し、Asia/Tokyoのtodayと3年前anniversaryを一元化した。
- Feb-29はFeb-28へfallbackする。
- Knowledge Search、Past Meetings、Past Pitchbooks、Activity Analytics、Relationship Explorerを同じhelperで初期化した。
- explicit all-period behaviorは変更していない。Relationship Explorerのclearも同じ既定範囲へ戻す。

### C. 「記録を追加」の選択不能

- 保存済みparentのfail-closed lock自体は維持した。
- フォーム先頭に状態説明と明示的な「新しい記録を入力」buttonを移し、通常navigationで常に発見できるようにした。
- page切替時に安全に先頭へscrollする。
- arbitrary unlockや既存parentの上書き、authorization変更は行っていない。

### D. Natural control widths

- 通常の短いinput/selectは約30ch、Date/Timeはより短いsemantic幅、長文・file・record bodyはwideのままという共通responsive ruleを追加した。
- narrow viewportでは `max-width: 100%` で縮み、form起因のhorizontal overflowを発生させない。
- admin tableや特殊large surfaceは対象外として維持した。

### E. Past Meetingsを面談先中心へ

- user-facing関連GP filterを削除した。
- headingを `面談先` に変更した。
- primary identityは `counterpartyEntityName`、legacy rowのみ `gpName` fallbackとした。
- 行内の `関連GP: ...` sublineを削除した。
- counterparty type/entity filterとbackendのRelated_GP_IDs/retrieval semanticsは維持した。

## Deterministic validation

focused testsでは、shared date math、Feb-29 fallback、pickerのsafe/idempotent binding、全range初期化、responsive width contract、Past Meetingsのfilter/heading/render、保存済みparentのtop escape、新規Meeting登録のinteraction regressionを検証した。

```text
FOCUSED_VALIDATION: PASS / 40_OF_40
npm run check: PASS / 529_OF_529
npm run check:bundle: PASS / 30_OF_30
git diff --check: PASS
```

`src/` を正本としてcanonical buildで `dist/KnowledgeShare.bundle.gs` とdistribution metadataを再生成した。source commitは `c750054`、generated artifact commitは `51df703`。手編集したbundleはない。

## Cycle 1 / same target release

release前にaccepted version4のsaved/immutable source、target identity、single owner-only deploymentをread-only確認した。現在のexact bundle/manifestを既存targetへ1回syncし、immutable version5を1件作成して、同じexisting deploymentを1回更新した。

更新後のauthoritative readback:

```text
SAME_TARGET: PASS
SINGLE_OWNER_ONLY_DEPLOYMENT: PASS
DEPLOYMENT_TYPE: WEB_APP
EXECUTE_AS: USER_DEPLOYING
ACCESS: MYSELF
SAVED_SOURCE_PARITY: PASS
IMMUTABLE_VERSION_PARITY: PASS
BASELINE_IDENTITY_CONTINUITY: PASS
SOURCE_SYNC: 1
NEW_IMMUTABLE_VERSION: 1 / VERSION5
SAME_DEPLOYMENT_UPDATE: 1
SECOND_DEPLOYMENT: 0
```

private URL、Script ID、deployment ID、account、hash値はreport/PR/chatへ記載していない。

## Actual Chrome qualification / after evidence

同じowner accountでupdated versioned `/exec` を開き、main render後に通常UIだけで確認した。

| Outcome | actual runtime evidence |
|---|---|
| A. Calendar | Date field clickでChrome native calendar UIが開いた。全対象fieldにshared picker bindingが1回だけ設定されていることもreadbackした |
| B. Defaults | Knowledge Search、Past Meetings、Past Pitchbooks、Activity Analytics、Relationship Explorerの全5組がFrom `2023-09-18` / To `2026-09-18` |
| C. Add record | Date/Time、面談場所、面談先区分、対応する面談先、Asset Class、通常selectが操作可能。synthetic値を入力して「登録」を1回実行し、保存・関連付け完了を確認 |
| C. Readback | 新規synthetic MeetingをPast Meetingsで検索。日付 `2026-09-18`、時刻 `12:34`、面談場所 `オンライン`、synthetic面談先・Fund・参加者・本文が入力値と一致、Active / Version1 |
| D. Wide | Date 128px、ordinary select 226px。長文fieldはwideのままで、短いcontrolが画面幅まで伸びない |
| D. Narrow | 390px設定時のinner clientWidth/scrollWidthはいずれも375px。filter/formがstackし、form起因の横scrollなし。検証後はviewport overrideを解除 |
| E. Past Meetings | user-facing関連GP filterなし、headingは `面談先`。GP/non-GP/new syntheticの3件が同じprimary conceptで表示され、関連GP sublineなし |
| Temporal | accepted既存2件は `2026-09-17 10:30` / `2026-09-17 11:15` のまま。今回の新規1件も保存値どおり |
| Browser health | blocking overlay/pointer captureなし。console error/warn 0 |

登録完了後は保存済みparent lockへ遷移し、フォーム先頭に説明と「新しい記録を入力」buttonが表示された。従来の安全な添付継続状態を守りつつ、新規入力への通常導線が常時見える。

before/afterのdesktop・narrow表示はactual browserで直接観測した。private URLや内部identityを含む画像をrepositoryへ保存していない。最終実機tabは同じowner-only Web Appの「記録を追加」先頭で保持した。

## Side effects / safety

```text
SIDE_EFFECT_STATE: SOURCE_SYNC_1 / VERSION5_1 / SAME_DEPLOYMENT_UPDATE_1 / SYNTHETIC_MEETING_CREATE_1 / SYNTHETIC_MEETING_DOC_CREATE_1
EXISTING_PARENT_REWRITE: 0
FILE_UPLOAD: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED
REAL_CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
TRIGGER_CREATE: 0
PERMISSION_BROADENING: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
```

synthetic Meetingはqualification evidenceとして保持する。既存Meeting、添付、元日時セル、Docs本文は変更していない。削除/cleanupは行っていない。

## Final version / evidence mapping

- exact runtime source/artifact: `c750054` / `51df703`
- target runtime: same target、same single owner-only deployment、immutable version5
- deterministic evidence: 529/529、bundle 30/30、diff hygiene PASS
- direct evidence: actual Chrome native calendar、全5 date-range values、normal UI registration/readback、wide/narrow layout、Past Meetings GP/non-GP rendering、console 0
- PR: #52 Draft。merge/Completion LatchはChatGPT担当

FOLLOW_UP: none required for the five accepted outcomes. 会社PCでの最終human確認では、保持したowner-only tabで「新しい記録を入力」が先頭に見えること、Date clickでcalendarが開くこと、Past Meetingsの見出しが「面談先」であることを短く確認すればよい。実データ入力、provider設定、AI sync有効化は行わない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: YES

RULE-0001のoutcome/latch、RULE-0002のtarget-runtime-firstとside-effect境界、PAT-0004のsource/target/version/deployment parityを適用した。新規候補は、保存済みparentの安全な継続状態を維持する場合でも、new-record escapeをform先頭に常時表示しないと正常なfail-closed stateが選択不能に見えるというUI recovery lesson。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-24
BALL: CHATGPT
STATUS: RETURNED
