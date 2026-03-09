import { describe, it, assertTrue, assertFalse, assertEqual } from './test-runner.js';
import { spawnFood, isFoodEaten } from './food.js';

describe('spawnFood', () => {
  it('그리드 범위 내 좌표를 반환한다', () => {
    const food = spawnFood([], 20, 20);
    assertTrue(food.x >= 0 && food.x < 20);
    assertTrue(food.y >= 0 && food.y < 20);
  });

  it('점유된 셀에는 음식을 놓지 않는다', () => {
    const occupied = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (x !== 2 || y !== 2) {
          occupied.push({ x, y });
        }
      }
    }
    // 3x3 그리드에서 (2,2)만 비어 있음
    const food = spawnFood(occupied, 3, 3);
    assertEqual(food.x, 2);
    assertEqual(food.y, 2);
  });

  it('빈 셀이 없으면 null을 반환한다', () => {
    const occupied = [{ x: 0, y: 0 }];
    const food = spawnFood(occupied, 1, 1);
    assertEqual(food, null);
  });
});

describe('isFoodEaten', () => {
  it('위치가 같으면 true를 반환한다', () => {
    assertTrue(isFoodEaten({ x: 5, y: 5 }, { x: 5, y: 5 }));
  });

  it('위치가 다르면 false를 반환한다', () => {
    assertFalse(isFoodEaten({ x: 5, y: 5 }, { x: 6, y: 5 }));
  });

  it('x만 같아도 false를 반환한다', () => {
    assertFalse(isFoodEaten({ x: 5, y: 5 }, { x: 5, y: 6 }));
  });
});
