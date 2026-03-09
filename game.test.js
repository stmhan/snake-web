const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  DIRECTION,
  GAME_STATUS,
  DEFAULT_GRID_WIDTH,
  DEFAULT_GRID_HEIGHT,
  INITIAL_SNAKE_LENGTH,
  createGame,
  getNextHeadPosition,
  isOutOfBounds,
  isSelfCollision,
  changeDirection,
  tick,
  startGame,
  resetGame,
} = require('./game.js');

describe('createGame', () => {
  it('기본 그리드 크기로 게임을 생성한다', () => {
    const state = createGame();
    assert.equal(state.gridWidth, DEFAULT_GRID_WIDTH);
    assert.equal(state.gridHeight, DEFAULT_GRID_HEIGHT);
  });

  it('커스텀 그리드 크기로 게임을 생성한다', () => {
    const state = createGame({ gridWidth: 10, gridHeight: 15 });
    assert.equal(state.gridWidth, 10);
    assert.equal(state.gridHeight, 15);
  });

  it('뱀의 초기 길이가 올바르다', () => {
    const state = createGame();
    assert.equal(state.snake.length, INITIAL_SNAKE_LENGTH);
  });

  it('뱀이 그리드 중앙에 위치한다', () => {
    const state = createGame({ gridWidth: 20, gridHeight: 20 });
    const head = state.snake[0];
    assert.equal(head.x, 10);
    assert.equal(head.y, 10);
  });

  it('뱀이 수평으로 배치되어 머리가 오른쪽을 향한다', () => {
    const state = createGame();
    const head = state.snake[0];
    for (let i = 1; i < state.snake.length; i++) {
      assert.equal(state.snake[i].x, head.x - i);
      assert.equal(state.snake[i].y, head.y);
    }
  });

  it('초기 방향이 오른쪽이다', () => {
    const state = createGame();
    assert.equal(state.direction, DIRECTION.RIGHT);
  });

  it('초기 상태가 READY이다', () => {
    const state = createGame();
    assert.equal(state.status, GAME_STATUS.READY);
  });

  it('초기 점수가 0이다', () => {
    const state = createGame();
    assert.equal(state.score, 0);
  });

  it('먹이가 배치되어 있다', () => {
    const state = createGame();
    assert.notEqual(state.food, null);
  });

  it('먹이가 뱀 위에 배치되지 않는다', () => {
    const state = createGame();
    const isOnSnake = state.snake.some(
      segment => segment.x === state.food.x && segment.y === state.food.y
    );
    assert.equal(isOnSnake, false);
  });
});

describe('getNextHeadPosition', () => {
  it('오른쪽으로 이동할 때 다음 위치를 반환한다', () => {
    const state = createGame();
    state.nextDirection = DIRECTION.RIGHT;
    const next = getNextHeadPosition(state);
    assert.equal(next.x, state.snake[0].x + 1);
    assert.equal(next.y, state.snake[0].y);
  });

  it('위쪽으로 이동할 때 다음 위치를 반환한다', () => {
    const state = createGame();
    state.nextDirection = DIRECTION.UP;
    const next = getNextHeadPosition(state);
    assert.equal(next.x, state.snake[0].x);
    assert.equal(next.y, state.snake[0].y - 1);
  });

  it('아래쪽으로 이동할 때 다음 위치를 반환한다', () => {
    const state = createGame();
    state.nextDirection = DIRECTION.DOWN;
    const next = getNextHeadPosition(state);
    assert.equal(next.x, state.snake[0].x);
    assert.equal(next.y, state.snake[0].y + 1);
  });

  it('왼쪽으로 이동할 때 다음 위치를 반환한다', () => {
    const state = createGame();
    state.nextDirection = DIRECTION.LEFT;
    const next = getNextHeadPosition(state);
    assert.equal(next.x, state.snake[0].x - 1);
    assert.equal(next.y, state.snake[0].y);
  });
});

