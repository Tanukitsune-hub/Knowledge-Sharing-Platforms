"""Source-independent acceptance assertions for the CODEX-10 design artifact."""
from pathlib import Path
import re
import subprocess
import sys

root = Path(__file__).resolve().parent
subprocess.run([sys.executable, str(root/'validate-light-only-polish.py')], check=True)
search = (root/'01-search.html').read_text(encoding='utf-8')
required_order = ['for="search-counterparty"','for="search-source"','for="search-from"','for="search-to"','id="all-period"','for="search-mode"','for="knowledge-visible-model"','for="search-question"']
assert [search.index(x) for x in required_order] == sorted(search.index(x) for x in required_order)
for text in ['面談先','GP / 運用会社','LP / Asset Owner','日本生命','グループ会社','Consultant / Gatekeeper','面談記録・資料','面談記録のみ','資料のみ','2023-09-07','2026-09-07','AIモデル','全文出力','面談記録のみ · AIなし','詳細条件','2〜5件','面談準備の対象']:
    assert text in search, text
assert '資料の種類' not in search and '使用モデル' not in search
assert 'id="search-counterparty" data-contract="entityKey"' in search
assert 'id="full-export-run"' in search and 'data-action="knowledge-export"' in search
assert 'value="FULL_EXPORT"' not in search and '全文出力（AIを使わない）' not in search
export = search.split('<section id="export-answer"', 1)[1]
for text in ['Google Docs本文（権威ソース）','Meeting-only / AIなし','Related Pitchbook IDs','保存済みMeeting属性','MTG-000101']:
    assert text in export, text
assert 'Pitchbook DOC-000201' not in export and '原資料リンク' not in export
record_add = (root/'03-record-add-meeting.html').read_text(encoding='utf-8')
for text in ['面談記録','面談','親Meetingを先に登録','Meeting_ID','関連資料（任意）','親Meetingの作成に失敗した場合','standalone Pitchbook route']:
    assert text in record_add, text
for text in ['記録種別','DATA_RECEIPT','データ受領','受領資料（必須）','受領背景メモ','親記録を先に登録']:
    assert text not in record_add, text
assert 'class="subtabs"' not in record_add
past = (root/'05-past-records-meeting.html').read_text(encoding='utf-8')
for text in ['記録一覧','面談','関連資料 3件','資料を追加','削除（紐付け解除）','Meeting_Index.Related_Pitchbook_IDs','PITCHBOOK_NOT_FOUND']:
    assert text in past, text
for text in ['記録種別','データ受領','資料→関連面談']:
    assert text not in past, text
assert 'class="subtabs"' not in past and '資料→関連面談' not in past
assert not (root/'04-record-add-pitchbook.html').exists()
assert not (root/'06-past-records-pitchbook.html').exists()
assert not (root/'08-pitchbook-edit.html').exists()
analytics = (root/'11-analytics.html').read_text(encoding='utf-8').split('<div class="analytics-list">')[1]
headers = re.findall(r'<th>(.*?)</th>',analytics)
assert headers == ['日付','面談先','Asset Class','Team','原資料','年1回面談','オフィス訪問','年次総会','確認済み'], headers
rows = re.findall(r'<tr data-meeting-type-codes="([^"]+)">(.*?)</tr>',analytics,re.S)
assert len(rows) == 3
for codes, row in rows:
    cells = re.findall(r'<td>(.*?)</td>',row,re.S)
    assert len(cells)==9
    expected = ['○' if c in codes.split(',') else '—' for c in ['ANNUAL_REVIEW','OFFICE_VISIT','ANNUAL_GENERAL_MEETING']]
    assert cells[5:8] == expected
    assert 'updateMeetingAdminCheck' in cells[-1]
assert rows[0][0] == 'ANNUAL_REVIEW,OFFICE_VISIT'
assert 'Fund / Strategy' not in analytics
admin = (root/'14-mode-settings.html').read_text(encoding='utf-8')
for text in ['削除・無効化不可','プリセットを追加','表示名','固定質問 / 指示文','表示順','stable mode ID','authoritative fixedPrompt']:
    assert text in admin,text
for script in ['search-demo.js','admin-demo.js']:
    text = (root/script).read_text(encoding='utf-8')
    assert not re.search(r'fetch\s*\(|XMLHttpRequest|google\.script|localStorage|sessionStorage',text),script
print('PASS: CODEX-10 entity selector, dedicated Meeting-only export action, Meeting-only record-centric IA, 9-column fixture, protected preset and no-network boundaries')
