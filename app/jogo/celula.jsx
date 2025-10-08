import Objetivo from "./Obj_Perso/Objetivo";
import Personagem from "./Obj_Perso/Personagem";
import "./Styles/StyleCelula.css";

const coordKey = (x, y) => `${x}-${y}`;

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

const RIVER_TILES = createRectSet([0, 10, 0, 12]);
const CASTLE_RIVER_TILES = createRectSet(
  [5, 10, 10, 23],
  [5, 10, 27, 48]
);

const PATH_TILE_SETS = {
  ponte1: createRectSet([5, 10, 23, 24]),
  ponte2: createRectSet([5, 10, 24, 26]),
  ponte3: createRectSet([5, 10, 26, 27]),
};

const PATH_TILE_CLASS = new Map();
Object.entries(PATH_TILE_SETS).forEach(([className, set]) => {
  set.forEach((key) => PATH_TILE_CLASS.set(key, className));
});

const TREE_BORDERS = createRectSet([0, 3, 10, 80], [10, 80, 0, 3]);
const TREE_DEPTH = createRectSet([10, 48, 3, 10]);
const TREE_RING = createRectSet([48, 80, 0, 50], [0, 50, 48, 80]);
const TREE_TILES = mergeSets(TREE_BORDERS, TREE_DEPTH, TREE_RING);

const CASTLE_TILES = new Map([
  [coordKey(4, 24), "castelo1"],
  [coordKey(3, 24), "castelo2"],
  [coordKey(4, 25), "castelo3"],
  [coordKey(3, 25), "castelo4"],
]);

const SIGN_TILE_KEY = coordKey(10, 22);

const STATIC_BLOCKERS = mergeSets(
  RIVER_TILES,
  CASTLE_RIVER_TILES,
  PATH_TILE_SETS.ponte1,
  PATH_TILE_SETS.ponte2,
  PATH_TILE_SETS.ponte3,
  TREE_TILES,
  new Set(CASTLE_TILES.keys()),
  new Set([SIGN_TILE_KEY])
);

const DANGER_RIVER_TILES = mergeSets(RIVER_TILES, CASTLE_RIVER_TILES);

export default function Celula({
  coords,
  jogador,
  objetivo,
  obstMap,
  reiniciarJogo,
  terrenosMap,
}) {
  const [x, y] = coords;
  const cellKey = coordKey(x, y);
  const obstaculos = obstMap ?? new Map();
  const terrenos = terrenosMap ?? new Map();

  const objetivoKey =
    objetivo && objetivo.length === 2 && objetivo[0] != null
      ? coordKey(objetivo[0], objetivo[1])
      : null;
  const jogadorKey =
    jogador && jogador.length === 2 && jogador[0] != null
      ? coordKey(jogador[0], jogador[1])
      : null;

  const blocoOcupado = STATIC_BLOCKERS.has(cellKey) || obstaculos.has(cellKey);

  let bloco = null;
  let ponte = null;
  let objetivoComp = null;
  let personagem = null;
  let casaCastelo = null;

  if (objetivoKey && cellKey === objetivoKey && !blocoOcupado) {
    objetivoComp = <Objetivo />;
  }

  if (jogadorKey && cellKey === jogadorKey) {
    personagem = <Personagem />;

    if (objetivoKey && jogadorKey === objetivoKey && blocoOcupado) {
      reiniciarJogo();
    }

    if (DANGER_RIVER_TILES.has(jogadorKey)) {
      reiniciarJogo();
    }
  }

  const obstaculoTipo = obstaculos.get(cellKey);
  if (obstaculoTipo) {
    switch (obstaculoTipo) {
      case 1:
        bloco = <div className="arvore2" key="arvore2" />;
        break;
      case 2:
        bloco = <div className="pedra" key="pedra" />;
        break;
      default:
        break;
    }
  }

  const terrenoTipo = terrenos.get(cellKey);
  if (terrenoTipo) {
    switch (terrenoTipo) {
      case 1:
        bloco = <div className="lama" key="lama" />;
        break;
      case 2:
        bloco = <div className="capim" key="capim" />;
        break;
      default:
        break;
    }
  }

  if (RIVER_TILES.has(cellKey) || CASTLE_RIVER_TILES.has(cellKey)) {
    bloco = <div className="rio" key="rio" />;
  } else if (PATH_TILE_CLASS.has(cellKey)) {
    const ponteClasse = PATH_TILE_CLASS.get(cellKey);
    ponte = <div className={ponteClasse} key={ponteClasse} />;
  } else if (TREE_TILES.has(cellKey)) {
    bloco = <div className="arvore" key="arvore" />;
  }

  if (CASTLE_TILES.has(cellKey)) {
    const castleClass = CASTLE_TILES.get(cellKey);
    casaCastelo = <div className={castleClass} key={castleClass} />;
  }

  if (cellKey === SIGN_TILE_KEY) {
    bloco = <div className="placa" key="placa" />;
  }

  return (
    <div className="Celula">
      {bloco}
      {ponte}
      {casaCastelo}
      {objetivoComp}
      {personagem}
    </div>
  );
}
