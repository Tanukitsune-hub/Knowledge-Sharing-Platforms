/* Synthetic UI demonstration only. No provider call, storage or application handler. */
(() => {
  const byId = id => document.getElementById(id);
  const mode = byId('search-mode'), question = byId('search-question'), model = byId('knowledge-visible-model');
  const source = byId('search-source'), all = byId('all-period');
  let draft = '', previousMode = 'free', previousSource = '';
  const prompts = {
    summary: '対象期間の面談記録・資料を要約し、主要論点、確認済み事項、未確認事項を出典とともに整理してください。',
    timeline: '対象期間の情報を日付順に整理し、方針や判断の変化を出典とともに示してください。',
    compare: '選択した2〜5件の対象について共通の評価軸で比較し、相違点と根拠不足を対象別の出典とともに示してください。',
    prep: '選択した面談対象について過去の確認事項と未解決論点を整理し、次回面談で確認する質問を出典とともに示してください。'
  };
  function updateMode() {
    if (previousMode === 'free') draft = question.value;
    question.readOnly = mode.value !== 'free';
    question.required = mode.value === 'free';
    question.value = mode.value === 'free' ? draft : prompts[mode.value];
    byId('question-required').hidden = mode.value !== 'free';
    byId('question-help').textContent = mode.value === 'free' ? '自由に質問を入力できます。5,000文字まで。' : '管理者が設定した固定質問です。内容の選択・コピーはできますが、編集はできません。';
    byId('compare-context').hidden = mode.value !== 'compare';
    byId('prep-context').hidden = mode.value !== 'prep';
    byId('prep-target').required = mode.value === 'prep';
    previousMode = mode.value;
    byId('search-answer').hidden = true; byId('export-answer').hidden = true;
  }
  mode.addEventListener('change', updateMode);
  all.addEventListener('change', () => {
    ['search-from','search-to'].forEach(id => { byId(id).disabled = all.checked; });
    byId('search-status').textContent = all.checked ? '全期間を検索対象にします' : '直前の日付条件に戻りました';
  });
  model.addEventListener('change', () => {
    const exporting = model.value === 'FULL_EXPORT';
    if (exporting) { previousSource = source.value; source.value = 'Meeting'; }
    else source.value = previousSource;
    source.disabled = exporting;
    byId('search-status').textContent = exporting ? '面談記録の原文のみ。資料本文・資料リンクは含みません。' : '管理者が許可したAIモデルを使用します';
    byId('search-run').textContent = exporting ? '全文出力をプレビュー' : '検索';
    byId('search-answer').hidden = true; byId('export-answer').hidden = true;
  });
  byId('search-clear').addEventListener('click', () => {
    byId('search-demo').reset(); draft = ''; previousMode = 'summary'; previousSource = '';
    source.disabled = false; ['search-from','search-to'].forEach(id => { byId(id).disabled = false; });
    updateMode(); byId('search-run').textContent = '検索'; byId('search-status').textContent = '初期期間：直近3年間';
  });
  byId('search-demo').addEventListener('submit', event => {
    event.preventDefault();
    const count = byId('compare-entities').selectedOptions.length;
    if (mode.value === 'compare' && (count < 2 || count > 5)) { byId('search-status').textContent = '比較対象を2〜5件選択してください。'; return; }
    if (!all.checked && byId('search-from').value > byId('search-to').value) { byId('search-status').textContent = '開始日は終了日以前にしてください。'; return; }
    const exporting = model.value === 'FULL_EXPORT';
    byId('search-answer').hidden = exporting; byId('export-answer').hidden = !exporting;
    byId('search-status').textContent = '架空の表示例です。実検索・通信は行っていません。';
  });
})();
