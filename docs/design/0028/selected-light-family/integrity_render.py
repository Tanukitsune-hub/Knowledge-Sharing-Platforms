"""CODEX-11 design-only surfaces; generated HTML uses local synthetic state only."""
import json
import re


def render_integrity(out, source, pages, page, card, grid, field, table, meeting_input):
    types = [('GP', 'GP / 運用会社'), ('LP', 'LP / Asset Owner'), ('NLI', '日本生命'), ('GROUP', 'グループ会社'), ('CONSULTANT', 'Consultant / Gatekeeper'), ('OTHER', 'その他')]
    options = ''.join(f'<option value="{code}">{label}</option>' for code, label in types)
    counterparty = '<div class="counterparty-inline-row"><div><label for="record-type">面談先区分</label><select id="record-type">'+options+'</select></div><div><label for="record-entity">面談先</label><select id="record-entity"><option value="GP:A">サンプルGP</option></select></div><button type="button" data-record-action="quick-add">未登録の面談先を追加</button></div>'
    meeting_input = re.sub(r'<div class="counterparty-inline-row">.*?</button></div>', counterparty, meeting_input)
    meeting_input += '<details><summary>関連GP（任意）</summary><label for="record-related-gp">関連GP</label><select id="record-related-gp" multiple><option value="GP:A" selected>サンプルGP</option><option value="GP:B">サンプルGP B</option></select></details>'
    meeting_input = meeting_input.replace('type="date"', 'type="date" required')
    files = '''<div class="record-file-panel"><h3>関連資料（任意）</h3>
<label for="record-files">新しいファイルを選択</label><input id="record-files" type="file" multiple accept=".pdf,.pptx,.xlsx,.docx,.txt,.eml">
<p class="hint">25MB/ファイル・10件・合計100MB。デモは名前とサイズだけ表示し、内容は読み取りません。記録の保存後に資料を登録します。</p>
<p id="selected-files" role="status">ファイル未選択</p><button type="button" data-record-action="sample-files">架空の2ファイルを選択</button>
<details><summary>既存資料を関連付ける</summary><label for="existing-document">既存資料</label><select id="existing-document"><option value="DOC-000201">DOC-000201 / 共有資料.pdf</option><option value="DOC-000202">DOC-000202 / 既存Inactive資料.pdf</option></select><button type="button" data-record-action="existing">関連付け候補に追加</button><p class="hint">既存Document_IDを使います。新しいuploadや分類の上書きは行いません。</p></details></div>'''
    demo_controls = '''<details class="demo-controls"><summary>検証用デモ設定（架空データ）</summary><label for="record-scenario">登録結果の例</label><select id="record-scenario"><option value="success">すべて成功</option><option value="parent-fail">記録の保存失敗</option><option value="file-fail">2件目のファイル保存失敗</option><option value="link-fail">2件目の関連付け失敗</option></select><button type="button" data-record-action="reset">デモを初期化</button></details>'''
    progress = '<section id="record-progress" class="card" hidden aria-live="polite"><h2>登録状況</h2><p id="record-status"></p><div id="record-results"></div><button type="button" data-record-action="retry">失敗分を再試行</button><a href="05-past-records-meeting.html">過去の記録へ</a></section>'
    add = '<form id="record-form">'+card('基本情報・記録', meeting_input)+card('資料', files)+demo_controls+'<div class="editor-footer"><button class="primary" type="submit">登録</button> <button type="button" data-record-action="reset">下書きをクリア</button></div></form>'+progress
    page('03-record-add-meeting', '記録を追加', '内容と関連資料を、ひとつのフォームから登録する。', add+'<script src="record-demo.js" defer></script>')
    filters = grid([field('開始日', '2026-08-01', 'date'), field('終了日', '2026-09-08', 'date'), field('面談先', 'すべて')], 'three')+'<details><summary>詳細条件（任意）</summary>'+grid([field(x) for x in ['面談先区分', '関連GP', 'Asset Class', 'Equity / Debt', 'Team', 'Fund / Strategy', 'Meeting Type', '状態']], 'three')+'</details>'
    filters += '<label><input type="checkbox" id="past-followup-only">要フォローのみ</label><button type="button" data-record-action="filter">検索</button><p id="filter-status" role="status"></p>'
    rows = [['2026-08-25 / MTG-000101', 'サンプルGP', 'Infrastructure / サンプル戦略', '<span id="parent-list-state">有効</span>', '<a href="05-past-records-meeting.html#meeting-detail">詳細を開く</a>'], ['2026-08-18 / MTG-000102', 'サンプルLP', 'Infrastructure', '<span id="lp-list-state">有効</span>', '<a href="05-past-records-meeting.html?entity=LP#meeting-detail">詳細を開く</a>']]
    metadata = table(['属性', '保存済みの値'], [['Meeting_ID / 日付 / 時刻', '<span id="detail-id">MTG-000101</span> / 2026-08-25 / 14:00'], ['面談先 / 関連GP', '<span id="detail-entity">サンプルGP / GP:A</span> / サンプルGP'], ['Asset Class / Equity・Debt / Team', 'Infrastructure / Equity / サンプルチーム'], ['場所 / Fund・Strategy / 面談種別', 'オンライン / サンプル戦略 / 年1回面談・オフィス訪問'], ['参加者 / 要フォロー / メモ / 確認済み', 'サンプル担当者・当社担当 / あり / 費用条件を確認 / 確認済み']])
    related = '''<h3>関連資料</h3><p class="hint">関係の正本：Meeting_Index.Related_Pitchbook_IDs。削除はこの記録との関連付けを解除します。原本と他の記録との関連は保持します。</p><div id="related-table"></div><button type="button" data-record-action="add-files">資料を追加</button><details id="followup-files"><summary>資料の追加・既存資料の関連付け</summary>'''+files+demo_controls+'''<button type="button" data-record-action="followup">この記録に追加</button></details>
<details id="classification"><summary>資料の分類を編集</summary><p>面談先は親記録から参照します。独立したGP必須入力には戻しません。</p><label for="file-class-date">資料日付</label><input type="date" id="file-class-date" value="2026-08-20"><label for="file-class-asset">Asset Class</label><select id="file-class-asset"><option>Infrastructure</option><option>Private Equity</option></select><label for="file-class-capital">Equity / Debt</label><select id="file-class-capital"><option>Equity</option><option>Debt</option></select><label for="file-class-strategy">Fund / Strategy</label><input id="file-class-strategy" value="サンプル戦略"><button type="button" data-record-action="classification">分類変更を確認</button><p id="classification-state" role="status"></p><p class="hint">Document_IDと原本を維持。ファイル差替えなし。面談日・本文を変更しません。</p></details>'''
    body = '<section id="meeting-detail" class="card"><h2>記録の詳細</h2><p id="parent-detail-state" role="status">有効な記録</p>'+metadata+'<h3>記録本文</h3><p id="meeting-body" class="reader">運用体制を確認しました。費用条件は次回までに追加資料を確認します。\n次回確認：担当範囲と費用条件。</p><div class="actions"><button type="button" data-record-action="original">面談原本を開く</button><a href="07-meeting-edit.html">編集</a><button type="button" data-record-action="parent-toggle">記録を削除</button></div><details id="original-preview"><summary>面談原本のデモ</summary><p>架空Docs原文：運用体制を確認しました。費用条件は次回までに追加資料を確認します。</p><p class="hint">外部Docは開きません。実装時はauthoritative document identity/URLを検証します。</p></details>'+related+'<p id="record-feedback" role="status"></p></section>'
    page('05-past-records-meeting', '過去の記録', '記録本文、属性、関連資料を同じ場所で確認する。', card('記録の絞り込み', filters)+card('記録一覧', table(['日付 / ID', '面談先', '分類', '状態', '操作'], rows))+body+progress+'<script src="record-demo.js" defer></script>')
    edit = '<p>MTG-000101 / 更新版1</p><form id="record-form" data-existing="true">'+card('記録を編集', meeting_input)+card('関連資料', files)+demo_controls+'<div class="editor-footer"><button class="primary" type="submit">変更を保存</button> <a href="05-past-records-meeting.html#meeting-detail">過去の記録へ戻る</a></div></form>'+progress
    page('07-meeting-edit', '記録を編集', '元の記録と原本を引き継いで編集する。', edit+'<script src="record-demo.js" defer></script>', active='05-past-records-meeting')
    for name in ['09-workspace-gp.html', '10-workspace-entity.html']:
        p = out/name
        text = p.read_text(encoding='utf-8').replace('</main>', '<p><a href="05-past-records-meeting.html#meeting-detail">記録を開いて関連資料を操作</a></p></main>')
        p.write_text(text, encoding='utf-8')
    # Current evidence is regenerated; historical screenshots remain explicitly historical.
    for p in out.glob('*.html'):
        text = p.read_text(encoding='utf-8').replace('0028-CODEX-10 ·', '0028-CODEX-11 ·')
        p.write_text(text, encoding='utf-8')
    for name in ['03-record-add-meeting.html','07-meeting-edit.html']:
        p=out/name
        text=p.read_text(encoding='utf-8')
        p.write_text(text.replace('<form id="record-form"', '<form id="record-form" data-synthetic="true"'),encoding='utf-8')
    unique = list({p['file']:p for p in pages}.values())
    pages[:] = unique
    (out/'page-manifest.json').write_text(json.dumps({'source_sha':source,'pages':unique}, ensure_ascii=False, indent=2), encoding='utf-8')
    links = ''.join(f'<li><a href="{p["file"]}">{p["title"]}</a></li>' for p in unique)
    (out/'index.html').write_text('<!doctype html><html lang="ja"><meta charset="utf-8"><title>CODEX-11 Light review</title><link rel="stylesheet" href="family.css"><body style="padding:28px"><h1>CODEX-11 単一記録Light</h1><p>架空データによる操作デモ。初期画面はナレッジ検索。</p><ol>'+links+'</ol><a href="integrity-light-review/index.html">最新の検証・画像一覧</a></body></html>', encoding='utf-8')
