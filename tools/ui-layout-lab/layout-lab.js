(function () {
  'use strict';

  const presets = window.LayoutLabPresets;
  const model = window.LayoutLabModel;
  const STORAGE_KEY = 'knowledge-share-ui-layout-lab-variants-v1';

  const elements = {};
  let history = model.createHistory(presets.getPreset('current-v8'), 50);
  let selectedId = 'meeting-date';
  let savedSnapshot = model.stableStringify(history.current());
  let draggedId = null;
  let referenceLoaded = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function cacheElements() {
    [
      'viewport-buttons', 'undo-button', 'redo-button', 'tidy-button', 'reset-button', 'json-button', 'handoff-button',
      'dirty-indicator', 'preset-list', 'field-palette', 'visible-field-count', 'variant-name', 'variant-select',
      'variant-save', 'variant-load', 'variant-delete', 'viewport-caption', 'canvas-scroll', 'preview-frame',
      'preview-viewport', 'mock-container', 'mock-grid', 'preset-origin-chip', 'status-message', 'field-inspector-empty',
      'field-inspector', 'selected-field-label', 'selected-field-id', 'selected-field-order', 'field-span',
      'field-span-output', 'field-height-group', 'field-height', 'field-height-output', 'field-visible',
      'container-width', 'container-width-output', 'container-max-width', 'container-align', 'column-gap', 'row-gap',
      'show-grid', 'reference-file', 'reference-overlay', 'reference-opacity', 'reference-opacity-output',
      'reference-clear', 'lint-count', 'lint-list', 'transfer-dialog', 'dialog-title', 'json-panel', 'handoff-panel',
      'json-text', 'json-copy', 'json-download', 'json-file', 'json-import', 'handoff-text', 'handoff-copy',
      'handoff-download'
    ].forEach(function (id) { elements[id] = byId(id); });
  }

  function current() {
    return history.current();
  }

  function definition(id) {
    return presets.fieldDefinitionById[id];
  }

  function setStatus(message, tone) {
    elements['status-message'].textContent = message || '';
    elements['status-message'].className = 'status-message' + (tone ? ' ' + tone : '');
  }

  function commit(next, message) {
    history.record(next);
    renderAll();
    if (message) setStatus(message, 'success');
  }

  function isDirty() {
    return model.stableStringify(current()) !== savedSnapshot;
  }

  function renderDirtyState() {
    const dirty = isDirty();
    elements['dirty-indicator'].textContent = dirty ? '未保存の変更' : '保存済み';
    elements['dirty-indicator'].classList.toggle('dirty', dirty);
  }

  function renderViewportButtons() {
    const layout = current();
    elements['viewport-buttons'].innerHTML = '';
    Object.keys(presets.VIEWPORTS).forEach(function (id) {
      const viewport = presets.VIEWPORTS[id];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = layout.viewport.id === id ? 'active' : '';
      button.textContent = viewport.label.replace(' desktop', '') + ' ' + viewport.widthPx;
      button.dataset.viewport = id;
      button.addEventListener('click', function () {
        commit(model.setViewport(current(), id), viewport.label + ' previewへ切り替えました。');
      });
      elements['viewport-buttons'].appendChild(button);
    });
  }

  function renderPresetList() {
    const layout = current();
    elements['preset-list'].innerHTML = '';
    Object.keys(presets.PRESETS).forEach(function (id) {
      const preset = presets.PRESETS[id];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset-card' + (layout.presetOrigin === id ? ' active' : '');
      button.dataset.preset = id;
      const name = document.createElement('strong');
      name.textContent = preset.name;
      const description = document.createElement('span');
      description.textContent = preset.description;
      button.append(name, description);
      button.addEventListener('click', function () {
        const next = presets.getPreset(id);
        next.viewport = layout.viewport;
        selectedId = next.fields[0].id;
        commit(next, preset.name + 'を適用しました。通常の編集状態として調整できます。');
      });
      elements['preset-list'].appendChild(button);
    });
  }

  function renderFieldPalette() {
    const layout = current();
    elements['field-palette'].innerHTML = '';
    let visibleCount = 0;
    layout.fields.forEach(function (field) {
      if (field.visible) visibleCount += 1;
      const fieldDefinition = definition(field.id);
      const label = document.createElement('label');
      label.className = 'visibility-control';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = field.visible;
      checkbox.dataset.fieldVisibility = field.id;
      checkbox.addEventListener('change', function () {
        selectedId = field.id;
        commit(model.updateField(current(), field.id, { visible: checkbox.checked }), (checkbox.checked ? '表示: ' : '非表示: ') + fieldDefinition.label);
      });
      const text = document.createElement('span');
      text.textContent = fieldDefinition.label;
      const code = document.createElement('code');
      code.textContent = field.colSpan + '/12';
      label.append(checkbox, text, code);
      elements['field-palette'].appendChild(label);
    });
    elements['visible-field-count'].textContent = visibleCount + '/' + layout.fields.length;
  }

  function createMockControl(field) {
    const fieldDefinition = definition(field.id);
    if (fieldDefinition.kind === 'checks') {
      const control = document.createElement('div');
      control.className = 'mock-control checks';
      ['定例年1回', '先方オフィス訪問', '年次総会'].forEach(function (text) {
        const item = document.createElement('span');
        item.textContent = text;
        control.appendChild(item);
      });
      return control;
    }
    if (fieldDefinition.kind === 'textarea') {
      const control = document.createElement('div');
      control.className = 'mock-control textarea';
      control.style.height = field.heightPx + 'px';
      control.textContent = '面談内容を自由に記載してください。';
      return control;
    }
    if (fieldDefinition.kind === 'attachment') {
      const control = document.createElement('div');
      control.className = 'attachment-control';
      control.style.height = field.heightPx + 'px';
      const content = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = '資料をここへdrag & drop';
      const text = document.createElement('span');
      text.textContent = 'またはlocal fileを選択';
      content.append(strong, text);
      control.appendChild(content);
      return control;
    }
    const control = document.createElement('div');
    control.className = 'mock-control';
    const examples = {
      'meeting-date': '2026/09/18',
      'meeting-time': '10:00',
      'meeting-locationId': 'Tokyo Office',
      'meeting-counterpartyId': 'North Harbor Partners（GP / 運用会社）',
      'meeting-assetClassId': 'Private Equity',
      'meeting-capitalTypeId': 'Equity',
      'meeting-teamId': 'Investment Team',
      'meeting-fundStrategy': 'Global Buyout',
      'meeting-counterparty': 'Jane Smith / Partner',
      'meeting-internalParticipants': '投資部 A、B'
    };
    control.textContent = examples[field.id] || '—';
    return control;
  }

  function startHorizontalResize(event, field) {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const card = handle.closest('.field-card');
    const gridRect = elements['mock-grid'].getBoundingClientRect();
    const startX = event.clientX;
    const startSpan = field.colSpan;
    const columnWidth = Math.max(1, gridRect.width / 12);
    let previewSpan = startSpan;
    handle.setPointerCapture(event.pointerId);
    function move(moveEvent) {
      const delta = Math.round((moveEvent.clientX - startX) / columnWidth);
      previewSpan = Math.max(1, Math.min(12, startSpan + delta));
      card.style.gridColumn = 'span ' + previewSpan;
      card.querySelector('.span-badge').textContent = previewSpan + '/12';
    }
    function finish() {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      if (previewSpan !== startSpan) commit(model.updateField(current(), field.id, { colSpan: previewSpan }), definition(field.id).label + 'を' + previewSpan + '/12へresizeしました。');
      else renderAll();
    }
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
  }

  function startVerticalResize(event, field) {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const card = handle.closest('.field-card');
    const control = card.querySelector('.mock-control.textarea,.attachment-control');
    const startY = event.clientY;
    const startHeight = field.heightPx;
    let previewHeight = startHeight;
    handle.setPointerCapture(event.pointerId);
    function move(moveEvent) {
      previewHeight = Math.max(100, Math.min(720, Math.round((startHeight + moveEvent.clientY - startY) / 10) * 10));
      control.style.height = previewHeight + 'px';
    }
    function finish() {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      if (previewHeight !== startHeight) commit(model.updateField(current(), field.id, { heightPx: previewHeight }), definition(field.id).label + 'を高さ' + previewHeight + 'pxへresizeしました。');
      else renderAll();
    }
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
  }

  function handleResizeKey(event, field, direction) {
    const horizontalDelta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    const verticalDelta = event.key === 'ArrowDown' ? 10 : event.key === 'ArrowUp' ? -10 : 0;
    if (direction === 'x' && horizontalDelta) {
      event.preventDefault();
      commit(model.updateField(current(), field.id, { colSpan: field.colSpan + horizontalDelta }), definition(field.id).label + 'の幅を調整しました。');
    }
    if (direction === 'y' && verticalDelta) {
      event.preventDefault();
      commit(model.updateField(current(), field.id, { heightPx: field.heightPx + verticalDelta }), definition(field.id).label + 'の高さを調整しました。');
    }
  }

  function createFieldCard(field) {
    const fieldDefinition = definition(field.id);
    const card = document.createElement('article');
    card.className = 'field-card' + (selectedId === field.id ? ' selected' : '');
    card.dataset.fieldId = field.id;
    card.draggable = true;
    card.style.gridColumn = 'span ' + field.colSpan;
    card.addEventListener('click', function () {
      selectedId = field.id;
      renderCanvas();
      renderInspector();
    });
    card.addEventListener('dragstart', function (event) {
      draggedId = field.id;
      card.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', field.id);
    });
    card.addEventListener('dragend', function () {
      draggedId = null;
      document.querySelectorAll('.field-card').forEach(function (item) { item.classList.remove('dragging', 'drop-target'); });
    });
    card.addEventListener('dragover', function (event) {
      event.preventDefault();
      if (draggedId && draggedId !== field.id) card.classList.add('drop-target');
    });
    card.addEventListener('dragleave', function () { card.classList.remove('drop-target'); });
    card.addEventListener('drop', function (event) {
      event.preventDefault();
      card.classList.remove('drop-target');
      const moved = draggedId || event.dataTransfer.getData('text/plain');
      if (moved && moved !== field.id) {
        selectedId = moved;
        commit(model.reorderField(current(), moved, field.id), definition(moved).label + 'を' + fieldDefinition.label + 'の位置へ移動しました。');
      }
    });

    const top = document.createElement('div');
    top.className = 'field-topline';
    const label = document.createElement('div');
    label.className = 'field-label' + (fieldDefinition.required ? ' required' : '');
    const grip = document.createElement('span');
    grip.className = 'drag-grip';
    grip.textContent = '⠿';
    const labelText = document.createElement('span');
    labelText.textContent = fieldDefinition.label;
    label.append(grip, labelText);
    const badge = document.createElement('span');
    badge.className = 'span-badge';
    badge.textContent = field.colSpan + '/12';
    top.append(label, badge);
    card.append(top, createMockControl(field));
    if (field.id === 'meeting-counterpartyId') {
      const hint = document.createElement('div');
      hint.className = 'mock-hint';
      hint.textContent = '＋ 未登録の面談先を追加';
      card.appendChild(hint);
    }
    if (field.id === 'meeting-notes') {
      const hint = document.createElement('div');
      hint.className = 'mock-hint';
      hint.textContent = '本文はGoogle Docsだけに保存します。';
      card.appendChild(hint);
    }
    const resizeX = document.createElement('div');
    resizeX.className = 'resize-handle-x';
    resizeX.dataset.resizeX = field.id;
    resizeX.setAttribute('role', 'separator');
    resizeX.setAttribute('aria-label', fieldDefinition.label + 'の幅を変更');
    resizeX.tabIndex = 0;
    resizeX.draggable = false;
    resizeX.addEventListener('pointerdown', function (event) { startHorizontalResize(event, field); });
    resizeX.addEventListener('keydown', function (event) { handleResizeKey(event, field, 'x'); });
    card.appendChild(resizeX);
    if (fieldDefinition.resizableY) {
      const resizeY = document.createElement('div');
      resizeY.className = 'resize-handle-y';
      resizeY.dataset.resizeY = field.id;
      resizeY.setAttribute('role', 'separator');
      resizeY.setAttribute('aria-label', fieldDefinition.label + 'の高さを変更');
      resizeY.tabIndex = 0;
      resizeY.draggable = false;
      resizeY.addEventListener('pointerdown', function (event) { startVerticalResize(event, field); });
      resizeY.addEventListener('keydown', function (event) { handleResizeKey(event, field, 'y'); });
      card.appendChild(resizeY);
    }
    return card;
  }

  function estimatedPreviewHeight(layout) {
    const visible = layout.fields.filter(function (field) { return field.visible; });
    if (layout.viewport.id === 'mobile') {
      return 360 + visible.reduce(function (sum, field) {
        return sum + (field.heightPx ? field.heightPx + 60 : 88) + layout.container.rowGapPx;
      }, 0);
    }
    let fill = 0;
    let rowHeight = 0;
    let total = 0;
    visible.forEach(function (field) {
      const height = field.heightPx ? field.heightPx + 55 : 88;
      if (fill && fill + field.colSpan > 12) {
        total += rowHeight + layout.container.rowGapPx;
        fill = 0;
        rowHeight = 0;
      }
      fill += field.colSpan;
      rowHeight = Math.max(rowHeight, height);
      if (fill === 12) {
        total += rowHeight + layout.container.rowGapPx;
        fill = 0;
        rowHeight = 0;
      }
    });
    if (fill) total += rowHeight;
    return Math.max(900, total + 285);
  }

  function updatePreviewScale() {
    const layout = current();
    const viewportWidth = layout.viewport.widthPx;
    const available = Math.max(260, elements['canvas-scroll'].clientWidth - 38);
    const scale = Math.min(1, available / viewportWidth);
    const previewHeight = estimatedPreviewHeight(layout);
    elements['preview-viewport'].style.width = viewportWidth + 'px';
    elements['preview-viewport'].style.height = previewHeight + 'px';
    elements['preview-viewport'].style.transform = 'scale(' + scale + ')';
    elements['preview-frame'].style.width = Math.round(viewportWidth * scale) + 'px';
    elements['preview-frame'].style.height = Math.round(previewHeight * scale) + 'px';
  }

  function renderCanvas() {
    const layout = current();
    const viewport = presets.VIEWPORTS[layout.viewport.id];
    const container = layout.container;
    elements['viewport-caption'].textContent = viewport.label.toUpperCase() + ' / ' + viewport.widthPx + ' PX';
    elements['preset-origin-chip'].textContent = 'origin: ' + layout.presetOrigin;
    elements['preview-viewport'].classList.toggle('mobile', viewport.widthPx <= 720);
    elements['mock-container'].style.width = container.widthPercent + '%';
    elements['mock-container'].style.maxWidth = container.maxWidthPx === null ? 'none' : container.maxWidthPx + 'px';
    elements['mock-container'].style.marginLeft = container.align === 'center' ? 'auto' : '0';
    elements['mock-container'].style.marginRight = 'auto';
    elements['mock-grid'].style.columnGap = container.columnGapPx + 'px';
    elements['mock-grid'].style.rowGap = container.rowGapPx + 'px';
    elements['mock-grid'].classList.toggle('show-grid', container.showGrid);
    elements['mock-grid'].innerHTML = '';
    layout.fields.filter(function (field) { return field.visible; }).forEach(function (field) {
      elements['mock-grid'].appendChild(createFieldCard(field));
    });
    updatePreviewScale();
  }

  function renderInspector() {
    const layout = current();
    let field = layout.fields.find(function (item) { return item.id === selectedId; });
    if (!field) {
      selectedId = layout.fields[0].id;
      field = layout.fields[0];
    }
    const fieldDefinition = definition(field.id);
    elements['field-inspector-empty'].hidden = true;
    elements['field-inspector'].hidden = false;
    elements['selected-field-label'].textContent = fieldDefinition.label;
    elements['selected-field-id'].textContent = field.id;
    elements['selected-field-order'].textContent = '#' + field.order;
    elements['field-span'].value = String(field.colSpan);
    elements['field-span-output'].textContent = field.colSpan + '/12';
    elements['field-visible'].checked = field.visible;
    const hasHeight = field.heightPx !== undefined;
    elements['field-height-group'].hidden = !hasHeight;
    if (hasHeight) {
      elements['field-height'].value = String(field.heightPx);
      elements['field-height-output'].textContent = field.heightPx + 'px';
    }
    elements['container-width'].value = String(layout.container.widthPercent);
    elements['container-width-output'].textContent = layout.container.widthPercent + '%';
    elements['container-max-width'].value = layout.container.maxWidthPx === null ? '0' : String(layout.container.maxWidthPx);
    elements['container-align'].value = layout.container.align;
    elements['column-gap'].value = String(layout.container.columnGapPx);
    elements['row-gap'].value = String(layout.container.rowGapPx);
    elements['show-grid'].checked = layout.container.showGrid;
  }

  function renderLint() {
    const warnings = model.lintLayout(current());
    elements['lint-list'].innerHTML = '';
    warnings.forEach(function (warning) {
      const item = document.createElement('li');
      item.className = 'lint-item' + (warning.tone === 'ok' ? ' ok' : '');
      item.dataset.lintCode = warning.code;
      item.textContent = warning.message;
      elements['lint-list'].appendChild(item);
    });
    const actualWarnings = warnings.filter(function (warning) { return warning.tone !== 'ok'; }).length;
    elements['lint-count'].textContent = String(actualWarnings);
  }

  function renderHistoryButtons() {
    elements['undo-button'].disabled = !history.canUndo();
    elements['redo-button'].disabled = !history.canRedo();
  }

  function renderAll() {
    renderViewportButtons();
    renderPresetList();
    renderFieldPalette();
    renderCanvas();
    renderInspector();
    renderLint();
    renderHistoryButtons();
    renderDirtyState();
    document.body.dataset.layoutLabReady = 'true';
  }

  function readVariants() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeVariants(variants) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(variants));
      return true;
    } catch (error) {
      setStatus('localStorageへ保存できませんでした。このbrowserのfile:// storage設定を確認してください。', 'error');
      return false;
    }
  }

  function renderVariants(preferredName) {
    const variants = readVariants();
    const selected = preferredName || elements['variant-select'].value;
    elements['variant-select'].innerHTML = '<option value="">variantを選択</option>';
    Object.keys(variants).sort(function (a, b) { return a.localeCompare(b, 'ja'); }).forEach(function (name) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      elements['variant-select'].appendChild(option);
    });
    if (selected && variants[selected]) elements['variant-select'].value = selected;
  }

  function saveVariant() {
    const name = elements['variant-name'].value.trim();
    if (!name) {
      setStatus('variant名を入力してください。', 'error');
      elements['variant-name'].focus();
      return;
    }
    const variants = readVariants();
    variants[name] = model.stableStringify(current());
    if (!writeVariants(variants)) return;
    savedSnapshot = variants[name];
    renderVariants(name);
    renderDirtyState();
    setStatus('variant「' + name + '」をlocalStorageへ保存しました。', 'success');
  }

  function loadVariant() {
    const name = elements['variant-select'].value;
    const variants = readVariants();
    if (!name || !variants[name]) {
      setStatus('読み込むvariantを選択してください。', 'error');
      return;
    }
    try {
      const layout = model.parseLayoutJson(variants[name]);
      history.reset(layout);
      selectedId = layout.fields[0].id;
      savedSnapshot = model.stableStringify(layout);
      elements['variant-name'].value = name;
      renderAll();
      setStatus('variant「' + name + '」を読み込みました。', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  function deleteVariant() {
    const name = elements['variant-select'].value;
    const variants = readVariants();
    if (!name || !variants[name]) {
      setStatus('削除するvariantを選択してください。', 'error');
      return;
    }
    delete variants[name];
    if (!writeVariants(variants)) return;
    renderVariants();
    setStatus('variant「' + name + '」を削除しました。', 'success');
  }

  function showDialog(mode) {
    const isJson = mode === 'json';
    elements['json-panel'].hidden = !isJson;
    elements['handoff-panel'].hidden = isJson;
    elements['dialog-title'].textContent = isJson ? 'Layout JSON' : 'Codex handoff';
    if (isJson) elements['json-text'].value = model.stableStringify(current());
    else elements['handoff-text'].value = model.createHandoff(current());
    if (typeof elements['transfer-dialog'].showModal === 'function') elements['transfer-dialog'].showModal();
    else elements['transfer-dialog'].setAttribute('open', '');
  }

  function downloadText(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 0);
  }

  function copyText(text, successMessage) {
    function fallback() {
      const temporary = document.createElement('textarea');
      temporary.value = text;
      temporary.style.position = 'fixed';
      temporary.style.opacity = '0';
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand('copy');
      temporary.remove();
      setStatus(copied ? successMessage : 'copyできませんでした。text areaから手動でcopyしてください。', copied ? 'success' : 'error');
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(function () { setStatus(successMessage, 'success'); }).catch(fallback);
    } else fallback();
  }

  function applyJsonText() {
    try {
      const parsed = model.parseLayoutJson(elements['json-text'].value);
      history.record(parsed);
      selectedId = parsed.fields[0].id;
      elements['json-text'].value = model.stableStringify(parsed);
      renderAll();
      setStatus('Layout JSONを検証し、exact canonical formで適用しました。', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  function bindInspectorControls() {
    elements['field-span'].addEventListener('input', function () { elements['field-span-output'].textContent = elements['field-span'].value + '/12'; });
    elements['field-span'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { colSpan: Number(elements['field-span'].value) }), 'field幅を更新しました。'); });
    elements['field-height'].addEventListener('input', function () { elements['field-height-output'].textContent = elements['field-height'].value + 'px'; });
    elements['field-height'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { heightPx: Number(elements['field-height'].value) }), 'field高さを更新しました。'); });
    elements['field-visible'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { visible: elements['field-visible'].checked }), 'field表示を更新しました。'); });
    elements['container-width'].addEventListener('input', function () { elements['container-width-output'].textContent = elements['container-width'].value + '%'; });
    elements['container-width'].addEventListener('change', function () { commit(model.updateContainer(current(), { widthPercent: Number(elements['container-width'].value) }), 'container widthを更新しました。'); });
    elements['container-max-width'].addEventListener('change', function () {
      const value = Number(elements['container-max-width'].value);
      commit(model.updateContainer(current(), { maxWidthPx: value === 0 ? null : value }), 'max widthを更新しました。');
    });
    elements['container-align'].addEventListener('change', function () { commit(model.updateContainer(current(), { align: elements['container-align'].value }), 'alignmentを更新しました。'); });
    elements['column-gap'].addEventListener('change', function () { commit(model.updateContainer(current(), { columnGapPx: Number(elements['column-gap'].value) }), 'column gapを更新しました。'); });
    elements['row-gap'].addEventListener('change', function () { commit(model.updateContainer(current(), { rowGapPx: Number(elements['row-gap'].value) }), 'row gapを更新しました。'); });
    elements['show-grid'].addEventListener('change', function () { commit(model.updateContainer(current(), { showGrid: elements['show-grid'].checked }), 'editing grid表示を更新しました。'); });
  }

  function bindReferenceControls() {
    elements['reference-file'].addEventListener('change', function () {
      const file = elements['reference-file'].files && elements['reference-file'].files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setStatus('画像fileを選択してください。', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = function () {
        elements['reference-overlay'].src = String(reader.result);
        elements['reference-overlay'].classList.add('visible');
        elements['reference-overlay'].style.opacity = String(Number(elements['reference-opacity'].value) / 100);
        elements['reference-clear'].disabled = false;
        referenceLoaded = true;
        setStatus('local reference imageをtab内overlayとして表示しました。保存・送信はしていません。', 'success');
      };
      reader.onerror = function () { setStatus('local imageを読み込めませんでした。', 'error'); };
      reader.readAsDataURL(file);
    });
    elements['reference-opacity'].addEventListener('input', function () {
      const opacity = Number(elements['reference-opacity'].value);
      elements['reference-opacity-output'].textContent = opacity + '%';
      elements['reference-overlay'].style.opacity = String(opacity / 100);
    });
    elements['reference-clear'].addEventListener('click', function () {
      elements['reference-overlay'].removeAttribute('src');
      elements['reference-overlay'].classList.remove('visible');
      elements['reference-file'].value = '';
      elements['reference-clear'].disabled = true;
      referenceLoaded = false;
      setStatus('reference overlayを外しました。');
    });
  }

  function bindEvents() {
    elements['undo-button'].addEventListener('click', function () { history.undo(); renderAll(); setStatus('1つ前のlayoutへ戻しました。'); });
    elements['redo-button'].addEventListener('click', function () { history.redo(); renderAll(); setStatus('layout変更をやり直しました。'); });
    elements['tidy-button'].addEventListener('click', function () { commit(model.tidyLayout(current()), 'deterministic heuristicでlayoutを整えました。'); });
    elements['reset-button'].addEventListener('click', function () {
      const baseline = presets.getPreset('current-v8');
      history.reset(baseline);
      selectedId = 'meeting-date';
      savedSnapshot = model.stableStringify(baseline);
      renderAll();
      setStatus('Current v8 baselineへresetしました。');
    });
    elements['json-button'].addEventListener('click', function () { showDialog('json'); });
    elements['handoff-button'].addEventListener('click', function () { showDialog('handoff'); });
    elements['variant-save'].addEventListener('click', saveVariant);
    elements['variant-load'].addEventListener('click', loadVariant);
    elements['variant-delete'].addEventListener('click', deleteVariant);
    elements['json-copy'].addEventListener('click', function () { copyText(elements['json-text'].value, 'Layout JSONをclipboardへcopyしました。'); });
    elements['json-download'].addEventListener('click', function () { downloadText('knowledge-share-meeting-layout-v1.json', elements['json-text'].value, 'application/json;charset=utf-8'); });
    elements['json-import'].addEventListener('click', applyJsonText);
    elements['json-file'].addEventListener('change', function () {
      const file = elements['json-file'].files && elements['json-file'].files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () { elements['json-text'].value = String(reader.result); setStatus('JSON fileを読み込みました。「このJSONを適用」で検証します。'); };
      reader.onerror = function () { setStatus('JSON fileを読み込めませんでした。', 'error'); };
      reader.readAsText(file, 'utf-8');
    });
    elements['handoff-copy'].addEventListener('click', function () { copyText(elements['handoff-text'].value, 'Codex handoffをclipboardへcopyしました。'); });
    elements['handoff-download'].addEventListener('click', function () { downloadText('knowledge-share-layout-handoff.md', elements['handoff-text'].value, 'text/markdown;charset=utf-8'); });
    bindInspectorControls();
    bindReferenceControls();
    window.addEventListener('resize', updatePreviewScale);
    if (typeof ResizeObserver === 'function') new ResizeObserver(updatePreviewScale).observe(elements['canvas-scroll']);
  }

  function init() {
    cacheElements();
    bindEvents();
    renderVariants();
    renderAll();
    setStatus('Current v8 baselineを読み込みました。すべての操作はlocal browser内だけで完結します。');
    window.LayoutLabApp = {
      getLayoutJson: function () { return model.stableStringify(current()); },
      isReferenceLoaded: function () { return referenceLoaded; }
    };
  }

  init();
})();
