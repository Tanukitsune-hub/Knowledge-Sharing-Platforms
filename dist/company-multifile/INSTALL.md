# Private Assets Intelligence 0.1.2 — 7ファイル導入手順

このpackageはaccepted single-file bundleと同じ内容の手動導入用代替artifactです。canonical sourceやruntime behaviorは変更していません。
release source commit: 4f092183d6f5804b79b5ef802c40b234aedd6131
canonical bundle SHA-256: 8ef7c362af8c5da23c792cf20046c8b6f08a044f16fa5b71e3d40f7f46601c27

1. 既に受け取った会社導入ガイドの手順1～3に従い、導入先Spreadsheet、Apps Script、必要なDrive APIを準備します。
2. Apps Script editorで既存Code.gsを00_BundleResources.gsに名前変更してサンプルコードを消し、残り6個のスクリプトファイルを記載順に作成します。各添付.txtの全文を対応する.gsへ貼り付けてください。

   1. 00_BundleResources.gs ← 00_BundleResources.txt
   2. 10_ServerPart01.gs ← 10_ServerPart01.txt
   3. 20_ServerPart02.gs ← 20_ServerPart02.txt
   4. 30_ServerPart03.gs ← 30_ServerPart03.txt
   5. 40_ServerPart04.gs ← 40_ServerPart04.txt
   6. 50_ServerPart05.gs ← 50_ServerPart05.txt
   7. 60_ServerPart06.gs ← 60_ServerPart06.txt

3. 7個の.gsをすべて保存します。部分貼付、内容の編集、ファイル順の変更はしないでください。
4. プロジェクトの設定でappsscript.jsonの表示を有効にし、添付のappsscript.jsonの全文をmanifest editorへ貼り付けて保存します。
5. 同梱のPACKAGE_MANIFEST.jsonで7ファイルの順序・bytes・SHA-256、連結SHA-256、release/schema/source commitを照合できます。
6. 会社導入ガイドの単一bundle貼付手順（手順4）は本書の手順2～4で置き換え、同ガイドの手順5以降に従います。

初回PilotのWeb Appはexecute-as self / access self onlyを維持します。OpenAI・Geminiは別途設定されるまで無効です。
このWorkでは会社Apps Scriptへの保存・導入・deploymentは行いません。
