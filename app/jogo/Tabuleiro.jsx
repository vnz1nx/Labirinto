"use client";
import { useState } from "react";
import Celula from "./celula";
import "./Styles/StyleTabuleiro.css";

export default function Tabuleiro({
  jogador,
  obj,
  obst,
  reiniciarJogo,
  LamaCapim,
  boardRef,
  playerCellRef,
}) {
  const [celula, setCelula] = useState(
    Array(50)
      .fill()
      .map(() => Array(50).fill())
  );

  return (
    <div className="tabuleiro-scroll" ref={boardRef}>
      <div className="container">
        {celula.map((linha, i) => {
          const temp = linha.map((coluna, j) => {
            const isPlayerCell = jogador[0] === i && jogador[1] === j;

            return (
              <Celula
                key={`${i}-${j}`}
                coords={[i, j]}
                jogador={jogador}
                objetivo={obj}
                obst={obst}
                reiniciarJogo={reiniciarJogo}
                LamaCapim={LamaCapim}
                focusRef={isPlayerCell ? playerCellRef : undefined}
              />
            );
          });
          return <div key={i} className="mostralinha">{temp}</div>;
        })}
      </div>
    </div>
  );
}
