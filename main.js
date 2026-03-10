(function() {
  'use strict';

  var GRID_SIZE = SnakeGame.GRID_SIZE;
  var CANVAS_SIZE = SnakeGame.CANVAS_SIZE;
  var DIRECTION = SnakeGame.DIRECTION;
  var Game = SnakeGame.Game;

  var TICK_INTERVAL_MS = 120;
  var SNAKE_COLOR = '#4ecca3';
  var SNAKE_HEAD_COLOR = '#3ba58a';
  var FOOD_COLOR = '#e74c3c';
  var GRID_LINE_COLOR = '#1b2a4a';

  var canvas = document.getElementById('game-canvas');
  var context = canvas.getContext('2d');
  var scoreElement = document.getElementById('score');
  var overlay = document.getElementById('overlay');
  var overlayTitle = document.getElementById('overlay-title');
  var overlayMessage = document.getElementById('overlay-message');

  var game = new Game();
  var tickTimer = null;
  var isStarted = false;

  var KEY_MAP = {
    ArrowUp: DIRECTION.UP,
    ArrowDown: DIRECTION.DOWN,
    ArrowLeft: DIRECTION.LEFT,
    ArrowRight: DIRECTION.RIGHT
  };

  function render() {
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid();
    drawFood();
    drawSnake();
  }

  function drawGrid() {
    context.strokeStyle = GRID_LINE_COLOR;
    context.lineWidth = 0.5;

    for (var i = 1; i < CANVAS_SIZE / GRID_SIZE; i++) {
      var position = i * GRID_SIZE;

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

  function drawSnake() {
    var body = game.snake.body;

    for (var i = 0; i < body.length; i++) {
      var segment = body[i];
      var isHead = i === 0;

      context.fillStyle = isHead ? SNAKE_HEAD_COLOR : SNAKE_COLOR;
      context.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    }
  }

  function drawFood() {
    var food = game.food;

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

  function tick() {
    game.update();
    render();
    updateScore();

    if (game.isGameOver) {
      stopGame();
      showOverlay('Game Over', 'Score: ' + game.score + ' \u2014 Press Space to restart');
    }
  }

  function updateScore() {
    scoreElement.textContent = 'Score: ' + game.score;
  }

  function showOverlay(title, message) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    overlay.classList.remove('hidden');
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  function startGame() {
    isStarted = true;
    hideOverlay();
    tickTimer = setInterval(tick, TICK_INTERVAL_MS);
  }

  function stopGame() {
    clearInterval(tickTimer);
    tickTimer = null;
  }

  function restartGame() {
    stopGame();
    game.restart();
    updateScore();
    render();
    startGame();
  }

  function handleKeyDown(event) {
    var direction = KEY_MAP[event.key];

    if (direction) {
      event.preventDefault();

      if (!isStarted) {
        startGame();
      }

      game.snake.setDirection(direction);
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();

      if (game.isGameOver) {
        restartGame();
      } else if (!isStarted) {
        startGame();
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  render();
  showOverlay('Snake', 'Press any arrow key to start');
})();
