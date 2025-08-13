import { useState, useEffect, useCallback } from "react";
import Celula from "./celula";
import "./Styles/StyleTabuleiro.css";

export default function Tabuleiro({ jogador, obj, obst, reiniciarJogo, LamaCapim }) {
  const [visao, setVisao] = useState([]);
  const tamanhoMapa = 80;
  const raioVisao = 8;

  const centralizarVisao = useCallback(([posX, posY]) => {
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
  }, [tamanhoMapa, raioVisao]);

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
              coords={[x, y]}
              jogador={jogador}
              objetivo={obj}
              obst={obst}
              reiniciarJogo={reiniciarJogo}
              LamaCapim={LamaCapim}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
