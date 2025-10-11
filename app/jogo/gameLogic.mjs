const BOARD_SIZE = 50;

export const PLAYER_SPAWN_RANGE = {
  row: { min: 11, max: 47 },
  col: { min: 3, max: 47 },
};

export const OBJECTIVE_SPAWN_RANGE = {
  row: { min: 19, max: 47 },
  col: { min: 3, max: 47 },
};

export const OBSTACLE_SPAWN_RANGE = {
  row: { min: 12, max: 47 },
  col: { min: 2, max: 47 },
};

export const LAMA_CAPIM_SPAWN_RANGE = {
  row: { min: 12, max: 47 },
  col: { min: 2, max: 47 },
};

export const OBSTACLE_TYPE_RANGE = { min: 1, max: 2 };
export const LAMA_CAPIM_TYPE_RANGE = { min: 1, max: 2 };

export const CASTLE_GATE_POSITIONS = buildPositionSet([
  [10, 23, 11, 27],
  [9, 23, 10, 27],
]);

export const CASTLE_TILES = buildPositionSet([
  [3, 24, 4, 26],
  [2, 24, 3, 26],
]);

const RIVER_SEGMENTS = [
  [0, 0, 10, 12],
  [5, 10, 10, 23],
  [5, 27, 10, 48],
];

export const RIVER_TILES = buildPositionSet(RIVER_SEGMENTS);

export function positionKey(row, col) {
  return `${row},${col}`;
}

export function randomInt(min, max) {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin + 1)) + ceilMin;
}

export function generateUniquePosition(rowRange, colRange, forbidden, isInvalid = () => false, maxAttempts = 5000) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const row = randomInt(rowRange.min, rowRange.max);
    const col = randomInt(colRange.min, colRange.max);
    const key = positionKey(row, col);
    if (!forbidden.has(key) && !isInvalid(row, col)) {
      return [row, col];
    }
    attempts += 1;
  }
  throw new Error("Unable to generate a unique position with the provided constraints.");
}

export function createRandomEntities(
  count,
  rowRange,
  colRange,
  typeRange,
  forbidden,
  isInvalid = () => false
) {
  const entities = [];
  const reserved = new Set(forbidden);

  for (let index = 0; index < count; index += 1) {
    const position = generateUniquePosition(rowRange, colRange, reserved, isInvalid);
    reserved.add(positionKey(position[0], position[1]));
    const type = randomInt(typeRange.min, typeRange.max);
    entities.push([position[0], position[1], type]);
  }

  return entities;
}

export function isRiverTile(row, col) {
  return RIVER_TILES.has(positionKey(row, col));
}

export function isCastleEntrance(row, col) {
  return CASTLE_GATE_POSITIONS.has(positionKey(row, col));
}

export function isCastleTile(row, col) {
  return CASTLE_TILES.has(positionKey(row, col));
}

export function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function buildPositionSet(segments) {
  const positions = new Set();

  segments.forEach(([rowStart, colStart, rowEndExclusive, colEndExclusive]) => {
    for (let row = rowStart; row < rowEndExclusive; row += 1) {
      for (let col = colStart; col < colEndExclusive; col += 1) {
        positions.add(positionKey(row, col));
      }
    }
  });

  return positions;
}

export function withPositionKey([row, col]) {
  return positionKey(row, col);
}
