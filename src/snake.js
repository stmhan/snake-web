import { DIRECTION_RIGHT, INITIAL_SNAKE_LENGTH } from './constants.js';

export function createSnake(startX, startY) {
  const segments = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    segments.push({ x: startX - i, y: startY });
  }
  return { segments, direction: DIRECTION_RIGHT };
}

export function moveSnake(snake) {
  const newHead = getNextHead(snake);
  const newSegments = [newHead, ...snake.segments.slice(0, -1)];
  return { segments: newSegments, direction: snake.direction };
}

export function growSnake(snake) {
  const newHead = getNextHead(snake);
  const newSegments = [newHead, ...snake.segments];
  return { segments: newSegments, direction: snake.direction };
}

export function changeDirection(snake, newDirection) {
  const isReversal =
    snake.direction.x + newDirection.x === 0 &&
    snake.direction.y + newDirection.y === 0;

  if (isReversal) {
    return snake;
  }

  return { segments: snake.segments, direction: newDirection };
}

function getNextHead(snake) {
  const head = snake.segments[0];
  return {
    x: head.x + snake.direction.x,
    y: head.y + snake.direction.y
  };
}
