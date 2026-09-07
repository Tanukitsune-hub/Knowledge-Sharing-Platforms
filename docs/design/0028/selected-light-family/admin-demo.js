/* Design-only local state, never authentication or persistent policy. */
(() => {
  let count = 0;
  document.getElementById('add-preset').addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'mode-row'; row.dataset.modeId = 'demo-generic-' + (++count); row.dataset.behavior = 'GENERIC_PRESET';
    const name = document.createElement('input'); name.value = '新しいプリセット ' + count; name.setAttribute('aria-label', '新しいプリセット 表示名');
    const prompt = document.createElement('textarea'); prompt.placeholder = '利用者へ表示する固定質問を入力'; prompt.setAttribute('aria-label','新しいプリセット 固定質問');
    const label = document.createElement('label'), enabled = document.createElement('input'); enabled.type = 'checkbox'; enabled.checked = true; enabled.setAttribute('aria-label','新しいプリセット 有効'); label.append(enabled, '有効');
    const order = document.createElement('input'); order.type = 'number'; order.min = '1'; order.value = String(40 + count * 10); order.setAttribute('aria-label','新しいプリセット 表示順');
    row.append(name,prompt,label,order); document.getElementById('mode-registry').append(row); name.focus();
    document.getElementById('preset-status').textContent = '追加例です。永続保存はされません。';
  });
  document.getElementById('save-presets').addEventListener('click', () => {
    const rows = Array.from(document.querySelectorAll('#mode-registry .mode-row')).slice(1);
    const invalid = rows.some(row => !row.querySelector('input:not([type])').value.trim() || !row.querySelector('textarea').value.trim());
    document.getElementById('preset-status').textContent = invalid ? '表示名と固定質問を入力してください。' : '入力内容を確認しました。設計デモのため保存・検索への反映は行いません。';
  });
})();
