# Work 0058 — visible brand inventory

WORK_ID: 0058
STATUS: ACTIVE
MODE: INVESTIGATION
VALIDATION_TIER: TIER_1_LOW

## Primary Outcome

`Private Assets Intelligence`へのブランド統一について、既存データ・schema・API・内部namespaceを壊さず、利用者または運用者が実際に目にする旧名称だけを安全な変更候補として確定する。

このWorkではrenameを実行しない。次のBUILDで変更してよい表示面と、変更してはいけないinternal contractを分類する。

## User-confirmed policy

- user-visible / operator-visibleな旧ブランドは、安全に変更できるものだけ`Private Assets Intelligence`へ統一する。
- `KSP_*` / `ksp...`等のinternal namespaceは維持する。
- function / API / property key / schema / sheet tab / filename等のinternal contractは原則renameしない。
- 既存データmigrationをブランド統一のためだけに行わない。
- storage構造・参照方式を名称変更のためだけに変えない。
- 最優先は事故を避けること。大量renameではなく表面的な整合を目的とする。

## Classification

各旧名称を以下のいずれかに分類する。

1. `USER_VISIBLE`: 通常利用者がUI、browser title、生成物等で見る名称。
2. `OPERATOR_VISIBLE_SAFE`: 管理・導入担当者がDrive / Spreadsheet / Apps Script / installer等で見る名称で、renameしても参照contractを壊さないことを確認できるもの。
3. `OPERATOR_VISIBLE_CONTRACT`: 人間には見えるが、installer recovery、name lookup、既存resource discovery等のcontractとして使われており、単純renameが危険なもの。
4. `INTERNAL_CONTRACT`: code identifier、function、API、property key、schema、sheet tab、bundle filename、stable prefix等。原則維持。
5. `HISTORICAL_DOC`: 過去Workや履歴の記録。原則書き換えない。

## Investigation targets

少なくとも確認する:
- current Web UI / browser title / print/export
- README / current operator docs
- installer-visible labels / status sheet
- Apps Script editor-visible entrypoint names
- Backend / Audit Spreadsheetの実際の表示名を生成するsource
- Drive folder/resource namesを生成・検索するsource
- `KnowledgeShare_Installation`
- `Knowledge Platform Backend`
- `Knowledge Platform Audit`
- `KnowledgeShare.bundle.gs`
- `installKnowledgeShare` / `checkKnowledgeShareReadiness` / `confirmKnowledgeShareDeploymentSecurity`
- `KSP_*` / `ksp...`
- current runtime resourcesを名称で参照している箇所

## Decision rule

表示名を変更候補にできるのは、参照がstable ID等により行われ、rename後も既存環境・installer recovery・validation・backup・deploymentが壊れないことをsource/call graphで確認できた場合のみ。

名前検索、固定sheet名、property、public editor entrypoint、bundle/install手順等と結合している場合は、見た目が旧ブランドでもこのWorkでは`OPERATOR_VISIBLE_CONTRACT`または`INTERNAL_CONTRACT`として維持候補にする。

## Acceptance Evidence

- 旧ブランド/旧product名のcurrent-source inventoryを作成。
- 各項目にclassification、現状、変更可否、根拠、推奨表示名を記録。
- 変更候補は具体的なfile/pathまたはruntime resource generatorまで特定。
- internal contract / migration対象を明確に除外。
- 次BUILDの最小scopeを提示。
- production source change: 0。
- runtime mutation / rename / deploy: 0。
- BLOCKER: NONEまたは具体的な未解決境界のみ。

## Non-Goals

- このWorkでのrename実行
- KSP namespaceのrename
- schema / sheet tab / property key / API rename
- data migration
- historical docsの一括書換え
- repository名変更
