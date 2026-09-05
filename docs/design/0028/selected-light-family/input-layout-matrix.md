# Input layout matrix

Source contractを変えずに、fieldの関連性、幅、required/optional、初期表示、action位置を比較した結果です。

| Form / group | Required | Desktop layout / width | Initial visibility | Primary action | Classification |
|---|---|---|---|---|---|
| Knowledge: question | 自由質問のみrequired。その他modeは追加指示optional | 1列・全幅・textarea | 常時 | `検索`、条件の終点 | PRESENTATION_ONLY |
| Knowledge: mode / route | mode、route | 2列・各1/2 | 常時 | 同上 | PRESENTATION_ONLY |
| Knowledge: model / thinking | selected AI routeでpolicyに従う | 2列・各1/2。長いdisplay nameを切らない | AI route時に表示 | 同上 | PRESENTATION_ONLY |
| Knowledge: date / GP / source | optional | 4列、各1/4。1366でlabelとvalueを1行保持 | 常時 | 同上 | PRESENTATION_ONLY |
| Knowledge: remaining 9 filters | optional。比較2–5件、面談準備targetはmode条件でrequired | 3列、multi-selectは全幅 | summary付き詳細。active/requiredは隠さない | 同上 | FRONTEND_BEHAVIOR |
| Meeting list filters | すべてoptional | date range + type/entityを4列、残り3列 | 主要4項目常時、残り詳細 | `検索` | disclosureのみFRONTEND_BEHAVIOR |
| Pitchbook list filters | すべてoptional | date range + GP/statusを4列、分類を3列 | 同上 | `検索` | 同上 |
| Meeting registration basic | Date、Counterparty Type、Entity、Asset Class | required 4項目を2列×2行。Time/Location、Capital/Teamも2列 | 常時 | sticky `登録` | grouping PRESENTATION_ONLY / sticky FRONTEND_BEHAVIOR |
| Meeting details | optional | Fundは全幅。person/internalは2列。Meeting bodyは全幅 | 常時 | 同上 | PRESENTATION_ONLY |
| Meeting relations/follow-up | optional。ただしfollow-up checkboxとnoteの関係を維持 | Meeting Type横並び、related GP/Pitchbookとnotes全幅 | 詳細section | 同上 | disclosure FRONTEND_BEHAVIOR |
| Meeting edit | registrationと同じ。hidden ID/versionは維持 | 同じ幅。identity/conflictはform上部 | editor open時 | sticky `変更を保存` | sticky/conflict surface FRONTEND_BEHAVIOR |
| Pitchbook registration | file、Date、GP、Asset Class | Date/GP、Asset/Capitalの2列、Fund全幅、drop zone全幅 | 常時 | sticky `登録` | stickyのみFRONTEND_BEHAVIOR |
| Pitchbook edit | Date、GP、Asset Class。file inputなし | 2列、保持原資料は別card | editor open時 | `変更を保存` | PRESENTATION_ONLY |
| GP Workspace | GP選択 | 1/2幅。長い候補を優先し、空きにactionを置かない | 常時 | selection changeで既存load | PRESENTATION_ONLY |
| Entity Workspace | Type + Entity | 2列・各1/2 | 常時 | selection changeで既存load | PRESENTATION_ONLY |
| Analytics | period/date/dimensionは既存payload項目 | period/dimension/date rangeを4列、filterは3列 | principal 4 controls常時 | `集計` | disclosure FRONTEND_BEHAVIOR |
| Relationship | すべてoptional | date range + type/entityを4列、残り3列 | principal 4 controls常時 | `読み込む` | disclosure FRONTEND_BEHAVIOR |
| GP Master add | GP name | input + action。ただし狭いbutton列を作らない | 常時 | `追加` | PRESENTATION_ONLY |
| Option Master add | type、name | 2列、actionは次row先頭 | 常時 | `追加` | PRESENTATION_ONLY |
| Admin unlock | password | 1列、最大1/2幅 | locked時 | `管理者モードを開始` | PRESENTATION_ONLY |
| Admin password change | new password + confirmation | 2列 | unlocked時の詳細 | `共有管理者パスワードを変更` | disclosure FRONTEND_BEHAVIOR |
| OpenAI admin | key、source type、optional source ID | key/IDを2列、source typeは1/2。actionsを別row | unlocked detail | 接続確認 / 同期は別既存actions | grouping PRESENTATION_ONLY |
| Gemini admin | key、source type、required source ID for individual sync | key/IDを2列、source typeは1/2 | unlocked detail | Store確認 / 個別同期 | grouping PRESENTATION_ONLY |
| Model policy | profile, provider, IDs, name, family, optional max, thinking lines, flags | identity fields2列、Thinking textarea全幅、flags横並び | admin detail | `プロファイルを保存` | grouping PRESENTATION_ONLY |

## Label and width rules

- labelはcontrolの直上、距離6px。固定label columnは使わず、長い日本語labelを自然にwrapできる。
- selectは`min-width: 0`のgrid内で使い、Entity / Fund / model display nameの領域を優先する。
- requiredとoptionalを文字で明示し、色だけに依存しない。
- textareaとmulti-selectは全幅。2列に押し込まない。
- desktopは最大4列、判断を伴う入力は原則2列。3列は任意filterだけ。
- 760px未満はDOMの意味順で1列。group見出し、field、hint、actionの順を保つ。

## Source behavior that must remain

Meeting/Pitchbookの24時間draft、GP共有条件、file constraints、partial retry、stable IDs、optimistic lock、Active/Inactive、current-value preservation、Knowledge mode validation、source type coercion、provider/model/thinking eligibility、pending token、full-output fingerprint、admin session tokenは配置変更の対象外です。
