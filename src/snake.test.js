import { describe, it, assertEqual, assertDeepEqual } from './test-runner.js';
import { DIRECTION_RIGHT, DIRECTION_LEFT, DIRECTION_UP, DIRECTION_DOWN, INITIAL_SNAKE_LENGTH } from './constants.js';
import { createSnake, moveSnake, growSnake, changeDirection } from './snake.js';

describe('createSnake', () => {
  it('segments 길이가 INITIAL_SNAKE_LENGTH와 같다', () => {
    const snake = createSnake(5, 5);
    assertEqual(snake.segments.length, INITIAL_SNAKE_LENGTH);
  });

  it('head가 지정한 좌표에 위치한다', () => {
    const snake = createSnake(5, 5);
    const head = snake.segments[0];
    assertEqual(head.x, 5);
    assertEqual(head.y, 5);
  });

  it('segments가 왼쪽으로 이어진다', () => {
    const snake = createSnake(5, 5);
    assertDeepEqual(snake.segments, [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ]);
  });

  it('초기 방향이 오른쪽이다', () => {
    const snake = createSnake(5, 5);
    assertDeepEqual(snake.direction, DIRECTION_RIGHT);
  });
});

describe('moveSnake', () => {
  it('현재 방향으로 head를 한 칸 전진시킨다', () => {
    const snake = createSnake(5, 5);
    const moved = moveSnake(snake);
    const head = moved.segments[0];
    assertEqual(head.x, 6);
    assertEqual(head.y, 5);
  });

  it('이동 후 길이가 유지된다', () => {
    const snake = createSnake(5, 5);
    const moved = moveSnake(snake);
    assertEqual(moved.segments.length, snake.segments.length);
  });

  it('마지막 segment가 제거된다', () => {
    const snake = createSnake(5, 5);
    const moved = moveSnake(snake);
    const lastOriginal = snake.segments[snake.segments.length - 1];
    const hasOldTail = moved.segments.some(
      s => s.x === lastOriginal.x && s.y === lastOriginal.y
    );
    assertEqual(hasOldTail, false);
  });

  it('위쪽 방향으로 이동한다', () => {
    const snake = { segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }], direction: DIRECTION_UP };
    const moved = moveSnake(snake);
    assertEqual(moved.segments[0].x, 5);
    assertEqual(moved.segments[0].y, 4);
  });
});

describe('growSnake', () => {
  it('head를 전진시키고 길이가 1 증가한다', () => {
    const snake = createSnake(5, 5);
    const grown = growSnake(snake);
    assertEqual(grown.segments.length, snake.segments.length + 1);
  });

  it('새 head가 올바른 위치에 있다', () => {
    const snake = createSnake(5, 5);
    const grown = growSnake(snake);
    assertEqual(grown.segments[0].x, 6);
    assertEqual(grown.segments[0].y, 5);
  });

  it('기존 tail이 유지된다', () => {
    const snake = createSnake(5, 5);
    const grown = growSnake(snake);
    const lastOriginal = snake.segments[snake.segments.length - 1];
    const lastGrown = grown.segments[grown.segments.length - 1];
    assertEqual(lastGrown.x, lastOriginal.x);
    assertEqual(lastGrown.y, lastOriginal.y);
  });
});

describe('changeDirection', () => {
  it('새로운 방향으로 변경한다', () => {
    const snake = createSnake(5, 5);
    const changed = changeDirection(snake, DIRECTION_UP);
    assertDeepEqual(changed.direction, DIRECTION_UP);
  });

  it('180도 반전을 무시한다 (오른쪽에서 왼쪽)', () => {
    const snake = createSnake(5, 5);
    const changed = changeDirection(snake, DIRECTION_LEFT);
    assertDeepEqual(changed.direction, DIRECTION_RIGHT);
  });

  it('180도 반전을 무시한다 (위에서 아래)', () => {
    const snake = { segments: [{ x: 5, y: 5 }], direction: DIRECTION_UP };
    const changed = changeDirection(snake, DIRECTION_DOWN);
    assertDeepEqual(changed.direction, DIRECTION_UP);
  });

  it('90도 회전은 허용한다', () => {
    const snake = createSnake(5, 5);
    const changed = changeDirection(snake, DIRECTION_DOWN);
    assertDeepEqual(changed.direction, DIRECTION_DOWN);
  });
});
