# Work0053 UI用語表

画面・公開エラー・書き出し文書では、同じ概念を次の表記で揃える。内部ID、API、保存形式は変更しない。

| 概念 | 利用者向け表記 | 使い分け |
| --- | --- | --- |
| Meeting | 面談 / 面談記録 | 行為は「面談」、保存された記録は「面談記録」。IDは `Meeting ID`。 |
| Pitchbook / source file | 保存資料 | 原本そのものを指すときは「原本ファイル」。IDは `Document ID`。 |
| Counterparty | 面談先 | 種別は「面談先区分」。 |
| Asset Class | アセットクラス | 業務上の既存表記を維持。 |
| Team | チーム | 業務上の既存表記を維持。 |
| Meeting location | 面談場所 | 入力欄・一覧・集計で統一。 |
| Latest Meeting | 最後の面談日 | 日付を表示するときに使用。 |
| Inactive / Reactivate | 削除済み / 復元 | `Status` 値は内部契約として維持。 |
| Default theme | 既定の配色 | 既定値へ戻す操作に使用。 |
| Connection test / sync | 接続確認 / 同期 | 接続可否の確認と資料の同期を区別。 |

`Fund / Strategy`、`Status`、`OpenAI`、`Gemini`、`API`、`HEX`、`RGB` は必要な業務・製品表記として維持する。内部実装用語や生のエラーコードは画面へ出さない。
