# CODEX-15 — standalone editor経路の実行可否による停止・返却

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-15
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## 結果

2026-09-09、指定された既存projectのidentityをread-onlyで更新し、saved source **83/83**、既存immutable version 75のsource **82/82**をそれぞれ対応するGit refと照合した。sourceの再pushはしていない。

しかし、owner contextのApps Script editorでは、`99_EntryPoints.gs`内に指定private関数が存在する一方、実行selectorにそれらが表示されなかった。context menuとcommand paletteでも直接実行経路を確認できず、`getInstallationStatus_()`を実行する前で停止した。これは今回観測した**editor操作経路の制約**であり、application runtime failureやinstallation破損の証拠ではない。

installation continuityを証明できていないため、setupの条件は未成立。version作成・deployment更新・R1–R8へ進んでいない。

```text
INSTALLATION_CONTINUITY: NOT_VERIFIED / PRIVATE_EDITOR_ENTRYPOINT_NOT_SELECTABLE
SETUP_MIGRATION: NOT_RUN / PRECONDITION_UNPROVEN
SOURCE_VERSION_DEPLOYMENT_PARITY: PASS / SAVED_83_OF_83 / EXISTING_VERSION_75_82_OF_82 / DEPLOYMENT_UNCHANGED
TARGET_RUNTIME_QUALIFICATION_R1_R8: NOT_RUN
PROVIDER_RUNTIME_QUALIFICATION: DEFERRED_TO_WORK_0030 / CALLS_0
SIDE_EFFECT_STATE: SOURCE_PUSH_0 / SETUP_0 / VERSION_0 / DEPLOYMENT_0 / BUSINESS_WRITE_0
RESIDUAL_SYNTHETIC_RESOURCES: NONE_CREATED_THIS_DISPATCH
BLOCKER: PRIVATE_EDITOR_EXECUTION_PATH_UNAVAILABLE_IN_OBSERVED_UI
READY: NO
```

## Work Contract / refs

- Outcome: frozen sourceのstandalone installation継続とprovider-independent R1–R8認定。
- Acceptance / evidence: editorでの実行結果・authoritative resource readback → verified `/exec`とexecution history → source/version/deployment照合 → accepted deterministic evidence。
- 最短の安全な判定: identityの照合後、既存editorでprivate status/validationの実行可否を確認する。
- Bounds: source push 0、条件付きsetup最大1、immutable version最大1、既存deployment更新最大1。未確定identity・installation前提不成立・最初のruntime failureで停止。
- Non-goals: source修正、installer対応変更、別execution surface、Execution API、wrapper追加、OAuth/Cloud project/access変更、provider呼出し、実データ、physical delete、新DB/sheet、新deployment。新しいruntimeも作成しない。
- 開始HEAD / PR head: `0aeced527ca0efe93d41c337dc10db17613b79cc`。開始時working treeはclean。
- branch: `codex/0028-production-contract-build`、既存Draft PR #51を継続。
- fresh `origin/main`: `c530ea7c7bfe5df60e0913be80f71d5d4711a00f`。
- 正本: 上記`origin/main`の`0028-CODEX-15-standalone-runtime-qualification-instruction.md`。controller review14、deployment operations、distribution/Azure decision、適用AGENTSを確認。
- frozen source: `5842a07255a10415d39d524fd8ec174450248855`。
- bundle commit: `2ab8b262c7211af5464f3201a77c6e45484cdc6c`。
- `src/**` / `dist/**`の対応refとの差分0。accepted focused 78/78、canonical 515/515、bundle 27/27を再利用し、再実行・再生成していない。
- mainのmerge/rebaseなし。ChatGPT管理のdispatch register / work registryは変更しない。

## Identityのfresh evidence

| 要素 | 今回の確認 |
|---|---|
| project / owner | Projects APIと既存mapping、CODEX-14 snapshotが一致。API principalとcreatorの一致を確認 |
| browser | owner account表示を照合し、project一覧から既存projectを開いた。editor URLのprojectとmappingの一致を確認 |
| saved source | 83 files全件をfrozen sourceと照合、PASS。BOM/改行表現・外側空白の正規化を使用 |
| existing immutable source | version 75の82 files全件が旧accepted source `9fa668619a0b91fb60ed53f696363d3954cf709e`と一致 |
| intended deployment | CODEX-14でpositive proofした対象IDをinventoryから選び、deployment metadata全体が前回snapshotと一致 |
| type / execution / access | 対象は`WEB_APP`、既存intended `/exec`、`USER_DEPLOYING` / `MYSELF`。全WEB_APP件数=1は条件にしていない |
| triggers | 今回のeditor trigger画面に「0 個のトリガーを表示しています」 |
| observed execution | 本dispatchでは関数・`/exec`を実行していない。CODEX-14のexecution証拠を今回の実行として再表示しない |

