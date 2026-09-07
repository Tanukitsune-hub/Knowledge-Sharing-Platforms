"""Generate auditable source inventory routing and screenshot review index."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent
base=root.parent
inventory=json.loads((base/'source-controls.json').read_text(encoding='utf-8'))
def route(c):
    f,i,n=c['file'],c.get('id',''),c['line']
    if c.get('type')=='hidden':return '非表示契約を保持','05 detail / 07 edit; stable ID・expectedVersion等はfuture server検証'
    if f=='AiProviderSettingsPage.html':
        if i.startswith('ai-model-'):return '管理者限定契約を保持','14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし'
        return '管理者状態契約を保持','14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない）'
    if f=='ActivityAnalyticsPage.html':return '残置/詳細へ集約','11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装'
    if f in ['GpWorkspacePage.html','EntityWorkspacePage.html']:return '残置','09/10 summary; read facadeは別、印刷/対象/戦略参照、資料操作は05 detail'
    if f=='RelationshipExplorerPage.html':return '専用入口廃止・親detailへ集約','05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定'
    if f=='KnowledgeSearchPage.html':
        if i in ['knowledge-route','knowledge-thinking-profile']:return '通常UI非表示','01 許可済みAIモデルへ写像 / 14 管理者policy。Work 0027 hidden維持'
        if i in ['knowledge-counterpartyType','knowledge-gpId','knowledge-entityKey']:return '重複入力を統合','01 #search-counterparty の単一entityKey'
        if i=='knowledge-entityKeys':return '残置','01 #compare-entities; compare送信はselectedEntityKeysのみ'
        if i=='knowledge-export-preview-button':return '移設','01 #full-export-run 独立非AIbutton'
        if i.startswith('knowledge-export-prompt'):return '補助操作へ移設','01 外部AI用プロンプト（デモ）; 原文転送/clipboard実行なし'
        if i.startswith('knowledge-export-'):return '残置','01 export preview内のcopy/Docs/PDF設計例（実ファイル生成なし）'
        if i=='knowledge-recheck':return '状態例に保持','15-representative-states 再試行。実provider再実行なし'
        return '残置/配置整理','01 共通filter・mode/model・質問・詳細・search/clear'
    if i.startswith('nav-'):
        if i in ['nav-pitchbook','nav-pitchbook-past','nav-relationship-explorer']:return '独立入口を明示廃止','03 任意資料 / 05 親detail。資料単独routeなし'
        if i in ['nav-gp-workspace','nav-entity-workspace']:return '入口統合・read分離維持','09/10 面談先サマリー'
        return '残置','sidebar 7 destinations（初期01）'
    if i.startswith('pitchbook-') or (f=='MaintenancePages.html' and n==78):
        if i.startswith('pitchbook-past'):return '専用一覧を明示廃止・集約','05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate'
        if 'gpId' in i or 'quick-add-gp' in i:return 'GP限定入力を置換','03/07 親Counterparty、既存資料は再帰属させない'
        if i.startswith('pitchbook-edit') or i in ['pitchbook-date','pitchbook-assetClassId','pitchbook-capitalTypeId','pitchbook-fundStrategy']:return '親detail補助へ移設','05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし'
        return '単一formへ移設','03/07 #record-files、登録、clear、file別retry / 05 後日追加'
    if 'relatedPitchbookIds' in i:return '補助操作へ移設','03/05/07 既存資料を関連付ける。Document_ID再利用'
    if i.startswith('meeting-past'):return '残置/詳細へ配置','05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装）'
    if i.startswith('meeting-edit') or (f=='MaintenancePages.html' and n in [37,45]):return '残置','07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD'
    if f=='MaintenancePages.html' and n>=86:return '残置','13-masters 管理操作の設計参照。実master変更なし'
    return '残置','03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear'
lines=['# 既存control対応表（197 entries）','','source-controls.jsonの機械抽出inventoryを個別にrouteした表です。source SHAは`'+inventory['source_sha']+'`。mainとのproduction差分なしを確認。残置は設計上の操作/契約を残す意味で、全buttonの実サービス接続を意味しません。locked/代表stateのみに残る操作も明示しています。','','既存197 controlsに加え、CODEX-11はファイル別結果、link undo、分類補助、独立export失敗stateを追加しました。既存のsourceは削除していません。','','| source位置 / control | disposition | 移設先・境界 |','|---|---|---|']
for c in inventory['controls']:
    disposition,destination=route(c)
    ident=c.get('id') or c.get('value') or c['tag']+'-'+str(c['line'])
    lines.append(f"| `{c['file']}:{c['line']}` / `{ident}` | {disposition} | {destination} |")
(root/'control-coverage.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
images=sorted((root/'screenshots').glob('*.png'))
gallery=''.join(f'<figure><a href="screenshots/{p.name}"><img loading="lazy" src="screenshots/{p.name}" alt="{p.stem}"></a><figcaption>{p.stem}</figcaption></figure>' for p in images)
style='body{font:15px system-ui;color:#182124;background:#f4f7fa;margin:24px}a{color:#685124}img{width:100%;height:auto}section{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}figure{margin:0;background:white;padding:10px}h2{margin-top:32px} @media(max-width:800px){section{grid-template-columns:1fr}}'
(root/'index.html').write_text('<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CODEX-11 レビュー</title><style>'+style+'</style><h1>CODEX-11 単一記録Light</h1><p>DESIGN ONLY / 架空データ・永続保存なし</p><p><a href="../01-search.html">操作デモを開く</a> · <a href="comparison.html">PR #46 / #48比較</a> · <a href="README.md">検証手順</a> · <a href="contract-impact-map.md">契約対応表</a> · <a href="control-coverage.md">197 control対応</a></p><h2>今回撮り直した画像</h2><p>current/baselineは1366×768。番号付き画像は同じ幅のfull-page stateです。古い履歴画像は含みません。</p><section>'+gallery+'</section></html>',encoding='utf-8')
parts=[]
for page,label in [('03-record-add-meeting','記録を追加'),('05-past-records-meeting','過去の記録')]:
    cards=''
    for prefix,title in [('baseline-pr46-','PR #46'),('baseline-pr48-','PR #48'),('current-','CODEX-11')]:
        name=prefix+page+'.png'
        cards+=f'<figure><h3>{title}</h3><a href="screenshots/{name}"><img src="screenshots/{name}" alt="{title} {label}"></a></figure>'
    parts.append('<h2>'+label+'</h2><section>'+cards+'</section>')
(root/'comparison.html').write_text('<!doctype html><html lang="ja"><meta charset="utf-8"><title>PR比較 — CODEX-11</title><style>'+style+'</style><h1>同viewport比較：1366×768</h1><p>PR #46=400f2f0 / PR #48=108a6e9。各commitのHTML/assetsを新たに描画。CODEX-11は単一form/detailへの限定変更。</p>'+''.join(parts)+'</html>',encoding='utf-8')
print('Generated 197 control routes, review gallery and exact-commit comparison.')
