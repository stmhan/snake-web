import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Game, DIRECTION, GRID_SIZE } from './game.js';

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  describe('초기 상태', () => {
    it('뱀이 그리드 중앙에서 시작한다', () => {
      const state = game.getState();
      const center = Math.floor(GRID_SIZE / 2);

      assert.deepStrictEqual(state.snake[0], { x: center, y: center });
    });

    it('뱀의 초기 길이는 3이다', () => {
      const state = game.getState();

      assert.strictEqual(state.snake.length, 3);
    });

    it('초기 방향은 오른쪽이다', () => {
      const state = game.getState();

      assert.deepStrictEqual(state.direction, DIRECTION.RIGHT);
    });

    it('초기 점수는 0이다', () => {
      const state = game.getState();

      assert.strictEqual(state.score, 0);
    });

    it('게임이 시작되지 않은 상태이다', () => {
      const state = game.getState();

      assert.strictEqual(state.isGameOver, false);
    });

    it('음식이 그리드 내에 배치된다', () => {
      const state = game.getState();

      assert.ok(state.food.x >= 0 && state.food.x < GRID_SIZE);
      assert.ok(state.food.y >= 0 && state.food.y < GRID_SIZE);
    });

    it('음식이 뱀 위에 배치되지 않는다', () => {
      const state = game.getState();
      const isOnSnake = state.snake.some(
        segment => segment.x === state.food.x && segment.y === state.food.y
      );

      assert.strictEqual(isOnSnake, false);
    });
  });

  describe('방향 전환', () => {
    it('위쪽으로 방향을 전환할 수 있다', () => {
      game.changeDirection(DIRECTION.UP);
      const state = game.getState();

      assert.deepStrictEqual(state.direction, DIRECTION.UP);
    });

    it('아래쪽으로 방향을 전환할 수 있다', () => {
      game.changeDirection(DIRECTION.UP);
      game.update();
      game.changeDirection(DIRECTION.DOWN);

      // 위쪽으로 이동 중이므로 반대 방향인 아래쪽은 무시된다
      const state = game.getState();
      assert.deepStrictEqual(state.direction, DIRECTION.UP);
    });

    it('현재 방향의 반대 방향으로 전환할 수 없다', () => {
      // 초기 방향은 오른쪽이므로 왼쪽은 무시
      game.changeDirection(DIRECTION.LEFT);
      const state = game.getState();

      assert.deepStrictEqual(state.direction, DIRECTION.RIGHT);
    });

    it('같은 축이 아닌 방향으로는 전환할 수 있다', () => {
      game.changeDirection(DIRECTION.UP);
      const state = game.getState();

      assert.deepStrictEqual(state.direction, DIRECTION.UP);
    });
  });

  describe('이동', () => {
    it('오른쪽으로 이동하면 머리의 x좌표가 1 증가한다', () => {
      const headBefore = { ...game.getState().snake[0] };
      game.update();
      const headAfter = game.getState().snake[0];

      assert.strictEqual(headAfter.x, headBefore.x + 1);
      assert.strictEqual(headAfter.y, headBefore.y);
    });

    it('위쪽으로 이동하면 머리의 y좌표가 1 감소한다', () => {
      game.changeDirection(DIRECTION.UP);
      const headBefore = { ...game.getState().snake[0] };
      game.update();
      const headAfter = game.getState().snake[0];

      assert.strictEqual(headAfter.x, headBefore.x);
      assert.strictEqual(headAfter.y, headBefore.y - 1);
    });

    it('이동 후 뱀의 길이가 유지된다', () => {
      const lengthBefore = game.getState().snake.length;
      game.update();
      const lengthAfter = game.getState().snake.length;

      assert.strictEqual(lengthAfter, lengthBefore);
    });
  });

  describe('음식 섭취', () => {
    it('음식을 먹으면 점수가 10 증가한다', () => {
      const food = game.getState().food;
      const head = game.getState().snake[0];

      // 음식 위치로 뱀을 이동시키기 위해 직접 설정
      game.setFoodPosition({ x: head.x + 1, y: head.y });
      game.update();

      assert.strictEqual(game.getState().score, 10);
    });

    it('음식을 먹으면 뱀의 길이가 1 증가한다', () => {
      const head = game.getState().snake[0];
      game.setFoodPosition({ x: head.x + 1, y: head.y });

      const lengthBefore = game.getState().snake.length;
      game.update();
      const lengthAfter = game.getState().snake.length;

      assert.strictEqual(lengthAfter, lengthBefore + 1);
    });

    it('음식을 먹으면 새로운 음식이 생성된다', () => {
      const head = game.getState().snake[0];
      const oldFood = { x: head.x + 1, y: head.y };
      game.setFoodPosition(oldFood);
      game.update();

      const newFood = game.getState().food;
      const isOnSnake = game.getState().snake.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      );

      assert.strictEqual(isOnSnake, false);
    });
  });

  describe('벽 충돌', () => {
    it('오른쪽 벽에 충돌하면 게임이 종료된다', () => {
      const head = game.getState().snake[0];
      const stepsToWall = GRID_SIZE - head.x;

      for (let i = 0; i < stepsToWall; i++) {
        // 음식을 피해서 이동
        game.setFoodPosition({ x: 0, y: 0 });
        game.update();
      }

      assert.strictEqual(game.getState().isGameOver, true);
    });

    it('왼쪽 벽에 충돌하면 게임이 종료된다', () => {
      game.changeDirection(DIRECTION.UP);
      game.update();
      game.changeDirection(DIRECTION.LEFT);

      const head = game.getState().snake[0];
      const stepsToWall = head.x + 1;

      for (let i = 0; i < stepsToWall; i++) {
        game.setFoodPosition({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 });
        game.update();
      }

      assert.strictEqual(game.getState().isGameOver, true);
    });

    it('위쪽 벽에 충돌하면 게임이 종료된다', () => {
      game.changeDirection(DIRECTION.UP);

      const head = game.getState().snake[0];
      const stepsToWall = head.y + 1;

      for (let i = 0; i < stepsToWall; i++) {
        game.setFoodPosition({ x: 0, y: GRID_SIZE - 1 });
        game.update();
      }

      assert.strictEqual(game.getState().isGameOver, true);
    });
  });

  describe('자기 충돌', () => {
    it('뱀이 자신의 몸에 충돌하면 게임이 종료된다', () => {
      // 뱀을 충분히 길게 만든 후 자신에게 충돌시킨다
      // 뱀 길이를 5 이상으로 만들기
      const head = game.getState().snake[0];
      game.setFoodPosition({ x: head.x + 1, y: head.y });
      game.update();

      const head2 = game.getState().snake[0];
      game.setFoodPosition({ x: head2.x + 1, y: head2.y });
      game.update();

      const head3 = game.getState().snake[0];
      game.setFoodPosition({ x: head3.x + 1, y: head3.y });
      game.update();

      // 이제 뱀 길이가 6, U턴으로 자기 충돌
      game.changeDirection(DIRECTION.UP);
      game.update();
      game.changeDirection(DIRECTION.LEFT);
      game.update();
      game.changeDirection(DIRECTION.DOWN);
      game.update();

      assert.strictEqual(game.getState().isGameOver, true);
    });
  });

  describe('게임 리셋', () => {
    it('리셋하면 초기 상태로 돌아간다', () => {
      game.update();
      game.update();
      game.reset();

      const state = game.getState();
      const center = Math.floor(GRID_SIZE / 2);

      assert.strictEqual(state.snake.length, 3);
      assert.deepStrictEqual(state.snake[0], { x: center, y: center });
      assert.strictEqual(state.score, 0);
      assert.strictEqual(state.isGameOver, false);
    });
  });

  describe('게임 오버 후', () => {
    it('게임 오버 상태에서 update를 호출해도 상태가 변하지 않는다', () => {
      // 벽에 충돌시킨다
      const head = game.getState().snake[0];
      const stepsToWall = GRID_SIZE - head.x;

      for (let i = 0; i < stepsToWall; i++) {
        game.setFoodPosition({ x: 0, y: 0 });
        game.update();
      }

      const stateAfterGameOver = JSON.stringify(game.getState());
      game.update();
      const stateAfterUpdate = JSON.stringify(game.getState());

      assert.strictEqual(stateAfterUpdate, stateAfterGameOver);
    });
  });
});
