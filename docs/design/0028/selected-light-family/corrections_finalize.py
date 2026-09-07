"""Generate CODEX-10 derived design artifacts; no production imports or mutations."""
import json
import re


def finalize(out, source, pages):
    types = ['ANNUAL_REVIEW', 'OFFICE_VISIT', 'ANNUAL_GENERAL_MEETING']
    fixtures = [types[:2], [types[1]], [types[2]]]
    for name in ['11-analytics.html', '11-analytics-capture.html']:
        html = (out/name).read_text(encoding='utf-8')
        start = html.index('<div class="analytics-list">')
        segment = html[start:]
        segment = segment.replace('<th>Team / 面談種別</th><th>Fund / Strategy</th><th>原資料</th><th>確認済み</th>', '<th>Team</th><th>原資料</th><th>年1回面談</th><th>オフィス訪問</th><th>年次総会</th><th>確認済み</th>')
        rows = re.findall(r'<tr>(.*?)</tr>', segment, re.S)[1:4]
        for row, codes in zip(rows, fixtures):
            cells = re.findall(r'<td>(.*?)</td>', row, re.S)
            cells[3] = 'サンプルチーム'
            final_cells = cells[:4] + [cells[5]] + [('○' if code in codes else '—') for code in types] + [cells[6]]
            replacement = '<tr data-meeting-type-codes="'+','.join(codes)+'">'+''.join('<td>'+c+'</td>' for c in final_cells)+'</tr>'
            segment = segment.replace('<tr>'+row+'</tr>', replacement)
        html = html[:start] + segment
        (out/name).write_text(html,encoding='utf-8')
    states = out/'15-representative-states.html'
    text = states.read_text(encoding='utf-8').replace('Pitchbook DOC-000201 / 原資料リンク', '面談原文のみ（資料本文・資料リンクは対象外）')
    states.write_text(text,encoding='utf-8')
    (out/'page-manifest.json').write_text(json.dumps({'source_sha':source,'pages':pages},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    index = '<!doctype html><html lang="ja"><meta charset="utf-8"><title>CODEX-10 Light</title><link rel="stylesheet" href="family.css"><body class="family-index" style="padding:30px"><h1>CODEX-10 · Knowledge Search action corrections</h1><p>設計参照・架空データ。画面内の操作デモのみ。永続保存・サーバー通信はありません。</p><p><a href="action-corrections/index.html">最新スクリーンショット・比較・検証</a></p><p><a href="light-only-final-polish/index.html">CODEX-09 Light baseline</a></p><ol>'
    index += ''.join('<li><a href="'+p['file']+'">'+p['title']+'</a></li>' for p in pages)
    (out/'index.html').write_text(index+'</ol></body></html>\n',encoding='utf-8')
