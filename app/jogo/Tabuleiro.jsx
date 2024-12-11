import { useState, useEffect, useRef } from "react";
import Celula from "./celula";
import "./Styles/StyleTabuleiro.css";

export default function Tabuleiro({ jogador, obj, obst, reiniciarJogo, LamaCapim }) {
  const [celula, setCelula] = useState(
    Array(50)
      .fill()
      .map(() => Array(50).fill())
  );

  const containerRef = useRef(null);
  const [hasFocused, setHasFocused] = useState(false); // Estado para controlar quando focar

  useEffect(() => {
    if (!hasFocused && containerRef.current) {
      // Posições da célula do jogador
      const x = jogador[0];
      const y = jogador[1];

      // Tamanho de cada célula
      const cellSize = { width: 73, height: 80 }; // Definido conforme a sua célula

      // Calcular a posição para centralizar o jogador
      const centerX = x * cellSize.width - containerRef.current.clientWidth / 2 + cellSize.width / 3.2;
      const centerY = y * cellSize.height - containerRef.current.clientHeight / 2 + cellSize.height / 2;

      // Aplicar a rolagem
      containerRef.current.scrollTo({
        left: centerX,
        top: centerY,
        behavior: "smooth", // rolagem suave
      });

      // Marcar como "já focado"
      setHasFocused(true);
    }
  }, [jogador, hasFocused]); // A dependência é o jogador, mas só vai agir se não tiver focado ainda

  return (
    <div className="container" ref={containerRef}>
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
