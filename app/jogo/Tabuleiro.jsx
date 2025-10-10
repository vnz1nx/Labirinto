import { useState, useEffect, useCallback, useMemo } from "react";
import Celula from "./celula";
import { coordKey } from "./mapTiles";
import "./Styles/StyleTabuleiro.css";

const toTileMap = (tiles = []) => {
  const map = new Map();
  tiles.forEach(([x, y, tipo]) => {
    map.set(`${x}-${y}`, tipo);
  });
  return map;
};

export default function Tabuleiro({ jogador, obj, obst, LamaCapim }) {
  const [visao, setVisao] = useState([]);
  const tamanhoMapa = 80;
  const raioVisao = 10;

  const obstaculosMap = useMemo(() => toTileMap(obst), [obst]);
  const terrenosMap = useMemo(() => toTileMap(LamaCapim), [LamaCapim]);
  const jogadorKey = useMemo(() => {
    if (jogador && jogador.length === 2 && jogador[0] != null) {
      return coordKey(jogador[0], jogador[1]);
    }
    return null;
  }, [jogador]);
  const objetivoKey = useMemo(() => {
    if (obj && obj.length === 2 && obj[0] != null) {
      return coordKey(obj[0], obj[1]);
    }
    return null;
  }, [obj]);

  const centralizarVisao = useCallback(
    ([posX, posY]) => {
      if (posX == null || posY == null) return;

      const novaVisao = [];
      const inicioX = Math.max(0, posX - raioVisao);
      const fimX = Math.min(tamanhoMapa - 1, posX + raioVisao);
      const inicioY = Math.max(0, posY - raioVisao);
      const fimY = Math.min(tamanhoMapa - 1, posY + raioVisao);

      for (let i = inicioX; i <= fimX; i++) {
        const linha = [];
        for (let j = inicioY; j <= fimY; j++) {
          linha.push([i, j]);
        }
        novaVisao.push(linha);
      }

      setVisao(novaVisao);
    },
    [tamanhoMapa, raioVisao]
  );

  useEffect(() => {
    if (jogador && jogador.length === 2) {
      centralizarVisao(jogador);
    }
  }, [jogador, centralizarVisao]);

  return (
    <div className="container">
      {visao.map((linha, i) => (
        <div key={i} className="mostralinha">
          {linha.map(([x, y]) => (
            <Celula
              key={`${x}-${y}`}
              x={x}
              y={y}
              jogadorKey={jogadorKey}
              objetivoKey={objetivoKey}
              obstMap={obstaculosMap}
              terrenosMap={terrenosMap}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
