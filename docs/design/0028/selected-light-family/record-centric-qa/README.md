# CODEX-10 record-centric design QA

WORK_ID: 0028 / DISPATCH_ID: 0028-CODEX-10

最新`origin/main`でclosedになったrecord-centric IAを、CODEX-09のLight familyへ追加したdesign-only review packageです。

- `記録を追加`: `記録種別 = 面談 / データ受領`の単一入口
- `面談`: 親recordを先に保存し、関連資料は任意で追加
- `データ受領`: 受領背景メモと必須ファイルを親recordへ紐付け
- `過去の記録`: 一つのrecord listとdetail内の関連資料操作
- 関連資料の表面上の削除: 現在のrecordからのunlink。物理削除ではない
- standalone Pitchbook登録、独立資料一覧、資料からの逆向き一覧は作成しない

## Review package

- [baseline / implementation comparison](comparison.html)
- [browser validation](browser-validation.json)
- [design QA](design-qa.md)
- [validation](validation.md)
- [screenshots](index.html)

## Provenance

- Canonical base: `origin/main` `27bdf999d4716ee321ba8ba31a134745e220fa41`
- Prior Light visual baseline: PR #46 / CODEX-09 `400f2f0e77acf81deb32e363d79a3962dfd2f017`
- Current source controls reference: `9fa668619a0b91fb60ed53f696363d3954cf709e`
- Production `src/**` / `dist/**` / runtime / deploy: unchanged
