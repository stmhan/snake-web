// Node.js 환경에서 브라우저 테스트를 실행하기 위한 어댑터
// document 객체가 없으므로 DOM 출력을 콘솔로 대체한다

globalThis.document = {
  getElementById() { return null; },
  addEventListener() {},
  removeEventListener() {}
};

let passed = 0;
let failed = 0;
let currentDescribe = '';

async function runTests() {
  const { describe: d, it: i, assertEqual, assertDeepEqual, assertTrue, assertFalse } = await import('./test-runner.js');

  // test-runner.js의 logResult가 DOM을 찾지 못해도 에러 없이 넘어감
  await import('./constants.test.js');
  await import('./snake.test.js');
  await import('./food.test.js');
  await import('./game-state.test.js');

  const { getSummary } = await import('./test-runner.js');
  const summary = getSummary();

  console.log(`\nTotal: ${summary.passed + summary.failed} | Passed: ${summary.passed} | Failed: ${summary.failed}`);

  if (summary.errors.length > 0) {
    console.log('\nFailures:');
    summary.errors.forEach(e => console.log(`  FAIL: ${e.testName} - ${e.error}`));
  }

  process.exit(summary.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
