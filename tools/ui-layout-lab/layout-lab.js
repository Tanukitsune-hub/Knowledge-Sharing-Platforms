(function () {
  'use strict';

  const presets = window.LayoutLabPresets;
  const model = window.LayoutLabModel;
  const STORAGE_KEY = 'knowledge-share-ui-layout-lab-variants-v1';
  const RESIZE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  const elements = {};
  let history = model.createHistory(presets.getPreset('current-v8'), 50);
  let selectedId = 'meeting-date';
  let savedSnapshot = model.stableStringify(history.current());
  let draggedId = null;
  let dragIntent = null;
  let referenceLoaded = false;

  function byId(id) { return document.getElementById(id); }

  function cacheElements() {
    [
      'viewport-buttons', 'precision-buttons', 'undo-button', 'redo-button', 'tidy-button', 'reset-button', 'json-button', 'handoff-button',
      'dirty-indicator', 'preset-list', 'field-palette', 'visible-field-count', 'variant-name', 'variant-select',
      'variant-save', 'variant-load', 'variant-delete', 'viewport-caption', 'canvas-scroll', 'preview-frame',
      'preview-viewport', 'mock-container', 'mock-grid', 'preset-origin-chip', 'status-message', 'field-inspector-empty',
      'field-inspector', 'selected-field-label', 'selected-field-id', 'selected-field-order', 'field-order', 'field-start',
      'field-span', 'field-top-gap', 'field-height-group', 'field-height', 'field-break-before', 'field-visible',
      'top-gap-less', 'top-gap-more', 'container-width', 'container-width-output', 'container-max-width', 'container-align',
      'column-gap', 'row-gap', 'show-grid', 'reference-file', 'reference-overlay', 'reference-opacity',
      'reference-opacity-output', 'reference-clear', 'lint-count', 'lint-list', 'transfer-dialog', 'dialog-title',
      'json-panel', 'handoff-panel', 'json-text', 'json-copy', 'json-download', 'json-file', 'json-import',
      'handoff-text', 'handoff-copy', 'handoff-download'
    ].forEach(function (id) { elements[id] = byId(id); });
  }

  function current() { return history.current(); }
  function definition(id) { return presets.fieldDefinitionById[id]; }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function setStatus(message, tone) {
    elements['status-message'].textContent = message || '';
    elements['status-message'].className = 'status-message' + (tone ? ' ' + tone : '');
  }

  function commit(next, message, tone) {
    history.record(next);
    renderAll();
    if (message) setStatus(message, tone || 'success');
  }

  function isDirty() { return model.stableStringify(current()) !== savedSnapshot; }

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

  function renderPrecisionButtons() {
    const layout = current();
    elements['precision-buttons'].innerHTML = '';
    [{ columns: 12, label: 'Standard' }, { columns: 24, label: 'Fine' }].forEach(function (mode) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = layout.container.gridColumns === mode.columns ? 'active' : '';
      button.dataset.gridColumns = String(mode.columns);
      button.innerHTML = mode.label + '<span>' + mode.columns + ' columns</span>';
      button.addEventListener('click', function () {
        if (layout.container.gridColumns === mode.columns) return;
        const lossy = model.gridConversionLosesFidelity(layout, mode.columns);
        commit(model.convertGrid(layout, mode.columns), lossy ? 'Standardへ安全にnormalizeしました。奇数unitはnearest columnへ丸められています。' : mode.label + ' precisionへ切り替えました。', lossy ? 'error' : 'success');
      });
      elements['precision-buttons'].appendChild(button);
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
        if (layout.container.gridColumns === 24) Object.assign(next, model.convertGrid(next, 24));
        selectedId = next.fields[0].id;
        commit(next, preset.name + 'をv2 editable stateとして適用しました。');
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
      code.textContent = field.colStart + '→' + (field.colStart + field.colSpan - 1);
      label.append(checkbox, text, code);
      elements['field-palette'].appendChild(label);
    });
    elements['visible-field-count'].textContent = visibleCount + '/' + layout.fields.length;
  }

  function createMockControl(field) {
    const fieldDefinition = definition(field.id);
    let control;
    if (fieldDefinition.kind === 'checks') {
      control = document.createElement('div');
      control.className = 'mock-control checks';
      ['定例年1回', '先方オフィス訪問', '年次総会'].forEach(function (text) {
        const item = document.createElement('span');
        item.textContent = text;
        control.appendChild(item);
      });
    } else if (fieldDefinition.kind === 'textarea') {
      control = document.createElement('div');
      control.className = 'mock-control textarea';
      control.textContent = '面談内容を自由に記載してください。';
    } else if (fieldDefinition.kind === 'attachment') {
      control = document.createElement('div');
      control.className = 'attachment-control';
      const content = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = '資料をここへdrag & drop';
      const text = document.createElement('span');
      text.textContent = 'またはlocal fileを選択';
      content.append(strong, text);
      control.appendChild(content);
    } else {
      control = document.createElement('div');
      control.className = 'mock-control';
      const examples = {
        'meeting-date': '2026/09/18', 'meeting-time': '10:00', 'meeting-locationId': 'Tokyo Office',
        'meeting-counterpartyId': 'North Harbor Partners（GP / 運用会社）', 'meeting-assetClassId': 'Private Equity',
        'meeting-capitalTypeId': 'Equity', 'meeting-teamId': 'Investment Team', 'meeting-fundStrategy': 'Global Buyout',
        'meeting-counterparty': 'Jane Smith / Partner', 'meeting-internalParticipants': '投資部 A、B'
      };
      control.textContent = examples[field.id] || '—';
    }
    control.style.height = field.heightPx + 'px';
    return control;
  }

  function clearEditorAids() {
    elements['mock-grid'].querySelectorAll('.drop-ghost,.row-insertion-marker,.alignment-guide,.grid-overflow-note').forEach(function (node) { node.remove(); });
  }

  function addAlignmentGuides(colStart, colSpan, activeId) {
    const columns = current().container.gridColumns;
    [colStart - 1, colStart + colSpan - 1].forEach(function (line) {
      const guide = document.createElement('div');
      guide.className = 'alignment-guide';
      guide.style.left = (line / columns * 100) + '%';
      elements['mock-grid'].appendChild(guide);
    });
    const center = document.createElement('div');
    center.className = 'alignment-guide center';
    center.style.left = '50%';
    elements['mock-grid'].appendChild(center);
    const targetEdges = [colStart - 1, colStart + colSpan - 1];
    const nearbyEdges = new Set();
    current().fields.filter(function (field) { return field.visible && field.id !== activeId; }).forEach(function (field) {
      [field.colStart - 1, field.colStart + field.colSpan - 1].forEach(function (edge) {
        if (targetEdges.some(function (targetEdge) { return Math.abs(targetEdge - edge) <= 1; })) nearbyEdges.add(edge);
      });
    });
    nearbyEdges.forEach(function (edge) {
      const guide = document.createElement('div');
      guide.className = 'alignment-guide nearby';
      guide.style.left = (edge / columns * 100) + '%';
      elements['mock-grid'].appendChild(guide);
    });
  }

  function addBoundaryNote(message) {
    const note = document.createElement('div');
    note.className = 'grid-overflow-note';
    note.textContent = message;
    elements['mock-grid'].appendChild(note);
  }

  function startResize(event, field, direction) {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const card = handle.closest('.field-card');
    const control = card.querySelector('.mock-control,.attachment-control');
    const startLayout = current();
    const startX = event.clientX;
    const startY = event.clientY;
    const gridRect = elements['mock-grid'].getBoundingClientRect();
    const unitWidth = Math.max(1, gridRect.width / startLayout.container.gridColumns);
    const transformScale = Math.max(.05, gridRect.width / Math.max(1, elements['mock-grid'].offsetWidth));
    let preview = { resolved: startLayout, requested: startLayout, collisions: [] };
    let changed = false;
    const badge = document.createElement('div');
    badge.className = 'resize-live-badge';
    card.appendChild(badge);
    handle.setPointerCapture(event.pointerId);

    function move(moveEvent) {
      const deltaColumns = Math.round((moveEvent.clientX - startX) / unitWidth);
      const deltaYPx = Math.round((moveEvent.clientY - startY) / transformScale);
      let rawStart = field.colStart;
      let rawSpan = field.colSpan;
      if (direction.includes('e')) rawSpan += deltaColumns;
      if (direction.includes('w')) {
        rawStart += deltaColumns;
        rawSpan -= deltaColumns;
      }
      const touchesBoundary = rawStart < 1 || rawSpan < 1 || rawStart + rawSpan - 1 > startLayout.container.gridColumns;
      preview = model.previewResize(startLayout, field.id, direction, deltaColumns, deltaYPx);
      const nextField = preview.requested.fields.find(function (item) { return item.id === field.id; });
      card.style.gridColumn = nextField.colStart + ' / span ' + nextField.colSpan;
      card.style.marginTop = nextField.topGapPx + 'px';
      control.style.height = nextField.heightPx + 'px';
      card.classList.toggle('collision', preview.collisions.length > 0);
      badge.textContent = 'start ' + nextField.colStart + ' · span ' + nextField.colSpan + ' · h ' + nextField.heightPx + ' · gap ' + nextField.topGapPx;
      clearEditorAids();
      addAlignmentGuides(nextField.colStart, nextField.colSpan, field.id);
      if (touchesBoundary) addBoundaryNote('GRID BOUNDARY · safe clamp');
      changed = model.stableStringify(preview.resolved) !== model.stableStringify(startLayout);
    }

    function finish(commitChange) {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', pointerUp);
      handle.removeEventListener('pointercancel', pointerCancel);
      clearEditorAids();
      if (commitChange && changed) commit(preview.resolved, definition(field.id).label + 'を' + direction.toUpperCase() + ' handleでresizeしました。');
      else renderAll();
    }
    function pointerUp() { finish(true); }
    function pointerCancel() { finish(false); }
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', pointerUp);
    handle.addEventListener('pointercancel', pointerCancel);
  }

  function handleResizeKey(event, field, direction) {
    const horizontal = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    const vertical = event.key === 'ArrowDown' ? 8 : event.key === 'ArrowUp' ? -8 : 0;
    if (!horizontal && !vertical) return;
    event.preventDefault();
    event.stopPropagation();
    const hDelta = direction.includes('e') || direction.includes('w') ? horizontal : 0;
    const vDelta = direction.includes('n') || direction.includes('s') ? vertical : 0;
    commit(model.resizeField(current(), field.id, direction, hDelta, vDelta), definition(field.id).label + 'をkeyboard resizeしました。');
  }

  function createFieldCard(field, row) {
    const fieldDefinition = definition(field.id);
    const card = document.createElement('article');
    card.className = 'field-card' + (selectedId === field.id ? ' selected' : '');
    card.dataset.fieldId = field.id;
    card.draggable = true;
    card.tabIndex = 0;
    card.style.gridColumn = field.colStart + ' / span ' + field.colSpan;
    card.style.gridRow = String(row);
    card.style.marginTop = field.topGapPx + 'px';
    card.addEventListener('click', function () {
      selectedId = field.id;
      renderCanvas();
      renderInspector();
      const selected = elements['mock-grid'].querySelector('[data-field-id="' + field.id + '"]');
      if (selected) selected.focus({ preventScroll: true });
    });
    card.addEventListener('dragstart', function (event) {
      if (event.target.classList.contains('resize-handle')) {
        event.preventDefault();
        return;
      }
      draggedId = field.id;
      selectedId = field.id;
      card.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', field.id);
    });
    card.addEventListener('dragend', function () {
      draggedId = null;
      dragIntent = null;
      clearEditorAids();
      document.querySelectorAll('.field-card').forEach(function (item) { item.classList.remove('dragging', 'collision'); });
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
    badge.textContent = field.colStart + '–' + (field.colStart + field.colSpan - 1) + ' / ' + current().container.gridColumns;
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
    if (selectedId === field.id) {
      RESIZE_DIRECTIONS.forEach(function (direction) {
        const handle = document.createElement('div');
        handle.className = 'resize-handle resize-' + direction;
        handle.dataset.resizeDirection = direction;
        handle.setAttribute('role', 'separator');
        handle.setAttribute('aria-label', fieldDefinition.label + ' ' + direction.toUpperCase() + ' resize');
        handle.tabIndex = 0;
        handle.draggable = false;
        handle.addEventListener('pointerdown', function (event) { startResize(event, field, direction); });
        handle.addEventListener('keydown', function (event) { handleResizeKey(event, field, direction); });
        card.appendChild(handle);
      });
    }
    return card;
  }

  function computeDragIntent(event) {
    if (!draggedId) return null;
    const layout = current();
    const moved = layout.fields.find(function (field) { return field.id === draggedId; });
    const gridRect = elements['mock-grid'].getBoundingClientRect();
    const columns = layout.container.gridColumns;
    const unit = gridRect.width / columns;
    const rawColStart = Math.floor((event.clientX - gridRect.left) / Math.max(1, unit)) + 1;
    const colStart = clamp(rawColStart, 1, columns - moved.colSpan + 1);
    const cards = Array.from(elements['mock-grid'].querySelectorAll('.field-card:not(.dragging)'));
    let order = layout.fields.length;
    let breakBefore = true;
    let markerY = Math.max(0, event.clientY - gridRect.top);
    let ghostY = markerY;
    let matched = false;
    cards.forEach(function (card) {
      if (matched) return;
      const rect = card.getBoundingClientRect();
      const fieldId = card.dataset.fieldId;
      const target = layout.fields.find(function (item) { return item.id === fieldId; });
      if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
        matched = true;
        const ratio = (event.clientY - rect.top) / Math.max(1, rect.height);
        if (ratio < .22) {
          order = target.order;
          breakBefore = true;
          markerY = rect.top - gridRect.top;
          ghostY = markerY + 3;
        } else if (ratio > .78) {
          order = target.order + 1;
          breakBefore = true;
          markerY = rect.bottom - gridRect.top;
          ghostY = markerY + layout.container.rowGapPx;
        } else {
          order = event.clientX < rect.left + rect.width / 2 ? target.order : target.order + 1;
          breakBefore = false;
          markerY = rect.top - gridRect.top;
          ghostY = markerY;
        }
      } else if (event.clientY < rect.top) {
        matched = true;
        order = target.order;
        breakBefore = true;
        markerY = rect.top - gridRect.top;
        ghostY = markerY + 3;
      }
    });
    if (!matched && cards.length) {
      const lastRect = cards[cards.length - 1].getBoundingClientRect();
      markerY = lastRect.bottom - gridRect.top;
      ghostY = markerY + layout.container.rowGapPx;
    }
    const preview = model.previewPlacement(layout, draggedId, { order: order, colStart: colStart, breakBefore: breakBefore });
    return { order: order, colStart: colStart, breakBefore: breakBefore, boundaryClamped: rawColStart !== colStart, ghostY: Math.max(0, ghostY), markerY: Math.max(0, markerY), preview: preview };
  }

  function renderDragIntent(intent) {
    clearEditorAids();
    if (!intent || !draggedId) return;
    const layout = current();
    const field = layout.fields.find(function (item) { return item.id === draggedId; });
    const ghost = document.createElement('div');
    ghost.className = 'drop-ghost' + (intent.preview.collisionResolved ? ' collision' : '');
    ghost.style.left = ((intent.colStart - 1) / layout.container.gridColumns * 100) + '%';
    ghost.style.width = (field.colSpan / layout.container.gridColumns * 100) + '%';
    ghost.style.top = intent.ghostY + 'px';
    ghost.style.height = Math.min(110, field.heightPx + 34) + 'px';
    const label = document.createElement('span');
    label.className = 'drop-ghost-label';
    label.textContent = 'start ' + intent.colStart + ' · span ' + field.colSpan + (intent.preview.collisionResolved ? ' · push next row' : '');
    ghost.appendChild(label);
    elements['mock-grid'].appendChild(ghost);
    if (intent.breakBefore) {
      const marker = document.createElement('div');
      marker.className = 'row-insertion-marker';
      marker.style.top = intent.markerY + 'px';
      elements['mock-grid'].appendChild(marker);
    }
    addAlignmentGuides(intent.colStart, field.colSpan, draggedId);
    if (intent.boundaryClamped) addBoundaryNote('GRID BOUNDARY · safe clamp');
  }

  function bindGridDrag() {
    elements['mock-grid'].ondragover = function (event) {
      if (!draggedId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      dragIntent = computeDragIntent(event);
      renderDragIntent(dragIntent);
    };
    elements['mock-grid'].ondrop = function (event) {
      event.preventDefault();
      const movedId = draggedId || event.dataTransfer.getData('text/plain');
      const intent = dragIntent || computeDragIntent(event);
      clearEditorAids();
      draggedId = null;
      dragIntent = null;
      if (!movedId || !intent) return renderAll();
      selectedId = movedId;
      const next = model.placeField(current(), movedId, { order: intent.order, colStart: intent.colStart, breakBefore: intent.breakBefore });
      commit(next, definition(movedId).label + 'をstart ' + intent.colStart + (intent.breakBefore ? 'のnew row' : 'のrow内') + 'へ配置しました。' + (intent.preview.collisionResolved ? ' 衝突は次rowへpushしました。' : ''));
    };
    elements['mock-grid'].ondragleave = function (event) {
      if (!elements['mock-grid'].contains(event.relatedTarget)) clearEditorAids();
    };
  }

  function estimatedPreviewHeight(layout) {
    const visible = layout.fields.filter(function (field) { return field.visible; });
    if (layout.viewport.id === 'mobile') {
      return 360 + visible.reduce(function (sum, field) { return sum + field.heightPx + field.topGapPx + 58 + layout.container.rowGapPx; }, 0);
    }
    const placements = model.getFieldRows(layout);
    const rowHeights = {};
    placements.forEach(function (placement) {
      const field = layout.fields.find(function (item) { return item.id === placement.id; });
      rowHeights[placement.row] = Math.max(rowHeights[placement.row] || 0, field.heightPx + field.topGapPx + 52);
    });
    return Math.max(900, Object.keys(rowHeights).reduce(function (sum, row) { return sum + rowHeights[row] + layout.container.rowGapPx; }, 285));
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
    const placementById = Object.fromEntries(model.getFieldRows(layout).map(function (placement) { return [placement.id, placement]; }));
    elements['viewport-caption'].textContent = viewport.label.toUpperCase() + ' / ' + viewport.widthPx + ' PX / ' + container.gridColumns + ' COLUMNS';
    elements['preset-origin-chip'].textContent = 'v2 · ' + container.gridColumns + ' cols · ' + layout.presetOrigin;
    elements['preview-viewport'].classList.toggle('mobile', viewport.widthPx <= 720);
    elements['mock-container'].style.width = container.widthPercent + '%';
    elements['mock-container'].style.maxWidth = container.maxWidthPx === null ? 'none' : container.maxWidthPx + 'px';
    elements['mock-container'].style.marginLeft = container.align === 'center' ? 'auto' : '0';
    elements['mock-container'].style.marginRight = 'auto';
    elements['mock-grid'].style.setProperty('--grid-columns', String(container.gridColumns));
    elements['mock-grid'].style.columnGap = container.columnGapPx + 'px';
    elements['mock-grid'].style.rowGap = container.rowGapPx + 'px';
    elements['mock-grid'].classList.toggle('show-grid', container.showGrid);
    elements['mock-grid'].innerHTML = '';
    layout.fields.filter(function (field) { return field.visible; }).forEach(function (field) {
      elements['mock-grid'].appendChild(createFieldCard(field, placementById[field.id].row));
    });
    bindGridDrag();
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
    const limits = model.HEIGHT_LIMITS[field.role];
    elements['field-inspector-empty'].hidden = true;
    elements['field-inspector'].hidden = false;
    elements['selected-field-label'].textContent = fieldDefinition.label;
    elements['selected-field-id'].textContent = field.id;
    elements['selected-field-order'].textContent = '#' + field.order;
    elements['field-order'].value = String(field.order);
    elements['field-order'].max = String(layout.fields.length);
    elements['field-start'].value = String(field.colStart);
    elements['field-start'].max = String(layout.container.gridColumns - field.colSpan + 1);
    elements['field-span'].value = String(field.colSpan);
    elements['field-span'].max = String(layout.container.gridColumns - field.colStart + 1);
    elements['field-top-gap'].value = String(field.topGapPx);
    elements['field-height'].value = String(field.heightPx);
    elements['field-height'].min = String(limits.min);
    elements['field-height'].max = String(limits.max);
    elements['field-break-before'].checked = field.breakBefore;
    elements['field-visible'].checked = field.visible;
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
    elements['lint-count'].textContent = String(warnings.filter(function (warning) { return warning.tone !== 'ok'; }).length);
  }

  function renderHistoryButtons() {
    elements['undo-button'].disabled = !history.canUndo();
    elements['redo-button'].disabled = !history.canRedo();
  }

  function renderAll() {
    renderViewportButtons();
    renderPrecisionButtons();
    renderPresetList();
    renderFieldPalette();
    renderCanvas();
    renderInspector();
    renderLint();
    renderHistoryButtons();
    renderDirtyState();
    document.body.dataset.layoutLabReady = 'true';
    document.body.dataset.specVersion = String(presets.SPEC_VERSION);
  }

  function readVariants() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const migrated = model.migrateVariantMap(parsed);
      if (JSON.stringify(migrated) !== JSON.stringify(parsed)) localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
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
    setStatus('variant「' + name + '」をspec v2で保存しました。', 'success');
  }

  function loadVariant() {
    const name = elements['variant-select'].value;
    const variants = readVariants();
    if (!name || !variants[name]) return setStatus('読み込むvariantを選択してください。', 'error');
    try {
      const layout = model.parseLayoutJson(variants[name]);
      history.reset(layout);
      selectedId = layout.fields[0].id;
      savedSnapshot = model.stableStringify(layout);
      elements['variant-name'].value = name;
      renderAll();
      setStatus('variant「' + name + '」をv2 stateとして読み込みました。', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  function deleteVariant() {
    const name = elements['variant-select'].value;
    const variants = readVariants();
    if (!name || !variants[name]) return setStatus('削除するvariantを選択してください。', 'error');
    delete variants[name];
    if (!writeVariants(variants)) return;
    renderVariants();
    setStatus('variant「' + name + '」を削除しました。', 'success');
  }

  function showDialog(mode) {
    const isJson = mode === 'json';
    elements['json-panel'].hidden = !isJson;
    elements['handoff-panel'].hidden = isJson;
    elements['dialog-title'].textContent = isJson ? 'Layout JSON v2' : 'Codex handoff';
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
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') navigator.clipboard.writeText(text).then(function () { setStatus(successMessage, 'success'); }).catch(fallback);
    else fallback();
  }

  function applyJsonText() {
    try {
      const parsed = model.parseLayoutJson(elements['json-text'].value);
      history.record(parsed);
      selectedId = parsed.fields[0].id;
      elements['json-text'].value = model.stableStringify(parsed);
      renderAll();
      setStatus('Layout JSONをv2へ検証/migrateし、exact canonical formで適用しました。', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  function bindInspectorControls() {
    elements['field-order'].addEventListener('change', function () {
      const field = current().fields.find(function (item) { return item.id === selectedId; });
      commit(model.placeField(current(), selectedId, { order: Number(elements['field-order'].value), colStart: field.colStart, breakBefore: field.breakBefore }), 'field orderを更新しました。');
    });
    elements['field-start'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { colStart: Number(elements['field-start'].value) }), 'start columnを更新しました。'); });
    elements['field-span'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { colSpan: Number(elements['field-span'].value) }), 'field spanを更新しました。'); });
    elements['field-top-gap'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { topGapPx: Number(elements['field-top-gap'].value) }), 'top gapを更新しました。'); });
    elements['field-height'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { heightPx: Number(elements['field-height'].value) }), 'field高さを更新しました。'); });
    elements['field-break-before'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { breakBefore: elements['field-break-before'].checked }), 'row breakを更新しました。'); });
    elements['field-visible'].addEventListener('change', function () { commit(model.updateField(current(), selectedId, { visible: elements['field-visible'].checked }), 'field表示を更新しました。'); });
    elements['top-gap-less'].addEventListener('click', function () {
      const field = current().fields.find(function (item) { return item.id === selectedId; });
      commit(model.updateField(current(), selectedId, { topGapPx: field.topGapPx - 4 }), 'top gapを4px縮めました。');
    });
    elements['top-gap-more'].addEventListener('click', function () {
      const field = current().fields.find(function (item) { return item.id === selectedId; });
      commit(model.updateField(current(), selectedId, { topGapPx: field.topGapPx + 4 }), 'top gapを4px広げました。');
    });
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
      if (!file.type.startsWith('image/')) return setStatus('画像fileを選択してください。', 'error');
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

  function bindFineNudge() {
    document.addEventListener('keydown', function (event) {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input,select,textarea,button,[contenteditable="true"]')) return;
      if (!elements['canvas-scroll'].contains(target) && target !== elements['canvas-scroll']) return;
      const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
      const direction = directions[event.key];
      if (!direction || !selectedId) return;
      event.preventDefault();
      commit(model.nudgeField(current(), selectedId, direction, event.shiftKey), definition(selectedId).label + 'を' + (event.shiftKey ? 'large ' : '') + direction + 'へnudgeしました。');
    });
  }

  function bindEvents() {
    elements['canvas-scroll'].tabIndex = 0;
    elements['undo-button'].addEventListener('click', function () { history.undo(); renderAll(); setStatus('1つ前のgestureへ戻しました。'); });
    elements['redo-button'].addEventListener('click', function () { history.redo(); renderAll(); setStatus('gestureをやり直しました。'); });
    elements['tidy-button'].addEventListener('click', function () { commit(model.tidyLayout(current()), 'v2 placementをdeterministic heuristicで整えました。'); });
    elements['reset-button'].addEventListener('click', function () {
      const baseline = presets.getPreset('current-v8');
      history.reset(baseline);
      selectedId = 'meeting-date';
      savedSnapshot = model.stableStringify(baseline);
      renderAll();
      setStatus('Current v8 spec v2 baselineへresetしました。');
    });
    elements['json-button'].addEventListener('click', function () { showDialog('json'); });
    elements['handoff-button'].addEventListener('click', function () { showDialog('handoff'); });
    elements['variant-save'].addEventListener('click', saveVariant);
    elements['variant-load'].addEventListener('click', loadVariant);
    elements['variant-delete'].addEventListener('click', deleteVariant);
    elements['json-copy'].addEventListener('click', function () { copyText(elements['json-text'].value, 'Layout JSON v2をclipboardへcopyしました。'); });
    elements['json-download'].addEventListener('click', function () { downloadText('knowledge-share-meeting-layout-v2.json', elements['json-text'].value, 'application/json;charset=utf-8'); });
    elements['json-import'].addEventListener('click', applyJsonText);
    elements['json-file'].addEventListener('change', function () {
      const file = elements['json-file'].files && elements['json-file'].files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () { elements['json-text'].value = String(reader.result); setStatus('JSON fileを読み込みました。「このJSONを適用」でv1/v2を検証します。'); };
      reader.onerror = function () { setStatus('JSON fileを読み込めませんでした。', 'error'); };
      reader.readAsText(file, 'utf-8');
    });
    elements['handoff-copy'].addEventListener('click', function () { copyText(elements['handoff-text'].value, 'Codex handoffをclipboardへcopyしました。'); });
    elements['handoff-download'].addEventListener('click', function () { downloadText('knowledge-share-layout-handoff.md', elements['handoff-text'].value, 'text/markdown;charset=utf-8'); });
    bindInspectorControls();
    bindReferenceControls();
    bindFineNudge();
    window.addEventListener('resize', updatePreviewScale);
    if (typeof ResizeObserver === 'function') new ResizeObserver(updatePreviewScale).observe(elements['canvas-scroll']);
  }

  function init() {
    cacheElements();
    bindEvents();
    renderVariants();
    renderAll();
    setStatus('Spec v2 direct manipulation editorを読み込みました。8 handles、row/column drag、12/24 precisionをlocalで利用できます。');
    window.LayoutLabApp = {
      getLayoutJson: function () { return model.stableStringify(current()); },
      getSelectedId: function () { return selectedId; },
      isReferenceLoaded: function () { return referenceLoaded; }
    };
  }

  init();
})();
