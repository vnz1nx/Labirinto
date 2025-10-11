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
}) {
  const [celula, setCelula] = useState(
    Array(50)
      .fill()
      .map(() => Array(50).fill())
  );

  return (
    <div className="container">
      {celula.map((linha, i) => {
        const temp = linha.map((coluna, j) => {
          return (
            <Celula
              key={`${i}-${j}`}
              coords={[i, j]}
              jogador={jogador}
              objetivo={obj}
              obst={obst}
              reiniciarJogo={reiniciarJogo}
              LamaCapim={LamaCapim}
            />
          );
        });
        return <div key={i} className="mostralinha">{temp}</div>;
      })}
    </div>
  );
}
