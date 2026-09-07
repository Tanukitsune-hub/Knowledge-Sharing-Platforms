/* CODEX-11: local synthetic search/export demonstration, no services or persistence. */
(() => {
  const $=id=>document.getElementById(id);
  const mode=$('search-mode'),question=$('search-question'),entity=$('search-counterparty'),all=$('all-period');
  let draft='',previous='free';
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const since=new Date(today+'T00:00:00Z');since.setUTCFullYear(since.getUTCFullYear()-3);
  $('search-from').value=$('search-from').defaultValue=since.toISOString().slice(0,10);$('search-to').value=$('search-to').defaultValue=today;
  const prompts={summary:'対象期間の記録・資料を要約し、主要論点と根拠を整理してください。',timeline:'日付順に方針や判断の変化を出典とともに示してください。',compare:'選択した2〜5件を共通の評価軸で比較してください。',prep:'選択した面談先の確認事項と未解決論点を整理してください。'};
  const esc=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const status=text=>$('search-status').textContent=text;
  const filters={asset:'Infrastructure',equity:'Equity',team:'サンプルチーム',strategy:'サンプル戦略',followup:'あり',relatedGp:'GP:A',meetingType:'ANNUAL_REVIEW'};
  document.querySelectorAll('[data-source-control] select').forEach(select=>{const key=select.parentElement.dataset.sourceControl;select.options[0].value='';select.add(new Option(filters[key],filters[key]));});
  const fixtures=['GP:A','LP:A','NLI:A','GROUP:A','CONSULTANT:A','OTHER:A'].map((key,i)=>({id:'MTG-00010'+(i+1),entity:key,name:$('search-counterparty').querySelector('option[value="'+key+'"]').textContent,date:'2026-08-25',time:'14:00',doc:'DOCS-SYNTHETIC-'+(i+1),body:'運用体制を確認しました。\n費用条件は次回までに追加資料を確認します。\n次回確認：担当範囲と費用条件。',...filters}));
  function common() { const details={};document.querySelectorAll('[data-source-control] select').forEach(s=>{if(s.value)details[s.parentElement.dataset.sourceControl]=s.value;});return {entityKey:entity.value,dateFrom:all.checked?'':$('search-from').value,dateTo:all.checked?'':$('search-to').value,details}; }
  function valid(c) { if(c.dateFrom&&c.dateTo&&c.dateFrom>c.dateTo){status('開始日は終了日以前にしてください。');return false;}return true; }
  function scope(c) {return '面談先：'+(entity.selectedOptions[0]?.textContent||'すべて')+' / 期間：'+(all.checked?'全期間':(c.dateFrom||'指定なし')+'〜'+(c.dateTo||'指定なし'))+' / 詳細条件：'+(Object.entries(c.details).map(([k,v])=>k+'='+v).join(', ')||'なし');}
  function modeChange(){if(previous==='free')draft=question.value;question.readOnly=mode.value!=='free';question.required=mode.value==='free';question.value=mode.value==='free'?draft:prompts[mode.value];$('question-required').hidden=mode.value!=='free';$('question-help').textContent=mode.value==='free'?'自由に質問を入力できます。5,000文字まで。':'管理者が設定した固定質問です。選択・コピー可、編集不可。';$('compare-context').hidden=mode.value!=='compare';$('prep-context').hidden=mode.value!=='prep';previous=mode.value;$('search-answer').hidden=true;$('export-answer').hidden=true;}
  mode.addEventListener('change',modeChange);
  all.addEventListener('change',()=>{['search-from','search-to'].forEach(id=>$(id).disabled=all.checked);status(all.checked?'全期間を対象にします':'直前の日付条件に戻りました');});
  $('full-export-run').addEventListener('click',()=>{
    $('search-answer').hidden=true;$('export-answer').hidden=true;const c=common();if(!valid(c))return;
    const rows=fixtures.filter(r=>(!c.entityKey||r.entity===c.entityKey)&&(!c.dateFrom||r.date>=c.dateFrom)&&(!c.dateTo||r.date<=c.dateTo)&&Object.entries(c.details).every(([k,v])=>r[k]===v));
    const scenario=$('export-scenario').value;
    const failure=scenario==='limit'?'安全上限を超えています。期間を絞ってください。途中切捨てやファイル生成は行いません。':scenario==='read-fail'?'原本を読み出せませんでした。全文出力を中止しました。':scenario==='empty'||!rows.length?'対象は0件です。出力は作成しません。':'';
    $('export-answer').innerHTML='<h2>面談記録の全文出力プレビュー</h2><p>'+esc(scope(c))+'</p><p>Meeting-only / AIなし。情報ソース・AIモデル・質問・比較対象・面談準備の専用条件は出力条件に含みません。上段の共通面談先と期間を使用します。</p>'+(failure?'<p role="status">'+failure+'</p>':'<p>対象：'+rows.length+'件（架空のActive Meeting） / Google Docs本文（権威ソース）と保存済みMeeting属性</p>'+rows.map(r=>'<details open><summary>'+esc(r.id+' / '+r.name)+'</summary><div class="table-wrap"><table><tbody>'+Object.entries({'Meeting ID':r.id,'日付 / 時刻':r.date+' / '+r.time,'面談先区分 / ID / 表示名':r.entity+' / '+r.name,'関連GP':'GP:A / サンプルGP','面談場所':'オンライン','Asset Class':r.asset,'Equity / Debt':r.equity,'Team':r.team,'Fund / Strategy':r.strategy,'Meeting Type':'ANNUAL_REVIEW / 年1回面談','Related Pitchbook IDs':'DOC-SYNTHETIC-201','要フォロー / メモ':'あり / 費用条件を確認','参加者':'サンプル担当者 / 当社担当','確認済み':'true','authoritative Docs identity':r.doc,'authoritative Docs URL':'未設定（架空例・実URLなし）'}).map(([k,v])=>'<tr><th>'+esc(k)+'</th><td>'+esc(v)+'</td></tr>').join('')+'</tbody></table></div><h3>Docs原文全文</h3><p class="reader" style="white-space:pre-wrap">'+esc(r.body)+'</p></details>').join('')+'<div class="actions"><button type="button" data-export-demo="コピー">コピー</button><button type="button" data-export-demo="Google Docs">Google Docsへ出力</button><button type="button" data-export-demo="PDF">PDFへ出力</button></div><p class="hint">資料本文・Pitchbook参照リンクsectionは含みません。preview/readback/fingerprintと件数・文字数・時間の安全上限は後続BUILDでも維持します。</p>');
    $('export-answer').hidden=false;status(failure||'全文出力プレビュー：面談記録のみ / AIなし');
  });
  $('search-demo').addEventListener('submit',e=>{e.preventDefault();const c=common();if(!valid(c))return;
    if(!$('knowledge-visible-model').value){status('AI検索には許可済みAIモデルが必要です。全文出力は利用できます。');return;}
    const selected=[...$('compare-entities').selectedOptions].map(o=>o.value);
    if(mode.value==='compare'&&(selected.length<2||selected.length>5)){status('比較対象を2〜5件選択してください。');return;}
    if(mode.value==='prep'&&!entity.value){status('上段で面談先を選択してください。');return;}
    if($('search-source').value==='Pitchbook'&&Object.keys(c.details).some(k=>['team','followup','meetingType'].includes(k))){status('Meeting専用条件と資料のみの組合せは未対応です。条件を確認してください。');return;}
    const target=mode.value==='compare'?selected.join(', '):c.entityKey||'すべて';
    $('search-answer').innerHTML='<h2>検索結果の架空例</h2><p>実検索・通信なし。future source metadata契約の表示例です。</p><p>対象：'+esc(target)+' / '+esc($('search-source').selectedOptions[0].textContent)+'</p><p>送信scope例：'+esc(JSON.stringify(mode.value==='compare'?{selectedEntityKeys:selected}:{entityKey:c.entityKey}))+'</p><p>有効な親との関連がある適格な資料：DOC-SYNTHETIC-201 / '+esc(target)+' / 概要資料.pdf</p><p>原資料と出典のidentityは実装時にauthoritative sourceで検証します。</p>';
    $('search-answer').hidden=false;$('export-answer').hidden=true;status('架空例を表示しました。');
  });
  $('search-clear').addEventListener('click',()=>{$('search-demo').reset();draft='';previous='summary';['search-from','search-to'].forEach(id=>$(id).disabled=false);modeChange();status('初期期間：直近3年間');});
  document.addEventListener('click',e=>{if(e.target.dataset.exportDemo)status(e.target.dataset.exportDemo+'出力のデモです。実ファイル・クリップボードは変更しません。');});
})();
