# CODEX-10 Knowledge Search action corrections

WORK_ID: 0028 / DISPATCH_ID: 0028-CODEX-10

CODEX-09のLight review packageをvisual baselineとし、Knowledge Searchの追加2点だけをdesign-onlyで補正した。

- `GP`を既存Counterparty Entity / `entityKey`を表す`面談先`へ変更
- `全文出力`を`AIモデル`selectorから分離し、独立したMeeting-only / AIなしactionとして表示
- Full Output previewに保存済みMeeting属性と権威あるGoogle Docs本文の例を表示
- Pitchbook本文・Pitchbook参照リンクsectionはFull Output previewへ含めない
- production `src/**` / `dist/**`、runtime、deploy、Dark/System、Past Records仕様は変更していない

## Review package

- [comparison](comparison.html)
- [browser validation](browser-validation.json)
- [design QA](design-qa.md)
- [validation](validation.md)
- [screenshots](index.html)

## Provenance

- Current canonical base: `origin/main` at `de8563e287299be4477641822d72f5ebf2a65adf`
- Accepted donor content: PR #46 / CODEX-09 head `400f2f0e77acf81deb32e363d79a3962dfd2f017`
- Visual baseline: CODEX-09 `final-user-corrections/screenshots/01-free-question.jpg`
- Production source SHA used by the design renderer remains `7ea55f55278bddfceb03e279f7e536e6b7590c16`

The donor design tree was selectively materialized on current `origin/main`; stale CODEX-09 control history was not replayed.
