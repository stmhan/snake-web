const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Snake, Game, DIRECTION, CELL_COUNT } = require('./game.js');

describe('Snake', () => {
  it('기본 위치와 방향으로 초기화된다', () => {
    const snake = new Snake();

    assert.equal(snake.body.length, 3);
    assert.deepEqual(snake.getHead(), { x: 10, y: 10 });
    assert.deepEqual(snake.direction, DIRECTION.RIGHT);
  });

  it('현재 방향으로 한 칸 이동한다', () => {
    const snake = new Snake();
    snake.move();

    assert.deepEqual(snake.getHead(), { x: 11, y: 10 });
    assert.equal(snake.body.length, 3);
  });

  it('방향 전환 후 새로운 방향으로 이동한다', () => {
    const snake = new Snake();
    snake.setDirection(DIRECTION.DOWN);
    snake.move();

    assert.deepEqual(snake.getHead(), { x: 10, y: 11 });
  });

  it('반대 방향으로는 전환할 수 없다', () => {
    const snake = new Snake();
    snake.setDirection(DIRECTION.LEFT);
    snake.move();

    assert.deepEqual(snake.getHead(), { x: 11, y: 10 });
  });

  it('grow 호출 후 다음 이동에서 길이가 1 증가한다', () => {
    const snake = new Snake();
    snake.grow();
    snake.move();

    assert.equal(snake.body.length, 4);
    assert.deepEqual(snake.getHead(), { x: 11, y: 10 });
  });

  it('grow 없이 이동하면 길이가 유지된다', () => {
    const snake = new Snake();
    const originalLength = snake.body.length;
    snake.move();

    assert.equal(snake.body.length, originalLength);
  });

  it('이동 시 몸통이 머리를 따라간다', () => {
    const snake = new Snake();
    snake.move();
    snake.move();

    assert.deepEqual(snake.body[0], { x: 12, y: 10 });
    assert.deepEqual(snake.body[1], { x: 11, y: 10 });
    assert.deepEqual(snake.body[2], { x: 10, y: 10 });
  });

  it('같은 프레임에서 반대 방향 입력은 무시된다', () => {
    const snake = new Snake();
    snake.setDirection(DIRECTION.UP);
    snake.setDirection(DIRECTION.LEFT);
    snake.move();

    // LEFT는 현재 방향(RIGHT)의 반대이므로 무시, UP이 적용됨
    assert.deepEqual(snake.getHead(), { x: 10, y: 9 });
  });

  it('reset으로 초기 상태로 되돌린다', () => {
    const snake = new Snake();
    snake.setDirection(DIRECTION.DOWN);
    snake.move();
    snake.move();
    snake.grow();
    snake.move();

    snake.reset();

    assert.equal(snake.body.length, 3);
    assert.deepEqual(snake.getHead(), { x: 10, y: 10 });
    assert.deepEqual(snake.direction, DIRECTION.RIGHT);
  });
});

describe('Game', () => {
  it('초기화 시 뱀과 음식이 생성된다', () => {
    const game = new Game();

    assert.ok(game.snake instanceof Snake);
    assert.ok(game.food);
    assert.equal(game.score, 0);
    assert.equal(game.isGameOver, false);
  });

  it('음식은 뱀의 몸 위에 생성되지 않는다', () => {
    const game = new Game();
    const isOnSnake = game.snake.body.some(
      segment => segment.x === game.food.x && segment.y === game.food.y
    );

    assert.equal(isOnSnake, false);
  });

  it('뱀이 벽에 부딪히면 게임 오버가 된다', () => {
    const game = new Game();
    game.snake.body = [
      { x: CELL_COUNT - 1, y: 5 },
      { x: CELL_COUNT - 2, y: 5 },
      { x: CELL_COUNT - 3, y: 5 }
    ];
    game.snake.direction = DIRECTION.RIGHT;
    game.snake.nextDirection = DIRECTION.RIGHT;

    game.update();

    assert.equal(game.isGameOver, true);
  });

  it('왼쪽 벽 충돌로 게임 오버가 된다', () => {
    const game = new Game();
    game.snake.body = [
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 }
    ];
    game.snake.direction = DIRECTION.LEFT;
    game.snake.nextDirection = DIRECTION.LEFT;

    game.update();

    assert.equal(game.isGameOver, true);
  });

  it('위쪽 벽 충돌로 게임 오버가 된다', () => {
    const game = new Game();
    game.snake.body = [
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 }
    ];
    game.snake.direction = DIRECTION.UP;
    game.snake.nextDirection = DIRECTION.UP;

    game.update();

    assert.equal(game.isGameOver, true);
  });

  it('아래쪽 벽 충돌로 게임 오버가 된다', () => {
    const game = new Game();
    game.snake.body = [
      { x: 5, y: CELL_COUNT - 1 },
      { x: 5, y: CELL_COUNT - 2 },
      { x: 5, y: CELL_COUNT - 3 }
    ];
    game.snake.direction = DIRECTION.DOWN;
    game.snake.nextDirection = DIRECTION.DOWN;

    game.update();

    assert.equal(game.isGameOver, true);
  });

  it('뱀이 자기 몸에 부딪히면 게임 오버가 된다', () => {
    const game = new Game();
    game.snake.body = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
      { x: 4, y: 5 }
    ];
    game.snake.direction = DIRECTION.DOWN;
    game.snake.nextDirection = DIRECTION.DOWN;

    game.update();

    assert.equal(game.isGameOver, true);
  });

  it('음식을 먹으면 점수가 1 증가한다', () => {
    const game = new Game();
    game.food = { x: 11, y: 10 };
    game.snake.body = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    game.snake.direction = DIRECTION.RIGHT;
    game.snake.nextDirection = DIRECTION.RIGHT;

    game.update();

    assert.equal(game.score, 1);
  });

  it('음식을 먹으면 새로운 음식이 생성된다', () => {
    const game = new Game();
    game.food = { x: 11, y: 10 };
    game.snake.body = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    game.snake.direction = DIRECTION.RIGHT;
    game.snake.nextDirection = DIRECTION.RIGHT;

    game.update();

    assert.notDeepEqual(game.food, { x: 11, y: 10 });
  });

  it('음식을 먹으면 다음 이동에서 뱀 길이가 증가한다', () => {
    const game = new Game();
    game.food = { x: 11, y: 10 };
    game.snake.body = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    game.snake.direction = DIRECTION.RIGHT;
    game.snake.nextDirection = DIRECTION.RIGHT;

    game.update();
    game.update();

    assert.equal(game.snake.body.length, 4);
  });

  it('게임 오버 후에는 update가 상태를 변경하지 않는다', () => {
    const game = new Game();
    game.isGameOver = true;
    const headBefore = { ...game.snake.getHead() };
    const scoreBefore = game.score;

    game.update();

    assert.deepEqual(game.snake.getHead(), headBefore);
    assert.equal(game.score, scoreBefore);
  });

  it('restart로 게임을 초기 상태로 되돌린다', () => {
    const game = new Game();
    game.food = { x: 11, y: 10 };
    game.snake.body = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    game.snake.direction = DIRECTION.RIGHT;
    game.snake.nextDirection = DIRECTION.RIGHT;
    game.update();
    game.isGameOver = true;

    game.restart();

    assert.equal(game.isGameOver, false);
    assert.equal(game.score, 0);
    assert.equal(game.snake.body.length, 3);
    assert.deepEqual(game.snake.getHead(), { x: 10, y: 10 });
    assert.ok(game.food);
  });
});
