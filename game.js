(function(exports) {
  'use strict';

  var GRID_SIZE = 20;
  var CELL_COUNT = 20;
  var CANVAS_SIZE = GRID_SIZE * CELL_COUNT;

  var DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  };

  var INITIAL_SNAKE_BODY = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  function Snake() {
    this.reset();
  }

  Snake.prototype.reset = function() {
    this.body = INITIAL_SNAKE_BODY.map(function(segment) {
      return { x: segment.x, y: segment.y };
    });
    this.direction = DIRECTION.RIGHT;
    this.nextDirection = DIRECTION.RIGHT;
    this.shouldGrow = false;
  };

  Snake.prototype.getHead = function() {
    return this.body[0];
  };

  Snake.prototype.setDirection = function(newDirection) {
    var isOpposite =
      newDirection.x === -this.nextDirection.x &&
      newDirection.y === -this.nextDirection.y;

    if (isOpposite) return;

    this.nextDirection = newDirection;
  };

  Snake.prototype.move = function() {
    this.direction = this.nextDirection;
    var head = this.body[0];
    var newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    this.body.unshift(newHead);

    if (this.shouldGrow) {
      this.shouldGrow = false;
    } else {
      this.body.pop();
    }
  };

  Snake.prototype.grow = function() {
    this.shouldGrow = true;
  };

  function Game(cellCount) {
    this.cellCount = cellCount || CELL_COUNT;
    this.snake = new Snake();
    this.food = null;
    this.score = 0;
    this.isGameOver = false;
    this.spawnFood();
  }

  Game.prototype.spawnFood = function() {
    if (this.snake.body.length >= this.cellCount * this.cellCount) {
      this.food = null;
      return;
    }

    var position;
    do {
      position = {
        x: Math.floor(Math.random() * this.cellCount),
        y: Math.floor(Math.random() * this.cellCount)
      };
    } while (this.isOnSnake(position));
    this.food = position;
  };

  Game.prototype.isOnSnake = function(position) {
    return this.snake.body.some(function(segment) {
      return segment.x === position.x && segment.y === position.y;
    });
  };

  Game.prototype.checkWallCollision = function(head) {
    return head.x < 0 || head.x >= this.cellCount ||
           head.y < 0 || head.y >= this.cellCount;
  };

  Game.prototype.checkSelfCollision = function(head) {
    return this.snake.body.slice(1).some(function(segment) {
      return segment.x === head.x && segment.y === head.y;
    });
  };

  Game.prototype.update = function() {
    if (this.isGameOver) return;

    this.snake.move();
    var head = this.snake.getHead();

    if (this.checkWallCollision(head) || this.checkSelfCollision(head)) {
      this.isGameOver = true;
      return;
    }

    if (this.food && head.x === this.food.x && head.y === this.food.y) {
      this.snake.grow();
      this.score++;
      this.spawnFood();
    }
  };

  Game.prototype.restart = function() {
    this.snake.reset();
    this.score = 0;
    this.isGameOver = false;
    this.spawnFood();
  };

  exports.Snake = Snake;
  exports.Game = Game;
  exports.DIRECTION = DIRECTION;
  exports.GRID_SIZE = GRID_SIZE;
  exports.CELL_COUNT = CELL_COUNT;
  exports.CANVAS_SIZE = CANVAS_SIZE;
})(typeof module !== 'undefined' ? module.exports : (window.SnakeGame = {}));