describe('isOutOfBounds', () => {
  it('그리드 안의 위치는 false를 반환한다', () => {
    assert.equal(isOutOfBounds({ x: 5, y: 5 }, 20, 20), false);
  });

  it('왼쪽 벽 바깥은 true를 반환한다', () => {
    assert.equal(isOutOfBounds({ x: -1, y: 5 }, 20, 20), true);
  });

  it('오른쪽 벽 바깥은 true를 반환한다', () => {
    assert.equal(isOutOfBounds({ x: 20, y: 5 }, 20, 20), true);
  });

  it('위쪽 벽 바깥은 true를 반환한다', () => {
    assert.equal(isOutOfBounds({ x: 5, y: -1 }, 20, 20), true);
  });

  it('아래쪽 벽 바깥은 true를 반환한다', () => {
    assert.equal(isOutOfBounds({ x: 5, y: 20 }, 20, 20), true);
  });

  it('경계값 (0,0)은 false를 반환한다', () => {
    assert.equal(isOutOfBounds({ x: 0, y: 0 }, 20, 20), false);
  });

  it('경계값 (19,19)은 false를 반환한다', () => {
    assert.equal(isOutOfBounds({ x: 19, y: 19 }, 20, 20), false);
  });
});

describe('isSelfCollision', () => {
  it('뱀과 겹치지 않으면 false를 반환한다', () => {
    const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
    assert.equal(isSelfCollision({ x: 6, y: 5 }, snake), false);
  });

  it('뱀과 겹치면 true를 반환한다', () => {
    const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
    assert.equal(isSelfCollision({ x: 5, y: 5 }, snake), true);
  });
});

describe('changeDirection', () => {
  it('유효한 방향으로 변경한다', () => {
    let state = createGame();
    state = { ...state, status: GAME_STATUS.PLAYING };
    const newState = changeDirection(state, DIRECTION.UP);
    assert.equal(newState.nextDirection, DIRECTION.UP);
  });

  it('반대 방향으로는 변경하지 않는다', () => {
    let state = createGame();
    state = { ...state, status: GAME_STATUS.PLAYING, direction: DIRECTION.RIGHT };
    const newState = changeDirection(state, DIRECTION.LEFT);
    assert.equal(newState.nextDirection, DIRECTION.RIGHT);
  });

  it('게임이 PLAYING 상태가 아니면 방향을 변경하지 않는다', () => {
    const state = createGame();
    const newState = changeDirection(state, DIRECTION.UP);
    assert.equal(newState.nextDirection, state.nextDirection);
  });

  it('같은 방향으로의 변경은 허용한다', () => {
    let state = createGame();
    state = { ...state, status: GAME_STATUS.PLAYING };
    const newState = changeDirection(state, DIRECTION.RIGHT);
    assert.equal(newState.nextDirection, DIRECTION.RIGHT);
  });
});

