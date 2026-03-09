import { GRID_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const COLOR_BACKGROUND = '#1a1a2e';
const COLOR_GRID = '#16213e';
const COLOR_SNAKE_HEAD = '#00d2ff';
const COLOR_SNAKE_BODY = '#0097b2';
const COLOR_FOOD = '#ff6b6b';
const COLOR_TEXT = '#e0e0e0';
const COLOR_OVERLAY = 'rgba(0, 0, 0, 0.7)';

const SCORE_FONT = '18px monospace';
const GAME_OVER_FONT = 'bold 36px monospace';
const RESTART_FONT = '16px monospace';

export function renderGame(context, state) {
  drawBackground(context);
  drawGrid(context);
  drawFood(context, state.food);
  drawSnake(context, state.snake);
  drawScore(context, state.score);

  if (state.isGameOver) {
    drawGameOver(context);
  }
}

function drawBackground(context) {
  context.fillStyle = COLOR_BACKGROUND;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawGrid(context) {
  context.strokeStyle = COLOR_GRID;
  context.lineWidth = 0.5;

  for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, CANVAS_HEIGHT);
    context.stroke();
  }

  for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(CANVAS_WIDTH, y);
    context.stroke();
  }
}

function drawSnake(context, snake) {
  snake.segments.forEach((segment, index) => {
    const isHead = index === 0;
    context.fillStyle = isHead ? COLOR_SNAKE_HEAD : COLOR_SNAKE_BODY;
    context.fillRect(
      segment.x * GRID_SIZE + 1,
      segment.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
  });
}

function drawFood(context, food) {
  context.fillStyle = COLOR_FOOD;
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

function drawScore(context, score) {
  context.fillStyle = COLOR_TEXT;
  context.font = SCORE_FONT;
  context.textAlign = 'left';
  context.fillText(`Score: ${score}`, 10, CANVAS_HEIGHT + 25);
}

function drawGameOver(context) {
  context.fillStyle = COLOR_OVERLAY;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = COLOR_TEXT;
  context.font = GAME_OVER_FONT;
  context.textAlign = 'center';
  context.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

  context.font = RESTART_FONT;
  context.fillText('Press Space to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
}