saved sourceは新source、versioned `/exec`は旧version 75であり、両者が同じsourceという意味のPASSではない。private account、resource/project/deployment ID、URL、credentialはreportへ含めない。

## Editor経路の観測と分類

1. 対象projectの`99_EntryPoints.gs`を選択し、`setupKnowledgePlatform_`、`validateInstallation_`、`getInstallationStatus_`の定義が表示されることを確認。
2. 「実行する関数を選択」を展開。表示された選択肢は以下の7件のみだった。

   ```text
   installKnowledgeShare
   checkKnowledgeShareReadiness
   confirmKnowledgeShareDeploymentSecurity
   previewKnowledgeExport
   createKnowledgeExport
   getKnowledgeExportPrompt
   recordKnowledgeExportPromptCopy
   ```

3. editor context menuには定義/参照/シンボル移動、編集操作、command paletteがあり、関数の直接実行項目はなかった。
4. command paletteで`実行`、`Run`を各1回検索し、いずれも「0 件の結果」。検索を閉じた。source編集・保存・実行ボタン操作はしていない。

**指定private関数の呼出し回数はすべて0**。選択されていたpublic installerを代わりに実行していない。watch評価、hidden state、内部RPC、`google.script.run`、`scripts.run`、診断wrapper、関数renameによる回避は行っていない。

この観測は現在のowner editor UIで承認済み入口を選べなかったという範囲に限定する。Apps Script全般でprivate関数が絶対に実行不可能とは断定しない。OAuth/consent要求は観測しておらず、根拠なくUSERへの認証操作依頼にも切り替えない。

## 未完了matrix / side effects

| 項目 | 結果 |
|---|---|
| Phase 1 status / validation | NOT RUN。existing state/config/resources、stored schema、parent/type continuity、AI sync無効は未確認 |
| Phase 2 setup / post-validation | NOT RUN。schema 7へのappendのみで足りるとの推測はしない |
| Phase 3 immutable version / existing deployment update | NOT RUN。既存version 75を維持 |
| R1 schema / resource / row preservation | NOT RUN。sourceのschema定数とpersistent schemaを混同しない |
| R2 GP / non-GP parent-first | NOT RUN |
| R3 tiny file / parent metadata | NOT RUN |
| R4 existing Meeting follow-up | NOT RUN |
| R5 unlink / relink / stable IDs | NOT RUN |
| R6 Docs body exact equality | NOT RUN |
| R7 independent Meeting-only Full Output | NOT RUN |
| R8 security / shared-admin session | NOT RUN。trigger inventory 0と本dispatchのprovider call 0は部分証拠のみ |

- source push 0、private status 0、private validation 0、setup 0、immutable version作成0、deployment更新0、新deployment 0。
- Direct OpenAI / Gemini / Azure OpenAI call各0。Actual File Search/citationはWork 0030へDEFER。
- business writes、remote file/Doc/record作成、physical delete、実データ操作、access/credential/provider設定/OAuth/Cloud project/trigger変更はすべて0。
- このdispatchで作成したsynthetic remote resourcesは0。過去dispatchの既存resourcesを列挙・削除していない。

## 次の判断

ChatGPTへBLOCKERを返す。次に必要なのは、**source変更なしで指定private関数を実行できる、実在を確認したeditor UI手順**の確定である。その入口の証拠が得られるまで、setup条件成立やschema migrationの実行を推測しない。

source/installerの再設計や権限拡張が必要と判明した場合も今回の境界を越えて実施しない。既存83/83 saved sourceとversion 75を保持する。PR #51はDraftを維持し、mergeしない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004
KNOWLEDGE_APPLIED: PAT-0004
NEW_KNOWLEDGE_CANDIDATE: NO

PAT-0004をcanonical `origin/main`から読み、saved source・immutable version・対象deploymentを別々に照合した。editor経路の制約は限定的な観測であり、共有ルールへ一般化しない。
