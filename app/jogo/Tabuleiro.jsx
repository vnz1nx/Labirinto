"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Celula from "./celula";
import { positionKey } from "./gameLogic.mjs";
import "./Styles/StyleTabuleiro.css";

export default function Tabuleiro({
  jogador,
  obj,
  obst,
  LamaCapim,
}) {
  const [celula, setCelula] = useState(
    Array(50)
      .fill()
      .map(() => Array(50).fill())
  );

  const boardColumns = 50;
  const boardRows = 50;
  const viewportColumns = 24;
  const viewportRows = 15;

  const boardRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [boardTransform, setBoardTransform] = useState({
    transform: "translate3d(0,0,0)",
  });

  const obstacleMap = useMemo(() => {
    const map = new Map();
    (obst ?? []).forEach(([row, col, type]) => {
      map.set(positionKey(row, col), type);
    });
    return map;
  }, [obst]);

  const lamaCapimMap = useMemo(() => {
    const map = new Map();
    (LamaCapim ?? []).forEach(([row, col, type]) => {
      map.set(positionKey(row, col), type);
    });
    return map;
  }, [LamaCapim]);

  const updateCamera = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;

    const boardWidth = board.offsetWidth;
    const boardHeight = board.offsetHeight;
    if (!boardWidth || !boardHeight) return;

    const cellWidth = boardWidth / boardColumns;
    const cellHeight = boardHeight / boardRows;

    const nextViewportWidth = Math.min(boardWidth, cellWidth * viewportColumns);
    const nextViewportHeight = Math.min(boardHeight, cellHeight * viewportRows);

    setViewportSize((cur) => {
      if (
        Math.abs(cur.width - nextViewportWidth) < 0.5 &&
        Math.abs(cur.height - nextViewportHeight) < 0.5
      ) {
        return cur;
      }
      return { width: nextViewportWidth, height: nextViewportHeight };
    });

    // Se jogador ainda não veio, não move
    if (!jogador || jogador.length < 2) return;

    const targetX = jogador[1] * cellWidth + cellWidth / 2;
    const targetY = jogador[0] * cellHeight + cellHeight / 2;

    const desiredX = targetX - nextViewportWidth / 2;
    const desiredY = targetY - nextViewportHeight / 2;

    const maxX = Math.max(0, boardWidth - nextViewportWidth);
    const maxY = Math.max(0, boardHeight - nextViewportHeight);

    const offX = Math.min(Math.max(desiredX, 0), maxX);
    const offY = Math.min(Math.max(desiredY, 0), maxY);

    const transform = `translate3d(${-offX}px, ${-offY}px, 0)`;
    setBoardTransform((cur) =>
      cur.transform === transform ? cur : { transform }
    );
  }, [boardColumns, boardRows, viewportColumns, viewportRows, jogador]);

  useEffect(() => {
    updateCamera();
  }, [updateCamera]);

  useEffect(() => {
    const onResize = () => updateCamera();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateCamera]);

  const viewportStyle = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) return undefined;
    return {
      width: `${viewportSize.width}px`,
      height: `${viewportSize.height}px`,
    };
  }, [viewportSize.width, viewportSize.height]);

  return (
    <div className="board-viewport" style={viewportStyle}>
      <div className="container" ref={boardRef} style={boardTransform}>
        {celula.map((linha, i) => {
          const temp = linha.map((coluna, j) => (
            <Celula
              key={`${i}-${j}`}
              coords={[i, j]}
              jogador={jogador}
              objetivo={obj}
              obstaculos={obstacleMap}
              lamaCapim={lamaCapimMap}
            />
          ));
          return (
            <div key={i} className="mostralinha">
              {temp}
            </div>
          );
        })}
      </div>
    </div>
  );
} // ← ESTA CHAVE FINAL ERA O QUE FALTAVA
