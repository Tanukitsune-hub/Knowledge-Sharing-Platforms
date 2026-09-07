"""Design用JSの最小DOM回帰検証。全画面visual/Apps Script認定ではない。
既存Python Playwright/Chromiumを使用し、依存追加・外部通信は行わない。
例: python verify-controller-regressions.py --scripts .. --output controller-results.json
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

LABELS = {'GP': 'サンプルGP', 'LP': 'サンプルLP', 'NLI': '日本生命', 'GROUP': 'グループ会社', 'CONSULTANT': 'Consultant', 'OTHER': 'その他'}

def search_html():
    options = '<option value="">すべて</option>' + ''.join(f'<option value="{k}:A">{v}</option>' for k, v in LABELS.items())
    fields = ''.join(f'<div data-source-control="{k}"><select><option>未選択</option></select></div>' for k in ['asset', 'equity', 'team', 'strategy', 'followup', 'relatedGp', 'meetingType'])
    return f'''<!doctype html><html lang="ja"><title>検索JSの分離検証</title><form id="search-demo">
<select id="search-counterparty">{options}</select><select id="search-source"><option value="">面談記録・資料</option><option value="Meeting">面談記録のみ</option><option value="Pitchbook">資料のみ</option></select>
<input id="search-from" type="date"><input id="search-to" type="date"><input id="all-period" type="checkbox">
<select id="search-mode"><option value="free">自由質問</option><option value="summary">要約</option><option value="timeline">時系列</option><option value="compare">比較</option><option value="prep">面談準備</option></select>
<select id="knowledge-visible-model"><option value="APPROVED_OPENAI_PROFILE">許可済みモデル</option><option value="">未設定</option></select>
<textarea id="search-question" required></textarea><span id="question-required">必須</span><p id="question-help"></p>
<div id="compare-context" hidden><select id="compare-entities" multiple>{options}<option value="GP:B">GP B</option></select></div><p id="prep-context" hidden></p>
{fields}<select id="export-scenario"><option value="success">通常</option><option value="empty">0件</option><option value="limit">上限</option><option value="read-fail">読出し失敗</option></select>
<button type="submit" id="search-run">検索</button><button type="button" id="full-export-run">全文出力</button><button type="button" id="search-clear">条件をクリア</button>
</form><p id="search-status"></p><section id="search-answer" hidden></section><section id="export-answer" hidden></section></html>'''

def record_html(kind='past'):
    opts = ''.join(f'<option value="{k}">{v}</option>' for k, v in LABELS.items())
    controls = '''<input id="record-files" type="file" multiple><p id="selected-files"></p>
<select id="existing-document"><option value="DOC-000201">共有資料</option><option value="DOC-000202">Inactive資料</option></select>
<button type="button" data-record-action="sample-files">架空ファイル</button><button type="button" data-record-action="existing">既存選択</button>
<select id="record-scenario"><option value="success">通常</option><option value="parent-fail">親失敗</option><option value="file-fail">file失敗</option><option value="link-fail">link失敗</option></select><button type="button" data-record-action="reset">初期化</button>'''
    if kind == 'past':
        content = '''<span id="parent-list-state">有効</span><span id="lp-list-state">有効</span><span id="parent-detail-state">有効な記録</span>
<div><span id="detail-id">MTG-000101</span> / 2026-08-25 / 14:00</div><span id="detail-entity"></span><p id="meeting-body">変更しない原文</p>
<button type="button" data-record-action="parent-toggle">記録を削除</button><button type="button" data-record-action="original">原本</button><a href="07-meeting-edit.html">編集</a>
<details id="original-preview"><summary>原本</summary></details><div id="related-table"></div><button type="button" data-record-action="add-files">資料を追加</button>
<details id="followup-files" open><summary>資料追加</summary>''' + controls + '''<button type="button" data-record-action="followup">この記録に追加</button></details>
<details id="classification" open><summary>分類</summary><input id="file-class-date" type="date" value="2026-08-20"><select id="file-class-asset"><option>Infrastructure</option></select><select id="file-class-capital"><option>Equity</option><option>Debt</option></select><input id="file-class-strategy" value="元の戦略"><button type="button" data-record-action="classification">分類変更</button><p id="classification-state"></p></details><p id="record-feedback"></p>'''
    else:
        content = f'''<p>登録フォーム</p><form id="record-form"><input type="date" value="2026-08-25" required><select id="record-type">{opts}</select><select id="record-entity"><option value="GP:A">サンプルGP</option></select><select id="record-related-gp" multiple><option value="GP:A" selected>サンプルGP</option></select>{controls}<button type="submit">登録</button></form>'''
    return '<!doctype html><html lang="ja"><title>記録JSの分離検証</title>'+content+'''<section id="record-progress" hidden><p id="record-status"></p><div id="record-results"></div><button type="button" data-record-action="retry">再試行</button></section></html>'''

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--scripts', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--chromium', default='/usr/bin/chromium')
    args = parser.parse_args()
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=args.chromium, headless=True, args=['--no-sandbox'])
        def case(name, script, html, fn, query=''):
            context = browser.new_context(viewport={'width':1366,'height':768})
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: errors.append(m.text) if m.type in ['error','warning'] else None)
            context.route('**/*', lambda route: route.abort())
            try:
                page.goto('about:blank'+query)
                page.set_content(html)
                page.add_script_tag(content=(args.scripts/script).read_text())
                fn(page)
                assert not errors, errors
                results.append({'case': name, 'result': 'PASS'})
            except Exception as error:
                results.append({'case': name, 'result': 'FAIL', 'detail': str(error)[:700], 'console': errors})
            finally:
                context.close()
        def button(p, action):
            p.locator(f'[data-record-action="{action}"]').click()
        def ready_search(p, source=''):
            p.locator('#all-period').check();p.locator('#search-counterparty').select_option('LP:A');p.locator('#search-source').select_option(source);p.locator('#search-question').fill('確認')
        def only_meeting(p):
            ready_search(p, 'Meeting');p.locator('#search-run').click()
            text=p.locator('#search-answer').inner_text();assert 'DOC-SYNTHETIC' not in text, text
            assert 'MTG-SYNTHETIC' in text
        case('source-meeting-excludes-pitchbook', 'search-demo.js', search_html(), only_meeting)
        def only_pitch(p):
            ready_search(p,'Pitchbook');p.locator('#search-run').click();text=p.locator('#search-answer').inner_text();assert 'DOC-SYNTHETIC' in text and 'MTG-SYNTHETIC' not in text
        case('source-pitchbook-excludes-meeting','search-demo.js',search_html(),only_pitch)
        def both(p):
            ready_search(p);p.locator('#search-run').click();text=p.locator('#search-answer').inner_text();assert 'DOC-SYNTHETIC' in text and 'MTG-SYNTHETIC' in text
        case('source-both-shows-both','search-demo.js',search_html(),both)
        def restricted(p, source, field):
            ready_search(p,source);p.locator(f'[data-source-control="{field}"] select').select_option(index=1);p.locator('#search-run').click()
            assert p.locator('#search-answer').is_hidden(), p.locator('#search-answer').inner_text()
            assert 'Meeting専用' in p.locator('#search-status').inner_text()
        case('related-gp-pitchbook-rejected','search-demo.js',search_html(),lambda p:restricted(p,'Pitchbook','relatedGp'))
        case('mixed-team-rejected','search-demo.js',search_html(),lambda p:restricted(p,'','team'))
        def auto_meeting(p):
            ready_search(p);p.locator('[data-source-control="relatedGp"] select').select_option(index=1);p.locator('#search-run').click()
            assert 'DOC-SYNTHETIC' not in p.locator('#search-answer').inner_text()
            assert p.locator('#search-source').input_value()==''
        case('related-gp-default-scope-is-meeting','search-demo.js',search_html(),auto_meeting)
        def invalidates(p):
            ready_search(p);p.locator('#search-run').click();assert p.locator('#search-answer').is_visible()
            p.locator('#knowledge-visible-model').select_option('');assert p.locator('#search-answer').is_hidden()
        case('changed-condition-invalidates-old-result','search-demo.js',search_html(),invalidates)
        def export(p):
            ready_search(p,'Pitchbook');p.locator('#search-question').fill('');p.locator('#knowledge-visible-model').select_option('')
            p.locator('#full-export-run').click();assert '対象：1件' in p.locator('#export-answer').inner_text()
            assert p.locator('#search-question').input_value()=='' and p.locator('#knowledge-visible-model').input_value()=='' and p.locator('#search-source').input_value()=='Pitchbook'
        case('empty-question-no-ai-export-preserved','search-demo.js',search_html(),export)
        def invalid_date(p):
            p.locator('#search-from').fill('2026-09-09');p.locator('#search-to').fill('2026-09-08');p.locator('#full-export-run').click()
            assert p.locator('#export-answer').is_hidden() and '開始日' in p.locator('#search-status').inner_text()
        case('export-invalid-dates-rejected','search-demo.js',search_html(),invalid_date)
        def parent_guard(p, action):
            if action=='classification': p.locator('[data-record-action="edit-class"]').first.click()
            button(p,'parent-toggle');before=p.locator('#related-table').inner_text();before_class=p.locator('#classification-state').inner_text()
            p.locator(f'[data-record-action="{action}"]').first.click()
            assert p.locator('#related-table').inner_text()==before
            assert p.locator('#classification-state').inner_text()==before_class
            assert '削除済み' in p.locator('#record-feedback').inner_text()
        case('inactive-parent-blocks-unlink','record-demo.js',record_html(),lambda p:parent_guard(p,'unlink'))
        case('inactive-parent-blocks-classification','record-demo.js',record_html(),lambda p:parent_guard(p,'classification'))
        def reset(p):
            p.locator('[data-record-action="unlink"]').first.click();button(p,'parent-toggle');button(p,'reset');button(p,'sample-files');button(p,'followup')
            assert '新規親作成 0件 / ファイル登録 2件' in p.locator('#record-status').inner_text()
            assert '関連あり' in p.locator('#related-table tr').nth(1).inner_text()
        case('reset-restores-parent-and-link-state','record-demo.js',record_html(),reset)
        def invalid_file(p):
            p.locator('#record-files').set_input_files({'name':'invalid.exe','mimeType':'application/octet-stream','buffer':b'x'})
            p.locator('button[type=submit]').click();assert p.locator('#record-progress').is_hidden()
            assert '登録は開始' in p.locator('#selected-files').inner_text()
        case('invalid-file-does-not-report-success','record-demo.js',record_html('add'),invalid_file)
        def two_batches(p):
            button(p,'sample-files');button(p,'followup');button(p,'sample-files');button(p,'followup')
            ids=p.locator('#related-table').inner_text();assert 'DOC-DEMO-003' in ids and 'DOC-DEMO-004' in ids
            assert '新規親作成 0件' in p.locator('#record-status').inner_text()
        case('second-batch-distinct-ids-same-parent','record-demo.js',record_html(),two_batches)
        def retry(p, scenario):
            button(p,'sample-files');p.locator('#record-scenario').select_option(scenario);button(p,'followup')
            text=p.locator('#record-results').inner_text();assert 'DOC-DEMO-002' in text and '未完了' in text
            button(p,'retry');assert 'ファイル登録 2件' in p.locator('#record-status').inner_text()
            assert p.locator('#related-table').inner_text().count('DOC-DEMO-002')==1
        case('file-retry-same-ids','record-demo.js',record_html(),lambda p:retry(p,'file-fail'))
        case('link-retry-same-ids','record-demo.js',record_html(),lambda p:retry(p,'link-fail'))
        def inactive_undo(p):
            row=p.locator('#related-table tr').filter(has_text='DOC-000202');row.locator('[data-record-action=unlink]').click();row.locator('[data-record-action=unlink]').click()
            assert 'Inactive（既存状態）' in row.inner_text() and '関連あり' in row.inner_text()
        case('inactive-document-unlink-undo-retains-inactive','record-demo.js',record_html(),inactive_undo)
        def new_lp_url(p):
            assert p.locator('#record-entity').input_value()=='LP:A'
            assert '登録フォーム' in p.locator('body').inner_text()
        case('new-lp-query-has-no-null-link-error','record-demo.js',record_html('add'),new_lp_url,'?entity=LP')
        browser.close()
    data={'scope':'Design JSの最小DOM / 実Chromium検証。全画面visualまたは本番認定ではない。','cases':results,'passed':sum(r['result']=='PASS' for r in results),'total':len(results),'targetRuntime':'NOT RUN','fullVisualComparison':'NOT RUN','npmCheck':'NOT RUN / original Codex evidence kept separately'}
    args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'passed':data['passed'],'total':data['total'],'failures':[x['case'] for x in results if x['result']=='FAIL']},ensure_ascii=False))
    if data['passed'] != data['total']:
        raise SystemExit(1)

if __name__=='__main__':
    main()
