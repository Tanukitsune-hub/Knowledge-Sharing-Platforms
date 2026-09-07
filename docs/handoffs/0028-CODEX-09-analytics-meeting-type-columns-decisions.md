# Work 0028 / CODEX-09 candidate — 面談種別3列の追加判断

WORK_ID: 0028
STATUS: CLOSED USER CORRECTION FOR NEXT DISPATCH
MODE: INVESTIGATION
SCOPE: DESIGN ONLY

## User outcome

`面談実績の集計`下部の個別Meeting一覧で、事務担当者が各GPとの面談日付とMeeting Type該当有無を一覧で即時確認できるようにする。

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

現行の`Team / 面談種別`列はMeeting Type情報が新3列と重複するため、`Team`列へ簡素化する。これにより情報重複を避け、3つのnarrow flag column追加による横幅増加を抑える。

推奨列順:

1. 日付（Meeting IDは補助表示）
2. 面談先
3. Asset Class
4. Team
5. Fund / Strategy
6. 原資料
7. 年1回面談
8. オフィス訪問
9. 年次総会
10. 確認済み

Meeting Type 3列と`確認済み`は中央寄せのnarrow columnとし、1366×768でhorizontal overflow 0を維持する。

## Preserve

- `確認済み`は右端のまま、既存`adminCheckCompleted` / `updateMeetingAdminCheck` contractを維持
- Meeting Typeの保存・編集contractは変更しない
- Activity Analyticsのfilter / breakdown dimension `meetingType`を変更しない
- 新しいmutation / backend / dataset / endpointを追加しない
- Light-only visual direction、sidebar、gold treatment、Past Records relation integration等のaccepted decisionsは再検討しない

## Acceptance evidence for next design correction

- 下部Meeting一覧に3列が`確認済み`直前で表示される
- codeごとに`○ / —`が正しく対応するsynthetic fixtureを含む
- 少なくとも1rowは複数Meeting Type該当例を含め、複数`○`を確認できる
- `Team / 面談種別`の重複表示は解消し`Team`へ簡素化
- 1366×768 horizontal overflow 0
- existing `確認済み`column / mapping維持
- production `src/**` / `dist/**` changes NONE

次にCodexへ実行指示を出す場合はfresh Dispatch ID `0028-CODEX-09`を使用し、Returned CODEX-08は再利用しない。
