# Work 0073 CODEX-03 — model setup review repair 報告

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH
BASE_PR: #109

## Outcome

ChatGPT final reviewの2件のBLOCKERをPR #109上で修正した。CODEX-02の1フォーム保存、credential安全境界、既存model policyとrequest builder、4-source同期、合成browser証拠を維持した。新しいモデル管理基盤や静的allowlistは追加していない。

1. Geminiの`models.list`候補は`baseModelId`を優先し、ない場合はresource nameの先頭`models/`を1回取り除く。候補、旧cache、直接入力、保存、qualification、実効検索requestを同じbare Model IDに揃えた。既存の接頭辞付きprofileをbare IDで再保存しても別profileを作らない。OpenAI IDは変更しない。
2. model policyとscalar OpenAI modelがともに空のadmin/setup readbackは、profile 0件を返す。既存の保存済みlegacy OpenAI modelの表示は維持した。fresh UIは両providerで「現在のモデル: 未設定」を示す。credentialのない通常の「モデルを変更」はUIで無効にし、server側でもqualification前に拒否する。Credential OperatorのAPIキー＋モデル設定導線は残した。

## Repair evidence

証拠階層: production sourceとfake-provider focused試験 → production HTMLを読む合成browser → 生成配布物のbyte整合。これらはApps Scriptまたは実providerのruntime qualificationではない。

| 対象 | 結果 | 証拠 |
|---|---|---|
| Gemini公式形状候補 | PASS | `name=models/gemini-synthetic`、`baseModelId=gemini-synthetic`、表示名、base優先、name fallbackをadapter経由で検証。 |
| canonical保存・実効request | PASS | 候補と`models/gemini-synthetic`直接入力が同じbare IDとなり、policy、qualification、commit、既存provider request builderにbare IDを渡す。旧cacheと接頭辞付き既存profileの再保存も確認。OpenAI IDは保持。 |
| fresh admin | PASS | model policy 0件、両credential未設定、readbackによるsettings mutation 0。legacy saved OpenAI modelは表示される。 |
| model-only安全境界 | PASS | credential未設定時はqualification/commit各0。Credential Operator向けキー操作は別導線。 |
| browser変更状態 | PASS | 1440×900/390×844でfresh両モデル「未設定」、両model変更不可、operatorのみキー導線可、保存後のモデル表示と操作可能状態、Gemini bare候補、横scroll 0、console error 0。 `node tests/work0073-model-setup-browser.cjs`。 |
| focused regression | PASS | `node --test tests/ai-model-setup.test.cjs tests/ai-provider-admin.test.cjs`: 46/46。追加した3件は修正前に失敗した。 |
| repository check | PASS | `npm run check`: 752/752。`python tools/validate_agent_foundation.py`、`git diff --check`、`node scripts/build-company-multifile-package.cjs --check`もPASS。初回の`npm run check`は旧bundleのstale検出で止まり、source freeze後の再生成で解消した。 |

## Exact distribution

```text
TARGET_RELEASE: 0.2.4
TARGET_SCHEMA: 9
BACKEND_SHEETS: exactly 7
SOURCE_COMMIT: c73bb15d8566542ab598e3978869fea592a87a25
BUNDLE_FILE_SHA256: 01e3d541d536a0c68cc94405f1454f57c28e2d4db6c99e9949a9743e9ab9e464
BUNDLE_PAYLOAD_SHA256: 0d054b37f69426e2f9102811b36c65322ef90d30d5a130fbf4a6a4eace27b342
COMPANY_PACKAGE_GS_FILES: 7
COMPANY_PACKAGE_MAX_FILE_BYTES: 437412
```

`dist/release-manifest.json`、bundle、会社向け7-file package、独立した`scripts/build-company-multifile-package.cjs`のBASISをsource freezeへpinした。新sheet、migration、trigger、permission変更はない。

## Runtime and side effects

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: NOT_RUN
R1: NOT_RUN
R2: NOT_RUN
SIDE_EFFECT_STATE: DISABLED
REAL_PROVIDER_CALL_COUNT: 0
REAL_CREDENTIAL_READ_OR_WRITE_COUNT: 0
AI_INDEX_MUTATION_COUNT: 0
APPS_SCRIPT_SOURCE_SYNC: 0
DEPLOYMENT_UPDATE: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_COUNT: 0
BLOCKER: NONE_IN_CODEX_03_REPAIR; CHATGPT_FINAL_REVIEW_PENDING
READY: FOR_CHATGPT_REVIEW_ONLY
```

CODEX-02のClosed Evidenceは重大な反証がないため再審査していない。実API、実credential、Apps Script/Workspace、deployment、会社データには触れていない。Work0073のACCEPTED、merge、Completion Latchは行っていない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: OBS-0018
KNOWLEDGE_APPLIED: OBS-0018
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0073
DISPATCH_ID: 0073-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
