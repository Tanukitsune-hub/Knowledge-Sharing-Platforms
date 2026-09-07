# Work 0028 / CODEX-09 candidate — 面談種別3列とgold icon最終補正

WORK_ID: 0028
STATUS: CLOSED USER CORRECTION FOR NEXT DISPATCH
MODE: INVESTIGATION
SCOPE: DESIGN ONLY

## User outcome

`面談実績の集計`下部の個別Meeting一覧で、事務担当者が各GPとの面談日付とMeeting Type該当有無を一覧で即時確認できるようにする。

あわせてsidebar iconは、現状より明確に「金」と認識できる強い存在感へ引き上げる。必要なら外部の類似icon素材を採用してよい。

## Source contract

既存Activity Analytics drill rowは`meetingTypeCodes`を保持している。新しいbackend / dataset / sheet / endpointは作らない。

既存Meeting Type code:

- `ANNUAL_REVIEW` → 年1回面談
- `OFFICE_VISIT` → オフィス訪問
- `ANNUAL_GENERAL_MEETING` → 年次総会

Meeting Typeはcheckbox由来の複数選択可能な配列として扱い、1Meetingが複数列で`○`になることを許容する。

## Required presentation change

`面談実績の集計`下部の個別Meeting一覧で、`確認済み`列の直前に以下3列を追加する。

1. `年1回面談`
2. `オフィス訪問`
3. `年次総会`

各rowの表示:

- 該当codeが`meetingTypeCodes`に含まれる → `○`
- 含まれない → `—`

空欄にはしない。事務確認用途のため、該当なしも明示する。

## Layout decision

現行の`Team / 面談種別`列はMeeting Type情報が新3列と重複するため、`Team`列へ簡素化する。

ユーザー指定の最終列順:

1. 日付（Meeting IDは補助表示）
2. 面談先
3. Asset Class
4. Team
5. 原資料
6. 年1回面談
7. オフィス訪問
8. 年次総会
9. 確認済み

`Fund / Strategy`はこの月次個別Meeting一覧から外す。事務担当者が面談日付・面談先・主要分類・Meeting Type該当有無・確認状態を一目で確認できることを優先する。

Meeting Type 3列と`確認済み`は中央寄せのnarrow columnとし、1366×768でhorizontal overflow 0を維持する。

## Gold icon direction — user override

前回の「控えめなmetallic gold」より一段強くする。sidebar iconは装飾ではなくnavigation identityとして存在感を持たせる。

### Visual target

- 一目でgold metallicと分かる、明るいhighlightと深いgold shadowを併用する。
- champagne寄りの淡色だけでなく、bright gold / rich gold / antique shadowを組み合わせる。
- flat 1色filterだけで済ませない。SVG gradient、duotone、内側highlight、極小のdrop shadow等を使ってよい。
- 現行thin-lineの繊細さに拘束されない。より存在感が出るならsemi-filled / duotone / slightly heavier strokeへ変更可。
- icon sizeもsidebar balanceを壊さない範囲で現状より僅かに大きくしてよい。
- neon yellow、強い外側glow、派手なanimation、過度な3D chrome表現にはしない。
- `Knowledge Share` brandとdecorative separatorも同系統のgold material languageへ揃える。

### External icon assets allowed

外部からより適したicon family / SVG素材を採用してよい。ただし以下を必須とする。

- permissive licenseを確認する。
- 7 destinationsで統一された1 familyを原則とする。
- 必要なSVGをrepositoryへlocal vendorする。runtime CDN / remote fetch / tracking dependencyは禁止。
- license / attribution requirementがあればrepository内に保持する。
- productionで使う場合に再配布可能な素材だけを選ぶ。
- 既存iconより視認性・gold material感が明確に改善する場合のみ置換する。

CODEX-09では、現行PR #45 iconとの比較が分かるsidebar screenshotを残し、goldの存在感が実際に強まったことをvisual review可能にする。

## Preserve

- `確認済み`は右端のまま、既存`adminCheckCompleted` / `updateMeetingAdminCheck` contractを維持
- Meeting Typeの保存・編集contractは変更しない
- Activity Analyticsのfilter / breakdown dimension `meetingType`を変更しない
- `Fund / Strategy`自体のsource data / contractは削除しない。下部Meeting一覧のpresentationから外すだけ
- 新しいmutation / backend / dataset / endpointを追加しない
- Light-only direction、sidebar information architecture、system/tool separator、Past Records relation integration等のaccepted decisionsは再検討しない
- active menuの`#E1001F` thin left stripと、ordinary UIでのred不使用を維持する

## Acceptance evidence for next design correction

- 下部Meeting一覧の列順が `日付 / 面談先 / Asset Class / Team / 原資料 / 年1回面談 / オフィス訪問 / 年次総会 / 確認済み` である
- codeごとに`○ / —`が正しく対応するsynthetic fixtureを含む
- 少なくとも1rowは複数Meeting Type該当例を含め、複数`○`を確認できる
- `Team / 面談種別`の重複表示は解消し`Team`へ簡素化
- `Fund / Strategy`は当該一覧に表示しない
- 1366×768 horizontal overflow 0
- existing `確認済み`column / mapping維持
- sidebar iconがPR #45より明確に強いgold metallic presenceを持つ
- external assetを使う場合はlicense/local-vendor/no-runtime-dependencyを確認
- 7 destinationsでicon familyの統一感を維持
- production `src/**` / `dist/**` changes NONE

次にCodexへ実行指示を出す場合はfresh Dispatch ID `0028-CODEX-09`を使用し、Returned CODEX-08は再利用しない。
