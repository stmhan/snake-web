import { describe, it, assertEqual, assertTrue, assertFalse } from './test-runner.js';
import { GRID_WIDTH, GRID_HEIGHT, DIRECTION_RIGHT, DIRECTION_UP } from './constants.js';
import { createSnake } from './snake.js';
import { createGameState, tick, isWallCollision, isSelfCollision, resetGame } from './game-state.js';

describe('createGameState', () => {
  it('유효한 초기 상태를 반환한다', () => {
    const state = createGameState();
    assertTrue(state.snake.segments.length > 0);
    assertTrue(state.food !== null);
    assertEqual(state.score, 0);
    assertEqual(state.isGameOver, false);
  });

  it('음식이 뱀 위에 놓이지 않는다', () => {
    const state = createGameState();
    const isOnSnake = state.snake.segments.some(
      s => s.x === state.food.x && s.y === state.food.y
    );
    assertFalse(isOnSnake);
  });
});

describe('isWallCollision', () => {
  it('x가 0 이상이면 충돌하지 않는다', () => {
    assertFalse(isWallCollision({ x: 0, y: 0 }, GRID_WIDTH, GRID_HEIGHT));
  });

  it('x가 음수이면 충돌한다', () => {
    assertTrue(isWallCollision({ x: -1, y: 0 }, GRID_WIDTH, GRID_HEIGHT));
  });

  it('x가 gridWidth이면 충돌한다', () => {
    assertTrue(isWallCollision({ x: GRID_WIDTH, y: 0 }, GRID_WIDTH, GRID_HEIGHT));
  });

  it('x가 gridWidth - 1이면 충돌하지 않는다', () => {
    assertFalse(isWallCollision({ x: GRID_WIDTH - 1, y: 0 }, GRID_WIDTH, GRID_HEIGHT));
  });

  it('y가 음수이면 충돌한다', () => {
    assertTrue(isWallCollision({ x: 0, y: -1 }, GRID_WIDTH, GRID_HEIGHT));
  });

  it('y가 gridHeight이면 충돌한다', () => {
    assertTrue(isWallCollision({ x: 0, y: GRID_HEIGHT }, GRID_WIDTH, GRID_HEIGHT));
  });
});

describe('isSelfCollision', () => {
  it('head가 body segment와 겹치면 충돌한다', () => {
    const segments = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 5 }
    ];
    assertTrue(isSelfCollision(segments[0], segments));
  });

  it('head가 body와 겹치지 않으면 충돌하지 않는다', () => {
    const segments = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ];
    assertFalse(isSelfCollision(segments[0], segments));
  });

  it('segment가 하나뿐이면 충돌하지 않는다', () => {
    const segments = [{ x: 5, y: 5 }];
    assertFalse(isSelfCollision(segments[0], segments));
  });
});

describe('tick', () => {
  it('뱀을 현재 방향으로 이동시킨다', () => {
    const state = createGameState();
    const headBefore = state.snake.segments[0];
    // 음식을 먼 곳에 배치하여 먹는 상황 방지
    const safeState = { ...state, food: { x: 0, y: 0 } };
    const nextState = tick(safeState);
    const headAfter = nextState.snake.segments[0];
    assertEqual(headAfter.x, headBefore.x + state.snake.direction.x);
    assertEqual(headAfter.y, headBefore.y + state.snake.direction.y);
  });

  it('벽 충돌 시 isGameOver를 true로 설정한다', () => {
    const snake = {
      segments: [{ x: GRID_WIDTH - 1, y: 5 }, { x: GRID_WIDTH - 2, y: 5 }],
      direction: DIRECTION_RIGHT
    };
    const state = { snake, food: { x: 0, y: 0 }, score: 0, isGameOver: false };
    const nextState = tick(state);
    assertTrue(nextState.isGameOver);
  });

  it('자기 충돌 시 isGameOver를 true로 설정한다', () => {
    // 뱀이 자기 몸에 부딪히는 상황 구성
    const snake = {
      segments: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 4 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 }
      ],
      direction: DIRECTION_UP
    };
    // 위로 이동하면 (5,4)로 가는데 이미 body에 (5,4)가 있음
    const state = { snake, food: { x: 0, y: 0 }, score: 0, isGameOver: false };
    const nextState = tick(state);
    assertTrue(nextState.isGameOver);
  });

  it('음식을 먹으면 점수가 1 증가한다', () => {
    const snake = createSnake(5, 5);
    const foodPosition = { x: 6, y: 5 };
    const state = { snake, food: foodPosition, score: 0, isGameOver: false };
    const nextState = tick(state);
    assertEqual(nextState.score, 1);
  });

  it('음식을 먹으면 뱀 길이가 1 증가한다', () => {
    const snake = createSnake(5, 5);
    const foodPosition = { x: 6, y: 5 };
    const state = { snake, food: foodPosition, score: 0, isGameOver: false };
    const nextState = tick(state);
    assertEqual(nextState.snake.segments.length, snake.segments.length + 1);
  });

  it('음식을 먹으면 새 음식이 생성된다', () => {
    const snake = createSnake(5, 5);
    const foodPosition = { x: 6, y: 5 };
    const state = { snake, food: foodPosition, score: 0, isGameOver: false };
    const nextState = tick(state);
    const isFoodOnSnake = nextState.snake.segments.some(
      s => s.x === nextState.food.x && s.y === nextState.food.y
    );
    assertFalse(isFoodOnSnake);
  });

  it('게임오버 상태에서는 상태가 변경되지 않는다', () => {
    const state = { snake: createSnake(5, 5), food: { x: 0, y: 0 }, score: 3, isGameOver: true };
    const nextState = tick(state);
    assertEqual(nextState.score, 3);
    assertTrue(nextState.isGameOver);
  });
});

describe('resetGame', () => {
  it('새로운 초기 상태를 반환한다', () => {
    const state = resetGame();
    assertEqual(state.score, 0);
    assertEqual(state.isGameOver, false);
    assertTrue(state.snake.segments.length > 0);
  });
});
