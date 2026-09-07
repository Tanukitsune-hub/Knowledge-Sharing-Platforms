# Visual errata — CODEX-10 record-centric correction

Source SHA: `9fa668619a0b91fb60ed53f696363d3954cf709e`
Baseline: PR #46 / CODEX-09 `400f2f0e77acf81deb32e363d79a3962dfd2f017`

## CODEX-10 correction

- Knowledge Searchの`GP`を既存Counterparty Entity / `entityKey`を表す`面談先`へ変更した。
- `全文出力`をAI model selectorから分離し、Meeting-only / AIなしのdedicated actionへ変更した。
- `記録を追加`の`面談 / 資料`subtabとtype selectorを廃止し、Meeting-onlyの面談記録surfaceへ統合した。
- 面談は親recordを先に保存してから任意の関連資料を登録する順序を表示した。
- standalone file-only / Pitchbook registration routeは作成しない。
- `過去の記録`の`面談 / 資料`subtab、独立Pitchbook list、資料側の逆向き一覧を廃止した。
- record detailへ関連資料を集約し、`削除（紐付け解除）`をphysical deleteと区別した。
- Theme scopeはLight only。Dark/System/theme controlは作成していない。

## 維持したvisual contract

- Sidebar base `#182124`、main background `#F4F7FA`、white card、cool gray borderを維持した。
- `#E1001F`はactive menuのleft stripだけで使用する。Active stateは背景・border・textでも識別する。
- Local thin-line SVG icon、92px repeatのclean sayagata、compact form/list/analytics layoutを維持した。
- Knowledge Searchはvisible model selector 1件、normal-user Thinking / Geminiは非表示のままにした。

## Source contract boundary

- Relationship truthは`Meeting_Index.Related_Pitchbook_IDs`の明示Document IDだけ。GP一致によるrelationship inferenceは行わない。
- Parent record作成、stable `Meeting_ID`発行、file-level retry、unlink semanticsはfuture BUILDの設計境界として表示しただけで、production handlerは変更していない。
- Work 0027のGemini qualified-disabled / normal-user hidden baselineと、Work 0029のshared-admin session/logout/password-change behaviorを維持した。

## Static artifactの限界

Keyboard操作、focus order、contrast数値、screen reader、Apps Script runtime、provider、server mapping、save persistenceは未検証であり、PASSを主張しません。
