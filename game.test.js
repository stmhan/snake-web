const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Game, DIRECTION } = require('./game.js');

const GRID_SIZE = 20;

describe('Game 초기화', () => {
  it('게임 생성 시 뱀이 그리드 중앙에 위치한다', () => {
    const game = new Game(GRID_SIZE);
    const head = game.snake[0];

    assert.equal(head.x, Math.floor(GRID_SIZE / 2));
    assert.equal(head.y, Math.floor(GRID_SIZE / 2));
  });

  it('게임 생성 시 뱀의 길이가 3이다', () => {
    const game = new Game(GRID_SIZE);

    assert.equal(game.snake.length, 3);
  });

  it('게임 생성 시 초기 방향은 오른쪽이다', () => {
    const game = new Game(GRID_SIZE);

    assert.equal(game.direction, DIRECTION.RIGHT);
  });

  it('게임 생성 시 점수가 0이다', () => {
    const game = new Game(GRID_SIZE);

    assert.equal(game.score, 0);
  });

  it('게임 생성 시 isGameOver가 false이다', () => {
    const game = new Game(GRID_SIZE);

    assert.equal(game.isGameOver, false);
  });

  it('게임 생성 시 음식이 그리드 내에 배치된다', () => {
    const game = new Game(GRID_SIZE);

    assert.ok(game.food.x >= 0 && game.food.x < GRID_SIZE);
    assert.ok(game.food.y >= 0 && game.food.y < GRID_SIZE);
  });

  it('게임 생성 시 음식이 뱀 위에 배치되지 않는다', () => {
    const game = new Game(GRID_SIZE);
    const isOnSnake = game.snake.some(
      segment => segment.x === game.food.x && segment.y === game.food.y
    );

    assert.equal(isOnSnake, false);
  });
});

describe('방향 변경', () => {
  it('현재 방향과 반대 방향으로 변경할 수 없다', () => {
    const game = new Game(GRID_SIZE);
    game.changeDirection(DIRECTION.LEFT);

    assert.equal(game.direction, DIRECTION.RIGHT);
  });

  it('현재 방향과 수직인 방향으로 변경할 수 있다', () => {
    const game = new Game(GRID_SIZE);
    game.changeDirection(DIRECTION.UP);

    assert.equal(game.direction, DIRECTION.UP);
  });

  it('게임 오버 상태에서는 방향을 변경할 수 없다', () => {
    const game = new Game(GRID_SIZE);
    game.isGameOver = true;
    game.changeDirection(DIRECTION.UP);

    assert.equal(game.direction, DIRECTION.RIGHT);
  });
});

describe('뱀 이동', () => {
  it('오른쪽으로 이동하면 머리의 x좌표가 1 증가한다', () => {
    const game = new Game(GRID_SIZE);
    const headX = game.snake[0].x;
    game.tick();

    assert.equal(game.snake[0].x, headX + 1);
    assert.equal(game.snake[0].y, game.snake[1].y);
  });

  it('위쪽으로 이동하면 머리의 y좌표가 1 감소한다', () => {
    const game = new Game(GRID_SIZE);
    game.changeDirection(DIRECTION.UP);
    const headY = game.snake[0].y;
    game.tick();

    assert.equal(game.snake[0].y, headY - 1);
  });

  it('이동 후 뱀의 길이가 유지된다', () => {
    const game = new Game(GRID_SIZE);
    const initialLength = game.snake.length;
    game.tick();

    assert.equal(game.snake.length, initialLength);
  });
});

describe('벽 충돌', () => {
  it('오른쪽 벽에 충돌하면 게임 오버', () => {
    const game = new Game(GRID_SIZE);
    game.snake[0].x = GRID_SIZE - 1;
    game.tick();

    assert.equal(game.isGameOver, true);
  });

  it('왼쪽 벽에 충돌하면 게임 오버', () => {
    const game = new Game(GRID_SIZE);
    game.changeDirection(DIRECTION.UP);
    game.tick();
    game.changeDirection(DIRECTION.LEFT);
    game.snake[0].x = 0;
    game.tick();

    assert.equal(game.isGameOver, true);
  });

  it('위쪽 벽에 충돌하면 게임 오버', () => {
    const game = new Game(GRID_SIZE);
    game.changeDirection(DIRECTION.UP);
    game.snake[0].y = 0;
    game.tick();

    assert.equal(game.isGameOver, true);
  });

  it('아래쪽 벽에 충돌하면 게임 오버', () => {
    const game = new Game(GRID_SIZE);
    game.changeDirection(DIRECTION.DOWN);
    game.snake[0].y = GRID_SIZE - 1;
    game.tick();

    assert.equal(game.isGameOver, true);
  });
});

describe('자기 자신과 충돌', () => {
  it('뱀이 자기 몸에 부딪히면 게임 오버', () => {
    const game = new Game(GRID_SIZE);
    // 긴 뱀을 수동 설정하여 자기 충돌 유도
    game.snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 4 },
    ];
    game.direction = DIRECTION.UP;
    game.tick();
    // 머리가 (5, 4)로 이동 -> 몸통과 겹침

    assert.equal(game.isGameOver, true);
  });

  it('꼬리 위치로 이동하면 충돌하지 않는다', () => {
    const game = new Game(GRID_SIZE);
    // 뱀이 꼬리 자리로 이동하는 상황 설정
    game.snake = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 6, y: 5 },
    ];
    game.direction = DIRECTION.RIGHT;
    game.food = { x: 0, y: 0 };
    game.tick();
    // 머리가 (6, 5)로 이동 -> 꼬리가 pop되어 비어 있는 자리

    assert.equal(game.isGameOver, false);
  });
});

describe('음식 생성', () => {
  it('뱀이 그리드 전체를 채우면 spawnFood가 null을 반환한다', () => {
    const game = new Game(3);
    // 3x3 그리드를 뱀으로 전부 채움
    game.snake = [];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        game.snake.push({ x, y });
      }
    }

    assert.equal(game.spawnFood(), null);
  });
});

describe('음식 먹기', () => {
  it('음식을 먹으면 점수가 증가한다', () => {
    const game = new Game(GRID_SIZE);
    game.food = { x: game.snake[0].x + 1, y: game.snake[0].y };
    game.tick();

    assert.equal(game.score, 1);
  });

  it('음식을 먹으면 뱀의 길이가 1 증가한다', () => {
    const game = new Game(GRID_SIZE);
    const initialLength = game.snake.length;
    game.food = { x: game.snake[0].x + 1, y: game.snake[0].y };
    game.tick();

    assert.equal(game.snake.length, initialLength + 1);
  });

  it('음식을 먹으면 새로운 음식이 생성된다', () => {
    const game = new Game(GRID_SIZE);
    const oldFood = { ...game.food };
    game.food = { x: game.snake[0].x + 1, y: game.snake[0].y };
    game.tick();

    const newFoodIsOnSnake = game.snake.some(
      segment => segment.x === game.food.x && segment.y === game.food.y
    );
    assert.equal(newFoodIsOnSnake, false);
  });
});

describe('게임 리셋', () => {
  it('리셋하면 초기 상태로 돌아간다', () => {
    const game = new Game(GRID_SIZE);
    game.food = { x: game.snake[0].x + 1, y: game.snake[0].y };
    game.tick();
    game.tick();
    game.reset();

    assert.equal(game.snake.length, 3);
    assert.equal(game.score, 0);
    assert.equal(game.isGameOver, false);
    assert.equal(game.direction, DIRECTION.RIGHT);
  });
});
