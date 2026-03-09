const results = { passed: 0, failed: 0, errors: [] };
let currentDescribe = '';

export function describe(name, fn) {
  currentDescribe = name;
  fn();
  currentDescribe = '';
}

export function it(name, fn) {
  const testName = currentDescribe ? `${currentDescribe} > ${name}` : name;
  try {
    fn();
    results.passed++;
    logResult(testName, true);
  } catch (error) {
    results.failed++;
    results.errors.push({ testName, error: error.message });
    logResult(testName, false, error.message);
  }
}

export function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertDeepEqual(actual, expected) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`expected ${expectedJson}, got ${actualJson}`);
  }
}

export function assertTrue(value) {
  if (!value) {
    throw new Error(`expected truthy, got ${JSON.stringify(value)}`);
  }
}

export function assertFalse(value) {
  if (value) {
    throw new Error(`expected falsy, got ${JSON.stringify(value)}`);
  }
}

export function getSummary() {
  return { ...results };
}

function logResult(name, passed, errorMessage) {
  const container = document.getElementById('test-results');
  if (!container) return;

  const div = document.createElement('div');
  div.className = passed ? 'pass' : 'fail';
  div.textContent = passed ? `PASS: ${name}` : `FAIL: ${name} - ${errorMessage}`;
  container.appendChild(div);
}

export function showSummary() {
  const container = document.getElementById('test-results');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'summary';
  div.textContent = `Total: ${results.passed + results.failed} | Passed: ${results.passed} | Failed: ${results.failed}`;
  container.appendChild(div);
}
