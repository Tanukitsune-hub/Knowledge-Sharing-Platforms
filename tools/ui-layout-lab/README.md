# UI Layout Lab

Knowledge Sharing Platformsの「記録を追加」画面を、productionから完全に分離して調整するlocal-only static toolです。

## 起動

Windowsでは`open-layout-lab.bat`をdouble-clickします。`index.html`をChromeへdragして直接開いても動作します。server、Node、build step、network接続は不要です。

## 基本操作

1. Presetを選びます。
2. Canvas上のfieldをdragして順番を変更します。
3. field右端のhandleで12-column幅、面談内容・資料block下端のhandleで高さを調整します。
4. 左panelで表示/非表示、右panelで数値とcontainer設定を調整します。
5. 名前付きvariantへ保存するか、JSON / Codex handoffをdownloadします。

Mobile previewではfieldを1-column表示しますが、desktop用の`colSpan`は変更しません。reference画像はbrowser tab内だけで表示し、localStorage、repository、外部serviceへ保存・送信しません。

## Boundary

- 12-column snap gridが正本です。absolute positioningはexportしません。
- production data、Apps Script、Google Workspace、AI providerへ接続しません。
- exported handoffはvisual/layout変更だけを許可し、business logic変更を許可しません。
