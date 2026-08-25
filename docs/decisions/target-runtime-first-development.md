# Target-Runtime-First Development Decision

Date: 2026-08-26

Status: Accepted

## Decision

Knowledge Sharing Platformsの今後の`BUILD`は、別のDEV/Staging runtimeを先に完成させてから本番runtimeへ移植する方式を標準としない。

対象機能が最終的に動作するApps Script、Google Workspace、Web App deployment shape、Drive / Sheets / Docs API、Gemini API、Shared Drive、およびbrowser runtimeを最初から`TARGET_RUNTIME`として扱い、最短のend-to-end sliceを実装する。

検証時に隔離するのはruntimeそのものではなく、データ、resource、利用者露出、および副作用である。

標準境界:

```text
actual target runtime / production code path
+ isolated synthetic or anonymized test data/resources
+ guarded or disabled side effects
→ focused logic validation
→ bounded target-runtime smoke/readback
→ authorized production data/exposure/effects
```

この判断は以下を明確に区別する。

- `TARGET_RUNTIME`: 最終的に利用するApps Script / Workspace / Web App / provider API / browser実行形態
- `ISOLATED_TEST_DATA`: synthetic / anonymized dataと明確に隔離されたfolder、Spreadsheet、Document、record、ID namespace、test account等
- `SIDE_EFFECT_STATE`: trigger、Gemini billing、external recipient、public/user exposure、destructive write、production data mutation等がdisabled / guarded / test-only / enabledのどれか

対象runtimeを使うことは、production/confidential data、実利用者公開、課金、trigger有効化、物理削除、real recipient、または他の重大な副作用を許可することではない。

## Superseded decisions

本判断は、今後のWorkについて以下をsupersedeする。

- `docs/decisions/implementation-first-final-live-qualification.md`の「feature-complete後までApps Script / Workspace / Gemini実機確認を原則行わない」という標準フロー
- `docs/decisions/apps-script-first-implementation.md`の「DEVとPRODは常に別Apps Script project / resource setとする」というenvironment decision
- `docs/planning/apps-script-implementation-plan.md`の「local/static/mock/contractでfeature-complete後、Final DEV live qualificationをまとめて行う」というdelivery sequence

過去のWork、validation report、DEV evidenceは当時観測した証拠として保持する。履歴を書き換えない。

## Effective boundary and active Work 0014

本判断は、進行中のWork 0014を途中で再設計したり、現在のevidence boundaryを変更したりしない。

Work 0014は既存handoffとPR #17の境界で安全に完了または停止する。その後の新規Workから本判断を標準適用する。

Work 0014で利用したsynthetic DEV project / resource evidenceは、実際に観測した範囲の証拠として有効だが、将来の機能開発に別DEV runtimeを維持する根拠とはしない。

## Standard BUILD sequence

今後の新規Workは原則として次の順序で行う。

1. bounded preflight
   - user-visible outcome、既決仕様、対象runtime、write/authorization boundaryを確認する
   - 実装開始を止めるほど重要な不明点だけを解消する
2. shortest coherent vertical slice
   - production source pathと実際のApps Script / Workspace / Web App shapeで最小end-to-endを実装する
3. isolated test boundary
   - synthetic / anonymized dataと明確に識別できるtest resource / recordだけを使う
   - production/confidential dataは使用しない
4. focused logic validation
   - pure logic、schema、normalization、ID、retry、security、redaction、contract等をlocal deterministic testで確認する
5. target-runtime qualification
   - exact tested sourceを対象runtimeへ同期し、最小のcreate / persist / reopen / search / readback等を実行する
   - test harnessやmockだけに存在するhelper/API/functionをtarget capabilityとみなさない
6. expand only after target evidence
   - runtime incompatibilityを修正してから次のfeature surfaceへ進む
7. enable consequential effects separately
   - production data、real users、Gemini billing、trigger、public exposure、destructive operations等は別のauthorizationとevidenceで有効化する

