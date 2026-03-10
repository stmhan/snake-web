import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GRID_SIZE,
  CELL_COUNT,
  DIRECTION,
  createSnake,
  moveSnake,
  changeDirection,
  placeFood,
  checkWallCollision,
  checkSelfCollision,
  createGameState,
  tick,
} from './game.js';

describe('상수', () => {
  it('GRID_SIZE는 양수여야 한다', () => {
    assert.ok(GRID_SIZE > 0);
  });

  it('CELL_COUNT는 양수여야 한다', () => {
    assert.ok(CELL_COUNT > 0);
  });

  it('4방향이 정의되어야 한다', () => {
    assert.deepStrictEqual(DIRECTION.UP, { x: 0, y: -1 });
    assert.deepStrictEqual(DIRECTION.DOWN, { x: 0, y: 1 });
    assert.deepStrictEqual(DIRECTION.LEFT, { x: -1, y: 0 });
    assert.deepStrictEqual(DIRECTION.RIGHT, { x: 1, y: 0 });
  });
});

describe('createSnake', () => {
  it('초기 뱀은 3칸 길이여야 한다', () => {
    const snake = createSnake();
    assert.strictEqual(snake.body.length, 3);
  });

  it('초기 방향은 오른쪽이어야 한다', () => {
    const snake = createSnake();
    assert.deepStrictEqual(snake.direction, DIRECTION.RIGHT);
  });

  it('뱀의 몸체는 연속된 좌표여야 한다', () => {
    const snake = createSnake();
    for (let i = 0; i < snake.body.length - 1; i++) {
      const current = snake.body[i];
      const next = snake.body[i + 1];
      const distance = Math.abs(current.x - next.x)
        + Math.abs(current.y - next.y);
      assert.strictEqual(distance, 1);
    }
  });
});

describe('moveSnake', () => {
  it('오른쪽으로 이동하면 머리의 x가 1 증가한다', () => {
    const snake = createSnake();
    const head = snake.body[0];
    const moved = moveSnake(snake);
    assert.strictEqual(moved.body[0].x, head.x + 1);
    assert.strictEqual(moved.body[0].y, head.y);
  });

  it('이동 후 몸 길이가 유지된다', () => {
    const snake = createSnake();
    const moved = moveSnake(snake);
    assert.strictEqual(moved.body.length, snake.body.length);
  });

  it('성장 플래그가 있으면 꼬리를 유지한다', () => {
    const snake = createSnake();
    const moved = moveSnake(snake, true);
    assert.strictEqual(moved.body.length, snake.body.length + 1);
  });

  it('위쪽으로 이동하면 머리의 y가 1 감소한다', () => {
    const snake = { body: [{ x: 5, y: 5 }], direction: DIRECTION.UP };
    const moved = moveSnake(snake);
    assert.strictEqual(moved.body[0].y, 4);
    assert.strictEqual(moved.body[0].x, 5);
  });
});

describe('changeDirection', () => {
  it('현재 방향과 반대 방향으로는 변경할 수 없다', () => {
    const snake = createSnake(); // 초기 방향: RIGHT
    const changed = changeDirection(snake, DIRECTION.LEFT);
    assert.deepStrictEqual(changed.direction, DIRECTION.RIGHT);
  });

  it('직교 방향으로는 변경할 수 있다', () => {
    const snake = createSnake(); // 초기 방향: RIGHT
    const changed = changeDirection(snake, DIRECTION.UP);
    assert.deepStrictEqual(changed.direction, DIRECTION.UP);
  });

  it('같은 방향으로 변경하면 그대로 유지된다', () => {
    const snake = createSnake();
    const changed = changeDirection(snake, DIRECTION.RIGHT);
    assert.deepStrictEqual(changed.direction, DIRECTION.RIGHT);
  });
});

describe('placeFood', () => {
  it('음식 좌표가 그리드 범위 안에 있어야 한다', () => {
    const snake = createSnake();
    const food = placeFood(snake.body);
    assert.ok(food.x >= 0 && food.x < CELL_COUNT);
    assert.ok(food.y >= 0 && food.y < CELL_COUNT);
  });

  it('음식이 뱀 몸체 위에 놓이지 않아야 한다', () => {
    const snake = createSnake();
    for (let i = 0; i < 100; i++) {
      const food = placeFood(snake.body);
      const isOnSnake = snake.body.some(
        (segment) => segment.x === food.x && segment.y === food.y
      );
      assert.strictEqual(isOnSnake, false);
    }
  });
});

