# CODEX-11 最新reviewへの案内

現在の成果・操作デモ・画像・契約・validationは[integrity-light-review/README.md](integrity-light-review/README.md)を参照してください。
再生成は`render-design.py`、現行design検証は`validate-integrity.py`です。
以下はCODEX-10以前の履歴です。「現在」「PASS」「禁止」等の記述は当時のsnapshotであり、最新CODEX-11 instruction/reviewを上書きしません。旧validatorも当時のsnapshot専用です。

# Heuristic review — CODEX-10 record-centric Light family

同じsynthetic fixtureとcurrent source contractで7つの代表scenarioを確認しました。Static mockから所要時間や利用者テスト成功率は作っていません。

| Scenario | Expected route / state | Visibility and hierarchy | Contract risk | Result |
|---|---|---|---|---|
| 1. 根拠付きKnowledge Search | ナレッジ検索 | Visible model selector 1件、Thinking/Geminiなし。回答→根拠不足→citation→原資料 | Tuple mappingはfuture frontend。自動failoverなし | PASS |
| 2. 面談 record登録 | 記録を追加 → 面談記録 | 面談情報、任意関連資料、親Meeting先行を同じsurfaceで確認 | Parent `Meeting_ID` first、file-level retry | PASS |
| 3. 過去の記録と関連資料 | 過去の記録 → record detail | 一つのMeeting listからresolved / Inactive / unresolved関連資料を確認 | Explicit Document IDsのみ。削除はunlink | PASS |
| 4. GP/non-GP確認 | 面談先サマリー | 1 selector row。選択に応じたspecialized content | Existing GP/Entity read facadeを維持 | PASS |
| 5. 月次実績確認 | 面談実績の集計 → 月次 | 対象月、summary、trend、breakdown、individual Meeting、確認済みを1 page | Existing analytics + admin check contract | PASS |
| 6. 管理 | プルダウンの管理 / 管理者ページ | Gold separator後のsystem/tool領域。Masterとshared-admin/provider semanticsを分離 | Internal IDs/auth/provider policy不変 | PASS |

## Heuristic judgment

- Recognition: 7 destinationのtask labelとgold separatorで、text headingを増やさず通常業務とsystem/toolの境界を示した。
- Consistency: Sidebar activeは1件。related-file actions、checkbox、buttonにはgold/borderを使い、red stripを複製しない。
- Match with work: `面談 / 資料`の二重入口をやめ、record detailへ関連資料操作を集約した。
- Error prevention: 親`Meeting_ID` firstを番号付きで表示し、親作成失敗とfile-level partial retryの境界を明示した。
- Visibility: 親Meetingの保存、任意関連資料、file-level statusを同じrecord creation surfaceで確認できる。
- Recovery: related-fileの削除はunlink、Active / Inactiveと物理削除を混同しない。
- Minimalism: standalone Pitchbook add/list/edit、独立資料一覧、逆向きrelation surfaceを置かない。

Backend変更riskはNONEです。Parent-first registration、file retry、unlink、Meeting-only mappingはfuture BUILD時にkeyboard/focus/runtime/persistenceを確認します。
