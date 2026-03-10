(function() {
  'use strict';

  var GRID_SIZE = SnakeGame.GRID_SIZE;
  var CANVAS_SIZE = SnakeGame.CANVAS_SIZE;
  var DIRECTION = SnakeGame.DIRECTION;
  var GAME_STATE = SnakeGame.GAME_STATE;
  var Game = SnakeGame.Game;

  var TICK_INTERVAL_MS = 120;
  var SNAKE_COLOR = '#4ecca3';
  var SNAKE_HEAD_COLOR = '#3ba58a';
  var FOOD_COLOR = '#e74c3c';
  var GRID_LINE_COLOR = '#1b2a4a';

  var canvas = document.getElementById('game-canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  var context = canvas.getContext('2d');
  var scoreElement = document.getElementById('score');
  var overlay = document.getElementById('overlay');
  var overlayTitle = document.getElementById('overlay-title');
  var overlayMessage = document.getElementById('overlay-message');

  var SPLASH_BACKGROUND_COLOR = '#16213e';
  var SPLASH_TITLE_COLOR = '#4ecca3';
  var SPLASH_HINT_COLOR = '#b0b0b0';
  var SPLASH_TITLE_FONT_SIZE = 32;
  var SPLASH_HINT_FONT_SIZE = 16;
  var SPLASH_HINT_OFFSET_Y = 50;

  var game = new Game();
  var tickTimer = null;
  var gameState = GAME_STATE.SPLASH;

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
    if (!food) return;

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

  function drawSplashScreen() {
    context.fillStyle = SPLASH_BACKGROUND_COLOR;
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    context.fillStyle = SPLASH_TITLE_COLOR;
    context.font = 'bold ' + SPLASH_TITLE_FONT_SIZE + 'px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Snake', CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    context.fillStyle = SPLASH_HINT_COLOR;
    context.font = SPLASH_HINT_FONT_SIZE + 'px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    context.fillText('Press Space or click to start', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + SPLASH_HINT_OFFSET_Y);
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
    gameState = GAME_STATE.PLAYING;
    hideOverlay();
    render();
    tickTimer = setInterval(tick, TICK_INTERVAL_MS);
  }

  function stopGame() {
    gameState = GAME_STATE.GAME_OVER;
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

  var SPLASH_START_KEYS = [' ', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  function handleKeyDown(event) {
    if (gameState === GAME_STATE.SPLASH) {
      if (SPLASH_START_KEYS.indexOf(event.key) === -1) return;
      event.preventDefault();
      startGame();
      return;
    }

    var direction = KEY_MAP[event.key];

    if (direction) {
      event.preventDefault();

      if (gameState === GAME_STATE.PLAYING) {
        game.snake.setDirection(direction);
      }

      return;
    }

    if (event.key === ' ') {
      event.preventDefault();

      if (gameState === GAME_STATE.GAME_OVER) {
        restartGame();
      }
    }
  }

  function handleCanvasClick() {
    if (gameState === GAME_STATE.SPLASH) {
      startGame();
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  canvas.addEventListener('click', handleCanvasClick);

  drawSplashScreen();
})();
