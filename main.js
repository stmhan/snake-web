const GRID_SIZE = 20;
const CELL_SIZE = 24;
const TICK_INTERVAL_MS = 120;

const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const overlay = document.getElementById('overlay');
const overlayMessage = document.getElementById('overlay-message');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;

const game = new Game(GRID_SIZE);
let intervalId = null;
let isPaused = false;

const KEY_MAP = {
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

function draw() {
  context.fillStyle = '#16213e';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawFood();
  drawSnake();
}

function drawGrid() {
  context.strokeStyle = '#1a2744';
  context.lineWidth = 0.5;

  for (let i = 0; i <= GRID_SIZE; i++) {
    const position = i * CELL_SIZE;
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(canvas.width, position);
    context.stroke();
  }
}

function drawSnake() {
  const CELL_PADDING = 1;

  game.snake.forEach((segment, index) => {
    const isHead = index === 0;
    context.fillStyle = isHead ? '#4ecca3' : '#38b28a';
    context.fillRect(
      segment.x * CELL_SIZE + CELL_PADDING,
      segment.y * CELL_SIZE + CELL_PADDING,
      CELL_SIZE - CELL_PADDING * 2,
      CELL_SIZE - CELL_PADDING * 2
    );

    if (isHead) {
      context.fillStyle = '#1a1a2e';
      drawEyes(segment);
    }
  });
}

function drawEyes(head) {
  const eyeSize = 3;
  const centerX = head.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = head.y * CELL_SIZE + CELL_SIZE / 2;
  const offset = 4;

  let eye1, eye2;
  if (game.direction === DIRECTION.RIGHT) {
    eye1 = { x: centerX + offset, y: centerY - offset };
    eye2 = { x: centerX + offset, y: centerY + offset };
  } else if (game.direction === DIRECTION.LEFT) {
    eye1 = { x: centerX - offset, y: centerY - offset };
    eye2 = { x: centerX - offset, y: centerY + offset };
  } else if (game.direction === DIRECTION.UP) {
    eye1 = { x: centerX - offset, y: centerY - offset };
    eye2 = { x: centerX + offset, y: centerY - offset };
  } else {
    eye1 = { x: centerX - offset, y: centerY + offset };
    eye2 = { x: centerX + offset, y: centerY + offset };
  }

  context.beginPath();
  context.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
  context.fill();
}

function drawFood() {
  if (!game.food) return;
  context.fillStyle = '#e74c3c';
  context.beginPath();
  context.arc(
    game.food.x * CELL_SIZE + CELL_SIZE / 2,
    game.food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  context.fill();
}

function updateScore() {
  scoreDisplay.textContent = `점수: ${game.score}`;
}

function showOverlay() {
  finalScore.textContent = `최종 점수: ${game.score}`;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function gameLoop() {
  game.tick();
  draw();
  updateScore();

  if (game.isGameOver) {
    clearInterval(intervalId);
    intervalId = null;
    showOverlay();
  }
}

function startGame() {
  if (intervalId) clearInterval(intervalId);
  game.reset();
  hideOverlay();
  isPaused = false;
  draw();
  updateScore();
  intervalId = setInterval(gameLoop, TICK_INTERVAL_MS);
}

function togglePause() {
  if (game.isGameOver) return;

  if (isPaused) {
    intervalId = setInterval(gameLoop, TICK_INTERVAL_MS);
    isPaused = false;
  } else {
    clearInterval(intervalId);
    intervalId = null;
    isPaused = true;
  }
}

function handleKeyDown(event) {
  if (event.key === ' ') {
    event.preventDefault();
    togglePause();
    return;
  }

  const direction = KEY_MAP[event.key];
  if (direction) {
    event.preventDefault();
    game.changeDirection(direction);
  }
}

document.addEventListener('keydown', handleKeyDown);
restartButton.addEventListener('click', startGame);

startGame();
