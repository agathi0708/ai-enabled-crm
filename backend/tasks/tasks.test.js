const assert = require('node:assert/strict');
const { validateTaskInput } = require('./tasks.service');

const result = validateTaskInput({
  title: 'Follow up with lead',
  priority: 'high',
  status: 'in_progress',
  due_date: '2026-09-22T10:00:00.000Z',
  contact_id: '11111111-1111-1111-1111-111111111111',
  description: '  Confirm pricing and send the demo recap  ',
});

assert.equal(result.title, 'Follow up with lead');
assert.equal(result.priority, 'high');
assert.equal(result.status, 'in_progress');
assert.equal(result.description, 'Confirm pricing and send the demo recap');
assert.equal(result.contactId, '11111111-1111-1111-1111-111111111111');

try {
  validateTaskInput({
    title: 'Bad priority task',
    contact_id: '11111111-1111-1111-1111-111111111111',
    priority: 'urgent',
  });
  throw new Error('Expected validation to fail for invalid priority');
} catch (error) {
  assert.equal(error.code, 'VALIDATION_ERROR');
  assert.match(error.message, /priority/i);
}

console.log('tasks validation checks passed');
