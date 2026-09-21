const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const styles = read('src/Styles.html');
const work42 = styles.slice(styles.indexOf('/* Work 0042 right-pane system.'));

test('Work0044 applies exact sidebar slate without changing its accepted viewport sizing', () => {
  assert.match(styles, /--sidebar:#2D3E49/);
  assert.match(styles, /\.page-header\{[^}]*background:#2D3E49[^}]*border-right:1px solid #51636D/);
  assert.match(styles, /@media\(min-width:721px\)\{\.page-header\{top:0;bottom:auto;height:100vh;height:100dvh;max-height:100dvh\}\}/);
  assert.match(styles, /\.nav button\.active\{[^}]*#B5121B[^}]*#751017[^}]*border-color:#D94A52/);
  assert.match(styles, /\.brand h1\{[^}]*#FFF4BF[^}]*#EBCB67[^}]*#A66E18/);
  assert.match(styles, /\.nav-icon\{[^}]*stroke:#F0CF69/);
});

test('right-pane tokens form a cool executive slate hierarchy', () => {
  for (const token of [
    '--rp-page:#e7edf2', '--rp-surface:#f8fafb', '--rp-surface-soft:#eef3f6',
    '--rp-header:#cdd9e2', '--rp-header-strong:#becdd8', '--rp-border:#bbc9d3',
    '--rp-border-strong:#a3b5c1', '--rp-ink:#263b49', '--rp-ink-soft:#4a6170',
    '--rp-muted:#6b7e8a', '--rp-blue:#405f72', '--rp-blue-dark:#2f4b5d',
    '--rp-blue-soft:#dce6ec', '--rp-focus:#6c8798'
  ]) assert.ok(work42.includes(token), token);

  assert.match(work42, /background:linear-gradient\(180deg,#d7e1e8 0%,var\(--rp-header\) 100%\)/);
  assert.match(work42, /\.data-table th\{[^}]*var\(--rp-header\)[^}]*var\(--rp-header-strong\)/);
  assert.match(work42, /\.page input,[^}]*background:var\(--rp-surface\)/);
});

test('right-pane actions use blue-slate and reserve warm colors for semantic warning states', () => {
  assert.match(work42, /button\.primary\{[^}]*#526f81[^}]*var\(--rp-blue\)/);
  assert.match(work42, /button\.secondary,\.small-button,\.small-link\{[^}]*#dce5eb[^}]*var\(--rp-blue-dark\)/);
  assert.match(work42, /\.master-tabs,\.admin-tabs\{[^}]*background:#dce5eb/);
  assert.match(work42, /button\.warning\{[^}]*var\(--rp-warning-soft\)[^}]*var\(--rp-warning\)/);
  assert.match(work42, /\.status\.warning,\.retry-note\{[^}]*var\(--rp-warning-soft\)[^}]*var\(--rp-warning\)/);
});

test('Work0044 remains CSS-only and keeps the frozen production topology', () => {
  assert.match(styles, /#meeting-form>\.grid\{grid-template-columns:repeat\(12,minmax\(0,1fr\)\);column-gap:14px;row-gap:14px/);
  assert.match(styles, /#meeting-form>\.grid>\.meeting-field-notes\{grid-column:1\/span 12;grid-row:6\}/);
  assert.doesNotMatch(work42, /\.nav(?:\s|\{|\.|:)/);
  assert.doesNotMatch(work42, /\.sidebar-motif(?:\s|\{|\.|:)/);
});

test('GitHub reference files encode the same palette and boundary', () => {
  const css = read('docs/design/0044/theme-reference.css');
  const html = read('docs/design/0044/theme-reference.html');
  const guide = read('docs/design/0044/README.md');
  for (const token of ['--w44-sidebar:#2d3e49', '--w44-page:#e7edf2', '--w44-header:#cdd9e2', '--w44-primary:#405f72']) {
    assert.ok(css.includes(token), token);
  }
  assert.match(html, /Work 0044 Executive Navy Slate/);
  assert.match(html, /class="w44-button w44-primary"/);
  assert.match(html, /class="w44-button w44-secondary"/);
  assert.match(guide, /layout \/ DOM \/ functionality/);
  assert.match(guide, /src\/Styles\.html/);
});
