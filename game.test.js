const {
  GRID_WIDTH,
  GRID_HEIGHT,
  DIRECTION,
  createInitialState,
  moveSnake,
  changeDirection,
  checkWallCollision,
  checkSelfCollision,
  checkFoodCollision,
  generateFood,
  tick,
} = require('./game');

describe('createInitialState', () => {
  test('뱀이 그리드 중앙 근처에서 시작한다', () => {
    const state = createInitialState();
    const head = state.snake[0];

    expect(head.x).toBe(Math.floor(GRID_WIDTH / 2));
    expect(head.y).toBe(Math.floor(GRID_HEIGHT / 2));
  });

  test('초기 뱀 길이가 3이다', () => {
    const state = createInitialState();

    expect(state.snake).toHaveLength(3);
  });

  test('초기 방향이 오른쪽이다', () => {
    const state = createInitialState();

    expect(state.direction).toBe(DIRECTION.RIGHT);
  });

  test('초기 점수가 0이다', () => {
    const state = createInitialState();

    expect(state.score).toBe(0);
  });

  test('게임 오버 상태가 false이다', () => {
    const state = createInitialState();

    expect(state.isGameOver).toBe(false);
  });

  test('음식이 존재한다', () => {
    const state = createInitialState();

    expect(state.food).toBeDefined();
    expect(state.food.x).toBeGreaterThanOrEqual(0);
    expect(state.food.y).toBeGreaterThanOrEqual(0);
  });
});

describe('changeDirection', () => {
  test('직각 방향으로 변경할 수 있다', () => {
    const state = createInitialState();

    changeDirection(state, DIRECTION.UP);

    expect(state.direction).toBe(DIRECTION.UP);
  });

  test('반대 방향으로는 변경할 수 없다', () => {
    const state = createInitialState();

    changeDirection(state, DIRECTION.LEFT);

    expect(state.direction).toBe(DIRECTION.RIGHT);
  });

  test('위쪽에서 아래쪽으로 변경할 수 없다', () => {
    const state = createInitialState();
    state.direction = DIRECTION.UP;

    changeDirection(state, DIRECTION.DOWN);

    expect(state.direction).toBe(DIRECTION.UP);
  });
});

describe('moveSnake', () => {
  test('오른쪽으로 이동하면 머리의 x가 1 증가한다', () => {
    const state = createInitialState();
    const headX = state.snake[0].x;

    moveSnake(state);

    expect(state.snake[0].x).toBe(headX + 1);
    expect(state.snake[0].y).toBe(state.snake[1].y);
  });

  test('위쪽으로 이동하면 머리의 y가 1 감소한다', () => {
    const state = createInitialState();
    state.direction = DIRECTION.UP;
    const headY = state.snake[0].y;

    moveSnake(state);

    expect(state.snake[0].y).toBe(headY - 1);
  });

  test('이동 후 뱀 길이가 유지된다', () => {
    const state = createInitialState();
    const length = state.snake.length;

    moveSnake(state);

    expect(state.snake).toHaveLength(length);
  });
});

describe('checkWallCollision', () => {
  test('머리가 오른쪽 벽을 넘으면 충돌이다', () => {
    const state = createInitialState();
    state.snake[0] = { x: GRID_WIDTH, y: 5 };

    expect(checkWallCollision(state)).toBe(true);
  });

  test('머리가 왼쪽 벽을 넘으면 충돌이다', () => {
    const state = createInitialState();
    state.snake[0] = { x: -1, y: 5 };

    expect(checkWallCollision(state)).toBe(true);
  });

  test('머리가 위쪽 벽을 넘으면 충돌이다', () => {
    const state = createInitialState();
    state.snake[0] = { x: 5, y: -1 };

    expect(checkWallCollision(state)).toBe(true);
  });

  test('머리가 아래쪽 벽을 넘으면 충돌이다', () => {
    const state = createInitialState();
    state.snake[0] = { x: 5, y: GRID_HEIGHT };

    expect(checkWallCollision(state)).toBe(true);
  });

  test('머리가 그리드 안에 있으면 충돌이 아니다', () => {
    const state = createInitialState();
    state.snake[0] = { x: 5, y: 5 };

    expect(checkWallCollision(state)).toBe(false);
  });
});

describe('checkSelfCollision', () => {
  test('머리가 몸통과 겹치면 충돌이다', () => {
    const state = createInitialState();
    state.snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 5, y: 5 },
    ];

    expect(checkSelfCollision(state)).toBe(true);
  });

  test('머리가 몸통과 겹치지 않으면 충돌이 아니다', () => {
    const state = createInitialState();

    expect(checkSelfCollision(state)).toBe(false);
  });
});

describe('checkFoodCollision', () => {
  test('머리가 음식 위치에 있으면 true를 반환한다', () => {
    const state = createInitialState();
    state.food = { x: state.snake[0].x, y: state.snake[0].y };

    expect(checkFoodCollision(state)).toBe(true);
  });

  test('머리가 음식 위치에 없으면 false를 반환한다', () => {
    const state = createInitialState();
    state.food = { x: 0, y: 0 };
    state.snake[0] = { x: 5, y: 5 };

    expect(checkFoodCollision(state)).toBe(false);
  });
});

describe('generateFood', () => {
  test('뱀이 차지하지 않은 위치에 음식을 생성한다', () => {
    const state = createInitialState();

    generateFood(state);

    const isOnSnake = state.snake.some(
      (segment) => segment.x === state.food.x && segment.y === state.food.y
    );
    expect(isOnSnake).toBe(false);
  });

  test('음식이 그리드 범위 안에 있다', () => {
    const state = createInitialState();

    generateFood(state);

    expect(state.food.x).toBeGreaterThanOrEqual(0);
    expect(state.food.x).toBeLessThan(GRID_WIDTH);
    expect(state.food.y).toBeGreaterThanOrEqual(0);
    expect(state.food.y).toBeLessThan(GRID_HEIGHT);
  });
});

describe('tick', () => {
  test('음식을 먹으면 점수가 증가한다', () => {
    const state = createInitialState();
    const head = state.snake[0];
    state.food = { x: head.x + 1, y: head.y };

    tick(state);

    expect(state.score).toBe(1);
  });

  test('음식을 먹으면 뱀 길이가 1 증가한다', () => {
    const state = createInitialState();
    const head = state.snake[0];
    const length = state.snake.length;
    state.food = { x: head.x + 1, y: head.y };

    tick(state);

    expect(state.snake).toHaveLength(length + 1);
  });

  test('벽에 충돌하면 게임 오버가 된다', () => {
    const state = createInitialState();
    state.snake[0] = { x: GRID_WIDTH - 1, y: 5 };
    state.direction = DIRECTION.RIGHT;

    tick(state);

    expect(state.isGameOver).toBe(true);
  });

  test('자기 자신과 충돌하면 게임 오버가 된다', () => {
    const state = createInitialState();
    state.snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
    ];
    state.direction = DIRECTION.DOWN;

    tick(state);

    expect(state.isGameOver).toBe(true);
  });

  test('게임 오버 상태에서는 tick이 상태를 변경하지 않는다', () => {
    const state = createInitialState();
    state.isGameOver = true;
    const snapshot = JSON.stringify(state);

    tick(state);

    expect(JSON.stringify(state)).toBe(snapshot);
  });
});
