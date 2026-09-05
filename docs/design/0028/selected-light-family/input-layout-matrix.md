# Input layout matrix — refined Light family

Source contractを変えず、fieldの関連、proportional width、required/optional、first view、primary actionを見直した結果です。

| Form / group | Requiredness | 1366 desktop layout | Primary action / visibility | Classification |
|---|---|---|---|---|
| Knowledge question | 自由質問のみrequired。その他modeの追加指示はoptional | 全幅textarea、min-height 68px | `検索`までfirst view | PRESENTATION_ONLY |
| Knowledge mode / visible model | modeとprofile selection | `検索モード 1fr | 使用モデル 2fr`。visible model selectorは1個 | 常時。Thinkingはnormal userから完全に隠す | 表示はPRESENTATION_ONLY、tuple mappingはFRONTEND_BEHAVIOR |
| Knowledge date / GP / source | optional | 4列 | 常時 | PRESENTATION_ONLY |
| Knowledge remaining filters | optional。比較2–5件、面談準備targetはmode条件でrequired | 3列、multi-selectは全幅 | summary付きdetails。mode-required targetは隠さない | FRONTEND_BEHAVIOR |
| Meeting list filters | optional | date range + type/entityを4列 | `検索` | disclosureのみFRONTEND_BEHAVIOR |
| Pitchbook list filters | optional | date range + GP/statusを4列 | `検索` | 同上 |
| Meeting row 1 | Date required、Time/Location optional | `日付 .8fr | 開始時間 .5fr | 面談場所 1.8fr` | 常時 | PRESENTATION_ONLY |
| Meeting row 2 | Counterparty Type / Entity required | `.9fr | 2.1fr`、面談先を広くする | 常時。登録時だけ未登録Entity追加actionを下に置く | PRESENTATION_ONLY |
| Meeting row 3 | Asset Class required、Capital/Team optional | `1.25fr | .8fr | 1.25fr` | 常時 | PRESENTATION_ONLY |
| Meeting details | optional | Fund全幅、participants 2列、本文全幅 | first view。sticky `登録 / 変更を保存` | grouping PRESENTATION_ONLY、sticky FRONTEND_BEHAVIOR |
| Meeting relations/follow-up | optional | Meeting Type横並び、related GP/Pitchbook、follow-up notes全幅 | details | disclosure FRONTEND_BEHAVIOR |
| Pitchbook registration classification | File/Date/GP/Asset required | 4-field proportional row + Fund全幅 | upload/actionをfirst view | grouping PRESENTATION_ONLY、sticky FRONTEND_BEHAVIOR |
| Pitchbook classification edit | Date/GP/Asset required、Capital/Fund optional | `日付 .85fr | GP 2fr | Asset 1.2fr | Capital 1fr`; Fund全幅 | `変更を保存`。file inputなし | PRESENTATION_ONLY |
| GP Workspace | GP selection | `GP selector | 印刷 / PDF | hint`同row | selection changeで既存load | PRESENTATION_ONLY |
| Entity Workspace | Type + Entity | 2列 | selection changeで既存load | PRESENTATION_ONLY |
| Analytics | period/date/dimensionは既存payload | period/dimension/date rangeを4列、残り3列details | `集計` | disclosure FRONTEND_BEHAVIOR |
| Relationship | optional | date range + type/entityを4列、残り3列details | `読み込む` | disclosure FRONTEND_BEHAVIOR |
| GP Master add | GP name | input + action | `追加` | PRESENTATION_ONLY |
| Option Master add | type、name | 2列 | `追加` | PRESENTATION_ONLY |
| Admin unlock | password | 1列、最大1/2幅 | `管理者モードを開始` | PRESENTATION_ONLY |
| Admin password change | new password + confirmation | 2列 | `共有管理者パスワードを変更` | disclosure FRONTEND_BEHAVIOR |
| OpenAI admin | key、source type、optional source ID | key/IDを2列、actions別row | 既存接続/同期action | PRESENTATION_ONLY |
| Gemini admin | key、source type、exact source ID | key/IDを2列、actions別row | Store確認 / 個別同期 | PRESENTATION_ONLY |
| Model policy | profile/provider/IDs/name/family/max/thinking/flags | identity 2列、Thinking profiles全幅 | `プロファイルを保存` | PRESENTATION_ONLY |

## Layout rules

- labelはcontrol直上、間隔4px。長い日本語labelを自然にwrapできる;
- selectは`min-width:0`のgrid内で使い、Entity、GP、Fund、model display nameを優先する;
- required/optionalは文字で明示する;
- textarea、multi-select、長い値は全幅;
- desktopは最大4列。複雑な判断を伴う入力は2列以下;
- primary actionをfirst viewへ保つsticky proposalはFRONTEND_BEHAVIORとして分離;
- 1050px未満は2列、760px未満はgroup見出し→field→hint→actionの意味順で1列。

## Preserved behavior

Meeting/Pitchbookの24時間draft、GP共有条件、file limits、partial retry、stable IDs、optimistic lock、Active/Inactive、current-value preservation、Knowledge five modes、source filters、provider/model/thinking eligibility、pending token、full-output fingerprint、admin session tokenを変更しません。Visible model selectorのproduction mappingは未実装です。