describe('checkWallCollision', () => {
  it('그리드 안에 있으면 충돌이 아니다', () => {
    assert.strictEqual(checkWallCollision({ x: 5, y: 5 }), false);
  });

  it('x가 음수이면 벽 충돌이다', () => {
    assert.strictEqual(checkWallCollision({ x: -1, y: 5 }), true);
  });

  it('y가 음수이면 벽 충돌이다', () => {
    assert.strictEqual(checkWallCollision({ x: 5, y: -1 }), true);
  });

  it('x가 CELL_COUNT 이상이면 벽 충돌이다', () => {
    assert.strictEqual(
      checkWallCollision({ x: CELL_COUNT, y: 5 }),
      true
    );
  });

  it('y가 CELL_COUNT 이상이면 벽 충돌이다', () => {
    assert.strictEqual(
      checkWallCollision({ x: 5, y: CELL_COUNT }),
      true
    );
  });
});

describe('checkSelfCollision', () => {
  it('머리가 몸체와 겹치지 않으면 충돌이 아니다', () => {
    const snake = createSnake();
    assert.strictEqual(checkSelfCollision(snake), false);
  });

  it('머리가 몸체와 겹치면 자기 충돌이다', () => {
    const snake = {
      body: [
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 4, y: 4 },
        { x: 3, y: 4 },
        { x: 3, y: 3 }, // 머리와 같은 위치
      ],
      direction: DIRECTION.RIGHT,
    };
    assert.strictEqual(checkSelfCollision(snake), true);
  });
});

describe('createGameState', () => {
  it('초기 점수는 0이어야 한다', () => {
    const state = createGameState();
    assert.strictEqual(state.score, 0);
  });

  it('초기 상태는 playing이어야 한다', () => {
    const state = createGameState();
    assert.strictEqual(state.isGameOver, false);
  });

  it('뱀과 음식이 존재해야 한다', () => {
    const state = createGameState();
    assert.ok(state.snake);
    assert.ok(state.food);
  });
});

describe('tick', () => {
  it('한 틱 후 뱀이 이동해야 한다', () => {
    const state = createGameState();
    const headBefore = { ...state.snake.body[0] };
    const next = tick(state);
    const headAfter = next.snake.body[0];
    assert.notDeepStrictEqual(headBefore, headAfter);
  });

  it('음식을 먹으면 점수가 증가한다', () => {
    const state = createGameState();
    // 음식을 뱀 머리 바로 앞에 배치
    const head = state.snake.body[0];
    state.food = {
      x: head.x + state.snake.direction.x,
      y: head.y + state.snake.direction.y,
    };
    const next = tick(state);
    assert.strictEqual(next.score, state.score + 1);
  });

  it('음식을 먹으면 뱀이 성장한다', () => {
    const state = createGameState();
    const head = state.snake.body[0];
    state.food = {
      x: head.x + state.snake.direction.x,
      y: head.y + state.snake.direction.y,
    };
    const lengthBefore = state.snake.body.length;
    const next = tick(state);
    assert.strictEqual(next.snake.body.length, lengthBefore + 1);
  });

  it('벽에 충돌하면 게임 오버가 된다', () => {
    const state = createGameState();
    // 뱀을 벽 가장자리로 이동
    state.snake = {
      body: [
        { x: CELL_COUNT - 1, y: 0 },
        { x: CELL_COUNT - 2, y: 0 },
        { x: CELL_COUNT - 3, y: 0 },
      ],
      direction: DIRECTION.RIGHT,
    };
    const next = tick(state);
    assert.strictEqual(next.isGameOver, true);
  });

  it('게임 오버 상태에서는 상태가 변하지 않는다', () => {
    const state = createGameState();
    state.isGameOver = true;
    const next = tick(state);
    assert.deepStrictEqual(next, state);
  });
});
