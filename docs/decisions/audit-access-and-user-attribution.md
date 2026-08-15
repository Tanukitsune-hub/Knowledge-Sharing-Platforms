# Audit Access and User Attribution Decision

Work ID: 0003

Date: 2026-08-16

Status: Accepted

## Decision

Knowledge Sharing Platformsの初期運用では、実利用者の恒久的な本人識別を本番リリース条件としない。

Web Appは、バックエンド権限をアプリ側へ集約できる単純な構成を優先する。利用者識別情報は取得できる範囲で監査ログへ記録するが、取得できないことだけを理由に登録・変更・AI検索を失敗させたり、本番リリースを停止したりしない。

## Actor attribution

監査ログのActorは次の優先順位で記録する。

1. 利用者メールアドレスを安全に取得できる場合: email
2. emailを取得できないが`Session.getTemporaryActiveUserKey()`を取得できる場合: `TEMP_USER:<key>`
3. どちらも利用できない場合: `UNIDENTIFIED`

Temporary Active User Keyは恒久的な本人識別子ではなく、運用上の匿名トレース用として扱う。

`Created_By` / `Updated_By`等の既存列にも同じActor表現を使用できる。email取得不能を理由に空欄必須や処理失敗へしない。

## Web App execution

初期構成では、組織管理下のデプロイ主体としてWeb Appを実行し、Sheets / Shared Drive / Gemini API等のバックエンド権限をアプリ側へ集約する方式を第一選択とする。

利用者ごとの権限で実行する方式は、将来のアクセス分離等で具体的な必要性が生じた場合だけ再検討する。

Web App利用を許可された利用者は、初期版ではすべてのActive Meeting / Pitchbook / source materialを検索・参照できる共通アクセス境界とする。インターネット一般公開は前提としない。

## Audit Spreadsheet access

監査ログは通常backendの5シートとは別のGoogle Spreadsheetへ保存する。

- Audit Spreadsheetは管理者専用control folderへ置く。
- control folder / Audit SpreadsheetのGoogle Drive共有設定はRestrictedを基本とし、許可された管理者だけが直接閲覧できるようにする。
- 通常利用者へAudit Spreadsheetを共有しない。
- 初期版ではWeb App内に監査ログ閲覧画面を作らない。管理者は必要時にAudit Spreadsheetを直接開く。
- Sheetsのセル保護や独自パスワードを主要アクセス制御として使用しない。Drive共有権限をアクセス境界とする。

## Audit purpose

初期監査ログの目的は、法的な本人否認防止ではなく、運用トラブルの追跡、変更履歴、AI利用状況、失敗調査である。

記録対象は従来どおり以下を含む。

- Meeting registration / update / deactivate / reactivate
- Pitchbook registration / retry / metadata update / deactivate / reactivate / failure
- Master add / rename / reorder / deactivate / reactivate
- AI index / re-index / delete / retry / failure
- Knowledge Search across all five modes

AI queryではSearch mode、question / additional instruction、filters、configured model ID、result、cited source IDs等を記録する。

Gemini回答全文、retrieved chunk全文、Embedding、Meeting本文全文、Pitchbook内容は監査ログへ複製しない。

## Rationale

- 実利用者識別のためだけにWeb Appをaccess-user executionへ寄せると、利用者ごとのOAuthやShared Drive権限が実装・運用を複雑化する可能性がある。
- 初期版は全利用者が同じActive資料へアクセスできる共通アクセスモデルであり、利用者別authorizationを実装する必要性が低い。
- Audit Spreadsheetを別ファイルとして管理者専用Drive権限で閉じる方が、Web App内に監査閲覧・管理者認証を実装するより単純である。
- 本人識別が取れない場合でも、timestamp / action / target / result / temporary key等により実用的な運用トレースを維持できる。

## Replaces

本Decisionは、以下の旧要件を置き換える。

- 本番で実利用者識別を必須とする。
- user identityを取得できない構成をPROD-readyと判定しない。
- 監査ログ閲覧のためにWeb App内で管理者専用画面を必須実装する。

## Non-goals

- 個人単位の厳格なnon-repudiation
- 利用者別 / ファイル別のAI retrieval ACL
- 監査閲覧のための独自password認証
- 初期版でのWeb App内Audit Viewer

Work ID: 0003
