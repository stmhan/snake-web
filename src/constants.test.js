import { describe, it, assertEqual, assertTrue } from './test-runner.js';
import {
  GRID_SIZE, GRID_WIDTH, GRID_HEIGHT,
  CANVAS_WIDTH, CANVAS_HEIGHT,
  INITIAL_SNAKE_LENGTH, GAME_SPEED_MS,
  DIRECTION_UP, DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT
} from './constants.js';

describe('constants', () => {
  it('CANVAS_WIDTH equals GRID_SIZE * GRID_WIDTH', () => {
    assertEqual(CANVAS_WIDTH, GRID_SIZE * GRID_WIDTH);
  });

  it('CANVAS_HEIGHT equals GRID_SIZE * GRID_HEIGHT', () => {
    assertEqual(CANVAS_HEIGHT, GRID_SIZE * GRID_HEIGHT);
  });

  it('INITIAL_SNAKE_LENGTH is positive', () => {
    assertTrue(INITIAL_SNAKE_LENGTH > 0);
  });

  it('GAME_SPEED_MS is positive', () => {
    assertTrue(GAME_SPEED_MS > 0);
  });

  it('directions are orthogonal unit vectors', () => {
    assertEqual(DIRECTION_UP.x, 0);
    assertEqual(DIRECTION_UP.y, -1);
    assertEqual(DIRECTION_DOWN.x, 0);
    assertEqual(DIRECTION_DOWN.y, 1);
    assertEqual(DIRECTION_LEFT.x, -1);
    assertEqual(DIRECTION_LEFT.y, 0);
    assertEqual(DIRECTION_RIGHT.x, 1);
    assertEqual(DIRECTION_RIGHT.y, 0);
  });
});
