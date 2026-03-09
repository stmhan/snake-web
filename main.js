const CELL_SIZE = 24;
const TICK_INTERVAL_MS = 120;

const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('overlay');
const overlayMessage = document.getElementById('overlay-message');

let gameState = createGame();
let tickTimer = null;

canvas.width = gameState.gridWidth * CELL_SIZE;
canvas.height = gameState.gridHeight * CELL_SIZE;

const KEY_DIRECTION_MAP = {
  ArrowUp: DIRECTION.UP,
  ArrowDown: DIRECTION.DOWN,
  ArrowLeft: DIRECTION.LEFT,
  ArrowRight: DIRECTION.RIGHT,
  w: DIRECTION.UP,
  W: DIRECTION.UP,
  s: DIRECTION.DOWN,
  S: DIRECTION.DOWN,
  a: DIRECTION.LEFT,
  A: DIRECTION.LEFT,
  d: DIRECTION.RIGHT,
  D: DIRECTION.RIGHT,
};

function render(state) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawFood(state.food);
  drawSnake(state.snake);

  scoreElement.textContent = state.score;
}

function drawGrid() {
  context.strokeStyle = 'rgba(78, 204, 163, 0.05)';
  context.lineWidth = 0.5;

  for (let x = 0; x <= gameState.gridWidth; x++) {
    context.beginPath();
    context.moveTo(x * CELL_SIZE, 0);
    context.lineTo(x * CELL_SIZE, canvas.height);
    context.stroke();
  }

  for (let y = 0; y <= gameState.gridHeight; y++) {
    context.beginPath();
    context.moveTo(0, y * CELL_SIZE);
    context.lineTo(canvas.width, y * CELL_SIZE);
    context.stroke();
  }
}

function drawSnake(snake) {
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    context.fillStyle = isHead ? '#4ecca3' : '#3ba884';
    context.fillRect(
      segment.x * CELL_SIZE + 1,
      segment.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  });
}

function drawFood(food) {
  if (!food) {
    return;
  }

  context.fillStyle = '#e23e57';
  context.beginPath();
  context.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  context.fill();
}

function showOverlay(message) {
  overlayMessage.textContent = message;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function handleGameTick() {
  gameState = tick(gameState);

  if (gameState.status === GAME_STATUS.GAME_OVER) {
    stopGameLoop();
    showOverlay('Game Over! Space 키를 눌러 재시작');
  }

  render(gameState);
}

function startGameLoop() {
  if (tickTimer) {
    return;
  }
  tickTimer = setInterval(handleGameTick, TICK_INTERVAL_MS);
}

function stopGameLoop() {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function handleKeyDown(event) {
  if (event.key === ' ') {
    event.preventDefault();

    if (gameState.status === GAME_STATUS.READY) {
      gameState = startGame(gameState);
      hideOverlay();
      startGameLoop();
      return;
    }

    if (gameState.status === GAME_STATUS.GAME_OVER) {
      gameState = resetGame(gameState);
      gameState = startGame(gameState);
      hideOverlay();
      startGameLoop();
      return;
    }
  }

  const direction = KEY_DIRECTION_MAP[event.key];
  if (direction) {
    event.preventDefault();
    gameState = changeDirection(gameState, direction);
  }
}

document.addEventListener('keydown', handleKeyDown);

render(gameState);
showOverlay('Space 키를 눌러 시작');
