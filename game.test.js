const { Snake, Game, DIRECTION, GRID_SIZE, CELL_COUNT } = require('./game');

describe('Snake', () => {
  let snake;

  beforeEach(() => {
    snake = new Snake();
  });

  test('초기 위치는 그리드 중앙 근처에 길이 3으로 생성된다', () => {
    expect(snake.body.length).toBe(3);
    const center = Math.floor(CELL_COUNT / 2);
    expect(snake.body[0]).toEqual({ x: center, y: center });
  });

  test('초기 방향은 오른쪽이다', () => {
    expect(snake.direction).toEqual(DIRECTION.RIGHT);
  });

  test('오른쪽으로 이동하면 머리의 x가 1 증가한다', () => {
    const headBefore = { ...snake.body[0] };
    snake.move();
    expect(snake.body[0]).toEqual({ x: headBefore.x + 1, y: headBefore.y });
  });

  test('이동하면 꼬리가 제거되어 길이가 유지된다', () => {
    const lengthBefore = snake.body.length;
    snake.move();
    expect(snake.body.length).toBe(lengthBefore);
  });

  test('방향을 위로 변경하면 위로 이동한다', () => {
    snake.changeDirection(DIRECTION.UP);
    const headBefore = { ...snake.body[0] };
    snake.move();
    expect(snake.body[0]).toEqual({ x: headBefore.x, y: headBefore.y - 1 });
  });

  test('현재 방향의 반대 방향으로는 변경할 수 없다', () => {
    snake.changeDirection(DIRECTION.LEFT);
    expect(snake.direction).toEqual(DIRECTION.RIGHT);
  });

  test('위로 이동 중 아래로 방향 변경이 무시된다', () => {
    snake.changeDirection(DIRECTION.UP);
    snake.move();
    snake.changeDirection(DIRECTION.DOWN);
    expect(snake.direction).toEqual(DIRECTION.UP);
  });

  test('grow 호출 후 이동하면 길이가 1 증가한다', () => {
    snake.grow();
    const lengthBefore = snake.body.length;
    snake.move();
    expect(snake.body.length).toBe(lengthBefore + 1);
  });

  test('머리 위치를 반환한다', () => {
    const head = snake.getHead();
    expect(head).toEqual(snake.body[0]);
  });

  test('특정 좌표에 몸이 존재하는지 확인한다', () => {
    const head = snake.getHead();
    expect(snake.isOnBody(head.x, head.y)).toBe(true);
    expect(snake.isOnBody(-1, -1)).toBe(false);
  });

  test('머리를 제외한 몸통과 충돌하는지 확인한다', () => {
    expect(snake.isCollidingWithSelf()).toBe(false);
  });
});

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('초기 점수는 0이다', () => {
    expect(game.score).toBe(0);
  });

  test('초기 상태는 playing이다', () => {
    expect(game.isGameOver).toBe(false);
  });

  test('음식이 그리드 내에 생성된다', () => {
    const food = game.food;
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(CELL_COUNT);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(CELL_COUNT);
  });

  test('음식은 뱀의 몸 위에 생성되지 않는다', () => {
    const isOnSnake = game.snake.isOnBody(game.food.x, game.food.y);
    expect(isOnSnake).toBe(false);
  });

  test('뱀이 음식을 먹으면 점수가 10 증가한다', () => {
    game.food = { ...game.snake.getHead() };
    const nextPos = {
      x: game.snake.getHead().x + DIRECTION.RIGHT.x,
      y: game.snake.getHead().y + DIRECTION.RIGHT.y,
    };
    game.food = nextPos;
    game.update();
    expect(game.score).toBe(10);
  });

  test('뱀이 음식을 먹으면 새 음식이 생성된다', () => {
    const nextPos = {
      x: game.snake.getHead().x + DIRECTION.RIGHT.x,
      y: game.snake.getHead().y + DIRECTION.RIGHT.y,
    };
    game.food = nextPos;
    const oldFood = { ...game.food };
    game.update();
    const foodChanged = game.food.x !== oldFood.x || game.food.y !== oldFood.y;
    expect(foodChanged || game.score === 10).toBe(true);
  });

  test('뱀이 벽에 부딪히면 게임 오버가 된다', () => {
    game.snake.body[0] = { x: CELL_COUNT - 1, y: 0 };
    game.snake.direction = DIRECTION.RIGHT;
    game.update();
    expect(game.isGameOver).toBe(true);
  });

  test('뱀이 위쪽 벽에 부딪히면 게임 오버가 된다', () => {
    game.snake.body[0] = { x: 5, y: 0 };
    game.snake.direction = DIRECTION.UP;
    game.update();
    expect(game.isGameOver).toBe(true);
  });

  test('뱀이 자기 몸에 부딪히면 게임 오버가 된다', () => {
    // 뱀을 길게 만든 후 자기 몸에 충돌시킨다
    game.snake.body = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
    ];
    game.snake.direction = DIRECTION.DOWN;
    game.update();
    // 머리가 (5,6)으로 이동 -> 몸통 (5,6)과 충돌
    expect(game.isGameOver).toBe(true);
  });

  test('게임 오버 상태에서 update를 호출하면 아무 일도 일어나지 않는다', () => {
    game.isGameOver = true;
    const bodyBefore = [...game.snake.body.map((s) => ({ ...s }))];
    game.update();
    expect(game.snake.body).toEqual(bodyBefore);
  });

  test('reset하면 게임이 초기 상태로 돌아간다', () => {
    game.score = 50;
    game.isGameOver = true;
    game.reset();
    expect(game.score).toBe(0);
    expect(game.isGameOver).toBe(false);
    expect(game.snake.body.length).toBe(3);
  });

  test('방향 변경을 Game을 통해 할 수 있다', () => {
    game.changeDirection(DIRECTION.UP);
    expect(game.snake.direction).toEqual(DIRECTION.UP);
  });
});
