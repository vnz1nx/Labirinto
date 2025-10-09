export const coordKey = (x, y) => `${x}-${y}`;

const createRectSet = (...rects) => {
  const set = new Set();

  rects.forEach(([xIni, xFim, yIni, yFim]) => {
    for (let x = xIni; x < xFim; x++) {
      for (let y = yIni; y < yFim; y++) {
        set.add(coordKey(x, y));
      }
    }
  });

  return set;
};

const mergeSets = (...sets) => {
  const merged = new Set();
  sets.forEach((set) => {
    set.forEach((value) => merged.add(value));
  });
  return merged;
};

export const RIVER_TILES = createRectSet([0, 10, 0, 12]);
export const CASTLE_RIVER_TILES = createRectSet(
  [5, 10, 10, 23],
  [5, 10, 27, 48]
);

export const PATH_TILE_SETS = {
  ponte1: createRectSet([5, 10, 23, 24]),
  ponte2: createRectSet([5, 10, 24, 26]),
  ponte3: createRectSet([5, 10, 26, 27]),
};

export const PATH_TILE_CLASS = new Map();
Object.entries(PATH_TILE_SETS).forEach(([className, set]) => {
  set.forEach((key) => PATH_TILE_CLASS.set(key, className));
});

const TREE_BORDERS = createRectSet([0, 3, 10, 80], [10, 80, 0, 3]);
const TREE_DEPTH = createRectSet([10, 48, 3, 10]);
const TREE_RING = createRectSet([48, 80, 0, 50], [0, 50, 48, 80]);
export const TREE_TILES = mergeSets(TREE_BORDERS, TREE_DEPTH, TREE_RING);

export const CASTLE_TILE_POSITIONS = [
  [4, 24],
  [3, 24],
  [4, 25],
  [3, 25],
];

export const CASTLE_TILE_CLASS = new Map(
  CASTLE_TILE_POSITIONS.map(([x, y], index) => {
    const className = `castelo${index + 1}`;
    return [coordKey(x, y), className];
  })
);

export const CASTLE_TILE_KEYS = new Set(CASTLE_TILE_CLASS.keys());

export const SIGN_TILE_KEY = coordKey(10, 22);

export const STATIC_BLOCKERS = mergeSets(
  RIVER_TILES,
  CASTLE_RIVER_TILES,
  PATH_TILE_SETS.ponte1,
  PATH_TILE_SETS.ponte2,
  PATH_TILE_SETS.ponte3,
  TREE_TILES,
  new Set(CASTLE_TILE_KEYS),
  new Set([SIGN_TILE_KEY])
);

export const DANGER_RIVER_TILES = mergeSets(RIVER_TILES, CASTLE_RIVER_TILES);

export const COLLISION_BLOCKERS = mergeSets(
  TREE_TILES,
  new Set(CASTLE_TILE_KEYS),
  new Set([SIGN_TILE_KEY])
);

export { createRectSet, mergeSets };
