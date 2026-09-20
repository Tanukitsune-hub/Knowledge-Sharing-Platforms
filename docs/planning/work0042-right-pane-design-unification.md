# Work 0042 — Right-pane design unification plan

WORK_ID: 0042
STATUS: ACTIVE
MODE: BUILD
PHASE: REQUIREMENTS_INTAKE
BALL: CHATGPT
ACTIVE_DISPATCH: NONE

## Primary Outcome

Work0041 version21をbaselineとして、sidebarを維持したまま右ペイン全体をselected record-detail designへ統一する。

## Fastest Safe Decisive Action

requirements intakeを先に完了する。

ユーザーが画面ごとに追加修正を順次提示しているため、各要件をWork0042へ集約し、design / behaviorがfreezeした後に1つのCodex implementation dispatchへまとめる。

## Current frozen direction

- sidebar unchanged。
- right-pane visual systemをselected mockupへ統一。
- card boundary / light header band / subtle shadow / inset body / action hierarchyを共通化。
- マスター管理:
  - sidebar labelを`プルダウンの管理`から`マスター管理`へ変更（sidebar visualは不変）。
  - Asset Class / 面談場所 / Teamのmanual numeric reorderをdrag-and-dropへ置換。
  - drag handle + insertion indicator + short shift animation。
  - existing OPTION_REORDER / Option_Order semanticsを再利用。
  - numeric sort-order prompt / buttonをnormal UIから撤去。
- 管理者ページは2 tabs:
  - 左: AIプロバイダ設定
  - 右: 削除記録の管理
- default tab: AIプロバイダ設定。
- tab switchingはclient-side、state-preserving。
- Work0041 / Work0040 accepted behaviorはpreserve。
- user-facing terminology:
  - Team -> チーム
  - Asset Class -> アセットクラス
  - Meeting Type -> MTG種別
  - internal identifiers / schema / enumは維持。

## Implementation strategy after freeze

1. shared right-pane design tokens / component classesを最小限導入。
2. existing page DOMをできるだけ維持し、presentationをshared classesへ収束。
3. master pageのAsset Class / 面談場所 / Teamをdirect-manipulation sortable list/tableへ整理し、existing reorder facadeへ接続。
4. admin pageをtablist / tabpanel構造へ整理。
5. page-by-page visual regressionを実施.
6. 2560 / 1440 / 1280 / 390でruntime qualification。
7. same existing owner-only deploymentのみ更新。

## Completion Gate

- all frozen user requirements implemented。
- full relevant tests / bundle checks PASS。
- all 7 normal pages nonblank。
- admin tabs / delete restore / provider settings regression PASS。
- schema/migration/security/provider semantics unchanged。
- BLOCKERなし。
