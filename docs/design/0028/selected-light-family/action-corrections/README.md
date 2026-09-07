# CODEX-10 Knowledge Search action corrections

WORK_ID: 0028 / DISPATCH_ID: 0028-CODEX-10

CODEX-09のLight review packageをvisual baselineとし、Knowledge Searchの追加2点だけをdesign-onlyで補正した。

- `GP`を既存Counterparty Entity / `entityKey`を表す`面談先`へ変更
- `全文出力`を`AIモデル`selectorから分離し、独立したMeeting-only / AIなしactionとして表示
- Full Output previewに保存済みMeeting属性と権威あるGoogle Docs本文の例を表示
- Pitchbook本文・Pitchbook参照リンクsectionはFull Output previewへ含めない
- production `src/**` / `dist/**`、runtime、deploy、Dark/System、record-centric IAの対象外surfaceは変更していない。record-centric correctionは[別QA package](../record-centric-qa/README.md)で確認する。

## Review package

- [comparison](comparison.html)
- [browser validation](browser-validation.json)
- [design QA](design-qa.md)
- [validation](validation.md)
- [screenshots](index.html)

## Provenance

- Current canonical base: `origin/main` at `27bdf999d4716ee321ba8ba31a134745e220fa41`
- Accepted donor content: PR #46 / CODEX-09 head `400f2f0e77acf81deb32e363d79a3962dfd2f017`
- Visual baseline: CODEX-09 `final-user-corrections/screenshots/01-free-question.jpg`
- Production source SHA used by the design renderer is `9fa668619a0b91fb60ed53f696363d3954cf709e`

The donor design tree was selectively materialized on current `origin/main`; stale CODEX-09 control history was not replayed.
