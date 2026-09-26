# Work 0072 CODEX-01 — Four-source Knowledge Search core report

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Outcome

Work0070の4-source authoritative record layerとWork0071のinteraction baselineを維持し、Knowledge Search、provider-neutral source resolution、citation/provenance、Full Outputを同じ`sourceTypes[]` scopeへ接続した。対象はMeeting、Pitchbook、News、Internal Assessmentである。News / Assessmentの複数Counterpartyは1件の原本に対するmembershipとして解決し、sourceやprovider documentをCounterparty別に複製しない。

このDispatchはprovider-disabled coreの実装・ローカル検証までを返す。Work0072のACCEPTED判定、company rollout、historical migration、Work0030 Azure transitionは行っていない。

## Contract and implementation

| Required field | Result |
|---|---|
| CANONICAL_SOURCE_TYPES | `Meeting`, `Pitchbook`, `News`, `Internal Assessment`の4件。共有descriptorから`面談メモ`、`保存資料`、`ニュース`、`評価（ICメモ、社内整理等）`を表示。 |
| SOURCE_TYPES_NORMALIZATION | top-level `sourceTypes[]`へcanonical順序・重複排除・1〜4件を正規化。空選択と未知値はvalidation error。fingerprint、audit、query、Full Outputは正規化後の配列を使用。 |
| LEGACY_SOURCE_TYPE_COMPAT | scalar `sourceType`は入力互換として受理し、内部のcanonical request/outputには残さない。 |
| AUTHORITATIVE_SOURCE_RESOLUTION | 4 IndexのActive原本から、選択sourceのORと日付・Entity・Asset Class等の独立条件のANDでstable source IDを事前解決。未選択IDをprovider scopeへ渡さず、provider filter上限を超える場合はfail closed。 |
| MULTI_COUNTERPARTY_RESOLUTION | News / Assessmentの`Counterparty_IDs` membershipでEntityを照合。複数一致しても同じ`NEWS-*` / `ASMT-*`を1件として返す。比較Full Outputへ選択Entity keysも引き継ぐ。 |
| ACTIVE_ONLY_RETRIEVAL | 通常query、citation map、Full OutputはActiveだけ。Inactiveは通常結果に入らない。 |
| KNOWLEDGE_SEARCH_UI | 4 checkboxへ変更。新規loadの既定はMeetingのみ。0選択時は送信不可とactionable message。過去sessionのsource選択は復元しない。pending/resultとFull Outputにsource scopeを表示。 |
| MEETING_ONLY_FILTER_COMPAT | Team、MTG種別、follow-up等は`["Meeting"]`のときのみ許可。競合時は説明してvalidation errorとし、選択checkboxを黙って変更しない。 |
| CITATION_PROVENANCE | 4-sourceともstable ID、原本Drive URL、日付、source label、source固有provenanceをauthoritative rowへ照合。曖昧・未選択・Inactive・URLとfile ID不一致はfail closed。Assessmentには「当時の社内評価」を保持し、外部事実として扱わない。 |
| FAKE_PROVIDER_QUERY_MATRIX | Meetingのみ、Pitchbookのみ、Newsのみ、Assessmentのみ、Meeting+News、4-source、multi-Counterparty、未選択citation、曖昧identity、source順序とfingerprint、scalar互換をfake adapterで検証。live callは0。 |
| FULL_OUTPUT_MEETING | authoritative Google Docの全文をprovider-independentに取得。 |
| FULL_OUTPUT_NEWS_DIRECT | `DIRECT_TEXT` Google Docの全文を取得。 |
| FULL_OUTPUT_ASSESSMENT_DIRECT | `DIRECT_TEXT` Google Docの全文を取得し、内部評価のprovenanceをsectionに表示。 |
| FULL_OUTPUT_TXT | 共有format registryを使い、TXT uploadの全文を取得。既存のdeterministic EML extractionとXLSX cell normalizationも再利用。 |
| FULL_OUTPUT_BINARY_SUPPORT | XLSXは既存cell normalizerの範囲で対応。PDF、PPTX、DOCXにprovider-independent deterministic materializerは確認できず、本文を省略して成功扱いしない。 |
| UNSUPPORTED_MATERIALIZATION | 選択原本が未対応形式ならpreview時点で`KNOWLEDGE_EXPORT_UNSUPPORTED_MATERIALIZATION`を返し、byte readやartifact作成へ進まない。対象source IDと拡張子を安全なerrorに含める。 |

