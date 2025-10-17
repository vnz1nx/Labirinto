import Objetivo from "./Objetivo";
import Personagem from "./Personagem";
import "./Styles/StyleCelula.css";

const toKey = (row, col) => `${row},${col}`;

const buildRectSet = (rowStart, rowEnd, colStart, colEnd) => {
  const positions = new Set();
  for (let row = rowStart; row < rowEnd; row += 1) {
    for (let col = colStart; col < colEnd; col += 1) {
      positions.add(toKey(row, col));
    }
  }
  return positions;
};

const mergeSets = (...sets) => {
  const merged = new Set();
  sets.forEach((set) => {
    set.forEach((value) => merged.add(value));
  });
  return merged;
};

const RIVER_SET = buildRectSet(0, 10, 0, 12);
const CASTLE_RIVER_SET = mergeSets(
  buildRectSet(5, 10, 10, 23),
  buildRectSet(5, 10, 27, 48)
);

const BRIDGE_ZONES = [
  { set: buildRectSet(5, 10, 23, 24), className: "ponte1" },
  { set: buildRectSet(5, 10, 24, 26), className: "ponte2" },
  { set: buildRectSet(5, 10, 26, 27), className: "ponte3" },
];

const TREE_BORDER_A = (() => {
  const positions = new Set();
  for (let row = 0; row < 2; row += 1) {
    for (let col = 10; col < 50; col += 1) {
      positions.add(toKey(row, col));
      positions.add(toKey(col, row));
    }
  }
  return positions;
})();

const TREE_BORDER_B = (() => {
  const positions = new Set();
  for (let row = 48; row < 50; row += 1) {
    for (let col = 2; col < 50; col += 1) {
      positions.add(toKey(row, col));
      positions.add(toKey(col, row));
    }
  }
  return positions;
})();

const CASTLE_TILE_MAP = new Map([
  [toKey(3, 24), "castelo1"],
  [toKey(2, 24), "castelo2"],
  [toKey(3, 25), "castelo3"],
  [toKey(2, 25), "castelo4"],
]);

const PLAQUE_POSITION = toKey(10, 22);

export default function Celula({
  coords,
  jogador,
  objetivo,
  obstaculos,
  lamaCapim,
}) {
  const key = toKey(coords[0], coords[1]);

  let bloco = null;
  let ponte = null;
  let obj = null;
  let personagem = null;
  let casaCastelo = null;

  const isPlayerHere =
    Array.isArray(jogador) &&
    jogador[0] === coords[0] &&
    jogador[1] === coords[1];

  if (isPlayerHere) {
    personagem = <Personagem key="personagem" />;
  }

  const hasObjective =
    Array.isArray(objetivo) &&
    objetivo[0] !== null &&
    objetivo[1] !== null &&
    objetivo[0] === coords[0] &&
    objetivo[1] === coords[1];

  if (hasObjective) {
    obj = <Objetivo key="objetivo" />;
  }

  const obstacleType = obstaculos?.get?.(key);
  if (obstacleType === 1) {
    bloco = <div className="arvore2" key="arvore2" />;
  } else if (obstacleType === 2) {
    bloco = <div className="pedra" key="pedra" />;
  }

  const lamaCapimType = lamaCapim?.get?.(key);
  if (lamaCapimType === 1) {
    bloco = <div className="lama" key="lama" />;
  } else if (lamaCapimType === 2) {
    bloco = <div className="capim" key="capim" />;
  }

  const isRiver = RIVER_SET.has(key) || CASTLE_RIVER_SET.has(key);
  if (isRiver) {
    bloco = <div className="rio" key="rio" />;
  } else {
    const bridgeZone = BRIDGE_ZONES.find(({ set }) => set.has(key));
    if (bridgeZone) {
      ponte = <div className={bridgeZone.className} key="ponte" />;
    } else if (TREE_BORDER_A.has(key) || TREE_BORDER_B.has(key)) {
      bloco = <div className="arvore" key="arvore" />;
    }
  }

  const castleTile = CASTLE_TILE_MAP.get(key);
  if (castleTile) {
    casaCastelo = <div className={castleTile} key="castelo" />;
  }

  if (key === PLAQUE_POSITION) {
    bloco = <div className="placa" key="placa" />;
  }

  return (
    <div className="Celula" style={{ zIndex: coords[0] }}>
      {bloco}
      {ponte}
      {casaCastelo}
      {personagem}
      {obj}
    </div>
  );
}
