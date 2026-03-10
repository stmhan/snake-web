import {
  GRID_SIZE,
  CANVAS_SIZE,
  DIRECTION,
  createGameState,
  changeDirection,
  tick,
} from './game.js';

const TICK_INTERVAL_MS = 120;

const KEY_TO_DIRECTION = {
  ArrowUp: DIRECTION.UP,
  ArrowDown: DIRECTION.DOWN,
  ArrowLeft: DIRECTION.LEFT,
  ArrowRight: DIRECTION.RIGHT,
};

const SNAKE_COLOR = '#53d769';
const SNAKE_HEAD_COLOR = '#2ecc71';
const FOOD_COLOR = '#e94560';
const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.03)';

const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('game-over-overlay');
const finalScoreElement = document.getElementById('final-score');

let gameState = createGameState();
let intervalId = null;

function drawGrid() {
  context.strokeStyle = GRID_LINE_COLOR;
  context.lineWidth = 0.5;
  for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, CANVAS_SIZE);
    context.stroke();
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(CANVAS_SIZE, i);
    context.stroke();
  }
}

function drawSnake(snake) {
  snake.body.forEach((segment, index) => {
    const isHead = index === 0;
    context.fillStyle = isHead ? SNAKE_HEAD_COLOR : SNAKE_COLOR;
    context.fillRect(
      segment.x * GRID_SIZE + 1,
      segment.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
  });
}

function drawFood(food) {
  context.fillStyle = FOOD_COLOR;
  context.beginPath();
  context.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  context.fill();
}

function render(state) {
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawGrid();
  drawFood(state.food);
  drawSnake(state.snake);
  scoreElement.textContent = state.score;
}

function handleGameOver(state) {
  clearInterval(intervalId);
  intervalId = null;
  finalScoreElement.textContent = state.score;
  overlay.classList.remove('hidden');
}

function gameLoop() {
  gameState = tick(gameState);
  render(gameState);
  if (gameState.isGameOver) {
    handleGameOver(gameState);
  }
}

function startGame() {
  gameState = createGameState();
  overlay.classList.add('hidden');
  render(gameState);
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(gameLoop, TICK_INTERVAL_MS);
}

document.addEventListener('keydown', (event) => {
  const direction = KEY_TO_DIRECTION[event.key];
  if (direction) {
    event.preventDefault();
    gameState = {
      ...gameState,
      snake: changeDirection(gameState.snake, direction),
    };
    return;
  }

  if (event.key === ' ' && gameState.isGameOver) {
    startGame();
  }
});

startGame();
