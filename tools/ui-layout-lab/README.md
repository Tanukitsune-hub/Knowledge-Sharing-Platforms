# Multi-screen UI Studio

Knowledge Sharing Platformsの全7画面を、productionから完全に分離して調整するlocal-only static toolです。Work 0034 / version 10をvisual baselineとし、Work 0033の「記録を追加」candidateと旧variantを引き継ぎます。

## 起動

Windowsでは`open-layout-lab.bat`をdouble-clickします。`index.html`をChromeへdragして直接開いても動作します。server、Node、build step、network接続は不要です。

## 基本操作

1. 左上のscreen selectorかOverviewから、編集する画面を選びます。
2. Macro gridを12 / 24 / 48 columns、Micro snapを8 / 4 / 2 / 1pxから選びます。
3. Canvas上のblockまたはchild controlを直接dragし、row・start column・micro offsetを調整します。意図的な空きcolumnも保持できます。
4. selected elementの8方向handleで幅と高さを直接調整します。1 pointer gestureは1 undo entryです。
5. 右のinspectorでorder、start、span、top gap、height、`xOffsetPx`、`yOffsetPx`、`widthAdjustPx`、row breakを数値調整します。
6. Canvas選択中はArrowでcurrent micro step、Shift+Arrowで4 steps微調整できます。inputやselect操作中はshortcutは発火しません。
7. Shared Shellでpage / sidebar / card / common controlを変更すると、7画面previewへ共通反映されます。screen固有specは変わりません。
8. 名前付きproject variantへ7画面をまとめて保存するか、current screen / whole project JSON、screen handoff / all-screen summaryをcopy・downloadします。

Mobile previewではblockを1-column表示しますが、desktop用のcanonical specは変更しません。reference画像はscreen別にbrowser tab memoryへだけ読み込み、localStorage、repository、外部serviceへ保存・送信しません。

「記録を追加」の初期状態はcurrent authoritative candidate（12-column相当を24-columnへexact変換 / width 100% / max-width 2000px / left / gap 14px）です。Wide / Laptop / Compactのpreview切替はcanonical placementとexport JSONを変更せず、Mobileだけを1-column visual projectionとして表示します。

## Boundary

- `projectSpecVersion: 1`が7画面とshared shellの正本です。screenは12/24/48-column macro gridとbounded micro offsetを持ちます。
- Work 0033のMeeting specVersion1/2 JSONと既存localStorage variantは、元keyを削除せず決定的にprojectへmigrateします。
- production data、Apps Script、Google Workspace、AI providerへ接続しません。
- exported handoffはscreenごとのvisual/layout review用であり、7画面の同時deploymentを指示しません。business logic変更も許可しません。
