/* CODEX-11 synthetic browser state. No external services, file reads or persistence. */
(() => {
  const $ = id => document.getElementById(id);
  const past = !!$('related-table'), lp = new URLSearchParams(location.search).get('entity')==='LP';
  const labels = {GP:'サンプルGP', LP:'サンプルLP', NLI:'日本生命', GROUP:'サンプルグループ', CONSULTANT:'サンプルConsultant', OTHER:'サンプルその他'};
  let parentId = past || $('record-form')?.dataset.existing ? (lp?'MTG-000102':'MTG-000101') : '';
  let parentActive = true, selected = [], results = [], existing = [], createdParents = 0;
  let documents = [{id:'DOC-000201',name:'共有資料.pdf',active:true,linked:true,otherLinks:1}, {id:'DOC-000202',name:'既存Inactive資料.pdf',active:false,linked:true,otherLinks:0}];
  const message = text => { if ($('record-feedback')) $('record-feedback').textContent = text; };
  const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderRelations() {
    if (!past) return;
    $('related-table').innerHTML = '<div class="table-wrap"><table><thead><tr><th>資料 / Document_ID</th><th>資料状態</th><th>この記録との関連</th><th>他の記録との関連</th><th>操作</th></tr></thead><tbody>'+documents.map(d => '<tr><td>'+esc(d.name)+'<br>'+d.id+'</td><td>'+(d.active?'Active':'Inactive（既存状態）')+'</td><td>'+(d.linked?'関連あり':'解除済み')+'</td><td>'+d.otherLinks+'件を保持</td><td><button type="button" data-record-action="unlink" data-id="'+d.id+'">'+(d.linked?'削除':'元に戻す')+'</button> <button type="button" data-record-action="file-original" data-id="'+d.id+'">原資料を開く</button> <button type="button" data-record-action="edit-class" data-id="'+d.id+'">分類編集</button></td></tr>').join('')+'</tbody></table></div>';
  }
  function report(stage) {
    $('record-progress').hidden = false;
    $('record-status').textContent = stage+' / '+(parentId || '未保存')+' / 新規親作成 '+createdParents+'件 / ファイル登録 '+results.filter(r=>r.uploaded&&!r.reused).length+'件 / 既存資料再利用 '+results.filter(r=>r.reused).length+'件 / 処理順：記録保存 '+(parentId?'完了':'未完了')+' → ファイル保存 '+results.filter(r=>r.uploaded&&!r.reused).length+'件 → 関連確定 '+results.filter(r=>r.linked).length+'件';
    $('record-results').innerHTML = '<div class="table-wrap"><table><thead><tr><th>ファイル / ID</th><th>保存</th><th>関連付け</th><th>再試行対象</th></tr></thead><tbody>'+results.map(r=>'<tr><td>'+esc(r.name)+' / '+r.id+'</td><td>'+(r.uploaded?'登録済み':'失敗')+'</td><td>'+(r.linked?'確定':'未完了')+'</td><td>'+(r.linked?'なし':r.uploaded?'関連付けのみ':'ファイル保存から')+'</td></tr>').join('')+'</tbody></table></div>';
    document.querySelector('[data-record-action="retry"]').disabled = !parentId || !results.some(r=>!r.linked);
  }
  function run() {
    if (!parentActive) { message('削除済みの記録へ資料を追加できません。先に記録を復元してください。'); return; }
    if (results.length) { report('前回結果を保持しています。失敗分の再試行またはデモ初期化を選んでください'); return; }
    const scenario = $('record-scenario').value;
    if (!parentId && scenario === 'parent-fail') { report('記録を保存できませんでした。資料登録は0件です'); return; }
    if (!parentId) { parentId = 'MTG-DEMO-001'; createdParents++; }
    report('記録を保存しました。資料の処理中');
    results = selected.map((f,i)=>({name:f.name,id:'DOC-DEMO-'+String(i+1).padStart(3,'0'),uploaded:!(scenario==='file-fail' && i===1),linked:!(i===1 && ['file-fail','link-fail'].includes(scenario))}));
    for (const id of existing) if (!results.some(r=>r.id===id)) results.push({name:'既存資料（再uploadなし）',id,uploaded:true,linked:true,reused:true});
    results.filter(r=>r.linked).forEach(r=>{const d=documents.find(d=>d.id===r.id);if(d)d.linked=true;else documents.push({id:r.id,name:r.name,active:true,linked:true,otherLinks:0});});
    renderRelations(); report(results.some(r=>!r.linked)?'一部未完了。成功済みの記録と資料を保持しています':'登録が完了しました');
  }
  $('record-type')?.addEventListener('change', () => {
    const type=$('record-type').value;
    $('record-entity').innerHTML='<option value="'+type+':A">'+labels[type]+'</option>';
    $('record-related-gp').selectedIndex=type==='GP'?0:-1;
  });
  $('record-files')?.addEventListener('change', () => {
    const files=[...$('record-files').files];
    if(files.length>10 || files.some(f=>f.size>25*1024*1024) || files.reduce((a,f)=>a+f.size,0)>100*1024*1024 || files.some(f=>!(/\.(pdf|pptx|xlsx|docx|txt|eml)$/i.test(f.name)))) { selected=[]; $('selected-files').textContent='ファイル形式・件数・サイズ上限を確認してください。'; return; }
    selected=files.map(f=>({name:f.name})); $('selected-files').textContent=selected.map(f=>f.name).join(' / ')||'ファイル未選択';
  });
  $('record-form')?.addEventListener('submit', e=>{e.preventDefault();run();});
  document.addEventListener('click', e=>{
    const button=e.target.closest('[data-record-action]'); if(!button)return;
    const action=button.dataset.recordAction;
    if(action==='sample-files') {selected=[{name:'概要.pdf'},{name:'補足.pdf'}];$('selected-files').textContent='概要.pdf / 補足.pdf（架空ファイル）';}
    if(action==='existing') {existing=[...new Set([...existing,$('existing-document').value])];$('selected-files').textContent='既存の関連付け候補：'+existing.join(', ');}
    if(action==='followup')run();
    if(action==='retry' && parentId && parentActive) {
      results.forEach(r=>{r.uploaded=true;r.linked=true;if(!documents.some(d=>d.id===r.id))documents.push({id:r.id,name:r.name,active:true,linked:true,otherLinks:0});});
      renderRelations();report('同じMeeting_ID / Document_IDで再試行が完了しました');
    }
    if(action==='unlink') {
      const d=documents.find(d=>d.id===button.dataset.id);d.linked=!d.linked;
      message((d.linked?'関連付けを戻しました。':'この記録との関連付けを解除しました。')+'原本と他の記録との関連は保持します。資料状態は'+(d.active?'Active':'Inactive')+'のままです。');renderRelations();
    }
    if(action==='parent-toggle') {
      parentActive=!parentActive;button.textContent=parentActive?'記録を削除':'記録を復元';$('parent-detail-state').textContent=parentActive?'有効な記録':'削除済みの記録（Inactive）';$(lp?'lp-list-state':'parent-list-state').textContent=parentActive?'有効':'削除済み';
      message('記録状態のみ変更。原本・資料・解除済みリンクを保持。面談日と本文は変更していません。');
    }
    if(action==='lp-detail') { parentId='MTG-000102';$('detail-id').textContent=parentId;$('detail-entity').textContent='サンプルLP / LP:A';message('LP記録の架空例。既存親へ追加し、面談件数・日付は変わりません。'); }
    if(action==='original')$('original-preview').open=true;
    if(action==='file-original')message(button.dataset.id+'の原資料表示デモです。外部ファイルは開きません。');
    if(action==='add-files')$('followup-files').open=true;
    if(action==='edit-class'){$('classification').open=true;$('classification').dataset.documentId=button.dataset.id;}
    if(action==='classification'){
      const id=$('classification').dataset.documentId||'DOC-000201';
      const d=documents.find(d=>d.id===id);
      d.classification=[$('file-class-date').value,$('file-class-asset').value,$('file-class-capital').value,$('file-class-strategy').value];
      $('classification-state').textContent=id+' / '+d.classification.join(' / ');
      message(id+'の分類変更を確認しました（デモ）。原本・面談日・本文は変更しません。');
    }
    if(action==='quick-add') { const input=document.createElement('input');input.placeholder='新しい面談先（デモ）';input.setAttribute('aria-label','新しい面談先');button.after(input);button.disabled=true;input.addEventListener('change',()=>{const opt=new Option(input.value,$('record-type').value+':DEMO');$('record-entity').add(opt);$('record-entity').value=opt.value;});input.focus(); }
    if(action==='filter')$('filter-status').textContent='架空の2件を表示しています。filterのserver照合は後続BUILDで検証します。';
    if(action==='reset') {selected=[];results=[];existing=[];createdParents=0;parentId=past||$('record-form')?.dataset.existing?(lp?'MTG-000102':'MTG-000101'):'';$('record-progress').hidden=true;$('selected-files').textContent='ファイル未選択';}
  });
  if(lp&&past){$('detail-id').textContent=parentId;$('detail-entity').textContent='サンプルLP / LP:A';$('detail-id').parentElement.lastChild.textContent=' / 2026-08-18 / 14:00';document.querySelector('a[href="07-meeting-edit.html"]').href='07-meeting-edit.html?entity=LP';}
  if(lp&&$('record-type')){$('record-type').value='LP';$('record-type').dispatchEvent(new Event('change'));document.querySelector('input[type="date"]').value='2026-08-18';document.querySelector('a[href="05-past-records-meeting.html#meeting-detail"]').href='05-past-records-meeting.html?entity=LP#meeting-detail';}
  if(lp&&$('record-form'))$('record-form').previousElementSibling.textContent='MTG-000102 / 更新版1';
  renderRelations();
})();
