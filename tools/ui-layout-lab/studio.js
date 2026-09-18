(function () {
  'use strict';

  const model = window.UiStudioModel;
  const definitions = window.UiStudioScreens;
  const elements = {};
  let history = model.createHistory(model.createDefaultProject());
  let currentScreenId = 'meeting-create';
  let selectedElementId = 'meeting-date';
  let overviewMode = false;
  let previewViewportId = 'wide';
  let dialogMode = 'project-json';
  let variants = {};
  let gesture = null;
  const references = {};
  const RESIZE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  function byId(id) { return document.getElementById(id); }

  function cacheElements() {
    [
      'viewport-buttons', 'precision-buttons', 'micro-snap-buttons', 'undo-button', 'redo-button', 'tidy-button', 'reset-button', 'reset-project-button', 'json-button', 'handoff-button',
      'dirty-indicator', 'overview-button', 'previous-screen', 'next-screen', 'screen-select', 'screen-list', 'preset-list', 'field-palette', 'visible-field-count', 'variant-name', 'variant-select',
      'variant-save', 'variant-load', 'variant-delete', 'viewport-caption', 'canvas-title', 'canvas-scroll', 'preview-frame', 'preview-viewport', 'mock-sidebar', 'mock-nav',
      'mock-container', 'screen-preview', 'overview-grid', 'mock-eyebrow', 'mock-title', 'mock-grid', 'preset-origin-chip', 'status-message', 'alignment-guides', 'drop-ghost', 'row-insertion-marker',
      'field-inspector-empty', 'field-inspector', 'selected-field-label', 'selected-field-id', 'selected-field-order', 'field-order', 'field-start', 'field-span', 'field-x-offset', 'field-y-offset', 'field-width-adjust',
      'field-top-gap', 'field-height-group', 'field-height', 'field-break-before', 'field-visible', 'top-gap-less', 'top-gap-more', 'normalize-micro', 'container-width', 'container-width-output',
      'container-max-width', 'container-align', 'column-gap', 'row-gap', 'show-grid', 'shared-page-width', 'shared-max-width', 'shared-sidebar-width', 'shared-card-radius', 'shared-block-gap',
      'shared-control-height', 'shared-page-align', 'shared-gold', 'shared-depth', 'shared-ornament-opacity', 'shared-ornament-scale', 'reference-file', 'reference-overlay', 'reference-opacity',
      'reference-opacity-output', 'reference-clear', 'lint-count', 'lint-list', 'transfer-dialog', 'dialog-title', 'dialog-screen-json', 'dialog-project-json', 'dialog-screen-handoff', 'dialog-project-handoff',
      'json-panel', 'handoff-panel', 'json-text', 'json-copy', 'json-download', 'json-file', 'json-import', 'handoff-text', 'handoff-copy', 'handoff-download'
    ].forEach(function (id) { elements[id] = byId(id); });
  }

  function currentProject() { return history.current(); }
  function currentScreen() { return currentProject().screens[currentScreenId]; }

  function setStatus(message, isError) {
    elements['status-message'].textContent = message || '';
    elements['status-message'].classList.toggle('error', Boolean(isError));
  }

  function commit(next, message) {
    history.record(next);
    if (message) setStatus(message, false);
    render();
  }

  function selectScreen(screenId) {
    if (!definitions.SCREEN_IDS.includes(screenId)) return;
    currentScreenId = screenId;
    overviewMode = false;
    const first = model.flattenElements(currentProject().screens[screenId]).find(function (entry) { return entry.element.visible; });
    selectedElementId = first ? first.element.id : null;
    render();
  }

  function renderScreenNavigation() {
    const dirty = new Set(history.dirtyScreens());
    elements['screen-select'].innerHTML = '';
    elements['screen-list'].innerHTML = '';
    definitions.SCREEN_DEFINITIONS.forEach(function (definition, index) {
      const option = document.createElement('option');
      option.value = definition.id;
      option.textContent = definition.label;
      option.selected = definition.id === currentScreenId;
      elements['screen-select'].appendChild(option);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'screen-button' + (definition.id === currentScreenId && !overviewMode ? ' active' : '') + (dirty.has(definition.id) ? ' dirty' : '');
      button.innerHTML = '<span class="screen-number">' + (index + 1) + '</span><span class="screen-name">' + definition.label + '</span><span class="dirty-dot" title="modified"></span>';
      button.addEventListener('click', function () { selectScreen(definition.id); });
      elements['screen-list'].appendChild(button);
    });
    elements['overview-button'].classList.toggle('active', overviewMode);
  }

  function renderViewportButtons() {
    elements['viewport-buttons'].innerHTML = '';
    Object.keys(definitions.VIEWPORTS).forEach(function (id) {
      const viewport = definitions.VIEWPORTS[id];
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = viewport.label.replace(/\s\d+$/, '');
      button.className = id === previewViewportId ? 'active' : '';
      button.addEventListener('click', function () { previewViewportId = id; renderPreviewOnly(); });
      elements['viewport-buttons'].appendChild(button);
    });
  }

  function renderPrecision() {
    const screen = currentScreen();
    elements['precision-buttons'].innerHTML = '';
    model.GRID_COLUMNS.forEach(function (columns) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = columns + ' col';
      button.className = columns === screen.gridColumns ? 'active' : '';
      button.addEventListener('click', function () { commit(model.convertScreenGrid(currentProject(), currentScreenId, columns), columns + '-columnへ変換しました。'); });
      elements['precision-buttons'].appendChild(button);
    });
    elements['micro-snap-buttons'].innerHTML = '';
    model.MICRO_SNAPS.forEach(function (step) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = step + 'px';
      button.className = step === screen.microSnapPx ? 'active' : '';
      button.addEventListener('click', function () { commit(model.setMicroSnap(currentProject(), currentScreenId, step), step + 'px micro snapへ変更しました。'); });
      elements['micro-snap-buttons'].appendChild(button);
    });
  }

  function renderPresets() {
    elements['preset-list'].innerHTML = '';
    Object.keys(model.PRESETS).forEach(function (id) {
      const preset = model.PRESETS[id];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset-button' + (currentScreen().presetOrigin === id ? ' active' : '');
      button.innerHTML = '<strong>' + preset.name + '</strong><span>' + preset.description + '</span>';
      button.addEventListener('click', function () { commit(model.applyPreset(currentProject(), id), preset.name + 'を7画面へ適用しました。'); });
      elements['preset-list'].appendChild(button);
    });
  }

  function paletteItem(entry, isChild) {
    const item = entry.element;
    const label = document.createElement('label');
    label.className = 'palette-item' + (isChild ? ' child' : '') + (selectedElementId === item.id ? ' selected' : '');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.visible;
    checkbox.addEventListener('change', function () { commit(model.updateElement(currentProject(), currentScreenId, item.id, { visible: checkbox.checked }), item.label + 'の表示を変更しました。'); });
    const name = document.createElement('strong');
    name.textContent = item.label;
    const kind = document.createElement('span');
    kind.className = 'palette-kind';
    kind.textContent = item.kind;
    label.appendChild(checkbox); label.appendChild(name); label.appendChild(kind);
    label.addEventListener('click', function (event) {
      if (event.target !== checkbox) { event.preventDefault(); selectedElementId = item.id; render(); }
    });
    return label;
  }

  function renderPalette() {
    const screen = currentScreen();
    elements['field-palette'].innerHTML = '';
    let visible = 0;
    screen.blocks.forEach(function (block) {
      if (block.visible) visible += 1;
      elements['field-palette'].appendChild(paletteItem({ element: block }, false));
      (block.children || []).forEach(function (child) {
        if (child.visible) visible += 1;
        elements['field-palette'].appendChild(paletteItem({ element: child }, true));
      });
    });
    elements['visible-field-count'].textContent = String(visible);
  }

  function renderMockNavigation() {
    elements['mock-nav'].innerHTML = '';
    definitions.SCREEN_DEFINITIONS.forEach(function (definition) {
      const item = document.createElement('div');
      item.className = 'mock-nav-item' + (definition.id === currentScreenId ? ' active' : '');
      item.textContent = definition.label;
      elements['mock-nav'].appendChild(item);
    });
  }

  function makeHandles(card, elementId) {
    if (selectedElementId !== elementId || previewViewportId === 'mobile') return;
    RESIZE_DIRECTIONS.forEach(function (direction) {
      const handle = document.createElement('span');
      handle.className = 'resize-handle';
      handle.dataset.direction = direction;
      handle.addEventListener('pointerdown', function (event) { beginResize(event, elementId, direction, card); });
      card.appendChild(handle);
    });
  }

  function renderBlock(item, row, parentId) {
    const card = document.createElement('div');
    card.className = 'studio-block' + (selectedElementId === item.id ? ' selected' : '');
    card.dataset.elementId = item.id;
    card.dataset.kind = item.kind;
    card.dataset.parentId = parentId || '';
    card.style.gridColumn = item.colStart + ' / span ' + item.colSpan;
    card.style.gridRow = String(row);
    card.style.setProperty('--x-offset', item.xOffsetPx + 'px');
    card.style.setProperty('--y-offset', (item.yOffsetPx + item.topGapPx) + 'px');
    card.style.setProperty('--width-adjust', item.widthAdjustPx + 'px');
    card.style.setProperty('--block-height', item.heightPx + 'px');
    card.innerHTML = '<div class="block-head"><span class="block-label">' + item.label + '</span><span class="block-measure">' + item.colStart + ':' + item.colSpan + ' · ' + item.xOffsetPx + '/' + item.yOffsetPx + 'px</span></div>';
    if (item.children && item.children.length) {
      const nested = document.createElement('div');
      nested.className = 'nested-grid' + (currentScreen().container.showGrid ? ' show-grid' : '');
      nested.dataset.parentId = item.id;
      nested.style.setProperty('--grid-columns', currentScreen().gridColumns);
      nested.style.setProperty('--column-gap', Math.max(4, currentScreen().container.columnGapPx / 2) + 'px');
      nested.style.setProperty('--row-gap', Math.max(4, currentScreen().container.rowGapPx / 2) + 'px');
      const placements = model.rowPlacements(item.children);
      placements.forEach(function (placement) { nested.appendChild(renderBlock(placement.element, placement.row, item.id)); });
      card.appendChild(nested);
    } else {
      const ghost = document.createElement('div'); ghost.className = 'control-ghost'; card.appendChild(ghost);
    }
    card.addEventListener('pointerdown', function (event) {
      if (event.target.closest('.resize-handle') || event.target.closest('.studio-block') !== card) return;
      event.stopPropagation();
      selectedElementId = item.id;
      beginDrag(event, item.id, card, parentId);
    });
    card.addEventListener('click', function (event) { event.stopPropagation(); selectedElementId = item.id; renderInspector(); renderPalette(); markSelectedCard(); });
    makeHandles(card, item.id);
    return card;
  }

  function markSelectedCard() {
    document.querySelectorAll('.studio-block').forEach(function (card) { card.classList.toggle('selected', card.dataset.elementId === selectedElementId); });
  }

  function renderCanvas() {
    const project = currentProject();
    const screen = project.screens[currentScreenId];
    const definition = definitions.getScreenDefinition(currentScreenId);
    elements['mock-eyebrow'].textContent = definition.eyebrow;
    elements['mock-title'].textContent = definition.label;
    elements['canvas-title'].textContent = overviewMode ? '7画面 — project overview' : definition.label + ' — layout preview';
    elements['preset-origin-chip'].textContent = screen.presetOrigin;
    elements['screen-preview'].hidden = overviewMode;
    elements['overview-grid'].hidden = !overviewMode;
    if (overviewMode) { renderOverview(); return; }
    elements['mock-grid'].innerHTML = '';
    elements['mock-grid'].className = 'mock-grid' + (screen.container.showGrid ? ' show-grid' : '');
    elements['mock-grid'].style.setProperty('--grid-columns', screen.gridColumns);
    elements['mock-grid'].style.setProperty('--column-gap', screen.container.columnGapPx + 'px');
    const effectiveRowGap = Math.max(0, screen.container.rowGapPx + project.shared.blockGapPx - 14);
    elements['mock-grid'].style.setProperty('--row-gap', effectiveRowGap + 'px');
    const collisionIds = new Set();
    model.detectScreenCollisions(screen).forEach(function (collision) { collisionIds.add(collision.firstId); collisionIds.add(collision.secondId); });
    model.rowPlacements(screen.blocks).forEach(function (placement) {
      const card = renderBlock(placement.element, placement.row, null);
      if (collisionIds.has(placement.id)) card.classList.add('collision');
      elements['mock-grid'].appendChild(card);
    });
  }

  function renderOverview() {
    const project = currentProject();
    const dirty = new Set(history.dirtyScreens());
    elements['overview-grid'].innerHTML = '';
    definitions.SCREEN_DEFINITIONS.forEach(function (definition) {
      const screen = project.screens[definition.id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'overview-card' + (dirty.has(definition.id) ? ' dirty' : '');
      card.innerHTML = '<span class="overview-status">' + (dirty.has(definition.id) ? 'MODIFIED' : 'CLEAN') + '</span><p>' + definition.eyebrow + '</p><h3>' + definition.label + '</h3><div class="overview-mini-grid"></div>';
      const mini = card.querySelector('.overview-mini-grid');
      model.rowPlacements(screen.blocks).slice(0, 8).forEach(function (placement) {
        const block = document.createElement('span');
        block.className = 'overview-mini-block';
        const start = Math.floor((placement.colStart - 1) * 12 / screen.gridColumns) + 1;
        const span = Math.max(1, Math.round(placement.colSpan * 12 / screen.gridColumns));
        block.style.gridColumn = start + ' / span ' + Math.min(span, 13 - start);
        block.style.gridRow = String(placement.row);
        mini.appendChild(block);
      });
      card.addEventListener('click', function () { selectScreen(definition.id); });
      elements['overview-grid'].appendChild(card);
    });
  }

  function renderPreviewOnly() {
    const project = currentProject();
    const viewport = definitions.VIEWPORTS[previewViewportId];
    const widths = { wide: '100%', laptop: '86%', compact: '76%', mobile: '390px' };
    elements['preview-frame'].style.width = widths[previewViewportId];
    elements['preview-viewport'].className = 'preview-viewport ' + previewViewportId;
    elements['viewport-caption'].textContent = viewport.label + ' · preview only · canonical JSONは不変';
    elements['preview-viewport'].style.setProperty('--studio-sidebar', previewViewportId === 'mobile' ? '58px' : Math.round(project.shared.sidebarWidthPx * (previewViewportId === 'compact' ? .78 : previewViewportId === 'laptop' ? .88 : 1)) + 'px');
    elements['preview-viewport'].style.setProperty('--studio-radius', project.shared.cardRadiusPx + 'px');
    elements['preview-viewport'].style.setProperty('--control-height', project.shared.controlHeightPx + 'px');
    elements['mock-container'].style.width = project.shared.pageWidthPercent + '%';
    elements['mock-container'].style.maxWidth = project.shared.pageMaxWidthPx + 'px';
    elements['mock-container'].style.marginLeft = project.shared.pageAlign === 'center' ? 'auto' : '0';
    elements['mock-container'].style.marginRight = project.shared.pageAlign === 'center' ? 'auto' : '0';
    const screen = project.screens[currentScreenId];
    elements['screen-preview'].style.width = screen.container.widthPercent + '%';
    elements['screen-preview'].style.maxWidth = screen.container.maxWidthPx + 'px';
    elements['screen-preview'].style.marginLeft = screen.container.align === 'center' ? 'auto' : '0';
    elements['screen-preview'].style.marginRight = screen.container.align === 'center' ? 'auto' : '0';
    elements['mock-sidebar'].style.filter = 'saturate(' + (75 + project.shared.sidebarGoldIntensity) + '%) contrast(' + (90 + project.shared.sidebarIconDepth / 5) + '%)';
    const ornament = elements['mock-sidebar'].querySelector('.mock-ornament');
    ornament.style.opacity = project.shared.ornamentOpacity / 100;
    ornament.style.transform = 'rotate(-14deg) scale(' + project.shared.ornamentScale / 100 + ')';
    renderReference();
    renderViewportButtons();
    renderCanvas();
  }

  function renderInspector() {
    const project = currentProject();
    const screen = project.screens[currentScreenId];
    const found = selectedElementId ? model.findElement(screen, selectedElementId) : null;
    elements['field-inspector-empty'].hidden = Boolean(found);
    elements['field-inspector'].hidden = !found;
    if (!found) return;
    const item = found.element;
    elements['selected-field-label'].textContent = item.label;
    elements['selected-field-id'].textContent = item.id;
    elements['selected-field-order'].textContent = '#' + item.order;
    const values = { 'field-order': item.order, 'field-start': item.colStart, 'field-span': item.colSpan, 'field-x-offset': item.xOffsetPx, 'field-y-offset': item.yOffsetPx, 'field-width-adjust': item.widthAdjustPx, 'field-top-gap': item.topGapPx, 'field-height': item.heightPx };
    Object.keys(values).forEach(function (id) { elements[id].value = values[id]; });
    elements['field-start'].max = screen.gridColumns;
    elements['field-span'].max = screen.gridColumns;
    elements['field-x-offset'].step = screen.microSnapPx;
    elements['field-y-offset'].step = screen.microSnapPx;
    elements['field-width-adjust'].step = screen.microSnapPx;
    elements['field-break-before'].checked = item.breakBefore;
    elements['field-visible'].checked = item.visible;
  }

  function renderSettings() {
    const project = currentProject();
    const screen = project.screens[currentScreenId];
    elements['container-width'].value = screen.container.widthPercent;
    elements['container-width-output'].textContent = screen.container.widthPercent + '%';
    elements['container-max-width'].value = screen.container.maxWidthPx;
    elements['container-align'].value = screen.container.align;
    elements['column-gap'].value = screen.container.columnGapPx;
    elements['row-gap'].value = screen.container.rowGapPx;
    elements['show-grid'].checked = screen.container.showGrid;
    const sharedMap = {
      'shared-page-width': 'pageWidthPercent', 'shared-max-width': 'pageMaxWidthPx', 'shared-page-align': 'pageAlign', 'shared-sidebar-width': 'sidebarWidthPx', 'shared-card-radius': 'cardRadiusPx', 'shared-block-gap': 'blockGapPx', 'shared-control-height': 'controlHeightPx',
      'shared-gold': 'sidebarGoldIntensity', 'shared-depth': 'sidebarIconDepth', 'shared-ornament-opacity': 'ornamentOpacity', 'shared-ornament-scale': 'ornamentScale'
    };
    Object.keys(sharedMap).forEach(function (id) { elements[id].value = project.shared[sharedMap[id]]; });
  }

  function renderLint() {
    const warnings = model.lintScreen(currentScreen());
    elements['lint-count'].textContent = String(warnings.length);
    elements['lint-list'].innerHTML = '';
    if (!warnings.length) {
      const item = document.createElement('li'); item.className = 'ok'; item.textContent = 'この画面にmaterialな配置警告はありません。'; elements['lint-list'].appendChild(item); return;
    }
    warnings.forEach(function (warning) { const item = document.createElement('li'); item.textContent = warning.code + ' · ' + warning.message; elements['lint-list'].appendChild(item); });
  }

  function renderHistoryState() {
    const dirtyScreens = history.dirtyScreens();
    const dirty = dirtyScreens.length > 0 || history.sharedDirty();
    elements['dirty-indicator'].textContent = dirty ? '未保存 · ' + dirtyScreens.length + '画面' : '保存済み';
    elements['dirty-indicator'].classList.toggle('dirty', dirty);
    elements['undo-button'].disabled = !history.canUndo();
    elements['redo-button'].disabled = !history.canRedo();
  }

  function renderReference() {
    const value = references[currentScreenId];
    elements['reference-overlay'].src = value || '';
    elements['reference-overlay'].style.opacity = value ? Number(elements['reference-opacity'].value) / 100 : 0;
    elements['reference-clear'].disabled = !value;
  }

  function render() {
    renderScreenNavigation(); renderViewportButtons(); renderPrecision(); renderPresets(); renderPalette(); renderMockNavigation(); renderPreviewOnly(); renderInspector(); renderSettings(); renderLint(); renderHistoryState(); renderVariants();
  }

  function beginDrag(event, elementId, card, parentId) {
    if (event.button !== 0) return;
    event.preventDefault();
    const screen = currentScreen();
    const found = model.findElement(screen, elementId);
    const grid = parentId ? card.parentElement : elements['mock-grid'];
    const cardRect = card.getBoundingClientRect();
    gesture = { type: 'drag', pointerId: event.pointerId, elementId: elementId, parentId: parentId || null, originalProject: currentProject(), original: model.clone(found.element), originalRect: { left: cardRect.left, top: cardRect.top, width: cardRect.width, height: cardRect.height }, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, grabOffsetX: event.clientX - cardRect.left, grabOffsetY: event.clientY - cardRect.top, card: card, grid: grid };
    card.setPointerCapture(event.pointerId);
    card.addEventListener('pointermove', onGestureMove);
    card.addEventListener('pointerup', endGesture);
    card.addEventListener('pointercancel', cancelGesture);
    showGestureAids(card);
  }

  function beginResize(event, elementId, direction, card) {
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    const found = model.findElement(currentScreen(), elementId);
    gesture = { type: 'resize', pointerId: event.pointerId, elementId: elementId, direction: direction, originalProject: currentProject(), original: model.clone(found.element), startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, card: card, grid: card.parentElement };
    card.setPointerCapture(event.pointerId);
    card.addEventListener('pointermove', onGestureMove);
    card.addEventListener('pointerup', endGesture);
    card.addEventListener('pointercancel', cancelGesture);
    showGestureAids(card);
  }

  function showGestureAids(card) {
    const rect = card.getBoundingClientRect();
    const viewportRect = elements['preview-viewport'].getBoundingClientRect();
    elements['drop-ghost'].style.display = 'block';
    elements['drop-ghost'].style.left = (rect.left - viewportRect.left) + 'px';
    elements['drop-ghost'].style.top = (rect.top - viewportRect.top) + 'px';
    elements['drop-ghost'].style.width = rect.width + 'px';
    elements['drop-ghost'].style.height = rect.height + 'px';
  }

  function onGestureMove(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    gesture.lastX = event.clientX; gesture.lastY = event.clientY;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    const ghost = elements['drop-ghost'];
    const left = parseFloat(ghost.style.left || '0');
    const top = parseFloat(ghost.style.top || '0');
    if (gesture.type === 'drag') ghost.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    else {
      const direction = gesture.direction;
      if (direction.includes('e')) ghost.style.width = Math.max(24, gesture.card.getBoundingClientRect().width + dx) + 'px';
      if (direction.includes('s')) ghost.style.height = Math.max(24, gesture.card.getBoundingClientRect().height + dy) + 'px';
      if (direction.includes('w')) { ghost.style.width = Math.max(24, gesture.card.getBoundingClientRect().width - dx) + 'px'; ghost.style.left = (left + dx) + 'px'; }
      if (direction.includes('n')) { ghost.style.height = Math.max(24, gesture.card.getBoundingClientRect().height - dy) + 'px'; ghost.style.top = (top + dy) + 'px'; }
    }
    if (gesture.type === 'drag' && Math.abs(dy) > 24) {
      const viewportRect = elements['preview-viewport'].getBoundingClientRect();
      const gridRect = gesture.grid.getBoundingClientRect();
      elements['row-insertion-marker'].style.display = 'block';
      elements['row-insertion-marker'].style.left = (gridRect.left - viewportRect.left) + 'px';
      elements['row-insertion-marker'].style.top = (event.clientY - viewportRect.top) + 'px';
      elements['row-insertion-marker'].style.width = gridRect.width + 'px';
    }
    renderGuides(event.clientX, event.clientY);
  }

  function renderGuides(clientX, clientY) {
    const viewportRect = elements['preview-viewport'].getBoundingClientRect();
    elements['alignment-guides'].innerHTML = '<span class="alignment-guide vertical" style="left:' + (clientX - viewportRect.left) + 'px"></span><span class="alignment-guide horizontal" style="top:' + (clientY - viewportRect.top) + 'px"></span>';
  }

  function cleanupGesture() {
    if (!gesture) return;
    gesture.card.removeEventListener('pointermove', onGestureMove);
    gesture.card.removeEventListener('pointerup', endGesture);
    gesture.card.removeEventListener('pointercancel', cancelGesture);
    elements['drop-ghost'].style.display = 'none';
    elements['drop-ghost'].style.transform = '';
    elements['alignment-guides'].innerHTML = '';
    elements['row-insertion-marker'].style.display = 'none';
  }

  function endGesture(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const active = gesture;
    cleanupGesture();
    gesture = null;
    const screen = active.originalProject.screens[currentScreenId];
    let patch;
    if (active.type === 'drag') {
      const gridRect = active.grid.getBoundingClientRect();
      const columnGap = parseFloat(getComputedStyle(active.grid).columnGap) || 0;
      const desiredLeft = event.clientX - active.grabOffsetX;
      const desiredTop = event.clientY - active.grabOffsetY;
      patch = model.calculateDirectPlacement(active.original, desiredLeft, gridRect.left, gridRect.width, screen.gridColumns, screen.microSnapPx, columnGap);
      patch.yOffsetPx = model.snap(active.original.yOffsetPx + (event.clientY - active.startY), screen.microSnapPx);
      const candidates = Array.from(active.grid.children).filter(function (node) { return node.classList.contains('studio-block') && node.dataset.elementId !== active.elementId; });
      if (candidates.length) {
        const desiredCenterY = desiredTop + active.originalRect.height / 2;
        const nearest = candidates.reduce(function (best, node) { const rect = node.getBoundingClientRect(); const distance = Math.abs(desiredCenterY - (rect.top + rect.height / 2)); return !best || distance < best.distance ? { node: node, rect: rect, distance: distance } : best; }, null);
        const nearestFound = model.findElement(screen, nearest.node.dataset.elementId);
        if (nearestFound) {
          Object.assign(patch, model.calculateDragRowPatch(active.original, desiredLeft, desiredTop, active.originalRect, {
            order: nearestFound.element.order,
            left: nearest.rect.left,
            width: nearest.rect.width,
            top: nearest.rect.top,
            bottom: nearest.rect.bottom,
            baseTop: nearest.rect.top - nearestFound.element.yOffsetPx - nearestFound.element.topGapPx
          }, screen.microSnapPx));
        }
      }
    } else {
      const gridRect = active.grid.getBoundingClientRect();
      const columnGap = parseFloat(getComputedStyle(active.grid).columnGap) || 0;
      const columnTrack = Math.max(1, (gridRect.width - columnGap * (screen.gridColumns - 1)) / screen.gridColumns);
      patch = model.calculateResizePatch(active.original, active.direction, event.clientX - active.startX, event.clientY - active.startY, columnTrack + columnGap, screen.microSnapPx, screen.gridColumns);
    }
    let next = model.updateElement(active.originalProject, currentScreenId, active.elementId, patch);
    next = model.resolveElementCollision(next, currentScreenId, active.elementId);
    commit(next, active.type === 'drag' ? '1 drag gestureを1履歴として記録しました。' : '1 resize gestureを1履歴として記録しました。');
  }

  function cancelGesture(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    cleanupGesture(); gesture = null; render(); setStatus('gestureをcancelしました。', false);
  }

  function bindInspector() {
    const inputMap = { 'field-order': 'order', 'field-start': 'colStart', 'field-span': 'colSpan', 'field-x-offset': 'xOffsetPx', 'field-y-offset': 'yOffsetPx', 'field-width-adjust': 'widthAdjustPx', 'field-top-gap': 'topGapPx', 'field-height': 'heightPx' };
    Object.keys(inputMap).forEach(function (id) {
      elements[id].addEventListener('change', function () {
        if (!selectedElementId) return;
        const patch = {}; patch[inputMap[id]] = Number(elements[id].value);
        commit(model.updateElement(currentProject(), currentScreenId, selectedElementId, patch), inputMap[id] + 'を更新しました。');
      });
    });
    elements['field-break-before'].addEventListener('change', function () { if (selectedElementId) commit(model.updateElement(currentProject(), currentScreenId, selectedElementId, { breakBefore: elements['field-break-before'].checked })); });
    elements['field-visible'].addEventListener('change', function () { if (selectedElementId) commit(model.updateElement(currentProject(), currentScreenId, selectedElementId, { visible: elements['field-visible'].checked })); });
    elements['top-gap-less'].addEventListener('click', function () { adjustSelected('topGapPx', -currentScreen().microSnapPx); });
    elements['top-gap-more'].addEventListener('click', function () { adjustSelected('topGapPx', currentScreen().microSnapPx); });
    elements['normalize-micro'].addEventListener('click', function () { if (selectedElementId) commit(model.updateElement(currentProject(), currentScreenId, selectedElementId, { xOffsetPx: 0, yOffsetPx: 0, widthAdjustPx: 0 }), 'micro offsetを0へ正規化しました。'); });
  }

  function adjustSelected(key, amount) {
    if (!selectedElementId) return;
    const found = model.findElement(currentScreen(), selectedElementId);
    const patch = {}; patch[key] = found.element[key] + amount;
    commit(model.updateElement(currentProject(), currentScreenId, selectedElementId, patch));
  }

  function bindScreenSettings() {
    const map = { 'container-width': 'widthPercent', 'container-max-width': 'maxWidthPx', 'container-align': 'align', 'column-gap': 'columnGapPx', 'row-gap': 'rowGapPx', 'show-grid': 'showGrid' };
    Object.keys(map).forEach(function (id) {
      elements[id].addEventListener('change', function () {
        const value = elements[id].type === 'checkbox' ? elements[id].checked : elements[id].type === 'number' || elements[id].type === 'range' ? Number(elements[id].value) : elements[id].value;
        const patch = {}; patch[map[id]] = value;
        commit(model.updateScreen(currentProject(), currentScreenId, { container: patch }), 'screen containerを更新しました。');
      });
    });
    elements['container-width'].addEventListener('input', function () { elements['container-width-output'].textContent = elements['container-width'].value + '%'; });
  }

  function bindSharedSettings() {
    const map = { 'shared-page-width': 'pageWidthPercent', 'shared-max-width': 'pageMaxWidthPx', 'shared-page-align': 'pageAlign', 'shared-sidebar-width': 'sidebarWidthPx', 'shared-card-radius': 'cardRadiusPx', 'shared-block-gap': 'blockGapPx', 'shared-control-height': 'controlHeightPx', 'shared-gold': 'sidebarGoldIntensity', 'shared-depth': 'sidebarIconDepth', 'shared-ornament-opacity': 'ornamentOpacity', 'shared-ornament-scale': 'ornamentScale' };
    Object.keys(map).forEach(function (id) {
      elements[id].addEventListener('change', function () { const patch = {}; patch[map[id]] = elements[id].tagName === 'SELECT' ? elements[id].value : Number(elements[id].value); commit(model.updateShared(currentProject(), patch), 'shared shellを7画面へ反映しました。'); });
    });
  }

  function tidyCurrentScreen() {
    const next = currentProject();
    const screen = next.screens[currentScreenId];
    model.flattenElements(screen).forEach(function (entry) {
      entry.element.xOffsetPx = Math.abs(entry.element.xOffsetPx) >= 48 ? 0 : entry.element.xOffsetPx;
      entry.element.yOffsetPx = Math.abs(entry.element.yOffsetPx) >= 48 ? 0 : entry.element.yOffsetPx;
      entry.element.widthAdjustPx = Math.abs(entry.element.widthAdjustPx) >= 72 ? 0 : entry.element.widthAdjustPx;
    });
    commit(model.normalizeProject(next), '大きなmicro残差を決定的に整えました。');
  }

  function resetCurrentScreen() {
    const next = currentProject();
    next.screens[currentScreenId] = model.createDefaultProject().screens[currentScreenId];
    commit(next, definitions.getScreenDefinition(currentScreenId).label + 'をbaselineへ戻しました。');
  }

  function renderVariants() {
    const selected = elements['variant-select'].value;
    elements['variant-select'].innerHTML = '<option value="">project variantを選択</option>';
    Object.keys(variants).sort().forEach(function (name) { const option = document.createElement('option'); option.value = name; option.textContent = name; elements['variant-select'].appendChild(option); });
    if (Object.prototype.hasOwnProperty.call(variants, selected)) elements['variant-select'].value = selected;
  }

  function readStorageMap(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (error) { return {}; }
  }

  function persistVariants() {
    try { localStorage.setItem(model.PROJECT_STORAGE_KEY, JSON.stringify(variants)); } catch (error) { setStatus('localStorageへ保存できませんでした。', true); }
  }

  function loadVariants() {
    variants = model.migrateVariantMap(readStorageMap(model.PROJECT_STORAGE_KEY), readStorageMap(model.LEGACY_STORAGE_KEY));
    persistVariants();
  }

  function bindVariants() {
    elements['variant-save'].addEventListener('click', function () {
      const name = elements['variant-name'].value.trim();
      if (!name) { setStatus('variant名を入力してください。', true); return; }
      variants[name] = model.stableStringify(currentProject()); persistVariants(); history.markClean(); elements['variant-select'].value = name; render(); setStatus('7画面project variantを保存しました。', false);
    });
    elements['variant-load'].addEventListener('click', function () {
      const name = elements['variant-select'].value; if (!name || !variants[name]) return;
      try { history.reset(model.parseProjectJson(variants[name])); history.markClean(); render(); setStatus(name + 'を読み込みました。', false); } catch (error) { setStatus(error.message, true); }
    });
    elements['variant-delete'].addEventListener('click', function () { const name = elements['variant-select'].value; if (!name) return; delete variants[name]; persistVariants(); renderVariants(); setStatus(name + 'を削除しました。', false); });
  }

  function showDialog(mode) {
    dialogMode = mode;
    const project = currentProject();
    const handoff = mode.includes('handoff');
    elements['json-panel'].hidden = handoff;
    elements['handoff-panel'].hidden = !handoff;
    ['dialog-screen-json', 'dialog-project-json', 'dialog-screen-handoff', 'dialog-project-handoff'].forEach(function (id) { elements[id].classList.toggle('active', id.replace('dialog-', '') === mode); });
    if (mode === 'screen-json') { elements['dialog-title'].textContent = 'Current screen JSON'; elements['json-text'].value = model.screenExport(project, currentScreenId); }
    if (mode === 'project-json') { elements['dialog-title'].textContent = 'Whole project JSON'; elements['json-text'].value = model.stableStringify(project); }
    if (mode === 'screen-handoff') { elements['dialog-title'].textContent = 'Current screen handoff'; elements['handoff-text'].value = model.createScreenHandoff(project, currentScreenId); }
    if (mode === 'project-handoff') { elements['dialog-title'].textContent = 'All-screen summary'; elements['handoff-text'].value = model.createProjectHandoff(project); }
    if (!elements['transfer-dialog'].open) elements['transfer-dialog'].showModal();
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
    fallbackCopy(text); return Promise.resolve();
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
  }

  function downloadText(text, filename, type) {
    const blob = new Blob([text], { type: type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }

  function bindTransfer() {
    elements['json-button'].addEventListener('click', function () { showDialog('project-json'); });
    elements['handoff-button'].addEventListener('click', function () { showDialog('screen-handoff'); });
    ['screen-json', 'project-json', 'screen-handoff', 'project-handoff'].forEach(function (mode) { elements['dialog-' + mode].addEventListener('click', function () { showDialog(mode); }); });
    elements['json-copy'].addEventListener('click', function () { copyText(elements['json-text'].value).then(function () { setStatus('JSONをcopyしました。'); }); });
    elements['handoff-copy'].addEventListener('click', function () { copyText(elements['handoff-text'].value).then(function () { setStatus('handoffをcopyしました。'); }); });
    elements['json-download'].addEventListener('click', function () { downloadText(elements['json-text'].value, dialogMode === 'screen-json' ? currentScreenId + '-layout.json' : 'knowledge-share-ui-project.json', 'application/json'); });
    elements['handoff-download'].addEventListener('click', function () { downloadText(elements['handoff-text'].value, dialogMode === 'screen-handoff' ? currentScreenId + '-handoff.md' : 'all-screens-handoff.md', 'text/markdown'); });
    elements['json-import'].addEventListener('click', function () {
      try {
        const result = model.parseImportJson(elements['json-text'].value);
        if (result.kind === 'screen') {
          const next = currentProject(); next.screens[result.screen.id] = result.screen; history.record(next); currentScreenId = result.screen.id; overviewMode = false;
          setStatus(result.screen.title + 'のscreen JSONをimportしました。');
        } else {
          history.record(result.project);
          setStatus(result.kind === 'legacy-meeting' ? 'Meeting v1/v2をprojectへ移行しました。' : 'Whole projectをimportしました。');
        }
        render(); elements['transfer-dialog'].close();
      } catch (error) { setStatus(error.message, true); }
    });
    elements['json-file'].addEventListener('change', function () { const file = elements['json-file'].files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function () { elements['json-text'].value = String(reader.result); }; reader.readAsText(file); });
  }

  function bindReference() {
    elements['reference-file'].addEventListener('change', function () {
      const file = elements['reference-file'].files[0]; if (!file) return;
      const reader = new FileReader(); reader.onload = function () { references[currentScreenId] = String(reader.result); renderReference(); setStatus('この画面だけにreferenceを読み込みました。'); }; reader.readAsDataURL(file);
    });
    elements['reference-opacity'].addEventListener('input', function () { elements['reference-opacity-output'].textContent = elements['reference-opacity'].value + '%'; renderReference(); });
    elements['reference-clear'].addEventListener('click', function () { delete references[currentScreenId]; elements['reference-file'].value = ''; renderReference(); });
  }

  function bindGlobal() {
    elements['screen-select'].addEventListener('change', function () { selectScreen(elements['screen-select'].value); });
    elements['previous-screen'].addEventListener('click', function () { const index = definitions.SCREEN_IDS.indexOf(currentScreenId); selectScreen(definitions.SCREEN_IDS[(index - 1 + definitions.SCREEN_IDS.length) % definitions.SCREEN_IDS.length]); });
    elements['next-screen'].addEventListener('click', function () { const index = definitions.SCREEN_IDS.indexOf(currentScreenId); selectScreen(definitions.SCREEN_IDS[(index + 1) % definitions.SCREEN_IDS.length]); });
    elements['overview-button'].addEventListener('click', function () { overviewMode = true; selectedElementId = null; render(); });
    elements['undo-button'].addEventListener('click', function () { history.undo(); render(); });
    elements['redo-button'].addEventListener('click', function () { history.redo(); render(); });
    elements['tidy-button'].addEventListener('click', tidyCurrentScreen);
    elements['reset-button'].addEventListener('click', resetCurrentScreen);
    elements['reset-project-button'].addEventListener('click', function () { commit(model.createDefaultProject(), '7画面をWork 0034 baselineへ戻しました。'); });
    window.addEventListener('keydown', function (event) {
      if (!selectedElementId || overviewMode || event.target.closest('input,select,textarea,button')) return;
      const direction = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[event.key];
      if (!direction) return;
      event.preventDefault(); commit(model.nudgeElement(currentProject(), currentScreenId, selectedElementId, direction, event.shiftKey), (event.shiftKey ? '4-step ' : '') + direction + ' nudge');
    });
  }

  function init() {
    cacheElements(); loadVariants(); bindGlobal(); bindInspector(); bindScreenSettings(); bindSharedSettings(); bindVariants(); bindTransfer(); bindReference(); render(); setStatus('7画面projectをlocal baselineから読み込みました。network requestは行いません。');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
