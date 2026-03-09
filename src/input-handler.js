import { DIRECTION_UP, DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT } from './constants.js';

const KEY_TO_DIRECTION = {
  ArrowUp: DIRECTION_UP,
  ArrowDown: DIRECTION_DOWN,
  ArrowLeft: DIRECTION_LEFT,
  ArrowRight: DIRECTION_RIGHT
};

export function createInputHandler(onDirectionChange, onRestart) {
  let pendingDirection = null;

  function handleKeyDown(event) {
    const direction = KEY_TO_DIRECTION[event.key];

    if (direction) {
      event.preventDefault();
      pendingDirection = direction;
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      onRestart();
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  return {
    consumeDirection() {
      const direction = pendingDirection;
      pendingDirection = null;
      return direction;
    },
    destroy() {
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
}
