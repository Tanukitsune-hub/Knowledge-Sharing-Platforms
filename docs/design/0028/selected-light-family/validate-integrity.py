"""CODEX-11 acceptance invariants for generated static surfaces, not runtime proof."""
from pathlib import Path
import json
import re

root=Path(__file__).resolve().parent
manifest=json.loads((root/'page-manifest.json').read_text(encoding='utf-8'))
names=[p['file'] for p in manifest['pages']]
assert len(names)==len(set(names))==12
nav_expected=['ナレッジ検索','記録を追加','過去の記録','面談先サマリー','面談実績の集計','プルダウンの管理','管理者ページ']
for name in names:
    text=(root/name).read_text(encoding='utf-8')
    nav=re.search(r'<nav>(.*?)</nav>',text,re.S)[1]
    assert re.findall(r'<span class="nav-label">(.*?)</span>',nav)==nav_expected,name
    assert nav.count('class="active"')==1,name
    assert nav.count('class="nav-separator"')==1,name
    for href in re.findall(r'href="([^"#]+\.html)(?:#[^"]*)?"',text):
        assert (root/href).exists(),(name,href)
    allowed={'01-search.html':['search-demo.js'],'03-record-add-meeting.html':['record-demo.js'],'05-past-records-meeting.html':['record-demo.js'],'07-meeting-edit.html':['record-demo.js'],'14-mode-settings.html':['admin-demo.js']}.get(name,[])
    assert re.findall(r'<script[^>]*src="([^"]+)"',text)==allowed,name
for name in ['03-record-add-meeting.html','05-past-records-meeting.html','07-meeting-edit.html']:
    text=(root/name).read_text(encoding='utf-8')
    for forbidden in ['class="subtabs"','DATA_RECEIPT','記録種別','データ受領','<h2>登録順序</h2>']:
        assert forbidden not in text,(name,forbidden)
for name in ['04-record-add-pitchbook.html','06-past-records-pitchbook.html','08-pitchbook-edit.html']:
    assert not(root/name).exists(),name
add=(root/'03-record-add-meeting.html').read_text(encoding='utf-8')
assert add.count('<form ')==1
for code in ['GP','LP','NLI','GROUP','CONSULTANT','OTHER','ANNUAL_REVIEW','OFFICE_VISIT','ANNUAL_GENERAL_MEETING']:
    assert f'value="{code}"' in add,code
for label in ['関連GP','フォローアップメモ','既存資料を関連付ける','登録</button>']:
    assert label in add,label
past=(root/'05-past-records-meeting.html').read_text(encoding='utf-8')
for label in ['記録本文','面談原本を開く','記録を削除','資料の分類を編集','Meeting_Index.Related_Pitchbook_IDs']:
    assert label in past,label
search=(root/'01-search.html').read_text(encoding='utf-8')
assert search.count('data-contract="entityKey"')==1
assert 'id="prep-target"' not in search
assert 'value="FULL_EXPORT"' not in search
assert search.index('id="search-run"')<search.index('id="full-export-run"')<search.index('id="search-clear"')
analytics=(root/'11-analytics.html').read_text(encoding='utf-8').split('<div class="analytics-list">')[1]
assert re.findall(r'<th>(.*?)</th>',analytics)==['日付','面談先','Asset Class','Team','原資料','年1回面談','オフィス訪問','年次総会','確認済み']
for codes,row in re.findall(r'<tr data-meeting-type-codes="([^"]+)">(.*?)</tr>',analytics,re.S):
    cells=re.findall(r'<td>(.*?)</td>',row,re.S)
    assert len(cells)==9
    assert cells[5:8]==['○' if code in codes.split(',') else '—' for code in ['ANNUAL_REVIEW','OFFICE_VISIT','ANNUAL_GENERAL_MEETING']]
for script in ['record-demo.js','search-demo.js','admin-demo.js']:
    text=(root/script).read_text(encoding='utf-8')
    assert not re.search(r'fetch\s*\(|XMLHttpRequest|google\.script|localStorage|sessionStorage|FileReader|\.arrayBuffer\s*\(',text),script
css=(root/'family.css').read_text(encoding='utf-8')
assert '--sidebar-base:#182124' in css and '--paper:#F4F7FA' in css
assert css.upper().count('#E1001F')==1
assert 'prefers-color-scheme' not in css
print('PASS: CODEX-11 12 surfaces, retained controls, single record flow, export separation, 9-column analytics, no external services')
