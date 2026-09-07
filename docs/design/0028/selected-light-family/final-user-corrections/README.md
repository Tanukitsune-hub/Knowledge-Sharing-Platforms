# CODEX-09 最終Light修正

WORK_ID: 0028 / DISPATCH_ID: 0028-CODEX-09

Design source: `7ea55f55278bddfceb03e279f7e536e6b7590c16`。
Visual baseline: PR #45 / `2a1843048f76b6a48cec35fcdfe2c5b116c7e3dd`。

[全画像のreview index](index.html) / [PR #45との比較](comparison.html) / [QA](design-qa.md) / [検証](validation.md)

1. [自由質問 / rolling 3 years](screenshots/01-free-question.jpg)
2. [固定質問 / gray readonly](screenshots/02-fixed-preset.jpg)
3. [全期間ON / date disabled](screenshots/03-all-period.jpg)
4. [全文出力 / Meeting-only](screenshots/04-meeting-only-export.jpg)
5. [管理者 / 検索モード設定](screenshots/05-admin-mode-settings.jpg)
6. [generic preset追加 / 要約無効化の操作例](screenshots/06-generic-preset.jpg)
7. [面談実績 / 下部一覧](screenshots/07-analytics-meeting-types.jpg)
8. [sidebar goldの原寸比較](screenshots/08-sidebar-comparison.jpg)

操作可能な設計参照: [ナレッジ検索](../01-search.html)、[検索モード設定の解除済み例](../14-mode-settings.html)。
ページ間の設定共有、管理者認証、provider呼出し、永続保存は実装していません。

## Production BUILDへの引継ぎ

- 管理者のpreset registry保存はfuture BUILD。serverはstable mode IDからauthoritative fixedPromptを解決し、非自由質問のclient textを信用しない。
- `free/summary/timeline/compare/prep`はモック上のstable ID例。既存productionは日本語mode値の5-mode contract。migration・schema・実IDはBUILDで確定する。
- `比較`の2–5 Entityと`面談準備`のtarget必須条件を維持する。新規追加は`GENERIC_PRESET`のみ。
- 全期間ONは既存dateFrom/dateTo条件を除外し、OFFで直前値を復元。条件クリアはrolling 3 years。fixture review日は2026-09-07、開始日は2023-09-07。実装では既存timezone/temporal contractを使用する。
- 普通のAI検索はMeetingとPitchbookのsource identity・citation契約を維持。全文出力はMeetingのみ（資料本文も資料リンクも除外）。既存全文出力からの差分として後続BUILDで検証する。
- 行の確認済みは既存`adminCheckCompleted / updateMeetingAdminCheck / expectedUpdatedAt`。モックのチェック操作は保存の証明ではない。
- Work 0027のGemini非表示、Work 0029の管理者token・logout・パスワード変更・server認証を保持する。

## Asset provenance

PR #45にlocal vendor済みのLucide family 7 iconsをそのまま使用。形状変更・新規外部取得はなし。
[ISC / Feather由来MITライセンス](../icons/LICENSE.txt)を保持。CSS maskへ同じSVGを指定し、bright highlight / rich gold / antique shadowのgradientを適用した。19pxから22pxへ変更。brandとseparatorも同じ色域へ調整。runtime CDN・外部fetch・tracking・animationは追加していない。
