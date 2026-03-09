const DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
};

const GAME_STATUS = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

const DIRECTION_VECTORS = {
  [DIRECTION.UP]: { x: 0, y: -1 },
  [DIRECTION.DOWN]: { x: 0, y: 1 },
  [DIRECTION.LEFT]: { x: -1, y: 0 },
  [DIRECTION.RIGHT]: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS = {
  [DIRECTION.UP]: DIRECTION.DOWN,
  [DIRECTION.DOWN]: DIRECTION.UP,
  [DIRECTION.LEFT]: DIRECTION.RIGHT,
  [DIRECTION.RIGHT]: DIRECTION.LEFT,
};

const DEFAULT_GRID_WIDTH = 20;
const DEFAULT_GRID_HEIGHT = 20;
const INITIAL_SNAKE_LENGTH = 3;

function createGame({ gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT } = {}) {
  const centerX = Math.floor(gridWidth / 2);
  const centerY = Math.floor(gridHeight / 2);

  const snake = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: centerX - i, y: centerY });
  }

  const state = {
    gridWidth,
    gridHeight,
    snake,
    direction: DIRECTION.RIGHT,
    nextDirection: DIRECTION.RIGHT,
    food: null,
    score: 0,
    status: GAME_STATUS.READY,
  };

  return placeFood(state);
}

function getNextHeadPosition(state) {
  const head = state.snake[0];
  const vector = DIRECTION_VECTORS[state.nextDirection];
  return {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };
}

function isOutOfBounds(position, gridWidth, gridHeight) {
  return (
    position.x < 0 ||
    position.x >= gridWidth ||
    position.y < 0 ||
    position.y >= gridHeight
  );
}

function isSelfCollision(position, snake) {
  return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function changeDirection(state, newDirection) {
  if (state.status !== GAME_STATUS.PLAYING) {
    return state;
  }

  if (OPPOSITE_DIRECTIONS[newDirection] === state.direction) {
    return state;
  }

  return { ...state, nextDirection: newDirection };
}

function placeFood(state) {
  const occupied = new Set(
    state.snake.map(segment => `${segment.x},${segment.y}`)
  );

  const emptyCells = [];
  for (let x = 0; x < state.gridWidth; x++) {
    for (let y = 0; y < state.gridHeight; y++) {
      if (!occupied.has(`${x},${y}`)) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    return { ...state, food: null };
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return { ...state, food: emptyCells[randomIndex] };
}

function tick(state) {
  if (state.status !== GAME_STATUS.PLAYING) {
    return state;
  }

  const nextHead = getNextHeadPosition(state);

  if (isOutOfBounds(nextHead, state.gridWidth, state.gridHeight)) {
    return { ...state, status: GAME_STATUS.GAME_OVER };
  }

  const snakeWithoutTail = state.snake.slice(0, -1);
  if (isSelfCollision(nextHead, snakeWithoutTail)) {
    return { ...state, status: GAME_STATUS.GAME_OVER };
  }

  const isEating = state.food &&
    nextHead.x === state.food.x &&
    nextHead.y === state.food.y;

  const newSnake = isEating
    ? [nextHead, ...state.snake]
    : [nextHead, ...snakeWithoutTail];

  let newState = {
    ...state,
    snake: newSnake,
    direction: state.nextDirection,
    score: isEating ? state.score + 1 : state.score,
  };

  if (isEating) {
    newState = placeFood(newState);
  }

  return newState;
}

function startGame(state) {
  if (state.status === GAME_STATUS.READY) {
    return { ...state, status: GAME_STATUS.PLAYING };
  }
  return state;
}

function resetGame(state) {
  return createGame({
    gridWidth: state.gridWidth,
    gridHeight: state.gridHeight,
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
    placeFood,
    tick,
    startGame,
    resetGame,
  };
}
