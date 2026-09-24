const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const client = fs.readFileSync(path.join(root, 'src', 'ClientMaintenance.html'), 'utf8');

function extract(name) {
  const start = client.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} exists in production source`);
  const next = client.indexOf('\nfunction ', start + 1);
  return client.slice(start, next === -1 ? client.length : next);
}

test('edit snapshot tracks user-editable values, restores clean state, and prompts only while dirty', () => {
  const fields = ['date', 'time', 'locationId', 'counterpartyId', 'assetClassId', 'capitalTypeId',
    'teamId', 'fundStrategy', 'followUpNote', 'counterparty', 'internalParticipants', 'notes'];
  const nodes = Object.fromEntries(fields.map(field => ['meeting-edit-' + field, { value: '' }]));
  nodes['meeting-edit-followUpRequired'] = { checked: false };
  let types = ['ANNUAL_REVIEW'];
  let prompts = 0;
  let answer = false;
  const context = vm.createContext({
    el: id => nodes[id],
    meetingTypeValues: () => types,
    confirm: () => { prompts += 1; return answer; }
  });
  new vm.Script([
    'let meetingEditInitialSnapshot=null;',
    extract('meetingEditSnapshot'), extract('meetingEditIsDirty'), extract('confirmMeetingEditDiscard')
  ].join('\n')).runInContext(context);
  const run = expression => vm.runInContext(expression, context);

  assert.equal(run('meetingEditIsDirty()'), false);
  assert.equal(run('confirmMeetingEditDiscard()'), true);
  assert.equal(prompts, 0);
  run('meetingEditInitialSnapshot=meetingEditSnapshot()');
  nodes['meeting-edit-notes'].value = '未保存';
  assert.equal(run('meetingEditIsDirty()'), true);
  assert.equal(run('confirmMeetingEditDiscard()'), false);
  assert.equal(nodes['meeting-edit-notes'].value, '未保存');
  nodes['meeting-edit-notes'].value = '';
  assert.equal(run('meetingEditIsDirty()'), false);
  nodes['meeting-edit-followUpRequired'].checked = true;
  assert.equal(run('meetingEditIsDirty()'), true);
  nodes['meeting-edit-followUpRequired'].checked = false;
  types = ['OFFICE_VISIT'];
  assert.equal(run('meetingEditIsDirty()'), true);
  answer = true;
  assert.equal(run('confirmMeetingEditDiscard()'), true);
  assert.equal(prompts, 2);
  run('meetingEditInitialSnapshot=meetingEditSnapshot()');
  assert.equal(run('meetingEditIsDirty()'), false);
  assert.equal(run('confirmMeetingEditDiscard()'), true);
  assert.equal(prompts, 2);
});
