# Work 0050 CODEX-03 — Theme Color Tool target-runtime qualification report

WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
MODE: QUALIFICATION

## Outcome

Drive上の `KSP Work 0028 Synthetic Host` を入口としてcontainer-bound Apps Script projectと既存owner-only `WEB_APP` を一意に確認した。`origin/main` のWork0050 sourceを同projectへ1回syncし、immutable version32を1回作成し、証明済みの既存Web App deploymentを1回だけversion32へ更新した。実際の `/exec` でColor Toolと指定の回帰を確認した。Work0050のACCEPTED判定とCompletion LatchはChatGPT reviewに残す。

## Identity and deployment chain

| Gate | Evidence / result |
|---|---|
| Git ref | `cef866f42cb5427d0bc9d23b05e84038c3970f2a` (`origin/main`、Work0050 PR #72 mergeを含む) |
| Host | Drive上のtitle exact match `KSP Work 0028 Synthetic Host`。`KnowledgeShare_Installation` は `READY_FOR_DEPLOYMENT` / schema8 / `company-single-file-v1` |
| Bound project | Host UIで `拡張機能 > Apps Script` を選択。新規tabの開示はブラウザ制御側で観測できなかったため、既存editor候補をApps Script APIで照合し、project `parentId` がHost Spreadsheetと一致することを確定 |
| Saved source before sync | disposable clasp mappingでpull。2 files、accepted Work0049 source family、immutable version31と内容一致。repository rootのstale `.clasp.json` は使用せず |
| Existing deployment before update | Manage deployments UIおよびAPIで1件の `WEB_APP` を確認。version31、execute-as deploying user、access owner-only、`/exec`。既存baseline `/exec` とendpoint完全一致 |
| Source sync | `clasp push --force` 1回。独立したsaved-source API readbackで最新main bundleとmanifestが完全一致 |
| Immutable version | `clasp version` 1回、version32。version content API readbackでbundleとmanifestが完全一致 |
| Existing deployment update | `clasp redeploy` 1回。同じdeploymentのversion32をAPI readback。deployment総数2件（HEADを含む）で前後不変、`WEB_APP` / URL / execute-as / owner-only access / description不変 |
| Served runtime | 更新後の同一 `/exec` をreloadし、Color Toolを実表示・操作 |

Script ID、deployment ID、private URL、account identifier、OAuth material、disposable mappingはGitHubに記録しない。

## Logic validation before mutation

| Gate | Result |
|---|---|
| Focused Work0050 / Work0045 / Work0049 tests | 21/21 PASS |
| `npm run check` | 648/648 PASS |
| Bundle regeneration | PASS、1,289,311 bytes / 19,706 lines。最新mainのsource commit metadataを使用 |
| `npm run check:bundle` | 30/30 PASS |
| `git diff --check` | PASS |
| Work0050 deterministic browser | CODEX-01のsynthetic 17 checks PASS。今回のlive evidenceとは区別 |
| Source scope | Work0050 merge後から最新mainまでの `src/**` 追加変更0。今回のproduction source変更0 |

最新main bundleのSHA256は `6439dd67541772e1597f45f2998bde382431486c855490b04928930a60150f51`。source sync後のsaved sourceおよびversion32の双方が同一内容だった。

## Version32 `/exec` runtime

| Check | Observed result |
|---|---|
| Color Tool / 16 fields | Theme tabでColor Toolを表示。target options 16、HEX row inputs 16 |
| Current color / token switching | `sidebar.background` は `#2D3E49` / RGB `45, 62, 73`。`main.pageBackground` 切替で `#E7EDF2` / RGB `231, 237, 242` をload |
| 2D picker / Hue / keyboard | 2Dクリックで `#405980` / RGB `64, 89, 128`。Hue sliderをArrowRightで操作し色相値とHEXが変化。2DをArrowDownで操作しHEXが変化 |
| HEX / RGB / validation | 無効値 `not-a-color` で書式error表示とApply disabled。`#123ABC` でApply enabled、RGB `18, 58, 188` とswatchが同期 |
| Apply / draft preview | `main.pageBackground` のrowとCSS previewのみ `#123ABC` に変化。状態は「未保存のプレビュー」、Discard enabled。Theme Save/Resetは押していない |
| 16色一覧との双方向同期 | Color Tool Applyが対象rowへ反映。対象rowを `#ABCDEF` に直接編集するとtool HEX / RGB `171, 205, 239` / CSS previewが同期 |
| Copy | copy button後のstatus成功、browser clipboard `#ABCDEF` と一致。fallback pathはCODEX-01 deterministic browserで確認済み |
| EyeDropper | Chromeで対応buttonが表示。click後にEscapeでキャンセルして色・Theme stateは不変。未対応時の非表示pathはCODEX-01 deterministic browserで確認済み。native pickerの採色完了は未実行 |
| Discard | 開始時の16 row valuesとroot preview CSS textが完全一致。Discard disabledへ復帰。選択中tokenのtool HEXも元色を再load |
| 1440 / 390 | viewport変更後の再レイアウトで横scrollなし。1440ではtoolのpicker/detailsがpanel内。390では1列表示で両者がpanel内、document `scrollWidth=clientWidth=375` |
| Work0048 / Work0049 | 削除記録tab表示時は自動検索なし。手動検索click直後にbutton/region `aria-busy=true`、button disabled、検索中status。完了後すべて解除。復元は実行せず |
| Normal navigation | ナレッジ検索、記録を追加、過去の記録、面談先サマリー、面談実績の集計、マスター管理、管理者ページの7/7が非空 |
| Console | 全操作後のmaterial error/warn 0件 |

Browser画像証跡: [1440px](0050-CODEX-03-browser-evidence/theme-color-tool-1440.jpg)、[390px picker](0050-CODEX-03-browser-evidence/theme-color-tool-390.jpg)、[390px controls](0050-CODEX-03-browser-evidence/theme-color-tool-390-controls.jpg)。各ファイルは実際のJPEG bytesと寸法を確認済み。

## Side effects and boundary

開始時と終了時にScript Properties UIで `KSP_THEME_SETTINGS_V1` は存在せず、persisted Theme stateは既定の配色のまま。Apply / row edit / Discardはclient draftとpreviewに限定され、終了時の16色とpreview CSSは開始時に完全一致した。Theme Save / Resetは0回。実行した削除記録検索はread-only `searchMeetingRecords` pathで、復元は実行していない。provider操作、AI検索、business write、permission変更を行っていない。

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
FINAL_SERVED_VERSION: 32
APPS_SCRIPT_SOURCE_SYNC: 1
IMMUTABLE_VERSION_CREATE: 1
EXISTING_WEB_APP_DEPLOYMENT_UPDATE: 1
NEW_DEPLOYMENT: 0
WRONG_DEPLOYMENT_MUTATION: 0
LIVE_MUTATION_COUNT: 3_CONTROL_PLANE_ONLY
THEME_SAVE_OR_RESET: 0
PERSISTED_THEME_DRIFT: 0
PROVIDER_CALLS: 0
BUSINESS_DATA_MUTATION: 0
PERMISSION_CHANGE: 0
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
WORK_0050_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
WORK_0030: DEFERRED_BY_USER
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004, OBS-0009
KNOWLEDGE_APPLIED: PAT-0004
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0050
DISPATCH_ID: 0050-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