すべてのdeterministic scenarioをtarget runtimeで繰り返す必要はない。logic validationとtarget-runtime qualificationは役割を分け、最小十分なnative evidenceを取得する。

## Isolated test-data and resource rules

- test dataはsyntheticまたは適切にanonymizedされたものだけを使用する。
- test resource / recordは名称、prefix、metadata、parent folder、またはstable IDで明確に識別できるようにする。
- production sourceと同一runtimeを使用しても、authoritative production recordsへtest dataを混在させない。
- physical delete、bulk mutation、retention purge、trigger execution等は、test targetが機械的に識別されない限り実行しない。
- cleanupは対象ID / parent / countを事前確認できるbounded routeを使う。
- resource configurationを切り替える場合、exact target IDsをread backし、推測や名称だけで選ばない。
- GitHubにreal folder IDs、Drive IDs、deployment IDs、credentials、account identifiers、private URLsを記録しない。

## Side-effect controls

以下は、対象runtimeでの実装・readbackとは別にguardする。

- installable triggerの有効化
- Gemini / File Searchのbilling-enabled operation
- production/confidential source indexing
- external email / recipient delivery
- broad Web App access or public exposure
- physical delete、bulk update、retention purge
- production data migration
- irreversible permission change

可能な場合はdisabled flag、dry-run、inactive deployment、test recipient、explicit allowlist、bounded count、resource-ID check、idempotent setup、rollback routeを使用する。

## Separate staging decision gate

別DEV/Staging runtimeは全面禁止ではない。次のいずれかがmaterialに成立し、対象runtime内のtest folder / record prefix / isolated resource / disabled trigger / feature flag等では同じ安全性や証拠を得られない場合に限り採用する。

- irreversibleまたは許容不能なdata blast radius
- legal、regulatory、security、tenant、segregation requirement
- migration、concurrency、scale、public routing、rollback rehearsal
- material billing、rate limit、availability、operator disruption
- platformが安全なresource isolationを提供しない
- explicit user / repository requirement

採用時は、別runtimeが提供するunique evidence、productionとの差異、同期方法、廃止条件をhandoffに記録する。

本番に存在しないfunction、permission、formula property、API、test-loader helper、mock behaviorを持つ別runtimeは、production readinessを証明しない。

## Validation and READY classification

runtime-dependent Workは次を別々に報告する。

```text
LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE
SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE
READY: YES | NO
```

判定原則:

- `CI PASS`、mock、simulator、test loader、local synthetic harnessだけではtarget-runtime-dependent Workを`READY: YES`にしない。
- target runtimeで必要なfunction、API、permission、persistence、rendering、trigger、recalculation等が未観測なら`TARGET_RUNTIME_QUALIFICATION: NOT RUN`とする。
- target-runtime qualificationがPASSしても、production dataまたは重大な副作用が未承認なら、その状態を`SIDE_EFFECT_STATE`で明示する。
- Workのprimary outcomeがproduction rollout自体を含まない場合、side effectsをdisabled / guardedのまま完了できる。
- 実利用開始のREADYには、当該releaseに必要なtarget-runtime evidence、authorization、data/access boundary、rollback、およびBLOCKERなしが必要である。

## Rationale

- 実装と最終runtimeの差分を早期に発見できる。
- test environmentだけに存在するhelperやdata shapeにより、false PASSになるリスクを減らせる。
- feature-complete後にruntime incompatibilityがまとめて発覚する手戻りを減らせる。
- 個人・少人数開発で、実質的価値のない二重環境の構築・同期・保守コストを避けられる。
- logic testの速度とtarget-runtime evidenceの信頼性を両立できる。

## Non-goals

- production/confidential dataを開発初期から使用すること
- real usersへ未完成機能を公開すること
- destructive operationやtriggerを無条件に有効化すること
- logic/unit/contract testを廃止すること
- high-risk Workで必要なsegregation、backup、rollback rehearsal、approvalを省略すること
- Work 0014のactive evidence boundaryを途中変更すること
