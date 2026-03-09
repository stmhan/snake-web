import { GRID_WIDTH, GRID_HEIGHT } from './constants.js';
import { createSnake, moveSnake, growSnake } from './snake.js';
import { spawnFood, isFoodEaten } from './food.js';

const INITIAL_SNAKE_X = Math.floor(GRID_WIDTH / 2);
const INITIAL_SNAKE_Y = Math.floor(GRID_HEIGHT / 2);

export function createGameState() {
  const snake = createSnake(INITIAL_SNAKE_X, INITIAL_SNAKE_Y);
  const food = spawnFood(snake.segments, GRID_WIDTH, GRID_HEIGHT);
  return { snake, food, score: 0, isGameOver: false };
}

export function tick(state) {
  if (state.isGameOver) {
    return state;
  }

  const movedSnake = moveSnake(state.snake);
  const head = movedSnake.segments[0];

  if (isWallCollision(head, GRID_WIDTH, GRID_HEIGHT)) {
    return { ...state, isGameOver: true };
  }

  if (isSelfCollision(head, movedSnake.segments)) {
    return { ...state, isGameOver: true };
  }

  if (isFoodEaten(head, state.food)) {
    const grownSnake = growSnake(state.snake);
    const newFood = spawnFood(grownSnake.segments, GRID_WIDTH, GRID_HEIGHT);
    return {
      snake: grownSnake,
      food: newFood,
      score: state.score + 1,
      isGameOver: false
    };
  }

  return { ...state, snake: movedSnake };
}

export function isWallCollision(head, gridWidth, gridHeight) {
  return head.x < 0 || head.x >= gridWidth ||
         head.y < 0 || head.y >= gridHeight;
}

export function isSelfCollision(head, segments) {
  return segments.slice(1).some(
    segment => segment.x === head.x && segment.y === head.y
  );
}

export function resetGame() {
  return createGameState();
}
