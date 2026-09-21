const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const styles = fs.readFileSync(path.join(root, 'src', 'Styles.html'), 'utf8');
const work42 = styles.slice(
  styles.indexOf('/* Work 0042 right-pane system.'),
  styles.indexOf('/* Work 0045 shared runtime theme.')
);

test('approved institutional structure accepts the superseding Work0044 executive slate tokens', () => {
  for (const token of [
    '--rp-page:#e7edf2',
    '--rp-surface:#f8fafb',
    '--rp-surface-soft:#eef3f6',
    '--rp-header:#cdd9e2',
    '--rp-header-strong:#becdd8',
    '--rp-border:#bbc9d3',
    '--rp-border-strong:#a3b5c1',
    '--rp-ink:#263b49',
    '--rp-ink-soft:#4a6170',
    '--rp-muted:#6b7e8a',
    '--rp-blue:#405f72',
    '--rp-blue-dark:#2f4b5d',
    '--rp-blue-soft:#dce6ec',
    '--rp-focus:#6c8798'
  ]) assert.ok(work42.includes(token), token);

  for (const obsoleteWarmSurface of [
    '#f6f3ec', '#fffdfa', '#fbf8f1', '#f4ecd8', '#eee0bc',
    '#ddd0ae', '#cbb57a', '#fffaf0', '#fffefa', '#f7f0df',
    '#f8f1df', '#fffdf8', '#f8f0dc', '#f6f1e6', '#f7f1e3', '#f4e8ca'
  ]) assert.ok(!work42.toLowerCase().includes(obsoleteWarmSurface), obsoleteWarmSurface);
});

test('sidebar uses the exact Work0044 slate while preserving gold identity and limiting red to the active navigation item', () => {
  assert.match(styles, /--sidebar:#2D3E49/);
  assert.match(styles, /\.page-header\{[^}]*background:#2D3E49/);
  assert.match(styles, /\.brand h1\{[^}]*#FFF4BF[^}]*#EBCB67[^}]*#A66E18/);
  assert.match(styles, /\.nav-icon\{[^}]*stroke:#F0CF69/);
  assert.match(styles, /\.sidebar-motif\{[^}]*#E2B84F78/);
  assert.match(styles, /\.nav button\.active\{[^}]*#B5121B[^}]*#751017[^}]*border-color:#D94A52/);
  assert.match(styles, /\.nav button\.active:before\{[^}]*#E02A36/);
  assert.match(styles, /\.nav button\.active \.nav-icon\{[^}]*stroke:#FFE89A/);
  assert.doesNotMatch(work42, /#B5121B|#751017|#E02A36|#D94A52/i);
});

test('desktop sidebar is viewport-bound while mobile and accepted layout topology remain unchanged', () => {
  assert.match(styles, /@media\(min-width:721px\)\{\.page-header\{top:0;bottom:auto;height:100vh;height:100dvh;max-height:100dvh\}\}/);
  assert.match(styles, /#meeting-form>\.grid\{grid-template-columns:repeat\(12,minmax\(0,1fr\)\);column-gap:14px;row-gap:14px/);
  assert.match(styles, /#meeting-form>\.grid>\.meeting-field-notes\{grid-column:1\/span 12;grid-row:6\}/);
  assert.match(styles, /@media\(max-width:720px\)\{[\s\S]*#meeting-form>\.grid>\.meeting-field-notes[^}]*grid-column:1;grid-row:auto;width:100%/);
});

test('right-pane controls use blue accents while semantic success warning and danger remain distinct', () => {
  assert.match(work42, /button\.primary\{[^}]*border-color:var\(--rp-blue-dark\)[^}]*background:[^}]*var\(--rp-blue\)/);
  assert.match(work42, /\.status\.info\{[^}]*var\(--rp-blue-soft\)[^}]*var\(--rp-blue-dark\)/);
  assert.match(work42, /\.status\.success\{[^}]*var\(--rp-success-soft\)[^}]*var\(--rp-success\)/);
  assert.match(work42, /\.status\.warning,\.retry-note\{[^}]*var\(--rp-warning-soft\)[^}]*var\(--rp-warning\)/);
  assert.match(work42, /\.status\.error\{[^}]*var\(--rp-danger-soft\)[^}]*var\(--rp-danger\)/);
});
