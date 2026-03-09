const GRID_SIZE = 20;
const CELL_COUNT = 20;
const SCORE_PER_FOOD = 10;

const DIRECTION = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function isOpposite(directionA, directionB) {
  return directionA.x + directionB.x === 0 && directionA.y + directionB.y === 0;
}

class Snake {
  constructor() {
    this.reset();
  }

  reset() {
    const center = Math.floor(CELL_COUNT / 2);
    this.body = [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ];
    this.direction = DIRECTION.RIGHT;
    this.shouldGrow = false;
  }

  move() {
    const head = this.getHead();
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };
    this.body.unshift(newHead);

    if (this.shouldGrow) {
      this.shouldGrow = false;
    } else {
      this.body.pop();
    }
  }

  changeDirection(newDirection) {
    if (isOpposite(this.direction, newDirection)) {
      return;
    }
    this.direction = newDirection;
  }

  grow() {
    this.shouldGrow = true;
  }

  getHead() {
    return this.body[0];
  }

  isOnBody(x, y) {
    return this.body.some((segment) => segment.x === x && segment.y === y);
  }

  isCollidingWithSelf() {
    const head = this.getHead();
    return this.body.slice(1).some(
      (segment) => segment.x === head.x && segment.y === head.y
    );
  }
}

class Game {
  constructor() {
    this.snake = new Snake();
    this.score = 0;
    this.isGameOver = false;
    this.food = this.spawnFood();
  }

  spawnFood() {
    let position;
    do {
      position = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT),
      };
    } while (this.snake.isOnBody(position.x, position.y));
    return position;
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    this.snake.move();
    const head = this.snake.getHead();

    if (this.isOutOfBounds(head)) {
      this.isGameOver = true;
      return;
    }

    if (this.snake.isCollidingWithSelf()) {
      this.isGameOver = true;
      return;
    }

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += SCORE_PER_FOOD;
      this.snake.grow();
      this.food = this.spawnFood();
    }
  }

  isOutOfBounds(position) {
    return (
      position.x < 0 ||
      position.x >= CELL_COUNT ||
      position.y < 0 ||
      position.y >= CELL_COUNT
    );
  }

  changeDirection(direction) {
    this.snake.changeDirection(direction);
  }

  reset() {
    this.snake.reset();
    this.score = 0;
    this.isGameOver = false;
    this.food = this.spawnFood();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Snake, Game, DIRECTION, GRID_SIZE, CELL_COUNT, SCORE_PER_FOOD };
}
