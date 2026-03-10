export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
export const SCORE_PER_FOOD = 10;
export const INITIAL_SNAKE_LENGTH = 3;
export const GAME_SPEED_MS = 150;

export const DIRECTION = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export class Game {
  constructor() {
    this.reset();
  }

  reset() {
    const center = Math.floor(GRID_SIZE / 2);

    this.snake = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      this.snake.push({ x: center - i, y: center });
    }

    this.direction = DIRECTION.RIGHT;
    this.score = 0;
    this.isGameOver = false;
    this.food = this.spawnFood();
  }

  getState() {
    return {
      snake: this.snake.map(segment => ({ ...segment })),
      direction: this.direction,
      food: { ...this.food },
      score: this.score,
      isGameOver: this.isGameOver,
    };
  }

  changeDirection(direction) {
    if (this.isOpposite(direction, this.direction)) {
      return;
    }
    this.direction = direction;
  }

  isOpposite(directionA, directionB) {
    return directionA.x + directionB.x === 0
      && directionA.y + directionB.y === 0;
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    if (this.isWallCollision(newHead) || this.isSelfCollision(newHead)) {
      this.isGameOver = true;
      return;
    }

    this.snake.unshift(newHead);

    if (this.isFoodCollision(newHead)) {
      this.score += SCORE_PER_FOOD;
      this.food = this.spawnFood();
    } else {
      this.snake.pop();
    }
  }

  isWallCollision(position) {
    return position.x < 0
      || position.x >= GRID_SIZE
      || position.y < 0
      || position.y >= GRID_SIZE;
  }

  isSelfCollision(position) {
    return this.snake.some(
      segment => segment.x === position.x && segment.y === position.y
    );
  }

  isFoodCollision(position) {
    return position.x === this.food.x && position.y === this.food.y;
  }

  spawnFood() {
    const occupied = new Set(
      this.snake.map(segment => `${segment.x},${segment.y}`)
    );

    let position;
    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (occupied.has(`${position.x},${position.y}`));

    return position;
  }

  setFoodPosition(position) {
    this.food = { ...position };
  }
}
