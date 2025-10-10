import { memo } from "react";
import Objetivo from "./Obj_Perso/Objetivo";
import Personagem from "./Obj_Perso/Personagem";
import "./Styles/StyleCelula.css";
import {
  CASTLE_TILE_CLASS,
  CASTLE_RIVER_TILES,
  PATH_TILE_CLASS,
  RIVER_TILES,
  SIGN_TILE_KEY,
  STATIC_BLOCKERS,
  TREE_TILES,
  coordKey,
} from "./mapTiles";

const EMPTY_MAP = new Map();

function Celula({ x, y, jogadorKey, objetivoKey, obstMap, terrenosMap }) {
  const cellKey = coordKey(x, y);
  const obstaculos = obstMap ?? EMPTY_MAP;
  const terrenos = terrenosMap ?? EMPTY_MAP;

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

  if (CASTLE_TILE_CLASS.has(cellKey)) {
    const castleClass = CASTLE_TILE_CLASS.get(cellKey);
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

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.jogadorKey === nextProps.jogadorKey &&
    prevProps.objetivoKey === nextProps.objetivoKey &&
    prevProps.obstMap === nextProps.obstMap &&
    prevProps.terrenosMap === nextProps.terrenosMap
  );
};

export default memo(Celula, areEqual);
