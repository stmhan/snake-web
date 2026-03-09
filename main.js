const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const overlaySub = document.getElementById('overlaySub');

const CANVAS_SIZE = 400;
const TICK_INTERVAL_MS = 150;
const CELL_PIXEL_SIZE = CANVAS_SIZE / CELL_COUNT;

const COLORS = {
  SNAKE_HEAD: '#00d4aa',
  SNAKE_BODY: '#00a884',
  FOOD: '#ff6b6b',
  GRID_LINE: '#1a2744',
};

const game = new Game();
let tickTimer = null;

const KEY_DIRECTION_MAP = {
  ArrowUp: DIRECTION.UP,
  ArrowDown: DIRECTION.DOWN,
  ArrowLeft: DIRECTION.LEFT,
  ArrowRight: DIRECTION.RIGHT,
};

function handleKeyDown(event) {
  const direction = KEY_DIRECTION_MAP[event.key];
  if (direction) {
    event.preventDefault();
    game.changeDirection(direction);
    return;
  }

  if (event.key === ' ') {
    event.preventDefault();
    if (game.isGameOver) {
      restartGame();
    }
  }
}

function drawGrid() {
  context.strokeStyle = COLORS.GRID_LINE;
  context.lineWidth = 0.5;
  for (let i = 0; i <= CELL_COUNT; i++) {
    const position = i * CELL_PIXEL_SIZE;
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, CANVAS_SIZE);
    context.stroke();
    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(CANVAS_SIZE, position);
    context.stroke();
  }
}

function drawCell(x, y, color) {
  const padding = 1;
  context.fillStyle = color;
  context.fillRect(
    x * CELL_PIXEL_SIZE + padding,
    y * CELL_PIXEL_SIZE + padding,
    CELL_PIXEL_SIZE - padding * 2,
    CELL_PIXEL_SIZE - padding * 2
  );
}

function drawSnake() {
  game.snake.body.forEach((segment, index) => {
    const color = index === 0 ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
    drawCell(segment.x, segment.y, color);
  });
}

function drawFood() {
  context.fillStyle = COLORS.FOOD;
  const centerX = game.food.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
  const centerY = game.food.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
  const radius = CELL_PIXEL_SIZE / 2 - 2;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
}

function updateScoreDisplay() {
  scoreElement.textContent = `Score: ${game.score}`;
}

function showOverlay(text, sub) {
  overlayText.textContent = text;
  overlaySub.textContent = sub;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function render() {
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawGrid();
  drawFood();
  drawSnake();
  updateScoreDisplay();
}

function tick() {
  game.update();
  render();

  if (game.isGameOver) {
    clearInterval(tickTimer);
    tickTimer = null;
    showOverlay('Game Over', 'Press Space to restart');
  }
}

function startGameLoop() {
  if (tickTimer) {
    clearInterval(tickTimer);
  }
  tickTimer = setInterval(tick, TICK_INTERVAL_MS);
}

function restartGame() {
  game.reset();
  hideOverlay();
  render();
  startGameLoop();
}

document.addEventListener('keydown', handleKeyDown);
render();
startGameLoop();
