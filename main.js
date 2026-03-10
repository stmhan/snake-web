import { Game, DIRECTION, CANVAS_SIZE, CELL_SIZE, GAME_SPEED_MS } from './game.js';

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const overlaySub = document.getElementById('overlaySub');

const SNAKE_COLOR = '#4ecca3';
const SNAKE_HEAD_COLOR = '#7effc8';
const FOOD_COLOR = '#e23e57';
const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.03)';

const KEY_TO_DIRECTION = {
  ArrowUp: DIRECTION.UP,
  ArrowDown: DIRECTION.DOWN,
  ArrowLeft: DIRECTION.LEFT,
  ArrowRight: DIRECTION.RIGHT,
};

const game = new Game();
let intervalId = null;
let isStarted = false;

function render(state) {
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  drawGrid();
  drawFood(state.food);
  drawSnake(state.snake);

  scoreElement.textContent = state.score;
}

function drawGrid() {
  context.strokeStyle = GRID_LINE_COLOR;
  context.lineWidth = 0.5;

  for (let i = 1; i < CANVAS_SIZE / CELL_SIZE; i++) {
    const position = i * CELL_SIZE;

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

function drawSnake(snake) {
  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE;
    const y = segment.y * CELL_SIZE;
    const padding = 1;

    context.fillStyle = index === 0 ? SNAKE_HEAD_COLOR : SNAKE_COLOR;
    context.fillRect(
      x + padding,
      y + padding,
      CELL_SIZE - padding * 2,
      CELL_SIZE - padding * 2
    );
  });
}

function drawFood(food) {
  const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
  const radius = CELL_SIZE / 2 - 2;

  context.fillStyle = FOOD_COLOR;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
}

function gameLoop() {
  game.update();
  const state = game.getState();
  render(state);

  if (state.isGameOver) {
    stopGame();
    showOverlay('Game Over', 'Press any arrow key to restart');
  }
}

function startGame() {
  overlay.classList.add('hidden');
  isStarted = true;
  intervalId = setInterval(gameLoop, GAME_SPEED_MS);
}

function stopGame() {
  clearInterval(intervalId);
  intervalId = null;
  isStarted = false;
}

function showOverlay(title, subtitle) {
  overlayText.textContent = title;
  overlaySub.textContent = subtitle;
  overlay.classList.remove('hidden');
}

function handleKeyDown(event) {
  const direction = KEY_TO_DIRECTION[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();

  if (!isStarted) {
    if (game.getState().isGameOver) {
      game.reset();
    }
    game.changeDirection(direction);
    render(game.getState());
    startGame();
    return;
  }

  game.changeDirection(direction);
}

document.addEventListener('keydown', handleKeyDown);

render(game.getState());
