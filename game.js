const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const CELL_SIZE = 20;

const DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
};

const OPPOSITE = {
  [DIRECTION.UP]: DIRECTION.DOWN,
  [DIRECTION.DOWN]: DIRECTION.UP,
  [DIRECTION.LEFT]: DIRECTION.RIGHT,
  [DIRECTION.RIGHT]: DIRECTION.LEFT,
};

const VELOCITY = {
  [DIRECTION.UP]: { x: 0, y: -1 },
  [DIRECTION.DOWN]: { x: 0, y: 1 },
  [DIRECTION.LEFT]: { x: -1, y: 0 },
  [DIRECTION.RIGHT]: { x: 1, y: 0 },
};

function createInitialState() {
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);

  const state = {
    snake: [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ],
    direction: DIRECTION.RIGHT,
    food: null,
    score: 0,
    isGameOver: false,
  };

  generateFood(state);
  return state;
}

function changeDirection(state, newDirection) {
  if (OPPOSITE[state.direction] === newDirection) {
    return;
  }
  state.direction = newDirection;
}

function moveSnake(state) {
  const head = state.snake[0];
  const velocity = VELOCITY[state.direction];
  const newHead = { x: head.x + velocity.x, y: head.y + velocity.y };

  state.snake.unshift(newHead);
  state.snake.pop();
}

function checkWallCollision(state) {
  const head = state.snake[0];
  return (
    head.x < 0 ||
    head.x >= GRID_WIDTH ||
    head.y < 0 ||
    head.y >= GRID_HEIGHT
  );
}

function checkSelfCollision(state) {
  const head = state.snake[0];
  return state.snake
    .slice(1)
    .some((segment) => segment.x === head.x && segment.y === head.y);
}

function checkFoodCollision(state) {
  const head = state.snake[0];
  return head.x === state.food.x && head.y === state.food.y;
}

function generateFood(state) {
  const occupied = new Set(
    state.snake.map((segment) => `${segment.x},${segment.y}`)
  );

  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
  } while (occupied.has(`${position.x},${position.y}`));

  state.food = position;
}

function tick(state) {
  if (state.isGameOver) {
    return;
  }

  const tail = { ...state.snake[state.snake.length - 1] };
  moveSnake(state);

  if (checkWallCollision(state) || checkSelfCollision(state)) {
    state.isGameOver = true;
    return;
  }

  if (checkFoodCollision(state)) {
    state.snake.push(tail);
    state.score += 1;
    generateFood(state);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GRID_WIDTH,
    GRID_HEIGHT,
    CELL_SIZE,
    DIRECTION,
    createInitialState,
    moveSnake,
    changeDirection,
    checkWallCollision,
    checkSelfCollision,
    checkFoodCollision,
    generateFood,
    tick,
  };
}
