export const GRID_SIZE = 20;
export const CELL_COUNT = 20;
export const CANVAS_SIZE = GRID_SIZE * CELL_COUNT;

export const DIRECTION = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const INITIAL_SNAKE_LENGTH = 3;

export function createSnake() {
  const centerY = Math.floor(CELL_COUNT / 2);
  const startX = Math.floor(CELL_COUNT / 2);
  const body = [];

  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    body.push({ x: startX - i, y: centerY });
  }

  return { body, direction: DIRECTION.RIGHT };
}

export function moveSnake(snake, shouldGrow = false) {
  const head = snake.body[0];
  const newHead = {
    x: head.x + snake.direction.x,
    y: head.y + snake.direction.y,
  };

  const newBody = [newHead, ...snake.body];
  if (!shouldGrow) {
    newBody.pop();
  }

  return { body: newBody, direction: snake.direction };
}

function isOppositeDirection(direction1, direction2) {
  return direction1.x + direction2.x === 0
    && direction1.y + direction2.y === 0;
}

export function changeDirection(snake, newDirection) {
  if (isOppositeDirection(snake.direction, newDirection)) {
    return snake;
  }
  return { ...snake, direction: newDirection };
}

export function placeFood(snakeBody) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * CELL_COUNT),
      y: Math.floor(Math.random() * CELL_COUNT),
    };
  } while (
    snakeBody.some(
      (segment) => segment.x === position.x && segment.y === position.y
    )
  );
  return position;
}

export function checkWallCollision(head) {
  return head.x < 0
    || head.x >= CELL_COUNT
    || head.y < 0
    || head.y >= CELL_COUNT;
}

export function checkSelfCollision(snake) {
  const head = snake.body[0];
  return snake.body
    .slice(1)
    .some((segment) => segment.x === head.x && segment.y === head.y);
}

export function createGameState() {
  const snake = createSnake();
  return {
    snake,
    food: placeFood(snake.body),
    score: 0,
    isGameOver: false,
  };
}

export function tick(state) {
  if (state.isGameOver) {
    return state;
  }

  const head = state.snake.body[0];
  const nextHead = {
    x: head.x + state.snake.direction.x,
    y: head.y + state.snake.direction.y,
  };

  if (checkWallCollision(nextHead)) {
    return { ...state, isGameOver: true };
  }

  const isEating =
    nextHead.x === state.food.x && nextHead.y === state.food.y;

  const newSnake = moveSnake(state.snake, isEating);

  if (checkSelfCollision(newSnake)) {
    return { ...state, isGameOver: true };
  }

  const newFood = isEating ? placeFood(newSnake.body) : state.food;
  const newScore = isEating ? state.score + 1 : state.score;

  return {
    snake: newSnake,
    food: newFood,
    score: newScore,
    isGameOver: false,
  };
}