describe('tick', () => {
  it('PLAYING 상태가 아니면 상태를 변경하지 않는다', () => {
    const state = createGame();
    const newState = tick(state);
    assert.deepEqual(newState, state);
  });

  it('뱀이 현재 방향으로 한 칸 이동한다', () => {
    let state = createGame({ gridWidth: 20, gridHeight: 20 });
    state = { ...state, status: GAME_STATUS.PLAYING, food: { x: 0, y: 0 } };
    const headBefore = state.snake[0];
    const newState = tick(state);
    assert.equal(newState.snake[0].x, headBefore.x + 1);
    assert.equal(newState.snake[0].y, headBefore.y);
  });

  it('이동 후 뱀 길이가 유지된다 (먹이를 먹지 않은 경우)', () => {
    let state = createGame({ gridWidth: 20, gridHeight: 20 });
    state = { ...state, status: GAME_STATUS.PLAYING, food: { x: 0, y: 0 } };
    const lengthBefore = state.snake.length;
    const newState = tick(state);
    assert.equal(newState.snake.length, lengthBefore);
  });

  it('벽에 부딪히면 GAME_OVER 상태가 된다', () => {
    let state = createGame({ gridWidth: 20, gridHeight: 20 });
    state = {
      ...state,
      status: GAME_STATUS.PLAYING,
      snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
      direction: DIRECTION.RIGHT,
      nextDirection: DIRECTION.RIGHT,
    };
    const newState = tick(state);
    assert.equal(newState.status, GAME_STATUS.GAME_OVER);
  });

  it('자기 몸에 부딪히면 GAME_OVER 상태가 된다', () => {
    let state = createGame({ gridWidth: 20, gridHeight: 20 });
    state = {
      ...state,
      status: GAME_STATUS.PLAYING,
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
        { x: 4, y: 5 },
      ],
      direction: DIRECTION.DOWN,
      nextDirection: DIRECTION.DOWN,
    };
    const newState = tick(state);
    assert.equal(newState.status, GAME_STATUS.GAME_OVER);
  });

  it('먹이를 먹으면 뱀 길이가 1 증가한다', () => {
    let state = createGame({ gridWidth: 20, gridHeight: 20 });
    const head = state.snake[0];
    state = {
      ...state,
      status: GAME_STATUS.PLAYING,
      food: { x: head.x + 1, y: head.y },
    };
    const lengthBefore = state.snake.length;
    const newState = tick(state);
    assert.equal(newState.snake.length, lengthBefore + 1);
  });

  it('먹이를 먹으면 점수가 1 증가한다', () => {
    let state = createGame({ gridWidth: 20, gridHeight: 20 });
    const head = state.snake[0];
    state = {
      ...state,
      status: GAME_STATUS.PLAYING,
      food: { x: head.x + 1, y: head.y },
    };
    const newState = tick(state);
    assert.equal(newState.score, state.score + 1);
  });

  it('먹이를 먹으면 새 먹이가 배치된다', () => {
    let state = createGame({ gridWidth: 20, gridHeight: 20 });
    const head = state.snake[0];
    state = {
      ...state,
      status: GAME_STATUS.PLAYING,
      food: { x: head.x + 1, y: head.y },
    };
    const newState = tick(state);
    assert.notEqual(newState.food, null);
    const isFoodOnSnake = newState.snake.some(
      s => s.x === newState.food.x && s.y === newState.food.y
    );
    assert.equal(isFoodOnSnake, false);
  });

  it('tick 후 direction이 nextDirection으로 업데이트된다', () => {
    let state = createGame({ gridWidth: 20, gridHeight: 20 });
    state = {
      ...state,
      status: GAME_STATUS.PLAYING,
      direction: DIRECTION.RIGHT,
      nextDirection: DIRECTION.UP,
      food: { x: 0, y: 0 },
    };
    const newState = tick(state);
    assert.equal(newState.direction, DIRECTION.UP);
  });
});

describe('startGame', () => {
  it('READY 상태에서 PLAYING으로 전환한다', () => {
    const state = createGame();
    const newState = startGame(state);
    assert.equal(newState.status, GAME_STATUS.PLAYING);
  });

  it('GAME_OVER 상태에서는 변경하지 않는다', () => {
    let state = createGame();
    state = { ...state, status: GAME_STATUS.GAME_OVER };
    const newState = startGame(state);
    assert.equal(newState.status, GAME_STATUS.GAME_OVER);
  });
});

describe('resetGame', () => {
  it('게임을 초기 상태로 리셋한다', () => {
    let state = createGame({ gridWidth: 15, gridHeight: 15 });
    state = { ...state, status: GAME_STATUS.GAME_OVER, score: 10 };
    const newState = resetGame(state);
    assert.equal(newState.status, GAME_STATUS.READY);
    assert.equal(newState.score, 0);
    assert.equal(newState.gridWidth, 15);
    assert.equal(newState.gridHeight, 15);
    assert.equal(newState.snake.length, INITIAL_SNAKE_LENGTH);
  });
});
