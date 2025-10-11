"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./Styles/StyleRepGame.css";
import Tabuleiro from "./Tabuleiro";
import {
  LAMA_CAPIM_SPAWN_RANGE,
  LAMA_CAPIM_TYPE_RANGE,
  OBJECTIVE_SPAWN_RANGE,
  OBSTACLE_SPAWN_RANGE,
  OBSTACLE_TYPE_RANGE,
  PLAYER_SPAWN_RANGE,
  createRandomEntities,
  generateUniquePosition,
  isCastleEntrance,
  isCastleTile,
  isInsideBoard,
  isRiverTile,
  positionKey,
} from "./gameLogic.mjs";

const INITIAL_GAME_STATUS = "initializing";

export default function RepGame() {
  const [player, setPlayer] = useState(null);
  const [objective, setObjective] = useState(null);
  const [obstacles, setObstacles] = useState([]);
  const [lamaCapim, setLamaCapim] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [objectiveFound, setObjectiveFound] = useState(false);
  const [gameStatus, setGameStatus] = useState(INITIAL_GAME_STATUS);
  const [seed, setSeed] = useState(0);
  const [showGateWarning, setShowGateWarning] = useState(false);

  useEffect(() => {
    const forbidden = new Set();

    const nextPlayer = generateUniquePosition(
      PLAYER_SPAWN_RANGE.row,
      PLAYER_SPAWN_RANGE.col,
      forbidden,
      isRiverTile
    );
    forbidden.add(positionKey(nextPlayer[0], nextPlayer[1]));

    const nextObjective = generateUniquePosition(
      OBJECTIVE_SPAWN_RANGE.row,
      OBJECTIVE_SPAWN_RANGE.col,
      forbidden,
      (row, col) => isRiverTile(row, col) || isCastleTile(row, col)
    );
    forbidden.add(positionKey(nextObjective[0], nextObjective[1]));

    const nextObstacles = createRandomEntities(
      200,
      OBSTACLE_SPAWN_RANGE.row,
      OBSTACLE_SPAWN_RANGE.col,
      OBSTACLE_TYPE_RANGE,
      forbidden,
      (row, col) => isRiverTile(row, col) || isCastleTile(row, col)
    );
    nextObstacles.forEach(([row, col]) => {
      forbidden.add(positionKey(row, col));
    });

    const nextLamaCapim = createRandomEntities(
      50,
      LAMA_CAPIM_SPAWN_RANGE.row,
      LAMA_CAPIM_SPAWN_RANGE.col,
      LAMA_CAPIM_TYPE_RANGE,
      forbidden,
      (row, col) => isRiverTile(row, col) || isCastleTile(row, col)
    );

    setPlayer(nextPlayer);
    setObjective(nextObjective);
    setObstacles(nextObstacles);
    setLamaCapim(nextLamaCapim);
    setObjectiveFound(false);
    setMoveCount(0);
    setGameStatus("playing");
    setShowGateWarning(false);
  }, [seed]);

  const obstacleSet = useMemo(
    () => new Set(obstacles.map(([row, col]) => positionKey(row, col))),
    [obstacles]
  );

  const reiniciarJogo = useCallback(() => {
    setGameStatus(INITIAL_GAME_STATUS);
    setObjective(null);
    setPlayer(null);
    setSeed((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!showGateWarning) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setShowGateWarning(false);
    }, 2200);

    return () => clearTimeout(timeout);
  }, [showGateWarning]);

  const handleKeyDown = useCallback(
    (event) => {
      if (gameStatus !== "playing" || !player) {
        return;
      }

      const directions = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };

      if (!(event.key in directions)) {
        return;
      }

      const [rowDelta, colDelta] = directions[event.key];
      const nextRow = player[0] + rowDelta;
      const nextCol = player[1] + colDelta;

      if (!isInsideBoard(nextRow, nextCol)) {
        return;
      }

      const attemptingCastleEntry = isCastleEntrance(nextRow, nextCol);
      const collectedObjective =
        objectiveFound ||
        (objective && nextRow === objective[0] && nextCol === objective[1]);

      if (attemptingCastleEntry && !collectedObjective) {
        setShowGateWarning(true);
        return;
      }

      const nextKey = positionKey(nextRow, nextCol);

      if (obstacleSet.has(nextKey)) {
        return;
      }

      setPlayer([nextRow, nextCol]);
      setMoveCount((value) => value + 1);

      if (objective && nextRow === objective[0] && nextCol === objective[1]) {
        setObjectiveFound(true);
        setObjective(null);
      }

      if (isRiverTile(nextRow, nextCol)) {
        setGameStatus("drowned");
        return;
      }

      if (collectedObjective && isCastleTile(nextRow, nextCol)) {
        setGameStatus("won");
      }
    },
    [gameStatus, objective, objectiveFound, obstacleSet, player]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const objectivePosition = objective ?? [null, null];
  const isGameOver = gameStatus === "won" || gameStatus === "drowned";

  const endTitle =
    gameStatus === "won"
      ? "Você conquistou o castelo!"
      : "Fim de jogo";

  const endSubtitle =
    gameStatus === "won"
      ? "Sua coragem guiou Stuart até a entrada do castelo. Prepare-se para novas aventuras!"
      : "As águas do fosso foram impiedosas desta vez, mas cada herói aprende com os tropeços.";

  return (
    <div className="game">
      {player && (
        <Tabuleiro
          jogador={player}
          obj={objectivePosition}
          obst={obstacles}
          reiniciarJogo={reiniciarJogo}
          LamaCapim={lamaCapim}
        />
      )}

      <div className="game__hud" aria-live="polite">
        <div className="hud-card">
          <span className="hud-card__label">Movimentos</span>
          <span className="hud-card__value">{moveCount}</span>
        </div>
        <button type="button" className="hud-card__button" onClick={reiniciarJogo}>
          Reiniciar
        </button>
      </div>

      {showGateWarning && (
        <div className="game__toast" role="status">
          Encontre a Excalibur antes de tentar entrar no castelo!
        </div>
      )}

      {isGameOver && (
        <div className="end-screen" role="dialog" aria-modal="true">
          <div className="end-screen__panel">
            <header className="end-screen__header">
              <h1 className="end-screen__title">{endTitle}</h1>
              <p className="end-screen__subtitle">{endSubtitle}</p>
            </header>
            <dl className="end-screen__stats">
              <div className="end-screen__stat">
                <dt>Movimentos realizados</dt>
                <dd>{moveCount}</dd>
              </div>
              <div className="end-screen__stat">
                <dt>Estado da missão</dt>
                <dd>{gameStatus === "won" ? "Castelo alcançado" : "Herói submerso"}</dd>
              </div>
            </dl>
            <button type="button" className="end-screen__cta" onClick={reiniciarJogo}>
              Jogar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
