import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_SPEED_MS } from './constants.js';
import { changeDirection } from './snake.js';
import { createGameState, tick, resetGame } from './game-state.js';
import { renderGame } from './renderer.js';
import { createInputHandler } from './input-handler.js';

const SCORE_AREA_HEIGHT = 40;

function start() {
  const canvas = document.getElementById('game-canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const wrapper = document.getElementById('game-wrapper');
  wrapper.style.width = `${CANVAS_WIDTH}px`;

  const context = canvas.getContext('2d');

  let state = createGameState();
  let intervalId = null;

  function handleRestart() {
    if (!state.isGameOver) return;
    state = resetGame();
    startLoop();
  }

  const input = createInputHandler(
    () => {},
    handleRestart
  );

  function gameTick() {
    const direction = input.consumeDirection();
    if (direction) {
      state = { ...state, snake: changeDirection(state.snake, direction) };
    }

    state = tick(state);
    renderGame(context, state);

    if (state.isGameOver) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startLoop() {
    if (intervalId) {
      clearInterval(intervalId);
    }
    renderGame(context, state);
    intervalId = setInterval(gameTick, GAME_SPEED_MS);
  }

  startLoop();
}

document.addEventListener('DOMContentLoaded', start);
