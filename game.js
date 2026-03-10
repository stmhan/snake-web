const DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
};

const OPPOSITE = {
  [DIRECTION.UP]: DIRECTION.DOWN,
  [DIRECTION.DOWN]: DIRECTION.UP,
  [DIRECTION.LEFT]: DIRECTION.RIGHT,
  [DIRECTION.RIGHT]: DIRECTION.LEFT,
};

const VELOCITY = {
  [DIRECTION.UP]: { x: 0, y: -1 },
  [DIRECTION.DOWN]: { x: 0, y: 1 },
  [DIRECTION.LEFT]: { x: -1, y: 0 },
  [DIRECTION.RIGHT]: { x: 1, y: 0 },
};

class Game {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.reset();
  }

  reset() {
    const centerX = Math.floor(this.gridSize / 2);
    const centerY = Math.floor(this.gridSize / 2);

    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];
    this.direction = DIRECTION.RIGHT;
    this.score = 0;
    this.isGameOver = false;
    this.food = this.spawnFood();
  }

  spawnFood() {
    const occupiedSet = new Set(
      this.snake.map(segment => `${segment.x},${segment.y}`)
    );

    if (occupiedSet.size >= this.gridSize * this.gridSize) return null;

    let position;
    do {
      position = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize),
      };
    } while (occupiedSet.has(`${position.x},${position.y}`));

    return position;
  }

  changeDirection(newDirection) {
    if (this.isGameOver) return;
    if (OPPOSITE[this.direction] === newDirection) return;

    this.direction = newDirection;
  }

  tick() {
    if (this.isGameOver) return;

    const head = this.snake[0];
    const velocity = VELOCITY[this.direction];
    const newHead = { x: head.x + velocity.x, y: head.y + velocity.y };

    if (this.isOutOfBounds(newHead) || this.isCollidingWithBody(newHead)) {
      this.isGameOver = true;
      return;
    }

    this.snake.unshift(newHead);

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 1;
      this.food = this.spawnFood();
    } else {
      this.snake.pop();
    }
  }

  isOutOfBounds(position) {
    return (
      position.x < 0 ||
      position.x >= this.gridSize ||
      position.y < 0 ||
      position.y >= this.gridSize
    );
  }

  isCollidingWithBody(position) {
    return this.snake.slice(0, -1).some(
      segment => segment.x === position.x && segment.y === position.y
    );
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Game, DIRECTION };
}
