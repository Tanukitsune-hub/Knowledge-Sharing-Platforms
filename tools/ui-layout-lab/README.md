# UI Layout Lab

Knowledge Sharing Platformsの「記録を追加」画面を、productionから完全に分離して調整するlocal-only static toolです。

## 起動

Windowsでは`open-layout-lab.bat`をdouble-clickします。`index.html`をChromeへdragして直接開いても動作します。server、Node、build step、network接続は不要です。

## 基本操作

1. Presetを選びます。
2. Canvas上のfieldをdragし、pointer位置に合わせてrow・start column・順番を変更します。意図的な空きcolumnも保持できます。
3. selected fieldの8方向handleで幅と高さを直接調整します。通常fieldもrole別のsafe range内で縦resizeできます。
4. Standard（12 columns）/ Fine（24 columns）を切り替え、右のinspectorでorder、start、span、top gap、height、row breakを数値調整します。
5. Canvas選択中はArrowで微調整、Shift+Arrowで大きく移動できます。inputやselect操作中はshortcutは発火しません。
6. 左panelで表示/非表示、右panelでcontainer設定を調整します。
7. 名前付きvariantへ保存するか、JSON / Codex handoffをdownloadします。

Mobile previewではfieldを1-column表示しますが、desktop用の`colSpan`は変更しません。reference画像はbrowser tab内だけで表示し、localStorage、repository、外部serviceへ保存・送信しません。

## Boundary

- specVersion2の12/24-column snap gridが正本です。absolute positioningはexportしません。
- specVersion1 JSONと既存localStorage variantは、削除せず決定的にv2へmigrateします。
- production data、Apps Script、Google Workspace、AI providerへ接続しません。
- exported handoffはvisual/layout変更だけを許可し、business logic変更を許可しません。