Full Outputのpreview/copy/Google Docs/PDFは同じcanonical packageとfingerprintを使用する。source別sectionと原本provenanceを保持する。複数source向けのquery contextにはsource別の整理を促すが、モデルの書式だけに依存せずcitation metadataをアプリ側で表示する。

## Evidence and distribution

証拠の強さはauthoritative sourceとdeterministic test、local production-HTML browser、生成物parityの順に扱う。ローカルbrowserはApps Script target-runtime qualificationとは区別する。

| Required field | Evidence |
|---|---|
| RESPONSIVE_1440 | local production HTML + synthetic RPC PASS。初期Meetingのみ、mixed 4-source、Full Output同scope、overflow 0、page error 0、blocked request 0。 |
| RESPONSIVE_390 | 同上 PASS。overflow 0。 |
| RESPONSIVE_320 | 同上 PASS。overflow 0。 |
| WORK0071_UX_REGRESSION | stable interaction browser PASS（1440/390/320、200% zoom、reduced motion、keyboard、invalid submit RPC 0）。Phase B browserも3幅でfocus continuityとinvalid edit RPC 0を確認。 |
| LOGIC_VALIDATION | focused core/export/package 44/44 PASS。citation関連 71/71 PASS。`python tools/validate_agent_foundation.py` PASS。`npm run check` 730/730 PASS。`git diff --check` PASS。 |
| BUNDLE_VALIDATION | release `0.2.3`、schema `9`、67 server sources / 24 HTML resources。source commit `32f120eca8b1d94822c00762e59f4b202a7f1465`をfreeze。bundle file SHA-256 `60799e8afef33f29477a02924e40121fb384b522c7564029ffcb13dc1baf38fc`、canonical payload SHA-256 `009e99f3dab080ff3cc0a6c589f4823bb8c3a22731f35ea82a978c58b1e051c6`。 |
| MULTIFILE_PACKAGE_PARITY | 独立BASISがsource commit・file hash・payload hashをpin。7件の`.gs` raw連結がbundleとbyte-identical。`.txt` transportとmanifestも検証。最大part 426,734 bytes。 |
| TARGET_RUNTIME_QUALIFICATION | NOT RUN。source sync、immutable version、deployment update、Workspace/API/provider runtime確認はいずれも0。今回の認可範囲はpure request/filter/render logicのlocal検証まで。 |
| PROVIDER_CALL_COUNT | 0 |
| AI_INDEX_MUTATION_COUNT | 0 |
| COMPANY_DATA_MUTATION_COUNT | 0 |
| USER_NATIVE_ACTION_COUNT | 0 |
| BLOCKER | CODEX-01のreview packageにblockerなし。未対応binaryを含むFull Outputは仕様どおり個別requestでhard-stop。 |
| FOLLOW_UP | PDF/PPTX/DOCXのprovider-independent全文materializerを、synthetic filesと上限付きの別Dispatchで形式ごとに設計・検証する。XLSXは既存cell抽出であり、図形・画像・コメント・未計算式等の意味情報の完全性は別途評価する。live provider/Apps Scriptのqualificationが必要ならChatGPTが独立した認可境界を設定する。 |
| READY | CODEX-01はChatGPT final diff/evidence reviewへ返却可能。company runtime/rollout readinessは未判定。Work0072は未ACCEPTED。 |

schema9とBackend exactly 7 sheetsを維持し、新しいsheet・migration・trigger・permission変更はない。company production、confidential data、indexing/billing、physical deleteには触れていない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, OBS-0015
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, OBS-0015
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
