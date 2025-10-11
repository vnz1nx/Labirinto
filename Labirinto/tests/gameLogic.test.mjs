import test from "node:test";
import assert from "node:assert/strict";

import {
  CASTLE_GATE_POSITIONS,
  CASTLE_TILES,
  LAMA_CAPIM_SPAWN_RANGE,
  LAMA_CAPIM_TYPE_RANGE,
  OBJECTIVE_SPAWN_RANGE,
  OBSTACLE_SPAWN_RANGE,
  OBSTACLE_TYPE_RANGE,
  PLAYER_SPAWN_RANGE,
  RIVER_TILES,
  createRandomEntities,
  generateUniquePosition,
  isCastleEntrance,
  isCastleTile,
  isInsideBoard,
  isRiverTile,
  positionKey,
} from "../app/jogo/gameLogic.mjs";

test("generateUniquePosition evita posições proibidas e inválidas", () => {
  const forbidden = new Set([positionKey(12, 12), positionKey(12, 13)]);
  const invalid = (row, col) => row === 11 && col === 11;

  const position = generateUniquePosition(
    { min: 11, max: 13 },
    { min: 11, max: 14 },
    forbidden,
    invalid
  );

  assert.ok(!forbidden.has(positionKey(position[0], position[1])));
  assert.ok(!invalid(position[0], position[1]));
});

test("generateUniquePosition lança erro quando não há posições válidas", () => {
  const forbidden = new Set();
  const invalid = () => true;

  assert.throws(
    () =>
      generateUniquePosition(
        { min: 0, max: 0 },
        { min: 0, max: 0 },
        forbidden,
        invalid,
        10
      ),
    /Unable to generate/
  );
});

test("createRandomEntities gera entidades únicas dentro do tabuleiro", () => {
  const forbidden = new Set();
  const entities = createRandomEntities(
    25,
    OBSTACLE_SPAWN_RANGE.row,
    OBSTACLE_SPAWN_RANGE.col,
    OBSTACLE_TYPE_RANGE,
    forbidden,
    isRiverTile
  );

  const keys = entities.map(([row, col]) => positionKey(row, col));
  const uniqueKeys = new Set(keys);

  assert.equal(entities.length, 25);
  assert.equal(uniqueKeys.size, 25);
  entities.forEach(([row, col]) => {
    assert.ok(isInsideBoard(row, col));
    assert.ok(!isRiverTile(row, col));
  });
});

test("áreas especiais são identificadas corretamente", () => {
  const gateSample = [...CASTLE_GATE_POSITIONS][0];
  const [gateRow, gateCol] = gateSample.split(",").map(Number);

  assert.ok(isCastleEntrance(gateRow, gateCol));
  assert.ok(!isCastleTile(gateRow, gateCol));

  const castleSample = [...CASTLE_TILES][0];
  const [castleRow, castleCol] = castleSample.split(",").map(Number);

  assert.ok(isCastleTile(castleRow, castleCol));
  assert.ok(!isCastleEntrance(castleRow, castleCol));

  const riverSample = [...RIVER_TILES][0];
  const [riverRow, riverCol] = riverSample.split(",").map(Number);

  assert.ok(isRiverTile(riverRow, riverCol));
});

test("intervalos de spawn permanecem dentro do tabuleiro", () => {
  const ranges = [
    PLAYER_SPAWN_RANGE,
    OBJECTIVE_SPAWN_RANGE,
    OBSTACLE_SPAWN_RANGE,
    LAMA_CAPIM_SPAWN_RANGE,
  ];

  ranges.forEach(({ row, col }) => {
    assert.ok(row.min >= 0 && row.max < 50);
    assert.ok(col.min >= 0 && col.max < 50);
  });

  [OBSTACLE_TYPE_RANGE, LAMA_CAPIM_TYPE_RANGE].forEach(({ min, max }) => {
    assert.ok(min <= max);
    assert.ok(min >= 1);
  });
});
