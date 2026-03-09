export function spawnFood(occupiedCells, gridWidth, gridHeight) {
  const occupiedSet = new Set(
    occupiedCells.map(cell => `${cell.x},${cell.y}`)
  );

  const emptyCells = [];
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (!occupiedSet.has(`${x},${y}`)) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[index];
}

export function isFoodEaten(headPosition, foodPosition) {
  return headPosition.x === foodPosition.x &&
         headPosition.y === foodPosition.y;
}
