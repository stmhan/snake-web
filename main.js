(function () {
  const canvas = document.getElementById('game-canvas');
  const context = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('score');
  const overlay = document.getElementById('overlay');
  const overlayMessage = document.getElementById('overlay-message');
  const restartButton = document.getElementById('restart-button');

  const TICK_INTERVAL_MS = 150;
  const COLORS = {
    snakeHead: '#4ecca3',
    snakeBody: '#3dbb91',
    food: '#e94560',
    grid: '#1b2838',
  };

  canvas.width = GRID_WIDTH * CELL_SIZE;
  canvas.height = GRID_HEIGHT * CELL_SIZE;

  let state = createInitialState();
  let isPaused = false;
  let intervalId = null;

  const KEY_TO_DIRECTION = {
    ArrowUp: DIRECTION.UP,
    ArrowDown: DIRECTION.DOWN,
    ArrowLeft: DIRECTION.LEFT,
    ArrowRight: DIRECTION.RIGHT,
  };

  function draw() {
    context.fillStyle = COLORS.grid;
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawFood();
    drawSnake();
  }

  function drawSnake() {
    state.snake.forEach((segment, index) => {
      const isHead = index === 0;
      context.fillStyle = isHead ? COLORS.snakeHead : COLORS.snakeBody;
      context.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
  }

  function drawFood() {
    context.fillStyle = COLORS.food;
    context.beginPath();
    context.arc(
      state.food.x * CELL_SIZE + CELL_SIZE / 2,
      state.food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  function updateScore() {
    scoreDisplay.textContent = '점수: ' + state.score;
  }

  function gameLoop() {
    tick(state);

    if (state.isGameOver) {
      stopGame();
      showOverlay('Game Over');
      return;
    }

    updateScore();
    draw();
  }

  function startGame() {
    overlay.classList.add('hidden');
    isPaused = false;
    intervalId = setInterval(gameLoop, TICK_INTERVAL_MS);
    draw();
  }

  function stopGame() {
    clearInterval(intervalId);
    intervalId = null;
  }

  function resetGame() {
    stopGame();
    state = createInitialState();
    updateScore();
    startGame();
  }

  function showOverlay(message) {
    overlayMessage.textContent = message;
    overlay.classList.remove('hidden');
  }

  function togglePause() {
    if (state.isGameOver) {
      return;
    }

    if (isPaused) {
      overlay.classList.add('hidden');
      intervalId = setInterval(gameLoop, TICK_INTERVAL_MS);
    } else {
      stopGame();
      showOverlay('일시정지');
    }

    isPaused = !isPaused;
  }

  function handleKeydown(event) {
    if (event.key === ' ') {
      event.preventDefault();
      togglePause();
      return;
    }

    const direction = KEY_TO_DIRECTION[event.key];
    if (direction) {
      event.preventDefault();
      changeDirection(state, direction);
    }
  }

  document.addEventListener('keydown', handleKeydown);
  restartButton.addEventListener('click', resetGame);

  startGame();
})();
